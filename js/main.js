// ============================================
// MAIN JAVASCRIPT
// SKB ASMAT — English Prime Course
// ============================================
// General website functions:
// - Notifications (toast)
// - Fade-up on scroll
// - Back-to-top button
// - Stat counters
// - Smooth scroll for anchors
// - Sticky navbar shadow
// - Auto-update footer year
// - Scroll reveal (fade-up, fade-left, fade-right, fade-in, zoom-in, stagger)
// - FAQ accordion (with auto-close)
// Navigation logic lives in navbar.js.
// ============================================


/* ============================================================
   1. NOTIFICATIONS (TOAST)
   ============================================================ */
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


/* ============================================================
   2. FADE-UP ON SCROLL (LEGACY)
   ============================================================ */
function initFadeUp() {
  const els = document.querySelectorAll('.fade-up');
  if (!els.length) return;

  if (!('IntersectionObserver' in window)) {
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


/* ============================================================
   3. BACK TO TOP BUTTON
   ============================================================ */
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


/* ============================================================
   4. STAT COUNTERS
   Usage: <span class="counter" data-target="250">0</span>
   ============================================================ */
function initCounters() {
  const counters = document.querySelectorAll('.counter');
  if (!counters.length) return;

  const animate = (el) => {
    const target = parseInt(el.getAttribute('data-target'), 10) || 0;
    const duration = 1500;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - (1 - progress) * (1 - progress); // easeOutQuad
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


/* ============================================================
   5. SMOOTH SCROLL FOR IN-PAGE ANCHORS
   ============================================================ */
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


/* ============================================================
   6. STICKY NAVBAR SHADOW ON SCROLL
   ============================================================ */
function initNavbarScroll() {
  const nav = document.querySelector('.navbar');
  if (!nav) return;

  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}


/* ============================================================
   7. AUTO-UPDATE FOOTER YEAR
   Usage: <span data-year></span>
   ============================================================ */
function initFooterYear() {
  document.querySelectorAll('[data-year]').forEach(el => {
    el.textContent = new Date().getFullYear();
  });
}


/* ============================================================
   8. SCROLL REVEAL — INTERSECTION OBSERVER
   ============================================================
   Detects elements with these classes:
     .fade-up, .fade-left, .fade-right, .fade-in, .zoom-in, .stagger
   Adds .visible class when element enters viewport.
   ============================================================ */
function initScrollReveal() {
  const selectors = '.fade-up, .fade-left, .fade-right, .fade-in, .zoom-in, .stagger';
  const elements = document.querySelectorAll(selectors);

  if (!elements.length) return;

  if (!('IntersectionObserver' in window)) {
    elements.forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -50px 0px'
  });

  elements.forEach(el => observer.observe(el));
}


/* ============================================================
   9. FAQ ACCORDION
   ============================================================
   Features:
   1. Click a question → toggle that item
   2. Opening one FAQ → closes the others (exclusive mode)
   3. Click outside .faq-list → closes all FAQs
   4. Press Escape → closes all FAQs
   5. Scroll away from .faq-list → closes all FAQs
      (optional — disable by setting FAQ_CLOSE_ON_SCROLL = false)
   ============================================================ */
const FAQ_CLOSE_ON_SCROLL = true;

function initFAQ() {
  const faqItems = document.querySelectorAll('.faq-item');
  if (!faqItems.length) return;

  const faqList = document.querySelector('.faq-list');

  /* --------------------------------------------
     Helper: close all FAQs
  -------------------------------------------- */
  const closeAllFAQ = () => {
    faqItems.forEach(item => {
      item.classList.remove('open');
      const btn = item.querySelector('.faq-question');
      if (btn) btn.setAttribute('aria-expanded', 'false');
    });
  };

  /* --------------------------------------------
     Helper: close all FAQs except current
  -------------------------------------------- */
  const closeOthersFAQ = (currentItem) => {
    faqItems.forEach(other => {
      if (other !== currentItem) {
        other.classList.remove('open');
        const otherBtn = other.querySelector('.faq-question');
        if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
      }
    });
  };

  /* --------------------------------------------
     1. Click question → toggle + close others
  -------------------------------------------- */
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    if (!question) return;

    question.addEventListener('click', (e) => {
      e.stopPropagation(); // prevent outside-click handler from firing

      const isOpen = item.classList.contains('open');

      closeOthersFAQ(item);

      item.classList.toggle('open');
      question.setAttribute('aria-expanded', String(!isOpen));
    });
  });

  /* --------------------------------------------
     2. Click outside FAQ → close all
  -------------------------------------------- */
  document.addEventListener('click', (e) => {
    if (e.target.closest('.faq-list')) return;

    if (document.querySelector('.faq-item.open')) {
      closeAllFAQ();
    }
  });

  /* --------------------------------------------
     3. Press Escape → close all
  -------------------------------------------- */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.querySelector('.faq-item.open')) {
      closeAllFAQ();
    }
  });

  /* --------------------------------------------
     4. Scroll away from FAQ → close all
  -------------------------------------------- */
  if (FAQ_CLOSE_ON_SCROLL && faqList) {
    const scrollObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) {
          if (document.querySelector('.faq-item.open')) {
            closeAllFAQ();
          }
        }
      });
    }, {
      threshold: 0,
      rootMargin: '-80px 0px -80px 0px'
    });

    scrollObserver.observe(faqList);
  }
}


/* ============================================================
   10. LANGUAGE-CHANGED HOOK
   navbar.js fires this event.
   ============================================================ */
document.addEventListener('languageChanged', (e) => {
  const lang = e.detail?.lang || 'en';
  document.documentElement.setAttribute('lang', lang);
});


/* ============================================================
   11. INIT — run once when DOM is ready
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  // Set <html lang> from saved preference
  const savedLang = localStorage.getItem('skb-asmat-lang') || 'en';
  document.documentElement.setAttribute('lang', savedLang);

  // Initialize all modules
  initFadeUp();
  initBackToTop();
  initCounters();
  initSmoothScroll();
  initNavbarScroll();
  initFooterYear();
  initScrollReveal();
  initFAQ();
});


/* ============================================================
   12. RE-RUN SCROLL REVEAL AFTER FULL LOAD
   Useful if images/fonts shift the layout after DOM ready.
   ============================================================ */
window.addEventListener('load', () => {
  initScrollReveal();
});