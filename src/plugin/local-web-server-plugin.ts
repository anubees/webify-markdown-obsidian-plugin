// Obsidian plugin lifecycle: persisted settings, start/stop LAN HTTP server, favorites, commands, status bar.
//
// #region << Imports >>
import { Notice, Plugin } from "obsidian";
import * as os from "os";
import { ConfirmModal } from "./confirm-modal";
import { LocalWebServerSettingTab, DEFAULT_SETTINGS } from "./plugin-settings";
import type { ILocalWebServerSettings } from "../interfaces/i-local-web-server-settings";
import type { IRunningServer } from "../interfaces/i-running-server";
import { WmplsHttpServerService } from "../services/wmpls-http-server-service";
import {
  fileExists,
  getRootAbsolutePath,
  getVaultBasePath,
  normalizeRootFolder,
  resolveVaultRelativePath
} from "../utils";
import * as fs from "fs";
// #endregion << Imports >>

// The main plugin class for the Local Web Server plugin
export default class LocalWebServerPlugin extends Plugin {
  // The settings for the plugin
  settings: ILocalWebServerSettings = DEFAULT_SETTINGS;
  // The status bar item for the plugin
  private statusBar = this.addStatusBarItem();
  // The running server instance
  private runningServer: IRunningServer | null = null;

  // Loads the plugin and sets up the settings and commands
  async onload(): Promise<void> {
    // Load the settings
    await this.loadSettingsAndUpdateCommandPaletteAndStatusBar();
  }

  // Stops the server when the plugin is unloaded
  async onunload(): Promise<void> {
    await this.stopServer();
  }

  // Updates one setting key and applies live restart behavior when needed
  async updateSetting<K extends keyof ILocalWebServerSettings>(
    key: K,
    value: ILocalWebServerSettings[K]
  ): Promise<void> {
    const oldValue = this.settings[key];
    this.settings[key] = value;
    await this.saveSettings();
    if (
      this.runningServer &&
      (key === "port" ||
        key === "bindAddress" ||
        key === "rootFolder" ||
        key === "enableBasicAuth" ||
        key === "authUsername" ||
        key === "authPassword" ||
        key === "theme" ||
        key === "useHttps" ||
        key === "httpsCertPath" ||
        key === "httpsKeyPath")
    ) {
      await this.restartServerWithNotice("Webify Markdown LAN Server restarted to apply updated settings.");
    } else if (oldValue !== value) {
      this.updateStatusBar();
    }
  }

  // Loads the settings, updates the command palette and status bar
  private async loadSettingsAndUpdateCommandPaletteAndStatusBar() {
    await this.loadSettings();
    // Add the setting tab
    this.addSettingTab(new LocalWebServerSettingTab(this.app, this));
    // Update the command palette options
    this.updateCommandPaletteOptions();
    // Add the click handler to the status bar.
    this.statusBar.addClass("mod-clickable");
    this.statusBar.onclick = () => {
      if (this.runningServer) {
        void this.stopServer();
      } else {
        void this.startServer();
      }
    };
    // Update the status bar
    this.updateStatusBar();
    // Starts the server if the auto start setting is enabled
    if (this.settings.autoStart) {
      await this.startServer();
    }
  }

  // Starts the server
  private async startServer(): Promise<void> {
    if (this.runningServer) {
      new Notice("Webify Markdown LAN Server is already running.");
      return;
    }

    // Show the LAN warning modal if the bind address is 0.0.0.0 and the LAN warning has not been shown yet
    if (this.settings.bindAddress === "0.0.0.0" && !this.settings.lanWarningShown) {
      const accepted = await this.showLanWarningModal();
      if (!accepted) return;
      this.settings.lanWarningShown = true;
      await this.saveSettings();
    }

    const vaultBasePath = getVaultBasePath(this.app.vault);
    const normalizedRoot = normalizeRootFolder(this.settings.rootFolder);
    const rootAbsolutePath = getRootAbsolutePath(vaultBasePath, normalizedRoot);

    let httpsCredentials: { cert: string; key: string } | undefined;
    if (this.settings.useHttps) {
      const certResolved = resolveVaultRelativePath(vaultBasePath, this.settings.httpsCertPath);
      const keyResolved = resolveVaultRelativePath(vaultBasePath, this.settings.httpsKeyPath);
      if (!certResolved || !keyResolved) {
        new Notice(
          "HTTPS enabled: enter vault-relative paths to PEM certificate and private key files."
        );
        return;
      }
      if (!(await fileExists(certResolved)) || !(await fileExists(keyResolved))) {
        new Notice("HTTPS: certificate or key file not found under the vault path.");
        return;
      }
      try {
        const [cert, key] = await Promise.all([
          fs.promises.readFile(certResolved, "utf8"),
          fs.promises.readFile(keyResolved, "utf8")
        ]);
        httpsCredentials = { cert, key };
      } catch {
        new Notice("HTTPS: failed to read certificate or key file.");
        return;
      }
    }

    try {
      this.runningServer = await WmplsHttpServerService.startWebServer({
        settings: this.settings,
        rootAbsolutePath,
        httpsCredentials,
        getFavoritePaths: () => this.settings.favoritePaths,
        toggleFavoritePath: async (relativePath: string) => this.toggleFavoritePath(relativePath)
      });
      this.updateStatusBar();
      new Notice(`Webify Markdown LAN Server running at ${this.getServerUrl()}`);
    } catch (error) {
      this.runningServer = null;
      this.updateStatusBar();
      const message = error instanceof Error ? error.message : "Unknown server error";
      new Notice(`Failed to start Webify Markdown LAN Server: ${message}`);
    }
  }

