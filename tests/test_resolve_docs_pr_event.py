import importlib.util
import json
import os
from pathlib import Path
import subprocess

import pytest

SRC = Path(__file__).resolve().parents[1] / '.github/actions/resolve-docs-pr-event/src'
spec = importlib.util.spec_from_file_location('docs_resolver', SRC / 'resolve.py')
r = importlib.util.module_from_spec(spec)
spec.loader.exec_module(r)
A, B = 'a' * 40, 'b' * 40
REPO = {'full_name': 'org/docs', 'default_branch': 'main'}
SOURCE = '.github/workflows/pull-request-events.yaml'


class FakeAPI:
    repo = 'org/docs'

    def __init__(self, fork=False):
        self.run = {'id': 10, 'run_attempt': 1, 'event': 'pull_request', 'status': 'completed',
                    'conclusion': 'success', 'path': SOURCE, 'workflow_id': 11, 'repository': REPO,
                    'head_repository': {'full_name': 'fork/docs' if fork else 'org/docs'},
                    'head_branch': 'feature', 'head_sha': A, 'display_title': 'docs-pr-event:"edited":""'}
        self.pr = {'number': 1, 'head': {'ref': 'feature', 'sha': A, 'repo': self.run['head_repository'].copy()},
                   'base': {'ref': 'main', 'repo': {'full_name': 'org/docs'}},
                   'merged': False, 'merge_commit_sha': None, 'body': 'before\n<!-- secret\ntext -->after',
                   'labels': []}
        self.candidates = [{'number': 1, 'base': {'ref': 'main'}}]
        self.comments = []
        self.paths = []

    def get(self, path):
        self.paths.append(path)
        if path == '': return REPO
        if path.startswith('/actions/runs/'): return self.run
        if path.startswith('/actions/workflows/'): return {'id': 11, 'path': SOURCE}
        if path.startswith('/commits/'): return self.candidates
        if path.startswith('/pulls/'): return dict(self.pr, number=int(path.split('/')[-1]))
        if path.startswith('/issues/'): return self.comments
        raise AssertionError(path)


@pytest.fixture(autouse=True)
def context(monkeypatch):
    monkeypatch.setenv('GITHUB_REF', 'refs/heads/main')
    monkeypatch.setenv('GITHUB_WORKFLOW_REF', 'org/docs/.github/workflows/consumer.yaml@refs/heads/main')
    monkeypatch.setenv('GITHUB_EVENT_NAME', 'workflow_run')


def payload():
    return {'repository': REPO, 'action': 'completed', 'workflow_run': {'id': 10, 'run_attempt': 1, 'head_sha': A}}


@pytest.mark.parametrize('fork', [False, True])
def test_matches_repo_or_fork(fork):
    event, found = r.resolve(FakeAPI(fork), payload(), SOURCE)
    assert event['action'] == 'edited' and event['number'] == 1 and not found


def test_rejects_wrong_fork_and_base_repo():
    api = FakeAPI(True)
    api.pr['head']['repo']['full_name'] = 'attacker/docs'
    assert r.resolve(api, payload(), SOURCE) is None
    api.pr['head']['repo'] = api.run['head_repository']
    api.pr['base']['repo']['full_name'] = 'other/docs'
    assert r.resolve(api, payload(), SOURCE) is None


def test_payload_head_repo_must_match():
    data = payload()
    data['workflow_run']['head_repository'] = {'full_name': 'other/docs'}
    with pytest.raises(r.Invalid): r.resolve(FakeAPI(), data, SOURCE)


@pytest.mark.parametrize('field,value', [('id', 20), ('run_attempt', 2), ('path', '.github/workflows/other.yaml'),
                                        ('workflow_id', 12), ('event', 'push'), ('conclusion', 'failure')])
def test_rejects_forged_run(field, value):
    api = FakeAPI(); api.run[field] = value
    with pytest.raises(r.Invalid): r.resolve(api, payload(), SOURCE)


def test_rejects_nondefault_context(monkeypatch):
    monkeypatch.setenv('GITHUB_REF', 'refs/heads/feature')
    with pytest.raises(r.Invalid): r.resolve(FakeAPI(), payload(), SOURCE)


def test_stale_head_and_candidate_base():
    api = FakeAPI(); api.pr['head']['sha'] = B
    assert r.resolve(api, payload(), SOURCE) is None
    api.pr['head']['sha'] = A; api.candidates[0]['base']['ref'] = 'next'
    assert r.resolve(api, payload(), SOURCE) is None


def test_expected_base_and_merged_sha():
    api = FakeAPI(); api.pr['base']['ref'] = 'next'; api.candidates[0]['base']['ref'] = 'next'
    assert r.resolve(api, payload(), SOURCE, 'main') is None
    api.pr.update(merged=True, merge_commit_sha=A); api.pr['head']['sha'] = B
    api.run['display_title'] = 'docs-pr-event:"closed":""'
    event, _ = r.resolve(api, payload(), SOURCE, 'next')
    assert event['action'] == 'closed'


@pytest.mark.parametrize('action,label,labels,expected', [
    ('closed', '', ['backport-v0.38', 'forwardport-main'], 'closed'),
    ('labeled', 'backport-v0.38', ['backport-v0.38', 'backport-v5.0'], 'labeled'),
    ('labeled', 'forwardport-main', ['forwardport-main'], 'labeled'),
])
def test_port_signal_action_and_label_are_preserved(action, label, labels, expected):
    api = FakeAPI()
    api.pr.update(merged=True, merge_commit_sha=A, labels=[{'name': name} for name in labels])
    api.run['display_title'] = 'docs-pr-event:%s:%s' % (json.dumps(action), json.dumps(label))
    event, _ = r.resolve(api, payload(), SOURCE)
    assert event['action'] == expected
    if action == 'labeled':
        assert event['label'] == {'name': label}


