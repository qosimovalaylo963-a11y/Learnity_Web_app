let quickTextEditEnabled = false;
let adminAuthenticated = false;
let currentUser = null;
let csrfToken = '';
let activeDragPan = null;
let savedPageTexts = {};
let saveContentTimer = null;
let activeEcosystemView = 'public'; // 'public' | 'subject' | 'owner' | 'staff' | 'member'
let activeOwnerTab = 'overview';
let activeSubjectSlug = 'biology';
let requestedSubject = '';
let activeSubjectHubData = null;
let activeSubjectResourceFilter = 'all';

const heroPhotoState = {
    posX: 50,
    posY: 40,
    scale: 1.02,
    imageSrc: 'assets/photos/1522202176988-66273c2fd55f.webp',
};

// Original 6 classroom photographs preserved verbatim
let lessonCards = [
    {
        id: 'lesson-1',
        mediaId: 2,
        category: 'STEM & Robotics Lab',
        date: 'Week 04 · Hardware Sprint',
        title: 'Autonomous Sensor & Circuit Prototyping',
        description:
            'Students testing microcontroller logic and sensor calibration in small collaborative pairs.',
        imageSrc: 'assets/photos/1581092160607-ee22621dd758.webp',
        posX: 50,
        posY: 50,
        scale: 1,
    },
    {
        id: 'lesson-2',
        mediaId: 3,
        category: 'Design & Architecture',
        date: 'Week 02 · Studio Critique',
        title: 'Interactive UI Systems & Product Framing',
        description:
            'Live whiteboard critique where teams break down real-world interface workflows and typography.',
        imageSrc: 'assets/photos/1531482615713-2afd69097998.webp',
        posX: 50,
        posY: 45,
        scale: 1,
    },
    {
        id: 'lesson-3',
        mediaId: 4,
        category: 'Peer Mentorship',
        date: 'Week 05 · Code Review',
        title: '1-on-1 Algorithm & Debugging Clinics',
        description:
            'Senior mentors sitting side-by-side with students to refactor code and explain data structures.',
        imageSrc: 'assets/photos/1515187029135-18ee286d815b.webp',
        posX: 50,
        posY: 50,
        scale: 1,
    },
    {
        id: 'lesson-4',
        mediaId: 5,
        category: 'Academic Seminar',
        date: 'Week 06 · Group Debate',
        title: 'Structured Research & Analytical Debate',
        description:
            'Roundtable discussion developing critical argumentation, public speaking, and synthesis skills.',
        imageSrc: 'assets/photos/1524178232363-1fb2b075b655.webp',
        posX: 50,
        posY: 40,
        scale: 1,
    },
    {
        id: 'lesson-5',
        mediaId: 6,
        category: 'Team Hackathon',
        date: 'Week 07 · Build Night',
        title: 'Cross-Disciplinary Capstone Sprint',
        description:
            'Developers, designers, and researchers combining forces to ship a working prototype in 48 hours.',
        imageSrc: 'assets/photos/1522071820081-009f0129c71c.webp',
        posX: 50,
        posY: 50,
        scale: 1,
    },
    {
        id: 'lesson-6',
        mediaId: 7,
        category: 'Demo Day',
        date: 'Week 08 · Final Showcase',
        title: 'Cohort Capstone Presentations & Feedback',
        description:
            'Graduating teams presenting their completed teaching modules and technical builds to guest reviewers.',
        imageSrc: 'assets/photos/1540575467063-178a50c2df87.webp',
        posX: 50,
        posY: 50,
        scale: 1,
    },
];

// --- Utilities and Hybrid API Client ---
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function requireAdmin(message = 'Owner authentication required for this action.') {
    if (currentUser && currentUser.role === 'OWNER') return true;
    notifyToast(message);
    toggleApplicationsDrawer(true);
    return false;
}

function copyTextToClipboard(text, successMsg = 'Copied to clipboard!') {
    const val = String(text || '');
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard
            .writeText(val)
            .then(() => notifyToast(successMsg))
            .catch(() => fallbackCopy(val, successMsg));
    } else {
        fallbackCopy(val, successMsg);
    }
}

function fallbackCopy(text, successMsg) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
        if (!document.execCommand('copy')) throw new Error();
        notifyToast(successMsg);
    } catch {
        notifyToast('Select the code or link and copy it manually.');
    }
    ta.remove();
}

function bindStaticTextKeys() {
    let index = 0;
    $$('.editable-text').forEach((el) => {
        if (el.closest('#lesson-cards-grid')) return;
        if (!el.dataset.contentKey) el.dataset.contentKey = `static-${index++}`;
    });
}

function collectPageTexts() {
    const result = {};
    $$('.editable-text[data-content-key]').forEach((el) => {
        if (!el.closest('#lesson-cards-grid')) result[el.dataset.contentKey] = serializeEditable(el);
    });
    return result;
}

function applySavedPageTexts() {
    $$('.editable-text[data-content-key]').forEach((el) => {
        if (
            !el.closest('#lesson-cards-grid') &&
            Object.prototype.hasOwnProperty.call(savedPageTexts, el.dataset.contentKey)
        ) {
            el.replaceChildren(readEditable(savedPageTexts[el.dataset.contentKey]));
        }
    });
}

async function loadSiteContent() {
    try {
        const data = await apiRequest('/api/site-content');
        if (data && data.content) {
            const content = data.content;
            if (plainRecord(content.heroPhotoState))
                Object.assign(heroPhotoState, safePhotoState(content.heroPhotoState));
            if (Array.isArray(content.lessonCards)) lessonCards = safeCards(content.lessonCards);
            if (plainRecord(content.pageTexts))
                savedPageTexts = Object.fromEntries(
                    Object.entries(content.pageTexts).filter(
                        ([k, v]) => /^static-\d+$/.test(k) && typeof v === 'string' && v.length <= 8000,
                    ),
                );
            setCustomLogo(content.logoUrl);
        }
    } catch (error) {
        console.warn('Could not load saved site content:', error.message);
    }
    const heroImg = $('#hero-main-photo');
    if (heroImg) {
        if (heroPhotoState.imageSrc) heroImg.src = heroPhotoState.imageSrc;
        heroImg.style.objectPosition = `${heroPhotoState.posX}% ${heroPhotoState.posY}%`;
        heroImg.style.transform = `scale(${heroPhotoState.scale || 1.02})`;
    }
    applySavedPageTexts();
}

const removedCardKeys = new Set();
let pendingSave = Promise.resolve(true);
let editRevision = 0;
let dirtyContent = false;
let customLogoUrl = '';
function saveSiteContent() {
    clearTimeout(saveContentTimer);
    if (!adminAuthenticated || !dirtyContent) return pendingSave;
    const revision = editRevision;
    const deleted = [...removedCardKeys];
    const pageTexts = collectPageTexts();
    const body = JSON.stringify({
        heroPhotoState,
        lessonCards,
        pageTexts,
        logoUrl: customLogoUrl,
        removedCardKeys: deleted,
    });
    pendingSave = pendingSave.then(async () => {
        try {
            await apiRequest('/api/admin/site-content', { method: 'PUT', body });
            deleted.forEach((key) => removedCardKeys.delete(key));
            if (revision === editRevision) {
                dirtyContent = false;
                savedPageTexts = pageTexts;
                setSaveIndicator('saved');
            }
            return true;
        } catch (error) {
            setSaveIndicator('error');
            notifyToast('Changes could not be saved. ' + error.message, 'error');
            return false;
        }
    });
    return pendingSave;
}
function queueContentSave() {
    if (!adminAuthenticated) return;
    dirtyContent = true;
    editRevision++;
    setSaveIndicator('saving');
    clearTimeout(saveContentTimer);
    saveContentTimer = setTimeout(saveSiteContent, 350);
}
window.addEventListener('beforeunload', (event) => {
    if (dirtyContent) {
        event.preventDefault();
        event.returnValue = '';
    }
});

function setSaveIndicator(state) {
    const button = $('#btn-toggle-edit');
    if (!button) return;
    button.dataset.saveState = state;
    const label = $('#edit-toggle-label');
    if (label && quickTextEditEnabled) {
        label.textContent =
            state === 'saving'
                ? 'Saving…'
                : state === 'error'
                  ? 'Save error'
                  : state === 'saved'
                    ? 'Saved'
                    : 'Matnlarni Tahrirlash: Yoqilgan';
    }
}

const imageMimeTypes = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif']);
async function uploadImage(file, extraFields = {}) {
    if (!requireAdmin()) throw new Error('Owner access required.');
    if (!file || !imageMimeTypes.has(file.type) || !file.size || file.size > 8 * 1024 * 1024)
        throw new Error('Choose a PNG, JPEG, WebP or GIF image up to 8 MB.');
    if (isPreview) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const valid = safeUrl(reader.result, true);
                valid ? resolve(valid) : reject(new Error('Invalid image.'));
            };
            reader.onerror = () => reject(new Error('Could not read this image.'));
            reader.readAsDataURL(file);
        });
    }
    const form = new FormData();
    form.append('image', file);
    for (const [key, value] of Object.entries(extraFields)) form.append(key, String(value));
    const result = await apiRequest('/api/admin/uploads', { method: 'POST', body: form });
    const url = safeUrl(result.url, true);
    if (!url) throw new Error('The upload did not return a usable image.');
    return url;
}

// --- Gallery Rendering (Preserving all 6 original cards + pan/zoom/replace) ---
function renderLessonGallery() {
    const grid = $('#lesson-cards-grid');
    if (!grid) return;
    renderInto(grid, '');

    const isOwner = Boolean(currentUser && currentUser.role === 'OWNER');
    lessonCards.forEach((card, idx) => {
        if (card.is_archived || card.is_visible === false) return;
        const id = String(card.id);
        const safeId = id;
        const editable = isOwner && quickTextEditEnabled ? 'true' : 'false';
        const article = document.createElement('article');
        article.className =
            'surface-card rounded-2xl overflow-hidden flex flex-col justify-between group reveal-on-scroll';
        article.dataset.tiltCard = 'true';
        renderInto(
            article,
            view`
            <div>
                <div class="relative h-56 sm:h-60 bg-slate-950 overflow-hidden pan-photo-area" onpointerdown=${isOwner ? (event) => startPhotoPan(event, id) : null}>
                    <img id="img-${safeId}" src="${card.imageSrc}"
                         alt="${card.title}" draggable="false"
                         class="w-full h-full object-cover transition-transform duration-75"
                         style=${photoStyle(card)} />
                    <div class="absolute inset-0 bg-gradient-to-t from-[#0c0e14] via-transparent to-black/30 pointer-events-none"></div>
                    <div class="absolute top-3 inset-x-3 flex items-center justify-between gap-2 pointer-events-none">
                        <span class="px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md border border-white/10 text-[11px] font-medium text-slate-200">${card.category}</span>
                        ${isOwner ? view`<span class="px-2 py-0.5 rounded bg-black/60 backdrop-blur-md text-[10px] font-mono text-slate-300 opacity-0 group-hover:opacity-100 transition">Drag to frame</span>` : ''}
                    </div>
                    ${
                        isOwner
                            ? view`
                    <div class="absolute bottom-2.5 inset-x-2.5 bg-[#080a10]/90 backdrop-blur-md border border-white/15 rounded-xl p-2 flex items-center justify-between gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200" onpointerdown=${(event) => event.stopPropagation()}>
                        <div class="flex items-center gap-1.5 flex-1 pl-1">
                            <i data-lucide="zoom-in" class="w-3.5 h-3.5 text-slate-400 shrink-0"></i>
                            <input type="range" min="1" max="1.85" step="0.05" value="${Number(card.scale ?? 1)}" oninput=${(event) => zoomCardPhoto(safeId, event.currentTarget.value)} class="w-20 accent-indigo-500 h-1 bg-slate-700 rounded cursor-pointer" title="Zoom photo" />
                        </div>
                        <div class="flex items-center gap-1">
                            <button onclick=${() => resetCardPhoto(safeId)} class="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300" title="Markazga qaytarish"><i data-lucide="rotate-ccw" class="w-3.5 h-3.5"></i></button>
                            <button onclick=${() => document.getElementById(`file-${safeId}`).click()} class="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-medium flex items-center gap-1 transition"><i data-lucide="image-up" class="w-3 h-3"></i><span>Almashtirish</span></button>
                        </div>
                    </div>
                    <input id="file-${safeId}" type="file" accept="image/png,image/jpeg,image/webp,image/gif" class="hidden" onchange=${(event) => replaceCardPhoto(event, safeId)} />
                    `
                            : ''
                    }
                </div>
                <div class="p-5 space-y-2">
                    <div class="flex items-center justify-between text-[11px] font-mono text-slate-400">
                        <span class="editable-text" data-content-key="gallery-${safeId}-date" contenteditable="${editable}" onblur=${(event) => updateLessonField(safeId, 'date', event.currentTarget.innerText)}>${card.date}</span>
                        ${
                            isOwner
                                ? view`
                        <div class="flex items-center gap-1">
                            <button onclick=${() => moveLessonCard(idx, -1)} disabled=${Boolean(idx === 0)} class="${idx === 0 ? 'opacity-25 cursor-not-allowed' : 'hover:text-white'}" title="Move left"><i data-lucide="arrow-left" class="w-3.5 h-3.5"></i></button>
                            <button onclick=${() => moveLessonCard(idx, 1)} disabled=${Boolean(idx === lessonCards.length - 1)} class="${idx === lessonCards.length - 1 ? 'opacity-25 cursor-not-allowed' : 'hover:text-white'}" title="Move right"><i data-lucide="arrow-right" class="w-3.5 h-3.5"></i></button>
                        </div>
                        `
                                : ''
                        }
                    </div>
                    <h3 contenteditable="${editable}" data-content-key="gallery-${safeId}-title" onblur=${(event) => updateLessonField(safeId, 'title', event.currentTarget.innerText)} class="editable-text font-display text-lg font-bold text-white tracking-tight leading-snug">${card.title}</h3>
                    <p contenteditable="${editable}" data-content-key="gallery-${safeId}-description" onblur=${(event) => updateLessonField(safeId, 'description', event.currentTarget.innerText)} class="editable-text text-xs sm:text-sm text-slate-400 leading-relaxed">${card.description}</p>
                </div>
            </div>
            <div class="px-5 pb-4 pt-2 border-t border-white/[0.05] flex items-center justify-between text-xs">
                <span class="text-slate-500">Learnity Live Workshop</span>
                ${isOwner ? view`<button onclick=${() => document.getElementById(`file-${safeId}`).click()} class="text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"><span>Rasmni yangilash</span><i data-lucide="arrow-up-right" class="w-3.5 h-3.5"></i></button>` : view`<span class="text-slate-400 font-mono text-[11px]">Cohort Session</span>`}
            </div>`,
        );
        grid.appendChild(article);
    });
    refreshIcons();
    observeNewRevealElements();
    initPointerEffects(grid);
    for (const frame of document.querySelectorAll('.pan-photo-area')) {
        if (isOwner) {
            frame.tabIndex = 0;
            frame.setAttribute('aria-label', 'Frame photo. Use arrow keys to adjust the crop.');
        } else {
            frame.removeAttribute('tabindex');
            frame.removeAttribute('aria-label');
        }
    }
    showFeature();
}

let photoPanRaf = 0;
function startPhotoPan(e, targetId) {
    if (!currentUser || currentUser.role !== 'OWNER') return;
    if (e.target.closest('button, input, label')) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    e.preventDefault();
    const targetObj =
        targetId === 'hero'
            ? featuredIndex
                ? lessonCards.find((c) => c.id === featurePhotos()[featuredIndex]?.id)
                : heroPhotoState
            : lessonCards.find((c) => c.id === targetId);
    if (!targetObj) return;
    const frame = e.currentTarget;
    const img =
        targetId === 'hero'
            ? document.getElementById('hero-main-photo')
            : document.getElementById(`img-${targetId}`);
    if (!img || !img.complete || !img.naturalWidth || activeDragPan) return;
    const width = frame.clientWidth,
        height = frame.clientHeight;
    const cover = Math.max(width / img.naturalWidth, height / img.naturalHeight);
    const imageWidth = img.naturalWidth * cover,
        imageHeight = img.naturalHeight * cover;
    activeDragPan = {
        targetId,
        targetObj,
        img,
        frame,
        width,
        height,
        imageWidth,
        imageHeight,
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        latestX: e.clientX,
        latestY: e.clientY,
        initX: targetObj.posX,
        initY: targetObj.posY,
        moved: false,
    };
    img.classList.add('pan-layer');
    img.style.width = imageWidth + 'px';
    img.style.height = imageHeight + 'px';
    paintPhotoPan();
    frame.classList.add('is-photo-dragging');
    document.body.classList.add('is-photo-dragging');
    try {
        frame.setPointerCapture(e.pointerId);
    } catch (_) {}
    window.pauseLearnityParticles?.();
    window.addEventListener('pointermove', onPhotoPanMove, { passive: true });
    window.addEventListener('pointerup', onPhotoPanEnd);
    window.addEventListener('pointercancel', onPhotoPanEnd);
}

function onPhotoPanMove(e) {
    const drag = activeDragPan;
    if (!drag || e.pointerId !== drag.pointerId) return;
    drag.latestX = e.clientX;
    drag.latestY = e.clientY;
    if (Math.abs(drag.latestX - drag.startX) + Math.abs(drag.latestY - drag.startY) > 2) drag.moved = true;
    if (!photoPanRaf) photoPanRaf = requestAnimationFrame(paintPhotoPan);
}

function paintPhotoPan() {
    photoPanRaf = 0;
    const drag = activeDragPan;
    if (!drag) return;
    const sensitivity = 0.42;
    const nextX = Math.max(0, Math.min(100, drag.initX - (drag.latestX - drag.startX) * sensitivity));
    const nextY = Math.max(0, Math.min(100, drag.initY - (drag.latestY - drag.startY) * sensitivity));
    drag.targetObj.posX = nextX;
    drag.targetObj.posY = nextY;
    const zoom = drag.targetObj.scale;
    const x = ((1 - zoom) * drag.width) / 2 + (zoom * (drag.width - drag.imageWidth) * nextX) / 100;
    const y = ((1 - zoom) * drag.height) / 2 + (zoom * (drag.height - drag.imageHeight) * nextY) / 100;
    drag.img.style.transform = `translate3d(${x}px,${y}px,0) scale(${zoom})`;
}

