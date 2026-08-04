import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { Cpu, Shirt, Footprints, Shield, ArrowRight, Star, Flame, ChevronLeft, ChevronRight, Clock, Percent, Heart } from 'lucide-react';
import { API_PRODUCTS_URL } from '../apiConfig';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [timeLeft, setTimeLeft] = useState(14400); // 4 Hours countdown timer
  const [notification, setNotification] = useState('');
  const navigate = useNavigate();
  const { toggleWishlist, wishlistProductIds } = useWishlist();

  const handleWishlistToggle = async (product, e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const action = await toggleWishlist(product);
      setNotification(action === 'added' ? 'Added to Wishlist ❤️' : 'Removed from Wishlist');
      setTimeout(() => setNotification(''), 3000);
    } catch (err) {
      setNotification(err.message || 'Unable to update wishlist. Retry');
      setTimeout(() => setNotification(''), 4000);
    }
  };

  // Carousel Slides Content
  const slides = [
    {
      badge: "EXCLUSIVE LAUNCH",
      title: "FORGEBOOK PRO 16",
      desc: "Architectural-grade workhorse. Liquid metal cooling & 32GB RAM.",
      actionText: "Buy Now",
      bgClass: "carousel-slide-1",
      link: "/product/1",
      image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500"
    },
    {
      badge: "FASHION EXTRAVAGANZA",
      title: "TECH HOODIE SENSATION",
      desc: "Wind-resistant fleece blends with hidden pocket slots. 25% off.",
      actionText: "Shop Collection",
      bgClass: "carousel-slide-2",
      link: "/catalog?category=Fashion",
      image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500"
    },
    {
      badge: "LIMITED OFFERS",
      title: "STEALTH RUNNERS ELITE",
      desc: "Hydrophobic weave structure designed for peak marathons.",
      actionText: "Claim Offer",
      bgClass: "carousel-slide-3",
      link: "/product/3",
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500"
    }
  ];

  // Auto-play Carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  // Flash Sale Countdown Timer logic
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 14400));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}h : ${mins.toString().padStart(2, '0')}m : ${secs.toString().padStart(2, '0')}s`;
  };

  useEffect(() => {
    const fetchFeatured = async () => {
      let loaded = [];
      try {
        const res = await fetch(API_PRODUCTS_URL);
        if (res.ok) {
          loaded = await res.json();
        }
      } catch (err) {
        console.error('Error fetching products:', err);
      }

      if (loaded.length < 10) {
        const fallback = get50PlusCatalogProducts();
        const existingIds = new Set(loaded.map(p => p.id));
        const extra = fallback.filter(p => !existingIds.has(p.id));
        loaded = [...loaded, ...extra];
      }

      setFeaturedProducts(loaded);
      setLoading(false);
    };
    fetchFeatured();
  }, []);

  const nextSlide = () => setCurrentSlide((currentSlide + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((currentSlide - 1 + slides.length) % slides.length);

  return (
    <div className="home-page animate-fade-in">
      {notification && (
        <div className="toast-notification badge badge-primary animate-fade-in" style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 1000 }}>
          {notification}
        </div>
      )}
      
      {/* 1. Quick Category strip */}
      <div className="quick-category-strip glass-card">
        <Link to="/catalog?category=Electronics" className="strip-item">
          <div className="strip-icon-circle electronics-theme">
            <Cpu size={20} />
          </div>
          <span>Electronics</span>
        </Link>
        <Link to="/catalog?category=Fashion" className="strip-item">
          <div className="strip-icon-circle apparel-theme">
            <Shirt size={20} />
          </div>
          <span>Fashion</span>
        </Link>
        <Link to="/catalog?category=Footwear" className="strip-item">
          <div className="strip-icon-circle footwear-theme">
            <Footprints size={20} />
          </div>
          <span>Footwear</span>
        </Link>
        <Link to="/catalog" className="strip-item">
          <div className="strip-icon-circle accessories-theme">
            <Percent size={20} />
          </div>
          <span>Deals & Offers</span>
        </Link>
      </div>

      {/* 2. Carousel Banner */}
      <section className="carousel-section glass-card">
        <div className="carousel-container">
          <button className="carousel-arrow left" onClick={prevSlide}>
            <ChevronLeft size={24} />
          </button>
          
          <div className={`carousel-slide ${slides[currentSlide].bgClass}`}>
            <div className="slide-content">
              <span className="slide-badge">{slides[currentSlide].badge}</span>
              <h2>{slides[currentSlide].title}</h2>
              <p>{slides[currentSlide].desc}</p>
              <Link to={slides[currentSlide].link} className="btn-primary">
                <span>{slides[currentSlide].actionText}</span>
                <ArrowRight size={18} />
              </Link>
            </div>
            <div className="slide-image-wrapper">
              <img src={slides[currentSlide].image} alt={slides[currentSlide].title} />
            </div>
          </div>

          <button className="carousel-arrow right" onClick={nextSlide}>
            <ChevronRight size={24} />
          </button>
        </div>
        
        {/* Indicators */}
        <div className="carousel-indicators">
          {slides.map((_, idx) => (
            <span 
              key={idx} 
              className={`indicator-dot ${currentSlide === idx ? 'active' : ''}`}
              onClick={() => setCurrentSlide(idx)}
            ></span>
          ))}
        </div>
      </section>

      {/* 3. Flash Sale Deals Strip */}
      <section className="flash-sale-section glass-card">
        <div className="flash-sale-header">
          <div className="flash-title">
            <Flame className="flame-icon animate-pulse" size={24} />
            <h2>Deals of the Day</h2>
          </div>
          <div className="flash-timer">
            <Clock size={16} />
            <span>Ends in:</span>
            <span className="timer-countdown">{formatTime(timeLeft)}</span>
          </div>
        </div>

        {loading ? (
          <div className="loader-container">
            <div className="spinner"></div>
          </div>
        ) : (
          <div className="deals-grid">
            {featuredProducts.slice(0, 4).map(product => {
              if (!product) return null;
              // Calculate realistic mock original price
              const priceVal = product.price || 0;
              const discountPercent = product.discountPercent || (product.id === 1 ? 15 : (product.id === 3 ? 20 : 10));
              const originalPrice = Math.round(discountPercent > 0 ? priceVal / (1 - (discountPercent / 100)) : priceVal);

              return (
                <div key={product.id} className="deal-card" onClick={() => navigate(`/product/${product.id}`)}>
                  <div className="deal-img-box">
                    <img src={product.imageUrl} alt={product.name} />
                    <button 
                      onClick={(e) => handleWishlistToggle(product, e)}
                      className={`wishlist-heart-btn ${wishlistProductIds.includes(product.id) ? 'active' : ''}`}
                      title={wishlistProductIds.includes(product.id) ? "Remove from Wishlist" : "Add to Wishlist"}
                    >
                      <Heart size={14} fill={wishlistProductIds.includes(product.id) ? "#ef4444" : "none"} color={wishlistProductIds.includes(product.id) ? "#ef4444" : "#9ca3af"} />
                    </button>
                    <span className="savings-badge">-{discountPercent}%</span>
                  </div>
                  <div className="deal-info">
                    <h3>{product.name}</h3>
                    <div className="ratings-strip">
                      <div className="stars-wrapper">
                        <Star className="star-filled" size={14} />
                        <Star className="star-filled" size={14} />
                        <Star className="star-filled" size={14} />
                        <Star className="star-filled" size={14} />
                        <Star className="star-filled-half" size={14} />
                      </div>
                      <span className="ratings-count">({product.id * 14 + 18})</span>
                    </div>
                    <div className="prices-row">
                      <span className="current-price">₹{product.price.toLocaleString('en-IN')}</span>
                      <span className="original-price">₹{originalPrice.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. Brand Trust Badges */}
      <section className="trust-badges-section">
        <div className="badge-item glass-card">
          <Shield size={24} className="trust-icon" />
          <div>
            <h4>100% Secure Checkout</h4>
            <p>Razorpay & Stripe integration</p>
          </div>
        </div>
        <div className="badge-item glass-card">
          <Clock size={24} className="trust-icon" />
          <div>
            <h4>Fast Delivery</h4>
            <p>Secured packaging & shipping</p>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
