"use client";

import { signIn } from "next-auth/react";
import { LockKeyhole, ShieldCheck } from "lucide-react";

export default function SignIn() {
  return (
    <div className="signin-wrapper">
      <div className="signin-card">
        <div className="signin-header">
          <div className="logo-container flex-center">
            <LockKeyhole style={{ width: "32px", height: "32px", color: "#fff" }} />
          </div>
          <h1 className="signin-title">DeathMark</h1>
          <p className="signin-subtitle">Your Zero-Knowledge Digital Vault</p>
        </div>
        
        <div className="signin-body">
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div className="info-row">
              <ShieldCheck style={{ width: "24px", height: "24px", color: "var(--success)", flexShrink: 0 }} />
              <p className="info-text">We never see your unencrypted data. Everything is encrypted on your device.</p>
            </div>
            <div className="info-row">
              <ShieldCheck style={{ width: "24px", height: "24px", color: "var(--success)", flexShrink: 0 }} />
              <p className="info-text">All files are stored in a hidden app folder directly on your personal Google Drive.</p>
            </div>
          </div>

          <button
            onClick={() => signIn("google", { callbackUrl: "/vault" })}
            className="btn-google"
          >
            <svg style={{ width: "24px", height: "24px" }} viewBox="0 0 24 24">
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
          
          <p className="signin-footer">
            By continuing, you grant DeathMark access to a hidden folder on your Drive. We cannot access your other files.
          </p>
        </div>
      </div>
    </div>
  );
}
