// Boots `http.Server` or `https.Server`, forwards requests to `handleRequest`, maps failures to HTTP 500.
//
// #region << Imports >>
import * as http from "http";
import * as https from "https";
import type { IncomingMessage, ServerResponse } from "http";
import type { IRunningServer } from "../interfaces/i-running-server";
import type { IStartServerOptions } from "../interfaces/i-start-server-options";
import { handleRequest } from "./wmpls-http-handlers";
import { respondText } from "./wmpls-http-responses";
// #endregion << Imports >>

// Boots Node HTTP(S) listener, forwards each request to `handleRequest`, closes safely on uncaught errors.

// #region << Functions >>
export class WmplsHttpServerService {
  static async startWebServer(options: IStartServerOptions): Promise<IRunningServer> {
    const onRequest = (req: IncomingMessage, res: ServerResponse): void => {
      void handleRequest(req, res, options).catch((error: unknown) => {
        console.error("Webify Markdown LAN Server request error:", error);
        if (!res.headersSent) {
          respondText(res, 500, "Internal Server Error");
          return;
        }
        res.end();
      });
    };

    const server = options.httpsCredentials
      ? https.createServer(
          {
            cert: options.httpsCredentials.cert,
            key: options.httpsCredentials.key
          },
          onRequest
        )
      : http.createServer(onRequest);

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
