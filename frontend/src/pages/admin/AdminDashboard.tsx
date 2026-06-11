import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { BarChart3, Users, ChefHat, FileClock, UserX, UserCheck, Shield, PlusCircle } from 'lucide-react';

interface StaffUser {
  id: string;
  name: string;
  username: string;
  email: string;
  role: string;
  status: string;
}

interface AuditLog {
  id: string;
  menuItemId: string;
  action: string;
  previousData?: Record<string, any>;
  newData?: Record<string, any>;
  changedBy: string;
  changedByRole: string;
  timestamp: string;
}

interface Analytics {
  totalOrders: number;
  revenue: number;
  dailyOrders: { date: string; count: number }[];
  popularItems: { name: string; quantity: number }[];
  activeStaff: number;
}

export const AdminDashboard: React.FC = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'analytics' | 'staff' | 'menu' | 'audit'>('analytics');

  // Analytics State
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);

  // Staff Management State
  const [staff, setStaff] = useState<StaffUser[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(true);
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [creatingStaff, setCreatingStaff] = useState(false);

  // Menu Catalog State
  const [_menuItems, setMenuItems] = useState<any[]>([]);
  const [_loadingMenu, setLoadingMenu] = useState(true);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(true);

  const fetchAnalytics = async () => {
    setLoadingAnalytics(true);
    try {
      const res = await api.get('/analytics/dashboard');
      setAnalytics(res.data);
    } catch {
      showToast('Failed to load analytics', 'danger');
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const fetchStaff = async () => {
    setLoadingStaff(true);
    try {
      const res = await api.get('/users/staff');
      setStaff(res.data);
    } catch {
      showToast('Failed to load staff list', 'danger');
    } finally {
      setLoadingStaff(false);
    }
  };

  const fetchMenu = async () => {
    setLoadingMenu(true);
    try {
      const res = await api.get('/menu');
      setMenuItems(res.data.dishes);
    } catch {
      showToast('Failed to load menu items', 'danger');
    } finally {
      setLoadingMenu(false);
    }
  };

  const fetchAuditLogs = async () => {
    setLoadingAudit(true);
    try {
      const res = await api.get('/menu-audit-logs', { params: { limit: 50 } });
      setAuditLogs(res.data.logs);
    } catch {
      showToast('Failed to load audit logs', 'danger');
    } finally {
      setLoadingAudit(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'analytics') fetchAnalytics();
    if (activeTab === 'staff') fetchStaff();
    if (activeTab === 'menu') fetchMenu();
    if (activeTab === 'audit') fetchAuditLogs();
  }, [activeTab]);

  const handleToggleStaffStatus = async (staffId: string) => {
    try {
      const res = await api.patch(`/users/staff/${staffId}/toggle`);
      showToast(`Staff account status updated to ${res.data.status}`, 'success');
      fetchStaff();
    } catch {
      showToast('Failed to update staff status', 'danger');
    }
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffName || !staffEmail || !staffPassword) {
      showToast('All fields are required', 'danger');
      return;
    }

    setCreatingStaff(true);
    try {
      await api.post('/users/staff', {
        name: staffName,
        email: staffEmail,
        password: staffPassword,
      });
      showToast('Staff account created successfully', 'success');
      setShowAddStaffModal(false);
      setStaffName('');
      setStaffEmail('');
      setStaffPassword('');
      fetchStaff();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to create staff account', 'danger');
    } finally {
      setCreatingStaff(false);
    }
  };

  const renderAuditDiff = (log: AuditLog) => {
    if (log.action === 'CREATE') {
      return (
        <div>
          <span style={{ color: 'var(--success)' }}>Created item:</span>{' '}
          <code>{JSON.stringify(log.newData)}</code>
        </div>
      );
    }
    if (log.action === 'DELETE') {
      return (
        <div>
          <span style={{ color: 'var(--danger)' }}>Deleted item:</span>{' '}
          <code>{JSON.stringify(log.previousData)}</code>
        </div>
      );
    }
    
    // For update, find differences
    const prev = log.previousData || {};
    const curr = log.newData || {};
    const diffs: string[] = [];
    
    Object.keys(curr).forEach((key) => {
      if (JSON.stringify(prev[key]) !== JSON.stringify(curr[key])) {
        diffs.push(`${key}: ${JSON.stringify(prev[key])} → ${JSON.stringify(curr[key])}`);
      }
    });

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <strong>Updates:</strong>
        {diffs.map((d, i) => (
          <div key={i} style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.02)', padding: '4px 8px', borderRadius: '4px', borderLeft: '2px solid var(--primary)' }}>
            <code>{d}</code>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="container section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem' }}>Admin Control Center</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Superadmin controls, system logs, staff operations and metrics</p>
        </div>

        {/* Tab Controls */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`btn btn-sm ${activeTab === 'analytics' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <BarChart3 size={16} /> Analytics
          </button>
          <button
            onClick={() => setActiveTab('staff')}
            className={`btn btn-sm ${activeTab === 'staff' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <Users size={16} /> Staff Team
          </button>
          <button
            onClick={() => setActiveTab('menu')}
            className={`btn btn-sm ${activeTab === 'menu' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <ChefHat size={16} /> Menu Setup
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`btn btn-sm ${activeTab === 'audit' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <FileClock size={16} /> System Logs
          </button>
        </div>
      </div>

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div>
          {loadingAnalytics ? (
            <div className="flex-center" style={{ minHeight: '300px' }}>
              <div style={{ width: '40px', height: '40px', border: '4px solid var(--border-color)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            </div>
          ) : analytics && (
            <div>
              {/* Stats Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '40px' }}>
                <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total Orders Placed</span>
                  <strong style={{ fontSize: '2rem' }}>{analytics.totalOrders}</strong>
                </div>

                <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total Completed Revenue</span>
                  <strong style={{ fontSize: '2rem', color: 'var(--primary)' }}>${analytics.revenue.toFixed(2)}</strong>
                </div>

                <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Active Cooking Staff</span>
                  <strong style={{ fontSize: '2rem' }}>{analytics.activeStaff}</strong>
                </div>
              </div>

              {/* Graphical Charts (Mock Visual Representation using divs) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '32px' }}>
                {/* Popular Items Chart */}
                <div className="card" style={{ padding: '32px' }}>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '24px' }}>Top Ordered Specialties</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {analytics.popularItems.length === 0 ? (
                      <p style={{ color: 'var(--text-muted)' }}>No dishes ordered yet</p>
                    ) : (
                      analytics.popularItems.map((item) => (
                        <div key={item.name}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                            <span>{item.name}</span>
                            <strong>{item.quantity} orders</strong>
                          </div>
                          {/* Visual CSS Bar */}
                          <div style={{ height: '8px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                            <div style={{
                              height: '100%',
                              width: `${Math.min(100, (item.quantity / 50) * 100)}%`,
                              background: 'var(--primary)',
                              borderRadius: 'var(--radius-full)'
                            }}></div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Daily Order Activity */}
                <div className="card" style={{ padding: '32px' }}>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '24px' }}>Daily Activity log</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {analytics.dailyOrders.length === 0 ? (
                      <p style={{ color: 'var(--text-muted)' }}>No order logs registered</p>
                    ) : (
                      analytics.dailyOrders.map((metric) => (
                        <div key={metric.date} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', borderBottom: '1px solid rgba(255,255,255,0.02)', paddingBottom: '8px' }}>
                          <span>{metric.date}</span>
                          <strong style={{ color: 'var(--primary)' }}>{metric.count} checkouts</strong>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Staff Tab */}
      {activeTab === 'staff' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.5rem' }}>Staff Team Accounts</h2>
            <button onClick={() => setShowAddStaffModal(true)} className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <PlusCircle size={16} /> Create Staff Member
            </button>
          </div>

          {loadingStaff ? (
            <div className="flex-center" style={{ minHeight: '200px' }}>
              <div style={{ width: '40px', height: '40px', border: '4px solid var(--border-color)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            </div>
          ) : (
            <div className="custom-table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {staff.map((member) => (
                    <tr key={member.id}>
                      <td style={{ fontWeight: 600 }}>{member.name}</td>
                      <td><code>@{member.username}</code></td>
                      <td>{member.email}</td>
                      <td>
                        <span style={{ fontSize: '0.75rem', background: 'rgba(168, 85, 247, 0.15)', color: 'var(--secondary)', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                          {member.role}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${member.status === 'ACTIVE' ? 'badge-ready' : 'badge-cancelled'}`}>
                          {member.status}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => handleToggleStaffStatus(member.id)}
                          className={`btn btn-sm ${member.status === 'ACTIVE' ? 'btn-outline' : 'btn-primary'}`}
                          style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          {member.status === 'ACTIVE' ? (
                            <>
                              <UserX size={12} /> Disable
                            </>
                          ) : (
                            <>
                              <UserCheck size={12} /> Enable
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Menu setup redirects to standard catalog viewing */}
      {activeTab === 'menu' && (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <ChefHat size={48} style={{ color: 'var(--primary)', marginBottom: '16px' }} />
          <h3>Manage Dishes & Uploads</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px', marginBottom: '24px' }}>
            Menu creation and photo uploading endpoints are shared with Kitchen Staff.
          </p>
          <a href="/staff/dashboard" className="btn btn-primary">Go to Menu Management</a>
        </div>
      )}

      {/* System Audit Logs Tab */}
      {activeTab === 'audit' && (
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '24px' }}>System Change Logs</h2>
          {loadingAudit ? (
            <div className="flex-center" style={{ minHeight: '200px' }}>
              <div style={{ width: '40px', height: '40px', border: '4px solid var(--border-color)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            </div>
          ) : auditLogs.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No audit log registers recorded.</p>
          ) : (
            <div className="custom-table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>User</th>
                    <th>Action</th>
                    <th>Log Details</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log) => (
                    <tr key={log.id}>
                      <td style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 600 }}>{log.changedByRole}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {log.changedBy.slice(0, 8)}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${log.action === 'CREATE' ? 'badge-ready' : log.action === 'UPDATE' ? 'badge-confirmed' : 'badge-cancelled'}`}>
                          {log.action}
                        </span>
                      </td>
                      <td style={{ maxWidth: '400px', lineBreak: 'anywhere' }}>
                        {renderAuditDiff(log)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Create Staff Modal */}
      {showAddStaffModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '440px', padding: '32px' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={22} style={{ color: 'var(--primary)' }} /> Add Staff Account
            </h2>
            <form onSubmit={handleCreateStaff}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Master Chef Smith"
                  className="form-control"
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  placeholder="chef.smith@brisketlovers.com"
                  className="form-control"
                  value={staffEmail}
                  onChange={(e) => setStaffEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="form-control"
                  value={staffPassword}
                  onChange={(e) => setStaffPassword(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ width: '50%' }}
                  onClick={() => setShowAddStaffModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '50%' }}
                  disabled={creatingStaff}
                >
                  {creatingStaff ? 'Creating...' : 'Register Staff'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminDashboard;
