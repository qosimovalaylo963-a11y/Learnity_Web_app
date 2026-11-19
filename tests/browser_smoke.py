"""Exercise registration, role workspaces, gallery persistence, keyboard navigation and static preview."""
from pathlib import Path
import argparse
import atexit
import os
import socket
import subprocess
import tempfile
import time
from urllib.request import urlopen
from playwright.sync_api import sync_playwright, expect
parser = argparse.ArgumentParser(description='Run Learnity browser checks on a disposable development server.')
parser.add_argument('--browser', help='Path to a custom Chromium binary')
parser.add_argument('--browser-arg', action='append', default=[], help='Additional Chromium launch argument')
options = parser.parse_args()
project = Path(__file__).resolve().parents[1]
database_dir = tempfile.TemporaryDirectory(prefix='learnity-browser-')
with socket.socket() as reservation:
    reservation.bind(('127.0.0.1', 0))
    port = reservation.getsockname()[1]
server_url = 'http://127.0.0.1:' + str(port) + '/'
env = {**os.environ, 'NODE_ENV': 'development', 'HOST': '127.0.0.1', 'PORT': str(port), 'DATA_DIR': database_dir.name, 'DB_PATH': str(Path(database_dir.name) / 'test.sqlite'), 'UPLOAD_DIR': str(Path(database_dir.name) / 'uploads'), 'OWNER_EMAIL': 'owner@learnity.org', 'OWNER_PASSWORD': 'Learnity!Owner#2026', 'SMTP_HOST': '', 'RESEND_API_KEY': ''}
server = subprocess.Popen(['node', 'start.cjs'], cwd=project, env=env, stdout=subprocess.DEVNULL)

def cleanup():
    server.terminate()
    server.wait(timeout=8)
    database_dir.cleanup()
atexit.register(cleanup)
for attempt in range(100):
    try:
        with urlopen(server_url + 'api/public/stats', timeout=1):
            break
    except OSError:
        time.sleep(0.05)
else:
    raise RuntimeError('The Learnity test server did not start.')
