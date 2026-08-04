import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext';
import { API_CART_URL } from '../apiConfig';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { token, getAuthHeaders, isAuthenticated } = useAuth();
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    if (!isAuthenticated) {
      setCart({ items: [] });
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(API_CART_URL, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setCart(data);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [token, isAuthenticated]);

  const addToCart = async (productId, quantity) => {
    if (!isAuthenticated) throw new Error('Please login to add items to cart.');
    try {
      const response = await fetch(`${API_CART_URL}/add`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ productId, quantity })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to add item to cart');
      }
      setCart(data);
      return data;
    } catch (error) {
      throw error;
    }
  };

  const updateCartQuantity = async (productId, quantity) => {
    if (!isAuthenticated) return;
    try {
      const response = await fetch(`${API_CART_URL}/update`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ productId, quantity })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update quantity');
      }
      setCart(data);
      return data;
    } catch (error) {
      throw error;
    }
  };

  const removeFromCart = async (productId) => {
    if (!isAuthenticated) return;
    try {
      const response = await fetch(`${API_CART_URL}/remove/${productId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to remove item');
      }
      setCart(data);
      return data;
    } catch (error) {
      throw error;
    }
  };

  const clearCart = async () => {
    if (!isAuthenticated) return;
    try {
      const response = await fetch(`${API_CART_URL}/clear`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (response.ok) {
        setCart({ items: [] });
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  const getCartCount = () => {
    return cart?.items?.reduce((total, item) => total + item.quantity, 0) || 0;
  };

  const getCartTotal = () => {
    return cart?.items?.reduce((total, item) => total + (item.product.price * item.quantity), 0) || 0;
  };

  return (
    <CartContext.Provider value={{ cart, loading, addToCart, updateCartQuantity, removeFromCart, clearCart, getCartCount, getCartTotal, refreshCart: fetchCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
