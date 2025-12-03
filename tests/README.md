# vCluster Documentation - BrowserStack Tests

Automated tests for verifying mermaid diagram rendering across different Safari versions on macOS using BrowserStack.

## Purpose

These tests automatically verify that mermaid diagrams in the vCluster documentation render correctly in Safari browsers across different macOS versions. This is particularly important because Safari has had historical issues with mermaid diagram rendering.

## Prerequisites

1. **BrowserStack Account** - You need a BrowserStack Automate account
2. **Node.js** - Version 18 or higher
3. **Credentials** - Set these environment variables:
   ```bash
   export BROWSERSTACK_USERNAME="your_username"
   export BROWSERSTACK_ACCESS_KEY="your_access_key"
   ```

   Or use the aliases:
   ```bash
   export BROWSER_STACK_USER="your_username"
   export BROWSER_STACK_API_KEY="your_access_key"
   ```

## Installation

```bash
cd tests
npm install
```

## Running Tests

### Test on BrowserStack (default)

Tests will run on Safari across three macOS versions:
- macOS Sonoma (Safari 17.3)
- macOS Monterey (Safari 15.6)
- macOS Ventura (Safari 16.5)

```bash
npm test
```

### Test Locally (for development)

Run tests on your local WebKit browser (faster, no BrowserStack credits used):

```bash
npm run test:local
```

### Custom Test URL

Test a specific deployment or PR preview:

```bash
TEST_URL="https://deploy-preview-1234--vclustertestdocs.netlify.app/docs/vcluster/deploy/topologies/multi-namespace-mode/" npm test
```

## What the Tests Do

1. **Navigate** to the specified vCluster documentation page
2. **Wait** for mermaid diagrams to fully render
3. **Verify** that diagrams are visible and have proper dimensions
4. **Capture** full-page screenshots for visual inspection
5. **Report** results with pass/fail status

## Test Output

- **Console**: Real-time test progress and results
- **Screenshots**: Saved to `tests/screenshots/` directory
- **Exit Code**: 0 = all passed, 1 = one or more failed

## Viewing Results

### Screenshots

All screenshots are saved in the `screenshots/` directory with names like:
- `Safari_17_3_on_macOS_Sonoma.png`
- `Safari_15_6_on_macOS_Monterey.png`
- `local_test.png` (for local runs)

### BrowserStack Dashboard

View detailed test results, console logs, and network activity:
https://automate.browserstack.com/dashboard

## Configuration

### Tested Browsers

Edit `SAFARI_CONFIGS` in `mermaid-rendering.spec.js` to add/remove browser configurations:

```javascript
const SAFARI_CONFIGS = [
  {
    name: 'Safari 17.3 on macOS Sonoma',
    os: 'osx',
    os_version: 'Sonoma',
    browser: 'playwright-webkit',
    browser_version: 'latest',
  },
  // Add more configurations...
];
```

### Test URL

Default URL is set to the multi-namespace-mode page. Change it via environment variable or edit the `TEST_URL` constant in the test file.

## Troubleshooting

### "BrowserStack credentials not found"

Make sure environment variables are set:
```bash
echo $BROWSERSTACK_USERNAME
echo $BROWSERSTACK_ACCESS_KEY
```

### "Diagram not properly rendered"

This indicates a mermaid rendering issue. Check:
1. The screenshot in `tests/screenshots/`
2. BrowserStack dashboard for console errors
3. Network logs for failed resource loads

### Timeout Errors

Increase timeouts in the test file if pages load slowly:
```javascript
await page.goto(TEST_URL, { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForSelector('svg[id^="mermaid"]', { timeout: 30000 });
```

## CI/CD Integration

Add to your GitHub Actions workflow:

```yaml
- name: Run BrowserStack Tests
  env:
    BROWSERSTACK_USERNAME: ${{ secrets.BROWSERSTACK_USERNAME }}
    BROWSERSTACK_ACCESS_KEY: ${{ secrets.BROWSERSTACK_ACCESS_KEY }}
    TEST_URL: ${{ steps.netlify.outputs.preview_url }}/docs/vcluster/deploy/topologies/multi-namespace-mode/
  run: |
    cd tests
    npm install
    npm test
```

## Cost Considerations

- Each test run consumes BrowserStack Automate minutes
- Running 3 Safari configs takes approximately 3-5 minutes of credit
- Use `npm run test:local` for development to save credits

## Support

- BrowserStack Docs: https://www.browserstack.com/docs/automate/playwright
- Playwright Docs: https://playwright.dev/
- Issues: Open an issue in the vcluster-docs repository
