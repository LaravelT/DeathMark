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
            <h1>Refund & Cancellation Policy</h1>
            <p>Last Updated: 14 July 2026. LegacyBridge is a product of Solution Planets. This policy governs purchases, refunds, and cancellations.</p>
          </div>
        </section>

        <section className="legal-content">
          <div className="shell legal-card">
            <p>This Refund & Cancellation Policy applies to purchases made for LegacyBridge, a product of Solution Planets.</p>

            <h2>1. Free Setup Access</h2>
            <p>LegacyBridge may provide users with free setup access for a limited period, such as 48 hours, so that users can explore the platform, create their vault, understand the features, and decide whether they wish to continue with a paid plan.</p>
            <p>Users are encouraged to review the platform, features, pricing, and suitability during this free setup access period before making any payment.</p>

            <h2>2. No Refund Policy</h2>
            <p>All payments made for LegacyBridge are non-refundable.</p>
            <p>Once a user completes payment for any paid plan, including annual access, lifetime access, assisted setup, or any other paid service offered by LegacyBridge, the payment will not be refunded under any circumstances, including but not limited to:</p>
            <ul>
              <li>Change of mind after purchase</li>
              <li>Non-usage of the platform after payment</li>
              <li>User deciding not to continue with the service</li>
              <li>Incorrect or incomplete data entered by the user</li>
              <li>User’s inability to access their Google account, Google Drive, email, or device</li>
              <li>User deleting, modifying, or losing data stored in their own Google Drive</li>
              <li>Failure to renew after the subscription period ends</li>
              <li>Dissatisfaction after using the service, where the service was made available as described</li>
            </ul>

            <h2>3. Annual Plan</h2>
            <p>If a user purchases an annual plan, the user will get access to LegacyBridge for the applicable subscription period of one year from the date of successful payment.</p>
            <p>After the completion of the one-year period, the user may choose to renew or not renew the plan.</p>
            <p>If the user does not renew the plan, access to paid features may be restricted or discontinued as per the platform’s policy. However, no refund will be provided for the previous subscription period.</p>

            <h2>4. Cancellation</h2>
            <p>Users may choose not to renew their plan after the current subscription period ends.</p>
            <p>Cancellation or non-renewal will stop future access or renewal, but it will not result in a refund for any amount already paid.</p>

            <h2>5. Assisted Setup Services</h2>
            <p>Any payment made for assisted setup, onboarding support, consultation, or manual assistance is non-refundable once the service has been booked, initiated, or delivered.</p>

            <h2>6. Payment Failures or Duplicate Payments</h2>
            <p>If a payment is deducted but the subscription is not activated due to a technical issue, users may contact us with payment details.</p>
            <p>If a genuine duplicate payment is identified for the same user and the same plan, LegacyBridge may verify the transaction and process a correction or refund at its discretion.</p>

            <h2>7. User Responsibility</h2>
            <p>The user is responsible for:</p>
            <ul>
              <li>Reviewing the platform during the free setup access period</li>
              <li>Ensuring that the correct plan is selected before payment</li>
              <li>Maintaining access to their registered Google account</li>
              <li>Keeping their secret passphrase and recovery information secure</li>
              <li>Ensuring that the data entered in the platform is accurate and updated</li>
            </ul>
            <p>LegacyBridge and Solution Planets will not be responsible for loss of access caused by the user’s Google account issues, forgotten passphrase, deleted Google Drive data, incorrect information, or user-side device/browser problems.</p>

            <h2>8. Contact Us</h2>
            <p>For billing-related concerns, users may contact:</p>
            <div style={{ marginTop: '16px', fontSize: '14.5px', lineHeight: '1.8', color: 'rgba(13,27,42,0.85)' }}>
              <div><strong>Solution Planets</strong></div>
              <div><strong>Email:</strong> <a href="mailto:info@solutionplanets.com" style={{ color: 'var(--gold-1)', textDecoration: 'none', fontWeight: '600' }}>info@solutionplanets.com</a></div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="site-footer">
        <div className="shell footer-grid">
          <div>
            <Link href="/" className="brand footer-brand">
              <img src="/assets/legacybridge-logo.png" alt="LegacyBridge" style={{ height: "100px", width: "auto", objectFit: "contain", opacity: 0.96, filter: "none" }} />
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
