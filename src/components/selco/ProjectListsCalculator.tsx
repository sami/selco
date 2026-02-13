import React, { useState } from 'react';

interface ListItem {
  name: string;
  qty: number;
  price: number;
  total: number;
}

export default function ProjectListsCalculator() {
  const [items, setItems] = useState<ListItem[]>([]);
  const [itemName, setItemName] = useState('');
  const [itemQty, setItemQty] = useState(1);
  const [itemPrice, setItemPrice] = useState('');

  const addItem = () => {
    const price = parseFloat(itemPrice);

    if (itemName && itemQty && !isNaN(price)) {
      const newItem: ListItem = {
        name: itemName,
        qty: itemQty,
        price: price,
        total: itemQty * price
      };

      setItems([...items, newItem]);
      setItemName('');
      setItemQty(1);
      setItemPrice('');
    } else {
      alert('Please fill in all fields');
    }
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const grandTotal = items.reduce((sum, item) => sum + item.total, 0);

  return (
    <div className="calculator-embed">
      {/* Visual Header */}
      <div className="calc-hero-banner">
        <div className="calc-icon-circle">
          <i className="fas fa-calculator"></i>
        </div>
        <div>
          <div className="calc-title-text">
            Project <span style={{ color: '#004B8D' }}>Lists</span>
          </div>
          <div style={{
            fontWeight: 800,
            textTransform: 'uppercase',
            background: '#004B8D',
            color: '#fff',
            padding: '2px 10px',
            display: 'inline-block',
            transform: 'rotate(-2deg)'
          }}>
            We've Got It!
          </div>
        </div>
      </div>

      {/* Functional App */}
      <div className="calc-interface">
        <p style={{ marginBottom: '10px', fontWeight: 'bold', color: '#555' }}>
          Live Demo: Add materials to calculate your project cost.
        </p>

        <div className="calc-row">
          <input
            type="text"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            placeholder="Item Name (e.g. Cement)"
          />
          <input
            type="number"
            className="qty"
            value={itemQty}
            onChange={(e) => setItemQty(parseInt(e.target.value) || 1)}
            placeholder="Qty"
          />
          <input
            type="number"
            className="price"
            value={itemPrice}
            onChange={(e) => setItemPrice(e.target.value)}
            placeholder="Price (£)"
            step="0.01"
          />
          <button className="calc-add-btn" onClick={addItem}>
            ADD
          </button>
        </div>

        <table className="calc-table">
          <thead>
            <tr>
              <th>Item</th>
              <th style={{ textAlign: 'right' }}>Qty</th>
              <th style={{ textAlign: 'right' }}>Price</th>
              <th style={{ textAlign: 'right' }}>Total</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
                  List is empty. Add an item above.
                </td>
              </tr>
            ) : (
              items.map((item, index) => (
                <tr key={index}>
                  <td>{item.name}</td>
                  <td style={{ textAlign: 'right' }}>{item.qty}</td>
                  <td style={{ textAlign: 'right' }}>£{item.price.toFixed(2)}</td>
                  <td style={{ textAlign: 'right' }}>
                    <strong>£{item.total.toFixed(2)}</strong>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => removeItem(index)}
                      style={{
                        color: 'red',
                        background: 'none',
                        border: 'none',
                        fontSize: '0.8rem',
                        textDecoration: 'underline',
                        cursor: 'pointer'
                      }}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="calc-total-bar">
          Total: <span>£{grandTotal.toFixed(2)}</span>
        </div>
      </div>

      <style>{`
        .calculator-embed {
          background-color: white;
          border: 5px solid #FFCD00;
          padding: 0;
          margin-bottom: 30px;
          position: relative;
        }
        .calc-hero-banner {
          background-color: #FFCD00;
          padding: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 20px;
          color: #00264d;
        }
        .calc-icon-circle {
          width: 80px;
          height: 80px;
          background: #004B8D;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.5rem;
          color: #FFCD00;
          border: 4px solid #FFCD00;
          box-shadow: 0 0 0 4px #004B8D;
        }
        .calc-title-text {
          font-family: 'Arial Black', sans-serif;
          font-size: 2.5rem;
          line-height: 1;
          text-transform: uppercase;
        }
        .calc-interface {
          padding: 20px;
          background: #f9f9f9;
        }
        .calc-row {
          display: flex;
          gap: 10px;
          margin-bottom: 10px;
        }
        .calc-row input {
          padding: 10px;
          border: 1px solid #ccc;
          flex-grow: 1;
          border-radius: 4px;
        }
        .calc-row input.qty {
          max-width: 80px;
        }
        .calc-row input.price {
          max-width: 100px;
        }
        .calc-add-btn {
          background: #004B8D;
          color: white;
          border: none;
          padding: 0 20px;
          font-weight: bold;
          cursor: pointer;
          border-radius: 4px;
        }
        .calc-add-btn:hover {
          opacity: 0.9;
        }
        .calc-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 15px;
          background: white;
          font-size: 0.9rem;
        }
        .calc-table th {
          background: #eee;
          text-align: left;
          padding: 10px;
          color: #00264d;
        }
        .calc-table td {
          border-bottom: 1px solid #eee;
          padding: 10px;
        }
        .calc-total-bar {
          background: #00264d;
          color: white;
          padding: 15px;
          text-align: right;
          font-size: 1.2rem;
          font-weight: bold;
          margin-top: 15px;
          border-radius: 4px;
        }

        @media (max-width: 600px) {
          .calc-hero-banner {
            flex-direction: column;
            text-align: center;
          }
          .calc-title-text {
            font-size: 1.8rem;
          }
          .calc-row {
            flex-wrap: wrap;
          }
          .calc-row input {
            max-width: 100% !important;
            width: 100%;
          }
          .calc-row .calc-add-btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
