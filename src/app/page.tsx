"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";

const categories = [
  ['Location of Important Documents', 'Physical documents, property deeds, identity cards, files, and folder storage locations.'],
  ['Real Estate', 'Property name, type, address, ownership, co-owner, document location.'],
  ['Demat Account', 'Depository, DP/broker name, BO ID/client ID, nominee status, registered mobile.'],
  ['Trading Account', 'Broker name, client ID, registered mobile/email, nominee status.'],
  ['Mutual Funds', 'AMC/platform, folio number, holding type, nominee status, registered mobile.'],
  ['PMS', 'PMS provider, portfolio name, relationship manager, contact number, nominee status.'],
  ['AIF', 'Fund name, category, investment manager, contact number, nominee status.'],
  ['Private Equity', 'Company/fund name, investment through, contact person, contact number, nominee status.'],
  ['Startup Investment', 'Startup name, founder/contact, investment mode, shareholding details, contact number.'],
  ['PF / PPF / EPF', 'Account type, account number, employer/bank, nominee status, registered mobile.'],
  ['Bank Account', 'Bank name, branch, account number, account type, joint holder, nominee status.'],
  ['Fixed Deposit', 'Bank/NBFC, FD number, maturity date, nominee status, branch.'],
  ['Crypto', 'Exchange/wallet name, wallet name, wallet address if required, recovery phrase location only.'],
  ['NFT', 'Marketplace, wallet name, collection name, recovery phrase location only, nominee awareness.'],
  ['Bonds / REITs / SGB', 'Investment type, issuer, certificate/folio number, nominee status, maturity date.'],
  ['Mobile Wallet', 'Wallet name, registered mobile, linked bank, nominee awareness.'],
  ['Physical Shares', 'Company name, certificate number, quantity, storage location, nominee awareness.'],
  ['Life Insurance', 'Insurance company, policy number, policy type, nominee name, agent/RM.'],
  ['Health Insurance', 'Insurance company, policy number, covered members, TPA/claim contact.'],
  ['General Insurance', 'Insurance type, company, policy number, asset covered, expiry date.'],
  ['Loan Given', 'Borrower name, amount, date given, supporting document location, repayment status.'],
  ['Movable Assets', 'Asset name, category, current location, purchase year, owner.'],
  ['Vehicles', 'Vehicle type, registration number, insurance company, RC location, primary driver.'],
  ['Bank Locker', 'Bank name, branch, locker number, key location, joint holder.'],
  ['Memberships', 'Membership name, membership number, organization, renewal date, contact person.'],
  ['Liabilities', 'Loan type, institution/lender, loan account number, EMI bank, co-borrower.'],
  ['Will Document', 'Will status, will date, executor name, original location, lawyer name.'],
  ['Trust Document', 'Trust name, trustee name, trust date, document location, lawyer name.'],
  ['Important Website / App', 'Website/app name, username/email, purpose, recovery email/mobile, recovery method location.'],
  ['Business Interests', 'Business name, ownership type, your role, partner/director contact, business address.'],
  ['Recurring Income Sources', 'Income source, organization/person, frequency, receiving bank account, contact person.'],
  ['Recurring Payments / Auto Debit', 'Payment name, type, debit bank account, frequency, auto-debit status.']
];

