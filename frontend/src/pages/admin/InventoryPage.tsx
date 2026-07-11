import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { Plus, Edit, Trash2, TrendingDown, AlertTriangle, Package, RefreshCw, ChevronUp, ChevronDown } from 'lucide-react';

interface Ingredient {
  id: string;
  name: string;
  unit: string;
  currentStock: number;
  minimumThreshold: number;
  status: 'OK' | 'LOW' | 'OUT';
  availableServings: number;
  createdAt: string;
  updatedAt: string;
}

interface InventoryDashboard {
  totalIngredients: number;
  lowStockCount: number;
  outOfStockCount: number;
  lowStockItems: Ingredient[];
  outOfStockItems: Ingredient[];
}

const STATUS_COLORS: Record<string, { bg: string; color: string; label: string }> = {
  OK: { bg: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)', label: 'In Stock' },
  LOW: { bg: 'rgba(245, 158, 11, 0.15)', color: 'var(--warning)', label: 'Low Stock' },
  OUT: { bg: 'rgba(239, 68, 68, 0.15)', color: 'var(--danger)', label: 'Out of Stock' },
};

const Spinner = () => (
  <div style={{ width: 36, height: 36, border: '4px solid var(--border-color)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
);

interface IngredientModalProps {
  mode: 'create' | 'edit';
  initial?: Partial<Ingredient>;
  onClose: () => void;
  onSave: () => void;
}

const IngredientModal: React.FC<IngredientModalProps> = ({ mode, initial, onClose, onSave }) => {
  const { showToast } = useToast();
  const [name, setName] = useState(initial?.name ?? '');
  const [unit, setUnit] = useState(initial?.unit ?? '');
  const [stock, setStock] = useState(String(initial?.currentStock ?? 0));
  const [threshold, setThreshold] = useState(String(initial?.minimumThreshold ?? 0));
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !unit.trim()) {
      showToast('Name and unit are required', 'danger');
      return;
    }
    setSaving(true);
    try {
      if (mode === 'create') {
        await api.post('/inventory', { name, unit, currentStock: Number(stock), minimumThreshold: Number(threshold) });
        showToast('Ingredient created successfully', 'success');
      } else {
        await api.patch(`/inventory/${initial!.id}`, { name, unit, minimumThreshold: Number(threshold) });
        showToast('Ingredient updated successfully', 'success');
      }
      onSave();
      onClose();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to save ingredient', 'danger');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
      <div className="card" style={{ width: '100%', maxWidth: '440px', padding: '32px' }}>
        <h2 style={{ fontSize: '1.4rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Package size={20} style={{ color: 'var(--primary)' }} />
          {mode === 'create' ? 'Add New Ingredient' : 'Edit Ingredient'}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Ingredient Name</label>
            <input className="form-control" placeholder="e.g. Burger Bun" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Unit</label>
            <input className="form-control" placeholder="e.g. pcs, g, ml, kg" value={unit} onChange={(e) => setUnit(e.target.value)} required />
          </div>
          {mode === 'create' && (
            <div className="form-group">
              <label className="form-label">Initial Stock</label>
              <input type="number" min="0" step="0.001" className="form-control" value={stock} onChange={(e) => setStock(e.target.value)} />
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Minimum Threshold (Low Stock Alert)</label>
            <input type="number" min="0" step="0.001" className="form-control" value={threshold} onChange={(e) => setThreshold(e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <button type="button" className="btn btn-secondary" style={{ width: '50%' }} onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ width: '50%' }} disabled={saving}>
              {saving ? 'Saving...' : mode === 'create' ? 'Add Ingredient' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface StockAdjustModalProps {
  ingredient: Ingredient;
  onClose: () => void;
  onSave: () => void;
}

const StockAdjustModal: React.FC<StockAdjustModalProps> = ({ ingredient, onClose, onSave }) => {
  const { showToast } = useToast();
  const [delta, setDelta] = useState('');
  const [note, setNote] = useState('');
  const [direction, setDirection] = useState<'add' | 'subtract'>('add');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(delta);
    if (!amount || amount <= 0) {
      showToast('Enter a positive amount', 'danger');
      return;
    }
    setSaving(true);
    try {
      await api.patch(`/inventory/${ingredient.id}/stock`, {
        delta: direction === 'add' ? amount : -amount,
        note: note || undefined,
      });
      showToast(`Stock ${direction === 'add' ? 'added' : 'deducted'} successfully`, 'success');
      onSave();
      onClose();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to adjust stock', 'danger');
    } finally {
      setSaving(false);
    }
  };

  const preview = direction === 'add'
    ? ingredient.currentStock + Number(delta || 0)
    : Math.max(0, ingredient.currentStock - Number(delta || 0));

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
      <div className="card" style={{ width: '100%', maxWidth: '420px', padding: '32px' }}>
        <h2 style={{ fontSize: '1.4rem', marginBottom: '6px' }}>Adjust Stock</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px' }}>
          {ingredient.name} — Current: <strong style={{ color: 'var(--text-primary)' }}>{ingredient.currentStock} {ingredient.unit}</strong>
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
            <button type="button" onClick={() => setDirection('add')}
              className={`btn btn-sm ${direction === 'add' ? 'btn-primary' : 'btn-secondary'}`} style={{ flex: 1, gap: '6px' }}>
              <ChevronUp size={14} /> Add Stock
            </button>
            <button type="button" onClick={() => setDirection('subtract')}
              className={`btn btn-sm ${direction === 'subtract' ? 'btn-danger' : 'btn-secondary'}`} style={{ flex: 1, gap: '6px' }}>
              <ChevronDown size={14} /> Remove Stock
            </button>
          </div>

          <div className="form-group">
            <label className="form-label">Amount ({ingredient.unit})</label>
            <input type="number" min="0.001" step="0.001" className="form-control" placeholder="0" value={delta} onChange={(e) => setDelta(e.target.value)} required />
          </div>

          {delta && (
            <div style={{ padding: '12px 16px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', marginBottom: '16px', fontSize: '0.875rem' }}>
              New stock: <strong style={{ color: direction === 'add' ? 'var(--success)' : 'var(--warning)' }}>{preview.toFixed(3)} {ingredient.unit}</strong>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Note (Optional)</label>
            <input className="form-control" placeholder="e.g. Delivery received" value={note} onChange={(e) => setNote(e.target.value)} />
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <button type="button" className="btn btn-secondary" style={{ width: '50%' }} onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ width: '50%' }} disabled={saving}>
              {saving ? 'Saving...' : 'Confirm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const InventoryPage: React.FC = () => {
  const { showToast } = useToast();
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [dashboard, setDashboard] = useState<InventoryDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Ingredient | null>(null);
  const [stockTarget, setStockTarget] = useState<Ingredient | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [listRes, dashRes] = await Promise.all([
        api.get('/inventory'),
        api.get('/inventory/dashboard'),
      ]);
      setIngredients(listRes.data);
      setDashboard(dashRes.data);
    } catch {
      showToast('Failed to load inventory data', 'danger');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async (ingredient: Ingredient) => {
    if (!window.confirm(`Delete "${ingredient.name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/inventory/${ingredient.id}`);
      showToast('Ingredient deleted', 'success');
      fetchData();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to delete ingredient', 'danger');
    }
  };

  const getBarWidth = (ingredient: Ingredient) => {
    const threshold = ingredient.minimumThreshold;
    if (threshold <= 0) return ingredient.currentStock > 0 ? 100 : 0;
    const ratio = ingredient.currentStock / (threshold * 3);
    return Math.min(100, Math.round(ratio * 100));
  };

  const getBarColor = (status: string) => {
    if (status === 'OUT') return 'var(--danger)';
    if (status === 'LOW') return 'var(--warning)';
    return 'var(--success)';
  };

  return (
    <div>
      {dashboard && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              <Package size={16} /> Total Ingredients
            </div>
            <strong style={{ fontSize: '2rem' }}>{dashboard.totalIngredients}</strong>
          </div>
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderColor: dashboard.lowStockCount > 0 ? 'rgba(245, 158, 11, 0.3)' : 'var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--warning)', fontSize: '0.85rem' }}>
              <AlertTriangle size={16} /> Low Stock
            </div>
            <strong style={{ fontSize: '2rem', color: dashboard.lowStockCount > 0 ? 'var(--warning)' : 'var(--text-primary)' }}>{dashboard.lowStockCount}</strong>
          </div>
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderColor: dashboard.outOfStockCount > 0 ? 'rgba(239, 68, 68, 0.3)' : 'var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--danger)', fontSize: '0.85rem' }}>
              <TrendingDown size={16} /> Out of Stock
            </div>
            <strong style={{ fontSize: '2rem', color: dashboard.outOfStockCount > 0 ? 'var(--danger)' : 'var(--text-primary)' }}>{dashboard.outOfStockCount}</strong>
          </div>
        </div>
      )}

      {dashboard && (dashboard.lowStockItems.length > 0 || dashboard.outOfStockItems.length > 0) && (
        <div style={{ marginBottom: '32px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {dashboard.outOfStockItems.map((item) => (
            <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 18px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: 'var(--radius-md)', fontSize: '0.9rem' }}>
              <AlertTriangle size={16} style={{ color: 'var(--danger)', flexShrink: 0 }} />
              <span><strong style={{ color: 'var(--danger)' }}>Out of Stock:</strong> {item.name} — 0 {item.unit} remaining. Affected dishes are now marked unavailable.</span>
            </div>
          ))}
          {dashboard.lowStockItems.map((item) => (
            <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 18px', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: 'var(--radius-md)', fontSize: '0.9rem' }}>
              <AlertTriangle size={16} style={{ color: 'var(--warning)', flexShrink: 0 }} />
              <span><strong style={{ color: 'var(--warning)' }}>Low Stock:</strong> {item.name} — only <strong>{item.currentStock} {item.unit}</strong> remaining (threshold: {item.minimumThreshold} {item.unit})</span>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '1.4rem' }}>Ingredients Stock</h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={fetchData} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <RefreshCw size={14} /> Refresh
          </button>
          <button onClick={() => setShowCreateModal(true)} className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Plus size={14} /> Add Ingredient
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex-center" style={{ minHeight: '200px' }}><Spinner /></div>
      ) : ingredients.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-secondary)' }}>
          <Package size={40} style={{ margin: '0 auto 16px', color: 'var(--text-muted)' }} />
          <h3>No Ingredients Yet</h3>
          <p style={{ marginTop: '8px', marginBottom: '24px' }}>Add your first ingredient to start managing inventory.</p>
          <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">Add First Ingredient</button>
        </div>
      ) : (
        <div className="custom-table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Ingredient</th>
                <th>Unit</th>
                <th>Current Stock</th>
                <th>Threshold</th>
                <th>Status</th>
                <th style={{ minWidth: '160px' }}>Stock Level</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {ingredients.map((ing) => {
                const s = STATUS_COLORS[ing.status];
                const barWidth = getBarWidth(ing);
                return (
                  <tr key={ing.id}>
                    <td style={{ fontWeight: 600 }}>{ing.name}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{ing.unit}</td>
                    <td style={{ fontWeight: 700, color: ing.status === 'OUT' ? 'var(--danger)' : ing.status === 'LOW' ? 'var(--warning)' : 'var(--success)' }}>
                      {ing.currentStock}
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{ing.minimumThreshold}</td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 10px', background: s.bg, color: s.color, borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {s.label}
                      </span>
                    </td>
                    <td>
                      <div style={{ height: '8px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-full)', overflow: 'hidden', minWidth: '120px' }}>
                        <div style={{ height: '100%', width: `${barWidth}%`, background: getBarColor(ing.status), borderRadius: 'var(--radius-full)', transition: 'width 0.4s ease' }} />
                      </div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>{barWidth}%</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        <button onClick={() => setStockTarget(ing)} className="btn btn-secondary btn-sm"
                          style={{ padding: '5px 10px', fontSize: '0.78rem' }}>
                          Stock
                        </button>
                        <button onClick={() => setEditTarget(ing)} className="btn btn-secondary btn-sm"
                          style={{ padding: '5px 10px', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Edit size={11} />
                        </button>
                        <button onClick={() => handleDelete(ing)} className="btn btn-outline btn-sm"
                          style={{ padding: '5px 10px', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '4px', borderColor: 'var(--danger)', color: 'var(--danger)' }}>
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showCreateModal && (
        <IngredientModal mode="create" onClose={() => setShowCreateModal(false)} onSave={fetchData} />
      )}
      {editTarget && (
        <IngredientModal mode="edit" initial={editTarget} onClose={() => setEditTarget(null)} onSave={fetchData} />
      )}
      {stockTarget && (
        <StockAdjustModal ingredient={stockTarget} onClose={() => setStockTarget(null)} onSave={fetchData} />
      )}
    </div>
  );
};

export default InventoryPage;
