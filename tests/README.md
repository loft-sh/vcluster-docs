# vCluster Documentation - BrowserStack Tests

Automated cross-browser tests for verifying mermaid diagram rendering using BrowserStack SDK.

## Purpose

These tests verify that mermaid diagrams in the vCluster documentation render correctly across different browsers and operating systems. This is particularly important because Safari has had historical issues with mermaid diagram rendering.

## Prerequisites

1. Node.js v18+ installed
2. BrowserStack account with Automate access

## Setup

### Install dependencies

```bash
cd tests
npm install
```

### Set BrowserStack credentials

```bash
export BROWSERSTACK_USERNAME="your_username"
export BROWSERSTACK_ACCESS_KEY="your_access_key"
```

### Initialize SDK (first time only)

```bash
npx setup --username "$BROWSERSTACK_USERNAME" --key "$BROWSERSTACK_ACCESS_KEY"
```

## Running Tests

### On BrowserStack (7 browser configurations)

```bash
cd tests
npm test
# or
npm run test:browserstack
```

Tests run on:
- Safari 17+ on macOS Sonoma
- Safari 16+ on macOS Ventura
- Safari 15+ on macOS Monterey
- Chrome on macOS Sonoma
- Chrome on Windows 11
- Firefox on macOS Sonoma
- Firefox on Windows 11

### Local testing (for development)

```bash
npm run test:local
```

Uses local WebKit browser - faster and doesn't consume BrowserStack credits.

### Custom test URL

```bash
TEST_URL="https://deploy-preview-123--vcluster-docs-site.netlify.app/docs/vcluster/deploy/topologies/multi-namespace-mode/" npm test
```

## Configuration

### browserstack.yml

Main configuration file for BrowserStack SDK:
- `platforms`: Browser/OS combinations to test
- `browserstackLocal`: Enable for localhost/internal URL testing
- `projectName`/`buildName`: Reporting organization
- `debug`, `consoleLogs`, `networkLogs`: Debugging options

### playwright.config.js

Playwright Test runner configuration:
- Timeouts
- Retry settings
- Screenshot/trace capture on failure
- Local project definition

## Test Output

- Console: Real-time progress and pass/fail status
- Screenshots: Captured on failure in `playwright-report/`
- BrowserStack Dashboard: https://automate.browserstack.com/dashboard

## CI/CD Integration

The tests run automatically on pull requests via GitHub Actions. See `.github/workflows/integration-tests.yml`.

Required secrets:
- `BROWSERSTACK_USERNAME`
- `BROWSERSTACK_ACCESS_KEY`

## Troubleshooting

### "BrowserStack credentials not found"

Ensure environment variables are set:
```bash
echo $BROWSERSTACK_USERNAME
echo $BROWSERSTACK_ACCESS_KEY
```

### Timeout errors

Increase timeouts in `playwright.config.js`:
```javascript
timeout: 90000,
expect: { timeout: 30000 },
```

### Local testing not working

Install Playwright browsers:
```bash
npx playwright install webkit
```

## Resources

- [BrowserStack Playwright SDK Docs](https://www.browserstack.com/docs/automate/playwright/getting-started/nodejs/integrate-your-tests)
- [Playwright Test Docs](https://playwright.dev/docs/test-intro)
- [BrowserStack Dashboard](https://automate.browserstack.com/dashboard)
