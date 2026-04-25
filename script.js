const menuToggle = document.getElementById("menuToggle");
const siteNav = document.getElementById("siteNav");
const yearEl = document.getElementById("year");

if (yearEl) {
  yearEl.textContent = String(new Date().getFullYear());
}

if (menuToggle && siteNav) {
  menuToggle.addEventListener("click", () => {
    const expanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", expanded ? "false" : "true");
    siteNav.classList.toggle("open", !expanded);
  });

  siteNav.querySelectorAll("a[href^='#']").forEach((link) => {
    link.addEventListener("click", () => {
      menuToggle.setAttribute("aria-expanded", "false");
      siteNav.classList.remove("open");
    });
  });
}
