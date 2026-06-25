"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Coins, ShieldAlert, Building2 } from "lucide-react";
import { useVault, INSTRUMENT_TYPES } from "./VaultContext";

export default function DashboardSummary() {
  const router = useRouter();
  const { vaultIndex, isDemo, getCategoryCount } = useVault();

  const totalAssets = vaultIndex.files.length;
  const uniqueCategories = new Set(vaultIndex.files.map(f => f.category)).size;

  return (
    <div>
      <h1 className="page-title" style={{ marginBottom: "8px" }}>Secure Inheritance Vault</h1>
      <p style={{ color: "var(--muted)", fontSize: "14px", marginBottom: "24px" }}>
        Your zero-knowledge encrypted portfolio stored safely inside your Google Drive.
      </p>

      {/* Statistics Cards */}
      <div className="form-grid form-grid-3" style={{ marginBottom: "24px" }}>
        <div className="panel-card" style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: 0 }}>
          <div className="flex-center" style={{ width: "48px", height: "48px", borderRadius: "12px", backgroundColor: "rgba(99, 102, 241, 0.1)", color: "var(--primary)" }}>
            <Coins size={24} />
          </div>
          <div>
            <span style={{ fontSize: "13px", color: "var(--muted)", display: "block" }}>Total Recorded Assets</span>
            <strong style={{ fontSize: "24px", color: "#ffffff" }}>{totalAssets}</strong>
          </div>
        </div>

        <div className="panel-card" style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: 0 }}>
          <div className="flex-center" style={{ width: "48px", height: "48px", borderRadius: "12px", backgroundColor: "rgba(239, 68, 68, 0.1)", color: "#f87171" }}>
            <ShieldAlert size={24} />
          </div>
          <div>
            <span style={{ fontSize: "13px", color: "var(--muted)", display: "block" }}>Storage Status</span>
            <strong style={{ fontSize: "15px", color: "var(--success)", display: "block", marginTop: "4px" }}>
              {isDemo ? "Browser LocalStorage" : "Connected: Google Drive"}
            </strong>
          </div>
        </div>

        <div className="panel-card" style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: 0 }}>
          <div className="flex-center" style={{ width: "48px", height: "48px", borderRadius: "12px", backgroundColor: "rgba(168, 85, 247, 0.1)", color: "var(--secondary)" }}>
            <Building2 size={24} />
          </div>
          <div>
            <span style={{ fontSize: "13px", color: "var(--muted)", display: "block" }}>Instruments Enrolled</span>
            <strong style={{ fontSize: "24px", color: "#ffffff" }}>{uniqueCategories}</strong>
          </div>
        </div>
      </div>

      {/* Categories Grid List */}
      <h2 style={{ fontSize: "18px", fontWeight: "750", color: "#ffffff", margin: "24px 0 16px 0" }}>Instruments Distribution</h2>
      <div className="form-grid form-grid-3">
        {INSTRUMENT_TYPES.map((type) => {
          const count = getCategoryCount(type.id);
          return (
            <div 
              key={type.id} 
              onClick={() => router.push(`/vault/${type.id}`)}
              className="panel-card flex-between" 
              style={{ 
                padding: "16px 20px", 
                cursor: "pointer", 
                transition: "transform 0.15s", 
                borderLeft: count > 0 ? "4px solid var(--primary)" : "1px solid var(--card-border)",
                marginBottom: 0
              }}
            >
              <span style={{ fontSize: "14px", fontWeight: "600", color: "#cbd5e1" }}>{type.label}</span>
              <span style={{ fontSize: "12px", padding: "2px 8px", borderRadius: "10px", backgroundColor: count > 0 ? "rgba(99, 102, 241, 0.15)" : "#1e293b", color: count > 0 ? "#818cf8" : "var(--muted)", fontWeight: "bold" }}>
                {count} Record(s)
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
