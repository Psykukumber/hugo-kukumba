# Architecture

## Overview

`hugo-kukumba` is a Hugo theme with:

- list and single post layouts
- Markdown image render hooks
- a public `album` shortcode
- a PhotoSwipe-based lightbox
- configurable preview modes for post cards

The theme stays intentionally small: templates produce the markup, CSS is split by feature area, and JavaScript is limited to gallery behavior plus the single-post back-link.

## Rendering Flow

### Rendering Hierarchy

```text
baseof.html
|- site/header.html
|- main block
|  |- index.html
|  |  `- partials/posts/
|  |     |- list-content.html
|  |     |- list-item.html
|  |     `- list-scripts.html
|  |- _default/list.html
|  |  `- partials/posts/
|  |     |- list-content.html
|  |     |- list-item.html
|  |     `- list-scripts.html
|  |- _default/single.html
|  |  |- .Content
|  |  |  |- _markup/render-image.html
|  |  |  |  `- partials/media/
|  |  |  |     |- resolve-image.html
|  |  |  |     `- image-link.html
|  |  |  `- shortcodes/album.html
|  |  |     `- partials/media/album.html
|  |  `- scripts
|  |     |- js/media/gallery.js
|  |     `- js/posts/back-link.js
|  `- 404.html
`- site/footer.html
```

### Base Layout

`layouts/_default/baseof.html` is the root shell.

Responsibilities:

- loads shared CSS
- loads PhotoSwipe CSS
- injects runtime theme CSS variables and font settings through `partials/site/theme-vars.html`
- renders site header and footer partials
- exposes the `main` and `scripts` blocks

### Page Types

- `layouts/index.html`: homepage post list
- `layouts/_default/list.html`: section and taxonomy-like list pages
- `layouts/_default/single.html`: single post page
- `layouts/404.html`: not found page

## Template Groups

### Site Partials

Located in `layouts/partials/site/`.

- `header.html`
- `footer.html`
- `pagination.html`
- `theme-vars.html`

These partials should stay generic and free of post-specific logic.

### Post Partials

Located in `layouts/partials/posts/`.

- `list-content.html`
- `list-item.html`
- `list-scripts.html`

Responsibilities:

- shared list markup and pagination
- cover image lookup
- preview mode selection
- read-more behavior
- conditional gallery script loading for list pages

### Media Partials

Located in `layouts/partials/media/`.

- `image-link.html`
- `resolve-image.html`
- `album.html`

`image-link.html` contains the shared anchor and image markup used by the Markdown image render hook.

`resolve-image.html` is the shared helper for:

- page bundle resource lookup
- external and absolute URL passthrough
- optional thumbnail generation for local raster images

`album.html` contains the shared markup used by the public shortcode entrypoint.

## Shortcodes

Public shortcode entrypoint:

- `layouts/shortcodes/album.html`

This must stay stable so authors can continue using:

```md
{{< album >}}
...
{{< /album >}}
```

Do not move the public shortcode into a nested shortcode folder unless the public API is intentionally being renamed.

## Markdown Image Pipeline

Markdown images are rendered through:

- `layouts/_default/_markup/render-image.html`

Responsibilities:

- decide between block and inline image rendering
- wrap block images in `figure`
- add captions from the Markdown image title
- add lazy-loading attributes
- emit PhotoSwipe-friendly links and dimensions

Any change to media resolution should stay aligned between the render hook and list preview cover resolution logic. Standalone block images also depend on `wrapStandAloneImageWithinParagraph = false` in Hugo markup configuration.

## CSS Structure

CSS is split into three files:

- `static/css/base.css`
- `static/css/posts.css`
- `static/css/media.css`

Responsibilities:

- `base.css`: global layout, shell, links, typography defaults
- `posts.css`: post lists, metadata, pagination, post previews
- `media.css`: code blocks, images, albums, preview media, lightbox-related layout

Theme color values may be overridden through `params.themeColors`. Font settings may be overridden through `params.themeFonts`. Layout and responsive sizing tokens may be overridden through `params.themeLayout`. `partials/site/theme-vars.html` maps those config values to the CSS variables consumed by `base.css`, `posts.css`, and `media.css`, and can emit an optional Google Fonts import URL.

Prefer extending the existing groups instead of reintroducing a monolithic stylesheet.

## JavaScript Structure

- `static/js/media/gallery.js`
- `static/js/site/twemoji.js`
- `static/js/posts/back-link.js`

### gallery.js

Handles:

- album carousel behavior
- album thumbnails
- PhotoSwipe initialization
- standalone image galleries in `.post-body` and `.post-preview`

### twemoji.js

Handles:

- lazy detection of emoji content in text-bearing nodes
- on-demand loading of the `jdecked/twemoji` CDN runtime
- safe text-node replacement that skips `pre`, `code`, `kbd`, `samp`, and similar zones

### back-link.js

Handles:

- same-origin history-back behavior for the "Back to posts" link

It should stay scoped to single post pages.

## Preview Modes

`list_preview_mode` is read in `layouts/partials/posts/list-item.html`.

Supported values:

- `plain`
- `rich`
- `full`

Behavior:

- `plain`: cover plus truncated plain text
- `rich`: HTML preview based on Hugo summary, typically before `<!--more-->`
- `full`: full post content in the list card

List page size is controlled by Hugo's `pagerSize` setting in site config.
Plain preview truncation length is controlled by `params.previewPlainLimit`.

## Demo Site

`exampleSite/` is the verification target for theme work.

Use it to validate:

- album behavior
- image rendering
- preview modes
- RSS generation
- homepage and section list rendering

Generated directories under `exampleSite/` are not architectural source and should not drive design decisions.
