// ============================================
// CENTRALIZED NAVIGATION SYSTEM
// SKB ASMAT
// ============================================

/* --------------------------------------------
   LANGUAGE / i18n
-------------------------------------------- */
const TRANSLATIONS = {
    en: {
        nav_home: 'Home',
        nav_about: 'About',
        nav_programs: 'Programs',
        nav_courses: 'Courses',
        nav_activities: 'Activities',
        nav_news: 'News',
        nav_gallery: 'Gallery',
        nav_absent: 'Absent',
        nav_contact: 'Contact',

        sub_about_skb: 'About SKB',
        sub_history: 'History',
        sub_vision_mission: 'Vision & Mission',
        sub_management: 'Management',

        sub_edu_programs: 'Education Programs',
        sub_equiv_programs: 'Equivalency Programs',
        sub_skills_programs: 'Skills Programs',
        sub_community_programs: 'Community Programs',

        sub_english_course: 'English Course',
        sub_other_courses: 'Other Courses',
        sub_quiz_courses: 'Interactive Quiz',
        sub_video_courses: 'Video Courses',

        sub_activities: 'Activities',
        sub_events: 'Events',
        sub_documentation: 'Documentation',

        lang_switch_label: 'EN / ID',
        hamburger_label: 'Menu'
    },
    id: {
        nav_home: 'Beranda',
        nav_about: 'Tentang',
        nav_programs: 'Program',
        nav_courses: 'Kursus',
        nav_activities: 'Kegiatan',
        nav_news: 'Berita',
        nav_gallery: 'Galeri',
        nav_absent: 'Absen',
        nav_contact: 'Kontak',

        sub_about_skb: 'Tentang SKB',
        sub_history: 'Sejarah',
        sub_vision_mission: 'Visi & Misi',
        sub_management: 'Manajemen',

        sub_edu_programs: 'Program Pendidikan',
        sub_equiv_programs: 'Program Kesetaraan',
        sub_skills_programs: 'Program Keterampilan',
        sub_community_programs: 'Program Masyarakat',

        sub_english_course: 'Kursus Bahasa Inggris',
        sub_other_courses: 'Kursus Lainnya',
        sub_quiz_courses: 'Kuis Interaktif',
        sub_video_courses: 'Video Courses',

        sub_activities: 'Kegiatan',
        sub_events: 'Acara',
        sub_documentation: 'Dokumentasi',

        lang_switch_label: 'ID / EN',
        hamburger_label: 'Menu'
    }
};

const LANG_STORAGE_KEY = 'skb-asmat-lang';
const DEFAULT_LANG = 'en';

function getCurrentLang() {
    const stored = localStorage.getItem(LANG_STORAGE_KEY);
    return TRANSLATIONS[stored] ? stored : DEFAULT_LANG;
}

function setCurrentLang(lang) {
    if (!TRANSLATIONS[lang]) return;
    localStorage.setItem(LANG_STORAGE_KEY, lang);
}

function t(key) {
    const lang = getCurrentLang();
    return (TRANSLATIONS[lang] && TRANSLATIONS[lang][key])
        || TRANSLATIONS[DEFAULT_LANG][key]
        || key;
}

/* --------------------------------------------
   MENU STRUCTURE (uses i18n keys)
-------------------------------------------- */
const MENU_STRUCTURE = [
    { key: 'nav_home', url: 'index.html' },
    {
        key: 'nav_about',
        dropdown: [
            { key: 'sub_about_skb', url: 'about.html' },
            { key: 'sub_history', url: 'about.html#history' },
            { key: 'sub_vision_mission', url: 'about.html#vision-mission' },
            { key: 'sub_management', url: 'about.html#management' }
        ]
    },
    {
        key: 'nav_programs',
        dropdown: [
            { key: 'sub_edu_programs', url: 'programs.html#education' },
            { key: 'sub_equiv_programs', url: 'programs.html#equivalency' },
            { key: 'sub_skills_programs', url: 'programs.html#skills' },
            { key: 'sub_community_programs', url: 'programs.html#community' }
        ]
    },
    {
        key: 'nav_courses',
        dropdown: [
            { key: 'sub_english_course', url: 'courses.html#english' },
            { key: 'sub_other_courses', url: 'courses.html#other' },
            { key: 'sub_quiz_courses', url: 'quiz.html#interactive-quiz' },
            { key: 'sub_video_courses', url: 'video.html' }
        ]
    },
    {
        key: 'nav_activities',
        dropdown: [
            { key: 'sub_activities', url: 'activities.html' },
            { key: 'sub_events', url: 'activities.html#events' },
            { key: 'sub_documentation', url: 'activities.html#documentation' }
        ]
    },
    { key: 'nav_news', url: 'news.html' },
    { key: 'nav_gallery', url: 'gallery.html' },
    { key: 'nav_absent', url: 'absent.html' },
    { key: 'nav_contact', url: 'contact.html' }
];

