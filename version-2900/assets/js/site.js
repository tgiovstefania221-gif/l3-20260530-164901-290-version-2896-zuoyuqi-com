(function () {
  function getBase() {
    return document.body ? document.body.getAttribute("data-base") || "" : "";
  }

  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  var toggle = qs("[data-nav-toggle]");
  var menu = qs("[data-nav-menu]");
  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      menu.classList.toggle("open");
    });
  }

  var slides = qsa("[data-hero-slide]");
  var dots = qsa("[data-hero-dot]");
  if (slides.length > 1) {
    var active = 0;
    var showSlide = function (index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === active);
      });
    };
    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
      });
    });
    setInterval(function () {
      showSlide(active + 1);
    }, 5200);
    showSlide(0);
  }

  function resultMeta(item) {
    return [item.year, item.region, item.type, item.genre].filter(Boolean).join(" · ");
  }

  function renderSearchPanel(input, panel) {
    var query = input.value.trim().toLowerCase();
    var base = getBase();
    panel.innerHTML = "";
    if (!query || !window.MOVIE_INDEX) {
      panel.classList.remove("open");
      return;
    }
    var hits = window.MOVIE_INDEX.filter(function (item) {
      return (item.title + " " + item.region + " " + item.type + " " + item.genre + " " + item.year).toLowerCase().indexOf(query) !== -1;
    }).slice(0, 8);
    if (!hits.length) {
      panel.innerHTML = '<span class="search-hit"><strong>没有找到相关影片</strong><span>换一个关键词试试</span></span>';
      panel.classList.add("open");
      return;
    }
    panel.innerHTML = hits.map(function (item) {
      return '<a class="search-hit" href="' + base + item.href + '"><strong>' + item.title + '</strong><span>' + resultMeta(item) + '</span></a>';
    }).join("");
    panel.classList.add("open");
  }

  qsa("[data-search-box]").forEach(function (input) {
    var form = input.closest("form");
    var panel = form ? qs("[data-search-panel]", form) : null;
    if (panel) {
      input.addEventListener("input", function () {
        renderSearchPanel(input, panel);
      });
      document.addEventListener("click", function (event) {
        if (!form.contains(event.target)) {
          panel.classList.remove("open");
        }
      });
    }
  });

  function renderSearchPage() {
    var root = qs("[data-search-results]");
    var input = qs("[data-search-page-input]");
    if (!root || !window.MOVIE_INDEX) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    if (input) {
      input.value = query;
    }
    var normalized = query.trim().toLowerCase();
    if (!normalized) {
      root.innerHTML = '<div class="content-card"><p>输入影片标题、地区、年份或类型即可搜索片库内容。</p></div>';
      return;
    }
    var base = getBase();
    var hits = window.MOVIE_INDEX.filter(function (item) {
      return (item.title + " " + item.region + " " + item.type + " " + item.genre + " " + item.year).toLowerCase().indexOf(normalized) !== -1;
    }).slice(0, 80);
    if (!hits.length) {
      root.innerHTML = '<div class="content-card"><p>没有找到相关影片。</p></div>';
      return;
    }
    root.innerHTML = hits.map(function (item) {
      return '<a class="search-result-card" href="' + base + item.href + '"><img src="' + base + item.cover + '.jpg" alt="' + item.title + '"><span><strong>' + item.title + '</strong><em>' + resultMeta(item) + '</em><p>' + item.one_line + '</p></span></a>';
    }).join("");
  }

  renderSearchPage();
})();
