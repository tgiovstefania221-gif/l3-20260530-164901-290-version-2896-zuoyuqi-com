(() => {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const menu = document.querySelector('[data-menu]');

  if (menuButton && menu) {
    menuButton.addEventListener('click', () => {
      menu.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-hero-slider]').forEach((slider) => {
    const slides = Array.from(slider.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(slider.querySelectorAll('[data-hero-dot]'));
    const prev = slider.querySelector('[data-hero-prev]');
    const next = slider.querySelector('[data-hero-next]');
    let active = 0;
    let timer = null;

    const show = (index) => {
      if (!slides.length) {
        return;
      }
      active = (index + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle('is-active', slideIndex === active);
      });
      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle('is-active', dotIndex === active);
      });
    };

    const start = () => {
      stop();
      timer = window.setInterval(() => show(active + 1), 5000);
    };

    const stop = () => {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    };

    prev?.addEventListener('click', () => {
      show(active - 1);
      start();
    });

    next?.addEventListener('click', () => {
      show(active + 1);
      start();
    });

    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        show(index);
        start();
      });
    });

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    show(0);
    start();
  });

  document.querySelectorAll('[data-filter-list]').forEach((list) => {
    const scope = list.closest('section') || document;
    const input = scope.querySelector('[data-filter-input]');
    const year = scope.querySelector('[data-filter-year]');
    const cards = Array.from(list.querySelectorAll('[data-card]'));

    const apply = () => {
      const term = (input?.value || '').trim().toLowerCase();
      const selectedYear = year?.value || '';

      cards.forEach((card) => {
        const haystack = [
          card.dataset.title,
          card.dataset.year,
          card.dataset.region,
          card.dataset.type,
          card.dataset.genre
        ].join(' ').toLowerCase();
        const matchedText = !term || haystack.includes(term);
        const matchedYear = !selectedYear || card.dataset.year === selectedYear;
        card.hidden = !(matchedText && matchedYear);
      });
    };

    input?.addEventListener('input', apply);
    year?.addEventListener('change', apply);
    apply();
  });

  document.querySelectorAll('[data-player]').forEach((holder) => {
    const video = holder.querySelector('video');
    const button = holder.querySelector('[data-player-button]');

    if (!video) {
      return;
    }

    const streamUrl = video.getAttribute('data-stream');
    let attached = false;
    let hls = null;

    const attach = () => {
      if (attached || !streamUrl) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
        attached = true;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        attached = true;
        return;
      }

      video.src = streamUrl;
      attached = true;
    };

    const play = () => {
      attach();
      button?.classList.add('is-hidden');
      const result = video.play();

      if (result && typeof result.catch === 'function') {
        result.catch(() => {
          button?.classList.remove('is-hidden');
        });
      }
    };

    button?.addEventListener('click', play);

    video.addEventListener('click', () => {
      if (video.paused) {
        play();
      }
    });

    video.addEventListener('play', () => {
      button?.classList.add('is-hidden');
    });

    video.addEventListener('ended', () => {
      button?.classList.remove('is-hidden');
    });

    window.addEventListener('pagehide', () => {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  });

  const searchInput = document.querySelector('[data-search-input]');
  const searchResults = document.querySelector('[data-search-results]');

  if (searchInput && searchResults && Array.isArray(window.MOVIE_INDEX)) {
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get('q') || '';
    searchInput.value = initialQuery;

    const card = (movie) => `
      <article class="movie-card" data-card>
        <a href="./${movie.file}" aria-label="观看 ${escapeHtml(movie.title)}">
          <figure>
            <img src="${movie.cover}" alt="${escapeHtml(movie.title)}" loading="lazy">
            <span class="card-year">${escapeHtml(movie.year)}</span>
            <span class="card-play">▶</span>
          </figure>
          <div class="card-body">
            <h2>${escapeHtml(movie.title)}</h2>
            <p>${escapeHtml(movie.oneLine)}</p>
            <div class="card-meta">
              <span>${escapeHtml(movie.region)}</span>
              <span>${escapeHtml(movie.type)}</span>
            </div>
          </div>
        </a>
      </article>
    `;

    const render = () => {
      const query = searchInput.value.trim().toLowerCase();
      const list = window.MOVIE_INDEX.filter((movie) => {
        const haystack = [
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.tags,
          movie.category
        ].join(' ').toLowerCase();
        return !query || haystack.includes(query);
      }).slice(0, 96);
      searchResults.innerHTML = list.map(card).join('');
    };

    searchInput.addEventListener('input', render);
    render();
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }
})();
