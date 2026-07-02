"use client";

import React from "react";
import { User, Shield } from "lucide-react";
import { useVault } from "../components/VaultContext";

export default function VaultOwnerPage() {
  const { ownerDetails, loading } = useVault();

  if (loading) {
    return (
      <div className="panel-card flex-center" style={{ padding: "40px" }}>
        <span>Loading owner details...</span>
      </div>
    );
  }

  return (
    <div className="panel-card" style={{ maxWidth: "800px", margin: "0 auto" }}>
      <div 
        className="flex-between" 
        style={{ 
          borderBottom: "1px solid var(--card-border)", 
          paddingBottom: "16px", 
          marginBottom: "24px" 
        }}
      >
        <div>
          <h2 className="page-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <User style={{ color: "var(--primary)" }} />
            <span>Vault Owner Details</span>
          </h2>
          <span style={{ fontSize: "13px", color: "var(--muted)" }}>
            Personal details of the primary vault account holder.
          </span>
        </div>
      </div>

      {!ownerDetails ? (
        <div style={{ padding: "40px", textAlign: "center", border: "1px dashed var(--card-border)", borderRadius: "8px", backgroundColor: "rgba(0,0,0,0.1)" }}>
          <span style={{ color: "var(--muted)" }}>No owner details configured. Please reinitialize the vault to set details.</span>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div className="form-grid form-grid-3">
            <div style={{ backgroundColor: "#1e293b", padding: "14px", borderRadius: "8px", border: "1px solid var(--card-border)" }}>
              <span style={{ fontSize: "11px", color: "var(--muted)", fontWeight: "600", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
                Full Name
              </span>
              <strong style={{ fontSize: "15px", color: "#fff", wordBreak: "break-all" }}>{ownerDetails.name}</strong>
            </div>

            <div style={{ backgroundColor: "#1e293b", padding: "14px", borderRadius: "8px", border: "1px solid var(--card-border)" }}>
              <span style={{ fontSize: "11px", color: "var(--muted)", fontWeight: "600", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
                Registered Mobile
              </span>
              <strong style={{ fontSize: "15px", color: "#fff", wordBreak: "break-all" }}>{ownerDetails.phoneNo}</strong>
            </div>

            <div style={{ backgroundColor: "#1e293b", padding: "14px", borderRadius: "8px", border: "1px solid var(--card-border)" }}>
              <span style={{ fontSize: "11px", color: "var(--muted)", fontWeight: "600", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
                Aadhaar Card Number
              </span>
              <strong style={{ fontSize: "15px", color: "#fff", wordBreak: "break-all" }}>{ownerDetails.aadhaarNo}</strong>
            </div>

            <div style={{ backgroundColor: "#1e293b", padding: "14px", borderRadius: "8px", border: "1px solid var(--card-border)" }}>
              <span style={{ fontSize: "11px", color: "var(--muted)", fontWeight: "600", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
                PAN Card Number
              </span>
              <strong style={{ fontSize: "15px", color: "#fff", wordBreak: "break-all" }}>{ownerDetails.panCardNo}</strong>
            </div>
          </div>

          <div style={{ backgroundColor: "#1e293b", padding: "14px", borderRadius: "8px", border: "1px solid var(--card-border)" }}>
            <span style={{ fontSize: "11px", color: "var(--muted)", fontWeight: "600", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
              Address
            </span>
            <strong style={{ fontSize: "15px", color: "#fff", whiteSpace: "pre-line", wordBreak: "break-word" }}>{ownerDetails.address}</strong>
          </div>

          <div 
            style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "10px", 
              backgroundColor: "rgba(16, 185, 129, 0.05)", 
              border: "1px solid rgba(16, 185, 129, 0.2)", 
              padding: "12px 16px", 
              borderRadius: "8px",
              marginTop: "8px"
            }}
          >
            <Shield style={{ color: "#10b981", flexShrink: 0 }} size={20} />
            <span style={{ fontSize: "13px", color: "#a7f3d0" }}>
              Your data has been successfully stored in the Google Drive of your registered email address.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
