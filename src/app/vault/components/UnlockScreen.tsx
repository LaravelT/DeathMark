"use client";

import React, { useState } from "react";
import { FolderKey, KeyRound, Info, ShieldAlert, EyeOff, Eye, Copy, Check, User } from "lucide-react";
import { useVault } from "./VaultContext";
import { deriveKey, encryptData, decryptData, base64ToArrayBuffer, arrayBufferToBase64 } from "@/lib/crypto";
import { downloadFileContent, uploadFileContent, findFileInAppData } from "@/lib/drive";

export default function UnlockScreen() {
  const {
    isDemo, session, passphrase, setPassphrase, passConfirm, setPassConfirm,
    salt, mnemonic, confirmMnemonic, setConfirmMnemonic, passVisible, setPassVisible,
    passError, setPassError, copySuccess, setCopySuccess, handleUnlock,
    handleCreatePassphrase, handleVerifyMnemonic, handleLogout, setOwnerDetails,
    needsPasswordUpdate, handleUpdateWeakPassphrase, driveFileId
  } = useVault();

  // Local step state for onboarding: "passphrase" | "owner-details" | "show-mnemonic"
  const [setupStep, setSetupStep] = useState<"passphrase" | "owner-details" | "show-mnemonic">("passphrase");
  const [showWarningModal, setShowWarningModal] = useState(true);

  // New Passphrase Form State (for existing user weak password intercept)
  const [newPass, setNewPass] = useState("");
  const [confirmNewPass, setConfirmNewPass] = useState("");
  const [newPassVisible, setNewPassVisible] = useState(false);

  // Owner Details Form State
  const [ownerName, setOwnerName] = useState("");
  const [ownerAddress, setOwnerAddress] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [ownerAadhaar, setOwnerAadhaar] = useState("");
  const [ownerPan, setOwnerPan] = useState("");

  // Forgot Password Flow State
  const [forgotStep, setForgotStep] = useState<"none" | "otp" | "reset">("none");
  const [forgotOtp, setForgotOtp] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [timer, setTimer] = useState(300); // 5 minutes in seconds
  const [newPassphraseReset, setNewPassphraseReset] = useState("");
  const [confirmNewPassphraseReset, setConfirmNewPassphraseReset] = useState("");
  const [resetPassVisible, setResetPassVisible] = useState(false);
  const [tempOldPassphrase, setTempOldPassphrase] = useState("");

  // Countdown Timer Effect
  React.useEffect(() => {
    let interval: any = null;
    if (forgotStep === "otp" && timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [forgotStep, timer]);

  const handleRequestOtp = async () => {
    setForgotLoading(true);
    setForgotError("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send" })
      });
      const data = await res.json();
      if (res.ok) {
        setForgotStep("otp");
        setTimer(300); // Reset to 5 minutes
      } else {
        setForgotError(data.error || "Failed to send OTP.");
      }
    } catch (err: any) {
      setForgotError(err.message || "An error occurred.");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotError("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify", otp: forgotOtp })
      });
      const data = await res.json();
      if (res.ok) {
        setTempOldPassphrase(data.oldPassphrase || "");
        setForgotStep("reset");
      } else {
        setForgotError(data.error || "Invalid OTP.");
      }
    } catch (err: any) {
      setForgotError(err.message || "An error occurred.");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassphrase = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotError("");

    // Validate strength
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassphraseReset)) {
      setForgotError("Passphrase must be at least 8 characters, and include 1 uppercase, 1 lowercase, 1 number, and 1 special character.");
      setForgotLoading(false);
      return;
    }

    if (newPassphraseReset !== confirmNewPassphraseReset) {
      setForgotError("Passphrases do not match.");
      setForgotLoading(false);
      return;
    }

    try {
      if (isDemo) {
        const containerText = localStorage.getItem("legacybridge_vault_container") || "";
        if (containerText && tempOldPassphrase) {
          const [saltB64, ivB64, ciphertextB64] = containerText.split(".");
          const demoSalt = new Uint8Array(base64ToArrayBuffer(saltB64));
          const oldKey = await deriveKey(tempOldPassphrase, demoSalt);
          const decrypted = await decryptData(oldKey, { iv: ivB64, ciphertext: ciphertextB64 });
          const newKey = await deriveKey(newPassphraseReset, demoSalt);
          const encrypted = await encryptData(newKey, decrypted);
          const newContainerText = `${saltB64}.${encrypted.iv}.${encrypted.ciphertext}`;
          localStorage.setItem("legacybridge_vault_container", newContainerText);
        }
      } else {
        const accessToken = session?.accessToken!;
        let activeFileId = driveFileId;
        if (!activeFileId) {
          const file = await findFileInAppData(accessToken, "vault_index.enc");
          if (file) {
            activeFileId = file.id;
          }
        }

        if (activeFileId && tempOldPassphrase) {
          const containerText = await downloadFileContent(accessToken, activeFileId);
          const [saltB64, ivB64, ciphertextB64] = containerText.split(".");
          const activeSalt = new Uint8Array(base64ToArrayBuffer(saltB64));
          const oldKey = await deriveKey(tempOldPassphrase, activeSalt);
          const decrypted = await decryptData(oldKey, { iv: ivB64, ciphertext: ciphertextB64 });
          const newKey = await deriveKey(newPassphraseReset, activeSalt);
          const encrypted = await encryptData(newKey, decrypted);
          const newContainerText = `${saltB64}.${encrypted.iv}.${encrypted.ciphertext}`;
          await uploadFileContent(accessToken, activeFileId, newContainerText);
        }
      }

      // Trigger database reset
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset", newPassphrase: newPassphraseReset })
      });
      const data = await res.json();
      if (res.ok) {
        window.location.reload();
      } else {
        setForgotError(data.error || "Failed to reset passphrase.");
      }
    } catch (err: any) {
      console.error(err);
      setForgotError("Failed to decrypt/re-encrypt with new passphrase: " + err.message);
    } finally {
      setForgotLoading(false);
    }
  };

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

    const details = {
      name: ownerName,
      address: ownerAddress,
      phoneNo: ownerPhone,
      aadhaarNo: ownerAadhaar,
      panCardNo: ownerPan.toUpperCase(),
    };
    setOwnerDetails(details);
    handleVerifyMnemonic(undefined, details);
  };

  const onUpdatePassphraseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleUpdateWeakPassphrase(newPass, confirmNewPass);
  };

  const handleCopyMnemonic = () => {
    navigator.clipboard.writeText(mnemonic);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  // Render Forgot Password - OTP Screen
  if (forgotStep === "otp") {
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;
    const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    return (
      <div className="signin-wrapper">
        <div className="signin-card" style={{ maxWidth: "460px" }}>
          <div className="signin-header">
            <div className="logo-shield-container">
              <img 
                src="/assets/legacybridge-logo.png" 
                alt="LegacyBridge Logo" 
                style={{ height: "80px", width: "auto", objectFit: "contain" }} 
              />
            </div>
            <h1 className="signin-title">Enter Verification OTP</h1>
            <p className="signin-subtitle">We sent a 6-digit code to your registered email.</p>
            <div className="header-divider"></div>
          </div>

          <form onSubmit={handleVerifyOtp} className="signin-body" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label className="form-label">6-Digit OTP Code</label>
              <input
                type="text"
                maxLength={6}
                value={forgotOtp}
                onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter OTP"
                required
                className="signin-input"
                style={{ textAlign: "center", letterSpacing: "8px", fontSize: "20px", fontWeight: "bold" }}
              />
            </div>

            {forgotError && (
              <div style={{ display: "flex", gap: "8px", alignItems: "center", color: "#f87171", fontSize: "13px" }}>
                <ShieldAlert size={16} />
                <span>{forgotError}</span>
              </div>
            )}

            <div style={{ textAlign: "center", fontSize: "14px", color: "var(--muted)" }}>
              {timer > 0 ? (
                <span>OTP expires in <strong style={{ color: "#b28e46" }}>{formattedTime}</strong></span>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", alignItems: "center" }}>
                  <span style={{ color: "#ef4444" }}>OTP has expired.</span>
                  <button 
                    type="button" 
                    onClick={handleRequestOtp} 
                    className="btn-cta-secondary" 
                    style={{ padding: "8px 16px", fontSize: "13px" }}
                  >
                    Resend OTP
                  </button>
                </div>
              )}
            </div>

            <button 
              type="submit" 
              className="btn-cta-primary" 
              style={{ width: "100%", border: "none" }}
              disabled={forgotLoading || timer === 0}
            >
              {forgotLoading ? "Verifying..." : "Verify OTP"}
            </button>

            <button 
              type="button" 
              onClick={() => { setForgotStep("none"); setForgotError(""); }} 
              className="btn-cta-secondary" 
              style={{ width: "100%" }}
            >
              Cancel
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Render Forgot Password - Reset Screen
  if (forgotStep === "reset") {
    return (
      <div className="signin-wrapper">
        <div className="signin-card" style={{ maxWidth: "480px" }}>
          <div className="signin-header">
            <div className="logo-shield-container">
              <img 
                src="/assets/legacybridge-logo.png" 
                alt="LegacyBridge Logo" 
                style={{ height: "80px", width: "auto", objectFit: "contain" }} 
              />
            </div>
            <h1 className="signin-title">Set New Passphrase</h1>
            <p className="signin-subtitle">Choose a new secure vault passphrase.</p>
            <div className="header-divider"></div>
          </div>

          <form onSubmit={handleResetPassphrase} className="signin-body" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            
            <div style={{ backgroundColor: "#faf7f0", border: "1px solid rgba(217, 184, 133, 0.3)", borderRadius: "10px", padding: "16px", display: "flex", gap: "12px" }}>
              <Info style={{ color: "var(--primary)", flexShrink: 0 }} size={22} />
              <p style={{ fontSize: "13px", color: "#6b5a45", lineHeight: "1.5", margin: 0 }}>
                <strong>Secure Update:</strong> Your vault data is being re-encrypted with your new passphrase. All your existing files and details will be preserved and accessible on your dashboard.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label className="form-label">New Master Passphrase</label>
              <div style={{ position: "relative", display: "flex" }}>
                <input
                  type={resetPassVisible ? "text" : "password"}
                  value={newPassphraseReset}
                  onChange={(e) => setNewPassphraseReset(e.target.value)}
                  placeholder="Min. 8 chars (e.g. Chirag@2102)"
                  required
                  className="signin-input"
                  style={{ paddingRight: "48px" }}
                />
                <button
                  type="button"
                  onClick={() => setResetPassVisible(!resetPassVisible)}
                  style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--muted)", cursor: "pointer" }}
                >
                  {resetPassVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label className="form-label">Confirm New Passphrase</label>
              <input
                type="password"
                value={confirmNewPassphraseReset}
                onChange={(e) => setConfirmNewPassphraseReset(e.target.value)}
                placeholder="Repeat new passphrase"
                required
                className="signin-input"
              />
            </div>

            {forgotError && (
              <div style={{ display: "flex", gap: "8px", alignItems: "center", color: "#f87171", fontSize: "13px" }}>
                <ShieldAlert size={16} />
                <span>{forgotError}</span>
              </div>
            )}

            <button 
              type="submit" 
              className="btn-cta-primary" 
              style={{ width: "100%", border: "none", marginTop: "10px" }}
              disabled={forgotLoading}
            >
              {forgotLoading ? "Resetting..." : "Reset Vault & Set Passphrase"}
            </button>

            <button 
              type="button" 
              onClick={() => { setForgotStep("none"); setForgotError(""); }} 
              className="btn-cta-secondary" 
              style={{ width: "100%" }}
            >
              Cancel
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Render Update Master Passphrase screen (for existing users with weak passwords)
  if (needsPasswordUpdate) {
    return (
      <div className="signin-wrapper">
        <div className="signin-card" style={{ maxWidth: "480px" }}>
          <div className="signin-header">
            <div className="logo-shield-container">
              <img 
                src="/assets/legacybridge-logo.png" 
                alt="LegacyBridge Logo" 
                style={{ height: "80px", width: "auto", objectFit: "contain" }} 
              />
            </div>
            <h1 className="signin-title">Update Master Passphrase</h1>
            <p className="signin-subtitle">Set a secure passphrase to protect your vault.</p>
            <div className="header-divider"></div>
          </div>

          <form onSubmit={onUpdatePassphraseSubmit} className="signin-body" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            
            <div style={{ backgroundColor: "#fef2f2", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: "10px", padding: "16px", display: "flex", gap: "12px" }}>
              <ShieldAlert style={{ color: "#b91c1c", flexShrink: 0 }} size={22} />
              <p style={{ fontSize: "13px", color: "#991b1b", lineHeight: "1.5", margin: 0 }}>
                <strong>Important Notice:</strong> Our password criteria has changed. Your current passphrase does not meet the new security requirements (Min 8 characters, 1 uppercase, 1 lowercase, 1 number, and 1 special character). Please set a new passphrase.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label className="form-label">New Master Passphrase</label>
              <div style={{ position: "relative", display: "flex" }}>
                <input
                  type={newPassVisible ? "text" : "password"}
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  placeholder="Min. 8 chars (e.g. Chirag@2102)"
                  required
                  className="signin-input"
                  style={{ paddingRight: "48px" }}
                />
                <button
                  type="button"
                  onClick={() => setNewPassVisible(!newPassVisible)}
                  style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--muted)", cursor: "pointer" }}
                >
                  {newPassVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label className="form-label">Confirm Passphrase</label>
              <input
                type="password"
                value={confirmNewPass}
                onChange={(e) => setConfirmNewPass(e.target.value)}
                placeholder="Repeat new passphrase"
                required
                className="signin-input"
              />
            </div>

            {passError && (
              <div style={{ display: "flex", gap: "8px", alignItems: "center", color: "#f87171", fontSize: "13px" }}>
                <ShieldAlert size={16} />
                <span>{passError}</span>
              </div>
            )}

            <button type="submit" className="btn-cta-primary" style={{ width: "100%", border: "none", marginTop: "10px" }}>
              Update & Unlock Vault
            </button>

            <button type="button" onClick={handleLogout} className="btn-cta-secondary" style={{ width: "100%" }}>
              Logout / Cancel
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Render Unlock screen
  if (salt) {
    return (
      <div className="signin-wrapper">
        <div className="signin-card" style={{ maxWidth: "460px" }}>
          <div className="signin-header">
            <div className="logo-shield-container">
              <img 
                src="/assets/legacybridge-logo.png" 
                alt="LegacyBridge Logo" 
                style={{ height: "80px", width: "auto", objectFit: "contain" }} 
              />
            </div>
            <h1 className="signin-title">Unlock Vault</h1>
            <p className="signin-subtitle">
              {isDemo ? "Entering Sandbox (Local Browser)" : `Signed in as ${session?.user?.email}`}
            </p>
            <div className="header-divider"></div>
          </div>
          
          <form onSubmit={handleUnlock} className="signin-body" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label className="form-label">Master Passphrase</label>
                <button
                  type="button"
                  onClick={handleRequestOtp}
                  disabled={forgotLoading}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#b28e46",
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor: "pointer",
                    padding: 0
                  }}
                >
                  {forgotLoading ? "Sending OTP..." : "Forgot Passphrase?"}
                </button>
              </div>
              <div style={{ position: "relative", display: "flex" }}>
                <input
                  type={passVisible ? "text" : "password"}
                  value={passphrase}
                  onChange={(e) => setPassphrase(e.target.value)}
                  placeholder="Enter your master passphrase to unlock"
                  required
                  className="signin-input"
                  style={{ paddingRight: "48px" }}
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
                <h2 style={{ color: "#b91c1c", fontSize: "20px", fontWeight: "750", marginBottom: "8px" }}>Data Missing</h2>
                <p style={{ color: "#6b5a45", fontSize: "14px", lineHeight: "1.6", marginBottom: "24px" }}>
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
            <div className="logo-shield-container">
              <img 
                src="/assets/legacybridge-logo.png" 
                alt="LegacyBridge Logo" 
                style={{ height: "80px", width: "auto", objectFit: "contain" }} 
              />
            </div>
            <h1 className="signin-title">Initialize Vault</h1>
            <p className="signin-subtitle">Set your master encryption passphrase.</p>
            <div className="header-divider"></div>
          </div>

          <form onSubmit={onCreatePassphraseSubmit} className="signin-body" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

            <div style={{ backgroundColor: "#faf7f0", border: "1px solid rgba(217, 184, 133, 0.25)", borderRadius: "10px", padding: "16px", display: "flex", gap: "12px" }}>
              <Info style={{ color: "var(--primary)", flexShrink: 0 }} size={20} />
              <p style={{ fontSize: "13px", color: "#6b5a45", lineHeight: "1.5" }}>
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
                className="signin-input"
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
                className="signin-input"
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
            <div className="logo-shield-container">
              <img 
                src="/assets/legacybridge-logo.png" 
                alt="LegacyBridge Logo" 
                style={{ height: "80px", width: "auto", objectFit: "contain" }} 
              />
            </div>
            <h1 className="signin-title">Vault Owner Details</h1>
            <p className="signin-subtitle">Please enter the vault owner's personal details.</p>
            <div className="header-divider"></div>
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
                className="signin-input"
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
                className="signin-input"
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
                className="signin-input"
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
                className="signin-input"
                style={{ textTransform: "uppercase" }}
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
                className="signin-input"
                style={{ resize: "none" }}
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
            <div className="logo-shield-container">
              <img 
                src="/assets/legacybridge-logo.png" 
                alt="LegacyBridge Logo" 
                style={{ height: "80px", width: "auto", objectFit: "contain" }} 
              />
            </div>
            <h1 className="signin-title">Recovery Seed</h1>
            <p className="signin-subtitle">Write these 12 words down offline.</p>
            <div className="header-divider"></div>
          </div>

          <div className="signin-body" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div style={{ backgroundColor: "#fef2f2", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: "10px", padding: "16px", display: "flex", gap: "12px" }}>
              <ShieldAlert style={{ color: "#b91c1c", flexShrink: 0 }} size={22} />
              <p style={{ fontSize: "13px", color: "#991b1b", lineHeight: "1.5" }}>
                <strong>Do not take a screenshot.</strong> Print it or copy it down on physical paper. Keep it in a safe place. Your executors or guardians will need this to reconstruct the vault if you are no longer here.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", padding: "16px", backgroundColor: "#fcf8f0", borderRadius: "12px", border: "1px solid rgba(217, 184, 133, 0.25)" }}>
              {mnemonic.split(" ").map((word, idx) => (
                <div key={idx} style={{ padding: "8px", backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid rgba(217, 184, 133, 0.15)", display: "flex", gap: "8px" }}>
                  <span style={{ color: "#8c7a6b", fontSize: "12px" }}>{idx + 1}.</span>
                  <strong style={{ color: "#1a150e", fontSize: "14px" }}>{word}</strong>
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
          <div className="logo-shield-container">
            <img 
              src="/assets/legacybridge-logo.png" 
              alt="LegacyBridge Logo" 
              style={{ height: "80px", width: "auto", objectFit: "contain" }} 
            />
          </div>
          <h1 className="signin-title">Confirm Recovery Seed</h1>
          <p className="signin-subtitle">Verify that you stored the 12 words correctly.</p>
          <div className="header-divider"></div>
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
              className="signin-input"
              style={{ resize: "none" }}
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
