"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { KeyRound, ShieldCheck, AlertCircle, FileText, Download, ShieldAlert } from "lucide-react";
import { deriveKey, decryptData } from "@/lib/crypto";

function ClaimAccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const ownerEmail = searchParams.get("email") || "";

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
    }
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
      const snapshotRes = await fetch(`/api/claim/snapshot?email=${encodeURIComponent(ownerEmail)}`);
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

      // Derive key (must match the syncPBKDF2 parameters)
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
    } catch (err: any) {
      console.error(err);
      setError("Decryption failed. Please check nominee credentials and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    // Generate beautiful PDF report
    const categoriesHtml = decryptedFiles.reduce((acc: string, file: any) => {
      let detailsHtml = "";
      Object.entries(file.details).forEach(([key, val]) => {
        if (key === "id" || key === "category" || key === "createdAt" || typeof val !== "string") return;
        const label = key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase());
        detailsHtml += `
          <div style="font-size: 11px; display: flex; justify-content: space-between; border-bottom: 1px solid #f1f5f9; padding-bottom: 2px;">
            <span style="color: #64748b; font-weight: 500;">${label}:</span>
            <span style="color: #0f172a; font-weight: 600; text-align: right;">${val || "-"}</span>
          </div>
        `;
      });

      return acc + `
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; margin-bottom: 10px; page-break-inside: avoid;">
          <div style="font-size: 13px; font-weight: 600; color: #4338ca; margin-bottom: 8px; border-bottom: 1px dashed #e2e8f0; padding-bottom: 4px;">${file.name} (${file.category.replace(/_/g, ' ').toUpperCase()})</div>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px 12px;">
            ${detailsHtml}
          </div>
        </div>
      `;
    }, "");

    const element = document.createElement("div");
    element.innerHTML = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 30px; color: #1e293b; background-color: #fff;">
        <h1 style="color: #6366f1; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 5px; font-size: 22px; font-weight: 700;">LegacyBridge Asset Vault Report</h1>
        <div style="font-size: 11px; color: #64748b; margin-bottom: 20px;">
          Owner: ${ownerName || ownerEmail} | Generated on: ${new Date().toLocaleString()} | Decrypted with Nominee Authentication.
        </div>
        
        ${categoriesHtml || '<p style="color: #64748b; text-align: center; padding: 30px;">No asset records found in this vault.</p>'}

        <div style="margin-top: 40px; font-size: 10px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 12px;">
          LegacyBridge Secure Vault Report — End of Document
        </div>
      </div>
    `;

    document.body.appendChild(element);

    const runHtml2Pdf = () => {
      const opt = {
        margin: 10,
        filename: `legacybridge_${ownerEmail}_vault.pdf`,
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

  return (
    <div className="hero-gradient flex-center" style={{ minHeight: "100vh", padding: "40px 20px", flexDirection: "column" }}>
      {/* Header Brand */}
      <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "32px" }}>
        <div className="brand-logo-box">
          <KeyRound className="w-5 h-5 text-white" />
        </div>
        <span className="brand-title">LegacyBridge Claim Access</span>
      </div>

      <div className="signin-card" style={{ maxWidth: step === 3 ? "900px" : "500px", width: "100%" }}>
        {step < 3 && (
          <div className="signin-header">
            <div className="logo-container flex-center">
              <KeyRound style={{ width: "32px", height: "32px", color: "#fff" }} />
            </div>
            <h1 className="signin-title">Secure Claim Decryptor</h1>
            <p className="signin-subtitle">Step {step} of 2: Authorize to decrypt asset vault</p>
          </div>
        )}

        {error && (
          <div style={{ display: "flex", gap: "10px", alignItems: "center", padding: "12px", backgroundColor: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "8px", color: "#f87171", fontSize: "14px", marginBottom: "20px" }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Step 1: Owner Details Verification */}
        {step === 1 && (
          <form onSubmit={handleVerifyStep1} className="signin-body" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <p style={{ fontSize: "14px", color: "var(--muted)", margin: "0 0 10px 0", lineHeight: "1.5" }}>
              Please enter the <strong>Relative's (Vault Owner's)</strong> details to verify your claim authorization link.
            </p>

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

            <button type="submit" className="btn-cta-primary" style={{ width: "100%", border: "none", marginTop: "10px", backgroundColor: "#ec4899" }} disabled={loading}>
              {loading ? "Verifying..." : "Verify Owner Credentials"}
            </button>
          </form>
        )}

        {/* Step 2: Nominee Credentials Decryption */}
        {step === 2 && (
          <form onSubmit={handleDecryptStep2} className="signin-body" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <p style={{ fontSize: "14px", color: "var(--muted)", margin: "0 0 10px 0", lineHeight: "1.5" }}>
              Owner details verified. Now enter <strong>Your (Nominee's)</strong> credentials. These are used as the key to decrypt the vault.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label className="form-label">Nominee's Aadhaar Card No <span style={{ color: "var(--danger)" }}>*</span></label>
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
              <label className="form-label">Nominee's PAN Card No <span style={{ color: "var(--danger)" }}>*</span></label>
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
              <button type="button" onClick={() => setStep(1)} className="btn-cta-secondary" style={{ flex: 1 }}>
                Go Back
              </button>
              <button type="submit" className="btn-cta-primary" style={{ flex: 1, border: "none", backgroundColor: "#ec4899" }} disabled={loading}>
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
                <h1 className="page-title" style={{ fontSize: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <ShieldCheck style={{ color: "var(--success)" }} />
                  <span>Decrypted Vault Assets</span>
                </h1>
                <span style={{ fontSize: "13px", color: "var(--muted)" }}>
                  Relative Name: <strong>{ownerName}</strong> (${ownerEmail})
                </span>
              </div>
              <button 
                onClick={handleExportPDF} 
                className="btn-signin-ghost" 
                style={{ display: "flex", alignItems: "center", gap: "6px", border: "1px solid #ec4899", color: "#ec4899" }}
              >
                <Download size={14} />
                <span>Export PDF</span>
              </button>
            </div>

            {decryptedFiles.length === 0 ? (
              <p style={{ textAlign: "center", color: "var(--muted)", padding: "40px" }}>No assets found in this vault.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxHeight: "60vh", overflowY: "auto", paddingRight: "10px" }}>
                {decryptedFiles.map((file, idx) => (
                  <div key={file.id || idx} style={{ backgroundColor: "#1e293b", padding: "16px", borderRadius: "10px", border: "1px solid var(--card-border)" }}>
                    <div style={{ fontSize: "14px", fontWeight: "600", color: "#fff", marginBottom: "12px", textTransform: "capitalize", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "6px" }}>
                      {file.name} <span style={{ fontSize: "11px", color: "var(--muted)", fontWeight: "normal", float: "right" }}>{file.category.replace(/_/g, ' ')}</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px 20px" }}>
                      {Object.entries(file.details).map(([k, v]: any) => {
                        if (k === "id" || k === "category" || k === "createdAt" || typeof v !== "string") return null;
                        const label = k.replace(/([A-Z])/g, " $1").replace(/^./, (str: string) => str.toUpperCase());
                        return (
                          <div key={k} style={{ display: "flex", flexDirection: "column" }}>
                            <span style={{ fontSize: "11px", color: "var(--muted)", textTransform: "uppercase" }}>{label}</span>
                            <span style={{ fontSize: "14px", color: "#e2e8f0", wordBreak: "break-all" }}>{v || "-"}</span>
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
    <Suspense fallback={<div className="hero-gradient flex-center" style={{ minHeight: "100vh", color: "#fff" }}>Loading Secure Portal...</div>}>
      <ClaimAccessContent />
    </Suspense>
  );
}
