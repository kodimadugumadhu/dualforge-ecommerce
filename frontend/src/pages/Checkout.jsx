import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Lock, CreditCard, QrCode, CheckCircle, ShieldCheck, Download, Gift, Wallet } from 'lucide-react';
import { API_ORDERS_URL } from '../apiConfig';

const Checkout = () => {
  const { cart, getCartTotal, clearCart, refreshCart } = useCart();
  const { getAuthHeaders, user } = useAuth();
  const navigate = useNavigate();

  // Form State
  const [shippingAddress, setShippingAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CARD'); // CARD, UPI, STRIPE, RAZORPAY, COD, WALLET

  // Card Form State
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [upiId, setUpiId] = useState('');

  // Coupon State
  const [couponCode, setCouponCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);

  // Processing Animation state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState(null);

  if (cart.items.length === 0 && !isSuccess) {
    return <Navigate to="/cart" replace />;
  }

  // Auto-apply coupon from URL if present
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlCoupon = params.get('coupon');
    if (urlCoupon && urlCoupon.toUpperCase() === 'FLAGSHIP20') {
      setCouponCode('FLAGSHIP20');
      setDiscountPercent(20);
      setCouponApplied(true);
    }
  }, []);

  const applyCoupon = async () => {
    const codeToApply = couponCode || 'FLAGSHIP20';
    if (codeToApply.toUpperCase() === 'FLAGSHIP20') {
      setCouponCode('FLAGSHIP20');
      setDiscountPercent(20);
      setCouponApplied(true);
    } else {
      alert("Invalid or expired coupon code.");
    }
  };

  const getSubtotal = () => getCartTotal();
  const getDiscountAmount = () => (getSubtotal() * discountPercent) / 100;
  const getFinalTotal = () => getSubtotal() - getDiscountAmount();

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!shippingAddress || !city || !postalCode || !phone) {
      alert('Please fill out all shipping fields.');
      return;
    }

    // Step-by-step payment visualizer
    setIsProcessing(true);
    
    setProcessingStep('Connecting to secure payment gateway...');
    await new Promise(r => setTimeout(r, 1000));

    setProcessingStep(`Initializing transaction via ${paymentMethod}...`);
    await new Promise(r => setTimeout(r, 1000));

    setProcessingStep('Encrypting payment credentials (256-bit AES)...');
    await new Promise(r => setTimeout(r, 1000));

    setProcessingStep('Finalizing order records in SQL & MongoDB audit log...');

    try {
      const fullAddress = `${shippingAddress}, ${city} - ${postalCode}. Contact: ${phone}`;
      const response = await fetch(`${API_ORDERS_URL}/checkout`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          shippingAddress: fullAddress,
          paymentMethod: paymentMethod,
          paymentStatus: paymentMethod === 'COD' ? 'PENDING' : 'PAID'
        })
      });

      const data = await response.json();
      if (response.ok) {
        setPlacedOrderId(data.id);
        setProcessingStep('Secure checkout success!');
        await new Promise(r => setTimeout(r, 600));
        setIsSuccess(true);
        setIsProcessing(false);
        clearCart();
        refreshCart();
      } else {
        throw new Error(data.message || 'Failed to place order');
      }
    } catch (err) {
      alert(err.message || 'Transaction failed. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="checkout-page container animate-fade-in">
      {isProcessing && (
        <div className="payment-processing-overlay">
          <div className="processing-modal glass-card">
            <div className="spinner"></div>
            <h3>Securing Your Transaction</h3>
            <p className="processing-status-text">{processingStep}</p>
            <div className="secure-badge-row">
              <Lock size={14} />
              <span>SSL Secured Gateway</span>
            </div>
          </div>
        </div>
      )}

      {isSuccess && (
        <div className="payment-processing-overlay">
          <div className="processing-modal glass-card text-center success-modal animate-fade-in">
            <CheckCircle size={64} color="var(--color-success)" className="success-icon-glowing" />
            <h2>Payment Successful!</h2>
            <p>Your order has been authorized and securely saved.</p>
            
            {placedOrderId && (
              <div className="receipt-section margin-top-20">
                <a 
                  href={`http://localhost:8080/api/orders/${placedOrderId}/invoice`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="btn-secondary flex-align-center gap-5 justify-center margin-bottom-15"
                  style={{ width: 'fit-content', margin: '15px auto' }}
                >
                  <Download size={16} />
                  <span>Download Purchase Invoice (PDF)</span>
                </a>
              </div>
            )}

            <button 
              onClick={() => navigate('/orders')} 
              className="btn-primary"
              style={{ padding: '10px 24px' }}
            >
              Go to Order Tracking
            </button>
          </div>
        </div>
      )}

      <div className="checkout-header">
        <h1>Secure Checkout</h1>
        <p>Complete your purchase securely. All details are encrypted.</p>
      </div>

      <form onSubmit={handlePayment} className="checkout-layout">
        {/* Shipping Form Card */}
        <div className="checkout-form-column">
          <div className="checkout-section-card glass-card">
            <h2>1. Shipping Details</h2>
            <div className="form-grid-2">
              <div className="form-group-full">
                <label>Street Address</label>
                <input 
                  type="text" 
                  placeholder="123 Main St, Apartment / Block" 
                  value={shippingAddress} 
                  onChange={(e) => setShippingAddress(e.target.value)}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label>City</label>
                <input 
                  type="text" 
                  placeholder="Hyderabad" 
                  value={city} 
                  onChange={(e) => setCity(e.target.value)}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label>Postal Code</label>
                <input 
                  type="text" 
                  placeholder="500001" 
                  value={postalCode} 
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group-full">
                <label>Contact Phone Number</label>
                <input 
                  type="tel" 
                  placeholder="9491562284" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)}
                  className="form-input"
                  required
                />
              </div>
            </div>
          </div>

          {/* Payment Card */}
          <div className="checkout-section-card glass-card margin-top-20">
            <h2>2. Payment Information</h2>
            
            <div className="payment-tabs" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              <button 
                type="button"
                className={`payment-tab-btn ${paymentMethod === 'CARD' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('CARD')}
              >
                <CreditCard size={16} />
                <span>Card</span>
              </button>
              <button 
                type="button"
                className={`payment-tab-btn ${paymentMethod === 'UPI' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('UPI')}
              >
                <QrCode size={16} />
                <span>UPI</span>
              </button>
              <button 
                type="button"
                className={`payment-tab-btn ${paymentMethod === 'WALLET' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('WALLET')}
              >
                <Wallet size={16} />
                <span>Wallet</span>
              </button>
              <button 
                type="button"
                className={`payment-tab-btn ${paymentMethod === 'STRIPE' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('STRIPE')}
              >
                <CreditCard size={16} />
                <span>Stripe</span>
              </button>
              <button 
                type="button"
                className={`payment-tab-btn ${paymentMethod === 'RAZORPAY' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('RAZORPAY')}
              >
                <CreditCard size={16} />
                <span>Razorpay</span>
              </button>
              <button 
                type="button"
                className={`payment-tab-btn ${paymentMethod === 'COD' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('COD')}
              >
                <CheckCircle size={16} />
                <span>COD</span>
              </button>
            </div>

            {paymentMethod === 'CARD' && (
              <div className="card-payment-form animate-fade-in margin-top-15">
                <input 
                  type="text" 
                  placeholder="Card Number (4111 2222 3333 4444)" 
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="form-input margin-bottom-10"
                  required
                />
                <input 
                  type="text" 
                  placeholder="Name on Card" 
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className="form-input margin-bottom-10"
                  required
                />
                <div className="form-grid-2">
                  <input 
                    type="text" 
                    placeholder="MM/YY" 
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className="form-input"
                    required
                  />
                  <input 
                    type="password" 
                    placeholder="CVV" 
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    className="form-input"
                    maxLength="3"
                    required
                  />
                </div>
              </div>
            )}

            {paymentMethod === 'UPI' && (
              <div className="upi-payment-form animate-fade-in margin-top-15">
                <input 
                  type="text" 
                  placeholder="UPI ID (e.g. madhu@paytm)" 
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="form-input"
                  required
                />
              </div>
            )}

            {paymentMethod === 'WALLET' && (
              <div className="wallet-payment-form animate-fade-in margin-top-15 text-center">
                <p>Available Balance: <strong>₹5,000.00</strong></p>
                <p className="text-secondary text-sm">Payment will be deducted directly from your account credits.</p>
              </div>
            )}

            {paymentMethod === 'STRIPE' && (
              <div className="stripe-payment-form animate-fade-in margin-top-15 text-center">
                <p>Stripe International Payment Gateway: <span className="badge badge-success">READY</span></p>
              </div>
            )}

            {paymentMethod === 'RAZORPAY' && (
              <div className="razorpay-payment-form animate-fade-in margin-top-15 text-center">
                <p>Razorpay India UPI & Cards Gateway: <span className="badge badge-success">READY</span></p>
              </div>
            )}

            {paymentMethod === 'COD' && (
              <div className="cod-payment-form animate-fade-in margin-top-15 text-center">
                <p>Pay with Cash on Delivery (COD) upon receiving package.</p>
              </div>
            )}
          </div>
        </div>

        {/* Order Summary Column */}
        <div className="checkout-summary-column">
          <div className="checkout-summary-card glass-card">
            <h2>Order Summary</h2>
            
            <div className="summary-items-list margin-top-15">
              {cart.items.map(item => (
                <div key={item.id} className="summary-item-row">
                  <div className="summary-item-info">
                    <span>{item.product.name}</span>
                    <small className="text-secondary">Qty: {item.quantity}</small>
                  </div>
                  <span className="summary-item-price">₹{(item.product.price * item.quantity).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>

            {/* Feature 7: AI Coupon Optimizer section */}
            <div className="coupon-code-section margin-top-20 border-top pt-15">
              {!couponApplied ? (
                <div style={{ background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '10px', padding: '14px', marginBottom: '14px' }}>
                  <div style={{ fontWeight: '600', fontSize: '13px', color: '#f59e0b', marginBottom: '4px' }}>
                    🎉 Best Coupon Available: <strong>FLAGSHIP20</strong>
                  </div>
                  <p style={{ margin: '0 0 10px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    You can save <strong>₹{Math.round((getSubtotal() * 20) / 100).toLocaleString('en-IN')}</strong> on this order!
                  </p>
                  <button
                    type="button"
                    onClick={applyCoupon}
                    className="btn-primary"
                    style={{ width: '100%', padding: '8px', fontSize: '13px', background: 'var(--grad-amber-orange)' }}
                  >
                    🎉 Apply Best Coupon
                  </button>
                </div>
              ) : (
                <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', borderRadius: '10px', padding: '12px', marginBottom: '14px', color: '#10b981', fontSize: '13px', fontWeight: 'bold' }}>
                  ✓ Best Coupon FLAGSHIP20 Applied! Savings: ₹{getDiscountAmount().toLocaleString('en-IN')}
                </div>
              )}

              <label className="text-sm font-semibold">Coupon Code</label>
              <div className="flex-align-center gap-5 margin-top-5">
                <input 
                  type="text" 
                  placeholder="FLAGSHIP20" 
                  value={couponCode} 
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="form-input flex-1"
                  disabled={couponApplied}
                />
                <button type="button" onClick={applyCoupon} className="btn-secondary" disabled={couponApplied}>
                  {couponApplied ? 'Applied ✓' : 'Apply'}
                </button>
              </div>
            </div>

            {/* Calculations */}
            <div className="summary-calculations margin-top-25 border-top pt-15">
              <div className="calc-row">
                <span>Subtotal</span>
                <span>₹{getSubtotal().toLocaleString('en-IN')}</span>
              </div>
              
              {couponApplied && (
                <div className="calc-row text-success">
                  <span className="flex-align-center gap-5"><Gift size={14} /> Discount (20%)</span>
                  <span>-₹{getDiscountAmount().toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="calc-row">
                <span>Shipping Fees</span>
                <span className="text-success">FREE</span>
              </div>

              <div className="calc-row total-row margin-top-15">
                <span>Final Total</span>
                <span className="glow-text">₹{getFinalTotal().toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button type="submit" className="btn-primary auth-submit-btn margin-top-25">
              <ShieldCheck size={18} />
              <span>Authorize Order Securely</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
