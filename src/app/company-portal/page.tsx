"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Building2, 
  Lock, 
  User, 
  Ticket, 
  CheckCircle, 
  AlertCircle, 
  LogOut, 
  Copy, 
  Check, 
  Trash2, 
  Plus, 
  Users, 
  Percent, 
  Calendar, 
  ShieldCheck, 
  FileText,
  Search,
  ArrowRight,
  Eye,
  EyeOff
} from "lucide-react";

interface CompanyCouponData {
  id: string;
  code: string;
  description: string;
  discountType: "percentage" | "flat";
  discountValue: number;
  applicablePlan: string;
  companyName: string;
  maxEmails: number;
  allowedEmails: string[];
}

export default function CompanyPortalPage() {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);
  
  // Login form states
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Portal data
  const [coupon, setCoupon] = useState<CompanyCouponData | null>(null);
  const [emailList, setEmailList] = useState<string[]>([]);
  const [newEmailInput, setNewEmailInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Save states
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState("");
  const [saveError, setSaveError] = useState("");
  const [copiedCode, setCopiedCode] = useState(false);

  // Check auth session on load
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      setCheckingAuth(true);
      const res = await fetch("/api/company/details");
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.coupon) {
          setCoupon(data.coupon);
          setEmailList(data.coupon.allowedEmails || []);
          setIsAuthenticated(true);
        }
      }
    } catch (err) {
      // not logged in
    } finally {
      setCheckingAuth(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setLoginError("Please enter your User ID and Password.");
      return;
    }

    setLoginLoading(true);
    setLoginError("");

    try {
      const res = await fetch("/api/company/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Login failed. Please verify your credentials.");
      }

      setCoupon(data.coupon);
      setEmailList(data.coupon.allowedEmails || []);
      setIsAuthenticated(true);
    } catch (err: any) {
      setLoginError(err.message || "An error occurred during sign-in.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/company/logout", { method: "POST" });
    } catch (e) {
      // ignore
    }
    setIsAuthenticated(false);
    setCoupon(null);
    setEmailList([]);
    setUsername("");
    setPassword("");
  };

  const handleAddEmails = () => {
    if (!coupon) return;
    setSaveError("");
    setSaveSuccess("");

    if (!newEmailInput.trim()) {
      return;
    }

    // Split by commas, newlines, semicolons, or spaces
    const rawTokens = newEmailInput
      .split(/[\n,;\s]+/)
      .map(e => e.trim().toLowerCase())
      .filter(e => e.length > 0);

    const validNewEmails: string[] = [];
    const duplicates: string[] = [];
    const invalidItems: string[] = [];

    rawTokens.forEach(item => {
      // Validate email format or domain
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(item);
      const isDomain = item.startsWith("@") || (!item.includes("@") && item.includes("."));
      
      if (!isEmail && !isDomain) {
        invalidItems.push(item);
        return;
      }

      if (emailList.includes(item) || validNewEmails.includes(item)) {
        duplicates.push(item);
      } else {
        validNewEmails.push(item);
      }
    });

    if (invalidItems.length > 0) {
      setSaveError(`Invalid format: "${invalidItems.slice(0, 3).join(", ")}". Please enter valid email addresses.`);
      return;
    }

    const availableSlots = (coupon.maxEmails || 50) - emailList.length;
    if (validNewEmails.length > availableSlots) {
      setSaveError(`Cannot add ${validNewEmails.length} emails. Only ${availableSlots} slot(s) remaining out of ${coupon.maxEmails} total allowed.`);
      return;
    }

    if (validNewEmails.length === 0 && duplicates.length > 0) {
      setSaveError("All entered email addresses are already in the allowed list.");
      return;
    }

    setEmailList(prev => [...prev, ...validNewEmails]);
    setNewEmailInput("");
    setSaveSuccess(`Added ${validNewEmails.length} email(s) to the list. Click "Save Changes" below to update.`);
  };

  const handleRemoveEmail = (targetEmail: string) => {
    setEmailList(prev => prev.filter(e => e !== targetEmail));
    setSaveSuccess("Email removed from list. Click 'Save Changes' below to finalize.");
    setSaveError("");
  };

  const handleSaveToDatabase = async () => {
    if (!coupon) return;
    setSaveLoading(true);
    setSaveSuccess("");
    setSaveError("");

    try {
      const res = await fetch("/api/company/update-emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails: emailList })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update emails.");
      }

      setEmailList(data.allowedEmails);
      setCoupon(prev => prev ? { ...prev, allowedEmails: data.allowedEmails } : null);
      setSaveSuccess(`Success! ${data.count} allowed employee emails are active.`);
    } catch (err: any) {
      setSaveError(err.message || "Failed to save email list.");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (!coupon?.code) return;
    navigator.clipboard.writeText(coupon.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const filteredEmails = emailList.filter(email => 
    email.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  const maxEmails = coupon?.maxEmails || 50;
  const usedCount = emailList.length;
  const remainingCount = Math.max(0, maxEmails - usedCount);
  const percentageUsed = Math.min(100, Math.round((usedCount / maxEmails) * 100));

  if (checkingAuth) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#0e0c0a", color: "#d9b885" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
          <div style={{ width: "36px", height: "36px", border: "3px solid rgba(217,184,133,0.3)", borderTopColor: "#b28e46", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
          <p style={{ fontSize: "14px", letterSpacing: "1px" }}>Loading Corporate Portal...</p>
        </div>
      </div>
    );
  }

  // ===================== LOGIN VIEW =====================
  if (!isAuthenticated || !coupon) {
    return (
      <div style={{ 
        minHeight: "100vh", 
        backgroundColor: "#0d0b09", 
        backgroundImage: "radial-gradient(circle at 50% 20%, rgba(178, 142, 70, 0.12), transparent 50%)",
        display: "flex", 
        flexDirection: "column", 
        alignItems: "center", 
        justifyContent: "center", 
        padding: "24px",
        fontFamily: "var(--font-geist-sans), sans-serif"
      }}>
        {/* Logo and Brand */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <Link href="/" style={{ textDecoration: "none", display: "inline-block" }}>
            <div style={{ 
              backgroundColor: "#ffffff", 
              padding: "16px 28px", 
              borderRadius: "18px", 
              boxShadow: "0 12px 36px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(217, 184, 133, 0.35)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <img 
                src="/icon.png" 
                alt="LegacyBridge Logo" 
                style={{ 
                  height: "85px", 
                  width: "auto", 
                  objectFit: "contain",
                  display: "block" 
                }} 
              />
            </div>
          </Link>
          <div style={{ marginTop: "16px" }}>
            <div style={{ 
              display: "inline-flex", 
              alignItems: "center", 
              gap: "6px", 
              backgroundColor: "rgba(217, 184, 133, 0.12)", 
              border: "1px solid rgba(217, 184, 133, 0.3)", 
              padding: "5px 14px", 
              borderRadius: "20px" 
            }}>
              <Building2 size={14} style={{ color: "#d9b885" }} />
              <span style={{ fontSize: "12px", color: "#d9b885", fontWeight: "600", letterSpacing: "0.5px" }}>Corporate Partner Portal</span>
            </div>
          </div>
        </div>

        {/* Login Card */}
        <div style={{ 
          width: "100%", 
          maxWidth: "440px", 
          backgroundColor: "#161310", 
          border: "1px solid rgba(217, 184, 133, 0.25)", 
          borderRadius: "16px", 
          padding: "36px 32px", 
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.6)"
        }}>
          <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#fcfaf7", marginBottom: "8px", textAlign: "center" }}>
            Company Sign In
          </h1>
          <p style={{ fontSize: "13px", color: "#a89987", marginBottom: "24px", textAlign: "center", lineHeight: "1.5" }}>
            Enter your credentials provided by LegacyBridge to manage your employee discount access.
          </p>

          {loginError && (
            <div style={{ 
              backgroundColor: "rgba(239, 68, 68, 0.15)", 
              border: "1px solid rgba(239, 68, 68, 0.4)", 
              borderRadius: "8px", 
              padding: "10px 14px", 
              marginBottom: "20px", 
              display: "flex", 
              alignItems: "center", 
              gap: "10px", 
              color: "#fca5a5", 
              fontSize: "13px" 
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#d9b885", marginBottom: "6px" }}>
                Company Portal User ID
              </label>
              <div style={{ position: "relative" }}>
                <User size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#8c7a6b" }} />
                <input 
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. tcs_admin"
                  required
                  autoFocus
                  style={{
                    width: "100%",
                    padding: "11px 12px 11px 38px",
                    backgroundColor: "#0d0b09",
                    border: "1px solid rgba(217, 184, 133, 0.3)",
                    borderRadius: "8px",
                    color: "#fcfaf7",
                    fontSize: "14px",
                    outline: "none"
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#d9b885", marginBottom: "6px" }}>
                Portal Password
              </label>
              <div style={{ position: "relative" }}>
                <Lock size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#8c7a6b" }} />
                <input 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter portal password"
                  required
                  style={{
                    width: "100%",
                    padding: "11px 40px 11px 38px",
                    backgroundColor: "#0d0b09",
                    border: "1px solid rgba(217, 184, 133, 0.3)",
                    borderRadius: "8px",
                    color: "#fcfaf7",
                    fontSize: "14px",
                    outline: "none"
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#8c7a6b",
                    padding: 0
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              style={{
                marginTop: "8px",
                width: "100%",
                padding: "12px",
                backgroundColor: "#b28e46",
                color: "#1a150e",
                fontWeight: "700",
                fontSize: "14px",
                borderRadius: "8px",
                border: "none",
                cursor: loginLoading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                transition: "background 0.2s"
              }}
            >
              <span>{loginLoading ? "Verifying..." : "Sign In to Portal"}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px solid rgba(217, 184, 133, 0.15)", textAlign: "center" }}>
            <p style={{ fontSize: "12px", color: "#8c7a6b", margin: 0 }}>
              Need assistance or credentials? Please contact your LegacyBridge representative or support team.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ===================== DASHBOARD VIEW =====================
  const planText = coupon.applicablePlan === "annual" ? "Annual Plan Only" : coupon.applicablePlan === "lifetime" ? "Lifetime Plan Only" : "All Plans";
  const discountLabel = coupon.discountType === "percentage" ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} FLAT DISCOUNT`;

  return (
    <div style={{ 
      minHeight: "100vh", 
      backgroundColor: "#faf7f0", 
      color: "#1a150e",
      fontFamily: "var(--font-geist-sans), sans-serif"
    }}>
      {/* Top Navbar */}
      <header style={{ 
        backgroundColor: "#161310", 
        borderBottom: "1px solid rgba(217, 184, 133, 0.25)", 
        padding: "16px 24px", 
        position: "sticky", 
        top: 0, 
        zIndex: 100 
      }}>
        <div style={{ maxWidth: "1140px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <Link href="/" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
              <div style={{
                backgroundColor: "#ffffff",
                padding: "6px 14px",
                borderRadius: "10px",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.25)",
                display: "inline-flex",
                alignItems: "center"
              }}>
                <img 
                  src="/icon.png" 
                  alt="LegacyBridge Logo" 
                  style={{ height: "38px", width: "auto", objectFit: "contain", display: "block" }} 
                />
              </div>
            </Link>
            <div style={{ height: "24px", width: "1px", backgroundColor: "rgba(217, 184, 133, 0.3)" }} />
            <span style={{ fontSize: "13px", fontWeight: "600", color: "#d9b885", letterSpacing: "0.5px" }}>
              Corporate Partner Portal
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "8px", 
              backgroundColor: "rgba(217, 184, 133, 0.15)", 
              border: "1px solid rgba(217, 184, 133, 0.3)", 
              padding: "6px 14px", 
              borderRadius: "20px" 
            }}>
              <Building2 size={15} style={{ color: "#d9b885" }} />
              <span style={{ fontSize: "13px", fontWeight: "700", color: "#fcfaf7" }}>{coupon.companyName}</span>
            </div>

            <button
              onClick={handleLogout}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                backgroundColor: "transparent",
                border: "1px solid rgba(217, 184, 133, 0.3)",
                color: "#d9b885",
                padding: "6px 12px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: "600",
                cursor: "pointer"
              }}
            >
              <LogOut size={14} />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: "1140px", margin: "0 auto", padding: "32px 24px" }}>
        
        {/* Welcome Banner */}
        <div style={{ marginBottom: "28px" }}>
          <h1 style={{ fontSize: "26px", fontWeight: "800", color: "#1a150e", margin: "0 0 6px 0" }}>
            {coupon.companyName} Employee Benefit Management
          </h1>
          <p style={{ fontSize: "14px", color: "#6b5a45", margin: 0 }}>
            Manage the official employee email addresses permitted to claim your company-sponsored LegacyBridge discount.
          </p>
        </div>

        {/* Top Grid: Benefit Overview & Quota Tracker */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px", marginBottom: "28px" }}>
          
          {/* Card 1: Read-Only Benefit Details */}
          <div style={{ 
            backgroundColor: "#ffffff", 
            borderRadius: "14px", 
            border: "1px solid rgba(217, 184, 133, 0.3)", 
            padding: "24px", 
            boxShadow: "0 4px 12px rgba(0,0,0,0.03)" 
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <span style={{ fontSize: "12px", fontWeight: "700", color: "#8c7a6b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Company Benefit Details
              </span>
              <span style={{ fontSize: "11px", backgroundColor: "#ecfdf5", color: "#059669", fontWeight: "700", padding: "3px 8px", borderRadius: "12px" }}>
                Active Benefit
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <span style={{ fontSize: "11px", color: "#8c7a6b", fontWeight: "600", display: "block" }}>COUPON CODE</span>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "4px" }}>
                  <code style={{ fontSize: "18px", fontWeight: "800", color: "#1a150e", backgroundColor: "#faf7f0", padding: "4px 10px", borderRadius: "6px", border: "1px dashed #b28e46" }}>
                    {coupon.code}
                  </code>
                  <button
                    onClick={handleCopyCode}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      backgroundColor: "transparent",
                      border: "1px solid #dcd1c4",
                      padding: "5px 10px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "#6b5a45",
                      cursor: "pointer"
                    }}
                  >
                    {copiedCode ? <Check size={14} style={{ color: "#10b981" }} /> : <Copy size={14} />}
                    <span>{copiedCode ? "Copied" : "Copy"}</span>
                  </button>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", paddingTop: "8px", borderTop: "1px solid #f0e9df" }}>
                <div>
                  <span style={{ fontSize: "11px", color: "#8c7a6b", fontWeight: "600" }}>DISCOUNT VALUE</span>
                  <div style={{ fontSize: "15px", fontWeight: "700", color: "#b28e46", marginTop: "2px" }}>
                    {discountLabel}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "#8c7a6b", fontWeight: "600" }}>APPLICABLE PLAN</span>
                  <div style={{ fontSize: "14px", fontWeight: "600", color: "#1a150e", marginTop: "2px" }}>
                    {planText}
                  </div>
                </div>
              </div>

              {coupon.description && (
                <div style={{ paddingTop: "8px", borderTop: "1px solid #f0e9df", fontSize: "12px", color: "#6b5a45" }}>
                  <strong>Description:</strong> {coupon.description}
                </div>
              )}
            </div>
          </div>

          {/* Card 2: Quota Tracker */}
          <div style={{ 
            backgroundColor: "#ffffff", 
            borderRadius: "14px", 
            border: "1px solid rgba(217, 184, 133, 0.3)", 
            padding: "24px", 
            boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                <span style={{ fontSize: "12px", fontWeight: "700", color: "#8c7a6b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Employee Quota Allocation
                </span>
                <span style={{ fontSize: "13px", fontWeight: "700", color: "#1a150e" }}>
                  {usedCount} / {maxEmails} Registered
                </span>
              </div>

              {/* Progress Bar */}
              <div style={{ width: "100%", height: "10px", backgroundColor: "#f0e9df", borderRadius: "10px", overflow: "hidden", marginBottom: "16px" }}>
                <div style={{ 
                  height: "100%", 
                  width: `${percentageUsed}%`, 
                  backgroundColor: percentageUsed >= 100 ? "#ef4444" : "#b28e46", 
                  borderRadius: "10px",
                  transition: "width 0.4s ease" 
                }} />
              </div>

              {/* 3 Metric Pills */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", textAlign: "center" }}>
                <div style={{ backgroundColor: "#faf7f0", padding: "10px 8px", borderRadius: "8px", border: "1px solid #f0e9df" }}>
                  <div style={{ fontSize: "11px", color: "#8c7a6b", fontWeight: "600" }}>Total Quota</div>
                  <div style={{ fontSize: "18px", fontWeight: "800", color: "#1a150e" }}>{maxEmails}</div>
                </div>
                <div style={{ backgroundColor: "#faf7f0", padding: "10px 8px", borderRadius: "8px", border: "1px solid #f0e9df" }}>
                  <div style={{ fontSize: "11px", color: "#8c7a6b", fontWeight: "600" }}>Active Slots</div>
                  <div style={{ fontSize: "18px", fontWeight: "800", color: "#b28e46" }}>{usedCount}</div>
                </div>
                <div style={{ backgroundColor: "#faf7f0", padding: "10px 8px", borderRadius: "8px", border: "1px solid #f0e9df" }}>
                  <div style={{ fontSize: "11px", color: "#8c7a6b", fontWeight: "600" }}>Available</div>
                  <div style={{ fontSize: "18px", fontWeight: "800", color: remainingCount > 0 ? "#10b981" : "#ef4444" }}>{remainingCount}</div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: "16px", padding: "10px 12px", backgroundColor: "#fdfbf7", borderRadius: "8px", border: "1px solid rgba(217, 184, 133, 0.25)", fontSize: "12px", color: "#6b5a45", display: "flex", alignItems: "center", gap: "8px" }}>
              <ShieldCheck size={16} style={{ color: "#b28e46", flexShrink: 0 }} />
              <span>Only employees with emails listed below will be able to apply the coupon.</span>
            </div>
          </div>
        </div>

        {/* Section 2: Manage Allowed Emails */}
        <div style={{ 
          backgroundColor: "#ffffff", 
          borderRadius: "14px", 
          border: "1px solid rgba(217, 184, 133, 0.3)", 
          padding: "28px", 
          boxShadow: "0 4px 12px rgba(0,0,0,0.03)" 
        }}>
          
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#1a150e", margin: "0 0 4px 0" }}>
                Allowed Employee Email Addresses
              </h2>
              <p style={{ fontSize: "13px", color: "#6b5a45", margin: 0 }}>
                Enter single or multiple emails (paste comma-separated or one per line).
              </p>
            </div>

            {/* Save CTA */}
            <button
              onClick={handleSaveToDatabase}
              disabled={saveLoading}
              style={{
                backgroundColor: "#161310",
                color: "#d9b885",
                padding: "10px 20px",
                borderRadius: "8px",
                border: "1px solid rgba(217, 184, 133, 0.4)",
                fontSize: "14px",
                fontWeight: "700",
                cursor: saveLoading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
              <CheckCircle size={16} />
              <span>{saveLoading ? "Saving Changes..." : "Save Allowed Emails"}</span>
            </button>
          </div>

          {/* Feedback Banners */}
          {saveSuccess && (
            <div style={{ 
              backgroundColor: "rgba(16, 185, 129, 0.12)", 
              border: "1px solid rgba(16, 185, 129, 0.3)", 
              borderRadius: "8px", 
              padding: "12px 16px", 
              marginBottom: "20px", 
              color: "#065f46", 
              fontSize: "13px",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}>
              <CheckCircle size={16} style={{ flexShrink: 0 }} />
              <span>{saveSuccess}</span>
            </div>
          )}

          {saveError && (
            <div style={{ 
              backgroundColor: "rgba(239, 68, 68, 0.12)", 
              border: "1px solid rgba(239, 68, 68, 0.3)", 
              borderRadius: "8px", 
              padding: "12px 16px", 
              marginBottom: "20px", 
              color: "#991b1b", 
              fontSize: "13px",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{saveError}</span>
            </div>
          )}

          {/* Input Box for Adding Emails */}
          <div style={{ 
            backgroundColor: "#faf7f0", 
            border: "1px solid #f0e9df", 
            borderRadius: "10px", 
            padding: "18px", 
            marginBottom: "24px" 
          }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#1a150e", marginBottom: "8px" }}>
              Add Employee Emails (Remaining Slots: {remainingCount})
            </label>
            <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", flexWrap: "wrap" }}>
              <textarea
                value={newEmailInput}
                onChange={(e) => setNewEmailInput(e.target.value)}
                placeholder="Paste employee emails here (e.g. employee1@company.com, employee2@company.com)"
                rows={2}
                disabled={remainingCount <= 0}
                style={{
                  flex: 1,
                  minWidth: "280px",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  border: "1px solid #dcd1c4",
                  fontSize: "13px",
                  backgroundColor: remainingCount <= 0 ? "#f3f4f6" : "#ffffff",
                  color: "#1a150e",
                  resize: "vertical"
                }}
              />
              <button
                type="button"
                onClick={handleAddEmails}
                disabled={remainingCount <= 0 || !newEmailInput.trim()}
                style={{
                  height: "42px",
                  padding: "0 18px",
                  backgroundColor: "#b28e46",
                  color: "#1a150e",
                  fontWeight: "700",
                  fontSize: "13px",
                  borderRadius: "8px",
                  border: "none",
                  cursor: remainingCount <= 0 || !newEmailInput.trim() ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                <Plus size={16} />
                <span>Add to List</span>
              </button>
            </div>
            {remainingCount <= 0 && (
              <span style={{ fontSize: "12px", color: "#b91c1c", marginTop: "6px", display: "block" }}>
                Quota full ({maxEmails}/{maxEmails}). To add new emails, request a quota upgrade from your LegacyBridge representative.
              </span>
            )}
          </div>

          {/* Filter & Count Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px", flexWrap: "wrap", gap: "10px" }}>
            <div style={{ fontSize: "14px", fontWeight: "700", color: "#1a150e" }}>
              Registered List ({emailList.length})
            </div>

            <div style={{ position: "relative", width: "240px" }}>
              <Search size={14} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#8c7a6b" }} />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search registered emails..."
                style={{
                  width: "100%",
                  padding: "6px 10px 6px 30px",
                  borderRadius: "6px",
                  border: "1px solid #dcd1c4",
                  fontSize: "12px",
                  backgroundColor: "#ffffff"
                }}
              />
            </div>
          </div>

          {/* Email List Table / Cards */}
          {emailList.length === 0 ? (
            <div style={{ 
              textAlign: "center", 
              padding: "40px 20px", 
              border: "1px dashed #dcd1c4", 
              borderRadius: "10px", 
              backgroundColor: "#faf8f5" 
            }}>
              <Users size={32} style={{ color: "#8c7a6b", marginBottom: "8px" }} />
              <p style={{ margin: "0 0 6px 0", fontSize: "14px", fontWeight: "600", color: "#1a150e" }}>
                No Employee Emails Added Yet
              </p>
              <p style={{ margin: 0, fontSize: "12px", color: "#8c7a6b" }}>
                Paste your employees' official email addresses above to activate their benefit.
              </p>
            </div>
          ) : (
            <div style={{ maxHeight: "380px", overflowY: "auto", border: "1px solid #f0e9df", borderRadius: "8px" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
                <thead>
                  <tr style={{ backgroundColor: "#faf7f0", borderBottom: "1px solid #f0e9df", color: "#6b5a45" }}>
                    <th style={{ padding: "10px 14px", width: "60px" }}>#</th>
                    <th style={{ padding: "10px 14px" }}>Email Address / Domain</th>
                    <th style={{ padding: "10px 14px", textAlign: "right", width: "100px" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmails.map((email, idx) => (
                    <tr 
                      key={email} 
                      style={{ 
                        borderBottom: "1px solid #f0e9df", 
                        backgroundColor: idx % 2 === 0 ? "#ffffff" : "#fdfbf7" 
                      }}
                    >
                      <td style={{ padding: "10px 14px", color: "#8c7a6b", fontWeight: "600" }}>
                        {idx + 1}
                      </td>
                      <td style={{ padding: "10px 14px", color: "#1a150e", fontWeight: "600" }}>
                        {email}
                      </td>
                      <td style={{ padding: "10px 14px", textAlign: "right" }}>
                        <button
                          type="button"
                          onClick={() => handleRemoveEmail(email)}
                          title="Remove email"
                          style={{
                            backgroundColor: "transparent",
                            border: "none",
                            color: "#ef4444",
                            cursor: "pointer",
                            padding: "4px",
                            borderRadius: "4px",
                            display: "inline-flex",
                            alignItems: "center"
                          }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Bottom Save Reminder */}
          {emailList.length > 0 && (
            <div style={{ marginTop: "20px", display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={handleSaveToDatabase}
                disabled={saveLoading}
                style={{
                  backgroundColor: "#b28e46",
                  color: "#1a150e",
                  padding: "10px 24px",
                  borderRadius: "8px",
                  border: "none",
                  fontSize: "14px",
                  fontWeight: "700",
                  cursor: saveLoading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}
              >
                <CheckCircle size={16} />
                <span>{saveLoading ? "Saving..." : "Save Allowed Emails"}</span>
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
