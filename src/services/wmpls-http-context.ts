// Shared browse context for HTML routes: shell labels, markdown tree snapshot, favorites scoping, asset basename fallback.
//
// #region << Imports >>
import * as fs from "fs";
import * as path from "path";
import type { IFolderTreeNode } from "../interfaces/i-folder-tree-node";
import type { IPageShellData } from "../interfaces/i-page-shell-data";
import type { IStartServerOptions } from "../interfaces/i-start-server-options";
import { wmplsFileTreeService } from "./wmpls-file-tree-service";
import { isSafeExtension } from "../utils";
// #endregion << Imports >>

// Shared data for HTML handlers: sidebar/tree loading, favorite scoping, safe redirects, and
// attachment basename fallback used when markdown links do not match vault-relative paths.

// #region << Functions >>
// Shell fields repeated on every HTML page (from plugin settings).
export type ShellChrome = Pick<IPageShellData, "servedRootLabel" | "servedRootName" | "themeMode">;

// Human-readable name for the served folder scope (last segment or "Vault root").
function scopeName(rootFolder: string): string {
  const normalized = rootFolder.trim().replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");
  if (!normalized) return "Vault root";
  const parts = normalized.split("/").filter(Boolean);
  return parts[parts.length - 1] ?? "Vault root";
}

// Theme + scope labels for renderPageShell.
export function shellChrome(options: IStartServerOptions): ShellChrome {
  return {
    servedRootLabel: options.settings.rootFolder.trim() || "Vault root",
    servedRootName: scopeName(options.settings.rootFolder),
    themeMode: options.settings.theme
  };
}

// Lists markdown paths and builds the sidebar tree (refreshed per request for live vault updates).
export async function loadVaultBrowseContext(rootAbsolutePath: string): Promise<{
  markdownFiles: string[];
  tree: IFolderTreeNode;
}> {
  const markdownFiles = await wmplsFileTreeService.listMarkdownFiles(rootAbsolutePath);
  const tree = await wmplsFileTreeService.buildFileTree(rootAbsolutePath);
  return { markdownFiles, tree };
}

// Keeps only favorites that still exist under the current served scope.
export function getScopedFavorites(favorites: string[], markdownFiles: string[]): string[] {
  const inScope = new Set(markdownFiles);
  return favorites.filter((favorite) => inScope.has(favorite.replace(/\\/g, "/")));
}

// Ensures redirect Location is absolute-path safe for HTTP headers (encodeURI).
export function safeRedirectLocation(raw: string): string {
  const normalized = raw.startsWith("/") ? raw : `/${raw}`;
  return encodeURI(normalized);
}

// Finds a single file by basename under scope when direct path lookup fails (e.g. image embeds).
// Returns null if zero or multiple matches — ambiguous names are not guessed.
export async function findAssetByBasename(rootAbsolutePath: string, basename: string): Promise<string | null> {
  const wanted = basename.trim().toLowerCase();
  if (!wanted) return null;
  const matches: string[] = [];
  await walkFiles(rootAbsolutePath, async (absolutePath) => {
    if (!isSafeExtension(absolutePath)) return;
    if (path.basename(absolutePath).toLowerCase() === wanted) {
      matches.push(absolutePath);
    }
  });
  if (matches.length !== 1) return null;
  return matches[0];
}

// Depth-first walk of files under root (skips dot dirs/files); used only for basename asset lookup.
async function walkFiles(
  currentDir: string,
  onFile: (absolutePath: string) => Promise<void> | void
): Promise<void> {
  const entries = await fs.promises.readdir(currentDir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;
    const absolutePath = path.resolve(currentDir, entry.name);
    if (entry.isDirectory()) {
      await walkFiles(absolutePath, onFile);
    } else if (entry.isFile()) {
      await onFile(absolutePath);
    }
  }
}
// #endregion << Functions >>
