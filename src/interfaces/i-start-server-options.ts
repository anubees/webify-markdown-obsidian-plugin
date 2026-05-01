// Dependencies HTTP handlers need from the plugin: frozen settings copy, absolute root, favorites accessors.
import type { ILocalWebServerSettings } from "./i-local-web-server-settings";

export interface IStartServerOptions {
  settings: ILocalWebServerSettings;
  rootAbsolutePath: string;
  getFavoritePaths: () => string[];
  toggleFavoritePath: (relativePath: string) => Promise<boolean>;
}