function onPhotoPanEnd(e) {
    const drag = activeDragPan;
    if (!drag || (e?.pointerId != null && e.pointerId !== drag.pointerId)) return;
    if (photoPanRaf) {
        cancelAnimationFrame(photoPanRaf);
        photoPanRaf = 0;
        paintPhotoPan();
    }
    activeDragPan = null;
    drag.img.classList.remove('pan-layer');
    drag.img.style.removeProperty('width');
    drag.img.style.removeProperty('height');
    Object.assign(drag.img.style, photoStyle(drag.targetObj));
    drag.frame.classList.remove('is-photo-dragging');
    document.body.classList.remove('is-photo-dragging');
    try {
        if (drag.frame.hasPointerCapture?.(drag.pointerId)) drag.frame.releasePointerCapture(drag.pointerId);
    } catch (_) {}
    window.removeEventListener('pointermove', onPhotoPanMove);
    window.removeEventListener('pointerup', onPhotoPanEnd);
    window.removeEventListener('pointercancel', onPhotoPanEnd);
    window.resumeLearnityParticles?.();
    if (drag.moved) {
        queueContentSave();
        showFeature();
    }
}

function zoomCardPhoto(cardId, val) {
    if (!requireAdmin('Galereyani o‘zgartirish uchun Owner sifatida kiring.')) return;
    const card = lessonCards.find((c) => c.id === cardId);
    if (!card) return;
    card.scale = Math.max(1, Math.min(1.85, Number(val)));
    const img = $(`#img-${CSS.escape(cardId)}`);
    if (img) img.style.transform = `scale(${card.scale})`;
    queueContentSave();
}

function resetCardPhoto(cardId) {
    if (!requireAdmin()) return;
    const card = lessonCards.find((c) => c.id === cardId);
    if (!card) return;
    card.posX = 50;
    card.posY = 50;
    card.scale = 1;
    renderLessonGallery();
    queueContentSave();
    notifyToast('Rasm markazga qaytarildi.');
}

async function replaceHeroPhoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
        if (featuredIndex) {
            await replaceCardPhoto(e, featurePhotos()[featuredIndex].id);
            showFeature();
            return;
        }
        const url = await uploadImage(file);
        const img = $('#hero-main-photo');
        img.src = url;
        heroPhotoState.imageSrc = url;
        heroPhotoState.posX = 50;
        heroPhotoState.posY = 50;
        heroPhotoState.scale = 1.02;
        img.style.objectPosition = '50% 50%';
        img.style.transform = 'scale(1.02)';
        queueContentSave();
        notifyToast('Asosiy dars rasmi serverga yuklandi.');
    } catch (error) {
        notifyToast(error.message, 'error');
    }
    e.target.value = '';
}

async function replaceCardPhoto(e, cardId) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
        const url = await uploadImage(file);
        const card = lessonCards.find((c) => c.id === cardId);
        if (card) {
            card.imageSrc = url;
            card.posX = 50;
            card.posY = 50;
            card.scale = 1;
            renderLessonGallery();
            queueContentSave();
            notifyToast(`"${card.title}" rasmi serverga yuklandi.`);
        }
    } catch (error) {
        notifyToast(error.message, 'error');
    }
    e.target.value = '';
}

function addNewLessonPhotoCard() {
    if (!requireAdmin()) return;
    const newCard = {
        id: 'lesson-' + Date.now(),
        category: 'New Workshop',
        date: 'Week 09 · Special Session',
        title: 'Interactive Classroom Session',
        description: "O'zingizning dars jarayoningizdan rasm yuklang va ushbu matnni tahrirlang.",
        imageSrc: 'assets/photos/1517245386807-bb43f82c33c4.webp',
        posX: 50,
        posY: 50,
        scale: 1,
    };
    lessonCards.unshift(newCard);
    renderLessonGallery();
    queueContentSave();
    notifyToast('Yangi dars kartasi qo‘shildi.');
}

function moveLessonCard(index, dir) {
    if (!requireAdmin()) return;
    const target = index + dir;
    if (target < 0 || target >= lessonCards.length) return;
    [lessonCards[index], lessonCards[target]] = [lessonCards[target], lessonCards[index]];
    renderLessonGallery();
    queueContentSave();
}

function updateLessonField(cardId, field, value) {
    if (!adminAuthenticated) return;
    const card = lessonCards.find((c) => c.id === cardId);
    if (card && ['date', 'title', 'description', 'category'].includes(field)) {
        card[field] = String(value)
            .trim()
            .slice(0, field === 'description' ? 4000 : 160);
        queueContentSave();
    }
}

function setCustomLogo(value) {
    customLogoUrl = safeUrl(value, true);
    $$('.lively-svg-mark').forEach((el) => el.classList.toggle('hidden', Boolean(customLogoUrl)));
    $$('.custom-logo-img').forEach((img) => {
        if (customLogoUrl) img.src = customLogoUrl;
        else img.removeAttribute('src');
        img.classList.toggle('hidden', !customLogoUrl);
    });
}
async function handleCustomLogoUpload(event) {
    const input = event.currentTarget,
        file = input.files[0];
    if (!file) return;
    try {
        setCustomLogo(await uploadImage(file));
        queueContentSave();
        notifyToast('Learnity logo updated.');
    } catch (error) {
        notifyToast(error.message, 'error');
    } finally {
        input.value = '';
    }
}

function toggleQuickTextEdit() {
    if (!adminAuthenticated) {
        toggleApplicationsDrawer(true);
        notifyToast('Matn tahrirlash uchun Owner paroli kerak.');
        return;
    }
    quickTextEditEnabled = !quickTextEditEnabled;
    document.body.classList.toggle('edit-enabled', quickTextEditEnabled);
    $$('.editable-text').forEach((el) =>
        el.setAttribute('contenteditable', quickTextEditEnabled ? 'true' : 'false'),
    );
    const label = $('#edit-toggle-label');
    if (label)
        label.textContent = quickTextEditEnabled
            ? 'Matnlarni Tahrirlash: Yoqilgan'
            : 'Matnlarni Tahrirlash: O‘chiq';
    renderLessonGallery();
    if (!quickTextEditEnabled) queueContentSave();
    notifyToast(quickTextEditEnabled ? 'Tahrirlash yoqildi. Matn ustiga bosing.' : 'Matn tahriri saqlandi.');
}

document.addEventListener('focusout', (event) => {
    const el = event.target;
    if (
        el instanceof HTMLElement &&
        el.classList.contains('editable-text') &&
        adminAuthenticated &&
        quickTextEditEnabled
    ) {
        if (el.dataset.contentKey && !el.closest('#lesson-cards-grid')) {
            savedPageTexts[el.dataset.contentKey] = serializeEditable(el);
            queueContentSave();
        }
    }
});

// =========================================================
// TWO-WAY REGISTRATION, AUTHENTICATION & VIEW ROUTING
// =========================================================
function setRegistrationTab(tab) {
    const applyForm = $('#cohort-apply-form');
    const inviteForm = $('#invite-register-form');
    const tabApply = $('#tab-reg-apply');
    const tabInvite = $('#tab-reg-invite');
    if (!applyForm || !inviteForm) return;
    const invited = tab === 'invite';
    tabApply.setAttribute('aria-selected', String(!invited));
    tabInvite.setAttribute('aria-selected', String(invited));
    tabApply.tabIndex = invited ? -1 : 0;
    tabInvite.tabIndex = invited ? 0 : -1;
    animatePanel(invited ? inviteForm : applyForm);
    if (tab === 'invite') {
        applyForm.classList.add('hidden');
        inviteForm.classList.remove('hidden');
        tabInvite.className =
            'py-2 px-3 rounded-lg text-xs font-semibold transition bg-indigo-600 text-white shadow flex items-center justify-center gap-1.5';
        tabApply.className =
            'py-2 px-3 rounded-lg text-xs font-semibold transition text-slate-400 hover:text-white flex items-center justify-center gap-1.5';
    } else {
        inviteForm.classList.add('hidden');
        applyForm.classList.remove('hidden');
        tabApply.className =
            'py-2 px-3 rounded-lg text-xs font-semibold transition bg-indigo-600 text-white shadow flex items-center justify-center gap-1.5';
        tabInvite.className =
            'py-2 px-3 rounded-lg text-xs font-semibold transition text-slate-400 hover:text-white flex items-center justify-center gap-1.5';
    }
}

function updateRoleApplicationHint() {
    const roleEl = $('input[name="requested_role"]:checked');
    const role = roleEl ? roleEl.value : 'MEMBER';
    const mot = $('#input-motivation');
    if (mot) {
        mot.placeholder =
            role === 'STAFF'
                ? 'Describe your teaching experience, subject mastery, and workshop ideas...'
                : 'What would you like to build, learn, or research in Learnity?';
    }
}

function fillDemoInviteCode() {
    const input = $('#invite-reg-code');
    if (input) {
        input.value = 'LRN-STEM-2026-JOIN';
        verifyEnteredInviteCode();
    }
}

async function verifyEnteredInviteCode() {
    const codeInput = $('#invite-reg-code');
    const preview = $('#invite-verified-preview');
    if (!codeInput || !preview) return;
    const rawCode = codeInput.value.trim();
    if (!validCode(rawCode)) {
        notifyToast('Enter a valid invitation code of 6–64 characters.');
        return;
    }
    try {
        const res = await apiRequest('/api/invitations/verify', {
            method: 'POST',
            body: JSON.stringify({ code: rawCode }),
        });
        if (codeInput.value.trim() !== rawCode) return;
        const inv = res.invitation;
        const subjBadges = (inv.permissions || []).map(
            (p) =>
                view`<span class="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 font-medium">${p.subject_name}</span>`,
        );
        preview.className =
            'rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3.5 space-y-2 text-xs';
        renderInto(
            preview,
            view`
            <div class="flex items-center justify-between">
                <span class="font-semibold text-emerald-300 flex items-center gap-1.5">✓ Valid ${inv.targetRole} Invitation</span>
                <span class="font-mono text-[11px] text-slate-300">${inv.remainingUses} / ${inv.maxUses} uses left</span>
            </div>
            <div class="text-slate-300">Issued by: <strong>${inv.issuerName}</strong> · Expires: ${new Date(inv.expiresAt).toLocaleDateString()}</div>
            <div class="space-y-1">
                <div class="text-[11px] text-slate-400">Assigned Subject Hubs:</div>
                <div class="flex flex-wrap gap-1.5">${subjBadges}</div>
            </div>
        `,
        );
        preview.classList.remove('hidden');
        notifyToast('Invitation code verified!');
    } catch (err) {
        if (codeInput.value.trim() !== rawCode) return;
        preview.className = 'rounded-xl bg-rose-500/10 border border-rose-500/30 p-3.5 text-xs text-rose-200';
        preview.textContent = err.message;
        preview.classList.remove('hidden');
    }
}

async function submitInvitationRegistration(e) {
    e.preventDefault();
    const code = $('#invite-reg-code').value.trim();
    const full_name = $('#invite-reg-name').value.trim();
    const email = $('#invite-reg-email').value.trim();
    const password = $('#invite-reg-password').value;
    const fb = $('#invite-reg-feedback');
    try {
        const res = await apiRequest('/api/auth/register-invite', {
            method: 'POST',
            body: JSON.stringify({ invitation_code: code, full_name, email, password }),
        });
        currentUser = res.user;
        csrfToken = res.csrfToken || '';
        adminAuthenticated = currentUser.role === 'OWNER';
        updateSessionUI();
        await renderPublicSubjectsGrid();
        notifyToast(`Welcome to Learnity, ${currentUser.full_name}! Your subject access is unlocked.`);
        openActiveRoleWorkspace();
    } catch (err) {
        if (fb) {
            fb.className = 'rounded-xl bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-200';
            fb.textContent = err.message;
            fb.classList.remove('hidden');
        }
        notifyToast(err.message, 'error');
    }
}

async function submitCohortApplication(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const submitButton = form.querySelector('button[type="submit"]');
    const fullName = $('#input-fullname').value.trim();
    const email = ($('#input-email')?.value || '').trim();
    const phone = $('#input-phone').value.trim();
    const track = $('#input-track').value || 'STEM & Algorithm Lab';
    const roleEl = $('input[name="requested_role"]:checked');
    const scheduleEl = $('input[name="schedule"]:checked');
    const checkedSubjs = $$('input[name="apply_subject"]:checked').map((el) => el.value);
    const background = ($('#input-background')?.value || '').trim();
    const motivation = ($('#input-motivation')?.value || '').trim();

    const entry = {
        name: fullName,
        full_name: fullName,
        email,
        phone,
        phone_or_telegram: phone,
        requested_role: roleEl ? roleEl.value : 'MEMBER',
        interested_subjects: checkedSubjs.length ? checkedSubjs : [track],
        track,
        schedule: scheduleEl ? scheduleEl.value : 'Weekday Intensive',
        schedule_preference: scheduleEl ? scheduleEl.value : 'Weekday Intensive',
        educational_background: background,
        motivation_statement: motivation,
    };

    submitButton.disabled = true;
    submitButton.classList.add('opacity-60');
    const banner = $('#application-feedback-banner');
    try {
        const res = await apiRequest('/api/applications', { method: 'POST', body: JSON.stringify(entry) });
        form.reset();
        await refreshPublicStats();
        if (banner) {
            const appUid = res.application?.application_uid || 'LRN-APP';
            const emailMsg = res.emailDelivery?.sent
                ? 'Owner notification email delivered.'
                : res.emailDelivery?.detail || 'Recorded in Owner Dashboard.';
            banner.className =
                'rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-200 space-y-1';
            renderInto(
                banner,
                view`
                <div class="font-semibold">✓ Application Submitted (ID: <span class="font-mono">${appUid}</span>)</div>
                <div class="text-[11px] text-slate-300">Status: <strong>Pending Review</strong> · ${emailMsg}</div>
            `,
            );
            banner.classList.remove('hidden');
        }
        notifyToast(`Rahmat, ${entry.name}! Application ${res.application?.application_uid || ''} received.`);
    } catch (error) {
        if (banner) {
            banner.className =
                'rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-200';
            banner.textContent = error.message;
            banner.classList.remove('hidden');
        }
        notifyToast(`Ariza yuborilmadi: ${error.message}`);
    } finally {
        submitButton.disabled = false;
        submitButton.classList.remove('opacity-60');
    }
}

async function refreshPublicStats() {
    try {
        const data = await apiRequest('/api/public/stats');
        const badge = $('#nav-app-count');
        if (badge) badge.textContent = String(data.applicationsCount ?? 0);
    } catch (error) {
        console.warn('Stats unavailable:', error.message);
    }
}

function autofillDemoLogin(email, pass) {
    const em = $('#admin-email');
    const pw = $('#admin-password');
    if (em) em.value = email;
    if (pw) pw.value = pass;
    const modalEm = $('#modal-login-email');
    const modalPw = $('#modal-login-password');
    if (modalEm) modalEm.value = email;
    if (modalPw) modalPw.value = pass;
}

function updateSessionUI() {
    const wsBtn = $('#nav-btn-workspace');
    const wsLabel = $('#nav-workspace-label');
    const loginLabel = $('#nav-login-label');
    const accountButton = $('#nav-btn-login');
    const staffManageBtn = $('#btn-owner-manage-staff');
    const accessIndicator = $('#subject-access-indicator');
    const ownerBar = $('#owner-utility-bar');
    const isOwner = Boolean(currentUser && currentUser.role === 'OWNER');

    adminAuthenticated = isOwner;
    document.body.classList.toggle('owner-mode', isOwner);
    document.body.classList.toggle('signed-in', Boolean(currentUser));
    if (accountButton) {
        const name = currentUser?.full_name || '';
        accountButton.dataset.initial = Array.from(name.trim())[0]?.toUpperCase() || '';
        accountButton.title = currentUser ? `Open workspace for ${name}` : 'Sign in';
        accountButton.setAttribute('aria-label', accountButton.title);
    }
    if (ownerBar) {
        ownerBar.classList.toggle('hidden', !isOwner);
    }
    $$('.owner-only-control').forEach((el) => {
        el.classList.toggle('hidden', !isOwner);
        if (isOwner && (el.tagName === 'BUTTON' || el.id === 'owner-add-photo-wrap')) {
            el.classList.add('flex');
        } else {
            el.classList.remove('flex');
        }
    });

    if (currentUser) {
        if (wsBtn && wsLabel) {
            wsBtn.classList.remove('hidden');
            wsBtn.classList.add('inline-flex');
            wsLabel.textContent =
                currentUser.role === 'OWNER'
                    ? 'Owner Dashboard'
                    : currentUser.role === 'STAFF'
                      ? 'Staff Workspace'
                      : 'Member Portal';
            wsBtn.title = wsLabel.textContent;
        }
        if (loginLabel)
            loginLabel.textContent = `${currentUser.full_name.split(' ')[0]} (${currentUser.role})`;
        if (staffManageBtn) {
            staffManageBtn.classList.toggle('hidden', !isOwner);
            staffManageBtn.classList.toggle('inline-flex', isOwner);
        }
        if (accessIndicator) {
            accessIndicator.textContent = `Signed in as ${currentUser.full_name} (${currentUser.role})`;
        }
    } else {
        if (wsBtn) {
            wsBtn.classList.add('hidden');
            wsBtn.classList.remove('inline-flex');
        }
        if (loginLabel) loginLabel.textContent = 'Login';
        if (staffManageBtn) {
            staffManageBtn.classList.add('hidden');
            staffManageBtn.classList.remove('inline-flex');
        }
        if (accessIndicator) {
            accessIndicator.textContent = 'Sign in or use an invitation code to unlock assigned subject hubs';
        }
    }
    renderLessonGallery();
    showAdminPanel(Boolean(currentUser));
}

