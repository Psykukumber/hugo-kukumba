# AGENTS.md

This repository contains a Hugo theme named `hugo-kukumba`.

## Scope

- Theme source lives at the repository root.
- Demo content and build verification live in `exampleSite/`.
- Generated output must not be treated as source of truth.

## Source Of Truth

- Templates: `layouts/`
- Static assets: `static/`
- Theme docs: `README.md`
- Architecture notes: `ARCHITECTURE.md`

Ignore generated artifacts:

- `exampleSite/public/`
- `exampleSite/resources/_gen/`
- `.hugo_build.lock`

## Project Layout

- `layouts/_default/`:
  Base templates and page layouts.
- `layouts/partials/site/`:
  Header, footer, pagination, and runtime theme variables.
- `layouts/partials/posts/`:
  Shared list rendering, post card rendering, and list-page script decisions.
- `layouts/partials/media/`:
  Shared media helpers, image link markup, and album markup.
- `layouts/shortcodes/album.html`:
  Public shortcode entrypoint. Keep `{{< album >}}` stable.
- `layouts/_default/_markup/render-image.html`:
  Markdown image render hook.
- `static/css/`:
  Split by responsibility: `base.css`, `posts.css`, `media.css`.
- `static/js/site/twemoji.js`:
  Lazy-loaded Twemoji support for text content.
- `static/js/media/gallery.js`:
  Album carousel and PhotoSwipe integration.
- `static/js/posts/back-link.js`:
  Single-post back-link behavior.

## Working Rules

When changing the theme:

1. Preserve the public shortcode API `{{< album >}}`.
2. Prefer shared partials for reusable logic over duplicating template branches.
3. Keep CSS grouped by responsibility instead of adding new catch-all files.
4. Do not edit vendor files in `static/vendor/`.
5. Treat `exampleSite/public/` as generated output only.

## Verification

Preferred build check:

```bash
hugo --source exampleSite --themesDir ../..
```

If updating media behavior, verify:

- regular Markdown images
- `{{< album >}}`
- Twemoji rendering in titles and regular text without affecting code blocks
- `list_preview_mode = "plain" | "rich" | "full"`
- homepage and section list pages

## Common Pitfalls

- Moving a shortcode into a nested folder changes its Hugo invocation name.
- `render-image.html` and list previews share media resolution rules; keep them aligned.
- Back-link JS should only be loaded on single post pages.
- RSS uses Hugo built-ins unless custom RSS templates are introduced.
