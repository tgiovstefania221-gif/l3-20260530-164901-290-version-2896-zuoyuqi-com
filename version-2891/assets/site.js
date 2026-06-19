document.addEventListener("DOMContentLoaded", function () {
  initMenu();
  initHero();
  initFilters();
  initPlayer();
  initSearchPage();
});

function initMenu() {
  var button = document.querySelector(".menu-toggle");
  var panel = document.querySelector(".mobile-panel");
  if (!button || !panel) {
    return;
  }
  button.addEventListener("click", function () {
    panel.classList.toggle("open");
  });
}

function initHero() {
  var hero = document.querySelector("[data-hero]");
  if (!hero) {
    return;
  }
  var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dots button"));
  if (!slides.length) {
    return;
  }
  var index = 0;
  function show(next) {
    index = (next + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle("active", i === index);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle("active", i === index);
    });
  }
  dots.forEach(function (dot, i) {
    dot.addEventListener("click", function () {
      show(i);
    });
  });
  show(0);
  window.setInterval(function () {
    show(index + 1);
  }, 5600);
}

function initFilters() {
  var cards = Array.prototype.slice.call(document.querySelectorAll(".js-card"));
  var buttons = Array.prototype.slice.call(document.querySelectorAll(".filter-btn"));
  var input = document.querySelector(".filter-input");
  if (!cards.length || (!buttons.length && !input)) {
    return;
  }
  var state = { year: "all", region: "all", keyword: "" };
  function apply() {
    cards.forEach(function (card) {
      var yearOk = state.year === "all" || card.dataset.year === state.year;
      var regionOk = state.region === "all" || card.dataset.region === state.region;
      var keyword = (card.dataset.title + " " + card.dataset.genre + " " + card.dataset.category).toLowerCase();
      var keywordOk = !state.keyword || keyword.indexOf(state.keyword) !== -1;
      card.style.display = yearOk && regionOk && keywordOk ? "" : "none";
    });
  }
  buttons.forEach(function (button) {
    button.addEventListener("click", function () {
      var name = button.dataset.filterName;
      var value = button.dataset.filterValue;
      state[name] = value;
      buttons.filter(function (item) {
        return item.dataset.filterName === name;
      }).forEach(function (item) {
        item.classList.toggle("active", item === button);
      });
      apply();
    });
  });
  if (input) {
    input.addEventListener("input", function () {
      state.keyword = input.value.trim().toLowerCase();
      apply();
    });
  }
}

function initPlayer() {
  var boxes = Array.prototype.slice.call(document.querySelectorAll(".video-box"));
  boxes.forEach(function (box) {
    var video = box.querySelector("video");
    var button = box.querySelector(".play-button");
    var cover = box.querySelector(".video-cover");
    if (!video || !button) {
      return;
    }
    var attached = false;
    function attach() {
      if (attached) {
        return Promise.resolve();
      }
      attached = true;
      var src = video.dataset.src;
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true });
        hls.loadSource(src);
        hls.attachMedia(video);
        return new Promise(function (resolve) {
          hls.on(window.Hls.Events.MANIFEST_PARSED, resolve);
          window.setTimeout(resolve, 1200);
        });
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
        return Promise.resolve();
      }
      video.src = src;
      return Promise.resolve();
    }
    function play() {
      attach().then(function () {
        if (cover) {
          cover.classList.add("hidden");
        }
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {});
        }
      });
    }
    button.addEventListener("click", play);
    cover.addEventListener("click", play);
    video.addEventListener("play", function () {
      if (cover) {
        cover.classList.add("hidden");
      }
    });
  });
}

function initSearchPage() {
  var container = document.querySelector("#search-results");
  var form = document.querySelector("#search-form");
  var input = document.querySelector("#search-query");
  if (!container || !form || !input || !window.SEARCH_MOVIES) {
    return;
  }
  var params = new URLSearchParams(window.location.search);
  input.value = params.get("q") || "";
  function render() {
    var q = input.value.trim().toLowerCase();
    var items = window.SEARCH_MOVIES.filter(function (item) {
      var haystack = [item.title, item.year, item.region, item.genre, item.category].join(" ").toLowerCase();
      return !q || haystack.indexOf(q) !== -1;
    }).slice(0, 120);
    if (!items.length) {
      container.innerHTML = '<div class="empty-state">没有匹配到影片，可以换一个关键词继续搜索。</div>';
      return;
    }
    container.innerHTML = '<div class="movie-grid">' + items.map(function (item) {
      return '<a class="movie-card" href="' + item.url + '">' +
        '<div class="poster-wrap"><img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy"><span class="duration">' + item.duration + '</span><span class="play-hover">▶</span></div>' +
        '<div class="card-body"><h3>' + escapeHtml(item.title) + '</h3><p class="card-meta">' + escapeHtml(item.year + ' · ' + item.region + ' · ' + item.category) + '</p><p>' + escapeHtml(item.desc) + '</p></div>' +
        '</a>';
    }).join("") + '</div>';
  }
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var url = new URL(window.location.href);
    url.searchParams.set("q", input.value.trim());
    window.history.replaceState({}, "", url.toString());
    render();
  });
  input.addEventListener("input", render);
  render();
}

function escapeHtml(text) {
  return String(text || "").replace(/[&<>'"]/g, function (char) {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      '"': "&quot;"
    }[char];
  });
}
