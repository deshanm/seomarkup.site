# Contributing to SEOMarkup

Thanks for your interest in contributing! This repo contains two independent subprojects:

| Directory | What it is |
|-----------|-----------|
| `app/` | The Chrome extension (plain JS, no build step) |
| `website/` | The marketing site + tools (Astro + Tailwind) |

## Before you start

- Check [open issues](../../issues) to avoid duplicate work.
- For large changes, open an issue first to align on approach.
- Follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages: `feat:`, `fix:`, `docs:`, `chore:`, etc.

---

## Chrome extension (`app/`)

### Local setup

1. Clone the repo.
2. Open `chrome://extensions` in Chrome.
3. Enable **Developer mode**.
4. Click **Load unpacked** and select the `app/` directory.
5. Pin the extension and open it on any page with JSON-LD structured data.

### Testing checklist before a PR

- Pages with JSON-LD render as accordions.
- Pages with `@graph` flatten into per-entry accordions.
- Malformed JSON-LD shows the error banner with the offending snippet.
- Pages with only Microdata/RDFa show the info banner.
- Restricted pages (`chrome://`, Web Store, `file://`) show a friendly fallback.
- Search highlights, Enter cycles, Clear resets.
- Copy buttons copy the correct content, download saves a valid `.json` file.
- Validator links open the correct page with the current URL pre-filled.
- Hover on a schema type shows the external-link arrow; click opens schema.org.

### Extension permissions

The extension requests **only** `activeTab` and `scripting`. Do not add `host_permissions` or other permissions without a strong reason and discussion in an issue first.

---

## Website (`website/`)

### Local setup

```bash
cd website
npm install
npm run dev          # starts at http://localhost:4321
```

### Adding a resource/content page

1. Create `website/src/pages/resources/your-slug.mdx`.
2. Add frontmatter:
   ```mdx
   ---
   title: "Your Page Title"
   description: "One-sentence description for meta tags and OG."
   publishedAt: 2026-01-01
   author: "Deshan M"
   ---
   ```
3. Use `ArticleLayout` (imported by default for pages under `resources/`).
4. Run `npm run build` — the sitemap and Article JSON-LD are generated automatically.

### Adding a new schema generator type

1. Add the type definition to `website/src/lib/schema-validation.ts` (required fields, recommended fields, each citing the Google docs URL in a comment).
2. Add fixtures to `website/src/lib/__tests__/schema-validation.test.ts`.
3. Run `npm test` — all fixtures must pass before submitting a PR.
4. The generator UI (`website/src/components/tools/SchemaGeneratorForm.tsx`) picks up the new type automatically from the exported map.

### Code style

- **TypeScript** for all files under `website/src/`.
- **Prettier** defaults (run `npm run format`).
- **No invented schema rules.** Every required/recommended field in `schema-validation.ts` must cite its Google docs source URL in a comment.

---

## Pull request checklist

- [ ] Subproject affected: `app/` | `website/` | both
- [ ] If UI changes: screenshots included
- [ ] If schema rules added/changed: `npm test` passes
- [ ] If content page added: opens in Chrome extension and shows valid Article JSON-LD

## Code of Conduct

This project follows the [Contributor Covenant v2.1](CODE_OF_CONDUCT.md). Please read it before participating.
