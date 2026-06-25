"use client";

import React from "react";
import { VaultProvider, useVault } from "./components/VaultContext";
import UnlockScreen from "./components/UnlockScreen";
import Sidebar from "./components/Sidebar";
import TopNavbar from "./components/TopNavbar";

function VaultLayoutInner({ children }: { children: React.ReactNode }) {
  const { derivedKey, loading, loadingMessage } = useVault();

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
    <VaultProvider>
      <VaultLayoutInner>{children}</VaultLayoutInner>
    </VaultProvider>
  );
}
