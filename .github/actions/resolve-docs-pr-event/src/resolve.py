#!/usr/bin/env python3
"""Resolve current PR state from a completed, untrusted signal run."""
import datetime
import email.utils
import json
import os
import re
import sys
import tempfile
import time
import urllib.error
import urllib.parse
import urllib.request
import uuid

MAX_BYTES = 4 * 1024 * 1024
SHA = re.compile(r'^[0-9a-f]{40}$')
SOURCE = re.compile(r'^\.github/workflows/[A-Za-z0-9_.-]+\.ya?ml$')
LEGACY = re.compile(r'https://linear\.app/loft/issue/[A-Za-z0-9-]+(?:/[A-Za-z0-9-]+)?')


class Invalid(Exception):
    """Malformed or unavailable trusted data."""


def same(a, b):
    return isinstance(a, str) and bool(a) and isinstance(b, str) and a.lower() == b.lower()


def positive(value):
    return type(value) is int and 0 < value <= 2**53 - 1


def valid_sha(value):
    return isinstance(value, str) and SHA.fullmatch(value) is not None and value != '0' * 40


def pairs(items):
    result = {}
    for key, value in items:
        if key in result:
            raise Invalid('duplicate JSON key')
        result[key] = value
    return result


def decode(raw):
    try:
        return json.loads(raw, object_pairs_hook=pairs)
    except (ValueError, UnicodeDecodeError, RecursionError) as exc:
        raise Invalid('invalid JSON') from exc


class SafeRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        redirected = super().redirect_request(req, fp, code, msg, headers, newurl)
        if redirected and urllib.parse.urlsplit(newurl).netloc != urllib.parse.urlsplit(req.full_url).netloc:
            redirected.remove_header('Authorization')
        return redirected


class API:
    def __init__(self, token, repo):
        self.repo = repo
        self.token = token
        self.root = os.environ.get('GITHUB_API_URL', 'https://api.github.com').rstrip('/')
        self.calls = 0

    def get(self, path):
        self.calls += 1
        if self.calls > 30:
            raise Invalid('API call limit exceeded')
        request = urllib.request.Request(self.root + '/repos/' + self.repo + path,
            headers={'Authorization': 'Bearer ' + self.token, 'Accept': 'application/vnd.github+json',
                     'X-GitHub-Api-Version': '2022-11-28'})
        for attempt in range(3):
            try:
                with urllib.request.build_opener(SafeRedirect()).open(request, timeout=30) as response:
                    raw = response.read(MAX_BYTES + 1)
                break
            except urllib.error.HTTPError as exc:
                cause = 'HTTP %d' % exc.code
                transient = exc.code == 429 or 500 <= exc.code < 600
                retry_after = exc.headers.get('Retry-After') if exc.headers else None
            except (urllib.error.URLError, OSError) as exc:
                cause = str(exc.reason if isinstance(exc, urllib.error.URLError) else exc)
                transient = True
                retry_after = None
            if not transient or attempt == 2:
                raise Invalid('GitHub API request failed for %s: %s' % (path or '/', cause))
            delay = (2, 5)[attempt]
            if retry_after:
                try:
                    delay = max(0, min(30, int(retry_after)))
                except ValueError:
                    try:
                        retry_at = email.utils.parsedate_to_datetime(retry_after)
                        delay = max(0, min(30, (retry_at - datetime.datetime.now(datetime.timezone.utc)).total_seconds()))
                    except (TypeError, ValueError, OverflowError):
                        pass
            time.sleep(delay)
        if len(raw) > MAX_BYTES:
            raise Invalid('API response too large')
        return decode(raw)


def paged(api, path, max_pages=10):
    results = []
    for page in range(1, max_pages + 1):
        batch = api.get(path + ('&' if '?' in path else '?') + 'per_page=100&page=%d' % page)
        if not isinstance(batch, list) or len(batch) > 100:
            raise Invalid('invalid paginated response')
        results.extend(batch)
        if len(batch) < 100:
            return results
    raise Invalid('pagination limit exceeded')


