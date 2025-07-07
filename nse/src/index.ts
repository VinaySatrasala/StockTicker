import express from 'express';
import WebSocket, { WebSocketServer } from 'ws';

const app = express();
const server = app.listen(9002, () => {
  console.log('✅ Mock NSE WebSocket server started on ws://localhost:9002');
});

const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  console.log('🔗 New WebSocket client connected');

  ws.on('close', () => {
    console.log('❌ Client disconnected');
  });

  ws.on('error', (err) => {
    console.error('❗ WebSocket error:', err);
  });
});

const stocks: { [key: string]: number } = {
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
      if (client.readyState === WebSocket.OPEN) {
        client.send(update);
      }
    });
  }
}, 1000);
