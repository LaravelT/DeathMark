"use client";

import React, { useState, useEffect } from "react";
import { KeyRound, ShieldAlert, FileText, CheckCircle, XCircle, ArrowLeft, RefreshCw, Eye, UserCheck, Settings, LogOut, Trash2, Coins, Download } from "lucide-react";
import Link from "next/link";

const formatAdminDate = (isoString?: string): string => {
  if (!isoString) return "";
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return "";
  
  const pad = (n: number) => String(n).padStart(2, "0");
  const dd = pad(d.getDate());
  const mm = pad(d.getMonth() + 1);
  const yyyy = d.getFullYear();
  
  let hours = d.getHours();
  const minutes = pad(d.getMinutes());
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;
  const hh = pad(hours);
  
  return `${dd}/${mm}/${yyyy} ${hh}:${minutes} ${ampm}`;
};

export default function AdminPage() {
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [emailLoading, setEmailLoading] = useState<string | null>(null);
  const [emailSentId, setEmailSentId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  // Tab State & Payments history
  const [activeTab, setActiveTab] = useState<"claims" | "payments">("claims");
  const [payments, setPayments] = useState<any[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState("");

  useEffect(() => {
    const authStatus = sessionStorage.getItem("legacybridge_admin_auth");
    if (authStatus === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    if (usernameInput === "chirag" && passwordInput === "2102") {
      sessionStorage.setItem("legacybridge_admin_auth", "true");
      setIsAuthenticated(true);
    } else {
      setLoginError("Invalid Admin Username or Password.");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("legacybridge_admin_auth");
    setIsAuthenticated(false);
  };

  const fetchClaims = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/claims");
      if (!res.ok) throw new Error("Failed to load claims.");
      const data = await res.json();
      setClaims(data.claims || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPayments = async () => {
    setPaymentsLoading(true);
    try {
      const res = await fetch("/api/admin/payments");
      if (!res.ok) throw new Error("Failed to load payments.");
      const data = await res.json();
      setPayments(data.payments || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setPaymentsLoading(false);
    }
  };

  const refreshAll = () => {
    fetchClaims();
    fetchPayments();
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchClaims();
      fetchPayments();
    }
  }, [isAuthenticated]);

  const handleAction = async (claimId: string, newStatus: "Approved" | "Rejected") => {
    setActionLoading(claimId);
    try {
      const res = await fetch("/api/admin/claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claimId, status: newStatus })
      });
      if (!res.ok) throw new Error("Action failed.");
      
      // Update state locally
      setClaims(prev => prev.map(c => c._id === claimId ? { ...c, status: newStatus } : c));
    } catch (err: any) {
      alert("Failed to update status: " + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSendEmail = async (claim: any) => {
    const currentCount = claim.copyCount || 0;
    if (currentCount >= 3) return;

    setEmailLoading(claim._id);
    try {
      const accessLink = `${window.location.origin}/claim/access?email=${encodeURIComponent(claim.ownerEmail)}&claimId=${claim._id}`;
      
      const res = await fetch("/api/admin/claims/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claimId: claim._id, accessLink })
      });

      const data = await res.json();
      if (res.ok) {
        setClaims(prev => prev.map(c => c._id === claim._id ? { ...c, copyCount: currentCount + 1 } : c));
        setEmailSentId(claim._id);
        if (data.simulated) {
          alert(data.message);
        }
        setTimeout(() => setEmailSentId(null), 3000);
      } else {
        alert("Failed to send email: " + data.error);
      }
    } catch (e: any) {
      console.error("Failed to send email:", e);
      alert("Error: " + e.message);
    } finally {
      setEmailLoading(null);
    }
  };
  const handleDeleteClaim = async (claimId: string) => {
    if (!confirm("Are you sure you want to permanently delete this claim?")) return;
    setDeleteLoading(claimId);
    try {
      const res = await fetch(`/api/admin/claims?claimId=${claimId}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("Delete failed.");
      
      // Update state locally
      setClaims(prev => prev.filter(c => c._id !== claimId));
    } catch (err: any) {
      alert("Failed to delete claim: " + err.message);
    } finally {
      setDeleteLoading(null);
    }
  };
  if (!isAuthenticated) {
    return (
      <div className="signin-wrapper flex-center" style={{ minHeight: "100vh", padding: "20px", flexDirection: "column", backgroundColor: "#faf7f0" }}>
        <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "32px" }}>
          <img 
            src="/assets/legacybridge-logo.png" 
            alt="LegacyBridge Logo" 
            style={{ height: "48px", width: "auto", objectFit: "contain" }} 
          />
          <span className="brand-title" style={{ fontSize: "20px", fontWeight: "700", color: "#1a150e", WebkitTextFillColor: "#1a150e", letterSpacing: "0.01em" }}>
            LegacyBridge Super Admin
          </span>
        </div>

        <div className="signin-card" style={{ maxWidth: "420px", width: "100%", padding: "40px 30px", backgroundColor: "#ffffff", borderRadius: "28px", border: "1px solid rgba(217, 184, 133, 0.25)", boxShadow: "0 20px 50px rgba(139, 92, 26, 0.04)" }}>
          <div className="signin-header">
            <div className="logo-shield-container">
              <img 
                src="/assets/legacybridge-logo.png" 
                alt="LegacyBridge Logo" 
                style={{ height: "80px", width: "auto", objectFit: "contain" }} 
              />
            </div>
            <h1 className="signin-title" style={{ color: "#1a150e" }}>Admin Sign In</h1>
            <p className="signin-subtitle" style={{ color: "#6b5a45" }}>Please enter your credentials to access manager.</p>
            <div className="header-divider"></div>
          </div>

          <form onSubmit={handleLoginSubmit} className="signin-body" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label className="form-label" style={{ color: "#1a150e" }}>Username</label>
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="Enter username"
                required
                className="signin-input"
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label className="form-label" style={{ color: "#1a150e" }}>Password</label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter password"
                required
                className="signin-input"
              />
            </div>

            {loginError && (
              <div style={{ display: "flex", gap: "8px", alignItems: "center", color: "#b91c1c", fontSize: "13px" }}>
                <ShieldAlert size={16} />
                <span>{loginError}</span>
              </div>
            )}

            <button type="submit" className="btn-cta-primary" style={{ width: "100%", border: "none", marginTop: "10px" }}>
              Sign In
            </button>
            <a href="/" style={{ color: "var(--muted)", fontSize: "14px", textAlign: "center", textDecoration: "none", marginTop: "4px" }}>
              Back to Landing Page
            </a>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      {/* Sidebar Layout */}
      <aside className="admin-sidebar">
        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
          {/* Logo */}
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <img 
              src="/assets/legacybridge-logo.png" 
              alt="LegacyBridge Logo" 
              style={{ height: "48px", width: "auto", objectFit: "contain" }} 
            />
            <span className="brand-title" style={{ fontSize: "18px", fontWeight: "700", color: "#1a150e", WebkitTextFillColor: "#1a150e", letterSpacing: "0.01em" }}>LegacyBridge</span>
          </div>

          {/* Navigation Menu */}
          <nav style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <button 
              onClick={() => setActiveTab("claims")}
              style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "10px", 
                padding: "10px 14px", 
                borderRadius: "8px", 
                backgroundColor: activeTab === "claims" ? "rgba(178, 142, 70, 0.08)" : "transparent", 
                color: activeTab === "claims" ? "var(--primary)" : "#6b5a45",
                fontWeight: activeTab === "claims" ? "700" : "600",
                fontSize: "14px",
                border: "none",
                cursor: "pointer",
                textAlign: "left",
                width: "100%"
              }}
            >
              <UserCheck size={18} />
              <span>Claims Manager</span>
            </button>

            <button 
              onClick={() => setActiveTab("payments")}
              style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "10px", 
                padding: "10px 14px", 
                borderRadius: "8px", 
                backgroundColor: activeTab === "payments" ? "rgba(178, 142, 70, 0.08)" : "transparent", 
                color: activeTab === "payments" ? "var(--primary)" : "#6b5a45",
                fontWeight: activeTab === "payments" ? "700" : "600",
                fontSize: "14px",
                border: "none",
                cursor: "pointer",
                textAlign: "left",
                width: "100%"
              }}
            >
              <Coins size={18} />
              <span>Payments & Invoices</span>
            </button>

            <button 
              onClick={refreshAll}
              style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "10px", 
                padding: "10px 14px", 
                borderRadius: "8px", 
                backgroundColor: "transparent", 
                color: "#6b5a45",
                border: "none",
                cursor: "pointer",
                textAlign: "left",
                fontSize: "14px",
                width: "100%",
                fontWeight: "600"
              }}
              className="sidebar-btn-hover"
            >
              <RefreshCw size={18} className={loading || paymentsLoading ? "spin" : ""} />
              <span>Refresh Records</span>
            </button>
          </nav>
        </div>

        {/* Footer actions in sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <Link href="/" style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "10px", 
            padding: "10px 14px", 
            borderRadius: "8px", 
            color: "#6b5a45",
            textDecoration: "none",
            fontSize: "14px",
            fontWeight: "600"
          }}>
            <ArrowLeft size={18} />
            <span>Go to Landing Page</span>
          </Link>
          <button 
            onClick={handleLogout}
            style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "10px", 
              padding: "10px 14px", 
              borderRadius: "8px", 
              backgroundColor: "rgba(239, 68, 68, 0.05)", 
              color: "#b91c1c",
              border: "1px solid rgba(239, 68, 68, 0.15)",
              cursor: "pointer",
              fontSize: "14px",
              width: "100%",
              fontWeight: "600"
            }}
          >
            <LogOut size={18} />
            <span>Admin Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Panel Content Area */}
      <main className="admin-main">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 className="page-title" style={{ fontSize: "28px", margin: 0, fontFamily: "'Playfair Display', Georgia, serif" }}>
              {activeTab === "claims" ? "Beneficiary Claims Manager" : "Payments & Invoices History"}
            </h1>
            <span style={{ fontSize: "14px", color: "#6b5a45" }}>
              {activeTab === "claims" 
                ? "Verify relative claims and documents from the claims database." 
                : "View payments history, user billing details, and download invoices."
              }
            </span>
          </div>
        </div>

        {activeTab === "claims" ? (
          <div className="panel-card" style={{ padding: "30px", backgroundColor: "#ffffff" }}>
            {error && (
              <div style={{ display: "flex", gap: "10px", alignItems: "center", padding: "14px", backgroundColor: "#fef2f2", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "8px", color: "#b91c1c", fontSize: "14px", marginBottom: "24px" }}>
                <ShieldAlert size={18} />
                <span>Error loading claims: {error}</span>
              </div>
            )}

            {loading ? (
              <div style={{ textAlign: "center", padding: "80px", color: "var(--muted)" }}>
                Loading submitted claims...
              </div>
            ) : claims.length === 0 ? (
              <div style={{ textAlign: "center", padding: "80px 40px", border: "1px dashed rgba(217, 184, 133, 0.3)", borderRadius: "10px", backgroundColor: "#faf7f0" }}>
                <FileText size={40} style={{ color: "var(--muted)", marginBottom: "12px" }} />
                <p style={{ color: "var(--muted)", margin: 0 }}>No claims submitted yet.</p>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid var(--card-border)", color: "#6b5a45", fontWeight: "600", backgroundColor: "#faf7f0" }}>
                      <th style={{ padding: "12px" }}>Submitted Date</th>
                      <th style={{ padding: "12px" }}>Relative (Claimant)</th>
                      <th style={{ padding: "12px" }}>Owner Email</th>
                      <th style={{ padding: "12px" }}>Reason</th>
                      <th style={{ padding: "12px" }}>Document</th>
                      <th style={{ padding: "12px" }}>Status</th>
                      <th style={{ padding: "12px" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {claims.map((claim) => (
                      <tr key={claim._id} style={{ borderBottom: "1px solid var(--card-border)", transition: "background 0.2s" }} className="table-row-hover">
                        <td style={{ padding: "16px 12px", color: "#1a150e", fontWeight: "600" }}>
                          {formatAdminDate(claim.submittedAt)}
                        </td>
                        <td style={{ padding: "16px 12px" }}>
                          <div style={{ color: "#1a150e", fontWeight: "700" }}>{claim.claimantName}</div>
                          <div style={{ fontSize: "12px", color: "#8c7a6b" }}>{claim.claimantGmail}</div>
                        </td>
                        <td style={{ padding: "16px 12px", color: "#5c4d3c", fontWeight: "600" }}>
                          {claim.ownerEmail}
                        </td>
                        <td style={{ padding: "16px 12px", color: "#6b5a45", maxWidth: "250px", wordBreak: "break-word" }}>
                          {claim.reason}
                        </td>
                        <td style={{ padding: "16px 12px" }}>
                          {claim.document ? (
                            <button 
                              onClick={() => setSelectedDoc(claim.document)} 
                              className="btn-outline" 
                              style={{ 
                                display: "flex", 
                                alignItems: "center", 
                                gap: "4px", 
                                fontSize: "12px", 
                                padding: "4px 8px", 
                                color: "var(--primary)", 
                                borderColor: "rgba(217, 184, 133, 0.4)" 
                              }}
                            >
                              <Eye size={12} />
                              <span>View</span>
                            </button>
                          ) : (
                            <span style={{ color: "var(--muted)" }}>No Doc</span>
                          )}
                        </td>
                        <td style={{ padding: "16px 12px" }}>
                          <span style={{
                            fontSize: "12px",
                            fontWeight: "600",
                            padding: "3px 8px",
                            borderRadius: "10px",
                            backgroundColor: claim.status === "Approved" ? "rgba(16,185,129,0.15)" : claim.status === "Rejected" ? "rgba(239,68,68,0.15)" : "rgba(245,158,11,0.15)",
                            color: claim.status === "Approved" ? "#10b981" : claim.status === "Rejected" ? "#b91c1c" : "#b28e46",
                            whiteSpace: "nowrap"
                          }}>
                            {claim.status}
                          </span>
                        </td>
                        <td style={{ padding: "16px 12px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px", justifyContent: "space-between" }}>
                            <div>
                              {claim.status === "Pending Review" ? (
                                <div style={{ display: "flex", gap: "8px" }}>
                                  <button 
                                    onClick={() => handleAction(claim._id, "Approved")} 
                                    disabled={actionLoading === claim._id}
                                    style={{ 
                                      display: "flex", 
                                      alignItems: "center", 
                                      gap: "4px", 
                                      backgroundColor: "#10b981", 
                                      color: "#fff", 
                                      border: "none", 
                                      padding: "6px 10px", 
                                      borderRadius: "6px", 
                                      cursor: "pointer", 
                                      fontSize: "12px",
                                      fontWeight: "600"
                                    }}
                                  >
                                    <CheckCircle size={14} />
                                    <span>Approve</span>
                                  </button>
                                  <button 
                                    onClick={() => handleAction(claim._id, "Rejected")} 
                                    disabled={actionLoading === claim._id}
                                    style={{ 
                                      display: "flex", 
                                      alignItems: "center", 
                                      gap: "4px", 
                                      backgroundColor: "#b91c1c", 
                                      color: "#fff", 
                                      border: "none", 
                                      padding: "6px 10px", 
                                      borderRadius: "6px", 
                                      cursor: "pointer", 
                                      fontSize: "12px",
                                      fontWeight: "600"
                                    }}
                                  >
                                    <XCircle size={14} />
                                    <span>Reject</span>
                                  </button>
                                </div>
                              ) : claim.status === "Approved" ? (
                                (claim.copyCount || 0) >= 1 ? (
                                  <span style={{ color: "#10b981", fontWeight: "600", fontSize: "12px", whiteSpace: "nowrap" }}>
                                    Email Sent Successfully
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => handleSendEmail(claim)}
                                    disabled={emailLoading === claim._id}
                                    className="btn-outline"
                                    style={{
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: "6px",
                                      fontSize: "12px",
                                      padding: "6px 12px",
                                      color: emailSentId === claim._id ? "#10b981" : "var(--primary)",
                                      borderColor: emailSentId === claim._id ? "#10b981" : "rgba(217,184,133,0.4)",
                                      backgroundColor: emailSentId === claim._id ? "rgba(16,185,129,0.05)" : "rgba(178,142,70,0.05)",
                                      borderRadius: "6px",
                                      cursor: "pointer"
                                    }}
                                  >
                                    <span>
                                      {emailLoading === claim._id 
                                        ? "Sending..." 
                                        : emailSentId === claim._id 
                                          ? "Email Sent!" 
                                          : "Send Email"
                                      }
                                    </span>
                                  </button>
                                )
                              ) : (
                                <span style={{ color: "var(--muted)", fontSize: "12px" }}>Rejected</span>
                              )}
                            </div>
                            
                            <button
                              onClick={() => handleDeleteClaim(claim._id)}
                              disabled={deleteLoading === claim._id}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                backgroundColor: "transparent",
                                border: "1px solid rgba(239, 68, 68, 0.25)",
                                color: "#b91c1c",
                                padding: "6px",
                                borderRadius: "6px",
                                cursor: "pointer",
                                transition: "all 0.2s"
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.08)"; }}
                              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                              title="Delete claim record"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div className="panel-card" style={{ padding: "30px", backgroundColor: "#ffffff" }}>
            {paymentsLoading ? (
              <div style={{ textAlign: "center", padding: "80px", color: "var(--muted)" }}>
                Loading payment history...
              </div>
            ) : payments.length === 0 ? (
              <div style={{ textAlign: "center", padding: "80px 40px", border: "1px dashed rgba(217, 184, 133, 0.3)", borderRadius: "10px", backgroundColor: "#faf7f0" }}>
                <Coins size={40} style={{ color: "var(--muted)", marginBottom: "12px" }} />
                <p style={{ color: "var(--muted)", margin: 0 }}>No payments recorded yet.</p>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid var(--card-border)", color: "#6b5a45", fontWeight: "600", backgroundColor: "#faf7f0" }}>
                      <th style={{ padding: "12px" }}>Date</th>
                      <th style={{ padding: "12px" }}>User Email</th>
                      <th style={{ padding: "12px" }}>Billing Details</th>
                      <th style={{ padding: "12px" }}>Plan</th>
                      <th style={{ padding: "12px" }}>Invoice No</th>
                      <th style={{ padding: "12px" }}>Amount</th>
                      <th style={{ padding: "12px" }}>Status</th>
                      <th style={{ padding: "12px" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p) => {
                      const pDate = new Date(p.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      });
                      return (
                        <tr key={p.orderId} style={{ borderBottom: "1px solid var(--card-border)", transition: "background 0.2s" }} className="table-row-hover">
                          <td style={{ padding: "16px 12px", color: "#1a150e", fontWeight: "600" }}>{pDate}</td>
                          <td style={{ padding: "16px 12px", color: "#5c4d3c", fontWeight: "600" }}>{p.userId}</td>
                          <td style={{ padding: "16px 12px" }}>
                            <div style={{ fontWeight: "700", color: "#1a150e" }}>{p.billingName}</div>
                            <div style={{ fontSize: "12px", color: "#6b5a45" }}>{p.billingAddress} ({p.state})</div>
                          </td>
                          <td style={{ padding: "16px 12px", textTransform: "capitalize", fontWeight: "600" }}>{p.plan} Access</td>
                          <td style={{ padding: "16px 12px" }}>{p.invoiceNumber || "-"}</td>
                          <td style={{ padding: "16px 12px", fontWeight: "700" }}>₹{p.totalAmount}</td>
                          <td style={{ padding: "16px 12px" }}>
                            <span style={{
                              fontSize: "12px",
                              fontWeight: "600",
                              padding: "3px 8px",
                              borderRadius: "10px",
                              backgroundColor: p.status === "completed" ? "rgba(16,185,129,0.15)" : "rgba(245,158,11,0.15)",
                              color: p.status === "completed" ? "#10b981" : "#b28e46"
                            }}>
                              {p.status}
                            </span>
                          </td>
                          <td style={{ padding: "16px 12px" }}>
                            {p.status === "completed" && (
                              <button
                                onClick={() => window.open(`/vault/invoice/${p.orderId}`)}
                                className="btn-outline"
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "4px",
                                  fontSize: "12px",
                                  padding: "4px 8px",
                                  color: "var(--primary)",
                                  borderColor: "rgba(217, 184, 133, 0.4)",
                                  backgroundColor: "transparent",
                                  cursor: "pointer",
                                  borderRadius: "4px"
                                }}
                              >
                                <Download size={12} /> View Invoice
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modal for viewing document */}
      {selectedDoc && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(26,21,14,0.6)",
          backdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          padding: "20px"
        }}>
          <div className="signin-card" style={{ maxWidth: "700px", width: "100%", position: "relative", display: "flex", flexDirection: "column", padding: "30px 24px", backgroundColor: "#ffffff", borderRadius: "28px", border: "1px solid rgba(217, 184, 133, 0.25)", boxShadow: "0 20px 50px rgba(139, 92, 26, 0.04)" }}>
            <h2 style={{ fontSize: "18px", color: "#1a150e", marginBottom: "16px", fontWeight: "750" }}>Supporting Document Preview</h2>
            <div style={{ 
              display: "flex", 
              justifyContent: "center", 
              alignItems: "center", 
              height: "450px", 
              maxHeight: "60vh", 
              border: "1px solid rgba(217, 184, 133, 0.25)", 
              borderRadius: "16px", 
              backgroundColor: "#faf7f0",
              overflow: "hidden",
              padding: "12px"
            }}>
              <img 
                src={selectedDoc} 
                alt="Supporting Document" 
                style={{ 
                  maxWidth: "100%", 
                  maxHeight: "100%", 
                  objectFit: "contain", 
                  display: "block" 
                }} 
              />
            </div>
            <button 
              onClick={() => setSelectedDoc(null)} 
              className="btn-cta-secondary" 
              style={{ marginTop: "16px", width: "100%" }}
            >
              Close Preview
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
