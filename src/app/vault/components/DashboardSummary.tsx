"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Coins, ShieldAlert, Building2, UserCheck } from "lucide-react";
import { useVault, INSTRUMENT_TYPES, formatDateTime } from "./VaultContext";

export default function DashboardSummary() {
  const router = useRouter();
  const { vaultIndex, isDemo, getCategoryCount, nomineeDetails, lastLogin, getCategoryLastUpdated, searchTerm } = useVault();

  const totalAssets = vaultIndex.files.length;
  const uniqueCategories = new Set(vaultIndex.files.map(f => f.category)).size;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px", gap: "20px", flexWrap: "wrap" }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: "8px" }}>Secure Inheritance Vault</h1>
          <p style={{ color: "var(--muted)", fontSize: "14px", margin: 0 }}>
            Your zero-knowledge encrypted portfolio stored safely inside your Google Drive.
          </p>
        </div>
        {lastLogin && (
          <div style={{ padding: "8px 14px", backgroundColor: "#1e293b", border: "1px solid var(--card-border)", borderRadius: "8px", textAlign: "right" }}>
            <span style={{ fontSize: "10px", color: "var(--muted)", fontWeight: "600", textTransform: "uppercase", display: "block", marginBottom: "2px" }}>
              Last Login Session
            </span>
            <strong style={{ fontSize: "13px", color: "#38bdf8" }}>{lastLogin}</strong>
          </div>
        )}
      </div>

      {/* Nominee Banner Card */}
      <div 
        className="panel-card" 
        style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between", 
          padding: "20px 24px", 
          background: "linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(168, 85, 247, 0.12))", 
          border: "1px solid rgba(99, 102, 241, 0.25)", 
          borderRadius: "12px", 
          marginBottom: "24px" 
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div className="flex-center" style={{ width: "48px", height: "48px", borderRadius: "12px", backgroundColor: nomineeDetails ? "rgba(16, 185, 129, 0.15)" : "rgba(245, 158, 11, 0.15)", color: nomineeDetails ? "#34d399" : "#fbbf24" }}>
            <UserCheck size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#ffffff", margin: 0 }}>
              {nomineeDetails ? `Primary Nominee: ${nomineeDetails.name}` : "No Primary Nominee Configured"}
            </h3>
            <p style={{ color: "var(--muted)", fontSize: "13px", margin: "4px 0 0 0" }}>
              {nomineeDetails 
                ? "Your primary nominee is enrolled. They will receive secure access in case of an emergency." 
                : "Add a single primary nominee to receive access to your vault in case of emergency."}
            </p>
          </div>
        </div>
        <button 
          onClick={() => router.push(isDemo ? "/vault/nominee?demo=true" : "/vault/nominee")} 
          className="btn-blue" 
          style={{ padding: "8px 16px", fontSize: "13px" }}
        >
          {nomineeDetails ? "Manage Nominee" : "Add Nominee for Your All Details"}
        </button>
      </div>

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
        {INSTRUMENT_TYPES.filter((type) => {
          if (!searchTerm) return true;
          return type.label.toLowerCase().includes(searchTerm.toLowerCase());
        }).map((type) => {
          const count = getCategoryCount(type.id);
          const rawLastUpdated = getCategoryLastUpdated(type.id);
          const lastUpdatedStr = rawLastUpdated ? formatDateTime(rawLastUpdated) : "";
          return (
            <div 
              key={type.id} 
              onClick={() => router.push(isDemo ? `/vault/${type.id}?demo=true` : `/vault/${type.id}`)}
              className="panel-card" 
              style={{ 
                padding: "16px 20px", 
                cursor: "pointer", 
                transition: "transform 0.15s", 
                borderLeft: count > 0 ? "4px solid var(--primary)" : "1px solid var(--card-border)",
                marginBottom: 0,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                minHeight: "76px"
              }}
            >
              <div className="flex-between" style={{ width: "100%", alignItems: "center" }}>
                <span style={{ fontSize: "14px", fontWeight: "600", color: "#cbd5e1" }}>{type.label}</span>
                <span style={{ fontSize: "12px", padding: "2px 8px", borderRadius: "10px", backgroundColor: count > 0 ? "rgba(99, 102, 241, 0.15)" : "#1e293b", color: count > 0 ? "#818cf8" : "var(--muted)", fontWeight: "bold", whiteSpace: "nowrap" }}>
                  {count} Record(s)
                </span>
              </div>
              {lastUpdatedStr && (
                <div style={{ marginTop: "8px", borderTop: "1px solid rgba(255,255,255,0.03)", paddingTop: "6px", fontSize: "10.5px", color: "var(--muted)" }}>
                  Last Updated: <span style={{ color: "rgba(99, 102, 241, 0.85)", fontWeight: "500" }}>{lastUpdatedStr}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
