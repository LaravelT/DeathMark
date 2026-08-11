"use client";

import React from "react";
import Link from "next/link";
import "./employees.css";

const Check = () => <span className="check" aria-hidden="true">✓</span>;

const benefits = [
  ["Private by design", "Each employee’s encrypted vault is saved in their own Google Drive. The employer never sees personal or financial information."],
  ["Built for family readiness", "Employees organise assets, policies, investments, property, liabilities, nominees and essential contacts in one guided place."],
  ["Verified emergency access", "A registered nominee can request access only through the prescribed identity-verification and claim process."],
  ["Stays with the employee", "The benefit belongs to the employee and continues even if they move to another organisation."],
];

const steps = [
  ["01", "Choose your employee group", "Select the number of lifetime licences you want to sponsor."],
  ["02", "Share private activation codes", "Employees activate their own accounts directly. HR never handles vault information."],
  ["03", "Employees set up independently", "A guided checklist helps each employee complete their family-readiness vault at their own pace."],
];

const faqs = [
  ["Can the employer see an employee’s information?", "No. Employers receive only activation-level information. They cannot see assets, policies, nominees, contacts or any vault content."],
  ["What happens when an employee leaves the company?", "The employee keeps their LegacyBridge access. Their vault is connected to their own Google account, not the employer’s systems."],
  ["Does the programme require a webinar?", "No. LegacyBridge for Employees is designed for self-service adoption with a clear setup guide and digital support."],
  ["Can a nominee immediately access the vault?", "No. A registered nominee must initiate a claim and complete the prescribed identity-verification process. Access may be time-limited and remains subject to applicable requirements."],
  ["Does LegacyBridge transfer assets to the nominee?", "No. LegacyBridge is an information organisation and family-preparedness tool. It does not transfer ownership or replace legal, financial, tax or estate-planning advice."],
];

