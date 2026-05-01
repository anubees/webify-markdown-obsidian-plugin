// Boots `http.Server`, forwards requests to `handleRequest`, and converts uncaught handler errors into HTTP 500.
//
// #region << Imports >>
import * as http from "http";
import type { IRunningServer } from "../interfaces/i-running-server";
import type { IStartServerOptions } from "../interfaces/i-start-server-options";
import { handleRequest } from "./wmpls-http-handlers";
import { respondText } from "./wmpls-http-responses";
// #endregion << Imports >>

// Boots Node's `http.Server`, forwards each request to `handleRequest`, and maps failures to 500.
// Binding/listen errors reject `startWebServer`; per-request errors log and close the response safely.

// #region << Functions >>
// Read-only HTTP server for vault markdown and attachments (routes live in `wmpls-http-handlers.ts`)
export class WmplsHttpServerService {
  static async startWebServer(options: IStartServerOptions): Promise<IRunningServer> {
    const server = http.createServer((req, res) => {
      void handleRequest(req, res, options).catch((error: unknown) => {
        console.error("Webify Markdown LAN Server request error:", error);
        // If headers already went out (partial HTML/asset stream), only end the socket.
        if (!res.headersSent) {
          respondText(res, 500, "Internal Server Error");
          return;
        }
        res.end();
      });
    });

    await new Promise<void>((resolve, reject) => {
      server.once("error", reject);
      server.listen(options.settings.port, options.settings.bindAddress, () => {
        server.off("error", reject);
        resolve();
      });
    });

    return {
      stop: async () => {
        await new Promise<void>((resolve, reject) => {
          server.close((err) => (err ? reject(err) : resolve()));
        });
      }
    };
  }
}
// #endregion << Functions >>