def mapping(value):
    if not isinstance(value, dict):
        raise Invalid('invalid API or event object')
    return value


def resolve(api, payload, source, expected_base=''):
    payload = mapping(payload)
    repo = mapping(api.get(''))
    default = repo.get('default_branch')
    if not same(repo.get('full_name'), api.repo) or not isinstance(default, str) or not default:
        raise Invalid('invalid repository identity')
    ref = 'refs/heads/' + default
    if (os.environ.get('GITHUB_REF') != ref or
        not os.environ.get('GITHUB_WORKFLOW_REF', '').startswith(api.repo + '/.github/workflows/') or
        not os.environ.get('GITHUB_WORKFLOW_REF', '').endswith('@' + ref)):
        raise Invalid('workflow is not running from default branch')
    if not same(mapping(payload.get('repository')).get('full_name'), api.repo):
        raise Invalid('event repository mismatch')
    if os.environ.get('GITHUB_EVENT_NAME') != 'workflow_run' or payload.get('action') != 'completed':
        return None
    signal = mapping(payload.get('workflow_run'))
    run_id, attempt = signal.get('id'), signal.get('run_attempt')
    if not positive(run_id) or not positive(attempt) or not SOURCE.fullmatch(source):
        raise Invalid('invalid signal identity')
    run = mapping(api.get('/actions/runs/%d/attempts/%d' % (run_id, attempt)))
    workflow = mapping(api.get('/actions/workflows/' + urllib.parse.quote(source.rsplit('/', 1)[-1], safe='')))
    head_repo = mapping(run.get('head_repository')).get('full_name')
    branch, head = run.get('head_branch'), run.get('head_sha')
    if (run.get('id') != run_id or run.get('run_attempt') != attempt or
        run.get('event') != 'pull_request' or run.get('status') != 'completed' or
        run.get('conclusion') != 'success' or run.get('path') != source or
        not positive(run.get('workflow_id')) or workflow.get('id') != run.get('workflow_id') or
        workflow.get('path') != source or not same(mapping(run.get('repository')).get('full_name'), api.repo) or
        not isinstance(head_repo, str) or not head_repo or not isinstance(branch, str) or not branch or
        not valid_sha(head) or signal.get('head_sha') != head):
        raise Invalid('invalid signal run')
    # `display_title` is derived from the relay's run-name. It is untrusted
    # because the PR controls the relay event, so it may only narrow the
    # already API-validated current PR state below.
    match = re.fullmatch(r'docs-pr-event:("(?:opened|edited|labeled|closed|reopened|synchronize)"):("(?:[^"\\]|\\.)*")', run.get('display_title', ''))
    if not match:
        raise Invalid('invalid signal hint')
    signal_action, signal_label = (json.loads(value) for value in match.groups())
    if signal_action != 'labeled' and signal_label:
        raise Invalid('unexpected signal label')
    if 'head_repository' in signal and not same(mapping(signal['head_repository']).get('full_name'), head_repo):
        raise Invalid('signal head repository mismatch')
    numbers = {}
    for candidate in paged(api, '/commits/%s/pulls' % head):
        candidate = mapping(candidate)
        number = candidate.get('number')
        base = mapping(candidate.get('base'))
        if not positive(number) or not isinstance(base.get('ref'), str) or not base['ref']:
            raise Invalid('invalid candidate identity')
        numbers.setdefault(number, set()).add(base['ref'])
        if len(numbers) > 10:
            raise Invalid('candidate limit exceeded')
    matches = []
    for number, bases in numbers.items():
        pr = mapping(api.get('/pulls/%d' % number))
        pr_head, base = mapping(pr.get('head')), mapping(pr.get('base'))
        pr_head_repo, base_repo = mapping(pr_head.get('repo')), mapping(base.get('repo'))
        if pr.get('number') != number or not isinstance(base.get('ref'), str) or not base['ref']:
            raise Invalid('invalid pull request identity')
        if (not same(head_repo, pr_head_repo.get('full_name')) or
            not same(base_repo.get('full_name'), api.repo) or pr_head.get('ref') != branch or
            base['ref'] not in bases or (expected_base and base['ref'] != expected_base) or
            not (pr_head.get('sha') == head or (pr.get('merged') is True and pr.get('merge_commit_sha') == head))):
            continue
        matches.append(pr)
    if len(matches) != 1:
        return None
    pr = matches[0]
    labels = pr.get('labels')
    if not isinstance(labels, list) or any(not isinstance(label, dict) or not isinstance(label.get('name'), str) for label in labels):
        raise Invalid('invalid pull request labels')
    if signal_action == 'labeled' and not any(label['name'] == signal_label for label in labels):
        return None
    if pr.get('body') is not None and not isinstance(pr['body'], str):
        raise Invalid('invalid pull request body')
    found = False
    if any(label['name'] == 'follow-up' for label in labels):
        for comment in paged(api, '/issues/%d/comments' % pr['number'], max_pages=3):
            comment = mapping(comment)
            author = mapping(comment.get('user')).get('login')
            body = comment.get('body')
            if not isinstance(body, str):
                raise Invalid('invalid comment')
            if author in ('github-actions[bot]', 'loft-bot') and ('<!-- docs-follow-up -->' in body or LEGACY.fullmatch(body.strip())):
                found = True
    event = {'action': signal_action, 'number': pr['number'], 'pull_request': pr, 'repository': repo}
    if signal_action == 'labeled':
        event['label'] = {'name': signal_label}
    return event, found


