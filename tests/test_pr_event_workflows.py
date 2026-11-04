import pathlib
import json
import os
import subprocess
import tempfile
import unittest

import yaml

ROOT = pathlib.Path(__file__).resolve().parents[1] / '.github' / 'workflows'
RELAY = 'pull-request-events.yaml'
CONSUMERS = ('backport-docs.yml', 'forwardport-docs.yml', 'linear-pr-comments.yaml', 'create-linear-issue.yaml')


def load(name):
    return yaml.load((ROOT / name).read_text(), Loader=yaml.BaseLoader)


class PullRequestEventContract(unittest.TestCase):
    def test_relay_extracts_only_event_metadata(self):
        command = load(RELAY)['jobs']['relay']['steps'][0]['run']
        for action, label, expected_label in [('labeled', {'name': 'follow-up'}, 'follow-up'), ('closed', None, '')]:
            with self.subTest(action=action), tempfile.TemporaryDirectory() as directory:
                event = {'number': 42, 'action': action, 'label': label,
                         'pull_request': {'body': 'untrusted', 'head': {'repo': {'fork': True}}}}
                event_path = pathlib.Path(directory) / 'input.json'
                event_path.write_text(json.dumps(event))
                env = dict(os.environ, GITHUB_EVENT_PATH=str(event_path), RUNNER_TEMP=directory)
                subprocess.run(command, shell=True, check=True, env=env)
                result = json.loads((pathlib.Path(directory) / 'event.json').read_text())
                self.assertEqual(result, {'number': 42, 'action': action, 'label': expected_label})

    def test_relay_is_read_only_and_contains_minimal_event(self):
        workflow = load(RELAY)
        self.assertEqual(workflow['name'], 'Pull request events')
        self.assertEqual(workflow['on']['pull_request_target']['types'], ['opened', 'edited', 'labeled', 'closed'])
        self.assertEqual(workflow['permissions'], {})
        job = workflow['jobs']['relay']
        self.assertEqual(job['permissions'], {'contents': 'read'})
        self.assertEqual(job['timeout-minutes'], '5')
        self.assertEqual(len(job['steps']), 2)
        self.assertIn("{number,action,label: (if .action == \"labeled\" then .label.name else \"\" end)}", job['steps'][0]['run'])
        upload = job['steps'][1]
        self.assertEqual(upload['uses'], 'actions/upload-artifact@cf430e030ddbb5b0abf93d22962f4752f3646cd9')
        self.assertEqual(upload['with']['name'], 'pull-request-event-${{ github.run_attempt }}')
        self.assertEqual(upload['with']['retention-days'], '1')
        self.assertEqual(upload['with']['if-no-files-found'], 'error')
        text = (ROOT / RELAY).read_text()
        self.assertNotIn('secrets.', text)
        self.assertNotIn('checkout', text)
        self.assertNotIn('write', text)

    def test_consumers_resolve_trusted_event_and_limit_permissions(self):
        for name in CONSUMERS:
            with self.subTest(name=name):
                workflow = load(name)
                self.assertEqual(workflow['on'], {'workflow_run': {'workflows': ['Pull request events'], 'types': ['completed']}})
                self.assertEqual(workflow['permissions'], {})
                job = next(iter(workflow['jobs'].values()))
                self.assertIn("workflow_run.conclusion == 'success'", job['if'])
                self.assertIn("workflow_run.event == 'pull_request_target'", job['if'])
                self.assertEqual(job['permissions']['actions'], 'read')
                self.assertEqual(job['permissions']['contents'], 'read')
                self.assertEqual(job['concurrency']['cancel-in-progress'], 'false')
                resolve = job['steps'][0]
                self.assertEqual(resolve['id'], 'event')
                self.assertEqual(resolve['uses'], 'loft-sh/github-actions/.github/actions/resolve-pr-event@resolve-pr-event/v1')
                self.assertEqual(resolve['with'], {'source-workflow': '.github/workflows/pull-request-events.yaml', 'github-token': '${{ github.token }}'})
                text = (ROOT / name).read_text()
                self.assertNotIn('github.event.pull_request', text)
                self.assertIn("steps.event.outputs.eligible == 'true'", text)
                self.assertNotIn('actions/checkout', text)
                if name in CONSUMERS[:2]:
                    step = job['steps'][1]
                    self.assertEqual(step['env']['NODE_OPTIONS'], '${{ steps.event.outputs.node-options }}')
                    self.assertEqual(step['env']['RESOLVED_PR_EVENT_PATH'], '${{ steps.event.outputs.event-path }}')
                    self.assertIn('pull_request.merged == true', step['if'])
                    self.assertNotIn('pull-requests', job['permissions'])
                else:
                    self.assertEqual(job['permissions']['pull-requests'], 'write')
                    self.assertIn('steps.event.outputs.pr-number', text)

    def test_event_specific_filters(self):
        self.assertIn("startsWith(steps.event.outputs.label, 'backport-v')", (ROOT / CONSUMERS[0]).read_text())
        self.assertIn("steps.event.outputs.label == 'forwardport-main'", (ROOT / CONSUMERS[1]).read_text())
        linear = (ROOT / CONSUMERS[2]).read_text()
        self.assertIn("github.event.workflow_run.actor.login != 'dependabot[bot]'", linear)
        self.assertIn("pull_request.base.ref == 'main'", linear)
        followup = (ROOT / CONSUMERS[3]).read_text()
        self.assertIn("steps.event.outputs.label == 'follow-up'", followup)
        self.assertIn('steps.event.outputs.body-without-comments', followup)
        self.assertNotIn('description<<EOF', followup)


if __name__ == '__main__':
    unittest.main()
