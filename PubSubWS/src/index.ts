import WebSocket from "ws";
import { createClient } from "redis";

const NSE = new WebSocket("ws://localhost:9002");
const redisClient = createClient();

interface dataType {
    stock: string;
    price: string;
}

async function main() {
    await redisClient.connect();
    console.log('✅ Connected to Redis');

    NSE.on('open', () => {
        console.log('🔌 Connected to mock NSE WebSocket at ws://localhost:9002');
    });

    NSE.on('error', (err) => {
        console.error('❗ WebSocket connection error:', err);
    });

    redisClient.on('error', (err) => {
        console.error('❗ Redis client error:', err);
    });

    NSE.on('message', (data) => {
        try {
            console.log('📩 Received raw message:', data.toString());

            const parsed: dataType = JSON.parse(data.toString());

            if (parsed.stock && parsed.price !== undefined) {
                const channel = parsed.stock;
                const message = JSON.stringify({ price: parsed.price });

                console.log(`📤 Publishing to Redis → ${channel}: ${message}`);
                redisClient.publish(channel, message);
            } else {
                console.warn('⚠️ Incomplete message:', parsed);
            }
        } catch (err) {
            console.error('❌ Failed to parse message:', err);
        }
    });
}

main().catch((err) => {
    console.error('🚨 Startup failed:', err);
});
