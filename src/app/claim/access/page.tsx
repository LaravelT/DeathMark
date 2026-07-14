"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { KeyRound, ShieldCheck, AlertCircle, FileText, Download, ShieldAlert, ArrowLeft } from "lucide-react";
import { deriveKey, decryptData } from "@/lib/crypto";

function ClaimAccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const ownerEmail = searchParams.get("email") || "";
  const claimId = searchParams.get("claimId") || "";

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isCheckingLink, setIsCheckingLink] = useState(true);

  // Step 1: Owner Verification
  const [ownerAadhaar, setOwnerAadhaar] = useState("");
  const [ownerPan, setOwnerPan] = useState("");

  // Step 2: Nominee Credentials (for Decryption)
  const [nomineeAadhaar, setNomineeAadhaar] = useState("");
  const [nomineePan, setNomineePan] = useState("");

  // Decrypted vault files state
  const [decryptedFiles, setDecryptedFiles] = useState<any[]>([]);
  const [ownerName, setOwnerName] = useState("");

  useEffect(() => {
    if (!ownerEmail) {
      setError("Invalid access link. Owner email is missing.");
      setIsCheckingLink(false);
      return;
    }

    // Pre-check link expiration on page load
    fetch(`/api/claim/snapshot?email=${encodeURIComponent(ownerEmail)}&claimId=${claimId}`)
      .then(async (res) => {
        if (res.status === 403) {
          const data = await res.json();
          if (data.error && data.error.includes("expired")) {
            setError(data.error);
            setStep(0); // Mark step as 0 to hide verification forms
          }
        }
      })
      .catch((err) => console.error("Error checking link expiration:", err))
      .finally(() => {
        setIsCheckingLink(false);
      });
  }, [ownerEmail]);

  const handleVerifyStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
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
        setError(data.error || "Verification failed. Owner Aadhaar or PAN is incorrect.");
        setLoading(false);
        return;
      }

      setStep(2);
    } catch (err: any) {
      setError("Connection error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDecryptStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1. Verify nominee credentials against database to confirm eligibility
      const verifyRes = await fetch("/api/claim/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          step: 3,
          email: ownerEmail,
          nomineeAadhaar,
          nomineePan
        })
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) {
        setError(verifyData.error || "Verification failed. Nominee Aadhaar or PAN is incorrect.");
        setLoading(false);
        return;
      }

      // 2. Fetch encrypted snapshot
      const snapshotRes = await fetch(`/api/claim/snapshot?email=${encodeURIComponent(ownerEmail)}&claimId=${claimId}`);
      const snapshotData = await snapshotRes.json();

      if (!snapshotRes.ok) {
        setError(snapshotData.error || "Failed to load secure vault snapshot.");
        setLoading(false);
        return;
      }

      setOwnerName(snapshotData.ownerName || "");

      const encryptedSnapshot = snapshotData.encryptedSnapshot;
      if (!encryptedSnapshot) {
        setError("Vault snapshot is empty.");
        setLoading(false);
        return;
      }

      // 3. Client-Side Decrypt using Nominee Credentials
      const [ivB64, ciphertextB64] = encryptedSnapshot.split(".");
      if (!ivB64 || !ciphertextB64) {
        throw new Error("Invalid snapshot payload structure.");
      }

      // Derive key
      const enc = new TextEncoder();
      const rawSalt = enc.encode(ownerEmail.toLowerCase().trim());
      const saltBuffer = new Uint8Array(16);
      for (let i = 0; i < Math.min(rawSalt.length, 16); i++) {
        saltBuffer[i] = rawSalt[i];
      }

      const rawPassphrase = (nomineeAadhaar.trim() + nomineePan.toUpperCase().trim());
      const snapshotKey = await deriveKey(rawPassphrase, saltBuffer);

      // Decrypt
      const decryptedText = await decryptData(snapshotKey, { iv: ivB64, ciphertext: ciphertextB64 });
      const parsedFiles = JSON.parse(decryptedText);
      setDecryptedFiles(parsedFiles);
      setStep(3);

      // Mark link as expired immediately
      fetch("/api/claim/expire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: ownerEmail, claimId })
      }).catch((e) => console.error("Failed to mark claim as expired:", e));
    } catch (err: any) {
      setError("Decryption failed. Please check your credentials or verify authorization.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    // Group files by category
    const filesByCategory: Record<string, any[]> = {};
    decryptedFiles.forEach((file) => {
      if (!filesByCategory[file.category]) {
        filesByCategory[file.category] = [];
      }
      filesByCategory[file.category].push(file);
    });

    let categoriesHtml = "";

    Object.entries(filesByCategory).forEach(([catId, catFiles]) => {
      let filesHtml = "";
      catFiles.forEach((file) => {
        let detailsHtml = "";
        Object.entries(file.details).forEach(([key, val]) => {
          if (key === "id" || key === "category" || key === "createdAt") return;
          const label = key
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (str) => str.toUpperCase());
          detailsHtml += `
            <div style="font-size: 11px; display: flex; justify-content: space-between; border-bottom: 1px solid #f1f5f9; padding-bottom: 2px;">
              <span style="color: #64748b; font-weight: 500;">${label}:</span>
              <span style="color: #0f172a; font-weight: 600; text-align: right;">${val || "-"}</span>
            </div>
          `;
        });

        filesHtml += `
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; margin-bottom: 10px; page-break-inside: avoid;">
            <div style="font-size: 13px; font-weight: 600; color: #b28e46; margin-bottom: 8px; border-bottom: 1px dashed #e2e8f0; padding-bottom: 4px;">${file.name}</div>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px 12px;">
              ${detailsHtml}
            </div>
          </div>
        `;
      });

      const catLabel = catId.replace(/_/g, ' ').toUpperCase();
      categoriesHtml += `
        <div style="margin-bottom: 24px; page-break-inside: avoid;">
          <div style="font-size: 14px; font-weight: 700; color: #0f172a; margin-bottom: 10px; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; letter-spacing: 0.5px;">${catLabel}</div>
          ${filesHtml}
        </div>
      `;
    });

    const element = document.createElement("div");
    element.innerHTML = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 30px; color: #1e293b; background-color: #fff;">
        <h1 style="color: #b28e46; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 5px; font-size: 22px; font-weight: 700;">LegacyBridge Secure Vault Claim Report</h1>
        <div style="font-size: 11px; color: #64748b; margin-bottom: 20px;">
          Vault Owner: ${ownerName} (${ownerEmail}) | Generated on: ${new Date().toLocaleString()}
        </div>
        
        ${categoriesHtml || '<p style="color: #64748b; text-align: center; padding: 30px;">No asset records found in this vault.</p>'}

        <div style="margin-top: 40px; font-size: 10px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 12px;">
          LegacyBridge Secure Vault Claim Report — End of Document
        </div>
      </div>
    `;

    document.body.appendChild(element);

    const runHtml2Pdf = () => {
      const opt = {
        margin: 10,
        filename: `legacybridge_claim_report_${ownerEmail}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      
      // @ts-ignore
      window.html2pdf().from(element).set(opt).save().then(() => {
        document.body.removeChild(element);
      });
    };

    // @ts-ignore
    if (window.html2pdf) {
      runHtml2Pdf();
    } else {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
      script.onload = () => {
        runHtml2Pdf();
      };
      document.head.appendChild(script);
    }
  };

  if (isCheckingLink) {
    return (
      <div className="signin-wrapper flex-center" style={{ minHeight: "100vh", padding: "20px", flexDirection: "column", backgroundColor: "#faf7f0" }}>
        <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "32px" }}>
          <img 
            src="/assets/legacybridge-logo.png" 
            alt="LegacyBridge Logo" 
            style={{ height: "48px", width: "auto", objectFit: "contain" }} 
          />
          <span className="brand-title" style={{ fontSize: "20px", fontWeight: "700", color: "#1a150e", WebkitTextFillColor: "#1a150e", letterSpacing: "0.01em" }}>LegacyBridge Claim Access</span>
        </div>
        <div className="signin-card" style={{ maxWidth: "500px", width: "100%", textAlign: "center", padding: "40px", backgroundColor: "#ffffff", borderRadius: "28px", border: "1px solid rgba(217, 184, 133, 0.25)", boxShadow: "0 20px 50px rgba(139, 92, 26, 0.04)" }}>
          <div className="logo-shield-container" style={{ marginBottom: "20px" }}>
            <img 
              src="/assets/legacybridge-logo.png" 
              alt="LegacyBridge Logo" 
              style={{ height: "80px", width: "auto", objectFit: "contain" }} 
            />
          </div>
          <h2 className="signin-title" style={{ fontSize: "18px", color: "#1a150e" }}>Verifying Link Security...</h2>
          <p style={{ color: "#6b5a45", fontSize: "14px", marginTop: "10px" }}>Please wait while we authorize the secure link.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="signin-wrapper flex-center" style={{ minHeight: "100vh", padding: "40px 20px", flexDirection: "column", backgroundColor: "#faf7f0" }}>
      {/* Header Brand */}
      <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "32px" }}>
        <img 
          src="/assets/legacybridge-logo.png" 
          alt="LegacyBridge Logo" 
          style={{ height: "48px", width: "auto", objectFit: "contain" }} 
        />
        <span className="brand-title" style={{ fontSize: "20px", fontWeight: "700", color: "#1a150e", WebkitTextFillColor: "#1a150e", letterSpacing: "0.01em" }}>LegacyBridge Claim Access</span>
      </div>

      <div className="signin-card" style={{ maxWidth: step === 3 ? "900px" : "500px", width: "100%", padding: "40px 30px", backgroundColor: "#ffffff", borderRadius: "28px", border: "1px solid rgba(217, 184, 133, 0.25)", boxShadow: "0 20px 50px rgba(139, 92, 26, 0.04)" }}>
        {step > 0 && step < 3 && (
          <div className="signin-header">
            <div className="logo-shield-container">
              <img 
                src="/assets/legacybridge-logo.png" 
                alt="LegacyBridge Logo" 
                style={{ height: "80px", width: "auto", objectFit: "contain" }} 
              />
            </div>
            <h1 className="signin-title" style={{ color: "#1a150e" }}>Secure Claim Decryptor</h1>
            <p className="signin-subtitle" style={{ color: "#6b5a45" }}>Step {step} of 2: Authorize to decrypt asset vault</p>
            <div className="header-divider"></div>
          </div>
        )}

        {error && (
          <div style={{ display: "flex", gap: "10px", alignItems: "center", padding: "12px", backgroundColor: "#fef2f2", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "8px", color: "#b91c1c", fontSize: "14px", marginBottom: "20px" }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {step === 0 && (
          <div className="signin-body" style={{ display: "flex", flexDirection: "column", gap: "20px", textAlign: "center" }}>
            <p style={{ color: "#6b5a45", fontSize: "14px", lineHeight: "1.6" }}>
              This secure access link has expired. For security reasons, asset verification links can only be accessed and decrypted once.
            </p>
            <a href="/" className="btn-cta-secondary" style={{ display: "inline-flex", textDecoration: "none", width: "100%", justifyContent: "center" }}>
              Back to Home
            </a>
          </div>
        )}

        {/* Step 1: Owner Details Verification */}
        {step === 1 && (
          <form onSubmit={handleVerifyStep1} className="signin-body" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <p style={{ fontSize: "14px", color: "#6b5a45", margin: "0 0 10px 0", lineHeight: "1.5" }}>
              Please enter the <strong>Relative's (Vault Owner's)</strong> details to verify your claim authorization link.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label className="form-label" style={{ color: "#1a150e" }}>Relative's Aadhaar Card No <span style={{ color: "var(--danger)" }}>*</span></label>
              <input
                type="text"
                value={ownerAadhaar}
                onChange={(e) => setOwnerAadhaar(e.target.value.replace(/\D/g, ''))}
                placeholder="12-digit Aadhaar No"
                required
                pattern="\d{12}"
                maxLength={12}
                className="signin-input"
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label className="form-label" style={{ color: "#1a150e" }}>Relative's PAN Card No <span style={{ color: "var(--danger)" }}>*</span></label>
              <input
                type="text"
                value={ownerPan}
                onChange={(e) => setOwnerPan(e.target.value.toUpperCase())}
                placeholder="10-digit PAN No"
                required
                maxLength={10}
                className="signin-input"
                style={{ textTransform: "uppercase" }}
              />
            </div>

            <button type="submit" className="btn-cta-primary" style={{ width: "100%", border: "none", marginTop: "10px" }} disabled={loading}>
              {loading ? "Verifying..." : "Verify Owner Credentials"}
            </button>
          </form>
        )}

        {/* Step 2: Nominee Credentials Decryption */}
        {step === 2 && (
          <form onSubmit={handleDecryptStep2} className="signin-body" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <p style={{ fontSize: "14px", color: "#6b5a45", margin: "0 0 10px 0", lineHeight: "1.5" }}>
              Owner details verified. Now enter <strong>Your (Nominee's)</strong> credentials. These are used as the key to decrypt the vault.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label className="form-label" style={{ color: "#1a150e" }}>Nominee's Aadhaar Card No <span style={{ color: "var(--danger)" }}>*</span></label>
              <input
                type="text"
                value={nomineeAadhaar}
                onChange={(e) => setNomineeAadhaar(e.target.value.replace(/\D/g, ''))}
                placeholder="12-digit Nominee Aadhaar"
                required
                pattern="\d{12}"
                maxLength={12}
                className="signin-input"
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label className="form-label" style={{ color: "#1a150e" }}>Nominee's PAN Card No <span style={{ color: "var(--danger)" }}>*</span></label>
              <input
                type="text"
                value={nomineePan}
                onChange={(e) => setNomineePan(e.target.value.toUpperCase())}
                placeholder="10-digit Nominee PAN"
                required
                maxLength={10}
                className="signin-input"
                style={{ textTransform: "uppercase" }}
              />
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button type="button" onClick={() => setStep(1)} className="btn-cta-secondary" style={{ flex: 1 }}>
                Go Back
              </button>
              <button type="submit" className="btn-cta-primary" style={{ flex: 1, border: "none" }} disabled={loading}>
                {loading ? "Decrypting..." : "Decrypt Vault"}
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Display Decrypted Asset Vault */}
        {step === 3 && (
          <div className="signin-body">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--card-border)", paddingBottom: "16px", marginBottom: "24px" }}>
              <div>
                <h1 className="page-title" style={{ fontSize: "20px", display: "flex", alignItems: "center", gap: "8px", fontFamily: "'Playfair Display', Georgia, serif" }}>
                  <ShieldCheck style={{ color: "var(--success)" }} />
                  <span>Decrypted Vault Assets</span>
                </h1>
                <span style={{ fontSize: "13px", color: "var(--muted)" }}>
                  Relative Name: <strong>{ownerName}</strong> ({ownerEmail})
                </span>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <a href="/" style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "12px",
                  padding: "8px 14px",
                  borderRadius: "8px",
                  border: "1px solid var(--card-border)",
                  color: "#6b5a45",
                  backgroundColor: "#ffffff",
                  textDecoration: "none",
                  cursor: "pointer",
                  fontWeight: "600"
                }}>
                  <ArrowLeft size={14} />
                  <span>Back to Home</span>
                </a>
                <button 
                  onClick={handleExportPDF} 
                  className="btn-outline" 
                  style={{ display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <Download size={14} />
                  <span>Export PDF</span>
                </button>
              </div>
            </div>

            {decryptedFiles.length === 0 ? (
              <p style={{ textAlign: "center", color: "var(--muted)", padding: "40px" }}>No assets found in this vault.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxHeight: "60vh", overflowY: "auto", paddingRight: "10px" }}>
                {decryptedFiles.map((file, idx) => (
                  <div key={file.id || idx} style={{ backgroundColor: "#faf7f0", padding: "16px", borderRadius: "12px", border: "1px solid rgba(217, 184, 133, 0.25)" }}>
                    <div style={{ fontSize: "14px", fontWeight: "700", color: "#1a150e", marginBottom: "12px", textTransform: "capitalize", borderBottom: "1px solid rgba(217,184,133,0.12)", paddingBottom: "6px" }}>
                      {file.name} <span style={{ fontSize: "11px", color: "var(--muted)", fontWeight: "normal", float: "right" }}>{file.category.replace(/_/g, ' ')}</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px 20px" }}>
                      {Object.entries(file.details).map(([k, v]: any) => {
                        if (k === "id" || k === "category" || k === "createdAt" || typeof v !== "string") return null;
                        const label = k.replace(/([A-Z])/g, " $1").replace(/^./, (str: string) => str.toUpperCase());
                        return (
                          <div key={k} style={{ display: "flex", flexDirection: "column" }}>
                            <span style={{ fontSize: "11px", color: "var(--muted)", textTransform: "uppercase" }}>{label}</span>
                            <span style={{ fontSize: "14px", color: "#5c4d3c", wordBreak: "break-all", fontWeight: "600" }}>{v || "-"}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ClaimAccessPage() {
  return (
    <Suspense fallback={<div className="signin-wrapper flex-center" style={{ minHeight: "100vh", color: "#1a150e", backgroundColor: "#faf7f0" }}>Loading Secure Portal...</div>}>
      <ClaimAccessContent />
    </Suspense>
  );
}
