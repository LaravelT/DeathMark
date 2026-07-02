"use client";

import React, { Suspense } from "react";
import { VaultProvider, useVault } from "./components/VaultContext";
import UnlockScreen from "./components/UnlockScreen";
import Sidebar from "./components/Sidebar";
import TopNavbar from "./components/TopNavbar";
import { User, ShieldAlert } from "lucide-react";

function VaultLayoutInner({ children }: { children: React.ReactNode }) {
  const { 
    derivedKey, loading, loadingMessage, ownerDetails, 
    showPasswordWarning, handleSaveOwnerDetails, handleLogout 
  } = useVault();

  // Local Form state for owner details (in case they are prompted on login)
  const [ownerName, setOwnerName] = React.useState("");
  const [ownerAddress, setOwnerAddress] = React.useState("");
  const [ownerPhone, setOwnerPhone] = React.useState("");
  const [ownerAadhaar, setOwnerAadhaar] = React.useState("");
  const [ownerPan, setOwnerPan] = React.useState("");
  const [formError, setFormError] = React.useState("");

  // If loading session/Google appData configuration
  if (loading) {
    return (
      <div className="signin-wrapper flex-center" style={{ flexDirection: "column", gap: "20px", minHeight: "100vh" }}>
        <div style={{ width: "40px", height: "40px", border: "4px solid rgba(255,255,255,0.1)", borderTopColor: "var(--primary)", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
        <p style={{ color: "var(--muted)", fontSize: "16px" }}>{loadingMessage}</p>
        <style jsx global>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // If not authenticated or unlocked yet, show unlock onboarding forms
  if (!derivedKey) {
    return <UnlockScreen />;
  }

  // If authenticated but no owner details, force owner details registration
  if (derivedKey && !ownerDetails) {
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setFormError("");

      if (!/^\d{10}$/.test(ownerPhone)) {
        setFormError("Phone number must be exactly 10 digits.");
        return;
      }
      if (!/^\d{12}$/.test(ownerAadhaar)) {
        setFormError("Aadhaar card number must be exactly 12 digits.");
        return;
      }
      const panRegex = /[A-Z]{5}\d{4}[A-Z]{1}/i;
      if (!panRegex.test(ownerPan)) {
        setFormError("PAN card number must be in a valid format (e.g. ABCDE1234F).");
        return;
      }

      await handleSaveOwnerDetails({
        name: ownerName,
        address: ownerAddress,
        phoneNo: ownerPhone,
        aadhaarNo: ownerAadhaar,
        panCardNo: ownerPan.toUpperCase(),
      });
    };

    return (
      <div className="signin-wrapper" style={{ overflowY: "auto", padding: "40px 20px" }}>
        <div className="signin-card" style={{ maxWidth: "560px", margin: "auto" }}>
          <div className="signin-header">
            <div className="logo-container flex-center">
              <User style={{ width: "32px", height: "32px", color: "#fff" }} />
            </div>
            <h1 className="signin-title">Vault Owner Details</h1>
            <p className="signin-subtitle">Please fill in your details to continue.</p>
          </div>

          <form onSubmit={handleSubmit} className="signin-body" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            
            {showPasswordWarning && (
              <div style={{ backgroundColor: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: "10px", padding: "16px", display: "flex", gap: "12px" }}>
                <ShieldAlert style={{ color: "#f87171", flexShrink: 0 }} size={22} />
                <p style={{ fontSize: "13px", color: "#fca5a5", lineHeight: "1.5", margin: 0 }}>
                  <strong>Important Notice:</strong> Our password criteria has changed. Your current passphrase does not meet the new security requirements (Min 8 characters, 1 uppercase, 1 lowercase, 1 number, and 1 special character). We recommend changing it.
                </p>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label className="form-label">Full Name <span style={{ color: "var(--danger)" }}>*</span></label>
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="Enter Full Legal Name"
                required
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
                style={{ width: "100%", padding: "12px 14px", backgroundColor: "#1e293b", border: "1px solid var(--card-border)", borderRadius: "10px", color: "#fff", fontSize: "15px", resize: "none" }}
              />
            </div>

            {formError && (
              <div style={{ display: "flex", gap: "8px", alignItems: "center", color: "#f87171", fontSize: "13px" }}>
                <ShieldAlert size={16} />
                <span>{formError}</span>
              </div>
            )}

            <button type="submit" className="btn-cta-primary" style={{ width: "100%", border: "none", marginTop: "10px" }}>
              Save Details & Open Dashboard
            </button>

            <button type="button" onClick={handleLogout} className="btn-cta-secondary" style={{ width: "100%" }}>
              Logout
            </button>
          </form>
        </div>
      </div>
    );
  }

  // If unlocked, render sidebar + navbar page layout wrapper
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-color)", display: "flex" }}>
      <Sidebar />
      <div className="main-wrapper">
        <TopNavbar />
        <main className="page-container">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function VaultLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={
      <div className="signin-wrapper flex-center" style={{ flexDirection: "column", gap: "20px", minHeight: "100vh" }}>
        <div style={{ width: "40px", height: "40px", border: "4px solid rgba(255,255,255,0.1)", borderTopColor: "var(--primary)", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
        <p style={{ color: "var(--muted)", fontSize: "16px" }}>Initializing...</p>
        <style jsx global>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    }>
      <VaultProvider>
        <VaultLayoutInner>{children}</VaultLayoutInner>
      </VaultProvider>
    </Suspense>
  );
}
