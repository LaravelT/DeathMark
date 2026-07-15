"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Coins, ShieldAlert, Building2, UserCheck, Download } from "lucide-react";
import { useVault, INSTRUMENT_TYPES, formatDateTime } from "./VaultContext";

export default function DashboardSummary() {
  const router = useRouter();
  const { vaultIndex, isDemo, getCategoryCount, nomineeDetails, lastLogin, getCategoryLastUpdated, searchTerm, isExpired, plan } = useVault();

  const [showSuccessBanner, setShowSuccessBanner] = React.useState(false);
  const [showRechargeModal, setShowRechargeModal] = React.useState(false);
  const [paymentHistory, setPaymentHistory] = React.useState<any[]>([]);

  React.useEffect(() => {
    if (isDemo) {
      setPaymentHistory([
        {
          orderId: "order_demo_1",
          invoiceNumber: "SP/LB/26-27/0001",
          createdAt: new Date().toISOString(),
          plan: "annual",
          totalAmount: 1180,
          status: "completed",
        }
      ]);
      return;
    }

    const fetchHistory = async () => {
      try {
        const res = await fetch("/api/payment/history");
        if (res.ok) {
          const data = await res.json();
          setPaymentHistory(data);
        }
      } catch (err) {
        console.error("Failed to load payment history:", err);
      }
    };
    fetchHistory();
  }, [isDemo]);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const activated = sessionStorage.getItem("just_activated_trial");
      if (activated === "true") {
        setShowSuccessBanner(true);
        sessionStorage.removeItem("just_activated_trial");
      }
      
      const dismissed = sessionStorage.getItem("recharge_prompt_dismissed");
      if (isExpired && dismissed !== "true") {
        setShowRechargeModal(true);
      }
    }
  }, [isExpired]);

  const handleCancelRecharge = () => {
    setShowRechargeModal(false);
    sessionStorage.setItem("recharge_prompt_dismissed", "true");
  };

  const handleRecharge = () => {
    router.push(isDemo ? "/vault/plans?demo=true" : "/vault/plans");
  };

  const totalAssets = vaultIndex.files.length;
  const uniqueCategories = new Set(vaultIndex.files.map(f => f.category)).size;

  return (
    <div>
      {/* Trial Activated Banner */}
      {showSuccessBanner && (
        <div 
          style={{ 
            backgroundColor: "#ecfdf5", 
            border: "1px solid #10b981", 
            borderRadius: "12px", 
            padding: "16px 20px", 
            marginBottom: "24px", 
            color: "#065f46", 
            fontWeight: "600",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <span>Your 48 hours free plan activated</span>
          <button 
            onClick={() => setShowSuccessBanner(false)}
            style={{ 
              background: "none", 
              border: "none", 
              color: "#065f46", 
              fontSize: "18px", 
              cursor: "pointer", 
              fontWeight: "700" 
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* Expiration Recharge Modal Dialog */}
      {showRechargeModal && (
        <div 
          style={{ 
            position: "fixed", 
            top: 0, 
            left: 0, 
            width: "100%", 
            height: "100%", 
            backgroundColor: "rgba(0,0,0,0.5)", 
            display: "flex", 
            justifyContent: "center", 
            alignItems: "center", 
            zIndex: 99999,
            padding: "20px"
          }}
        >
          <div 
            style={{ 
              backgroundColor: "#ffffff", 
              borderRadius: "20px", 
              padding: "32px", 
              maxWidth: "480px", 
              width: "100%",
              boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
              textAlign: "center",
              border: "1px solid rgba(217, 184, 133, 0.3)"
            }}
          >
            <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "24px", fontWeight: "750", color: "#1a150e", marginBottom: "16px" }}>
              Please recharge the plan
            </h2>
            <p style={{ color: "var(--muted)", fontSize: "15px", lineHeight: "1.6", marginBottom: "28px" }}>
              Your 48-hour free trial has expired. To continue adding new wealth details or configuring nominees, please upgrade/recharge your plan.
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button 
                onClick={handleRecharge} 
                style={{ 
                  flex: 1,
                  padding: "12px 24px", 
                  backgroundColor: "#b28e46", 
                  color: "#ffffff", 
                  border: "none", 
                  borderRadius: "10px", 
                  fontWeight: "700", 
                  cursor: "pointer" 
                }}
              >
                Recharge
              </button>
              <button 
                onClick={handleCancelRecharge} 
                style={{ 
                  flex: 1,
                  padding: "12px 24px", 
                  backgroundColor: "#f3f4f6", 
                  color: "#1a150e", 
                  border: "1px solid #e5e7eb", 
                  borderRadius: "10px", 
                  fontWeight: "700", 
                  cursor: "pointer" 
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px", gap: "20px", flexWrap: "wrap" }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: "8px", fontFamily: "'Playfair Display', Georgia, serif", fontSize: "30px", fontWeight: "700" }}>Secure Inheritance Vault</h1>
          <p style={{ color: "var(--muted)", fontSize: "14px", margin: 0 }}>
            Your zero-knowledge encrypted portfolio stored safely inside your Google Drive.
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {plan && (
            <div style={{ padding: "8px 14px", backgroundColor: "#ffffff", border: "1px solid var(--card-border)", borderRadius: "12px", textAlign: "right", boxShadow: "0 4px 12px rgba(139, 92, 26, 0.02)" }}>
              <span style={{ fontSize: "10px", color: "var(--muted)", fontWeight: "600", textTransform: "uppercase", display: "block", marginBottom: "2px" }}>
                Active Plan
              </span>
              <strong style={{ fontSize: "13px", color: isExpired ? "#ef4444" : "#10b981" }}>
                {(() => {
                  if (plan === "free_trial") {
                    return isExpired ? "48-Hour Free Trial (Expired)" : "48-Hour Free Trial (Active)";
                  }
                  if (plan === "annual") {
                    return isExpired ? "Annual Subscription (Expired)" : "Annual Subscription (Active)";
                  }
                  if (plan === "lifetime") {
                    return "Lifetime Premium (Active)";
                  }
                  return "No Active Plan";
                })()}
              </strong>
            </div>
          )}
          {lastLogin && (
            <div style={{ padding: "8px 14px", backgroundColor: "#ffffff", border: "1px solid var(--card-border)", borderRadius: "12px", textAlign: "right", boxShadow: "0 4px 12px rgba(139, 92, 26, 0.02)" }}>
              <span style={{ fontSize: "10px", color: "var(--muted)", fontWeight: "600", textTransform: "uppercase", display: "block", marginBottom: "2px" }}>
                Last Login Session
              </span>
              <strong style={{ fontSize: "13px", color: "#b28e46" }}>{lastLogin}</strong>
            </div>
          )}
        </div>
      </div>

      {/* Nominee Banner Card */}
      <div 
        className="panel-card" 
        style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between", 
          padding: "20px 24px", 
          background: "#ffffff", 
          border: "1px solid rgba(217, 184, 133, 0.25)", 
          borderRadius: "16px", 
          marginBottom: "24px",
          boxShadow: "0 10px 30px rgba(139, 92, 26, 0.03)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div className="flex-center" style={{ width: "48px", height: "48px", borderRadius: "12px", backgroundColor: "#fbf5e6", color: "#b28e46" }}>
            <UserCheck size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: "750", color: "#1a150e", margin: 0 }}>
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
          style={{ padding: "10px 20px", fontSize: "13px", backgroundColor: "#0a122c", borderRadius: "8px", fontWeight: "700" }}
        >
          {nomineeDetails ? "Manage Nominee" : "Add Nominee for Your All Details"}
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="form-grid form-grid-3" style={{ marginBottom: "24px" }}>
        <div className="panel-card" style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: 0, padding: "20px", borderRadius: "16px" }}>
          <div className="flex-center" style={{ width: "48px", height: "48px", borderRadius: "12px", backgroundColor: "#fbf5e6", color: "#b28e46" }}>
            <Coins size={22} />
          </div>
          <div>
            <span style={{ fontSize: "12px", color: "var(--muted)", display: "block" }}>Total Recorded Assets</span>
            <strong style={{ fontSize: "24px", color: "#1a150e" }}>{totalAssets}</strong>
          </div>
        </div>

        <div className="panel-card" style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: 0, padding: "20px", borderRadius: "16px" }}>
          <div className="flex-center" style={{ width: "48px", height: "48px", borderRadius: "12px", backgroundColor: "#fbf5e6", color: "#b28e46" }}>
            <ShieldAlert size={22} />
          </div>
          <div>
            <span style={{ fontSize: "12px", color: "var(--muted)", display: "block" }}>Storage Status</span>
            <strong style={{ fontSize: "15px", color: "var(--success)", display: "block", marginTop: "4px", fontWeight: "700" }}>
              {isDemo ? "Browser LocalStorage" : "Connected: Google Drive"}
            </strong>
          </div>
        </div>

        <div className="panel-card" style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: 0, padding: "20px", borderRadius: "16px" }}>
          <div className="flex-center" style={{ width: "48px", height: "48px", borderRadius: "12px", backgroundColor: "#fbf5e6", color: "#b28e46" }}>
            <Building2 size={22} />
          </div>
          <div>
            <span style={{ fontSize: "12px", color: "var(--muted)", display: "block" }}>Instruments Enrolled</span>
            <strong style={{ fontSize: "24px", color: "#1a150e" }}>{uniqueCategories}</strong>
          </div>
        </div>
      </div>

      {/* Categories Grid List */}
      <h2 style={{ fontSize: "19px", fontWeight: "750", color: "#1a150e", margin: "32px 0 16px 0" }}>Instruments Distribution</h2>
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
                padding: "18px 20px", 
                cursor: "pointer", 
                transition: "all 0.2s ease", 
                borderLeft: count > 0 ? "4px solid var(--primary)" : "1px solid var(--card-border)",
                borderTopRightRadius: "16px",
                borderBottomRightRadius: "16px",
                borderTopLeftRadius: count > 0 ? "0px" : "16px",
                borderBottomLeftRadius: count > 0 ? "0px" : "16px",
                marginBottom: 0,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                minHeight: "84px"
              }}
            >
              <div className="flex-between" style={{ width: "100%", alignItems: "center" }}>
                <span style={{ fontSize: "14px", fontWeight: "700", color: "#1a150e" }}>{type.label}</span>
                <span style={{ fontSize: "11px", padding: "3px 8px", borderRadius: "10px", backgroundColor: count > 0 ? "#fbf5e6" : "#faf7f0", color: count > 0 ? "#b28e46" : "var(--muted)", fontWeight: "bold", whiteSpace: "nowrap" }}>
                  {count} Record(s)
                </span>
              </div>
              {lastUpdatedStr && (
                <div style={{ marginTop: "8px", borderTop: "1px solid rgba(217,184,133,0.12)", paddingTop: "6px", fontSize: "10.5px", color: "var(--muted)" }}>
                  Last Update: <span style={{ color: "#b28e46", fontWeight: "600" }}>{lastUpdatedStr}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Billing & Invoices History */}
      {paymentHistory.length > 0 && (
        <div style={{ marginTop: "40px" }}>
          <h2 style={{ fontSize: "19px", fontWeight: "750", color: "#1a150e", margin: "24px 0 16px 0" }}>Billing & Invoices</h2>
          <div 
            className="panel-card" 
            style={{ 
              padding: "24px", 
              background: "#ffffff", 
              border: "1px solid rgba(217, 184, 133, 0.25)", 
              borderRadius: "16px",
              boxShadow: "0 10px 30px rgba(139, 92, 26, 0.03)",
              overflowX: "auto"
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <th style={{ padding: "12px 16px", fontSize: "12px", fontWeight: "700", textTransform: "uppercase", color: "var(--muted)" }}>Date</th>
                  <th style={{ padding: "12px 16px", fontSize: "12px", fontWeight: "700", textTransform: "uppercase", color: "var(--muted)" }}>Plan</th>
                  <th style={{ padding: "12px 16px", fontSize: "12px", fontWeight: "700", textTransform: "uppercase", color: "var(--muted)" }}>Invoice Number</th>
                  <th style={{ padding: "12px 16px", fontSize: "12px", fontWeight: "700", textTransform: "uppercase", color: "var(--muted)" }}>Amount</th>
                  <th style={{ padding: "12px 16px", fontSize: "12px", fontWeight: "700", textTransform: "uppercase", color: "var(--muted)", textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {paymentHistory.map((p) => {
                  const pDate = new Date(p.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric"
                  });
                  return (
                    <tr key={p.orderId} style={{ borderBottom: "1px solid #f3f4f6" }}>
                      <td style={{ padding: "16px", fontSize: "14px", color: "#6b5a45" }}>{pDate}</td>
                      <td style={{ padding: "16px", fontSize: "14px", color: "#1a150e", fontWeight: "600", textTransform: "capitalize" }}>{p.plan} Access</td>
                      <td style={{ padding: "16px", fontSize: "14px", color: "#1a150e" }}>{p.invoiceNumber}</td>
                      <td style={{ padding: "16px", fontSize: "14px", color: "#1a150e", fontWeight: "600" }}>₹{p.totalAmount}</td>
                      <td style={{ padding: "16px", textAlign: "right" }}>
                        <button
                          onClick={() => router.push(isDemo ? `/vault/invoice/${p.orderId}?demo=true` : `/vault/invoice/${p.orderId}`)}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "8px 12px",
                            backgroundColor: "#fbf5e6",
                            color: "#b28e46",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "12px",
                            fontWeight: "700"
                          }}
                        >
                          <Download size={14} /> Download Invoice
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
