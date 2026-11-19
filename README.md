# Learnity

Learnity is a mentor-led learning platform with a public workshop gallery, subject hubs, two registration paths and separate member, staff and owner workspaces.

## Run locally

Use Node.js 24. The archive includes the compiled styles, JavaScript, fonts, icons and original photos. Running the application requires no npm package installation.

```sh
cd learnity-fullstack
npm start
```

Open [http://localhost:3000](http://localhost:3000). The server creates its database and uploads directory on first boot. Node versions without built-in SQLite can run the included Python 3 worker. Python 3.9 or later with the standard sqlite3 module is sufficient.

The following accounts are for a local development run using the default settings.

| Workspace | Email | Development password |
| --- | --- | --- |
| Owner | owner@learnity.org | Learnity!Owner#2026 |
| Staff | aziza.staff@learnity.org | Staff!Bio#2026 |
| Member | jasmina.member@learnity.org | Member!Pass#2026 |

The seeded development invitation is `LRN-STEM-2026-JOIN`. It expires 30 days after the database is first seeded and has a limited number of uses. Owners can generate additional codes in their dashboard.

## Use the application

- **Visitors** can browse the original workshop photographs, open the curriculum timeline, explore subject listings, apply as a learner or mentor, or register with an invitation. The application receipt displays its reference number.
- **Members** can open assigned subject hubs, filter materials, read announcements, edit their profile and use delegated invitation permissions.
- **Staff** can access their assigned subjects, contribute links, videos and documents, and moderate materials according to their permissions.
- **Owners** can review and export applications, issue and revoke invitations, manage people and permissions, edit subject hubs, moderate resources, publish announcements, edit email templates, inspect activity and create database backups.
- **Owner Studio** supports editing site text, uploading a custom logo, replacing and framing workshop photos, and adding, ordering, hiding, archiving or deleting gallery entries. Arrow keys adjust a focused photo crop. Shift increases the adjustment. The save indicator reflects the server response.

## Production configuration

Copy `.env.example` to `.env` or set environment variables in your hosting service. Start with `NODE_ENV=production`, your own `OWNER_EMAIL`, and a unique `OWNER_PASSWORD` of 12–128 characters. Terminate HTTPS at your reverse proxy or hosting service. The production session cookie requires HTTPS.

Keep the database, uploads and backups on persistent storage. Setting `DATA_DIR` changes the default location of all three. `DB_PATH` and `UPLOAD_DIR` override individual paths. Development binds to loopback. Production listens on all interfaces by default. `HOST` and `PORT` can override these settings.

Production disables the public starter invitation, provisions fresh staff identities with random credentials and omits the sample member and application records on a new installation. When importing a development database, the server replaces the known sample owner password with the configured secret, disables accounts still using recognized sample passwords, and revokes the public starter code. Other existing account passwords are retained.

Configure verified SMTP on port 465 or STARTTLS on port 587, or set `RESEND_API_KEY` and a verified `SMTP_FROM` sender. Applications and notification status are recorded locally when a provider is absent. Check delivery to your own mailbox after configuring your provider.

## Existing installations

Set the same `DB_PATH` and `UPLOAD_DIR` that your original installation used. Stop the previous instance and take a backup before switching versions. Existing SQLite files open directly. The uploaded v3 Node server also produced JSON-backed databases with a SQLite-looking filename. On first boot the new server imports that format transactionally into a sibling file ending in `.v4.sqlite`. The old JSON files remain available for recovery. New database snapshots use SQLite’s online backup facility or a consistent SQLite snapshot.

Saved page-text keys, gallery IDs, photo framing, account hashes, permissions and invitation hashes retain their existing meanings. Previously stored links for the bundled Unsplash photos resolve to local WebP files.

## Static preview

Open `public/index.html` directly after extracting the entire folder, or serve the complete `public/` directory on a static host. This is a self-contained demo with its own sample data and browser storage. Open it from a local file, localhost or HTTPS for demo sign-in. The full Node server uses authenticated HTTP requests and reports connection failures. The production server excludes the browser demo engine.

## Verification

```sh
npm test
```

The original 20 integration scenarios exercise registrations, subject authorization, resource moderation, gallery uploads, application decisions and restart persistence. Additional checks cover production headers, session handling, CSRF, input boundaries, concurrent invitation redemption, private file downloads and backups.

Optional browser checks use Python Playwright and Chromium.

```sh
python -m pip install playwright
python -m playwright install chromium
python tests/browser_smoke.py
```

The browser suite starts a temporary server and exercises both registration paths, all 11 owner tabs, staff contributions, saved media visibility, keyboard focus, mobile navigation and the standalone demo.

## Source layout

| Path | Purpose |
| --- | --- |
| `public/index.html` | Responsive shell, original Learnity emblem and stable content-editing keys |
| `public/assets/app.js` | Registration, dashboards, subject hubs, media management and content editing |
| `public/assets/dom.js` | Typed DOM templates, URL rules, formatting allowlist and same-origin API client |
| `public/assets/controls.js`, `forms.js` | Event bindings, field limits and accessible submission feedback |
| `public/assets/motion.js`, `studio.css` | Visual design, compositor animations, photo viewer, focus handling and reduced motion |
| `public/assets/demo.js` | Browser-only preview database and storage recovery |
| `src/server.js`, `src/middleware/` | HTTP server, response headers, validation, session and upload controls |
| `src/routes/api.js`, `src/db/` | REST workflows, SQLite access, migrations and seeds |
| `src/utils/` | Passwords, invitation codes and transactional email |

The server sends the content security policy, frame restrictions, referrer policy and MIME enforcement headers on HTTP responses. The static preview also carries a CSP and referrer meta policy. Dynamic content is constructed with DOM nodes and event listeners. Rich-text editing accepts a small set of inline formatting tags. Source references are [MDN’s CSP guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP) and [MIME type verification guidance](https://developer.mozilla.org/en-US/docs/Web/Security/Practical_implementation_guides/MIME_types).

Design changes can be made directly in `studio.css`. After changing utility classes, run `npm ci` and `npm run styles` to rebuild the checked-in utility stylesheet. The icon, typeface and library licenses are included beside their assets.
