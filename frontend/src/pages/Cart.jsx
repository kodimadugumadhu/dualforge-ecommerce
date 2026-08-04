import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';

const Cart = () => {
  const { cart, loading, updateCartQuantity, removeFromCart, getCartTotal, getCartCount } = useCart();
  const navigate = useNavigate();

  const handleQuantityChange = async (productId, currentQty, amount) => {
    const newQty = currentQty + amount;
    try {
      await updateCartQuantity(productId, newQty);
    } catch (err) {
      alert(err.message || 'Failed to update quantity');
    }
  };

  const handleRemove = async (productId) => {
    try {
      await removeFromCart(productId);
    } catch (err) {
      alert('Failed to remove item');
    }
  };

  if (loading && cart.items.length === 0) {
    return (
      <div className="loader-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="cart-page container animate-fade-in">
      <div className="cart-header">
        <h1>Your Shopping Cart</h1>
        <p>You have {getCartCount()} item(s) in your cart.</p>
      </div>

      {cart.items.length === 0 ? (
        <div className="empty-cart-view glass-card">
          <ShoppingBag size={64} className="empty-cart-icon" />
          <h2>Your Cart is Empty</h2>
          <p>Browse our catalog and add premium items to get started.</p>
          <Link to="/catalog" className="btn-primary">
            <span>Continue Shopping</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          {/* Items List */}
          <div className="cart-items-list">
            {cart.items.map((item) => (
              <div key={item.id} className="cart-item-card glass-card">
                <img src={item.product.imageUrl} alt={item.product.name} className="cart-item-img" />
                
                <div className="cart-item-details">
                  <span className="badge badge-primary">{item.product.category.name}</span>
                  <h3>{item.product.name}</h3>
                  <p className="cart-item-price-unit">₹{item.product.price.toLocaleString('en-IN')} each</p>
                </div>

                <div className="cart-item-quantity-control">
                  <button 
                    onClick={() => handleQuantityChange(item.product.id, item.quantity, -1)}
                    className="qty-btn"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="qty-val">{item.quantity}</span>
                  <button 
                    onClick={() => handleQuantityChange(item.product.id, item.quantity, 1)}
                    className="qty-btn"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <div className="cart-item-subtotal">
                  <span>₹{(item.product.price * item.quantity).toLocaleString('en-IN')}</span>
                </div>

                <button 
                  onClick={() => handleRemove(item.product.id)}
                  className="cart-item-remove-btn"
                  title="Remove Item"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>

          {/* Order Summary Sidebar */}
          <aside className="order-summary-sidebar glass-card">
            <h3>Order Summary</h3>

            {/* Feature 7: AI Coupon Optimizer Banner */}
            <div style={{ background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '10px', padding: '14px', marginBottom: '16px' }}>
              <div style={{ fontWeight: '600', fontSize: '13px', color: '#f59e0b', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>🎉 Best Coupon Available:</span> <strong>FLAGSHIP20</strong>
              </div>
              <p style={{ margin: '0 0 10px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                Apply to save <strong>₹{Math.round((getCartTotal() * 20) / 100).toLocaleString('en-IN')}</strong> (20% OFF) on your entire cart!
              </p>
              <button
                type="button"
                onClick={() => navigate('/checkout?coupon=FLAGSHIP20')}
                className="btn-primary"
                style={{ width: '100%', padding: '8px', fontSize: '12px', background: 'var(--grad-amber-orange)' }}
              >
                🎉 Apply Best Coupon in Checkout
              </button>
            </div>

            <div className="summary-row">
              <span>Subtotal ({getCartCount()} items)</span>
              <span>₹{getCartTotal().toLocaleString('en-IN')}</span>
            </div>
            <div className="summary-row">
              <span>Shipping Fee</span>
              <span className="text-success">FREE</span>
            </div>
            <div className="summary-row">
              <span>GST / Taxes</span>
              <span className="text-muted">Included</span>
            </div>
            
            <hr className="summary-divider" />

            <div className="summary-row total-row">
              <span>Order Total</span>
              <span className="glow-text">₹{getCartTotal().toLocaleString('en-IN')}</span>
            </div>

            <button 
              onClick={() => navigate('/checkout')}
              className="btn-primary checkout-btn-cta"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={18} />
            </button>

            <div className="security-notice">
              <p>&bull; 256-bit SSL encrypted checkout</p>
              <p>&bull; Real-time inventory verified</p>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};

export default Cart;
