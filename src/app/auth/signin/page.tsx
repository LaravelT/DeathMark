"use client";

import { signIn } from "next-auth/react";
import { Lock, Shield, KeyRound } from "lucide-react";

export default function SignIn() {
  return (
    <div className="signin-wrapper">
      <div className="signin-card">
        <div className="signin-header">
          {/* Logo from public/assets */}
          <div className="logo-shield-container">
            <img 
              src="/assets/legacybridge-logo.png" 
              alt="LegacyBridge Logo" 
              style={{ height: "80px", width: "auto", objectFit: "contain" }} 
            />
          </div>
          <h1 className="signin-title">LegacyBridge</h1>
          <p className="signin-subtitle">Your Digital Legacy Trust</p>
          <div className="header-divider"></div>
        </div>
        
        <div className="signin-body">
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Zero-Knowledge Row */}
            <div className="info-row">
              <div className="info-icon-circle">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#b28e46" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <rect x="9" y="11" width="6" height="5" rx="1" fill="#b28e46" />
                  <path d="M10 11V9a2 2 0 0 1 4 0v2" strokeWidth="1.5" />
                </svg>
              </div>
              <div className="info-content">
                <h3 className="info-title">Zero-Knowledge Encryption</h3>
                <p className="info-text">We never see your unencrypted data. Everything is encrypted on your device.</p>
              </div>
            </div>

            {/* Hidden Folder Row */}
            <div className="info-row">
              <div className="info-icon-circle">
                <svg viewBox="0 0 100 100" width="20" height="20" fill="none" stroke="#b28e46" strokeWidth="8" strokeLinejoin="round">
                  <path d="M33 20 L67 20 L87 56 L53 56 Z" fill="#b28e46" opacity="0.3" />
                  <path d="M67 20 L87 56 L47 56 L27 20 Z" fill="#b28e46" opacity="0.6" />
                  <path d="M27 20 L47 56 L13 56 L33 20 Z" fill="#b28e46" opacity="0.9" />
                </svg>
              </div>
              <div className="info-content">
                <h3 className="info-title">Private Hidden Folder</h3>
                <p className="info-text">All files are stored in a hidden app folder directly on your personal Google Drive.</p>
              </div>
            </div>
          </div>
          
          {/* Gmail-only registration note */}
          <div style={{
            backgroundColor: "#221a0f",
            border: "1px solid rgba(217, 184, 133, 0.4)",
            padding: "10px 14px",
            borderRadius: "12px",
            fontSize: "13px",
            lineHeight: "1.4",
            color: "#fcfaf7",
            fontWeight: "500",
            marginTop: "20px",
            textAlign: "center"
          }}>
            ⚠️ Please note: Registration is supported only for Google accounts, including <strong>Gmail (@gmail.com)</strong> and <strong>Google Workspace</strong> accounts.
          </div>

          {/* Continue with Google button */}
          <button
            onClick={() => signIn("google", { callbackUrl: "/vault" })}
            className="btn-google"
          >
            <svg style={{ width: "20px", height: "20px", flexShrink: 0 }} viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
              <path d="M1 1h22v22H1z" fill="none" />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* New 3-Column Trust Strip */}
          <div className="trust-mini-grid">
            <div className="trust-mini-item">
              <div className="trust-mini-icon">
                <Lock size={15} />
              </div>
              <h4 className="trust-mini-text">Zero-Knowledge</h4>
              <p className="trust-mini-desc">We can't access your data</p>
            </div>
            <div className="trust-mini-item">
              <div className="trust-mini-icon">
                <Shield size={15} />
              </div>
              <h4 className="trust-mini-text">256-bit Encrypted</h4>
              <p className="trust-mini-desc">Military security</p>
            </div>
            <div className="trust-mini-item">
              <div className="trust-mini-icon">
                <KeyRound size={15} />
              </div>
              <h4 className="trust-mini-text">Privacy First</h4>
              <p className="trust-mini-desc">You control your files</p>
            </div>
          </div>
          
          {/* Footer Disclaimer */}
          <p className="signin-footer">
            By continuing, you grant LegacyBridge access to a hidden folder on your Drive. We cannot access your other files.
          </p>

          {/* Decorative bottom line with center dot */}
          <div className="bottom-decorative-divider">
            <div className="bottom-divider-line"></div>
            <div className="bottom-divider-dot"></div>
            <div className="bottom-divider-line"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
