"use client";

import React from "react";
import { Search, ShieldAlert, Download } from "lucide-react";
import { useVault, INSTRUMENT_TYPES } from "./VaultContext";

export default function TopNavbar() {
  const { searchTerm, setSearchTerm, handleVerifyIntegrity, vaultIndex } = useVault();

  const handleExportPDF = () => {
    // Group files by category
    const filesByCategory: Record<string, typeof vaultIndex.files> = {};
    vaultIndex.files.forEach((file) => {
      if (!filesByCategory[file.category]) {
        filesByCategory[file.category] = [];
      }
      filesByCategory[file.category].push(file);
    });

    let categoriesHtml = "";

    INSTRUMENT_TYPES.forEach((cat) => {
      const catFiles = filesByCategory[cat.id];
      if (catFiles && catFiles.length > 0) {
        let filesHtml = "";
        catFiles.forEach((file) => {
          let detailsHtml = "";
          Object.entries(file.details).forEach(([key, val]) => {
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
              <div style="font-size: 13px; font-weight: 600; color: #4338ca; margin-bottom: 8px; border-bottom: 1px dashed #e2e8f0; padding-bottom: 4px;">${file.name}</div>
              <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px 12px;">
                ${detailsHtml}
              </div>
            </div>
          `;
        });

        categoriesHtml += `
          <div style="margin-bottom: 24px; page-break-inside: avoid;">
            <div style="font-size: 14px; font-weight: 700; color: #0f172a; margin-bottom: 10px; text-transform: uppercase; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; letter-spacing: 0.5px;">${cat.label}</div>
            ${filesHtml}
          </div>
        `;
      }
    });

    const element = document.createElement("div");
    element.innerHTML = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 30px; color: #1e293b; background-color: #fff;">
        <h1 style="color: #6366f1; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 5px; font-size: 22px; font-weight: 700;">LegacyBridge Secure Vault Report</h1>
        <div style="font-size: 11px; color: #64748b; margin-bottom: 20px;">
          Generated on: ${new Date().toLocaleString()} | Contains zero-knowledge client-side decrypted assets.
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
        filename: 'legacybridge_vault_report.pdf',
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
    <header className="top-navbar">
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        gap: "10px", 
        width: "360px", 
        backgroundColor: "#faf7f0", 
        border: "1px solid rgba(217, 184, 133, 0.25)", 
        borderRadius: "10px", 
        padding: "8px 14px"
      }}>
        <Search size={16} style={{ color: "var(--muted)" }} />
        <input 
          type="text" 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
          placeholder="Search records here..." 
          style={{ border: "none", outline: "none", fontSize: "14px", width: "100%", backgroundColor: "transparent", color: "var(--fg-color)" }} 
        />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <button onClick={handleVerifyIntegrity} className="btn-outline" style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px" }}>
          <ShieldAlert size={14} style={{ color: "var(--secondary)" }} />
          <span>Sync Integrity</span>
        </button>
        <button onClick={handleExportPDF} className="btn-outline" style={{ display: "none", alignItems: "center", gap: "6px", fontSize: "13px" }}>
          <Download size={14} />
          <span>Export PDF</span>
        </button>
      </div>
    </header>
  );
}
