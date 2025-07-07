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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ws_1 = __importStar(require("ws"));
const app = (0, express_1.default)();
const server = app.listen(9002, () => {
    console.log('✅ Mock NSE WebSocket server started on ws://localhost:9002');
});
const wss = new ws_1.WebSocketServer({ server });
wss.on('connection', (ws) => {
    console.log('🔗 New WebSocket client connected');
    ws.on('close', () => {
        console.log('❌ Client disconnected');
    });
    ws.on('error', (err) => {
        console.error('❗ WebSocket error:', err);
    });
});
const stocks = {
    APPL: 180.0,
    TSLA: 700.0,
    GOOG: 2800.0,
    AMZN: 3300.0,
    MSFT: 290.0,
};
// Helper to simulate small price changes
function randomDelta() {
    return (Math.random() * 2 - 1).toFixed(2); // between -1.00 and +1.00
}
// Send updates every second to all connected clients
setInterval(() => {
    for (const [symbol, basePrice] of Object.entries(stocks)) {
        const delta = parseFloat(randomDelta());
        const newPrice = +(basePrice + delta).toFixed(2);
        stocks[symbol] = newPrice;
        const update = JSON.stringify({
            stock: symbol,
            price: newPrice,
        });
        console.log(`📤 Broadcasting: ${symbol} → ${newPrice} to ${wss.clients.size} client(s)`);
        wss.clients.forEach((client) => {
            if (client.readyState === ws_1.default.OPEN) {
                client.send(update);
            }
        });
    }
}, 1000);
