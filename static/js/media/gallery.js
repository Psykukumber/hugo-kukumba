import PhotoSwipeLightbox from "../../vendor/photoswipe/photoswipe-lightbox.esm.js";

// PhotoSwipe core is loaded lazily only when a lightbox is opened.
var pswpModule = () => import("../../vendor/photoswipe/photoswipe.esm.js");

function ensurePhotoSwipeDimensions(root) {
  var links = root.querySelectorAll(".post-image-link");

  links.forEach(function (link) {
    if (link.dataset.pswpWidth && link.dataset.pswpHeight) {
      return;
    }

    var image = link.querySelector("img");
    if (!image) {
      return;
    }

    // External images do not expose dimensions at build time, so we fill them after load.
    function applyDimensions() {
      if (!image.naturalWidth || !image.naturalHeight) {
        return;
      }

      link.dataset.pswpWidth = String(image.naturalWidth);
      link.dataset.pswpHeight = String(image.naturalHeight);
    }

    if (image.complete) {
      applyDimensions();
    } else {
      image.addEventListener("load", applyDimensions, { once: true });
    }
  });
}

function initLightbox(gallery, children) {
  var lightbox = new PhotoSwipeLightbox({
    gallery: gallery,
    children: children,
    pswpModule: pswpModule
  });

  lightbox.init();
}

function formatAlbumLabel(template, index) {
  if (!template) {
    return String(index);
  }

  return template.replace("%d", String(index));
}

function collectAlbumSlides(track) {
  return Array.prototype.filter.call(track.children, function (node) {
    return node.nodeType === 1;
  });
}

function markAlbumSlides(slides) {
  slides.forEach(function (slide, index) {
    slide.classList.add("post-album-slide");
    slide.setAttribute("data-album-slide", String(index));
  });
}

function updateAlbumState(track, slides, thumbsRoot, currentIndex) {
  track.style.transform = "translateX(-" + currentIndex * 100 + "%)";

  slides.forEach(function (slide, index) {
    slide.setAttribute("aria-hidden", index === currentIndex ? "false" : "true");
  });

  if (!thumbsRoot) {
    return;
  }

  Array.prototype.forEach.call(thumbsRoot.children, function (thumb, index) {
    thumb.setAttribute("aria-current", index === currentIndex ? "true" : "false");
  });

  var activeThumb = thumbsRoot.children[currentIndex];
  if (activeThumb) {
    var thumbLeft = activeThumb.offsetLeft;
    var thumbRight = thumbLeft + activeThumb.offsetWidth;
    var visibleLeft = thumbsRoot.scrollLeft;
    var visibleRight = visibleLeft + thumbsRoot.clientWidth;

    if (thumbLeft < visibleLeft) {
      thumbsRoot.scrollTo({ left: thumbLeft, behavior: "smooth" });
    } else if (thumbRight > visibleRight) {
      thumbsRoot.scrollTo({
        left: thumbRight - thumbsRoot.clientWidth,
        behavior: "smooth"
      });
    }
  }
}

function syncThumbOverflowState(thumbsRoot) {
  if (!thumbsRoot) {
    return;
  }

  thumbsRoot.classList.toggle(
    "is-overflowing",
    thumbsRoot.scrollWidth > thumbsRoot.clientWidth + 1
  );
}

function bindThumbOverflowTracking(thumbsRoot) {
  if (!thumbsRoot) {
    return;
  }

  syncThumbOverflowState(thumbsRoot);

  if (typeof ResizeObserver === "function") {
    new ResizeObserver(function () {
      syncThumbOverflowState(thumbsRoot);
    }).observe(thumbsRoot);
    return;
  }

  window.addEventListener("resize", function () {
    syncThumbOverflowState(thumbsRoot);
  });
}

function buildAlbumThumb(slide, index, labelTemplate, onSelect) {
  var slideLink = slide.querySelector(".post-image-link");
  var slideImage = slide.querySelector("img");
  var thumb = document.createElement("button");

  thumb.type = "button";
  thumb.className = "post-album-thumb";
  thumb.setAttribute("aria-label", formatAlbumLabel(labelTemplate, index + 1));

  if (slideImage) {
    var thumbImage = document.createElement("img");

    // Prefer a generated Hugo thumbnail to avoid decoding the full image in the thumb strip.
    thumbImage.src =
      (slideLink && slideLink.dataset.thumbSrc) ||
      slideImage.currentSrc ||
      slideImage.src;
    thumbImage.alt = slideImage.alt || "";
    thumbImage.loading = "lazy";
    thumbImage.decoding = "async";
    thumb.appendChild(thumbImage);
  } else {
    thumb.textContent = String(index + 1);
  }

  thumb.addEventListener("click", onSelect);
  return thumb;
}

function watchThumbImage(thumb, thumbsRoot) {
  var thumbImage = thumb.querySelector("img");

  if (!thumbImage) {
    syncThumbOverflowState(thumbsRoot);
    return;
  }

  if (thumbImage.complete) {
    syncThumbOverflowState(thumbsRoot);
    return;
  }

  thumbImage.addEventListener("load", function () {
    syncThumbOverflowState(thumbsRoot);
  }, { once: true });

  thumbImage.addEventListener("error", function () {
    syncThumbOverflowState(thumbsRoot);
  }, { once: true });
}

