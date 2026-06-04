import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { ShoppingBag, Eye, ArrowRight, Info } from 'lucide-react';

interface Order {
  id: string;
  status: string;
  totalAmount: number;
  createdAt: string;
}

export const OrderHistory: React.FC = () => {
  const { showToast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders', {
        params: {
          limit: 20,
          offset: 0,
        },
      });
      setOrders(res.data.orders);
    } catch {
      showToast('Failed to load order history', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'badge-pending';
      case 'CONFIRMED':
        return 'badge-confirmed';
      case 'PREPARING':
        return 'badge-preparing';
      case 'READY':
        return 'badge-ready';
      case 'COMPLETED':
        return 'badge-completed';
      case 'CANCELLED':
        return 'badge-cancelled';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '60vh' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid var(--border-color)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      </div>
    );
  }

  return (
    <div className="container section">
      <h1 style={{ fontSize: '2.5rem', marginBottom: '32px' }}>Your Order History</h1>

      {orders.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--text-secondary)' }}>
          <ShoppingBag size={48} style={{ margin: '0 auto 16px', color: 'var(--text-muted)' }} />
          <h3>No Orders Placed Yet</h3>
          <p style={{ marginTop: '8px', marginBottom: '24px' }}>Once you place an order, it will appear here for tracking.</p>
          <Link to="/menu" className="btn btn-primary">Order Now</Link>
        </div>
      ) : (
        <div className="custom-table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Total Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <code style={{ fontWeight: 600 }}>{order.id.slice(0, 8)}</code>
                  </td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td style={{ fontWeight: 700, color: 'var(--primary)' }}>
                    ${Number(order.totalAmount).toFixed(2)}
                  </td>
                  <td>
                    <span className={`badge ${getStatusClass(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>
                    <Link
                      to={`/orders/${order.id}`}
                      className="btn btn-secondary btn-sm"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Eye size={14} /> Track Order
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
export default OrderHistory;
