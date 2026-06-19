(function() {
  var toggle = document.querySelector('[data-menu-toggle]');
  var nav = document.querySelector('[data-main-nav]');
  if (toggle && nav) {
    toggle.addEventListener('click', function() {
      nav.classList.toggle('open');
    });
  }

  var carousel = document.querySelector('[data-hero-carousel]');
  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var prev = carousel.querySelector('[data-hero-prev]');
    var next = carousel.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function startAuto() {
      stopAuto();
      timer = window.setInterval(function() {
        showSlide(current + 1);
      }, 5200);
    }

    function stopAuto() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function(dot, index) {
      dot.addEventListener('click', function() {
        showSlide(index);
        startAuto();
      });
    });

    if (prev) {
      prev.addEventListener('click', function() {
        showSlide(current - 1);
        startAuto();
      });
    }

    if (next) {
      next.addEventListener('click', function() {
        showSlide(current + 1);
        startAuto();
      });
    }

    carousel.addEventListener('mouseenter', stopAuto);
    carousel.addEventListener('mouseleave', startAuto);
    startAuto();
  }

  var filterList = document.querySelector('[data-filter-list]');
  if (filterList) {
    var cards = Array.prototype.slice.call(filterList.querySelectorAll('.movie-card'));
    var searchInput = document.querySelector('[data-search-input]');
    var yearFilter = document.querySelector('[data-year-filter]');
    var regionFilter = document.querySelector('[data-region-filter]');
    var resetButton = document.querySelector('[data-reset-filter]');
    var resultCount = document.querySelector('[data-result-count]');

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function applyFilters() {
      var query = normalize(searchInput ? searchInput.value : '');
      var year = normalize(yearFilter ? yearFilter.value : '');
      var region = normalize(regionFilter ? regionFilter.value : '');
      var visible = 0;

      cards.forEach(function(card) {
        var text = normalize(card.textContent + ' ' + card.dataset.title + ' ' + card.dataset.genre + ' ' + card.dataset.region + ' ' + card.dataset.category);
        var yearText = normalize(card.dataset.year);
        var regionText = normalize(card.dataset.region);
        var matched = true;

        if (query && text.indexOf(query) === -1) {
          matched = false;
        }
        if (year && yearText.indexOf(year) === -1) {
          matched = false;
        }
        if (region && regionText !== region) {
          matched = false;
        }

        card.classList.toggle('is-hidden', !matched);
        if (matched) {
          visible += 1;
        }
      });

      if (resultCount) {
        resultCount.textContent = '显示 ' + visible + ' 部内容';
      }
    }

    if (searchInput) {
      searchInput.addEventListener('input', applyFilters);
    }
    if (yearFilter) {
      yearFilter.addEventListener('change', applyFilters);
    }
    if (regionFilter) {
      regionFilter.addEventListener('change', applyFilters);
    }
    if (resetButton) {
      resetButton.addEventListener('click', function() {
        if (searchInput) {
          searchInput.value = '';
        }
        if (yearFilter) {
          yearFilter.value = '';
        }
        if (regionFilter) {
          regionFilter.value = '';
        }
        applyFilters();
      });
    }
  }
}());
