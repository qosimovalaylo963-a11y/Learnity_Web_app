'use strict';

function fieldLimit(field) {
    const id = field.id;
    if (field.type === 'email') return 254;
    if (field.type === 'password') return 128;
    if (field.type === 'url' || /stf-photo|photo-url|avatar/.test(id)) return 2048;
    if (/reg-code/.test(id)) return 64;
    if (/phone|telegram/.test(id)) return 80;
    if (/body|template/.test(id) && field.tagName === 'TEXTAREA') return 12000;
    if (field.tagName === 'TEXTAREA' || /background|responsib|bio/.test(id)) return 4000;
    if (/name|category|department|position/.test(id)) return 160;
    return 240;
}
function prepareFields(root = document) {
    for (const field of root.querySelectorAll('input,select,textarea')) {
        if (
            field.matches(
                'input:not([type]),input:is([type=text],[type=password],[type=email],[type=url],[type=search],[type=tel]),textarea',
            )
        )
            field.maxLength = fieldLimit(field);
        if (field.type === 'file' && field.accept === 'image/*')
            field.accept = 'image/png,image/jpeg,image/gif,image/webp';
        if (field.type === 'password')
            field.autocomplete = /reg-|new-user|stf-/.test(field.id) ? 'new-password' : 'current-password';
        if (field.type === 'email') field.autocomplete = 'email';
        if (field.id === 'invite-reg-code') {
            field.autocapitalize = 'characters';
            field.spellcheck = false;
        }
        const label = field.previousElementSibling;
        if (label?.tagName === 'LABEL' && !label.htmlFor && field.id) label.htmlFor = field.id;
        if (!field.labels?.length && !field.hasAttribute('aria-label')) {
            field.setAttribute(
                'aria-label',
                field.placeholder ||
                    field.title ||
                    (field.id || field.name || field.type || 'Input').replace(/[-_]/g, ' '),
            );
        }
        if (field.matches('input.peer.hidden')) field.classList.replace('hidden', 'sr-only');
    }
    for (const button of root.querySelectorAll('button:not([aria-label])')) {
        if (!button.textContent.trim()) {
            const icon = button.querySelector('[data-lucide]');
            if (button.title || icon)
                button.setAttribute('aria-label', button.title || icon.dataset.lucide.replace(/-/g, ' '));
        }
    }
}
function validateField(field) {
    if (!field.matches('input,select,textarea') || field.disabled) return;
    field.setCustomValidity('');
    const value = field.value;
    if (field.type === 'file') return;
    if (field.required && field.type !== 'password' && !value.trim())
        field.setCustomValidity('Please complete this field.');
    else if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value))
        field.setCustomValidity('This field contains an unsupported control character.');
    else if (field.maxLength >= 0 && value.length > field.maxLength)
        field.setCustomValidity('Please shorten this entry to ' + field.maxLength + ' characters.');
    else if (field.id === 'stf-photo' && value && !safeUrl(field.dataset.uploadSource || value, true))
        field.setCustomValidity('Use a secure image address or upload a photo.');
    else if (field.type === 'url' && value && !safeUrl(value.trim()))
        field.setCustomValidity('Enter a full http or https address.');
    else if (field.id === 'invite-reg-code' && value && !validCode(value.trim()))
        field.setCustomValidity('Use 6–64 letters, numbers, spaces or hyphens.');
}
document.addEventListener('input', (e) => {
    if (e.target.matches('input,textarea,select')) validateField(e.target);
});
document.addEventListener(
    'submit',
    (e) => {
        Array.from(e.target.elements)
            .filter((f) => f.matches('input,textarea,select'))
            .forEach(validateField);
        if (!e.target.reportValidity()) {
            e.preventDefault();
            e.stopImmediatePropagation();
        }
    },
    true,
);
function insertPlainText(event) {
    const editor = event.target.closest('[contenteditable="true"]');
    if (!editor) return;
    event.preventDefault();
    const selection = getSelection();
    if (!selection.rangeCount) return;
    const range = selection.getRangeAt(0);
    if (!editor.contains(range.commonAncestorContainer)) return;
    const available = Math.max(0, 4000 - editor.textContent.length + range.toString().length);
    const text = (event.clipboardData || event.dataTransfer)?.getData('text/plain') || '';
    range.deleteContents();
    const node = document.createTextNode(text.slice(0, available));
    range.insertNode(node);
    range.setStartAfter(node);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
}
document.addEventListener('paste', insertPlainText);
document.addEventListener('drop', insertPlainText);
document.addEventListener('beforeinput', (e) => {
    const editor = e.target.closest('[contenteditable="true"]');
    if (editor && e.data && editor.textContent.length - String(getSelection()).length + e.data.length > 4000)
        e.preventDefault();
});
document.addEventListener(
    'error',
    (e) => {
        if (e.target instanceof HTMLImageElement && e.target.getAttribute('src') !== imagePlaceholder) {
            e.target.src = imagePlaceholder;
        }
    },
    true,
);

function submitOnce(handler) {
    return async function (event) {
        event.preventDefault();
        const form = event.currentTarget;
        if (form.getAttribute('aria-busy') === 'true') return;
        const buttons = [...form.querySelectorAll('button[type=submit]:not(:disabled)')];
        form.setAttribute('aria-busy', 'true');
        buttons.forEach((button) => {
            button.disabled = true;
        });
        try {
            await handler(event);
        } catch (error) {
            notifyToast(error.message);
        } finally {
            form.removeAttribute('aria-busy');
            buttons.forEach((button) => {
                button.disabled = false;
            });
        }
    };
}