/* --------------------------------------------
   RENDER HELPERS
-------------------------------------------- */
function renderNavLinks() {
    let html = '';
    MENU_STRUCTURE.forEach(item => {
        if (item.dropdown) {
            html += `<li class="has-dropdown">
        <a href="#" aria-haspopup="true" aria-expanded="false">${t(item.key)}</a>
        <ul class="dropdown-menu">`;
            item.dropdown.forEach(sub => {
                html += `<li><a href="${sub.url}">${t(sub.key)}</a></li>`;
            });
            html += `</ul></li>`;
        } else {
            html += `<li><a href="${item.url}">${t(item.key)}</a></li>`;
        }
    });
    return html;
}

function renderMobileMenu() {
    let html = '';
    MENU_STRUCTURE.forEach(item => {
        if (item.dropdown) {
            html += `
        <div class="mobile-dropdown-item">
          <div class="mobile-dropdown-toggle" role="button" tabindex="0" aria-expanded="false">
            <span>${t(item.key)}</span>
            <span class="toggle-icon" aria-hidden="true">▼</span>
          </div>
          <div class="mobile-submenu">`;
            item.dropdown.forEach(sub => {
                html += `<a href="${sub.url}">${t(sub.key)}</a>`;
            });
            html += `</div></div>`;
        } else {
            html += `<a href="${item.url}">${t(item.key)}</a>`;
        }
    });
    return html;
}

function renderNavbar() {
    const lang = getCurrentLang();
    const nextLang = lang === 'en' ? 'id' : 'en';

    return `
  <nav class="navbar" aria-label="Main navigation">
    <div class="container">
      <div class="nav-inner">
        <a href="index.html" class="logo" aria-label="SKB Asmat Home">
          <img src="images/Logo1.png" alt="SKB Asmat Logo" class="logo-img">
          <div class="logo-text">
            <span class="logo-title">SKB KABUPATEN ASMAT</span>
            <span class="logo-sub">ASMAT ENGLISH COURSE</span>
          </div>
        </a>

        <ul class="nav-links">
          ${renderNavLinks()}
        </ul>

        <div class="nav-right">
          <button
            class="lang-toggle"
            id="langToggleBtn"
            aria-label="Switch language"
            data-next-lang="${nextLang}">
            ${t('lang_switch_label')}
          </button>
          <button class="hamburger" aria-label="${t('hamburger_label')}" aria-expanded="false" aria-controls="mobileMenu">
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>
    </div>
  </nav>
  <div class="mobile-menu" id="mobileMenu" aria-hidden="true">
    ${renderMobileMenu()}
  </div>
  `;
}

/* --------------------------------------------
   INIT
-------------------------------------------- */
function initNavigation() {
    const existingNav = document.querySelector('nav.navbar');
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = renderNavbar();
    const newNavbar = tempDiv.querySelector('nav.navbar');
    const newMobileMenu = tempDiv.querySelector('#mobileMenu');

    // Remove any existing mobile menu first
    const oldMobileMenu = document.getElementById('mobileMenu');
    if (oldMobileMenu) oldMobileMenu.remove();

    if (existingNav) {
        existingNav.parentNode.replaceChild(newNavbar, existingNav);
    } else {
        document.body.insertBefore(newNavbar, document.body.firstChild);
    }

    if (newMobileMenu) document.body.appendChild(newMobileMenu);

    attachAllEvents();
    updateActiveNavLink();
}

