(function () {
  document.querySelectorAll("[data-soon]").forEach(function (link) {
    link.addEventListener("click", function (event) {
      event.preventDefault();
    });
  });

  var navLinks = Array.prototype.slice.call(
    document.querySelectorAll(".side-nav a[href^='#']")
  );
  var sections = navLinks
    .filter(function (link) {
      return !link.hasAttribute("data-soon");
    })
    .map(function (link) {
      var id = link.getAttribute("href").slice(1);
      return { id: id, link: link, el: document.getElementById(id) };
    })
    .filter(function (item) {
      return item.el;
    });

  function setActive(id) {
    navLinks.forEach(function (link) {
      var on = link.getAttribute("href") === "#" + id;
      link.classList.toggle("is-active", on);
      if (on) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
  }

  function onScroll() {
    var marker = 120;
    var active = "accueil";
    sections.forEach(function (item) {
      if (item.el.getBoundingClientRect().top - marker <= 0) active = item.id;
    });
    setActive(active);
  }

  if (document.getElementById("accueil")) {
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  var feedSearch = document.querySelector("[data-feed-search]");
  var feedList = document.querySelector("[data-feed-list]");
  if (feedSearch && feedList) {
    var feedItems = Array.prototype.slice.call(
      feedList.querySelectorAll("[data-feed-item]")
    );
    var feedEmpty = feedList.querySelector("[data-feed-empty]");
    feedSearch.addEventListener("input", function () {
      var query = feedSearch.value.trim().toLowerCase();
      var shown = 0;
      feedItems.forEach(function (item) {
        var match = item.textContent.toLowerCase().indexOf(query) !== -1;
        item.hidden = !match;
        if (match) shown += 1;
      });
      if (feedEmpty) feedEmpty.hidden = shown !== 0;
    });
  }

  var panel = document.getElementById("reflexes");
  var track = panel && panel.querySelector(".reflex-track");
  var windowEl = panel && panel.querySelector(".reflex-window");
  var live = panel && panel.querySelector(".reflex-live");
  if (!panel || !track || !windowEl) return;

  var slides = Array.prototype.slice.call(track.querySelectorAll(".reflex-slide"));
  var realCount = slides.length - 1;
  var index = 0;
  var timer = null;
  var delay = 3500;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function height() {
    return windowEl.clientHeight;
  }

  function layout(animate) {
    var h = height();
    if (!h) return;
    slides.forEach(function (slide) {
      slide.style.height = h + "px";
    });
    track.style.transition = animate && !reduced ? "transform 0.6s ease" : "none";
    track.style.transform = "translateY(-" + index * h + "px)";
  }

  function announce() {
    if (!live) return;
    var shown = index >= realCount ? 0 : index;
    live.textContent = slides[shown].innerText.replace(/\s+/g, " ").trim();
  }

  function next() {
    index += 1;
    layout(true);
    announce();
  }

  track.addEventListener("transitionend", function (event) {
    if (event.propertyName !== "transform") return;
    if (index >= realCount) {
      index = 0;
      layout(false);
    }
  });

  function start() {
    if (reduced || timer) return;
    timer = window.setInterval(next, delay);
  }

  function stop() {
    window.clearInterval(timer);
    timer = null;
  }

  panel.addEventListener("mouseenter", stop);
  panel.addEventListener("mouseleave", start);
  panel.addEventListener("focusin", stop);
  panel.addEventListener("focusout", function (event) {
    if (!panel.contains(event.relatedTarget)) start();
  });

  if (typeof ResizeObserver !== "undefined") {
    var observer = new ResizeObserver(function () {
      layout(false);
    });
    observer.observe(windowEl);
  } else {
    window.addEventListener("resize", function () {
      layout(false);
    });
  }

  layout(false);
  start();
})();
