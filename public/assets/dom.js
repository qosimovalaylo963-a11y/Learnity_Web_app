'use strict';

const runtimeMode = document.querySelector('meta[name="learnity-runtime"]').content;
const isPreview = runtimeMode === 'preview';
const isDemo = isPreview || runtimeMode === 'development';
const templateNode = Symbol('Learnity template');
const view = htm.bind((tag, attrs, ...children) => ({ [templateNode]: true, tag, attrs, children }));
const tags = new Set(
    'div img span h1 h2 h3 h4 p i b em strong input button a select option form label textarea code small'.split(
        ' ',
    ),
);
const attributes = new Set(
    'class id alt draggable data-content-key contenteditable data-lucide type min max step value title accept href src target rel placeholder name minlength maxlength rows data-subj-perm-row for aria-label aria-pressed aria-live aria-hidden aria-busy disabled checked required selected readonly multiple autocomplete loading decoding'.split(
        ' ',
    ),
);
const listenerNames = new Set(['click', 'submit', 'change', 'input', 'blur', 'pointerdown', 'keydown']);
const bundledPhotos = new Set([
    '1507003211169-0a1dd7228f2d',
    '1515187029135-18ee286d815b',
    '1517245386807-bb43f82c33c4',
    '1522071820081-009f0129c71c',
    '1522202176988-66273c2fd55f',
    '1524178232363-1fb2b075b655',
    '1531482615713-2afd69097998',
    '1534528741775-53994a69daeb',
    '1540575467063-178a50c2df87',
    '1573496359142-b8d87734a5a2',
    '1580489944761-15a19d654956',
    '1581092160607-ee22621dd758',
]);
const imagePlaceholder = 'assets/photo-unavailable.svg';
const plainRecord = (x) => Boolean(x && typeof x === 'object' && !Array.isArray(x));
const validSlug = (value) =>
    typeof value === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) && value.length <= 96;
const validCode = (value) => typeof value === 'string' && /^[a-z0-9][a-z0-9 -]{4,62}[a-z0-9]$/i.test(value);
const clamp = (value, low, high, fallback = low) =>
    Number.isFinite(Number(value)) ? Math.min(high, Math.max(low, Number(value))) : fallback;

function jsonValue(raw, valid, fallback) {
    try {
        const value = JSON.parse(raw);
        return valid(value) ? value : fallback;
    } catch {
        return fallback;
    }
}

