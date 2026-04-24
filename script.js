const menuToggle = document.getElementById("menuToggle");
const siteNav = document.getElementById("siteNav");
const navLinks = siteNav ? siteNav.querySelectorAll("a") : [];

if (menuToggle && siteNav) {
  menuToggle.addEventListener("click", () => {
    const expanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!expanded));
    siteNav.classList.toggle("open");
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      siteNav.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}

const yearNode = document.getElementById("year");
if (yearNode) {
  yearNode.textContent = String(new Date().getFullYear());
}

const pageSections = Array.from(document.querySelectorAll("main .page-section"));
if (pageSections.length) {
  document.body.classList.add("fullpage-mode");

  let activeSectionIndex = 0;
  let navLocked = false;
  let touchStartY = 0;
  let touchDeltaY = 0;
  const navLockMs = 430;

  const findSectionIndexByHash = (hash) => {
    if (!hash || hash === "#top") return 0;
    const id = hash.replace("#", "");
    const idx = pageSections.findIndex((section) => section.id === id);
    return idx >= 0 ? idx : 0;
  };

  const setActiveSection = (idx, updateHash = true) => {
    const nextIdx = Math.max(0, Math.min(pageSections.length - 1, idx));
    activeSectionIndex = nextIdx;
    pageSections.forEach((section, sectionIdx) => {
      section.classList.toggle("is-active", sectionIdx === activeSectionIndex);
    });

    if (!updateHash) return;
    const activeId = pageSections[activeSectionIndex].id;
    const hash = activeId ? `#${activeId}` : "#top";
    window.history.replaceState(null, "", hash);
  };

  const moveSection = (direction) => {
    if (navLocked) return;
    const nextIdx = activeSectionIndex + direction;
    if (nextIdx < 0 || nextIdx >= pageSections.length) return;
    navLocked = true;
    setActiveSection(nextIdx, true);
    window.setTimeout(() => {
      navLocked = false;
    }, navLockMs);
  };

  setActiveSection(findSectionIndexByHash(window.location.hash), true);

  window.addEventListener(
    "wheel",
    (event) => {
      if (event.target && event.target.closest("[data-carousel]")) return;
      if (Math.abs(event.deltaY) < 12) return;
      event.preventDefault();
      moveSection(event.deltaY > 0 ? 1 : -1);
    },
    { passive: false }
  );

  window.addEventListener("keydown", (event) => {
    if (event.defaultPrevented) return;
    if (event.target && ["INPUT", "TEXTAREA", "SELECT"].includes(event.target.tagName)) return;
    if (event.key === "ArrowDown" || event.key === "PageDown") {
      event.preventDefault();
      moveSection(1);
    } else if (event.key === "ArrowUp" || event.key === "PageUp") {
      event.preventDefault();
      moveSection(-1);
    } else if (event.key === "Home") {
      event.preventDefault();
      setActiveSection(0, true);
    } else if (event.key === "End") {
      event.preventDefault();
      setActiveSection(pageSections.length - 1, true);
    }
  });

  window.addEventListener(
    "touchstart",
    (event) => {
      if (!event.touches.length) return;
      touchStartY = event.touches[0].clientY;
      touchDeltaY = 0;
    },
    { passive: true }
  );

  window.addEventListener(
    "touchmove",
    (event) => {
      if (!event.touches.length) return;
      touchDeltaY = event.touches[0].clientY - touchStartY;
    },
    { passive: true }
  );

  window.addEventListener("touchend", () => {
    if (Math.abs(touchDeltaY) < 45) return;
    moveSection(touchDeltaY < 0 ? 1 : -1);
    touchDeltaY = 0;
  });

  const hashLinks = document.querySelectorAll('a[href^="#"]');
  hashLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");
      if (!href) return;
      event.preventDefault();
      setActiveSection(findSectionIndexByHash(href), true);
    });
  });
}

const carousels = document.querySelectorAll("[data-carousel]");
carousels.forEach((carousel) => {
  const track = carousel.querySelector(".carousel-track");
  const slides = track ? track.querySelectorAll(".carousel-slide") : [];
  const buttons = carousel.querySelectorAll(".carousel-btn");
  if (!track || !slides.length || !buttons.length) return;

  let index = 0;
  const max = slides.length;
  const intervalMs = 3500;
  let timerId = null;
  let paused = false;
  let pointerDown = false;
  let dragStartX = 0;
  let dragDeltaX = 0;

  const render = () => {
    // Always move exactly one visible carousel width per step.
    const slideWidth = carousel.clientWidth;
    track.style.transform = `translateX(-${index * slideWidth}px)`;
  };

  const next = (dir = 1) => {
    index = (index + dir + max) % max;
    render();
  };

  const startAuto = () => {
    if (timerId !== null) return;
    timerId = window.setInterval(() => {
      if (!paused) next(1);
    }, intervalMs);
  };

  const stopAuto = () => {
    if (timerId === null) return;
    window.clearInterval(timerId);
    timerId = null;
  };

  const pause = () => {
    paused = true;
  };

  const resume = () => {
    paused = false;
  };

  const dragThresholdPx = 50;

  const onDragStart = (clientX) => {
    pointerDown = true;
    dragStartX = clientX;
    dragDeltaX = 0;
    pause();
  };

  const onDragMove = (clientX) => {
    if (!pointerDown) return;
    dragDeltaX = clientX - dragStartX;
  };

  const onDragEnd = () => {
    if (!pointerDown) return;
    pointerDown = false;
    if (Math.abs(dragDeltaX) > dragThresholdPx) {
      // Drag left -> next slide, drag right -> previous slide
      next(dragDeltaX < 0 ? 1 : -1);
    }
    dragDeltaX = 0;
    resume();
  };

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const dir = Number(button.getAttribute("data-dir") || "1");
      next(dir);
    });
  });

  carousel.addEventListener("mouseenter", pause);
  carousel.addEventListener("mouseleave", resume);
  carousel.addEventListener("focusin", pause);
  carousel.addEventListener("focusout", resume);
  carousel.addEventListener("touchstart", pause, { passive: true });
  carousel.addEventListener("touchend", resume);
  carousel.addEventListener("touchcancel", resume);

  carousel.addEventListener("mousedown", (event) => onDragStart(event.clientX));
  window.addEventListener("mousemove", (event) => onDragMove(event.clientX));
  window.addEventListener("mouseup", onDragEnd);
  carousel.addEventListener("mouseleave", onDragEnd);

  carousel.addEventListener(
    "touchstart",
    (event) => {
      if (!event.touches.length) return;
      onDragStart(event.touches[0].clientX);
    },
    { passive: true }
  );
  carousel.addEventListener(
    "touchmove",
    (event) => {
      if (!event.touches.length) return;
      onDragMove(event.touches[0].clientX);
    },
    { passive: true }
  );
  carousel.addEventListener("touchend", onDragEnd);
  carousel.addEventListener("touchcancel", onDragEnd);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopAuto();
    } else {
      startAuto();
    }
  });

  window.addEventListener("resize", render);
  render();
  startAuto();
});
