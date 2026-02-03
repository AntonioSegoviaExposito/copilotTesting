# GitHub Pages Setup Guide

This guide explains how to configure GitHub Pages to work with the VCF Manager's custom GitHub Actions workflow.

## The Problem

By default, GitHub Pages uses an automatic Jekyll build workflow (`pages-build-deployment`) that:
- ❌ Looks for content in a `/docs` folder or root directory
- ❌ Processes files with Jekyll (a Ruby static site generator)
- ❌ Ignores files/folders starting with underscores
- ❌ Can fail if the expected structure doesn't match

Our VCF Manager is located in the `vcf-manager/` subdirectory and uses a **custom GitHub Actions workflow** to deploy, not Jekyll.

## The Solution

Configure GitHub Pages to use **GitHub Actions** as the deployment source instead of the automatic Jekyll build.

## Step-by-Step Configuration

### 1. Navigate to Repository Settings

1. Go to your repository on GitHub: `https://github.com/AntonioSegoviaExposito/copilotTesting`
2. Click on **Settings** (in the top navigation bar)
3. In the left sidebar, scroll down and click on **Pages**

### 2. Configure Build and Deployment Source

In the **Build and deployment** section:

1. Under **Source**, you'll see a dropdown menu
2. Change from "Deploy from a branch" to **GitHub Actions**
3. GitHub will display: "Use a workflow to customize the way you build and deploy"

**Before:**
```
Source: Deploy from a branch
  Branch: main  /docs  [Save]
```

**After:**
```
Source: GitHub Actions
  Use a workflow from your repository to build and deploy your site
```

### 3. Save Configuration

- The change is saved automatically when you select "GitHub Actions"
- You should see a message: "Your site is live at https://antoniosegoviaexposito.github.io/copilotTesting/"

### 4. Verify Workflow

After merging this PR to `main`:

1. Go to **Actions** tab in your repository
2. You should see the "Deploy to GitHub Pages" workflow running
3. Wait for it to complete (usually ~1-2 minutes)
4. Visit: https://antoniosegoviaexposito.github.io/copilotTesting/

## What This Configuration Does

### GitHub Actions Source

When you select "GitHub Actions" as the source:
- ✅ Uses the custom `.github/workflows/deploy.yml` workflow
- ✅ No Jekyll processing (we include `.nojekyll` file)
- ✅ Full control over what gets deployed
- ✅ Tests run before deployment
- ✅ Better error messages and logs

### Our Custom Workflow

The `deploy.yml` workflow:
1. **Tests**: Runs all 320 tests to ensure code quality
2. **Build**: Creates a deployment folder with:
   - `index.html` (app entry point)
   - `css/` (stylesheets)
   - `src/` (application modules)
   - `.nojekyll` (prevents Jekyll processing)
3. **Deploy**: Uploads and deploys to GitHub Pages

## Troubleshooting

### Issue: "Deploy from a branch" is selected but I want GitHub Actions

**Solution**: Follow Step 2 above to change the source to "GitHub Actions"

### Issue: Pages build failing with Jekyll errors

**Symptoms**:
```
Error: No such file or directory @ dir_chdir0 - /github/workspace/docs
```

**Cause**: GitHub Pages is still using automatic Jekyll build

**Solution**: 
1. Go to Settings > Pages
2. Ensure "GitHub Actions" is selected as the source
3. Re-run the failed workflow from the Actions tab

### Issue: Workflow runs but site doesn't update

**Possible causes**:
1. **CDN Cache**: Wait 2-3 minutes for GitHub's CDN to propagate changes
2. **Browser Cache**: Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
3. **Workflow Failed**: Check Actions tab for any errors

### Issue: Getting 404 on the deployed site

**Possible causes**:
1. **Wrong URL**: Ensure you're visiting `https://antoniosegoviaexposito.github.io/copilotTesting/`
2. **Deployment Failed**: Check Actions tab to verify deployment succeeded
3. **Configuration Issue**: Verify "GitHub Actions" is selected in Settings > Pages

## Verification Checklist

After configuration, verify:

- [ ] Settings > Pages shows "Source: GitHub Actions"
- [ ] Main branch is protected (optional but recommended)
- [ ] Deploy workflow exists at `.github/workflows/deploy.yml`
- [ ] CI workflow exists at `.github/workflows/ci.yml`
- [ ] After push to main, "Deploy to GitHub Pages" workflow runs
- [ ] Workflow completes successfully (green check)
- [ ] Site is accessible at the GitHub Pages URL
- [ ] Site shows the VCF Manager application (not 404)

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     GitHub Repository                        │
│                                                              │
│  ┌────────────────┐         ┌─────────────────────────┐    │
│  │   vcf-manager/ │         │ .github/workflows/      │    │
│  │   ├── index.html│         │  ├── ci.yml (PR tests)  │    │
│  │   ├── css/     │         │  └── deploy.yml (deploy)│    │
│  │   └── src/     │         └─────────────────────────┘    │
│  └────────────────┘                      │                  │
│                                          │                  │
│                           Push to main   │                  │
└──────────────────────────────────────────┼──────────────────┘
                                           │
                                           ▼
                               ┌──────────────────────┐
                               │  GitHub Actions      │
                               │  ┌────────────────┐  │
                               │  │ 1. Run Tests   │  │
                               │  └────────┬───────┘  │
                               │           │          │
                               │  ┌────────▼───────┐  │
                               │  │ 2. Build Deploy│  │
                               │  │    Folder      │  │
                               │  └────────┬───────┘  │
                               │           │          │
                               │  ┌────────▼───────┐  │
                               │  │ 3. Deploy to   │  │
                               │  │    Pages       │  │
                               │  └────────┬───────┘  │
                               └───────────┼──────────┘
                                           │
                                           ▼
                               ┌──────────────────────┐
                               │   GitHub Pages       │
                               │   (CDN + Hosting)    │
                               └──────────┬───────────┘
                                          │
                                          ▼
                               https://antoniosegoviaexposito
                                  .github.io/copilotTesting/
```

## Benefits of This Approach

### 1. Test-Driven Deployment
- ✅ Tests run before every deployment
- ✅ Broken code never reaches production
- ✅ Automatic rollback if tests fail

### 2. No Build Complexity
- ✅ No transpilation or bundling
- ✅ Source code runs directly in browser
- ✅ Fast deployments (no build step)
- ✅ Easy debugging (no source maps needed)

### 3. Full Control
- ✅ Custom deployment logic
- ✅ Choose what files to deploy
- ✅ Add pre/post deployment steps
- ✅ Better error messages

### 4. Security
- ✅ Code review before merge
- ✅ Tests verify functionality
- ✅ No third-party dependencies in production
- ✅ Static files only (no server-side code)

## Additional Resources

- [GitHub Pages Custom Workflows Documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [VCF Manager Contributing Guide](CONTRIBUTING_FOR_AI.md)
- [Workflow Documentation](.github/workflows/README.md)

## Support

If you encounter issues:

1. Check the [Troubleshooting](#troubleshooting) section above
2. Review workflow logs in the Actions tab
3. Verify configuration in Settings > Pages
4. Open an issue with:
   - Screenshot of Settings > Pages
   - Link to failed workflow run (if applicable)
   - Description of expected vs actual behavior

---

**Last Updated**: 2026-02-03  
**Version**: 1.0  
**Applies to**: Repository configured with GitHub Actions workflows
