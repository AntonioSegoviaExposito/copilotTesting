# Security Notes

## Development Dependencies Vulnerabilities

### Current Status (2026-02-03)

**6 moderate severity vulnerabilities** in development dependencies (esbuild and related packages).

### Context

These vulnerabilities are in the **esbuild** package and its dependents (vite, vitest, etc.), which are:
- ✅ **Development dependencies only** (used for testing)
- ✅ **Not shipped to production** (the app has zero runtime dependencies)
- ✅ **Not exposed to end users** (no dev server in production)

### Vulnerability Details

**esbuild <=0.24.2**: Enables any website to send requests to the development server and read the response.
- **CVE**: GHSA-67mh-4wv8-2f99
- **Severity**: Moderate
- **Affected packages**: esbuild, vite, vite-node, @vitest/mocker, @vitest/ui, vitest

### Why Not Fixed Immediately?

1. **Breaking Changes**: Fixing requires `npm audit fix --force`, which will upgrade to vitest@4.0.18 (breaking change)
2. **Zero Production Impact**: The vulnerability only affects the development server, which:
   - Is never used in production
   - Runs only on localhost during development
   - Is not exposed to the internet
3. **Application Architecture**: The VCF Manager is a pure SPA with:
   - No build process required
   - No server-side components
   - Zero runtime dependencies
   - Direct browser execution

### Mitigation Strategy

**Current**:
- ✅ Dev server only runs on localhost
- ✅ Not used in CI/CD pipelines (tests run in Node.js, not browser)
- ✅ Production deployment is static files only

**Future**:
- Update to vitest v4 when stable and non-breaking
- Monitor for security updates in esbuild
- Consider alternative test runners if vulnerability persists

### Production Security

The **production application** has:
- ✅ **Zero npm dependencies** (pure vanilla JS)
- ✅ **No build artifacts** (source code runs directly)
- ✅ **No server-side code** (static files only)
- ✅ **No external API calls** (all operations client-side)
- ✅ **No third-party scripts** (self-contained)

### Developer Guidelines

When running the development server:
1. Only run on trusted localhost
2. Don't expose dev server to the network
3. Don't visit untrusted websites while dev server is running
4. Use `npm test` in CI (doesn't expose dev server)

### Monitoring

This vulnerability is tracked and will be addressed in a future update when:
- Non-breaking fix is available, OR
- Vitest v4 is stable and tested, OR
- Alternative test runner is evaluated

---

**Last Updated**: 2026-02-03  
**Risk Level**: Low (development-only vulnerability)  
**Production Impact**: None (zero runtime dependencies)
