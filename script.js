'use strict';

/* ── Helpers ──────────────────────────────────────────────────── */
function scrollTo(selector) {
  const el = document.querySelector(selector);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

/* ── Navbar ───────────────────────────────────────────────────── */
window.addEventListener('scroll', () => {
  document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 50);
});

/* ── Mobile menu ──────────────────────────────────────────────── */
document.getElementById('hamburger').addEventListener('click', () => {
  document.getElementById('mobileMenu').classList.add('open');
  document.body.style.overflow = 'hidden';
});
function closeMobileMenu() {
  document.getElementById('mobileMenu').classList.remove('open');
  document.body.style.overflow = '';
}

/* ── Smooth anchor links ──────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
  });
});

/* ────────────────────────────────────────────────────────────────
   SCROLL-DRIVEN SKYDIVER
   The figure starts above the viewport and "falls" down the page
   as the user scrolls. Partway through the page the parachute
   deploys and the fall slows down.
──────────────────────────────────────────────────────────────── */
(function initScrollDiver() {
  const diver     = document.getElementById('scrollDiver');
  const chute     = document.getElementById('chute');
  const freefall  = document.getElementById('freefallBody');
  const lines     = document.getElementById('speedLines');

  let deployDone  = false;
  let lastScroll  = -1;

  function update() {
    const scrollY   = window.scrollY;
    if (scrollY === lastScroll) { requestAnimationFrame(update); return; }
    lastScroll = scrollY;

    const docH      = document.documentElement.scrollHeight - window.innerHeight;
    const progress  = Math.min(scrollY / docH, 1);          // 0 → 1
    const deployAt  = 0.45;                                  // parachute deploys at 45% scroll

    // Position: slide from -10 vh to (100vh - 130px)
    const minY = -0.1 * window.innerHeight;
    const maxY =  window.innerHeight - 140;
    let   posY = minY + (maxY - minY) * progress;

    // Slow down after deployment (ease into a hover)
    if (progress > deployAt) {
      const afterDeploy = (progress - deployAt) / (1 - deployAt); // 0→1
      const extra       = afterDeploy * afterDeploy * 0.25 * (maxY - minY);
      posY = minY + (maxY - minY) * deployAt + extra;
      posY = Math.min(posY, maxY);
    }

    diver.style.transform = `translateY(${posY}px)`;

    // Show diver only when scrolling has started
    diver.style.opacity = scrollY > 40 ? '1' : '0';

    // Swap between freefall and deployed
    if (progress >= deployAt && !deployDone) {
      deployDone = true;
      chute.style.opacity     = '1';
      lines.style.opacity     = '0';
      // Straighten the arms / legs for canopy hang position
      freefall.style.transform = 'translateY(8px)';
      diver.style.filter = 'drop-shadow(0 0 18px rgba(124,58,237,0.7))';
    } else if (progress < deployAt && deployDone) {
      deployDone = false;
      chute.style.opacity     = '0';
      lines.style.opacity     = '0.4';
      freefall.style.transform = '';
      diver.style.filter = 'drop-shadow(0 0 12px rgba(124,58,237,0.5))';
    }

    requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
})();

/* ── Hero Canvas ──────────────────────────────────────────────── */
(function initHeroCanvas() {
  const canvas = document.getElementById('heroCanvas');
  const ctx    = canvas.getContext('2d');

  function resize() { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; }
  resize();
  window.addEventListener('resize', resize);

  /* Particles — subtle floating purple dust */
  const particles = Array.from({ length: 80 }, () => ({
    x:  Math.random(),
    y:  Math.random(),
    r:  Math.random() * 1.8 + 0.3,
    vx: (Math.random() - 0.5) * 0.00008,
    vy: -(Math.random() * 0.0001 + 0.00004),
    a:  Math.random() * 0.6 + 0.1,
  }));

  /* Grid lines — perspective ground grid */
  function drawGrid(w, h) {
    const horizon = h * 0.62;
    const vp      = { x: w / 2, y: horizon };
    const lines_  = 14;
    ctx.strokeStyle = 'rgba(124,58,237,0.07)';
    ctx.lineWidth   = 1;
    for (let i = 0; i <= lines_; i++) {
      const t  = i / lines_;
      const x0 = t * w;
      ctx.beginPath();
      ctx.moveTo(vp.x + (x0 - vp.x) * 0.01, horizon);
      ctx.lineTo(x0, h);
      ctx.stroke();
    }
    const rows = 10;
    for (let j = 1; j <= rows; j++) {
      const y = horizon + ((h - horizon) * (j / rows) ** 1.8);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
  }

  let t = 0;
  function frame() {
    t++;
    const w = canvas.width, h = canvas.height;

    /* Background gradient */
    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, '#020204');
    bg.addColorStop(0.5, '#0a0a12');
    bg.addColorStop(1, '#12091e');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    /* Grid */
    drawGrid(w, h);

    /* Particles */
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.y < -0.02) { p.y = 1.02; p.x = Math.random(); }
      ctx.beginPath();
      ctx.arc(p.x * w, p.y * h, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(167,139,250,${p.a * (0.5 + 0.5 * Math.sin(t * 0.02 + p.x * 10))})`;
      ctx.fill();
    });

    /* Subtle purple vignette glow at centre */
    const glow = ctx.createRadialGradient(w / 2, h * 0.5, 0, w / 2, h * 0.5, w * 0.55);
    glow.addColorStop(0, 'rgba(124,58,237,0.06)');
    glow.addColorStop(1, 'rgba(124,58,237,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();

/* ── Stat counters ────────────────────────────────────────────── */
(function initCounters() {
  const els = document.querySelectorAll('.stat-num');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el  = e.target;
      const end = parseInt(el.dataset.target, 10);
      const dur = 1800;
      const t0  = performance.now();
      function tick(now) {
        const p    = Math.min((now - t0) / dur, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(ease * end).toLocaleString();
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      obs.unobserve(el);
    });
  }, { threshold: 0.5 });
  els.forEach(el => obs.observe(el));
})();

/* ── Timeline reveal ──────────────────────────────────────────── */
(function initTimeline() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('visible'), i * 100);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.25 });
  document.querySelectorAll('.tl-item').forEach(el => obs.observe(el));
})();

/* ── Packages ─────────────────────────────────────────────────── */
function selectPackage(name, price) { openBooking(name, price); }

/* ── Booking modal ────────────────────────────────────────────── */
const PRICES = { intro: 199, ultimate: 349, vip: 549 };

function openBooking(packageName) {
  document.getElementById('modalOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
  const d = new Date(); d.setDate(d.getDate() + 1);
  document.getElementById('bookDate').min = d.toISOString().split('T')[0];
  if (packageName) {
    const sel = document.getElementById('bookPackage');
    if (/intro/i.test(packageName))      sel.value = 'intro';
    else if (/vip/i.test(packageName))   sel.value = 'vip';
    else                                 sel.value = 'ultimate';
  }
  updatePrice();
}
function closeBooking() {
  document.getElementById('modalOverlay').classList.remove('open');
  document.body.style.overflow = '';
}
function closeOnOverlay(e) {
  if (e.target === document.getElementById('modalOverlay')) closeBooking();
}
function updatePrice() {
  const pkg  = document.getElementById('bookPackage').value;
  const num  = parseInt(document.getElementById('bookNum').value, 10) || 1;
  document.getElementById('totalPrice').textContent = '$' + ((PRICES[pkg] || 349) * num).toLocaleString();
}
document.getElementById('bookPackage').addEventListener('change', updatePrice);
document.getElementById('bookNum').addEventListener('input', updatePrice);

function submitBooking(e) {
  e.preventDefault();
  closeBooking();
  showToast('Booking confirmed! Check your email for details.');
}

/* ── Simulator ────────────────────────────────────────────────── */
const simCanvas = document.getElementById('simCanvas');
const sCtx      = simCanvas.getContext('2d');

const POSITIONS = {
  arch:  { speed: 120, color: '#7c3aed' },
  track: { speed: 160, color: '#a78bfa' },
  sit:   { speed: 90,  color: '#5b21b6' },
};

let sim = {
  running: false, pos: 'arch', altitude: 15000, maxAlt: 15000,
  speed: 0, time: 0, diverY: 0.05, deployed: false, particles: [], lastFrame: 0,
};

function resizeSim() {
  const rect = simCanvas.parentElement.getBoundingClientRect();
  simCanvas.width = rect.width;
  simCanvas.height = simCanvas.offsetHeight;
}
resizeSim();
window.addEventListener('resize', resizeSim);

document.getElementById('altSlider').addEventListener('input', function () {
  document.getElementById('altVal').textContent = parseInt(this.value).toLocaleString();
  if (!sim.running) resetSim();
});
document.getElementById('windSlider').addEventListener('input', function () {
  document.getElementById('windVal').textContent = this.value;
});

function setPosition(btn, pos) {
  document.querySelectorAll('.pos-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  sim.pos = pos;
}
function resetSim() {
  const alt = parseInt(document.getElementById('altSlider').value, 10);
  Object.assign(sim, { altitude: alt, maxAlt: alt, speed: 0, time: 0, diverY: 0.05, deployed: false, particles: [] });
  document.getElementById('liveFallTime').textContent = '0.0';
  document.getElementById('liveSpeed').textContent    = '0';
  document.getElementById('liveAlt').textContent      = '—';
}
function startSimulation() {
  const btn = document.getElementById('simBtn');
  if (sim.running) {
    sim.running = false;
    btn.textContent = '▶ Start Jump';
    resetSim();
    document.getElementById('simOverlay').classList.remove('hidden');
    return;
  }
  sim.running = true;
  btn.textContent = '⏹ Reset';
  resetSim();
  document.getElementById('simOverlay').classList.add('hidden');
  sim.lastFrame = performance.now();
  simLoop(performance.now());
}

function simLoop(now) {
  if (!sim.running) return;
  const dt = Math.min((now - sim.lastFrame) / 1000, 0.05);
  sim.lastFrame = now;
  const pd = POSITIONS[sim.pos];

  if (!sim.deployed) {
    sim.speed    = Math.min(sim.speed + 40 * dt, pd.speed);
    sim.altitude -= sim.speed * dt * 1.47;
    sim.time     += dt;
    sim.diverY   = Math.min(0.68, sim.diverY + dt * 0.12);
    if (sim.altitude <= 4500) { sim.deployed = true; sim.speed = 18; }
  } else {
    sim.speed    = Math.max(sim.speed - 10 * dt, 18);
    sim.altitude -= sim.speed * dt * 1.47;
    sim.diverY   = Math.min(0.9, sim.diverY + dt * 0.025);
  }

  if (sim.altitude <= 0) {
    sim.altitude = 0; sim.running = false;
    document.getElementById('simBtn').textContent = '▶ Start Jump';
    const ov = document.getElementById('simOverlay');
    ov.classList.remove('hidden');
    ov.querySelector('p').textContent = 'Landed safely! Great jump.';
    setTimeout(() => { ov.querySelector('p').textContent = 'Configure your jump and press Start'; }, 3000);
    return;
  }

  for (let i = 0; i < 2; i++) {
    sim.particles.push({
      x: simCanvas.width / 2 + (Math.random() - 0.5) * 24,
      y: sim.diverY * simCanvas.height,
      vx: (Math.random() - 0.5) * 1.5,
      vy: -Math.random() * 1.2,
      r: Math.random() * 2.5 + 0.5,
      life: 1,
      color: pd.color,
    });
  }

  document.getElementById('liveFallTime').textContent = sim.time.toFixed(1);
  document.getElementById('liveSpeed').textContent    = Math.round(sim.speed);
  document.getElementById('liveAlt').textContent      = Math.max(0, Math.round(sim.altitude)).toLocaleString();

  drawSim();
  requestAnimationFrame(simLoop);
}

function drawSim() {
  const w = simCanvas.width, h = simCanvas.height;
  const pct = 1 - sim.altitude / sim.maxAlt;
  const pd  = POSITIONS[sim.pos];

  /* Sky gradient shifting from deep space → dusk as you fall */
  const g = sCtx.createLinearGradient(0, 0, 0, h);
  const r1 = Math.round(2  + pct * 20), g1 = Math.round(2  + pct * 15), b1 = Math.round(8  + pct * 40);
  const r2 = Math.round(8  + pct * 30), g2 = Math.round(5  + pct * 25), b2 = Math.round(18 + pct * 50);
  g.addColorStop(0, `rgb(${r1},${g1},${b1})`);
  g.addColorStop(1, `rgb(${r2},${g2},${b2})`);
  sCtx.fillStyle = g;
  sCtx.fillRect(0, 0, w, h);

  /* Speed streaks during freefall */
  if (!sim.deployed) {
    const density = Math.round((sim.speed / 120) * 25);
    for (let i = 0; i < density; i++) {
      const lx  = Math.random() * w;
      const ly  = Math.random() * h;
      const len = Math.random() * 50 + 10;
      sCtx.beginPath();
      sCtx.moveTo(lx, ly);
      sCtx.lineTo(lx, ly + len);
      sCtx.strokeStyle = `rgba(167,139,250,${Math.random() * 0.07})`;
      sCtx.lineWidth = 1;
      sCtx.stroke();
    }
  }

  /* Particles */
  sim.particles.forEach(p => {
    p.x += p.vx; p.y += p.vy; p.vy -= 0.04; p.life -= 0.035;
    sCtx.beginPath();
    sCtx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
    sCtx.fillStyle = p.color + Math.round(p.life * 120).toString(16).padStart(2, '0');
    sCtx.fill();
  });
  sim.particles = sim.particles.filter(p => p.life > 0);

  /* Diver */
  const dx = w / 2, dy = sim.diverY * h, s = 20;
  if (sim.deployed) {
    /* Canopy */
    sCtx.beginPath();
    sCtx.ellipse(dx, dy - s * 2.2, s * 2.8, s * 1.6, 0, Math.PI, 0);
    sCtx.fillStyle = pd.color + 'cc';
    sCtx.fill();
    sCtx.strokeStyle = pd.color;
    sCtx.lineWidth = 1.5;
    sCtx.stroke();
    for (let a = -50; a <= 50; a += 20) {
      const rad = a * Math.PI / 180;
      sCtx.beginPath();
      sCtx.moveTo(dx + Math.sin(rad) * s * 2.8, dy - s * 2.2);
      sCtx.lineTo(dx, dy);
      sCtx.strokeStyle = 'rgba(167,139,250,0.35)';
      sCtx.lineWidth = 0.8;
      sCtx.stroke();
    }
  } else {
    /* Freefall body */
    sCtx.save();
    sCtx.translate(dx, dy);
    sCtx.fillStyle = pd.color;
    sCtx.beginPath(); sCtx.roundRect(-s * 0.22, -s * 0.5, s * 0.44, s, 4); sCtx.fill();
    sCtx.beginPath(); sCtx.roundRect(-s, -s * 0.1, s * 0.78, s * 0.2, 4); sCtx.fill();
    sCtx.beginPath(); sCtx.roundRect(s * 0.22, -s * 0.1, s * 0.78, s * 0.2, 4); sCtx.fill();
    sCtx.beginPath(); sCtx.arc(0, -s * 0.65, s * 0.28, 0, Math.PI * 2); sCtx.fillStyle = '#f5c5a3'; sCtx.fill();
    sCtx.beginPath(); sCtx.arc(0, -s * 0.65, s * 0.3, Math.PI, 0); sCtx.fillStyle = '#4c1d95'; sCtx.fill();
    sCtx.restore();
  }

  /* Altitude meter */
  const mx = w - 56, my = 20, mh = h - 40, mw = 14;
  sCtx.fillStyle = 'rgba(0,0,0,0.55)';
  sCtx.beginPath(); sCtx.roundRect(mx, my, mw, mh, 6); sCtx.fill();
  const fh = mh * (sim.altitude / sim.maxAlt);
  const mg = sCtx.createLinearGradient(0, my, 0, my + mh);
  mg.addColorStop(0, pd.color);
  mg.addColorStop(1, pd.color + '22');
  sCtx.fillStyle = mg;
  sCtx.beginPath(); sCtx.roundRect(mx, my + mh - fh, mw, fh, 6); sCtx.fill();
  const dp  = 4500 / sim.maxAlt;
  const dpy = my + mh * (1 - dp);
  sCtx.beginPath(); sCtx.moveTo(mx - 6, dpy); sCtx.lineTo(mx + mw + 4, dpy);
  sCtx.strokeStyle = '#a78bfa'; sCtx.lineWidth = 1.2;
  sCtx.setLineDash([3, 4]); sCtx.stroke(); sCtx.setLineDash([]);
  sCtx.fillStyle = '#a78bfa'; sCtx.font = '8px Inter,sans-serif';
  sCtx.fillText('CHUTE', mx - 30, dpy + 3);
}

/* ── Gallery ──────────────────────────────────────────────────── */
const GALLERY = [
  { emoji:'🪂', label:'Into the blue', category:'freefall', bg:'linear-gradient(135deg,#0a0a14,#1a0a30)' },
  { emoji:'🌤️', label:'Canopy at 5,000 ft', category:'canopy', bg:'linear-gradient(135deg,#0d1a30,#0a2240)' },
  { emoji:'🌏', label:'Earth from above', category:'freefall', bg:'linear-gradient(135deg,#0a1a10,#0d2a20)' },
  { emoji:'🏔️', label:'Mountain panorama', category:'canopy', bg:'linear-gradient(135deg,#1a0a30,#0a0a20)' },
  { emoji:'🌅', label:'Sunrise freefall', category:'freefall', bg:'linear-gradient(135deg,#2a0a0a,#0a0a1e)' },
  { emoji:'✈️', label:'Exit at 15,000 ft', category:'freefall', bg:'linear-gradient(135deg,#0a0a20,#04040e)' },
  { emoji:'🌊', label:'Coastal jump', category:'canopy', bg:'linear-gradient(135deg,#04101e,#040414)' },
  { emoji:'🎯', label:'Perfect landing', category:'landing', bg:'linear-gradient(135deg,#041404,#040e04)' },
  { emoji:'🤝', label:'Team formation', category:'freefall', bg:'linear-gradient(135deg,#140a20,#08040e)' },
  { emoji:'🌸', label:'Meadow landing', category:'landing', bg:'linear-gradient(135deg,#1a0808,#080418)' },
  { emoji:'❄️', label:'Winter jump', category:'freefall', bg:'linear-gradient(135deg,#080c1a,#04080e)' },
  { emoji:'🌇', label:'Sunset canopy glide', category:'canopy', bg:'linear-gradient(135deg,#1a0c04,#080404)' },
];

let lbIdx = 0, filteredGallery = GALLERY;

function buildGallery(filter = 'all') {
  const grid = document.getElementById('galleryGrid');
  filteredGallery = filter === 'all' ? GALLERY : GALLERY.filter(d => d.category === filter);
  grid.innerHTML = '';
  filteredGallery.forEach((item, i) => {
    const el  = document.createElement('div');
    el.className = 'gallery-item';
    el.innerHTML = `
      <div class="gallery-thumb" style="background:${item.bg}">${item.emoji}</div>
      <div class="gallery-overlay"><span>${item.label}</span></div>
    `;
    el.addEventListener('click', () => openLightbox(i));
    grid.appendChild(el);
  });
}
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', function () {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    buildGallery(this.dataset.filter);
  });
});
function openLightbox(i) {
  lbIdx = i;
  renderLightbox();
  document.getElementById('lightbox').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeLightbox() {
  document.getElementById('lightbox').classList.remove('open');
  document.body.style.overflow = '';
}
function lightboxNav(dir) {
  lbIdx = (lbIdx + dir + filteredGallery.length) % filteredGallery.length;
  renderLightbox();
}
function renderLightbox() {
  const item = filteredGallery[lbIdx];
  const img  = document.getElementById('lbImg');
  img.style.background = item.bg;
  img.style.fontSize   = '9rem';
  img.textContent      = item.emoji;
  document.getElementById('lbCap').textContent = `${item.label} — ${item.category}`;
}
buildGallery();

/* ── Keyboard navigation ──────────────────────────────────────── */
document.addEventListener('keydown', e => {
  if (document.getElementById('lightbox').classList.contains('open')) {
    if (e.key === 'ArrowLeft')  lightboxNav(-1);
    if (e.key === 'ArrowRight') lightboxNav(1);
    if (e.key === 'Escape')     closeLightbox();
  }
  if (document.getElementById('modalOverlay').classList.contains('open') && e.key === 'Escape') closeBooking();
});

/* ── Testimonials carousel ────────────────────────────────────── */
let carouselIdx = 0;
const totalSlides = document.querySelectorAll('.testi-card').length;

function buildDots() {
  const c = document.getElementById('carouselDots');
  c.innerHTML = '';
  for (let i = 0; i < totalSlides; i++) {
    const d = document.createElement('div');
    d.className = 'dot' + (i === 0 ? ' active' : '');
    d.addEventListener('click', () => goToSlide(i));
    c.appendChild(d);
  }
}
function goToSlide(i) {
  carouselIdx = (i + totalSlides) % totalSlides;
  document.getElementById('testimonialsTrack').style.transform = `translateX(-${carouselIdx * 100}%)`;
  document.querySelectorAll('.dot').forEach((d, idx) => d.classList.toggle('active', idx === carouselIdx));
}
function moveCarousel(dir) { goToSlide(carouselIdx + dir); }
buildDots();
setInterval(() => moveCarousel(1), 6000);

/* ── FAQ ──────────────────────────────────────────────────────── */
function toggleFaq(btn) {
  const ans    = btn.nextElementSibling;
  const isOpen = ans.classList.contains('open');
  document.querySelectorAll('.faq-a').forEach(a => a.classList.remove('open'));
  document.querySelectorAll('.faq-q').forEach(b => b.classList.remove('open'));
  if (!isOpen) { ans.classList.add('open'); btn.classList.add('open'); }
}

/* ── Contact form ─────────────────────────────────────────────── */
function submitContact(e) {
  e.preventDefault();
  e.target.reset();
  showToast('Message sent! We\'ll reply within 24 hours.');
}

/* ── Toast ────────────────────────────────────────────────────── */
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 4000);
}
