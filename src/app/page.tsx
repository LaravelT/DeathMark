import Link from "next/link";
import { ShieldAlert, KeyRound, Database, HeartHandshake, EyeOff } from "lucide-react";

export default function Home() {
  return (
    <div className="hero-gradient" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
      {/* Glow effects */}
      <div className="glow-indigo" />
      <div className="glow-purple" />

      {/* Header */}
      <header className="container-app">
        <div className="header-nav">
          <div className="flex-center" style={{ gap: "8px" }}>
            <div className="flex-center" style={{ width: "40px", height: "40px", borderRadius: "10px", background: "linear-gradient(135deg, var(--primary), var(--secondary))", boxShadow: "0 4px 12px rgba(99, 102, 241, 0.2)" }}>
              <KeyRound className="w-5 h-5" style={{ color: "#fff" }} />
            </div>
            <span className="brand-title">
              DeathMark
            </span>
          </div>
          
          <div className="nav-links">
            <Link href="/auth/signin" className="btn-secondary-nav">
              Sign In
            </Link>
            <Link href="/vault?demo=true" className="btn-primary-nav">
              Launch Demo
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container-app" style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div className="hero-sec">
          <div className="badge-tag">
            <ShieldAlert style={{ width: "16px", height: "16px" }} />
            <span>Zero-Knowledge Legacy Planning Vault</span>
          </div>

          <h1 className="hero-title">
            Keep Your Assets Hidden.<br />
            <span className="text-gradient">
              Only Pass Them On When Ready.
            </span>
          </h1>

          <p className="hero-description">
            A client-side encrypted vault for old persons and estate planning. Stores bank accounts, real estate, legal details, and documents directly on your personal Google Drive, completely private.
          </p>

          {/* CTA Buttons */}
          <div className="cta-group">
            <Link href="/vault?demo=true" className="btn-cta-primary">
              Enter Sandbox Demo
            </Link>
            <Link href="/auth/signin" className="btn-cta-secondary">
              Secure Drive Login
            </Link>
          </div>

          <p className="note-text">
            * Sandbox Demo uses browser local storage for temporary testing without Google credentials.
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="features-grid">
          <div className="feature-card">
            <div className="icon-wrapper icon-indigo">
              <EyeOff style={{ width: "20px", height: "20px" }} />
            </div>
            <h3 className="feature-title">Zero-Knowledge</h3>
            <p className="feature-desc">
              Plaintext data never reaches our servers or anyone else's. Encryption keys are derived locally in your browser.
            </p>
          </div>

          <div className="feature-card">
            <div className="icon-wrapper icon-purple">
              <Database style={{ width: "20px", height: "20px" }} />
            </div>
            <h3 className="feature-title">Google Drive Storage</h3>
            <p className="feature-desc">
              Data is saved in a hidden app data folder on your own Drive account. Self-owned, resilient storage.
            </p>
          </div>

          <div className="feature-card">
            <div className="icon-wrapper icon-pink">
              <HeartHandshake style={{ width: "20px", height: "20px" }} />
            </div>
            <h3 className="feature-title">Guardian Transfer</h3>
            <p className="feature-desc">
              Set up a Dead Man's Switch or manual trigger keys to pass access to your children or trust executors when ready.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container-app">
        <div className="footer-sec">
          <p>© {new Date().getFullYear()} DeathMark Digital Vault. For testing & local preview.</p>
        </div>
      </footer>
    </div>
  );
}
