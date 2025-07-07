import { WebSocketServer, WebSocket } from "ws";
import { httpServer } from "./httpServer";
import { PubSubManager } from "./PubSubManager";

const wss = new WebSocketServer({ server: httpServer });

interface dataType {
    stock: string;
    action: string; // SUB or UNSUB
}

const manager = PubSubManager.getInstance();

async function main() {
    await manager.init();
    console.log("✅ WebSocket server is live at ws://localhost:3000");

    wss.on("connection", (ws) => {
        console.log("🔗 New client connected");

        ws.on("error", (err) => {
            console.error("❗ WebSocket error:", err);
        });

        ws.on("message", async (data) => {
            try {
                const { stock, action }: dataType = JSON.parse(data.toString());
                console.log(`📩 Received from client: ${action} → ${stock}`);

                if (action === "SUB") {
                    await manager.userSubscribe(stock, ws);
                    console.log(`✅ Subscribed client to ${stock}`);
                } else if (action === "UNSUB") {
                    await manager.userUnSubscribe(stock, ws);
                    console.log(`❎ Unsubscribed client from ${stock}`);
                } else {
                    console.warn("⚠️ Unknown action:", action);
                }
            } catch (err) {
                console.error("❌ Invalid message format:", err);
            }
        });

        ws.on("close", async () => {
            console.log("❌ Client disconnected — cleaning up subscriptions");
            await manager.cleanupSocket(ws);
        });
    });
}

main().catch((err) => {
    console.error("🚨 WebSocket server startup failed:", err);
});
