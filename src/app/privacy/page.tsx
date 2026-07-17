"use client";

import React, { useState } from 'react';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
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
              Sign In
            </Link>
          </div>
        </nav>
      </header>

      <main>
        <section className="legal-hero">
          <div className="shell">
            <p className="eyebrow">LegacyBridge</p>
            <h1>Privacy Policy</h1>
            <p>Effective Date: 8 July 2026. LegacyBridge is a product of Solution Planets. This Privacy Policy explains how we collect, use, store and protect information when you use LegacyBridge.</p>
          </div>
        </section>

        <section className="legal-content">
          <div className="shell legal-card">
            <h2>1. Our privacy principle</h2>
            <p>LegacyBridge is designed to help users record wealth and financial discovery information for their nominees while reducing the risk of readable financial records being stored on a third-party server. The core product design is that the user’s vault data is encrypted and saved in the Google Drive AppData folder of the Google account with which the user logs in.</p>

            <h2>2. Information we collect</h2>
            <ul>
              <li><strong>Account information:</strong> name, email address, Google account identifier and login-related information received through Google OAuth.</li>
              <li><strong>Owner verification details:</strong> details such as legal name, contact number, Aadhaar number and PAN number, where required for claim verification.</li>
              <li><strong>Nominee verification details:</strong> nominee name, relation, contact details, Aadhaar/PAN details and verification information required for nominee claim checks.</li>
              <li><strong>Vault information:</strong> wealth-information entries created by the user, such as asset existence, account numbers, folio numbers, policy numbers, document locations, contacts and nominee notes. This data is intended to be encrypted before storage.</li>
              <li><strong>Claim information:</strong> information submitted by a nominee or claimant, including reason for claim, identity information and death or incapacity proof, where applicable.</li>
              <li><strong>Payment information:</strong> payment status, plan, invoice details and payment reference details processed through Razorpay or other payment providers. We do not store full card or banking credentials.</li>
              <li><strong>Technical information:</strong> browser/device data, IP address, logs, error reports and usage events required for security, troubleshooting and product improvement.</li>
            </ul>

            <h2>3. Where information is stored</h2>
            <ul>
              <li><strong>User Google Drive AppData:</strong> encrypted vault files are stored in the Google Drive AppData folder of the Google account connected by the user.</li>
              <li><strong>LegacyBridge server/database:</strong> limited account, subscription, verification, claim workflow metadata and encrypted snapshots may be stored for operating the product and claim flow.</li>
              <li><strong>Cloud storage/CDN:</strong> if document upload features are enabled for verification, selected claim or verification documents may be stored with a cloud storage provider such as Cloudinary.</li>
              <li><strong>Payment provider:</strong> payment transactions are processed by payment partners such as Razorpay according to their own security and privacy practices.</li>
            </ul>

            <h2>4. Google Drive access</h2>
            <p>LegacyBridge uses Google OAuth to allow the user to connect their Google account. The app may request limited Drive permissions required to create, read and update encrypted app data in the user’s Drive AppData folder. Users can revoke Google permissions from their Google account settings, but doing so may affect access to the vault.</p>

            <h2>5. Encryption and zero-knowledge design</h2>
            <p>LegacyBridge is designed so that vault data is encrypted client-side before storage. The user’s secret passphrase is used for vault encryption/decryption and should not be shared casually. If the passphrase is lost, recovery may be limited depending on the configured recovery and nominee snapshot mechanism.</p>

            <h2>6. What users must not store</h2>
            <p>Users must not store net banking passwords, app passwords, PINs, OTPs, private keys, crypto seed phrases or any secret credential that can directly enable financial access. LegacyBridge is meant to record asset discovery and nominee guidance information, not passwords.</p>

            <h2>7. How we use information</h2>
            <ul>
              <li>To create and operate the user account.</li>
              <li>To save and retrieve the encrypted vault from the user’s Google Drive.</li>
              <li>To process subscriptions, payments and invoices.</li>
              <li>To support nominee claim verification and admin review.</li>
              <li>To send transactional communication, security alerts, renewal reminders and product updates.</li>
              <li>To detect misuse, prevent fraud, troubleshoot errors and improve the product.</li>
            </ul>

            <h2>8. Marketing and spam</h2>
            <p>LegacyBridge is built to address the concern that users may receive unsolicited marketing calls or spam after sharing financial data. We do not sell or rent readable financial vault data to third parties. We may send essential transactional messages and limited product communication related to LegacyBridge. Users may opt out of non-essential marketing communication where applicable.</p>

            <h2>9. Sharing of information</h2>
            <p>We may share limited data with service providers only as required to operate the product, including hosting, database, cloud storage, email, analytics, support and payment processing providers. We may also disclose information if required by law, legal process, regulatory authority or to protect the rights and safety of users, nominees, Solution Planets or the public.</p>

            <h2>10. Data retention and deletion</h2>
            <p>We retain account and operational information for as long as needed to provide the service, comply with legal obligations, resolve disputes and enforce agreements. Users may request account deletion. Deleting an account may remove server-side metadata, but users may also need to remove or manage app data from their own Google account where applicable.</p>

            <h2>11. Security</h2>
            <p>We use reasonable technical and organizational measures to protect information. However, no system is completely secure. Users are responsible for protecting their Google account, enabling 2-step verification, securing their devices and keeping their secret passphrase confidential.</p>

            <h2>12. Children</h2>
            <p>LegacyBridge is intended for adults who can create legal and financial records for family preparedness. It is not intended for use by minors.</p>

            <h2>13. Changes to this policy</h2>
            <p>We may update this Privacy Policy from time to time. Updates will be posted on this page with a revised effective date.</p>

            <h2>14. Contact</h2>
            <p>If you have any questions about this Privacy Policy, please contact us at <a href="mailto:info@solutionplanets.com" style={{ color: 'var(--gold-1)', textDecoration: 'none', fontWeight: '600' }}>info@solutionplanets.com</a>.</p>
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
