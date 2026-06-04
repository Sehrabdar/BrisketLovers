import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { ShoppingCart, LogOut, User, Flame, FileText, ClipboardList, ShieldAlert, BarChart3 } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/" className="logo">
          <Flame size={28} />
          <span>Brisket</span>Lovers
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          {/* Public / Common Links */}
          <Link to="/" style={{ fontSize: '0.95rem', fontWeight: 500 }} className="nav-link">Home</Link>
          <Link to="/menu" style={{ fontSize: '0.95rem', fontWeight: 500 }} className="nav-link">Menu</Link>

          {/* Customer Specific Links */}
          {user && user.role === 'CUSTOMER' && (
            <>
              <Link to="/orders" style={{ fontSize: '0.95rem', fontWeight: 500 }} className="nav-link">My Orders</Link>
              <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.95rem' }} className="nav-link">
                <User size={18} />
                Profile
              </Link>
              <Link to="/cart" style={{ position: 'relative', display: 'flex', alignItems: 'center' }} className="nav-link">
                <ShoppingCart size={22} />
                {cart && cart.totalItems > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '-8px',
                    background: 'var(--primary)',
                    color: '#fff',
                    borderRadius: '50%',
                    width: '18px',
                    height: '18px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {cart.totalItems}
                  </span>
                )}
              </Link>
            </>
          )}

          {/* Staff Specific Links */}
          {user && user.role === 'STAFF' && (
            <>
              <Link to="/staff/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.95rem' }} className="nav-link">
                <ClipboardList size={18} />
                Staff Dashboard
              </Link>
            </>
          )}

          {/* Superadmin Specific Links */}
          {user && user.role === 'SUPERADMIN' && (
            <>
              <Link to="/admin/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.95rem' }} className="nav-link">
                <BarChart3 size={18} />
                Admin Dashboard
              </Link>
            </>
          )}

          {/* Authentication State */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', borderLeft: '1px solid var(--border-color)', paddingLeft: '16px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Hi, <strong style={{ color: 'var(--text-primary)' }}>{user.name.split(' ')[0]}</strong>
                {user.role !== 'CUSTOMER' && (
                  <span style={{
                    fontSize: '0.7rem',
                    background: 'rgba(255,255,255,0.08)',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    marginLeft: '6px',
                    verticalAlign: 'middle',
                    color: user.role === 'SUPERADMIN' ? 'var(--primary)' : 'var(--secondary)'
                  }}>{user.role}</span>
                )}
              </span>
              <button onClick={handleLogout} className="btn-icon" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--text-secondary)' }}>
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Link to="/login" className="btn btn-outline btn-sm">Log In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
            </div>
          )}
        </div>
      </div>
      <style>{`
        .nav-link {
          color: var(--text-secondary);
          transition: var(--transition-fast);
        }
        .nav-link:hover {
          color: var(--primary);
        }
        .btn-icon:hover {
          color: var(--danger) !important;
        }
      `}</style>
    </nav>
  );
};
