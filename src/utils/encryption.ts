/**
 * Simple encryption utility for 2FA secrets
 * In production, use a more secure encryption method
 */

/**
 * Encrypt/encode a string (simple base64 encoding for template)
 * For production, use proper encryption like crypto.createCipher
 */
export function encryptSecret(secret: string): string {
  return Buffer.from(secret).toString('base64');
}

/**
 * Decrypt/decode a string
 */
export function decryptSecret(encryptedSecret: string): string {
  return Buffer.from(encryptedSecret, 'base64').toString('utf-8');
}

