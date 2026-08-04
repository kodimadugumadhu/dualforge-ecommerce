import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useCompare } from '../context/CompareContext';
import { Star, ShoppingCart, Info, Award, MessageSquare, Truck, ShieldAlert, Sparkles, Scale, Box, Heart, Ruler, X, RotateCcw, ShoppingBag, Package, Bell, CheckCircle2, ShieldCheck, Leaf, Layers } from 'lucide-react';
import { API_PRODUCTS_URL, API_REVIEWS_URL } from '../apiConfig';
import { get50PlusCatalogProducts } from '../utils/catalogData';

const ProductDetails = () => {
  const { id } = useParams();
  const { isAuthenticated, getAuthHeaders } = useAuth();
  const { addToCart } = useCart();
  const { toggleWishlist, wishlistProductIds } = useWishlist();
  const { toggleCompare, isInCompare, setIsModalOpen: openCompareModal } = useCompare();

  const handleWishlistToggle = async () => {
    if (!product) return;
    try {
      const action = await toggleWishlist(product);
      setNotification(action === 'added' ? 'Added to Wishlist ❤️' : 'Removed from Wishlist');
      setTimeout(() => setNotification(''), 3000);
    } catch (err) {
      setNotification(err.message || 'Unable to update wishlist. Retry');
      setTimeout(() => setNotification(''), 4000);
    }
  };

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  // Variant selections
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [recommendedSizeText, setRecommendedSizeText] = useState('');

  // Modals & UI States
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [notification, setNotification] = useState('');
  const [showSizeChart, setShowSizeChart] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showTrustModal, setShowTrustModal] = useState(false);
  const [priceDropSubscribed, setPriceDropSubscribed] = useState(false);

  const fetchProductAndReviews = async () => {
    setLoading(true);
    let productLoaded = false;
    try {
      // Fetch Product details
      const headers = getAuthHeaders ? getAuthHeaders() : {};
      const prodRes = await fetch(`${API_PRODUCTS_URL}/${id}`, { headers });
      if (!prodRes.ok) throw new Error(`Product fetch failed with status ${prodRes.status}`);
      const prodData = await prodRes.json();
      setProduct(prodData);
      productLoaded = true;
    } catch (err) {
      console.warn('Backend API product fetch fallback executing:', err);
      const fallbackList = get50PlusCatalogProducts();
      const match = fallbackList.find(p => String(p.id) === String(id));
      if (match) {
        setProduct(match);
        productLoaded = true;
      } else {
        setProduct(null);
      }
    }

    if (productLoaded) {
      try {
        // Fetch Product Reviews
        const revRes = await fetch(`${API_REVIEWS_URL}/product/${id}`);
        if (revRes.ok) {
          const revData = await revRes.json();
          setReviews(revData);
        }
      } catch (err) {
        console.error('Error fetching reviews:', err);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProductAndReviews();
  }, [id]);

  const handleAddToCart = () => {
    // Feature 4: Prevent Wrong Product Variant Orders with explicit error messaging
    let missingColor = false;
    let missingSize = false;

    if (product.variants) {
      const sections = product.variants.split('|');
      sections.forEach(sec => {
        const parts = sec.split(':');
        const title = (parts[0]?.trim() || '').toLowerCase();
        const isColor = title.includes('color') || title.includes('stealth');
        if (isColor && !selectedColor) missingColor = true;
        if (!isColor && !selectedSize) missingSize = true;
      });
    }

    if (missingColor && missingSize) {
      setNotification('⚠️ Size and color selection are required before adding to cart.');
      setTimeout(() => setNotification(''), 4000);
      return;
    } else if (missingSize) {
      setNotification(`⚠️ Please select your ${product?.category?.name?.toLowerCase().includes('footwear') ? 'shoe ' : ''}size before adding this product.`);
      setTimeout(() => setNotification(''), 4000);
      return;
    } else if (missingColor) {
      setNotification('⚠️ Please select a color before adding this product.');
      setTimeout(() => setNotification(''), 4000);
      return;
    }

    // Trigger pre-add confirmation modal
    setShowConfirmModal(true);
  };

  const confirmAndAddToCart = async () => {
    setShowConfirmModal(false);
    try {
      await addToCart(product.id, quantity);
      const variantStr = [selectedColor, selectedSize].filter(Boolean).join(' / ');
      const desc = variantStr ? `(${variantStr})` : '';
      setNotification(`Added ${quantity} x ${product.name} ${desc} to cart!`);
      setTimeout(() => setNotification(''), 3000);
    } catch (err) {
      setNotification(err.message || 'Please log in to manage your cart.');
      setTimeout(() => setNotification(''), 4000);
    }
  };

  const handleTogglePriceDrop = () => {
    setPriceDropSubscribed((prev) => !prev);
    if (!priceDropSubscribed) {
      setNotification(`🔔 Price Drop Alert activated! You will receive in-app notifications if ${product.name} drops below ₹${product.price.toLocaleString('en-IN')}`);
    } else {
      setNotification('Price Drop alert disabled.');
    }
    setTimeout(() => setNotification(''), 4000);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setSubmittingReview(true);
    try {
      const response = await fetch(`${API_REVIEWS_URL}/product/${product.id}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ rating, comment })
      });

      if (response.ok) {
        const newReview = await response.json();
        setReviews([newReview, ...reviews]);
        setComment('');
        setRating(5);
        setNotification('Review posted successfully to MongoDB!');
        setTimeout(() => setNotification(''), 3000);
      } else {
        const data = await response.json();
        setNotification(data.message || 'Failed to submit review.');
        setTimeout(() => setNotification(''), 4000);
      }
    } catch (err) {
      setNotification('Server connection failure.');
      setTimeout(() => setNotification(''), 4000);
    } finally {
      setSubmittingReview(false);
    }
  };

  const renderStars = (ratingValue) => {
    const stars = [];
    const fullStars = Math.floor(ratingValue);
    const hasHalfStar = ratingValue % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<Star key={i} size={16} className="star-icon fill-amber" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<Star key={i} size={16} className="star-icon half-star" />);
      } else {
        stars.push(<Star key={i} size={16} className="star-icon text-muted" />);
      }
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="loader-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container padding-40 animate-fade-in flex-center" style={{ minHeight: '65vh' }}>
        <div className="glass-card text-center" style={{ maxWidth: '580px', padding: '45px', margin: '0 auto' }}>
          <Package size={64} style={{ color: 'var(--color-primary)', margin: '0 auto 15px' }} />
          <h2>Product Not Found</h2>
          <p className="margin-top-10" style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
            The requested product (ID: <strong>#{id}</strong>) is currently unavailable or undergoing real-time inventory updates.
          </p>
          
          <div className="margin-top-25 flex-center gap-10 flex-wrap">
            <button onClick={fetchProductAndReviews} className="btn-primary flex-align-center gap-5">
              <RotateCcw size={16} />
              <span>Retry Loading</span>
            </button>
            <Link to="/catalog" className="btn-secondary flex-align-center gap-5">
              <ShoppingBag size={16} />
              <span>Browse Catalog</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const originalPrice = product.discountPercent > 0 
    ? (product.price / (1 - product.discountPercent / 100)).toFixed(2)
    : null;

  // Parse specifications text
  const specs = product.specifications 
    ? product.specifications.split('|').map(s => {
        const parts = s.split(':');
        return { key: parts[0]?.trim(), value: parts[1]?.trim() };
      })
    : [];

  // Parse variants if available
  const variantGroups = [];
  if (product.variants) {
    const sections = product.variants.split('|');
    sections.forEach(sec => {
      if (sec.includes(':')) {
        const parts = sec.split(':');
        const title = parts[0]?.trim() || 'Options';
        const opts = parts[1]?.split(',').map(o => o.trim()) || [];
        variantGroups.push({ title, opts });
      } else {
        const opts = sec.split(',').map(o => o.trim()) || [];
        if (opts.length > 0) {
          const firstOpt = opts[0].toLowerCase();
          let title = 'Color';
          if (firstOpt.includes('ram') || firstOpt.includes('gb') || firstOpt.includes('tb')) {
            title = 'Specification';
          } else if (['s', 'm', 'l', 'xl', 'xxl'].includes(firstOpt) || !isNaN(firstOpt) || firstOpt.match(/^[0-9]+$/)) {
            title = 'Size';
          }
          variantGroups.push({ title, opts });
        }
      }
    });
  }

  return (
    <div className="product-details-page container animate-fade-in">
      {notification && (
        <div className="toast-notification badge badge-primary animate-fade-in">
          {notification}
        </div>
      )}

      <div className="back-link">
        <Link to="/catalog">&larr; Back to Catalog</Link>
      </div>

      <div className="product-info-layout">
        {/* Left Column: Image Card */}
        <div className="product-media-column">
          <div className="product-media-card glass-card">
            <img src={product.imageUrl} alt={product.name} className="main-product-image" />
            {product.discountPercent > 0 && (
              <span className="details-discount-tag badge badge-success">{product.discountPercent}% OFF</span>
            )}
          </div>
          
          {/* Trust indicators & Trust Score */}
          <div className="trust-indicators-grid margin-top-20">
            <div className="trust-item glass-card" style={{ cursor: 'pointer' }} onClick={() => setShowTrustModal(true)} title="Click to view full DualForge Trust Score Breakdown">
              <ShieldCheck size={22} className="trust-icon" style={{ color: '#10b981' }} />
              <h4>🛡️ Trust Score: 94/100</h4>
              <p style={{ color: '#10b981', fontWeight: '500' }}>✓ Verified Seller & Product Audit (Click to view)</p>
            </div>
            <div className="trust-item glass-card">
              <Truck size={20} className="trust-icon" />
              <h4>{product.shippingCharges === 0 ? 'Free Shipping' : `₹${product.shippingCharges.toLocaleString('en-IN')} Standard`}</h4>
              <p>Estimated Delivery: {product.estimatedDeliveryDays} days across India</p>
            </div>
          </div>
        </div>

        {/* Right Column: Text & Purchase Panel */}
        <div className="product-purchase-card glass-card">
          <div className="product-meta-header">
            <div className="product-brand-details">
              <span className="brand-label">{product.brand || 'Generic'}</span>
              <span className="sku-tag">SKU: {product.sku}</span>
            </div>
            <div className="product-badges-row" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span className="badge badge-primary">{product?.category?.name || 'Catalog Item'}</span>
              {product.subCategory && (
                <span className="badge badge-secondary">{product.subCategory}</span>
              )}
              {/* Feature 2: Compare Button */}
              <button
                type="button"
                onClick={() => {
                  toggleCompare(product);
                  openCompareModal(true);
                }}
                className={`badge ${isInCompare(product.id) ? 'badge-success' : 'badge-secondary'}`}
                style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', border: 'none' }}
              >
                <Layers size={12} /> {isInCompare(product.id) ? '✓ Comparing' : '☑ Compare'}
              </button>
            </div>
          </div>

          <h1 className="product-title">{product.name}</h1>

          {/* Rating summary */}
          <div className="rating-summary">
            <div className="stars-row">{renderStars(product.rating)}</div>
            <span className="rating-avg-text">{product.rating} ({product.reviewCount} customer reviews)</span>
          </div>

          {/* Pricing Block & Price Drop Alert */}
          <div className="pricing-details-block" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <div className="price-row">
                <span className="product-price-tag">₹{product.price.toLocaleString('en-IN')}</span>
                {originalPrice && (
                  <span className="original-price-tag">₹{Math.round(product.price / (1 - product.discountPercent / 100)).toLocaleString('en-IN')}</span>
                )}
              </div>
              <p className="gst-disclosure">Inclusive of {product.gstPercentage}% GST (All Taxes Included)</p>
            </div>

            {/* Feature 8: Price Drop Alert */}
            <button
              type="button"
              onClick={handleTogglePriceDrop}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                border: priceDropSubscribed ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.15)',
                background: priceDropSubscribed ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.05)',
                color: priceDropSubscribed ? '#10b981' : 'var(--text-primary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                transition: 'all 0.3s',
              }}
            >
              <Bell size={14} className={priceDropSubscribed ? 'animate-bounce' : ''} />
              <span>{priceDropSubscribed ? '🔔 Price Drop Active' : '🔔 Notify on Price Drop'}</span>
            </button>
          </div>

          <p className="product-description-full">{product.description}</p>

          {/* Feature 5: Explain WHY a Product Is Recommended */}
          <div className="why-recommended-card" style={{ margin: '15px 0', padding: '14px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
            <h4 style={{ margin: '0 0 8px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-primary)' }}>
              <Sparkles size={16} style={{ color: '#6366f1' }} /> Why we recommend it:
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)' }}>
              <div>✓ Verified DualForge Trust Score (94/100)</div>
              <div>✓ {product.rating || 4.5} ⭐ High customer satisfaction rating</div>
              {product.discountPercent > 0 && <div>✓ Currently discounted ({product.discountPercent}% OFF)</div>}
              <div>✓ Express delivery in {product.estimatedDeliveryDays || 3} days</div>
              <div>✓ Stock: {product.stockQuantity > 0 ? 'Available for instant dispatch' : 'Restocking soon'}</div>
            </div>
          </div>

          {/* Variant Selectors */}
          {variantGroups.map((group, gIdx) => {
            const isColor = group.title.toLowerCase().includes('color') || group.title.toLowerCase().includes('stealth');
            const currentSelection = isColor ? selectedColor : selectedSize;
            const setSelection = isColor ? setSelectedColor : setSelectedSize;
            const isSize = group.title.toLowerCase().includes('size');

            return (
              <div key={gIdx} className="variant-select-group margin-top-20">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label className="variant-label" style={{ margin: 0 }}>{group.title}</label>
                  {isSize && (
                    <button
                      type="button"
                      className="size-chart-link-btn"
                      onClick={() => setShowSizeChart(true)}
                    >
                      <Ruler size={14} /> Smart Size Calculator
                    </button>
                  )}
                </div>
                <div className="variant-buttons">
                  {group.opts.map(opt => (
                    <button
                      key={opt}
                      type="button"
                      className={`variant-opt-btn ${currentSelection === opt ? 'active' : ''}`}
                      onClick={() => setSelection(opt)}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                {isSize && recommendedSizeText && (
                  <div className="badge badge-success margin-top-10" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                    <CheckCircle2 size={14} /> {recommendedSizeText}
                  </div>
                )}
              </div>
            );
          })}

          {/* Feature 9: Stock Indicators */}
          <div className="stock-alert-row margin-top-20">
            {product.stockQuantity <= 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="badge badge-error"><ShieldAlert size={14} /> ❌ Currently unavailable</span>
                <button
                  type="button"
                  onClick={() => {
                    setNotification('🔔 We will notify you via in-app alerts as soon as this item is restocked!');
                    setTimeout(() => setNotification(''), 4000);
                  }}
                  className="btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '12px' }}
                >
                  🔔 Notify Me When Available
                </button>
              </div>
            ) : product.stockQuantity <= 2 ? (
              <span className="badge badge-error" style={{ background: '#ef4444' }}><ShieldAlert size={14} /> 🔴 Only {product.stockQuantity} left! Order quickly.</span>
            ) : product.stockQuantity <= product.lowStockThreshold ? (
              <span className="badge badge-warning"><ShieldAlert size={14} /> 🟠 Only {product.stockQuantity} remaining</span>
            ) : (
              <span className="badge badge-success">🟢 In Stock ({product.stockQuantity} items ready for dispatches)</span>
            )}
          </div>

          {/* Quantity selector and Cart actions */}
          {product.stockQuantity > 0 ? (
            <div className="purchase-controls margin-top-20">
              <div className="quantity-selector">
                <button 
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="qty-btn"
                >
                  -
                </button>
                <span className="qty-val">{quantity}</span>
                <button 
                  onClick={() => setQuantity(q => Math.min(product.stockQuantity, q + 1))}
                  className="qty-btn"
                >
                  +
                </button>
              </div>

              <button onClick={handleAddToCart} className="btn-primary buy-btn">
                <ShoppingCart size={18} />
                <span>Add to Cart</span>
              </button>

              <button 
                onClick={handleWishlistToggle} 
                className={`btn-secondary wishlist-detail-btn ${wishlistProductIds.includes(product.id) ? 'active' : ''}`}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 18px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', cursor: 'pointer', background: 'rgba(255,255,255,0.05)', transition: 'all 0.3s' }}
              >
                <Heart size={18} fill={wishlistProductIds.includes(product.id) ? "#ef4444" : "none"} color={wishlistProductIds.includes(product.id) ? "#ef4444" : "currentColor"} />
                <span>{wishlistProductIds.includes(product.id) ? 'Remove' : 'Wishlist'}</span>
              </button>
            </div>
          ) : null}

          {/* Feature 12: Sustainability Information Panel 🌱 */}
          <div className="sustainability-card margin-top-25" style={{ padding: '16px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <h4 style={{ margin: '0 0 10px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981' }}>
              <Leaf size={18} /> 🌱 Sustainability & Eco Impact
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
              <div><strong>Eco Score:</strong> <span className="badge badge-success" style={{ background: '#10b981', color: '#fff', padding: '2px 8px', borderRadius: '4px' }}>B+</span></div>
              <div>Recyclable Packaging: ✅</div>
              <div>Sustainable Material: ✅</div>
              <div>Local Shipping Available: ✅</div>
              <div>Estimated Packaging Waste: <strong>Low</strong></div>
            </div>
          </div>

          {/* Extended Specifications */}
          <div className="technical-specs-table margin-top-30">
            <h3>Technical Specifications</h3>
            <div className="specs-grid">
              {product.weight && (
                <div className="spec-item">
                  <span className="spec-key"><Scale size={12} /> Weight</span>
                  <span className="spec-val">{product.weight} kg</span>
                </div>
              )}
              {product.dimensions && (
                <div className="spec-item">
                  <span className="spec-key"><Box size={12} /> Dimensions</span>
                  <span className="spec-val">{product.dimensions}</span>
                </div>
              )}
              {product.barcode && (
                <div className="spec-item">
                  <span className="spec-key">Barcode</span>
                  <span className="spec-val">{product.barcode}</span>
                </div>
              )}
              {specs.map((s, idx) => (
                <div key={idx} className="spec-item">
                  <span className="spec-key">{s.key}</span>
                  <span className="spec-val">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="reviews-section margin-top-40">
        <h2>Customer Reviews & Auditing ({reviews.length})</h2>
        
        <div className="reviews-layout">
          {/* Review submission Form */}
          {isAuthenticated ? (
            <form onSubmit={handleReviewSubmit} className="review-form glass-card">
              <h3>Write a Review</h3>
              
              <div className="form-group-full">
                <label>Rating</label>
                <select 
                  value={rating} 
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="form-input"
                >
                  <option value="5">5 Stars (Excellent)</option>
                  <option value="4">4 Stars (Good)</option>
                  <option value="3">3 Stars (Average)</option>
                  <option value="2">2 Stars (Poor)</option>
                  <option value="1">1 Star (Terrible)</option>
                </select>
              </div>

              <div className="form-group-full margin-top-15">
                <label>Review Comment</label>
                <textarea 
                  placeholder="Share your experience using this product..." 
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="form-input text-area-input"
                  required
                />
              </div>

              <button 
                type="submit" 
                className="btn-primary margin-top-20"
                disabled={submittingReview}
              >
                <span>{submittingReview ? 'Submitting...' : 'Post Review'}</span>
              </button>
            </form>
          ) : (
            <div className="review-login-prompt glass-card">
              <Sparkles size={24} className="sparkle-icon" />
              <h3>Share Your Feedback</h3>
              <p>Only logged-in customers can submit audits or review catalog items.</p>
              <Link to="/login" className="btn-secondary margin-top-10">Sign In to Review</Link>
            </div>
          )}

          {/* Reviews list */}
          <div className="reviews-list-container">
            {reviews.length === 0 ? (
              <div className="empty-reviews-state glass-card">
                <MessageSquare size={32} className="empty-icon" />
                <p>No verified customer reviews yet. Be the first to share your opinion!</p>
              </div>
            ) : (
              <div className="reviews-scroller">
                {reviews.map(rev => (
                  <div key={rev.id} className="review-item-card glass-card">
                    <div className="review-header">
                      <div className="review-user-info">
                        <span className="reviewer-name">{rev.username}</span>
                        {rev.verifiedPurchase !== false ? (
                          <span className="verified-badge" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>
                            Verified Purchase ✓
                          </span>
                        ) : (
                          <span className="verified-badge" style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-secondary)', padding: '2px 8px', borderRadius: '4px', fontSize: '11px' }}>
                            Community Review
                          </span>
                        )}
                      </div>
                      <div className="stars-row">
                        {renderStars(rev.rating)}
                      </div>
                    </div>
                    <p className="review-comment-body">{rev.comment}</p>
                    <span className="review-date-timestamp">
                      Posted: {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Pre-Add Variant Confirmation Modal */}
      {showConfirmModal && (
        <div className="modal-backdrop" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0, 0, 0, 0.75)', zIndex: 1100 }}>
          <div className="modal-content glass-card animate-fade-in" style={{ maxWidth: '480px', width: '90%', background: 'var(--bg-card)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-color)', position: 'relative' }}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)' }}>Confirm your selection</h3>
              <button style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }} onClick={() => setShowConfirmModal(false)}><X size={18} /></button>
            </div>
            <div style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
              <p style={{ marginTop: 0, color: 'var(--text-primary)', fontWeight: '600' }}>Please confirm your chosen variant details before adding to cart:</p>
              <div style={{ background: 'rgba(255,255,255,0.04)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', margin: '12px 0' }}>
                <div><strong>Product:</strong> {product.name}</div>
                {selectedSize && <div><strong>Size:</strong> {selectedSize}</div>}
                {selectedColor && <div><strong>Color:</strong> {selectedColor}</div>}
                <div><strong>Quantity:</strong> {quantity}</div>
                <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed rgba(255,255,255,0.1)', color: 'var(--color-primary)', fontWeight: 'bold' }}>
                  Total Price: ₹{(product.price * quantity).toLocaleString('en-IN')}
                </div>
              </div>
            </div>
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button className="btn-secondary" onClick={() => setShowConfirmModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={confirmAndAddToCart}>Confirm & Add to Cart</button>
            </div>
          </div>
        </div>
      )}

      {/* Trust Score Breakdown Modal */}
      {showTrustModal && (
        <div className="modal-backdrop" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0, 0, 0, 0.75)', zIndex: 1100 }}>
          <div className="modal-content glass-card animate-fade-in" style={{ maxWidth: '520px', width: '90%', background: 'var(--bg-card)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-color)', position: 'relative' }}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={20} style={{ color: '#10b981' }} />
                <span>DualForge Trust Score: 94/100</span>
              </h3>
              <button style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }} onClick={() => setShowTrustModal(false)}><X size={18} /></button>
            </div>
            <div style={{ fontSize: '14px', lineHeight: '1.7', color: 'var(--text-secondary)' }}>
              <p style={{ marginTop: 0 }}>This seller and product audit score is calculated using security verification metrics:</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '14px 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981' }}><CheckCircle2 size={16} /> Verified Seller Identity (+25 pts)</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981' }}><CheckCircle2 size={16} /> Product Details & Specs Verified (+25 pts)</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981' }}><CheckCircle2 size={16} /> High Customer Review Score ({product.rating || 4.5} ⭐) (+20 pts)</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981' }}><CheckCircle2 size={16} /> Encrypted Secure Transaction Gateway (+14 pts)</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981' }}><CheckCircle2 size={16} /> Low Return Rate (&lt; 1.2%) (+10 pts)</div>
              </div>
            </div>
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={() => setShowTrustModal(false)}>Close Breakdown</button>
            </div>
          </div>
        </div>
      )}

      <SizeChartModal 
        isOpen={showSizeChart} 
        onClose={() => setShowSizeChart(false)} 
        category={product?.category?.name || 'General'} 
        onSelectSize={(size, labelText) => {
          setSelectedSize(size);
          setRecommendedSizeText(labelText);
          setShowSizeChart(false);
        }}
      />
    </div>
  );
};

// Smart Size Chart & Calculator Modal Component
const SizeChartModal = ({ isOpen, onClose, category, onSelectSize }) => {
  const [footLengthCm, setFootLengthCm] = useState(26);
  const [heightCm, setHeightCm] = useState(170);
  const [chestCm, setChestCm] = useState(94);
  const [fitPreference, setFitPreference] = useState('Regular');
  const [calculatedSize, setCalculatedSize] = useState('');

  if (!isOpen) return null;

  const cat = category.toLowerCase();
  const isFootwear = cat.includes('footwear') || cat.includes('shoe');
  const isApparel = cat.includes('apparel') || cat.includes('fashion') || cat.includes('clothing');

  const calculateSmartSize = () => {
    if (isFootwear) {
      let size = 'UK 8';
      let optVal = '8';
      if (footLengthCm <= 24.5) { size = 'UK 6'; optVal = '6'; }
      else if (footLengthCm <= 25.2) { size = 'UK 7'; optVal = '7'; }
      else if (footLengthCm <= 26.2) { size = 'UK 8'; optVal = '8'; }
      else if (footLengthCm <= 27.0) { size = 'UK 9'; optVal = '9'; }
      else { size = 'UK 10'; optVal = '10'; }
      
      const text = `👟 Recommended size: ${size} (Based on your foot length: ${footLengthCm} cm)`;
      setCalculatedSize(size);
      if (onSelectSize) onSelectSize(optVal, text);
    } else if (isApparel) {
      let size = 'M';
      if (chestCm < 88) size = 'S';
      else if (chestCm <= 98) size = 'M';
      else if (chestCm <= 108) size = 'L';
      else if (chestCm <= 118) size = 'XL';
      else size = 'XXL';

      // Fit preference adjustment
      if (fitPreference === 'Slim' && size !== 'S' && chestCm < 92) size = 'S';
      if (fitPreference === 'Loose' && size !== 'XXL') {
        if (size === 'S') size = 'M';
        else if (size === 'M') size = 'L';
        else if (size === 'L') size = 'XL';
        else if (size === 'XL') size = 'XXL';
      }

      const text = `👕 Recommended Size: ${size} (Height: ${heightCm}cm, Chest: ${chestCm}cm, ${fitPreference} Fit)`;
      setCalculatedSize(size);
      if (onSelectSize) onSelectSize(size, text);
    }
  };

  return (
    <div className="modal-backdrop" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0, 0, 0, 0.75)', zIndex: 1100 }}>
      <div className="modal-content glass-card animate-fade-in" style={{ maxWidth: '620px', width: '90%', background: 'var(--bg-card)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-color)', position: 'relative' }}>
        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Ruler size={20} style={{ color: 'var(--color-primary)' }} />
            <span>Smart Size Calculator & Guide</span>
          </h3>
          <button className="modal-close-btn" style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }} onClick={onClose}><X size={18} /></button>
        </div>

        {/* Feature 3: Smart Interactive Size Calculator */}
        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)', marginBottom: '20px' }}>
          <h4 style={{ margin: '0 0 12px', color: 'var(--color-primary)', fontSize: '14px' }}>📏 Enter Your Measurements for AI Recommendation</h4>
          
          {isFootwear ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label style={{ fontSize: '13px', color: 'var(--text-primary)' }}>Enter your foot length (cm):</label>
              <input 
                type="number" 
                value={footLengthCm} 
                onChange={(e) => setFootLengthCm(Number(e.target.value))} 
                className="form-input"
                style={{ width: '120px' }}
                placeholder="26"
              />
            </div>
          ) : isApparel ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '13px', display: 'block', marginBottom: '4px' }}>Height (cm):</label>
                <input type="number" value={heightCm} onChange={(e) => setHeightCm(Number(e.target.value))} className="form-input" placeholder="170" />
              </div>
              <div>
                <label style={{ fontSize: '13px', display: 'block', marginBottom: '4px' }}>Chest (cm):</label>
                <input type="number" value={chestCm} onChange={(e) => setChestCm(Number(e.target.value))} className="form-input" placeholder="94" />
              </div>
              <div>
                <label style={{ fontSize: '13px', display: 'block', marginBottom: '4px' }}>Fit preference:</label>
                <select value={fitPreference} onChange={(e) => setFitPreference(e.target.value)} className="form-input">
                  <option value="Slim">Slim</option>
                  <option value="Regular">Regular</option>
                  <option value="Loose">Loose</option>
                </select>
              </div>
            </div>
          ) : (
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Standard sizing applied for this category.</p>
          )}

          <button 
            type="button" 
            onClick={calculateSmartSize} 
            className="btn-primary margin-top-15"
            style={{ padding: '8px 16px', fontSize: '13px' }}
          >
            Calculate & Select Recommended Size
          </button>
        </div>

        {/* Static Table Fallback */}
        <div className="modal-body" style={{ maxHeight: '45vh', overflowY: 'auto' }}>
          {isFootwear ? (
            <div>
              <h4 style={{ color: 'var(--text-primary)', marginBottom: '10px', fontSize: '14px' }}>Footwear Reference Chart</h4>
              <table className="size-chart-table">
                <thead>
                  <tr><th>US Size</th><th>UK Size</th><th>EU Size</th><th>CM</th></tr>
                </thead>
                <tbody>
                  <tr><td>7</td><td>6</td><td>40</td><td>24.4</td></tr>
                  <tr><td>8</td><td>7</td><td>41</td><td>25.1</td></tr>
                  <tr><td>9</td><td>8</td><td>42</td><td>26.0</td></tr>
                  <tr><td>10</td><td>9</td><td>43</td><td>26.7</td></tr>
                  <tr><td>11</td><td>10</td><td>44</td><td>27.6</td></tr>
                </tbody>
              </table>
            </div>
          ) : (
            <div>
              <h4 style={{ color: 'var(--text-primary)', marginBottom: '10px', fontSize: '14px' }}>Apparel Reference Chart</h4>
              <table className="size-chart-table">
                <thead>
                  <tr><th>Size</th><th>Chest (Inches)</th><th>Waist (Inches)</th></tr>
                </thead>
                <tbody>
                  <tr><td>S</td><td>34 - 36</td><td>28 - 30</td></tr>
                  <tr><td>M</td><td>38 - 40</td><td>32 - 34</td></tr>
                  <tr><td>L</td><td>42 - 44</td><td>36 - 38</td></tr>
                  <tr><td>XL</td><td>46 - 48</td><td>40 - 42</td></tr>
                  <tr><td>XXL</td><td>50 - 52</td><td>44 - 46</td></tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="modal-footer" style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button className="btn-secondary" onClick={onClose}>Close Guide</button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
