"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const httpServer_1 = require("./httpServer");
const PubSubManager_1 = require("./PubSubManager");
const wss = new ws_1.WebSocketServer({ server: httpServer_1.httpServer });
const manager = PubSubManager_1.PubSubManager.getInstance();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        yield manager.init();
        console.log("✅ WebSocket server is live at ws://localhost:3000");
        wss.on("connection", (ws) => {
            console.log("🔗 New client connected");
            ws.on("error", (err) => {
                console.error("❗ WebSocket error:", err);
            });
            ws.on("message", (data) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const { stock, action } = JSON.parse(data.toString());
                    console.log(`📩 Received from client: ${action} → ${stock}`);
                    if (action === "SUB") {
                        yield manager.userSubscribe(stock, ws);
                        console.log(`✅ Subscribed client to ${stock}`);
                    }
                    else if (action === "UNSUB") {
                        yield manager.userUnSubscribe(stock, ws);
                        console.log(`❎ Unsubscribed client from ${stock}`);
                    }
                    else {
                        console.warn("⚠️ Unknown action:", action);
                    }
                }
                catch (err) {
                    console.error("❌ Invalid message format:", err);
                }
            }));
            ws.on("close", () => __awaiter(this, void 0, void 0, function* () {
                console.log("❌ Client disconnected — cleaning up subscriptions");
                yield manager.cleanupSocket(ws);
            }));
        });
    });
}
main().catch((err) => {
    console.error("🚨 WebSocket server startup failed:", err);
});
