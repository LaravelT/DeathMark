"use client";

import React, { useState } from "react";
import Link from "next/link";
import { KeyRound, ShieldAlert, FileText, User, ArrowRight, ShieldCheck, Upload, AlertCircle } from "lucide-react";

export default function ClaimPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Step 1 States (Owner basics)
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerName, setOwnerName] = useState("");

  // Step 2 States (Owner IDs)
  const [ownerAadhaar, setOwnerAadhaar] = useState("");
  const [ownerPan, setOwnerPan] = useState("");

  // Step 3 States (Nominee IDs)
  const [nomineeAadhaar, setNomineeAadhaar] = useState("");
  const [nomineePan, setNomineePan] = useState("");

  // Step 4 States (Claimant info & File)
  const [claimantName, setClaimantName] = useState("");
  const [claimantGmail, setClaimantGmail] = useState("");
  const [reason, setReason] = useState("");
  const [documentBase64, setDocumentBase64] = useState<string | null>(null);

  // Status check state if already submitted
  const [underReview, setUnderReview] = useState(false);
  const [claimStatus, setClaimStatus] = useState<string | null>(null);

  const handleResetPortal = () => {
    setStep(1);
    setOwnerEmail("");
    setOwnerName("");
    setOwnerAadhaar("");
    setOwnerPan("");
    setNomineeAadhaar("");
    setNomineePan("");
    setClaimantName("");
    setClaimantGmail("");
    setReason("");
    setDocumentBase64(null);
    setUnderReview(false);
    setClaimStatus(null);
    setError("");
  };

  // File upload handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError("Document file size must be less than 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setDocumentBase64(reader.result as string);
    };
    reader.onerror = () => {
      setError("Failed to read file.");
    };
    reader.readAsDataURL(file);
  };

  const handleNextStep = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (step === 1) {
        const res = await fetch("/api/claim/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            step: 1,
            email: ownerEmail,
            ownerName
          })
        });
        
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Your details are invalid. Please check.");
          setLoading(false);
          return;
        }

        if (data.alreadyClaimed) {
          setClaimStatus(data.claimStatus);
          setUnderReview(true);
          setLoading(false);
          return;
        }

        setStep(2);
      } else if (step === 2) {
        const res = await fetch("/api/claim/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            step: 2,
            email: ownerEmail,
            ownerAadhaar,
            ownerPan
          })
        });

        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Aadhaar or PAN Card number does not match.");
          setLoading(false);
          return;
        }
        setStep(3);
      } else if (step === 3) {
        const res = await fetch("/api/claim/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            step: 3,
            email: ownerEmail,
            nomineeAadhaar,
            nomineePan
          })
        });

        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Nominee Aadhaar or PAN Card number does not match.");
          setLoading(false);
          return;
        }
        setStep(4);
      }
    } catch (err: any) {
      setError("Verification failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!documentBase64) {
      setError("Please upload a supporting document (Death Certificate, etc.).");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/claim/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: ownerEmail,
          claimantName,
          claimantGmail,
          reason,
          document: documentBase64
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to submit claim.");
        setLoading(false);
        return;
      }

      setUnderReview(true);
    } catch (err: any) {
      setError("Submission failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Render status pages
  if (underReview || claimStatus) {
    let title = "Application Under Review";
    let message = "Your application is under review. You will receive an email in 7 days.";
    let iconColor = "#ec4899";
    let bgIconColor = "rgba(236, 72, 153, 0.1)";

    if (claimStatus === "Rejected") {
      title = "Application Rejected";
      message = "Your form was rejected. Please fill out the form again with valid proofs.";
      iconColor = "#ef4444";
      bgIconColor = "rgba(239, 68, 68, 0.1)";
    } else if (claimStatus === "Approved") {
      title = "Application Approved";
      message = "Your application is accepted. You will receive an email in 3 days.";
      iconColor = "#10b981";
      bgIconColor = "rgba(16, 185, 129, 0.1)";
    }

    return (
      <div className="hero-gradient flex-center" style={{ minHeight: "100vh", padding: "20px", flexDirection: "column" }}>
        <div className="signin-card" style={{ maxWidth: "540px", textAlign: "center", padding: "40px 30px" }}>
          <div style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            backgroundColor: bgIconColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px"
          }}>
            <ShieldCheck size={32} style={{ color: iconColor }} />
          </div>
          <h1 className="signin-title" style={{ fontSize: "24px", marginBottom: "12px" }}>{title}</h1>
          <p style={{ color: "#cbd5e1", fontSize: "15px", lineHeight: "1.6", marginBottom: "32px" }}>
            {message}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {claimStatus && (
              <button 
                onClick={handleResetPortal} 
                className="btn-cta-primary" 
                style={{ width: "100%", border: "none", backgroundColor: "#ec4899" }}
              >
                Try Again / Restart Form
              </button>
            )}
            <Link href="/" className="btn-cta-primary-premium" style={{ display: "inline-flex", textDecoration: "none", width: "100%", justifyContent: "center" }}>
              Back to Landing Page
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="hero-gradient flex-center" style={{ minHeight: "100vh", padding: "40px 20px", flexDirection: "column" }}>
      {/* Header Brand */}
      <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "32px" }}>
        <div className="brand-logo-box">
          <KeyRound className="w-5 h-5 text-white" />
        </div>
        <span className="brand-title">LegacyBridge</span>
      </div>

      <div className="signin-card" style={{ maxWidth: "520px", width: "100%" }}>
        <div className="signin-header">
          <div className="logo-container flex-center">
            <FileText style={{ width: "32px", height: "32px", color: "#fff" }} />
          </div>
          <h1 className="signin-title">Beneficiary Claim Portal</h1>
          <p className="signin-subtitle">Step {step} of 4: Verify details to claim assets</p>
        </div>

        {/* Steps Visual Indicator */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "30px", padding: "0 10px" }}>
          {[1, 2, 3, 4].map((s) => (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                backgroundColor: step === s ? "#ec4899" : step > s ? "rgba(16,185,129,0.2)" : "#1e293b",
                border: step === s ? "2px solid #ec4899" : "1px solid var(--card-border)",
                color: step >= s ? "#fff" : "var(--muted)",
                fontSize: "12px",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                {s}
              </div>
              {s < 4 && <div style={{ width: "40px", height: "2px", backgroundColor: step > s ? "#10b981" : "#1e293b" }} />}
            </div>
          ))}
        </div>

        {error && (
          <div style={{ display: "flex", gap: "10px", alignItems: "center", padding: "12px", backgroundColor: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "8px", color: "#f87171", fontSize: "14px", marginBottom: "20px" }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Step 1 Form */}
        {step === 1 && (
          <form onSubmit={handleNextStep} className="signin-body" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label className="form-label">Relative's Gmail Address <span style={{ color: "var(--danger)" }}>*</span></label>
              <input
                type="email"
                value={ownerEmail}
                onChange={(e) => setOwnerEmail(e.target.value)}
                placeholder="relative@gmail.com"
                required
                style={{ width: "100%", padding: "12px 14px", backgroundColor: "#1e293b", border: "1px solid var(--card-border)", borderRadius: "10px", color: "#fff", fontSize: "15px" }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label className="form-label">Relative's Full Name <span style={{ color: "var(--danger)" }}>*</span></label>
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="Enter Relative's Legal Name"
                required
                style={{ width: "100%", padding: "12px 14px", backgroundColor: "#1e293b", border: "1px solid var(--card-border)", borderRadius: "10px", color: "#fff", fontSize: "15px" }}
              />
            </div>

            <button type="submit" className="btn-cta-primary" style={{ width: "100%", border: "none", marginTop: "10px", backgroundColor: "#ec4899" }} disabled={loading}>
              {loading ? "Verifying..." : "Continue"}
            </button>
            <Link href="/" style={{ color: "var(--muted)", fontSize: "14px", textAlign: "center", textDecoration: "none", marginTop: "4px" }}>
              Back to Home
            </Link>
          </form>
        )}

        {/* Step 2 Form */}
        {step === 2 && (
          <form onSubmit={handleNextStep} className="signin-body" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label className="form-label">Relative's Aadhaar Card No <span style={{ color: "var(--danger)" }}>*</span></label>
              <input
                type="text"
                value={ownerAadhaar}
                onChange={(e) => setOwnerAadhaar(e.target.value.replace(/\D/g, ''))}
                placeholder="12-digit Aadhaar No"
                required
                pattern="\d{12}"
                maxLength={12}
                style={{ width: "100%", padding: "12px 14px", backgroundColor: "#1e293b", border: "1px solid var(--card-border)", borderRadius: "10px", color: "#fff", fontSize: "15px" }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label className="form-label">Relative's PAN Card No <span style={{ color: "var(--danger)" }}>*</span></label>
              <input
                type="text"
                value={ownerPan}
                onChange={(e) => setOwnerPan(e.target.value.toUpperCase())}
                placeholder="10-digit PAN No"
                required
                maxLength={10}
                style={{ width: "100%", padding: "12px 14px", backgroundColor: "#1e293b", border: "1px solid var(--card-border)", borderRadius: "10px", color: "#fff", fontSize: "15px", textTransform: "uppercase" }}
              />
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button type="button" onClick={() => setStep(1)} className="btn-cta-secondary" style={{ flex: 1 }}>
                Go Back
              </button>
              <button type="submit" className="btn-cta-primary" style={{ flex: 1, border: "none", backgroundColor: "#ec4899" }} disabled={loading}>
                {loading ? "Verifying..." : "Continue"}
              </button>
            </div>
          </form>
        )}

        {/* Step 3 Form */}
        {step === 3 && (
          <form onSubmit={handleNextStep} className="signin-body" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label className="form-label">Nominee Aadhaar Card No <span style={{ color: "var(--danger)" }}>*</span></label>
              <input
                type="text"
                value={nomineeAadhaar}
                onChange={(e) => setNomineeAadhaar(e.target.value.replace(/\D/g, ''))}
                placeholder="12-digit Nominee Aadhaar"
                required
                pattern="\d{12}"
                maxLength={12}
                style={{ width: "100%", padding: "12px 14px", backgroundColor: "#1e293b", border: "1px solid var(--card-border)", borderRadius: "10px", color: "#fff", fontSize: "15px" }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label className="form-label">Nominee PAN Card No <span style={{ color: "var(--danger)" }}>*</span></label>
              <input
                type="text"
                value={nomineePan}
                onChange={(e) => setNomineePan(e.target.value.toUpperCase())}
                placeholder="10-digit Nominee PAN"
                required
                maxLength={10}
                style={{ width: "100%", padding: "12px 14px", backgroundColor: "#1e293b", border: "1px solid var(--card-border)", borderRadius: "10px", color: "#fff", fontSize: "15px", textTransform: "uppercase" }}
              />
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button type="button" onClick={() => setStep(2)} className="btn-cta-secondary" style={{ flex: 1 }}>
                Go Back
              </button>
              <button type="submit" className="btn-cta-primary" style={{ flex: 1, border: "none", backgroundColor: "#ec4899" }} disabled={loading}>
                {loading ? "Verifying..." : "Continue"}
              </button>
            </div>
          </form>
        )}

        {/* Step 4 Form */}
        {step === 4 && (
          <form onSubmit={handleSubmitClaim} className="signin-body" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label className="form-label">Your Full Name <span style={{ color: "var(--danger)" }}>*</span></label>
              <input
                type="text"
                value={claimantName}
                onChange={(e) => setClaimantName(e.target.value)}
                placeholder="Enter Your Legal Name"
                required
                style={{ width: "100%", padding: "12px 14px", backgroundColor: "#1e293b", border: "1px solid var(--card-border)", borderRadius: "10px", color: "#fff", fontSize: "15px" }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label className="form-label">Your Gmail Address <span style={{ color: "var(--danger)" }}>*</span></label>
              <input
                type="email"
                value={claimantGmail}
                onChange={(e) => setClaimantGmail(e.target.value)}
                placeholder="yourname@gmail.com"
                required
                style={{ width: "100%", padding: "12px 14px", backgroundColor: "#1e293b", border: "1px solid var(--card-border)", borderRadius: "10px", color: "#fff", fontSize: "15px" }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label className="form-label">Why do you need these details? (Reason) <span style={{ color: "var(--danger)" }}>*</span></label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explain why you are requesting details of this asset vault..."
                required
                rows={4}
                style={{ width: "100%", padding: "12px 14px", backgroundColor: "#1e293b", border: "1px solid var(--card-border)", borderRadius: "10px", color: "#fff", fontSize: "15px", resize: "none" }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label className="form-label">Supporting Document (e.g. Death Certificate) <span style={{ color: "var(--danger)" }}>*</span></label>
              <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: "10px", padding: "20px", border: "2px dashed var(--card-border)", borderRadius: "12px", backgroundColor: "rgba(0,0,0,0.1)", alignItems: "center" }}>
                <Upload size={24} style={{ color: "var(--muted)", marginBottom: "4px" }} />
                <span style={{ fontSize: "13px", color: "var(--muted)" }}>Click to upload file (Max 2MB)</span>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                  required
                  style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer" }}
                />
                {documentBase64 && (
                  <span style={{ fontSize: "12px", color: "#ec4899", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}>
                    <ShieldCheck size={14} /> Document Uploaded
                  </span>
                )}
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button type="button" onClick={() => setStep(3)} className="btn-cta-secondary" style={{ flex: 1 }}>
                Go Back
              </button>
              <button type="submit" className="btn-cta-primary" style={{ flex: 1, border: "none", backgroundColor: "#ec4899" }} disabled={loading}>
                {loading ? "Submitting..." : "Submit Claim"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
