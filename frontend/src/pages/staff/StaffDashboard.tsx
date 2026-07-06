import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { ClipboardList, ChefHat, ToggleLeft, ToggleRight, Upload, Plus, AlertCircle, RefreshCw, Edit, Trash2 } from 'lucide-react';

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
}

interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  available: boolean;
  imageUrl?: string;
  description?: string;
}

export const StaffDashboard: React.FC = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'orders' | 'menu'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingMenu, setLoadingMenu] = useState(true);

  // Modal / Form States for adding new menu item
  const [showAddMenuModal, setShowAddMenuModal] = useState(false);
  const [newDishName, setNewDishName] = useState('');
  const [newDishPrice, setNewDishPrice] = useState('');
  const [newDishCategory, setNewDishCategory] = useState('main_course');
  const [newDishDesc, setNewDishDesc] = useState('');
  const [addingDish, setAddingDish] = useState(false);

  // Modal / Form States for editing menu item
  const [showEditMenuModal, setShowEditMenuModal] = useState(false);
  const [editingDishId, setEditingDishId] = useState<string | null>(null);
  const [editDishName, setEditDishName] = useState('');
  const [editDishPrice, setEditDishPrice] = useState('');
  const [editDishCategory, setEditDishCategory] = useState('main_course');
  const [editDishDesc, setEditDishDesc] = useState('');
  const [updatingDish, setUpdatingDish] = useState(false);

  // File Upload State
  const [_selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingForId, setUploadingForId] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await api.get('/orders');
      setOrders(res.data.orders);
    } catch {
      showToast('Failed to load orders queue', 'danger');
    } finally {
      setLoadingOrders(false);
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

  useEffect(() => {
    if (activeTab === 'orders') fetchOrders();
    if (activeTab === 'menu') fetchMenu();
  }, [activeTab]);

  const handleUpdateStatus = async (orderId: string, targetStatus: string) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: targetStatus });
      showToast(`Order status updated to ${targetStatus}`, 'success');
      fetchOrders();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to update order status', 'danger');
    }
  };

  const handleToggleAvailable = async (dishId: string) => {
    try {
      await api.patch(`/menu/${dishId}/toggle`);
      showToast('Item availability updated', 'success');
      fetchMenu();
    } catch {
      showToast('Failed to toggle availability', 'danger');
    }
  };

  const handleCreateDish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDishName || !newDishPrice) {
      showToast('Name and price are required', 'danger');
      return;
    }

    setAddingDish(true);
    try {
      await api.post('/menu', {
        name: newDishName,
        price: Number(newDishPrice),
        category: newDishCategory,
        description: newDishDesc || undefined,
      });
      showToast('Menu item added successfully', 'success');
      setShowAddMenuModal(false);
      setNewDishName('');
      setNewDishPrice('');
      setNewDishDesc('');
      fetchMenu();
    } catch {
      showToast('Failed to create menu item', 'danger');
    } finally {
      setAddingDish(false);
    }
  };

  const handleEditClick = (dish: MenuItem) => {
    setEditingDishId(dish.id);
    setEditDishName(dish.name);
    setEditDishPrice(String(dish.price));
    setEditDishCategory(dish.category);
    setEditDishDesc(dish.description || '');
    setShowEditMenuModal(true);
  };

  const handleUpdateDish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDishId || !editDishName || !editDishPrice) {
      showToast('Name and price are required', 'danger');
      return;
    }

    setUpdatingDish(true);
    try {
      await api.patch(`/menu/${editingDishId}`, {
        name: editDishName,
        price: Number(editDishPrice),
        category: editDishCategory,
        description: editDishDesc || null,
      });
      showToast('Menu item updated successfully', 'success');
      setShowEditMenuModal(false);
      fetchMenu();
    } catch {
      showToast('Failed to update menu item', 'danger');
    } finally {
      setUpdatingDish(false);
    }
  };

  const handleDeleteClick = async (dishId: string) => {
    if (window.confirm('Are you sure you want to delete this menu item?')) {
      try {
        await api.delete(`/menu/${dishId}`);
        showToast('Menu item deleted successfully', 'success');
        fetchMenu();
      } catch {
        showToast('Failed to delete menu item', 'danger');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, dishId: string) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setUploadingForId(dishId);
      handleImageUpload(file, dishId);
    }
  };

  const handleImageUpload = async (file: File, dishId: string) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      await api.post(`/menu/${dishId}/image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      showToast('Menu item image uploaded successfully', 'success');
      fetchMenu();
    } catch {
      showToast('Failed to upload image', 'danger');
    } finally {
      setSelectedFile(null);
      setUploadingForId(null);
    }
  };

  const getStatusActionText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return { text: 'Confirm Order', next: 'CONFIRMED' };
      case 'CONFIRMED':
        return { text: 'Start Preparing', next: 'PREPARING' };
      case 'PREPARING':
        return { text: 'Mark Ready', next: 'READY' };
      case 'READY':
        return { text: 'Complete Order', next: 'COMPLETED' };
      default:
        return null;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'PENDING': return 'badge-pending';
      case 'CONFIRMED': return 'badge-confirmed';
      case 'PREPARING': return 'badge-preparing';
      case 'READY': return 'badge-ready';
      case 'COMPLETED': return 'badge-completed';
      default: return 'badge-cancelled';
    }
  };

  return (
    <div className="container section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem' }}>Staff Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage live orders and menu availability</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setActiveTab('orders')}
            className={`btn btn-sm ${activeTab === 'orders' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <ClipboardList size={16} /> Active Orders
          </button>
          <button
            onClick={() => setActiveTab('menu')}
            className={`btn btn-sm ${activeTab === 'menu' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <ChefHat size={16} /> Menu Management
          </button>
        </div>
      </div>

      {activeTab === 'orders' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.5rem' }}>Live Order Queue</h2>
            <button onClick={fetchOrders} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <RefreshCw size={14} /> Refresh
            </button>
          </div>

          {loadingOrders ? (
            <div className="flex-center" style={{ minHeight: '200px' }}>
              <div style={{ width: '40px', height: '40px', border: '4px solid var(--border-color)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            </div>
          ) : orders.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '40px 24px', color: 'var(--text-secondary)' }}>
              <AlertCircle size={36} style={{ margin: '0 auto 12px', color: 'var(--text-muted)' }} />
              <h3>No Orders in Queue</h3>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {orders.map((order) => {
                const action = getStatusActionText(order.status);
                return (
                  <div key={order.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '24px', flexWrap: 'wrap', gap: '24px' }}>
                    <div style={{ flexGrow: 1, minWidth: '280px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <code style={{ fontSize: '1rem', fontWeight: 700 }}>#{order.id.slice(0, 8)}</code>
                        <span className={`badge ${getStatusClass(order.status)}`}>{order.status}</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {new Date(order.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                      
                      <p style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '8px' }}>
                        Customer: <strong style={{ color: 'var(--text-primary)' }}>{order.userName}</strong>
                      </p>

                      <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                        {order.items.map((i) => (
                          <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                            <span>{i.name} <strong>x{i.quantity}</strong></span>
                            <span>${(Number(i.price) * i.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '160px', alignItems: 'flex-end' }}>
                      <p style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '8px' }}>
                        ${Number(order.totalAmount).toFixed(2)}
                      </p>
                      
                      {action && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, action.next)}
                          className="btn btn-primary btn-sm"
                          style={{ width: '100%' }}
                        >
                          {action.text}
                        </button>
                      )}
                      
                      {order.status !== 'COMPLETED' && order.status !== 'CANCELLED' && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'CANCELLED')}
                          className="btn btn-outline btn-sm"
                          style={{ width: '100%', borderColor: 'var(--danger)', color: 'var(--danger)' }}
                        >
                          Cancel Order
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'menu' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.5rem' }}>Menu Catalog</h2>
            <button onClick={() => setShowAddMenuModal(true)} className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={16} /> Add Menu Item
            </button>
          </div>

          {loadingMenu ? (
            <div className="flex-center" style={{ minHeight: '200px' }}>
              <div style={{ width: '40px', height: '40px', border: '4px solid var(--border-color)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            </div>
          ) : (
            <div className="custom-table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Availability</th>
                    <th>Image Upload</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {menuItems.map((dish) => (
                    <tr key={dish.id}>
                      <td style={{ fontWeight: 600 }}>{dish.name}</td>
                      <td>{dish.category.replace('_', ' ')}</td>
                      <td style={{ fontWeight: 700, color: 'var(--primary)' }}>${Number(dish.price).toFixed(2)}</td>
                      <td>
                        <button
                          onClick={() => handleToggleAvailable(dish.id)}
                          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                          {dish.available ? (
                            <ToggleRight size={28} style={{ color: 'var(--success)' }} />
                          ) : (
                            <ToggleLeft size={28} style={{ color: 'var(--text-muted)' }} />
                          )}
                          <span style={{ fontSize: '0.85rem' }}>{dish.available ? 'In Stock' : 'Out of Stock'}</span>
                        </button>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <label
                            htmlFor={`file-upload-${dish.id}`}
                            className="btn btn-secondary btn-sm"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', margin: 0, padding: '6px 12px', fontSize: '0.8rem', cursor: 'pointer' }}
                          >
                            <Upload size={12} />
                            {uploadingForId === dish.id ? 'Uploading...' : 'Choose File'}
                          </label>
                          <input
                            id={`file-upload-${dish.id}`}
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={(e) => handleFileChange(e, dish.id)}
                          />
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => handleEditClick(dish)}
                            className="btn btn-secondary btn-sm"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 12px', fontSize: '0.8rem' }}
                          >
                            <Edit size={12} /> Edit
                          </button>
                          <button
                            onClick={() => handleDeleteClick(dish.id)}
                            className="btn btn-outline btn-sm"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 12px', fontSize: '0.8rem', borderColor: 'var(--danger)', color: 'var(--danger)' }}
                          >
                            <Trash2 size={12} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Add Menu Item Modal Dialog */}
      {showAddMenuModal && (
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
          <div className="card" style={{ width: '100%', maxWidth: '440px', padding: '32px', position: 'relative' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '24px' }}>Add Menu Item</h2>
            <form onSubmit={handleCreateDish}>
              <div className="form-group">
                <label className="form-label">Item Name</label>
                <input
                  type="text"
                  placeholder="e.g. Smoky Beef Ribs"
                  className="form-control"
                  value={newDishName}
                  onChange={(e) => setNewDishName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="24.99"
                  className="form-control"
                  value={newDishPrice}
                  onChange={(e) => setNewDishPrice(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-control form-select"
                  value={newDishCategory}
                  onChange={(e) => setNewDishCategory(e.target.value)}
                >
                  <option value="starter">Starter</option>
                  <option value="main_course">Main Course</option>
                  <option value="dessert">Dessert</option>
                  <option value="beverage">Beverage</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Description (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Details of spices, weight, preparation..."
                  className="form-control"
                  value={newDishDesc}
                  onChange={(e) => setNewDishDesc(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ width: '50%' }}
                  onClick={() => setShowAddMenuModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '50%' }}
                  disabled={addingDish}
                >
                  {addingDish ? 'Saving...' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Menu Item Modal Dialog */}
      {showEditMenuModal && (
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
          <div className="card" style={{ width: '100%', maxWidth: '440px', padding: '32px', position: 'relative' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '24px' }}>Edit Menu Item</h2>
            <form onSubmit={handleUpdateDish}>
              <div className="form-group">
                <label className="form-label">Item Name</label>
                <input
                  type="text"
                  placeholder="e.g. Smoky Beef Ribs"
                  className="form-control"
                  value={editDishName}
                  onChange={(e) => setEditDishName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="24.99"
                  className="form-control"
                  value={editDishPrice}
                  onChange={(e) => setEditDishPrice(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-control form-select"
                  value={editDishCategory}
                  onChange={(e) => setEditDishCategory(e.target.value)}
                >
                  <option value="starter">Starter</option>
                  <option value="main_course">Main Course</option>
                  <option value="dessert">Dessert</option>
                  <option value="beverage">Beverage</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Description (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Details of spices, weight, preparation..."
                  className="form-control"
                  value={editDishDesc}
                  onChange={(e) => setEditDishDesc(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ width: '50%' }}
                  onClick={() => setShowEditMenuModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '50%' }}
                  disabled={updatingDish}
                >
                  {updatingDish ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default StaffDashboard;
