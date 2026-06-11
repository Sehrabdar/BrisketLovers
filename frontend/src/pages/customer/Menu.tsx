import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useToast } from '../../contexts/ToastContext';
import { Search, ShoppingCart, Info, Check, X } from 'lucide-react';

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: 'starter' | 'main_course' | 'dessert' | 'beverage';
  imageUrl?: string;
  available: boolean;
}

export const Menu: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const { addToCart, cart } = useCart();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [dishes, setDishes] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('query') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [limit] = useState(12);
  const [offset, setOffset] = useState(0);
  const [_totalCount, setTotalCount] = useState(0);

  // Sync search inputs with URL params
  useEffect(() => {
    const q = searchParams.get('query') || '';
    const cat = searchParams.get('category') || '';
    setSearchQuery(q);
    setSelectedCategory(cat);
    setOffset(0);
  }, [searchParams]);

  // Fetch Dishes from API
  const fetchDishes = async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = {
        limit,
        offset,
        orderBy: 'name',
        orderDirection: 'ASC',
      };
      if (searchQuery) params.query = searchQuery;
      if (selectedCategory) {
        // Map UI category to API Category
        params.available = 'TRUE'; // Only show available to customers, wait, let's show all or just available. Showing all but marking out of stock is best!
      }

      const res = await api.get('/menu', { params });
      
      let filtered = res.data.dishes;
      if (selectedCategory) {
        filtered = filtered.filter((d: MenuItem) => d.category === selectedCategory);
      }
      setDishes(filtered);
      setTotalCount(selectedCategory ? filtered.length : res.data.count);
    } catch (err) {
      showToast('Failed to load menu items', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDishes();
  }, [searchQuery, selectedCategory, offset]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ query: searchQuery, category: selectedCategory });
  };

  const handleCategoryClick = (cat: string) => {
    setSelectedCategory(cat);
    setSearchParams({ query: searchQuery, category: cat });
  };

  const handleAddToCart = async (dish: MenuItem) => {
    if (!isAuthenticated) {
      showToast('Please sign in to order items', 'info');
      return;
    }
    if (user?.role !== 'CUSTOMER') {
      showToast('Only customer accounts can place orders', 'warning');
      return;
    }

    try {
      await addToCart(dish.id, 1);
      showToast(`Added ${dish.name} to cart!`, 'success');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to add item to cart', 'danger');
    }
  };

  const getFullImageUrl = (path?: string) => {
    if (!path) return 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400';
    if (path.startsWith('http')) return path;
    const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
    return `${base}${path}`;
  };

  const categories = [
    { label: 'All Items', value: '' },
    { label: 'Starters', value: 'starter' },
    { label: 'Main Courses', value: 'main_course' },
    { label: 'Desserts', value: 'dessert' },
    { label: 'Beverages', value: 'beverage' },
  ];

  return (
    <div className="container section">
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '12px' }}>Our Pitmaster Menu</h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
          Real Texas oak smoke, custom spices, and premium cuts. Order now for pickup or delivery.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '24px',
        marginBottom: '40px'
      }}>
        {/* Categories Pills */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {categories.map((cat) => (
            <button
              key={cat.label}
              onClick={() => handleCategoryClick(cat.value)}
              className={`btn btn-sm ${selectedCategory === cat.value ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '10px 20px', borderRadius: 'var(--radius-full)' }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px', width: '100%', maxWidth: '360px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <input
              type="text"
              placeholder="Search smokehouse menu..."
              className="form-control"
              style={{ paddingLeft: '44px' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          </div>
        </form>
      </div>

      {/* Dishes Grid */}
      {loading ? (
        <div className="flex-center" style={{ minHeight: '300px' }}>
          <div style={{ width: '40px', height: '40px', border: '4px solid var(--border-color)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      ) : dishes.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--text-secondary)' }}>
          <Info size={40} style={{ margin: '0 auto 16px', color: 'var(--primary)' }} />
          <h3>No Menu Items Found</h3>
          <p style={{ marginTop: '8px' }}>Try adjusting your keywords or category filters.</p>
        </div>
      ) : (
        <div className="grid-auto">
          {dishes.map((dish) => {
            const isItemInCart = cart?.items.some((i) => i.menuItemId === dish.id);
            return (
              <div key={dish.id} className="card card-hover" style={{ padding: '0', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
                {/* Image Wrap */}
                <div style={{ position: 'relative', height: '200px', width: '100%' }}>
                  <img
                    src={getFullImageUrl(dish.imageUrl)}
                    alt={dish.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  {!dish.available && (
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'rgba(10,10,13,0.75)',
                      backdropFilter: 'blur(3px)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--danger)',
                      fontWeight: 700,
                      fontSize: '1rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      <X size={18} style={{ marginRight: '6px' }} /> Out of Stock
                    </div>
                  )}
                  <span className="badge" style={{
                    position: 'absolute',
                    top: '16px',
                    left: '16px',
                    background: 'rgba(0,0,0,0.6)',
                    color: '#fff',
                    backdropFilter: 'blur(4px)',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}>
                    {dish.category.replace('_', ' ')}
                  </span>
                </div>

                {/* Body Content */}
                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{dish.name}</h3>
                    <span style={{ fontSize: '1.25rem', color: 'var(--primary)', fontWeight: 800 }}>
                      ${Number(dish.price).toFixed(2)}
                    </span>
                  </div>
                  
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '24px', flexGrow: 1, lineBreak: 'anywhere' }}>
                    {dish.description || 'Succulent house-prepared smokehouse recipe with local natural ingredients.'}
                  </p>

                  <button
                    onClick={() => handleAddToCart(dish)}
                    className={`btn ${isItemInCart ? 'btn-secondary' : 'btn-primary'}`}
                    style={{ width: '100%', padding: '12px' }}
                    disabled={!dish.available}
                  >
                    {isItemInCart ? (
                      <>
                        <Check size={18} /> In Cart
                      </>
                    ) : (
                      <>
                        <ShoppingCart size={18} /> Add to Cart
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
export default Menu;