export default function EmployeesPage() {
  return (
    <div className="employee-theme">
      <main>
        <header className="site-header" id="top">
          <nav className="shell nav" aria-label="Primary navigation">
            <Link className="brand" href="/" aria-label="LegacyBridge home">
              <img src="/legacybridge-logo.svg" alt="LegacyBridge" />
            </Link>
            <div className="nav-menu">
              <Link href="#benefit">The benefit</Link>
              <Link href="#privacy">Privacy</Link>
              <Link href="#pricing">Pricing</Link>
              <Link href="#faq">FAQ</Link>
              <Link className="nav-cta" href="#enquire">Corporate enquiry</Link>
            </div>
          </nav>
        </header>

        <section className="hero section-pad">
          <div className="hero-pattern" aria-hidden="true" />
          <div className="shell hero-grid">
            <div className="hero-copy">
              <p className="eyebrow">LegacyBridge for Employees</p>
              <h1>The employee benefit their family will remember.</h1>
              <p className="hero-lead">Give every employee lifetime access to a private family-readiness vault—so the people they love know what exists and where to begin when it matters.</p>
              <div className="hero-actions">
                <Link className="btn primary" href="#enquire">Get corporate pricing</Link>
                <Link className="btn text-link" href="#how">See how it works <span style={{ marginLeft: "4px" }}>→</span></Link>
              </div>
              <div className="trust-row">
                <span><Check /> Lifetime employee access</span>
                <span><Check /> Zero employer visibility</span>
                <span><Check /> No webinar required</span>
              </div>
            </div>

            <div className="vault-visual" aria-label="Private employee vault illustration">
              <div className="orbit orbit-one" />
              <div className="orbit orbit-two" />
              <div className="vault-card">
                <div className="vault-top"><span className="shield">◇</span><span>PRIVATE FAMILY VAULT</span></div>
                <div className="vault-title">Your family must know.</div>
                <div className="vault-list">
                  {['Assets & accounts','Insurance policies','Investments & property','Liabilities','Nominees & contacts'].map((item) => <div key={item}><Check /> {item}</div>)}
                </div>
                <div className="drive-pill"><span>☁</span> Encrypted in the employee’s Google Drive</div>
              </div>
              <div className="privacy-float"><strong>Employer access</strong><span>None</span></div>
            </div>
          </div>
        </section>

        <section className="statement-strip">
          <div className="shell statement-grid">
            <p>Insurance helps during a crisis.</p>
            <h2>LegacyBridge helps the family know what comes next.</h2>
          </div>
        </section>

        <section className="section-pad" id="benefit">
          <div className="shell">
            <div className="section-head narrow">
              <p className="eyebrow">A benefit beyond the workplace</p>
              <h2>One thoughtful benefit. A lifetime of family clarity.</h2>
              <p>LegacyBridge turns family preparedness into a practical, self-service employee benefit—without asking HR to manage sensitive information.</p>
            </div>
            <div className="benefit-grid">
              {benefits.map(([title, copy], index) => (
                <article className="benefit-card" key={title}>
                  <span className="card-number">0{index + 1}</span>
                  <h3>{title}</h3><p>{copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="privacy-section section-pad" id="privacy">
          <div className="shell privacy-grid">
            <div>
              <p className="eyebrow gold">A clear privacy boundary</p>
              <h2>Your company provides the benefit—not access to the data.</h2>
              <p>LegacyBridge is built so employees do not have to place their personal wealth information in an employer-controlled system.</p>
            </div>
            <div className="access-panel">
              <div className="access-head"><span>What HR can see</span><span>What HR cannot see</span></div>
              <div className="access-cols">
                <ul><li><Check /> Licences purchased</li><li><Check /> Codes activated</li><li><Check /> Overall programme status</li></ul>
                <ul className="cannot"><li>× Assets or accounts</li><li>× Policy information</li><li>× Nominee identities</li><li>× Any vault content</li></ul>
              </div>
            </div>
          </div>
        </section>

        <section className="section-pad" id="how">
          <div className="shell">
            <div className="section-head"><p className="eyebrow">Simple by design</p><h2>No seminars. No complex rollout.</h2><p>A private benefit employees can activate and complete independently.</p></div>
            <div className="steps-grid">
              {steps.map(([num,title,copy]) => <article className="step" key={num}><span>{num}</span><h3>{title}</h3><p>{copy}</p></article>)}
            </div>
          </div>
        </section>

        <section className="pricing-section section-pad" id="pricing">
          <div className="shell pricing-grid">
            <div className="section-copy">
              <p className="eyebrow">Corporate lifetime plan</p>
              <h2>One purchase. Lasting employee value.</h2>
              <p>Offer lifetime access worth ₹4,999 to every participating employee at preferred corporate pricing.</p>
              <div className="included">
                {['Lifetime access to core LegacyBridge features','Encrypted storage in the employee’s own Google Drive','Unlimited information entries','Nominee claim activation','Future standard product updates','Self-guided setup and digital support'].map(item => <div key={item}><Check /> {item}</div>)}
              </div>
            </div>
            <div className="price-card">
              <div className="price-badge">Volume pricing</div>
              <h3>Lifetime access</h3>
              <p className="price">From ₹2,500 <span>/ employee</span></p>
              <div className="tiers">
                <div><span>25–49 employees</span><strong>₹4,000</strong></div>
                <div><span>50–99 employees</span><strong>₹3,500</strong></div>
                <div><span>100–249 employees</span><strong>₹3,000</strong></div>
                <div><span>250–499 employees</span><strong>₹2,750</strong></div>
                <div><span>500+ employees</span><strong>Custom pricing</strong></div>
              </div>
              <Link className="btn primary full" href="#enquire">Request a proposal</Link>
              <small>Minimum 25 licences. Prices exclude applicable taxes.</small>
            </div>
          </div>
        </section>

        <section className="section-pad faq-section" id="faq">
          <div className="shell faq-grid">
            <div className="section-copy"><p className="eyebrow">Corporate FAQ</p><h2>Clarity for HR, employees and families.</h2><p>Important answers about privacy, access and the lifetime benefit.</p></div>
            <div className="faq-list">
              {faqs.map(([q,a]) => <details key={q}><summary>{q}<span>+</span></summary><p>{a}</p></details>)}
            </div>
          </div>
        </section>

        <section className="cta-section" id="enquire">
          <div className="shell cta-card">
            <p className="eyebrow gold">LegacyBridge for Employees</p>
            <h2>Give employees a benefit that protects clarity beyond the workplace.</h2>
            <p>Tell us your organisation size and we’ll share the applicable lifetime-access proposal.</p>
            <div className="hero-actions center">
              <a className="btn light" href="mailto:admin@legacybridge.in?subject=Corporate%20Enquiry%20-%20LegacyBridge%20for%20Employees">Start a corporate enquiry</a>
              <Link className="btn ghost" href="/">Visit legacybridge.in</Link>
            </div>
          </div>
        </section>

        <footer className="site-footer">
          <div className="shell footer-grid">
            <div><img src="/legacybridge-logo.svg" alt="LegacyBridge" /><p>A product of Solution Planets.</p></div>
            <div className="footer-links"><Link href="#benefit">The benefit</Link><Link href="#privacy">Privacy</Link><Link href="#pricing">Pricing</Link><Link href="#faq">FAQ</Link></div>
            <p>© 2026 Solution Planets. All rights reserved.</p>
          </div>
          <p className="disclaimer shell">LegacyBridge is an information organisation and family-preparedness tool. It does not provide legal, financial, tax, investment, succession or estate-planning advice, and does not transfer ownership of any asset.</p>
        </footer>
      </main>
    </div>
  );
}