function switchEcosystemView(viewName) {
    activeEcosystemView = viewName;
    const publicEls = [
        '#top',
        '.kinetic-marquee',
        '#about-learnity',
        '#lessons-gallery',
        '#subject-hubs-section',
        '#learning-opportunities',
        '#staff-directory-section',
    ];
    const isPublic = viewName === 'public';
    publicEls.forEach((sel) => {
        $$(`${sel}`).forEach((el) => el.classList.toggle('hidden', !isPublic));
    });
    $('#view-subject-hub')?.classList.toggle('hidden', viewName !== 'subject');
    $('#view-owner-dashboard')?.classList.toggle('hidden', viewName !== 'owner');
    $('#view-staff-workspace')?.classList.toggle('hidden', viewName !== 'staff');
    $('#view-member-portal')?.classList.toggle('hidden', viewName !== 'member');
    window.scrollTo({ top: 0, behavior: 'instant' });
    const destination = {
        public: '#top',
        subject: '#view-subject-hub',
        owner: '#view-owner-dashboard',
        staff: '#view-staff-workspace',
        member: '#view-member-portal',
    }[viewName];
    if (destination) animatePanel($(destination));
    refreshIcons();
}

function openActiveRoleWorkspace() {
    if (!currentUser) {
        openAuthModal('login');
        return;
    }
    if (currentUser.role === 'OWNER') {
        switchEcosystemView('owner');
        openOwnerSection(activeOwnerTab || 'overview');
    } else if (currentUser.role === 'STAFF') {
        switchEcosystemView('staff');
        renderStaffWorkspace();
    } else {
        switchEcosystemView('member');
        renderMemberPortal();
    }
}

function showAdminPanel(isLoggedIn) {
    $('#admin-login-panel')?.classList.toggle('hidden', isLoggedIn);
    $('#admin-content-panel')?.classList.toggle('hidden', !isLoggedIn);
}

