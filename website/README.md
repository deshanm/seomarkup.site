# SEOMarkup Website

The marketing site and tools hub at [seomarkup.site](https://www.seomarkup.site). Built with [Astro](https://astro.build) + Tailwind CSS.

## Local development

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # production build → dist/
npm run preview  # preview the production build locally
```

## Adding a resource page

1. Create `src/pages/resources/your-slug.mdx`
2. Add frontmatter:
   ```mdx
   ---
   title: "Your Page Title"
   description: "One-sentence description for meta/OG."
   publishedAt: 2026-01-15
   updatedAt: 2026-01-15
   author: "Deshan M"
   ---
   ```
3. Write the content in MDX (Markdown + JSX components).
4. Run `npm run build` — `ArticleLayout` wraps the page automatically with `Article` + `BreadcrumbList` + `FAQPage` JSON-LD, and `@astrojs/sitemap` picks it up.

## Adding a schema generator type

1. Add the type config to `src/lib/schema-validation.ts` (required/recommended fields, each citing its Google docs URL in a comment).
2. Add test fixtures to `src/lib/__tests__/schema-validation.test.ts`.
3. Run `npm test` — all fixtures must pass.
4. The generator form picks up new types automatically.

## Project structure

```
website/
├── public/           static assets (favicons, robots.txt, OG images)
└── src/
    ├── layouts/      BaseLayout, ArticleLayout, ToolLayout
    ├── components/   shared UI components + tool islands
    ├── pages/        routes (index, /resources/*, /tools/*, /privacy, /terms)
    ├── content/      content collection config
    ├── lib/          schema validation core + JSON-LD parser
    └── styles/       global CSS
```

## Deployment

Static site built with `astro build`. Deploys automatically from the `main` branch via Vercel. PRs get preview deployments. See [CONTRIBUTING.md](../CONTRIBUTING.md) for the full workflow.
