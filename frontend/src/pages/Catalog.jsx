import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useCompare } from '../context/CompareContext';
import ShopByBudgetModal from '../components/ShopByBudgetModal';
import { API_CATEGORIES_URL, API_PRODUCTS_URL } from '../apiConfig';
import { get50PlusCatalogProducts } from '../utils/catalogData';
import { Heart, ShoppingCart, Truck, Award, Sparkles, Layers, ShieldCheck } from 'lucide-react';

const Catalog = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useCart();
  const { toggleWishlist, wishlistProductIds } = useWishlist();
  const { toggleCompare, isInCompare, setIsModalOpen: openCompareModal } = useCompare();

  const handleWishlistToggle = async (product) => {
    try {
      const action = await toggleWishlist(product);
      setNotification(action === 'added' ? 'Added to Wishlist ❤️' : 'Removed from Wishlist');
      setTimeout(() => setNotification(''), 3000);
    } catch (err) {
      setNotification(err.message || 'Unable to update wishlist. Retry');
      setTimeout(() => setNotification(''), 4000);
    }
  };

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [minRating, setMinRating] = useState(0);
  const [maxPrice, setMaxPrice] = useState(200000);
  const [sortBy, setSortBy] = useState('featured');
  const [notification, setNotification] = useState('');
  const [showBudgetModal, setShowBudgetModal] = useState(false);

  // Extract unique brands dynamically
  const brands = ['All', ...new Set(products.map(p => p.brand).filter(Boolean))];

  useEffect(() => {
    const searchParam = searchParams.get('search');
    const categoryParam = searchParams.get('category');
    setSearchTerm(searchParam || '');
    setSelectedCategory(categoryParam || 'All');
  }, [searchParams]);

  useEffect(() => {
    const loadCatalogData = async () => {
      setLoading(true);
      let loadedProds = [];
      try {
        const catRes = await fetch(API_CATEGORIES_URL);
        if (catRes.ok) {
          const catData = await catRes.json();
          setCategories(catData);
        }

        const prodRes = await fetch(API_PRODUCTS_URL);
        if (prodRes.ok) {
          loadedProds = await prodRes.json();
        }
      } catch (err) {
        console.error('Error loading catalog from API:', err);
      }

      // Always guarantee full 52+ catalog dataset
      const full50Dataset = get50PlusCatalogProducts();
      if (loadedProds.length < 20) {
        const existingIds = new Set(loadedProds.map(p => p.id));
        const extra = full50Dataset.filter(p => !existingIds.has(p.id));
        loadedProds = [...loadedProds, ...extra];
      }

      setProducts(loadedProds);
      setLoading(false);
    };
    loadCatalogData();

    const handleOpenBudget = () => setShowBudgetModal(true);
    window.addEventListener('open-budget-shop', handleOpenBudget);
    return () => window.removeEventListener('open-budget-shop', handleOpenBudget);
  }, []);

  const handleAddToCart = async (product) => {
    if (product.variants) {
      navigate(`/product/${product.id}`);
      return;
    }
    try {
      await addToCart(product.id, 1);
      setNotification(`Added "${product.name}" to cart!`);
      setTimeout(() => setNotification(''), 3000);
    } catch (err) {
      setNotification(err.message || 'Please log in to manage your cart.');
      setTimeout(() => setNotification(''), 4000);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setSelectedBrand('All');
    setMinRating(0);
    setMaxPrice(200000);
    setSortBy('featured');
    setSearchParams({});
  };

  // Filter and Sort Logic
  const filteredProducts = products.filter(product => {
    if (!product) return false;
    const nameStr = product.name || '';
    const descStr = product.description || '';
    const tagStr = product.tags || '';

    const searchLower = (searchTerm || '').trim().toLowerCase();
    const matchesSearch = !searchLower || 
                          nameStr.toLowerCase().includes(searchLower) || 
                          descStr.toLowerCase().includes(searchLower) ||
                          tagStr.toLowerCase().includes(searchLower);
    
    const catName = (product.category?.name || (typeof product.category === 'string' ? product.category : '')).toLowerCase();
    const catId = String(product.category?.id || '');
    const categoryLower = (selectedCategory || 'All').trim().toLowerCase();
    const matchesCategory = categoryLower === 'all' || !categoryLower ||
                            catName === categoryLower ||
                            catId === categoryLower ||
                            catName.includes(categoryLower) ||
                            categoryLower.includes(catName);

    const brandLower = (selectedBrand || 'All').trim().toLowerCase();
    const matchesBrand = brandLower === 'all' || !brandLower || 
                         (product.brand || '').toLowerCase() === brandLower;
    
    const matchesRating = (product.rating || 0) >= minRating;
    const matchesPrice = (product.price || 0) <= maxPrice;

    return matchesSearch && matchesCategory && matchesBrand && matchesRating && matchesPrice;
  }).sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
    return 0; // featured
  });

  // Helper to render rating stars
  const renderStars = (ratingValue) => {
    const stars = [];
    const fullStars = Math.floor(ratingValue);
    const hasHalfStar = ratingValue % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<Star key={i} size={14} className="star-icon fill-amber" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<Star key={i} size={14} className="star-icon half-star" />);
      } else {
        stars.push(<Star key={i} size={14} className="star-icon text-muted" />);
      }
    }
    return stars;
  };

  return (
    <div className="catalog-page container animate-fade-in">
      {notification && (
        <div className="toast-notification badge badge-primary animate-fade-in">
          {notification}
        </div>
      )}

      <div className="catalog-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h1>Flagship Catalog</h1>
          <p>Curated collections built with premium hardware, verified warranties, and fast delivery guarantees.</p>
        </div>
        <button
          onClick={() => setShowBudgetModal(true)}
          className="btn-primary"
          style={{ background: 'var(--grad-indigo-purple)', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', fontSize: '14px' }}
        >
          <Sparkles size={16} /> 💰 Shop by Budget
        </button>
      </div>

      <div className="catalog-layout">
        {/* Filters Sidebar */}
        <aside className="filters-sidebar glass-card">
          <div className="sidebar-header">
            <h3><SlidersHorizontal size={18} /> Filters</h3>
            <button onClick={clearFilters} className="clear-filters-btn">Reset</button>
          </div>

          <div className="filter-group">
            <label>Search Keyword</label>
            <div className="filter-search-input">
              <input 
                type="text" 
                placeholder="Type brand, tag, name..." 
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setSearchParams(prev => {
                    if (e.target.value) prev.set('search', e.target.value);
                    else prev.delete('search');
                    return prev;
                  });
                }}
              />
              <Search size={16} className="search-icon-inside" />
            </div>
          </div>

          <div className="filter-group">
            <label>Categories</label>
            <div className="category-options-list">
              <button 
                className={`category-opt-btn ${selectedCategory === 'All' ? 'active' : ''}`}
                onClick={() => {
                  setSelectedCategory('All');
                  setSearchParams(prev => {
                    prev.delete('category');
                    return prev;
                  });
                }}
              >
                All Categories
              </button>
              {categories.map(cat => (
                <button 
                  key={cat.id}
                  className={`category-opt-btn ${selectedCategory === cat.name ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedCategory(cat.name);
                    setSearchParams(prev => {
                      prev.set('category', cat.name);
                      return prev;
                    });
                  }}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <label>Brands</label>
            <select 
              value={selectedBrand} 
              onChange={(e) => setSelectedBrand(e.target.value)} 
              className="sort-dropdown form-input"
            >
              {brands.map(b => (
                <option key={b} value={b}>{b === 'All' ? 'All Brands' : b}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <div className="price-range-label">
              <label>Max Price</label>
              <span>₹{maxPrice.toLocaleString('en-IN')}</span>
            </div>
            <input 
              type="range" 
              min="500" 
              max="200000" 
              step="500"
              value={maxPrice} 
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="price-slider"
            />
          </div>

          <div className="filter-group">
            <label>Minimum Rating</label>
            <div className="rating-filter-buttons">
              {[4, 3, 2, 0].map(stars => (
                <button 
                  key={stars}
                  className={`rating-opt-btn ${minRating === stars ? 'active' : ''}`}
                  onClick={() => setMinRating(stars)}
                >
                  {stars === 0 ? 'All Ratings' : `${stars} ★ & Up`}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <label>Sort By</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sort-dropdown form-input">
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Customer Reviews</option>
              <option value="name">Alphabetical</option>
            </select>
          </div>
        </aside>

        {/* Products Grid Area */}
        <main className="catalog-products-container">
          {loading ? (
            <div className="loader-container">
              <div className="spinner"></div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="no-products-view glass-card">
              <h3>No Products Found</h3>
              <p>Try refining your search keyword or clearing the filters.</p>
              <button onClick={clearFilters} className="btn-primary">Clear Filters</button>
            </div>
          ) : (
            <div className="product-grid">
              {filteredProducts.map(product => {
                const originalPrice = product.discountPercent > 0 
                  ? Math.round(product.price / (1 - product.discountPercent / 100))
                  : null;

                return (
                  <div key={product.id} className="product-card glass-card">
                    <div className="product-img-wrapper">
                      <img src={product.imageUrl} alt={product.name} />
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleWishlistToggle(product);
                        }}
                        className={`wishlist-heart-btn ${wishlistProductIds.includes(product.id) ? 'active' : ''}`}
                        title={wishlistProductIds.includes(product.id) ? "Remove from Wishlist" : "Add to Wishlist"}
                      >
                        <Heart size={16} fill={wishlistProductIds.includes(product.id) ? "#ef4444" : "none"} color={wishlistProductIds.includes(product.id) ? "#ef4444" : "#9ca3af"} />
                      </button>
                      <div className="product-badge-group">
                        <span className="product-category-tag badge badge-primary">{product?.category?.name || 'General'}</span>
                        {product.discountPercent > 0 && (
                          <span className="discount-tag badge badge-success">{product.discountPercent}% OFF</span>
                        )}
                      </div>
                    </div>
                    <div className="product-details-summary">
                      <div className="product-card-brand-row">
                        <span className="product-card-brand">{product.brand || 'Generic'}</span>
                        {product.stockQuantity <= product.lowStockThreshold && product.stockQuantity > 0 && (
                          <span className="stock-alert-pill">Only {product.stockQuantity} left</span>
                        )}
                      </div>
                      <h3>{product.name}</h3>
                      
                      {/* Rating stars row */}
                      <div className="product-card-rating">
                        <div className="stars-flex">
                          {renderStars(product.rating)}
                        </div>
                        <span className="rating-value">{product.rating}</span>
                        <span className="review-count">({product.reviewCount})</span>
                      </div>

                      <p className="product-desc-short">{product.description.slice(0, 100)}...</p>
                      
                      {/* Deliver guarantees icons */}
                      <div className="delivery-row">
                        <span className="delivery-stat">
                          <Truck size={12} />
                          <span>{product.shippingCharges === 0 ? 'Free Delivery' : `₹${product.shippingCharges.toLocaleString('en-IN')} Delivery`}</span>
                        </span>
                        <span className="delivery-stat">
                          <Award size={12} />
                          <span>{product.warranty || 'Verified'}</span>
                        </span>
                      </div>

                      <div className="product-card-footer">
                        <div className="price-block">
                          <span className="product-price">₹{product.price.toLocaleString('en-IN')}</span>
                          {originalPrice && (
                            <span className="original-price">₹{originalPrice.toLocaleString('en-IN')}</span>
                          )}
                        </div>
                        <div className="product-card-actions" style={{ display: 'flex', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => {
                              toggleCompare(product);
                              openCompareModal(true);
                            }}
                            className={`btn-secondary btn-icon-only ${isInCompare(product.id) ? 'active' : ''}`}
                            title="Compare Product"
                            style={{ padding: '6px 10px', fontSize: '12px' }}
                          >
                            <Layers size={14} />
                            <span>{isInCompare(product.id) ? 'Comparing' : 'Compare'}</span>
                          </button>
                          <Link to={`/product/${product.id}`} className="btn-secondary btn-icon-only" title="Details">
                            <span>Details</span>
                          </Link>
                          <button 
                            onClick={() => handleAddToCart(product)}
                            className="btn-primary btn-icon-only" 
                            title="Add to Cart"
                            disabled={product.stockQuantity <= 0}
                          >
                            <ShoppingCart size={16} />
                            <span>{product.stockQuantity <= 0 ? 'Out of Stock' : 'Add'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
      <ShopByBudgetModal isOpen={showBudgetModal} onClose={() => setShowBudgetModal(false)} />
    </div>
  );
};

export default Catalog;
