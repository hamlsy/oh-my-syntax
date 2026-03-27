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

## 9. Multilingual Search Keyword Targeting

These are queries developers type into **Google** to find a tool like Oh My Syntax.
Target these in `<meta name="description">`, page copy, and README to improve organic ranking.

---

### 🇺🇸 English
| Intent | Keywords |
|--------|----------|
| Find the tool | `"developer command lookup"`, `"cli command cheat sheet"`, `"command search tool for developers"` |
| Specific use | `"how to find terminal commands"`, `"forget command lookup"`, `"developer cheatsheet search"` |
| Competitors | `"devhints alternative"`, `"tldr alternative"`, `"cheatsh alternative"` |

---

### 🇰🇷 한국어
| 의도 | 키워드 |
|------|--------|
| 도구 검색 | `"개발자 명령어 검색"`, `"터미널 명령어 모음"`, `"CLI 명령어 찾기"` |
| 구체적 사용 | `"명령어 까먹을때"`, `"개발자 치트시트"`, `"리눅스 명령어 검색 사이트"` |

---

### 🇨🇳 中文 (Simplified)
| 意图 | 关键词 |
|------|--------|
| 查找工具 | `"开发者命令查询"`, `"Linux命令速查"`, `"终端命令备忘录"` |
| 具体使用 | `"忘记命令怎么查"`, `"开发者命令搜索工具"`, `"CLI命令大全搜索"` |

---

### 🇮🇳 हिंदी
| उद्देश्य | कीवर्ड |
|----------|---------|
| टूल खोजना | `"developer command search tool"`, `"terminal commands dhundne ka tool"`, `"CLI cheatsheet in hindi"` |
| विशिष्ट उपयोग | `"command bhool gaye to kaise dhundhe"`, `"linux command finder"` |

---

### 🇫🇷 Français
| Intention | Mots-clés |
|-----------|-----------|
| Trouver l'outil | `"recherche commande développeur"`, `"aide-mémoire commandes terminal"`, `"outil recherche commandes CLI"` |
| Usage spécifique | `"j'ai oublié la commande"`, `"commandes linux chercher"`, `"cheatsheet développeur en ligne"` |

---

### 🇯🇵 日本語
| 意図 | キーワード |
|------|-----------|
| ツールを探す | `"開発者コマンド検索"`, `"ターミナルコマンド一覧"`, `"CLIコマンド調べるサイト"` |
| 具体的な使い方 | `"コマンド忘れた 検索"`, `"Linuxコマンド検索ツール"`, `"開発者チートシート検索"` |

---

### Where to apply these keywords

| Location | How |
|----------|-----|
| `<meta name="description">` | Use top EN keywords naturally in 1–2 sentences |
| `<title>` | Include primary keyword: `"Developer Command Lookup"` |
| `README.md` hero section | EN + KO keywords in the description paragraphs (GitHub indexes READMEs) |
| `og:description` | Mirror the meta description |
| Page subtitle / hero text | `"Type anything. Copy everything."` naturally contains intent signals |
