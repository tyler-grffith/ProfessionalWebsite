/* Developer mode: in-place editing of text and links.
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
 * Phase 2 of the editor: text, links, undo/redo, drafts.
 * Images, layout tokens and publishing arrive in later phases.
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
        { name: 'footer',        sel: '.footer p',             text: true }
    ];

    var DRAFT_KEY = 'tge.draft.' + location.pathname;
    var DRAFT_VERSION = 2;
    var COMMIT_DELAY = 500;

    /* ----------------------------------------------------------------- state */

    var records = new Map();   // key -> record
    var history = [];          // { key, before, after }
    var cursor = -1;           // index of the last applied op
    var pending = null;        // { key, before, timer } while typing
    var activeLink = null;     // record currently shown in the link bar
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

    function getValue(rec) {
        if (rec.kind === 'text') return norm(rec.host.textContent);
        return rec.el.getAttribute(rec.kind) || '';
    }

    function setValue(rec, value) {
        if (rec.kind === 'text') rec.host.textContent = value;
        else rec.el.setAttribute(rec.kind, value);
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

    function collect() {
        REGIONS.forEach(function (region) {
            var nodes = document.querySelectorAll(region.sel);
            Array.prototype.forEach.call(nodes, function (el, i) {
                if (el.closest('.tge-bar, .tge-drawer')) return;
                if (region.text) add(region.name + '[' + i + ']', el, 'text');
                if (region.href) add(region.name + '[' + i + ']@href', el, 'href');
            });
        });
    }

    function add(key, el, kind) {
        var rec = { key: key, el: el, kind: kind, host: kind === 'text' ? textHost(el) : el };
        rec.original = getValue(rec);
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
        } else {
            el.setAttribute('data-tge-linkable', '');
        }
    }

    /* --------------------------------------------------------------- history */

    function record(key, before, after) {
        if (before === after) return;
        history.length = cursor + 1;      // drop any redo tail
        history.push({ key: key, before: before, after: after });
        cursor = history.length - 1;
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
        closeLinkBar();
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
        } catch (e) { /* private mode, quota - drafting is a convenience */ }
    }

    function loadDraft() {
        var raw;
        try { raw = localStorage.getItem(DRAFT_KEY); } catch (e) { return; }
        if (!raw) return;

        var draft;
        try { draft = JSON.parse(raw); } catch (e) { return; }
        if (!draft || draft.v !== DRAFT_VERSION || !Array.isArray(draft.ops) || !draft.ops.length) return;

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
            return;
        }

        history = draft.ops;
        cursor = typeof draft.cursor === 'number' ? draft.cursor : history.length - 1;
        for (var i = 0; i <= cursor; i++) {
            var rec = records.get(history[i].key);
            if (rec) setValue(rec, history[i].after);
        }
        var age = Math.round((Date.now() - draft.savedAt) / 60000);
        toast('Restored ' + changes().length + ' unsaved change' + (changes().length === 1 ? '' : 's') +
              ' from ' + (age < 1 ? 'less than a minute' : age + ' minute' + (age === 1 ? '' : 's')) + ' ago.', 6000);
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
            '<span class="tge-spacer"></span>' +
            '<button class="tge-btn" data-act="toggle">Review changes</button>' +
            '<button class="tge-btn tge-btn-danger" data-act="discard">Discard all</button>' +
            '<button class="tge-btn tge-btn-primary" data-act="publish">Publish…</button>';
        document.body.appendChild(bar);

        var drawer = document.createElement('div');
        drawer.className = 'tge-drawer';
        drawer.hidden = true;
        drawer.innerHTML = '<h2>Pending changes</h2><div data-role="list"></div>';
        document.body.appendChild(drawer);

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

        bar.addEventListener('click', function (e) {
            var act = e.target.getAttribute && e.target.getAttribute('data-act');
            if (!act) return;
            if (act === 'undo') undo();
            else if (act === 'redo') redo();
            else if (act === 'toggle') { drawer.hidden = !drawer.hidden; renderChanges(); }
            else if (act === 'discard') { if (changes().length && confirm('Discard all pending changes?')) discardAll(); }
            else if (act === 'applylink') applyLink();
            else if (act === 'cancellink') closeLinkBar();
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
            return '<div class="tge-change">' +
                '<div class="tge-change-key">' + escapeHtml(c.rec.key) + '</div>' +
                '<div class="tge-change-vals">' +
                    '<span class="tge-was">' + escapeHtml(c.before || '(empty)') + '</span>' +
                    '<span class="tge-now">' + escapeHtml(c.after || '(empty)') + '</span>' +
                '</div></div>';
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
        collect();

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

        loadDraft();
        sync();

        console.info('[dev mode] ' + records.size + ' editable fields across ' + REGIONS.length + ' regions.');
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
