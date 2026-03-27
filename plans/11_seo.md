# Plan 11 — SEO & Search Visibility

## Goal
Make Oh My Syntax! discoverable on Google for developer search queries.
Target keywords: "command lookup tool", "kill port command", "git reset undo commit", "개발자 명령어 검색".

---

## 1. HTML Meta Tags (`index.html`)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <!-- Primary SEO -->
  <title>Oh My Syntax! — Developer Command Lookup</title>
  <meta name="description"
    content="Instantly find the exact CLI command, Git snippet, or Docker one-liner you forgot. Search in English or Korean." />
  <link rel="canonical" href="https://ohmysyntax.vercel.app" />

  <!-- Open Graph (social sharing + Google rich results) -->
  <meta property="og:type"        content="website" />
  <meta property="og:url"         content="https://ohmysyntax.vercel.app" />
  <meta property="og:title"       content="Oh My Syntax! — Developer Command Lookup" />
  <meta property="og:description" content="Instantly find the CLI command you forgot. Search in English or Korean." />
  <meta property="og:image"       content="https://ohmysyntax.vercel.app/og-image.png" />

  <!-- Twitter Card -->
  <meta name="twitter:card"        content="summary_large_image" />
  <meta name="twitter:title"       content="Oh My Syntax!" />
  <meta name="twitter:description" content="Instantly find the CLI command you forgot." />
  <meta name="twitter:image"       content="https://ohmysyntax.vercel.app/og-image.png" />

  <!-- Favicon -->
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
</head>
```

### OG Image (`public/og-image.png`)
- Size: **1200 × 630px** (required by most platforms)
- Content: dark background (`#0f111a`), large "✦ Oh My Syntax!" title, subtitle, a sample command card
- Format: PNG, ≤ 200KB
- Tool: design in Figma / use `satori` or `sharp` to generate programmatically

---

## 2. `robots.txt` (`public/robots.txt`)

```
User-agent: *
Allow: /

Sitemap: https://ohmysyntax.vercel.app/sitemap.xml
```

---

## 3. `sitemap.xml` (`public/sitemap.xml`)

Single-page app — only one URL to submit:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://ohmysyntax.vercel.app/</loc>
    <lastmod>2026-03-27</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
```

> Update `<lastmod>` on each production deploy (manually or via CI).

---

## 4. JSON-LD Structured Data

Helps Google understand the page type. Add a `<script type="application/ld+json">` in `index.html`:

```json
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Oh My Syntax!",
  "url": "https://ohmysyntax.vercel.app",
  "description": "A lightning-fast command and syntax lookup tool for developers.",
  "applicationCategory": "DeveloperApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  }
}
```

---

## 5. `<html lang>` Attribute — Dynamic Sync

Google uses `lang` to serve correct locale results.
Must stay in sync with the active i18n language:

```tsx
// src/App.tsx (or a dedicated useHtmlLang hook)
import { useUIStore } from '@/store/useUIStore';
import { useEffect } from 'react';

export function useHtmlLang() {
  const language = useUIStore(s => s.language);
  useEffect(() => {
    document.documentElement.lang = language;  // 'en' or 'ko'
  }, [language]);
}
```

- Default (SSR-equivalent for Vite): set `<html lang="en">` in `index.html`
- On Korean toggle: `document.documentElement.lang = 'ko'` via the hook above

---

## 6. Performance = SEO (Core Web Vitals)

Google uses Core Web Vitals as a ranking signal.

| Metric | Target | Our strategy |
|--------|--------|--------------|
| LCP (Largest Contentful Paint) | < 2.5s | Pre-load Inter font, no blocking scripts |
| CLS (Cumulative Layout Shift)  | < 0.1  | AdSkeleton fixed min-height, no layout shifts |
| INP (Interaction to Next Paint)| < 200ms| useDeferredValue, no debounce, local data only |
| FID / TBT                      | < 50ms | No heavy main-thread work on load |

Audit command:
```bash
npx lighthouse https://ohmysyntax.vercel.app --view
```
Target: **> 90** on Performance, Accessibility, Best Practices, SEO.

---

## 7. Google Search Console

Steps (one-time, post-launch):
1. Go to [search.google.com/search-console](https://search.google.com/search-console)
2. Add property: `https://ohmysyntax.vercel.app`
3. Verify via HTML meta tag method:
   ```html
   <meta name="google-site-verification" content="YOUR_TOKEN_HERE" />
   ```
   Add this to `index.html`, commit, deploy.
4. Submit sitemap: `https://ohmysyntax.vercel.app/sitemap.xml`
5. Request indexing on the Coverage report

---

## 8. Checklist (pre-launch)

- [ ] `<title>` and `<meta name="description">` set in `index.html`
- [ ] `og:image` created (1200×630px) and deployed to `public/og-image.png`
- [ ] Open Graph tags verified via [opengraph.xyz](https://www.opengraph.xyz)
- [ ] `robots.txt` accessible at `/robots.txt`
- [ ] `sitemap.xml` accessible at `/sitemap.xml`
- [ ] JSON-LD block in `<head>`
- [ ] `<html lang="en">` default + dynamic sync hook in place
- [ ] Google Search Console: property added, sitemap submitted
- [ ] Lighthouse SEO score > 90

---

## 9. Keyword Targeting (Content in `aliases`)

Google indexes the page content. The command `aliases` array is the biggest SEO asset —
real queries developers type into Google map directly to our search aliases.

High-value aliases to ensure exist:
- `"address already in use"` → kill-port command
- `"undo last commit"`, `"git undo"` → git reset
- `"docker clean up"`, `"docker prune"` → docker system prune
- `"permission denied"` → chmod commands
- `"kill process port 3000"`, `"kill process port 8080"` → kill-port

These aliases appear in the page's JavaScript bundle — Googlebot executes JS and can index them.
