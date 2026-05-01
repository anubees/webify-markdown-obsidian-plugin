// Markdown pipeline for LAN pages: Obsidian wikilinks/embeds, fenced highlighting, frontmatter summary block.
//
// #region << Imports >>
import * as path from "path";
import * as marked from "marked";
import hljs from "highlight.js";
import type { IRenderContext } from "../interfaces/i-render-context";
import type { IRenderedMarkdown } from "../interfaces/i-rendered-markdown";
import { encodePathForUrl } from "../utils";
// #endregion << Imports >>
// #region << Functions >>
marked.setOptions({
  gfm: true,
  breaks: false
});

// Markdown → HTML with Obsidian wikilinks, embeds, and highlighting
export class WmplsMarkdownRendererService {
  // Renders the markdown to HTML
  static async renderMarkdownToHtml(markdown: string, context: IRenderContext): Promise<IRenderedMarkdown> {
    const { frontmatter, body } = WmplsMarkdownRendererService.extractFrontmatter(markdown);
    const transformed = WmplsMarkdownRendererService.transformObsidianSyntax(body, context);
    const html = await marked.parse(transformed, {
      async: true,
      renderer: WmplsMarkdownRendererService.createMarkedRenderer(context)
    });
    return {
      html,
      title: path.basename(context.currentNotePath).replace(/\.(md|markdown)$/i, ""),
      frontmatterHtml: frontmatter ? WmplsMarkdownRendererService.renderFrontmatter(frontmatter) : ""
    };
  }

  // Transforms the Obsidian syntax
  static transformObsidianSyntax(markdown: string, context: IRenderContext): string {
    const embedded = markdown.replace(/!\[\[([^\]]+)\]\]/g, (_full, targetRaw: string) => {
      const [target] = targetRaw.split("|");
      const cleanTarget = target.trim();
      const assetPath = encodePathForUrl(WmplsMarkdownRendererService.resolveAssetPath(cleanTarget, context));
      return `![](/_assets/${assetPath})`;
    });

    return embedded.replace(/\[\[([^\]]+)\]\]/g, (_full, targetRaw: string) => {
      const [target, alias] = targetRaw.split("|");
      const cleanTarget = target.trim();
      const linkText = (alias ?? target).trim();
      const resolved = WmplsMarkdownRendererService.resolveWikilink(cleanTarget, context);
      return `[${linkText}](${resolved})`;
    });
  }

  // Resolves the wikilink
  private static resolveWikilink(target: string, context: IRenderContext): string {
    const withoutAliasAnchor = target.split("#")[0];
    const normalized = withoutAliasAnchor.replace(/\\/g, "/").replace(/^\/+/, "");
    const currentDir = path.posix.dirname(context.currentNotePath.replace(/\\/g, "/"));
    const candidateRelative = path.posix.normalize(path.posix.join(currentDir, normalized));
    const candidates = [
      normalized,
      candidateRelative,
      `${normalized}.md`,
      `${normalized}.markdown`,
      `${candidateRelative}.md`,
      `${candidateRelative}.markdown`
    ].map((entry) => entry.replace(/^\/+/, ""));

    const fileSet = new Set(context.markdownFiles);
    const match = candidates.find((candidate) => fileSet.has(candidate));
    if (!match) return `/${encodePathForUrl(normalized)}`;
    const route = match.replace(/\.(md|markdown)$/i, "");
    return `/${encodePathForUrl(route)}`;
  }

  // Creates the marked renderer
  private static createMarkedRenderer(context: IRenderContext): marked.Renderer {
    const renderer = new marked.Renderer();
    const baseImage = renderer.image.bind(renderer);
    renderer.code = (token: marked.Tokens.Code): string => {
      const language = token.lang && hljs.getLanguage(token.lang) ? token.lang : "plaintext";
      const highlighted = hljs.highlight(token.text, { language }).value;
      return `<pre><code class="hljs language-${language}">${highlighted}</code></pre>`;
    };
    renderer.image = (token: marked.Tokens.Image): string => {
      const href = token.href ?? "";
      if (
        href.startsWith("http://") ||
        href.startsWith("https://") ||
        href.startsWith("data:") ||
        href.startsWith("/_assets/")
      ) {
        return baseImage(token);
      }
      const normalized = href.replace(/^\/+/, "");
      const resolvedAsset = WmplsMarkdownRendererService.resolveAssetPath(normalized, context);
      token.href = `/_assets/${encodePathForUrl(resolvedAsset)}`;
      return baseImage(token);
    };
    return renderer;
  }

  // Resolves the asset path
  private static resolveAssetPath(target: string, context: IRenderContext): string {
    const normalized = target.replace(/\\/g, "/").replace(/^\/+/, "");
    if (!normalized) return normalized;
    const currentDir = path.posix.dirname(context.currentNotePath.replace(/\\/g, "/"));
    const combined = path.posix.normalize(path.posix.join(currentDir, normalized));
    return combined.replace(/^\/+/, "");
  }

  // Extracts the frontmatter
  private static extractFrontmatter(markdown: string): { frontmatter: string; body: string } {
    if (!markdown.startsWith("---\n")) return { frontmatter: "", body: markdown };
    const end = markdown.indexOf("\n---", 4);
    if (end < 0) return { frontmatter: "", body: markdown };
    const frontmatter = markdown.slice(4, end).trim();
    const body = markdown.slice(end + 4).replace(/^\n/, "");
    return { frontmatter, body };
  }

  // Renders the frontmatter
  private static renderFrontmatter(raw: string): string {
    const escaped = WmplsMarkdownRendererService.escapeHtml(raw);
    return `<details class="lws-meta"><summary>Frontmatter</summary><pre><code>${escaped}</code></pre></details>`;
  }

  // Escapes the HTML
  private static escapeHtml(value: string): string {
    return value
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }
}
// #endregion << Functions >>