/* --------------------------------------------
   EVENTS
-------------------------------------------- */
function attachAllEvents() {
    /* --- Hamburger toggle --- */
    const hamburger = document.querySelector('.hamburger');
    const mobileMenu = document.getElementById('mobileMenu');

    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', function (e) {
            e.stopPropagation();
            const isOpen = mobileMenu.classList.toggle('active');
            this.classList.toggle('active', isOpen);
            this.setAttribute('aria-expanded', String(isOpen));
            mobileMenu.setAttribute('aria-hidden', String(!isOpen));
            document.body.classList.toggle('menu-open', isOpen);
        });
    }

    /* --- Mobile submenu toggles --- */
    document.querySelectorAll('.mobile-dropdown-toggle').forEach(toggle => {
        const handler = function (e) {
            e.stopPropagation();
            const submenu = this.nextElementSibling;
            const isOpen = this.classList.toggle('open');
            this.setAttribute('aria-expanded', String(isOpen));
            if (submenu) {
                submenu.style.maxHeight = isOpen ? submenu.scrollHeight + 'px' : null;
            }
        };

        toggle.addEventListener('click', handler);
        toggle.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handler.call(this, e);
            }
        });
    });

    /* --- Close mobile menu on link click --- */
    document.querySelectorAll('#mobileMenu a').forEach(link => {
        link.addEventListener('click', function () {
            closeMobileMenu();
        });
    });

    /* --- Language switcher --- */
    const langBtn = document.getElementById('langToggleBtn');
    if (langBtn) {
        langBtn.addEventListener('click', function () {
            const next = this.dataset.nextLang || 'id';
            setCurrentLang(next);
            initNavigation();       // re-render navbar with new language
            document.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang: next } }));
        });
    }

    /* --- Dropdown keyboard support (desktop) --- */
    document.querySelectorAll('.nav-links .has-dropdown > a').forEach(link => {
        link.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                const expanded = this.getAttribute('aria-expanded') === 'true';
                this.setAttribute('aria-expanded', String(!expanded));
                const submenu = this.nextElementSibling;
                if (submenu) submenu.classList.toggle('open');
            }
        });
    });

    /* --- Close dropdown on outside click --- */
    document.addEventListener('click', function (e) {
        if (!e.target.closest('.has-dropdown')) {
            document.querySelectorAll('.has-dropdown > a[aria-expanded="true"]').forEach(a => {
                a.setAttribute('aria-expanded', 'false');
                if (a.nextElementSibling) a.nextElementSibling.classList.remove('open');
            });
        }
    });

    /* --- Escape closes mobile menu --- */
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            closeMobileMenu();
        }
    });
}

/* --------------------------------------------
   MOBILE MENU HELPERS
-------------------------------------------- */
function closeMobileMenu() {
    const mobileMenuDiv = document.getElementById('mobileMenu');
    const hamburgerBtn = document.querySelector('.hamburger');

    if (mobileMenuDiv && mobileMenuDiv.classList.contains('active')) {
        mobileMenuDiv.classList.remove('active');
        mobileMenuDiv.setAttribute('aria-hidden', 'true');
    }
    if (hamburgerBtn) {
        hamburgerBtn.classList.remove('active');
        hamburgerBtn.setAttribute('aria-expanded', 'false');
    }
    document.body.classList.remove('menu-open');
}

/* --------------------------------------------
   ACTIVE LINK
-------------------------------------------- */
function updateActiveNavLink() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const currentHash = window.location.hash || '';
    const fullPath = currentPath + currentHash;

    /* Desktop links */
    document.querySelectorAll('.nav-links li').forEach(li => {
        const link = li.querySelector(':scope > a');
        if (!link) return;
        const href = link.getAttribute('href');

        if (li.classList.contains('has-dropdown')) {
            // Try exact match first (path + hash), then path + any hash, then path only
            const match =
                li.querySelector(`.dropdown-menu a[href="${fullPath}"]`) ||
                li.querySelector(`.dropdown-menu a[href^="${currentPath}#"]`) ||
                li.querySelector(`.dropdown-menu a[href="${currentPath}"]`);

            li.classList.toggle('active-parent', !!match);
            link.classList.remove('active');
        } else {
            link.classList.toggle('active', href === currentPath);
        }
    });

    /* Mobile links */
    document.querySelectorAll('#mobileMenu a').forEach(link => {
        const href = link.getAttribute('href');
        const isActive = href === currentPath || href === fullPath;
        link.classList.toggle('active', isActive);
    });

    /* Mobile parent (dropdown) highlight */
    document.querySelectorAll('#mobileMenu .mobile-dropdown-item').forEach(item => {
        const hasActiveChild = item.querySelector('a.active');
        item.classList.toggle('active-parent', !!hasActiveChild);
    });
}

