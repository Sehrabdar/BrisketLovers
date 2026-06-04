import React from 'react';
import { Flame } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer style={{
      background: 'var(--bg-secondary)',
      borderTop: '1px solid var(--border-color)',
      padding: '40px 0 20px',
      color: 'var(--text-secondary)',
      marginTop: 'auto',
    }}>
      <div className="container">
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '24px',
          paddingBottom: '24px',
          borderBottom: '1px solid rgba(255,255,255,0.04)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', fontSize: '1.25rem', fontWeight: 800 }}>
            <Flame size={24} style={{ color: 'var(--primary)' }} />
            <span>Brisket<strong style={{ color: 'var(--primary)' }}>Lovers</strong></span>
          </div>
          
          <div style={{ display: 'flex', gap: '24px', fontSize: '0.9rem' }}>
            <a href="#" className="footer-link">Privacy Policy</a>
            <a href="#" className="footer-link">Terms of Service</a>
            <a href="#" className="footer-link">Contact Us</a>
          </div>
        </div>
        
        <div style={{
          textAlign: 'center',
          paddingTop: '20px',
          fontSize: '0.8rem',
          color: 'var(--text-muted)'
        }}>
          &copy; {new Date().getFullYear()} BrisketLovers Smokehouse Restaurant. All rights reserved.
        </div>
      </div>
      <style>{`
        .footer-link:hover {
          color: var(--primary);
        }
      `}</style>
    </footer>
  );
};
