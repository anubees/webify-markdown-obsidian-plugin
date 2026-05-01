// Validates HTTP Basic credentials using Authorization headers and timing-safe string comparison.
//
// #region << Imports >>
import { createHash, timingSafeEqual } from "crypto";
import type { IncomingMessage } from "http";
// #endregion << Imports >>
// #region << Functions >>
// HTTP Basic auth and constant-time credential comparison
export class WmplsAuthService {
  // Compares two strings in constant time
  static constantTimeEquals(left: string, right: string): boolean {
    const leftHash = createHash("sha256").update(left, "utf8").digest();
    const rightHash = createHash("sha256").update(right, "utf8").digest();
    return timingSafeEqual(leftHash, rightHash);
  }

  // Validates the basic authentication credentials
  static validateBasicAuth(
    req: IncomingMessage,
    expectedUsername: string,
    expectedPassword: string
  ): boolean {
    const authHeader = req.headers.authorization;
    if (!authHeader) return false;
    const match = authHeader.match(/^\s*basic\s+(.+)\s*$/i);
    if (!match) return false;
    const encoded = match[1];
    let decoded = "";
    try {
      decoded = Buffer.from(encoded, "base64").toString("utf8");
    } catch {
      return false;
    }
    const sepIndex = decoded.indexOf(":");
    if (sepIndex < 0) return false;
    const username = decoded.slice(0, sepIndex);
    const password = decoded.slice(sepIndex + 1);
    return (
      WmplsAuthService.constantTimeEquals(username, expectedUsername) &&
      WmplsAuthService.constantTimeEquals(password, expectedPassword)
    );
  }
}
