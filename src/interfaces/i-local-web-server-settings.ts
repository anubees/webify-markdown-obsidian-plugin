// Persisted plugin configuration stored under `.obsidian/plugins/.../data.json`.
export type ThemeOption = "light" | "dark" | "auto";

export interface ILocalWebServerSettings {
  port: number;
  bindAddress: "127.0.0.1" | "0.0.0.0";
  rootFolder: string;
  autoStart: boolean;
  enableBasicAuth: boolean;
  authUsername: string;
  authPassword: string;
  theme: ThemeOption;
  lanWarningShown: boolean;
  favoritePaths: string[];
}