errors = []
viol = []
with sync_playwright() as pw:
    launch_options = {}
    if options.browser:
        launch_options['executable_path'] = options.browser
    if options.browser_arg:
        launch_options['args'] = options.browser_arg
    browser = pw.chromium.launch(**launch_options)
    page = browser.new_page(viewport={'width': 1440, 'height': 900}, reduced_motion='reduce')
    page.set_default_timeout(5500)
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.add_init_script("document.addEventListener('securitypolicyviolation',e=>(window.policyProblems??=[]).push([e.effectiveDirective,e.blockedURI]))")
    page.on('dialog', lambda d: d.accept())

    def visit(url=server_url):
        page.goto(url, wait_until='networkidle')
        expect(page.locator('#public-subjects-grid button').first).to_be_attached()

    def tab(name):
        page.locator(f'[data-owner-tab="{name}"]').click()
        expect(page.locator('#owner-section-container [aria-busy]')).to_have_count(0)
        assert not page.locator('#owner-section-container').inner_text().startswith('The request could not')

    def login(email, password):
        page.locator('#nav-btn-login').click()
        page.locator('#modal-login-email').fill(email)
        page.locator('#modal-login-password').fill(password)
        page.locator('#ecosystem-modal button[type=submit]').click()
        expect(page.locator('#ecosystem-modal')).to_be_hidden()

    def record(n):
        c = page.evaluate('window.policyProblems||[]')
        viol.extend(c)
        print(n, 'page errors', errors[-1:], 'CSP', c[:1], flush=True)
    visit()
    assert page.locator('#lesson-cards-grid article').count() == 6
    assert page.locator('#subject-shortcuts button').count() == 8
    page.locator('#feature-next').click()
    expect(page.locator('#feature-index')).to_have_text('02')
    page.locator('#feature-prev').click()
    group = page.locator('#cohort-apply-form')
    group.locator('#input-fullname').fill('Amina Test')
    group.locator('#input-email').fill('amina-check-' + str(time.time_ns()) + '@example.test')
    group.locator('#input-phone').fill('@aminacheck')
    group.locator('#input-track').select_option('Biology')
    group.locator('#input-background').fill('High school student')
    group.locator('#input-motivation').fill('I would like to join science workshops.')
    group.locator('[type=submit]').click()
    expect(page.locator('#application-feedback-banner')).to_contain_text('Application Submitted')
    page.locator('#tab-reg-invite').click()
    page.locator('#invite-reg-code').fill('LRN-STEM-2026-JOIN')
    page.locator('#invite-reg-code').locator('..').locator('button').click()
    expect(page.locator('#invite-verified-preview')).to_contain_text('Valid MEMBER')
    page.locator('#invite-reg-name').fill('Test Learner')
    page.locator('#invite-reg-email').fill('learner-' + str(time.time_ns()) + '@example.test')
    page.locator('#invite-reg-password').fill('TestPrivatePass813!')
    page.locator('#invite-register-form [type=submit]').click()
    expect(page.locator('#member-portal-body')).to_contain_text('Your Member Profile')
    page.locator('#mem-prof-bio').fill('Lab and reading club')
    page.locator('#member-portal-body button[type=submit]').first.click()
    record('Public application, carousel, invite verification, registration and member profile')
    page.evaluate('logoutSession()')
    login('owner@learnity.org', 'Learnity!Owner#2026')
    expect(page.locator('#view-owner-dashboard')).to_be_visible()
    for b in page.locator('[data-owner-tab]').all():
        k = b.get_attribute('data-owner-tab')
        tab(k)
        print('owner tab', k, flush=True)
    tab('invitations')
    page.locator('#gen-inv-label').fill('Browser check')
    page.locator('#gen-inv-label').locator('xpath=ancestor::form').locator('button[type=submit]').click()
    expect(page.locator('#ecosystem-modal')).to_be_visible()
    expect(page.locator('#ecosystem-modal-body')).to_contain_text('Registration Link')
    page.keyboard.press('Escape')
    tab('media')
    for width in (320, 390, 768, 1080, 1280, 1440):
        page.set_viewport_size({'width': width, 'height': 900})
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), width
    art = page.locator('#owner-section-container').get_by_role('button', name='Hide', exact=True).first
    art.click()
    expect(page.locator('#lesson-cards-grid article')).to_have_count(5)
    expect(page.locator('#btn-toggle-edit')).to_have_attribute('data-save-state', 'saved')
    page.reload(wait_until='networkidle')
    page.locator('#nav-btn-workspace').click()
    tab('media')
    page.locator('#owner-section-container').get_by_role('button', name='Show', exact=True).first.click()
    expect(page.locator('#lesson-cards-grid article')).to_have_count(6)
    expect(page.locator('#btn-toggle-edit')).to_have_attribute('data-save-state', 'saved')
    tab('announcements')
    page.locator('#ann-title').fill('Student workshop check')
    page.locator('#ann-body').fill('Bring a notebook.')
    page.locator('#ann-title').locator('xpath=ancestor::form').locator('[type=submit]').click()
    expect(page.locator('#owner-section-container')).to_contain_text('Student workshop check')
    tab('settings')
    page.locator('#tpl-subject').fill('New cohort application')
    page.locator('#tpl-subject').locator('xpath=ancestor::form').locator('[type=submit]').click()
    record('Owner sections, invitation issuance, modal Escape, persisted media visibility, announcement and email template')
    page.evaluate('logoutSession()')
    login('aziza.staff@learnity.org', 'Staff!Bio#2026')
    expect(page.locator('#staff-workspace-body')).to_contain_text('Biology')
    page.locator('#staff-workspace-body').get_by_role('button', name='Open Hub').first.click()
    expect(page.locator('#subject-hub-header')).to_contain_text('Learning Hub')
    page.locator('#btn-subject-contribute').click()
    page.locator('#res-mod-title').fill('Workshop note ' + str(time.time_ns()))
    page.locator('#res-mod-desc').fill('Notes for the next workshop')
    page.locator('#res-mod-url').fill('https://example.org/reading')
    page.locator('#ecosystem-modal-body button[type=submit]').click()
    expect(page.locator('#ecosystem-modal')).to_be_hidden()
    record('Staff workspace, assigned hub, resource form')
    page.evaluate('logoutSession()')
    page.set_viewport_size({'width': 390, 'height': 844})
    visit()
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
    page.locator('#nav-btn-mobile-menu').click()
    expect(page.locator('#mobile-nav-drawer')).to_be_visible()
    page.keyboard.press('Escape')
    expect(page.locator('#mobile-nav-drawer')).to_be_hidden()
    page.locator('#nav-btn-login').click()
    page.keyboard.press('Escape')
    expect(page.locator('#nav-btn-login')).to_be_focused()
    record('Mobile layout, drawer, keyboard focus return')
    visit((project / 'public/index.html').as_uri())
    record('Standalone offline preview')
    login('owner@learnity.org', 'Learnity!Owner#2026')
    expect(page.locator('#view-owner-dashboard')).to_be_visible()
    tab('settings')
    record('Offline owner console')
    assert not errors and (not viol), (errors, viol)
    browser.close()