/* --------------------------------------------
   NAVBAR STYLES (injected — fallback)
   NOTE: main styles live in css/style.css.
   These are only fallbacks for nav-specific bits.
-------------------------------------------- */
function injectNavbarStyles() {
    if (document.getElementById('navbar-dynamic-styles')) return;

    const styles = `
    .nav-right { display: flex; align-items: center; gap: 12px; }
    .nav-links li { position: relative; }
    .dropdown-menu {
      position: absolute; top: 100%; left: 0;
      background: var(--card-bg, #fff);
      border: 1px solid var(--border, #e5e7eb);
      border-radius: 12px; min-width: 200px;
      opacity: 0; visibility: hidden; transform: translateY(-10px);
      transition: opacity .2s ease, transform .2s ease, visibility .2s;
      z-index: 1000; box-shadow: 0 10px 25px -5px rgba(0,0,0,.1);
      list-style: none; padding: 8px 0; margin: 0;
    }
    .dropdown-menu li { list-style: none; }
    .dropdown-menu a {
      display: block; padding: 10px 18px;
      font-size: .9rem; white-space: nowrap;
      color: var(--text, #111); text-decoration: none;
    }
    .dropdown-menu a:hover { background: var(--bg2, #f3f4f6); }
    .nav-links li:hover .dropdown-menu,
    .nav-links li.has-dropdown > a[aria-expanded="true"] + .dropdown-menu,
    .dropdown-menu.open {
      opacity: 1; visibility: visible; transform: translateY(0);
    }
    .has-dropdown > a::after {
      content: " ▼"; font-size: .65rem; margin-left: 4px; opacity: .7;
    }
    .has-dropdown.active-parent > a { color: var(--primary, #2563eb); }

    .mobile-dropdown-item { border-bottom: 1px solid var(--border, #e5e7eb); }
    .mobile-dropdown-toggle {
      display: flex; justify-content: space-between; align-items: center;
      padding: 14px 20px; cursor: pointer; font-weight: 500;
      color: var(--text, #111);
    }
    .mobile-dropdown-toggle .toggle-icon { font-size: .7rem; transition: transform .2s; }
    .mobile-dropdown-toggle.open .toggle-icon { transform: rotate(180deg); }
    .mobile-submenu {
      max-height: 0; overflow: hidden; transition: max-height .3s ease;
      background: var(--bg2, #f9fafb);
    }
    .mobile-submenu a {
      display: block; padding: 10px 20px 10px 40px;
      font-size: .9rem; color: var(--text2, #374151); text-decoration: none;
    }
    .mobile-submenu a:hover { background: var(--bg3, #f3f4f6); }
    .mobile-submenu a.active { color: var(--primary, #2563eb); font-weight: 600; }

    .hamburger {
      cursor: pointer; background: none; border: none;
      display: none; flex-direction: column; gap: 5px;
      padding: 10px; z-index: 1100;
    }
    .hamburger span { width: 22px; height: 2px; background: var(--text, #111); transition: all .3s ease; }
    .hamburger.active span:nth-child(1) { transform: rotate(45deg) translate(5px, 5px); }
    .hamburger.active span:nth-child(2) { opacity: 0; }
    .hamburger.active span:nth-child(3) { transform: rotate(-45deg) translate(5px, -5px); }

    .lang-toggle {
      background: transparent; color: var(--text, #111);
      border: 1px solid var(--border, #e5e7eb);
      border-radius: 8px; padding: 6px 12px;
      font-weight: 600; font-size: .85rem; cursor: pointer;
      transition: background .2s, color .2s;
    }
    .lang-toggle:hover { background: var(--primary, #2563eb); color: #fff; border-color: var(--primary, #2563eb); }

    .mobile-menu {
      position: fixed; top: 69px; left: -100%;
      width: 80%; max-width: 320px;
      height: calc(100% - 69px);
      background: var(--card-bg, #fff);
      border-right: 1px solid var(--border, #e5e7eb);
      transition: left .3s ease; z-index: 999;
      overflow-y: auto; box-shadow: 2px 0 10px rgba(0,0,0,.1);
    }
    .mobile-menu.active { left: 0; }
    .mobile-menu > a {
      display: block; padding: 14px 20px;
      border-bottom: 1px solid var(--border, #e5e7eb);
      color: var(--text, #111); text-decoration: none;
    }
    .mobile-menu > a.active { color: var(--primary, #2563eb); font-weight: 600; }
    body.menu-open { overflow: hidden; }

    @media (max-width: 992px) {
      .nav-links { display: none !important; }
      .hamburger { display: flex !important; }
    }
  `;

    const styleSheet = document.createElement('style');
    styleSheet.id = 'navbar-dynamic-styles';
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
}

/* --------------------------------------------
   START
-------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
    injectNavbarStyles();
    initNavigation();
});

window.addEventListener('popstate', () => {
    setTimeout(updateActiveNavLink, 50);
});

window.addEventListener('hashchange', updateActiveNavLink);s