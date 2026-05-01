// Result of rendering a single note: HTML body, heading title, optional rendered frontmatter summary.
export interface IRenderedMarkdown {
  html: string;
  title: string;
  frontmatterHtml: string;
}
