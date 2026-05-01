// Bundled LAN UI stylesheet string inlined into HTTP responses at `/_static/style.css`.
//
export const STYLE_CSS = `
:root {
  --lws-bg: #f8fafc;
  --lws-text: #1e293b;
  --lws-muted: #64748b;
  --lws-border: #dbe4f0;
  --lws-panel: #eef4ff;
  --lws-link: #0f766e;
  --lws-code-bg: #eaf2ff;
  --lws-folder-top: #0f172a;
  --lws-folder-parent: #1e3a8a;
  --lws-folder-child: #334155;
  --lws-article: #475569;
  --lws-folder-chip-bg: #dbeafe;
  --lws-article-chip-bg: #dcfce7;
  --lws-tree-line: #7c93b6;
}

body.theme-dark {
  --lws-bg: #0b1220;
  --lws-text: #dbeafe;
  --lws-muted: #93a4bf;
  --lws-border: #203252;
  --lws-panel: #12213a;
  --lws-link: #5eead4;
  --lws-code-bg: #132743;
  --lws-folder-top: #dbeafe;
  --lws-folder-parent: #bfdbfe;
  --lws-folder-child: #93c5fd;
  --lws-article: #cbd5e1;
  --lws-folder-chip-bg: #1e3a8a;
  --lws-article-chip-bg: #14532d;
  --lws-tree-line: #5f7aa5;
}

body {
  margin: 0;
  background: var(--lws-bg);
  color: var(--lws-text);
  font-family: "Inter", "Segoe UI", system-ui, -apple-system, sans-serif;
  height: 100vh;
  overflow: hidden;
}

a {
  color: var(--lws-link);
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

.lws-app {
  --lws-sidebar-width: 320px;
  display: grid;
  grid-template-columns: var(--lws-sidebar-width) 8px 1fr;
  height: 100vh;
}

.lws-sidebar {
  border-right: 1px solid var(--lws-border);
  padding: 12px;
  background: var(--lws-panel);
  overflow-x: hidden;
  overflow-y: scroll;
  scrollbar-gutter: stable both-edges;
  scrollbar-width: thin;
  scrollbar-color: color-mix(in srgb, var(--lws-link) 45%, var(--lws-muted)) color-mix(in srgb, var(--lws-panel) 88%, transparent);
}

.lws-sidebar::-webkit-scrollbar {
  width: 12px;
}

.lws-sidebar::-webkit-scrollbar-track {
  background: color-mix(in srgb, var(--lws-panel) 88%, transparent);
  border-left: 1px solid var(--lws-border);
}

.lws-sidebar::-webkit-scrollbar-thumb {
  background: color-mix(in srgb, var(--lws-link) 50%, var(--lws-muted));
  border: 2px solid color-mix(in srgb, var(--lws-panel) 88%, transparent);
  border-radius: 999px;
}

.lws-sidebar::-webkit-scrollbar-thumb:hover {
  background: color-mix(in srgb, var(--lws-link) 75%, var(--lws-text));
}

.lws-sidebar h2 {
  margin-top: 0;
  margin-bottom: 0.35rem;
}

.lws-scope {
  font-size: 0.82rem;
  color: var(--lws-muted);
  margin-bottom: 0.2rem;
}

.lws-scope-path {
  font-size: 0.76rem;
  color: color-mix(in srgb, var(--lws-muted) 88%, var(--lws-text));
  margin-bottom: 0.7rem;
  word-break: break-word;
}

.lws-favorites {
  margin-bottom: 0.95rem;
  padding: 0.55rem 0.6rem;
  border: 1px solid color-mix(in srgb, var(--lws-link) 45%, var(--lws-border));
  border-left: 4px solid var(--lws-link);
  border-radius: 12px;
  background: color-mix(in srgb, var(--lws-link) 10%, var(--lws-panel));
  box-shadow: 0 2px 10px color-mix(in srgb, var(--lws-link) 12%, transparent);
}

.lws-favorites h3 {
  margin: 0 0 0.45rem;
  font-size: 0.95rem;
  letter-spacing: 0.01em;
}

.lws-favorites ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.lws-favorite-link {
  display: block;
  padding: 5px 7px;
  border-radius: 6px;
  color: var(--lws-text);
  font-weight: 500;
}

.lws-favorite-link:hover {
  background: color-mix(in srgb, var(--lws-link) 13%, transparent);
  text-decoration: none;
}

.lws-resizer {
  cursor: col-resize;
  background: color-mix(in srgb, var(--lws-border) 75%, transparent);
  transition: background 120ms ease;
}

.lws-resizer:hover {
  background: color-mix(in srgb, var(--lws-link) 35%, var(--lws-border));
}

body.lws-resizing {
  user-select: none;
  cursor: col-resize;
}

.lws-main {
  padding: 20px;
  overflow: auto;
}

.lws-content {
  max-width: none;
  width: 100%;
  line-height: 1.72;
  font-size: 1.04rem;
  font-family: "Iowan Old Style", "Palatino Linotype", "Book Antiqua", Palatino, "Noto Serif", serif;
}

.lws-content > * {
  max-width: 100%;
}

.lws-content h1,
.lws-content h2,
.lws-content h3 {
  line-height: 1.28;
}

.lws-content h1 {
  margin: 0 0 0.8rem;
  padding-bottom: 0.45rem;
  border-bottom: 1px solid var(--lws-border);
}

.lws-content h2 {
  margin-top: 1.9rem;
  margin-bottom: 0.55rem;
  padding: 0.35rem 0.6rem;
  border-left: 4px solid var(--lws-link);
  border: 1px solid color-mix(in srgb, var(--lws-link) 55%, var(--lws-border));
  border-left-width: 4px;
  border-radius: 8px;
  background: color-mix(in srgb, var(--lws-link) 12%, transparent);
}

.lws-content h3 {
  margin-top: 1.4rem;
  margin-bottom: 0.45rem;
  padding: 0.22rem 0.5rem;
  color: color-mix(in srgb, var(--lws-text) 86%, var(--lws-link));
  border-left: 3px solid color-mix(in srgb, var(--lws-link) 75%, var(--lws-border));
  border-radius: 6px;
  background: color-mix(in srgb, var(--lws-link) 8%, transparent);
}

.lws-content h4 {
  margin-top: 1.05rem;
  margin-bottom: 0.4rem;
  padding-left: 0.45rem;
  font-size: 1.01rem;
  color: color-mix(in srgb, var(--lws-text) 80%, var(--lws-link));
  border-left: 2px dashed color-mix(in srgb, var(--lws-link) 65%, var(--lws-border));
}

.lws-content p,
.lws-content ul,
.lws-content ol,
.lws-content pre,
.lws-content blockquote,
.lws-content table {
  margin-top: 0.65rem;
  margin-bottom: 0.9rem;
}

.lws-content ul,
.lws-content ol {
  padding-left: 1.45rem;
}

.lws-content blockquote {
  margin-left: 0;
  padding: 0.5rem 0.9rem;
  border-left: 4px solid var(--lws-border);
  background: color-mix(in srgb, var(--lws-panel) 65%, transparent);
  border-radius: 6px;
}

.lws-content hr {
  border: 0;
  border-top: 1px solid var(--lws-border);
  margin: 1.25rem 0;
}

.lws-content table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid var(--lws-border);
  border-radius: 8px;
  overflow: hidden;
}

.lws-content th,
.lws-content td {
  border: 1px solid var(--lws-border);
  padding: 0.5rem 0.65rem;
  vertical-align: top;
}

.lws-content th {
  background: color-mix(in srgb, var(--lws-panel) 75%, transparent);
  text-align: left;
  font-weight: 700;
}

.lws-content tr:nth-child(even) td {
  background: color-mix(in srgb, var(--lws-panel) 35%, transparent);
}

.lws-toolbar {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.lws-toolbar input {
  flex: 1;
  min-width: 180px;
  border: 1px solid var(--lws-border);
  background: var(--lws-bg);
  color: var(--lws-text);
  border-radius: 8px;
  padding: 8px 10px;
}

.lws-toolbar button {
  border: 1px solid var(--lws-border);
  background: var(--lws-panel);
  color: var(--lws-text);
  border-radius: 8px;
  padding: 8px 10px;
  cursor: pointer;
}

.lws-toolbar-link {
  border: 1px solid var(--lws-border);
  background: var(--lws-panel);
  color: var(--lws-text);
  border-radius: 8px;
  padding: 8px 10px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-weight: 600;
}

.lws-toolbar-link:hover {
  text-decoration: none;
  background: color-mix(in srgb, var(--lws-link) 12%, transparent);
}

.lws-meta {
  border: 1px solid var(--lws-border);
  background: var(--lws-panel);
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 14px;
}

.lws-content img,
.lws-content video {
  max-width: 100%;
}

.lws-content pre {
  padding: 12px;
  overflow: auto;
  border-radius: 8px;
  background: var(--lws-code-bg);
}

.lws-content code {
  background: var(--lws-code-bg);
  padding: 2px 6px;
  border-radius: 6px;
}

.lws-tree ul {
  list-style: none;
  margin: 0;
  padding-left: 16px;
  margin-left: 2px;
  border-left: 2px solid var(--lws-tree-line);
}

.lws-tree li {
  margin: 3px 0;
  position: relative;
}

.lws-tree li::before {
  content: "";
  position: absolute;
  left: -10px;
  top: 0.95em;
  width: 10px;
  border-top: 2px solid var(--lws-tree-line);
}

.lws-tree details > summary {
  cursor: pointer;
  list-style: none;
}

.lws-tree details > summary::-webkit-details-marker {
  display: none;
}

.lws-tree details > summary::before {
  content: "❯";
  color: color-mix(in srgb, var(--lws-link) 90%, var(--lws-text));
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.25em;
  margin-right: 5px;
  font-size: 1.28rem;
  font-weight: 800;
  line-height: 1;
  transition: transform 120ms ease;
}

.lws-tree details[open] > summary::before {
  transform: rotate(90deg);
}

.lws-tree a {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 8px;
  border-radius: 6px;
}

.lws-tree a:hover {
  background: color-mix(in srgb, var(--lws-link) 10%, transparent);
  text-decoration: none;
}

.lws-tree-item {
  min-width: 0;
}

.lws-tree-icon {
  width: 1.1rem;
  text-align: center;
  opacity: 0.9;
  flex: 0 0 auto;
}

.lws-tree-label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.25;
}

.lws-tree a.lws-folder-top {
  color: var(--lws-folder-top);
  font-weight: 700;
}

.lws-tree a.lws-folder-parent {
  color: var(--lws-folder-parent);
  font-weight: 600;
}

.lws-tree a.lws-folder-child {
  color: var(--lws-folder-child);
  font-weight: 500;
}

.lws-tree a.lws-article-link {
  color: var(--lws-article);
  font-weight: 400;
}

.lws-search-results {
  margin-top: 10px;
  border-top: 1px solid var(--lws-border);
  padding-top: 8px;
}

.lws-empty {
  color: var(--lws-muted);
}

.lws-tree a.lws-active {
  font-weight: 600;
  background: color-mix(in srgb, var(--lws-link) 18%, transparent);
  color: var(--lws-link);
  text-decoration: none;
}

.lws-folder-entry {
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--lws-border);
  border-radius: 10px;
  padding: 8px 10px;
  margin: 6px 0;
  background: color-mix(in srgb, var(--lws-panel) 55%, transparent);
}

.lws-folder-entry.is-folder {
  color: var(--lws-folder-parent);
}

.lws-folder-entry.is-article {
  color: var(--lws-article);
}

.lws-folder-entry:hover {
  background: color-mix(in srgb, var(--lws-link) 16%, transparent);
}

.lws-folder-entry-icon {
  width: 1.2rem;
  text-align: center;
}

.lws-folder-entry-label {
  flex: 1;
}

.lws-folder-entry-badge {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  border-radius: 999px;
  padding: 2px 8px;
}

.lws-folder-entry.is-folder .lws-folder-entry-badge {
  background: var(--lws-folder-chip-bg);
  color: #dbeafe;
}

.lws-folder-entry.is-article .lws-folder-entry-badge {
  background: var(--lws-article-chip-bg);
  color: #dcfce7;
}

@media (max-width: 900px) {
  .lws-app {
    grid-template-columns: 1fr;
  }

  .lws-sidebar {
    border-right: none;
    border-bottom: 1px solid var(--lws-border);
  }

  .lws-resizer {
    display: none;
  }
}
`;
