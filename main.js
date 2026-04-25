(function () {
  var y = document.getElementById("year");
  if (y) y.textContent = String(new Date().getFullYear());

  var menuToggle = document.querySelector(".menu-toggle");
  var mobileMenu = document.getElementById("mobile-menu");
  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener("click", function () {
      var open = mobileMenu.classList.toggle("is-open");
      menuToggle.setAttribute("aria-expanded", open ? "true" : "false");
      menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });

    mobileMenu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        mobileMenu.classList.remove("is-open");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Open menu");
      });
    });
  }

  var lightbox = document.getElementById("image-lightbox");
  var lightboxImage = lightbox ? lightbox.querySelector(".lightbox-image") : null;
  var lightboxClose = lightbox ? lightbox.querySelector(".lightbox-close") : null;
  var productImages = document.querySelectorAll(".media-box img");

  function closeLightbox() {
    if (!lightbox || !lightboxImage) return;
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    lightboxImage.src = "";
    lightboxImage.alt = "";
  }

  if (lightbox && lightboxImage && productImages.length) {
    productImages.forEach(function (img) {
      img.addEventListener("click", function () {
        lightboxImage.src = img.src;
        lightboxImage.alt = img.alt || "Expanded product image";
        lightbox.classList.add("is-open");
        lightbox.setAttribute("aria-hidden", "false");
      });
    });

    if (lightboxClose) {
      lightboxClose.addEventListener("click", closeLightbox);
    }

    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeLightbox();
    });
  }

  document.querySelector(".contact-form")?.addEventListener("submit", function (e) {
    e.preventDefault();

    // Update this to your inbox before launch.
    var recipient = "hello@bfyai.in";
    var name = (this.querySelector('input[name="name"]')?.value || "").trim();
    var email = (this.querySelector('input[name="email"]')?.value || "").trim();
    var message = (this.querySelector('textarea[name="message"]')?.value || "").trim();

    var subject = "Website contact from " + (name || "Visitor");
    var bodyLines = [
      "Name: " + (name || "-"),
      "Email: " + (email || "-"),
      "",
      "Message:",
      message || "-"
    ];

    var gmailUrl =
      "https://mail.google.com/mail/?view=cm&fs=1" +
      "&to=" + encodeURIComponent(recipient) +
      "&su=" + encodeURIComponent(subject) +
      "&body=" + encodeURIComponent(bodyLines.join("\n"));

    var popup = window.open(gmailUrl, "_blank", "noopener,noreferrer");

    // If popup is blocked, open Gmail in same tab (no mailto app chooser).
    if (!popup) {
      window.location.href = gmailUrl;
    }
  });
})();
