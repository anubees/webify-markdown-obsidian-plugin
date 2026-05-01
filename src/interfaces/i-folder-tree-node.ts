// Recursive folder/note tree used for sidebar rendering and active-folder expansion state.
export interface IFolderTreeNode {
  name: string;
  relativePath: string;
  isDirectory: boolean;
  children?: IFolderTreeNode[];
}
