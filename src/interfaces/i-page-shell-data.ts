// Placeholder bundle passed into `page-shell.html` (title, sidebars, chrome, note body slot).
export interface IPageShellData {
  title: string;
  treeHtml: string;
  favoritesHtml: string;
  servedRootLabel: string;
  servedRootName: string;
  contentHtml: string;
  favoriteTogglePath: string | null;
  isCurrentFavorite: boolean;
  themeMode: "light" | "dark" | "auto";
}
