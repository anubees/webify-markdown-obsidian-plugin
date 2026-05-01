// Minimal confirmation modal (title, message, confirm/cancel) reused for LAN warnings and destructive actions.
//
// #region << Imports >>
import { Modal } from "obsidian";
import type { IConfirmModalOptions } from "../interfaces/i-confirm-modal-options";
import type LocalWebServerPlugin from "./local-web-server-plugin";
// #endregion << Imports >>

// A confirmationmodal that displays a confirmation dialog
export class ConfirmModal extends Modal {
  /**
   * Creates a new ConfirmModal instance.
   * @param app - The Obsidian app instance.
   * @param options - The options for the modal.
   */
  constructor(app: LocalWebServerPlugin["app"], private readonly options: IConfirmModalOptions) {
    super(app);
  }

  // Opens the modal and displays the confirmation dialog
  onOpen(): void {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: this.options.title });
    contentEl.createEl("p", { text: this.options.message });
    const actions = contentEl.createDiv({ cls: "modal-button-container" });
    const cancelButton = actions.createEl("button", { text: this.options.cancelText });
    const confirmButton = actions.createEl("button", { text: this.options.confirmText });
    // Handles the cancellation of the modal
    cancelButton.onclick = () => {
      this.options.onCancel();
      this.close();
    };
    // Handles the confirmation of the modal
    confirmButton.onclick = () => {
      this.options.onConfirm();
      this.close();
    };
  }

  // Closes the modal and clears the content
  onClose(): void {
    this.contentEl.empty();
  }
}
