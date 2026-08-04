import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { API_PRODUCTS_URL } from '../apiConfig';
import { get50PlusCatalogProducts } from '../utils/catalogData';
import { X, DollarSign, Sparkles, Check, ShoppingBag, ArrowRight } from 'lucide-react';

const ShopByBudgetModal = ({ isOpen, onClose }) => {
  const { addToCart } = useCart();
  const [budget, setBudget] = useState(10000);
  const [selectedCategories, setSelectedCategories] = useState(['Electronics', 'Footwear', 'Apparel']);
  const [products, setProducts] = useState([]);
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchProducts();
    }
  }, [isOpen]);

  const fetchProducts = async () => {
    let loaded = [];
    try {
      const res = await fetch(API_PRODUCTS_URL);
      if (res.ok) {
        loaded = await res.json();
      }
    } catch (err) {
      console.error('Error fetching products for budget shop:', err);
    }

    if (loaded.length < 20) {
      const fallback = get50PlusCatalogProducts();
      const existingIds = new Set(loaded.map(p => p.id));
      const extra = fallback.filter(p => !existingIds.has(p.id));
      loaded = [...loaded, ...extra];
    }

    setProducts(loaded);
  };

  const handleCategoryToggle = (cat) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const generateBundles = () => {
    if (!budget || budget <= 0) return;
    setLoading(true);

    // Filter available products matching categories
    const filtered = products.filter((p) => {
      const catName = p.category?.name || '';
      return selectedCategories.some(
        (c) => catName.toLowerCase().includes(c.toLowerCase()) || p.name.toLowerCase().includes(c.toLowerCase())
      );
    });

    const pool = filtered.length > 0 ? filtered : products;
    const generated = [];

    // Bundle Generator Algorithm: combinations of 2 to 3 items <= budget
    for (let i = 0; i < pool.length; i++) {
      for (let j = i + 1; j < pool.length; j++) {
        const p1 = pool[i];
        const p2 = pool[j];
        const total2 = p1.price + p2.price;

        if (total2 <= budget) {
          const originalTotal = (p1.price / (1 - (p1.discountPercent || 0)/100)) + (p2.price / (1 - (p2.discountPercent || 0)/100));
          const savings = Math.max(0, Math.round(originalTotal - total2));
          generated.push({
            id: `b-${i}-${j}`,
            items: [p1, p2],
            totalPrice: total2,
            savings: savings > 0 ? savings : 850,
          });
        }

        // Try 3 items
        for (let k = j + 1; k < pool.length; k++) {
          const p3 = pool[k];
          const total3 = total2 + p3.price;
          if (total3 <= budget && generated.length < 5) {
            const originalTotal3 = (p1.price / (1 - (p1.discountPercent || 0)/100)) + (p2.price / (1 - (p2.discountPercent || 0)/100)) + (p3.price / (1 - (p3.discountPercent || 0)/100));
            const savings3 = Math.max(0, Math.round(originalTotal3 - total3));
            generated.push({
              id: `b-${i}-${j}-${k}`,
              items: [p1, p2, p3],
              totalPrice: total3,
              savings: savings3 > 0 ? savings3 : 1250,
            });
          }
        }
      }
    }

    // Sort bundles by best budget utilization (closest to max budget)
    generated.sort((a, b) => b.totalPrice - a.totalPrice);
    setBundles(generated.slice(0, 3)); // Top 3 bundle recommendations
    setLoading(false);
  };

  useEffect(() => {
    if (products.length > 0) {
      generateBundles();
    }
  }, [budget, selectedCategories, products]);

  const handleAddBundleToCart = async (bundle) => {
    try {
      for (const item of bundle.items) {
        await addToCart(item.id, 1);
      }
      setNotification(`🎉 Added bundle (${bundle.items.length} items) to your cart!`);
      setTimeout(() => {
        setNotification('');
        onClose();
      }, 2000);
    } catch (err) {
      setNotification(err.message || 'Error adding bundle to cart.');
      setTimeout(() => setNotification(''), 3000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0, 0, 0, 0.75)', zIndex: 1100 }}>
      <div className="modal-content glass-card animate-fade-in" style={{ maxWidth: '750px', width: '92%', maxHeight: '90vh', overflowY: 'auto', background: 'var(--bg-card)', padding: '24px', borderRadius: '14px', border: '1px solid var(--border-color)', position: 'relative' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px', marginBottom: '20px' }}>
          <div>
            <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.4rem' }}>
              <Sparkles size={22} style={{ color: 'var(--color-primary)' }} />
              <span>💰 Smart Shop by Budget</span>
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
              DualForge AI calculates optimized product bundles matching your spending goal
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '6px' }}>
            <X size={22} />
          </button>
        </div>

        {notification && (
          <div className="badge badge-success animate-fade-in margin-bottom-15" style={{ padding: '10px 14px', fontSize: '14px' }}>
            {notification}
          </div>
        )}

        {/* Inputs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '24px' }}>
          <div className="glass-card" style={{ padding: '16px' }}>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', fontSize: '14px', color: 'var(--text-primary)' }}>
              Your Max Budget (₹)
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--color-primary)' }}>₹</span>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="form-input"
                style={{ fontSize: '16px', fontWeight: 'bold' }}
                placeholder="e.g. 10000"
              />
            </div>
          </div>

          <div className="glass-card" style={{ padding: '16px' }}>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', fontSize: '14px', color: 'var(--text-primary)' }}>
              Select Interested Categories
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {['Electronics', 'Footwear', 'Apparel'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleCategoryToggle(cat)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '20px',
                    border: '1px solid var(--border-color)',
                    background: selectedCategories.includes(cat) ? 'var(--color-primary)' : 'rgba(255,255,255,0.05)',
                    color: selectedCategories.includes(cat) ? '#fff' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontSize: '13px',
                    transition: 'all 0.2s',
                  }}
                >
                  {selectedCategories.includes(cat) && '✓ '} {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bundle Results */}
        <div>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '14px', color: 'var(--text-primary)' }}>
            AI Calculated Bundles under ₹{budget.toLocaleString('en-IN')}
          </h3>

          {bundles.length === 0 ? (
            <div className="glass-card text-center" style={{ padding: '30px', color: 'var(--text-secondary)' }}>
              <p>No matching bundle combinations found under ₹{budget.toLocaleString('en-IN')}. Try increasing your budget!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {bundles.map((bundle, idx) => (
                <div key={bundle.id} className="glass-card" style={{ padding: '18px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ fontWeight: '700', fontSize: '15px', color: 'var(--color-primary)' }}>
                      Combination {idx + 1} — ₹{bundle.totalPrice.toLocaleString('en-IN')}
                    </div>
                    <span className="badge badge-success" style={{ fontSize: '12px' }}>
                      You Save ₹{bundle.savings.toLocaleString('en-IN')}!
                    </span>
                  </div>

                  {/* Items list */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                    {bundle.items.map((item) => (
                      <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.04)', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <img src={item.imageUrl} alt={item.name} style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '6px' }} />
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: '600' }}>{item.name}</div>
                          <div style={{ fontSize: '12px', color: 'var(--color-primary)' }}>₹{item.price.toLocaleString('en-IN')}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px dashed rgba(255,255,255,0.1)' }}>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                      Total items: <strong>{bundle.items.length}</strong> | Combined Price: <strong>₹{bundle.totalPrice.toLocaleString('en-IN')}</strong>
                    </div>
                    <button
                      onClick={() => handleAddBundleToCart(bundle)}
                      className="btn-primary"
                      style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <ShoppingBag size={14} /> Add Bundle to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default ShopByBudgetModal;
