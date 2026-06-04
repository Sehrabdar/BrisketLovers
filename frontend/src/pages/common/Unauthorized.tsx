import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

export const Unauthorized: React.FC = () => {
  return (
    <div className="flex-center" style={{ minHeight: '80vh', flexDirection: 'column', textAlign: 'center', padding: '24px' }}>
      <ShieldAlert size={64} style={{ color: 'var(--danger)', marginBottom: '20px' }} />
      <h1 style={{ fontSize: '2.5rem', marginBottom: '12px' }}>Access Denied</h1>
      <p style={{ color: 'var(--text-secondary)', maxWidth: '480px', marginBottom: '32px' }}>
        You do not have the required permissions to view this page. If you believe this is an error, please contact your system administrator.
      </p>
      <div style={{ display: 'flex', gap: '16px' }}>
        <Link to="/" className="btn btn-primary">Go to Home</Link>
        <Link to="/login" className="btn btn-secondary">Sign In</Link>
      </div>
    </div>
  );
};
export default Unauthorized;