async function adminLogin(event) {
    event.preventDefault();
    const email = ($('#admin-email')?.value || '').trim();
    const password = $('#admin-password').value;
    const button = $('#admin-login-button');
    const errorEl = $('#admin-login-error');
    button.disabled = true;
    errorEl.classList.add('hidden');
    try {
        const res = await apiRequest('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        currentUser = res.user;
        csrfToken = res.csrfToken || '';
        adminAuthenticated = currentUser.role === 'OWNER';
        $('#admin-password').value = '';
        updateSessionUI();
        if (currentUser.role === 'OWNER') await loadApplications();
        await loadSiteContent();
        renderLessonGallery();
        applySavedPageTexts();
        await renderPublicSubjectsGrid();
        notifyToast(`Signed in as ${currentUser.full_name} (${currentUser.role}).`);
    } catch (error) {
        errorEl.textContent = error.message;
        errorEl.classList.remove('hidden');
    } finally {
        button.disabled = false;
    }
}

async function logoutSession() {
    if ((await adminLogout()) !== false) switchEcosystemView('public');
}

async function adminLogout() {
    if (dirtyContent && !(await saveSiteContent())) return false;
    try {
        await apiRequest('/api/auth/logout', { method: 'POST', body: '{}' });
    } catch (error) {
        notifyToast('Sign-out failed. ' + error.message);
        return false;
    }
    currentUser = null;
    csrfToken = '';
    adminAuthenticated = false;
    quickTextEditEnabled = false;
    document.body.classList.remove('edit-enabled');
    const label = $('#edit-toggle-label');
    if (label) label.textContent = 'Matnlarni Tahrirlash: O‘chiq';
    $$('.editable-text').forEach((el) => el.setAttribute('contenteditable', 'false'));
    updateSessionUI();
    await renderPublicSubjectsGrid();
    cachedOwnerOverview = null;
    activeSubjectHubData = null;
    [
        'owner-section-container',
        'staff-workspace-body',
        'member-portal-body',
        'subject-hub-header',
        'subject-resource-list',
        'drawer-applications-list',
        'ecosystem-modal-body',
    ].forEach((id) => document.getElementById(id)?.replaceChildren());
    quickTextEditEnabled = false;
    await loadSiteContent();
    renderLessonGallery();
    switchEcosystemView('public');
    notifyToast('Signed out of Learnity.');
}

async function checkAdminSession() {
    try {
        const res = await apiRequest('/api/auth/me');
        if (res && res.authenticated && res.user) {
            currentUser = res.user;
            csrfToken = res.user.csrfToken || '';
            adminAuthenticated = currentUser.role === 'OWNER';
            updateSessionUI();
            if (adminAuthenticated) await loadApplications();
        } else {
            currentUser = null;
            adminAuthenticated = false;
            updateSessionUI();
        }
    } catch (_) {
        currentUser = null;
        adminAuthenticated = false;
        updateSessionUI();
    }
}

async function loadApplications() {
    const container = $('#drawer-applications-list');
    if (!container) return;
    if (!currentUser) {
        renderInto(container, view`<p class="text-xs text-slate-400">Please sign in.</p>`);
        return;
    }
    if (currentUser.role !== 'OWNER') {
        renderInto(
            container,
            view`
            <div class="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-2 text-xs text-slate-300">
                <div class="font-semibold text-white">Signed in as ${currentUser.full_name} (${currentUser.role})</div>
                <p class="text-slate-400">Applicant records are restricted to the Platform Owner. Click below to open your ${currentUser.role} workspace.</p>
                <button onclick=${() => {
                    openActiveRoleWorkspace();
                    toggleApplicationsDrawer(false);
                }} class="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-semibold">Open My Workspace</button>
            </div>`,
        );
        return;
    }
    renderInto(container, view`<p class="text-xs text-slate-500 py-5">Loading applications…</p>`);
    try {
        const data = await apiRequest('/api/owner/applications');
        const items = data.applications || [];
        const badge = $('#nav-app-count');
        if (badge) badge.textContent = String(items.length);
        if (!items.length) {
            renderInto(
                container,
                view`<div class="rounded-xl border border-white/10 p-5 text-center text-sm text-slate-400">No applications yet.</div>`,
            );
            return;
        }
        renderInto(
            container,
            items.map(
                (item) => view`
            <div class="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-1.5">
                <div class="flex items-center justify-between gap-2">
                    <span class="font-semibold text-white text-sm break-words">${item.full_name || item.name}</span>
                    <div class="flex items-center gap-1">
                        <span class="px-2 py-0.5 rounded text-[10px] font-mono ${item.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-300' : item.status === 'Rejected' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'}">${item.status || 'Pending'}</span>
                        <button onclick=${() => deleteApplication(Number(item.id))} class="text-slate-500 hover:text-rose-300 p-1" title="Delete application"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i></button>
                    </div>
                </div>
                <div class="text-[11px] font-mono text-indigo-300">${item.application_uid || ''} · ${item.requested_role || 'MEMBER'}</div>
                <div class="text-xs text-amber-400 font-medium">${item.track}</div>
                <div class="flex items-center justify-between gap-2 text-xs text-slate-400 pt-1"><span class="font-mono">${item.phone_or_telegram || item.phone}</span><span>${item.schedule_preference || item.schedule}</span></div>
                <div class="flex items-center gap-1.5 pt-1.5">
                    <button onclick=${() => quickReviewApplication(Number(item.id), 'Approved', true)} class="px-2 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 text-[11px] font-semibold">Approve + Code</button>
                    <button onclick=${() => quickReviewApplication(Number(item.id), 'Contacted', false)} class="px-2 py-1 rounded bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-200 text-[11px] font-semibold">Contacted</button>
                    <button onclick=${() => quickReviewApplication(Number(item.id), 'Rejected', false)} class="px-2 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 text-[11px] font-semibold">Reject</button>
                </div>
            </div>`,
            ),
        );
        refreshIcons();
    } catch (error) {
        renderInto(container, view`<p class="text-xs text-rose-300">${error.message}</p>`);
    }
}

async function quickReviewApplication(appId, status, generateInvite = false) {
    try {
        const res = await apiRequest(`/api/owner/applications/${appId}`, {
            method: 'PUT',
            body: JSON.stringify({ status, generate_invite: generateInvite, notify_applicant: true }),
        });
        await loadApplications();
        if (activeEcosystemView === 'owner' && activeOwnerTab === 'applications') {
            await openOwnerSection('applications');
        }
        if (res.generatedInviteCard) {
            showGeneratedInvitationModal(res.generatedInviteCard);
        } else {
            notifyToast(`Application updated to ${status}.`);
        }
    } catch (err) {
        notifyToast(err.message, 'error');
    }
}

async function deleteApplication(id) {
    if (!adminAuthenticated || !Number.isInteger(id)) return;
    try {
        await apiRequest(`/api/admin/applications/${id}`, { method: 'DELETE' });
        await loadApplications();
        await refreshPublicStats();
        if (activeEcosystemView === 'owner' && activeOwnerTab === 'applications') {
            await openOwnerSection('applications');
        }
        notifyToast('Application deleted.');
    } catch (error) {
        notifyToast(error.message, 'error');
    }
}

function toggleApplicationsDrawer(open) {
    const drawer = $('#applications-drawer');
    if (!drawer) return;
    if (open) {
        drawer.classList.remove('hidden');
        showAdminPanel(Boolean(currentUser));
        if (currentUser) loadApplications();
    } else {
        drawer.classList.add('hidden');
    }
}

function toggleMobileNav(force) {
    const el = $('#mobile-nav-drawer');
    if (!el) return;
    const next = typeof force === 'boolean' ? force : el.classList.contains('hidden');
    el.classList.toggle('hidden', !next);
}

// =========================================================
// PUBLIC SUBJECT HUBS, STAFF DIRECTORY & INTERACTIVE TIMELINE
// =========================================================
const TIMELINE_STAGES = [
    {
        step: '01 · DISCOVERY & TWO-WAY ENTRY',
        title: 'Apply as a Learner/Mentor or Unlock Instant Access via Invitation Code',
        description:
            'Prospective students and mentors apply directly through the public portal or redeem a cryptographic invitation code generated by the Owner or authorized peers. Every code maps to exact subject hubs and granular permissions.',
        metrics: [
            'Two-Way Registration Architecture',
            'SHA-256 Hashed Invitation Codes',
            'Granular Subject Assignment',
        ],
        icon: 'key-round',
    },
    {
        step: '02 · SMALL-GROUP LIVELY LABS',
        title: '70% Hands-On Experimentation, Live Debates & Circuit/Code Clinics',
        description:
            'Cohorts of 10–12 learners meet twice weekly in focused laboratory sessions. Biology students run microscopy & spectrophotometry protocols; Programming cohorts refactor algorithms live; English cohorts hold parliamentary debates.',
        metrics: ['10–12 Learners per Cohort', 'Weekly Laboratory Protocols', 'Annotated Video & PDF Hubs'],
        icon: 'flask-conical',
    },
    {
        step: '03 · PEER MENTORSHIP & CONTRIBUTIONS',
        title: 'Collaborate in Subject Hubs & Contribute Moderated Study Resources',
        description:
            'Authorized members and staff upload study guides, lecture slides, YouTube walkthroughs, and curated external links directly inside their Subject Hubs. Content flows through Pending Review → Approved → Published.',
        metrics: [
            '3-Stage Moderation Workflow',
            'Role-Scoped Publishing Rights',
            '1-on-1 Mentor Office Hours',
        ],
        icon: 'users-round',
    },
    {
        step: '04 · CAPSTONE DEMO DAY & ARCHIVE',
        title: 'Ship Real Research Papers, Working Prototypes & Permanent Gallery Highlights',
        description:
            'Every 8-week cohort culminates in an open Demo Day where teams defend their research or software builds. Classroom photographs are curated in the Owner Media Library and published to the live gallery.',
        metrics: [
            '96% Capstone Completion Rate',
            'Public Portfolio Artifacts',
            'Persistent Classroom Photo Archive',
        ],
        icon: 'award',
    },
];

function selectTimelineStage(idx) {
    const stage = TIMELINE_STAGES[idx] || TIMELINE_STAGES[0];
    $$('[data-timeline-btn]').forEach((btn) => {
        btn.classList.toggle('ecosystem-pill-active', Number(btn.dataset.timelineBtn) === idx);
    });
    const container = $('#interactive-timeline-detail');
    if (!container) return;
    renderInto(
        container,
        view`
        <div class="lg:col-span-7 space-y-4">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 font-mono text-xs">
                <i data-lucide="${stage.icon}" class="w-3.5 h-3.5 text-amber-400"></i>
                <span>${stage.step}</span>
            </div>
            <h3 class="font-display text-2xl sm:text-3xl font-bold text-white leading-tight">${stage.title}</h3>
            <p class="text-sm sm:text-base text-slate-300 leading-relaxed">${stage.description}</p>
        </div>
        <div class="lg:col-span-5 space-y-3">
            ${stage.metrics.map(
                (m, i) => view`
                <div class="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex items-center gap-3">
                    <span class="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono text-xs flex items-center justify-center font-bold">0${i + 1}</span>
                    <span class="text-xs sm:text-sm font-semibold text-white">${m}</span>
                </div>
            `,
            )}
        </div>
    `,
    );
    refreshIcons();
}

async function renderPublicSubjectsGrid() {
    const grid = $('#public-subjects-grid');
    if (!grid) return;
    try {
        const data = await apiRequest('/api/subjects');
        const subjects = Array.isArray(data.subjects)
            ? data.subjects.filter((s) => plainRecord(s) && validSlug(s.slug))
            : [];
        const shortcutStrip = $('#subject-shortcuts');
        renderInto(
            shortcutStrip,
            subjects.map(
                (s) =>
                    view`<button type="button" onclick=${() => openSubjectHub(s.slug)}><i data-lucide="${s.icon_name || 'book-open'}"></i>${s.name}</button>`,
            ),
        );
        renderInto(
            grid,
            subjects.map((s) => {
                const unlocked = Boolean(s.hasAccess);
                return view`
                <div class="surface-card rounded-2xl p-5 flex flex-col justify-between gap-4 group">
                    <div class="space-y-3">
                        <div class="flex items-center justify-between gap-2">
                            <div class="w-10 h-10 rounded-xl flex items-center justify-center border border-white/10" style=${accentStyle(s.accent_color, true)}>
                                <i data-lucide="${s.icon_name || 'book-open'}" class="w-5 h-5"></i>
                            </div>
                            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-mono ${unlocked ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-white/[0.05] text-slate-400 border border-white/10'}">
                                ${unlocked ? '● Unlocked' : '🔒 Assigned Access'}
                            </span>
                        </div>
                        <div>
                            <div class="text-[11px] font-mono text-slate-400">${s.category}</div>
                            <h3 class="font-display text-lg font-bold text-white mt-0.5">${s.name}</h3>
                        </div>
                        <p class="text-xs text-slate-400 leading-relaxed">${s.short_description}</p>
                    </div>
                    <div class="pt-3 border-t border-white/[0.06] space-y-2.5">
                        <div class="flex items-center justify-between text-[11px] text-slate-400">
                            <span>${s.lead_instructor || 'Learnity Team'}</span>
                            <span class="font-mono text-indigo-300">${Number(s.publishedResourcesCount || 0)} resources</span>
                        </div>
                        <button onclick=${() => openSubjectHub(s.slug)}
                                class="w-full py-2 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 ${unlocked ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-slate-300'}">
                            <span>${unlocked ? `Enter ${s.name} Hub` : `Preview / Request Access`}</span>
                            <i data-lucide="arrow-up-right" class="w-3.5 h-3.5"></i>
                        </button>
                    </div>
                </div>
            `;
            }),
        );
        refreshIcons();
        initPointerEffects(grid);
    } catch (err) {
        renderLoadFailure(grid, err, renderPublicSubjectsGrid);
    }
}

async function renderPublicStaffDirectory() {
    const grid = $('#public-staff-grid');
    if (!grid) return;
    try {
        const data = await apiRequest('/api/staff');
        const staff = (data.staff || []).filter((s) => s.is_visible !== 0);
        renderInto(
            grid,
            staff.map(
                (member) => view`
            <div class="surface-card rounded-2xl overflow-hidden flex flex-col justify-between">
                <div>
                    <div class="relative h-52 bg-slate-950 overflow-hidden">
                        <img src="${member.photo_url}" alt="${member.full_name}"
                             class="w-full h-full object-cover object-top transition duration-500 hover:scale-105" />
                        <div class="absolute inset-0 bg-gradient-to-t from-[#0c0e14] via-transparent to-transparent"></div>
                        <div class="absolute bottom-3 left-3 right-3">
                            <span class="px-2 py-0.5 rounded bg-indigo-500/30 border border-indigo-400/30 backdrop-blur-md text-[10px] font-mono text-indigo-200">${member.department}</span>
                            <h3 class="font-display text-base font-bold text-white mt-1">${member.full_name}</h3>
                            <div class="text-xs text-amber-400 font-medium">${member.position}</div>
                        </div>
                    </div>
                    <div class="p-4 space-y-2">
                        <p class="text-xs text-slate-300 leading-relaxed">${member.bio}</p>
                        ${member.responsibilities ? view`<div class="text-[11px] text-slate-400"><strong class="text-slate-200">Focus:</strong> ${member.responsibilities}</div>` : ''}
                    </div>
                </div>
                <div class="px-4 py-3 border-t border-white/[0.06] flex items-center justify-between text-[11px]">
                    <span class="text-slate-400">Subjects:</span>
                    <span class="font-mono text-indigo-300 truncate max-w-[160px]" title="${member.assigned_subjects_label}">${member.assigned_subjects_label || 'Core Curriculum'}</span>
                </div>
            </div>
        `,
            ),
        );
        refreshIcons();
        initPointerEffects(grid);
    } catch (err) {
        renderLoadFailure(grid, err, renderPublicStaffDirectory);
    }
}

// =========================================================
// SUBJECT-SPECIFIC LEARNING HUB (/subjects/:slug)
// =========================================================
async function openSubjectHub(slug) {
    if (!validSlug(slug)) {
        notifyToast('Unknown subject hub.');
        return;
    }
    activeSubjectSlug = slug;
    if (!currentUser) {
        requestedSubject = slug;
        notifyToast('Please sign in or redeem an invitation code to access Subject Learning Hubs.');
        openAuthModal('login');
        return;
    }
    try {
        const data = await apiRequest(`/api/subjects/${encodeURIComponent(slug)}`);
        activeSubjectHubData = data;
        activeSubjectResourceFilter = 'all';
        switchEcosystemView('subject');
        renderActiveSubjectHub();
    } catch (err) {
        notifyToast(err.message, 'error');
    }
}

function renderActiveSubjectHub() {
    if (!activeSubjectHubData) return;
    const { subject, permissions, resources, announcements } = activeSubjectHubData;
    const routePill = $('#subject-hub-route-pill');
    if (routePill) routePill.textContent = `/subjects/${subject.slug}`;

    const header = $('#subject-hub-header');
    if (header) {
        renderInto(
            header,
            view`
            <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div class="space-y-2 max-w-3xl">
                    <div class="inline-flex items-center gap-2 text-xs font-mono uppercase" style=${accentStyle(subject.accent_color)}>
                        <i data-lucide="${subject.icon_name || 'book-open'}" class="w-4 h-4"></i>
                        <span>${subject.category} · ${subject.schedule_label || 'Weekly Lab'}</span>
                    </div>
                    <h1 class="font-display text-3xl sm:text-4xl font-bold text-white">${subject.name} Learning Hub</h1>
                    <p class="text-sm sm:text-base text-slate-300 leading-relaxed">${subject.intro_html || subject.short_description}</p>
                </div>
                <div class="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-1.5 shrink-0 min-w-[220px]">
                    <div class="text-[11px] font-mono text-slate-400 uppercase">Lead Instructor</div>
                    <div class="font-display font-bold text-white text-base">${subject.lead_instructor || 'Learnity Faculty'}</div>
                    <div class="text-xs text-emerald-400 font-medium">${resources.filter((r) => r.moderation_status === 'Published').length} Published Materials</div>
                </div>
            </div>
        `,
        );
    }

    const canContribute =
        currentUser &&
        (currentUser.role === 'OWNER' ||
            permissions?.can_upload_materials ||
            permissions?.can_create_links ||
            permissions?.can_upload_videos);
    const contribBtn = $('#btn-subject-contribute');
    if (contribBtn) {
        contribBtn.classList.toggle('hidden', !canContribute);
        contribBtn.classList.toggle('inline-flex', Boolean(canContribute));
    }

    // Permissions badges
    const permBadges = $('#subject-hub-permissions-badges');
    if (permBadges && permissions) {
        const flags = [
            ['can_access_subject', 'Subject Access'],
            ['can_view_materials', 'View Materials'],
            ['can_upload_materials', 'Upload PDFs/Slides'],
            ['can_publish_materials', 'Direct Publish'],
            ['can_create_links', 'Add Resource Links'],
            ['can_upload_videos', 'Add Video Lessons'],
            ['can_moderate', 'Moderation Authority'],
        ];
        renderInto(
            permBadges,
            flags.map(
                ([k, label]) => view`
            <span class="px-2.5 py-1 rounded-lg border ${permissions[k] ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300' : 'bg-white/[0.03] border-white/10 text-slate-500'}">
                ${permissions[k] ? '✓' : '×'} ${label}
            </span>
        `,
            ),
        );
    }

    // Announcements
    const annContainer = $('#subject-hub-announcements');
    if (annContainer) {
        renderInto(
            annContainer,
            (announcements || []).length
                ? announcements.map(
                      (a) => view`
                <div class="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-1">
                    <div class="flex items-center justify-between gap-2">
                        <span class="text-xs font-bold text-white">${a.title}</span>
                        <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300">${a.priority}</span>
                    </div>
                    <p class="text-xs text-slate-300 leading-relaxed">${a.body}</p>
                    <div class="text-[10px] text-slate-500 pt-1">By ${a.author_name}</div>
                </div>
            `,
                  )
                : view`<p class="text-xs text-slate-500">No announcements for this subject yet.</p>`,
        );
    }

    filterSubjectResources(activeSubjectResourceFilter);
}

function filterSubjectResources(typeFilter) {
    activeSubjectResourceFilter = typeFilter;
    $$('[data-res-filter]').forEach((btn) => {
        const active = btn.dataset.resFilter === typeFilter;
        btn.className = active
            ? 'px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 text-white transition'
            : 'px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white/5 text-slate-300 hover:text-white transition';
    });
    const listEl = $('#subject-hub-resources-list');
    if (!listEl || !activeSubjectHubData) return;

    const allRes = activeSubjectHubData.resources || [];
    const filtered =
        typeFilter === 'all'
            ? allRes
            : allRes.filter((r) =>
                  typeFilter === 'youtube'
                      ? r.resource_type === 'youtube' || r.resource_type === 'video'
                      : r.resource_type === typeFilter,
              );

    const canModerate =
        currentUser && (currentUser.role === 'OWNER' || activeSubjectHubData.permissions?.can_moderate);

    if (!filtered.length) {
        renderInto(
            listEl,
            view`<div class="surface-card rounded-2xl p-8 text-center text-sm text-slate-400">No learning materials match this filter yet.</div>`,
        );
        return;
    }

    renderInto(
        listEl,
        filtered.map((r) => {
            const iconMap = {
                pdf: 'file-text',
                presentation: 'presentation',
                youtube: 'video',
                video: 'video',
                link: 'external-link',
                study_guide: 'book-open-check',
            };
            const targetUrl = r.file_url || r.external_url || '#';
            return view`
            <div class="surface-card rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div class="space-y-1.5">
                    <div class="flex flex-wrap items-center gap-2 text-[11px] font-mono">
                        <span class="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 uppercase">${r.resource_type}</span>
                        <span class="text-slate-400">${r.category}</span>
                        <span class="px-2 py-0.5 rounded ${r.moderation_status === 'Published' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}">${r.moderation_status}</span>
                    </div>
                    <h4 class="font-display text-base sm:text-lg font-bold text-white">${r.title}</h4>
                    <p class="text-xs sm:text-sm text-slate-400 leading-relaxed">${r.description}</p>
                    <div class="text-[11px] text-slate-500 pt-1">Contributed by <strong class="text-slate-300">${r.author_name}</strong> · ${r.duration_or_size || ''}</div>
                </div>
                <div class="flex flex-wrap sm:flex-col items-end gap-2 shrink-0">
                    ${
                        targetUrl && targetUrl !== '#'
                            ? view`
                        <a href="${targetUrl}" target="_blank" rel="noopener noreferrer"
                           class="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5">
                            <i data-lucide="${iconMap[r.resource_type] || 'external-link'}" class="w-3.5 h-3.5"></i>
                            <span>Open Resource</span>
                        </a>
                    `
                            : ''
                    }
                    ${
                        canModerate && r.moderation_status !== 'Published'
                            ? view`
                        <button onclick=${() => moderateResource(Number(r.id), 'Published')} class="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 text-[11px] font-semibold">Approve & Publish</button>
                    `
                            : ''
                    }
                    ${
                        canModerate || (currentUser && r.author_user_id === currentUser.id)
                            ? view`
                        <button onclick=${() => deleteResourceItem(Number(r.id))} class="px-2.5 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 text-[11px]">Delete</button>
                    `
                            : ''
                    }
                </div>
            </div>
        `;
        }),
    );
    refreshIcons();
}

async function moderateResource(resId, nextStatus) {
    try {
        await apiRequest(`/api/resources/${resId}`, {
            method: 'PUT',
            body: JSON.stringify({ moderation_status: nextStatus }),
        });
        notifyToast(`Resource marked as ${nextStatus}.`);
        if (activeEcosystemView === 'subject') await openSubjectHub(activeSubjectSlug);
        if (activeEcosystemView === 'owner') await openOwnerSection('resources');
    } catch (err) {
        notifyToast(err.message, 'error');
    }
}

async function deleteResourceItem(resId) {
    try {
        await apiRequest(`/api/resources/${resId}`, { method: 'DELETE' });
        notifyToast('Resource removed.');
        if (activeEcosystemView === 'subject') await openSubjectHub(activeSubjectSlug);
        if (activeEcosystemView === 'owner') await openOwnerSection('resources');
        if (activeEcosystemView === 'staff') await renderStaffWorkspace();
    } catch (err) {
        notifyToast(err.message, 'error');
    }
}

// =========================================================
// OWNER DASHBOARD (11 MANAGEMENT SECTIONS + INTERACTIVE CHARTS)
// =========================================================
let cachedOwnerOverview = null;
let ownerRequestNumber = 0;

async function openOwnerSection(tabName) {
    if (!currentUser || currentUser.role !== 'OWNER') {
        notifyToast('Owner authentication required.');
        openAuthModal('login');
        return;
    }
    const requestNumber = ++ownerRequestNumber;
    activeOwnerTab = tabName;
    if (activeEcosystemView !== 'owner') {
        switchEcosystemView('owner');
    }
    $$('[data-owner-tab]').forEach((btn) => {
        btn.classList.toggle('ecosystem-pill-active', btn.dataset.ownerTab === tabName);
        btn.setAttribute('aria-pressed', String(btn.dataset.ownerTab === tabName));
    });

    const container = $('#owner-section-container');
    if (!container) return;
    renderInto(
        container,
        view`<div class="loading-line surface-card rounded-2xl p-8 text-center text-sm text-slate-400" aria-busy="true">Loading dashboard…</div>`,
    );

    try {
        const result = await apiRequest('/api/owner/overview');
        if (requestNumber !== ownerRequestNumber || currentUser?.role !== 'OWNER') return;
        cachedOwnerOverview = result;
    } catch (err) {
        renderInto(
            container,
            view`<div class="surface-card rounded-2xl p-6 text-rose-300 text-sm">${err.message}</div>`,
        );
        return;
    }

    const d = cachedOwnerOverview;
    const m = d.metrics || {};

    if (tabName === 'overview') {
        const maxRes = Math.max(1, ...(d.subjectBreakdown || []).map((s) => s.resourcesCount));
        const maxEnrolled = Math.max(1, ...(d.subjectBreakdown || []).map((s) => s.enrolledUsersCount));
        renderInto(
            container,
            view`
            
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div class="surface-card rounded-2xl p-5">
                    <div class="text-xs font-mono text-slate-400">TOTAL MEMBERS</div>
                    <div class="font-display text-3xl font-bold text-white mt-1">${Number(m.totalMembers || 0)}</div>
                    <div class="text-[11px] text-emerald-400 mt-1">${Number(m.activeMembers || 0)} active accounts</div>
                </div>
                <div class="surface-card rounded-2xl p-5">
                    <div class="text-xs font-mono text-slate-400">ACADEMIC STAFF</div>
                    <div class="font-display text-3xl font-bold text-indigo-400 mt-1">${Number(m.totalStaff || 0)}</div>
                    <div class="text-[11px] text-slate-400 mt-1">Assigned subject workspaces</div>
                </div>
                <div class="surface-card rounded-2xl p-5">
                    <div class="text-xs font-mono text-slate-400">PENDING APPLICATIONS</div>
                    <div class="font-display text-3xl font-bold text-amber-400 mt-1">${Number(m.pendingApplications || 0)}</div>
                    <button onclick=${() => openOwnerSection('applications')} class="text-[11px] text-amber-300 underline mt-1">Review queue →</button>
                </div>
                <div class="surface-card rounded-2xl p-5">
                    <div class="text-xs font-mono text-slate-400">PUBLISHED RESOURCES</div>
                    <div class="font-display text-3xl font-bold text-emerald-400 mt-1">${Number(m.publishedResources || 0)}</div>
                    <div class="text-[11px] text-slate-400 mt-1">Across ${Number(m.totalSubjects || 8)} subjects · ${Number(m.totalPhotos || 0)} photos</div>
                </div>
            </div>

            
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div class="lg:col-span-7 surface-card rounded-2xl p-6 space-y-4">
                    <div class="flex items-center justify-between">
                        <div>
                            <h3 class="font-display text-lg font-bold text-white">Subject Hub Enrollment & Resource Density</h3>
                            <p class="text-xs text-slate-400">Real-time database distribution across all active Learnity disciplines</p>
                        </div>
                        <span class="px-2.5 py-1 rounded bg-white/5 font-mono text-[11px] text-slate-300">${d.subjects.length} Subjects</span>
                    </div>
                    <div class="space-y-3 pt-2">
                        ${(d.subjectBreakdown || []).map((sb) => {
                            const resPct = Math.max(10, Math.round((sb.resourcesCount / maxRes) * 100));
                            const usrPct = Math.max(
                                10,
                                Math.round((sb.enrolledUsersCount / maxEnrolled) * 100),
                            );
                            return view`
                                <div class="space-y-1">
                                    <div class="flex items-center justify-between text-xs">
                                        <button onclick=${() => openSubjectHub(sb.slug)} class="font-semibold text-white hover:text-amber-300">${sb.name}</button>
                                        <span class="font-mono text-[11px] text-slate-400">${sb.enrolledUsersCount} assigned · ${sb.resourcesCount} materials</span>
                                    </div>
                                    <div class="w-full h-2.5 rounded-full bg-white/[0.05] overflow-hidden flex gap-0.5">
                                        <div class="chart-bar-fill h-full rounded-l-full" style=${meterStyle(usrPct, sb.accent_color)}></div>
                                        <div class="chart-bar-fill h-full rounded-r-full bg-amber-400/70" style=${meterStyle(resPct * 0.4)}></div>
                                    </div>
                                </div>
                            `;
                        })}
                    </div>
                </div>

                <div class="lg:col-span-5 surface-card rounded-2xl p-6 space-y-4">
                    <div class="flex items-center justify-between">
                        <h3 class="font-display text-lg font-bold text-white">Recent Audit & Platform Activity</h3>
                        <button onclick=${() => openOwnerSection('logs')} class="text-xs text-indigo-300 hover:text-white">Full Log →</button>
                    </div>
                    <div class="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                        ${(d.activityLogs || []).slice(0, 8).map(
                            (log) => view`
                            <div class="p-3 rounded-xl bg-white/[0.03] border border-white/[0.07] space-y-1 text-xs">
                                <div class="flex items-center justify-between gap-2">
                                    <span class="font-mono text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">${log.action_type}</span>
                                    <span class="text-[10px] text-slate-500">${log.created_at || ''}</span>
                                </div>
                                <div class="text-slate-200">${log.description}</div>
                                <div class="text-[10px] text-slate-500">Actor: ${log.actor_name} (${log.actor_role})</div>
                            </div>
                        `,
                        )}
                    </div>
                </div>
            </div>
        `,
        );
    } else if (tabName === 'applications') {
        renderInto(
            container,
            view`
            <div class="surface-card rounded-2xl p-6 space-y-5">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h3 class="font-display text-xl font-bold text-white">Applicant Processing & Cohort Admissions</h3>
                        <p class="text-xs text-slate-400">Approve applications to automatically generate single-use cryptographic invitation codes.</p>
                    </div>
                    <div class="flex flex-wrap items-center gap-2">
                        <input id="owner-app-search" type="text" oninput=${() => filterOwnerApplicationsTable()} placeholder="Search name, UID, subject..."
                               class="px-3 py-2 rounded-xl bg-[#07090e] border border-white/10 text-xs text-white placeholder-slate-500" />
                        <select id="owner-app-status-filter" onchange=${() => filterOwnerApplicationsTable()} class="px-3 py-2 rounded-xl bg-[#07090e] border border-white/10 text-xs text-white">
                            <option value="">All Statuses</option>
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approved</option>
                            <option value="Contacted">Contacted</option>
                            <option value="Rejected">Rejected</option>
                        </select>
                        <a href="/api/owner/applications?format=csv" onclick=${isPreview ? demoCsv : null} target="_blank" class="px-3 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                            <i data-lucide="download" class="w-3.5 h-3.5"></i>
                            <span>Export CSV</span>
                        </a>
                    </div>
                </div>
                <div id="owner-applications-table-wrap" class="space-y-3"></div>
            </div>
        `,
        );
        filterOwnerApplicationsTable();
    } else if (tabName === 'invitations') {
        renderInto(container, buildInvitationGeneratorSection(d.subjects, d.invitations));
    } else if (tabName === 'members') {
        renderInto(container, buildUsersPermissionsSection(d.users, d.subjects));
    } else if (tabName === 'staff') {
        const staffData = await apiRequest('/api/staff');
        renderInto(container, buildOwnerStaffSection(staffData.staff || [], d.subjects));
    } else if (tabName === 'subjects') {
        renderInto(container, buildOwnerSubjectsSection(d.subjects));
    } else if (tabName === 'resources') {
        renderInto(container, buildOwnerResourcesSection(d.resources, d.subjects));
    } else if (tabName === 'media') {
        renderInto(container, buildOwnerMediaLibrary());
    } else if (tabName === 'announcements') {
        renderInto(container, buildOwnerAnnouncementsSection(d.announcements, d.subjects));
    } else if (tabName === 'settings') {
        renderInto(container, buildOwnerSettingsSection(d.templates || []));
    } else if (tabName === 'logs') {
        renderInto(
            container,
            view`
            <div class="surface-card rounded-2xl p-6 space-y-4">
                <h3 class="font-display text-xl font-bold text-white">Security & Audit Activity Logs</h3>
                <div class="space-y-2">
                    ${(d.activityLogs || []).map(
                        (l) => view`
                        <div class="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                            <div class="space-y-0.5">
                                <div class="flex items-center gap-2">
                                    <span class="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono text-[10px]">${l.action_type}</span>
                                    <span class="font-semibold text-white">${l.actor_name} (${l.actor_role})</span>
                                </div>
                                <div class="text-slate-300">${l.description}</div>
                            </div>
                            <div class="font-mono text-[11px] text-slate-500 shrink-0">${l.ip_address} · ${l.created_at}</div>
                        </div>
                    `,
                    )}
                </div>
            </div>
        `,
        );
    }
    refreshIcons();
}

function filterOwnerApplicationsTable() {
    const wrap = $('#owner-applications-table-wrap');
    if (!wrap || !cachedOwnerOverview) return;
    const q = ($('#owner-app-search')?.value || '').toLowerCase().trim();
    const status = $('#owner-app-status-filter')?.value || '';
    const apps = (cachedOwnerOverview.applications || []).filter((a) => {
        if (status && a.status !== status) return false;
        if (
            q &&
            ![
                a.application_uid,
                a.full_name,
                a.email,
                a.phone_or_telegram,
                a.track,
                a.interested_subjects,
                a.educational_background,
            ]
                .join(' ')
                .toLowerCase()
                .includes(q)
        )
            return false;
        return true;
    });

    if (!apps.length) {
        renderInto(
            wrap,
            view`<div class="p-6 text-center text-sm text-slate-400">No matching applications found.</div>`,
        );
        return;
    }

    renderInto(
        wrap,
        apps.map((a) => {
            const subjs = jsonValue(
                a.interested_subjects,
                (value) => Array.isArray(value) && value.every((v) => typeof v === 'string'),
                [],
            );
            return view`
            <div class="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div class="space-y-1.5 max-w-2xl">
                    <div class="flex flex-wrap items-center gap-2">
                        <span class="font-mono text-xs text-indigo-300">${a.application_uid}</span>
                        <span class="px-2 py-0.5 rounded text-[10px] font-mono ${a.requested_role === 'STAFF' ? 'badge-role-staff' : 'badge-role-member'}">${a.requested_role}</span>
                        <span class="px-2 py-0.5 rounded text-[10px] font-mono ${a.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-300' : a.status === 'Rejected' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'}">${a.status}</span>
                        <span class="text-xs text-slate-500">${a.created_at}</span>
                    </div>
                    <div class="font-display text-base font-bold text-white">${a.full_name} <span class="text-xs font-normal text-slate-400">(${a.email} · ${a.phone_or_telegram})</span></div>
                    <div class="text-xs text-amber-300">Subjects: ${subjs.join(', ') || a.track} · Schedule: ${a.schedule_preference}</div>
                    ${a.educational_background ? view`<div class="text-xs text-slate-300"><strong>Background:</strong> ${a.educational_background}</div>` : ''}
                    ${a.motivation_statement ? view`<div class="text-xs text-slate-400 italic">"${a.motivation_statement}"</div>` : ''}
                </div>
                <div class="flex flex-wrap items-center gap-2 shrink-0">
                    <button onclick=${() => quickReviewApplication(Number(a.id), 'Approved', true)} class="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold">Approve + Generate Invite</button>
                    <button onclick=${() => quickReviewApplication(Number(a.id), 'Contacted', false)} class="px-3 py-1.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 text-indigo-200 text-xs font-semibold">Mark Contacted</button>
                    <button onclick=${() => quickReviewApplication(Number(a.id), 'Rejected', false)} class="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-rose-200 text-xs font-semibold">Reject</button>
                    <button onclick=${() => deleteApplication(Number(a.id))} class="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                </div>
            </div>
        `;
        }),
    );
    refreshIcons();
}

function buildInvitationGeneratorSection(subjects = [], invitations = [], isDelegatedPortal = false) {
    const availSubjects =
        currentUser?.role === 'OWNER'
            ? subjects
            : subjects.filter((s) => currentUser?.subjectPermMap?.[s.id]?.can_access_subject);

    return view`
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div class="lg:col-span-6 surface-card rounded-2xl p-6 space-y-5">
                <div>
                    <span class="text-[11px] font-mono uppercase text-amber-400">Cryptographic Invitation Generator</span>
                    <h3 class="font-display text-xl font-bold text-white mt-0.5">Which subjects should this invitation provide access to?</h3>
                    <p class="text-xs text-slate-400">Codes are generated using cryptographically random entropy and stored as SHA-256 hashes.</p>
                </div>

                <form onsubmit=${handleGenerateInvitationCode} class="space-y-4">
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label class="block text-xs font-medium text-slate-300 mb-1">Invitation Label</label>
                            <input id="gen-inv-label" type="text" placeholder="e.g. Biology & Chemistry Cohort"
                                   class="w-full px-3 py-2 rounded-xl bg-[#07090e] border border-white/10 text-xs text-white" />
                        </div>
                        <div>
                            <label class="block text-xs font-medium text-slate-300 mb-1">Target Role</label>
                            <select id="gen-inv-role" disabled=${Boolean(currentUser?.role !== 'OWNER')} class="w-full px-3 py-2 rounded-xl bg-[#07090e] border border-white/10 text-xs text-white">
                                <option value="MEMBER">MEMBER (Student / Cohort Learner)</option>
                                ${currentUser?.role === 'OWNER' ? view`<option value="STAFF">STAFF (Instructor / Mentor)</option>` : ''}
                            </select>
                        </div>
                    </div>

                    
                    <div>
                        <label class="block text-xs font-medium text-slate-300 mb-1.5">A. Select Assigned Subjects (Multi-select)</label>
                        <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            ${availSubjects.map(
                                (s, idx) => view`
                                <label class="cursor-pointer">
                                    <input type="checkbox" name="gen_inv_subject" value="${Number(s.id)}" checked=${Boolean(idx === 0)} class="peer hidden" />
                                    <div class="px-3 py-2 rounded-xl bg-[#07090e] border border-white/10 peer-checked:border-indigo-500 peer-checked:bg-indigo-500/20 text-xs text-slate-300 peer-checked:text-white font-medium transition truncate">
                                        ${s.name}
                                    </div>
                                </label>
                            `,
                            )}
                        </div>
                    </div>

                    
                    <div>
                        <label class="block text-xs font-medium text-slate-300 mb-1.5">B. Granular Permission Settings</label>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            <label class="flex items-center gap-2 p-2.5 rounded-xl bg-[#07090e] border border-white/10 text-slate-200"><input type="checkbox" id="perm-access" checked disabled class="accent-indigo-500" /><span>Can access subject</span></label>
                            <label class="flex items-center gap-2 p-2.5 rounded-xl bg-[#07090e] border border-white/10 text-slate-200"><input type="checkbox" id="perm-view" checked class="accent-indigo-500" /><span>Can view materials</span></label>
                            <label class="flex items-center gap-2 p-2.5 rounded-xl bg-[#07090e] border border-white/10 text-slate-200"><input type="checkbox" id="perm-upload" class="accent-indigo-500" /><span>Can upload materials</span></label>
                            <label class="flex items-center gap-2 p-2.5 rounded-xl bg-[#07090e] border border-white/10 text-slate-200"><input type="checkbox" id="perm-publish" disabled=${Boolean(currentUser?.role !== 'OWNER')} class="accent-indigo-500" /><span>Can publish materials</span></label>
                            <label class="flex items-center gap-2 p-2.5 rounded-xl bg-[#07090e] border border-white/10 text-slate-200"><input type="checkbox" id="perm-links" checked class="accent-indigo-500" /><span>Can create resource links</span></label>
                            <label class="flex items-center gap-2 p-2.5 rounded-xl bg-[#07090e] border border-white/10 text-slate-200"><input type="checkbox" id="perm-videos" class="accent-indigo-500" /><span>Can upload videos</span></label>
                            <label class="flex items-center gap-2 p-2.5 rounded-xl bg-[#07090e] border border-white/10 text-slate-200"><input type="checkbox" id="perm-invite" disabled=${Boolean(currentUser?.role !== 'OWNER')} class="accent-indigo-500" /><span>Can invite other members</span></label>
                            <label class="flex items-center gap-2 p-2.5 rounded-xl bg-[#07090e] border border-white/10 text-slate-200"><input type="checkbox" id="perm-gencodes" disabled=${Boolean(currentUser?.role !== 'OWNER')} class="accent-indigo-500" /><span>Can generate invitation codes</span></label>
                        </div>
                    </div>

                    
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block text-xs font-medium text-slate-300 mb-1">Maximum Uses (1 = Single-Use)</label>
                            <input id="gen-inv-maxuses" type="number" min="1" max="500" value="1" class="w-full px-3 py-2 rounded-xl bg-[#07090e] border border-white/10 text-xs text-white" />
                        </div>
                        <div>
                            <label class="block text-xs font-medium text-slate-300 mb-1">Expires In (Days)</label>
                            <input id="gen-inv-days" type="number" min="1" max="365" value="14" class="w-full px-3 py-2 rounded-xl bg-[#07090e] border border-white/10 text-xs text-white" />
                        </div>
                    </div>

                    <button type="submit" class="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-amber-500 hover:from-indigo-500 hover:to-amber-400 text-white font-semibold text-xs sm:text-sm shadow-lg transition flex items-center justify-center gap-2">
                        <i data-lucide="key-round" class="w-4 h-4"></i>
                        <span>Generate Cryptographic Invitation Code</span>
                    </button>
                </form>

                <div id="generated-invite-card-slot" class="hidden"></div>
            </div>

            <div class="lg:col-span-6 surface-card rounded-2xl p-6 space-y-4">
                <div class="flex items-center justify-between">
                    <div>
                        <h3 class="font-display text-lg font-bold text-white">Issued Invitation Codes (Hashed in SQLite)</h3>
                        <p class="text-xs text-slate-400">Revoke any code immediately to block future registrations.</p>
                    </div>
                </div>
                <div class="space-y-3 max-h-[540px] overflow-y-auto pr-1">
                    ${(invitations || []).map(
                        (inv) => view`
                        <div class="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                            <div class="space-y-1">
                                <div class="flex items-center gap-2">
                                    <span class="font-mono font-bold text-amber-300 text-sm">${inv.code_prefix}</span>
                                    <span class="px-2 py-0.5 rounded text-[10px] font-mono ${inv.status === 'active' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}">${inv.status}</span>
                                    <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-white/5 text-slate-300">${inv.target_role}</span>
                                </div>
                                <div class="text-white font-medium">${inv.label || 'Invitation'}</div>
                                <div class="text-slate-400">Uses: <strong>${inv.uses_count} / ${inv.max_uses}</strong> · Expires: ${new Date(inv.expires_at).toLocaleDateString()} · By ${inv.issuer_name}</div>
                            </div>
                            <div>
                                ${
                                    inv.status === 'active'
                                        ? view`
                                    <button onclick=${() => revokeInvitationCode(Number(inv.id))} class="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-rose-200 font-semibold">Revoke Code</button>
                                `
                                        : view`<span class="text-slate-500 font-mono text-[11px]">Inactive</span>`
                                }
                            </div>
                        </div>
                    `,
                    )}
                </div>
            </div>
        </div>
    `;
}

async function handleGenerateInvitationCode(e) {
    e.preventDefault();
    const subjectIds = $$('input[name="gen_inv_subject"]:checked').map((el) => Number(el.value));
    if (!subjectIds.length) {
        notifyToast('Please select at least one subject.');
        return;
    }
    const payload = {
        label: ($('#gen-inv-label')?.value || '').trim(),
        target_role: $('#gen-inv-role')?.value || 'MEMBER',
        subject_ids: subjectIds,
        max_uses: Number($('#gen-inv-maxuses')?.value || 1),
        expires_in_days: Number($('#gen-inv-days')?.value || 14),
        permissions: {
            can_access_subject: true,
            can_view_materials: Boolean($('#perm-view')?.checked),
            can_upload_materials: Boolean($('#perm-upload')?.checked),
            can_publish_materials: Boolean($('#perm-publish')?.checked),
            can_create_links: Boolean($('#perm-links')?.checked),
            can_upload_videos: Boolean($('#perm-videos')?.checked),
            can_invite_members: Boolean($('#perm-invite')?.checked),
            can_generate_codes: Boolean($('#perm-gencodes')?.checked),
        },
    };
    try {
        const res = await apiRequest('/api/invitations', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
        showGeneratedInvitationModal(res.invitationCard);
        if (activeEcosystemView === 'owner' && activeOwnerTab === 'invitations') {
            await openOwnerSection('invitations');
        }
    } catch (err) {
        notifyToast(err.message, 'error');
    }
}

function showGeneratedInvitationModal(card) {
    if (!card) return;
    const subjNames = (card.subjects || []).map((s) => (typeof s === 'string' ? s : s.name)).join(', ');
    const address = new URL(isPreview ? location.href : '/', location.href);
    address.search = '';
    address.searchParams.set('invite', card.plainCode);
    address.hash = 'join-with-code';
    const regLink = address.href;
    const body = $('#ecosystem-modal-body');
    if (!body) return;
    renderInto(
        body,
        view`
        <div class="space-y-5">
            <div class="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                    <span class="text-[11px] font-mono uppercase text-emerald-400">Cryptographic Invitation Card Ready</span>
                    <h3 class="font-display text-xl font-bold text-white">Share This Invitation Code</h3>
                </div>
                <button onclick=${() => closeEcosystemModal()} class="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white"><i data-lucide="x" class="w-4 h-4"></i></button>
            </div>

            <div class="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/90 via-[#0c0e14] to-amber-950/40 border border-indigo-500/40 space-y-4">
                <div class="flex items-center justify-between">
                    <span class="px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-200 font-mono text-[11px]">${card.targetRole} INVITATION</span>
                    <span class="text-xs text-slate-400">Max Uses: <strong class="text-white">${Number(card.maxUses || 1)}</strong></span>
                </div>
                <div class="p-4 rounded-xl bg-black/60 border border-white/10 flex items-center justify-between gap-3">
                    <span class="font-mono text-lg sm:text-xl font-bold tracking-wider text-amber-300 select-all">${card.plainCode}</span>
                    <button type="button" onclick=${() => copyTextToClipboard(card.plainCode, 'Invitation code copied!')}
                            class="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs flex items-center gap-1">
                        <i data-lucide="copy" class="w-3.5 h-3.5"></i>
                        <span>Copy Code</span>
                    </button>
                </div>
                <div class="space-y-1 text-xs text-slate-300">
                    <div><strong>Assigned Subjects:</strong> ${subjNames}</div>
                    <div><strong>Expiration Date:</strong> ${new Date(card.expiresAt).toLocaleString()}</div>
                    <div class="truncate"><strong>Registration Link:</strong> <span class="font-mono text-indigo-300">${regLink}</span></div>
                </div>
                <div class="flex gap-2 pt-1">
                    <button type="button" onclick=${() => copyTextToClipboard(regLink, 'Registration link copied!')}
                            class="flex-1 py-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] border border-white/10 text-xs font-semibold text-white">
                        Copy Registration Link
                    </button>
                    <button type="button" onclick=${() => closeEcosystemModal()}
                            class="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white">
                        Done
                    </button>
                </div>
            </div>
            <p class="text-[11px] text-slate-400 text-center">
                Security Notice: Only the SHA-256 hash of this code is stored in the SQLite database. Copy the plain code now before closing.
            </p>
        </div>
    `,
    );
    $('#ecosystem-modal').classList.remove('hidden');
    refreshIcons();
}

async function revokeInvitationCode(invId) {
    try {
        await apiRequest(`/api/invitations/${invId}/revoke`, { method: 'POST', body: JSON.stringify({}) });
        notifyToast('Invitation code revoked.');
        if (activeEcosystemView === 'owner') await openOwnerSection('invitations');
    } catch (err) {
        notifyToast(err.message, 'error');
    }
}

function buildUsersPermissionsSection(users = [], subjects = []) {
    return view`
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div class="lg:col-span-4 surface-card rounded-2xl p-6 space-y-4">
                <h3 class="font-display text-lg font-bold text-white">Create Member or Staff Account</h3>
                <form onsubmit=${handleOwnerCreateUser} class="space-y-3 text-xs">
                    <div>
                        <label class="block text-slate-300 mb-1">Full Name</label>
                        <input id="new-user-name" type="text" required placeholder="e.g. Kamola Tursunova" class="w-full px-3 py-2 rounded-xl bg-[#07090e] border border-white/10 text-white" />
                    </div>
                    <div>
                        <label class="block text-slate-300 mb-1">Email</label>
                        <input id="new-user-email" type="email" required placeholder="kamola@learnity.org" class="w-full px-3 py-2 rounded-xl bg-[#07090e] border border-white/10 text-white" />
                    </div>
                    <div class="grid grid-cols-2 gap-2">
                        <div>
                            <label class="block text-slate-300 mb-1">Password</label>
                            <input id="new-user-pass" type="password" required minlength="8" autocomplete="new-password" class="w-full px-3 py-2 rounded-xl bg-[#07090e] border border-white/10 text-white" />
                        </div>
                        <div>
                            <label class="block text-slate-300 mb-1">Role</label>
                            <select id="new-user-role" class="w-full px-3 py-2 rounded-xl bg-[#07090e] border border-white/10 text-white">
                                <option value="MEMBER">MEMBER</option>
                                <option value="STAFF">STAFF</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label class="block text-slate-300 mb-1">Assign Subjects</label>
                        <div class="grid grid-cols-2 gap-1.5">
                            ${subjects.map(
                                (s) => view`
                                <label class="flex items-center gap-1.5 p-2 rounded-lg bg-[#07090e] border border-white/10">
                                    <input type="checkbox" name="new_user_subj" value="${Number(s.id)}" class="accent-indigo-500" />
                                    <span class="truncate">${s.name}</span>
                                </label>
                            `,
                            )}
                        </div>
                    </div>
                    <label class="flex items-center gap-2 p-2.5 rounded-xl bg-[#07090e] border border-white/10 text-slate-200">
                        <input type="checkbox" id="new-user-gencodes" class="accent-indigo-500" />
                        <span>Allow user to generate delegated invitation codes</span>
                    </label>
                    <button type="submit" class="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold">Create Account</button>
                </form>
            </div>

            <div class="lg:col-span-8 surface-card rounded-2xl p-6 space-y-4">
                <div class="flex items-center justify-between">
                    <div>
                        <h3 class="font-display text-lg font-bold text-white">Granular Account & Subject Permissions Matrix</h3>
                        <p class="text-xs text-slate-400">Assign subjects, toggle invitation code generation rights, or disable accounts.</p>
                    </div>
                </div>
                <div class="space-y-3">
                    ${users.map((u) => {
                        const assignedNames = (u.subjectPermissions || [])
                            .filter((p) => p.can_access_subject)
                            .map((p) => p.subject_name);
                        return view`
                            <div class="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                                <div class="space-y-1">
                                    <div class="flex flex-wrap items-center gap-2">
                                        <span class="font-display font-bold text-white text-sm">${u.full_name}</span>
                                        <span class="px-2 py-0.5 rounded font-mono text-[10px] ${u.role === 'OWNER' ? 'badge-role-owner' : u.role === 'STAFF' ? 'badge-role-staff' : 'badge-role-member'}">${u.role}</span>
                                        <span class="px-2 py-0.5 rounded font-mono text-[10px] ${u.status === 'active' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}">${u.status}</span>
                                    </div>
                                    <div class="text-slate-400">${u.email}</div>
                                    <div class="text-indigo-300">Assigned Subjects: <strong>${u.role === 'OWNER' ? 'All Subjects (Owner Authority)' : assignedNames.join(', ') || 'None assigned'}</strong></div>
                                </div>
                                ${
                                    u.role !== 'OWNER'
                                        ? view`
                                    <div class="flex flex-wrap items-center gap-2 shrink-0">
                                        <button onclick=${() => openEditUserPermissionsModal(Number(u.id))} class="px-3 py-1.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 text-indigo-200 font-semibold">Edit Subject Permissions</button>
                                        <button onclick=${() => toggleUserAccountStatus(Number(u.id), u.status === 'active' ? 'disabled' : 'active')}
                                                class="px-3 py-1.5 rounded-xl ${u.status === 'active' ? 'bg-rose-500/20 text-rose-200' : 'bg-emerald-500/20 text-emerald-200'} font-semibold">
                                            ${u.status === 'active' ? 'Disable Account' : 'Re-enable'}
                                        </button>
                                    </div>
                                `
                                        : view`<span class="text-amber-400 font-mono text-[11px]">Protected Owner</span>`
                                }
                            </div>
                        `;
                    })}
                </div>
            </div>
        </div>
    `;
}

async function handleOwnerCreateUser(e) {
    e.preventDefault();
    const subjectIds = $$('input[name="new_user_subj"]:checked').map((el) => Number(el.value));
    const payload = {
        full_name: $('#new-user-name').value.trim(),
        email: $('#new-user-email').value.trim(),
        password: $('#new-user-pass').value,
        role: $('#new-user-role').value,
        subject_ids: subjectIds,
        can_generate_codes: Boolean($('#new-user-gencodes')?.checked),
    };
    try {
        await apiRequest('/api/owner/users', { method: 'POST', body: JSON.stringify(payload) });
        notifyToast(`Created account for ${payload.full_name}.`);
        await openOwnerSection('members');
    } catch (err) {
        notifyToast(err.message, 'error');
    }
}

async function toggleUserAccountStatus(userId, nextStatus) {
    try {
        await apiRequest(`/api/owner/users/${userId}`, {
            method: 'PUT',
            body: JSON.stringify({ status: nextStatus }),
        });
        notifyToast(`User status updated to ${nextStatus}.`);
        await openOwnerSection('members');
    } catch (err) {
        notifyToast(err.message, 'error');
    }
}

function openEditUserPermissionsModal(userId) {
    if (!cachedOwnerOverview) return;
    const user = (cachedOwnerOverview.users || []).find((u) => u.id === userId);
    const subjects = cachedOwnerOverview.subjects || [];
    if (!user) return;
    const permMap = {};
    (user.subjectPermissions || []).forEach((p) => {
        permMap[p.subject_id] = p;
    });

    const body = $('#ecosystem-modal-body');
    renderInto(
        body,
        view`
        <div class="space-y-4">
            <div class="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                    <span class="text-[11px] font-mono uppercase text-indigo-400">Granular Subject Matrix</span>
                    <h3 class="font-display text-lg font-bold text-white">Permissions for ${user.full_name}</h3>
                </div>
                <button onclick=${() => closeEcosystemModal()} class="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white"><i data-lucide="x" class="w-4 h-4"></i></button>
            </div>
            <form onsubmit=${(event) => saveUserPermissionsModal(event, Number(user.id))} class="space-y-3 text-xs">
                <label class="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.04] border border-white/10">
                    <input type="checkbox" id="edit-usr-gencodes" checked=${Boolean(user.can_generate_codes)} class="accent-indigo-500" />
                    <span>Can generate delegated invitation codes</span>
                </label>
                <div class="space-y-2 max-h-72 overflow-y-auto pr-1">
                    ${subjects.map((s) => {
                        const p = permMap[s.id] || {};
                        return view`
                            <div class="p-3 rounded-xl bg-[#07090e] border border-white/10 space-y-2" data-subj-perm-row="${Number(s.id)}">
                                <div class="flex items-center justify-between">
                                    <label class="font-bold text-white flex items-center gap-2">
                                        <input type="checkbox" class="sp-access accent-emerald-500" checked=${Boolean(p.can_access_subject)} />
                                        <span>${s.name}</span>
                                    </label>
                                    <span class="text-[10px] font-mono text-slate-500">/subjects/${s.slug}</span>
                                </div>
                                <div class="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[11px] text-slate-300 pl-5">
                                    <label class="flex items-center gap-1"><input type="checkbox" class="sp-upload accent-indigo-500" checked=${Boolean(p.can_upload_materials)} /><span>Upload Docs</span></label>
                                    <label class="flex items-center gap-1"><input type="checkbox" class="sp-publish accent-indigo-500" checked=${Boolean(p.can_publish_materials)} /><span>Direct Publish</span></label>
                                    <label class="flex items-center gap-1"><input type="checkbox" class="sp-links accent-indigo-500" checked=${Boolean(p.can_create_links)} /><span>Add Links</span></label>
                                    <label class="flex items-center gap-1"><input type="checkbox" class="sp-videos accent-indigo-500" checked=${Boolean(p.can_upload_videos)} /><span>Add Videos</span></label>
                                    <label class="flex items-center gap-1"><input type="checkbox" class="sp-mod accent-indigo-500" checked=${Boolean(p.can_moderate)} /><span>Moderate</span></label>
                                </div>
                            </div>
                        `;
                    })}
                </div>
                <button type="submit" class="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold">Save Granular Permissions</button>
            </form>
        </div>
    `,
    );
    $('#ecosystem-modal').classList.remove('hidden');
    refreshIcons();
}

async function saveUserPermissionsModal(e, userId) {
    e.preventDefault();
    const rows = $$('[data-subj-perm-row]');
    const subject_permissions = [];
    rows.forEach((r) => {
        const sid = Number(r.dataset.subjPermRow);
        const access = r.querySelector('.sp-access')?.checked;
        if (access) {
            subject_permissions.push({
                subject_id: sid,
                can_access_subject: true,
                can_view_materials: true,
                can_upload_materials: Boolean(r.querySelector('.sp-upload')?.checked),
                can_publish_materials: Boolean(r.querySelector('.sp-publish')?.checked),
                can_create_links: Boolean(r.querySelector('.sp-links')?.checked),
                can_upload_videos: Boolean(r.querySelector('.sp-videos')?.checked),
                can_moderate: Boolean(r.querySelector('.sp-mod')?.checked),
            });
        }
    });
    try {
        await apiRequest(`/api/owner/users/${userId}`, {
            method: 'PUT',
            body: JSON.stringify({
                can_generate_codes: Boolean($('#edit-usr-gencodes')?.checked),
                subject_permissions,
            }),
        });
        closeEcosystemModal();
        notifyToast('Subject permissions updated.');
        await openOwnerSection('members');
    } catch (err) {
        notifyToast(err.message, 'error');
    }
}

function buildOwnerStaffSection(staffList = [], subjects = []) {
    return view`
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div class="lg:col-span-4 surface-card rounded-2xl p-6 space-y-4">
                <h3 class="font-display text-lg font-bold text-white">Add Staff Member (Photo & Info)</h3>
                <form onsubmit=${handleOwnerAddStaff} class="space-y-3 text-xs">
                    <div><label class="block text-slate-300 mb-1">Full Name</label><input id="stf-name" type="text" required placeholder="e.g. Dr. Alisherbek Karimov" class="w-full px-3 py-2 rounded-xl bg-[#07090e] border border-white/10 text-white" /></div>
                    <div><label class="block text-slate-300 mb-1">Position / Title</label><input id="stf-pos" type="text" required placeholder="e.g. Lead Physics Mentor" class="w-full px-3 py-2 rounded-xl bg-[#07090e] border border-white/10 text-white" /></div>
                    <div><label class="block text-slate-300 mb-1">Department</label><input id="stf-dept" type="text" value="Academic Mentorship" class="w-full px-3 py-2 rounded-xl bg-[#07090e] border border-white/10 text-white" /></div>
                    <div class="space-y-1.5">
                        <label class="block text-slate-300">Staff Photograph (Upload File or Paste URL)</label>
                        <div class="flex items-center gap-2">
                            <button type="button" onclick=${() => document.getElementById('stf-photo-file').click()} class="px-3 py-2 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 text-indigo-200 font-semibold flex items-center gap-1.5 shrink-0">
                                <i data-lucide="upload" class="w-3.5 h-3.5"></i>
                                <span>Rasm Yuklash</span>
                            </button>
                            <input id="stf-photo" type="text" placeholder="Or paste image URL..." value="assets/photos/1534528741775-53994a69daeb.webp" class="w-full px-3 py-2 rounded-xl bg-[#07090e] border border-white/10 text-white" />
                        </div>
                        <input id="stf-photo-file" type="file" accept="image/*" class="hidden" onchange=${handleStaffPhotoFileSelect} />
                    </div>
                    <div><label class="block text-slate-300 mb-1">Assigned Subjects</label><input id="stf-subjs-label" type="text" placeholder="e.g. Computer Science, Mathematics" class="w-full px-3 py-2 rounded-xl bg-[#07090e] border border-white/10 text-white" /></div>
                    <div><label class="block text-slate-300 mb-1">Focus / Responsibilities</label><input id="stf-resp" type="text" placeholder="e.g. Lab protocols, 1-on-1 clinics" class="w-full px-3 py-2 rounded-xl bg-[#07090e] border border-white/10 text-white" /></div>
                    <div><label class="block text-slate-300 mb-1">Biography & Information</label><textarea id="stf-bio" rows="3" required placeholder="Short biography and academic background..." class="w-full px-3 py-2 rounded-xl bg-[#07090e] border border-white/10 text-white"></textarea></div>
                    <button type="submit" class="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold">Add to Staff Directory</button>
                </form>
            </div>
            <div class="lg:col-span-8 surface-card rounded-2xl p-6 space-y-4">
                <div class="flex items-center justify-between">
                    <div>
                        <h3 class="font-display text-lg font-bold text-white">Public Staff Directory Management</h3>
                        <p class="text-xs text-slate-400">Edit staff names, positions, photos, and bios directly — changes appear on the public website immediately.</p>
                    </div>
                </div>
                <div class="space-y-4">
                    ${staffList.map(
                        (st) => view`
                        <div class="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-3 text-xs">
                            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div class="flex items-center gap-3">
                                    <div class="relative group shrink-0">
                                        <img src="${st.photo_url}" alt="${st.full_name}" class="w-16 h-16 rounded-xl object-cover border border-white/10" />
                                        <button type="button" onclick=${() => document.getElementById(`stf-replace-${Number(st.id)}`).click()} class="absolute inset-0 rounded-xl bg-black/70 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] text-white font-semibold transition">Rasm</button>
                                        <input id="stf-replace-${Number(st.id)}" type="file" accept="image/*" class="hidden" onchange=${(event) => replaceExistingStaffPhoto(event, Number(st.id))} />
                                    </div>
                                    <div class="space-y-1">
                                        <input type="text" value="${st.full_name}" onchange=${(event) => updateStaffMemberField(Number(st.id), 'full_name', event.currentTarget.value)} aria-label="Staff name" class="px-2.5 py-1 rounded-lg bg-[#07090e] border border-white/10 text-white font-bold text-sm" />
                                        <div class="flex flex-wrap gap-1.5">
                                            <input type="text" value="${st.position}" onchange=${(event) => updateStaffMemberField(Number(st.id), 'position', event.currentTarget.value)} aria-label="Staff position" class="px-2 py-1 rounded-lg bg-[#07090e] border border-white/10 text-amber-300 text-xs" placeholder="Position" />
                                            <input type="text" value="${st.assigned_subjects_label || ''}" onchange=${(event) => updateStaffMemberField(Number(st.id), 'assigned_subjects_label', event.currentTarget.value)} aria-label="Assigned subjects" class="px-2 py-1 rounded-lg bg-[#07090e] border border-white/10 text-indigo-300 text-xs" placeholder="Subjects" />
                                        </div>
                                    </div>
                                </div>
                                <div class="flex items-center gap-2 shrink-0">
                                    <button onclick=${() => document.getElementById(`stf-replace-${Number(st.id)}`).click()} class="px-2.5 py-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-200 font-semibold">Upload Photo</button>
                                    <button onclick=${() => toggleStaffVisibility(Number(st.id), !st.is_visible)} class="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200">${st.is_visible ? 'Hide' : 'Show'}</button>
                                    <button onclick=${() => deleteStaffMember(Number(st.id))} class="px-2.5 py-1.5 rounded-lg bg-rose-500/20 text-rose-300">Remove</button>
                                </div>
                            </div>
                            <textarea rows="2" onchange=${(event) => updateStaffMemberField(Number(st.id), 'bio', event.currentTarget.value)} aria-label="Staff biography" class="w-full px-2.5 py-1.5 rounded-lg bg-[#07090e] border border-white/10 text-slate-300">${st.bio || ''}</textarea>
                        </div>
                    `,
                    )}
                </div>
            </div>
        </div>
    `;
}

async function handleStaffPhotoFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
        const url = await uploadImage(file);
        const input = $('#stf-photo');
        if (input) {
            if (isPreview) {
                input.dataset.uploadSource = url;
                input.value = file.name;
                input.addEventListener('input', () => delete input.dataset.uploadSource, { once: true });
            } else input.value = url;
        }
        notifyToast('Staff photo uploaded.');
    } catch (err) {
        notifyToast(err.message, 'error');
    }
    e.target.value = '';
}

