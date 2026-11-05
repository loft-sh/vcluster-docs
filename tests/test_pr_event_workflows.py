import pathlib
import re
import unittest

import yaml

ROOT = pathlib.Path(__file__).resolve().parents[1] / '.github' / 'workflows'
RELAY = 'pull-request-events.yaml'
CONSUMERS = ('backport-docs.yml', 'forwardport-docs.yml', 'linear-pr-comments.yaml', 'create-linear-issue.yaml')


def load(name):
    return yaml.load((ROOT / name).read_text(), Loader=yaml.BaseLoader)


class PullRequestEventContract(unittest.TestCase):
    def test_relay_is_an_unprivileged_signal(self):
        workflow = load(RELAY)
        self.assertEqual(workflow['name'], 'Pull request events')
        self.assertIn('toJSON(github.event.action)', workflow['run-name'])
        self.assertIn('toJSON(github.event.label.name || \'\')', workflow['run-name'])
        self.assertTrue({'opened', 'edited', 'labeled', 'closed'} <= set(workflow['on']['pull_request']['types']))
        self.assertEqual(set(workflow['on']), {'pull_request'})
        self.assertEqual(workflow['permissions'], {})
        job = workflow['jobs']['relay']
        self.assertNotIn('permissions', job)
        self.assertEqual(len(job['steps']), 1)
        self.assertEqual(job['steps'][0]['run'], ':')
        text = (ROOT / RELAY).read_text()
        for forbidden in ('secrets.', 'checkout', 'upload-artifact', 'write'):
            self.assertNotIn(forbidden, text)

    def test_consumers_resolve_trusted_event_and_limit_permissions(self):
        for name in CONSUMERS:
            with self.subTest(name=name):
                workflow = load(name)
                self.assertEqual(workflow['on'], {'workflow_run': {'workflows': ['Pull request events'], 'types': ['completed']}})
                self.assertEqual(workflow['permissions'], {})
                job = next(iter(workflow['jobs'].values()))
                self.assertIn("workflow_run.conclusion == 'success'", job['if'])
                self.assertIn("workflow_run.event == 'pull_request'", job['if'])
                permissions = {'actions': 'read', 'contents': 'read', 'pull-requests': 'read'}
                if name in CONSUMERS[2:]:
                    permissions['pull-requests'] = 'write'
                self.assertEqual(job['permissions'], permissions)
                self.assertEqual(job['concurrency']['cancel-in-progress'], 'false')
                checkouts = [step for step in job['steps'] if step.get('uses', '').startswith('actions/checkout@')]
                self.assertEqual(len(checkouts), 1)
                checkout = checkouts[0]
                self.assertRegex(checkout['uses'], r'^actions/checkout@[0-9a-f]{40}$')
                self.assertEqual(checkout['with']['ref'], '${{ github.sha }}')
                self.assertEqual(checkout['with']['persist-credentials'], 'false')
                self.assertEqual(checkout['with']['sparse-checkout'].strip(), '.github/actions/resolve-docs-pr-event')
                resolve = next(step for step in job['steps'] if step.get('id') == 'event')
                self.assertEqual(resolve['uses'], './.github/actions/resolve-docs-pr-event')
                self.assertLess(job['steps'].index(checkout), job['steps'].index(resolve))
                text = (ROOT / name).read_text()
                self.assertNotIn('github.event.pull_request', text)
                self.assertNotRegex(text, r'steps\.event\.outputs\.label(?![\w-])')

    def test_no_pull_request_target_in_github_configuration(self):
        for path in ROOT.parent.rglob('*'):
            if path.is_file() and path.suffix in {'.yml', '.yaml'}:
                with self.subTest(path=path):
                    self.assertNotIn('pull_request_target', path.read_text())

    def test_backport_notifies_when_resolver_fails(self):
        job = load(CONSUMERS[0])['jobs']['backport']
        notify = next(step for step in job['steps'] if step.get('name', '').startswith('Notify Slack'))
        condition = notify['if']
        # Exercise the failure and conflict combinations instead of matching the
        # condition's formatting. Refuse unknown expressions before evaluating.
        for failed, resolver, backport, eligible, conflicts, expected in [
            (True, 'skipped', 'skipped', False, '', True),
            (True, 'failure', 'skipped', False, '', True),
            (True, 'success', 'failure', True, '', True),
            (False, 'success', 'success', True, 'conflict', True),
            (False, 'success', 'success', False, 'conflict', False),
            (False, 'success', 'success', True, '', False),
        ]:
            with self.subTest(resolver=resolver, backport=backport, eligible=eligible, conflicts=conflicts):
                expression = condition
                values = {
                    'failure()': failed,
                    "steps.event.outcome == 'failure'": resolver == 'failure',
                    "steps.backport.outcome == 'failure'": backport == 'failure',
                    "steps.event.outputs.eligible == 'true'": eligible,
                    "steps.backport.outputs.conflicts != ''": bool(conflicts),
                }
                for term, value in values.items():
                    expression = expression.replace(term, str(value))
                expression = expression.replace('&&', ' and ').replace('||', ' or ')
                self.assertIsNone(re.search(r'[^()\s]', re.sub(r'True|False|and|or', '', expression)))
                self.assertEqual(eval(expression, {'__builtins__': {}}, {}), expected)
        self.assertIn("event-json || '{}'", notify['with']['details'])

    def test_current_pr_state_controls_consumer_actions(self):
        for name in CONSUMERS[:2]:
            with self.subTest(name=name):
                job = next(iter(load(name)['jobs'].values()))
                step = next(step for step in job['steps'] if step.get('uses', '').startswith('loft-sh/docs-'))
                self.assertIn("steps.event.outputs.eligible == 'true'", step['if'])
                self.assertIn('pull_request.merged == true', step['if'])
                self.assertIn(".action == 'closed'", step['if'])
                self.assertIn(".action == 'labeled'", step['if'])
                self.assertEqual(step['env']['NODE_OPTIONS'], '${{ steps.event.outputs.node-options }}')
                self.assertEqual(step['env']['RESOLVED_PR_EVENT_PATH'], '${{ steps.event.outputs.event-path }}')
        forwardport = (ROOT / CONSUMERS[1]).read_text()
        self.assertIn('pull_request.labels.*.name', forwardport)
        self.assertIn("'forwardport-main'", forwardport)
        linear = (ROOT / CONSUMERS[2]).read_text()
        self.assertIn("github.event.workflow_run.actor.login != 'dependabot[bot]'", linear)
        self.assertIn("pull_request.base.ref == 'main'", linear)
        followup = (ROOT / CONSUMERS[3]).read_text()
        self.assertIn('pull_request.labels.*.name', followup)
        self.assertIn("'follow-up'", followup)
        self.assertIn("steps.event.outputs.follow-up-created != 'true'", followup)
        self.assertIn('<!-- docs-follow-up -->', followup)
        self.assertIn('steps.event.outputs.body-without-comments', followup)
        self.assertNotIn('description<<EOF', followup)


if __name__ == '__main__':
    unittest.main()
