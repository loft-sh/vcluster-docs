import importlib.util
from pathlib import Path
import unittest


SOURCE = Path(__file__).resolve().parents[1] / '.github/actions/resolve-docs-pr-event/src/linear_comments.py'
spec = importlib.util.spec_from_file_location('linear_comments', SOURCE)
linear_comments = importlib.util.module_from_spec(spec)
spec.loader.exec_module(linear_comments)


class LinearCommentDedupe(unittest.TestCase):
    def test_paginates_past_first_page_and_only_adds_missing_issue(self):
        first = [{'body': 'ordinary comment %d' % number} for number in range(100)]
        first.append({'body': '[DOC-1: Existing](https://linear.app/loft/issue/DOC-1/title)'})
        second = [{'body': 'ordinary comment %d' % number} for number in range(30)]
        second.append({'body': 'Linear issue: [DOC-2](https://linear.app/loft/issue/DOC-2)'})
        pages = iter([(first, '<https://api.example/page2>; rel="next"'), (second, '')])
        requested = []

        def get(url, token):
            requested.append(url)
            return next(pages)

        comments = linear_comments.github_comments('https://api.example', 'org/docs', 8, 'gh-token', get)
        self.assertEqual(len(comments), 132)
        self.assertEqual(len(requested), 2)
        self.assertEqual(linear_comments.linked_issue_ids(comments), {'DOC-1', 'DOC-2'})

    def test_process_skips_old_links_and_is_idempotent(self):
        event = {'repository': {'full_name': 'org/docs'}, 'pull_request': {
            'number': 8, 'body': 'Closes DOC-1 and DOC-2', 'head': {'ref': 'DOC-2/feature'}}}
        saved_comments = [{'body': 'ordinary comment'} for _ in range(101)]
        saved_comments.append({'body': '[DOC-1: Existing](url)'})
        pages_written = []
        created = []
        linear_requests = []

        def get(url, token):
            pages_written.append(url)
            if 'page=2' in url:
                return saved_comments[100:], ''
            return saved_comments[:100], '<https://api.example/comments?page=2>; rel="next"'

        def linear(token, query, variables=None):
            linear_requests.append((query, variables))
            if variables is None:
                return {'teams': {'nodes': [{'key': 'DOC'}]}}
            return {'issue': {'title': 'Issue ' + variables['id'],
                              'url': 'https://linear.app/loft/issue/' + variables['id']}}

        def create(repo, number, body):
            created.append(body)
            saved_comments.append({'body': body})

        for _ in range(2):
            linear_comments.process(event, 'gh-token', 'linear-token', 'https://api.example',
                                    get, linear, create)
        self.assertEqual(len(created), 1)
        self.assertTrue(created[0].startswith('[DOC-2: Issue DOC-2]'))
        self.assertEqual(len(pages_written), 4)
        self.assertEqual(len(linear_requests), 3)

    def test_comment_page_failure_prevents_every_write(self):
        event = {'repository': {'full_name': 'org/docs'}, 'pull_request': {
            'number': 8, 'body': 'Closes DOC-1', 'head': {'ref': 'feature'}}}
        writes = []
        calls = 0

        def get(url, token):
            nonlocal calls
            calls += 1
            if calls == 1:
                return [], '<https://api.example/comments?page=2>; rel="next"'
            raise OSError('temporary API failure')

        with self.assertRaises(OSError):
            linear_comments.process(event, 'gh-token', 'linear-token', 'https://api.example',
                                    get, lambda *_args: self.fail('Linear must not be queried'),
                                    lambda *args: writes.append(args))
        self.assertEqual(writes, [])

    def test_matching_preserves_key_prefix_and_partial_token_behavior(self):
        teams = [{'key': 'DOC'}, {'key': 'CVE'}, {'key': 'CVEOPS'}]
        self.assertEqual(
            linear_comments.referenced_issue_ids('xDOC-12suffix CVE-4 CVEOPS-5', '', teams),
            ['DOC-12'])

    def test_linear_lookup_failure_does_not_block_later_issue(self):
        event = {'repository': {'full_name': 'org/docs'}, 'pull_request': {
            'number': 8, 'body': 'DOC-1 DOC-2', 'head': {'ref': 'feature'}}}
        created = []

        def linear(token, query, variables=None):
            if variables is None:
                return {'teams': {'nodes': [{'key': 'DOC'}]}}
            if variables['id'] == 'DOC-1':
                raise ValueError('issue unavailable')
            return {'issue': {'title': 'Issue two', 'url': 'https://linear.app/loft/issue/DOC-2'}}

        linear_comments.process(event, 'gh-token', 'linear-token', 'https://api.example',
                                lambda _url, _token: ([], ''), linear,
                                lambda _repo, _number, body: created.append(body))
        self.assertEqual(created, ['[DOC-2: Issue two](https://linear.app/loft/issue/DOC-2)'])


if __name__ == '__main__':
    unittest.main()
