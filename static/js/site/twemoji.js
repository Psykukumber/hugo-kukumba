// Convert Unicode emoji to Twemoji only in text-focused nodes.
document.addEventListener("DOMContentLoaded", function () {
    // Limit parsing to user-visible text containers instead of walking the whole document.
    var selector = [
        ".site-title",
        ".header-link",
        ".footer-text",
        ".footer-link",
        ".content h1",
        ".content h2",
        ".content h3",
        ".content h4",
        ".content h5",
        ".content h6",
        ".content p",
        ".content li",
        ".content blockquote",
        ".content figcaption",
        ".content .post-read-more"
    ].join(", ");
    var excludedSelector = "pre, code, kbd, samp, script, style, textarea";
    var twemojiScriptUrl = "https://cdn.jsdelivr.net/npm/@twemoji/api@17.0.2/dist/twemoji.min.js";
    var twemojiIntegrity = "sha384-ffx6atwP+2a1uHhw+XT6uAGhdssJviyWfbhOgvzJqE1X+qUM1Aq3mS3WW70vSq6S";
    var parseOptions = {
        folder: "svg",
        ext: ".svg",
        className: "emoji"
    };
    var emojiPattern = /[\u00A9\u00AE\u203C-\u3299\uD83C-\uDBFF\uDC00-\uDFFF]/;
    var targets = Array.prototype.slice.call(document.querySelectorAll(selector));

    function replaceTextNode(textNode) {
        // Twemoji returns HTML only when the text actually contains emoji.
        var parsed = window.twemoji.parse(textNode.nodeValue, parseOptions);

        if (parsed === textNode.nodeValue) {
            return;
        }

        var wrapper = document.createElement("span");
        wrapper.innerHTML = parsed;

        while (wrapper.firstChild) {
            textNode.parentNode.insertBefore(wrapper.firstChild, textNode);
        }

        textNode.parentNode.removeChild(textNode);
    }

    function parseTarget(target) {
        // Walk text nodes so nested code fragments inside paragraphs or list items stay untouched.
        var walker = document.createTreeWalker(target, NodeFilter.SHOW_TEXT, {
            acceptNode: function (node) {
                if (!node.nodeValue || !node.nodeValue.trim()) {
                    return NodeFilter.FILTER_REJECT;
                }

                if (!node.parentElement || node.parentElement.closest(excludedSelector)) {
                    return NodeFilter.FILTER_REJECT;
                }

                return NodeFilter.FILTER_ACCEPT;
            }
        });
        var textNodes = [];

        while (walker.nextNode()) {
            textNodes.push(walker.currentNode);
        }

        textNodes.forEach(replaceTextNode);
    }

    function hasEmojiContent(target) {
        // Avoid loading the CDN runtime at all when there is no emoji on the page.
        var walker = document.createTreeWalker(target, NodeFilter.SHOW_TEXT, {
            acceptNode: function (node) {
                if (!node.nodeValue || !node.nodeValue.trim()) {
                    return NodeFilter.FILTER_REJECT;
                }

                if (!node.parentElement || node.parentElement.closest(excludedSelector)) {
                    return NodeFilter.FILTER_REJECT;
                }

                return emojiPattern.test(node.nodeValue)
                    ? NodeFilter.FILTER_ACCEPT
                    : NodeFilter.FILTER_REJECT;
            }
        });

        return walker.nextNode() !== null;
    }

    function loadTwemoji(callback) {
        if (window.twemoji) {
            callback();
            return;
        }

        // Reuse an existing pending CDN request if another script already created it.
        var existing = document.querySelector('script[data-twemoji-cdn="true"]');

        if (existing) {
            existing.addEventListener("load", callback, { once: true });
            return;
        }

        var script = document.createElement("script");
        script.src = twemojiScriptUrl;
        script.integrity = twemojiIntegrity;
        script.crossOrigin = "anonymous";
        script.defer = true;
        script.dataset.twemojiCdn = "true";
        script.addEventListener("load", callback, { once: true });
        document.head.appendChild(script);
    }

    if (!targets.some(hasEmojiContent)) {
        return;
    }

    // Load Twemoji only on pages that actually need replacement, then parse selected nodes.
    loadTwemoji(function () {
        targets.forEach(parseTarget);
    });
});
