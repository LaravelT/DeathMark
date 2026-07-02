"use client";

import React from "react";
import { Search, ShieldAlert, Download } from "lucide-react";
import { useVault, INSTRUMENT_TYPES } from "./VaultContext";

export default function TopNavbar() {
  const { searchTerm, setSearchTerm, handleVerifyIntegrity, vaultIndex } = useVault();

  const handleExportPDF = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow pop-ups to export the PDF.");
      return;
    }

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
              <div class="detail-item">
                <span class="detail-label">${label}:</span>
                <span class="detail-value">${val || "-"}</span>
              </div>
            `;
          });

          filesHtml += `
            <div class="record-card">
              <div class="record-title">${file.name}</div>
              <div class="details-grid">
                ${detailsHtml}
              </div>
            </div>
          `;
        });

        categoriesHtml += `
          <div class="category-section">
            <div class="category-title">${cat.label}</div>
            ${filesHtml}
          </div>
        `;
      }
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>LegacyBridge Secure Vault Report</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 40px; color: #1e293b; }
            h1 { color: #6366f1; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 10px; font-size: 24px; font-weight: 700; }
            .meta-info { font-size: 13px; color: #64748b; margin-bottom: 30px; }
            .category-section { margin-bottom: 32px; page-break-inside: avoid; }
            .category-title { font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 12px; text-transform: uppercase; border-bottom: 1px solid #cbd5e1; padding-bottom: 6px; letter-spacing: 0.5px; }
            .record-card { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; margin-bottom: 12px; page-break-inside: avoid; }
            .record-title { font-size: 14px; font-weight: 600; color: #4338ca; margin-bottom: 10px; border-bottom: 1px dashed #e2e8f0; padding-bottom: 4px; }
            .details-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px 16px; }
            .detail-item { font-size: 12px; display: flex; justify-content: space-between; border-bottom: 1px solid #f1f5f9; padding-bottom: 2px; }
            .detail-label { color: #64748b; font-weight: 500; }
            .detail-value { color: #0f172a; font-weight: 600; text-align: right; }
            .footer { margin-top: 60px; font-size: 11px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 16px; }
            @media print {
              body { padding: 20px; }
              .record-card { background-color: #fff; }
            }
          </style>
        </head>
        <body>
          <h1>LegacyBridge Secure Vault Report</h1>
          <div class="meta-info">
            Generated on: ${new Date().toLocaleString()} | Contains zero-knowledge client-side decrypted assets.
          </div>
          
          ${categoriesHtml || '<p style="color: #64748b; text-align: center; padding: 40px;">No asset records found in this vault.</p>'}

          <div class="footer">
            LegacyBridge Secure Vault Report — End of Document
          </div>

          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <header className="top-navbar">
      <div style={{ display: "flex", alignItems: "center", gap: "12px", width: "360px" }}>
        <Search size={18} style={{ color: "var(--muted)" }} />
        <input 
          type="text" 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
          placeholder="Search records here..." 
          style={{ border: "none", outline: "none", fontSize: "14px", width: "100%", backgroundColor: "transparent", color: "#fff" }} 
        />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <button onClick={handleVerifyIntegrity} className="btn-outline" style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px" }}>
          <ShieldAlert size={14} style={{ color: "var(--secondary)" }} />
          <span>Sync Integrity</span>
        </button>
        <button onClick={handleExportPDF} className="btn-outline" style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px" }}>
          <Download size={14} />
          <span>Export PDF</span>
        </button>
      </div>
    </header>
  );
}
