import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { BarChart3, Package, Users, Activity, PlusCircle, Trash2, ShieldAlert } from 'lucide-react';
import { API_ADMIN_URL, API_PRODUCTS_URL, API_CATEGORIES_URL, API_ORDERS_URL, API_SELLERS_URL } from '../apiConfig';

const AdminDashboard = () => {
  const { getAuthHeaders } = useAuth();
  
  // Dashboard states
  const [stats, setStats] = useState({ totalOrders: 0, totalProducts: 0, totalUsers: 0, totalCategories: 0, totalSales: 0 });
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [logs, setLogs] = useState([]);
  const [pendingSellers, setPendingSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Tab selection
  const [activeTab, setActiveTab] = useState('overview'); // overview, products, orders, logs, sellers

  // Product Form State (NEW / UPDATE)
  const [prodIdToEdit, setProdIdToEdit] = useState(null); // null means new product
  const [prodName, setProdName] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodImageUrl, setProdImageUrl] = useState('');
  const [prodStock, setProdStock] = useState('');
  const [prodCategory, setProdCategory] = useState('');
  const [prodSpecs, setProdSpecs] = useState('');

  const [notification, setNotification] = useState('');

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const headers = getAuthHeaders();

      // Fetch Stats
      const statsRes = await fetch(`${API_ADMIN_URL}/dashboard`, { headers });
      if (statsRes.ok) setStats(await statsRes.json());

      // Fetch Products
      const prodRes = await fetch(API_PRODUCTS_URL);
      if (prodRes.ok) setProducts(await prodRes.json());

      // Fetch Categories
      const catRes = await fetch(API_CATEGORIES_URL);
      if (catRes.ok) {
        const catData = await catRes.json();
        setCategories(catData);
        if (catData.length > 0 && !prodCategory) setProdCategory(catData[0].id);
      }

      // Fetch Orders
      const orderRes = await fetch(`${API_ORDERS_URL}/all`, { headers });
      if (orderRes.ok) setOrders(await orderRes.json());

      // Fetch MongoDB Activity Audit Logs
      const logRes = await fetch(`${API_ADMIN_URL}/logs`, { headers });
      if (logRes.ok) setLogs(await logRes.json());

      // Fetch pending sellers
      const sellersRes = await fetch(`${API_SELLERS_URL}/admin/pending`, { headers });
      if (sellersRes.ok) setPendingSellers(await sellersRes.json());

    } catch (err) {
      console.error('Error fetching admin dashboard details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSellerAction = async (sellerId, status) => {
    try {
      const res = await fetch(`${API_SELLERS_URL}/admin/${sellerId}/approve?status=${status}`, {
        method: 'PUT',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        setNotification(`Seller status updated to: ${status}`);
        fetchAdminData();
        setTimeout(() => setNotification(''), 3000);
      } else {
        const err = await res.json();
        alert(err.message || "Failed to update seller status.");
      }
    } catch (err) {
      console.error("Seller action failed:", err);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    if (!prodName || !prodPrice || !prodStock || !prodCategory) return;

    const payload = {
      name: prodName,
      description: prodDesc,
      price: parseFloat(prodPrice),
      imageUrl: prodImageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600',
      stockQuantity: parseInt(prodStock),
      specifications: prodSpecs
    };

    try {
      let response;
      if (prodIdToEdit) {
        // Edit Product
        response = await fetch(`${API_PRODUCTS_URL}/${prodIdToEdit}?categoryId=${prodCategory}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(payload)
        });
      } else {
        // Add new Product
        response = await fetch(`${API_PRODUCTS_URL}?categoryId=${prodCategory}`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(payload)
        });
      }

      if (response.ok) {
        setNotification(prodIdToEdit ? 'Product updated successfully!' : 'Product added successfully!');
        resetProductForm();
        fetchAdminData(); // Refresh grid & logs
        setTimeout(() => setNotification(''), 3000);
      } else {
        const err = await response.json();
        alert(err.message || 'Action failed');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditProduct = (prod) => {
    setProdIdToEdit(prod.id);
    setProdName(prod.name);
    setProdDesc(prod.description);
    setProdPrice(prod.price);
    setProdImageUrl(prod.imageUrl);
    setProdStock(prod.stockQuantity);
    setProdCategory(prod.category.id);
    setProdSpecs(prod.specifications || '');
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const response = await fetch(`${API_PRODUCTS_URL}/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (response.ok) {
        setNotification('Product deleted successfully!');
        fetchAdminData();
        setTimeout(() => setNotification(''), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const resetProductForm = () => {
    setProdIdToEdit(null);
    setProdName('');
    setProdDesc('');
    setProdPrice('');
    setProdImageUrl('');
    setProdStock('');
    setProdSpecs('');
    if (categories.length > 0) setProdCategory(categories[0].id);
  };

  const handleOrderStatusUpdate = async (orderId, newStatus) => {
    try {
      const response = await fetch(`${API_ORDERS_URL}/${orderId}/status?status=${newStatus}`, {
        method: 'PUT',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        setNotification(`Order #${orderId} updated to ${newStatus}`);
        fetchAdminData(); // Refresh list & MongoDB Audit Logs
        setTimeout(() => setNotification(''), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading && orders.length === 0) {
    return (
      <div className="loader-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="admin-page container animate-fade-in">
      {notification && (
        <div className="toast-notification badge badge-primary">
          {notification}
        </div>
      )}

      <div className="admin-header">
        <h1>Administrator Controls</h1>
        <p>Real-time orders management, products curation, and secure MongoDB system audit logs.</p>
      </div>

      {/* Stats Cards */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card glass-card">
          <div className="stat-icon-wrapper sales-theme"><BarChart3 size={24} /></div>
          <div>
            <span className="stat-label">TOTAL SALES</span>
            <h3 className="glow-text">${stats.totalSales.toFixed(2)}</h3>
          </div>
        </div>
        <div className="admin-stat-card glass-card">
          <div className="stat-icon-wrapper orders-theme"><Package size={24} /></div>
          <div>
            <span className="stat-label">TOTAL ORDERS</span>
            <h3>{stats.totalOrders}</h3>
          </div>
        </div>
        <div className="admin-stat-card glass-card">
          <div className="stat-icon-wrapper users-theme"><Users size={24} /></div>
          <div>
            <span className="stat-label">REGISTERED USERS</span>
            <h3>{stats.totalUsers}</h3>
          </div>
        </div>
        <div className="admin-stat-card glass-card">
          <div className="stat-icon-wrapper logs-theme"><Activity size={24} /></div>
          <div>
            <span className="stat-label">AUDIT LOGS</span>
            <h3>{logs.length} logged</h3>
          </div>
        </div>
      </div>

      {/* Admin navigation Tabs */}
      <div className="admin-tabs">
        <button 
          className={`admin-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`admin-tab-btn ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          Product Catalog Management
        </button>
        <button 
          className={`admin-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          Order Control Panel
        </button>
        <button 
          className={`admin-tab-btn ${activeTab === 'logs' ? 'active' : ''}`}
          onClick={() => setActiveTab('logs')}
        >
          MongoDB Secure Activity Logs
        </button>
        <button 
          className={`admin-tab-btn ${activeTab === 'sellers' ? 'active' : ''}`}
          onClick={() => setActiveTab('sellers')}
        >
          Sellers Curation
        </button>
      </div>

      {/* TAB CONTENT: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="tab-content animate-fade-in">
          <div className="dashboard-overview-layout">
            <div className="dashboard-main-section glass-card">
              <h3>Recent Purchases</h3>
              {orders.length === 0 ? (
                <p>No orders in the system yet.</p>
              ) : (
                <div className="admin-table-wrapper">
                  <table className="admin-data-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Customer</th>
                        <th>Date</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.slice(0, 5).map(o => (
                        <tr key={o.id}>
                          <td>#DF-{o.id}</td>
                          <td>{o.user.firstName} {o.user.lastName} ({o.user.username})</td>
                          <td>{new Date(o.orderDate).toLocaleDateString()}</td>
                          <td>${o.totalAmount.toFixed(2)}</td>
                          <td>
                            <span className={`badge ${
                              o.status === 'DELIVERED' ? 'badge-success' : o.status === 'PENDING' ? 'badge-warning' : 'badge-primary'
                            }`}>
                              {o.status}
                            </span>
                          </td>
                          <td>
                            <button onClick={() => setActiveTab('orders')} className="btn-secondary btn-table-act">
                              Manage
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="dashboard-side-section glass-card">
              <h3>Recent System Logs</h3>
              <div className="recent-logs-list">
                {logs.slice(0, 6).map(l => (
                  <div key={l.id} className="log-list-item">
                    <div className="log-meta">
                      <span className="log-action">{l.action}</span>
                      <span className="log-time">{new Date(l.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="log-details">{l.details}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: PRODUCTS CRUD */}
      {activeTab === 'products' && (
        <div className="tab-content animate-fade-in products-crud-layout">
          {/* Form Column */}
          <div className="crud-form-card glass-card">
            <h3>{prodIdToEdit ? 'Edit Product' : 'Add New Product'}</h3>
            <form onSubmit={handleProductSubmit} className="crud-product-form">
              <div className="form-group-full">
                <label>Product Name</label>
                <input 
                  type="text" 
                  value={prodName} 
                  onChange={(e) => setProdName(e.target.value)}
                  className="form-input" 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Price (₹)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  value={prodPrice} 
                  onChange={(e) => setProdPrice(e.target.value)}
                  className="form-input" 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Stock Quantity</label>
                <input 
                  type="number" 
                  value={prodStock} 
                  onChange={(e) => setProdStock(e.target.value)}
                  className="form-input" 
                  required 
                />
              </div>
              <div className="form-group-full">
                <label>Category</label>
                <select 
                  value={prodCategory} 
                  onChange={(e) => setProdCategory(e.target.value)}
                  className="sort-dropdown form-input"
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group-full">
                <label>Image URL</label>
                <input 
                  type="url" 
                  value={prodImageUrl} 
                  placeholder="https://images.unsplash.com/..."
                  onChange={(e) => setProdImageUrl(e.target.value)}
                  className="form-input" 
                />
              </div>
              <div className="form-group-full">
                <label>Description</label>
                <textarea 
                  rows="3" 
                  value={prodDesc} 
                  onChange={(e) => setProdDesc(e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group-full">
                <label>Specifications (optional)</label>
                <input 
                  type="text" 
                  value={prodSpecs} 
                  placeholder="e.g. RAM: 16GB, Storage: 512GB SSD"
                  onChange={(e) => setProdSpecs(e.target.value)}
                  className="form-input" 
                />
              </div>
              <div className="form-group-full flex-align-center gap-10 margin-top-10">
                <button type="submit" className="btn-primary auth-submit-btn flex-1">
                  <PlusCircle size={16} />
                  <span>{prodIdToEdit ? 'Update Product' : 'Publish Product'}</span>
                </button>
                {prodIdToEdit && (
                  <button type="button" onClick={resetProductForm} className="btn-secondary">
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* List Column */}
          <div className="crud-list-card glass-card">
            <h3>Products Inventory</h3>
            <div className="admin-table-wrapper">
              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Category</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id}>
                      <td><img src={p.imageUrl} alt={p.name} className="table-row-thumb" /></td>
                      <td><strong>{p.name}</strong></td>
                      <td>₹{p.price.toLocaleString('en-IN')}</td>
                      <td>
                        <span className={`badge ${p.stockQuantity > 5 ? 'badge-success' : 'badge-error'}`}>
                          {p.stockQuantity} Left
                        </span>
                      </td>
                      <td>{p.category.name}</td>
                      <td>
                        <div className="table-actions-group">
                          <button onClick={() => handleEditProduct(p)} className="btn-secondary btn-table-act">Edit</button>
                          <button onClick={() => handleDeleteProduct(p.id)} className="btn-secondary btn-table-act text-error"><Trash2 size={12} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: ORDERS CONTROLS */}
      {activeTab === 'orders' && (
        <div className="tab-content animate-fade-in glass-card">
          <h3>Customer Orders Panel</h3>
          {orders.length === 0 ? (
            <p>No orders placed yet.</p>
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer Name</th>
                    <th>Address</th>
                    <th>Date Placed</th>
                    <th>Payment</th>
                    <th>Status Controls</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o.id}>
                      <td>#DF-{o.id}</td>
                      <td>{o.user.firstName} {o.user.lastName} <br /><span className="text-muted">@{o.user.username}</span></td>
                      <td><span className="small-text-wrap">{o.shippingAddress}</span></td>
                      <td>{new Date(o.orderDate).toLocaleDateString()}</td>
                      <td>
                        <span className={`badge ${o.paymentStatus === 'PAID' ? 'badge-success' : 'badge-warning'}`}>
                          {o.paymentStatus}
                        </span>
                        <span className="text-secondary small-text-wrap"> via {o.paymentMethod}</span>
                      </td>
                      <td>
                        <select 
                          value={o.status}
                          onChange={(e) => handleOrderStatusUpdate(o.id, e.target.value)}
                          className="sort-dropdown form-input table-dropdown"
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="SHIPPED">SHIPPED</option>
                          <option value="DELIVERED">DELIVERED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: SECURE MONGO AUDIT LOGS */}
      {activeTab === 'logs' && (
        <div className="tab-content animate-fade-in glass-card">
          <div className="audit-logs-header">
            <h3><ShieldAlert size={20} className="text-error" /> MongoDB Secure Action Logs (Auditing)</h3>
            <span className="badge badge-success">NoSQL Database Connected</span>
          </div>
          <p className="logs-desc">
            For advanced capstone database transparency, system operations and user actions are appended to MongoDB logs. 
            These logs are queryable, write-once, and read-only for system administrators.
          </p>

          <div className="admin-table-wrapper margin-top-20">
            <table className="admin-data-table logs-table">
              <thead>
                <tr>
                  <th>Log ID</th>
                  <th>Actor</th>
                  <th>Action Triggered</th>
                  <th>Audit Logs Details</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="log-row">
                    <td className="log-id">...{log.id.slice(-8)}</td>
                    <td><strong>{log.username || 'SYSTEM'}</strong></td>
                    <td>
                      <span className={`badge ${
                        log.action === 'LOGIN' ? 'badge-primary' : log.action === 'ORDER_PLACE' ? 'badge-success' : 'badge-warning'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td>{log.details}</td>
                    <td className="log-timestamp">{new Date(log.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: SELLERS CURATION */}
      {activeTab === 'sellers' && (
        <div className="tab-content animate-fade-in glass-card">
          <div className="panel-header">
            <h3>Pending Seller Profiles Approval</h3>
          </div>
          {pendingSellers.length === 0 ? (
            <p className="margin-top-15 text-secondary">No pending multi-vendor seller registrations currently require review.</p>
          ) : (
            <div className="admin-table-wrapper margin-top-15">
              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th>Store Name</th>
                    <th>Seller Contact</th>
                    <th>GST Code</th>
                    <th>Business Address</th>
                    <th>Approval Status</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingSellers.map(s => (
                    <tr key={s.id}>
                      <td><strong>{s.storeName}</strong></td>
                      <td>{s.user?.username || 'Unknown'} ({s.user?.email || 'N/A'})</td>
                      <td><code>{s.gstNumber}</code></td>
                      <td>{s.businessAddress}</td>
                      <td>
                        <div className="flex-align-center gap-5">
                          <button onClick={() => handleSellerAction(s.id, 'APPROVED')} className="btn-table-action" style={{ background: 'var(--color-success)', color: '#fff' }}>
                            Approve
                          </button>
                          <button onClick={() => handleSellerAction(s.id, 'REJECTED')} className="btn-table-action" style={{ background: 'var(--color-error)', color: '#fff' }}>
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