function appendAlbumThumbs(slides, thumbsRoot, labelTemplate, goTo) {
  if (!thumbsRoot) {
    return;
  }

  slides.forEach(function (slide, index) {
    var thumb = buildAlbumThumb(slide, index, labelTemplate, function () {
      goTo(index);
    });

    thumbsRoot.appendChild(thumb);
    watchThumbImage(thumb, thumbsRoot);
  });
}

function bindAlbumControls(prevButton, nextButton, goTo, getCurrentIndex) {
  if (prevButton) {
    prevButton.addEventListener("click", function () {
      goTo(getCurrentIndex() - 1);
    });
  }

  if (nextButton) {
    nextButton.addEventListener("click", function () {
      goTo(getCurrentIndex() + 1);
    });
  }
}

function bindAlbumSwipe(viewport, goTo, getCurrentIndex) {
  if (!viewport) {
    return;
  }

  var startX = 0;
  var startY = 0;
  var isDragging = false;
  var swipeThreshold = 40;
  var verticalTolerance = 30;

  function reset() {
    startX = 0;
    startY = 0;
    isDragging = false;
  }

  function onStart(clientX, clientY) {
    startX = clientX;
    startY = clientY;
    isDragging = true;
  }

  function onEnd(clientX, clientY) {
    if (!isDragging) {
      return;
    }

    var deltaX = clientX - startX;
    var deltaY = clientY - startY;

    reset();

    if (Math.abs(deltaY) > verticalTolerance || Math.abs(deltaX) < swipeThreshold) {
      return;
    }

    if (deltaX > 0) {
      goTo(getCurrentIndex() - 1);
    } else {
      goTo(getCurrentIndex() + 1);
    }
  }

  if (window.PointerEvent) {
    viewport.style.touchAction = "pan-y";
    viewport.addEventListener("pointerdown", function (event) {
      if (event.pointerType === "mouse" && event.button !== 0) {
        return;
      }

      onStart(event.clientX, event.clientY);
    });
    viewport.addEventListener("pointerup", function (event) {
      onEnd(event.clientX, event.clientY);
    });
    viewport.addEventListener("pointercancel", reset);
    return;
  }

  viewport.addEventListener("touchstart", function (event) {
    var touch = event.changedTouches[0];
    if (!touch) {
      return;
    }

    onStart(touch.clientX, touch.clientY);
  }, { passive: true });

  viewport.addEventListener("touchend", function (event) {
    var touch = event.changedTouches[0];
    if (!touch) {
      return;
    }

    onEnd(touch.clientX, touch.clientY);
  }, { passive: true });

  viewport.addEventListener("touchcancel", reset, { passive: true });
}

function initAlbum(album) {
  var track = album.querySelector(".post-album-track");
  var slides = collectAlbumSlides(track);

  if (slides.length === 0) {
    return;
  }

  markAlbumSlides(slides);
  ensurePhotoSwipeDimensions(album);

  var prevButton = album.querySelector("[data-album-prev]");
  var nextButton = album.querySelector("[data-album-next]");
  var viewport = album.querySelector("[data-album-viewport]");
  var thumbsRoot = album.querySelector("[data-album-thumbs]");
  var thumbLabelTemplate = album.dataset.thumbAriaLabelTemplate;
  var currentIndex = 0;

  function render() {
    updateAlbumState(track, slides, thumbsRoot, currentIndex);
  }

  function goTo(index) {
    if (index < 0) {
      currentIndex = slides.length - 1;
    } else if (index >= slides.length) {
      currentIndex = 0;
    } else {
      currentIndex = index;
    }

    render();
  }

  if (slides.length === 1) {
    if (prevButton) {
      prevButton.hidden = true;
    }

    if (nextButton) {
      nextButton.hidden = true;
    }

    if (thumbsRoot) {
      thumbsRoot.hidden = true;
    }

    slides[0].setAttribute("aria-hidden", "false");
  } else {
    appendAlbumThumbs(slides, thumbsRoot, thumbLabelTemplate, goTo);
    bindThumbOverflowTracking(thumbsRoot);
    bindAlbumControls(prevButton, nextButton, goTo, function () {
      return currentIndex;
    });
    bindAlbumSwipe(viewport, goTo, function () {
      return currentIndex;
    });
  }

  initLightbox(album, ".post-image-link");
  render();
}

function initStandaloneGallery(container) {
  // Standalone images share one gallery per content container; album slides are excluded.
  ensurePhotoSwipeDimensions(container);

  var standaloneLinks = Array.prototype.filter.call(
    container.querySelectorAll(".post-image-link"),
    function (link) {
      return !link.closest("[data-album]");
    }
  );

  if (!standaloneLinks.length) {
    return;
  }

  standaloneLinks.forEach(function (link) {
    link.classList.add("post-image-link-standalone");
  });

  initLightbox(container, ".post-image-link-standalone");
}

document.addEventListener("DOMContentLoaded", function () {
  // Albums are initialized first so nested images are marked before standalone galleries are scanned.
  document.querySelectorAll("[data-album]").forEach(initAlbum);
  document
    .querySelectorAll(".post-body, .post-preview")
    .forEach(initStandaloneGallery);
});
