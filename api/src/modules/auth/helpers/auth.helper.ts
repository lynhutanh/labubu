import * as crypto from "crypto";

export function generateSalt(byteSize: number = 16): string {
  return crypto.randomBytes(byteSize).toString("base64");
}

export function encryptPassword(pw: string, salt: string): string {
  const defaultIterations = 10000;
  const defaultKeyLength = 64;

  return crypto
    .pbkdf2Sync(pw || "", salt, defaultIterations, defaultKeyLength, "sha1")
    .toString("base64");
}

export function verifyPassword(
  pw: string,
  salt: string,
  encryptedPassword: string,
): boolean {
  if (!pw || !salt || !encryptedPassword) {
    return false;
  }
  const computedPassword = encryptPassword(pw, salt);
  return computedPassword === encryptedPassword;
}
