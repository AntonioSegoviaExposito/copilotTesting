# GitHub Actions Workflows

Automated CI/CD for VCF Manager. No build process -- static files deployed directly.

## Workflows

### CI (`ci.yml`)

- **Trigger**: Pull requests to `main`
- **Purpose**: Run test suite (320+ tests) before merge

### Deploy (`deploy.yml`)

- **Trigger**: Push to `main`
- **Purpose**: Run tests, then deploy to GitHub Pages

```
Push to main → npm test → Copy vcf-manager/{index.html,css/,src/} → Deploy to Pages
```

## GitHub Pages Setup

**Required** (one-time): Go to **Settings > Pages > Source** and select **GitHub Actions** (not "Deploy from a branch").

If Pages is misconfigured, you'll see Jekyll errors like:
```
Error: No such file or directory @ dir_chdir0 - /github/workspace/docs
```

Fix: Change source to "GitHub Actions" in Settings > Pages.

## Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| Jekyll `/docs` error | Wrong Pages source | Settings > Pages > Source: GitHub Actions |
| Tests fail in CI but pass locally | Missing `package-lock.json` or Node version mismatch | Commit lock file, use Node 20 |
| Site doesn't update after deploy | CDN cache / browser cache | Wait 2-3 min, hard refresh |
| 404 on deployed site | Deploy failed or wrong URL | Check Actions tab, verify URL |

## Maintenance

Update Node version in both `ci.yml` and `deploy.yml`:
```yaml
- uses: actions/setup-node@v4
  with:
    node-version: '20'
```

GitHub Actions versions:
- `actions/checkout@v4`
- `actions/setup-node@v4`
- `actions/configure-pages@v5`
- `actions/upload-pages-artifact@v3` (not `upload-artifact` -- different action)
- `actions/deploy-pages@v4`

## Security

Workflows use minimal permissions:
```yaml
permissions:
  contents: read
  pages: write
  id-token: write
```

Concurrency control prevents partial deploys:
```yaml
concurrency:
  group: pages
  cancel-in-progress: false
```
