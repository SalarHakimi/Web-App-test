/* ============================================================
   THE COMMODORE — Main JavaScript
   ============================================================ */

// ── NAV SCROLL BEHAVIOUR ──
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
});

// ── MOBILE HAMBURGER ──
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');
hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});
document.querySelectorAll('.nav__links a').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

// ── FLOOR PLAN FILTER TABS ──
const tabs        = document.querySelectorAll('.tab');
const fpCards     = document.querySelectorAll('.fp-card');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    const filter = tab.dataset.filter;
    fpCards.forEach(card => {
      const match = filter === 'all' || card.dataset.type === filter;
      card.style.display = match ? '' : 'none';
      if (match) {
        card.style.animation = 'none';
        card.offsetHeight; // trigger reflow
        card.style.animation = 'fadeUp 0.4s ease both';
      }
    });
  });
});

// ── SCROLL REVEAL ──
const revealObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

const revealTargets = [
  '.section-eyebrow', '.section-title', '.section-subtitle',
  '.fp-card', '.amenity', '.gallery__item',
  '.neighborhood__list li', '.pets__list li',
  '.stats__item', '.contact__info-item',
  '.intro__text', '.intro__image',
  '.neighborhood__text', '.neighborhood__image',
  '.pets__text', '.pets__image',
  '.ori__text', '.ori__image',
].join(',');

document.querySelectorAll(revealTargets).forEach((el, i) => {
  el.classList.add('reveal');
  el.style.transitionDelay = `${(i % 4) * 0.08}s`;
  revealObserver.observe(el);
});

// ── CONTACT FORM ──
const tourForm    = document.getElementById('tourForm');
const formSuccess = document.getElementById('formSuccess');

if (tourForm) {
  tourForm.addEventListener('submit', e => {
    e.preventDefault();

    const required = tourForm.querySelectorAll('[required]');
    let valid = true;
    required.forEach(field => {
      field.style.borderColor = '';
      if (!field.value.trim()) {
        field.style.borderColor = '#E07B54';
        valid = false;
      }
    });

    const emailField = tourForm.querySelector('#email');
    if (emailField && emailField.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailField.value)) {
      emailField.style.borderColor = '#E07B54';
      valid = false;
    }

    if (!valid) return;

    const btn = tourForm.querySelector('button[type="submit"]');
    btn.textContent = 'Sending...';
    btn.disabled = true;

    setTimeout(() => {
      tourForm.style.display = 'none';
      formSuccess.style.display = 'block';
    }, 900);
  });
}

// ── SMOOTH SCROLL FOR ANCHOR LINKS ──
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const navH = navbar.offsetHeight;
      const top  = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

// ── GALLERY LIGHTBOX (minimal) ──
const galleryItems = document.querySelectorAll('.gallery__item');
galleryItems.forEach(item => {
  item.addEventListener('click', () => {
    const img = item.querySelector('img');
    const src = img ? img.src : null;
    if (!src) return;

    const overlay = document.createElement('div');
    overlay.style.cssText = [
      'position:fixed','inset:0','z-index:9999',
      'background:rgba(0,0,0,0.92)',
      'display:flex','align-items:center','justify-content:center',
      'cursor:zoom-out','animation:fadeUpOverlay 0.25s ease'
    ].join(';');

    const style = document.createElement('style');
    style.textContent = '@keyframes fadeUpOverlay{from{opacity:0}to{opacity:1}}';
    document.head.appendChild(style);

    const image = document.createElement('img');
    image.src = src;
    image.style.cssText = 'max-width:90vw;max-height:90vh;object-fit:contain;border-radius:4px;box-shadow:0 30px 80px rgba(0,0,0,0.5);';

    const close = document.createElement('button');
    close.innerHTML = '&times;';
    close.style.cssText = [
      'position:absolute','top:1.5rem','right:1.5rem',
      'background:none','border:none','color:#fff',
      'font-size:2.5rem','cursor:pointer','line-height:1'
    ].join(';');

    overlay.appendChild(image);
    overlay.appendChild(close);
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';

    const cleanup = () => {
      document.body.removeChild(overlay);
      document.body.style.overflow = '';
    };
    close.addEventListener('click', cleanup);
    overlay.addEventListener('click', e => { if (e.target === overlay) cleanup(); });
    document.addEventListener('keydown', function esc(e) {
      if (e.key === 'Escape') { cleanup(); document.removeEventListener('keydown', esc); }
    });
  });
});
