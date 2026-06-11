import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useToast } from '../../contexts/ToastContext';
import { api } from '../../services/api';
import { CreditCard, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';

export const Checkout: React.FC = () => {
  const { cart, clearCart } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [placingOrder, setPlacingOrder] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<any>(null);
  const [paying, setPaying] = useState(false);

  // Card details (for mock visual form)
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) {
      showToast('Delivery address is required', 'danger');
      return;
    }

    setPlacingOrder(true);
    try {
      const res = await api.post('/orders', {
        deliveryAddress: address,
        notes: notes || undefined,
      });
      setCreatedOrder(res.data);
      showToast('Order created! Please finalize payment.', 'success');
      // Clear local cart context
      await clearCart();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to place order', 'danger');
    } finally {
      setPlacingOrder(false);
    }
  };

  const handleSimulatePayment = async () => {
    if (!createdOrder) return;
    setPaying(true);
    try {
      // Calls the backend confirm-mock endpoint
      await api.post(`/payments/confirm-mock/${createdOrder.id}`);
      showToast('Payment successful! Order confirmed.', 'success');
      navigate(`/orders/${createdOrder.id}`);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Payment simulation failed', 'danger');
    } finally {
      setPaying(false);
    }
  };

  if (!cart || cart.items.length === 0) {
    if (createdOrder) {
      // Order placed, waiting for payment
      return (
        <div className="container section flex-center" style={{ minHeight: '60vh', flexDirection: 'column' }}>
          <div className="card" style={{ width: '100%', maxWidth: '520px', padding: '32px', textAlign: 'center' }}>
            <CheckCircle2 size={56} style={{ color: 'var(--success)', margin: '0 auto 20px' }} />
            <h2 style={{ fontSize: '1.75rem', marginBottom: '8px' }}>Order Placed!</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
              Order ID: <code>{createdOrder.id}</code>
            </p>
            
            <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: 'var(--radius-md)', textAlign: 'left', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Amount Due</span>
                <strong>${Number(createdOrder.totalAmount).toFixed(2)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Address</span>
                <span style={{ fontWeight: 500 }}>{address}</span>
              </div>
            </div>

            {/* Simulated Payment Form */}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '24px', textAlign: 'left' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CreditCard size={18} style={{ color: 'var(--primary)' }} />
                Simulate Card Payment
              </h3>
              
              <div className="form-group">
                <label className="form-label">Card Number</label>
                <input
                  type="text"
                  placeholder="4111 2222 3333 4444"
                  className="form-control"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="form-group">
                <div>
                  <label className="form-label">Expiry Date</label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    className="form-control"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                  />
                </div>
                <div>
                  <label className="form-label">CVC</label>
                  <input
                    type="text"
                    placeholder="123"
                    className="form-control"
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value)}
                  />
                </div>
              </div>

              <button
                onClick={handleSimulatePayment}
                className="btn btn-primary"
                style={{ width: '100%', padding: '16px' }}
                disabled={paying}
              >
                {paying ? 'Processing Mock Payment...' : 'Pay & Confirm Order'}
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="container section flex-center" style={{ minHeight: '60vh', flexDirection: 'column' }}>
        <h2 style={{ marginBottom: '12px' }}>Checkout is not available</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Please add some items to your cart first.</p>
        <Link to="/menu" className="btn btn-primary">Go to Menu</Link>
      </div>
    );
  }

  return (
    <div className="container section">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
        <Link to="/cart" style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}>
          <ArrowLeft size={20} />
        </Link>
        <h1 style={{ fontSize: '2.5rem' }}>Checkout</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px', alignItems: 'flex-start' }}>
        {/* Left Side: Delivery Form */}
        <div className="card" style={{ padding: '32px' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '24px' }}>Delivery Details</h2>
          
          <form onSubmit={handlePlaceOrder}>
            <div className="form-group">
              <label className="form-label">Delivery Address</label>
              <textarea
                rows={3}
                placeholder="Enter your complete street address, apartment number, and zip code"
                className="form-control"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              ></textarea>
            </div>

            <div className="form-group">
              <label className="form-label">Pitmaster Special Notes (Optional)</label>
              <textarea
                rows={2}
                placeholder="e.g. extra BBQ sauce, leave at gate, allergies"
                className="form-control"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              ></textarea>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              disabled={placingOrder}
            >
              {placingOrder ? 'Creating Order...' : 'Place Order & Proceed to Payment'}
              <ArrowRight size={18} />
            </button>
          </form>
        </div>

        {/* Right Side: Order Summary */}
        <div className="card" style={{ padding: '32px', background: 'var(--bg-secondary)' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
            Checkout Summary
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
            {cart.items.map((item) => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>
                  {item.name} <strong style={{ color: 'var(--text-primary)' }}>x{item.quantity}</strong>
                </span>
                <span style={{ fontWeight: 500 }}>${item.subtotal.toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '16px', fontSize: '1.2rem' }}>
            <strong>Grand Total</strong>
            <strong style={{ color: 'var(--primary)' }}>${cart.totalPrice.toFixed(2)}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Checkout;
