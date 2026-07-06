"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyWebhookSignature = verifyWebhookSignature;
const node_crypto_1 = __importDefault(require("node:crypto"));
/**
 * Verify HMAC-SHA256 signature for incoming webhooks
 */
function verifyWebhookSignature(client, rawBody, signature) {
    const webhookSecret = client.getWebhookSecret();
    if (!webhookSecret) {
        throw new Error("Webhook secret is not configured in KanzenClient options");
    }
    const computedSignature = node_crypto_1.default
        .createHmac("sha256", webhookSecret)
        .update(rawBody)
        .digest("hex");
    if (computedSignature.length !== signature.length) {
        return false;
    }
    return node_crypto_1.default.timingSafeEqual(Buffer.from(computedSignature, "utf-8"), Buffer.from(signature, "utf-8"));
}
