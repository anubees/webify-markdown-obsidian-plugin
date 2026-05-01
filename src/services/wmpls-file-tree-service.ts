// Reads the served vault folder to list markdown paths, build nested tree data, and render collapsible sidebar HTML.
//
// #region << Imports >>
import * as fs from "fs";
import * as path from "path";
import type { IFolderTreeNode } from "../interfaces/i-folder-tree-node";
import { encodePathForUrl } from "../utils";
// #endregion << Imports >>
// #region << Functions >>
// Builds the vault sidebar tree, lists markdown paths, and renders tree HTML for the sidebar
export class WmplsFileTreeService {
  // Builds the vault sidebar tree
  async buildFileTree(rootAbsolutePath: string): Promise<IFolderTreeNode> {
    return {
      name: path.basename(rootAbsolutePath) || "Vault",
      relativePath: "",
      isDirectory: true,
      children: await this.readDirectoryNodes(rootAbsolutePath, "")
    };
  }

  // Lists the markdown files in the vault
  async listMarkdownFiles(rootAbsolutePath: string): Promise<string[]> {
    const result: string[] = [];
    await this.collectMarkdown(rootAbsolutePath, "", result);
    return result.sort((a, b) => a.localeCompare(b));
  }

  // Renders the tree HTML
  renderTreeHtml(node: IFolderTreeNode, activePath = ""): string {
    const normalizedActive = this.normalizePath(activePath);
    const children = node.children ?? [];
    return `<div class="lws-tree"><ul>${children
      .map((child) => this.renderNode(child, normalizedActive, 0))
      .join("")}</ul></div>`;
  }

  // Renders a node in the tree
  private renderNode(node: IFolderTreeNode, activePath: string, depth: number): string {
    const label = this.escapeHtml(node.name);
    const normalizedNodePath = this.normalizePath(node.relativePath);
    if (node.isDirectory) {
      const href = `/${encodePathForUrl(node.relativePath)}/`;
      const nested = (node.children ?? []).map((child) => this.renderNode(child, activePath, depth + 1)).join("");
      const shouldOpen = this.isMatchingBranch(normalizedNodePath, activePath);
      const openAttr = shouldOpen ? " open" : "";
      const levelClass = this.folderLevelClass(depth);
      return `<li class="lws-node lws-folder ${levelClass}"><details${openAttr}><summary><a class="${levelClass} lws-tree-item lws-tree-folder" href="${href}" data-nav-path="${this.escapeHtml(
        href
      )}"><span class="lws-tree-icon" aria-hidden="true">📁</span><span class="lws-tree-label">${label}</span></a></summary><ul>${nested}</ul></details></li>`;
    }
    const linkPath = node.relativePath.replace(/\.(md|markdown)$/i, "");
    const href = `/${encodePathForUrl(linkPath)}`;
    const isActive = this.normalizePath(linkPath) === activePath || normalizedNodePath === activePath;
    const activeClass = isActive ? " lws-active" : "";
    return `<li class="lws-node lws-article"><a class="lws-article-link lws-tree-item${activeClass}" href="${href}" data-nav-path="${this.escapeHtml(
      href
    )}"><span class="lws-tree-icon" aria-hidden="true">📝</span><span class="lws-tree-label">${label}</span></a></li>`;
  }

  private joinRelative(parentDir: string, name: string): string {
    return parentDir ? `${parentDir}/${name}` : name;
  }

  // Reads the directory nodes
  private async readDirectoryNodes(base: string, relativeDir: string): Promise<IFolderTreeNode[]> {
    const absoluteDir = path.resolve(base, relativeDir);
    const entries = await fs.promises.readdir(absoluteDir, { withFileTypes: true });
    const nodes: IFolderTreeNode[] = [];
    for (const entry of entries) {
      if (entry.name.startsWith(".")) continue;
      const entryRel = this.joinRelative(relativeDir, entry.name);
      if (entry.isDirectory()) {
        const children = await this.readDirectoryNodes(base, entryRel);
        nodes.push({
          name: entry.name,
          relativePath: entryRel,
          isDirectory: true,
          children
        });
        continue;
      }
      if (/\.(md|markdown)$/i.test(entry.name)) {
        nodes.push({
          name: entry.name,
          relativePath: entryRel,
          isDirectory: false
        });
      }
    }
    return nodes.sort((a, b) => {
      if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
  }

  // Collects the markdown files in the directory
  private async collectMarkdown(base: string, relativeDir: string, target: string[]): Promise<void> {
    const absoluteDir = path.resolve(base, relativeDir);
    const entries = await fs.promises.readdir(absoluteDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name.startsWith(".")) continue;
      const entryRel = this.joinRelative(relativeDir, entry.name);
      if (entry.isDirectory()) {
        await this.collectMarkdown(base, entryRel, target);
        continue;
      }
      if (/\.(md|markdown)$/i.test(entry.name)) {
        target.push(entryRel.replace(/\\/g, "/"));
      }
    }
  }

  // Escapes the HTML
  private escapeHtml(value: string): string {
    return value
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  // Normalizes the path
  private normalizePath(value: string): string {
    return value.replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");
  }

  // Checks if the branch is matching
  private isMatchingBranch(directoryPath: string, activePath: string): boolean {
    if (!directoryPath || !activePath) return false;
    return activePath === directoryPath || activePath.startsWith(`${directoryPath}/`);
  }

  // Returns the folder level class
  private folderLevelClass(depth: number): string {
    if (depth === 0) return "lws-folder-top";
    if (depth === 1) return "lws-folder-parent";
    return "lws-folder-child";
  }
}

// Shared instance used by {@link WmplsHttpServerService}
export const wmplsFileTreeService = new WmplsFileTreeService();
// #endregion << Functions >>