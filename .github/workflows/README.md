# GitHub Actions Workflows

This directory contains the automated workflows for the VCF Manager project, following the KISS principles outlined in `CONTRIBUTING_FOR_AI.md`.

## Workflows

### 1. CI (`ci.yml`)

**Trigger**: Pull requests to `main` branch

**Purpose**: Run automated tests to ensure code quality before merging.

**Jobs**:
- `test`: Installs dependencies and runs the full test suite (320+ tests)

**Usage**: Automatically runs on every PR. Must pass before merging.

---

### 2. Deploy to GitHub Pages (`deploy.yml`)

**Trigger**: Push to `main` branch

**Purpose**: Automatically deploy the VCF Manager application to GitHub Pages after successful tests.

**Jobs**:
1. `test`: Run full test suite to ensure main branch is stable
2. `deploy`: Build deployment folder and publish to GitHub Pages

**Deployment Structure**:
```
deploy/
├── .nojekyll          # Prevents Jekyll processing
├── index.html         # Application entry point
├── css/               # Stylesheets
│   └── styles.css
└── src/               # Application modules
    ├── app.js
    ├── config.js
    ├── core/
    ├── features/
    └── utils/
```

**Key Features**:
- ✅ No build process required (pure SPA)
- ✅ Tests run before deployment
- ✅ Uses latest GitHub Actions (upload-pages-artifact@v3, deploy-pages@v4)
- ✅ Includes `.nojekyll` to prevent Jekyll processing
- ✅ Proper concurrency control (no cancel-in-progress for deploys)

---

## Architecture Principles

### KISS Compliance
These workflows follow the repository's KISS (Keep It Simple, Stupid) principles:

1. **Simplicity**: No complex build steps, transpilation, or bundling
2. **Minimal Changes**: Deploy exactly what runs locally
3. **No Build Process**: Static files copied directly
4. **Test-Driven**: Always test before deploy

### Why No Build Process?

The VCF Manager is a **pure Single Page Application (SPA)** that:
- Runs directly in the browser using ES6 modules
- Requires no transpilation or bundling
- Has zero runtime dependencies (Node.js only for dev/test)
- Can be opened directly in a browser from `file://`

This approach:
- ✅ Eliminates build complexity
- ✅ Reduces potential points of failure
- ✅ Makes debugging easier (no source maps needed)
- ✅ Enables instant local development
- ✅ Keeps CI/CD pipelines fast and simple

### Deployment Flow

```
Push to main
    ↓
Run Tests (npm test)
    ↓ (on success)
Prepare Deploy Folder
    ├── Copy index.html
    ├── Copy css/
    ├── Copy src/
    └── Add .nojekyll
    ↓
Upload Artifact
    ↓
Deploy to GitHub Pages
    ↓
Live at: https://antoniosegoviaexposito.github.io/copilotTesting/
```

---

## GitHub Pages Configuration

**Required Settings** (in repository Settings > Pages):

- **Source**: GitHub Actions (not "Deploy from a branch")
- **Workflow**: `deploy.yml` (custom workflow)
- **Environment**: `github-pages`

**Why GitHub Actions source?**
- Custom workflow control
- Test-driven deployment
- No Jekyll processing (we add `.nojekyll`)
- Better error messages and logs
- Proper artifact handling

---

## Troubleshooting

### Issue: Pages build fails with "No such file or directory @ dir_chdir0 - /github/workspace/docs"

**Cause**: GitHub Pages is configured to use automatic Jekyll build instead of GitHub Actions.

**Solution**:
1. Go to repository Settings > Pages
2. Under "Build and deployment" > "Source"
3. Select "GitHub Actions" (not "Deploy from a branch")
4. Save changes

### Issue: Tests fail in CI but pass locally

**Cause**: Usually missing dependencies or environment differences.

**Solution**:
1. Ensure `package-lock.json` is committed
2. Use `npm ci` (not `npm install`) in workflows
3. Check Node.js version matches (currently v20)

### Issue: Deployment succeeds but site doesn't update

**Cause**: Browser cache or CDN propagation delay.

**Solution**:
1. Wait 2-3 minutes for CDN propagation
2. Hard refresh browser (Ctrl+Shift+R)
3. Check deployment URL in workflow logs

---

## Maintenance

### Updating Node.js Version

Update in both `ci.yml` and `deploy.yml`:
```yaml
- uses: actions/setup-node@v4
  with:
    node-version: '20'  # Change this
```

### Updating GitHub Actions Versions

Check for updates periodically:
- `actions/checkout@v4` → [Repo](https://github.com/actions/checkout)
- `actions/setup-node@v4` → [Repo](https://github.com/actions/setup-node)
- `actions/configure-pages@v5` → [Repo](https://github.com/actions/configure-pages)
- `actions/upload-pages-artifact@v3` → [Repo](https://github.com/actions/upload-pages-artifact)
- `actions/deploy-pages@v4` → [Repo](https://github.com/actions/deploy-pages)

**Note**: For GitHub Pages workflows, always use `upload-pages-artifact@v3` (not `upload-artifact@v4`). They are different actions with different purposes.

---

## Performance

**CI Workflow** (~30 seconds):
- Checkout: ~2s
- Setup Node: ~5s (with cache)
- Install dependencies: ~8s
- Run tests: ~15s

**Deploy Workflow** (~60 seconds):
- Test job: ~30s
- Deploy job: ~30s (includes artifact upload and GitHub Pages deployment)

**Total time from push to live**: ~1-2 minutes

---

## Security

### Permissions

Workflows use **minimal required permissions**:

```yaml
permissions:
  contents: read      # Read repo content
  pages: write        # Write to GitHub Pages
  id-token: write     # OIDC for secure deployment
```

### Concurrency Control

```yaml
concurrency:
  group: pages
  cancel-in-progress: false  # Don't cancel deploys mid-flight
```

This ensures:
- Only one deployment at a time
- Deployments complete fully (no partial deploys)
- Race conditions are avoided

---

**Last Updated**: 2026-02-03  
**Maintained by**: AI Agents (following CONTRIBUTING_FOR_AI.md principles)
