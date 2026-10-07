/* ============================================================
   BLOG PAGE LOGIC — News Layout with Sidebar
   - Baca artikel dari BLOG_DATA (file lokal — instant!)
   - Render featured article
   - Render grid cards
   - Render sidebar (latest + categories)
   - Load More (pagination)
   
   NOTE: Search & filter chips di toolbar sudah dihapus.
         Kategori di sidebar tetap berfungsi untuk filter.
   ============================================================ */

(function () {
    'use strict';

    /* ============================================================
       CONFIG
       ============================================================ */
    const ITEMS_PER_PAGE = 4;
    const SIDEBAR_LIMIT = 5;
    const PLACEHOLDER_IMG = 'images/blog/Video.png';

    const CATEGORY_INFO = {
        news: { label: 'News', color: '#3b82f6' },
        event: { label: 'Event', color: '#f59e0b' },
        achievement: { label: 'Achievement', color: '#ef4444' },
        activity: { label: 'Activity', color: '#8b5cf6' },
        workshop: { label: 'Workshop', color: '#06b6d4' },
        tips: { label: 'Tips', color: '#10b981' }
    };

    /* ============================================================
       STATE
       ============================================================ */
    let allArticles = [];
    let filteredArticles = [];
    let currentPage = 1;
    let activeCategory = 'all';

    /* ============================================================
       HELPERS
       ============================================================ */
    function escapeHtml(s) {
        return String(s == null ? '' : s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function formatDate(isoDate) {
        if (!isoDate) return '';
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const d = new Date(isoDate);
        if (isNaN(d.getTime())) return isoDate;
        return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    }

    function getCategoryInfo(cat) {
        return CATEGORY_INFO[cat] || { label: 'Article', color: '#64748b' };
    }

    function getReadingTime(content) {
        const text = String(content || '').replace(/<[^>]+>/g, ' ');
        const words = text.trim().split(/\s+/).filter(Boolean).length;
        return Math.max(1, Math.round(words / 200));
    }

    function stripHtml(html) {
        const tmp = document.createElement('div');
        tmp.innerHTML = html || '';
        return (tmp.textContent || tmp.innerText || '').trim();
    }

    /* ============================================================
       INIT DATA
       ============================================================ */
    function initData() {
        if (typeof BLOG_DATA === 'undefined') {
            console.error('❌ BLOG_DATA tidak ditemukan.');
            allArticles = [];
            return;
        }

        allArticles = [...BLOG_DATA].sort((a, b) => {
            return new Date(b.date || 0) - new Date(a.date || 0);
        });

        filteredArticles = [...allArticles];
    }

    /* ============================================================
       RENDER FEATURED
       ============================================================ */
    function renderFeatured() {
        const section = document.getElementById('featuredSection');
        const container = document.getElementById('featuredContent');
        if (!section || !container) return;

        const featured = allArticles.find(a => a.featured) || null;
        if (!featured) {
            section.style.display = 'none';
            return;
        }

        const cat = getCategoryInfo(featured.category);
        const readingTime = getReadingTime(featured.content);

        container.innerHTML = `
            <a class="featured-card" href="post.html?id=${encodeURIComponent(featured.id)}">
                <div class="featured-media">
                    <span class="featured-badge">
                        <i class="fas fa-star"></i>
                        Featured
                    </span>
                    <img src="${escapeHtml(featured.thumbnail || PLACEHOLDER_IMG)}"
                         alt="${escapeHtml(featured.title)}"
                         loading="eager"
                         onerror="this.onerror=null;this.src='${PLACEHOLDER_IMG}';">
                </div>
                <div class="featured-body">
                    <span class="featured-cat" style="background: ${cat.color}1a; color: ${cat.color};">
                        ${escapeHtml(cat.label)}
                    </span>
                    <h2 class="featured-title">${escapeHtml(featured.title)}</h2>
                    <p class="featured-excerpt">${escapeHtml(featured.excerpt || stripHtml(featured.content).slice(0, 180))}</p>
                    <div class="featured-meta">
                        <span><i class="fas fa-user"></i> ${escapeHtml(featured.author || 'Admin')}</span>
                        <span><i class="fas fa-calendar"></i> ${formatDate(featured.date)}</span>
                        <span><i class="fas fa-clock"></i> ${readingTime} min read</span>
                    </div>
                </div>
            </a>
        `;

        section.style.display = 'block';
    }

    /* ============================================================
       RENDER SIDEBAR — Artikel Vertikal
       ============================================================ */
    function renderSidebar() {
        const container = document.getElementById('sidebarArticles');
        if (!container) return;

        const sidebarArticles = allArticles
            .filter(a => !a.featured)
            .slice(0, SIDEBAR_LIMIT);

        if (sidebarArticles.length === 0) {
            container.innerHTML = `
                <p style="font-size:0.8rem; color:var(--text3); text-align:center; padding:20px 0;">
                    Belum ada artikel lain.
                </p>
            `;
            return;
        }

        container.innerHTML = sidebarArticles.map(a => {
            const cat = getCategoryInfo(a.category);
            return `
                <a class="sidebar-article" href="post.html?id=${encodeURIComponent(a.id)}">
                    <div class="sidebar-article-img">
                        <img src="${escapeHtml(a.thumbnail || PLACEHOLDER_IMG)}"
                             alt="${escapeHtml(a.title)}"
                             loading="lazy"
                             onerror="this.onerror=null;this.src='${PLACEHOLDER_IMG}';">
                    </div>
                    <div class="sidebar-article-body">
                        <span class="sidebar-article-cat" style="color: ${cat.color};">
                            ${escapeHtml(cat.label)}
                        </span>
                        <h4 class="sidebar-article-title">${escapeHtml(a.title)}</h4>
                        <span class="sidebar-article-date">
                            <i class="fas fa-calendar"></i>
                            ${formatDate(a.date)}
                        </span>
                    </div>
                </a>
            `;
        }).join('');
    }

    /* ============================================================
       RENDER SIDEBAR — Kategori
       ============================================================ */
    function renderSidebarCategories() {
        const container = document.getElementById('sidebarCategories');
        if (!container) return;

        const counts = {};
        allArticles.forEach(a => {
            if (a.category) {
                counts[a.category] = (counts[a.category] || 0) + 1;
            }
        });

        const cats = Object.keys(counts).sort();

        if (cats.length === 0) {
            container.innerHTML = '';
            return;
        }

        container.innerHTML = cats.map(cat => {
            const info = getCategoryInfo(cat);
            return `
                <button class="sidebar-cat-item" data-cat="${escapeHtml(cat)}" type="button">
                    <span>${escapeHtml(info.label)}</span>
                    <span class="cat-count">${counts[cat]}</span>
                </button>
            `;
        }).join('');

        // Handle klik kategori
        container.querySelectorAll('.sidebar-cat-item').forEach(btn => {
            btn.addEventListener('click', function () {
                const cat = this.dataset.cat;

                // Kalau kategori sama dengan yang aktif → reset ke 'all'
                activeCategory = (activeCategory === cat) ? 'all' : cat;

                applyFilter();

                // Scroll ke grid
                const grid = document.getElementById('blogGrid');
                if (grid) {
                    grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    }

    /* ============================================================
       RENDER GRID
       ============================================================ */
    function renderGrid(resetPage) {
        const grid = document.getElementById('blogGrid');
        const loadmoreWrap = document.getElementById('loadmoreWrap');
        const loadmoreBtn = document.getElementById('loadmoreBtn');
        const counter = document.getElementById('articleCounter');

        if (!grid) return;

        if (resetPage) currentPage = 1;

        if (filteredArticles.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-newspaper"></i>
                    <h3>No articles yet</h3>
                    <p>Check back later for new articles.</p>
                </div>
            `;
            if (loadmoreWrap) loadmoreWrap.style.display = 'none';
            return;
        }

        const end = currentPage * ITEMS_PER_PAGE;
        const visible = filteredArticles.slice(0, end);

        grid.innerHTML = visible.map(renderCard).join('');

        const hasMore = end < filteredArticles.length;
        if (loadmoreWrap) {
            loadmoreWrap.style.display = hasMore ? 'block' : 'none';
        }
        if (loadmoreBtn) loadmoreBtn.disabled = !hasMore;
        if (counter) {
            counter.innerHTML = `Showing <strong>${visible.length}</strong> of <strong>${filteredArticles.length}</strong> articles`;
        }
    }

    function renderCard(item) {
        const cat = getCategoryInfo(item.category);
        const readingTime = getReadingTime(item.content);

        return `
            <a class="blog-card" href="post.html?id=${encodeURIComponent(item.id)}">
                <div class="blog-card-media">
                    <span class="blog-card-cat ${escapeHtml(item.category)}">
                        ${escapeHtml(cat.label)}
                    </span>
                    <img src="${escapeHtml(item.thumbnail || PLACEHOLDER_IMG)}"
                         alt="${escapeHtml(item.title)}"
                         loading="lazy"
                         onerror="this.onerror=null;this.src='${PLACEHOLDER_IMG}';">
                </div>
                <div class="blog-card-body">
                    <h3 class="blog-card-title">${escapeHtml(item.title)}</h3>
                    <p class="blog-card-excerpt">${escapeHtml(item.excerpt || stripHtml(item.content).slice(0, 120))}</p>
                    <div class="blog-card-footer">
                        <span><i class="fas fa-calendar"></i> ${formatDate(item.date)}</span>
                        <span><i class="fas fa-clock"></i> ${readingTime} min</span>
                    </div>
                </div>
            </a>
        `;
    }

    /* ============================================================
       FILTER (dari sidebar kategori)
       ============================================================ */
    function applyFilter() {
        filteredArticles = allArticles.filter(a => {
            return activeCategory === 'all' || a.category === activeCategory;
        });

        renderGrid(true);
    }

    /* ============================================================
       EVENT LISTENERS
       ============================================================ */
    function bindEvents() {
        // Load more
        const loadmore = document.getElementById('loadmoreBtn');
        if (loadmore) {
            loadmore.addEventListener('click', function () {
                currentPage++;
                renderGrid(false);

                const grid = document.getElementById('blogGrid');
                if (grid && grid.lastElementChild) {
                    grid.lastElementChild.scrollIntoView({ behavior: 'smooth', block: 'end' });
                }
            });
        }
    }

    /* ============================================================
       BOOT
       ============================================================ */
    function boot() {
        const t0 = performance.now();

        initData();
        renderFeatured();
        renderGrid(true);
        renderSidebar();
        renderSidebarCategories();
        bindEvents();

        const t1 = performance.now();
        console.log(`✅ Blog rendered in ${(t1 - t0).toFixed(0)}ms — ${allArticles.length} articles`);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();