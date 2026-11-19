'use strict';
const isRecord = (x) => x !== null && typeof x === 'object' && !Array.isArray(x);
function invalid(message) {
    return Object.assign(new Error(message), { statusCode: 400 });
}
function storedJson(raw, validate, fallback) {
    try {
        const value = JSON.parse(raw);
        return validate(value) ? value : fallback;
    } catch {
        return fallback;
    }
}
const textMap = (x) =>
    isRecord(x) &&
    Object.entries(x).every(
        ([k, v]) => /^[\w-]{1,120}$/.test(k) && typeof v === 'string' && v.length <= 8000,
    );
const textList = (x) => Array.isArray(x) && x.every((v) => typeof v === 'string' && v.length <= 240);
const flags = (x) =>
    isRecord(x) &&
    Object.entries(x).every(([k, v]) => /^can_[a-z_]+$/.test(k) && [true, false, 0, 1].includes(v));
const limits = {
    email: 254,
    password: 128,
    new_password: 128,
    full_name: 160,
    name: 160,
    phone_or_telegram: 80,
    phone: 80,
    code: 64,
    invitation_code: 64,
    slug: 96,
    icon_name: 48,
    accent_color: 7,
    description: 4000,
    short_description: 4000,
    intro_html: 4000,
    bio: 4000,
    educational_background: 4000,
    motivation_statement: 4000,
    responsibilities: 4000,
    body: 12000,
    subject: 300,
    external_url: 2048,
    file_url: 2048,
    photo_url: 2048,
    avatar_url: 2048,
    logoUrl: 2048,
    current_password: 128,
    image_url: 2048,
    imageSrc: 2048,
    review_notes: 4000,
};
function urlOK(value, image) {
    if (
        image &&
        /^data:image\/(?:png|jpeg|gif|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(value) &&
        value.length <= 16000000
    )
        return true;
    if (image && value === 'assets/photo-unavailable.svg') return true;
    if (image && /^(?:\/)?assets\/photos\/[a-z\d-]+\.webp$/.test(value)) return true;
    if (/^\/uploads\/[\w.-]+$/.test(value)) return true;
    if (/[\s\\]/.test(value)) return false;
    try {
        const u = new URL(value);
        return !u.username && !u.password && (u.protocol === 'https:' || (!image && u.protocol === 'http:'));
    } catch {
        return false;
    }
}
const arrayKeys = new Set([
    'lessonCards',
    'interested_subjects',
    'subject_ids',
    'subject_permissions',
    'removedCardKeys',
]);
const objectKeys = new Set(['heroPhotoState', 'permissions', 'delegatable_permissions']);
const booleans = new Set([
    'is_visible',
    'is_archived',
    'is_featured',
    'is_pinned',
    'generate_invite',
    'notify_applicant',
    'create_gallery_card',
]);
const numbers = {
    posX: [0, 100],
    posY: [0, 100],
    pos_x: [0, 100],
    pos_y: [0, 100],
    scale: [1, 3],
    max_uses: [1, 500],
    expires_in_days: [1, 365],
    display_order: [0, 1000000],
    mediaId: [1, Number.MAX_SAFE_INTEGER],
    subject_id: [1, Number.MAX_SAFE_INTEGER],
    user_id: [1, Number.MAX_SAFE_INTEGER],
    subjectId: [1, Number.MAX_SAFE_INTEGER],
};
const enums = {
    priority: ['normal', 'important', 'urgent'],
    audience: ['all', 'staff', 'members', 'subject'],
    requested_role: ['MEMBER', 'STAFF'],
    resource_type: ['pdf', 'presentation', 'video', 'youtube', 'link', 'study_guide'],
    moderation_status: ['Published', 'Approved', 'Rejected', 'Pending Review'],
};
function validateBody(body) {
    if (!isRecord(body)) throw invalid('Expected a JSON object.');
    function walk(value, key, depth) {
        if (depth > 6 || ['__proto__', 'prototype', 'constructor'].includes(key))
            throw invalid('Invalid input structure.');
        if (key === 'pageTexts') {
            if (!textMap(value) || Object.keys(value).length > 1500) throw invalid('Invalid page text.');
            return;
        }
        if (arrayKeys.has(key)) {
            if (
                !Array.isArray(value) ||
                value.length > (key === 'lessonCards' || key === 'removedCardKeys' ? 5000 : 500)
            )
                throw invalid('Invalid list: ' + key);
            if (key === 'subject_ids' && new Set(value.map(Number)).size !== value.length)
                throw invalid('Duplicate subject ID.');
            for (const item of value) {
                if (['lessonCards', 'subject_permissions'].includes(key)) {
                    if (!isRecord(item)) throw invalid('Invalid list entry.');
                    walk(item, 'record', depth + 1);
                } else if (key === 'subject_ids') walk(item, 'subjectId', depth + 1);
                else {
                    if (typeof item !== 'string' || !item.trim()) throw invalid('Invalid list entry.');
                    walk(item, 'entry', depth + 1);
                }
            }
            return;
        }
        if (objectKeys.has(key) || key === 'record') {
            if (!isRecord(value) || Object.keys(value).length > 80) throw invalid('Invalid object: ' + key);
            if (['permissions', 'delegatable_permissions'].includes(key) && !flags(value))
                throw invalid('Invalid permission flags.');
            for (const [name, item] of Object.entries(value)) walk(item, name, depth + 1);
            return;
        }
        if (/^can_[a-z_]+$/.test(key) || booleans.has(key)) {
            if (![true, false, 0, 1, 'true', 'false', '0', '1'].includes(value))
                throw invalid('Invalid flag: ' + key);
            return;
        }
        if (Object.hasOwn(numbers, key)) {
            if (value == null || value === '') {
                if (['mediaId', 'subject_id', 'user_id'].includes(key)) return;
                throw invalid('Missing number: ' + key);
            }
            const n = Number(value),
                [min, max] = numbers[key];
            if (
                !['string', 'number'].includes(typeof value) ||
                !Number.isFinite(n) ||
                n < min ||
                n > max ||
                (!['posX', 'posY', 'pos_x', 'pos_y', 'scale'].includes(key) && !Number.isSafeInteger(n))
            )
                throw invalid('Number out of range: ' + key);
            return;
        }
        if (key === 'id' && Number.isSafeInteger(value) && value > 0) return;
        if (value === null && ['photo_url', 'avatar_url', 'image_url', 'imageSrc', 'logoUrl'].includes(key))
            return;
        if (
            typeof value !== 'string' ||
            value.length >
                (['imageSrc', 'logoUrl', 'photo_url'].includes(key) && value.startsWith('data:image/')
                    ? 16000000
                    : limits[key] || 240) ||
            /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value)
        )
            throw invalid('Invalid or overlength field: ' + key);
        if (!value) return;
        if (Object.hasOwn(enums, key) && !enums[key].includes(value))
            throw invalid('Unsupported value: ' + key);
        if (key === 'expires_at' && !Number.isFinite(Date.parse(value)))
            throw invalid('Invalid expiration date.');
        if (key === 'email' && !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(value))
            throw invalid('Enter a valid email address.');
        if (
            ['email', 'full_name', 'name', 'phone_or_telegram', 'subject'].includes(key) &&
            /[\r\n]/.test(value)
        )
            throw invalid('This field must fit on one line.');
        if (
            ['code', 'invitation_code'].includes(key) &&
            !/^[A-Z0-9][A-Z0-9 -]{4,62}[A-Z0-9]$/i.test(value.trim())
        )
            throw invalid('Invalid invitation code format.');
        if (key === 'slug' && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value))
            throw invalid('Enter a lowercase subject slug.');
        if (key === 'icon_name' && !/^[a-z0-9-]+$/.test(value)) throw invalid('Invalid icon name.');
        if (key === 'accent_color' && !/^#[a-f\d]{6}$/i.test(value))
            throw invalid('Enter a six-digit hex color.');
        if (
            /^(external_url|file_url|photo_url|avatar_url|image_url|imageSrc|logoUrl)$/.test(key) &&
            !urlOK(value, !['external_url', 'file_url'].includes(key))
        )
            throw invalid('Invalid web address.');
    }
    if (Object.keys(body).length > 80) throw invalid('Too many form fields.');
    for (const [key, value] of Object.entries(body)) {
        walk(value, key, 0);
        if (
            (booleans.has(key) || key.startsWith('can_')) &&
            typeof value === 'string' &&
            key !== 'create_gallery_card'
        )
            body[key] = ['1', 'true'].includes(value);
    }
    return body;
}
module.exports = { invalid, isRecord, storedJson, textMap, textList, flags, validateBody, urlOK };
