import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Flame } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please fill in all fields', 'danger');
      return;
    }

    setSubmitting(true);
    try {
      await login(email, password);
      showToast('Welcome back to BrisketLovers!', 'success');
      
      // Determine landing page from role
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const u = JSON.parse(storedUser);
        if (u.role === 'SUPERADMIN') {
          navigate('/admin/dashboard');
        } else if (u.role === 'STAFF') {
          navigate('/staff/dashboard');
        } else {
          navigate('/menu');
        }
      } else {
        navigate('/');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Login failed. Check your credentials.';
      showToast(msg, 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-center" style={{ minHeight: '80vh', padding: '40px 24px' }}>
      <div className="card" style={{ width: '100%', maxWidth: '420px', padding: '32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div className="flex-center" style={{ gap: '8px', color: 'var(--primary)', marginBottom: '12px' }}>
            <Flame size={40} />
          </div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '8px' }}>Welcome Back</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Log in to manage reservations, order food, and more
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-control"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '8px' }}
            disabled={submitting}
          >
            {submitting ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
};
export default Login;
