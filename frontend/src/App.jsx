import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { CompareProvider, useCompare } from './context/CompareContext';
import ProductComparisonModal from './components/ProductComparisonModal';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import ChatbotWidget from './components/ChatbotWidget';
import { Layers, Sparkles, X } from 'lucide-react';

// Pages
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import LoginRegister from './pages/LoginRegister';
import AdminDashboard from './pages/AdminDashboard';
import SellerDashboard from './pages/SellerDashboard';
import Wishlist from './pages/Wishlist';

const ComparisonFloatingBar = () => {
  const { compareItems, clearCompare, setIsModalOpen } = useCompare();

  if (compareItems.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '25px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1050,
        background: 'var(--bg-card)',
        border: '1px solid var(--color-primary)',
        borderRadius: '30px',
        padding: '10px 22px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        backdropFilter: 'blur(16px)',
      }}
      className="animate-fade-in"
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '600' }}>
        <Layers size={18} style={{ color: 'var(--color-primary)' }} />
        <span>Comparing <strong>{compareItems.length}</strong> product{compareItems.length > 1 ? 's' : ''}</span>
      </div>

      <button
        onClick={() => setIsModalOpen(true)}
        className="btn-primary"
        style={{ padding: '6px 14px', fontSize: '13px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '6px' }}
      >
        <Sparkles size={14} /> View Matrix
      </button>

      <button
        onClick={clearCompare}
        style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}
        title="Clear comparison selection"
      >
        <X size={16} />
      </button>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <CompareProvider>
              <div className="app-wrapper">
                <Navbar />
                <main className="main-content-layout">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/catalog" element={<Catalog />} />
                    <Route path="/product/:id" element={<ProductDetails />} />
                    <Route path="/cart" element={<Cart />} />
                    
                    {/* Protected Customer Routes */}
                    <Route 
                      path="/checkout" 
                      element={
                        <ProtectedRoute>
                          <Checkout />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/orders" 
                      element={
                        <ProtectedRoute>
                          <Orders />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/wishlist" 
                      element={
                        <ProtectedRoute>
                          <Wishlist />
                        </ProtectedRoute>
                      } 
                    />

                    {/* Authentication Page */}
                    <Route path="/login" element={<LoginRegister />} />

                    {/* Protected Admin Routes */}
                    <Route 
                      path="/admin" 
                      element={
                        <ProtectedRoute adminOnly={true}>
                          <AdminDashboard />
                        </ProtectedRoute>
                      } 
                    />

                    {/* Protected Seller Routes */}
                    <Route 
                      path="/seller" 
                      element={
                        <ProtectedRoute sellerOnly={true}>
                          <SellerDashboard />
                        </ProtectedRoute>
                      } 
                    />
                  </Routes>
                </main>
                <Footer />
                <ChatbotWidget />
                <ProductComparisonModal />
                <ComparisonFloatingBar />
              </div>
            </CompareProvider>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
