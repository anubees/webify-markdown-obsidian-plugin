// Resolver inputs while rendering one note: note path plus full markdown path list for wikilinks/embeds.
export interface IRenderContext {
  currentNotePath: string;
  markdownFiles: string[];
}
