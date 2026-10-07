/* ============================================================
   POST PAGE LOGIC
   - Baca ?id= dari URL
   - Cari artikel di BLOG_DATA
   - Render article lengkap + KaTeX
   - Related articles
   - Views counter (localStorage)
   - Reading progress bar
   ============================================================ */

(function () {
    'use strict';

    /* ============================================================
       CONFIG
       ============================================================ */
    const PLACEHOLDER_IMG = 'images/blog/placeholder.jpg';

    const CATEGORY_INFO = {
        news: { label: 'News', color: '#3b82f6' },
        event: { label: 'Event', color: '#f59e0b' },
        achievement: { label: 'Achievement', color: '#ef4444' },
        activity: { label: 'Activity', color: '#8b5cf6' },
        workshop: { label: 'Workshop', color: '#06b6d4' },
        tips: { label: 'Tips', color: '#10b981' }
    };

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

    function formatDateLong(isoDate) {
        if (!isoDate) return '';
        const months = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        const d = new Date(isoDate);
        if (isNaN(d.getTime())) return isoDate;
        return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    }

    function getCategoryInfo(cat) {
        return CATEGORY_INFO[cat] || { label: 'Article', color: '#64748b' };
    }

    function getInitials(name) {
        if (!name) return '?';
        const parts = String(name).trim().split(/\s+/);
        if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
        return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    }

    function getQueryParam(key) {
        const params = new URLSearchParams(window.location.search);
        return params.get(key);
    }

    function readingTime(text) {
        const plain = String(text || '').replace(/<[^>]+>/g, ' ');
        const words = plain.trim().split(/\s+/).filter(Boolean).length;
        const minutes = Math.max(1, Math.round(words / 200));
        return `${minutes} min read`;
    }

    function stripHtml(html) {
        const tmp = document.createElement('div');
        tmp.innerHTML = html || '';
        return (tmp.textContent || tmp.innerText || '').trim();
    }

    /* ============================================================
       VIEWS COUNTER (localStorage)
       ============================================================ */
    function getViews(articleId) {
        const key = `skb_blog_views_${articleId}`;
        const stored = parseInt(localStorage.getItem(key), 10) || 0;
        // Base views from article object
        const article = (typeof BLOG_DATA !== 'undefined') ?
            BLOG_DATA.find(a => a.id === articleId) : null;
        const base = (article && article.views) || 0;
        return base + stored;
    }

    function incrementViews(articleId) {
        const key = `skb_blog_views_${articleId}`;
        const viewedKey = `skb_blog_viewed_${articleId}`;

        // Only increment once per browser
        if (localStorage.getItem(viewedKey)) {
            return getViews(articleId);
        }

        const current = parseInt(localStorage.getItem(key), 10) || 0;
        localStorage.setItem(key, current + 1);
        localStorage.setItem(viewedKey, '1');

        return getViews(articleId);
    }

    /* ============================================================
       RENDER ERROR
       ============================================================ */
    function renderError(title, message) {
        const container = document.getElementById('articleContainer');
        if (!container) return;

        document.title = 'Not Found | English Prime Course';

        const breadcrumb = document.getElementById('breadcrumb');
        if (breadcrumb) {
            breadcrumb.innerHTML = `
                <a href="index.html">Home</a>
                <i class="fas fa-chevron-right"></i>
                <a href="blog.html">Blog</a>
                <i class="fas fa-chevron-right"></i>
                <span>Not found</span>
            `;
        }

        container.innerHTML = `
            <div class="error-state">
                <div class="error-state-icon">
                    <i class="fas fa-file-circle-question"></i>
                </div>
                <h1>${escapeHtml(title)}</h1>
                <p>${escapeHtml(message)}</p>
                <a href="blog.html" class="back-btn">
                    <i class="fas fa-arrow-left"></i>
                    Back to Blog
                </a>
            </div>
        `;
    }

    /* ============================================================
       RENDER ARTICLE
       ============================================================ */
    function renderArticle(article) {
        const container = document.getElementById('articleContainer');
        const breadcrumb = document.getElementById('breadcrumb');
        if (!container) return;

        // Update document title & meta description
        document.title = `${article.title} | English Prime Course`;
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute('content', article.excerpt || '');

        // Views
        const views = incrementViews(article.id);

        // Breadcrumb
        if (breadcrumb) {
            const cat = getCategoryInfo(article.category);
            breadcrumb.innerHTML = `
                <a href="index.html">Home</a>
                <i class="fas fa-chevron-right"></i>
                <a href="blog.html">Blog</a>
                <i class="fas fa-chevron-right"></i>
                <span>${escapeHtml(cat.label)}</span>
            `;
        }

        const cat = getCategoryInfo(article.category);
        const initials = getInitials(article.author || 'Admin');
        const rt = readingTime(article.content || article.excerpt);
        const authorRole = article.authorRole || 'Contributor';

        const tagsHtml = (article.tags || []).length
            ? `<div class="article-tags">
                   ${article.tags.map(t => `<span class="article-tag">${escapeHtml(t)}</span>`).join('')}
               </div>`
            : '';

        const shareUrl = window.location.href;
        const shareTitle = article.title;

        container.innerHTML = `
            <div class="article-container">

                <header class="article-header">
                    <span class="article-category" style="background: ${cat.color};">
                        ${escapeHtml(cat.label)}
                    </span>
                    <h1 class="article-title">${escapeHtml(article.title)}</h1>
                    <p class="article-lead">${escapeHtml(article.excerpt || '')}</p>

                    <div class="article-meta">
                        <div class="article-author">
                            <span class="article-author-avatar">${escapeHtml(initials)}</span>
                            <div class="article-author-info">
                                <span class="article-author-name">${escapeHtml(article.author || 'Admin')}</span>
                                <span class="article-author-role">${escapeHtml(authorRole)}</span>
                            </div>
                        </div>
                        <div class="article-meta-divider"></div>
                        <span class="article-meta-item">
                            <i class="fas fa-calendar"></i>
                            ${formatDateLong(article.date)}
                        </span>
                        <span class="article-meta-item">
                            <i class="fas fa-clock"></i>
                            ${rt}
                        </span>
                        <span class="article-meta-item">
                            <i class="fas fa-eye"></i>
                            ${views} views
                        </span>
                    </div>
                </header>

                <figure class="article-cover">
                    <img src="${escapeHtml(article.thumbnail || PLACEHOLDER_IMG)}"
                         alt="${escapeHtml(article.title)}"
                         loading="eager"
                         onerror="this.onerror=null;this.src='${PLACEHOLDER_IMG}';">
                </figure>

                <div class="article-content" id="articleBody">
                    ${article.content || '<p>Content not available.</p>'}
                </div>

                ${tagsHtml}

                <div class="article-share">
                    <span class="article-share-label">Share this article</span>
                    <div class="article-share-buttons">
                        <a class="share-btn"
                           href="https://wa.me/?text=${encodeURIComponent(shareTitle + ' ' + shareUrl)}"
                           target="_blank" rel="noopener" aria-label="Share to WhatsApp">
                            <i class="fab fa-whatsapp"></i>
                        </a>
                        <a class="share-btn"
                           href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}"
                           target="_blank" rel="noopener" aria-label="Share to Facebook">
                            <i class="fab fa-facebook-f"></i>
                        </a>
                        <a class="share-btn"
                           href="https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}"
                           target="_blank" rel="noopener" aria-label="Share to Twitter">
                            <i class="fab fa-twitter"></i>
                        </a>
                        <button class="share-btn" type="button" id="copyLinkBtn" aria-label="Copy link">
                            <i class="fas fa-link"></i>
                        </button>
                    </div>
                </div>

                <div class="article-bottom">
                    <a href="blog.html" class="back-btn">
                        <i class="fas fa-arrow-left"></i>
                        Back to all articles
                    </a>
                </div>

            </div>
        `;

        // Bind copy link
        const copyBtn = document.getElementById('copyLinkBtn');
        if (copyBtn) {
            copyBtn.addEventListener('click', function () {
                const original = copyBtn.innerHTML;
                navigator.clipboard.writeText(shareUrl).then(() => {
                    copyBtn.innerHTML = '<i class="fas fa-check"></i>';
                    setTimeout(() => { copyBtn.innerHTML = original; }, 1500);
                }).catch(() => {
                    // Fallback
                    const tmp = document.createElement('textarea');
                    tmp.value = shareUrl;
                    document.body.appendChild(tmp);
                    tmp.select();
                    try { document.execCommand('copy'); } catch (e) { }
                    document.body.removeChild(tmp);
                    copyBtn.innerHTML = '<i class="fas fa-check"></i>';
                    setTimeout(() => { copyBtn.innerHTML = original; }, 1500);
                });
            });
        }

        // Render KaTeX
        const bodyEl = document.getElementById('articleBody');
        if (bodyEl) {
            renderKatexWhenReady(bodyEl);
        }

        // Render related articles
        renderRelated(article);
    }

    /* ============================================================
       KATEX RENDERER
       ============================================================ */
    function renderKatexWhenReady(rootEl) {
        function tryRender() {
            if (typeof renderMathInElement !== 'undefined') {
                try {
                    renderMathInElement(rootEl, {
                        delimiters: [
                            { left: '$$', right: '$$', display: true },
                            { left: '$', right: '$', display: false },
                            { left: '\\[', right: '\\]', display: true },
                            { left: '\\(', right: '\\)', display: false }
                        ],
                        throwOnError: false
                    });
                } catch (e) {
                    console.warn('KaTeX render error:', e);
                }
            } else {
                setTimeout(tryRender, 100);
            }
        }
        tryRender();
    }

    /* ============================================================
       RELATED ARTICLES
       ============================================================ */
    function renderRelated(currentArticle) {
        const container = document.getElementById('relatedContainer');
        if (!container || typeof BLOG_DATA === 'undefined') return;

        // Filter same category (exclude current)
        let related = BLOG_DATA
            .filter(a => a.id !== currentArticle.id)
            .filter(a => a.category === currentArticle.category);

        // If less than 3, add from other categories
        if (related.length < 3) {
            const others = BLOG_DATA
                .filter(a => a.id !== currentArticle.id)
                .filter(a => a.category !== currentArticle.category);
            related = [...related, ...others].slice(0, 3);
        } else {
            related = related.slice(0, 3);
        }

        if (related.length === 0) return;

        const cards = related.map(a => {
            const cat = getCategoryInfo(a.category);
            return `
                <a class="related-card" href="post.html?id=${encodeURIComponent(a.id)}">
                    <div class="related-image">
                        <img src="${escapeHtml(a.thumbnail || PLACEHOLDER_IMG)}"
                             alt="${escapeHtml(a.title)}"
                             loading="lazy"
                             onerror="this.onerror=null;this.src='${PLACEHOLDER_IMG}';">
                    </div>
                    <div class="related-body">
                        <span class="related-cat" style="color: ${cat.color};">
                            ${escapeHtml(cat.label)}
                        </span>
                        <h4>${escapeHtml(a.title)}</h4>
                        <span class="related-date">
                            <i class="fas fa-calendar"></i>
                            ${formatDateLong(a.date).split(',')[0]}
                        </span>
                    </div>
                </a>
            `;
        }).join('');

        container.innerHTML = `
            <section class="related-section">
                <h2 class="related-title">
                    <i class="fas fa-book-open"></i>
                    Related Articles
                </h2>
                <div class="related-grid">
                    ${cards}
                </div>
            </section>
        `;
    }

    /* ============================================================
       READING PROGRESS BAR
       ============================================================ */
    function initReadingProgress() {
        const bar = document.getElementById('readingProgress');
        if (!bar) return;

        function updateProgress() {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
            bar.style.width = Math.min(100, Math.max(0, progress)) + '%';
        }

        window.addEventListener('scroll', updateProgress, { passive: true });
        updateProgress();
    }

    /* ============================================================
       BOOT
       ============================================================ */
    function boot() {
        if (typeof BLOG_DATA === 'undefined') {
            renderError('Data not loaded', 'Blog data could not be loaded. Please refresh the page.');
            console.error('❌ BLOG_DATA tidak ditemukan.');
            return;
        }

        const id = getQueryParam('id');
        if (!id) {
            renderError('No article selected', 'Please choose an article from the blog page.');
            return;
        }

        const article = BLOG_DATA.find(a => a.id === id);
        if (!article) {
            renderError('Article not found', `The article with ID "${id}" does not exist or has been removed.`);
            return;
        }

        renderArticle(article);
        initReadingProgress();

        console.log(`✅ Article rendered: ${article.title}`);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();