# GitHub Actions Workflows

This directory contains GitHub Actions workflows for automated testing and deployment.

## Workflows Overview

This repository uses a **simplified two-workflow architecture** following best practices:

1. **Test Workflow** - Runs tests and generates reports (triggered on every PR and push)
2. **Deploy Workflow** - Deploys docs to GitHub Pages (triggered only on main branch pushes)

This architecture follows the **Single Responsibility Principle** and **DRY** (Don't Repeat Yourself) principles.

## Workflows

### 1. Run Tests (`test.yml`)

**Purpose:** Execute tests and generate reports for quality assurance.

**Triggers:**
- On pull requests to `main` branch
- On push to `main` branch

**What it does:**
1. Checks out the repository code
2. Sets up Node.js v20 with npm caching
3. Installs dependencies using `npm ci`
4. Runs Vitest tests with coverage
5. Generates HTML test report and coverage report
6. Uploads both reports as artifacts (available for 90 days)

**Artifacts Generated:**
- `coverage-report` - HTML coverage report from Vitest
- `test-report` - HTML test results from Vitest

**Status Badge:**
You can add this badge to your README to show test status:
```markdown
![Tests](https://github.com/AntonioSegoviaExposito/copilotTesting/workflows/Run%20Tests/badge.svg)
```

### 2. Deploy to GitHub Pages (`deploy.yml`)

**Purpose:** Deploy application and test reports to GitHub Pages.

**Triggers:**
- On push to `main` branch (automatic deployment)
- Manual workflow dispatch

**What it does:**

**Test Job:**
1. Runs tests with coverage (same as test.yml)
2. Uploads test and coverage reports as artifacts

**Deploy Job:** (depends on Test Job)
1. Checks out the repository code
2. Downloads test and coverage reports from Test Job artifacts
3. Copies reports to `docs/coverage/` and `docs/test-report/` directories
4. Configures GitHub Pages
5. Uploads the `docs` directory as a Pages artifact
6. Deploys to GitHub Pages

**Published URLs:**
- **Application**: `https://antoniosegoviaexposito.github.io/copilotTesting/`
- **Test Report**: `https://antoniosegoviaexposito.github.io/copilotTesting/test-report/`
- **Coverage Report**: `https://antoniosegoviaexposito.github.io/copilotTesting/coverage/`

**Requirements:**
- GitHub Pages must be enabled in repository settings
- Pages source should be set to "GitHub Actions"

## Architecture Benefits

✅ **No Duplicate Testing:** Deploy workflow uses artifacts from test job instead of re-running tests
✅ **Single Responsibility:** Each workflow has a clear, focused purpose
✅ **Automated Deployment:** Every push to main automatically deploys to GitHub Pages
✅ **Error Handling:** Graceful handling of missing directories
✅ **Artifact Reuse:** Test reports generated once and reused by deploy workflow
✅ **Faster CI/CD:** Reduced overall workflow time by eliminating duplicate test runs

## Setup Instructions

### Enabling GitHub Pages

1. Go to your repository settings
2. Navigate to "Pages" in the left sidebar
3. Under "Build and deployment", set:
   - **Source**: GitHub Actions
4. Save the changes

Once configured, your application will be automatically deployed on every push to `main`:
```
https://[username].github.io/[repository-name]/
```

For this repository:
```
https://antoniosegoviaexposito.github.io/copilotTesting/
```

## Local Testing

To test the workflows locally before pushing:

### Test Workflow
```bash
cd vcf-manager
npm install
npm test
npm run test:coverage
```

This generates:
- `vcf-manager/coverage/` - Coverage HTML report
- `vcf-manager/test-report/` - Test results HTML report

### Pages Deployment (Local Preview)
```bash
cd docs
# Open index.html in a web browser
# Or use a simple HTTP server:
python -m http.server 8000
# Then visit: 
#   - Application: http://localhost:8000
#   - Test Report: http://localhost:8000/test-report/
#   - Coverage: http://localhost:8000/coverage/
```

## Workflow Status

You can check the status of workflows:
- Go to the "Actions" tab in your GitHub repository
- Click on a workflow to see its runs and details
- Click on a specific run to see logs and artifacts
- Download artifacts from completed workflow runs

## Troubleshooting

### Tests Fail
- Check the test logs in the Actions tab
- Run tests locally to reproduce the issue: `npm run test:coverage`
- Ensure all dependencies are correctly specified in `package.json`

### Deployment Fails
- Verify GitHub Pages is enabled in repository settings
- Check that the Pages source is set to "GitHub Actions"
- Review deployment logs in the Actions tab
- Ensure the `docs` directory contains all necessary files
- Verify that tests pass successfully (artifacts are generated only on successful test runs)

### Workflows Stuck
- Check for pending environment approvals in the Actions tab
- Verify concurrency settings are correct (should auto-cancel previous runs)
- Cancel stuck workflows manually and re-trigger
- Check GitHub status page for service issues

### Missing Test Reports on Deploy
- Verify test job completed successfully before deploy job starts
- Check artifact upload/download logs for errors
- Ensure `vitest.config.js` has HTML reporter configured correctly
- Run tests locally to ensure reports are generated

## Maintenance

### Updating Node.js Version
To update the Node.js version used in workflows, modify the `node-version` field in both workflow files:
```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '20'  # Change this version
```

### Updating Actions
GitHub Actions versions can be updated by changing the version tags:
- `actions/checkout@v4` - for checking out code
- `actions/setup-node@v4` - for setting up Node.js
- `actions/upload-artifact@v4` - for uploading artifacts
- `actions/download-artifact@v4` - for downloading artifacts
- `actions/configure-pages@v5` - for configuring Pages
- `actions/upload-pages-artifact@v3` - for uploading Pages artifacts
- `actions/deploy-pages@v4` - for deploying to Pages

### Adding New Reports
To add new reports to the deployment:
1. Configure the report generator in `vitest.config.js`
2. Add upload step to test job in both workflows
3. Add download step to deploy job in `deploy.yml`
4. Copy the report to appropriate `docs/` subdirectory

## Best Practices Implemented

✅ **Artifact-Based Communication:** Test results passed between jobs via artifacts
✅ **Job Dependencies:** Deploy job depends on test job (`needs: test`)
✅ **Concurrency Control:** Only one deployment at a time with `cancel-in-progress: false`
✅ **Error Handling:** Fallback commands for missing directories
✅ **Minimal Permissions:** Each job has only the permissions it needs
✅ **Caching:** npm dependencies cached to speed up builds
✅ **Conditional Uploads:** Artifacts uploaded even if tests fail (using `if: always()`)