function safeUrl(input, image = false) {
    if (typeof input !== 'string') return '';
    const value = input.trim();
    if (image && value.startsWith('data:')) {
        return value.length <= 11200000 &&
            /^data:image\/(?:png|jpeg|gif|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(value)
            ? value
            : '';
    }
    if (!value || value.length > 2048 || /[\u0000-\u0020\u007f\\]/.test(value) || value.startsWith('//'))
        return '';
    if (image && /^(?:\/)?assets\/(?:photos\/[a-z\d-]+\.webp|photo-unavailable\.svg)$/.test(value))
        return value.replace(/^\//, '');
    if (/^\/uploads\/[\w.-]+$/.test(value)) return value;
    if (!image && /^#[\w-]*$/.test(value)) return value;
    if (!image && /^\/api\/owner\/applications\?format=csv$/.test(value)) return value;
    try {
        const u = new URL(value);
        if (u.username || u.password || !['https:', ...(image ? [] : ['http:'])].includes(u.protocol))
            return '';
        const id = u.pathname.slice(7);
        if (
            image &&
            u.hostname === 'images.unsplash.com' &&
            u.pathname.startsWith('/photo-') &&
            bundledPhotos.has(id)
        )
            return 'assets/photos/' + id + '.webp';
        return u.href;
    } catch {
        return '';
    }
}

function accentStyle(color, tinted = false) {
    const safe = /^#[0-9a-f]{6}$/i.test(color) ? color : '#ad9bff';
    return tinted ? { color: safe, backgroundColor: safe + '22' } : { color: safe };
}
function photoStyle(photo) {
    return {
        objectPosition: clamp(photo.posX, 0, 100, 50) + '% ' + clamp(photo.posY, 0, 100, 50) + '%',
        transform: 'scale(' + clamp(photo.scale, 1, 3, 1) + ')',
    };
}
function meterStyle(percent, color) {
    return {
        flexBasis: clamp(percent, 0, 100) + '%',
        ...(color ? { backgroundColor: accentStyle(color).color } : {}),
    };
}

function appendView(parent, description) {
    if (description == null || description === false) return;
    if (Array.isArray(description)) {
        description.forEach((entry) => appendView(parent, entry));
        return;
    }
    if (typeof description !== 'object') {
        parent.appendChild(document.createTextNode(String(description)));
        return;
    }
    if (!description[templateNode] || !tags.has(description.tag)) return;
    const { tag, attrs, children } = description;
    const element = document.createElement(tag);
    for (const [name, value] of Object.entries(attrs || {})) {
        if (name.startsWith('on') && listenerNames.has(name.slice(2)) && typeof value === 'function') {
            element.addEventListener(name.slice(2), name === 'onsubmit' ? submitOnce(value) : value);
        } else if (name === 'style' && plainRecord(value)) {
            for (const prop of ['color', 'backgroundColor', 'objectPosition', 'transform', 'flexBasis']) {
                if (Object.hasOwn(value, prop)) element.style[prop] = value[prop];
            }
        } else if ((name === 'src' && tag === 'img') || (name === 'href' && tag === 'a')) {
            const url = safeUrl(value, name === 'src');
            if (url) element.setAttribute(name, url);
            else if (tag === 'img') element.setAttribute('src', imagePlaceholder);
            else {
                element.setAttribute('aria-disabled', 'true');
                element.title = 'This resource has no valid link';
            }
        } else if (attributes.has(name) && value !== false && value != null) {
            element.setAttribute(name, value === true ? '' : String(value));
        }
    }
    if (tag === 'a') element.rel = 'noopener noreferrer';
    if (tag === 'img') {
        element.loading = 'lazy';
        element.decoding = 'async';
    }
    children.forEach((child) => appendView(element, child));
    parent.appendChild(element);
}
function renderInto(container, description) {
    const fragment = document.createDocumentFragment();
    appendView(fragment, description);
    container.replaceChildren(fragment);
    prepareFields(container);
}

function refreshIcons(root = document) {
    for (const node of root.querySelectorAll('i[data-lucide]')) {
        const name = node.dataset.lucide;
        const key = name.replace(/(^|-)([a-z0-9])/g, (_, p, c) => c.toUpperCase());
        const icon =
            /^[a-z0-9-]{1,48}$/.test(name) && Object.hasOwn(lucide.icons, key)
                ? lucide.icons[key]
                : lucide.icons.BookOpen;
        const svg = lucide.createElement(icon);
        svg.setAttribute('class', 'lucide ' + node.className);
        svg.setAttribute('aria-hidden', 'true');
        svg.setAttribute('focusable', 'false');
        node.replaceWith(svg);
    }
}

const inlineTags = new Set(['B', 'STRONG', 'I', 'EM', 'SPAN', 'BR']);
const escapeText = (value) => value.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]);
function serializeEditable(element) {
    function serialize(node) {
        if (node.nodeType === Node.TEXT_NODE) return escapeText(node.textContent);
        if (node.nodeType !== Node.ELEMENT_NODE) return '';
        const content = Array.from(node.childNodes, serialize).join('');
        if (!inlineTags.has(node.tagName)) return content;
        const tag = node.localName;
        return tag === 'br' ? '<br>' : '<' + tag + '>' + content + '</' + tag + '>';
    }
    return Array.from(element.childNodes, serialize).join('').trim().slice(0, 8000);
}
// Read saved formatting from older sites as a tiny text grammar. No HTML parser or executable attributes.
function readEditable(input) {
    const fragment = document.createDocumentFragment();
    const stack = [fragment];
    const entities = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: '\u00a0', '#39': "'" };
    const tokens =
        String(input ?? '')
            .slice(0, 8000)
            .match(/<[^<>]{1,350}>|[^<]+|</g) || [];
    for (const token of tokens) {
        const tag = /^<(\/?)(strong|b|em|i|br|span)\b[^>]*>$/i.exec(token);
        if (tag) {
            const name = tag[2].toLowerCase();
            if (tag[1]) {
                if (stack.length > 1 && stack.at(-1).localName === name) stack.pop();
            } else if (stack.length < 32) {
                const node = document.createElement(name);
                stack.at(-1).append(node);
                if (name !== 'br') stack.push(node);
            }
        } else if (!/^<\/?[a-z!][^>]*>$/i.test(token)) {
            stack
                .at(-1)
                .append(
                    document.createTextNode(
                        token.replace(/&(amp|lt|gt|quot|apos|nbsp|#39);/g, (_, k) => entities[k]),
                    ),
                );
        }
    }
    return fragment;
}
function safePhotoState(photo) {
    if (!plainRecord(photo)) return null;
    const src = safeUrl(photo.imageSrc, true);
    return {
        posX: clamp(photo.posX, 0, 100, 50),
        posY: clamp(photo.posY, 0, 100, 50),
        scale: clamp(photo.scale, 1, 3, 1),
        imageSrc: src || imagePlaceholder,
    };
}
function safeCards(cards) {
    if (!Array.isArray(cards)) return [];
    const ids = new Set();
    return cards
        .filter(
            (c) =>
                plainRecord(c) &&
                typeof c.id === 'string' &&
                /^[\w-]{1,100}$/.test(c.id) &&
                !ids.has(c.id) &&
                ids.add(c.id),
        )
        .map((c) => ({
            ...safePhotoState(c),
            id: c.id,
            mediaId: Number(c.mediaId) || null,
            title: String(c.title ?? '').slice(0, 240),
            category: String(c.category ?? '').slice(0, 160),
            date: String(c.date ?? '').slice(0, 160),
            description: String(c.description ?? '').slice(0, 4000),
            is_visible: c.is_visible !== false && c.is_visible !== 0,
            is_archived: c.is_archived === true || c.is_archived === 1,
            cropAspect: String(c.cropAspect || '16:10').slice(0, 16),
        }));
}

async function apiRequest(path, options = {}) {
    if (!/^\/api\/[\w/-]+(?:\?[\w%&=+.-]+)?$/.test(path) || path.length > 2048)
        throw new Error('Invalid request address.');
    if (isPreview) {
        await demoReady;
        return localApiFallback(path, options);
    }
    const headers = new Headers(options.headers);
    headers.set('X-Learnity-Client', 'browser');
    if (options.body && !(options.body instanceof FormData)) headers.set('Content-Type', 'application/json');
    if (csrfToken) headers.set('X-CSRF-Token', csrfToken);
    let response;
    try {
        response = await fetch(path, {
            ...options,
            headers,
            credentials: 'same-origin',
            cache: 'no-store',
            redirect: 'error',
        });
    } catch {
        throw new Error('Could not reach Learnity. Check your connection and try again.');
    }
    const data = jsonValue(await response.text(), plainRecord, null);
    if (!data || !response.ok)
        throw new Error(
            typeof data?.error === 'string'
                ? data.error.slice(0, 350)
                : 'The server could not complete the request (' + response.status + ').',
        );
    return data;
}

function renderLoadFailure(container, error, retry) {
    renderInto(
        container,
        view`<div class="surface-card rounded-xl p-5"><p>${error.message}</p><button type="button" class="btn btn-secondary mt-3" onclick=${retry}>Try again</button></div>`,
    );
}
