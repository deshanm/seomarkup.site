# SEOMarkup Structured Data Schema Inspector

A Chrome extension that inspects JSON-LD structured data on the active page, displays it as an expandable tree, and links out to Google's Rich Results Test and the Schema.org validator.

## Features

- Detects and parses all `<script type="application/ld+json">` blocks on the active tab
- Flattens `@graph` arrays into individual schema entries
- Copy each schema as JSON or as a `<script>` tag, or download as a `.json` file
- Search across all schemas with next/prev navigation and Enter-to-cycle
- Shows a parse-error banner when JSON-LD is malformed (instead of silently hiding it)
- Reports Microdata/RDFa presence so you know when a page uses non-JSON-LD structured data
- One-click validation via Google Rich Results Test and validator.schema.org

## Development

This is a vanilla MV3 extension — no build step.

### Load unpacked

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked** and select this directory
4. Pin the extension and click its icon on any page with JSON-LD

### File layout

- `manifest.json` — MV3 manifest, declares `activeTab` + `scripting` permissions only
- `popup.html` / `popup.js` — extension popup UI and orchestration
- `utils.js` — content-script payload (`getSchemaJson`) plus popup helpers
- `constants.js` — inline SVG strings
- `styles.css` — popup styles
- `libs/jsonTree/` — third-party JSON tree renderer
- `libs/reset/` — CSS reset

### Permissions

The extension requests only `activeTab` and `scripting`. It runs the content function in the active tab when the user opens the popup; it does **not** request `host_permissions: <all_urls>`.

### Testing checklist

- Pages with JSON-LD render as accordions
- Pages with `@graph` flatten into per-entry accordions
- Pages with malformed JSON-LD show the error banner with the offending snippet
- Pages with only Microdata/RDFa show the info banner
- Restricted pages (`chrome://`, Web Store, `file://`) show a friendly fallback message
- Search highlights, Enter cycles, Clear resets

## Credits

- Icons from [Heroicons](https://heroicons.com/)
- Logo generated with ChatGPT
- JSON tree renderer: vendored under `libs/jsonTree/`
