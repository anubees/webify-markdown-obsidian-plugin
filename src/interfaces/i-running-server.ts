// Returned after listen succeeds so `onunload` can gracefully close the TCP server.
export interface IRunningServer {
  stop: () => Promise<void>;
}
