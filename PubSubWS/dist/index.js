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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = __importDefault(require("ws"));
const redis_1 = require("redis");
const NSE = new ws_1.default("ws://localhost:9002");
const redisClient = (0, redis_1.createClient)();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        yield redisClient.connect();
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
                const parsed = JSON.parse(data.toString());
                if (parsed.stock && parsed.price !== undefined) {
                    const channel = parsed.stock;
                    const message = JSON.stringify({ price: parsed.price });
                    console.log(`📤 Publishing to Redis → ${channel}: ${message}`);
                    redisClient.publish(channel, message);
                }
                else {
                    console.warn('⚠️ Incomplete message:', parsed);
                }
            }
            catch (err) {
                console.error('❌ Failed to parse message:', err);
            }
        });
    });
}
main().catch((err) => {
    console.error('🚨 Startup failed:', err);
});
