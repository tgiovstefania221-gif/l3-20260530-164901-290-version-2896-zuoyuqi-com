(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobileMenu = document.querySelector('.mobile-menu');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('open');
    });
  }

  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      start();
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        restart();
      });
    });

    show(0);
    start();
  });

  document.querySelectorAll('.scroll-shell').forEach(function (shell) {
    var row = shell.querySelector('[data-scroll-row]');
    var left = shell.querySelector('[data-scroll-left]');
    var right = shell.querySelector('[data-scroll-right]');

    if (!row) {
      return;
    }

    if (left) {
      left.addEventListener('click', function () {
        row.scrollBy({ left: -420, behavior: 'smooth' });
      });
    }

    if (right) {
      right.addEventListener('click', function () {
        row.scrollBy({ left: 420, behavior: 'smooth' });
      });
    }
  });

  document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
    var keyword = scope.querySelector('[data-filter-keyword]');
    var year = scope.querySelector('[data-filter-year]');
    var category = scope.querySelector('[data-filter-category]');
    var list = document.querySelector('[data-filter-list]');
    var cards = list ? Array.prototype.slice.call(list.querySelectorAll('.movie-card, .movie-list-card')) : [];
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';

    if (keyword && query) {
      keyword.value = query;
    }

    function apply() {
      var q = keyword ? keyword.value.trim().toLowerCase() : '';
      var y = year ? year.value : '';
      var c = category ? category.value : '';

      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-category'),
          card.getAttribute('data-tags')
        ].join(' ').toLowerCase();
        var okKeyword = !q || text.indexOf(q) !== -1;
        var okYear = !y || card.getAttribute('data-year') === y;
        var okCategory = !c || card.getAttribute('data-category') === c;
        card.style.display = okKeyword && okYear && okCategory ? '' : 'none';
      });
    }

    [keyword, year, category].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });

    apply();
  });

  document.querySelectorAll('[data-player]').forEach(function (box) {
    var video = box.querySelector('video');
    var button = box.querySelector('[data-play-button]');

    if (!video) {
      return;
    }

    var stream = video.getAttribute('data-stream');

    function attach() {
      if (!stream) {
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        if (!video.hlsInstance) {
          var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(stream);
          hls.attachMedia(video);
          video.hlsInstance = hls;
        }
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      }
    }

    function play() {
      attach();
      if (button) {
        button.classList.add('hidden');
      }
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          if (button) {
            button.classList.remove('hidden');
          }
        });
      }
    }

    attach();

    if (button) {
      button.addEventListener('click', play);
    }

    video.addEventListener('play', function () {
      if (button) {
        button.classList.add('hidden');
      }
    });

    video.addEventListener('pause', function () {
      if (button && video.currentTime === 0) {
        button.classList.remove('hidden');
      }
    });
  });
})();
