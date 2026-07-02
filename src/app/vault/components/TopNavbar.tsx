"use client";

import React from "react";
import { Search, ShieldAlert, Download } from "lucide-react";
import { useVault } from "./VaultContext";

export default function TopNavbar() {
  const { searchTerm, setSearchTerm, handleVerifyIntegrity, handleExportVault } = useVault();

  return (
    <header className="top-navbar">
      <div style={{ display: "flex", alignItems: "center", gap: "12px", width: "360px" }}>
        <Search size={18} style={{ color: "var(--muted)" }} />
        <input 
          type="text" 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
          placeholder="Search records here..." 
          style={{ border: "none", outline: "none", fontSize: "14px", width: "100%", backgroundColor: "transparent", color: "#fff" }} 
        />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <button onClick={handleVerifyIntegrity} className="btn-outline" style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px" }}>
          <ShieldAlert size={14} style={{ color: "var(--secondary)" }} />
          <span>Sync Integrity</span>
        </button>
        {/*
        <button onClick={handleExportVault} className="btn-outline" style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px" }}>
          <Download size={14} />
          <span>Export Vault</span>
        </button>
        */}
      </div>
    </header>
  );
}
