# BrowserStack Tests

Cross-browser tests for mermaid diagram rendering.

## Run

```bash
npm install
npm test                    # All configured browsers
npm run test:local          # Local Safari only
```

## Credentials

```bash
export BROWSERSTACK_USERNAME="..."
export BROWSERSTACK_ACCESS_KEY="..."
```

## Custom URL

```bash
TEST_URL="https://deploy-preview-<PR-nr>--vcluster-docs-site.netlify.app/docs/..." npm test
```

## Results

https://automate.browserstack.com/dashboard
