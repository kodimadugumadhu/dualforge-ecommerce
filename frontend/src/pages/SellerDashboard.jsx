import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Package, ShoppingBag, DollarSign, AlertTriangle, Plus, 
  TrendingUp, Edit3, Search, Calendar, User, Truck, 
  Check, X, ChevronLeft, ChevronRight, BarChart3, Clock, Info, ShieldAlert
} from 'lucide-react';
import { API_CATEGORIES_URL, API_PRODUCTS_URL, API_ORDERS_URL, API_SELLERS_URL } from '../apiConfig';

const SellerDashboard = () => {
  const { user, getAuthHeaders } = useAuth();
  
  const [sellerProfile, setSellerProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // overview, products, orders
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState('');
  const [chartRange, setChartRange] = useState('week'); // week, month
  
  // Seller Application Form states
  const [appStoreName, setAppStoreName] = useState('');
  const [appGst, setAppGst] = useState('');
  const [appBank, setAppBank] = useState('');
  const [appAddress, setAppAddress] = useState('');

  // Modal states
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    stockQuantity: '',
    sku: '',
    brand: '',
    categoryId: ''
  });

  // Search, Filters & Pagination for Orders
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');
  const [orderCurrentPage, setOrderCurrentPage] = useState(1);
  const ordersPerPage = 10;

  // Stats State
  const [stats, setStats] = useState({
    activeProducts: 0,
    outOfStock: 0,
    lowStock: 0,
    revenue: 0,
    totalSales: 0,
    pendingOrders: 0,
    deliveredOrders: 0
  });

  const showToast = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(''), 3000);
  };

  const fetchSellerProfile = async () => {
    try {
      const res = await fetch(`${API_SELLERS_URL}/profile`, { headers: getAuthHeaders() });
      if (res.ok) {
        const prof = await res.json();
        setSellerProfile(prof);
        return prof;
      }
    } catch (err) {
      console.error("Error fetching seller profile:", err);
    }
    setSellerProfile(null);
    return null;
  };

  const handleSellerApplication = async (e) => {
    e.preventDefault();
    if (!appStoreName || !appGst || !appBank || !appAddress) return;

    try {
      const queryStr = `storeName=${encodeURIComponent(appStoreName)}&gstNumber=${encodeURIComponent(appGst)}&bankDetails=${encodeURIComponent(appBank)}&businessAddress=${encodeURIComponent(appAddress)}`;
      const res = await fetch(`${API_SELLERS_URL}/apply?${queryStr}`, {
        method: 'POST',
        headers: getAuthHeaders()
      });

      const data = await res.json();
      if (res.ok) {
        showToast("Seller verification application submitted!");
        fetchSellerProfile();
      } else {
        alert(data.message || "Failed to submit application");
      }
    } catch (err) {
      alert("Error submitting seller application");
    }
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const headers = getAuthHeaders();
      
      // 1. Fetch Categories
      const catRes = await fetch(API_CATEGORIES_URL);
      let loadedCategories = [];
      if (catRes.ok) {
        loadedCategories = await catRes.json();
        setCategories(loadedCategories);
      }

      // 2. Fetch Seller Specific Products (Secure JWT-based Endpoint)
      const prodRes = await fetch(`${API_PRODUCTS_URL}/seller`, { headers });
      let loadedProducts = [];
      if (prodRes.ok) {
        loadedProducts = await prodRes.json();
        setProducts(loadedProducts);
      }

      // Initialize default categoryId in new product form if empty
      if (loadedCategories.length > 0) {
        setNewProduct(prev => ({
          ...prev,
          categoryId: prev.categoryId || loadedCategories[0].id.toString()
        }));
      }

      // 3. Fetch Seller Specific Orders
      const orderRes = await fetch(`${API_ORDERS_URL}/seller`, { headers });
      let loadedOrders = [];
      if (orderRes.ok) {
        loadedOrders = await orderRes.json();
        setOrders(loadedOrders);
      }

      // Compute statistics based on live data
      const activeProductsCount = loadedProducts.length;
      const outOfStockCount = loadedProducts.filter(p => p.stockQuantity <= 0).length;
      const lowStockCount = loadedProducts.filter(p => p.stockQuantity > 0 && p.stockQuantity <= (p.lowStockThreshold || 5)).length;

      let revenueCount = 0;
      let totalSalesCount = 0;
      let pendingOrdersCount = 0;
      let deliveredOrdersCount = 0;

      loadedOrders.forEach(order => {
        let sellerOrderAmount = 0;
        let sellerHasItems = false;
        let hasPendingItem = false;
        let hasDeliveredItem = false;

        order.items.forEach(item => {
          if (item.product?.seller?.id === user.id) {
            sellerHasItems = true;
            // Revenue only includes Delivered or Out for Delivery item states (avoiding pending/cancelled inflation)
            if (item.status === 'DELIVERED' || item.status === 'OUT_FOR_DELIVERY') {
              sellerOrderAmount += item.price * item.quantity;
            }
            if (item.status === 'PENDING') {
              hasPendingItem = true;
            }
            if (item.status === 'DELIVERED') {
              hasDeliveredItem = true;
            }
          }
        });

        if (sellerHasItems) {
          totalSalesCount++;
          revenueCount += sellerOrderAmount;
          if (hasPendingItem) {
            pendingOrdersCount++;
          }
          if (hasDeliveredItem) {
            deliveredOrdersCount++;
          }
        }
      });

      setStats({
        activeProducts: activeProductsCount,
        outOfStock: outOfStockCount,
        lowStock: lowStockCount,
        revenue: revenueCount,
        totalSales: totalSalesCount,
        pendingOrders: pendingOrdersCount,
        deliveredOrders: deliveredOrdersCount
      });

    } catch (err) {
      console.error("Error loading seller dashboard details:", err);
      showToast("Unable to load dashboard details. Retry");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user.id]);

  // Reset pagination to page 1 on search or filter updates
  useEffect(() => {
    setOrderCurrentPage(1);
  }, [orderSearch, orderStatusFilter]);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_PRODUCTS_URL}/seller`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
        
        const outOfStockCount = data.filter(p => p.stockQuantity <= 0).length;
        const lowStockCount = data.filter(p => p.stockQuantity > 0 && p.stockQuantity <= (p.lowStockThreshold || 5)).length;
        setStats(prev => ({
          ...prev,
          activeProducts: data.length,
          outOfStock: outOfStockCount,
          lowStock: lowStockCount
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price || !newProduct.stockQuantity || !newProduct.sku || !newProduct.categoryId) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      const res = await fetch(API_PRODUCTS_URL, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: newProduct.name,
          description: newProduct.description,
          price: parseFloat(newProduct.price),
          stockQuantity: parseInt(newProduct.stockQuantity),
          sku: newProduct.sku,
          brand: newProduct.brand,
          categoryId: parseInt(newProduct.categoryId),
          imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
          thumbnailUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100',
          lowStockThreshold: 5
        })
      });

      if (res.ok) {
        showToast("Product listed successfully!");
        setShowAddForm(false);
        setNewProduct({
          name: '',
          description: '',
          price: '',
          stockQuantity: '',
          sku: '',
          brand: '',
          categoryId: categories.length > 0 ? categories[0].id.toString() : ''
        });
        fetchDashboardData();
      } else {
        const errData = await res.json();
        alert(errData.message || "Failed to publish product.");
      }
    } catch (err) {
      alert("Network connectivity error.");
    }
  };

  const handleStockUpdate = async (product) => {
    const additional = prompt(`Enter additional stock quantity for ${product.name}:`, "10");
    if (additional === null || isNaN(additional) || additional.trim() === '') return;
    const additionalVal = parseInt(additional);
    if (isNaN(additionalVal) || additionalVal <= 0) {
      alert("Please enter a valid positive number.");
      return;
    }
    const newStock = product.stockQuantity + additionalVal;

    try {
      const res = await fetch(`${API_PRODUCTS_URL}/${product.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: product.name,
          description: product.description,
          price: product.price,
          stockQuantity: newStock,
          sku: product.sku,
          categoryId: product.category.id,
          brand: product.brand,
          imageUrl: product.imageUrl,
          thumbnailUrl: product.thumbnailUrl,
          lowStockThreshold: product.lowStockThreshold || 5
        })
      });

      if (res.ok) {
        showToast("Stock updated successfully!");
        fetchProducts();
      } else {
        alert("Failed to update stock.");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating stock quantity.");
    }
  };

  const handleItemStatusUpdate = async (orderItemId, newStatus) => {
    try {
      const res = await fetch(`${API_ORDERS_URL}/items/${orderItemId}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        showToast("Order Item Status Updated");
        fetchDashboardData();
      } else {
        const err = await res.json();
        alert(err.message || "Failed to update item status.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error updating status.");
    }
  };

  const getNextStatuses = (status) => {
    switch (status) {
      case 'PENDING':
        return ['CONFIRMED', 'CANCELLED'];
      case 'CONFIRMED':
        return ['SHIPPED', 'CANCELLED'];
      case 'SHIPPED':
        return ['OUT_FOR_DELIVERY'];
      case 'OUT_FOR_DELIVERY':
        return ['DELIVERED'];
      default:
        return [];
    }
  };

  // Helper to retrieve only this seller's items from an order
  const getSellerItems = (order) => {
    return order.items.filter(item => item.product?.seller?.id === user.id);
  };

  // Helper to calculate total value of this seller's products in an order
  const getSellerOrderTotal = (order) => {
    return getSellerItems(order).reduce((acc, item) => acc + (item.price * item.quantity), 0);
  };

  // Filter and Search Orders
  const filteredOrders = orders.filter(order => {
    // 1. Matches Search (Customer Name or Order ID)
    const matchesSearch = 
      order.id.toString().includes(orderSearch.trim()) ||
      order.user?.username?.toLowerCase().includes(orderSearch.toLowerCase()) ||
      (order.user?.firstName && order.user.firstName.toLowerCase().includes(orderSearch.toLowerCase())) ||
      (order.user?.lastName && order.user.lastName.toLowerCase().includes(orderSearch.toLowerCase()));

    // 2. Matches Status Tab (filters by order overall status or individual item status matching)
    const sellerItems = getSellerItems(order);
    const matchesStatus = orderStatusFilter === 'ALL' || 
      order.status === orderStatusFilter || 
      sellerItems.some(item => item.status === orderStatusFilter);

    // 3. Must contain seller items
    const hasSellerItems = sellerItems.length > 0;

    return matchesSearch && matchesStatus && hasSellerItems;
  });

  // Orders Pagination
  const indexOfLastOrder = orderCurrentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalOrderPages = Math.ceil(filteredOrders.length / ordersPerPage);

  // Revenue SVG Chart Data calculation
  // Let's create weekly stats (6 days: Mon-Sat) or monthly stats (4 weeks) based on actual orders
  const getChartData = () => {
    if (chartRange === 'week') {
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const revenues = [0, 0, 0, 0, 0, 0];
      
      orders.forEach(order => {
        const sellerAmt = getSellerOrderTotal(order);
        if (sellerAmt > 0 && order.orderDate) {
          // Check day of week
          const date = new Date(order.orderDate);
          const dayIdx = date.getDay(); // 0 = Sun, 1 = Mon...
          if (dayIdx >= 1 && dayIdx <= 6) {
            revenues[dayIdx - 1] += sellerAmt;
          }
        }
      });

      // Default mock fallback values to display if there's no live order history
      const hasData = revenues.some(r => r > 0);
      return days.map((day, idx) => ({
        label: day,
        value: hasData ? revenues[idx] : [1400, 2600, 1800, 3900, 4800, 2200][idx]
      }));
    } else {
      const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
      const revenues = [0, 0, 0, 0];

      orders.forEach(order => {
        const sellerAmt = getSellerOrderTotal(order);
        if (sellerAmt > 0 && order.orderDate) {
          const date = new Date(order.orderDate);
          const dayOfMonth = date.getDate();
          const weekIdx = Math.min(3, Math.floor((dayOfMonth - 1) / 7));
          revenues[weekIdx] += sellerAmt;
        }
      });

      const hasData = revenues.some(r => r > 0);
      return weeks.map((week, idx) => ({
        label: week,
        value: hasData ? revenues[idx] : [8500, 12200, 9400, 14800][idx]
      }));
    }
  };

  useEffect(() => {
    fetchSellerProfile();
    fetchDashboardData();
  }, [user.id]);

  // Reset pagination to page 1 on search or filter updates
  useEffect(() => {
    setOrderCurrentPage(1);
  }, [orderSearch, orderStatusFilter]);

  const chartData = getChartData();
  const maxChartValue = Math.max(...chartData.map(d => d.value), 1000); // Guarantees >0 to prevent division by zero

  if (loading) {
    return (
      <div className="loader-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (sellerProfile && sellerProfile.approvalStatus === 'PENDING') {
    return (
      <div className="seller-dashboard-page container animate-fade-in padding-40">
        <div className="glass-card text-center" style={{ maxWidth: '650px', margin: '40px auto', padding: '45px' }}>
          <Clock size={64} style={{ color: 'var(--color-warning)', margin: '0 auto 15px' }} />
          <h2>Seller Account Under Verification</h2>
          <p className="margin-top-10" style={{ fontSize: '15px' }}>
            Your seller application for Store <strong>"{sellerProfile.storeName}"</strong> (GST: <code>{sellerProfile.gstNumber || 'PENDING'}</code>) has been submitted and is currently undergoing Super Admin review.
          </p>
          <div className="badge badge-warning margin-top-15" style={{ fontSize: '13px', padding: '6px 16px' }}>
            STATUS: PENDING ADMIN APPROVAL
          </div>
          <p className="margin-top-20 text-secondary text-sm">
            Once approved by the Super Admin, your Seller Dashboard will automatically activate for uploading listings, restocking, and managing orders.
          </p>
        </div>
      </div>
    );
  }

  if (!sellerProfile && !loading) {
    return (
      <div className="seller-dashboard-page container animate-fade-in padding-40">
        <div className="glass-card" style={{ maxWidth: '600px', margin: '40px auto', padding: '40px' }}>
          <div className="text-center margin-bottom-25">
            <ShieldAlert size={48} style={{ color: 'var(--color-primary)', margin: '0 auto 10px' }} />
            <h2>Complete Seller Verification Application</h2>
            <p className="text-secondary text-sm">Please submit your registered business & GST details to request seller access from the Super Admin.</p>
          </div>
          <form onSubmit={handleSellerApplication} className="crud-product-form">
            <div className="form-group-full">
              <label>Store / Brand Name</label>
              <input type="text" value={appStoreName} onChange={(e) => setAppStoreName(e.target.value)} className="form-input" required placeholder="e.g. Apex Tech India" />
            </div>
            <div className="form-group-full">
              <label>GSTIN / Tax Code</label>
              <input type="text" value={appGst} onChange={(e) => setAppGst(e.target.value)} className="form-input" required placeholder="27AAAAA0000A1Z5" />
            </div>
            <div className="form-group-full">
              <label>Bank Account / IFSC Details</label>
              <input type="text" value={appBank} onChange={(e) => setAppBank(e.target.value)} className="form-input" required placeholder="HDFC Bank - A/C: 123456789 (IFSC: HDFC0001234)" />
            </div>
            <div className="form-group-full">
              <label>Registered Business Address</label>
              <input type="text" value={appAddress} onChange={(e) => setAppAddress(e.target.value)} className="form-input" required placeholder="Plot 12, Industrial Area, City, State" />
            </div>
            <button type="submit" className="btn-primary auth-submit-btn margin-top-20">Submit Application for Verification</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="seller-dashboard-page container animate-fade-in">
      {notification && (
        <div className="toast-notification badge badge-primary animate-fade-in" style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 1000 }}>
          {notification}
        </div>
      )}

      <div className="dashboard-header flex-justify-between">
        <div>
          <h1>Seller Dashboard</h1>
          <p className="text-secondary">Manage products, verify stock listings, and review incoming sales orders.</p>
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
          <button 
            onClick={() => {
              setActiveTab(activeTab === 'orders' ? 'overview' : 'orders');
            }} 
            className={`btn-secondary flex-align-center gap-5`}
            style={{ padding: '10px 18px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', cursor: 'pointer', background: activeTab === 'orders' ? 'rgba(255,255,255,0.1)' : 'transparent', color: 'var(--text-primary)' }}
          >
            <ShoppingBag size={16} />
            <span>Orders List</span>
          </button>
          <button onClick={() => setShowAddForm(true)} className="btn-primary flex-align-center gap-5">
            <Plus size={16} />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Tabs navigation row */}
      <div className="admin-tabs" style={{ marginTop: '25px', marginBottom: '15px' }}>
        <button 
          onClick={() => setActiveTab('overview')} 
          className={`admin-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
        >
          Overview & Stats
        </button>
        <button 
          onClick={() => setActiveTab('products')} 
          className={`admin-tab-btn ${activeTab === 'products' ? 'active' : ''}`}
        >
          My Inventory ({products.length})
        </button>
        <button 
          onClick={() => setActiveTab('orders')} 
          className={`admin-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
        >
          Manage Orders ({filteredOrders.length})
        </button>
      </div>

      {activeTab === 'overview' && (
        <>
          {/* Stats Summary Panel */}
          <div className="dashboard-stats-grid">
            <div className="stats-card glass-card">
              <div className="stats-icon-wrapper success">
                <DollarSign size={20} />
              </div>
              <div className="stats-info">
                <span className="stats-label">Gross Revenue</span>
                <span className="stats-value">₹{stats.revenue.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="stats-card glass-card">
              <div className="stats-icon-wrapper primary">
                <ShoppingBag size={20} />
              </div>
              <div className="stats-info">
                <span className="stats-label">Active Orders</span>
                <span className="stats-value">{stats.totalSales}</span>
              </div>
            </div>

            <div className="stats-card glass-card">
              <div className="stats-icon-wrapper info">
                <Package size={20} />
              </div>
              <div className="stats-info">
                <span className="stats-label">Active Listings</span>
                <span className="stats-value">{stats.activeProducts}</span>
              </div>
            </div>

            <div className="stats-card glass-card">
              <div className="stats-icon-wrapper warning">
                <AlertTriangle size={20} />
              </div>
              <div className="stats-info">
                <span className="stats-label">Low & Out Stock</span>
                <span className="stats-value">{stats.lowStock + stats.outOfStock} <span style={{ fontSize: '12px', fontWeight: 'normal', color: 'var(--text-secondary)' }}>({stats.outOfStock} empty)</span></span>
              </div>
            </div>
          </div>

          <div className="dashboard-body-grid margin-top-30" style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: '30px' }}>
            {/* Revenue SVG Chart */}
            <div className="analytics-panel glass-card" style={{ padding: '24px' }}>
              <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0 }}>Sales Trends</h3>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    onClick={() => setChartRange('week')}
                    className={`btn-secondary ${chartRange === 'week' ? 'active' : ''}`}
                    style={{ padding: '4px 10px', fontSize: '12px', cursor: 'pointer', background: chartRange === 'week' ? 'var(--color-primary)' : 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px' }}
                  >
                    Weekly
                  </button>
                  <button 
                    onClick={() => setChartRange('month')}
                    className={`btn-secondary ${chartRange === 'month' ? 'active' : ''}`}
                    style={{ padding: '4px 10px', fontSize: '12px', cursor: 'pointer', background: chartRange === 'month' ? 'var(--color-primary)' : 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px' }}
                  >
                    Monthly
                  </button>
                </div>
              </div>

              {/* Dynamic SVG Bar Chart */}
              <div style={{ position: 'relative', height: '240px', marginTop: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', height: '200px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                  {chartData.map((data, idx) => {
                    const pct = (data.value / maxChartValue) * 100;
                    return (
                      <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '40px' }}>
                        <div style={{ position: 'relative', width: '16px', height: '170px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', display: 'flex', alignItems: 'flex-end' }}>
                          <div 
                            style={{ 
                              width: '100%', 
                              height: `${pct}%`, 
                              background: 'linear-gradient(180deg, var(--color-primary) 0%, var(--color-primary-dim) 100%)', 
                              borderRadius: '8px',
                              transition: 'height 0.8s ease-in-out',
                              cursor: 'pointer'
                            }}
                            title={`₹${data.value.toLocaleString('en-IN')}`}
                          ></div>
                        </div>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '8px' }}>{data.label}</span>
                      </div>
                    );
                  })}
                </div>
                {/* Y-axis labels mock line indicators */}
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '200px', pointerEvents: 'none', opacity: 0.15 }}>
                  <div style={{ borderBottom: '1px dashed var(--text-muted)' }}></div>
                  <div style={{ borderBottom: '1px dashed var(--text-muted)' }}></div>
                  <div style={{ borderBottom: '1px dashed var(--text-muted)' }}></div>
                </div>
              </div>
            </div>

            {/* Quick status activity list */}
            <div className="listings-panel glass-card" style={{ padding: '24px' }}>
              <div className="panel-header" style={{ marginBottom: '15px' }}>
                <h3 style={{ margin: 0 }}>Activity Insights</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
                  <div className="stats-icon-wrapper warning" style={{ width: '36px', height: '36px', borderRadius: '50%' }}><Clock size={16} /></div>
                  <div style={{ textAlign: 'left' }}>
                    <p style={{ margin: 0, fontSize: '13px', fontWeight: '600' }}>Pending Dispatch</p>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{stats.pendingOrders} items require packaging</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
                  <div className="stats-icon-wrapper success" style={{ width: '36px', height: '36px', borderRadius: '50%' }}><Check size={16} /></div>
                  <div style={{ textAlign: 'left' }}>
                    <p style={{ margin: 0, fontSize: '13px', fontWeight: '600' }}>Successful Deliveries</p>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{stats.deliveredOrders} items safely received</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className="stats-icon-wrapper info" style={{ width: '36px', height: '36px', borderRadius: '50%' }}><Package size={16} /></div>
                  <div style={{ textAlign: 'left' }}>
                    <p style={{ margin: 0, fontSize: '13px', fontWeight: '600' }}>Inventory Status</p>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{stats.lowStock} products approaching limit</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'products' && (
        <div className="listings-panel glass-card margin-top-25">
          <div className="panel-header">
            <h3>Inventory Listings ({products.length})</h3>
          </div>
          
          <div className="table-responsive margin-top-15">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Price</th>
                  <th>Stock Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>
                      No listed products found. Click 'Add New Product' to publish one.
                    </td>
                  </tr>
                ) : (
                  products.map(p => (
                    <tr key={p.id}>
                      <td>
                        <div className="product-table-item">
                          <img src={p.imageUrl} alt={p.name} className="table-img" />
                          <div>
                            <strong>{p.name}</strong>
                            <span className="table-sub">{p.brand || 'No Brand'} • {p.category?.name}</span>
                          </div>
                        </div>
                      </td>
                      <td><code>{p.sku}</code></td>
                      <td>₹{p.price.toLocaleString('en-IN')}</td>
                      <td>
                        <span className={`badge ${p.stockQuantity <= 0 ? 'badge-error' : (p.stockQuantity <= (p.lowStockThreshold || 5) ? 'badge-warning' : 'badge-success')}`}>
                          {p.stockQuantity} units
                        </span>
                      </td>
                      <td>
                        <button onClick={() => handleStockUpdate(p)} className="btn-table-action" title="Restock">
                          <Edit3 size={14} />
                          <span>Restock</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="listings-panel glass-card margin-top-25">
          <div className="panel-header" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>Incoming Product Orders ({filteredOrders.length})</h3>
            </div>

            {/* Filter Tabs & Search Row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '15px', flexWrap: 'wrap' }}>
              {/* Status Filters Strip */}
              <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '5px' }}>
                {['ALL', 'PENDING', 'CONFIRMED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'].map(status => (
                  <button
                    key={status}
                    onClick={() => setOrderStatusFilter(status)}
                    className={`category-opt-btn ${orderStatusFilter === status ? 'active' : ''}`}
                    style={{ padding: '6px 12px', fontSize: '11px', whiteSpace: 'nowrap', borderRadius: '4px' }}
                  >
                    {status.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>

              {/* Search Box */}
              <div className="filter-search-input" style={{ width: '280px', margin: 0 }}>
                <input 
                  type="text" 
                  placeholder="Search by ID or Customer..." 
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  style={{ width: '100%', paddingRight: '35px' }}
                />
                <Search size={16} className="search-icon-inside" />
              </div>
            </div>
          </div>

          {/* Orders Table */}
          <div className="table-responsive margin-top-15">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Order # / Customer</th>
                  <th>Order Date</th>
                  <th>Products Purchased</th>
                  <th>Seller Subtotal</th>
                  <th>Status Updates (Per Item)</th>
                </tr>
              </thead>
              <tbody>
                {currentOrders.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>
                      No incoming product orders match your search and filter criteria.
                    </td>
                  </tr>
                ) : (
                  currentOrders.map(order => {
                    const sellerItems = getSellerItems(order);
                    const sellerSubtotal = getSellerOrderTotal(order);

                    return (
                      <tr key={order.id}>
                        <td>
                          <div>
                            <strong>Order #{order.id}</strong>
                            <div className="table-sub flex-align-center gap-5" style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                              <User size={10} />
                              <span>{order.user?.firstName || order.user?.username} ({order.user?.email})</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="table-sub flex-align-center gap-5" style={{ fontSize: '12px' }}>
                            <Calendar size={12} />
                            <span>{new Date(order.orderDate).toLocaleDateString()}</span>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {sellerItems.map((item, idx) => (
                              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <img src={item.product?.imageUrl} alt={item.product?.name} style={{ width: '28px', height: '28px', borderRadius: '4px', objectFit: 'cover' }} />
                                <div style={{ textAlign: 'left' }}>
                                  <span style={{ fontSize: '13px', fontWeight: '500', display: 'block', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.product?.name}</span>
                                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>₹{item.price.toLocaleString('en-IN')} x {item.quantity}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td>
                          <strong style={{ color: 'var(--color-primary)' }}>₹{sellerSubtotal.toLocaleString('en-IN')}</strong>
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {sellerItems.map((item, idx) => {
                              const nextAvailableStatuses = getNextStatuses(item.status);
                              return (
                                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'space-between' }}>
                                  <span className={`badge ${
                                    item.status === 'DELIVERED' ? 'badge-success' : 
                                    (item.status === 'CANCELLED' ? 'badge-error' : 
                                    (item.status === 'PENDING' ? 'badge-primary' : 'badge-warning'))
                                  }`} style={{ textTransform: 'capitalize', fontSize: '11px', padding: '2px 8px' }}>
                                    {item.status.toLowerCase().replace(/_/g, ' ')}
                                  </span>

                                  {nextAvailableStatuses.length > 0 ? (
                                    <select 
                                      onChange={(e) => {
                                        if (e.target.value) {
                                          handleItemStatusUpdate(item.id, e.target.value);
                                          e.target.value = ''; // Reset select
                                        }
                                      }}
                                      className="table-dropdown form-input"
                                      style={{ width: '130px', padding: '4px', fontSize: '11px', height: '28px' }}
                                      defaultValue=""
                                    >
                                      <option value="" disabled>Shipment Transition</option>
                                      {nextAvailableStatuses.map(status => (
                                        <option key={status} value={status}>
                                          {status.replace(/_/g, ' ')}
                                        </option>
                                      ))}
                                    </select>
                                  ) : (
                                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Status Locked</span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalOrderPages > 1 && (
            <div className="pagination-wrapper flex-justify-between flex-align-center margin-top-20" style={{ padding: '0 10px' }}>
              <span className="text-secondary" style={{ fontSize: '13px' }}>
                Showing {indexOfFirstOrder + 1} to {Math.min(indexOfLastOrder, filteredOrders.length)} of {filteredOrders.length} orders
              </span>
              <div className="pagination-buttons" style={{ display: 'flex', gap: '8px' }}>
                <button 
                  onClick={() => setOrderCurrentPage(p => Math.max(1, p - 1))}
                  disabled={orderCurrentPage === 1}
                  className="qty-btn"
                  style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <ChevronLeft size={16} />
                </button>
                <button 
                  onClick={() => setOrderCurrentPage(p => Math.min(totalOrderPages, p + 1))}
                  disabled={orderCurrentPage === totalOrderPages}
                  className="qty-btn"
                  style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Product Modal Overlay */}
      {showAddForm && (
        <div className="modal-backdrop">
          <div className="modal-content glass-card animate-fade-in text-left">
            <div className="modal-header">
              <h3>Publish New Catalog Product</h3>
              <button className="modal-close-btn" onClick={() => setShowAddForm(false)}>X</button>
            </div>
            
            <form onSubmit={handleAddProduct} className="modal-form">
              <div className="form-group-full">
                <label>Product Title</label>
                <input 
                  type="text" 
                  value={newProduct.name}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                  className="form-input"
                  placeholder="Stealth Runners Ultimate"
                  required
                />
              </div>

              <div className="form-group-full margin-top-15">
                <label>Description</label>
                <textarea 
                  value={newProduct.description}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                  className="form-input"
                  placeholder="Hydrophobic premium training footwear..."
                  rows="3"
                />
              </div>

              <div className="form-grid-2 margin-top-15">
                <div className="form-group">
                  <label>Price (₹)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, price: e.target.value }))}
                    className="form-input"
                    placeholder="3499"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Initial Stock Units</label>
                  <input 
                    type="number" 
                    value={newProduct.stockQuantity}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, stockQuantity: e.target.value }))}
                    className="form-input"
                    placeholder="25"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>SKU Code</label>
                  <input 
                    type="text" 
                    value={newProduct.sku}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, sku: e.target.value }))}
                    className="form-input"
                    placeholder="ST-RN-BLK-01"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Brand Name</label>
                  <input 
                    type="text" 
                    value={newProduct.brand}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, brand: e.target.value }))}
                    className="form-input"
                    placeholder="Stealth"
                  />
                </div>
                <div className="form-group">
                  <label>Product Category</label>
                  <select 
                    value={newProduct.categoryId} 
                    onChange={(e) => setNewProduct(prev => ({ ...prev, categoryId: e.target.value }))}
                    className="sort-dropdown form-input"
                    required
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id.toString()}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button type="submit" className="btn-primary auth-submit-btn margin-top-25">
                Publish Product
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerDashboard;
