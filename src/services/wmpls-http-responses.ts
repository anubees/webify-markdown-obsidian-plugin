// Finishes Node ServerResponse instances: status codes, Content-Type headers, UTF-8 bodies, Basic auth challenge.
//
// #region << Imports >>
import type { ServerResponse } from "http";
// #endregion << Imports >>

// Thin wrappers around `ServerResponse`: centralizes status, Content-Type, and buffer encoding so
// handlers stay focused on routing and HTML assembly.

// #region << Functions >>
// Common Content-Type header values for LAN server responses.
export const MIME = {
  HTML: "text/html; charset=utf-8",
  CSS: "text/css; charset=utf-8",
  JSON: "application/json; charset=utf-8",
  TEXT: "text/plain; charset=utf-8",
  ICON: "image/x-icon"
} as const;

const WWW_AUTHENTICATE_BASIC = 'Basic realm="Webify Markdown LAN Server"';

// Responds with plain text body.
export function respondText(res: ServerResponse, status: number, text: string): void {
  res.statusCode = status;
  res.setHeader("Content-Type", MIME.TEXT);
  res.end(text);
}

// Responds with JSON body (serialized as UTF-8 bytes like other respond* helpers).
export function respondJson(res: ServerResponse, status: number, payload: unknown): void {
  respondBuffer(res, status, MIME.JSON, Buffer.from(JSON.stringify(payload), "utf8"));
}

// Responds with a raw buffer and explicit Content-Type.
export function respondBuffer(res: ServerResponse, status: number, contentType: string, data: Buffer): void {
  res.statusCode = status;
  res.setHeader("Content-Type", contentType);
  res.end(data);
}

// Responds with an HTML document (UTF-8).
export function respondHtml(res: ServerResponse, status: number, html: string): void {
  respondBuffer(res, status, MIME.HTML, Buffer.from(html, "utf8"));
}

// Responds with 401 and WWW-Authenticate for HTTP Basic (triggers browser credential prompt).
export function respondUnauthorizedBasic(res: ServerResponse): void {
  res.statusCode = 401;
  res.setHeader("WWW-Authenticate", WWW_AUTHENTICATE_BASIC);
  respondText(res, 401, "Authentication required");
}

// Sends a 302 redirect; Location must already be safe for headers (e.g. encodeURI).
export function respondRedirect(res: ServerResponse, encodedLocation: string): void {
  res.statusCode = 302;
  res.setHeader("Location", encodedLocation);
  res.end();
}
// #endregion << Functions >>
