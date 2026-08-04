import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ShoppingBag, ArrowLeft } from 'lucide-react';

const ProtectedRoute = ({ children, adminOnly = false, sellerOnly = false }) => {
  const { isAuthenticated, isAdmin, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="loader-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && !isAdmin) {
    return (
      <div className="container padding-40 animate-fade-in flex-center" style={{ minHeight: '60vh' }}>
        <div className="glass-card text-center" style={{ maxWidth: '520px', padding: '40px' }}>
          <ShieldAlert size={64} style={{ color: 'var(--color-error)', margin: '0 auto 15px' }} />
          <h2>Access Restricted</h2>
          <p className="margin-top-10" style={{ color: 'var(--text-secondary)' }}>
            The Admin Control Panel is strictly reserved for Super Admin authorization. Your current account does not possess administrator privileges.
          </p>
          <div className="margin-top-25 flex-center gap-10">
            <Link to="/" className="btn-primary">
              <ArrowLeft size={16} />
              <span>Return to Homepage</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (sellerOnly && user?.role !== 'ROLE_SELLER') {
    return (
      <div className="container padding-40 animate-fade-in flex-center" style={{ minHeight: '60vh' }}>
        <div className="glass-card text-center" style={{ maxWidth: '520px', padding: '40px' }}>
          <ShoppingBag size={64} style={{ color: 'var(--color-primary)', margin: '0 auto 15px' }} />
          <h2>Seller Account Required</h2>
          <p className="margin-top-10" style={{ color: 'var(--text-secondary)' }}>
            The Seller Dashboard is accessible only to registered and verified seller accounts. If you wish to list and sell products on DualForge, please sign up as a seller.
          </p>
          <div className="margin-top-25 flex-center gap-10">
            <Link to="/login" className="btn-primary">
              <span>Register as Seller</span>
            </Link>
            <Link to="/" className="btn-secondary">
              <span>Return to Homepage</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
