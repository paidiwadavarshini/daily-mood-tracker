/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Simple text encoder/decoder for SubtleCrypto
const encoder = new TextEncoder();
const decoder = new TextDecoder();

/**
 * Encodes an ArrayBuffer into a base64 string.
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

/**
 * Decodes a base64 string into an ArrayBuffer.
 */
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Encrypts cleartext with a passphrase using stretched PBKDF2 + AES-GCM (256-bit).
 */
export async function encryptText(text: string, passphrase: string): Promise<string> {
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  // Import raw passphrase as a key
  const passwordKey = await window.crypto.subtle.importKey(
    "raw",
    encoder.encode(passphrase),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  // Derive AES-GCM key using PBKDF2 with salt to prevent dictionary attacks
  const aesKey = await window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256"
    },
    passwordKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt"]
  );

  // Encrypt cleartext
  const ciphertextBuffer = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv
    },
    aesKey,
    encoder.encode(text)
  );

  // Encode values as base64 and return as a JSON package
  const saltBase64 = arrayBufferToBase64(salt);
  const ivBase64 = arrayBufferToBase64(iv);
  const ciphertextBase64 = arrayBufferToBase64(ciphertextBuffer);

  return JSON.stringify({
    salt: saltBase64,
    iv: ivBase64,
    ciphertext: ciphertextBase64
  });
}

/**
 * Decrypts a base64-encoded encrypted packaging back to cleartext.
 */
export async function decryptText(encryptedJson: string, passphrase: string): Promise<string> {
  try {
    const { salt, iv, ciphertext } = JSON.parse(encryptedJson);
    const saltBuffer = base64ToArrayBuffer(salt);
    const ivBuffer = base64ToArrayBuffer(iv);
    const ciphertextBuffer = base64ToArrayBuffer(ciphertext);

    // Import raw passphrase
    const passwordKey = await window.crypto.subtle.importKey(
      "raw",
      encoder.encode(passphrase),
      "PBKDF2",
      false,
      ["deriveKey"]
    );

    // Derive same AES-GCM key
    const aesKey = await window.crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: saltBuffer,
        iterations: 100000,
        hash: "SHA-256"
      },
      passwordKey,
      { name: "AES-GCM", length: 256 },
      false,
      ["decrypt"]
    );

    // Decrypt
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: ivBuffer
      },
      aesKey,
      ciphertextBuffer
    );

    return decoder.decode(decryptedBuffer);
  } catch (error) {
    throw new Error("Unable to decrypt entry. Please verify your passphrase.");
  }
}

/**
 * Generates an encrypted test token ("witness") that we can decrypt to verify
 * if a user entered the correct passphrase, without exposing the passphrase or actual entries.
 */
export async function createPhraseVerificationToken(passphrase: string): Promise<string> {
  const secretPhrase = "verification-success-passphrase-is-correct-witness";
  return encryptText(secretPhrase, passphrase);
}

/**
 * Verifies if the passphrase is correct by testing it against the verification token.
 */
export async function verifyPassphrase(token: string, passphrase: string): Promise<boolean> {
  try {
    const decrypted = await decryptText(token, passphrase);
    return decrypted === "verification-success-passphrase-is-correct-witness";
  } catch (e) {
    return false;
  }
}
