
(function(){
  const movies = window.MOVIES || [];
  const cats = window.CATEGORIES || [];
  const site = window.SITE_INFO || {};
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
  const escapeHtml = (s='') => String(s).replace(/[&<>"]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
  const hash = (s='') => { let h = 0; for (let i=0;i<s.length;i++) h = ((h<<5)-h + s.charCodeAt(i)) | 0; return Math.abs(h); };
  const colorHue = (id) => (hash(id) % 340);
  const renderTagList = (tags='') => tags.split(/[，,、\/\s]+/).filter(Boolean).slice(0,4).map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('');
  const makeCard = (m, idx=0) => `
    <a class="card" href="${m.link || ('movies/' + m.slug)}" style="--hue:${colorHue(m.id||m.slug||m.title)}">
      <div class="cover"><div class="num">${escapeHtml(m.year || '')}</div><div class="title">${escapeHtml(m.title)}</div></div>
      <div class="body">
        <div class="meta"><span>${escapeHtml(m.region || '')}</span><span>·</span><span>${escapeHtml(m.genre || '')}</span></div>
        <h3>${escapeHtml(m.title)}</h3>
        <p>${escapeHtml(m.summary || m.one_line || '')}</p>
      </div>
    </a>`;
  const makeRow = (m, rank) => `
    <div class="row" style="--hue:${colorHue(m.id||m.slug||m.title)}">
      <div class="rank">#${rank}</div>
      <div>
        <h3><a href="${m.link || ('movies/' + m.slug)}">${escapeHtml(m.title)}</a></h3>
        <div class="info">${escapeHtml(m.region || '')} · ${escapeHtml(m.year || '')} · ${escapeHtml(m.genre || '')}</div>
        <div class="info">${escapeHtml(m.summary || m.one_line || '')}</div>
      </div>
      <div class="actions"><a class="btn btn-secondary" href="${m.link || ('movies/' + m.slug)}">查看详情</a></div>
    </div>`;
  const setActiveNav = () => {
    const page = document.body.dataset.page || location.pathname.split('/').pop() || 'index.html';
    $$('[data-nav]').forEach(a => {
      const key = a.getAttribute('data-nav');
      if ((page === 'index.html' && key === 'home') || page.includes(key) || (page === 'categories.html' && key === 'categories')) a.classList.add('active');
    });
  };
  const mountCards = () => {
    $$('[data-render="cards"]').forEach(el => {
      const source = el.getAttribute('data-source') || 'all';
      const limit = parseInt(el.getAttribute('data-limit') || '24', 10);
      let list = movies.slice();
      if (source === 'featured') list = movies.slice(0, limit);
      if (source.startsWith('category:')) {
        const slug = source.split(':')[1];
        list = movies.filter(m => m.category_slug === slug);
      }
      if (source === 'top') list = movies.slice().sort((a,b) => b.score - a.score);
      if (source === 'recent') list = movies.slice().sort((a,b) => (b.year||0) - (a.year||0) || b.rank - a.rank);
      el.innerHTML = list.slice(0, limit).map((m,i)=>makeCard(m,i)).join('');
    });
  };
  const mountRanking = () => {
    const list = movies.slice().sort((a,b) => b.score - a.score);
    const box = $('#rankingList');
    if (box) box.innerHTML = list.slice(0, 100).map((m,i)=>makeRow(m, i+1)).join('');
    const hot = $('#hotList');
    if (hot) hot.innerHTML = list.slice(0, 12).map((m,i)=>`<div class="small-card"><div class="rank">TOP ${i+1}</div><div><a href="${m.link || ('movies/' + m.slug)}">${escapeHtml(m.title)}</a></div><div class="muted">${escapeHtml(m.region || '')} · ${escapeHtml(m.year || '')}</div></div>`).join('');
  };
  const mountCategoryOverview = () => {
    const el = $('#categoryPills');
    if (el) el.innerHTML = cats.map((c, i) => `<a href="${c.slug}.html">${escapeHtml(c.name)}</a>`).join('');
  };
  const initHeroCarousel = () => {
    const track = $('#heroTrack');
    if (!track) return;
    const slides = $$('.hero-slide', track);
    if (!slides.length) return;
    let idx = 0;
    const show = (i) => {
      idx = (i + slides.length) % slides.length;
      track.style.transform = `translateX(${-idx * 100}%)`;
      $$('[data-dot]').forEach((d,j)=>d.classList.toggle('active', j === idx));
    };
    const prev = $('#heroPrev');
    const next = $('#heroNext');
    if (prev) prev.addEventListener('click', ()=>show(idx-1));
    if (next) next.addEventListener('click', ()=>show(idx+1));
    const auto = setInterval(()=>show(idx+1), 5000);
    track.addEventListener('mouseenter', ()=>clearInterval(auto), {once:true});
    show(0);
  };
  const initSearch = () => {
    const input = $('#searchInput');
    const results = $('#searchResults');
    const empty = $('#searchEmpty');
    if (!input || !results) return;
    const url = new URL(location.href);
    const q = (url.searchParams.get('q') || '').trim();
    input.value = q;
    const render = (term) => {
      const t = term.trim().toLowerCase();
      let list = movies.slice();
      if (t) list = movies.filter(m => [m.title, m.region, m.genre, m.tags, m.one_line, m.summary, m.category].join(' ').toLowerCase().includes(t));
      results.innerHTML = list.slice(0, 200).map((m, i) => makeCard(m, i)).join('');
      if (empty) empty.classList.toggle('hidden', !!list.length);
      const count = $('#resultCount');
      if (count) count.textContent = `${list.length}`;
    };
    render(q);
    input.addEventListener('input', () => render(input.value));
  };
  const initCategoryFilters = () => {
    const input = $('#filterInput');
    const select = $('#categorySelect');
    const box = $('#categoryGrid');
    if (!input || !box) return;
    const render = () => {
      const term = (input.value || '').trim().toLowerCase();
      const cat = (select && select.value) || '';
      const list = movies.filter(m => (!cat || m.category_slug === cat) && (!term || [m.title,m.genre,m.region,m.tags,m.one_line,m.summary].join(' ').toLowerCase().includes(term)));
      box.innerHTML = list.slice(0, 400).map((m,i)=>makeCard(m,i)).join('');
      const count = $('#filterCount');
      if (count) count.textContent = list.length;
    };
    if (select) select.addEventListener('change', render);
    input.addEventListener('input', render);
    render();
  };
  const initDetailPlayer = () => {
    const video = $('#moviePlayer');
    if (!video) return;
    const hlsUrl = video.getAttribute('data-hls');
    const mp4Url = video.getAttribute('data-mp4');
    if (video.canPlayType('application/vnd.apple.mpegurl') || window.Hls && hlsUrl) {
      if (window.Hls && hlsUrl) {
        const hls = new Hls();
        hls.loadSource(hlsUrl);
        hls.attachMedia(video);
      } else if (hlsUrl) {
        video.src = hlsUrl;
      } else if (mp4Url) {
        video.src = mp4Url;
      }
    } else if (mp4Url) {
      video.src = mp4Url;
    }
    const btn = $('#playBtn');
    if (btn) btn.addEventListener('click', ()=> video.play());
  };
  const initMovieLink = () => {
    $$('[data-movie-link]').forEach(a => {
      const slug = a.getAttribute('data-movie-link');
      a.href = 'movies/' + slug + '.html';
    });
  };
  setActiveNav();
  mountCards();
  mountRanking();
  mountCategoryOverview();
  initHeroCarousel();
  initSearch();
  initCategoryFilters();
  initDetailPlayer();
  initMovieLink();
})();
