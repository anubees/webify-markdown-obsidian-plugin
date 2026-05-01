// Routes LAN HTTP GETs: `/_…` utility endpoints, vault folder/note URLs, HTML shell assembly, and JSON search.
//
// #region << Imports >>
import type { Dirent } from "fs";
import type { IncomingMessage, ServerResponse } from "http";
import * as fs from "fs";
import * as path from "path";
import { URL } from "url";
import type { IFolderEntry } from "../interfaces/i-folder-entry";
import type { IFolderTreeNode } from "../interfaces/i-folder-tree-node";
import type { IPageShellData } from "../interfaces/i-page-shell-data";
import type { IStartServerOptions } from "../interfaces/i-start-server-options";
import { STYLE_CSS } from "../css/style";
import {
  renderFavoritesSection,
  renderFolderContent,
  renderIndexContent,
  renderNotFoundContent,
  renderNoteContent,
  renderPageShell
} from "../templates";
import {
  directoryExists,
  encodePathForUrl,
  fileExists,
  isSafeExtension,
  mimeTypeFor,
  safeResolveWithinRoot
} from "../utils";
import { WmplsAuthService } from "./wmpls-auth-service";
import type { ShellChrome } from "./wmpls-http-context";
import {
  findAssetByBasename,
  getScopedFavorites,
  loadVaultBrowseContext,
  safeRedirectLocation,
  shellChrome
} from "./wmpls-http-context";
import {
  MIME,
  respondBuffer,
  respondHtml,
  respondJson,
  respondRedirect,
  respondText,
  respondUnauthorizedBasic
} from "./wmpls-http-responses";
import { WmplsMarkdownRendererService } from "./wmpls-markdown-renderer-service";
import { WmplsSearchService } from "./wmpls-search-service";
import { wmplsFileTreeService } from "./wmpls-file-tree-service";
// #endregion << Imports >>

// HTTP routing for the LAN browse UI: vault-relative URLs serve markdown notes and folder listings;
// underscored paths (`/_static`, `/_search`, `/_assets`, etc.) are plugin endpoints. Every HTML page
// shares the same shell (theme + file tree + favorites); handlers combine `shellChrome` + body fields.

// #region << Functions >>
// Page body for renderPageShell excluding theme/sidebar chrome fields (those come from shellChrome).
type PageShellBody = Omit<IPageShellData, keyof ShellChrome>;

// Builds full HTML for the page shell from settings chrome + route-specific fields.
function pageShellHtml(options: IStartServerOptions, body: PageShellBody): string {
  return renderPageShell({ ...shellChrome(options), ...body });
}

// Builds sidebar tree + favorites HTML; activePath expands matching folders and highlights favorites.
function sidebarHtml(
  options: IStartServerOptions,
  markdownFiles: string[],
  tree: IFolderTreeNode,
  activePath = ""
): { treeHtml: string; favoritesHtml: string } {
  const treeHtml = wmplsFileTreeService.renderTreeHtml(tree, activePath);
  const favoritesHtml = renderFavoritesSection(
    getScopedFavorites(options.getFavoritePaths(), markdownFiles),
    activePath
  );
  return { treeHtml, favoritesHtml };
}

// Candidate relative paths to try when resolving a note URL (with or without .md).
function markdownPathCandidates(requestedRelative: string): string[] {
  // If the URL already names an extension, do not append another.
  return requestedRelative.match(/\.(md|markdown)$/i)
    ? [requestedRelative]
    : [`${requestedRelative}.md`, `${requestedRelative}.markdown`, requestedRelative];
}

// Returns the first markdown path under root that exists on disk, or null.
async function resolveExistingMarkdownRelative(
  rootAbsolutePath: string,
  requestedRelative: string
): Promise<string | null> {
  for (const candidate of markdownPathCandidates(requestedRelative)) {
    const safeAbsolute = safeResolveWithinRoot(rootAbsolutePath, candidate);
    if (!safeAbsolute || !isSafeExtension(safeAbsolute)) continue;
    if (await fileExists(safeAbsolute)) return candidate;
  }
  return null;
}

