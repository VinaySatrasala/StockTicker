import React from 'react';
import { useNavigate } from 'react-router-dom';

const stocks = ['APPL', 'TSLA', 'GOOG', 'AMZN', 'MSFT'];

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div style={{ padding: 20 }}>
      <h2>Select a Stock</h2>
      {stocks.map((stock) => (
        <button
          key={stock}
          onClick={() => navigate(`/stock/${stock}`)}
          style={{ margin: 10, padding: 10 }}
        >
          {stock}
        </button>
      ))}
    </div>
  );
};

export default HomePage;
