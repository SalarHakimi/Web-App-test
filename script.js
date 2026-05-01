'use strict';

/* ─── NAV scroll behaviour ─────────────────────────────────── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
});

/* ─── Mobile menu ──────────────────────────────────────────── */
document.getElementById('hamburger').addEventListener('click', () => {
  document.getElementById('mobileMenu').classList.add('open');
});
function closeMobileMenu() {
  document.getElementById('mobileMenu').classList.remove('open');
}

/* ─── HERO sky canvas ──────────────────────────────────────── */
(function initHeroCanvas() {
  const canvas = document.getElementById('skyCanvas');
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // Stars
  const stars = Array.from({ length: 200 }, () => ({
    x: Math.random(),
    y: Math.random(),
    r: Math.random() * 1.4 + 0.2,
    a: Math.random(),
    da: (Math.random() - 0.5) * 0.008,
  }));

  // Clouds
  const clouds = Array.from({ length: 6 }, (_, i) => ({
    x: Math.random() * 1.5 - 0.25,
    y: 0.2 + Math.random() * 0.5,
    w: 0.15 + Math.random() * 0.25,
    h: 0.04 + Math.random() * 0.06,
    speed: 0.00005 + Math.random() * 0.00008,
    alpha: 0.06 + Math.random() * 0.12,
  }));

  // Skydivers
  const divers = Array.from({ length: 5 }, () => spawnDiver());

  function spawnDiver() {
    return {
      x: Math.random(),
      y: -0.05 - Math.random() * 0.3,
      size: 8 + Math.random() * 12,
      speed: 0.0004 + Math.random() * 0.0006,
      wobble: 0,
      wSpeed: 0.04 + Math.random() * 0.04,
      trail: [],
      deployed: false,
      deployAlt: 0.6 + Math.random() * 0.2,
    };
  }

  function drawDiver(d) {
    const x = d.x * canvas.width;
    const y = d.y * canvas.height;

    // Trail
    if (d.trail.length > 1) {
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.lineWidth = d.size * 0.4;
      ctx.lineCap = 'round';
      d.trail.forEach((pt, i) => {
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      ctx.stroke();
    }

    if (d.deployed) {
      // Parachute canopy
      ctx.beginPath();
      ctx.ellipse(x, y - d.size * 1.5, d.size * 1.4, d.size * 0.8, 0, Math.PI, 0);
      ctx.fillStyle = `rgba(249,115,22,0.7)`;
      ctx.fill();
      // Lines
      for (let i = -1; i <= 1; i += 0.5) {
        ctx.beginPath();
        ctx.moveTo(x + i * d.size * 1.2, y - d.size * 1.5);
        ctx.lineTo(x, y);
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
      // Person
      ctx.beginPath();
      ctx.arc(x, y, d.size * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.fill();
    } else {
      // Freefalling person (simplified)
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(Math.sin(d.wobble) * 0.3);
      ctx.beginPath();
      // Body
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.roundRect(-d.size * 0.15, -d.size * 0.35, d.size * 0.3, d.size * 0.7, 3);
      ctx.fill();
      // Arms spread
      ctx.beginPath();
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.roundRect(-d.size * 0.6, -d.size * 0.1, d.size * 0.45, d.size * 0.12, 3);
      ctx.fill();
      ctx.beginPath();
      ctx.roundRect(d.size * 0.15, -d.size * 0.1, d.size * 0.45, d.size * 0.12, 3);
      ctx.fill();
      // Head
      ctx.beginPath();
      ctx.arc(0, -d.size * 0.45, d.size * 0.18, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,220,180,0.9)';
      ctx.fill();
      ctx.restore();
    }
  }

  function drawCloud(c) {
    const x = c.x * canvas.width;
    const y = c.y * canvas.height;
    const w = c.w * canvas.width;
    const h = c.h * canvas.height;
    const grad = ctx.createRadialGradient(x, y, 0, x, y, w);
    grad.addColorStop(0, `rgba(255,255,255,${c.alpha})`);
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.beginPath();
    ctx.ellipse(x, y, w, h, 0, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
  }

  let lastT = 0;
  function frame(t) {
    const dt = t - lastT;
    lastT = t;

    const w = canvas.width, h = canvas.height;

    // Sky gradient
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#020c1b');
    grad.addColorStop(0.4, '#0a1628');
    grad.addColorStop(0.7, '#1a3a5c');
    grad.addColorStop(1, '#2a5a8c');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Stars
    stars.forEach(s => {
      s.a = Math.max(0.05, Math.min(1, s.a + s.da));
      if (s.a <= 0.05 || s.a >= 1) s.da *= -1;
      ctx.beginPath();
      ctx.arc(s.x * w, s.y * h * 0.7, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${s.a})`;
      ctx.fill();
    });

    // Clouds
    clouds.forEach(c => {
      c.x += c.speed * dt;
      if (c.x > 1.3) c.x = -0.3;
      drawCloud(c);
    });

    // Horizon glow
    const horizGrad = ctx.createLinearGradient(0, h * 0.6, 0, h);
    horizGrad.addColorStop(0, 'rgba(249,115,22,0)');
    horizGrad.addColorStop(1, 'rgba(249,115,22,0.08)');
    ctx.fillStyle = horizGrad;
    ctx.fillRect(0, 0, w, h);

    // Divers
    divers.forEach((d, idx) => {
      d.wobble += d.wSpeed * (dt / 16);
      if (!d.deployed && d.y > d.deployAlt) d.deployed = true;
      d.speed = d.deployed ? 0.00015 : (0.0004 + Math.random() * 0.00002);
      d.x += Math.sin(d.wobble * 0.5) * 0.00015;
      d.y += d.speed * dt;
      d.trail.push({ x: d.x * w, y: d.y * h });
      if (d.trail.length > (d.deployed ? 6 : 18)) d.trail.shift();
      if (d.y > 1.15) divers[idx] = spawnDiver();
      drawDiver(d);
    });

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();

/* ─── Animated counters ────────────────────────────────────── */
(function initCounters() {
  const nums = document.querySelectorAll('.stat-num');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = parseInt(el.dataset.target, 10);
      const duration = 2000;
      const start = performance.now();
      function tick(now) {
        const p = Math.min((now - start) / duration, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(ease * target).toLocaleString();
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });
  nums.forEach(n => observer.observe(n));
})();

/* ─── Timeline intersection ────────────────────────────────── */
(function initTimeline() {
  const items = document.querySelectorAll('.timeline-item');
  const observer = new IntersectionObserver(entries => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('visible'), i * 120);
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.3 });
  items.forEach(i => observer.observe(i));
})();

/* ─── Altitude bar animation ───────────────────────────────── */
(function initAltBars() {
  const bars = document.querySelectorAll('.alt-bar');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('animated'), 200);
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.3 });
  bars.forEach(b => observer.observe(b));
})();

/* ─── Packages ─────────────────────────────────────────────── */
function selectPackage(name, price) {
  openBooking(name, price);
}

/* ─── BOOKING MODAL ────────────────────────────────────────── */
const prices = { intro: 199, ultimate: 349, vip: 549 };

function openBooking(packageName, price) {
  const overlay = document.getElementById('modalOverlay');
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';

  // Set min date to tomorrow
  const dateInput = document.getElementById('bookDate');
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  dateInput.min = tomorrow.toISOString().split('T')[0];

  // Pre-select package if provided
  if (packageName) {
    const sel = document.getElementById('bookPackage');
    if (packageName.toLowerCase().includes('intro')) sel.value = 'intro';
    else if (packageName.toLowerCase().includes('vip')) sel.value = 'vip';
    else sel.value = 'ultimate';
  }

  updatePrice();
}

function closeBooking() {
  document.getElementById('modalOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

function closeBookingOnOverlay(e) {
  if (e.target === document.getElementById('modalOverlay')) closeBooking();
}

function updatePrice() {
  const pkg = document.getElementById('bookPackage').value;
  const num = parseInt(document.getElementById('bookNum').value, 10) || 1;
  const total = (prices[pkg] || 349) * num;
  document.getElementById('totalPrice').textContent = '$' + total.toLocaleString();
}

document.getElementById('bookPackage').addEventListener('change', updatePrice);
document.getElementById('bookNum').addEventListener('input', updatePrice);

function submitBooking(e) {
  e.preventDefault();
  closeBooking();
  showToast('Booking confirmed! Check your email for details. ');
}

/* ─── FREEFALL SIMULATOR ───────────────────────────────────── */
const simCanvas = document.getElementById('simCanvas');
const simCtx = simCanvas.getContext('2d');

const positions = {
  arch:  { speed: 120, color: '#f97316' },
  track: { speed: 160, color: '#3b82f6' },
  sit:   { speed: 90,  color: '#10b981' },
};

let simState = {
  running: false,
  currentPos: 'arch',
  altitude: 15000,
  maxAlt: 15000,
  speed: 0,
  time: 0,
  diverY: 0,
  deployed: false,
  particles: [],
  lastFrame: 0,
};

// Resize sim canvas
function resizeSimCanvas() {
  const rect = simCanvas.parentElement.getBoundingClientRect();
  simCanvas.width = rect.width;
  simCanvas.height = simCanvas.offsetHeight;
}
resizeSimCanvas();
window.addEventListener('resize', resizeSimCanvas);

document.getElementById('altSlider').addEventListener('input', function() {
  document.getElementById('altVal').textContent = parseInt(this.value).toLocaleString();
  if (!simState.running) resetSim();
});

document.getElementById('windSlider').addEventListener('input', function() {
  document.getElementById('windVal').textContent = this.value;
});

function setPosition(btn, pos) {
  document.querySelectorAll('.pos-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  simState.currentPos = pos;
}

function resetSim() {
  const alt = parseInt(document.getElementById('altSlider').value, 10);
  simState.altitude = alt;
  simState.maxAlt = alt;
  simState.speed = 0;
  simState.time = 0;
  simState.diverY = 0.05;
  simState.deployed = false;
  simState.particles = [];
  document.getElementById('liveFallTime').textContent = '0.0';
  document.getElementById('liveSpeed').textContent = '0';
  document.getElementById('liveAlt').textContent = '--';
}

function startSimulation() {
  const btn = document.getElementById('simBtn');
  if (simState.running) {
    simState.running = false;
    btn.textContent = '▶ Start Jump';
    resetSim();
    document.getElementById('simOverlay').classList.remove('hidden');
    return;
  }
  simState.running = true;
  btn.textContent = '⏹ Reset';
  resetSim();
  document.getElementById('simOverlay').classList.add('hidden');
  simState.lastFrame = performance.now();
  simLoop(performance.now());
}

function spawnParticle(x, y, color) {
  simState.particles.push({
    x, y,
    vx: (Math.random() - 0.5) * 2,
    vy: -Math.random() * 1.5,
    r: Math.random() * 3 + 1,
    life: 1,
    color,
  });
}

function simLoop(now) {
  if (!simState.running) return;
  const dt = Math.min((now - simState.lastFrame) / 1000, 0.05);
  simState.lastFrame = now;

  const posData = positions[simState.currentPos];
  const terminalSpeed = posData.speed;
  const deployAlt = 4500;

  if (!simState.deployed) {
    simState.speed = Math.min(simState.speed + 40 * dt, terminalSpeed);
    simState.altitude -= simState.speed * dt * 1.47; // mph to ft/s
    simState.time += dt;
    simState.diverY = Math.min(0.7, simState.diverY + dt * 0.12);

    if (simState.altitude <= deployAlt) {
      simState.deployed = true;
      simState.speed = 18;
    }
  } else {
    simState.speed = Math.max(simState.speed - 10 * dt, 18);
    simState.altitude -= simState.speed * dt * 1.47;
    simState.diverY = Math.min(0.9, simState.diverY + dt * 0.03);
  }

  if (simState.altitude <= 0) {
    simState.altitude = 0;
    simState.running = false;
    document.getElementById('simBtn').textContent = '▶ Start Jump';
    document.getElementById('simOverlay').classList.remove('hidden');
    document.getElementById('simOverlay').querySelector('p').textContent = 'Landed safely! Great jump!';
    setTimeout(() => {
      document.getElementById('simOverlay').querySelector('p').textContent = 'Configure your jump and hit Start';
    }, 3000);
    return;
  }

  // Spawn particles
  for (let i = 0; i < 3; i++) {
    spawnParticle(
      simCanvas.width / 2 + (Math.random() - 0.5) * 30,
      simState.diverY * simCanvas.height,
      simState.deployed ? 'rgba(255,255,255,0.3)' : posData.color + '55'
    );
  }

  // Update live stats
  document.getElementById('liveFallTime').textContent = simState.time.toFixed(1);
  document.getElementById('liveSpeed').textContent = Math.round(simState.speed);
  document.getElementById('liveAlt').textContent = Math.max(0, Math.round(simState.altitude)).toLocaleString();

  drawSimFrame();
  requestAnimationFrame(simLoop);
}

function drawSimFrame() {
  const w = simCanvas.width, h = simCanvas.height;
  const pct = 1 - (simState.altitude / simState.maxAlt);

  // Sky gradient shifts as altitude decreases
  const r = Math.round(2 + pct * 30);
  const g = Math.round(12 + pct * 60);
  const b = Math.round(27 + pct * 80);
  const grad = simCtx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, `rgb(${r},${g},${b})`);
  grad.addColorStop(1, `rgb(${r + 20},${g + 40},${b + 30})`);
  simCtx.fillStyle = grad;
  simCtx.fillRect(0, 0, w, h);

  // Speed lines (simulate rush)
  if (!simState.deployed) {
    const lineCount = Math.round((simState.speed / 120) * 30);
    for (let i = 0; i < lineCount; i++) {
      const lx = Math.random() * w;
      const ly = Math.random() * h;
      const len = Math.random() * 40 + 10;
      simCtx.beginPath();
      simCtx.moveTo(lx, ly);
      simCtx.lineTo(lx, ly + len);
      simCtx.strokeStyle = `rgba(255,255,255,${Math.random() * 0.08})`;
      simCtx.lineWidth = 1;
      simCtx.stroke();
    }
  }

  // Particles
  simState.particles.forEach((p, i) => {
    p.x += p.vx;
    p.y += p.vy;
    p.vy -= 0.05;
    p.life -= 0.04;
    simCtx.beginPath();
    simCtx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
    simCtx.fillStyle = p.color;
    simCtx.fill();
  });
  simState.particles = simState.particles.filter(p => p.life > 0);

  // Draw diver
  const dx = w / 2, dy = simState.diverY * h;
  const posData = positions[simState.currentPos];
  const s = 18;

  if (simState.deployed) {
    // Parachute
    simCtx.beginPath();
    simCtx.ellipse(dx, dy - s * 2, s * 2.5, s * 1.4, 0, Math.PI, 0);
    simCtx.fillStyle = posData.color + 'cc';
    simCtx.fill();
    simCtx.strokeStyle = posData.color;
    simCtx.lineWidth = 1.5;
    simCtx.stroke();
    // Shroud lines
    for (let angle = -50; angle <= 50; angle += 25) {
      const rad = (angle * Math.PI) / 180;
      simCtx.beginPath();
      simCtx.moveTo(dx + Math.sin(rad) * s * 2.5, dy - s * 2);
      simCtx.lineTo(dx, dy);
      simCtx.strokeStyle = 'rgba(255,255,255,0.4)';
      simCtx.lineWidth = 0.8;
      simCtx.stroke();
    }
  } else {
    // Freefall — arms spread
    simCtx.save();
    simCtx.translate(dx, dy);
    // Body
    simCtx.fillStyle = '#ffffff';
    simCtx.beginPath();
    simCtx.roundRect(-s * 0.22, -s * 0.5, s * 0.44, s, 4);
    simCtx.fill();
    // Arms
    simCtx.beginPath();
    simCtx.roundRect(-s * 1, -s * 0.12, s * 0.8, s * 0.22, 4);
    simCtx.fill();
    simCtx.beginPath();
    simCtx.roundRect(s * 0.2, -s * 0.12, s * 0.8, s * 0.22, 4);
    simCtx.fill();
    // Head
    simCtx.beginPath();
    simCtx.arc(0, -s * 0.65, s * 0.28, 0, Math.PI * 2);
    simCtx.fillStyle = '#ffd6a0';
    simCtx.fill();
    // Helmet
    simCtx.beginPath();
    simCtx.arc(0, -s * 0.65, s * 0.3, Math.PI, 0);
    simCtx.fillStyle = posData.color;
    simCtx.fill();
    simCtx.restore();
  }

  // Altitude meter overlay
  const meterX = w - 70, meterY = 20, meterH = h - 40, meterW = 20;
  simCtx.fillStyle = 'rgba(0,0,0,0.5)';
  simCtx.roundRect(meterX, meterY, meterW, meterH, 6);
  simCtx.fill();

  const fillH = meterH * (simState.altitude / simState.maxAlt);
  const mGrad = simCtx.createLinearGradient(0, meterY, 0, meterY + meterH);
  mGrad.addColorStop(0, posData.color);
  mGrad.addColorStop(1, 'rgba(249,115,22,0.2)');
  simCtx.fillStyle = mGrad;
  simCtx.beginPath();
  simCtx.roundRect(meterX, meterY + meterH - fillH, meterW, fillH, 6);
  simCtx.fill();

  // Deploy zone marker
  const deployPct = 4500 / simState.maxAlt;
  const deployY = meterY + meterH * (1 - deployPct);
  simCtx.beginPath();
  simCtx.moveTo(meterX - 8, deployY);
  simCtx.lineTo(meterX + meterW + 4, deployY);
  simCtx.strokeStyle = '#fbbf24';
  simCtx.lineWidth = 1.5;
  simCtx.setLineDash([4, 4]);
  simCtx.stroke();
  simCtx.setLineDash([]);

  simCtx.fillStyle = '#fbbf24';
  simCtx.font = '9px Inter, sans-serif';
  simCtx.fillText('CHUTE', meterX - 35, deployY + 3);
}

/* ─── GALLERY ──────────────────────────────────────────────── */
const galleryData = [
  { emoji: '🪂', label: 'Into the blue sky', category: 'freefall', bg: 'linear-gradient(135deg,#0a1628,#1a3a5c)' },
  { emoji: '🌤️', label: 'Canopy ride at 5,000ft', category: 'canopy', bg: 'linear-gradient(135deg,#1a3a5c,#2a5a8c)' },
  { emoji: '🌏', label: 'Earth from above', category: 'freefall', bg: 'linear-gradient(135deg,#0d3349,#1a5c40)' },
  { emoji: '🏔️', label: 'Mountain panorama', category: 'canopy', bg: 'linear-gradient(135deg,#2a1a5c,#1a3a5c)' },
  { emoji: '🌅', label: 'Sunrise freefall', category: 'freefall', bg: 'linear-gradient(135deg,#5c1a0a,#1a3a5c)' },
  { emoji: '✈️', label: 'Exit from 15,000ft', category: 'freefall', bg: 'linear-gradient(135deg,#0a2a5c,#1a1a3a)' },
  { emoji: '🌊', label: 'Coastal jump', category: 'canopy', bg: 'linear-gradient(135deg,#0a3a5c,#0a1a3a)' },
  { emoji: '🎯', label: 'Perfect landing', category: 'landing', bg: 'linear-gradient(135deg,#1a5c1a,#0a2a0a)' },
  { emoji: '🤝', label: 'Team formation', category: 'freefall', bg: 'linear-gradient(135deg,#3a1a5c,#1a0a3a)' },
  { emoji: '🌸', label: 'Spring meadow landing', category: 'landing', bg: 'linear-gradient(135deg,#3a1a1a,#1a1a3a)' },
  { emoji: '❄️', label: 'Winter jump', category: 'freefall', bg: 'linear-gradient(135deg,#1a2a5c,#0a1a3a)' },
  { emoji: '🌇', label: 'Sunset canopy glide', category: 'canopy', bg: 'linear-gradient(135deg,#5c3a0a,#3a1a0a)' },
];

let lightboxIndex = 0;
let filteredItems = galleryData;

function buildGallery(filter = 'all') {
  const grid = document.getElementById('galleryGrid');
  filteredItems = filter === 'all' ? galleryData : galleryData.filter(d => d.category === filter);
  grid.innerHTML = '';
  filteredItems.forEach((item, i) => {
    const el = document.createElement('div');
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
  btn.addEventListener('click', function() {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    buildGallery(this.dataset.filter);
  });
});

function openLightbox(i) {
  lightboxIndex = i;
  renderLightbox();
  document.getElementById('lightbox').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  document.getElementById('lightbox').classList.remove('open');
  document.body.style.overflow = '';
}

function lightboxNav(dir) {
  lightboxIndex = (lightboxIndex + dir + filteredItems.length) % filteredItems.length;
  renderLightbox();
}

function renderLightbox() {
  const item = filteredItems[lightboxIndex];
  document.getElementById('lbImgWrap').style.background = item.bg;
  document.getElementById('lbImgWrap').textContent = item.emoji;
  document.getElementById('lbImgWrap').style.fontSize = '9rem';
  document.getElementById('lbCaption').textContent = `${item.label} — ${item.category}`;
}

// Keyboard nav for lightbox
document.addEventListener('keydown', e => {
  if (document.getElementById('lightbox').classList.contains('open')) {
    if (e.key === 'ArrowLeft') lightboxNav(-1);
    if (e.key === 'ArrowRight') lightboxNav(1);
    if (e.key === 'Escape') closeLightbox();
  }
  if (document.getElementById('modalOverlay').classList.contains('open') && e.key === 'Escape') {
    closeBooking();
  }
});

buildGallery();

/* ─── TESTIMONIALS CAROUSEL ────────────────────────────────── */
let carouselIndex = 0;
const totalSlides = document.querySelectorAll('.testimonial-card').length;

function buildDots() {
  const container = document.getElementById('carouselDots');
  container.innerHTML = '';
  for (let i = 0; i < totalSlides; i++) {
    const dot = document.createElement('div');
    dot.className = 'dot' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', () => goToSlide(i));
    container.appendChild(dot);
  }
}

function goToSlide(i) {
  carouselIndex = (i + totalSlides) % totalSlides;
  document.getElementById('testimonialsTrack').style.transform = `translateX(-${carouselIndex * 100}%)`;
  document.querySelectorAll('.dot').forEach((d, idx) => d.classList.toggle('active', idx === carouselIndex));
}

function moveCarousel(dir) {
  goToSlide(carouselIndex + dir);
}

buildDots();
setInterval(() => moveCarousel(1), 6000);

/* ─── FAQ ──────────────────────────────────────────────────── */
function toggleFaq(btn) {
  const answer = btn.nextElementSibling;
  const isOpen = answer.classList.contains('open');

  // Close all
  document.querySelectorAll('.faq-a').forEach(a => a.classList.remove('open'));
  document.querySelectorAll('.faq-q').forEach(b => b.classList.remove('open'));

  if (!isOpen) {
    answer.classList.add('open');
    btn.classList.add('open');
  }
}

/* ─── CONTACT FORM ─────────────────────────────────────────── */
function submitContact(e) {
  e.preventDefault();
  e.target.reset();
  showToast('Message sent! We\'ll get back to you within 24 hours.');
}

/* ─── TOAST ────────────────────────────────────────────────── */
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 4000);
}

/* ─── Smooth scroll for anchor links ──────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

/* ─── Parallax hero on scroll ──────────────────────────────── */
window.addEventListener('scroll', () => {
  const hero = document.getElementById('hero');
  const scrolled = window.scrollY;
  const heroContent = hero.querySelector('.hero-content');
  if (heroContent && scrolled < window.innerHeight) {
    heroContent.style.transform = `translateY(${scrolled * 0.3}px)`;
    heroContent.style.opacity = 1 - scrolled / (window.innerHeight * 0.7);
  }
});
