import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { Trash2, ShoppingCart, HeartOff, Star, ArrowRight, Eye, RefreshCw } from 'lucide-react';

const Wishlist = () => {
  const { wishlist, loading, toggleWishlist, refreshWishlist } = useWishlist();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [notification, setNotification] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [addingToCartId, setAddingToCartId] = useState(null);

  const handleRemove = async (product) => {
    try {
      await toggleWishlist(product);
      setNotification('Removed from Wishlist');
      setTimeout(() => setNotification(''), 3000);
    } catch (err) {
      setErrorMsg('Unable to remove item. Retry');
      setTimeout(() => setErrorMsg(''), 4000);
    }
  };

  const handleAddToCart = async (product) => {
    setAddingToCartId(product.id);
    try {
      await addToCart(product.id, 1);
      setNotification(`Added "${product.name}" to cart!`);
      setTimeout(() => setNotification(''), 3000);
    } catch (err) {
      setNotification(err.message || 'Please log in to manage your cart.');
      setTimeout(() => setNotification(''), 4000);
    } finally {
      setAddingToCartId(null);
    }
  };

  const renderStars = (ratingValue) => {
    const stars = [];
    const fullStars = Math.floor(ratingValue);
    const hasHalfStar = ratingValue % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<Star key={i} size={14} className="star-icon fill-amber" style={{ fill: 'var(--amber-primary)', color: 'var(--amber-primary)' }} />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<Star key={i} size={14} className="star-icon half-star" style={{ color: 'var(--amber-primary)' }} />);
      } else {
        stars.push(<Star key={i} size={14} className="star-icon text-muted" style={{ color: 'var(--border-color)' }} />);
      }
    }
    return stars;
  };

  if (loading && wishlist.products.length === 0) {
    return (
      <div className="loader-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="wishlist-page container animate-fade-in">
      {notification && (
        <div className="toast-notification badge badge-primary animate-fade-in" style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 1000 }}>
          {notification}
        </div>
      )}

      {errorMsg && (
        <div className="toast-notification badge badge-error animate-fade-in" style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 1000 }}>
          {errorMsg}
          <button onClick={refreshWishlist} className="btn-table-action" style={{ marginLeft: '10px', color: '#fff' }}>
            <RefreshCw size={12} />
          </button>
        </div>
      )}

      <div className="cart-header">
        <h1>Your Wishlist</h1>
        <p>Keep track of premium products you love.</p>
      </div>

      {wishlist.products.length === 0 ? (
        <div className="empty-cart-view glass-card">
          <HeartOff size={64} className="empty-cart-icon" style={{ color: 'var(--text-secondary)' }} />
          <h2>Your Wishlist is Empty</h2>
          <p>Browse our catalog and tap the heart icon to save products here.</p>
          <Link to="/catalog" className="btn-primary">
            <span>Continue Shopping</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="product-grid" style={{ marginTop: '30px' }}>
          {wishlist.products.map((product) => {
            const hasDiscount = product.discountPercent > 0;
            const originalPrice = hasDiscount 
              ? (product.price / (1 - product.discountPercent / 100)).toFixed(2)
              : null;

            return (
              <div key={product.id} className="product-card glass-card">
                <div className="product-img-wrapper">
                  <img src={product.imageUrl} alt={product.name} />
                  <div className="product-badge-group">
                    <span className="product-category-tag badge badge-primary">{product.category?.name || 'Category'}</span>
                    {hasDiscount && (
                      <span className="discount-tag badge badge-success">{product.discountPercent}% OFF</span>
                    )}
                  </div>
                </div>

                <div className="product-details-summary" style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'space-between' }}>
                  <div>
                    <div className="product-card-brand-row">
                      <span className="product-card-brand">{product.brand || 'Generic'}</span>
                      <span className="table-sub" style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                        Seller: {product.seller?.firstName || product.seller?.username || 'Verified Seller'}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '16px', margin: '8px 0' }}>{product.name}</h3>

                    <div className="product-card-rating" style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '10px' }}>
                      <div className="stars-flex" style={{ display: 'flex', gap: '2px' }}>
                        {renderStars(product.rating || 4.5)}
                      </div>
                      <span className="rating-value">{product.rating || 4.5}</span>
                    </div>

                    <div className="prices-row" style={{ display: 'flex', alignItems: 'baseline', gap: '8px', margin: '8px 0' }}>
                      <span className="current-price" style={{ fontSize: '18px', fontWeight: '700', color: 'var(--color-primary)' }}>
                        ₹{product.price.toLocaleString('en-IN')}
                      </span>
                      {hasDiscount && (
                        <span className="original-price" style={{ textDecoration: 'line-through', fontSize: '14px', color: 'var(--text-secondary)' }}>
                          ₹{Math.round(product.price / (1 - product.discountPercent / 100)).toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>

                    <div style={{ margin: '10px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                      {product.stockQuantity <= 0 ? (
                        <span className="badge badge-error" style={{ fontSize: '11px', padding: '2px 8px' }}>❌ Out of Stock</span>
                      ) : product.stockQuantity <= 2 ? (
                        <span className="badge badge-error" style={{ fontSize: '11px', padding: '2px 8px', background: '#ef4444' }}>🔴 Only {product.stockQuantity} left</span>
                      ) : product.stockQuantity <= (product.lowStockThreshold || 5) ? (
                        <span className="badge badge-warning" style={{ fontSize: '11px', padding: '2px 8px' }}>🟠 Only {product.stockQuantity} remaining</span>
                      ) : (
                        <span className="badge badge-success" style={{ fontSize: '11px', padding: '2px 8px' }}>🟢 In Stock</span>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setNotification(`🔔 Price Drop alert active for ${product.name}! We will notify you when price drops below ₹${product.price.toLocaleString('en-IN')}`);
                          setTimeout(() => setNotification(''), 4000);
                        }}
                        style={{ background: 'none', border: 'none', color: '#10b981', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}
                      >
                        🔔 Price Alert
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button 
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stockQuantity <= 0 || addingToCartId === product.id}
                        className="btn-primary"
                        style={{ flexGrow: 1, padding: '10px', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
                      >
                        <ShoppingCart size={14} />
                        <span>{addingToCartId === product.id ? 'Adding...' : 'Add to Cart'}</span>
                      </button>

                      <button 
                        onClick={() => navigate(`/product/${product.id}`)}
                        className="btn-secondary"
                        style={{ padding: '10px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', cursor: 'pointer' }}
                        title="View Details"
                      >
                        <Eye size={14} />
                      </button>
                    </div>

                    <button 
                      onClick={() => handleRemove(product)}
                      className="logout-btn"
                      style={{ 
                        width: '100%', 
                        padding: '10px', 
                        fontSize: '12px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        gap: '6px',
                        background: 'rgba(239, 68, 68, 0.05)',
                        border: '1px solid rgba(239, 68, 68, 0.1)',
                        color: 'var(--red-primary)',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      <Trash2 size={12} />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
