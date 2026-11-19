'use strict';

const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
const easing = 'cubic-bezier(.22,.75,.2,1)';
const canMove = () => !motionPreference.matches;
let revealObserver;
let featuredIndex = 0;

function animatePanel(element) {
    if (element && canMove())
        element.animate(
            [
                { opacity: 0, transform: 'translateY(9px)' },
                { opacity: 1, transform: 'translateY(0)' },
            ],
            { duration: 260, easing },
        );
}
function observeNewRevealElements() {
    if (!revealObserver) return;
    document.querySelectorAll('.reveal-on-scroll:not([data-observed])').forEach((el) => {
        el.dataset.observed = 'true';
        revealObserver.observe(el);
    });
}
function initPointerEffects(root = document) {
    root.querySelectorAll('.surface-card, .fieldnote, .logo-3d-body').forEach((el) =>
        el.classList.add('tilt-surface'),
    );
}
function initScrollEffects() {
    if ('IntersectionObserver' in window) {
        revealObserver = new IntersectionObserver(
            (entries) => {
                for (const entry of entries)
                    if (entry.isIntersecting) {
                        animatePanel(entry.target);
                        revealObserver.unobserve(entry.target);
                    }
            },
            { threshold: 0.06 },
        );
        observeNewRevealElements();
        const marquee = document.querySelector('.kinetic-marquee');
        if (marquee)
            new IntersectionObserver(([entry]) => {
                marquee.toggleAttribute('data-visible', entry.isIntersecting);
            }).observe(marquee);
    }
    const bar = $('#scroll-progress');
    const sections = Array.from(document.querySelectorAll('header .desktop-links a[href^="#"]'))
        .map((link) => ({ link, section: document.getElementById(link.hash.slice(1)) }))
        .filter((s) => s.section);
    let scheduled = false;
    function refresh() {
        scheduled = false;
        const distance = document.documentElement.scrollHeight - innerHeight;
        bar.style.transform = 'scaleX(' + clamp(distance > 0 ? scrollY / distance : 0, 0, 1) + ')';
        let closest = null,
            best = -Infinity;
        for (const pair of sections) {
            if (!pair.section.getClientRects().length) continue;
            const pos = pair.section.getBoundingClientRect().top;
            if (pos <= 155 && pos > best) {
                closest = pair;
                best = pos;
            }
        }
        for (const pair of sections) {
            if (pair === closest) pair.link.setAttribute('aria-current', 'location');
            else pair.link.removeAttribute('aria-current');
        }
    }
    function queue() {
        if (!scheduled) {
            scheduled = true;
            requestAnimationFrame(refresh);
        }
    }
    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', queue, { passive: true });
    queue();
}
function featurePhotos() {
    return [
        {
            ...heroPhotoState,
            category: 'Inside the classroom',
            title: 'The collaborative workshop',
            date: 'Tashkent campus · Hybrid cohort',
        },
        ...lessonCards.filter((c) => !c.is_archived && c.is_visible !== false),
    ];
}
function showFeature(delta = 0) {
    const photos = featurePhotos();
    featuredIndex = (featuredIndex + delta + photos.length) % photos.length;
    const active = photos[featuredIndex],
        img = $('#hero-main-photo');
    img.src = safeUrl(active.imageSrc, true) || imagePlaceholder;
    img.alt = active.title;
    Object.assign(img.style, photoStyle(active));
    $('#feature-index').textContent = String(featuredIndex + 1).padStart(2, '0');
    $('#feature-total').textContent = String(photos.length).padStart(2, '0');
    $('#feature-category').textContent = active.category;
    $('#feature-title').textContent = active.title;
    $('#feature-subtitle').textContent = active.date;
    $('#feature-prev').disabled = $('#feature-next').disabled = photos.length < 2;
    $('#btn-hero-replace-photo').title = featuredIndex
        ? 'Replace this gallery image'
        : 'Replace featured image';
    if (delta && canMove()) img.animate([{ opacity: 0.35 }, { opacity: 1 }], { duration: 240, easing });
}
function drawConstellation() {
    const canvas = $('#particle-field');
    const c = canvas.getContext('2d');
    if (!c) return;
    canvas.width = 216;
    canvas.height = 148;
    // Only this small foreground cluster moves. The full star map is a static background.
    let seed = 77;
    const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const dots = Array.from({ length: 10 }, () => ({ x: random() * canvas.width, y: random() * canvas.height }));
    dots.forEach((p, i) => {
        c.fillStyle = i % 4 ? '#b0a9ff' : '#ffb783';
        c.beginPath();
        c.arc(p.x, p.y, i % 5 ? 0.85 : 1.5, 0, Math.PI * 2);
        c.fill();
        for (const q of dots.slice(i + 1))
            if ((q.x - p.x) ** 2 + (q.y - p.y) ** 2 < 3600) {
                c.strokeStyle = 'rgba(151,144,226,.23)';
                c.beginPath();
                c.moveTo(p.x, p.y);
                c.lineTo(q.x, q.y);
                c.stroke();
            }
    });
}
function initPointerMotion() {
    const aura = $('#ambient-spotlight'),
        stars = $('#particle-field'),
        cursor = $('#cursor-aura'),
        ring = $('#cursor-ring'),
        sweep = $('#page-wipe span');
    let target = null,
        rect = null,
        frame = 0,
        x = 0,
        y = 0,
        paused = false;
    function clear() {
        if (target) {
            target.removeAttribute('data-tilting');
            target.style.removeProperty('transform');
        }
        target = rect = null;
    }
    function hidePointer() {
        if (frame) cancelAnimationFrame(frame);
        frame = 0;
        cursor.removeAttribute('data-visible');
        clear();
    }
    function draw() {
        frame = 0;
        if (paused || !finePointer.matches || !canMove() || document.hidden) {
            hidePointer();
            return;
        }
        cursor.toggleAttribute('data-visible', true);
        ring.style.transform =
            'translate3d(' + (x - 13.5) + 'px,' + (y - 13.5) + 'px,0) scale(' + (target ? 1.18 : 1) + ')';
        aura.style.transform = 'translate3d(' + (x - 180) + 'px,' + (y - 180) + 'px,0)';
        stars.style.transform =
            'translate3d(' + (x / innerWidth - 0.5) * 9 + 'px,' + (y / innerHeight - 0.5) * 7 + 'px,0)';
        if (!target || !rect) return;
        const px = clamp((x - rect.left) / rect.width, 0, 1) - 0.5,
            py = clamp((y - rect.top) / rect.height, 0, 1) - 0.5;
        target.style.transform = target.matches('.btn, .photo-arrows button')
            ? 'translate3d(' + px * 3 + 'px,' + py * 3 + 'px,0)'
            : 'perspective(1000px) rotateX(' + -py * 4 + 'deg) rotateY(' + px * 5 + 'deg)';
    }
    document.addEventListener(
        'pointermove',
        (e) => {
            if (paused || !canMove() || !finePointer.matches || e.pointerType !== 'mouse') return;
            x = e.clientX;
            y = e.clientY;
            const next = e.target.closest('.btn,.photo-arrows button,.tilt-surface');
            if (target !== next) {
                clear();
                target = next;
                rect = next?.getBoundingClientRect();
                next?.toggleAttribute('data-tilting', true);
            }
            if (!frame) frame = requestAnimationFrame(draw);
        },
        { passive: true },
    );
    document.addEventListener('pointerout', (e) => {
        if (!e.relatedTarget) hidePointer();
    });
    window.addEventListener('scroll', clear, { passive: true });
    motionPreference.addEventListener('change', hidePointer);
    finePointer.addEventListener('change', hidePointer);
    window.addEventListener('blur', hidePointer);
    window.pauseLearnityParticles = () => {
        paused = true;
        hidePointer();
    };
    window.resumeLearnityParticles = () => {
        paused = false;
    };
    document.addEventListener('click', (e) => {
        if (canMove() && e.target.closest('header a[href^="#"], #mobile-nav-drawer a[href^="#"]')) {
            sweep.getAnimations().forEach((animation) => animation.cancel());
            sweep.animate(
                [
                    { opacity: 0, transform: 'translate3d(-75%,0,0)' },
                    { opacity: 0.8, offset: 0.4 },
                    { opacity: 0, transform: 'translate3d(75%,0,0)' },
                ],
                { duration: 370, easing },
            );
        }
        const b = e.target.closest('button,.btn');
        if (!b || !canMove() || b.disabled) return;
        b.animate([{ opacity: 0.72 }, { opacity: 1 }], { duration: 190, easing });
    });
}
function initCounters() {
    if (!('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(
        (entries) => {
            for (const entry of entries)
                if (entry.isIntersecting) {
                    const el = entry.target,
                        raw = el.textContent.trim(),
                        match = /^(\d+(?:\.\d+)?)(\+?)$/.exec(raw);
                    observer.unobserve(el);
                    if (!match || !canMove() || quickTextEditEnabled) continue;
                    // Keep the persisted metric stable for the content editor and assistive technology.
                    const overlay = document.createElement('span');
                    overlay.setAttribute('aria-hidden', 'true');
                    overlay.className = 'counter-overlay';
                    el.parentElement.classList.add('counter-holder');
                    el.after(overlay);
                    el.style.opacity = '0';
                    const start = performance.now(),
                        digits = match[1].split('.')[1]?.length || 0;
                    function tick(now) {
                        const t = Math.min(1, (now - start) / 480);
                        overlay.textContent =
                            (Number(match[1]) * (1 - (1 - t) ** 3)).toFixed(digits) + match[2];
                        if (t < 1 && canMove() && !document.hidden) requestAnimationFrame(tick);
                        else {
                            overlay.remove();
                            el.style.opacity = '';
                        }
                    }
                    requestAnimationFrame(tick);
                }
        },
        { threshold: 0.7 },
    );
    document
        .querySelectorAll('#about-learnity .grid-cols-2 .font-display')
        .forEach((el) => observer.observe(el));
}
function initDialogs() {
    const panels = ['mobile-nav-drawer', 'applications-drawer', 'ecosystem-modal'].map((id) =>
        document.getElementById(id),
    );
    const returns = new Map();
    const visible = () => panels.filter((p) => !p.classList.contains('hidden'));
    const candidates = (panel) =>
        [
            ...panel.querySelectorAll(
                'a[href],button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),[tabindex="0"]',
            ),
        ].filter((el) => el.tabIndex >= 0 && el.getClientRects().length);
    function update() {
        const open = visible(),
            top = open.at(-1);
        for (const child of document.body.children) {
            if (child.tagName === 'SCRIPT' || child.id === 'toast-stack') continue;
            child.inert = Boolean(top && child !== top);
        }
        document.body.classList.toggle('dialog-open', Boolean(top));
        $('#nav-btn-mobile-menu').setAttribute('aria-expanded', String(open.includes(panels[0])));
        for (const panel of panels) {
            if (!open.includes(panel) && returns.has(panel)) {
                const el = returns.get(panel);
                returns.delete(panel);
                if (el?.isConnected && !el.closest('[inert]')) el.focus({ preventScroll: true });
            }
        }
        if (top && !returns.has(top)) {
            returns.set(top, document.activeElement);
            const first = top.querySelector('input:not([type="hidden"]):not([type="checkbox"])');
            (first?.getClientRects().length ? first : candidates(top)[0] || top).focus({
                preventScroll: true,
            });
            animatePanel(top.querySelector('.drawer-panel, #ecosystem-modal-body') || top);
        }
    }
    const observer = new MutationObserver(update);
    panels.forEach((p) => observer.observe(p, { attributes: true, attributeFilter: ['class'] }));
    document.addEventListener('keydown', (e) => {
        const panel = visible().at(-1);
        if (!panel) return;
        if (e.key === 'Escape') {
            e.preventDefault();
            if (panel === panels[2]) closeEcosystemModal();
            else if (panel === panels[1]) toggleApplicationsDrawer(false);
            else toggleMobileNav(false);
            return;
        }
        if (e.key !== 'Tab') return;
        const els = candidates(panel),
            first = els[0],
            last = els.at(-1);
        if (!first) {
            e.preventDefault();
            panel.focus();
            return;
        }
        if (e.shiftKey && (document.activeElement === first || !panel.contains(document.activeElement))) {
            e.preventDefault();
            last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
        }
    });
}
function initExperience() {
    bindPageControls();
    prepareFields();
    initDialogs();
    initScrollEffects();
    initPointerEffects();
    drawConstellation();
    initPointerMotion();
    initCounters();
    $('#feature-prev').addEventListener('click', () => showFeature(-1));
    $('#feature-next').addEventListener('click', () => showFeature(1));
    $('#feature-title').setAttribute('aria-live', 'polite');
    $('#feature-title').setAttribute('aria-atomic', 'true');
    const tablist = document.querySelector('[role=tablist]');
    tablist.addEventListener('keydown', (e) => {
        if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(e.key)) return;
        e.preventDefault();
        const invite = e.key === 'End' || (e.key !== 'Home' && e.target.id === 'tab-reg-apply');
        setRegistrationTab(invite ? 'invite' : 'apply');
        $(invite ? '#tab-reg-invite' : '#tab-reg-apply').focus();
    });
    document.querySelectorAll('[data-demo-only]').forEach((el) => {
        el.hidden = !isDemo;
    });
    refreshIcons();
}
