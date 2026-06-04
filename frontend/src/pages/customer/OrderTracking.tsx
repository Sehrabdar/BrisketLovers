import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { ArrowLeft, Clock, ShoppingBag, MapPin, RefreshCw, XCircle } from 'lucide-react';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';
  totalAmount: number;
  items: OrderItem[];
  createdAt: string;
  userName: string;
  userEmail: string;
}

export const OrderTracking: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrder = async (showFeedback = false) => {
    if (showFeedback) setRefreshing(true);
    try {
      const res = await api.get(`/orders/${id}`);
      setOrder(res.data);
      if (showFeedback) showToast('Order status updated', 'success');
    } catch {
      showToast('Failed to load order details', 'danger');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '60vh' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid var(--border-color)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container section flex-center" style={{ minHeight: '60vh', flexDirection: 'column' }}>
        <h2 style={{ marginBottom: '12px' }}>Order Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>The order you are trying to track does not exist.</p>
        <Link to="/orders" className="btn btn-primary">My Orders</Link>
      </div>
    );
  }

  const getStatusIndex = (status: string) => {
    const sequence = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED'];
    return sequence.indexOf(status);
  };

  const steps = [
    { label: 'Pending', desc: 'Order placed' },
    { label: 'Confirmed', desc: 'Payment received' },
    { label: 'Preparing', desc: 'Smoking & cutting' },
    { label: 'Ready', desc: 'Ready for pickup' },
    { label: 'Completed', desc: 'Order received' },
  ];

  const currentStepIndex = getStatusIndex(order.status);

  return (
    <div className="container section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link to="/orders" style={{ color: 'var(--text-secondary)' }}><ArrowLeft size={20} /></Link>
          <h1 style={{ fontSize: '2rem' }}>Track Order #{order.id.slice(0, 8)}</h1>
        </div>
        <button
          onClick={() => fetchOrder(true)}
          className="btn btn-secondary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          disabled={refreshing}
        >
          <RefreshCw size={14} className={refreshing ? 'spin-icon' : ''} />
          {refreshing ? 'Updating...' : 'Refresh Status'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px', alignItems: 'flex-start' }}>
        
        {/* Progress Tracker Card */}
        <div className="card" style={{ padding: '32px' }}>
          {order.status === 'CANCELLED' ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--danger)', background: 'rgba(239,68,68,0.1)', padding: '20px', borderRadius: 'var(--radius-md)' }}>
              <XCircle size={32} />
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Order Cancelled</h3>
                <p style={{ fontSize: '0.9rem', opacity: 0.9 }}>This order has been cancelled by the restaurant team.</p>
              </div>
            </div>
          ) : (
            <div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '32px' }}>Progress status</h3>
              
              {/* Stepper tracker */}
              <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', flexWrap: 'wrap', gap: '24px' }} className="stepper-wrap">
                {steps.map((step, idx) => {
                  const isDone = idx <= currentStepIndex;
                  const isCurrent = idx === currentStepIndex;
                  
                  return (
                    <div key={step.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, minWidth: '100px', textAlign: 'center', zIndex: 2 }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: isDone ? 'var(--primary)' : 'var(--bg-tertiary)',
                        color: isDone ? '#fff' : 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        border: isCurrent ? '2px solid #fff' : '2px solid transparent',
                        boxShadow: isCurrent ? '0 0 12px var(--primary-glow)' : 'none',
                        transition: 'all 0.3s'
                      }}>
                        {idx + 1}
                      </div>
                      <strong style={{ fontSize: '0.9rem', marginTop: '12px', color: isDone ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                        {step.label}
                      </strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        {step.desc}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Order Details Details */}
        <div className="card" style={{ padding: '32px' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
            Items Ordered
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
            {order.items.map((item) => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>
                  {item.name} <strong style={{ color: 'var(--text-primary)' }}>x{item.quantity}</strong>
                </span>
                <span style={{ fontWeight: 500 }}>${(Number(item.price) * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginBottom: '24px', fontSize: '1.2rem' }}>
            <strong>Total Amount Paid</strong>
            <strong style={{ color: 'var(--primary)' }}>${Number(order.totalAmount).toFixed(2)}</strong>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '24px', flexWrap: 'wrap' }} className="metadata-grid">
            <div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={12} /> Ordered On
              </p>
              <p style={{ fontSize: '0.95rem', fontWeight: 500, marginTop: '4px' }}>
                {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>

            <div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShoppingBag size={12} /> Contact Details
              </p>
              <p style={{ fontSize: '0.95rem', fontWeight: 500, marginTop: '4px' }}>
                {order.userName} ({order.userEmail})
              </p>
            </div>
          </div>
        </div>

      </div>

      <style>{`
        .spin-icon {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
export default OrderTracking;
