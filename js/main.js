// ============================================
// MAIN JAVASCRIPT
// SKB ASMAT
// General website functions: scroll effects,
// back-to-top, animations, counters, notifications.
// Navigation logic lives in navbar.js.
// ============================================

/* --------------------------------------------
   NOTIFICATIONS (used by other modules)
-------------------------------------------- */
function showNotif(text, type = 'success') {
  const existing = document.querySelector('.notif');
  if (existing) existing.remove();

  const notif = document.createElement('div');
  notif.className = 'notif notif-' + type;
  notif.setAttribute('role', 'status');
  notif.setAttribute('aria-live', 'polite');
  notif.innerHTML = `${type === 'success' ? '✅' : '⚠️'} ${text}`;
  document.body.appendChild(notif);

  requestAnimationFrame(() => notif.classList.add('show'));

  setTimeout(() => {
    notif.classList.remove('show');
    setTimeout(() => notif.remove(), 300);
  }, 3000);
}

/* --------------------------------------------
   FADE-UP ON SCROLL
-------------------------------------------- */
function initFadeUp() {
  const els = document.querySelectorAll('.fade-up');
  if (!els.length) return;

  if (!('IntersectionObserver' in window)) {
    // Fallback: show everything
    els.forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 80);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => observer.observe(el));
}

/* --------------------------------------------
   BACK TO TOP BUTTON
-------------------------------------------- */
function initBackToTop() {
  let btn = document.getElementById('backToTop');

  if (!btn) {
    btn = document.createElement('button');
    btn.id = 'backToTop';
    btn.className = 'back-to-top';
    btn.setAttribute('aria-label', 'Back to top');
    btn.innerHTML = '↑';
    document.body.appendChild(btn);
  }

  const onScroll = () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  };

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* --------------------------------------------
   STAT COUNTERS
   Usage: <span class="counter" data-target="250">0</span>
-------------------------------------------- */
function initCounters() {
  const counters = document.querySelectorAll('.counter');
  if (!counters.length) return;

  const animate = (el) => {
    const target = parseInt(el.getAttribute('data-target'), 10) || 0;
    const duration = 1500;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      // easeOutQuad
      const eased = 1 - (1 - progress) * (1 - progress);
      el.textContent = Math.floor(eased * target).toLocaleString();
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = target.toLocaleString();
    };
    requestAnimationFrame(tick);
  };

  if (!('IntersectionObserver' in window)) {
    counters.forEach(animate);
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animate(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
}

/* --------------------------------------------
   SMOOTH SCROLL FOR IN-PAGE ANCHORS
-------------------------------------------- */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId.length < 2) return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      const navHeight = document.querySelector('.navbar')?.offsetHeight || 70;
      const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 10;

      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

/* --------------------------------------------
   STICKY NAVBAR SHADOW ON SCROLL
-------------------------------------------- */
function initNavbarScroll() {
  const nav = document.querySelector('.navbar');
  if (!nav) return;

  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* --------------------------------------------
   CURRENT YEAR IN FOOTER
   Usage: <span data-year></span>
-------------------------------------------- */
function initFooterYear() {
  document.querySelectorAll('[data-year]').forEach(el => {
    el.textContent = new Date().getFullYear();
  });
}

/* --------------------------------------------
   LANGUAGE-CHANGED HOOK
   navbar.js fires this. Pages that inject
   dynamic text can listen and re-render.
-------------------------------------------- */
document.addEventListener('languageChanged', (e) => {
  const lang = e.detail?.lang || 'en';
  document.documentElement.setAttribute('lang', lang);
});

/* --------------------------------------------
   INIT
-------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  // Set <html lang> from saved preference (navbar.js handles storage)
  const savedLang = localStorage.getItem('skb-asmat-lang') || 'en';
  document.documentElement.setAttribute('lang', savedLang);

  initFadeUp();
  initBackToTop();
  initCounters();
  initSmoothScroll();
  initNavbarScroll();
  initFooterYear();
});

let x = 10
if (x > 5) {
  console.log("x is greater than 5");
}   
if (x <= 5) {
    console.log("x is less than or equal to 5");    
}