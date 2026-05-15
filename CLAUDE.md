# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repo structure

Two independent subprojects share this root:

- **`app/`** — Chrome extension (MV3, vanilla JS, no build step)
- **`website/`** — Astro 6 marketing site + free tools (Tailwind CSS v4, Preact islands, MDX)

They are linked only by `website/src/lib/extension-meta.ts`, which imports `app/manifest.json` via a Vite alias to keep the extension version in sync.

## Commands

### Chrome extension (`app/`)

No build step. Load unpacked from `app/` in `chrome://extensions` with Developer mode enabled. There are no test or lint commands — validate manually using the testing checklist in `app/README.md`.

### Website (`website/`)

```bash
cd website
npm install
npm run dev      # http://localhost:4321
npm run build    # production build → dist/
npm run preview  # preview production build
```

No linter is configured. TypeScript is checked implicitly by Astro during build.

## Architecture: website

**Rendering:** Astro static output. Pages are `.astro` or `.mdx`; interactive tools are Preact islands (`client:load`).

**Layouts:**
- `BaseLayout.astro` — wraps every page with the yellow-header nav, footer, and global SEO tags
- `ArticleLayout.astro` — extends BaseLayout; automatically injects `Article` + `BreadcrumbList` + `FAQPage` JSON-LD for MDX resource pages
- `ToolLayout.astro` — extends BaseLayout with tool-page chrome

**Tools (Preact islands):**
- `SchemaGenerator.tsx` — reads field definitions from `src/lib/schema-validation.ts` and emits JSON-LD; adding a new schema type means adding it to that file only
- `RichResultPreview.tsx` / `SerpPreview.tsx` — client-side Google SERP preview

**Content:**
- Resource articles live as MDX files directly in `src/pages/` (not in a content collection). Frontmatter fields: `title`, `description`, `publishedAt`, `updatedAt`, `author`.
- New resource pages go in `src/pages/resources/your-slug.mdx`.

## Architecture: extension (`app/`)

Entry point is `popup.html` → `popup.js`. The content-script payload (`getSchemaJson`) lives in `utils.js` and is injected into the active tab via `chrome.scripting.executeScript` at popup open time — there is no persistent background script.

Key files: `popup.js` (orchestration), `utils.js` (schema extraction + DOM helpers), `constants.js` (inline SVG strings), `libs/jsonTree/` (vendored tree renderer).

## Design system

Defined in `DESIGN.md`. Key constraints to respect when touching UI:

- **Palette:** black (#000), white, and yellow (#facc15) only. No other hues.
- **Yellow is a signal, not a paint color** — used only on active CTAs, eyebrow labels, and earned states. Rare on white sections; more present on dark ones.
- **Font:** Poppins everywhere. Hierarchy is expressed through weight (400 vs 700), not through adding size steps.
- **The cat mascot appears exactly once per page** — never scaled to icon size, never repeated.
- **No gradient text, no glassmorphism, no hero-stat grids, no left-stripe card borders, no nested cards.**
- **Sections alternate tonal planes** (white → yellow-wash → near-black → white) rather than using shadows for depth.
- The yellow header (`#fde68a`) is a brand signature — do not normalize it to white.

See `DESIGN.md` for the full component spec (buttons, cards, pills, inputs, elevation rules).

## Deployment

The website deploys automatically from `main` via Vercel static adapter. PRs get preview deployments. Do not push directly to `main`.
