// Server-side HTML composition: stitches imported HTML fragments into pages, lists, favorites, and note chrome.
//
// #region << Imports >>
import type { IFolderEntry } from "./interfaces/i-folder-entry";
import type { IPageShellData } from "./interfaces/i-page-shell-data";
import { renderClientScript } from "./scripts/client-script";
import { renderThemeScript } from "./scripts/theme-script";
import { encodePathForUrl } from "./utils";
import favoriteItemHtml from "./html/favorite-item.html";
import favoriteToggleLinkHtml from "./html/favorite-toggle-link.html";
import favoritesEmptyHtml from "./html/favorites-empty.html";
import favoritesListCloseHtml from "./html/favorites-list-close.html";
import favoritesListOpenHtml from "./html/favorites-list-open.html";
import folderEntryItemHtml from "./html/folder-entry-item.html";
import folderIndexHtml from "./html/folder-index.html";
import indexIntroHtml from "./html/index-intro.html";
import notFoundHtml from "./html/not-found.html";
import noteArticleHtml from "./html/note-article.html";
import pageShellHtml from "./html/page-shell.html";
// #endregion << Imports >>

// #region << Functions >>

// Renders the favorites section
export function renderFavoritesSection(favorites: string[], activePath = ""): string {
  if (!favorites.length) {
    return favoritesEmptyHtml.trim();
  }
  const normalizedActive = activePath.replace(/\\/g, "/").replace(/^\/+/, "");
  const list = favorites
    .map((relativePath) => {
      const route = relativePath.replace(/\.(md|markdown)$/i, "");
      const href = `/${encodePathForUrl(route)}`;
      const label = relativePath.split("/").pop() ?? relativePath;
      const activeClass = relativePath === normalizedActive ? " lws-active" : "";
      return applyHtml(favoriteItemHtml.trim(), {
        ACTIVE_CLASS: activeClass,
        HREF: href,
        LABEL: escapeHtml(label)
      });
    })
    .join("");
  return `${favoritesListOpenHtml.trim()}${list}${favoritesListCloseHtml.trim()}`;
}

// Renders the page shell
export function renderPageShell(data: IPageShellData): string {
  const scopePathBlock =
    data.servedRootLabel !== data.servedRootName
      ? `<div class="lws-scope-path">${escapeHtml(data.servedRootLabel)}</div>`
      : "";
  const favoriteToggleBlock =
    data.favoriteTogglePath !== null
      ? applyHtml(favoriteToggleLinkHtml.trim(), {
          HREF: data.favoriteTogglePath,
          LABEL: data.isCurrentFavorite ? "★ Remove favorite" : "☆ Add favorite"
        })
      : "";
  return applyHtml(pageShellHtml.trim(), {
    TITLE: escapeHtml(data.title),
    VAULT_TITLE: escapeHtml(data.vaultTitle),
    SERVED_ROOT_NAME: escapeHtml(data.servedRootName),
    SCOPE_PATH_BLOCK: scopePathBlock,
    FAVORITES_HTML: data.favoritesHtml,
    TREE_HTML: data.treeHtml,
    FAVORITE_TOGGLE_BLOCK: favoriteToggleBlock,
    CONTENT_HTML: data.contentHtml,
    THEME_SCRIPT: renderThemeScript(data.themeMode),
    CLIENT_SCRIPT: renderClientScript()
  });
}

// Renders the note content
export function renderNoteContent(title: string, frontmatterHtml: string, noteHtml: string): string {
  const shouldShowFileTitle = !containsTopLevelHeading(noteHtml);
  const titleBlock = shouldShowFileTitle ? `<h1>${escapeHtml(title)}</h1>` : "";
  return applyHtml(noteArticleHtml.trim(), {
    TITLE_BLOCK: titleBlock,
    FRONTMATTER_HTML: frontmatterHtml,
    NOTE_HTML: noteHtml
  });
}

// Renders the folder content
export function renderFolderContent(folderPath: string, children: IFolderEntry[]): string {
  const normalized = folderPath.replace(/^\/+/, "").replace(/\/+$/, "");
  const listItems = children
    .map((child) => {
      const encodedPath = encodePathForUrl(child.path.replace(/\.(md|markdown)$/i, ""));
      const href = child.isDirectory ? `/${encodedPath}/` : `/${encodedPath}`;
      const icon = child.isDirectory ? "📁" : "📝";
      const badge = child.isDirectory ? "Folder" : "Note";
      const kindClass = child.isDirectory ? "is-folder" : "is-article";
      return applyHtml(folderEntryItemHtml.trim(), {
        KIND_CLASS: kindClass,
        HREF: href,
        ICON: icon,
        NAME: escapeHtml(child.name),
        BADGE: badge
      });
    })
    .join("");
  return applyHtml(folderIndexHtml.trim(), {
    HEADING: escapeHtml(normalized || "Vault root"),
    LIST_ITEMS: listItems
  });
}

// Renders the index content
export function renderIndexContent(): string {
  return indexIntroHtml.trim();
}

// Renders the not found content
export function renderNotFoundContent(requestPath: string): string {
  return applyHtml(notFoundHtml.trim(), {
    REQUEST_PATH: escapeHtml(requestPath)
  });
}

// Applies the HTML variables to the template
function applyHtml(template: string, vars: Record<string, string>): string {
  let out = template;
  for (const [key, val] of Object.entries(vars)) {
    out = out.replaceAll(`{{${key}}}`, val);
  }
  return out;
}

// Escapes the HTML
function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

// Checks if the HTML contains a top level heading
function containsTopLevelHeading(html: string): boolean {
  return /<h1\b[^>]*>/i.test(html);
}

// #endregion << Functions >>
