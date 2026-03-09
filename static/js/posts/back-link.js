document.addEventListener("DOMContentLoaded", function () {
  // Use browser history only when the user came from another page on the same site.
  var backLink = document.querySelector(".post-back-link");
  if (!backLink || !document.referrer) return;

  try {
    var referrerUrl = new URL(document.referrer);
    if (referrerUrl.origin !== window.location.origin) return;

    backLink.addEventListener("click", function (event) {
      event.preventDefault();
      window.history.back();
    });
  } catch (error) {
  }
});
