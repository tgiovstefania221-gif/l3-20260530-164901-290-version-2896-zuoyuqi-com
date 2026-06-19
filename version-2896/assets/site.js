(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var prev = document.querySelector('[data-hero-prev]');
  var next = document.querySelector('[data-hero-next]');
  var current = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('active', i === current);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('active', i === current);
    });
  }

  function startHero() {
    if (slides.length < 2) {
      return;
    }

    timer = window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  function restartHero() {
    if (timer) {
      window.clearInterval(timer);
    }
    startHero();
  }

  if (slides.length) {
    showSlide(0);
    startHero();
  }

  if (prev) {
    prev.addEventListener('click', function () {
      showSlide(current - 1);
      restartHero();
    });
  }

  if (next) {
    next.addEventListener('click', function () {
      showSlide(current + 1);
      restartHero();
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
      restartHero();
    });
  });

  var searchInput = document.querySelector('[data-movie-search]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-value]'));
  var noResult = document.querySelector('[data-no-result]');
  var activeFilter = 'all';

  function applyFilter() {
    if (!cards.length) {
      return;
    }

    var term = searchInput ? searchInput.value.trim().toLowerCase() : '';
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = (card.getAttribute('data-search') || '').toLowerCase();
      var matchTerm = !term || haystack.indexOf(term) !== -1;
      var matchFilter = activeFilter === 'all' || haystack.indexOf(activeFilter.toLowerCase()) !== -1;
      var show = matchTerm && matchFilter;
      card.style.display = show ? '' : 'none';
      if (show) {
        visible += 1;
      }
    });

    if (noResult) {
      noResult.classList.toggle('show', visible === 0);
    }
  }

  if (searchInput) {
    searchInput.addEventListener('input', applyFilter);
  }

  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      activeFilter = button.getAttribute('data-filter-value') || 'all';
      filterButtons.forEach(function (item) {
        item.classList.toggle('active', item === button);
      });
      applyFilter();
    });
  });

  var player = document.querySelector('[data-player]');
  var video = document.querySelector('video[data-stream]');
  var playButton = document.querySelector('[data-play-button]');

  function markPlaying(isPlaying) {
    if (player) {
      player.classList.toggle('playing', isPlaying);
    }
  }

  if (video) {
    var stream = video.getAttribute('data-stream');

    if (stream && window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(stream);
      hls.attachMedia(video);
    } else if (stream && video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
    }

    video.addEventListener('play', function () {
      markPlaying(true);
    });

    video.addEventListener('pause', function () {
      markPlaying(false);
    });

    video.addEventListener('ended', function () {
      markPlaying(false);
    });
  }

  if (playButton && video) {
    playButton.addEventListener('click', function () {
      if (video.paused) {
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {});
        }
      } else {
        video.pause();
      }
    });
  }
})();
