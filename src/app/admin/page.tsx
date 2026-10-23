"use client";

import React, { useState, useEffect } from "react";
import { KeyRound, ShieldAlert, FileText, CheckCircle, XCircle, ArrowLeft, RefreshCw, Eye, EyeOff, UserCheck, Settings, LogOut, Trash2, Coins, Download, Ticket, Building2, Copy, Check, ExternalLink, X } from "lucide-react";
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

const formatDateToDDMMYYYY = (dateInput?: string | Date): string => {
  if (!dateInput) return "-";
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return "-";
  const pad = (n: number) => String(n).padStart(2, "0");
  const dd = pad(d.getDate());
  const mm = pad(d.getMonth() + 1);
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
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
  const [activeTab, setActiveTab] = useState<"claims" | "payments" | "users" | "reports" | "coupons">("claims");
  const [payments, setPayments] = useState<any[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  // Coupon Manager States
  const [coupons, setCoupons] = useState<any[]>([]);
  const [couponsLoading, setCouponsLoading] = useState(false);
  const [newCouponCode, setNewCouponCode] = useState("");
  const [newCouponDescription, setNewCouponDescription] = useState("");
  const [newCouponDiscountType, setNewCouponDiscountType] = useState<"percentage" | "flat">("percentage");
  const [newCouponDiscountValue, setNewCouponDiscountValue] = useState("");
  const [newCouponApplicablePlan, setNewCouponApplicablePlan] = useState<"all" | "annual" | "lifetime">("all");
  const [isCompanyCoupon, setIsCompanyCoupon] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState("");
  const [newAllowedEmails, setNewAllowedEmails] = useState("");
  const [newMaxEmails, setNewMaxEmails] = useState("50");
  const [newPortalUsername, setNewPortalUsername] = useState("");
  const [newPortalPassword, setNewPortalPassword] = useState("");
  const [copiedPortalInfo, setCopiedPortalInfo] = useState<string | null>(null);
  const [createCouponLoading, setCreateCouponLoading] = useState(false);
  const [deleteCouponLoading, setDeleteCouponLoading] = useState<string | null>(null);
  const [selectedCouponForView, setSelectedCouponForView] = useState<any | null>(null);
  const [showModalPassword, setShowModalPassword] = useState(false);
  const [copiedModalField, setCopiedModalField] = useState<string | null>(null);

  // Date range states for reports tab
  const [reportFromDate, setReportFromDate] = useState<string>(() => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${firstDay.getFullYear()}-${pad(firstDay.getMonth() + 1)}-${pad(firstDay.getDate())}`;
  });
  const [reportToDate, setReportToDate] = useState<string>(() => {
    const now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${lastDay.getFullYear()}-${pad(lastDay.getMonth() + 1)}-${pad(lastDay.getDate())}`;
  });

  const [fromFocus, setFromFocus] = useState(false);
  const [toFocus, setToFocus] = useState(false);

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

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      if (!res.ok) throw new Error("Failed to load users.");
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchCoupons = async () => {
    setCouponsLoading(true);
    try {
      const res = await fetch("/api/admin/coupons");
      if (!res.ok) throw new Error("Failed to load coupons.");
      const data = await res.json();
      setCoupons(data.coupons || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setCouponsLoading(false);
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim()) {
      alert("Please enter a coupon code name.");
      return;
    }
    const val = parseFloat(newCouponDiscountValue);
    if (isNaN(val) || val <= 0) {
      alert("Please enter a valid positive discount value.");
      return;
    }
    if (newCouponDiscountType === "percentage" && val > 100) {
      alert("Percentage discount cannot exceed 100%.");
      return;
    }

    setCreateCouponLoading(true);
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          code: newCouponCode,
          description: newCouponDescription,
          discountType: newCouponDiscountType,
          discountValue: val,
          applicablePlan: newCouponApplicablePlan,
          isCompanyCoupon,
          companyName: newCompanyName,
          maxEmails: parseInt(newMaxEmails, 10) || 50,
          portalUsername: newPortalUsername,
          portalPassword: newPortalPassword,
          allowedEmails: newAllowedEmails
        })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create coupon");
      }
      const data = await res.json();
      setCoupons(prev => [data.coupon, ...prev]);
      setNewCouponCode("");
      setNewCouponDescription("");
      setNewCouponDiscountType("percentage");
      setNewCouponDiscountValue("");
      setNewCouponApplicablePlan("all");
      setIsCompanyCoupon(false);
      setNewCompanyName("");
      setNewAllowedEmails("");
      setNewMaxEmails("50");
      setNewPortalUsername("");
      setNewPortalPassword("");
      alert(`Coupon code created: ${data.coupon.code}`);
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setCreateCouponLoading(false);
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!confirm("Are you sure you want to deactivate/delete this coupon?")) return;
    setDeleteCouponLoading(id);
    try {
      const res = await fetch(`/api/admin/coupons?id=${id}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("Failed to delete coupon");
      setCoupons(prev => prev.map(c => c._id === id ? { ...c, status: "deleted" } : c));
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setDeleteCouponLoading(null);
    }
  };

  const refreshAll = () => {
    fetchClaims();
    fetchPayments();
    fetchUsers();
    fetchCoupons();
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchClaims();
      fetchPayments();
      fetchUsers();
      fetchCoupons();
    }
  }, [isAuthenticated]);

  const handleDownloadCSV = () => {
    const headers = [
      "Sale Date",
      "Bill No",
      "Bill Amount",
      "Taxable Amount",
      "CGST",
      "SGST",
      "IGST",
      "UTGST",
      "Customer Name",
      "State",
      "Customer GST No"
    ];

    const escapeCSV = (val: any) => {
      if (val === undefined || val === null || val === "") return "-";
      const str = String(val).trim();
      if (str === "") return "-";
      if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const filtered = payments.filter((p) => {
      if (p.status !== "completed") return false;
      const pDate = new Date(p.createdAt);
      if (isNaN(pDate.getTime())) return false;
      
      const startDate = new Date(reportFromDate);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(reportToDate);
      endDate.setHours(23, 59, 59, 999);
      
      return pDate >= startDate && pDate <= endDate;
    });

    const rows = filtered.map((p) => {
      const sDate = formatDateToDDMMYYYY(p.createdAt);

      return [
        escapeCSV(sDate),
        escapeCSV(p.invoiceNumber),
        escapeCSV(p.totalAmount),
        escapeCSV(p.baseAmount),
        escapeCSV(p.cgst),
        escapeCSV(p.sgst),
        escapeCSV(p.igst),
        escapeCSV(p.utgst),
        escapeCSV(p.billingName),
        escapeCSV(p.state),
        escapeCSV(p.gstNo)
      ];
    });

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const filename = `sales_report_${reportFromDate}_to_${reportToDate}.csv`;
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
              onClick={() => setActiveTab("users")}
              style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "10px", 
                padding: "10px 14px", 
                borderRadius: "8px", 
                backgroundColor: activeTab === "users" ? "rgba(178, 142, 70, 0.08)" : "transparent", 
                color: activeTab === "users" ? "var(--primary)" : "#6b5a45",
                fontWeight: activeTab === "users" ? "700" : "600",
                fontSize: "14px",
                border: "none",
                cursor: "pointer",
                textAlign: "left",
                width: "100%"
              }}
            >
              <FileText size={18} />
              <span>Users List</span>
            </button>

            <button 
              onClick={() => setActiveTab("reports")}
              style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "10px", 
                padding: "10px 14px", 
                borderRadius: "8px", 
                backgroundColor: activeTab === "reports" ? "rgba(178, 142, 70, 0.08)" : "transparent", 
                color: activeTab === "reports" ? "var(--primary)" : "#6b5a45",
                fontWeight: activeTab === "reports" ? "700" : "600",
                fontSize: "14px",
                border: "none",
                cursor: "pointer",
                textAlign: "left",
                width: "100%"
              }}
            >
              <Download size={18} />
              <span>Sales Reports</span>
            </button>

            <button 
              onClick={() => setActiveTab("coupons")}
              style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "10px", 
                padding: "10px 14px", 
                borderRadius: "8px", 
                backgroundColor: activeTab === "coupons" ? "rgba(178, 142, 70, 0.08)" : "transparent", 
                color: activeTab === "coupons" ? "var(--primary)" : "#6b5a45",
                fontWeight: activeTab === "coupons" ? "700" : "600",
                fontSize: "14px",
                border: "none",
                cursor: "pointer",
                textAlign: "left",
                width: "100%"
              }}
            >
              <Ticket size={18} />
              <span>Coupons Manager</span>
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
              {activeTab === "claims" ? "Beneficiary Claims Manager" : activeTab === "payments" ? "Payments & Invoices History" : activeTab === "users" ? "Registered Users List" : activeTab === "reports" ? "Sales & Tax Reports" : "Discount Coupons Manager"}
            </h1>
            <span style={{ fontSize: "14px", color: "#6b5a45" }}>
              {activeTab === "claims" 
                ? "Verify relative claims and documents from the claims database." 
                : activeTab === "payments"
                  ? "View payments history, user billing details, and download invoices."
                  : activeTab === "users"
                    ? "View registered users, their current subscription plans, and invoice numbers."
                    : activeTab === "reports"
                      ? "Generate monthly reports of plan purchases, calculate GST, and download reports for your accountant."
                      : "Create and manage promotional discount coupons for plan purchases."
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
                      <th style={{ padding: "12px" }}>Claimant Details</th>
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
                          {claim.claimantPhone && (
                            <div style={{ fontSize: "12px", color: "#8c7a6b", marginTop: "2px" }}>{claim.claimantPhone}</div>
                          )}
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
        ) : activeTab === "payments" ? (
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
                          <td style={{ padding: "16px 12px", fontWeight: "700" }}>
                            <div>₹{p.totalAmount}</div>
                            {p.couponCode && (
                              <div style={{ fontSize: "11px", color: "#10b981", fontWeight: "600", marginTop: "2px" }}>
                                Coupon: {p.couponCode} (-₹{p.discountAmount})
                              </div>
                            )}
                          </td>
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
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : activeTab === "users" ? (
          <div className="panel-card" style={{ padding: "30px", backgroundColor: "#ffffff" }}>
            {usersLoading ? (
              <div style={{ textAlign: "center", padding: "80px", color: "var(--muted)" }}>
                Loading registered users...
              </div>
            ) : users.length === 0 ? (
              <div style={{ textAlign: "center", padding: "80px 40px", border: "1px dashed rgba(217, 184, 133, 0.3)", borderRadius: "10px", backgroundColor: "#faf7f0" }}>
                <UserCheck size={40} style={{ color: "var(--muted)", marginBottom: "12px" }} />
                <p style={{ color: "var(--muted)", margin: 0 }}>No registered users found.</p>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid var(--card-border)", color: "#6b5a45", fontWeight: "600", backgroundColor: "#faf7f0" }}>
                      <th style={{ padding: "12px" }}>Name</th>
                      <th style={{ padding: "12px" }}>Email</th>
                      <th style={{ padding: "12px" }}>Registration Date</th>
                      <th style={{ padding: "12px" }}>Active Plan</th>
                      <th style={{ padding: "12px" }}>Invoice No</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => {
                      const regDate = u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      }) : "N/A";
                      return (
                        <tr key={u._id} style={{ borderBottom: "1px solid var(--card-border)", transition: "background 0.2s" }} className="table-row-hover">
                          <td style={{ padding: "16px 12px", color: "#1a150e", fontWeight: "700" }}>{u.name}</td>
                          <td style={{ padding: "16px 12px", color: "#5c4d3c", fontWeight: "600" }}>{u.email}</td>
                          <td style={{ padding: "16px 12px", color: "#6b5a45" }}>{regDate}</td>
                          <td style={{ padding: "16px 12px", textTransform: "capitalize", fontWeight: "600" }}>
                            <span style={{
                              fontSize: "12px",
                              fontWeight: "600",
                              padding: "3px 8px",
                              borderRadius: "10px",
                              backgroundColor: u.plan === "lifetime" ? "rgba(16,185,129,0.15)" : u.plan === "annual" ? "rgba(56,189,248,0.15)" : "rgba(245,158,11,0.15)",
                              color: u.plan === "lifetime" ? "#10b981" : u.plan === "annual" ? "#38bdf8" : "#b28e46"
                            }}>
                              {u.plan === "free_trial" ? "Free Trial" : `${u.plan} Access`}
                            </span>
                          </td>
                          <td style={{ padding: "16px 12px", color: "#1a150e" }}>{u.invoiceNumber}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : activeTab === "reports" ? (
          <div className="panel-card" style={{ padding: "30px", backgroundColor: "#ffffff" }}>
            {/* Filters */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "20px", alignItems: "flex-end", marginBottom: "24px", padding: "20px", backgroundColor: "#faf7f0", borderRadius: "12px", border: "1px solid rgba(217, 184, 133, 0.2)" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: "1", minWidth: "150px" }}>
                <label style={{ fontSize: "13px", fontWeight: "600", color: "#6b5a45" }}>From Date</label>
                <input 
                  type={fromFocus ? "date" : "text"} 
                  value={fromFocus ? reportFromDate : formatDateToDDMMYYYY(reportFromDate)} 
                  onFocus={() => setFromFocus(true)}
                  onBlur={() => setFromFocus(false)}
                  onChange={(e) => setReportFromDate(e.target.value)} 
                  style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid rgba(217, 184, 133, 0.4)", backgroundColor: "#ffffff", fontSize: "14px", color: "#1a150e", width: "100%" }}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: "1", minWidth: "150px" }}>
                <label style={{ fontSize: "13px", fontWeight: "600", color: "#6b5a45" }}>To Date</label>
                <input 
                  type={toFocus ? "date" : "text"} 
                  value={toFocus ? reportToDate : formatDateToDDMMYYYY(reportToDate)} 
                  onFocus={() => setToFocus(true)}
                  onBlur={() => setToFocus(false)}
                  onChange={(e) => setReportToDate(e.target.value)} 
                  style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid rgba(217, 184, 133, 0.4)", backgroundColor: "#ffffff", fontSize: "14px", color: "#1a150e", width: "100%" }}
                />
              </div>
              <div>
                <button 
                  onClick={handleDownloadCSV}
                  disabled={paymentsLoading}
                  className="btn-cta-primary"
                  style={{ display: "flex", alignItems: "center", gap: "8px", height: "40px", border: "none" }}
                >
                  <Download size={16} />
                  <span>Download Excel (CSV)</span>
                </button>
              </div>
            </div>

            {paymentsLoading ? (
              <div style={{ textAlign: "center", padding: "80px", color: "var(--muted)" }}>
                Loading report data...
              </div>
            ) : (() => {
              const filtered = payments.filter((p) => {
                if (p.status !== "completed") return false;
                const pDate = new Date(p.createdAt);
                if (isNaN(pDate.getTime())) return false;
                
                const startDate = new Date(reportFromDate);
                startDate.setHours(0, 0, 0, 0);
                
                const endDate = new Date(reportToDate);
                endDate.setHours(23, 59, 59, 999);
                
                return pDate >= startDate && pDate <= endDate;
              });

              if (filtered.length === 0) {
                return (
                  <div style={{ textAlign: "center", padding: "60px 40px", border: "1px dashed rgba(217, 184, 133, 0.3)", borderRadius: "10px", backgroundColor: "#faf7f0" }}>
                    <FileText size={40} style={{ color: "var(--muted)", marginBottom: "12px" }} />
                    <p style={{ color: "var(--muted)", margin: 0 }}>No successful payments found in this date range.</p>
                  </div>
                );
              }

              return (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
                    <thead>
                      <tr style={{ borderBottom: "2px solid var(--card-border)", color: "#6b5a45", fontWeight: "600", backgroundColor: "#faf7f0" }}>
                        <th style={{ padding: "12px 8px" }}>Sale Date</th>
                        <th style={{ padding: "12px 8px" }}>Bill No</th>
                        <th style={{ padding: "12px 8px" }}>Customer Name</th>
                        <th style={{ padding: "12px 8px" }}>State</th>
                        <th style={{ padding: "12px 8px" }}>GST No</th>
                        <th style={{ padding: "12px 8px", textAlign: "right" }}>Taxable Amt</th>
                        <th style={{ padding: "12px 8px", textAlign: "right" }}>CGST</th>
                        <th style={{ padding: "12px 8px", textAlign: "right" }}>SGST</th>
                        <th style={{ padding: "12px 8px", textAlign: "right" }}>IGST</th>
                        <th style={{ padding: "12px 8px", textAlign: "right" }}>UTGST</th>
                        <th style={{ padding: "12px 8px", textAlign: "right" }}>Bill Amt</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((p) => {
                        const sDate = formatDateToDDMMYYYY(p.createdAt);
                        return (
                          <tr key={p.orderId} style={{ borderBottom: "1px solid var(--card-border)", transition: "background 0.2s" }} className="table-row-hover">
                            <td style={{ padding: "12px 8px", color: "#1a150e", fontWeight: "600" }}>{sDate}</td>
                            <td style={{ padding: "12px 8px", color: "#5c4d3c", fontWeight: "600" }}>{p.invoiceNumber || "-"}</td>
                            <td style={{ padding: "12px 8px", fontWeight: "700", color: "#1a150e" }}>{p.billingName || "-"}</td>
                            <td style={{ padding: "12px 8px" }}>{p.state || "-"}</td>
                            <td style={{ padding: "12px 8px" }}>{p.gstNo || "-"}</td>
                            <td style={{ padding: "12px 8px", textAlign: "right" }}>₹{p.baseAmount ?? "-"}</td>
                            <td style={{ padding: "12px 8px", textAlign: "right", color: p.cgst ? "#1a150e" : "var(--muted)" }}>{p.cgst ? `₹${p.cgst}` : "-"}</td>
                            <td style={{ padding: "12px 8px", textAlign: "right", color: p.sgst ? "#1a150e" : "var(--muted)" }}>{p.sgst ? `₹${p.sgst}` : "-"}</td>
                            <td style={{ padding: "12px 8px", textAlign: "right", color: p.igst ? "#1a150e" : "var(--muted)" }}>{p.igst ? `₹${p.igst}` : "-"}</td>
                            <td style={{ padding: "12px 8px", textAlign: "right", color: p.utgst ? "#1a150e" : "var(--muted)" }}>{p.utgst ? `₹${p.utgst}` : "-"}</td>
                            <td style={{ padding: "12px 8px", textAlign: "right", fontWeight: "700" }}>₹{p.totalAmount ?? "-"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            })()}
          </div>
        ) : (
          <div className="panel-card" style={{ padding: "30px", backgroundColor: "#ffffff" }}>
            {/* Create Coupon Form */}
            <form onSubmit={handleCreateCoupon} style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "32px", padding: "20px", backgroundColor: "#faf7f0", borderRadius: "12px", border: "1px solid rgba(217, 184, 133, 0.2)" }}>
              
              <div style={{ display: "flex", gap: "12px", alignItems: "center", paddingBottom: "12px", borderBottom: "1px solid rgba(217, 184, 133, 0.3)" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "14px", fontWeight: "600", color: "#1a150e" }}>
                  <input 
                    type="radio" 
                    checked={!isCompanyCoupon}
                    onChange={() => setIsCompanyCoupon(false)}
                    style={{ accentColor: "var(--primary)" }}
                  />
                  General Coupon
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "14px", fontWeight: "600", color: "#1a150e" }}>
                  <input 
                    type="radio" 
                    checked={isCompanyCoupon}
                    onChange={() => setIsCompanyCoupon(true)}
                    style={{ accentColor: "var(--primary)" }}
                  />
                  For Companies (Restricted to specific emails or domains)
                </label>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", alignItems: "end" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontSize: "13px", fontWeight: "600", color: "#6b5a45" }}>Coupon Code Name *</label>
                <input 
                  type="text" 
                  value={newCouponCode}
                  onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                  placeholder="e.g. SAVE20"
                  required
                  style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid rgba(217, 184, 133, 0.4)", backgroundColor: "#ffffff", fontSize: "14px", color: "#1a150e" }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontSize: "13px", fontWeight: "600", color: "#6b5a45" }}>Description</label>
                <input 
                  type="text" 
                  value={newCouponDescription}
                  onChange={(e) => setNewCouponDescription(e.target.value)}
                  placeholder="e.g. 20% off on all plans"
                  style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid rgba(217, 184, 133, 0.4)", backgroundColor: "#ffffff", fontSize: "14px", color: "#1a150e" }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontSize: "13px", fontWeight: "600", color: "#6b5a45" }}>Discount Type *</label>
                <select
                  value={newCouponDiscountType}
                  onChange={(e) => setNewCouponDiscountType(e.target.value as "percentage" | "flat")}
                  style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid rgba(217, 184, 133, 0.4)", backgroundColor: "#ffffff", fontSize: "14px", color: "#1a150e", height: "38px" }}
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="flat">Flat Amount (INR)</option>
                </select>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontSize: "13px", fontWeight: "600", color: "#6b5a45" }}>Applicable Plan *</label>
                <select
                  value={newCouponApplicablePlan}
                  onChange={(e) => setNewCouponApplicablePlan(e.target.value as "all" | "annual" | "lifetime")}
                  style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid rgba(217, 184, 133, 0.4)", backgroundColor: "#ffffff", fontSize: "14px", color: "#1a150e", height: "38px" }}
                >
                  <option value="all">All Plans</option>
                  <option value="annual">Annual Plan Only</option>
                  <option value="lifetime">Lifetime Plan Only</option>
                </select>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontSize: "13px", fontWeight: "600", color: "#6b5a45" }}>
                  {newCouponDiscountType === "percentage" ? "Discount Percentage (%) *" : "Flat Discount (₹) *"}
                </label>
                <input 
                  type="number" 
                  min="1"
                  max={newCouponDiscountType === "percentage" ? "100" : undefined}
                  value={newCouponDiscountValue}
                  onChange={(e) => setNewCouponDiscountValue(e.target.value)}
                  placeholder={newCouponDiscountType === "percentage" ? "e.g. 20" : "e.g. 500"}
                  required
                  style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid rgba(217, 184, 133, 0.4)", backgroundColor: "#ffffff", fontSize: "14px", color: "#1a150e" }}
                />
              </div>
              </div>
              
              {isCompanyCoupon && (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "8px", padding: "16px", backgroundColor: "#fdfbf7", borderRadius: "10px", border: "1px dashed rgba(217, 184, 133, 0.4)" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label style={{ fontSize: "13px", fontWeight: "600", color: "#6b5a45" }}>Company Name *</label>
                      <input 
                        type="text" 
                        value={newCompanyName}
                        onChange={(e) => setNewCompanyName(e.target.value)}
                        placeholder="e.g. Tata Consultancy Services"
                        required={isCompanyCoupon}
                        style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid rgba(217, 184, 133, 0.4)", backgroundColor: "#ffffff", fontSize: "14px", color: "#1a150e" }}
                      />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label style={{ fontSize: "13px", fontWeight: "600", color: "#6b5a45" }}>Number of Allowed Emails (Quota) *</label>
                      <input 
                        type="number"
                        min="1"
                        max="1000"
                        value={newMaxEmails}
                        onChange={(e) => setNewMaxEmails(e.target.value)}
                        placeholder="e.g. 50"
                        required={isCompanyCoupon}
                        style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid rgba(217, 184, 133, 0.4)", backgroundColor: "#ffffff", fontSize: "14px", color: "#1a150e" }}
                      />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label style={{ fontSize: "13px", fontWeight: "600", color: "#6b5a45" }}>Company Portal User ID *</label>
                      <input 
                        type="text" 
                        value={newPortalUsername}
                        onChange={(e) => setNewPortalUsername(e.target.value)}
                        placeholder="e.g. tcs_admin"
                        required={isCompanyCoupon}
                        style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid rgba(217, 184, 133, 0.4)", backgroundColor: "#ffffff", fontSize: "14px", color: "#1a150e" }}
                      />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label style={{ fontSize: "13px", fontWeight: "600", color: "#6b5a45" }}>Company Portal Password *</label>
                      <input 
                        type="text" 
                        value={newPortalPassword}
                        onChange={(e) => setNewPortalPassword(e.target.value)}
                        placeholder="e.g. Tcs@2026"
                        required={isCompanyCoupon}
                        style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid rgba(217, 184, 133, 0.4)", backgroundColor: "#ffffff", fontSize: "14px", color: "#1a150e" }}
                      />
                    </div>
                  </div>

                  <div style={{ padding: "10px 12px", backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid rgba(217, 184, 133, 0.3)", fontSize: "12px", color: "#6b5a45", lineHeight: "1.5" }}>
                    🌐 <strong>Company Self-Service Portal:</strong> Company HR can log into <code style={{ color: "#b28e46", fontWeight: "bold" }}>/company-portal</code> using the above User ID and Password to manage their employee emails directly (up to {newMaxEmails || 50} emails).
                  </div>
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "8px" }}>
                <button 
                  type="submit" 
                  disabled={createCouponLoading}
                  className="btn-cta-primary"
                  style={{ height: "38px", border: "none", display: "flex", alignItems: "center", gap: "8px", width: "100%", justifyContent: "center" }}
                >
                  <Ticket size={16} />
                  <span>{createCouponLoading ? "Creating..." : "Create Coupon"}</span>
                </button>
              </div>
            </form>

            {/* Coupons List */}
            {couponsLoading ? (
              <div style={{ textAlign: "center", padding: "80px", color: "var(--muted)" }}>
                Loading coupons...
              </div>
            ) : coupons.length === 0 ? (
              <div style={{ textAlign: "center", padding: "80px 40px", border: "1px dashed rgba(217, 184, 133, 0.3)", borderRadius: "10px", backgroundColor: "#faf7f0" }}>
                <Ticket size={40} style={{ color: "var(--muted)", marginBottom: "12px" }} />
                <p style={{ color: "var(--muted)", margin: 0 }}>No coupons created yet. Fill the form above to create one.</p>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid var(--card-border)", color: "#6b5a45", fontWeight: "600", backgroundColor: "#faf7f0" }}>
                      <th style={{ padding: "12px" }}>Coupon Code</th>
                      <th style={{ padding: "12px" }}>Description</th>
                      <th style={{ padding: "12px" }}>Discount</th>
                      <th style={{ padding: "12px" }}>Applicable Plan</th>
                      <th style={{ padding: "12px" }}>Status</th>
                      <th style={{ padding: "12px" }}>Created At</th>
                      <th style={{ padding: "12px", textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coupons.map((c) => {
                      const cDate = new Date(c.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      });
                      const discountText = c.discountType === "percentage" ? `${c.discountValue}% OFF` : `₹${c.discountValue} FLAT`;
                      const planText = c.applicablePlan === "annual" ? "Annual Only" : c.applicablePlan === "lifetime" ? "Lifetime Only" : "All Plans";
                      return (
                        <tr key={c._id} style={{ borderBottom: "1px solid var(--card-border)", transition: "background 0.2s" }} className="table-row-hover">
                          <td style={{ padding: "16px 12px", color: "#1a150e", fontWeight: "700" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <span>{c.code}</span>
                              {c.isCompanyCoupon ? (
                                <span style={{ fontSize: "10px", fontWeight: "700", backgroundColor: "rgba(16, 185, 129, 0.12)", color: "#059669", padding: "2px 6px", borderRadius: "4px" }}>
                                  Company
                                </span>
                              ) : (
                                <span style={{ fontSize: "10px", fontWeight: "600", backgroundColor: "#f3f4f6", color: "#6b7280", padding: "2px 6px", borderRadius: "4px" }}>
                                  General
                                </span>
                              )}
                            </div>
                            {c.isCompanyCoupon && (
                              <div style={{ fontSize: "11px", marginTop: "5px" }}>
                                <div style={{ color: "#047857", fontWeight: "750", display: "flex", alignItems: "center", gap: "4px" }}>
                                  <Building2 size={12} style={{ color: "#059669" }} />
                                  <span>Company Name: <strong>{c.companyName}</strong></span>
                                </div>
                                <div style={{ color: "#6b5a45", marginTop: "2px" }}>
                                  Quota: <strong>{c.allowedEmails?.length || 0} / {c.maxEmails || 50}</strong> emails
                                </div>
                                {c.portalUsername && (
                                  <div style={{ marginTop: "3px", display: "flex", alignItems: "center", gap: "6px" }}>
                                    <span style={{ color: "#8c7a6b" }}>ID: <code>{c.portalUsername}</code></span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const portalUrl = `${window.location.origin}/company-portal`;
                                        const copyText = `🏢 Company: ${c.companyName}\n🎟️ Coupon Code: ${c.code}\n🔗 Portal: ${portalUrl}\n👤 User ID: ${c.portalUsername}\n🔑 Password: ${c.portalPassword || "Provided"}\nQuota: ${c.maxEmails || 50} emails`;
                                        navigator.clipboard.writeText(copyText);
                                        setCopiedPortalInfo(c._id);
                                        setTimeout(() => setCopiedPortalInfo(null), 2500);
                                      }}
                                      style={{
                                        fontSize: "10px",
                                        fontWeight: "600",
                                        padding: "2px 6px",
                                        borderRadius: "4px",
                                        backgroundColor: "#faf7f0",
                                        border: "1px solid #dcd1c4",
                                        color: "#b28e46",
                                        cursor: "pointer"
                                      }}
                                    >
                                      {copiedPortalInfo === c._id ? "✓ Copied!" : "📋 Copy Portal Login"}
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </td>
                          <td style={{ padding: "16px 12px", color: "#5c4d3c" }}>{c.description || "-"}</td>
                          <td style={{ padding: "16px 12px", color: "#1a150e", fontWeight: "600" }}>{discountText}</td>
                          <td style={{ padding: "16px 12px", color: "#1a150e" }}>{planText}</td>
                          <td style={{ padding: "16px 12px" }}>
                            <span style={{
                              fontSize: "12px",
                              fontWeight: "600",
                              padding: "3px 8px",
                              borderRadius: "10px",
                              backgroundColor: c.status === "active" ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
                              color: c.status === "active" ? "#10b981" : "#ef4444"
                            }}>
                              {c.status}
                            </span>
                          </td>
                          <td style={{ padding: "16px 12px", color: "#6b5a45" }}>{cDate}</td>
                          <td style={{ padding: "16px 12px", textAlign: "right" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "8px" }}>
                              <button
                                type="button"
                                onClick={() => setSelectedCouponForView(c)}
                                title="View All Saved Details"
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "4px",
                                  backgroundColor: "#faf7f0",
                                  border: "1px solid #dcd1c4",
                                  color: "#b28e46",
                                  padding: "6px 10px",
                                  borderRadius: "6px",
                                  cursor: "pointer",
                                  fontSize: "12px",
                                  fontWeight: "600",
                                  transition: "all 0.15s ease"
                                }}
                              >
                                <Eye size={14} />
                                <span>View</span>
                              </button>
                              {c.status === "active" && (
                                <button
                                  onClick={() => handleDeleteCoupon(c._id)}
                                  disabled={deleteCouponLoading === c._id}
                                  style={{
                                    backgroundColor: "rgba(239, 68, 68, 0.05)",
                                    border: "1px solid rgba(239, 68, 68, 0.2)",
                                    color: "#ef4444",
                                    padding: "6px 12px",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    fontSize: "12px",
                                    fontWeight: "600"
                                  }}
                                >
                                  {deleteCouponLoading === c._id ? "Deactivating..." : "Deactivate"}
                                </button>
                              )}
                            </div>
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

      {/* Modal for viewing full coupon details */}
      {selectedCouponForView && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(26,21,14,0.65)",
          backdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          padding: "20px"
        }}>
          <div style={{ 
            maxWidth: "640px", 
            width: "100%", 
            maxHeight: "90vh",
            overflowY: "auto",
            backgroundColor: "#ffffff", 
            borderRadius: "20px", 
            border: "1px solid rgba(217, 184, 133, 0.35)", 
            boxShadow: "0 25px 60px rgba(0, 0, 0, 0.25)",
            padding: "28px"
          }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", borderBottom: "1px solid #f0e9df", paddingBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ backgroundColor: "#faf7f0", padding: "8px", borderRadius: "10px", border: "1px solid #e5dccf", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Ticket size={22} style={{ color: "#b28e46" }} />
                </div>
                <div>
                  <h2 style={{ fontSize: "18px", fontWeight: "800", color: "#1a150e", margin: 0 }}>
                    Coupon Details
                  </h2>
                  <p style={{ fontSize: "12px", color: "#8c7a6b", margin: "2px 0 0 0" }}>
                    Complete saved configuration and access parameters
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedCouponForView(null);
                  setShowModalPassword(false);
                }}
                style={{
                  backgroundColor: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "#8c7a6b",
                  padding: "6px",
                  borderRadius: "6px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Top Code Badge & Status */}
            <div style={{ 
              backgroundColor: "#faf7f0", 
              border: "1px solid #e5dccf", 
              borderRadius: "14px", 
              padding: "16px 20px", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "space-between",
              marginBottom: "20px"
            }}>
              <div>
                <span style={{ fontSize: "11px", fontWeight: "700", color: "#8c7a6b", letterSpacing: "0.5px" }}>COUPON CODE</span>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "4px" }}>
                  <span style={{ fontSize: "22px", fontWeight: "800", color: "#1a150e", letterSpacing: "1px" }}>
                    {selectedCouponForView.code}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(selectedCouponForView.code);
                      setCopiedModalField("code");
                      setTimeout(() => setCopiedModalField(null), 2000);
                    }}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      backgroundColor: "#ffffff",
                      border: "1px solid #dcd1c4",
                      padding: "4px 8px",
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontWeight: "600",
                      color: "#6b5a45",
                      cursor: "pointer"
                    }}
                  >
                    {copiedModalField === "code" ? <Check size={13} style={{ color: "#10b981" }} /> : <Copy size={13} />}
                    <span>{copiedModalField === "code" ? "Copied" : "Copy"}</span>
                  </button>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
                <span style={{
                  fontSize: "12px",
                  fontWeight: "700",
                  padding: "3px 10px",
                  borderRadius: "12px",
                  backgroundColor: selectedCouponForView.status === "active" ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
                  color: selectedCouponForView.status === "active" ? "#10b981" : "#ef4444"
                }}>
                  {selectedCouponForView.status?.toUpperCase()}
                </span>
                <span style={{
                  fontSize: "11px",
                  fontWeight: "700",
                  padding: "2px 8px",
                  borderRadius: "8px",
                  backgroundColor: selectedCouponForView.isCompanyCoupon ? "rgba(178, 142, 70, 0.15)" : "#f3f4f6",
                  color: selectedCouponForView.isCompanyCoupon ? "#b28e46" : "#4b5563"
                }}>
                  {selectedCouponForView.isCompanyCoupon ? "🏢 Company Restricted" : "🌐 General Public"}
                </span>
              </div>
            </div>

            {/* General Info Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "20px" }}>
              <div style={{ padding: "12px 14px", backgroundColor: "#ffffff", border: "1px solid #f0e9df", borderRadius: "10px" }}>
                <span style={{ fontSize: "11px", color: "#8c7a6b", fontWeight: "600" }}>DISCOUNT</span>
                <div style={{ fontSize: "16px", fontWeight: "700", color: "#b28e46", marginTop: "2px" }}>
                  {selectedCouponForView.discountType === "percentage" 
                    ? `${selectedCouponForView.discountValue}% OFF` 
                    : `₹${selectedCouponForView.discountValue} FLAT`}
                </div>
              </div>

              <div style={{ padding: "12px 14px", backgroundColor: "#ffffff", border: "1px solid #f0e9df", borderRadius: "10px" }}>
                <span style={{ fontSize: "11px", color: "#8c7a6b", fontWeight: "600" }}>APPLICABLE PLAN</span>
                <div style={{ fontSize: "15px", fontWeight: "600", color: "#1a150e", marginTop: "2px" }}>
                  {selectedCouponForView.applicablePlan === "annual" ? "Annual Plan Only" : selectedCouponForView.applicablePlan === "lifetime" ? "Lifetime Plan Only" : "All Plans (Annual & Lifetime)"}
                </div>
              </div>

              <div style={{ padding: "12px 14px", backgroundColor: "#ffffff", border: "1px solid #f0e9df", borderRadius: "10px" }}>
                <span style={{ fontSize: "11px", color: "#8c7a6b", fontWeight: "600" }}>CREATED DATE</span>
                <div style={{ fontSize: "13px", fontWeight: "600", color: "#1a150e", marginTop: "2px" }}>
                  {formatAdminDate(selectedCouponForView.createdAt) || new Date(selectedCouponForView.createdAt).toLocaleString()}
                </div>
              </div>

              <div style={{ padding: "12px 14px", backgroundColor: "#ffffff", border: "1px solid #f0e9df", borderRadius: "10px" }}>
                <span style={{ fontSize: "11px", color: "#8c7a6b", fontWeight: "600" }}>DESCRIPTION</span>
                <div style={{ fontSize: "13px", color: "#5c4d3c", marginTop: "2px" }}>
                  {selectedCouponForView.description || "No description"}
                </div>
              </div>
            </div>

            {/* Corporate Section */}
            {selectedCouponForView.isCompanyCoupon && (
              <div style={{ 
                backgroundColor: "#fffdfa", 
                border: "1px solid rgba(217, 184, 133, 0.4)", 
                borderRadius: "14px", 
                padding: "18px 20px",
                marginBottom: "20px"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px", borderBottom: "1px solid rgba(217, 184, 133, 0.2)", paddingBottom: "10px" }}>
                  <Building2 size={16} style={{ color: "#b28e46" }} />
                  <span style={{ fontSize: "13px", fontWeight: "800", color: "#1a150e" }}>
                    Company & Portal Access Credentials
                  </span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "16px" }}>
                  <div>
                    <span style={{ fontSize: "11px", color: "#8c7a6b", fontWeight: "600" }}>COMPANY NAME</span>
                    <div style={{ fontSize: "16px", fontWeight: "750", color: "#047857", marginTop: "2px" }}>
                      {selectedCouponForView.companyName}
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: "11px", color: "#8c7a6b", fontWeight: "600" }}>EMAIL QUOTA LIMIT</span>
                    <div style={{ fontSize: "15px", fontWeight: "750", color: "#1a150e", marginTop: "2px" }}>
                      {selectedCouponForView.allowedEmails?.length || 0} / {selectedCouponForView.maxEmails || 50} emails
                    </div>
                  </div>
                </div>

                {/* Credentials Box */}
                <div style={{ backgroundColor: "#ffffff", border: "1px solid #e5dccf", borderRadius: "10px", padding: "14px 16px", marginBottom: "16px" }}>
                  <div style={{ fontSize: "12px", fontWeight: "700", color: "#b28e46", marginBottom: "10px" }}>
                    HR Self-Service Portal Login Credentials
                  </div>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ color: "#8c7a6b" }}>Portal URL:</span>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <code style={{ backgroundColor: "#faf7f0", padding: "2px 8px", borderRadius: "4px", fontSize: "12px" }}>
                          {typeof window !== "undefined" ? `${window.location.origin}/company-portal` : "/company-portal"}
                        </code>
                        <a 
                          href="/company-portal" 
                          target="_blank" 
                          rel="noreferrer"
                          style={{ color: "#b28e46", display: "flex", alignItems: "center" }}
                          title="Open Company Portal"
                        >
                          <ExternalLink size={14} />
                        </a>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ color: "#8c7a6b" }}>Company Portal User ID:</span>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <code style={{ fontWeight: "700", backgroundColor: "#faf7f0", padding: "2px 8px", borderRadius: "4px" }}>
                          {selectedCouponForView.portalUsername}
                        </code>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(selectedCouponForView.portalUsername || "");
                            setCopiedModalField("username");
                            setTimeout(() => setCopiedModalField(null), 2000);
                          }}
                          style={{ background: "none", border: "none", cursor: "pointer", color: "#8c7a6b", padding: "2px" }}
                          title="Copy User ID"
                        >
                          {copiedModalField === "username" ? <Check size={14} style={{ color: "#10b981" }} /> : <Copy size={14} />}
                        </button>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ color: "#8c7a6b" }}>Portal Password:</span>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <code style={{ fontWeight: "700", backgroundColor: "#faf7f0", padding: "2px 8px", borderRadius: "4px" }}>
                          {showModalPassword ? selectedCouponForView.portalPassword : "••••••••"}
                        </code>
                        <button
                          type="button"
                          onClick={() => setShowModalPassword(!showModalPassword)}
                          style={{ background: "none", border: "none", cursor: "pointer", color: "#8c7a6b", padding: "2px" }}
                          title={showModalPassword ? "Hide password" : "Show password"}
                        >
                          {showModalPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(selectedCouponForView.portalPassword || "");
                            setCopiedModalField("password");
                            setTimeout(() => setCopiedModalField(null), 2000);
                          }}
                          style={{ background: "none", border: "none", cursor: "pointer", color: "#8c7a6b", padding: "2px" }}
                          title="Copy Password"
                        >
                          {copiedModalField === "password" ? <Check size={14} style={{ color: "#10b981" }} /> : <Copy size={14} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const portalUrl = typeof window !== "undefined" ? `${window.location.origin}/company-portal` : "https://legacybridge.in/company-portal";
                      const msg = `🏢 Company: ${selectedCouponForView.companyName}\n🎟️ Exclusive Coupon Code: ${selectedCouponForView.code}\n🔗 HR Management Portal: ${portalUrl}\n👤 User ID: ${selectedCouponForView.portalUsername}\n🔑 Password: ${selectedCouponForView.portalPassword}\nQuota: ${selectedCouponForView.maxEmails || 50} employee emails\n\nInstructions: Log in to the portal above to whitelist employee emails who are eligible for this coupon.`;
                      navigator.clipboard.writeText(msg);
                      setCopiedModalField("all");
                      setTimeout(() => setCopiedModalField(null), 2500);
                    }}
                    style={{
                      marginTop: "12px",
                      width: "100%",
                      padding: "8px 12px",
                      backgroundColor: "#faf7f0",
                      border: "1px solid rgba(217, 184, 133, 0.4)",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: "700",
                      color: "#b28e46",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px"
                    }}
                  >
                    {copiedModalField === "all" ? <Check size={14} style={{ color: "#10b981" }} /> : <Copy size={14} />}
                    <span>{copiedModalField === "all" ? "✓ All Portal Info Copied to Clipboard!" : "📋 Copy Complete HR Login Message"}</span>
                  </button>
                </div>

                {/* Whitelisted Emails */}
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span style={{ fontSize: "11px", color: "#8c7a6b", fontWeight: "700" }}>
                      AUTHORIZED EMPLOYEE EMAILS ({selectedCouponForView.allowedEmails?.length || 0})
                    </span>
                  </div>

                  {(!selectedCouponForView.allowedEmails || selectedCouponForView.allowedEmails.length === 0) ? (
                    <div style={{ fontSize: "12px", color: "#8c7a6b", fontStyle: "italic", backgroundColor: "#faf7f0", padding: "10px 12px", borderRadius: "8px", border: "1px dashed #dcd1c4" }}>
                      No employee emails added yet. The company HR can log into the portal to add up to {selectedCouponForView.maxEmails || 50} emails.
                    </div>
                  ) : (
                    <div style={{ 
                      maxHeight: "130px", 
                      overflowY: "auto", 
                      backgroundColor: "#ffffff", 
                      border: "1px solid #e5dccf", 
                      borderRadius: "8px", 
                      padding: "8px 10px",
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "6px"
                    }}>
                      {selectedCouponForView.allowedEmails.map((em: string, idx: number) => (
                        <span key={idx} style={{ 
                          fontSize: "11px", 
                          backgroundColor: "#faf7f0", 
                          border: "1px solid #dcd1c4", 
                          padding: "3px 8px", 
                          borderRadius: "12px",
                          color: "#1a150e",
                          fontWeight: "500"
                        }}>
                          {em}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "10px", paddingTop: "12px", borderTop: "1px solid #f0e9df" }}>
              {selectedCouponForView.status === "active" && (
                <button
                  type="button"
                  onClick={() => {
                    handleDeleteCoupon(selectedCouponForView._id);
                    setSelectedCouponForView(null);
                  }}
                  style={{
                    backgroundColor: "rgba(239, 68, 68, 0.08)",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    color: "#ef4444",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontWeight: "600"
                  }}
                >
                  Deactivate Coupon
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setSelectedCouponForView(null);
                  setShowModalPassword(false);
                }}
                style={{
                  backgroundColor: "#b28e46",
                  border: "none",
                  color: "#1a150e",
                  padding: "8px 20px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: "700"
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
