# hugo-kukumba

Russian version: [README.ru.md](./README.ru.md)

A minimalist Hugo theme with **Nunito** for body text, **Fira Code** for code, a dark palette, image captions, PhotoSwipe lightbox support, album-style carousels, and Twemoji rendering.

## Contents

- [Quick Start](#quick-start)
- [Local Development](#local-development)
- [Theme Structure](#theme-structure)
- [Markup and Code Highlighting](#markup-and-code-highlighting)
- [Posts and Previews](#posts-and-previews)
- [Images and Galleries](#images-and-galleries)
- [Theme Parameters](#theme-parameters)

## Quick Start

1. Create a site: `hugo new site my-site`
2. Copy the theme into `my-site/themes/hugo-kukumba`
3. Add the theme config to `my-site/hugo.toml`:

```toml
theme = "hugo-kukumba"
title = "My Blog"
pagerSize = 10

[markup]
  [markup.goldmark]
    [markup.goldmark.parser]
      wrapStandAloneImageWithinParagraph = false
  [markup.highlight]
    style = "tokyonight-night"

[params]
  description = "My minimalist Hugo blog"
  footerText = "© 2026 My Blog"
  postListEndingText = "Thanks for reading."
  previewPlainLimit = 360

  [params.themeColors]
    bg = "#000000"
    surface = "#0c0c0c"
    text = "#e6e6e6"
    muted = "#a0a0a0"
    accent = "#08ba08"
    border = "#242424"
    inlineCodeBg = "#1a1b26"
    inlineCodeText = "#7aa2f7"
    inlineCodeBorder = "#2f3549"

  [params.themeFonts]
    googleFontsURL = "https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&family=Fira+Code:wght@400;500;700&display=swap"
    body = "\"Nunito\", sans-serif"
    code = "\"Fira Code\", monospace"

  [params.themeLayout]
    contentMaxWidth = "900px"
    contentSidePadding = "4vw"
    postListThumbWidth = "160px"
    postListThumbHeight = "100px"
    previewMediaMaxWidth = "560px"
    previewMediaMaxWidthMobile = "100%"
    postImageMaxWidth = "80%"
    albumImageMaxWidth = "80%"
    albumThumbSize = "64px"
    albumThumbSizeMobile = "52px"

  [params.headerLink]
    name = "Contact"
    url = "/contacts/"

  [[params.footerLinks]]
    name = "GitHub"
    url = "https://github.com/your-name"
```

4. Create a post: `hugo new posts/first-post.md`
5. Start the server: `hugo server -D`

## Local Development

The repository includes a demo site in `exampleSite/`.

From the theme root:

```bash
hugo server --source exampleSite --themesDir ../..
```

From `exampleSite/`:

```bash
hugo server --themesDir ../..
```

## Theme Structure

The theme is grouped by feature area:

- `layouts/partials/site/`: header, footer, pagination, runtime theme variables and layout tokens
- `layouts/partials/posts/`: post cards, list rendering, list-page script decisions
- `layouts/partials/media/`: shared media helpers, image markup, album markup
- `layouts/shortcodes/album.html`: public `{{< album >}}` shortcode
- `layouts/_default/_markup/render-image.html`: Markdown image render hook
- `static/css/base.css`: global layout, shell, links
- `static/css/posts.css`: post lists, metadata, pagination, previews
- `static/css/media.css`: code, images, albums, lightbox-related layout
- `static/js/site/twemoji.js`: lazy-loaded Twemoji support for text content
- `static/js/media/gallery.js`: album carousel and PhotoSwipe integration
- `static/js/posts/back-link.js`: single-post back-link behavior

## Markup and Code Highlighting

The theme uses Hugo Goldmark and Chroma.

Recommended config:

```toml
[markup]
  [markup.goldmark]
    [markup.goldmark.parser]
      wrapStandAloneImageWithinParagraph = false
  [markup.highlight]
    style = "tokyonight-night"
```

`wrapStandAloneImageWithinParagraph = false` is required for this theme's image render hook. Markdown images are rendered as `figure` plus `figcaption`; without this setting, Goldmark may wrap standalone images in `<p>`, which leads to invalid HTML.

If you prefer CSS classes instead of inline highlight styles:

```toml
[markup]
  [markup.goldmark]
    [markup.goldmark.parser]
      wrapStandAloneImageWithinParagraph = false
  [markup.highlight]
    style = "tokyonight-night"
    noClasses = false
```

Then generate a stylesheet:

```bash
hugo gen chromastyles --style tokyonight-night > static/css/chroma-tokyonight.css
```

After that, include `static/css/chroma-tokyonight.css` next to the theme CSS files.

## Posts and Previews

By default, post cards work like this:

- use `cover` or `image` from front matter when present
- otherwise fall back to `cover.*`, `featured.*`, or `thumbnail.*` in the page bundle
- render plain-text previews truncated by `params.previewPlainLimit`
- use Hugo's `pagerSize` for pagination

Example:

```toml
pagerSize = 10

[params]
  previewPlainLimit = 360
```

Example front matter:

```toml
+++
title = "My post"
date = 2026-03-06T12:00:00Z
cover = "cover.jpg"
+++
```

You can also point to images from `static/`:

```toml
+++
image = "/images/my-cover.jpg"
+++
```

### Preview Modes

`list_preview_mode` controls what is shown in post lists:

- `plain` or unset: cover image plus truncated plain-text preview
- `rich`: HTML preview from `.Summary`, typically everything before `<!--more-->`
- `full`: the full `.Content`, even if there is no `<!--more-->`

`Read more` is shown only when the post is truncated and the preview mode is not `full`.

Example `rich` post:

```toml
+++
title = "My post"
list_preview_mode = "rich"
+++
```

```md
First two or three teaser sentences.

![Alt text](hutava.png "Hutava!")

<!--more-->

The rest of the post goes here.
```

Example `full` post:

```toml
+++
title = "Image demo post"
list_preview_mode = "full"
+++
```

## Images and Galleries

### Regular Images

Markdown images are rendered as `figure` and `figcaption`, use `loading="lazy"` and `decoding="async"`, and resolve local page-bundle files through Hugo Page Resources.

Recommended structure:

```text
content/posts/my-post/
  index.md
  cover.jpg
  screenshot.png
```

Example Markdown:

```md
![Alt text](cover.jpg "Image caption")
```

Static and remote paths also work:

```md
![Example](/images/example.jpg "Caption")
![Remote image](https://example.com/image.jpg)
```

`alt` comes from `[]`; the caption comes from the image title.

Captions support Markdown, so links work as expected:

```md
![Alt text](cover.jpg "[Source](https://example.com)")
```

### Lightbox

The theme bundles [PhotoSwipe](https://photoswipe.com/) locally in `static/vendor/photoswipe/`.

Supported behavior:

- clicking a regular post image opens it fullscreen
- clicking an album image opens a fullscreen gallery
- keyboard navigation, arrows, swipe, and close controls are supported

Page-bundle images provide dimensions at build time. External images are measured in the browser after they load.

### Emoji

The theme supports Twemoji rendering through `jdecked/twemoji`.

Behavior:

- `static/js/site/twemoji.js` scans text-focused nodes after `DOMContentLoaded`
- the Twemoji CDN runtime is loaded lazily only when emoji are actually found
- code-like zones such as `pre`, `code`, `kbd`, and `samp` are skipped
- emoji images get the shared `.emoji` class for inline alignment

### Album Carousel

Use the public `album` shortcode to render an inline carousel with thumbnails:

```md
{{< album >}}
![Photo 1](one.jpg "Caption 1")
![Photo 2](two.jpg "Caption 2")
![Photo 3](three.jpg "Caption 3")
{{< /album >}}
```

Use it inside a page bundle when possible:

```text
content/posts/my-post/
  index.md
  one.jpg
  two.jpg
  three.jpg
```

Inside `album`, use only images. Captions come from the Markdown image title for each slide.

Album behavior:

- the main image is shown above
- navigation buttons are placed on the same row as the thumbnail strip: `← [thumbs] →`
- the main image opens in PhotoSwipe on click
- touch swipe is supported on the album viewport

## Theme Parameters

### Header Link

```toml
[params.headerLink]
  name = "Contact"
  url = "/contacts/"
```

### Footer Text

`footerText` supports Markdown and multiline values:

```toml
[params]
  footerText = """
    © 2026 My Blog
    [GitHub](https://github.com/your-name)
  """
```

### Footer Links

```toml
[[params.footerLinks]]
  name = "GitHub"
  url = "https://example.com"
```

Both `name/url` and `title/URL` are supported.

### Text After the Post List

```toml
[params]
  postListEndingText = "Your text after the post list"
```

### Plain Preview Limit

```toml
[params]
  previewPlainLimit = 360
```

Used by `plain` preview mode to control the maximum length of list excerpts.

### Theme Colors

```toml
[params.themeColors]
  bg = "#000000"
  surface = "#0c0c0c"
  text = "#e6e6e6"
  muted = "#a0a0a0"
  accent = "#08ba08"
  border = "#242424"
  inlineCodeBg = "#1a1b26"
  inlineCodeText = "#7aa2f7"
  inlineCodeBorder = "#2f3549"
```

These values map directly to the theme CSS variables, so you can change the palette without editing `base.css`.

### Theme Fonts

```toml
[params.themeFonts]
  googleFontsURL = "https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&family=Fira+Code:wght@400;500;700&display=swap"
  body = "\"Nunito\", sans-serif"
  code = "\"Fira Code\", monospace"
```

`body` is used for the main site text. `code` is used for inline code and code blocks. You can override both the import URL and the resulting `font-family` values from config.

### Theme Layout

```toml
[params.themeLayout]
  contentMaxWidth = "900px"
  contentSidePadding = "4vw"
  postListThumbWidth = "160px"
  postListThumbHeight = "100px"
  previewMediaMaxWidth = "560px"
  previewMediaMaxWidthMobile = "100%"
  postImageMaxWidth = "80%"
  albumImageMaxWidth = "80%"
  albumThumbSize = "64px"
  albumThumbSizeMobile = "52px"
```

These values feed the internal responsive/layout tokens used by `base.css`, `posts.css`, and `media.css`. Use this block when you want to retune widths, media sizing, and thumbnail sizes without editing the stylesheet source.
