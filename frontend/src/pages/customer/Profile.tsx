import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { User, Shield, Phone, Mail, FileCheck } from 'lucide-react';

export const Profile: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      showToast('Name is required', 'danger');
      return;
    }

    setSubmitting(true);
    try {
      await updateProfile({ name, phone: phone || undefined });
      showToast('Profile updated successfully', 'success');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to update profile', 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="container section">
      <h1 style={{ fontSize: '2.5rem', marginBottom: '32px' }}>Your Profile</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px', alignItems: 'flex-start' }} className="profile-grid">
        
        {/* Left Side: General Profile Card */}
        <div className="card" style={{ padding: '32px' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={22} style={{ color: 'var(--primary)' }} /> Profile Information
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Role</p>
              <p style={{ fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                <Shield size={16} style={{ color: 'var(--primary)' }} /> {user.role}
              </p>
            </div>

            <div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Username</p>
              <p style={{ fontSize: '1rem', fontWeight: 600, marginTop: '4px' }}>
                <code>@{user.username}</code>
              </p>
            </div>

            <div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Email Address</p>
              <p style={{ fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                <Mail size={16} /> {user.email}
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Update Profile Form */}
        <div className="card" style={{ padding: '32px' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileCheck size={22} style={{ color: 'var(--primary)' }} /> Edit Details
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-control"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                className="form-control"
                placeholder="+1 (555) 000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={submitting}>
              {submitting ? 'Saving Changes...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
export default Profile;