// Maps directory entries to folder index rows (folders first, then notes).
function folderEntriesFromDirents(folderRelative: string, entries: Dirent[]): IFolderEntry[] {
  return entries
    .filter((entry) => entry.isDirectory() || /\.(md|markdown)$/i.test(entry.name))
    .map((entry) => ({
      path: folderRelative ? `${folderRelative}/${entry.name}` : entry.name,
      name: entry.name,
      isDirectory: entry.isDirectory()
    }))
    .sort((a, b) => {
      if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
}

// Handles the HTTP request (dispatches by path after GET + optional Basic auth).
export async function handleRequest(
  req: IncomingMessage,
  res: ServerResponse,
  options: IStartServerOptions
): Promise<void> {
  // Read-only API: browsers only issue GET for navigation, assets, and JSON search.
  if (req.method !== "GET") {
    respondText(res, 405, "Method Not Allowed");
    return;
  }

  if (options.settings.enableBasicAuth) {
    const ok = WmplsAuthService.validateBasicAuth(
      req,
      options.settings.authUsername,
      options.settings.authPassword
    );
    if (!ok) {
      respondUnauthorizedBasic(res);
      return;
    }
  }

  // Parse path + query; base URL is arbitrary — only pathname/searchParams are used.
  const requestUrl = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);
  const routePath = decodeURIComponent(requestUrl.pathname);

  // Bundled stylesheet (injected into templates from STYLE_CSS).
  if (routePath === "/_static/style.css") {
    respondBuffer(res, 200, MIME.CSS, Buffer.from(STYLE_CSS, "utf8"));
    return;
  }

  // No favicon asset bundled — empty 204 avoids noisy 404s in the browser network tab.
  if (routePath === "/favicon.ico") {
    respondBuffer(res, 204, MIME.ICON, Buffer.alloc(0));
    return;
  }

  // Live search for the sidebar UI; returns JSON `{ query, results }` without a full page reload.
  if (routePath === "/_search") {
    const markdownFiles = await wmplsFileTreeService.listMarkdownFiles(options.rootAbsolutePath);
    const q = requestUrl.searchParams.get("q") ?? "";
    const results = await WmplsSearchService.searchMarkdown(options.rootAbsolutePath, markdownFiles, q);
    respondJson(res, 200, { query: q, results });
    return;
  }

  // GET link from the note chrome: toggles favorite for `path`, then redirects back to `redirect`.
  if (routePath === "/_favorites/toggle") {
    const relativePath = (requestUrl.searchParams.get("path") ?? "").replace(/^\/+/, "");
    const redirectTo = requestUrl.searchParams.get("redirect") ?? "/";
    if (relativePath) await options.toggleFavoritePath(relativePath);
    respondRedirect(res, safeRedirectLocation(redirectTo));
    return;
  }

  // Attachments and images referenced from markdown; path is vault-relative after `/_assets/`.
  if (routePath.startsWith("/_assets/")) {
    await handleAssetRequest(res, options.rootAbsolutePath, routePath.slice("/_assets/".length));
    return;
  }

  // Landing page: same shell as vault routes but fixed index body.
  if (routePath === "/") {
    const { markdownFiles, tree } = await loadVaultBrowseContext(options.rootAbsolutePath);
    const { treeHtml, favoritesHtml } = sidebarHtml(options, markdownFiles, tree);
    respondHtml(
      res,
      200,
      pageShellHtml(options, {
        title: "Index",
        treeHtml,
        favoritesHtml,
        contentHtml: renderIndexContent(),
        favoriteTogglePath: null,
        isCurrentFavorite: false
      })
    );
    return;
  }

  // Everything else is interpreted as a vault-relative path: trailing `/` means folder listing.
  const requestedRelative = routePath.replace(/^\/+/, "");
  if (requestedRelative.endsWith("/")) {
    await handleFolderRoute(res, options, requestedRelative);
    return;
  }

  await handleNoteRoute(res, options, requestedRelative);
}

// Handles the asset request (/_assets/..., with basename fallback for pasted images).
async function handleAssetRequest(
  res: ServerResponse,
  rootAbsolutePath: string,
  requestedRelative: string
): Promise<void> {
  const safeAbsolute = safeResolveWithinRoot(rootAbsolutePath, requestedRelative);
  // Block path traversal and extension allow-list misses before touching disk.
  if (!safeAbsolute || !isSafeExtension(safeAbsolute)) {
    respondText(res, 403, "Forbidden");
    return;
  }
  // Obsidian often stores images under `attachments/` while notes reference only the filename.
  if (!(await fileExists(safeAbsolute))) {
    const fallback = await findAssetByBasename(rootAbsolutePath, path.posix.basename(requestedRelative));
    if (!fallback) {
      respondText(res, 404, "Not found");
      return;
    }
    const data = await fs.promises.readFile(fallback);
    respondBuffer(res, 200, mimeTypeFor(fallback), data);
    return;
  }
  const data = await fs.promises.readFile(safeAbsolute);
  respondBuffer(res, 200, mimeTypeFor(safeAbsolute), data);
}

// Handles the folder request (trailing slash routes — listing or 404 shell).
async function handleFolderRoute(
  res: ServerResponse,
  options: IStartServerOptions,
  folderRelativePath: string
): Promise<void> {
  const { markdownFiles, tree } = await loadVaultBrowseContext(options.rootAbsolutePath);
  // Normalize `foo/` / `foo///` → `foo` for filesystem checks and child paths.
  const folderRelative = folderRelativePath.replace(/\/+$/, "");
  const { treeHtml, favoritesHtml } = sidebarHtml(options, markdownFiles, tree, folderRelative);
  const safeAbsolute = safeResolveWithinRoot(options.rootAbsolutePath, folderRelative);

  if (!safeAbsolute || !(await directoryExists(safeAbsolute))) {
    respondHtml(
      res,
      404,
      pageShellHtml(options, {
        title: "404",
        treeHtml,
        favoritesHtml,
        contentHtml: renderNotFoundContent(folderRelativePath),
        favoriteTogglePath: null,
        isCurrentFavorite: false
      })
    );
    return;
  }

  // Show subfolders + markdown files only; names sorted with directories first.
  const entries = await fs.promises.readdir(safeAbsolute, { withFileTypes: true });
  const children = folderEntriesFromDirents(folderRelative, entries);
  respondHtml(
    res,
    200,
    pageShellHtml(options, {
      title: folderRelative || "Vault",
      treeHtml,
      favoritesHtml,
      contentHtml: renderFolderContent(folderRelative, children),
      favoriteTogglePath: null,
      isCurrentFavorite: false
    })
  );
}

// Handles the note request (markdown render, favorites toggle link, canonical route hint).
async function handleNoteRoute(
  res: ServerResponse,
  options: IStartServerOptions,
  requestedRelative: string
): Promise<void> {
  const { markdownFiles, tree } = await loadVaultBrowseContext(options.rootAbsolutePath);
  // URL may omit `.md` or use `.markdown`; pick the first on-disk match.
  const selectedRelative = await resolveExistingMarkdownRelative(options.rootAbsolutePath, requestedRelative);

  if (!selectedRelative) {
    const { treeHtml, favoritesHtml } = sidebarHtml(options, markdownFiles, tree, requestedRelative);
    respondHtml(
      res,
      404,
      pageShellHtml(options, {
        title: "404",
        treeHtml,
        favoritesHtml,
        contentHtml: renderNotFoundContent(requestedRelative),
        favoriteTogglePath: null,
        isCurrentFavorite: false
      })
    );
    return;
  }

  // Double-check traversal guard after alias resolution (should match resolve step).
  const selectedAbsolute = safeResolveWithinRoot(options.rootAbsolutePath, selectedRelative);
  if (!selectedAbsolute) {
    respondText(res, 403, "Forbidden");
    return;
  }

  const markdown = await fs.promises.readFile(selectedAbsolute, "utf8");
  const rendered = await WmplsMarkdownRendererService.renderMarkdownToHtml(markdown, {
    currentNotePath: selectedRelative.replace(/\\/g, "/"),
    markdownFiles
  });
  // Extensionless URL is the preferred bookmark/share link; shown below the note body.
  const canonicalRoute = encodePathForUrl(selectedRelative.replace(/\.(md|markdown)$/i, ""));
  const { treeHtml, favoritesHtml } = sidebarHtml(options, markdownFiles, tree, selectedRelative);
  const favorites = getScopedFavorites(options.getFavoritePaths(), markdownFiles);
  const normalizedSelected = selectedRelative.replace(/\\/g, "/");
  const isCurrentFavorite = favorites.includes(normalizedSelected);
  const favoriteTogglePath = `/_favorites/toggle?path=${encodeURIComponent(normalizedSelected)}&redirect=/${canonicalRoute}`;

  // Inject a small “canonical route” hint before </main> without changing renderPageShell template.
  const html = pageShellHtml(options, {
    title: rendered.title,
    treeHtml,
    favoritesHtml,
    contentHtml: renderNoteContent(rendered.title, rendered.frontmatterHtml, rendered.html),
    favoriteTogglePath,
    isCurrentFavorite
  }).replace(
    "</main>",
    `<p class="lws-empty">Route: <a href="/${canonicalRoute}">/${canonicalRoute}</a></p></main>`
  );
  respondHtml(res, 200, html);
}
// #endregion << Functions >>