async function replaceExistingStaffPhoto(e, staffId) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
        const url = await uploadImage(file);
        await apiRequest(`/api/owner/staff/${staffId}`, {
            method: 'PUT',
            body: JSON.stringify({ photo_url: url }),
        });
        notifyToast('Staff photo updated.');
        await renderPublicStaffDirectory();
        await openOwnerSection('staff');
    } catch (err) {
        notifyToast(err.message, 'error');
    }
    e.target.value = '';
}

async function updateStaffMemberField(staffId, field, value) {
    try {
        await apiRequest(`/api/owner/staff/${staffId}`, {
            method: 'PUT',
            body: JSON.stringify({ [field]: String(value).trim() }),
        });
        notifyToast('Staff info saved.');
        await renderPublicStaffDirectory();
    } catch (err) {
        notifyToast(err.message, 'error');
    }
}

async function handleOwnerAddStaff(e) {
    e.preventDefault();
    try {
        await apiRequest('/api/owner/staff', {
            method: 'POST',
            body: JSON.stringify({
                full_name: $('#stf-name').value.trim(),
                position: $('#stf-pos').value.trim(),
                department: $('#stf-dept').value.trim(),
                photo_url: $('#stf-photo').dataset.uploadSource || $('#stf-photo').value.trim(),
                assigned_subjects_label: $('#stf-subjs-label').value.trim(),
                responsibilities: ($('#stf-resp')?.value || '').trim(),
                bio: $('#stf-bio').value.trim(),
            }),
        });
        notifyToast('Staff member added.');
        await renderPublicStaffDirectory();
        await openOwnerSection('staff');
    } catch (err) {
        notifyToast(err.message, 'error');
    }
}

