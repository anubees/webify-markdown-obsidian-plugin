// Persisted plugin configuration stored under `.obsidian/plugins/.../data.json`.
export type ThemeOption = "light" | "dark" | "auto";

export interface ILocalWebServerSettings {
  port: number;
  bindAddress: "127.0.0.1" | "0.0.0.0";
  /** Shown as the sidebar title on LAN pages; if empty, "Obsidian Vault" is used. */
  vaultName: string;
  rootFolder: string;
  autoStart: boolean;
  enableBasicAuth: boolean;
  authUsername: string;
  authPassword: string;
  theme: ThemeOption;
  lanWarningShown: boolean;
  favoritePaths: string[];
}
