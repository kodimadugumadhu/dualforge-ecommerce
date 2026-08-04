import React from 'react';
import { useCompare } from '../context/CompareContext';
import { X, Check, ShieldCheck, Sparkles, Star, Trash2 } from 'lucide-react';

const ProductComparisonModal = () => {
  const { compareItems, removeFromCompare, clearCompare, isModalOpen, setIsModalOpen } = useCompare();

  if (!isModalOpen || compareItems.length === 0) return null;

  // Calculate Trust Score helper (0-100)
  const getTrustScore = (p) => {
    let score = 50; // base score
    if (p.seller) score += 20;
    if (p.rating) score += Math.round(p.rating * 5);
    if (p.reviewCount && p.reviewCount > 5) score += 10;
    return Math.min(99, score);
  };

  // Helper for Eco score
  const getEcoScore = (p) => {
    const cat = p.category?.name?.toLowerCase() || '';
    if (cat.includes('apparel') || cat.includes('footwear')) return 'A (Sustainable)';
    if (cat.includes('elect')) return 'B (Recyclable Packaging)';
    return 'B+ (Eco Certified)';
  };

  // Compute AI recommendation dynamically among compared products
  const getAiRecommendation = () => {
    if (compareItems.length === 1) {
      return `Add another product to get a side-by-side comparative analysis and value recommendation!`;
    }

    // Sort by value formula: (Rating * 20) - (Price / 1000)
    const sorted = [...compareItems].sort((a, b) => {
      const scoreA = (a.rating || 4.5) * 20 - (a.price / 1000);
      const scoreB = (b.rating || 4.5) * 20 - (b.price / 1000);
      return scoreB - scoreA;
    });

    const winner = sorted[0];
    const runnerUp = sorted[1];
    const priceDiff = Math.abs(winner.price - runnerUp.price);

    return `🤖 **AI Recommendation**: **${winner.name}** provides the best overall value! It offers a top rating of ⭐ ${winner.rating || 4.5} and strong feature set at ₹${winner.price.toLocaleString('en-IN')}${winner.price < runnerUp.price ? ` (saving you ₹${priceDiff.toLocaleString('en-IN')} compared to ${runnerUp.name})` : ''}.`;
  };

  return (
    <div className="modal-backdrop" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0, 0, 0, 0.75)', zIndex: 1100 }}>
      <div className="modal-content glass-card animate-fade-in" style={{ maxWidth: '950px', width: '92%', maxHeight: '90vh', overflowY: 'auto', background: 'var(--bg-card)', padding: '24px', borderRadius: '14px', border: '1px solid var(--border-color)', position: 'relative' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px', marginBottom: '20px' }}>
          <div>
            <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.4rem' }}>
              <Sparkles size={22} style={{ color: 'var(--color-primary)' }} />
              <span>Product Comparison Matrix</span>
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
              Comparing {compareItems.length} selected products side-by-side
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button onClick={clearCompare} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Trash2 size={14} /> Clear All
            </button>
            <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '6px' }}>
              <X size={22} />
            </button>
          </div>
        </div>

        {/* Comparison Table */}
        <div style={{ overflowX: 'auto' }}>
          <table className="size-chart-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr>
                <th style={{ width: '160px', background: 'rgba(255,255,255,0.03)' }}>Feature</th>
                {compareItems.map((item) => (
                  <th key={item.id} style={{ minWidth: '180px', textAlign: 'center', verticalAlign: 'top', padding: '12px' }}>
                    <button 
                      onClick={() => removeFromCompare(item.id)} 
                      title="Remove from comparison"
                      style={{ background: 'rgba(239, 68, 68, 0.2)', border: 'none', color: '#ef4444', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', float: 'right', margin: '-4px -4px 0 0' }}
                    >
                      <X size={12} />
                    </button>
                    <img src={item.imageUrl} alt={item.name} style={{ width: '80px', height: '80px', objectFit: 'contain', borderRadius: '8px', margin: '0 auto 8px', display: 'block' }} />
                    <div style={{ fontWeight: '600', fontSize: '14px', lineHeight: '1.2' }}>{item.name}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>Price</td>
                {compareItems.map((item) => (
                  <td key={item.id} style={{ textAlign: 'center', fontWeight: 'bold', color: 'var(--color-primary)', fontSize: '16px' }}>
                    ₹{item.price.toLocaleString('en-IN')}
                  </td>
                ))}
              </tr>
              <tr>
                <td style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>Rating</td>
                {compareItems.map((item) => (
                  <td key={item.id} style={{ textAlign: 'center' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Star size={14} className="star-icon fill-amber" /> {item.rating || 4.5} ({item.reviewCount || 10})
                    </span>
                  </td>
                ))}
              </tr>
              <tr>
                <td style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>Stock Status</td>
                {compareItems.map((item) => (
                  <td key={item.id} style={{ textAlign: 'center' }}>
                    {item.stockQuantity <= 0 ? (
                      <span className="badge badge-error">Sold Out</span>
                    ) : item.stockQuantity <= 5 ? (
                      <span className="badge badge-warning">Only {item.stockQuantity} Left</span>
                    ) : (
                      <span className="badge badge-success">In Stock ({item.stockQuantity})</span>
                    )}
                  </td>
                ))}
              </tr>
              <tr>
                <td style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>Trust Score 🛡️</td>
                {compareItems.map((item) => (
                  <td key={item.id} style={{ textAlign: 'center', fontWeight: 'bold', color: '#10b981' }}>
                    {getTrustScore(item)} / 100
                  </td>
                ))}
              </tr>
              <tr>
                <td style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>Eco Score 🌱</td>
                {compareItems.map((item) => (
                  <td key={item.id} style={{ textAlign: 'center', fontSize: '13px' }}>
                    {getEcoScore(item)}
                  </td>
                ))}
              </tr>
              <tr>
                <td style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>Warranty</td>
                {compareItems.map((item) => (
                  <td key={item.id} style={{ textAlign: 'center', fontSize: '13px' }}>
                    {item.warranty || '6 Months Warranty'}
                  </td>
                ))}
              </tr>
              <tr>
                <td style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>Discount</td>
                {compareItems.map((item) => (
                  <td key={item.id} style={{ textAlign: 'center' }}>
                    {item.discountPercent > 0 ? (
                      <span className="badge badge-success">{item.discountPercent}% OFF</span>
                    ) : (
                      <span style={{ color: 'var(--text-secondary)' }}>Standard Price</span>
                    )}
                  </td>
                ))}
              </tr>
              <tr>
                <td style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>Delivery</td>
                {compareItems.map((item) => (
                  <td key={item.id} style={{ textAlign: 'center', fontSize: '13px' }}>
                    {item.estimatedDeliveryDays || 3} Days Delivery
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* AI Recommendation Section */}
        <div style={{ marginTop: '24px', padding: '16px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.25)' }}>
          <div style={{ fontWeight: '600', fontSize: '15px', color: 'var(--text-primary)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={18} style={{ color: '#6366f1' }} />
            <span>🤖 AI Comparative Recommendation</span>
          </div>
          <div style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            {getAiRecommendation()}
          </div>
        </div>

        {/* Footer actions */}
        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button className="btn-secondary" onClick={() => setIsModalOpen(false)}>Close Matrix</button>
        </div>
      </div>
    </div>
  );
};

export default ProductComparisonModal;
