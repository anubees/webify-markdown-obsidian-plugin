// One row in an HTML folder index (vault-relative path, label, directory vs markdown file).
export interface IFolderEntry {
  path: string;
  name: string;
  isDirectory: boolean;
}
