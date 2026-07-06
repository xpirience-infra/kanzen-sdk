"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNextAuthProviderConfig = exports.getBetterAuthProviderConfig = exports.KanzenClient = void 0;
var client_js_1 = require("./client.js");
Object.defineProperty(exports, "KanzenClient", { enumerable: true, get: function () { return client_js_1.KanzenClient; } });
Object.defineProperty(exports, "getBetterAuthProviderConfig", { enumerable: true, get: function () { return client_js_1.getBetterAuthProviderConfig; } });
Object.defineProperty(exports, "getNextAuthProviderConfig", { enumerable: true, get: function () { return client_js_1.getNextAuthProviderConfig; } });
__exportStar(require("./types.js"), exports);