  // Stops the server
  private async stopServer(): Promise<void> {
    if (!this.runningServer) {
      this.updateStatusBar();
      return;
    }
    await this.runningServer.stop();
    this.runningServer = null;
    this.updateStatusBar();
    new Notice("Webify Markdown LAN Server stopped.");
  }

  // Restarts the server with a notice
  private async restartServerWithNotice(message: string): Promise<void> {
    if (!this.runningServer) return;
    await this.stopServer();
    await this.startServer();
    new Notice(message);
  }

  // Copies the LAN URL to the clipboard
  private async copyLanUrl(): Promise<void> {
    const url = this.getServerUrl();
    await navigator.clipboard.writeText(url);
    new Notice(`Copied: ${url}`);
  }

  // Loads the settings
  private async loadSettings(): Promise<void> {
    const loaded = (await this.loadData()) as Partial<ILocalWebServerSettings> | null;
    this.settings = { ...DEFAULT_SETTINGS, ...(loaded ?? {}) };
  }

  // Saves the settings
  private async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }

  // Toggles a favorite path
  private async toggleFavoritePath(relativePath: string): Promise<boolean> {
    const normalized = relativePath.replace(/\\/g, "/").replace(/^\/+/, "");
    const next = new Set(this.settings.favoritePaths);
    if (next.has(normalized)) {
      next.delete(normalized);
      this.settings.favoritePaths = [...next];
      await this.saveSettings();
      return false;
    }
    next.add(normalized);
    this.settings.favoritePaths = [...next].sort((a, b) => a.localeCompare(b));
    await this.saveSettings();
    return true;
  }

  // #region << Private Methods >>
  // Updates the status bar
  private updateStatusBar(): void {
    if (this.runningServer) {
      const scheme = this.settings.useHttps ? "https" : "http";
      this.statusBar.setText(`● ${scheme} :${this.settings.port}`);
      this.statusBar.setAttr("aria-label", this.getServerUrl());
    } else {
      this.statusBar.setText("○ Stopped");
      this.statusBar.setAttr("aria-label", "Server stopped");
    }
  }

  // Gets the server URL
  private getServerUrl(): string {
    const host = this.settings.bindAddress === "127.0.0.1" ? "127.0.0.1" : this.getLanIp();
    const scheme = this.settings.useHttps ? "https" : "http";
    return `${scheme}://${host}:${this.settings.port}`;
  }

  // Gets the LAN IP address
  private getLanIp(): string {
    const interfaces = os.networkInterfaces();
    for (const network of Object.values(interfaces)) {
      if (!network) continue;
      for (const addr of network) {
        if (addr.family === "IPv4" && !addr.internal) return addr.address;
      }
    }
    return "127.0.0.1";
  }

  // Shows the LAN warning modal
  private showLanWarningModal(): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      const modal = new ConfirmModal(this.app, {
        title: "LAN Exposure Warning",
        message:
          "You selected 0.0.0.0, so notes will be reachable by anyone on your local network. Consider enabling basic auth.",
        confirmText: "I understand",
        cancelText: "Cancel",
        onConfirm: () => resolve(true),
        onCancel: () => resolve(false)
      });
      modal.open();
    });
  }

  // Updates the command palette options
  private updateCommandPaletteOptions() {
    // 1. Adds the command to start the server.
    this.addCommand({
      id: "start-webify-markdown-lan-server",
      name: "Start server",
      callback: async () => this.startServer()
    });

    // 2. Adds the command to stop the server
    this.addCommand({
      id: "stop-webify-markdown-lan-server",
      name: "Stop server",
      callback: async () => this.stopServer()
    });

    // 3. Adds the command to copy the LAN URL to the clipboard
    this.addCommand({
      id: "copy-lan-url-to-clipboard-webify-markdown-lan-server",
      name: "Copy LAN URL to clipboard",
      callback: async () => this.copyLanUrl()
    });
  }
  // #endregion << Private Methods >>
}
