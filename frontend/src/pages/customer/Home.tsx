import React from 'react';
import { Link } from 'react-router-dom';
import { Flame, Clock, Award, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const Home: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div>
      {/* Hero Section */}
      <header className="hero" style={{ padding: '120px 0' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '48px', alignItems: 'center' }}>
          <div style={{ maxWidth: '650px', animation: 'fadeIn 0.8s ease' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'var(--primary-soft)',
              border: '1px solid rgba(255, 94, 31, 0.2)',
              padding: '6px 16px',
              borderRadius: 'var(--radius-full)',
              color: 'var(--primary)',
              fontSize: '0.85rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '24px'
            }}>
              <Flame size={16} /> Authentic Wood-Fired BBQ
            </div>
            
            <h1 style={{ fontSize: '3.5rem', marginBottom: '24px', letterSpacing: '-0.03em' }}>
              Slow Smoked to <span className="gradient-text">Perfection.</span>
            </h1>
            
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.15rem', lineHeight: '1.7', marginBottom: '40px' }}>
              Welcome to BrisketLovers. Our meat is seasoned with a custom spice rub, then cooked slow over Texas oak fires for up to 16 hours. Taste the difference quality makes.
            </p>

            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <Link to="/menu" className="btn btn-primary" style={{ padding: '16px 36px', fontSize: '1.05rem' }}>
                Explore Menu
              </Link>
              {!isAuthenticated ? (
                <Link to="/login" className="btn btn-secondary" style={{ padding: '16px 36px', fontSize: '1.05rem' }}>
                  Sign In to Order
                </Link>
              ) : (
                <Link
                  to={user?.role === 'SUPERADMIN' ? '/admin/dashboard' : user?.role === 'STAFF' ? '/staff/dashboard' : '/orders'}
                  className="btn btn-secondary"
                  style={{ padding: '16px 36px', fontSize: '1.05rem' }}
                >
                  Go to Dashboard
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="section" style={{ background: 'var(--bg-primary)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 60px' }}>
            <h2 style={{ fontSize: '2.25rem', marginBottom: '16px' }}>The BrisketLovers Standard</h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              We take no shortcuts. Traditional methods, pristine cuts of meat, and tireless commitment.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }}>
            <div className="card card-hover" style={{ textAlign: 'center', padding: '40px 32px' }}>
              <div className="flex-center" style={{
                width: '64px',
                height: '64px',
                background: 'var(--primary-soft)',
                borderRadius: '50%',
                color: 'var(--primary)',
                margin: '0 auto 24px'
              }}>
                <Clock size={28} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '12px' }}>16-Hour Slow Smoke</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem' }}>
                Cooked overnight at low heat under oakwood logs for an unforgettable tender texture and deep smoke ring.
              </p>
            </div>

            <div className="card card-hover" style={{ textAlign: 'center', padding: '40px 32px' }}>
              <div className="flex-center" style={{
                width: '64px',
                height: '64px',
                background: 'var(--primary-soft)',
                borderRadius: '50%',
                color: 'var(--primary)',
                margin: '0 auto 24px'
              }}>
                <Award size={28} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '12px' }}>USDA Prime Cuts</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem' }}>
                We source only certified prime beef and premium quality meats from trusted regional family ranches.
              </p>
            </div>

            <div className="card card-hover" style={{ textAlign: 'center', padding: '40px 32px' }}>
              <div className="flex-center" style={{
                width: '64px',
                height: '64px',
                background: 'var(--primary-soft)',
                borderRadius: '50%',
                color: 'var(--primary)',
                margin: '0 auto 24px'
              }}>
                <ShieldCheck size={28} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '12px' }}>Scratch-Made Rubs</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem' }}>
                House-blended spice rubs and unique small-batch barbecue sauces prepared fresh daily in our kitchen.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="section" style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '48px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h2 style={{ fontSize: '2rem', marginBottom: '8px' }}>Popular Smokehouse Categories</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Savor the rich, wood-fired taste across our culinary menu</p>
            </div>
            <Link to="/menu" className="btn btn-outline">View Complete Menu</Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            <div className="card card-hover" style={{ padding: '0', overflow: 'hidden' }}>
              <div style={{
                height: '220px',
                background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.8)), url("https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=600") center/cover no-repeat',
                display: 'flex',
                alignItems: 'flex-end',
                padding: '24px'
              }}>
                <h3 style={{ fontSize: '1.5rem', color: '#fff' }}>Prime Brisket</h3>
              </div>
              <div style={{ padding: '24px' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '16px' }}>
                  Our signature brisket sliced to order: choice of moist (fatty) or lean. Beautiful smoke ring and bark.
                </p>
                <Link to="/menu?category=BRISKET" style={{ color: 'var(--primary)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  Order Brisket &rarr;
                </Link>
              </div>
            </div>

            <div className="card card-hover" style={{ padding: '0', overflow: 'hidden' }}>
              <div style={{
                height: '220px',
                background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.8)), url("https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&q=80&w=600") center/cover no-repeat',
                display: 'flex',
                alignItems: 'flex-end',
                padding: '24px'
              }}>
                <h3 style={{ fontSize: '1.5rem', color: '#fff' }}>Pork & Ribs</h3>
              </div>
              <div style={{ padding: '24px' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '16px' }}>
                  Fall-off-the-bone baby back ribs and hand-pulled pork shoulder smoked low over Texas oak logs.
                </p>
                <Link to="/menu?category=RIBS" style={{ color: 'var(--primary)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  Order Ribs &rarr;
                </Link>
              </div>
            </div>

            <div className="card card-hover" style={{ padding: '0', overflow: 'hidden' }}>
              <div style={{
                height: '220px',
                background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.8)), url("https://images.unsplash.com/photo-1621996346565-e3bb6460fcb7?auto=format&fit=crop&q=80&w=600") center/cover no-repeat',
                display: 'flex',
                alignItems: 'flex-end',
                padding: '24px'
              }}>
                <h3 style={{ fontSize: '1.5rem', color: '#fff' }}>Craft Sides</h3>
              </div>
              <div style={{ padding: '24px' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '16px' }}>
                  Complete your tray with baked mac & cheese, sweet cornbread, pit beans, and crunchy vinegar slaw.
                </p>
                <Link to="/menu?category=SIDES" style={{ color: 'var(--primary)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  Order Sides &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
export default Home;
