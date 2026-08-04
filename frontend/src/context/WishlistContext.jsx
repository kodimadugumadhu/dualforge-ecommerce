import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext';
import { API_WISHLIST_URL } from '../apiConfig';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { token, getAuthHeaders, isAuthenticated } = useAuth();
  const [wishlist, setWishlist] = useState({ products: [] });
  const [loading, setLoading] = useState(false);
  const [wishlistProductIds, setWishlistProductIds] = useState([]);
  const [togglingProductIds, setTogglingProductIds] = useState([]);

  const fetchWishlist = async () => {
    if (!isAuthenticated) {
      setWishlist({ products: [] });
      setWishlistProductIds([]);
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(API_WISHLIST_URL, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setWishlist(data);
        setWishlistProductIds(data.products.map(p => p.id));
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [token, isAuthenticated]);

  const toggleWishlist = async (product) => {
    if (!isAuthenticated) throw new Error('Please login to manage your wishlist.');
    const productId = product.id;
    if (togglingProductIds.includes(productId)) return; // Prevent duplicate concurrent updates

    setTogglingProductIds(prev => [...prev, productId]);
    const isAlreadyWishlisted = wishlistProductIds.includes(productId);

    // Optimistic UI Update
    const previousIds = [...wishlistProductIds];
    const previousProducts = [...wishlist.products];

    if (isAlreadyWishlisted) {
      setWishlistProductIds(prev => prev.filter(id => id !== productId));
      setWishlist(prev => ({
        ...prev,
        products: prev.products.filter(p => p.id !== productId)
      }));
    } else {
      setWishlistProductIds(prev => [...prev, productId]);
      setWishlist(prev => ({
        ...prev,
        products: [...prev.products, product]
      }));
    }

    try {
      const endpoint = isAlreadyWishlisted ? `remove/${productId}` : `add/${productId}`;
      const method = isAlreadyWishlisted ? 'DELETE' : 'POST';
      const response = await fetch(`${API_WISHLIST_URL}/${endpoint}`, {
        method,
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to update wishlist on backend');
      }

      const data = await response.json();
      setWishlist(data);
      setWishlistProductIds(data.products.map(p => p.id));
      return isAlreadyWishlisted ? 'removed' : 'added';
    } catch (error) {
      // Rollback on failure
      setWishlistProductIds(previousIds);
      setWishlist(prev => ({ ...prev, products: previousProducts }));
      throw error;
    } finally {
      setTogglingProductIds(prev => prev.filter(id => id !== productId));
    }
  };

  const getWishlistCount = () => {
    return wishlistProductIds.length;
  };

  return (
    <WishlistContext.Provider value={{ wishlist, wishlistProductIds, togglingProductIds, loading, toggleWishlist, getWishlistCount, refreshWishlist: fetchWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
