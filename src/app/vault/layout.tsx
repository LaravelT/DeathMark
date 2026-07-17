"use client";

import React, { Suspense, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { VaultProvider, useVault } from "./components/VaultContext";
import UnlockScreen from "./components/UnlockScreen";
import Sidebar from "./components/Sidebar";
import TopNavbar from "./components/TopNavbar";
import { User, ShieldAlert } from "lucide-react";

function VaultLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { 
    derivedKey, loading, loadingMessage, ownerDetails, 
    handleSaveOwnerDetails, handleLogout, isExpired, plan, readOnly, isDemo
  } = useVault();

  // Local Form state for owner details (in case they are prompted on login)
  const [ownerName, setOwnerName] = React.useState("");
  const [ownerAddress, setOwnerAddress] = React.useState("");
  const [ownerPhone, setOwnerPhone] = React.useState("");
  const [ownerAadhaar, setOwnerAadhaar] = React.useState("");
  const [ownerPan, setOwnerPan] = React.useState("");
  const [formError, setFormError] = React.useState("");
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  // Security and anti-screenshot state
  const [isWindowBlurred, setIsWindowBlurred] = React.useState(false);
  const [securityMessage, setSecurityMessage] = React.useState<string | null>(null);

  const showSecurityAlert = (msg: string) => {
    setSecurityMessage(msg);
  };

  useEffect(() => {
    if (securityMessage) {
      const timer = setTimeout(() => {
        setSecurityMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [securityMessage]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (derivedKey && plan === null && pathname !== "/vault/plans") {
      router.push(isDemo ? "/vault/plans?demo=true" : "/vault/plans");
    }
  }, [derivedKey, plan, pathname, isDemo, router]);

  // Security features enabled when logged in / unlocked
  useEffect(() => {
    if (!derivedKey) return;

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      showSecurityAlert("Right-click is disabled for security reasons.");
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Print Screen key
      if (e.key === "PrintScreen") {
        e.preventDefault();
        try {
          navigator.clipboard.writeText("");
        } catch (_) {}
        showSecurityAlert("Screenshots are not allowed on this secure platform.");
      }
      // Ctrl+P / Cmd+P
      if ((e.ctrlKey || e.metaKey) && e.key === "p") {
        e.preventDefault();
        showSecurityAlert("Printing pages is disabled for security.");
      }
      // Ctrl+S / Cmd+S
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        showSecurityAlert("Saving pages locally is disabled.");
      }
      // Ctrl+Shift+S / Cmd+Shift+S / Win+Shift+S
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "s" || e.key === "S")) {
        showSecurityAlert("Screenshots are not allowed on this secure platform.");
      }
      // Developer tools (F12)
      if (e.key === "F12") {
        e.preventDefault();
        showSecurityAlert("Developer Tools are disabled for security.");
      }
      // Developer tools (Ctrl+Shift+I / J / C)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "i" || e.key === "I" || e.key === "j" || e.key === "J" || e.key === "c" || e.key === "C")) {
        e.preventDefault();
        showSecurityAlert("Developer Tools are disabled for security.");
      }
      // View Source (Ctrl+U)
      if ((e.ctrlKey || e.metaKey) && (e.key === "u" || e.key === "U")) {
        e.preventDefault();
        showSecurityAlert("View Source is disabled.");
      }
    };

    const handleBlur = () => {
      setIsWindowBlurred(true);
    };

    const handleFocus = () => {
      setIsWindowBlurred(false);
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
    };
  }, [derivedKey]);

  // Bypass vault protection for standalone invoice view (needed for Admin view and direct access)
  if (pathname.includes("/vault/invoice/")) {
    return <>{children}</>;
  }

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
            <div className="logo-shield-container">
              <img 
                src="/assets/legacybridge-logo.png" 
                alt="LegacyBridge Logo" 
                style={{ height: "80px", width: "auto", objectFit: "contain" }} 
              />
            </div>
            <h1 className="signin-title" style={{ color: "#1a150e" }}>Vault Owner Details</h1>
            <p className="signin-subtitle" style={{ color: "#6b5a45" }}>Please fill in your details to continue.</p>
            <div className="header-divider"></div>
          </div>

          <form onSubmit={handleSubmit} className="signin-body" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label className="form-label" style={{ color: "#1a150e" }}>Full Name <span style={{ color: "var(--danger)" }}>*</span></label>
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
              <label className="form-label" style={{ color: "#1a150e" }}>Registered Mobile <span style={{ color: "var(--danger)" }}>*</span></label>
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
              <label className="form-label" style={{ color: "#1a150e" }}>Aadhaar Card No <span style={{ color: "var(--danger)" }}>*</span></label>
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
              <label className="form-label" style={{ color: "#1a150e" }}>PAN Card No <span style={{ color: "var(--danger)" }}>*</span></label>
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
              <label className="form-label" style={{ color: "#1a150e" }}>Address <span style={{ color: "var(--danger)" }}>*</span></label>
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
    <div 
      className={`vault-layout-container ${sidebarOpen ? "sidebar-open" : ""}`} 
      style={{ 
        minHeight: "100vh", 
        backgroundColor: "var(--bg-color)", 
        display: "flex", 
        position: "relative",
        filter: isWindowBlurred ? "blur(15px)" : "none",
        transition: "filter 0.15s ease"
      }}
    >
      <Sidebar />
      {sidebarOpen && (
        <div 
          className="sidebar-backdrop" 
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            zIndex: 99,
          }}
        />
      )}
      <div className="main-wrapper" style={{ minWidth: 0, flex: 1 }}>
        <TopNavbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        {readOnly && (
          <div 
            style={{ 
              backgroundColor: "#fef2f2", 
              borderBottom: "1px solid #fee2e2", 
              color: "#b91c1c", 
              padding: "12px 24px", 
              fontSize: "14px", 
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            <ShieldAlert size={16} style={{ flexShrink: 0 }} />
            <span>Read-Only Mode: Your free trial has expired. Please upgrade your plan to add or edit records.</span>
          </div>
        )}
        <main className="page-container">
          {children}
        </main>
      </div>

      {/* Floating Security Alert Toast */}
      {securityMessage && (
        <div style={{
          position: "fixed",
          bottom: "30px",
          left: "50%",
          transform: "translateX(-50%)",
          backgroundColor: "rgba(26, 21, 14, 0.95)",
          border: "1px solid #b28e46",
          color: "#ffffff",
          padding: "12px 24px",
          borderRadius: "8px",
          fontSize: "14px",
          fontWeight: "600",
          boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
          zIndex: 99999,
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}>
          <ShieldAlert size={18} style={{ color: "#b28e46" }} />
          <span>{securityMessage}</span>
        </div>
      )}
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
