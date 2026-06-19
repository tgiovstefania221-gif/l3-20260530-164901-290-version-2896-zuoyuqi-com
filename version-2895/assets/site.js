(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var menuButton = document.querySelector(".menu-toggle");
    var mobileMenu = document.querySelector(".mobile-menu");

    if (menuButton && mobileMenu) {
      menuButton.addEventListener("click", function () {
        var open = mobileMenu.classList.toggle("is-open");
        menuButton.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }

    var hero = document.querySelector(".hero-slider");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
      var current = 0;
      var timer = null;

      function show(index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === current);
        });
      }

      function start() {
        stop();
        timer = window.setInterval(function () {
          show(current + 1);
        }, 5200);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
        }
      }

      var prev = hero.querySelector(".hero-prev");
      var next = hero.querySelector(".hero-next");

      if (prev) {
        prev.addEventListener("click", function () {
          show(current - 1);
          start();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(current + 1);
          start();
        });
      }

      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          show(index);
          start();
        });
      });

      start();
    }

    document.querySelectorAll(".content-section").forEach(function (section) {
      var rail = section.querySelector(".movie-rail");
      var prev = section.querySelector(".rail-prev");
      var next = section.querySelector(".rail-next");

      if (!rail) {
        return;
      }

      if (prev) {
        prev.addEventListener("click", function () {
          rail.scrollBy({ left: -420, behavior: "smooth" });
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          rail.scrollBy({ left: 420, behavior: "smooth" });
        });
      }
    });

    var pageSearch = document.getElementById("page-search");
    if (pageSearch) {
      var params = new URLSearchParams(window.location.search);
      var q = params.get("q") || "";
      pageSearch.value = q;
    }

    setupFilters();
  });

  function setupFilters() {
    var grids = document.querySelectorAll(".filter-grid");
    if (!grids.length) {
      return;
    }

    var textInput = document.querySelector(".local-filter-input");
    var selects = Array.prototype.slice.call(document.querySelectorAll(".local-filter-select"));
    var noResults = document.querySelector(".no-results");

    function normalize(value) {
      return String(value || "").toLowerCase().trim();
    }

    function apply() {
      var query = normalize(textInput ? textInput.value : "");
      var shown = 0;

      grids.forEach(function (grid) {
        Array.prototype.slice.call(grid.querySelectorAll(".movie-card")).forEach(function (card) {
          var keywords = normalize(card.getAttribute("data-keywords"));
          var ok = !query || keywords.indexOf(query) !== -1;

          selects.forEach(function (select) {
            var key = select.getAttribute("data-filter-type");
            var value = normalize(select.value);
            if (value && normalize(card.getAttribute("data-" + key)) !== value) {
              ok = false;
            }
          });

          card.classList.toggle("is-hidden", !ok);
          if (ok) {
            shown += 1;
          }
        });
      });

      if (noResults) {
        noResults.classList.toggle("is-visible", shown === 0);
      }
    }

    if (textInput) {
      textInput.addEventListener("input", apply);
    }

    selects.forEach(function (select) {
      select.addEventListener("change", apply);
    });

    apply();
  }
})();

function initPlayer(url) {
  var video = document.querySelector(".player-video");
  var cover = document.querySelector(".player-cover");

  if (!video || !url) {
    return;
  }

  function play() {
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      if (video.getAttribute("src") !== url) {
        video.setAttribute("src", url);
      }
      var nativeStart = function () {
        video.play().catch(function () {});
      };
      if (video.readyState >= 1) {
        nativeStart();
      } else {
        video.addEventListener("loadedmetadata", nativeStart, { once: true });
      }
    } else if (window.Hls && window.Hls.isSupported()) {
      if (!video.hlsInstance) {
        var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        video.hlsInstance = hls;
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
      } else {
        video.play().catch(function () {});
      }
    } else {
      if (video.getAttribute("src") !== url) {
        video.setAttribute("src", url);
      }
      video.play().catch(function () {});
    }

    video.controls = true;
    if (cover) {
      cover.classList.add("is-hidden");
    }
  }

  if (cover) {
    cover.addEventListener("click", play);
  }

  video.addEventListener("click", function () {
    if (video.paused) {
      play();
    }
  });
}