async function toggleStaffVisibility(id, visible) {
    await apiRequest(`/api/owner/staff/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ is_visible: visible }),
    });
    await renderPublicStaffDirectory();
    await openOwnerSection('staff');
}

async function deleteStaffMember(id) {
    await apiRequest(`/api/owner/staff/${id}`, { method: 'DELETE' });
    await renderPublicStaffDirectory();
    await openOwnerSection('staff');
}

function buildOwnerSubjectsSection(subjects = []) {
    return view`
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div class="lg:col-span-4 surface-card rounded-2xl p-6 space-y-4">
                <h3 class="font-display text-lg font-bold text-white">Create New Subject Hub</h3>
                <form onsubmit=${handleOwnerCreateSubject} class="space-y-3 text-xs">
                    <div><label class="block text-slate-300 mb-1">Subject Name</label><input id="subj-new-name" type="text" required placeholder="e.g. Data Science & AI" class="w-full px-3 py-2 rounded-xl bg-[#07090e] border border-white/10 text-white" /></div>
                    <div><label class="block text-slate-300 mb-1">Category</label><input id="subj-new-cat" type="text" value="Advanced Track" class="w-full px-3 py-2 rounded-xl bg-[#07090e] border border-white/10 text-white" /></div>
                    <div><label class="block text-slate-300 mb-1">Lead Instructor</label><input id="subj-new-inst" type="text" value="Learnity Academic Team" class="w-full px-3 py-2 rounded-xl bg-[#07090e] border border-white/10 text-white" /></div>
                    <div><label class="block text-slate-300 mb-1">Description</label><textarea id="subj-new-desc" rows="3" required placeholder="Overview of workshops and lab resources..." class="w-full px-3 py-2 rounded-xl bg-[#07090e] border border-white/10 text-white"></textarea></div>
                    <button type="submit" class="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold">Create Subject Hub</button>
                </form>
            </div>
            <div class="lg:col-span-8 surface-card rounded-2xl p-6 space-y-4">
                <h3 class="font-display text-lg font-bold text-white">Active Subject Learning Hubs</h3>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    ${subjects.map(
                        (s) => view`
                        <div class="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col justify-between gap-3 text-xs">
                            <div>
                                <div class="flex items-center justify-between">
                                    <span class="font-display font-bold text-white text-base">${s.name}</span>
                                    <span class="font-mono text-[10px] text-indigo-300">/subjects/${s.slug}</span>
                                </div>
                                <p class="text-slate-400 mt-1">${s.short_description}</p>
                            </div>
                            <div class="flex items-center justify-between pt-2 border-t border-white/5">
                                <button onclick=${() => openSubjectHub(s.slug)} class="text-indigo-300 hover:text-white font-semibold">Open Hub →</button>
                                <button onclick=${() => deleteSubjectHub(Number(s.id))} class="text-rose-300 hover:text-rose-200">Delete</button>
                            </div>
                        </div>
                    `,
                    )}
                </div>
            </div>
        </div>
    `;
}

async function handleOwnerCreateSubject(e) {
    e.preventDefault();
    try {
        await apiRequest('/api/subjects', {
            method: 'POST',
            body: JSON.stringify({
                name: $('#subj-new-name').value.trim(),
                category: $('#subj-new-cat').value.trim(),
                lead_instructor: $('#subj-new-inst').value.trim(),
                short_description: $('#subj-new-desc').value.trim(),
            }),
        });
        notifyToast('Subject hub created!');
        await renderPublicSubjectsGrid();
        await openOwnerSection('subjects');
    } catch (err) {
        notifyToast(err.message, 'error');
    }
}

async function deleteSubjectHub(id) {
    await apiRequest(`/api/subjects/${id}`, { method: 'DELETE' });
    await renderPublicSubjectsGrid();
    await openOwnerSection('subjects');
}

function buildOwnerResourcesSection(resources = [], subjects = []) {
    return view`
        <div class="surface-card rounded-2xl p-6 space-y-5">
            <div class="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h3 class="font-display text-xl font-bold text-white">Educational Materials & Moderation Queue</h3>
                    <p class="text-xs text-slate-400">Workflow: Pending Review → Approved → Published across all Subject Hubs.</p>
                </div>
                <button onclick=${() => openResourceModal()} class="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5">
                    <i data-lucide="plus" class="w-4 h-4"></i>
                    <span>Add Resource / Upload Document</span>
                </button>
            </div>
            <div class="space-y-3">
                ${resources.map(
                    (r) => view`
                    <div class="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                        <div class="space-y-1">
                            <div class="flex flex-wrap items-center gap-2">
                                <span class="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono uppercase text-[10px]">${r.resource_type}</span>
                                <span class="font-semibold text-amber-300">${r.subject_name}</span>
                                <span class="px-2 py-0.5 rounded font-mono text-[10px] ${r.moderation_status === 'Published' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}">${r.moderation_status}</span>
                            </div>
                            <div class="font-display font-bold text-white text-sm">${r.title}</div>
                            <div class="text-slate-400">${r.description}</div>
                            <div class="text-[11px] text-slate-500">By ${r.author_name} · ${r.duration_or_size || ''}</div>
                        </div>
                        <div class="flex flex-wrap items-center gap-2 shrink-0">
                            <button onclick=${() => moderateResource(Number(r.id), 'Published')} class="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold">Publish</button>
                            <button onclick=${() => moderateResource(Number(r.id), 'Pending Review')} class="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-200 font-semibold">Hold Review</button>
                            <button onclick=${() => deleteResourceItem(Number(r.id))} class="px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-200 font-semibold">Delete</button>
                        </div>
                    </div>
                `,
                )}
            </div>
        </div>
    `;
}

function buildOwnerMediaLibrary() {
    return view`
        <div class="surface-card rounded-2xl p-6 space-y-6">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
                <div>
                    <span class="text-[11px] font-mono uppercase text-amber-400">Persistent Owner Media Library</span>
                    <h3 class="font-display text-xl font-bold text-white">Upload 10 Photos Today, 30 Next Month, 100 Next Year</h3>
                    <p class="text-xs text-slate-400">Manage all classroom photographs, captions, categories, crop/zoom framing, visibility, and archive status without touching code.</p>
                </div>
                <div class="flex flex-wrap items-center gap-2.5">
                    <button onclick=${() => document.getElementById('owner-multi-photo-input').click()} class="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-orange-500 hover:from-indigo-500 hover:to-orange-400 text-white text-xs font-semibold flex items-center gap-2 shadow-lg">
                        <i data-lucide="images" class="w-4 h-4"></i>
                        <span>Upload Multiple Photographs</span>
                    </button>
                    <input id="owner-multi-photo-input" type="file" accept="image/*" multiple class="hidden" onchange=${handleMultiPhotoUpload} />
                    <button onclick=${() => {
                        addNewLessonPhotoCard();
                        openOwnerSection('media');
                    }} class="px-3.5 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs font-semibold text-white">
                        + New Gallery Card
                    </button>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                ${lessonCards.map(
                    (c, idx) => view`
                    <div class="p-4 rounded-2xl bg-[#07090e] border ${c.is_archived ? 'border-rose-500/30 opacity-60' : 'border-white/10'} space-y-3 flex flex-col justify-between">
                        <div class="space-y-3">
                            <div class="relative h-44 rounded-xl overflow-hidden bg-slate-950">
                                <img src="${c.imageSrc}" alt="${c.title}"
                                     class="w-full h-full object-cover"
                                     style=${photoStyle(c)} />
                                <div class="absolute top-2 left-2 right-2 flex items-center justify-between text-[10px] font-mono">
                                    <span class="px-2 py-0.5 rounded bg-black/75 text-white">${c.category}</span>
                                    <span class="px-2 py-0.5 rounded ${c.is_archived ? 'bg-rose-500/80 text-white' : c.is_visible === false ? 'bg-amber-500/80 text-slate-950' : 'bg-emerald-500/80 text-slate-950'}">
                                        ${c.is_archived ? 'Archived' : c.is_visible === false ? 'Hidden' : 'Published'}
                                    </span>
                                </div>
                            </div>
                            <div class="space-y-2 text-xs">
                                <input type="text" value="${c.title}" onchange=${(event) => updateMediaCardProp(c.id, 'title', event.currentTarget.value)} aria-label="Photo title" class="w-full px-2.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/10 text-white font-semibold" placeholder="Title" />
                                <div class="grid grid-cols-2 gap-2">
                                    <input type="text" value="${c.category}" onchange=${(event) => updateMediaCardProp(c.id, 'category', event.currentTarget.value)} aria-label="Photo category" class="px-2.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/10 text-slate-300" placeholder="Category" />
                                    <input type="text" value="${c.date}" onchange=${(event) => updateMediaCardProp(c.id, 'date', event.currentTarget.value)} aria-label="Photo caption date" class="px-2.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/10 text-slate-300" placeholder="Week / Date" />
                                </div>
                                <textarea rows="2" onchange=${(event) => updateMediaCardProp(c.id, 'description', event.currentTarget.value)} aria-label="Photo description" class="w-full px-2.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/10 text-slate-400">${c.description}</textarea>
                            </div>
                        </div>
                        <div class="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-1.5 text-[11px]">
                            <div class="flex items-center gap-1">
                                <button onclick=${() => {
                                    moveLessonCard(idx, -1);
                                    openOwnerSection('media');
                                }} class="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-slate-300">←</button>
                                <button onclick=${() => {
                                    moveLessonCard(idx, 1);
                                    openOwnerSection('media');
                                }} class="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-slate-300">→</button>
                                <button onclick=${() => toggleMediaCardHide(c.id)} class="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-slate-300">${c.is_visible === false ? 'Show' : 'Hide'}</button>
                            </div>
                            <div class="flex items-center gap-1">
                                <button onclick=${() => toggleMediaCardArchive(c.id)} class="px-2 py-1 rounded bg-amber-500/20 text-amber-200">${c.is_archived ? 'Restore' : 'Archive'}</button>
                                <button onclick=${() => deleteMediaCardPermanent(c.id)} class="px-2 py-1 rounded bg-rose-500/20 text-rose-300">Delete</button>
                            </div>
                        </div>
                    </div>
                `,
                )}
            </div>
        </div>
    `;
}

async function handleMultiPhotoUpload(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    let succeeded = 0;
    for (const file of files) {
        try {
            const url = await uploadImage(file);
            succeeded++;
            lessonCards.unshift({
                id: 'lesson-' + Date.now() + '-' + Math.random().toString(36).slice(2, 5),
                category: 'Live Workshop',
                date: 'New Upload · Cohort Archive',
                title: file.name.replace(/\.[^.]+$/, ''),
                description: 'Uploaded via Owner Media Library.',
                imageSrc: url,
                posX: 50,
                posY: 50,
                scale: 1,
                is_visible: true,
                is_archived: false,
            });
        } catch (err) {
            notifyToast(err.message, 'error');
        }
    }
    renderLessonGallery();
    queueContentSave();
    if (activeEcosystemView === 'owner' && activeOwnerTab === 'media') {
        await openOwnerSection('media');
    }
    notifyToast(`Uploaded ${succeeded} of ${files.length} photograph(s).`);
    e.target.value = '';
}

function updateMediaCardProp(cardId, prop, val) {
    const card = lessonCards.find((c) => c.id === cardId);
    if (!card) return;
    if (!['title', 'description', 'date', 'category'].includes(prop)) return;
    card[prop] = String(val)
        .trim()
        .slice(0, prop === 'description' ? 4000 : 160);
    renderLessonGallery();
    queueContentSave();
    notifyToast('Gallery card updated.');
}

function toggleMediaCardHide(cardId) {
    const card = lessonCards.find((c) => c.id === cardId);
    if (!card) return;
    card.is_visible = card.is_visible === false ? true : false;
    renderLessonGallery();
    queueContentSave();
    openOwnerSection('media');
}

function toggleMediaCardArchive(cardId) {
    const card = lessonCards.find((c) => c.id === cardId);
    if (!card) return;
    card.is_archived = !card.is_archived;
    renderLessonGallery();
    queueContentSave();
    openOwnerSection('media');
}

function deleteMediaCardPermanent(cardId) {
    if (!adminAuthenticated) return;
    removedCardKeys.add(cardId);
    lessonCards = lessonCards.filter((c) => c.id !== cardId);
    renderLessonGallery();
    queueContentSave();
    openOwnerSection('media');
    notifyToast('Photograph deleted from library.');
}

function buildOwnerAnnouncementsSection(announcements = [], subjects = []) {
    return view`
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div class="lg:col-span-4 surface-card rounded-2xl p-6 space-y-4">
                <h3 class="font-display text-lg font-bold text-white">Publish Announcement</h3>
                <form onsubmit=${handleCreateAnnouncement} class="space-y-3 text-xs">
                    <div><label class="block text-slate-300 mb-1">Title</label><input id="ann-title" type="text" required placeholder="Live Workshop Update..." class="w-full px-3 py-2 rounded-xl bg-[#07090e] border border-white/10 text-white" /></div>
                    <div class="grid grid-cols-2 gap-2">
                        <div>
                            <label class="block text-slate-300 mb-1">Scope / Subject</label>
                            <select id="ann-subject" class="w-full px-3 py-2 rounded-xl bg-[#07090e] border border-white/10 text-white">
                                <option value="">Platform-Wide (All)</option>
                                ${subjects.map((s) => view`<option value="${Number(s.id)}">${s.name}</option>`)}
                            </select>
                        </div>
                        <div>
                            <label class="block text-slate-300 mb-1">Priority</label>
                            <select id="ann-priority" class="w-full px-3 py-2 rounded-xl bg-[#07090e] border border-white/10 text-white">
                                <option value="normal">Normal</option>
                                <option value="important">Important</option>
                                <option value="urgent">Urgent</option>
                            </select>
                        </div>
                    </div>
                    <div><label class="block text-slate-300 mb-1">Message Body</label><textarea id="ann-body" rows="3" required class="w-full px-3 py-2 rounded-xl bg-[#07090e] border border-white/10 text-white"></textarea></div>
                    <button type="submit" class="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold">Publish Announcement</button>
                </form>
            </div>
            <div class="lg:col-span-8 surface-card rounded-2xl p-6 space-y-4">
                <h3 class="font-display text-lg font-bold text-white">Published Announcements</h3>
                <div class="space-y-3">
                    ${announcements.map(
                        (a) => view`
                        <div class="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex items-start justify-between gap-4 text-xs">
                            <div class="space-y-1">
                                <div class="flex items-center gap-2">
                                    <span class="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono uppercase text-[10px]">${a.priority}</span>
                                    <span class="text-indigo-300 font-semibold">${a.subject_name || 'Platform-Wide'}</span>
                                </div>
                                <div class="font-bold text-white text-sm">${a.title}</div>
                                <p class="text-slate-300">${a.body}</p>
                            </div>
                            <button onclick=${() => deleteAnnouncementItem(Number(a.id))} class="text-rose-300 hover:text-rose-200">Delete</button>
                        </div>
                    `,
                    )}
                </div>
            </div>
        </div>
    `;
}

async function handleCreateAnnouncement(e) {
    e.preventDefault();
    try {
        await apiRequest('/api/announcements', {
            method: 'POST',
            body: JSON.stringify({
                title: $('#ann-title').value.trim(),
                subject_id: $('#ann-subject').value || null,
                priority: $('#ann-priority').value,
                body: $('#ann-body').value.trim(),
            }),
        });
        notifyToast('Announcement published.');
        await openOwnerSection('announcements');
    } catch (err) {
        notifyToast(err.message, 'error');
    }
}

async function deleteAnnouncementItem(id) {
    await apiRequest(`/api/announcements/${id}`, { method: 'DELETE' });
    await openOwnerSection('announcements');
}

function buildOwnerSettingsSection(templates = []) {
    const tpl = templates[0] || {
        template_key: 'application_received_owner',
        subject: '[Learnity] New Application',
        body: '',
    };
    return view`
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div class="lg:col-span-6 surface-card rounded-2xl p-6 space-y-4">
                <h3 class="font-display text-lg font-bold text-white">Configurable Email Notification Templates</h3>
                <p class="text-xs text-slate-400">Uses <code class="text-indigo-300">OWNER_EMAIL</code> and <code class="text-indigo-300">SMTP_HOST</code> / <code class="text-indigo-300">RESEND_API_KEY</code> in <code class="text-indigo-300">.env</code>.</p>
                <form onsubmit=${handleSaveEmailTemplate} class="space-y-3 text-xs">
                    <input type="hidden" id="tpl-key" value="${tpl.template_key || 'application_received_owner'}" />
                    <div><label class="block text-slate-300 mb-1">Email Subject Line</label><input id="tpl-subject" type="text" value="${tpl.subject}" class="w-full px-3 py-2 rounded-xl bg-[#07090e] border border-white/10 text-white" /></div>
                    <div><label class="block text-slate-300 mb-1">Template Body (Supports {{full_name}}, {{requested_role}}, {{application_uid}})</label><textarea id="tpl-body" rows="6" class="w-full px-3 py-2 rounded-xl bg-[#07090e] border border-white/10 text-white font-mono">${tpl.body}</textarea></div>
                    <button type="submit" class="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold">Save Notification Template</button>
                </form>
            </div>
            <div class="lg:col-span-6 surface-card rounded-2xl p-6 space-y-4 text-xs">
                <h3 class="font-display text-lg font-bold text-white">Security & Environment Configuration</h3>
                <div class="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-2 text-slate-300">
                    <div>✓ <strong>Owner Separation:</strong> Owner credentials are stored separately from invitation codes. A member invitation code can never grant Owner privileges.</div>

                    <div>✓ <strong>Persistent SQLite Storage:</strong> Database (<code class="text-indigo-300">data/learnity.sqlite</code>) and media uploads (<code class="text-indigo-300">data/uploads/</code>) survive server restarts.</div>
                </div>
                <button onclick=${() => triggerDatabaseBackup()} class="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold">Run On-Demand SQLite Database Backup Now</button>
            </div>
        </div>
    `;
}

async function handleSaveEmailTemplate(e) {
    e.preventDefault();
    try {
        await apiRequest('/api/owner/notification-templates', {
            method: 'PUT',
            body: JSON.stringify({
                template_key: $('#tpl-key').value,
                subject: $('#tpl-subject').value,
                body: $('#tpl-body').value,
            }),
        });
        notifyToast('Email notification template saved.');
    } catch (err) {
        notifyToast(err.message, 'error');
    }
}

async function triggerDatabaseBackup() {
    try {
        const res = await apiRequest('/api/owner/backup', { method: 'POST', body: JSON.stringify({}) });
        notifyToast(`Database backup created: ${res.backupFile}`);
    } catch (err) {
        notifyToast(err.message, 'error');
    }
}

// =========================================================
// STAFF WORKSPACE & MEMBER PORTAL RENDERERS + MODALS
// =========================================================
async function renderStaffWorkspace() {
    const container = $('#staff-workspace-body');
    if (!container) return;
    try {
        const data = await apiRequest('/api/staff/workspace');
        const user = data.user || currentUser;
        const assigned = data.assignedSubjects || [];
        const resources = data.resources || [];
        $('#staff-workspace-title').textContent = `${user.full_name} — Staff Workspace`;

        renderInto(
            container,
            view`
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div class="lg:col-span-5 surface-card rounded-2xl p-6 space-y-4">
                    <h3 class="font-display text-lg font-bold text-white">Your Assigned Subject Hubs (${assigned.length})</h3>
                    <p class="text-xs text-slate-400">You have granular publishing & workspace permissions only for the subjects assigned below.</p>
                    <div class="space-y-3">
                        ${assigned.map(
                            (s) => view`
                            <div class="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between gap-3 text-xs">
                                <div>
                                    <div class="font-display font-bold text-white text-sm">${s.name}</div>
                                    <div class="text-slate-400">${s.schedule_label}</div>
                                </div>
                                <button onclick=${() => openSubjectHub(s.slug)} class="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold">Open Hub →</button>
                            </div>
                        `,
                        )}
                    </div>
                </div>

                <div class="lg:col-span-7 surface-card rounded-2xl p-6 space-y-4">
                    <div class="flex items-center justify-between">
                        <h3 class="font-display text-lg font-bold text-white">Materials in Your Assigned Subjects</h3>
                        <button onclick=${() => openResourceModal()} class="px-3 py-1.5 rounded-xl bg-indigo-500/20 text-indigo-200 text-xs font-semibold">+ Add Material</button>
                    </div>
                    <div class="space-y-3 max-h-96 overflow-y-auto pr-1">
                        ${resources.map(
                            (r) => view`
                            <div class="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between gap-3 text-xs">
                                <div>
                                    <div class="flex items-center gap-2">
                                        <span class="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono uppercase text-[10px]">${r.resource_type}</span>
                                        <span class="text-amber-300 font-semibold">${r.subject_name}</span>
                                        <span class="text-[10px] font-mono text-emerald-300">${r.moderation_status}</span>
                                    </div>
                                    <div class="font-bold text-white mt-0.5">${r.title}</div>
                                </div>
                                <button onclick=${() => deleteResourceItem(Number(r.id))} class="text-rose-300 hover:text-rose-200">Delete</button>
                            </div>
                        `,
                        )}
                    </div>
                </div>
            </div>
            ${
                user.can_generate_codes
                    ? view`
                <div class="pt-4">
                    ${buildInvitationGeneratorSection(assigned, [], true)}
                </div>
            `
                    : ''
            }
        `,
        );
        refreshIcons();
    } catch (err) {
        renderInto(
            container,
            view`<div class="surface-card rounded-2xl p-6 text-rose-300 text-sm">${err.message}</div>`,
        );
    }
}

async function renderMemberPortal() {
    const container = $('#member-portal-body');
    if (!container) return;
    try {
        const data = await apiRequest('/api/member/dashboard');
        const user = data.user || currentUser;
        const subjects = data.subjects || [];
        const accessibleSubjects = subjects.filter((s) => s.hasAccess);
        const lockedSubjects = subjects.filter((s) => !s.hasAccess);
        const recentResources = data.recentResources || [];
        const announcements = data.announcements || [];

        $('#member-portal-welcome').textContent = `Welcome back, ${user.full_name}`;

        renderInto(
            container,
            view`
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                <div class="lg:col-span-8 space-y-6">
                    <div class="surface-card rounded-2xl p-6 space-y-4">
                        <div class="flex items-center justify-between">
                            <div>
                                <h3 class="font-display text-lg font-bold text-white">Your Unlocked Subject Hubs (${accessibleSubjects.length})</h3>
                                <p class="text-xs text-slate-400">Click any unlocked subject to open video lessons, laboratory PDFs, and study materials.</p>
                            </div>
                            <span class="px-2.5 py-1 rounded-full badge-role-member font-mono text-[11px]">Active Membership</span>
                        </div>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            ${accessibleSubjects.map(
                                (s) => view`
                                <div class="p-4 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/30 flex flex-col justify-between gap-3">
                                    <div>
                                        <div class="flex items-center justify-between text-xs">
                                            <span class="font-mono text-emerald-300">● Unlocked Access</span>
                                            <span class="text-slate-400">${s.schedule_label}</span>
                                        </div>
                                        <h4 class="font-display text-lg font-bold text-white mt-1">${s.name}</h4>
                                        <p class="text-xs text-slate-300 mt-1">${s.short_description}</p>
                                    </div>
                                    <button onclick=${() => openSubjectHub(s.slug)} class="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold">Open ${s.name} Hub →</button>
                                </div>
                            `,
                            )}
                        </div>
                    </div>

                    
                    <div class="surface-card rounded-2xl p-6 space-y-4">
                        <h3 class="font-display text-lg font-bold text-white">Permitted Study Materials & Video Lessons</h3>
                        <div class="space-y-3">
                            ${recentResources.map(
                                (r) => view`
                                <div class="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                                    <div class="space-y-1">
                                        <div class="flex items-center gap-2">
                                            <span class="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono uppercase text-[10px]">${r.resource_type}</span>
                                            <span class="font-semibold text-amber-300">${r.subject_name}</span>
                                        </div>
                                        <div class="font-bold text-white text-sm">${r.title}</div>
                                        <div class="text-slate-400">${r.description}</div>
                                    </div>
                                    <a href="${r.file_url || r.external_url || '#'}" target="_blank" rel="noopener noreferrer" class="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shrink-0">Open Material</a>
                                </div>
                            `,
                            )}
                        </div>
                    </div>

                    
                    ${
                        lockedSubjects.length
                            ? view`
                        <div class="surface-card rounded-2xl p-6 space-y-3 opacity-80">
                            <h3 class="font-display text-base font-bold text-slate-300">Unassigned Subjects (Restricted)</h3>
                            <p class="text-xs text-slate-400">Your current account permissions do not include the subjects below. Redeem an additional invitation code or request subject access from the Owner.</p>
                            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                                ${lockedSubjects.map(
                                    (s) => view`
                                    <div class="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-slate-500 flex items-center justify-between">
                                        <span>${s.name}</span>
                                        <i data-lucide="lock" class="w-3.5 h-3.5"></i>
                                    </div>
                                `,
                                )}
                            </div>
                        </div>
                    `
                            : ''
                    }
                </div>

                
                <div class="lg:col-span-4 space-y-6">
                    <div class="surface-card rounded-2xl p-6 space-y-4">
                        <h3 class="font-display text-lg font-bold text-white">Your Member Profile</h3>
                        <form onsubmit=${handleUpdateMemberProfile} class="space-y-3 text-xs">
                            <div><label class="block text-slate-400 mb-1">Full Name</label><input id="mem-prof-name" type="text" value="${user.full_name}" class="w-full px-3 py-2 rounded-xl bg-[#07090e] border border-white/10 text-white" /></div>
                            <div><label class="block text-slate-400 mb-1">Phone / Telegram</label><input id="mem-prof-phone" type="text" value="${user.phone_or_telegram || ''}" class="w-full px-3 py-2 rounded-xl bg-[#07090e] border border-white/10 text-white" /></div>
                            <div><label class="block text-slate-400 mb-1">Learning Bio</label><textarea id="mem-prof-bio" rows="2" class="w-full px-3 py-2 rounded-xl bg-[#07090e] border border-white/10 text-white">${user.bio || ''}</textarea></div>
                            <button type="submit" class="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold">Save Profile</button>
                        </form>
                    </div>

                    <div class="surface-card rounded-2xl p-6 space-y-3">
                        <h3 class="font-display text-base font-bold text-white">Latest Announcements</h3>
                        ${announcements.map(
                            (a) => view`
                            <div class="p-3 rounded-xl bg-white/[0.03] border border-white/10 space-y-1 text-xs">
                                <div class="font-bold text-white">${a.title}</div>
                                <p class="text-slate-300">${a.body}</p>
                            </div>
                        `,
                        )}
                    </div>
                </div>
            </div>

            ${
                user.can_generate_codes
                    ? view`
                <div class="pt-4">
                    ${buildInvitationGeneratorSection(accessibleSubjects, [], true)}
                </div>
            `
                    : ''
            }
        `,
        );
        refreshIcons();
    } catch (err) {
        renderInto(
            container,
            view`<div class="surface-card rounded-2xl p-6 text-rose-300 text-sm">${err.message}</div>`,
        );
    }
}

async function handleUpdateMemberProfile(e) {
    e.preventDefault();
    try {
        const res = await apiRequest('/api/auth/profile', {
            method: 'PUT',
            body: JSON.stringify({
                full_name: $('#mem-prof-name').value.trim(),
                phone_or_telegram: $('#mem-prof-phone').value.trim(),
                bio: $('#mem-prof-bio').value.trim(),
            }),
        });
        currentUser = res.user;
        updateSessionUI();
        notifyToast('Profile updated.');
    } catch (err) {
        notifyToast(err.message, 'error');
    }
}

function openAuthModal(mode = 'login') {
    if (currentUser) {
        openActiveRoleWorkspace();
        return;
    }
    const body = $('#ecosystem-modal-body');
    if (!body) return;
    renderInto(
        body,
        view`
        <div class="space-y-5">
            <div class="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                    <span class="text-[11px] font-mono uppercase text-indigo-400">Role-Based Access Control</span>
                    <h3 class="font-display text-xl font-bold text-white">Sign In to Learnity Ecosystem</h3>
                </div>
                <button onclick=${() => closeEcosystemModal()} class="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white"><i data-lucide="x" class="w-4 h-4"></i></button>
            </div>
            <form onsubmit=${handleModalLogin} class="space-y-3.5 text-xs">
                <div>
                    <label class="block text-slate-300 mb-1">Email Address</label>
                    <input id="modal-login-email" type="email" required placeholder="you@learnity.org" class="w-full px-3.5 py-2.5 rounded-xl bg-[#07090e] border border-white/10 text-sm text-white placeholder-slate-500" />
                </div>
                <div>
                    <label class="block text-slate-300 mb-1">Password</label>
                    <input id="modal-login-password" type="password" required placeholder="••••••••" class="w-full px-3.5 py-2.5 rounded-xl bg-[#07090e] border border-white/10 text-sm text-white placeholder-slate-500" />
                </div>
                <button type="submit" class="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm">Sign In</button>
            </form>
        </div>
    `,
    );
    $('#ecosystem-modal').classList.remove('hidden');
    refreshIcons();
}

async function handleModalLogin(e) {
    e.preventDefault();
    try {
        const res = await apiRequest('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({
                email: $('#modal-login-email').value.trim(),
                password: $('#modal-login-password').value,
            }),
        });
        currentUser = res.user;
        csrfToken = res.csrfToken || '';
        adminAuthenticated = currentUser.role === 'OWNER';
        closeEcosystemModal();
        updateSessionUI();
        await renderPublicSubjectsGrid();
        await loadSiteContent();
        renderLessonGallery();
        notifyToast(`Welcome, ${currentUser.full_name} (${currentUser.role})!`);
        if (requestedSubject) {
            const slug = requestedSubject;
            requestedSubject = '';
            await openSubjectHub(slug);
        } else openActiveRoleWorkspace();
    } catch (err) {
        notifyToast(err.message, 'error');
    }
}

async function openResourceModal() {
    if (!currentUser) {
        openAuthModal('login');
        return;
    }
    let subjData;
    try {
        subjData = await apiRequest('/api/subjects');
    } catch (error) {
        notifyToast(error.message, 'error');
        return;
    }
    const allowedSubjects = (subjData.subjects || []).filter(
        (s) =>
            s.hasAccess &&
            (currentUser.role === 'OWNER' ||
                ['can_create_links', 'can_upload_materials', 'can_upload_videos'].some(
                    (flag) => currentUser.subjectPermMap[s.id]?.[flag],
                )),
    );
    if (!allowedSubjects.length) {
        notifyToast('You do not have upload permissions for any subject.');
        return;
    }
    const body = $('#ecosystem-modal-body');
    renderInto(
        body,
        view`
        <div class="space-y-4">
            <div class="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 class="font-display text-lg font-bold text-white">Contribute Educational Resource</h3>
                <button onclick=${() => closeEcosystemModal()} class="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white"><i data-lucide="x" class="w-4 h-4"></i></button>
            </div>
            <form onsubmit=${handleCreateResourceModal} class="space-y-3 text-xs">
                <div class="grid grid-cols-2 gap-2.5">
                    <div>
                        <label class="block text-slate-300 mb-1">Subject Hub</label>
                        <select id="res-mod-subj" class="w-full px-3 py-2 rounded-xl bg-[#07090e] border border-white/10 text-white">
                            ${allowedSubjects.map((s) => view`<option value="${Number(s.id)}" selected=${Boolean(s.slug === activeSubjectSlug)}>${s.name}</option>`)}
                        </select>
                    </div>
                    <div>
                        <label class="block text-slate-300 mb-1">Material Type</label>
                        <select id="res-mod-type" class="w-full px-3 py-2 rounded-xl bg-[#07090e] border border-white/10 text-white">
                            <option value="pdf">PDF Document</option>
                            <option value="presentation">Presentation Deck</option>
                            <option value="youtube">YouTube / Video Lesson</option>
                            <option value="link">External Resource Link</option>
                            <option value="study_guide">Study Guide</option>
                        </select>
                    </div>
                </div>
                <div><label class="block text-slate-300 mb-1">Resource Title</label><input id="res-mod-title" type="text" required placeholder="e.g. Organic Synthesis Reaction Mechanisms" class="w-full px-3 py-2 rounded-xl bg-[#07090e] border border-white/10 text-white" /></div>
                <div><label class="block text-slate-300 mb-1">Category</label><input id="res-mod-cat" type="text" value="Laboratory Protocols" class="w-full px-3 py-2 rounded-xl bg-[#07090e] border border-white/10 text-white" /></div>
                <div><label class="block text-slate-300 mb-1">Video / Resource URL</label><input id="res-mod-url" type="url" placeholder="https://..." class="w-full px-3 py-2 rounded-xl bg-[#07090e] border border-white/10 text-white" /></div>
                ${!isPreview ? view`<div><label class="block text-slate-300 mb-1" for="res-mod-file">Attach a document or image</label><input id="res-mod-file" type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg,.webp" class="w-full" /><p class="mt-1 text-slate-400">Optional · up to 10 MB</p></div>` : ''}
                    <div><label class="block text-slate-300 mb-1">Description</label><textarea id="res-mod-desc" rows="2" required class="w-full px-3 py-2 rounded-xl bg-[#07090e] border border-white/10 text-white"></textarea></div>
                <button type="submit" class="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold">Submit Resource</button>
            </form>
        </div>
    `,
    );
    $('#ecosystem-modal').classList.remove('hidden');
    refreshIcons();
}

async function handleCreateResourceModal(e) {
    e.preventDefault();
    try {
        const fields = {
            subject_id: Number($('#res-mod-subj').value),
            resource_type: $('#res-mod-type').value,
            title: $('#res-mod-title').value.trim(),
            category: $('#res-mod-cat').value.trim(),
            external_url: $('#res-mod-url').value.trim(),
            description: $('#res-mod-desc').value.trim(),
        };
        const file = $('#res-mod-file')?.files[0];
        let body = JSON.stringify(fields);
        if (file) {
            if (!file.size || file.size > 10 * 1024 * 1024) throw new Error('Choose a document up to 10 MB.');
            body = new FormData();
            for (const [key, value] of Object.entries(fields)) body.append(key, String(value));
            body.append('file', file);
        }
        await apiRequest('/api/resources', { method: 'POST', body });
        closeEcosystemModal();
        notifyToast('Resource added successfully!');
        if (activeEcosystemView === 'subject') await openSubjectHub(activeSubjectSlug);
        if (activeEcosystemView === 'owner') await openOwnerSection('resources');
        if (activeEcosystemView === 'staff') await renderStaffWorkspace();
        await renderPublicSubjectsGrid();
    } catch (err) {
        notifyToast(err.message, 'error');
    }
}

function closeEcosystemModal() {
    $('#ecosystem-modal')?.classList.add('hidden');
}

function notifyToast(msg, tone = 'success') {
    const stack = $('#toast-stack');
    if (!stack) return;
    const item = document.createElement('div');
    item.className =
        'pointer-events-auto max-w-sm bg-[#11141d]/95 backdrop-blur-xl border border-white/15 text-slate-100 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs sm:text-sm transition-all duration-300 translate-y-2 opacity-0';
    const icon = document.createElement('i');
    icon.dataset.lucide = tone === 'error' ? 'circle-alert' : 'circle-check';
    icon.className =
        tone === 'error' ? 'w-4 h-4 text-rose-300 shrink-0' : 'w-4 h-4 text-emerald-400 shrink-0';
    const text = document.createElement('span');
    text.textContent = msg;
    if (stack.childElementCount >= 4) stack.firstElementChild.remove();
    item.append(icon, text);
    stack.appendChild(item);
    refreshIcons(item);
    requestAnimationFrame(() => item.classList.remove('translate-y-2', 'opacity-0'));
    setTimeout(() => {
        item.classList.add('translate-y-2', 'opacity-0');
        setTimeout(() => item.remove(), 300);
    }, 3600);
}

async function startLearnity() {
    initExperience();
    document.addEventListener('keydown', (event) => {
        const frame = event.target;
        if (
            !adminAuthenticated ||
            !frame.matches('.pan-photo-area') ||
            !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)
        )
            return;
        const img = frame.querySelector('img'),
            feature = img.id === 'hero-main-photo';
        const photo = feature
            ? featuredIndex
                ? lessonCards.find((c) => c.id === featurePhotos()[featuredIndex]?.id)
                : heroPhotoState
            : lessonCards.find((c) => 'img-' + c.id === img.id);
        if (!photo) return;
        event.preventDefault();
        const step = event.shiftKey ? 10 : 2;
        photo.posX = clamp(
            photo.posX + (event.key === 'ArrowRight' ? step : event.key === 'ArrowLeft' ? -step : 0),
            0,
            100,
        );
        photo.posY = clamp(
            photo.posY + (event.key === 'ArrowDown' ? step : event.key === 'ArrowUp' ? -step : 0),
            0,
            100,
        );
        Object.assign(img.style, photoStyle(photo));
        queueContentSave();
    });
    setRegistrationTab('apply');
    renderLessonGallery();
    selectTimelineStage(0);
    $('#admin-login-form')?.addEventListener('submit', submitOnce(adminLogin));
    $('#invite-reg-code').addEventListener('input', () =>
        $('#invite-verified-preview').classList.add('hidden'),
    );
    await checkAdminSession();
    await Promise.all([
        loadSiteContent(),
        renderPublicSubjectsGrid(),
        renderPublicStaffDirectory(),
        refreshPublicStats(),
    ]);
    renderLessonGallery();
    refreshIcons();
    const address = new URL(location.href);
    if (address.search.length <= 2048 && address.searchParams.has('invite')) {
        const codes = address.searchParams.getAll('invite');
        setRegistrationTab('invite');
        if (codes.length === 1 && validCode(codes[0])) {
            $('#invite-reg-code').value = codes[0];
            await verifyEnteredInviteCode();
        } else notifyToast('This invitation link contains an invalid code.');
        $('#apply-card').scrollIntoView({ behavior: 'instant' });
    } else if (/^\/(join|apply)\/?$/.test(address.pathname) || address.hash === '#join-with-code') {
        setRegistrationTab(
            address.pathname.startsWith('/join') || address.hash === '#join-with-code' ? 'invite' : 'apply',
        );
        $('#apply-card').scrollIntoView({ behavior: 'instant' });
    } else if (/^\/(owner|staff|portal)\/?$/.test(address.pathname)) openActiveRoleWorkspace();
    else {
        const match = /^\/subjects\/([a-z0-9-]{1,96})\/?$/.exec(address.pathname);
        if (match && validSlug(match[1])) await openSubjectHub(match[1]);
    }
}
document.addEventListener('DOMContentLoaded', () =>
    startLearnity().catch((error) => notifyToast(error.message, 'error')),
);
