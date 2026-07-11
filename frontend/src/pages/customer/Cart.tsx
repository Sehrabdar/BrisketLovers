import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useToast } from '../../contexts/ToastContext';
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag } from 'lucide-react';

export const Cart: React.FC = () => {
  const { cart, updateQuantity, removeFromCart, clearCart, isLoading } = useCart();
  const { showToast } = useToast();

  const handleUpdateQuantity = async (itemId: string, currentQty: number, change: number, availableServings: number) => {
    const newQty = currentQty + change;
    if (newQty < 1) return;

    // Block increase if it would exceed what stock can support.
    if (change > 0 && availableServings !== -1 && newQty > availableServings) {
      showToast(`Only ${availableServings} serving(s) available in stock`, 'warning');
      return;
    }

    try {
      await updateQuantity(itemId, newQty);
    } catch {
      showToast('Failed to update quantity', 'danger');
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      await removeFromCart(itemId);
      showToast('Item removed from cart', 'success');
    } catch {
      showToast('Failed to remove item', 'danger');
    }
  };

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      try {
        await clearCart();
        showToast('Cart cleared', 'success');
      } catch {
        showToast('Failed to clear cart', 'danger');
      }
    }
  };

  const getFullImageUrl = (path?: string) => {
    if (!path) return 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400';
    if (path.startsWith('http')) return path;
    const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
    return `${base}${path}`;
  };

  if (isLoading && !cart) {
    return (
      <div className="flex-center" style={{ minHeight: '60vh' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid var(--border-color)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container section" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', minHeight: '60vh' }}>
        <div className="flex-center" style={{ width: '80px', height: '80px', background: 'var(--bg-secondary)', borderRadius: '50%', color: 'var(--text-muted)', marginBottom: '24px' }}>
          <ShoppingBag size={36} />
        </div>
        <h2 style={{ fontSize: '2rem', marginBottom: '12px' }}>Your Cart is Empty</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', marginBottom: '32px' }}>
          Looks like you haven't added anything to your cart yet. Head back to the menu to explore our smoked specialties.
        </p>
        <Link to="/menu" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <ArrowLeft size={18} /> View Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="container section">
      <h1 style={{ fontSize: '2.5rem', marginBottom: '32px' }}>Your Cart</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {cart.items.map((item) => (
            <div key={item.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '16px', flexWrap: 'wrap' }}>
              <img
                src={getFullImageUrl(item.imageUrl)}
                alt={item.name}
                style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: 'var(--radius-md)' }}
              />

              <div style={{ flexGrow: 1, minWidth: '200px' }}>
                <h3 style={{ fontSize: '1.15rem', marginBottom: '4px' }}>{item.name}</h3>
                <p style={{ color: 'var(--primary)', fontWeight: 700 }}>${item.price.toFixed(2)}</p>
              </div>

              {/* Quantity Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg-secondary)', padding: '6px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                <button
                  onClick={() => handleUpdateQuantity(item.id, item.quantity, -1, item.availableServings)}
                  style={{ cursor: 'pointer', color: item.quantity <= 1 ? 'var(--text-muted)' : 'var(--text-primary)' }}
                  disabled={item.quantity <= 1}
                >
                  <Minus size={16} />
                </button>
                <span style={{ minWidth: '24px', textAlign: 'center', fontWeight: 600 }}>{item.quantity}</span>
                <button
                  onClick={() => handleUpdateQuantity(item.id, item.quantity, 1, item.availableServings)}
                  disabled={item.availableServings !== -1 && item.quantity >= item.availableServings}
                  style={{
                    cursor: (item.availableServings !== -1 && item.quantity >= item.availableServings) ? 'not-allowed' : 'pointer',
                    color: (item.availableServings !== -1 && item.quantity >= item.availableServings) ? 'var(--text-muted)' : 'inherit',
                  }}
                >
                  <Plus size={16} />
                </button>
              </div>

              {/* Subtotal */}
              <div style={{ minWidth: '100px', textAlign: 'right' }}>
                <p style={{ fontSize: '1.15rem', fontWeight: 700 }}>${item.subtotal.toFixed(2)}</p>
              </div>

              {/* Remove Button */}
              <button
                onClick={() => handleRemoveItem(item.id)}
                style={{ color: 'var(--text-muted)', cursor: 'pointer' }}
                className="btn-icon"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}

          {/* Cart Options */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
            <Link to="/menu" style={{ color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <ArrowLeft size={16} /> Continue Ordering
            </Link>
            <button onClick={handleClearCart} className="btn btn-outline btn-sm" style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}>
              Clear Cart
            </button>
          </div>
        </div>

        {/* Cart Summary */}
        <div className="card" style={{ padding: '32px', background: 'var(--bg-secondary)', marginTop: '24px' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
            Order Summary
          </h2>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Total Items</span>
            <span style={{ fontWeight: 600 }}>{cart.totalItems}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', fontSize: '1.25rem', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
            <strong>Total Price</strong>
            <strong style={{ color: 'var(--primary)' }}>${cart.totalPrice.toFixed(2)}</strong>
          </div>

          <Link to="/checkout" className="btn btn-primary" style={{ width: '100%', padding: '16px' }}>
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </div>
  );
};
export default Cart;
