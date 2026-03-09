# hugo-kukumba

Минималистичная тема Hugo с **Nunito** для основного текста, **Fira Code** для кода, темной палитрой, подписями к изображениям, PhotoSwipe lightbox, album-каруселями и рендерингом Twemoji.

## Содержание

- [Быстрый старт](#быстрый-старт)
- [Локальная разработка](#локальная-разработка)
- [Структура темы](#структура-темы)
- [Markup и подсветка кода](#markup-и-подсветка-кода)
- [Посты и превью](#посты-и-превью)
- [Изображения и галереи](#изображения-и-галереи)
- [Параметры темы](#параметры-темы)

## Быстрый старт

1. Создайте сайт: `hugo new site my-site`
2. Скопируйте тему в `my-site/themes/hugo-kukumba`
3. Добавьте конфиг темы в `my-site/hugo.toml`:

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
  postListEndingText = "Спасибо, что читаете."
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
    name = "Контакты"
    url = "/contacts/"

  [[params.footerLinks]]
    name = "GitHub"
    url = "https://github.com/your-name"
```

4. Создайте пост: `hugo new posts/first-post.md`
5. Запустите сервер: `hugo server -D`

## Локальная разработка

В репозитории есть демо-сайт в `exampleSite/`.

Из корня темы:

```bash
hugo server --source exampleSite --themesDir ../..
```

Из `exampleSite/`:

```bash
hugo server --themesDir ../..
```

## Структура темы

Тема сгруппирована по функциональным зонам:

- `layouts/partials/site/`: header, footer, pagination, runtime theme variables и layout tokens
- `layouts/partials/posts/`: карточки постов, рендер списков, решения по подключению JS на list-page
- `layouts/partials/media/`: общие media-helper'ы, image markup, album markup
- `layouts/shortcodes/album.html`: публичный shortcode `{{< album >}}`
- `layouts/_default/_markup/render-image.html`: render hook для Markdown-изображений
- `static/css/base.css`: глобальный layout, shell, ссылки
- `static/css/posts.css`: списки постов, метаданные, пагинация, preview
- `static/css/media.css`: код, изображения, альбомы, lightbox-related layout
- `static/js/site/twemoji.js`: lazy-loaded поддержка Twemoji для текстового контента
- `static/js/media/gallery.js`: album carousel и PhotoSwipe integration
- `static/js/posts/back-link.js`: поведение ссылки назад на single page

## Markup и подсветка кода

Тема использует Hugo Goldmark и Chroma.

Рекомендуемый конфиг:

```toml
[markup]
  [markup.goldmark]
    [markup.goldmark.parser]
      wrapStandAloneImageWithinParagraph = false
  [markup.highlight]
    style = "tokyonight-night"
```

`wrapStandAloneImageWithinParagraph = false` нужен для render hook изображений в этой теме. Markdown-картинки рендерятся как `figure` и `figcaption`; без этой настройки Goldmark может завернуть standalone image в `<p>`, что приводит к невалидному HTML.

Если нужны CSS-классы вместо inline-стилей подсветки:

```toml
[markup]
  [markup.goldmark]
    [markup.goldmark.parser]
      wrapStandAloneImageWithinParagraph = false
  [markup.highlight]
    style = "tokyonight-night"
    noClasses = false
```

Затем сгенерируйте stylesheet:

```bash
hugo gen chromastyles --style tokyonight-night > static/css/chroma-tokyonight.css
```

После этого подключите `static/css/chroma-tokyonight.css` рядом с CSS-файлами темы.

## Посты и превью

По умолчанию карточки постов работают так:

- используют `cover` или `image` из front matter, если они заданы
- иначе ищут `cover.*`, `featured.*` или `thumbnail.*` в page bundle
- рендерят plain-text preview, обрезанный по `params.previewPlainLimit`
- используют Hugo `pagerSize` для пагинации

Пример:

```toml
pagerSize = 10

[params]
  previewPlainLimit = 360
```

Пример front matter:

```toml
+++
title = "My post"
date = 2026-03-06T12:00:00Z
cover = "cover.jpg"
+++
```

Можно также использовать изображения из `static/`:

```toml
+++
image = "/images/my-cover.jpg"
+++
```

### Режимы превью

`list_preview_mode` управляет тем, что показывается в списке постов:

- `plain` или пусто: cover image плюс обрезанный plain-text preview
- `rich`: HTML-превью из `.Summary`, обычно все до `<!--more-->`
- `full`: весь `.Content`, даже если `<!--more-->` нет

`Read more` показывается только если пост усечен и режим превью не `full`.

Пример `rich`-поста:

```toml
+++
title = "My post"
list_preview_mode = "rich"
+++
```

```md
Первые две или три фразы анонса.

![Альтернативный текст](hutava.png "Хутава!")

<!--more-->

Дальше идет остальной текст поста.
```

Пример `full`-поста:

```toml
+++
title = "Демо-пост с изображением"
list_preview_mode = "full"
+++
```

## Изображения и галереи

### Обычные изображения

Markdown-изображения рендерятся как `figure` и `figcaption`, получают `loading="lazy"` и `decoding="async"`, а локальные page bundle files резолвятся через Hugo Page Resources.

Рекомендуемая структура:

```text
content/posts/my-post/
  index.md
  cover.jpg
  screenshot.png
```

Пример Markdown:

```md
![Альтернативный текст](cover.jpg "Подпись к изображению")
```

Статические и внешние пути тоже работают:

```md
![Пример](/images/example.jpg "Подпись")
![Remote image](https://example.com/image.jpg)
```

`alt` берется из `[]`, подпись — из title изображения.

Подписи поддерживают Markdown, поэтому ссылки в них работают:

```md
![Альтернативный текст](cover.jpg "[Источник](https://example.com)")
```

### Lightbox

Тема локально включает [PhotoSwipe](https://photoswipe.com/) в `static/vendor/photoswipe/`.

Поддерживается:

- клик по обычному изображению в посте открывает его во весь экран
- клик по изображению внутри `album` открывает fullscreen gallery
- работают keyboard navigation, arrows, swipe и close controls

Page-bundle изображения передают размеры на этапе сборки. Внешние изображения измеряются в браузере после загрузки.

### Twemoji

Тема поддерживает рендеринг emoji через `jdecked/twemoji`.

Поведение:

- `static/js/site/twemoji.js` сканирует текстовые узлы после `DOMContentLoaded`
- CDN-версия Twemoji загружается лениво и только если на странице действительно есть emoji
- зоны `pre`, `code`, `kbd` и `samp` пропускаются
- emoji-изображения получают общий класс `.emoji` для inline-выравнивания

### Album Carousel

Используйте публичный shortcode `album`, чтобы рендерить inline-карусель с миниатюрами:

```md
{{< album >}}
![Фото 1](one.jpg "Подпись 1")
![Фото 2](two.jpg "Подпись 2")
![Фото 3](three.jpg "Подпись 3")
{{< /album >}}
```

По возможности используйте его внутри page bundle:

```text
content/posts/my-post/
  index.md
  one.jpg
  two.jpg
  three.jpg
```

Внутри `album` используйте только изображения. Подписи берутся из title каждой Markdown-картинки.

Поведение альбома:

- сверху показывается основное изображение
- кнопки навигации стоят в одной строке с миниатюрами: `← [превью] →`
- клик по основному изображению открывает PhotoSwipe
- на viewport альбома работает touch swipe

## Параметры темы

### Header Link

```toml
[params.headerLink]
  name = "Контакты"
  url = "/contacts/"
```

### Footer Text

`footerText` поддерживает Markdown и многострочные значения:

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

Поддерживаются и `name/url`, и `title/URL`.

### Текст после списка постов

```toml
[params]
  postListEndingText = "Ваш текст после списка постов"
```

### Лимит plain preview

```toml
[params]
  previewPlainLimit = 360
```

Используется режимом `plain` и задает максимальную длину excerpt в списках.

### Цвета темы

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

Эти значения напрямую мапятся в CSS-переменные темы, поэтому палитру можно менять без правки `base.css`.

### Шрифты темы

```toml
[params.themeFonts]
  googleFontsURL = "https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&family=Fira+Code:wght@400;500;700&display=swap"
  body = "\"Nunito\", sans-serif"
  code = "\"Fira Code\", monospace"
```

`body` используется для основного текста сайта. `code` используется для inline code и code blocks. Из конфига можно переопределить и import URL, и итоговые `font-family` значения.

### Layout темы

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

Эти значения питают внутренние responsive/layout tokens, которые используются в `base.css`, `posts.css` и `media.css`. Этот блок нужен, если вы хотите подстроить ширины, размеры медиа и миниатюр без правки исходных CSS-файлов.
