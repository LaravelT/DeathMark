"use client";

import React, { useState } from 'react';
import Link from 'next/link';

export default function TermsAndConditionsPage() {
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
            <h1>Terms & Conditions</h1>
            <p>Effective Date: 8 July 2026. LegacyBridge is a product of Solution Planets. By using LegacyBridge, you agree to these Terms & Conditions.</p>
          </div>
        </section>

        <section className="legal-content">
          <div className="shell legal-card">
            <h2>1. Product ownership</h2>
            <p><strong>LegacyBridge is a product of Solution Planets.</strong> All references to “LegacyBridge”, “we”, “us” or “our” refer to Solution Planets and/or the LegacyBridge platform, as applicable.</p>

            <h2>2. Purpose of LegacyBridge</h2>
            <p>LegacyBridge is a private family wealth information and nominee-readiness platform. It helps users record information about assets, financial relationships, policies, liabilities, document locations, contacts and instructions that may help a nominee or family member discover and act upon such information in future.</p>

            <h2>3. Not a portfolio tracker or valuation service</h2>
            <p>LegacyBridge is not a portfolio valuation platform, investment advisory service, wealth management service, legal service or tax advisory service. We do not verify market values, returns, balances, ownership rights or claim eligibility. The platform is meant to store user-provided information for family preparedness.</p>

            <h2>4. No legal transfer or claim guarantee</h2>
            <p>Information stored in LegacyBridge does not itself transfer ownership, create nomination rights, replace a will, replace succession documents or guarantee settlement of any claim. Nominees and family members must follow applicable legal, institutional and regulatory procedures for any claim, transfer or succession process.</p>

            <h2>5. User responsibility for accuracy</h2>
            <p>The user is solely responsible for entering accurate, updated and lawful information. LegacyBridge does not independently verify the correctness, completeness or legal validity of user-entered wealth records, nominee instructions, account numbers, document locations or contact details.</p>

            <h2>6. Google account and Drive dependency</h2>
            <p>LegacyBridge may use Google OAuth and Google Drive AppData storage. The user must maintain access to their Google account and grant required permissions for the service to work. If Google access is revoked, the Google account is closed, Drive data is deleted or Google services are unavailable, LegacyBridge functionality may be affected.</p>

            <h2>7. Encryption and passphrase responsibility</h2>
            <p>The user’s vault is designed to be encrypted. The user is responsible for remembering and protecting their secret passphrase. If the passphrase is forgotten, vault recovery may be limited or impossible depending on the configured recovery and nominee snapshot mechanism.</p>

            <h2>8. Prohibited information</h2>
            <p>Users must not store net banking passwords, login passwords, PINs, OTPs, private keys, crypto seed phrases, recovery phrases or any secret credential that could directly enable access to financial accounts. LegacyBridge may provide warnings, but the user remains responsible for what they enter.</p>

            <h2>9. Nominee claim access</h2>
            <p>Nominee claim access is intended for situations such as the vault owner’s death or serious medical incapacity where the owner is unable to act. Claim approval may require identity verification, proof documents, admin review and other checks. LegacyBridge may approve, reject, delay or request additional information for any claim.</p>

            <h2>10. One-time or limited access</h2>
            <p>Claim access links may be time-limited, one-time or otherwise restricted for security. If a link expires or is used, the nominee may need to initiate a new request or contact support, subject to verification.</p>

            <h2>11. 48-hour setup access and paid plans</h2>
            <p>LegacyBridge may provide free 48-hour setup access after signup. After this period, access may be locked until the user activates a paid plan. Pricing, features and plan terms may change from time to time. The currently displayed pricing on the website or application will apply at the time of purchase.</p>

            <h2>12. Payments</h2>
            <p>Payments may be processed through Razorpay or other payment gateways. Users agree to provide accurate payment information and comply with the payment provider’s terms. LegacyBridge does not store full card, UPI PIN, net banking password or similar sensitive payment credentials.</p>

            <h2>13. Refunds and cancellations</h2>
            <p>Refunds, if any, will be handled according to the refund policy displayed at the time of purchase or as communicated by Solution Planets. Subscription cancellation may stop future billing but may not automatically delete existing data.</p>

            <h2>14. Assisted setup</h2>
            <p>If assisted setup is purchased, the user is responsible for choosing what information to provide and ensuring accuracy. Solution Planets personnel should not ask for or record passwords, PINs, OTPs, private keys or seed phrases.</p>

            <h2>15. User conduct</h2>
            <p>Users must not misuse the platform, attempt unauthorized access, upload unlawful information, impersonate another person, misuse nominee claim workflows or use LegacyBridge for fraud or illegal activity.</p>

            <h2>16. Service availability</h2>
            <p>We aim to keep LegacyBridge available and reliable, but we do not guarantee uninterrupted, error-free or permanent availability. The service may be affected by maintenance, third-party outages, Google API changes, payment gateway issues or technical problems.</p>

            <h2>17. Limitation of liability</h2>
            <p>To the maximum extent permitted by law, Solution Planets and LegacyBridge shall not be liable for indirect, incidental, consequential or special damages, including loss arising from inaccurate user-entered data, forgotten passphrases, Google account issues, deleted Drive data, failed claims, delayed nominee access or third-party service disruptions.</p>

            <h2>18. Disclaimer</h2>
            <p>LegacyBridge is provided as an information organization and family preparedness tool. It does not provide legal, financial, tax, investment, succession or estate planning advice. Users should consult qualified professionals for legal, tax, financial and estate planning matters.</p>

            <h2>19. Termination</h2>
            <p>We may suspend or terminate access if a user violates these terms, misuses the product, fails to pay applicable fees or creates legal/security risk. Users may stop using the product at any time.</p>

            <h2>20. Changes to terms</h2>
            <p>We may update these Terms & Conditions from time to time. Continued use of LegacyBridge after changes means the user accepts the updated terms.</p>

            <h2>21. Governing law</h2>
            <p>These Terms & Conditions shall be governed by and construed in accordance with the laws of India. Any disputes arising under or in connection with these terms shall be subject to the exclusive jurisdiction of the courts of Mumbai, India.</p>
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
