
(function () {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const navBtn = $('[data-menu-btn]');
  const navLinks = $('[data-nav-links]');
  if (navBtn && navLinks) {
    navBtn.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });
    $$('.nav-links a', document).forEach((a) => {
      a.addEventListener('click', () => navLinks.classList.remove('open'));
    });
  }

  const hero = $('[data-hero-slider]');
  if (hero) {
    const slides = $$('.hero-slide', hero);
    const dotsWrap = $('[data-hero-dots]');
    const prevBtn = $('[data-hero-prev]');
    const nextBtn = $('[data-hero-next]');
    let index = 0;
    let timer = null;

    const renderDots = () => {
      if (!dotsWrap) return;
      dotsWrap.innerHTML = '';
      slides.forEach((_, i) => {
        const btn = document.createElement('button');
        btn.className = 'hero-dot' + (i === index ? ' active' : '');
        btn.type = 'button';
        btn.setAttribute('aria-label', '切换焦点图');
        btn.addEventListener('click', () => {
          show(i);
          restart();
        });
        dotsWrap.appendChild(btn);
      });
    };

    const show = (i) => {
      if (!slides.length) return;
      index = (i + slides.length) % slides.length;
      slides.forEach((slide, idx) => slide.classList.toggle('active', idx === index));
      if (dotsWrap) {
        $$('.hero-dot', dotsWrap).forEach((dot, idx) => dot.classList.toggle('active', idx === index));
      }
    };

    const next = () => show(index + 1);
    const prev = () => show(index - 1);
    const restart = () => {
      if (timer) clearInterval(timer);
      timer = setInterval(next, 5000);
    };

    if (prevBtn) prevBtn.addEventListener('click', () => { prev(); restart(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { next(); restart(); });
    renderDots();
    show(0);
    restart();
  }

  const filterWidgets = $$('[data-filter-scope]');
  filterWidgets.forEach((scope) => {
    const cards = $$('.film-card', scope);
    const input = $('[data-filter-input]', scope);
    const region = $('[data-filter-region]', scope);
    const type = $('[data-filter-type]', scope);
    const sort = $('[data-filter-sort]', scope);
    const count = $('[data-filter-count]', scope);

    const apply = () => {
      const q = (input?.value || '').trim().toLowerCase();
      const r = (region?.value || '').trim();
      const t = (type?.value || '').trim();
      const s = (sort?.value || 'hot').trim();
      const visible = [];

      cards.forEach((card) => {
        const blob = (card.dataset.search || '').toLowerCase();
        const cardRegion = card.dataset.region || '';
        const cardType = card.dataset.type || '';
        const pass = (!q || blob.includes(q)) && (!r || cardRegion === r) && (!t || cardType === t);
        card.classList.toggle('hidden', !pass);
        if (pass) visible.push(card);
      });

      visible.sort((a, b) => {
        if (s === 'year-desc') return (parseInt(b.dataset.year || '0', 10) || 0) - (parseInt(a.dataset.year || '0', 10) || 0);
        if (s === 'year-asc') return (parseInt(a.dataset.year || '0', 10) || 0) - (parseInt(b.dataset.year || '0', 10) || 0);
        if (s === 'title') return (a.dataset.title || '').localeCompare(b.dataset.title || '', 'zh-Hans-CN');
        return (parseInt(b.dataset.year || '0', 10) || 0) - (parseInt(a.dataset.year || '0', 10) || 0);
      });

      visible.forEach((el) => el.parentElement.appendChild(el));
      if (count) count.textContent = String(visible.length);
    };

    [input, region, type, sort].forEach((el) => {
      if (el) {
        el.addEventListener('input', apply);
        el.addEventListener('change', apply);
      }
    });
    apply();
  });

  const player = $('[data-player]');
  if (player) {
    const video = $('video', player);
    const playBtn = $('[data-play-btn]', player);
    const sourceBtns = $$('[data-source-btn]', player);
    let activeIndex = 0;
    let hls = null;
    let isLoaded = false;

    const sources = (() => {
      try {
        return JSON.parse(player.dataset.sources || '[]');
      } catch (err) {
        return [];
      }
    })();

    const destroyHls = () => {
      if (hls && typeof hls.destroy === 'function') {
        hls.destroy();
      }
      hls = null;
    };

    const loadSource = (idx) => {
      if (!video || !sources.length) return;
      activeIndex = (idx + sources.length) % sources.length;
      const source = sources[activeIndex];
      sourceBtns.forEach((btn, i) => btn.classList.toggle('active', i === activeIndex));
      destroyHls();
      if (source.type === 'hls' && window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          maxBufferLength: 30,
          enableWorker: true,
        });
        hls.loadSource(source.src);
        hls.attachMedia(video);
      } else {
        video.src = source.src;
      }
      isLoaded = true;
    };

    sourceBtns.forEach((btn, i) => {
      btn.addEventListener('click', () => loadSource(i));
    });

    if (playBtn) {
      playBtn.addEventListener('click', async () => {
        if (!isLoaded) loadSource(activeIndex);
        try {
          await video.play();
          const overlay = $('[data-player-overlay]', player);
          if (overlay) overlay.style.display = 'none';
        } catch (err) {}
      });
    }

    video.addEventListener('click', async () => {
      try {
        if (video.paused) {
          await video.play();
        } else {
          video.pause();
        }
      } catch (err) {}
    });

    loadSource(activeIndex);
  }
})();
