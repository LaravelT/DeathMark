"use client";

import React, { useState } from "react";
import { FolderKey, KeyRound, Info, ShieldAlert, EyeOff, Eye, Copy, Check } from "lucide-react";
import { useVault } from "./VaultContext";

export default function UnlockScreen() {
  const {
    isDemo, session, passphrase, setPassphrase, passConfirm, setPassConfirm,
    salt, mnemonic, confirmMnemonic, setConfirmMnemonic, passVisible, setPassVisible,
    passError, setPassError, copySuccess, setCopySuccess, handleUnlock,
    handleCreatePassphrase, handleVerifyMnemonic, handleLogout
  } = useVault();

  // Local step state for onboarding: "passphrase" | "show-mnemonic" | "verify-mnemonic"
  const [setupStep, setSetupStep] = useState<"passphrase" | "show-mnemonic" | "verify-mnemonic">("passphrase");

  const onCreatePassphraseSubmit = (e: React.FormEvent) => {
    handleCreatePassphrase(e);
    // If successfully validated and mnemonic is generated, move to show-mnemonic
    if (passphrase.length >= 8 && passphrase === passConfirm) {
      setSetupStep("show-mnemonic");
    }
  };

  const handleCopyMnemonic = () => {
    navigator.clipboard.writeText(mnemonic);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  // Render Unlock screen
  if (salt) {
    return (
      <div className="signin-wrapper">
        <div className="signin-card" style={{ maxWidth: "460px" }}>
          <div className="signin-header">
            <div className="logo-container flex-center">
              <FolderKey style={{ width: "32px", height: "32px", color: "#fff" }} />
            </div>
            <h1 className="signin-title">Unlock Vault</h1>
            <p className="signin-subtitle">
              {isDemo ? "Entering Sandbox (Local Browser)" : `Signed in as ${session?.user?.email}`}
            </p>
          </div>
          
          <form onSubmit={handleUnlock} className="signin-body" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label className="form-label">Master Passphrase</label>
              <div style={{ position: "relative", display: "flex" }}>
                <input
                  type={passVisible ? "text" : "password"}
                  value={passphrase}
                  onChange={(e) => setPassphrase(e.target.value)}
                  placeholder="Enter passphrase to derive decryption key"
                  required
                  style={{ width: "100%", padding: "12px 48px 12px 14px", backgroundColor: "#1e293b", border: "1px solid var(--card-border)", borderRadius: "10px", color: "#fff", fontSize: "15px" }}
                />
                <button
                  type="button"
                  onClick={() => setPassVisible(!passVisible)}
                  style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--muted)", cursor: "pointer" }}
                >
                  {passVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {passError && (
              <div style={{ display: "flex", gap: "8px", alignItems: "center", color: "#f87171", fontSize: "13px" }}>
                <ShieldAlert size={16} />
                <span>{passError}</span>
              </div>
            )}

            <button type="submit" className="btn-cta-primary" style={{ width: "100%", border: "none", marginTop: "10px" }}>
              Decrypt Vault
            </button>

            <button type="button" onClick={handleLogout} className="btn-cta-secondary" style={{ width: "100%" }}>
              Change Accounts / Back
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Render Onboarding flow (Setup passphrase)
  if (setupStep === "passphrase") {
    return (
      <div className="signin-wrapper">
        <div className="signin-card" style={{ maxWidth: "500px" }}>
          <div className="signin-header">
            <div className="logo-container flex-center">
              <KeyRound style={{ width: "32px", height: "32px", color: "#fff" }} />
            </div>
            <h1 className="signin-title">Initialize Vault</h1>
            <p className="signin-subtitle">Set your master encryption passphrase.</p>
          </div>

          <form onSubmit={onCreatePassphraseSubmit} className="signin-body" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ backgroundColor: "rgba(99, 102, 241, 0.05)", border: "1px solid rgba(99, 102, 241, 0.15)", borderRadius: "10px", padding: "16px", display: "flex", gap: "12px" }}>
              <Info style={{ color: "var(--primary)", flexShrink: 0 }} size={20} />
              <p style={{ fontSize: "13px", color: "#cbd5e1", lineHeight: "1.5" }}>
                This passphrase is used to encrypt your files. It is <strong>never</strong> uploaded to Google or any server. If you lose it, your data cannot be recovered.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label className="form-label">Master Passphrase</label>
              <input
                type="password"
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                placeholder="Min. 8 characters"
                required
                style={{ width: "100%", padding: "12px 14px", backgroundColor: "#1e293b", border: "1px solid var(--card-border)", borderRadius: "10px", color: "#fff", fontSize: "15px" }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label className="form-label">Confirm Passphrase</label>
              <input
                type="password"
                value={passConfirm}
                onChange={(e) => setPassConfirm(e.target.value)}
                placeholder="Repeat passphrase"
                required
                style={{ width: "100%", padding: "12px 14px", backgroundColor: "#1e293b", border: "1px solid var(--card-border)", borderRadius: "10px", color: "#fff", fontSize: "15px" }}
              />
            </div>

            {passError && (
              <div style={{ display: "flex", gap: "8px", alignItems: "center", color: "#f87171", fontSize: "13px" }}>
                <ShieldAlert size={16} />
                <span>{passError}</span>
              </div>
            )}

            <button type="submit" className="btn-cta-primary" style={{ width: "100%", border: "none" }}>
              Continue to Recovery Seed
            </button>
            
            <button type="button" onClick={handleLogout} className="btn-cta-secondary" style={{ width: "100%" }}>
              Cancel
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Render Recovery Seed step
  if (setupStep === "show-mnemonic") {
    return (
      <div className="signin-wrapper">
        <div className="signin-card" style={{ maxWidth: "520px" }}>
          <div className="signin-header">
            <h1 className="signin-title">Recovery Seed</h1>
            <p className="signin-subtitle">Write these 12 words down offline.</p>
          </div>

          <div className="signin-body" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div style={{ backgroundColor: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: "10px", padding: "16px", display: "flex", gap: "12px" }}>
              <ShieldAlert style={{ color: "#f87171", flexShrink: 0 }} size={22} />
              <p style={{ fontSize: "13px", color: "#fca5a5", lineHeight: "1.5" }}>
                <strong>Do not take a screenshot.</strong> Print it or copy it down on physical paper. Keep it in a safe place. Your executors or guardians will need this to reconstruct the vault if you are no longer here.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", padding: "16px", backgroundColor: "#1e293b", borderRadius: "12px", border: "1px solid var(--card-border)" }}>
              {mnemonic.split(" ").map((word, idx) => (
                <div key={idx} style={{ padding: "8px", backgroundColor: "rgba(0,0,0,0.2)", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.02)", display: "flex", gap: "8px" }}>
                  <span style={{ color: "var(--muted)", fontSize: "12px" }}>{idx + 1}.</span>
                  <strong style={{ color: "#fff", fontSize: "14px" }}>{word}</strong>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={handleCopyMnemonic} className="btn-cta-secondary" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                {copySuccess ? <Check size={18} style={{ color: "var(--success)" }} /> : <Copy size={18} />}
                <span>{copySuccess ? "Copied" : "Copy Words"}</span>
              </button>
              <button onClick={() => setSetupStep("verify-mnemonic")} className="btn-cta-primary" style={{ flex: 1, border: "none" }}>
                Confirm Mnemonic
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render Verify Mnemonic step
  return (
    <div className="signin-wrapper">
      <div className="signin-card" style={{ maxWidth: "500px" }}>
        <div className="signin-header">
          <h1 className="signin-title">Confirm Recovery Seed</h1>
          <p className="signin-subtitle">Verify that you stored the 12 words correctly.</p>
        </div>

        <form onSubmit={handleVerifyMnemonic} className="signin-body" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label className="form-label">Paste or Type all 12 words (space separated):</label>
            <textarea
              value={confirmMnemonic}
              onChange={(e) => setConfirmMnemonic(e.target.value)}
              placeholder="word1 word2 word3..."
              required
              rows={3}
              style={{ width: "100%", padding: "12px 14px", backgroundColor: "#1e293b", border: "1px solid var(--card-border)", borderRadius: "10px", color: "#fff", fontSize: "15px", resize: "none" }}
            />
          </div>

          {passError && (
            <div style={{ display: "flex", gap: "8px", alignItems: "center", color: "#f87171", fontSize: "13px" }}>
              <ShieldAlert size={16} />
              <span>{passError}</span>
            </div>
          )}

          <div style={{ display: "flex", gap: "10px" }}>
            <button type="button" onClick={() => setSetupStep("show-mnemonic")} className="btn-cta-secondary" style={{ flex: 1 }}>
              Go Back
            </button>
            <button type="submit" className="btn-cta-primary" style={{ flex: 1, border: "none" }}>
              Complete Setup
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
