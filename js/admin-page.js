/* ============================================================
   ADMIN PAGE LOGIC
   - Password gate (session-based)
   - Quill editor init
   - Table Builder modal
   - Formula (KaTeX) modal
   - Live checklist + word count
   - Preview modal
   - Generate JS object for NEWS_DATA
   - Dark mode toggle
   - Toast notifications
   ============================================================ */

(function () {
    'use strict';

    /* ============================================================
       CONFIG
       ============================================================ */
    const ADMIN_PASSWORD = 'skbasmat2026';   // Ganti password di sini
    const SESSION_KEY = 'epc_admin_auth';
    const THEME_KEY = 'epc_admin_theme';
    const DEFAULT_AUTHOR = 'Maria Delfina Dhae';
    const DEFAULT_AUTHOR_ROLE = 'English Course Director';

    /* ============================================================
       STATE
       ============================================================ */
    let quill = null;
    let lastSelectionRange = null;

    /* ============================================================
       TOAST
       ============================================================ */
    function showToast(message, type = 'success') {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-info-circle'
        };

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `<i class="fas ${icons[type] || icons.success}"></i><span>${escapeHtml(message)}</span>`;
        container.appendChild(toast);

        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3200);
    }

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

    function slugify(str) {
        return String(str || '')
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '')
            .slice(0, 60) || 'untitled-' + Date.now();
    }

    function todayISO() {
        const d = new Date();
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    }

    function stripHtml(html) {
        const tmp = document.createElement('div');
        tmp.innerHTML = html || '';
        return (tmp.textContent || tmp.innerText || '').trim();
    }

    function getPlainFromQuill() {
        if (!quill) return '';
        return stripHtml(quill.root.innerHTML);
    }

    /* ============================================================
       DARK MODE
       ============================================================ */
    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        const icon = document.querySelector('#themeToggle i');
        if (icon) {
            icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }

    function initTheme() {
        const saved = localStorage.getItem(THEME_KEY) || 'light';
        applyTheme(saved);

        const btn = document.getElementById('themeToggle');
        if (btn) {
            btn.addEventListener('click', function () {
                const current = document.documentElement.getAttribute('data-theme') || 'light';
                const next = current === 'light' ? 'dark' : 'light';
                applyTheme(next);
                localStorage.setItem(THEME_KEY, next);
            });
        }
    }

    /* ============================================================
       PASSWORD GATE
       ============================================================ */
    function initGate() {
        const gate = document.getElementById('gate');
        const admin = document.getElementById('admin');
        const input = document.getElementById('gatePassword');
        const btn = document.getElementById('gateSubmit');
        const errEl = document.getElementById('gateError');

        function tryLogin() {
            const val = input.value.trim();
            if (val === ADMIN_PASSWORD) {
                sessionStorage.setItem(SESSION_KEY, 'true');
                gate.style.display = 'none';
                admin.classList.add('active');
                initAdmin();
            } else {
                errEl.textContent = '❌ Password salah. Coba lagi.';
                input.value = '';
                input.focus();
                setTimeout(() => { errEl.textContent = ''; }, 3000);
            }
        }

        btn.addEventListener('click', tryLogin);
        input.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') tryLogin();
        });

        // Cek session
        if (sessionStorage.getItem(SESSION_KEY) === 'true') {
            gate.style.display = 'none';
            admin.classList.add('active');
            initAdmin();
        }
    }

    /* ============================================================
       QUILL EDITOR
       ============================================================ */
    function initQuill() {
        const toolbarOptions = [
            [{ 'header': [1, 2, 3, 4, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'indent': '-1' }, { 'indent': '+1' }],
            [{ 'align': [] }],
            ['blockquote', 'code-block'],
            ['link', 'image'],
            ['clean']
        ];

        quill = new Quill('#editor', {
            theme: 'snow',
            placeholder: '✍️ Tulis artikel di sini...',
            modules: {
                toolbar: {
                    container: toolbarOptions,
                    handlers: {
                        // Biarkan handler default untuk image (base64)
                    }
                }
            }
        });

        // Save selection range saat editor blur (untuk insert di posisi kursor)
        quill.on('selection-change', function (range) {
            if (range) lastSelectionRange = range;
        });

        // Update stats saat mengetik
        quill.on('text-change', function () {
            updateStats();
            updateChecklist();
        });

        // Tambahkan custom buttons ke toolbar
        addCustomToolbarButtons();

        // Initial update
        updateStats();
        updateChecklist();
    }

    function addCustomToolbarButtons() {
        const toolbar = document.querySelector('.ql-toolbar.ql-snow');
        if (!toolbar) return;

        // Table button
        const tableBtn = document.createElement('button');
        tableBtn.type = 'button';
        tableBtn.className = 'ql-custom-btn';
        tableBtn.innerHTML = '<i class="fas fa-table"></i><span>Tabel</span>';
        tableBtn.title = 'Insert Table';
        tableBtn.addEventListener('click', function (e) {
            e.preventDefault();
            openModal('tableModal');
        });

        // Formula button
        const formulaBtn = document.createElement('button');
        formulaBtn.type = 'button';
        formulaBtn.className = 'ql-custom-btn';
        formulaBtn.innerHTML = '<i class="fas fa-square-root-alt"></i><span>∑ Rumus</span>';
        formulaBtn.title = 'Insert Math Formula';
        formulaBtn.addEventListener('click', function (e) {
            e.preventDefault();
            openModal('formulaModal');
            setTimeout(() => {
                const input = document.getElementById('fFormula');
                if (input) input.focus();
            }, 100);
        });

        toolbar.appendChild(tableBtn);
        toolbar.appendChild(formulaBtn);
    }

    /* ============================================================
       STATS & CHECKLIST
       ============================================================ */
    function updateStats() {
        const text = getPlainFromQuill();
        const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
        const chars = text.length;
        const readMin = Math.max(1, Math.round(words / 200));

        const wEl = document.getElementById('statusWords');
        const cEl = document.getElementById('statusChars');
        const rEl = document.getElementById('statusRead');

        if (wEl) wEl.textContent = words;
        if (cEl) cEl.textContent = chars;
        if (rEl) rEl.textContent = readMin + ' min';
    }

    function updateChecklist() {
        const checks = {
            title: !!document.getElementById('fTitle').value.trim(),
            category: !!document.getElementById('fCategory').value,
            date: !!document.getElementById('fDate').value,
            author: !!document.getElementById('fAuthor').value.trim(),
            thumbnail: !!document.getElementById('fThumbnail').value.trim(),
            content: getPlainFromQuill().length > 20
        };

        document.querySelectorAll('.checklist-item').forEach(el => {
            const key = el.dataset.check;
            const icon = el.querySelector('i');
            if (checks[key]) {
                icon.className = 'fas fa-check-circle';
                icon.style.color = 'var(--success)';
            } else {
                icon.className = 'far fa-circle';
                icon.style.color = 'var(--text-tertiary)';
            }
        });
    }

    /* ============================================================
       MODALS
       ============================================================ */
    function openModal(id) {
        const m = document.getElementById(id);
        if (m) m.classList.add('active');
    }

    function closeModal(id) {
        const m = document.getElementById(id);
        if (m) m.classList.remove('active');
    }

    function initModals() {
        // Close buttons
        document.querySelectorAll('[data-close]').forEach(btn => {
            btn.addEventListener('click', function () {
                closeModal(this.dataset.close);
            });
        });

        // Click backdrop to close
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', function (e) {
                if (e.target === this) {
                    this.classList.remove('active');
                }
            });
        });

        // ESC key
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal.active').forEach(m => m.classList.remove('active'));
            }
        });
    }

    /* ============================================================
       TABLE BUILDER
       ============================================================ */
    function insertTable() {
        const rows = parseInt(document.getElementById('tRows').value, 10);
        const cols = parseInt(document.getElementById('tCols').value, 10);
        const hasHeader = document.getElementById('tHeader').checked;

        if (!rows || !cols || rows < 1 || rows > 20 || cols < 1 || cols > 10) {
            showToast('Rows harus 1-20, cols harus 1-10', 'error');
            return;
        }

        let html = '<table>';
        if (hasHeader) {
            html += '<thead><tr>';
            for (let j = 0; j < cols; j++) {
                html += `<th>Header ${j + 1}</th>`;
            }
            html += '</tr></thead>';
        }
        html += '<tbody>';
        for (let i = 0; i < rows; i++) {
            html += '<tr>';
            for (let j = 0; j < cols; j++) {
                html += '<td><br></td>';
            }
            html += '</tr>';
        }
        html += '</tbody></table><p><br></p>';

        // Insert at cursor or at end
        const range = lastSelectionRange || { index: quill.getLength() - 1, length: 0 };
        quill.clipboard.dangerouslyPasteHTML(range.index, html);
        quill.setSelection(range.index + html.length, 0);

        closeModal('tableModal');
        showToast(`Tabel ${rows}×${cols} ditambahkan`, 'success');
    }

    /* ============================================================
       FORMULA INSERT
       ============================================================ */
    function insertFormula() {
        const input = document.getElementById('fFormula');
        const display = document.getElementById('fDisplayMode').checked;
        let formula = input.value.trim();

        if (!formula) {
            showToast('Masukkan formula terlebih dahulu', 'error');
            return;
        }

        // Strip existing delimiters
        formula = formula.replace(/^\$\$?/, '').replace(/\$\$?$/, '').trim();

        const wrapped = display ? `$$${formula}$$` : `$${formula}$`;

        const range = lastSelectionRange || { index: quill.getLength() - 1, length: 0 };
        quill.insertText(range.index, wrapped);
        quill.setSelection(range.index + wrapped.length, 0);

        input.value = '';
        document.getElementById('fDisplayMode').checked = false;

        closeModal('formulaModal');
        showToast('Formula ditambahkan', 'success');
    }

    /* ============================================================
       VALIDATION
       ============================================================ */
    function validateForm() {
        const errors = [];

        if (!document.getElementById('fTitle').value.trim()) errors.push('Judul');
        if (!document.getElementById('fCategory').value) errors.push('Kategori');
        if (!document.getElementById('fDate').value) errors.push('Tanggal');
        if (!document.getElementById('fAuthor').value.trim()) errors.push('Author');
        if (!document.getElementById('fThumbnail').value.trim()) errors.push('Thumbnail');
        if (getPlainFromQuill().length < 20) errors.push('Isi artikel (min. 20 karakter)');

        return errors;
    }

    /* ============================================================
       BUILD ARTICLE OBJECT
       ============================================================ */
    function buildArticleObject() {
        const title = document.getElementById('fTitle').value.trim();
        const id = slugify(title);
        const category = document.getElementById('fCategory').value;
        const date = document.getElementById('fDate').value;
        const author = document.getElementById('fAuthor').value.trim();
        const authorRole = document.getElementById('fAuthorRole').value.trim();
        const thumbnail = document.getElementById('fThumbnail').value.trim();
        const tagsRaw = document.getElementById('fTags').value.trim();
        const tags = tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : [];
        const featured = document.getElementById('fFeatured').checked;

        let excerpt = document.getElementById('fExcerpt').value.trim();
        const content = quill.root.innerHTML;

        // Auto-generate excerpt if empty
        if (!excerpt) {
            const plain = stripHtml(content);
            excerpt = plain.slice(0, 160).trim();
            if (plain.length > 160) excerpt += '...';
        }

        return {
            id,
            title,
            excerpt,
            thumbnail,
            category,
            author,
            authorRole,
            date,
            tags,
            views: 0,
            featured,
            content
        };
    }

    /* ============================================================
       FORMAT JS OBJECT (Pretty print)
       ============================================================ */
    function formatJsObject(obj) {
        const indent = '    '; // 4 spaces
        const indent2 = indent + indent;
        const indent3 = indent + indent + indent;
        const indent4 = indent + indent + indent + indent;

        function escapeStr(s) {
            return String(s)
                .replace(/\\/g, '\\\\')
                .replace(/`/g, '\\`')
                .replace(/\$\{/g, '\\${');
        }

        let tagsStr;
        if (obj.tags.length === 0) {
            tagsStr = '[]';
        } else {
            tagsStr = '[' + obj.tags.map(t => `'${t.replace(/'/g, "\\'")}'`).join(', ') + ']';
        }

        // Content as template literal, indented
        const contentLines = obj.content
            .split('\n')
            .map(line => indent4 + line)
            .join('\n');

        const lines = [
            indent + '{',
            indent2 + `id: '${obj.id.replace(/'/g, "\\'")}',`,
            indent2 + `title: '${obj.title.replace(/'/g, "\\'")}',`,
            indent2 + `excerpt: '${obj.excerpt.replace(/'/g, "\\'")}',`,
            indent2 + `thumbnail: '${obj.thumbnail.replace(/'/g, "\\'")}',`,
            indent2 + `category: '${obj.category.replace(/'/g, "\\'")}',`,
            indent2 + `author: '${obj.author.replace(/'/g, "\\'")}',`,
            indent2 + `authorRole: '${obj.authorRole.replace(/'/g, "\\'")}',`,
            indent2 + `date: '${obj.date}',`,
            indent2 + `tags: ${tagsStr},`,
            indent2 + `views: ${obj.views || 0},`,
            indent2 + `featured: ${obj.featured},`,
            indent2 + 'content: `',
            contentLines,
            indent3 + '`',
            indent + '},'
        ];

        return lines.join('\n');
    }

    /* ============================================================
       SHOW CODE MODAL
       ============================================================ */
    function showGeneratedCode() {
        const errors = validateForm();
        if (errors.length > 0) {
            showToast('Lengkapi dulu: ' + errors.join(', '), 'error');
            return;
        }

        const obj = buildArticleObject();
        const code = formatJsObject(obj);

        const output = document.getElementById('codeOutput');
        output.textContent = code;

        openModal('generateModal');
    }

    /* ============================================================
       COPY TO CLIPBOARD
       ============================================================ */
    function copyCode() {
        const output = document.getElementById('codeOutput');
        if (!output) return;

        const text = output.textContent;

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                showToast('Code berhasil di-copy!', 'success');
            }).catch(() => {
                fallbackCopy(text);
            });
        } else {
            fallbackCopy(text);
        }
    }

    function fallbackCopy(text) {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try {
            document.execCommand('copy');
            showToast('Code berhasil di-copy!', 'success');
        } catch (e) {
            showToast('Gagal copy — pilih manual dengan Ctrl+C', 'error');
        }
        document.body.removeChild(ta);
    }

    /* ============================================================
       PREVIEW
       ============================================================ */
    function showPreview() {
        const errors = validateForm();
        if (errors.length > 0) {
            showToast('Lengkapi dulu: ' + errors.join(', '), 'error');
            return;
        }

        const obj = buildArticleObject();
        const container = document.getElementById('previewContent');

        const thumbsHtml = obj.thumbnail
            ? `<img src="${escapeHtml(obj.thumbnail)}"
                    alt="${escapeHtml(obj.title)}"
                    style="width:100%;max-height:400px;object-fit:cover;border-radius:12px;margin-bottom:20px;"
                    onerror="this.style.display='none'">`
            : '';

        const tagsHtml = obj.tags.length
            ? `<div style="margin-top:20px;display:flex;gap:6px;flex-wrap:wrap;">
                   ${obj.tags.map(t => `<span style="padding:4px 12px;background:var(--bg-muted);border-radius:999px;font-size:0.75rem;">${escapeHtml(t)}</span>`).join('')}
               </div>`
            : '';

        container.innerHTML = `
            <div style="margin-bottom: 16px;">
                <span style="display:inline-block;padding:4px 12px;background:var(--accent-soft);color:var(--accent);border-radius:999px;font-size:0.75rem;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">
                    ${escapeHtml(obj.category)}
                </span>
            </div>
            <h1 style="font-size:1.75rem;font-weight:700;line-height:1.2;margin-bottom:16px;letter-spacing:-0.5px;">
                ${escapeHtml(obj.title)}
            </h1>
            <p style="font-size:1rem;color:var(--text-secondary);line-height:1.7;margin-bottom:20px;">
                ${escapeHtml(obj.excerpt)}
            </p>
            <div style="display:flex;flex-wrap:wrap;gap:16px;font-size:0.85rem;color:var(--text-tertiary);padding-bottom:16px;border-bottom:1px solid var(--border);margin-bottom:20px;">
                <span><i class="fas fa-user"></i> ${escapeHtml(obj.author)}</span>
                <span><i class="fas fa-calendar"></i> ${escapeHtml(obj.date)}</span>
            </div>
            ${thumbsHtml}
            <div>${obj.content}</div>
            ${tagsHtml}
        `;

        openModal('previewModal');

        // Render KaTeX in preview
        setTimeout(() => {
            if (window.renderMathInElement) {
                try {
                    window.renderMathInElement(container, {
                        delimiters: [
                            { left: '$$', right: '$$', display: true },
                            { left: '$', right: '$', display: false },
                            { left: '\\[', right: '\\]', display: true },
                            { left: '\\(', right: '\\)', display: false }
                        ],
                        throwOnError: false
                    });
                } catch (e) {
                    console.warn('KaTeX preview error:', e);
                }
            }
        }, 50);
    }

    /* ============================================================
       LOAD EXAMPLE
       ============================================================ */
    function loadExample() {
        document.getElementById('fTitle').value = 'English Day 2026: A Day of Confidence and Celebration';
        document.getElementById('fCategory').value = 'English Day';
        document.getElementById('fDate').value = todayISO();
        document.getElementById('fAuthor').value = DEFAULT_AUTHOR;
        document.getElementById('fAuthorRole').value = DEFAULT_AUTHOR_ROLE;
        document.getElementById('fTags').value = 'Event, Speaking, Community';
        document.getElementById('fThumbnail').value = 'images/news-english-day.jpg';
        document.getElementById('fFeatured').checked = true;
        document.getElementById('fExcerpt').value = 'Learners from all nine classes came together for a full day of English-only activities — from storytelling to mini debates.';

        quill.root.innerHTML = `
            <p>Last Saturday, our learning center turned into a small international stage. For one full day, <strong>learners from all nine classes</strong> came together to speak, sing, act, and celebrate English.</p>
            <h2>A Day Without Textbooks</h2>
            <p>From 8 AM to 3 PM, every corner of the room was filled with English. The Little Starter children opened the day with a story-telling session of <em>The Hungry Caterpillar</em>.</p>
            <blockquote>"I was nervous at first, but once I started speaking, I forgot I was nervous." — Jorel, Junior Talk learner.</blockquote>
            <h3>What the Learners Practiced</h3>
            <ul>
                <li><strong>Speaking fluency</strong> — thinking in English without translating</li>
                <li><strong>Active listening</strong> — responding to questions in real time</li>
                <li><strong>Public confidence</strong> — speaking in front of more than 100 people</li>
            </ul>
            <p>English Day is not just an event. It is a <strong>milestone</strong>.</p>
        `;

        updateStats();
        updateChecklist();
        showToast('Contoh artikel dimuat', 'success');
    }

    /* ============================================================
       CLEAR FORM
       ============================================================ */
    function clearForm() {
        if (!confirm('Kosongkan seluruh form? Data yang belum di-generate akan hilang.')) return;

        document.getElementById('fTitle').value = '';
        document.getElementById('fExcerpt').value = '';
        document.getElementById('fCategory').value = 'Event';
        document.getElementById('fDate').value = todayISO();
        document.getElementById('fAuthor').value = DEFAULT_AUTHOR;
        document.getElementById('fAuthorRole').value = DEFAULT_AUTHOR_ROLE;
        document.getElementById('fTags').value = '';
        document.getElementById('fThumbnail').value = '';
        document.getElementById('fFeatured').checked = false;

        quill.root.innerHTML = '';

        updateStats();
        updateChecklist();
        showToast('Form dikosongkan', 'success');
    }

    /* ============================================================
       LOGOUT
       ============================================================ */
    function logout() {
        if (!confirm('Logout dari admin panel?')) return;
        sessionStorage.removeItem(SESSION_KEY);
        location.reload();
    }

    /* ============================================================
       INIT ADMIN
       ============================================================ */
    function initAdmin() {
        // Set default date
        const dateInput = document.getElementById('fDate');
        if (dateInput && !dateInput.value) {
            dateInput.value = todayISO();
        }

        initTheme();
        initQuill();
        initModals();

        // Table builder
        document.getElementById('tInsert').addEventListener('click', insertTable);

        // Formula
        document.getElementById('fInsert').addEventListener('click', insertFormula);

        // Generate
        document.getElementById('generateBtn').addEventListener('click', showGeneratedCode);
        document.getElementById('previewGenerateBtn').addEventListener('click', function () {
            closeModal('previewModal');
            showGeneratedCode();
        });

        // Preview
        document.getElementById('previewBtn').addEventListener('click', showPreview);

        // Copy
        document.getElementById('copyCodeBtn').addEventListener('click', copyCode);

        // Quick actions
        document.getElementById('loadExampleBtn').addEventListener('click', loadExample);
        document.getElementById('clearBtn').addEventListener('click', clearForm);
        document.getElementById('logoutBtn').addEventListener('click', logout);

        // Live update checklist
        ['fTitle', 'fCategory', 'fDate', 'fAuthor', 'fThumbnail', 'fExcerpt'].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('input', updateChecklist);
                el.addEventListener('change', updateChecklist);
            }
        });

        // Enter key untuk formula
        const fFormula = document.getElementById('fFormula');
        if (fFormula) {
            fFormula.addEventListener('keydown', function (e) {
                if (e.key === 'Enter') insertFormula();
            });
        }

        // Warn before leaving if unsaved content
        window.addEventListener('beforeunload', function (e) {
            const hasContent = getPlainFromQuill().length > 50;
            if (hasContent) {
                e.preventDefault();
                e.returnValue = '';
            }
        });

        console.log('✅ Admin panel ready');
    }

    /* ============================================================
       BOOT
       ============================================================ */
    document.addEventListener('DOMContentLoaded', function () {
        initGate();
    });

})();