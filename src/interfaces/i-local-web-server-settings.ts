// Persisted plugin configuration stored under `.obsidian/plugins/.../data.json`.
export type ThemeOption = "light" | "dark" | "auto";

export interface ILocalWebServerSettings {
  port: number;
  bindAddress: "127.0.0.1" | "0.0.0.0";
  /** When true, the server uses TLS; requires PEM cert and key paths under the vault. */
  useHttps: boolean;
  /** Vault-relative path to the TLS certificate (PEM). */
  httpsCertPath: string;
  /** Vault-relative path to the TLS private key (PEM). */
  httpsKeyPath: string;
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
