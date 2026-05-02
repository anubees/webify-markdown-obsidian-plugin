// Vault/path safety, extension allow-list, MIME hints, URL encoding for routes, and Obsidian vault path helpers.
//
// #region << Imports >>
import * as path from "path";
import * as fs from "fs";
import type { Vault } from "obsidian";
// #endregion << Imports >>
export const SAFE_EXTENSIONS = new Set<string>([
  ".md",
  ".markdown",
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".svg",
  ".pdf",
  ".mp3",
  ".mp4",
  ".webm",
  ".css",
  ".js",
  ".woff2"
]);

const MIME_MAP: Record<string, string> = {
  ".md": "text/markdown; charset=utf-8",
  ".markdown": "text/markdown; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
  ".mp3": "audio/mpeg",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".woff2": "font/woff2"
};

// Returns the desktop filesystem root for the current vault
export function getVaultBasePath(vault: Vault): string {
  const adapter = vault.adapter as { getBasePath?: () => string };
  if (typeof adapter.getBasePath !== "function") {
    throw new Error("Webify Markdown LAN Server only supports desktop vaults.");
  }
  return adapter.getBasePath();
}

// Normalizes a user-configured root folder into a vault-relative POSIX path
export function normalizeRootFolder(raw: string): string {
  const cleaned = raw.trim().replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");
  return cleaned;
}

// Builds the absolute path for the configured root folder
export function getRootAbsolutePath(vaultBase: string, rootFolder: string): string {
  if (!rootFolder) return vaultBase;
  return path.resolve(vaultBase, rootFolder);
}

// Resolves a vault-relative POSIX path against the vault root; rejects traversal outside the vault.
export function resolveVaultRelativePath(vaultBase: string, vaultRelative: string): string | null {
  const normalized = normalizeRootFolder(vaultRelative);
  if (!normalized) return null;
  return safeResolveWithinRoot(vaultBase, normalized);
}

// Ensures a request path resolves inside the configured root folder
export function safeResolveWithinRoot(rootAbsolutePath: string, requestedPath: string): string | null {
  const sanitized = requestedPath.replace(/\\/g, "/").replace(/^\/+/, "");
  const absolute = path.resolve(rootAbsolutePath, sanitized);
  const rel = path.relative(rootAbsolutePath, absolute);
  if (rel.startsWith("..") || path.isAbsolute(rel)) return null;
  return absolute;
}

// Converts an absolute path to normalized vault-relative path
export function toVaultRelative(vaultBase: string, absolutePath: string): string {
  return path.relative(vaultBase, absolutePath).replace(/\\/g, "/");
}

// Converts path segments to URL-safe format while preserving hierarchy
export function encodePathForUrl(relativePath: string): string {
  return relativePath
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

// Returns true if extension is explicitly allowed for serving
export function isSafeExtension(filePath: string): boolean {
  return SAFE_EXTENSIONS.has(path.extname(filePath).toLowerCase());
}

// Returns MIME type for an allowed extension
export function mimeTypeFor(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  return MIME_MAP[ext] ?? "application/octet-stream";
}

// Asserts a path exists and is a file
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    const stat = await fs.promises.stat(filePath);
    return stat.isFile();
  } catch {
    return false;
  }
}

// Asserts a path exists and is a directory
export async function directoryExists(dirPath: string): Promise<boolean> {
  try {
    const stat = await fs.promises.stat(dirPath);
    return stat.isDirectory();
  } catch {
    return false;
  }
}
