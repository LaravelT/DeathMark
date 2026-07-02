"use client";

import React, { useState } from "react";
import { FolderKey, KeyRound, Info, ShieldAlert, EyeOff, Eye, Copy, Check, User } from "lucide-react";
import { useVault } from "./VaultContext";

export default function UnlockScreen() {
  const {
    isDemo, session, passphrase, setPassphrase, passConfirm, setPassConfirm,
    salt, mnemonic, confirmMnemonic, setConfirmMnemonic, passVisible, setPassVisible,
    passError, setPassError, copySuccess, setCopySuccess, handleUnlock,
    handleCreatePassphrase, handleVerifyMnemonic, handleLogout, setOwnerDetails
  } = useVault();

  // Local step state for onboarding: "passphrase" | "owner-details" | "show-mnemonic"
  const [setupStep, setSetupStep] = useState<"passphrase" | "owner-details" | "show-mnemonic">("passphrase");
  const [showWarningModal, setShowWarningModal] = useState(true);

  // Owner Details Form State
  const [ownerName, setOwnerName] = useState("");
  const [ownerAddress, setOwnerAddress] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [ownerAadhaar, setOwnerAadhaar] = useState("");
  const [ownerPan, setOwnerPan] = useState("");

  const onCreatePassphraseSubmit = (e: React.FormEvent) => {
    const success = handleCreatePassphrase(e);
    if (success) {
      setSetupStep("owner-details");
    }
  };

  const onOwnerDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPassError("");

    // Validate Phone number (10 digits)
    if (!/^\d{10}$/.test(ownerPhone)) {
      setPassError("Phone number must be exactly 10 digits.");
      return;
    }
    // Validate Aadhaar (12 digits)
    if (!/^\d{12}$/.test(ownerAadhaar)) {
      setPassError("Aadhaar card number must be exactly 12 digits.");
      return;
    }
    // Validate PAN Card format (5 letters, 4 digits, 1 letter)
    const panRegex = /[A-Z]{5}\d{4}[A-Z]{1}/i;
    if (!panRegex.test(ownerPan)) {
      setPassError("PAN card number must be in a valid format (e.g. ABCDE1234F).");
      return;
    }

    setOwnerDetails({
      name: ownerName,
      address: ownerAddress,
      phoneNo: ownerPhone,
      aadhaarNo: ownerAadhaar,
      panCardNo: ownerPan.toUpperCase(),
    });

    setSetupStep("show-mnemonic");
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
                  placeholder="Enter your master passphrase to unlock"
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
              Unlock Vault
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
        {session?.isReturningUser && !salt && showWarningModal && (
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(15, 23, 42, 0.82)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px"
          }}>
            <div className="signin-card" style={{ maxWidth: "420px", border: "1px solid rgba(239, 68, 68, 0.2)", position: "relative" }}>
              <div style={{ textAlign: "center", padding: "20px 10px" }}>
                <div style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(239, 68, 68, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px"
                }}>
                  <ShieldAlert size={28} style={{ color: "#ef4444" }} />
                </div>
                <h2 style={{ color: "#fff", fontSize: "20px", fontWeight: "600", marginBottom: "8px" }}>Data Missing</h2>
                <p style={{ color: "#cbd5e1", fontSize: "14px", lineHeight: "1.6", marginBottom: "24px" }}>
                  Your data has been deleted from your Google Drive. Please fill in all your details again.
                </p>
                <button 
                  type="button"
                  onClick={() => setShowWarningModal(false)}
                  className="btn-cta-primary-premium" 
                  style={{ width: "100%", border: "none" }}
                >
                  Acknowledge & Reinitialize
                </button>
              </div>
            </div>
          </div>
        )}

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
                This passphrase is used to encrypt your files. It must be at least <strong>8 characters</strong> and include <strong>1 uppercase</strong>, <strong>1 lowercase</strong>, <strong>1 number</strong>, and <strong>1 special character</strong> (e.g. Chirag@2102).
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label className="form-label">Master Passphrase</label>
              <input
                type="password"
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                placeholder="Min. 8 chars (e.g. Chirag@2102)"
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

  // Render Owner Details step
  if (setupStep === "owner-details") {
    return (
      <div className="signin-wrapper">
        <div className="signin-card" style={{ maxWidth: "520px" }}>
          <div className="signin-header">
            <div className="logo-container flex-center">
              <User style={{ width: "32px", height: "32px", color: "#fff" }} />
            </div>
            <h1 className="signin-title">Vault Owner Details</h1>
            <p className="signin-subtitle">Please enter the vault owner's personal details.</p>
          </div>

          <form onSubmit={onOwnerDetailsSubmit} className="signin-body" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label className="form-label">Full Name <span style={{ color: "var(--danger)" }}>*</span></label>
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="Enter Full Legal Name"
                required
                className="form-input"
                style={{ width: "100%", padding: "12px 14px", backgroundColor: "#1e293b", border: "1px solid var(--card-border)", borderRadius: "10px", color: "#fff", fontSize: "15px" }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label className="form-label">Registered Mobile <span style={{ color: "var(--danger)" }}>*</span></label>
              <input
                type="text"
                value={ownerPhone}
                onChange={(e) => setOwnerPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="10-digit Mobile No"
                required
                pattern="\d{10}"
                maxLength={10}
                className="form-input"
                style={{ width: "100%", padding: "12px 14px", backgroundColor: "#1e293b", border: "1px solid var(--card-border)", borderRadius: "10px", color: "#fff", fontSize: "15px" }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label className="form-label">Aadhaar Card No <span style={{ color: "var(--danger)" }}>*</span></label>
              <input
                type="text"
                value={ownerAadhaar}
                onChange={(e) => setOwnerAadhaar(e.target.value.replace(/\D/g, ''))}
                placeholder="12-digit Aadhaar No"
                required
                pattern="\d{12}"
                maxLength={12}
                className="form-input"
                style={{ width: "100%", padding: "12px 14px", backgroundColor: "#1e293b", border: "1px solid var(--card-border)", borderRadius: "10px", color: "#fff", fontSize: "15px" }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label className="form-label">PAN Card No <span style={{ color: "var(--danger)" }}>*</span></label>
              <input
                type="text"
                value={ownerPan}
                onChange={(e) => setOwnerPan(e.target.value.toUpperCase())}
                placeholder="10-digit PAN No"
                required
                maxLength={10}
                className="form-input"
                style={{ width: "100%", padding: "12px 14px", backgroundColor: "#1e293b", border: "1px solid var(--card-border)", borderRadius: "10px", color: "#fff", fontSize: "15px", textTransform: "uppercase" }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label className="form-label">Address <span style={{ color: "var(--danger)" }}>*</span></label>
              <textarea
                value={ownerAddress}
                onChange={(e) => setOwnerAddress(e.target.value)}
                placeholder="Enter Residential Address"
                required
                rows={3}
                className="form-textarea"
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
              <button type="button" onClick={() => setSetupStep("passphrase")} className="btn-cta-secondary" style={{ flex: 1 }}>
                Go Back
              </button>
              <button type="submit" className="btn-cta-primary" style={{ flex: 1, border: "none" }}>
                Continue
              </button>
            </div>
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
              <button onClick={() => handleVerifyMnemonic()} className="btn-cta-primary" style={{ flex: 1, border: "none" }}>
                Complete Setup
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