def write_values(values):
    if sum(len(value.encode('utf-16-le')) for value in values.values()) > 700 * 1024:
        raise Invalid('outputs exceed size limit')
    with open(os.environ['GITHUB_OUTPUT'], 'a', encoding='utf-8') as output:
        for key, value in values.items():
            delimiter = 'ghadelimiter_' + uuid.uuid4().hex
            while delimiter in value:
                delimiter = 'ghadelimiter_' + uuid.uuid4().hex
            output.write('%s<<%s\n%s\n%s\n' % (key, delimiter, value, delimiter))


def write_result(result):
    if result is None:
        write_values({'eligible': 'false'})
        return
    event, found = result
    encoded = json.dumps(event, ensure_ascii=True, separators=(',', ':'))
    with tempfile.NamedTemporaryFile(mode='w', encoding='utf-8', dir=os.environ['RUNNER_TEMP'], prefix='docs-pr-event-', suffix='.json', delete=False) as f:
        f.write(encoded)
        path = f.name
    bootstrap = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'event-bootstrap.cjs')
    write_values({'eligible': 'true', 'event-json': encoded, 'event-path': path,
                  'node-options': '--require=' + json.dumps(bootstrap), 'pr-number': str(event['number']),
                  'body-without-comments': re.sub(r'<!--.*?-->', '', event['pull_request'].get('body') or '', flags=re.DOTALL),
                  'follow-up-created': 'true' if found else 'false'})


def main():
    try:
        with open(os.environ['GITHUB_EVENT_PATH'], 'rb') as f:
            raw = f.read(MAX_BYTES + 1)
        if len(raw) > MAX_BYTES:
            raise Invalid('event too large')
        result = resolve(API(os.environ['INPUT_GITHUB_TOKEN'], os.environ['GITHUB_REPOSITORY']), decode(raw),
                         os.environ['INPUT_SOURCE_WORKFLOW'], os.environ.get('INPUT_EXPECTED_BASE', ''))
        if result is None:
            print('::warning::No unique current pull request matches the signal')
        write_result(result)
        return 0
    except (Invalid, KeyError, OSError, TypeError) as exc:
        print('::error::Unable to resolve pull request: ' + str(exc), file=sys.stderr)
        return 1


if __name__ == '__main__':
    sys.exit(main())
