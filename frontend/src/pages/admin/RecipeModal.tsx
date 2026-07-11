import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { Plus, Trash2, BookOpen, ChefHat } from 'lucide-react';

interface Ingredient {
  id: string;
  name: string;
  unit: string;
  currentStock: number;
}

interface RecipeIngredient {
  id: string;
  ingredientId: string;
  ingredientName: string;
  unit: string;
  quantityRequired: number;
  currentStock: number;
}

interface Recipe {
  menuItemId: string;
  menuItemName: string;
  ingredients: RecipeIngredient[];
  availableServings: number;
}

interface RecipeModalProps {
  menuItemId: string;
  menuItemName: string;
  onClose: () => void;
  onSave?: () => void;
}

export const RecipeModal: React.FC<RecipeModalProps> = ({ menuItemId, menuItemName, onClose, onSave }) => {
  const { showToast } = useToast();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [allIngredients, setAllIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [rows, setRows] = useState<{ ingredientId: string; quantityRequired: string }[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [recipeRes, ingredientsRes] = await Promise.all([
        api.get(`/recipes/${menuItemId}`),
        api.get('/inventory'),
      ]);
      setRecipe(recipeRes.data);
      setAllIngredients(ingredientsRes.data);
      setRows(
        (recipeRes.data.ingredients as RecipeIngredient[]).map((ri) => ({
          ingredientId: ri.ingredientId,
          quantityRequired: String(ri.quantityRequired),
        })),
      );
    } catch {
      showToast('Failed to load recipe data', 'danger');
    } finally {
      setLoading(false);
    }
  }, [menuItemId, showToast]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const addRow = () => {
    setRows((prev) => [...prev, { ingredientId: '', quantityRequired: '1' }]);
  };

  const removeRow = (index: number) => {
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  const updateRow = (index: number, field: 'ingredientId' | 'quantityRequired', value: string) => {
    setRows((prev) => prev.map((r, i) => i === index ? { ...r, [field]: value } : r));
  };

  const handleSave = async () => {
    const validRows = rows.filter((r) => r.ingredientId && Number(r.quantityRequired) > 0);

    if (validRows.length === 0) {
      // Remove recipe if all ingredients are cleared.
      if (rows.length === 0 || window.confirm('Saving with no ingredients will remove this recipe. Continue?')) {
        try {
          setSaving(true);
          await api.delete(`/recipes/${menuItemId}`);
          showToast('Recipe cleared — availability now manually managed', 'success');
          onSave?.();
          onClose();
        } catch (err: any) {
          showToast(err.response?.data?.message || 'Failed to clear recipe', 'danger');
        } finally {
          setSaving(false);
        }
      }
      return;
    }

    if (validRows.length !== rows.length) {
      showToast('Remove incomplete rows (missing ingredient or quantity) before saving', 'danger');
      return;
    }

    setSaving(true);
    try {
      await api.put(`/recipes/${menuItemId}`, {
        ingredients: validRows.map((r) => ({
          ingredientId: r.ingredientId,
          quantityRequired: Number(r.quantityRequired),
        })),
      });
      showToast('Recipe saved — availability recalculated automatically', 'success');
      onSave?.();
      onClose();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to save recipe', 'danger');
    } finally {
      setSaving(false);
    }
  };

  const getServingsColor = (servings: number) => {
    if (servings === -1) return 'var(--text-secondary)';
    if (servings === 0) return 'var(--danger)';
    if (servings <= 5) return 'var(--warning)';
    return 'var(--success)';
  };

  const getServingsLabel = (servings: number) => {
    if (servings === -1) return 'No recipe';
    if (servings === 0) return 'Cannot prepare (out of stock)';
    return `${servings} servings possible`;
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
      <div className="card" style={{ width: '100%', maxWidth: '620px', padding: '32px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookOpen size={20} style={{ color: 'var(--primary)' }} /> Recipe
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
              <ChefHat size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
              {menuItemName}
            </p>
          </div>
          {recipe && (
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Available Servings</div>
              <strong style={{ fontSize: '1.5rem', color: getServingsColor(recipe.availableServings) }}>
                {recipe.availableServings === -1 ? '—' : recipe.availableServings}
              </strong>
              <div style={{ fontSize: '0.75rem', color: getServingsColor(recipe.availableServings), marginTop: '2px' }}>
                {getServingsLabel(recipe.availableServings)}
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex-center" style={{ minHeight: '150px' }}>
            <div style={{ width: 36, height: 36, border: '4px solid var(--border-color)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          </div>
        ) : (
          <>
            {allIngredients.length === 0 && (
              <div style={{ padding: '16px', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: 'var(--radius-md)', marginBottom: '20px', fontSize: '0.875rem', color: 'var(--warning)' }}>
                ⚠ No ingredients found. Add ingredients in the Inventory tab first.
              </div>
            )}

            {/* Recipe Rows */}
            <div style={{ marginBottom: '12px' }}>
              {rows.length === 0 && (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '12px', fontStyle: 'italic' }}>
                  No recipe defined — availability is manually controlled. Add ingredients to enable automatic stock tracking.
                </p>
              )}

              {rows.map((row, index) => (
                <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
                  <select
                    className="form-control form-select"
                    value={row.ingredientId}
                    onChange={(e) => updateRow(index, 'ingredientId', e.target.value)}
                    style={{ flex: 2 }}
                  >
                    <option value="">Select ingredient...</option>
                    {allIngredients.map((ing) => (
                      <option key={ing.id} value={ing.id}>
                        {ing.name} ({ing.unit}) — Stock: {ing.currentStock}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="0.001"
                    step="0.001"
                    className="form-control"
                    value={row.quantityRequired}
                    onChange={(e) => updateRow(index, 'quantityRequired', e.target.value)}
                    style={{ flex: 1, minWidth: '90px' }}
                    placeholder="Qty"
                  />
                  <button
                    type="button"
                    onClick={() => removeRow(index)}
                    className="btn btn-outline btn-sm"
                    style={{ flexShrink: 0, padding: '8px', borderColor: 'var(--danger)', color: 'var(--danger)' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addRow}
              className="btn btn-secondary btn-sm"
              disabled={allIngredients.length === 0}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '24px' }}
            >
              <Plus size={14} /> Add Ingredient Row
            </button>

            <div style={{ padding: '12px 16px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', marginBottom: '24px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              💡 After saving, menu availability is automatically recalculated based on ingredient stock levels.
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="button" className="btn btn-secondary" style={{ width: '50%' }} onClick={onClose}>Cancel</button>
              <button type="button" className="btn btn-primary" style={{ width: '50%' }} disabled={saving} onClick={handleSave}>
                {saving ? 'Saving...' : 'Save Recipe'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RecipeModal;
