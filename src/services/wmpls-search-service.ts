// Linear scan full-text search over markdown files with normalized snippets for the sidebar search UI.
//
// #region << Imports >>
import * as fs from "fs";
import * as path from "path";
import type { ISearchResult } from "../interfaces/i-search-result";
// #endregion << Imports >>
// #region << Functions >>
// Full-text search over markdown files within the served scope
export class WmplsSearchService {
  static async searchMarkdown(
    rootAbsolutePath: string,
    markdownFiles: string[],
    query: string
  ): Promise<ISearchResult[]> {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return [];

    const results: ISearchResult[] = [];
    for (const file of markdownFiles) {
      const absolutePath = path.resolve(rootAbsolutePath, file);
      const content = await fs.promises.readFile(absolutePath, "utf8");
      const idx = content.toLowerCase().indexOf(normalizedQuery);
      if (idx < 0) continue;
      const snippet = WmplsSearchService.makeSnippet(content, idx, normalizedQuery.length);
      results.push({
        path: file,
        title: path.basename(file).replace(/\.(md|markdown)$/i, ""),
        snippet
      });
    }
    return results.slice(0, 50);
  }

  // Makes the snippet
  private static makeSnippet(content: string, start: number, length: number): string {
    const contextBefore = Math.max(0, start - 60);
    const contextAfter = Math.min(content.length, start + length + 80);
    return content.slice(contextBefore, contextAfter).replace(/\s+/g, " ").trim();
  }
}
