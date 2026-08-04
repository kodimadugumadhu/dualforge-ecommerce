import React from 'react';
import { Store, ShieldCheck, Truck, Headphones } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="footer animate-fade-in">
      <div className="footer-features container">
        <div className="feature-card">
          <Truck size={24} className="feature-icon" />
          <div>
            <h4>Fast Delivery</h4>
            <p>Guaranteed on-time shipping</p>
          </div>
        </div>
        <div className="feature-card">
          <ShieldCheck size={24} className="feature-icon" />
          <div>
            <h4>Secure Payments</h4>
            <p>256-bit encrypted transactions</p>
          </div>
        </div>
        <div className="feature-card">
          <Headphones size={24} className="feature-icon" />
          <div>
            <h4>24/7 Support</h4>
            <p>Dedicated customer helpline</p>
          </div>
        </div>
      </div>

      <div className="footer-content container">
        <div className="footer-brand" style={{ maxWidth: '100%', textAlign: 'center', margin: '0 auto' }}>
          <div className="logo" style={{ justifyContent: 'center' }}>
            <Store className="logo-icon" />
            <span>DUAL<span>FORGE</span></span>
          </div>
          <p className="tagline">SHOP SMART. PAY SECURE. LIVE BETTER.</p>
          <p className="tagline-sub">Built with passion, coded for excellence.</p>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container bottom-container">
          <p>&copy; {new Date().getFullYear()} DUALFORGE. All rights reserved.</p>
          <p>All Data Encrypted & Secured</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
