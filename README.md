# Webify Markdown LAN Server

`Webify Markdown LAN Server` turns your vault (or a selected subfolder) into a read-only local website that you can browse from devices on the same network.

## Features

- Serve only a selected folder scope from your vault.
- Start/stop/copy URL commands in the command palette.
- Status bar toggle with running/stopped state.
- Markdown rendering with wikilinks, frontmatter, code highlighting, and table support.
- Attachment serving for images/files referenced by notes.
- Sidebar tree navigation, search, favorites, theme toggle, and responsive layout.
- Optional HTTPS (TLS) using PEM certificate and key files stored in your vault.
- Read-only HTTP/HTTPS server with no write endpoints.

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
   - Optional HTTPS (see [HTTPS (TLS)](#https-tls) below)
3. Copy URL:
   - `Webify Markdown LAN Server: Copy LAN URL to clipboard`
4. Open on another device:
   - **`http://...`** by default, or **`https://...`** when HTTPS is enabled.

## HTTPS (TLS)

You can serve the LAN site over **HTTPS** instead of plain HTTP.

### Enable in Obsidian

1. Create two PEM files: a certificate and an unencrypted private key (steps below).
2. Put both files somewhere **inside your vault** (for example `.webify-ssl/`).
3. Open **Settings** for this plugin, turn **Use HTTPS (TLS)** on.
4. Set **HTTPS certificate path** and **HTTPS private key path** as **vault-relative** paths—the same kind of paths as **Root folder** (e.g. `.webify-ssl/cert.pem` and `.webify-ssl/key.pem`).
5. **Restart the server** (stop and start, or toggle off/on if you changed TLS settings).

The copied URL and status bar use `https://` when HTTPS is on. Private keys **must not** use a passphrase in this version of the plugin (PEM **without** encryption).

### Troubleshooting

- **Wrong IP (`…255`):** On many networks (e.g. `192.168.0.x` with a normal mask), **`x.255` is the subnet broadcast address**, not your PC. The site will not load there. Run `ipconfig` on the computer that hosts Obsidian and use that machine’s **IPv4 Address** (often something like `192.168.0.37`), or run **Copy LAN URL to clipboard** so the plugin inserts the detected IP.
- **HTTP vs HTTPS:** If HTTPS is disabled in settings, **`https://` URLs will not work** — use **`http://`**, or turn on TLS and restart the server. When TLS is active, the status bar shows **`https`** next to the port.
- **PEM paths:** Paths are **vault-relative** (forward slashes are fine). If the cert or key is missing or unreadable, Obsidian shows a Notice starting with `HTTPS:` and the server stays off until you fix the paths and restart.

### Self-signed certificate (quick, LAN-friendly)

#### Option A: Fastest and easy way to create certificate using mkcert

mkcert installs a local CA and mints certs browsers trust on that machine:

1. Use [mkcert](https://github.com/FiloSottile/mkcert)
   - You can use the instructions to install mkcert
   - Alternatively, download the executable from: [mkcert binaries](https://github.com/FiloSottile/mkcert/releases)
2. Run the following commands
   - command#1: ```mkcert -install```
   - command#2: ```mkcert <your local LAN ip address where Obsidian vault resides>``` e.g.: ```mkcert 192.168.0.205```
3. This will generate two PEM files: a certificate (`localhost+1.pem`) and an unencrypted private key file (`localhost+1-key.pem`).
4. Copy/paste these files in a folder in your Obsidian Vault. For example: If you Vault is `C:\Obsidian\Vault`, create a folder called `.certs` so your path looks like: `C:\Obsidian\Vault\.certs` and paste these files in this folder.
5. In the plugin settings
   - HTTPS certificate path
      - Set it to the `.certs\localhost+1.pem`
   - HTTPS private key path
      - Set it to the `.certs\localhost+1-key.pem`
6. Point your browser to: `https:\\<your local LAN ip address where Obsidian vault resides>:<Port number>`


#### Option B: Self-signed with OpenSSL (common for LAN)

Requires [OpenSSL](https://wiki.openssl.org/index.php/Binaries) installed. Run the commands **on your machine**, in an empty folder, then move `cert.pem` and `key.pem` into your vault.

**Minimal (browsers may warn “not trusted”):**

```bash
openssl req -x509 -newkey rsa:2048 -nodes -sha256 \
  -keyout key.pem -out cert.pem -days 825 \
  -subj "/CN=Webify LAN"
```

Windows **PowerShell** (single line):

```powershell
openssl req -x509 -newkey rsa:2048 -nodes -sha256 -keyout key.pem -out cert.pem -days 825 -subj "/CN=Webify LAN"
```

**Include your LAN IP in the certificate** (reduces TLS name warnings when opening by IP). Replace `192.168.0.10` with your PC’s IPv4:

```powershell
openssl req -x509 -newkey rsa:2048 -nodes -sha256 -keyout key.pem -out cert.pem -days 825 `
  -subj "/CN=Webify LAN" `
  -addext "subjectAltName=IP:192.168.0.10,DNS:localhost"
```

(OpenSSL 3 on Windows often supports `-addext`. If yours errors on `-addext`, search for **OpenSSL SAN config file** examples and generate the cert using a short config.)






### Trusting the site in the browser

Self-signed certs are normal for home LAN setups. Expect a browser warning until you proceed once (“Advanced → continue”) or install a trusted local CA. For smoother local trust across devices, tools like **[mkcert](https://github.com/FiloSottile/mkcert)** can mint locally trusted certs (advanced setup).

TLS **encrypts traffic on the wire**; it does **not** replace sensible access controls on shared networks—see **Security** below.

## Security

- The plugin is read-only: it does not expose `POST`, `PUT`, or `DELETE` endpoints.
- HTTPS protects against casual eavesdropping on your LAN path; pairing with basic auth still matters when anyone on the network can reach your PC.
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
