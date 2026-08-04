// Centralized API Configuration for DualForge E-Commerce
// Resolves API host dynamically with fallback to port 8085
export const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:8085';
export const API_AUTH_URL = `${API_BASE_URL}/api/auth`;
export const API_PRODUCTS_URL = `${API_BASE_URL}/api/products`;
export const API_CATEGORIES_URL = `${API_BASE_URL}/api/categories`;
export const API_CART_URL = `${API_BASE_URL}/api/cart`;
export const API_WISHLIST_URL = `${API_BASE_URL}/api/wishlist`;
export const API_ORDERS_URL = `${API_BASE_URL}/api/orders`;
export const API_REVIEWS_URL = `${API_BASE_URL}/api/reviews`;
export const API_CHATBOT_URL = `${API_BASE_URL}/api/chatbot`;
export const API_ADMIN_URL = `${API_BASE_URL}/api/admin`;
export const API_SELLERS_URL = `${API_BASE_URL}/api/sellers`;
