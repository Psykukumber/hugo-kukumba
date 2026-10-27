(function () {
  var toggle = document.querySelector("[data-theme-toggle]");

  if (!toggle || !window.kukumbaTheme) {
    return;
  }

  var buttons = toggle.querySelectorAll("[data-theme-value]");

  function sync() {
    var current = window.kukumbaTheme.get();

    Array.prototype.forEach.call(buttons, function (button) {
      button.setAttribute("aria-pressed", String(button.getAttribute("data-theme-value") === current));
    });
  }

  Array.prototype.forEach.call(buttons, function (button) {
    button.addEventListener("click", function () {
      window.kukumbaTheme.set(button.getAttribute("data-theme-value"));
      sync();
    });
  });

  // The switcher is hidden in markup so it never shows up without JavaScript.
  toggle.hidden = false;
  sync();
})();
