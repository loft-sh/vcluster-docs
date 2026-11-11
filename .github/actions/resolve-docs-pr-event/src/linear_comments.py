#!/usr/bin/env python3
"""Add links for Linear issues referenced by a validated pull request."""
import json
import os
import re
import sys
import urllib.error
import urllib.request


MAX_COMMENT_PAGES = 100


def request_json(url, token, data=None):
    headers = {"Authorization": "Bearer " + token, "Accept": "application/vnd.github+json"}
    body = None
    if data is not None:
        headers["Content-Type"] = "application/json"
        body = json.dumps(data).encode()
    request = urllib.request.Request(url, data=body, headers=headers)
    with urllib.request.urlopen(request, timeout=30) as response:
        return json.loads(response.read()), response.headers.get("Link", "")


def github_comments(api_url, repository, number, token, get=request_json):
    """Read every comment page, failing closed if pagination is incomplete."""
    url = "%s/repos/%s/issues/%d/comments?per_page=100" % (api_url.rstrip("/"), repository, number)
    comments = []
    for _ in range(MAX_COMMENT_PAGES):
        page, links = get(url, token)
        if not isinstance(page, list):
            raise ValueError("GitHub returned an invalid comments page")
        comments.extend(page)
        match = re.search(r'<([^>]+)>;\s*rel="next"', links)
        next_link = match.group(1) if match else None
        if not next_link:
            return comments
        url = next_link
    raise ValueError("GitHub comments exceeded the pagination limit")


def linked_issue_ids(comments):
    found = set()
    for comment in comments:
        text = comment.get("body") or ""
        found.update(re.findall(r"\[([A-Z][A-Z0-9]+-\d+):", text))
        found.update(re.findall(r"Linear issue: \[([A-Z][A-Z0-9]+-\d+)\]", text))
    return found


def referenced_issue_ids(body, branch, teams):
    keys = {team["key"].upper() for team in teams
            if team.get("key") and not team["key"].upper().startswith("CVE")}
    if not keys:
        return []
    pattern = re.compile(r"(" + "|".join(re.escape(key) for key in sorted(keys)) + r")-(\d+)", re.I)
    result = []
    seen = set()
    for match in pattern.finditer((body or "") + "\n" + (branch or "")):
        issue_id = "%s-%s" % (match.group(1).upper(), match.group(2))
        if issue_id not in seen:
            seen.add(issue_id)
            result.append(issue_id)
    return result


def graphql(token, query, variables=None):
    payload = {"query": query}
    if variables is not None:
        payload["variables"] = variables
    request = urllib.request.Request("https://api.linear.app/graphql", data=json.dumps(payload).encode(),
                                     headers={"Content-Type": "application/json", "Authorization": token})
    with urllib.request.urlopen(request, timeout=30) as response:
        result = json.loads(response.read())
    if result.get("errors"):
        raise ValueError("Linear API request failed: " + result["errors"][0].get("message", "unknown error"))
    return result["data"]


def process(event, github_token, linear_token, api_url="https://api.github.com", get=request_json,
            linear=graphql, create_comment=None):
    pr = event["pull_request"]
    repository = event["repository"]["full_name"]
    number = pr["number"]
    comments = github_comments(api_url, repository, number, github_token, get)
    existing = linked_issue_ids(comments)
    teams = linear(linear_token, "query Teams { teams { nodes { key } } }")["teams"]["nodes"]
    issues = referenced_issue_ids(pr.get("body", ""), pr.get("head", {}).get("ref", ""), teams)
    for issue_id in issues:
        if issue_id in existing:
            continue
        try:
            issue = linear(linear_token,
                           "query IssueDetails($id: String!) { issue(id: $id) { title url } }",
                           {"id": issue_id})["issue"]
            if not isinstance(issue, dict) or not issue.get("title") or not issue.get("url"):
                raise ValueError("issue details unavailable")
        except (KeyError, ValueError, OSError, urllib.error.URLError):
            print("::warning::Unable to fetch Linear issue " + issue_id, file=sys.stderr)
            continue
        text = "[%s: %s](%s)" % (issue_id, issue["title"], issue["url"])
        if create_comment:
            create_comment(repository, number, text)
        else:
            endpoint = "%s/repos/%s/issues/%d/comments" % (api_url.rstrip("/"), repository, number)
            request_json(endpoint, github_token, {"body": text})


def main():
    try:
        event = json.loads(os.environ["RESOLVED_PR_EVENT_JSON"])
        process(event, os.environ["GITHUB_TOKEN"], os.environ["LINEAR_TOKEN"],
                os.environ.get("GITHUB_API_URL", "https://api.github.com"))
    except (KeyError, ValueError, OSError, urllib.error.URLError) as exc:
        print("::error::Unable to add Linear issue links: " + str(exc), file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
