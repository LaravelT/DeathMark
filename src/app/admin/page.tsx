"use client";

import React, { useState, useEffect } from "react";
import { KeyRound, ShieldAlert, FileText, CheckCircle, XCircle, ArrowLeft, RefreshCw, Eye } from "lucide-react";
import Link from "next/link";

export default function AdminPage() {
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyLink = (claim: any) => {
    const url = `${window.location.origin}/claim/access?email=${encodeURIComponent(claim.ownerEmail)}`;
    navigator.clipboard.writeText(url);
    setCopiedId(claim._id);
    setTimeout(() => setCopiedId(null), 2000);
  };

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

  useEffect(() => {
    if (isAuthenticated) {
      fetchClaims();
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

  if (!isAuthenticated) {
    return (
      <div className="hero-gradient flex-center" style={{ minHeight: "100vh", padding: "20px", flexDirection: "column" }}>
        <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "32px" }}>
          <div className="brand-logo-box">
            <KeyRound className="w-5 h-5 text-white" />
          </div>
          <span className="brand-title">LegacyBridge Super Admin</span>
        </div>

        <div className="signin-card" style={{ maxWidth: "420px", width: "100%" }}>
          <div className="signin-header">
            <div className="logo-container flex-center">
              <KeyRound style={{ width: "32px", height: "32px", color: "#fff" }} />
            </div>
            <h1 className="signin-title">Admin Sign In</h1>
            <p className="signin-subtitle">Please enter your credentials to access manager.</p>
          </div>

          <form onSubmit={handleLoginSubmit} className="signin-body" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label className="form-label">Username</label>
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="Enter username"
                required
                style={{ width: "100%", padding: "12px 14px", backgroundColor: "#1e293b", border: "1px solid var(--card-border)", borderRadius: "10px", color: "#fff", fontSize: "15px" }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label className="form-label">Password</label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter password"
                required
                style={{ width: "100%", padding: "12px 14px", backgroundColor: "#1e293b", border: "1px solid var(--card-border)", borderRadius: "10px", color: "#fff", fontSize: "15px" }}
              />
            </div>

            {loginError && (
              <div style={{ display: "flex", gap: "8px", alignItems: "center", color: "#f87171", fontSize: "13px" }}>
                <ShieldAlert size={16} />
                <span>{loginError}</span>
              </div>
            )}

            <button type="submit" className="btn-cta-primary" style={{ width: "100%", border: "none", marginTop: "10px", backgroundColor: "#ec4899" }}>
              Sign In
            </button>
            <Link href="/" style={{ color: "var(--muted)", fontSize: "14px", textAlign: "center", textDecoration: "none", marginTop: "4px" }}>
              Back to Landing Page
            </Link>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="hero-gradient" style={{ minHeight: "100vh", padding: "40px 20px" }}>
      {/* Header navbar */}
      <header className="container-app" style={{ marginBottom: "40px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <div className="brand-logo-box">
              <KeyRound className="w-5 h-5 text-white" />
            </div>
            <span className="brand-title">LegacyBridge Super Admin</span>
          </div>
          <Link href="/" style={{ color: "#cbd5e1", textDecoration: "none", fontSize: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
            <ArrowLeft size={16} />
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      <main className="container-app" style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div className="panel-card" style={{ padding: "30px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--card-border)", paddingBottom: "16px", marginBottom: "24px" }}>
            <div>
              <h1 className="page-title" style={{ fontSize: "22px", margin: 0 }}>Beneficiary Claims Manager</h1>
              <span style={{ fontSize: "13px", color: "var(--muted)" }}>Verify relative claims and documents from the claims collection.</span>
            </div>
            <button onClick={fetchClaims} className="btn-signin-ghost" style={{ display: "flex", alignItems: "center", gap: "6px", border: "1px solid var(--card-border)" }}>
              <RefreshCw size={14} className={loading ? "spin" : ""} />
              <span>Refresh</span>
            </button>
          </div>

          {error && (
            <div style={{ display: "flex", gap: "10px", alignItems: "center", padding: "14px", backgroundColor: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "8px", color: "#f87171", fontSize: "14px", marginBottom: "24px" }}>
              <ShieldAlert size={18} />
              <span>Error loading claims: {error}</span>
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: "center", padding: "40px", color: "var(--muted)" }}>
              Loading submitted claims...
            </div>
          ) : claims.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 40px", border: "1px dashed var(--card-border)", borderRadius: "10px", backgroundColor: "rgba(0,0,0,0.1)" }}>
              <FileText size={40} style={{ color: "var(--muted)", marginBottom: "12px" }} />
              <p style={{ color: "var(--muted)", margin: 0 }}>No claims submitted yet.</p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid var(--card-border)", color: "var(--muted)", fontWeight: "600" }}>
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
                      <td style={{ padding: "16px 12px", color: "#fff" }}>
                        {new Date(claim.submittedAt).toLocaleDateString()} {new Date(claim.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td style={{ padding: "16px 12px" }}>
                        <div style={{ color: "#fff", fontWeight: "600" }}>{claim.claimantName}</div>
                        <div style={{ fontSize: "12px", color: "var(--muted)" }}>{claim.claimantGmail}</div>
                      </td>
                      <td style={{ padding: "16px 12px", color: "#cbd5e1" }}>
                        {claim.ownerEmail}
                      </td>
                      <td style={{ padding: "16px 12px", color: "#94a3b8", maxWidth: "250px", wordBreak: "break-word" }}>
                        {claim.reason}
                      </td>
                      <td style={{ padding: "16px 12px" }}>
                        {claim.document ? (
                          <button 
                            onClick={() => setSelectedDoc(claim.document)} 
                            className="btn-signin-ghost" 
                            style={{ 
                              display: "flex", 
                              alignItems: "center", 
                              gap: "4px", 
                              fontSize: "12px", 
                              padding: "4px 8px", 
                              color: "#f472b6", 
                              borderColor: "#f472b6" 
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
                          color: claim.status === "Approved" ? "#10b981" : claim.status === "Rejected" ? "#f87171" : "#f59e0b"
                        }}>
                          {claim.status}
                        </span>
                      </td>
                      <td style={{ padding: "16px 12px" }}>
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
                                backgroundColor: "#ef4444", 
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
                          <button
                            onClick={() => handleCopyLink(claim)}
                            className="btn-signin-ghost"
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                              fontSize: "12px",
                              padding: "6px 12px",
                              color: copiedId === claim._id ? "#10b981" : "#ec4899",
                              borderColor: copiedId === claim._id ? "#10b981" : "#ec4899",
                              backgroundColor: copiedId === claim._id ? "rgba(16,185,129,0.05)" : "rgba(236,72,153,0.05)",
                              borderRadius: "6px",
                              cursor: "pointer"
                            }}
                          >
                            <span>{copiedId === claim._id ? "Copied!" : "Copy Access Link"}</span>
                          </button>
                        ) : (
                          <span style={{ color: "var(--muted)", fontSize: "12px" }}>Rejected</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Modal for viewing document */}
      {selectedDoc && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(15,23,42,0.85)",
          backdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          padding: "20px"
        }}>
          <div className="signin-card" style={{ maxWidth: "700px", width: "100%", position: "relative", display: "flex", flexDirection: "column" }}>
            <h2 style={{ fontSize: "18px", color: "#fff", marginBottom: "16px" }}>Supporting Document Preview</h2>
            <div style={{ overflow: "auto", maxHeight: "70vh", border: "1px solid var(--card-border)", borderRadius: "8px", backgroundColor: "#0f172a" }}>
              <img src={selectedDoc} alt="Supporting Document" style={{ width: "100%", height: "auto", display: "block" }} />
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