def test_unrelated_or_removed_label_signal_is_ineligible():
    api = FakeAPI()
    api.pr.update(merged=True, merge_commit_sha=A, labels=[{'name': 'backport-v0.38'}])
    api.run['display_title'] = 'docs-pr-event:"labeled":"follow-up"'
    assert r.resolve(api, payload(), SOURCE) is None


@pytest.mark.parametrize('title', ['', 'docs-pr-event:"made-up":""', 'docs-pr-event:"closed":"oops"'])
def test_rejects_invalid_signal_hints(title):
    api = FakeAPI(); api.run['display_title'] = title
    with pytest.raises(r.Invalid, match='signal hint|unexpected signal label'):
        r.resolve(api, payload(), SOURCE)


def test_ambiguous_and_candidate_cap():
    api = FakeAPI(); api.candidates.append({'number': 2, 'base': {'ref': 'main'}})
    assert r.resolve(api, payload(), SOURCE) is None
    api.candidates = [{'number': n, 'base': {'ref': 'main'}} for n in range(1, 12)]
    with pytest.raises(r.Invalid): r.resolve(api, payload(), SOURCE)


@pytest.mark.parametrize('author,body,expected', [
    ('github-actions[bot]', '<!-- docs-follow-up -->\nlink', True),
    ('loft-bot', 'https://linear.app/loft/issue/DOC-123/title', True),
    ('other', '<!-- docs-follow-up -->', False),
    ('loft-bot', 'see https://linear.app/loft/issue/DOC-123', False),
])
def test_followup_dedupe(author, body, expected):
    api = FakeAPI(); api.pr['labels'] = [{'name': 'follow-up'}]
    api.comments = [{'user': {'login': author}, 'body': body}]
    event, found = r.resolve(api, payload(), SOURCE)
    assert found == expected and event['pull_request']['labels'] == [{'name': 'follow-up'}]


def test_no_comment_query_without_label():
    api = FakeAPI(); r.resolve(api, payload(), SOURCE)
    assert not any(path.startswith('/issues/') for path in api.paths)


def test_comment_pagination_fails_closed():
    api = FakeAPI(); api.pr['labels'] = [{'name': 'follow-up'}]
    api.comments = [{'user': {'login': 'user'}, 'body': ''}] * 100
    with pytest.raises(r.Invalid): r.resolve(api, payload(), SOURCE)
    assert sum(path.startswith('/issues/') for path in api.paths) == 3


def test_output_body_and_bridge(tmp_path, monkeypatch):
    monkeypatch.setenv('GITHUB_OUTPUT', str(tmp_path / 'out'))
    monkeypatch.setenv('RUNNER_TEMP', str(tmp_path))
    monkeypatch.setenv('GITHUB_REPOSITORY', 'org/docs')
    api = FakeAPI(); api.pr['body'] += '\nghadelimiter_injection\n::error::x'
    r.write_result(r.resolve(api, payload(), SOURCE))
    text = (tmp_path / 'out').read_text()
    assert 'before\nafter\nghadelimiter_injection\n::error::x' in text
    assert '<!-- secret' not in text.split('body-without-comments<<', 1)[1]
    path = next(tmp_path.glob('docs-pr-event-*'))
    node_options = text.split('node-options<<', 1)[1].split('\n', 2)[1]
    env = dict(os.environ, RESOLVED_PR_EVENT_PATH=str(path), NODE_OPTIONS=node_options)
    result = subprocess.run(['node', '-e',
                             "console.log(JSON.stringify([process.env.GITHUB_EVENT_NAME, JSON.parse(require('fs').readFileSync(process.env.GITHUB_EVENT_PATH)).number]))"],
                            env=env, text=True, capture_output=True, check=True)
    assert json.loads(result.stdout) == ['pull_request', 1]


def test_api_request_budget_fails_before_network():
    api = r.API('unused', 'org/docs')
    api.calls = 30
    with pytest.raises(r.Invalid, match='API call limit'):
        api.get('/pulls/1')


def test_output_delimiter_collision_is_retried(tmp_path, monkeypatch):
    from types import SimpleNamespace
    monkeypatch.setenv('GITHUB_OUTPUT', str(tmp_path / 'out'))
    values = iter(['collision', 'unique'])
    monkeypatch.setattr(r.uuid, 'uuid4', lambda: SimpleNamespace(hex=next(values)))
    r.write_values({'body': 'ghadelimiter_collision\n::error::untrusted'})
    text = (tmp_path / 'out').read_text()
    assert text.startswith('body<<ghadelimiter_unique\n')
    assert text.endswith('\nghadelimiter_unique\n')


def test_bootstrap_rejects_wrong_repository(tmp_path):
    path = tmp_path / 'event.json'
    path.write_text(json.dumps({'pull_request': {'number': 1}, 'repository': {'full_name': 'other/docs'}}))
    env = dict(os.environ, RESOLVED_PR_EVENT_PATH=str(path), GITHUB_REPOSITORY='org/docs')
    result = subprocess.run(['node', '--require', str(SRC / 'event-bootstrap.cjs'), '-e', 'process.exit(0)'],
                            env=env, text=True, capture_output=True)
    assert result.returncode != 0
    assert 'Unable to restore validated' in result.stderr
