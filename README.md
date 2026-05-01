# Webify Markdown LAN Server

`Webify Markdown LAN Server` turns your vault (or a selected subfolder) into a read-only local website that you can browse from devices on the same network.

## Features

- Serve only a selected folder scope from your vault.
- Start/stop/copy URL commands in the command palette.
- Status bar toggle with running/stopped state.
- Markdown rendering with wikilinks, frontmatter, code highlighting, and table support.
- Attachment serving for images/files referenced by notes.
- Sidebar tree navigation, search, favorites, theme toggle, and responsive layout.
- Read-only HTTP server with no write endpoints.

## Screenshots / Demo

- Add screenshots or GIFs here before submission:
  - `docs/screenshot-sidebar.png`
  - `docs/screenshot-note-view.png`
  - `docs/screenshot-mobile.png`

## Install

### Option 1: Manual install

1. Build:
   - `npm install`
   - `npm run build`
2. Copy plugin files into:
   - `<your-vault>/.obsidian/plugins/webify-markdown-lan-server/`
3. In Obsidian:
   - Open **Settings > Community plugins**
   - Disable **Restricted mode**
   - Enable **Webify Markdown LAN Server**

### Option 2: BRAT

1. Install and enable BRAT.
2. Add repository: `https://github.com/anubees/webify-markdown-lan-server`
3. Enable **Webify Markdown LAN Server** in Community plugins.

## Usage

1. Run command:
   - `Webify Markdown LAN Server: Start server`
2. Configure settings:
   - Port
   - Bind address (`127.0.0.1` or `0.0.0.0`)
   - Root folder scope (optional)
   - Basic auth (recommended for LAN mode)
3. Copy URL:
   - `Webify Markdown LAN Server: Copy LAN URL to clipboard`
4. Open on another device:
   - `http://<your-lan-ip>:<port>`

## Security

- The plugin is read-only: it does not expose `POST`, `PUT`, or `DELETE` endpoints.
- If bind address is `0.0.0.0`, notes are reachable by anyone on your LAN.
- Enable basic auth when using LAN mode.
- Credentials are stored in plugin data and are plaintext at rest.
- Use this plugin only on trusted networks/devices.

## Developer Build / Test

1. In this folder:
   - `npm i`
   - `npm run dev`
2. Copy/symlink into:
   - `<vault>/.obsidian/plugins/webify-markdown-lan-server/`
3. Enable Developer mode in Obsidian.
4. Enable plugin and run:
   - `Webify Markdown LAN Server: Start server`

## Release Checklist (Community Submission)

- [ ] `manifest.json` metadata is final (id/name/version/author URLs).
- [ ] `README.md` includes screenshots/GIFs and security notes.
- [ ] `LICENSE` is present.
- [ ] Build artifacts are generated (`main.js`, `manifest.json`, `styles.css`).
- [ ] Tested on desktop Obsidian with clean startup and shutdown.
