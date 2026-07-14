"use client";

import React, { useState } from 'react';
import Link from 'next/link';

export default function ReturnAndCancellationPolicyPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <div className="landing-theme legal-page">
      {/* Header */}
      <header className="site-header" id="top">
        <nav className="nav shell" aria-label="Primary navigation">
          <Link href="/" className="brand" aria-label="LegacyBridge home">
            <img src="/assets/logo-horizontal.png" alt="LegacyBridge" style={{ height: "65px", width: "auto", objectFit: "contain" }} />
          </Link>

          <button 
            className="nav-toggle" 
            type="button" 
            aria-expanded={menuOpen} 
            aria-controls="nav-menu" 
            aria-label="Toggle navigation"
            onClick={toggleMenu}
            style={{ display: "none" }}
          >
            <span></span><span></span><span></span>
          </button>

          <div className={`nav-menu ${menuOpen ? 'open' : ''}`} id="nav-menu">
            <Link href="/#why" onClick={() => setMenuOpen(false)}>Why</Link>
            <Link href="/#drive" onClick={() => setMenuOpen(false)}>Google Drive</Link>
            <Link href="/#how" onClick={() => setMenuOpen(false)}>How it works</Link>
            <Link href="/#pricing" onClick={() => setMenuOpen(false)}>Pricing</Link>
            <Link href="/#faq" onClick={() => setMenuOpen(false)}>FAQ</Link>
            <Link href="/claim" onClick={() => setMenuOpen(false)}>Claim Assets</Link>
            <Link href="/auth/signin" className="nav-cta" onClick={() => setMenuOpen(false)}>
              Start 48-Hour Access
            </Link>
          </div>
        </nav>
      </header>

      <main>
        <section className="legal-hero">
          <div className="shell">
            <p className="eyebrow">LegacyBridge</p>
            <h1>Return & Cancellation Policy</h1>
            <p>Effective Date: 8 July 2026. LegacyBridge is a product of Solution Planets. This policy governs subscription cancellations and refund eligibility.</p>
          </div>
        </section>

        <section className="legal-content">
          <div className="shell legal-card">
            <h2>1. Free trial period</h2>
            <p>LegacyBridge offers an automatic free trial period of 48 hours for users to test the platform's setup, asset logging, and encryption features. We strongly encourage all users to fully explore the features and compatibility with their Google Drive during this trial period before choosing to subscribe to a paid plan.</p>

            <h2>2. Subscription plans & billing</h2>
            <p>We offer subscription-based paid plans (Annual and Lifetime options). Payment is collected in advance via our secure payment partners (such as Razorpay). Once the subscription plan is activated, access to all premium features, nominee claims, and data snapshots is unlocked.</p>

            <h2>3. Refund eligibility</h2>
            <p>
              Since LegacyBridge provides digital, client-side encrypted storage services that are fully active immediately upon purchase, we operate under a limited refund policy:
            </p>
            <ul>
              <li><strong>Technical failure:</strong> If you experience a documented technical error or compatibility issue that prevents you from accessing your vault, and our technical support team is unable to resolve it within 7 business days, you may request a full refund within 7 days of the transaction.</li>
              <li><strong>Accidental double charge:</strong> If your account is billed multiple times for the same transaction due to a payment gateway error, the duplicate payment will be refunded in full immediately.</li>
              <li><strong>Change of mind:</strong> We generally do not offer refunds for "change of mind" or unused subscription periods once the 48-hour free trial has ended and a paid transaction has completed.</li>
            </ul>

            <h2>4. Cancellation of subscriptions</h2>
            <p>
              You can cancel your subscription plan at any time. To cancel:
            </p>
            <ul>
              <li>Go to your dashboard or your active billing settings.</li>
              <li>Click on the cancel subscription option.</li>
              <li>You may also submit a request via email to <a href="mailto:info@solutionplanets.com" style={{ color: 'var(--gold-1)', textDecoration: 'none', fontWeight: '600' }}>info@solutionplanets.com</a>.</li>
            </ul>
            <p>
              Upon cancellation, your subscription will remain active until the end of your current paid billing cycle. You will not be charged again at the next renewal date.
            </p>

            <h2>5. Data retention after cancellation</h2>
            <p>
              Cancelling a plan halts future recurring charges, but it does not delete your existing logged details. Your encrypted vault files remain saved inside your Google Drive AppData folder. If you wish to delete your account metadata and clear all stored data from the server database, you must request account deletion through your account settings page or contact our team.
            </p>

            <h2>6. Contact Us for support</h2>
            <p>
              For all cancellation, billing disputes, or refund requests, please contact us at:
            </p>
            <div style={{ marginTop: '16px', fontSize: '14.5px', lineHeight: '1.8', color: 'rgba(13,27,42,0.85)' }}>
              <div><strong>Email:</strong> <a href="mailto:info@solutionplanets.com" style={{ color: 'var(--gold-1)', textDecoration: 'none', fontWeight: '600' }}>info@solutionplanets.com</a></div>
              <div><strong>Developed by:</strong> Solution Planets</div>
              <div><strong>Location:</strong> Mumbai, India</div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="site-footer">
        <div className="shell footer-grid">
          <div>
            <Link href="/" className="brand footer-brand">
              <img src="/assets/legacybridge-logo.png" alt="LegacyBridge" style={{ height: "100px", width: "auto", objectFit: "contain", opacity: 0.96 }} />
            </Link>
            <p>A product of Solution Planets.</p>
          </div>
          <div className="footer-links">
            <Link href="/#drive">Google Drive Storage</Link>
            <Link href="/#pricing">Pricing</Link>
            <Link href="/#faq">FAQ</Link>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms & Conditions</Link>
            <Link href="/return-cancellation">Return & Cancellation Policy</Link>
          </div>
          <p className="copyright">© {new Date().getFullYear()} Solution Planets. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
