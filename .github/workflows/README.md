# GitHub Actions Workflows

This directory contains GitHub Actions workflows for automated testing and deployment.

## Workflows

### 1. Run Tests (`test.yml`)

**Triggers:**
- On pull requests to `main` branch
- On push to `main` branch

**What it does:**
1. Checks out the repository code
2. Sets up Node.js v20 with npm caching
3. Installs dependencies using `npm ci`
4. Runs all Jest tests
5. Generates a coverage report
6. Uploads the coverage report as an artifact

**Status Badge:**
You can add this badge to your README to show test status:
```markdown
![Tests](https://github.com/AntonioSegoviaExposito/copilotTesting/workflows/Run%20Tests/badge.svg)
```

### 2. Deploy to GitHub Pages (`deploy.yml`)

**Triggers:**
- On push to `main` branch
- Manual workflow dispatch

**What it does:**
1. Checks out the repository code
2. Configures GitHub Pages
3. Uploads the `vcf-manager` directory as a Pages artifact
4. Deploys to GitHub Pages

**Requirements:**
- GitHub Pages must be enabled in repository settings
- Pages source should be set to "GitHub Actions"

## Setup Instructions

### Enabling GitHub Pages

1. Go to your repository settings
2. Navigate to "Pages" in the left sidebar
3. Under "Build and deployment", set:
   - **Source**: GitHub Actions
4. Save the changes

Once configured, your application will be automatically deployed to:
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

### Pages Deployment (Local Preview)
```bash
cd vcf-manager
# Open index.html in a web browser
# Or use a simple HTTP server:
python -m http.server 8000
# Then visit: http://localhost:8000
```

## Workflow Status

You can check the status of workflows:
- Go to the "Actions" tab in your GitHub repository
- Click on a workflow to see its runs and details
- Click on a specific run to see logs and artifacts

## Troubleshooting

### Tests Fail
- Check the test logs in the Actions tab
- Run tests locally to reproduce the issue
- Ensure all dependencies are correctly specified in `package.json`

### Deployment Fails
- Verify GitHub Pages is enabled in repository settings
- Check that the Pages source is set to "GitHub Actions"
- Review deployment logs in the Actions tab
- Ensure the `vcf-manager` directory contains all necessary files

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
- `actions/configure-pages@v5` - for configuring Pages
- `actions/upload-pages-artifact@v3` - for uploading Pages artifacts
- `actions/deploy-pages@v4` - for deploying to Pages
