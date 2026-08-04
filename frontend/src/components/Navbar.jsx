import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { ShoppingCart, LogOut, User, Search, LayoutDashboard, Store, Sun, Moon, Key, X, Heart } from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout, getAuthHeaders } = useAuth();
  const { getCartCount } = useCart();
  const { getWishlistCount } = useWishlist();
  const navigate = useNavigate();
  const [searchVal, setSearchVal] = useState('');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(searchVal.trim())}`);
    }
  };

  return (
    <nav className="navbar glass-card">
      <div className="container nav-container">
        <Link to="/" className="logo">
          <Store className="logo-icon" />
          <span>DUAL<span>FORGE</span></span>
        </Link>

        <form onSubmit={handleSearchSubmit} className="search-bar">
          <input 
            type="text" 
            placeholder="Search premium products..." 
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
          />
          <button type="submit">
            <Search size={18} />
          </button>
        </form>

        <div className="nav-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/catalog" className="nav-link">Shop</Link>
          <button 
            type="button" 
            onClick={() => {
              const evt = new CustomEvent('open-budget-shop');
              window.dispatchEvent(evt);
            }} 
            className="nav-link"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)', fontWeight: '600' }}
          >
            💰 Budget Shop
          </button>
          {isAuthenticated && (
            <Link to="/orders" className="nav-link">My Orders</Link>
          )}
        </div>

        <div className="nav-actions">
          {isAdmin && (
            <Link to="/admin" className="btn-admin-dash" title="Admin Dashboard">
              <LayoutDashboard size={18} />
              <span>Admin</span>
            </Link>
          )}

          {user?.role === 'ROLE_SELLER' && (
            <Link to="/seller" className="btn-admin-dash" title="Seller Dashboard" style={{ background: 'var(--grad-cyan-blue)' }}>
              <LayoutDashboard size={18} />
              <span>Seller</span>
            </Link>
          )}

          <Link to="/wishlist" className="cart-btn" title="View Wishlist">
            <Heart size={20} />
            {getWishlistCount() > 0 && (
              <span className="cart-count-badge" style={{ background: '#ef4444' }}>{getWishlistCount()}</span>
            )}
          </Link>

          <Link to="/cart" className="cart-btn" title="View Cart">
            <ShoppingCart size={20} />
            {getCartCount() > 0 && (
              <span className="cart-count-badge">{getCartCount()}</span>
            )}
          </Link>

          <button onClick={toggleTheme} className="cart-btn" title="Toggle Light/Dark Theme">
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          {isAuthenticated ? (
            <div className="user-profile">
              <div className="user-avatar">
                <User size={16} />
              </div>
              <div className="user-info-dropdown">
                <span className="username-display">Hi, {user.firstName || user.username}</span>
                <span className="user-role-badge badge badge-primary">
                  {user.role === 'ROLE_ADMIN' ? 'Admin' : (user.role === 'ROLE_SELLER' ? 'Seller' : 'Customer')}
                </span>
                <button onClick={() => setShowChangePasswordModal(true)} className="logout-btn" style={{ marginBottom: '8px' }}>
                  <Key size={14} />
                  <span>Change Password</span>
                </button>
                <button onClick={logout} className="logout-btn">
                  <LogOut size={14} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          ) : (
            <Link to="/login" className="btn-primary login-btn">
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </div>
      <ChangePasswordModal 
        isOpen={showChangePasswordModal} 
        onClose={() => setShowChangePasswordModal(false)} 
        getAuthHeaders={getAuthHeaders} 
      />
    </nav>
  );
};

// Change Password Modal Component
const ChangePasswordModal = ({ isOpen, onClose, getAuthHeaders }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;

    setLoading(true);
    setMsg('');
    setError(false);

    try {
      const res = await fetch('http://localhost:8080/api/users/change-password', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await res.json();
      if (res.ok) {
        setMsg("Password updated successfully!");
        setCurrentPassword('');
        setNewPassword('');
        setTimeout(() => {
          onClose();
          setMsg('');
        }, 1500);
      } else {
        setError(true);
        setMsg(data.message || "Failed to update password.");
      }
    } catch (err) {
      setError(true);
      setMsg("Connection error to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content glass-card animate-fade-in text-left">
        <div className="modal-header">
          <h3>Change Security Password</h3>
          <button className="modal-close-btn" onClick={onClose}><X size={18} /></button>
        </div>
        
        {msg && (
          <div className={`auth-alert badge ${error ? 'badge-error' : 'badge-success'} margin-bottom-15`}>
            {msg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group-full">
            <label>Current Password</label>
            <input 
              type="password" 
              placeholder="Enter current password" 
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="form-input"
              required
            />
          </div>
          <div className="form-group-full margin-top-15">
            <label>New Password</label>
            <input 
              type="password" 
              placeholder="At least 6 characters" 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="form-input"
              required
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary auth-submit-btn margin-top-25">
            <span>{loading ? 'Updating Password...' : 'Save Password'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Navbar;
