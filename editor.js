/* Developer mode: in-place editing of text, links and images.
 *
 * Loaded only for ?edit=1. Nothing here runs for ordinary visitors.
 *
 * Editable regions are declared here as selectors rather than marked up with
 * attributes in index.html. Keys are derived as name[index], so anything you
 * add to the page later is automatically editable and the markup stays clean.
 * Publishing re-runs these same selectors against the pristine file, so the
 * indices line up; a saved draft additionally records the value it expected to
 * find, and is refused if the file has moved on underneath it.
 *
 * Phases 2-3 of the editor: text, links, images, undo/redo, drafts.
 * Layout tokens and publishing arrive in later phases.
 */
(function () {
    'use strict';

    /* ---------------------------------------------------------------- config */

    var REGIONS = [
        { name: 'nav.logo',      sel: '.nav-logo-text',        text: true },
        { name: 'nav.link',      sel: '.nav-menu .nav-link',   text: true, href: true },
        { name: 'hero.title',    sel: '.hero-title',           text: true },
        { name: 'hero.subtitle', sel: '.hero-subtitle',        text: true },
        { name: 'hero.para',     sel: '.hero-description',     text: true },
        { name: 'hero.figure',   sel: '.hero-images-stack a',  href: true },
        { name: 'section.title', sel: '.section-title',        text: true },
        { name: 'project',       sel: '.project-card',         href: true },
        { name: 'project.title', sel: '.project-content h3',   text: true },
        { name: 'project.org',   sel: '.project-content h4',   text: true },
        { name: 'project.date',  sel: '.project-date',         text: true },
        { name: 'project.note',  sel: '.project-note',         text: true },
        { name: 'module.group',  sel: '.module-category > h3', text: true },
        { name: 'module.link',   sel: '.module-link',          text: true, href: true },
        { name: 'contact.head',  sel: '.contact-info-left h3', text: true },
        { name: 'contact.body',  sel: '.contact-info-left p',  text: true },
        { name: 'contact.item',  sel: '.contact-item span',    text: true },
        { name: 'social',        sel: '.social-link',          href: true },
        { name: 'social.text',   sel: '.social-text',          text: true },
        { name: 'footer',        sel: '.footer p',             text: true },

        /* Images. Direct children only, which deliberately excludes the <img>
           fallback nested inside the Deimos card's <video>. */
        { name: 'logo.image',     sel: '.nav-logo-img',             image: true },
        { name: 'hero.image',     sel: '.hero-images-stack a > img', image: true },
        { name: 'project.image',  sel: '.project-image > img',      image: true },
        { name: 'project.image2', sel: '.project-image-right > img', image: true }
    ];

    /* Layout knobs. These are the custom properties styles.css is written
       against, so a change here is the same lever the stylesheet already
       pulls - not an override fighting it. */
    var TOKENS = [
        { prop: '--page-max',    label: 'Page width',    min: 1000, max: 2400, step: 20,   unit: 'px' },
        { prop: '--measure',     label: 'Text measure',  min: 38,   max: 85,   step: 1,    unit: 'ch' },
        { prop: '--space-scale', label: 'Spacing scale', min: 0.6,  max: 1.6,  step: 0.05, unit: ''   }
    ];

    var DRAFT_KEY = 'tge.draft.' + location.pathname;
    var DRAFT_VERSION = 2;
    var COMMIT_DELAY = 500;

    /* The widest an image is ever displayed is about 736 CSS px, so 1600
       device px still covers a 2x screen with room to spare. */
    var MAX_EDGE = 1600;
    var JPEG_QUALITY = 0.82;
    var DB_NAME = 'tge-images';
    var DB_STORE = 'blobs';

    /* ----------------------------------------------------------------- state */

    var records = new Map();   // key -> record
    var history = [];          // { key, before, after }
    var cursor = -1;           // index of the last applied op
    var pending = null;        // { key, before, timer } while typing
    var activeLink = null;     // record currently shown in the link bar
    var activeImage = null;    // record currently shown in the image bar
    var images = new Map();    // id -> { blob, name, width, height, bytes, wasBytes }
    var blobUrls = new Map();  // id -> object URL, revoked when dropped
    var ui = {};

    /* ------------------------------------------------------------- utilities */

    function norm(s) {
        return (s || '').replace(/\s+/g, ' ').trim();
    }

    function escapeHtml(s) {
        return String(s).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }

    /* An anchor like <a><b>Label</b></a> should have its <b> edited, not the
       anchor, or editing would eat the <b>. Descend while the element has
       exactly one element child and no text of its own. */
    function textHost(el) {
        var cur = el;
        for (var guard = 0; guard < 8; guard++) {
            var kids = cur.children;
            var ownText = Array.prototype.filter.call(cur.childNodes, function (n) {
                return n.nodeType === 3 && n.textContent.trim() !== '';
            }).length;
            if (kids.length === 1 && ownText === 0) { cur = kids[0]; continue; }
            return cur;
        }
        return cur;
    }

    function bytes(n) {
        if (n < 1024) return n + ' B';
        if (n < 1024 * 1024) return (n / 1024).toFixed(0) + ' KB';
        return (n / 1048576).toFixed(1) + ' MB';
    }

    /* An image record's value is the id of a staged replacement, or '' for
       "still the file on disk". The <img> src cannot be the value, because
       while previewing it holds a blob: URL that means nothing to the repo. */
    function getValue(rec) {
        if (rec.kind === 'text') return norm(rec.host.textContent);
        if (rec.kind === 'image' || rec.kind === 'token') return rec.value || '';
        return rec.el.getAttribute(rec.kind) || '';
    }

    function setValue(rec, value) {
        if (rec.kind === 'token') {
            rec.value = value;
            if (value === rec.original) rec.el.style.removeProperty(rec.prop);
            else rec.el.style.setProperty(rec.prop, value);
            if (ui.panel && !ui.panel.hidden) syncPanel();
            return;
        }
        if (rec.kind === 'text') {
            rec.host.textContent = value;
        } else if (rec.kind === 'image') {
            rec.value = value;
            var meta = value && images.get(value);
            if (meta) {
                rec.el.setAttribute('src', blobUrls.get(value));
                /* width/height attributes are an aspect-ratio hint used before
                   the image loads. Left stale they cause a layout jump. */
                if (rec.hasDims) {
                    rec.el.setAttribute('width', meta.width);
                    rec.el.setAttribute('height', meta.height);
                }
            } else {
                rec.el.setAttribute('src', rec.originalSrc);
                if (rec.hasDims) {
                    rec.el.setAttribute('width', rec.originalW);
                    rec.el.setAttribute('height', rec.originalH);
                }
            }
        } else {
            rec.el.setAttribute(rec.kind, value);
        }
        rec.el.toggleAttribute('data-tge-dirty', value !== rec.original);
    }

    function toast(message, ms) {
        if (ui.toast) ui.toast.remove();
        var el = document.createElement('div');
        el.className = 'tge-toast';
        el.setAttribute('role', 'status');
        el.textContent = message;
        document.body.appendChild(el);
        ui.toast = el;
        setTimeout(function () { if (ui.toast === el) { el.remove(); ui.toast = null; } }, ms || 4000);
    }

    /* ------------------------------------------------------------- collection */

    function collectTokens() {
        var root = document.documentElement;
        var cs = getComputedStyle(root);
        TOKENS.forEach(function (tok) {
            var key = 'layout[' + tok.prop + ']';
            var rec = { key: key, kind: 'token', prop: tok.prop, spec: tok, el: root };
            rec.original = cs.getPropertyValue(tok.prop).trim();
            rec.value = rec.original;
            records.set(key, rec);
        });
    }

    function collect() {
        REGIONS.forEach(function (region) {
            var nodes = document.querySelectorAll(region.sel);
            Array.prototype.forEach.call(nodes, function (el, i) {
                if (el.closest('.tge-bar, .tge-drawer')) return;
                if (region.text) add(region.name + '[' + i + ']', el, 'text');
                if (region.href) add(region.name + '[' + i + ']@href', el, 'href');
                if (region.image) add(region.name + '[' + i + ']@image', el, 'image');
            });
        });
    }

    function add(key, el, kind) {
        var rec = { key: key, el: el, kind: kind, host: kind === 'text' ? textHost(el) : el };
        rec.original = kind === 'image' ? '' : getValue(rec);
        records.set(key, rec);

        if (kind === 'text') {
            rec.host.setAttribute('data-tge-editable', '');
            rec.host.setAttribute('data-tge-key', key);
            rec.host.setAttribute('tabindex', '0');
            try {
                rec.host.contentEditable = 'plaintext-only';
                if (rec.host.contentEditable !== 'plaintext-only') rec.host.contentEditable = 'true';
            } catch (e) {
                rec.host.contentEditable = 'true';
            }
        } else if (kind === 'image') {
            rec.originalSrc = el.getAttribute('src') || '';
            rec.hasDims = el.hasAttribute('width') && el.hasAttribute('height');
            rec.originalW = el.getAttribute('width');
            rec.originalH = el.getAttribute('height');
            rec.value = '';
            rec.original = '';
            el.setAttribute('data-tge-imageable', '');
        } else {
            el.setAttribute('data-tge-linkable', '');
        }
    }

    /* --------------------------------------------------------------- history */

    /* One undo step is one field's worth of editing, not one typing pause.
       Committing on a 500ms debounce alone produced 23 separate ops for a
       single edit to the logo, so consecutive ops on the same key are merged
       into the one already at the top of the stack. An edit that ends up back
       where it started removes itself entirely. */
    function record(key, before, after) {
        if (before === after) return;
        history.length = cursor + 1;      // drop any redo tail
        var top = history[cursor];
        if (top && top.key === key) {
            top.after = after;
            if (top.before === top.after) { history.length = cursor; cursor--; }
        } else {
            history.push({ key: key, before: before, after: after });
            cursor = history.length - 1;
        }
        sync();
    }

    function undo() {
        flushPending();
        if (cursor < 0) return;
        var op = history[cursor];
        var rec = records.get(op.key);
        if (rec) { setValue(rec, op.before); reveal(rec); }
        cursor--;
        sync();
    }

    function redo() {
        flushPending();
        if (cursor >= history.length - 1) return;
        cursor++;
        var op = history[cursor];
        var rec = records.get(op.key);
        if (rec) { setValue(rec, op.after); reveal(rec); }
        sync();
    }

    function reveal(rec) {
        var box = rec.el.getBoundingClientRect();
        if (box.bottom < 80 || box.top > window.innerHeight - 140) {
            rec.el.scrollIntoView({ block: 'center', behavior: 'auto' });
        }
    }

    /* Everything changed relative to the file on disk, in document order. */
    function changes() {
        var out = [];
        records.forEach(function (rec) {
            var now = getValue(rec);
            if (now !== rec.original) out.push({ rec: rec, before: rec.original, after: now });
        });
        return out;
    }

    function discardAll() {
        flushPending();
        records.forEach(function (rec) {
            if (getValue(rec) !== rec.original) setValue(rec, rec.original);
        });
        history.length = 0;
        cursor = -1;
        dropAllBlobs();
        closeLinkBar();
        closeImageBar();
        saveDraft();
        sync();
        toast('All changes discarded.');
    }

    /* ----------------------------------------------------------- text editing */

    function flushPending() {
        if (!pending) return;
        clearTimeout(pending.timer);
        var rec = records.get(pending.key);
        var before = pending.before;
        pending = null;
        if (rec) {
            var after = getValue(rec);
            rec.el.toggleAttribute('data-tge-dirty', after !== rec.original);
            record(rec.key, before, after);
        }
    }

    function onInput(e) {
        var host = e.target.closest ? e.target.closest('[data-tge-key]') : null;
        if (!host) return;
        var key = host.getAttribute('data-tge-key');
        if (pending && pending.key !== key) flushPending();
        if (!pending) pending = { key: key, before: getValueSnapshotFor(key), timer: null };
        clearTimeout(pending.timer);
        pending.timer = setTimeout(flushPending, COMMIT_DELAY);
        saveDraftSoon();
    }

    /* The value a field had before this burst of typing began: the last thing
       history knows about, or the file's value if history has nothing. */
    function getValueSnapshotFor(key) {
        for (var i = cursor; i >= 0; i--) {
            if (history[i].key === key) return history[i].after;
        }
        var rec = records.get(key);
        return rec ? rec.original : '';
    }

    function onBeforeInput(e) {
        if (e.inputType === 'historyUndo' || e.inputType === 'historyRedo') {
            /* contenteditable keeps its own undo stack, which would compete
               with ours and undo things this app never recorded. */
            e.preventDefault();
            if (e.inputType === 'historyUndo') undo(); else redo();
            return;
        }
        if (e.inputType === 'insertParagraph' || e.inputType === 'insertLineBreak') {
            e.preventDefault();
            if (e.target.blur) e.target.blur();
        }
    }

    function onPaste(e) {
        var host = e.target.closest ? e.target.closest('[data-tge-key]') : null;
        if (!host) return;
        e.preventDefault();
        var text = (e.clipboardData || window.clipboardData).getData('text/plain');
        document.execCommand('insertText', false, norm(text));
    }

    /* ----------------------------------------------------------- link editing */

    function openLinkBar(rec) {
        activeLink = rec;
        ui.linkbar.hidden = false;
        ui.linkLabel.textContent = rec.key.replace('@href', '');
        ui.linkInput.value = getValue(rec);
        ui.linkInput.focus();
        ui.linkInput.select();
    }

    function closeLinkBar() {
        activeLink = null;
        ui.linkbar.hidden = true;
    }

    function applyLink() {
        if (!activeLink) return;
        var before = getValue(activeLink);
        var after = ui.linkInput.value.trim();
        if (before !== after) {
            setValue(activeLink, after);
            record(activeLink.key, before, after);
            saveDraft();
        }
        closeLinkBar();
    }

    /* ---------------------------------------------------------- image blobs */

    /* Blobs go in IndexedDB, not localStorage: a photo is megabytes, the
       localStorage quota is a few, and stringifying one into every draft save
       would stall the page on each keystroke. */
    function openDb() {
        return new Promise(function (resolve, reject) {
            var req = indexedDB.open(DB_NAME, 1);
            req.onupgradeneeded = function () { req.result.createObjectStore(DB_STORE); };
            req.onsuccess = function () { resolve(req.result); };
            req.onerror = function () { reject(req.error); };
        });
    }

    function dbTx(mode, fn) {
        return openDb().then(function (db) {
            return new Promise(function (resolve, reject) {
                var tx = db.transaction(DB_STORE, mode);
                var out = fn(tx.objectStore(DB_STORE));
                tx.oncomplete = function () { resolve(out && out.result); };
                tx.onerror = function () { reject(tx.error); };
            });
        });
    }

    function dbPut(id, value) { return dbTx('readwrite', function (st) { return st.put(value, id); }); }
    function dbGetAll() { return dbTx('readonly', function (st) { return st.getAll(); }); }
    function dbGetKeys() { return dbTx('readonly', function (st) { return st.getAllKeys(); }); }
    function dbClear() { return dbTx('readwrite', function (st) { return st.clear(); }); }

    function stageBlob(id, meta) {
        images.set(id, meta);
        blobUrls.set(id, URL.createObjectURL(meta.blob));
    }

    function dropAllBlobs() {
        blobUrls.forEach(function (url) { URL.revokeObjectURL(url); });
        blobUrls.clear();
        images.clear();
        dbClear().catch(function () {});
    }

    /* Downscale and re-encode, but never make things worse: if the source is
       already small enough and re-encoding would not shrink it, keep the
       original bytes. PNG stays PNG so transparency is not flattened to
       black, and SVG is passed through untouched. */
    function processImage(file) {
        if (file.type === 'image/svg+xml') {
            return Promise.resolve({ blob: file, width: 0, height: 0, note: 'SVG passed through' });
        }
        return createImageBitmap(file).then(function (bmp) {
            var scale = Math.min(1, MAX_EDGE / Math.max(bmp.width, bmp.height));
            var w = Math.round(bmp.width * scale);
            var h = Math.round(bmp.height * scale);
            var canvas = document.createElement('canvas');
            canvas.width = w;
            canvas.height = h;
            canvas.getContext('2d').drawImage(bmp, 0, 0, w, h);
            bmp.close && bmp.close();
            var type = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
            return new Promise(function (resolve) {
                canvas.toBlob(function (blob) {
                    if (!blob || (scale === 1 && blob.size >= file.size)) {
                        resolve({ blob: file, width: bmp.width, height: bmp.height,
                                  note: 'kept original bytes, re-encoding gained nothing' });
                    } else {
                        resolve({ blob: blob, width: w, height: h,
                                  note: scale < 1 ? 'downscaled to ' + w + 'x' + h : 're-encoded' });
                    }
                }, type, JPEG_QUALITY);
            });
        });
    }

    function replaceImage(rec, file) {
        return processImage(file).then(function (out) {
            var id = 'img' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
            var meta = {
                blob: out.blob, name: file.name, width: out.width, height: out.height,
                bytes: out.blob.size, wasBytes: file.size, target: rec.originalSrc, note: out.note
            };
            stageBlob(id, meta);
            return dbPut(id, meta).catch(function () {}).then(function () {
                var before = getValue(rec);
                setValue(rec, id);
                record(rec.key, before, id);
                saveDraft();
                showImageBar(rec);
                toast(file.name + ' \u2192 ' + rec.originalSrc + '  (' + bytes(meta.wasBytes) +
                      ' \u2192 ' + bytes(meta.bytes) + ', ' + out.note + ')', 7000);
            });
        }).catch(function (err) {
            toast('Could not read that image: ' + err.message, 6000);
        });
    }

    function showImageBar(rec) {
        activeImage = rec;
        ui.imagebar.hidden = false;
        ui.imageLabel.textContent = rec.originalSrc;
        var id = getValue(rec);
        var meta = id && images.get(id);
        ui.imageInfo.textContent = meta
            ? 'staged: ' + meta.name + '  ' + bytes(meta.wasBytes) + ' \u2192 ' + bytes(meta.bytes) +
              (meta.width ? '  (' + meta.width + '\u00d7' + meta.height + ')' : '')
            : 'unchanged';
        ui.imagebar.querySelector('[data-act="revertimage"]').disabled = !meta;
    }

    function closeImageBar() {
        activeImage = null;
        ui.imagebar.hidden = true;
    }

    function revertImage() {
        if (!activeImage) return;
        var before = getValue(activeImage);
        if (!before) return;
        setValue(activeImage, '');
        record(activeImage.key, before, '');
        saveDraft();
        showImageBar(activeImage);
    }

    /* ---------------------------------------------------------- layout panel */

    /* How many characters of real prose fit at a given width. --measure is in
       ch, the width of "0", which in this serif is noticeably wider than the
       average letter - so the ch number alone tells you very little. */
    var measureProbe = null;
    function charsAtWidth(px) {
        var sample = document.querySelector('.hero-description');
        if (!sample) return null;
        if (!measureProbe) {
            measureProbe = document.createElement('span');
            measureProbe.style.cssText = 'position:absolute;visibility:hidden;white-space:pre;left:-9999px;top:0';
            document.body.appendChild(measureProbe);
        }
        measureProbe.style.font = getComputedStyle(sample).font;
        var text = norm(sample.textContent);
        if (!text) return null;
        var lo = 1, hi = text.length;
        while (lo < hi) {
            var mid = (lo + hi + 1) >> 1;
            measureProbe.textContent = text.slice(0, mid);
            if (measureProbe.getBoundingClientRect().width <= px) lo = mid; else hi = mid - 1;
        }
        return lo;
    }

    /* 1ch is the advance width of "0" in the current font. */
    function chToPx(n) {
        var sample = document.querySelector('.hero-description');
        if (!sample || !measureProbe) charsAtWidth(1);
        if (!measureProbe) return n * 8;
        measureProbe.style.font = getComputedStyle(sample).font;
        measureProbe.textContent = new Array(Math.max(1, Math.round(n)) + 1).join('0');
        return measureProbe.getBoundingClientRect().width;
    }

    function buildPanel() {
        var panel = document.createElement('div');
        panel.className = 'tge-panel';
        panel.hidden = true;
        panel.innerHTML = '<h2>Layout</h2>' + TOKENS.map(function (tok) {
            var key = 'layout[' + tok.prop + ']';
            return '<div class="tge-row">' +
                '<label for="tge-' + tok.prop + '">' + escapeHtml(tok.label) + '</label>' +
                '<input id="tge-' + tok.prop + '" type="range" data-token="' + key + '" ' +
                    'min="' + tok.min + '" max="' + tok.max + '" step="' + tok.step + '">' +
                '<output data-out="' + key + '"></output>' +
                '<button class="tge-btn tge-btn-sm" data-reset="' + key + '">Reset</button>' +
                '</div>';
        }).join('') + '<p class="tge-note" data-role="panelnote"></p>';
        document.body.appendChild(panel);
        ui.panel = panel;

        var interacting = null;
        panel.addEventListener('input', function (e) {
            var key = e.target.getAttribute('data-token');
            if (!key) return;
            var rec = records.get(key);
            /* Remember where the drag started so the whole drag is one op,
               rather than one op per pixel of travel. */
            if (!interacting || interacting.key !== key) interacting = { key: key, before: getValue(rec) };
            setValue(rec, e.target.value + rec.spec.unit);
            syncPanel();
        });
        panel.addEventListener('change', function (e) {
            var key = e.target.getAttribute('data-token');
            if (!key || !interacting) return;
            var rec = records.get(key);
            record(key, interacting.before, getValue(rec));
            interacting = null;
            saveDraft();
        });
        panel.addEventListener('click', function (e) {
            var key = e.target.getAttribute('data-reset');
            if (!key) return;
            var rec = records.get(key);
            var before = getValue(rec);
            if (before === rec.original) return;
            setValue(rec, rec.original);
            record(key, before, rec.original);
            saveDraft();
            syncPanel();
        });
    }

    function syncPanel() {
        if (!ui.panel) return;
        TOKENS.forEach(function (tok) {
            var key = 'layout[' + tok.prop + ']';
            var rec = records.get(key);
            var num = parseFloat(getValue(rec));
            var slider = ui.panel.querySelector('[data-token="' + key + '"]');
            var out = ui.panel.querySelector('[data-out="' + key + '"]');
            if (slider && document.activeElement !== slider) slider.value = num;
            if (out) {
                var shown = tok.unit === '' ? num.toFixed(2) + '\u00d7' : Math.round(num) + tok.unit;
                if (tok.prop === '--measure') {
                    /* Report the cap the slider actually sets, not the
                       paragraph's current width - on a narrow window the
                       column is the binding constraint and the cap is idle. */
                    var capPx = chToPx(num);
                    var chars = charsAtWidth(capPx);
                    if (chars) shown += '  \u2248 ' + chars + ' characters';
                    var el = document.querySelector('.hero-description');
                    if (el && el.getBoundingClientRect().width < capPx - 1) {
                        shown += '  (column is narrower here)';
                    }
                }
                out.textContent = shown;
                out.classList.toggle('tge-changed', getValue(rec) !== rec.original);
            }
        });
        var note = ui.panel.querySelector('[data-role="panelnote"]');
        if (note) {
            note.textContent = 'Comfortable line length is 45\u201375 characters. ' +
                'Spacing scale multiplies section padding, grid gaps, card padding and the page gutter \u2014 ' +
                'not type sizes, and not the navbar clearance.';
        }
    }

    /* ------------------------------------------------------------- draft I/O */

    var draftTimer = null;
    function saveDraftSoon() {
        clearTimeout(draftTimer);
        draftTimer = setTimeout(saveDraft, 800);
    }

    function saveDraft() {
        try {
            if (!history.length) { localStorage.removeItem(DRAFT_KEY); return; }
            var originals = {};
            history.forEach(function (op) {
                var rec = records.get(op.key);
                if (rec) originals[op.key] = rec.original;
            });
            localStorage.setItem(DRAFT_KEY, JSON.stringify({
                v: DRAFT_VERSION,
                savedAt: Date.now(),
                ops: history,
                cursor: cursor,
                originals: originals
            }));
            /* The blobs themselves already live in IndexedDB; drop any whose
               id no longer appears in history so they do not accumulate. */
            var live = {};
            history.forEach(function (op) { live[op.after] = true; live[op.before] = true; });
            dbGetKeys().then(function (keys) {
                (keys || []).forEach(function (id) {
                    if (!live[id]) dbTx('readwrite', function (st) { return st.delete(id); }).catch(function () {});
                });
            }).catch(function () {});
        } catch (e) { /* private mode, quota - drafting is a convenience */ }
    }

    function loadDraft() {
        var raw;
        try { raw = localStorage.getItem(DRAFT_KEY); } catch (e) { return Promise.resolve(); }
        if (!raw) return Promise.resolve();

        var draft;
        try { draft = JSON.parse(raw); } catch (e) { return Promise.resolve(); }
        if (!draft || draft.v !== DRAFT_VERSION || !Array.isArray(draft.ops) || !draft.ops.length) return Promise.resolve();

        /* If the page has changed since the draft was written, the indices in
           these keys may no longer point at the same content. Refuse rather
           than silently write edits into the wrong elements. */
        var stale = Object.keys(draft.originals || {}).filter(function (key) {
            var rec = records.get(key);
            return !rec || rec.original !== draft.originals[key];
        });
        if (stale.length) {
            try { localStorage.removeItem(DRAFT_KEY); } catch (e) {}
            toast('A saved draft was discarded: the page changed underneath it (' +
                  stale.length + ' of ' + Object.keys(draft.originals).length + ' fields no longer match).', 9000);
            dropAllBlobs();
            return Promise.resolve();
        }

        return dbGetAll().catch(function () { return []; }).then(function (metas) {
            return dbGetKeys().catch(function () { return []; }).then(function (ids) {
                (ids || []).forEach(function (id, i) { if (metas[i]) stageBlob(id, metas[i]); });
                return applyDraft(draft);
            });
        });
    }

    function applyDraft(draft) {

        history = draft.ops;
        cursor = typeof draft.cursor === 'number' ? draft.cursor : history.length - 1;
        for (var i = 0; i <= cursor; i++) {
            var rec = records.get(history[i].key);
            if (rec) setValue(rec, history[i].after);
        }
        var age = Math.round((Date.now() - draft.savedAt) / 60000);
        var n = changes().length;
        toast('Restored ' + n + ' unsaved change' + (n === 1 ? '' : 's') +
              ' from ' + (age < 1 ? 'less than a minute' : age + ' minute' + (age === 1 ? '' : 's')) + ' ago.', 6000);
        return Promise.resolve();
    }

    /* ------------------------------------------------------------------- UI */

    function buildUI() {
        var bar = document.createElement('div');
        bar.className = 'tge-bar';
        bar.innerHTML =
            '<span class="tge-title">DEV MODE</span>' +
            '<button class="tge-btn" data-act="undo" title="Ctrl/Cmd+Z">Undo</button>' +
            '<button class="tge-btn" data-act="redo" title="Ctrl/Cmd+Shift+Z">Redo</button>' +
            '<span class="tge-count" data-role="count">No changes</span>' +
            '<span class="tge-linkbar" hidden>' +
              '<label data-role="linklabel"></label>' +
              '<input class="tge-input" data-role="linkinput" spellcheck="false">' +
              '<button class="tge-btn" data-act="applylink">Apply</button>' +
              '<button class="tge-btn" data-act="cancellink">Cancel</button>' +
            '</span>' +
            '<span class="tge-imagebar" hidden>' +
              '<label data-role="imagelabel"></label>' +
              '<button class="tge-btn" data-act="pickimage">Choose image\u2026</button>' +
              '<button class="tge-btn" data-act="revertimage">Revert</button>' +
              '<span class="tge-imageinfo" data-role="imageinfo"></span>' +
              '<button class="tge-btn" data-act="closeimage">Close</button>' +
            '</span>' +
            '<span class="tge-spacer"></span>' +
            '<button class="tge-btn" data-act="layout">Layout</button>' +
            '<button class="tge-btn" data-act="toggle">Review changes</button>' +
            '<button class="tge-btn tge-btn-danger" data-act="discard">Discard all</button>' +
            '<button class="tge-btn tge-btn-primary" data-act="publish">Publish…</button>';
        document.body.appendChild(bar);

        var drawer = document.createElement('div');
        drawer.className = 'tge-drawer';
        drawer.hidden = true;
        drawer.innerHTML = '<h2>Pending changes</h2><div data-role="list"></div>';
        document.body.appendChild(drawer);

        buildPanel();
        ui.bar = bar;
        ui.drawer = drawer;
        ui.list = drawer.querySelector('[data-role="list"]');
        ui.count = bar.querySelector('[data-role="count"]');
        ui.undo = bar.querySelector('[data-act="undo"]');
        ui.redo = bar.querySelector('[data-act="redo"]');
        ui.discard = bar.querySelector('[data-act="discard"]');
        ui.publish = bar.querySelector('[data-act="publish"]');
        ui.linkbar = bar.querySelector('.tge-linkbar');
        ui.linkLabel = bar.querySelector('[data-role="linklabel"]');
        ui.linkInput = bar.querySelector('[data-role="linkinput"]');
        ui.imagebar = bar.querySelector('.tge-imagebar');
        ui.imageLabel = bar.querySelector('[data-role="imagelabel"]');
        ui.imageInfo = bar.querySelector('[data-role="imageinfo"]');

        ui.file = document.createElement('input');
        ui.file.type = 'file';
        ui.file.accept = 'image/*';
        ui.file.hidden = true;
        document.body.appendChild(ui.file);
        ui.file.addEventListener('change', function () {
            var file = ui.file.files && ui.file.files[0];
            ui.file.value = '';
            if (file && activeImage) replaceImage(activeImage, file);
        });

        bar.addEventListener('click', function (e) {
            var act = e.target.getAttribute && e.target.getAttribute('data-act');
            if (!act) return;
            if (act === 'undo') undo();
            else if (act === 'redo') redo();
            else if (act === 'toggle') { drawer.hidden = !drawer.hidden; if (!drawer.hidden) ui.panel.hidden = true; renderChanges(); }
            else if (act === 'layout') { ui.panel.hidden = !ui.panel.hidden; if (!ui.panel.hidden) { drawer.hidden = true; syncPanel(); } }
            else if (act === 'discard') { if (changes().length && confirm('Discard all pending changes?')) discardAll(); }
            else if (act === 'applylink') applyLink();
            else if (act === 'cancellink') closeLinkBar();
            else if (act === 'pickimage') ui.file.click();
            else if (act === 'revertimage') revertImage();
            else if (act === 'closeimage') closeImageBar();
            else if (act === 'publish') {
                toast('Publishing arrives in a later phase. Your changes are saved locally and survive a reload.', 6000);
            }
        });

        ui.linkInput.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') { e.preventDefault(); applyLink(); }
            if (e.key === 'Escape') { e.preventDefault(); closeLinkBar(); }
        });
    }

    function renderChanges() {
        if (ui.drawer.hidden) return;
        var list = changes();
        if (!list.length) {
            ui.list.innerHTML = '<p class="tge-empty">Nothing changed yet.</p>';
            return;
        }
        ui.list.innerHTML = list.map(function (c) {
            var vals;
            if (c.rec.kind === 'token') {
                vals = '<span class="tge-was">' + escapeHtml(c.before) + '</span>' +
                       '<span class="tge-now">' + escapeHtml(c.after) + '</span>';
            } else if (c.rec.kind === 'image') {
                var meta = images.get(c.after);
                vals = meta
                    ? '<span class="tge-was">' + escapeHtml(c.rec.originalSrc) + '</span>' +
                      '<span class="tge-now">replaced with ' + escapeHtml(meta.name) + ' \u2014 ' +
                      bytes(meta.wasBytes) + ' \u2192 ' + bytes(meta.bytes) +
                      (meta.width ? ', ' + meta.width + '\u00d7' + meta.height : '') + '</span>' +
                      '<img class="tge-thumb" src="' + blobUrls.get(c.after) + '" alt="">'
                    : '<span class="tge-now">reverted to ' + escapeHtml(c.rec.originalSrc) + '</span>';
            } else {
                vals = '<span class="tge-was">' + escapeHtml(c.before || '(empty)') + '</span>' +
                       '<span class="tge-now">' + escapeHtml(c.after || '(empty)') + '</span>';
            }
            return '<div class="tge-change">' +
                '<div class="tge-change-key">' + escapeHtml(c.rec.key) + '</div>' +
                '<div class="tge-change-vals">' + vals + '</div></div>';
        }).join('');
    }

    function sync() {
        var n = changes().length;
        ui.count.textContent = n === 0 ? 'No changes' : n + ' change' + (n === 1 ? '' : 's');
        ui.undo.disabled = cursor < 0;
        ui.redo.disabled = cursor >= history.length - 1;
        ui.discard.disabled = n === 0;
        renderChanges();
        saveDraftSoon();
    }

    /* --------------------------------------------------------------- wiring */

    function onClick(e) {
        if (e.target.closest('.tge-bar, .tge-drawer, .tge-toast')) return;

        /* Links must not navigate while editing. */
        var anchor = e.target.closest('a');
        if (anchor) { e.preventDefault(); e.stopPropagation(); }

        var editable = e.target.closest('[data-tge-editable]');
        if (editable) editable.focus();

        var imageable = e.target.closest('[data-tge-imageable]');
        if (imageable) {
            var imgKey = null;
            records.forEach(function (rec) { if (rec.kind === 'image' && rec.el === imageable) imgKey = rec.key; });
            if (imgKey) showImageBar(records.get(imgKey));
        } else if (!editable) {
            closeImageBar();
        }

        var linkable = e.target.closest('[data-tge-linkable]');
        if (linkable) {
            var key = null;
            records.forEach(function (rec) { if (rec.kind === 'href' && rec.el === linkable) key = rec.key; });
            if (key) openLinkBar(records.get(key));
        } else if (!editable) {
            closeLinkBar();
        }
    }

    function onKeydown(e) {
        var mod = e.metaKey || e.ctrlKey;
        if (!mod) return;
        var k = e.key.toLowerCase();
        if (k === 'z') { e.preventDefault(); if (e.shiftKey) redo(); else undo(); }
        else if (k === 'y') { e.preventDefault(); redo(); }
    }

    function init() {
        document.body.classList.add('tge-on');
        buildUI();
        collectTokens();
        collect();
        syncPanel();

        document.addEventListener('click', onClick, true);
        document.addEventListener('keydown', onKeydown, true);
        document.addEventListener('beforeinput', onBeforeInput, true);
        document.addEventListener('input', onInput, true);
        document.addEventListener('paste', onPaste, true);
        document.addEventListener('focusout', function (e) {
            if (e.target.hasAttribute && e.target.hasAttribute('data-tge-key')) flushPending();
        }, true);

        window.addEventListener('beforeunload', function (e) {
            if (changes().length) { e.preventDefault(); e.returnValue = ''; }
        });

        Promise.resolve(loadDraft()).catch(function () {}).then(function () {
            sync();
            window.__tgeReady = true;
        });
        sync();

        console.info('[dev mode] ' + records.size + ' editable fields across ' + REGIONS.length + ' regions.');
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
