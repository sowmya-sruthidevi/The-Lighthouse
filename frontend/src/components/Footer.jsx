import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="footer">
    <div className="container footer__inner">
      <div className="footer__brand">
        <span className="footer__logo">🌊 The Lighthouse</span>
        <p className="footer__tagline">Fine Dining. Reimagined.</p>
      </div>

      <div className="footer__links">
        <Link to="/menu">Menu</Link>
        <Link to="/reserve">Reservations</Link>
        <Link to="/auth">Sign In</Link>
      </div>

      <div className="footer__info">
        <p>📍 12, Marine Drive, Mumbai, 400001</p>
        <p>📞 +91 98765 43210</p>
        <p>⏰ Mon–Sun · 7 AM – 11 PM</p>
      </div>
    </div>

    <div className="footer__bottom">
      <p>© {new Date().getFullYear()} The Lighthouse. All rights reserved.</p>
    </div>

    <style>{`
      .footer {
        background: var(--color-bg-elevated);
        border-top: 1px solid var(--color-border);
        padding: var(--space-2xl) 0 0;
        margin-top: auto;
      }
      .footer__inner {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: var(--space-xl);
        padding-bottom: var(--space-xl);
      }
      .footer__logo {
        font-family: var(--font-serif);
        font-size: 1.4rem;
        color: var(--color-primary);
      }
      .footer__tagline {
        font-size: 0.8rem;
        color: var(--color-text-faint);
        margin-top: 0.25rem;
        letter-spacing: 0.08em;
      }
      .footer__links {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }
      .footer__links a {
        font-size: 0.85rem;
        color: var(--color-text-muted);
        transition: color var(--transition);
        letter-spacing: 0.05em;
      }
      .footer__links a:hover { color: var(--color-primary); }
      .footer__info p {
        font-size: 0.82rem;
        color: var(--color-text-muted);
        margin-bottom: 0.4rem;
      }
      .footer__bottom {
        border-top: 1px solid var(--color-border);
        padding: var(--space-md) 0;
        text-align: center;
      }
      .footer__bottom p {
        font-size: 0.75rem;
        color: var(--color-text-faint);
        letter-spacing: 0.05em;
      }
      @media (max-width: 768px) {
        .footer__inner { grid-template-columns: 1fr; gap: var(--space-lg); }
      }
    `}</style>
  </footer>
);

export default Footer;
