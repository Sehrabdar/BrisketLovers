import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Flame } from 'lucide-react';

export const Register: React.FC = () => {
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !password) {
      showToast('Name, email and password are required', 'danger');
      return;
    }

    if (password !== confirmPassword) {
      showToast('Passwords do not match', 'danger');
      return;
    }

    setSubmitting(true);
    try {
      await register(name, email, password, phone || undefined);
      showToast('Account created successfully! Welcome to BrisketLovers.', 'success');
      navigate('/menu');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Registration failed. Try again.';
      showToast(msg, 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-center" style={{ minHeight: '80vh', padding: '40px 24px' }}>
      <div className="card" style={{ width: '100%', maxWidth: '460px', padding: '32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div className="flex-center" style={{ gap: '8px', color: 'var(--primary)', marginBottom: '12px' }}>
            <Flame size={40} />
          </div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '8px' }}>Create an Account</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Join BrisketLovers and start ordering delicious BBQ
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-control"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

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
            <label className="form-label">Phone Number (Optional)</label>
            <input
              type="tel"
              className="form-control"
              placeholder="+1 (555) 000-0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
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

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '12px' }}
            disabled={submitting}
          >
            {submitting ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
};
export default Register;
