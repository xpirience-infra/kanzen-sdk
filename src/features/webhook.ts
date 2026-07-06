import crypto from "node:crypto";
import type { KanzenClient } from "../client.js";

/**
 * Verify HMAC-SHA256 signature for incoming webhooks
 */
export function verifyWebhookSignature(
  client: KanzenClient,
  rawBody: string,
  signature: string,
): boolean {
  const webhookSecret = client.getWebhookSecret();
  if (!webhookSecret) {
    throw new Error(
      "Webhook secret is not configured in KanzenClient options",
    );
  }

  const computedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(rawBody)
    .digest("hex");

  if (computedSignature.length !== signature.length) {
    return false;
  }

  return crypto.timingSafeEqual(
    Buffer.from(computedSignature, "utf-8"),
    Buffer.from(signature, "utf-8"),
  );
}
