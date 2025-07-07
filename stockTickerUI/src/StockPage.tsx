import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

const StockPage = () => {
  const { symbol } = useParams();
  const [price, setPrice] = useState<string>('Loading...');
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!symbol) return;

    const socket = new WebSocket('ws://localhost:3000'); // Replace with actual WS port
    socketRef.current = socket;

    socket.onopen = () => {
      socket.send(JSON.stringify({ action: 'SUB', stock: symbol }));
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.stock === symbol) {
        setPrice(data.price);
      }
    };

    socket.onclose = () => {
      console.log('Socket closed');
    };

    return () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ action: 'UNSUB', stock: symbol }));
      }
      socket.close();
    };
  }, [symbol]);

  return (
    <div style={{ padding: 20 }}>
      <h2>Live Price for {symbol}</h2>
      <div style={{ fontSize: '2rem', marginTop: 20 }}>{price}</div>
    </div>
  );
};

export default StockPage;
