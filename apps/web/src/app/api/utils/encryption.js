import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

// Generate encryption key from user IDs (deterministic per conversation)
export function generateConversationKey(userId1, userId2) {
  const sortedIds = [userId1, userId2].sort().join("-");
  return crypto
    .createHash("sha256")
    .update(sortedIds + process.env.AUTH_SECRET)
    .digest();
}

// Encrypt message content
export function encryptMessage(plaintext, key) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag();

  // Return: iv + authTag + encrypted (all hex)
  return iv.toString("hex") + authTag.toString("hex") + encrypted;
}

// Decrypt message content
export function decryptMessage(ciphertext, key) {
  try {
    const iv = Buffer.from(ciphertext.slice(0, IV_LENGTH * 2), "hex");
    const authTag = Buffer.from(
      ciphertext.slice(IV_LENGTH * 2, (IV_LENGTH + AUTH_TAG_LENGTH) * 2),
      "hex",
    );
    const encrypted = ciphertext.slice((IV_LENGTH + AUTH_TAG_LENGTH) * 2);

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    console.error("Decryption failed:", error);
    return "[Encrypted message]";
  }
}

// Input sanitization
export function sanitizeInput(input) {
  if (typeof input !== "string") return input;
  // Remove potential SQL injection patterns (defense in depth, sql template tag already protects)
  return input.replace(/['";\\]/g, "").trim();
}
