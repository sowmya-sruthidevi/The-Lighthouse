import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useMenu } from '../context/MenuContext';
import { getMenuItems, createMenuItem, deleteMenuItem } from '../api/menuApi';
import { getReviews, deleteReview } from '../api/reviewApi';
import MenuCard from '../components/MenuCard';

const CATEGORIES = ['breakfast', 'lunch', 'dinner', 'desserts', 'drinks'];

const emptyForm = {
  name: '', description: '', price: '', category: 'dinner',
  isVeg: false, tags: [], isAvailable: true, image: '', preparationTime: 20
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const { items, fetchMenu, setItems } = useMenu();
  const [reviews, setReviews] = useState([]);
  const [activeTab, setActiveTab] = useState('menu');
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    // Admin sees ALL items including unavailable
    fetchMenu({ showAll: 'true' });
    getReviews().then(({ data }) => setReviews(data.data));
  }, []);

  const stats = {
    total: items.length,
    available: items.filter((i) => i.isAvailable).length,
    soldOut: items.filter((i) => !i.isAvailable).length,
    reviews: reviews.length
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleTagToggle = (tag) => {
    setForm((f) => ({
      ...f,
      tags: f.tags.includes(tag) ? f.tags.filter((t) => t !== tag) : [...f.tags, tag]
    }));
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    try {
      const { data } = await createMenuItem({ ...form, price: Number(form.price), preparationTime: Number(form.preparationTime) });
      setItems((prev) => [...prev, data.data]);
      setForm(emptyForm);
      setShowAddForm(false);
      setMsg('✅ Dish added successfully!');
    } catch (err) {
      setMsg('❌ ' + (err.response?.data?.error || 'Failed to add dish'));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteReview = async (id) => {
    try {
      await deleteReview(id);
      setReviews((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <main className="page-enter admin-page">
      <div className="container">
        <div className="admin-header">
          <div>
            <span className="section-label">Management Panel</span>
            <h1 className="section-title">Admin Dashboard</h1>
          </div>
          <div className="admin-welcome">
            <span>👋 Welcome, {user?.name}</span>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="admin-stats">
          <div className="admin-stat-card">
            <div className="admin-stat-number">{stats.total}</div>
            <div className="admin-stat-label">Total Dishes</div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-number" style={{ color: 'var(--color-success)' }}>{stats.available}</div>
            <div className="admin-stat-label">Available Now</div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-number" style={{ color: 'var(--color-text-muted)' }}>{stats.soldOut}</div>
            <div className="admin-stat-label">Sold Out</div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-number" style={{ color: 'var(--color-primary)' }}>{stats.reviews}</div>
            <div className="admin-stat-label">Guest Reviews</div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="admin-tabs">
          {['menu', 'reviews'].map((t) => (
            <button key={t} className={`admin-tab-btn ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
              {t === 'menu' ? '🍽️ Live Menu' : '⭐ Reviews'}
            </button>
          ))}
        </div>

        {msg && <p className={`admin-msg ${msg.startsWith('✅') ? 'success' : 'error'}`}>{msg}</p>}

        {/* ── Menu Tab ── */}
        {activeTab === 'menu' && (
          <div className="admin-menu-section">
            <div className="admin-section-header">
              <h2 className="admin-section-title">
                Menu Items
                <span className="admin-hint"> — toggle any dish's availability without touching code</span>
              </h2>
              <button className="btn btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
                {showAddForm ? '✕ Cancel' : '+ Add Dish'}
              </button>
            </div>

            {/* Add form */}
            {showAddForm && (
              <form className="admin-add-form glass" onSubmit={handleAddItem}>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', marginBottom: 'var(--space-lg)' }}>New Menu Item</h3>
                <div className="admin-form-grid">
                  <div className="form-group">
                    <label className="form-label">Name *</label>
                    <input className="form-input" name="name" value={form.name} onChange={handleFormChange} required placeholder="Dish name" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category *</label>
                    <select className="form-select" name="category" value={form.category} onChange={handleFormChange}>
                      {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Description *</label>
                    <textarea className="form-textarea" name="description" value={form.description} onChange={handleFormChange} required rows={2} placeholder="Dish description" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Price (₹) *</label>
                    <input className="form-input" type="number" name="price" value={form.price} onChange={handleFormChange} required min={0} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Prep Time (min)</label>
                    <input className="form-input" type="number" name="preparationTime" value={form.preparationTime} onChange={handleFormChange} min={1} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Image URL</label>
                    <input className="form-input" name="image" value={form.image} onChange={handleFormChange} placeholder="/images/dish.jpg" />
                  </div>
                  <div className="form-group" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 'var(--space-md)' }}>
                    <label className="form-label" style={{ margin: 0 }}>Vegetarian</label>
                    <label className="toggle-switch">
                      <input type="checkbox" name="isVeg" checked={form.isVeg} onChange={handleFormChange} />
                      <span className="toggle-slider" />
                    </label>
                  </div>
                  <div className="form-group" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 'var(--space-md)' }}>
                    <label className="form-label" style={{ margin: 0 }}>Available Now</label>
                    <label className="toggle-switch">
                      <input type="checkbox" name="isAvailable" checked={form.isAvailable} onChange={handleFormChange} />
                      <span className="toggle-slider" />
                    </label>
                  </div>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Tags</label>
                    <div style={{ display: 'flex', gap: 'var(--space-xs)', flexWrap: 'wrap' }}>
                      {['seasonal', 'chef-special', 'popular', 'new', 'spicy'].map((tag) => (
                        <button key={tag} type="button" className={`allergen-chip ${form.tags.includes(tag) ? 'active' : ''}`}
                          style={form.tags.includes(tag) ? { background: 'rgba(201,169,98,0.1)', borderColor: 'var(--color-primary)', color: 'var(--color-primary)' } : {}}
                          onClick={() => handleTagToggle(tag)}>
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-md)', marginTop: 'var(--space-lg)', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-lg)' }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setShowAddForm(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Saving...' : 'Add to Menu'}
                  </button>
                </div>
              </form>
            )}

            {/* Menu grid — cards have admin toggle built in */}
            <div className="grid-3" style={{ paddingBottom: 'var(--space-3xl)' }}>
              {items.map((item) => <MenuCard key={item._id} item={item} />)}
            </div>
          </div>
        )}

        {/* ── Reviews Tab ── */}
        {activeTab === 'reviews' && (
          <div className="admin-reviews">
            {reviews.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: 'var(--space-3xl)' }}>No reviews yet.</p>
            ) : (
              <div className="admin-review-list">
                {reviews.map((r) => (
                  <div key={r._id} className="admin-review-item glass">
                    <div className="admin-review-meta">
                      <div className="review-card__avatar">{r.user?.name?.[0] || 'G'}</div>
                      <div>
                        <strong>{r.user?.name || 'Guest'}</strong>
                        <div className="stars">
                          {[1,2,3,4,5].map((s) => <span key={s} className={s <= r.rating ? 'star-filled' : 'star-empty'}>★</span>)}
                        </div>
                      </div>
                      <span className="admin-review-date">{new Date(r.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="admin-review-comment">"{r.comment}"</p>
                    <button className="btn btn-ghost" style={{ color: 'var(--color-error)', borderColor: 'rgba(224,92,92,0.3)' }} onClick={() => handleDeleteReview(r._id)}>
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        .admin-page { padding-top: calc(var(--navbar-h) + var(--space-xl)); padding-bottom: var(--space-3xl); }
        .admin-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: var(--space-xl); }
        .admin-welcome { font-size: 0.88rem; color: var(--color-text-muted); }
        .admin-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-lg); margin-bottom: var(--space-xl); }
        .admin-tabs { display: flex; gap: var(--space-sm); margin-bottom: var(--space-xl); border-bottom: 1px solid var(--color-border); }
        .admin-tab-btn { padding: 0.6rem 1.5rem; font-size: 0.85rem; font-weight: 500; color: var(--color-text-muted); border-bottom: 2px solid transparent; transition: all var(--transition); }
        .admin-tab-btn.active { color: var(--color-primary); border-bottom-color: var(--color-primary); }
        .admin-msg { padding: 0.75rem 1rem; border-radius: var(--radius-md); font-size: 0.85rem; margin-bottom: var(--space-lg); }
        .admin-msg.success { background: rgba(76,175,125,0.1); border: 1px solid rgba(76,175,125,0.3); color: var(--color-success); }
        .admin-msg.error   { background: rgba(224,92,92,0.1);  border: 1px solid rgba(224,92,92,0.3);  color: var(--color-error); }
        .admin-section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-xl); }
        .admin-section-title { font-family: var(--font-serif); font-size: 1.5rem; }
        .admin-hint { font-family: var(--font-sans); font-size: 0.8rem; color: var(--color-text-faint); font-weight: 400; }
        .admin-add-form { border-radius: var(--radius-xl); padding: var(--space-xl); margin-bottom: var(--space-xl); }
        .admin-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-md); }
        .admin-review-list { display: flex; flex-direction: column; gap: var(--space-md); }
        .admin-review-item { border-radius: var(--radius-lg); padding: var(--space-lg); display: flex; flex-direction: column; gap: var(--space-md); }
        .admin-review-meta { display: flex; align-items: center; gap: var(--space-md); }
        .admin-review-date { margin-left: auto; font-size: 0.75rem; color: var(--color-text-faint); }
        .admin-review-comment { font-style: italic; color: var(--color-text-muted); font-size: 0.9rem; }
        .allergen-chip { padding: 0.3rem 0.8rem; border-radius: var(--radius-full); font-size: 0.75rem; background: var(--color-surface); border: 1px solid var(--color-border); color: var(--color-text-muted); transition: all var(--transition); }
        @media (max-width: 768px) {
          .admin-stats { grid-template-columns: repeat(2, 1fr); }
          .admin-form-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </main>
  );
};

export default AdminDashboard;
