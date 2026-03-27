# Plan 10 — Deployment (Vercel + GitHub Actions CI/CD)

## Overview

```
Developer pushes → GitHub → GitHub Actions CI → (pass) → Vercel auto-deploy
                                              → (fail) → block deploy, notify
```

- **Hosting:** Vercel (SPA, static output)
- **CI:** GitHub Actions (lint + type-check + data validation on every PR/push)
- **Branch strategy:**
  - `main` → Production (`ohmysyntax.com`)
  - `develop` → Preview (Vercel preview URL per push)
  - Feature branches → PR preview (Vercel preview URL per PR)

---

## 1. Vercel Configuration

### `vercel.json` (project root)

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm ci",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" }
      ]
    }
  ]
}
```

**Key points:**
- `rewrites`: SPA fallback — all routes serve `index.html` (React Router 대비)
- `assets/` long-term cache: Vite content-hashes filenames → safe to cache forever
- Security headers: basic hardening

### Vercel Dashboard Settings

| Setting | Value |
|---------|-------|
| Framework Preset | Vite |
| Root Directory | `.` (repo root) |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Node.js Version | 20.x |
| Production Branch | `main` |

### Environment Variables (set in Vercel Dashboard)

| Variable | Environment | Value |
|----------|-------------|-------|
| `VITE_TELEMETRY_URL` | Production | `https://api.ohmysyntax.com/telemetry` |
| `VITE_TELEMETRY_URL` | Preview | `https://api-staging.ohmysyntax.com/telemetry` |

> **Never commit real values.** Only `.env.example` (empty values) is committed.
> Set secrets in Vercel Dashboard → Project → Settings → Environment Variables.

---

## 2. GitHub Actions CI Pipeline

### `.github/workflows/ci.yml`

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  ci:
    name: Test, Lint, Type-check, Validate Data
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: TypeScript type-check
        run: npx tsc --noEmit

      - name: ESLint
        run: npm run lint

      - name: Unit tests
        run: npm test -- --run

      - name: Validate EN/KO data parity
        run: npm run validate:data

      - name: Build
        run: npm run build
        env:
          VITE_TELEMETRY_URL: ''   # empty in CI — telemetry no-ops gracefully

      - name: Check bundle size
        run: |
          BUNDLE_SIZE=$(du -sk dist/assets/*.js 2>/dev/null | awk '{sum+=$1} END {print sum}')
          echo "Bundle size: ${BUNDLE_SIZE}KB"
          # Warn if total JS exceeds 300KB (gzip ~150KB target)
          if [ "$BUNDLE_SIZE" -gt 300 ]; then
            echo "⚠️ Bundle size ${BUNDLE_SIZE}KB exceeds 300KB threshold"
          fi
```

### Pipeline Steps Explained

| Step | What it checks | Fail condition |
|------|----------------|----------------|
| `tsc --noEmit` | TypeScript errors across all files | Any type error |
| `eslint` | Code style, React hooks rules | Any lint error |
| `npm test --run` | Vitest unit tests (search logic, hooks, utils) | Any test failure |
| `validate:data` | EN/KO ID parity, orphan detection | Missing translation |
| `build` | Full Vite production build | Build failure |
| Bundle size check | JS bundle stays under budget | Warning only (not blocking) |

---

## 3. Branch Strategy & Deploy Flow

```
feature/xxx  →  PR to develop
                  ↓
              GitHub Actions CI runs
                  ↓ (pass)
              Vercel Preview URL generated
              → Review & QA on preview URL
                  ↓ (approved)
              Merge to develop
                  ↓
              Vercel Preview (develop branch)
                  ↓
              PR: develop → main
                  ↓
              GitHub Actions CI runs again
                  ↓ (pass)
              Merge to main
                  ↓
              Vercel Production Deploy → ohmysyntax.com
```

### Branch Protection Rules (GitHub Settings)

For `main` branch:
- ✅ Require status checks to pass before merging
  - `CI / Lint, Type-check, Validate Data` must pass
- ✅ Require pull request reviews (1 approval minimum)
- ✅ Dismiss stale reviews on new pushes
- ✅ Do not allow force pushes

---

## 4. Environment Strategy

```
.env.example          ← committed, empty values, documents all vars
.env.development      ← gitignored, local dev values
.env.production       ← gitignored, set via Vercel dashboard instead
```

### `.env.example` (committed)
```
# Telemetry endpoint — leave empty to disable telemetry (safe for open-source forks)
VITE_TELEMETRY_URL=
```

### `.gitignore` additions
```
.env.development
.env.production
.env.local
```

---

## 5. Deployment Checklist (pre-launch)

### Before First Deploy
- [ ] Connect GitHub repo to Vercel project
- [ ] Set `VITE_TELEMETRY_URL` in Vercel dashboard (Production + Preview)
- [ ] Set Production Branch to `main` in Vercel
- [ ] Add `vercel.json` to repo root
- [ ] Add `.github/workflows/ci.yml`
- [ ] Set branch protection rules on `main`
- [ ] Add `.env.example` with empty values
- [ ] Add `.env.development` to `.gitignore`

### Every Release
- [ ] `npm run validate:data` passes locally
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run build` succeeds
- [ ] CI green on PR
- [ ] Test on Vercel preview URL
- [ ] Merge to `main` → verify production deploy

---

## 6. Custom Domain (optional)

In Vercel Dashboard → Domains:
1. Add `ohmysyntax.com`
2. Add CNAME `www` → `cname.vercel-dns.com`
3. Vercel auto-provisions SSL (Let's Encrypt)

---

## 7. Performance Monitoring (post-launch)

Vercel provides built-in:
- **Speed Insights** — Core Web Vitals per route
- **Analytics** — visitor stats

Enable both in Vercel Dashboard → Analytics & Speed Insights.

Add to `main.tsx` if Speed Insights SDK is needed:
```ts
import { inject } from '@vercel/analytics';
inject();
```

> Note: This is optional. The app has no dynamic routes,
> so Vercel's automatic measurement via the dashboard is sufficient.
