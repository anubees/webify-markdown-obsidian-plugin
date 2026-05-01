// Default settings values and the Obsidian settings tab UI for port/bind/auth/theme/root folder options.
import { App, PluginSettingTab, Setting } from "obsidian";
import type LocalWebServerPlugin from "./local-web-server-plugin";
import { type ILocalWebServerSettings, type ThemeOption } from "../interfaces/i-local-web-server-settings";

function isThemeOption(value: string): value is ThemeOption {
  return value === "light" || value === "dark" || value === "auto";
}

export const DEFAULT_SETTINGS: ILocalWebServerSettings = {
  port: 9000,
  bindAddress: "0.0.0.0",
  rootFolder: "",
  autoStart: false,
  enableBasicAuth: false,
  authUsername: "",
  authPassword: "",
  theme: "auto",
  lanWarningShown: false,
  favoritePaths: []
};

export class LocalWebServerSettingTab extends PluginSettingTab {
  private plugin: LocalWebServerPlugin;

  constructor(app: App, plugin: LocalWebServerPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl("p", {
      text: "Credentials are stored in plugin data and are plaintext at rest in this version of the plugin. Use only on trusted devices."
    });

    new Setting(containerEl)
      .setName("Port")
      .setDesc("HTTP port for the local server.")
      .addText((text) =>
        text
          .setPlaceholder("9000")
          .setValue(String(this.plugin.settings.port))
          .onChange(async (value) => {
            const parsed = Number(value);
            if (!Number.isInteger(parsed) || parsed < 1 || parsed > 65535) return;
            await this.plugin.updateSetting("port", parsed);
          })
      );

    new Setting(containerEl)
      .setName("Bind address")
      .setDesc("Use 127.0.0.1 for localhost only, or 0.0.0.0 for LAN.")
      .addDropdown((dropdown) =>
        dropdown
          .addOption("127.0.0.1", "127.0.0.1 (localhost only)")
          .addOption("0.0.0.0", "0.0.0.0 (LAN)")
          .setValue(this.plugin.settings.bindAddress)
          .onChange(async (value: string) => {
            if (value !== "127.0.0.1" && value !== "0.0.0.0") return;
            await this.plugin.updateSetting("bindAddress", value);
          })
      );

    new Setting(containerEl)
      .setName("Root folder")
      .setDesc("Only this folder is served on the web. Relative path in vault; empty means whole vault.")
      .addText((text) =>
        text.setValue(this.plugin.settings.rootFolder).onChange(async (value) => {
          await this.plugin.updateSetting("rootFolder", value);
        })
      );

    new Setting(containerEl)
      .setName("Auto-start on launch")
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.autoStart).onChange(async (value) => {
          await this.plugin.updateSetting("autoStart", value);
        })
      );

    new Setting(containerEl)
      .setName("Enable basic auth")
      .setDesc("Require username/password for all web requests.")
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.enableBasicAuth).onChange(async (value) => {
          await this.plugin.updateSetting("enableBasicAuth", value);
          this.display();
        })
      );

    new Setting(containerEl)
      .setName("Username")
      .addText((text) =>
        text
          .setPlaceholder("username")
          .setValue(this.plugin.settings.authUsername)
          .setDisabled(!this.plugin.settings.enableBasicAuth)
          .onChange(async (value) => {
            await this.plugin.updateSetting("authUsername", value.trim());
          })
      );

    new Setting(containerEl)
      .setName("Password")
      .addText((text) =>
        text
          .setPlaceholder("password")
          .setValue(this.plugin.settings.authPassword)
          .setDisabled(!this.plugin.settings.enableBasicAuth)
          .onChange(async (value) => {
            await this.plugin.updateSetting("authPassword", value);
          })
      );

    new Setting(containerEl)
      .setName("Theme")
      .setDesc("Theme for rendered pages.")
      .addDropdown((dropdown) =>
        dropdown
          .addOption("light", "Light")
          .addOption("dark", "Dark")
          .addOption("auto", "Auto-match-system")
          .setValue(this.plugin.settings.theme)
          .onChange(async (value: string) => {
            if (!isThemeOption(value)) return;
            await this.plugin.updateSetting("theme", value);
          })
      );
  }
}
