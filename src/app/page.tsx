import Link from "next/link";
import { Shield, KeyRound, Database, HeartHandshake, EyeOff, FileText, User, Folder, Lock, ArrowRight, ShieldCheck, Cloud, ShieldAlert } from "lucide-react";

export default function Home() {
  return (
    <div className="hero-gradient" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
      {/* Glow effects */}
      <div className="glow-indigo" />
      <div className="glow-purple" />
      <div className="glow-top-center" />
      <div className="glow-blue-accent" />

      {/* Header */}
      <header className="container-app">
        <div className="header-nav">
          <div className="flex-center" style={{ gap: "8px" }}>
            <div className="brand-logo-box">
              <KeyRound className="w-5 h-5 text-white" />
            </div>
            <span className="brand-title">
              LegacyBridge
            </span>
          </div>

          {/* Centered Badge in Header */}
          <div className="header-badge-container">
            <div className="badge-tag-header">
              <Lock size={12} className="lock-icon-badge" />
              <span>Zero-Knowledge Legacy Planning Vault</span>
            </div>
          </div>
          
          <div className="nav-links" style={{ display: "flex", gap: "16px", alignItems: "center" }}>
            <Link 
              href="/claim" 
              className="btn-signin-ghost" 
              style={{ 
                border: "1px solid #ec4899", 
                borderRadius: "8px", 
                padding: "8px 16px", 
                color: "#ec4899", 
                display: "flex", 
                alignItems: "center", 
                gap: "6px",
                backgroundColor: "rgba(236, 72, 153, 0.05)",
                textDecoration: "none"
              }}
            >
              <FileText size={14} />
              <span>Claim Details</span>
            </Link>
            <Link href="/auth/signin" className="btn-signin-ghost">
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container-app" style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", paddingBottom: "40px" }}>
        <div className="hero-split-grid">
          {/* Left Content */}
          <div className="hero-sec">
            <h1 className="hero-title">
              Keep Your Assets Hidden.<br />
              <span className="text-gradient">
                Only Pass Them On When Ready.
              </span>
            </h1>

            <p className="hero-description">
              A client-side encrypted vault for old persons and estate planning.
              Store bank accounts, real estate, legal details, and documents
              directly on your personal Google Drive, completely private.
            </p>

            {/* CTA Button */}
            <div className="cta-group">
              <Link href="/auth/signin" className="btn-cta-primary-premium">
                <Shield size={18} className="cta-shield-icon" />
                <span>Secure Drive Login</span>
                <ArrowRight size={16} className="arrow-icon-premium" />
              </Link>
            </div>

            <p className="note-text-encrypted">
              <ShieldCheck className="checkmark-green-icon" size={16} />
              <span>Your data is encrypted. Only you hold the key.</span>
            </p>

            <div style={{ marginTop: "32px", padding: "16px 20px", backgroundColor: "rgba(30, 41, 59, 0.4)", border: "1px solid rgba(244, 114, 182, 0.15)", borderRadius: "12px", backdropFilter: "blur(12px)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", maxWidth: "520px" }}>
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "rgba(244, 114, 182, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <User size={18} style={{ color: "#f472b6" }} />
                </div>
                <div>
                  <h3 style={{ fontSize: "14px", fontWeight: "600", color: "#fff", margin: 0 }}>Are you a beneficiary?</h3>
                  <p style={{ fontSize: "12px", color: "var(--muted)", margin: "2px 0 0 0" }}>Check your claim status and access what's meant for you.</p>
                </div>
              </div>
              <Link href="/claim" style={{ fontSize: "13px", fontWeight: "600", color: "#f472b6", textDecoration: "none", display: "flex", alignItems: "center", gap: "4px", flexShrink: 0, padding: "6px 12px", borderRadius: "6px", backgroundColor: "rgba(244, 114, 182, 0.05)", border: "1px solid rgba(244, 114, 182, 0.1)" }}>
                <span>Claim Your Legacy</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Right Floating Vault Illustration */}
          <div className="hero-right-illustration">
            {/* Tech Circuit background effect */}
            <div className="tech-circuits">
              <svg width="480" height="420" viewBox="0 0 480 420" fill="none" xmlns="http://www.w3.org/2000/svg" className="circuit-svg">
                <path d="M50 210H150L200 160H280L330 210H430" stroke="rgba(168, 85, 247, 0.1)" strokeWidth="1.5" strokeDasharray="4 4" />
                <path d="M100 100H180L220 140H300L340 100H400" stroke="rgba(99, 102, 241, 0.1)" strokeWidth="1.5" />
                <path d="M80 320H160L210 270H270L320 320H400" stroke="rgba(99, 102, 241, 0.1)" strokeWidth="1.5" />
              </svg>
            </div>

            {/* Glowing connecting wire SVG paths radiating from center of the safe */}
            <svg className="connecting-wires-svg" viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <filter id="glow-wire" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              {/* Center of safe is approx (250, 250) */}
              {/* To Doc (left top) */}
              <path d="M250 250 L180 150 H60" stroke="#a855f7" strokeWidth="1.5" filter="url(#glow-wire)" opacity="0.4" strokeDasharray="4 3" />
              {/* To Key (left middle) */}
              <path d="M250 250 H30" stroke="#6366f1" strokeWidth="1.5" filter="url(#glow-wire)" opacity="0.4" />
              {/* To Encryption (left bottom) */}
              <path d="M250 250 L185 350 H60" stroke="#a855f7" strokeWidth="1.5" filter="url(#glow-wire)" opacity="0.4" strokeDasharray="4 3" />
              
              {/* To Drive (right top) */}
              <path d="M250 250 L320 150 H440" stroke="#10b981" strokeWidth="1.5" filter="url(#glow-wire)" opacity="0.4" strokeDasharray="4 3" />
              {/* To Folder (right middle) */}
              <path d="M250 250 H470" stroke="#3b82f6" strokeWidth="1.5" filter="url(#glow-wire)" opacity="0.4" />
              {/* To Cloud (right bottom) */}
              <path d="M250 250 L315 350 H440" stroke="#a855f7" strokeWidth="1.5" filter="url(#glow-wire)" opacity="0.4" strokeDasharray="4 3" />

              {/* To User (bottom center) */}
              <path d="M250 250 V435" stroke="#6366f1" strokeWidth="1.5" filter="url(#glow-wire)" opacity="0.4" />
            </svg>

            {/* Glowing neon base under vault */}
            <div className="glowing-platform-base" />
            <div className="glowing-platform-inner" />

            {/* The CSS-drawn 3D safe vault */}
            <div className="css-vault-safe">
              <div className="bolt top-left"></div>
              <div className="bolt top-right"></div>
              <div className="bolt bottom-left"></div>
              <div className="bolt bottom-right"></div>
              
              <div className="safe-inner-door">
                <div className="safe-display">
                  <span className="display-status">SECURE</span>
                </div>
                
                <div className="safe-dial-outer">
                  <div className="safe-dial-glow"></div>
                  <div className="safe-dial-ring">
                    <div className="safe-dial-center">
                      <Lock className="w-8 h-8 text-purple-400 lock-pulse" />
                    </div>
                  </div>
                </div>
                
                <div className="safe-handle-bar"></div>
                
                <div className="safe-indicator-lights">
                  <div className="light green"></div>
                  <div className="light purple"></div>
                </div>
              </div>
            </div>

            {/* Floating Glass Cards */}
            <div className="floating-card float-doc">
              <div className="glass-icon-circle purple">
                <FileText className="w-5 h-5 text-white" />
              </div>
            </div>

            <div className="floating-card float-user">
              <div className="glass-icon-circle dark-purple">
                <User className="w-5 h-5 text-white" />
              </div>
            </div>

            <div className="floating-card float-folder">
              <div className="glass-icon-circle blue">
                <Folder className="w-5 h-5 text-white" fill="currentColor" />
              </div>
            </div>

            <div className="floating-card float-drive">
              <div className="glass-icon-circle green">
                <svg viewBox="0 0 24 24" className="w-5 h-5">
                  <path fill="#fff" d="M16 15h8l-4-7h-8z"/>
                  <path fill="#fff" d="M4 15l4 7h16l-4-7z" opacity="0.8"/>
                  <path fill="#fff" d="M0 8l4 7h8L8 1z" opacity="0.6"/>
                </svg>
              </div>
            </div>

            <div className="floating-card float-encryption">
              <div className="glass-icon-circle purple">
                <Shield className="w-5 h-5 text-white" />
              </div>
            </div>

            <div className="floating-card float-key">
              <div className="glass-icon-circle blue">
                <KeyRound className="w-5 h-5 text-white" />
              </div>
            </div>

            <div className="floating-card float-cloud">
              <div className="glass-icon-circle dark-purple">
                <Cloud className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="features-grid-premium">
          <div className="feature-card-premium">
            <div className="glow-card-bg indigo" />
            <div className="icon-outer-ring ring-indigo">
              <div className="icon-inner-glow bg-indigo">
                <Shield className="w-5 h-5" style={{ color: "#818cf8" }} />
              </div>
            </div>
            <div className="feature-card-content">
              <h3 className="feature-title-premium">Zero-Knowledge</h3>
              <p className="feature-desc-premium">
                Plaintext data never reaches our servers or anyone else's. Encryption keys are derived locally in your browser.
              </p>
              <div className="card-pill-premium">
                <Lock size={11} />
                <span>100% Private</span>
              </div>
            </div>
          </div>

          <div className="feature-card-premium">
            <div className="glow-card-bg green" />
            <div className="icon-outer-ring ring-green">
              <div className="icon-inner-glow bg-green">
                <svg viewBox="0 0 24 24" className="w-5 h-5">
                  <path fill="#0066da" d="M16 15h8l-4-7h-8z"/>
                  <path fill="#00a85d" d="M4 15l4 7h16l-4-7z"/>
                  <path fill="#ffc107" d="M0 8l4 7h8L8 1z"/>
                </svg>
              </div>
            </div>
            <div className="feature-card-content">
              <h3 className="feature-title-premium">Google Drive Storage</h3>
              <p className="feature-desc-premium">
                Store everything inside your own Drive account. Self-owned, resilient storage. You own your data.
              </p>
              <div className="card-pill-premium">
                <ShieldCheck size={11} />
                <span>You Own Your Data</span>
              </div>
            </div>
          </div>

          <div className="feature-card-premium">
            <div className="glow-card-bg pink" />
            <div className="icon-outer-ring ring-pink">
              <div className="icon-inner-glow bg-pink">
                <HeartHandshake className="w-5 h-5" style={{ color: "#f472b6" }} />
              </div>
            </div>
            <div className="feature-card-content">
              <h3 className="feature-title-premium">Guardian Transfer</h3>
              <p className="feature-desc-premium">
                Dead Man's Switch. Legacy access for family. Pass keys to executors when ready.
              </p>
              <div className="card-pill-premium">
                <ShieldAlert size={11} />
                <span>Your Legacy, Your Control</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="bottom-stats-banner-premium">
          <div className="stat-item-premium">
            <Shield className="stat-icon-premium" size={18} />
            <div>
              <h4>🛡 Zero Knowledge</h4>
              <p>We can't see your data</p>
            </div>
          </div>
          <div className="stat-divider-premium" />
          <div className="stat-item-premium">
            <KeyRound className="stat-icon-premium" size={18} />
            <div>
              <h4>🔐 AES-256 Encrypted</h4>
              <p>Military Grade Security</p>
            </div>
          </div>
          <div className="stat-divider-premium" />
          <div className="stat-item-premium">
            <Cloud className="stat-icon-premium" size={18} />
            <div>
              <h4>☁ Google Drive Based</h4>
              <p>Own your storage</p>
            </div>
          </div>
          <div className="stat-divider-premium" />
          <div className="stat-item-premium">
            <HeartHandshake className="stat-icon-premium" size={18} />
            <div>
              <h4>👥 Legacy Protected</h4>
              <p>When you're ready</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container-app">
        <div className="footer-sec" style={{ borderColor: "rgba(255, 255, 255, 0.05)" }}>
          <p>© {new Date().getFullYear()} LegacyBridge Digital Vault. For testing & local preview.</p>
        </div>
      </footer>
    </div>
  );
}