const faqs = [
  ['What is LegacyBridge?', 'LegacyBridge is a private family wealth information vault. It helps you record where your important assets, policies, liabilities, documents and contacts exist so that your nominee is not lost when they need this information.'],
  ['Why is this required?', 'Most families do not lose assets because the assets disappear. They struggle because they do not know what exists, where it is held, which account number or folio number to quote, which person to contact, and what documents are needed. LegacyBridge creates that roadmap.'],
  ['Is this a portfolio tracker or net-worth app?', 'No. LegacyBridge does not focus on current market value, daily balance, returns or net worth. It records discovery and claim-readiness information such as account numbers, folios, policy numbers, document locations and nominee instructions.'],
  ['Why should I use this when I can create folders in Google Drive myself?', 'A Drive folder is storage. LegacyBridge is a structured system. It guides you through the exact sections your family may need, asks only useful nominee-focused fields, encrypts the information, generates a family-ready PDF, and provides a nominee claim workflow.'],
  ['Why should I pay if the data is stored in my own Google Drive?', 'You are not paying for Google Drive storage. You are paying for the structured forms, encryption layer, nominee workflow, claim access mechanism, PDF generation, reminders and the family-ready experience that a simple folder cannot provide.'],
  ['Where exactly is my vault stored?', 'Your encrypted vault is stored in the Google Drive AppData folder of the Google account with which you log in. This is not a normal visible Drive folder created for manual browsing.'],
  ['What is Google Drive AppData folder?', 'It is an app-specific private storage area in Google Drive. It is designed for application data and is not visible like normal Drive folders in the user interface. LegacyBridge uses it to reduce accidental tampering and keep the vault tied to the connected Google account.'],
  ['Does LegacyBridge store my readable financial data on its server?', 'No readable wealth records should be stored on the LegacyBridge server. Financial vault data is encrypted in the browser and saved to the user’s Google Drive. The server may store limited account, subscription, verification, claim workflow metadata and encrypted snapshots required to operate the product.'],
  ['Can LegacyBridge employees read my vault?', 'The product is designed so raw vault records are encrypted before storage. Without the correct passphrase or verified nominee decryption flow, readable vault contents should not be accessible to LegacyBridge as plain data.'],
  ['What if someone hacks or gains access to my Google Drive?', 'If they only access your Google Drive directly, the vault file should appear encrypted and unreadable. However, if they also get access to your Google account, LegacyBridge login, device and secret passphrase, risk increases. Users should protect their Google account with 2-step verification and keep their passphrase private.'],
  ['What if my Google Drive data is deleted?', 'Because the vault is stored in the user’s Google Drive AppData area, the user controls that Google account.'],
  ['Can you stop me from deleting my own Google Drive data?', 'No. If the data is in your Google account, you ultimately control it.'],
  ['What happens if I forget my secret passphrase?', 'For strong privacy, the passphrase is critical. If you forget it, LegacyBridge may not be able to decrypt your normal owner vault. This is why the product should provide recovery guidance and a verified nominee snapshot flow where applicable.'],
  ['Should I save passwords, PINs or private keys?', 'No. Do not enter net banking passwords, login passwords, PINs, OTPs, private keys, seed phrases or recovery phrases. You may record where such access information is legally available or what your nominee should do next.'],
  ['Can nominee access be initiated only after death?', 'Primarily, yes, it is meant for access after the vault owner’s death. It may also be initiated in a serious medical incapacity situation where the primary owner is unable to act, subject to proof, verification and admin approval.'],
  ['How does nominee access work?', 'The nominee initiates a claim, verifies owner and nominee details, submits death or incapacity proof, and waits for admin review. Once approved, the nominee receives controlled access to the vault snapshot.'],
  ['Can a nominee access the vault anytime?', 'No. Nominee access should not be casual or automatic. It is designed to activate only through a claim workflow and after the required verification and approval.'],
  ['How is this different from government DigiLocker?', 'DigiLocker stores government-issued or verified documents. LegacyBridge is a private family roadmap for assets, accounts, policies, liabilities, lockers, contacts and instructions. It tells the family what exists and where to begin. It does not replace DigiLocker.'],
  ['Is LegacyBridge a legal will?', 'No. LegacyBridge is not a will and does not transfer ownership. It is an information and discovery vault. For estate transfer, succession and claims, the nominee/family must follow legal and institutional procedures.'],
  ['Can I add multiple bank accounts, policies and assets?', 'Yes. Each section is designed to allow multiple entries, for example multiple bank accounts, insurance policies, demat accounts, properties, FDs and liabilities.'],
  ['What happens after 48-hour setup access ends?', 'After 48 hours, the account is locked until payment. The user can activate an annual or lifetime plan to continue viewing, editing, exporting and keeping nominee access active.'],
  ['Will I get marketing calls or spam because of the data I enter?', 'LegacyBridge is designed to address this trust issue. Your readable wealth records are not stored for marketing use. We do not sell or rent your financial data. Transactional and product-related communication may still be sent as needed.']
];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll animations observer
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14 });

    const revealElements = containerRef.current?.querySelectorAll('.reveal');
    revealElements?.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
    };
  }, []);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleFaqClick = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div className="landing-theme" ref={containerRef}>
      {/* Header */}
      <header className="site-header" id="top">
        <nav className="nav shell" aria-label="Primary navigation">
          <Link href="#top" className="brand" aria-label="LegacyBridge home">
            <img src="/assets/logo-horizontal.png" alt="LegacyBridge" style={{ height: "65px", width: "auto", objectFit: "contain" }} />
          </Link>

          <button 
            className="nav-toggle" 
            type="button" 
            aria-expanded={menuOpen} 
            aria-controls="nav-menu" 
            aria-label="Toggle navigation"
            onClick={toggleMenu}
            style={{ display: "none" }} /* Styled via css, next-js handles click */
          >
            <span></span><span></span><span></span>
          </button>

          <div className={`nav-menu ${menuOpen ? 'open' : ''}`} id="nav-menu">
            <Link href="#why" onClick={() => setMenuOpen(false)}>Why</Link>
            <Link href="#drive" onClick={() => setMenuOpen(false)}>Google Drive</Link>
            <Link href="#how" onClick={() => setMenuOpen(false)}>How it works</Link>
            <Link href="#pricing" onClick={() => setMenuOpen(false)}>Pricing</Link>
            <Link href="#faq" onClick={() => setMenuOpen(false)}>FAQ</Link>
            <Link href="/claim" onClick={() => setMenuOpen(false)}>Claim Assets</Link>
            <Link href="/auth/signin" className="nav-cta" onClick={() => setMenuOpen(false)}>
              Start 48-Hour Access
            </Link>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero Section */}
        <section className="hero section-pad">
          <div className="hero-pattern" aria-hidden="true"></div>
          <div className="shell hero-grid">
            <div className="hero-copy reveal">
              <p className="eyebrow">Private family wealth information vault</p>
              <h1>Your family must know. Your data remains with you.</h1>
              <p className="hero-lead">
                LegacyBridge helps you record the financial information your nominee may need one day — bank accounts, insurance policies, investments, property details, lockers, liabilities, wills, trusts and important contacts.
              </p>
              <p className="hero-trust">
                Your vault is encrypted and stored in the <strong>Google Drive AppData folder of the Google account you log in with</strong>. We do not keep readable wealth records on our server.
              </p>
              <div className="hero-actions">
                <Link className="btn primary" href="/auth/signin">Start 48-Hour Setup Access</Link>
                <Link className="btn secondary" href="#drive">See How Data Stays With You</Link>
              </div>
              <div className="hero-points" aria-label="Key points">
                <span>No portfolio valuation</span>
                <span>No passwords or PINs</span>
                <span>Encrypted Google Drive storage</span>
              </div>
            </div>

            <div className="hero-card reveal delay-1" aria-label="LegacyBridge vault preview">
              <div className="hero-card-top" style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                <img src="/assets/legacybridge-logo.png" alt="LegacyBridge" style={{ height: "80px", width: "auto", objectFit: "contain" }} />
                <div>
                  <p>Protected Vault</p>
                  <h2 style={{ color: '#fff' }}>Stored in your Google Drive</h2>
                </div>
              </div>
              <div className="drive-flow">
                <div><strong>1</strong><span>You sign in with Google</span></div>
                <div><strong>2</strong><span>You enter details in structured forms</span></div>
                <div><strong>3</strong><span>Data is encrypted in the browser</span></div>
                <div><strong>4</strong><span>Encrypted vault is saved in your Drive</span></div>
              </div>
              <div className="mini-alert">
                <span></span>
                <p>Even if someone opens Google Drive directly, the vault file is not readable as normal text.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Strip */}
        <section className="trust-strip" aria-label="LegacyBridge trust points">
          <div className="shell strip-grid">
            <div><strong>Google Drive AppData</strong><span>Stored with the logged-in user</span></div>
            <div><strong>Client-Side Encryption</strong><span>Encrypted before storage</span></div>
            <div><strong>No Password Storage</strong><span>No PINs, keys or passwords</span></div>
            <div><strong>Nominee Claim Flow</strong><span>Access after verification</span></div>
          </div>
        </section>

        {/* Why LegacyBridge */}
        <section className="section-pad" id="why">
          <div className="shell split-grid align-center">
            <div className="section-copy reveal">
              <p className="eyebrow">Why LegacyBridge exists</p>
              <h2>People hesitate to put financial data on third-party servers.</h2>
              <p>
                When financial and wealth information is stored with a third-party company, users worry about trust, misuse, spam emails, unsolicited marketing calls and data exposure.
              </p>
              <p>
                LegacyBridge is built around that pain. Your asset information is not kept as readable data on our server. It is encrypted and saved in the Google Drive of the user account with which you log in.
              </p>
            </div>
            <div className="pain-card reveal delay-1">
              <div className="pain-item"><span>Concern</span><strong>“Will someone misuse my wealth data?”</strong></div>
              <div className="pain-item"><span>Concern</span><strong>“Will I start getting calls and marketing mails?”</strong></div>
              <div className="pain-item"><span>Concern</span><strong>“Why should my financial trail sit on another company’s server?”</strong></div>
              <div className="pain-solution"><small>LegacyBridge answer</small><p>Your data remains with you, encrypted in your Google Drive.</p></div>
            </div>
          </div>
        </section>

        {/* Drive Section */}
        <section className="drive-section section-pad" id="drive">
          <div className="shell">
            <div className="section-head reveal">
              <p className="eyebrow">Data ownership</p>
              <h2>Not our Drive. Not a public folder. Your Google Drive AppData folder.</h2>
              <p>
                LegacyBridge uses Google sign-in so your encrypted vault can be saved in the private app storage area of the Google Drive account you connect.
              </p>
            </div>
            <div className="drive-grid">
              <article className="drive-card reveal">
                <span>01</span>
                <h3>User logs in with Google</h3>
                <p>The user connects the Google account where the encrypted LegacyBridge vault will be stored.</p>
              </article>
              <article className="drive-card reveal delay-1">
                <span>02</span>
                <h3>Data is encrypted first</h3>
                <p>Financial records are encrypted in the browser before they are saved outside the user’s device.</p>
              </article>
              <article className="drive-card reveal delay-2">
                <span>03</span>
                <h3>Saved to Drive AppData</h3>
                <p>The encrypted file is stored in the user’s Google Drive AppData folder, which is not visible like a normal Drive folder.</p>
              </article>
              <article className="drive-card reveal delay-3">
                <span>04</span>
                <h3>Readable only through app</h3>
                <p>The vault can be viewed only after login and decryption using the correct secret passphrase or verified claim process.</p>
              </article>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="section-pad" id="how">
          <div className="shell">
            <div className="section-head narrow reveal">
              <p className="eyebrow">How it works</p>
              <h2>A simple roadmap for the people who matter most.</h2>
            </div>
            <div className="timeline">
              <div className="timeline-step reveal"><span>1</span><div><h3>Start with Google login</h3><p>User signs in with the same Google account where the encrypted vault will be stored.</p></div></div>
              <div className="timeline-step reveal"><span>2</span><div><h3>Set secret passphrase</h3><p>This passphrase protects the encrypted vault. It is not stored as a normal app password.</p></div></div>
              <div className="timeline-step reveal"><span>3</span><div><h3>Add owner and nominee details</h3><p>These details help verify the correct nominee if a claim is ever initiated.</p></div></div>
              <div className="timeline-step reveal"><span>4</span><div><h3>Fill short wealth-information forms</h3><p>Record where assets exist, whom to contact, document location and what your nominee should know.</p></div></div>
            </div>
          </div>
        </section>

        {/* Statement Section */}
        <section className="statement-section">
          <div className="shell statement-card reveal">
            <div>
              <p className="eyebrow gold">Important</p>
              <h2 style={{ color: "#fff" }}>LegacyBridge is not a portfolio valuation platform.</h2>
            </div>
            <p>
              We do not focus on daily balances, market value, returns or net worth. We help the nominee discover what exists, where it exists, who to contact and what action may be required.
            </p>
          </div>
        </section>

        {/* Vault Sections */}
        <section className="section-pad" id="sections">
          <div className="shell">
            <div className="section-head reveal">
              <p className="eyebrow">Vault sections</p>
              <h2>32 focused sections. Short forms. Useful information only.</h2>
              <p>Each form ends with one human field: <strong>“What should my nominee know?”</strong></p>
            </div>
            <div className="category-grid" aria-label="LegacyBridge sections">
              {categories.map((category, index) => (
                <article key={index} className="category-card reveal">
                  <small>{String(index + 1).padStart(2, '0')}</small>
                  <h3>{category[0]}</h3>
                  <p>{category[1]} Every section includes “What should my nominee know?”</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Shareable Output - Hidden
        <section className="pdf-section section-pad">
          <div className="shell pdf-grid align-center">
            <div className="pdf-mock reveal" aria-label="Family Must Know PDF preview">
              <div className="pdf-header"><span>PDF</span><strong>Family Must Know</strong></div>
              <div className="pdf-line wide"></div><div className="pdf-line"></div>
              <div className="pdf-block"><span>Bank Accounts</span><span>Insurance Policies</span><span>Property & Locker Details</span><span>Will, Trust & Key Contacts</span></div>
              <div className="pdf-footer">Generated with LegacyBridge</div>
            </div>
            <div className="section-copy reveal delay-1">
              <p className="eyebrow">Shareable output</p>
              <h2>A family roadmap, not a financial statement.</h2>
              <p>
                The PDF helps the nominee understand the existence and location of assets and obligations. It gives direction without storing passwords or trying to replace legal claim procedures.
              </p>
              <Link className="text-link" href="/auth/signin">Create your Family Must Know PDF</Link>
            </div>
          </div>
        </section>
        */}

        {/* Nominee Claim Journey */}
        <section className="dark-section section-pad" id="claim">
          <div className="shell">
            <div className="section-head reveal">
              <p className="eyebrow gold">Nominee claim journey</p>
              <h2 style={{ color: "#fff" }}>Access can be initiated after death or serious incapacity.</h2>
              <p>The claim process is designed for situations where the primary owner has passed away or is medically unable to act, subject to verification and admin approval.</p>
            </div>
            <div className="claim-grid">
              <article className="claim-card reveal"><span>01</span><h3>Claim request</h3><p>Nominee enters owner details and starts the claim from the claim portal.</p></article>
              <article className="claim-card reveal delay-1"><span>02</span><h3>Identity check</h3><p>Owner and nominee credentials are matched with registered verification data.</p></article>
              <article className="claim-card reveal delay-2"><span>03</span><h3>Proof upload</h3><p>Nominee submits death certificate or serious medical incapacity proof for review.</p></article>
              <article className="claim-card reveal delay-3"><span>04</span><h3>One-time access</h3><p>After approval, the nominee gets a secure link to view and export the vault snapshot.</p></article>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="pricing-section section-pad" id="pricing">
          <div className="shell">
            <div className="section-head reveal">
              <p className="eyebrow">Pricing</p>
              <h2>Start free for 48 hours. Pay only when you are ready to keep it active.</h2>
              <p>Login and setup are free for 48 hours. After that, the vault remains locked until the user activates a paid plan.</p>
            </div>
            <div className="pricing-grid">
              <article className="price-card reveal">
                <div className="price-badge">Setup Access</div>
                <h3>48-Hour Setup</h3>
                <p className="price">₹0 <span>/ first 48 hours</span></p>
                <ul>
                  <li>Google login</li>
                  <li>Create vault</li>
                  <li>Add nominee</li>
                  <li>Fill wealth-information forms</li>
                  <li>Preview your vault</li>
                </ul>
                <Link className="btn secondary full" href="/auth/signin">Start Setup</Link>
              </article>
              <article className="price-card featured reveal delay-1">
                <div className="price-badge">Recommended</div>
                <h3 style={{ color: "#fff" }}>Annual Access</h3>
                <p className="price" style={{ color: "#fff" }}>₹1,000 <span style={{ fontSize: "14px", opacity: 0.8 }}>+ 18% GST / year</span></p>
                <ul>
                  <li>Full vault access</li>
                  <li>Unlimited entries</li>
                  <li>Encrypted Google Drive storage</li>
                  <li>Nominee claim activation</li>
                  <li>Review reminders</li>
                </ul>
                <Link className="btn primary full" href="/auth/signin">Activate Annual</Link>
              </article>
              <article className="price-card reveal delay-2">
                <div className="price-badge">One-Time</div>
                <h3>Lifetime Access</h3>
                <p className="price">₹5,000 <span style={{ fontSize: "14px", opacity: 0.8 }}>+ 18% GST / one-time</span></p>
                <ul>
                  <li>Lifetime vault access</li>
                  <li>No annual renewal worry</li>
                  <li>Unlimited entries</li>
                  <li>Nominee claim activation</li>
                  <li>Future standard updates</li>
                </ul>
                <Link className="btn secondary full" href="/auth/signin">Choose Lifetime</Link>
              </article>
            </div>
            <div className="assisted-box reveal">
              <div><h3>Assisted Setup</h3><p>Need help organizing your details? Our team can guide you through the setup process.</p></div>
              <strong>₹3,000 + 18% GST one-time extra</strong>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="faq-section section-pad" id="faq">
          <div className="shell faq-grid">
            <div className="section-copy reveal">
              <p className="eyebrow">FAQ</p>
              <h2>Basic and technical clarity before users register.</h2>
              <p style={{ marginBottom: "32px" }}>These answers are written to remove the biggest trust, privacy and usefulness doubts.</p>
              
              {/* Contact Us Section */}
              <div className="contact-us-section" style={{ marginTop: "40px", borderTop: "1px solid rgba(13,27,42,0.08)", paddingTop: "24px" }}>
                <h4 style={{ fontSize: "16px", fontWeight: "700", margin: "0 0 12px 0", color: "#0D1B2A" }}>Contact Us</h4>
                <p style={{ fontSize: "14.5px", lineHeight: "1.6", margin: "0 0 16px 0", color: "var(--muted)" }}>
                  Legacy Bridge is a platform developed by <strong>Solution Planets</strong>.
                </p>
                <div style={{ fontSize: "14.5px", lineHeight: "1.8", color: "var(--muted)" }}>
                  <div style={{ marginBottom: "8px" }}>
                    <strong>Email:</strong> <a href="mailto:admin@legacybridge.in" style={{ color: "#b28e46", textDecoration: "none", fontWeight: "600" }}>admin@legacybridge.in</a>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", marginTop: "12px" }}>
                    <strong>Solution Planets</strong>
                    <span>Mumbai, India</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="faq-list reveal delay-1" id="faqList">
              {faqs.map((item, index) => (
                <button 
                  key={index} 
                  className={`faq-item ${activeFaq === index ? 'active' : ''}`} 
                  type="button" 
                  aria-expanded={activeFaq === index}
                  onClick={() => handleFaqClick(index)}
                >
                  <span>{item[0]}</span>
                  <strong>+</strong>
                  <p style={{ 
                    maxHeight: activeFaq === index ? '320px' : '0', 
                    marginTop: activeFaq === index ? '14px' : '0',
                    overflow: 'hidden',
                    transition: 'all 0.25s ease'
                  }}>{item[1]}</p>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="cta-section" id="start">
          <div className="shell cta-card reveal">
          <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", margin: "0 auto 24px" }}>
            <img src="/assets/legacybridge-logo.png" alt="LegacyBridge" style={{ height: "140px", width: "auto", objectFit: "contain", filter: "none" }} />
          </div>
            <h2 style={{ color: "#fff" }}>Build the bridge your family may need one day.</h2>
            <p>Start your 48-hour setup access. Your vault is saved encrypted in your own Google Drive.</p>
            <div className="hero-actions center">
              <Link className="btn primary light" href="/auth/signin">Start 48-Hour Access</Link>
              <Link className="btn ghost" href="/claim">Nominee Claim Portal</Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="site-footer">
        <div className="shell footer-grid">
          <div>
            <Link href="#top" className="brand footer-brand">
              <img src="/assets/legacybridge-logo.png" alt="LegacyBridge" style={{ height: "100px", width: "auto", objectFit: "contain", opacity: 0.96, filter: "none" }} />
            </Link>
            <p>A product of <a href="https://www.solutionplanets.com/" target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "underline" }}>Solution Planets</a></p>
          </div>
          <div className="footer-links">
            <Link href="#drive">Google Drive Storage</Link>
            <Link href="#pricing">Pricing</Link>
            <Link href="#faq">FAQ</Link>
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
