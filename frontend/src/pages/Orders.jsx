import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Package, Clock, Truck, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { API_ORDERS_URL } from '../apiConfig';

const Orders = () => {
  const { getAuthHeaders } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch(API_ORDERS_URL, {
          headers: getAuthHeaders()
        });
        if (response.ok) {
          const data = await response.json();
          setOrders(data);
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'PENDING': return 'badge-warning';
      case 'SHIPPED': return 'badge-primary';
      case 'DELIVERED': return 'badge-success';
      case 'CANCELLED': return 'badge-error';
      default: return 'badge-secondary';
    }
  };

  const toggleExpandOrder = (orderId) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
    } else {
      setExpandedOrder(orderId);
    }
  };

  if (loading) {
    return (
      <div className="loader-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="orders-page container animate-fade-in">
      <div className="orders-header">
        <h1>Your Orders</h1>
        <p>Track delivery status and view order history in real time.</p>
      </div>

      {orders.length === 0 ? (
        <div className="empty-orders-view glass-card">
          <Package size={64} className="empty-orders-icon" />
          <h2>No Orders Found</h2>
          <p>You haven't placed any orders yet. Visit our shop to make your first purchase.</p>
        </div>
      ) : (
        <div className="orders-list-container">
          {orders.map((order) => {
            const isExpanded = expandedOrder === order.id;
            const status = order.status;

            return (
              <div key={order.id} className="order-panel glass-card">
                {/* Panel Header Summary */}
                <div className="order-panel-header" onClick={() => toggleExpandOrder(order.id)}>
                  <div className="order-info-summary">
                    <div>
                      <span className="order-panel-label">ORDER ID</span>
                      <span className="order-panel-val">#DF-{order.id}</span>
                    </div>
                    <div>
                      <span className="order-panel-label">DATE PLACED</span>
                      <span className="order-panel-val">{new Date(order.orderDate).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="order-panel-label">TOTAL AMOUNT</span>
                      <span className="order-panel-val glow-text">₹{order.totalAmount.toLocaleString('en-IN')}</span>
                    </div>
                    <div>
                      <span className="order-panel-label">STATUS</span>
                      <span className={`badge ${getStatusBadgeClass(status)}`}>{status}</span>
                    </div>
                  </div>
                  
                  <div className="order-panel-toggle">
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </div>

                {/* Progress Tracking Bar */}
                {status !== 'CANCELLED' && (
                  <div className="order-tracking-bar-wrapper">
                    <div className="tracking-steps-container">
                      <div className="tracking-step active">
                        <div className="step-icon-circle"><Clock size={16} /></div>
                        <span>Placed</span>
                      </div>
                      <div className={`tracking-line ${(status === 'SHIPPED' || status === 'DELIVERED') ? 'active' : ''}`}></div>
                      <div className={`tracking-step ${(status === 'SHIPPED' || status === 'DELIVERED') ? 'active' : ''}`}>
                        <div className="step-icon-circle"><Truck size={16} /></div>
                        <span>Shipped</span>
                      </div>
                      <div className={`tracking-line ${status === 'DELIVERED' ? 'active' : ''}`}></div>
                      <div className={`tracking-step ${status === 'DELIVERED' ? 'active' : ''}`}>
                        <div className="step-icon-circle"><CheckCircle2 size={16} /></div>
                        <span>Delivered</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="order-panel-details animate-fade-in">
                    <hr className="details-divider" />
                    
                    <div className="details-grid">
                      {/* Shipping info */}
                      <div className="details-shipping">
                        <h4>Shipping Address</h4>
                        <p>{order.shippingAddress}</p>
                        
                        <h4 className="margin-top-15">Payment Status</h4>
                        <span className={`badge ${order.paymentStatus === 'PAID' ? 'badge-success' : 'badge-warning'}`}>
                          {order.paymentStatus}
                        </span>
                        <span className="payment-method-label"> via {order.paymentMethod}</span>
                      </div>

                      {/* Items Ordered */}
                      <div className="details-items">
                        <h4>Items Ordered</h4>
                        <div className="ordered-items-list">
                          {order.items.map((item) => (
                            <div key={item.id} className="ordered-item-row">
                              <img src={item.product.imageUrl} alt={item.product.name} />
                              <div className="ordered-item-info">
                                <h5>{item.product.name}</h5>
                                <p>₹{item.price.toLocaleString('en-IN')} x {item.quantity}</p>
                              </div>
                              <span className="ordered-item-subtotal">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Orders;
