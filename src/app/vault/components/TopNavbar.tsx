"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ShieldAlert, Download, Receipt, X, Menu } from "lucide-react";
import { useVault, INSTRUMENT_TYPES } from "./VaultContext";

export default function TopNavbar({ onToggleSidebar }: { onToggleSidebar?: () => void }) {
  const router = useRouter();
  const { searchTerm, setSearchTerm, handleVerifyIntegrity, vaultIndex, isDemo } = useVault();

  // Payment History modal state
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [payments, setPayments] = useState<any[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);

  const fetchPayments = async () => {
    setLoadingPayments(true);
    try {
      if (isDemo) {
        setPayments([
          {
            orderId: "order_demo_1",
            invoiceNumber: "SP/LB/26-27/0001",
            createdAt: new Date().toISOString(),
            plan: "annual",
            totalAmount: 1180,
            status: "completed",
          }
        ]);
      } else {
        const res = await fetch("/api/payment/history");
        if (res.ok) {
          const data = await res.json();
          setPayments(data);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPayments(false);
    }
  };

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
            <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; margin-bottom: 12px; background-color: #fafaf9;">
              <h4 style="margin: 0 0 8px 0; font-size: 13px; color: #1e293b; font-weight: 700;">${file.name}</h4>
              <div style="display: flex; flexDirection: column; gap: 4px;">
                ${detailsHtml}
              </div>
            </div>
          `;
        });

        categoriesHtml += `
          <div style="margin-bottom: 24px; page-break-inside: avoid;">
            <h3 style="border-bottom: 2px solid #b28e46; padding-bottom: 4px; color: #1a150e; font-size: 15px; font-weight: 800; margin-bottom: 12px; text-transform: uppercase;">
              ${cat.label}
            </h3>
            ${filesHtml}
          </div>
        `;
      }
    });

    const runHtml2Pdf = () => {
      const element = document.createElement("div");
      element.innerHTML = `
        <div style="padding: 40px; font-family: system-ui, -apple-system, sans-serif; color: #1c1917;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #b28e46; padding-bottom: 16px; margin-bottom: 30px;">
            <div>
              <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #1a150e; font-family: Georgia, serif;">LegacyBridge Vault Portfolio</h1>
              <p style="margin: 4px 0 0 0; font-size: 12px; color: #6b5a45;">Decrypted secure backup summary</p>
            </div>
            <div style="text-align: right;">
              <p style="margin: 0; font-size: 11px; color: #6b7280;">Date Exported</p>
              <strong style="font-size: 13px; color: #1a150e;">${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</strong>
            </div>
          </div>
          <div>
            ${categoriesHtml || '<p style="text-align: center; color: #6b7280; margin-top: 40px;">No asset records found in this vault.</p>'}
          </div>
        </div>
      `;

      // @ts-ignore
      window.html2pdf()
        .set({
          margin: 10,
          filename: `LegacyBridge_Vault_${new Date().toISOString().split("T")[0]}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
        })
        .from(element)
        .save();
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
      {onToggleSidebar && (
        <button 
          onClick={onToggleSidebar} 
          className="sidebar-toggle"
          style={{
            background: "none",
            border: "none",
            color: "var(--fg-color)",
            cursor: "pointer",
            display: "none",
            alignItems: "center",
            justifyContent: "center",
            padding: "8px",
            marginRight: "8px"
          }}
        >
          <Menu size={20} />
        </button>
      )}
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        gap: "10px", 
        width: "360px", 
        backgroundColor: "#faf7f0", 
        border: "1px solid rgba(217, 184, 133, 0.25)", 
        borderRadius: "10px", 
        padding: "8px 14px",
        position: "relative"
      }}>
        <Search size={16} style={{ color: "var(--muted)" }} />
        <input 
          type="text" 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
          placeholder="Search records here..." 
          style={{ border: "none", outline: "none", fontSize: "14px", width: "100%", backgroundColor: "transparent", color: "var(--fg-color)" }} 
        />
        {searchTerm.trim() !== "" && (() => {
          const cleanSearch = searchTerm.trim().toLowerCase();
          const matchingInstruments = INSTRUMENT_TYPES.filter(inst => 
            inst.label.toLowerCase().includes(cleanSearch) || 
            inst.id.toLowerCase().includes(cleanSearch)
          );
          const matchingFiles = vaultIndex.files.filter(file => 
            file.name.toLowerCase().includes(cleanSearch) || 
            Object.values(file.details || {}).some(v => v.toLowerCase().includes(cleanSearch))
          );

          return (
            <div style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              backgroundColor: "#ffffff",
              border: "1px solid rgba(217, 184, 133, 0.3)",
              borderRadius: "10px",
              marginTop: "6px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
              zIndex: 1000,
              maxHeight: "300px",
              overflowY: "auto",
              padding: "8px 0"
            }}>
              {matchingInstruments.length > 0 && (
                <div>
                  <div style={{ fontSize: "11px", fontWeight: "700", color: "#b28e46", padding: "6px 14px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Instruments ({matchingInstruments.length})
                  </div>
                  {matchingInstruments.map(inst => (
                    <div
                      key={inst.id}
                      onClick={() => {
                        setSearchTerm("");
                        router.push(isDemo ? `/vault/${inst.id}?demo=true` : `/vault/${inst.id}`);
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#faf7f0"}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                      style={{
                        padding: "8px 14px",
                        fontSize: "13px",
                        cursor: "pointer",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        color: "#1a150e",
                        transition: "background-color 0.2s"
                      }}
                    >
                      <span>{inst.label}</span>
                      <span style={{ fontSize: "11px", backgroundColor: "#fbf5e6", color: "#b28e46", padding: "2px 6px", borderRadius: "10px", fontWeight: "bold" }}>
                        Open
                      </span>
                    </div>
                  ))}
                </div>
              )}
              
              {matchingFiles.length > 0 && (
                <div style={{ borderTop: matchingInstruments.length > 0 ? "1px solid #f3f4f6" : "none", marginTop: matchingInstruments.length > 0 ? "6px" : 0, paddingTop: matchingInstruments.length > 0 ? "6px" : 0 }}>
                  <div style={{ fontSize: "11px", fontWeight: "700", color: "#b28e46", padding: "6px 14px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Vault Records ({matchingFiles.length})
                  </div>
                  {matchingFiles.map(file => (
                    <div
                      key={file.id}
                      onClick={() => {
                        setSearchTerm("");
                        router.push(isDemo ? `/vault/${file.category}?id=${file.id}&demo=true` : `/vault/${file.category}?id=${file.id}`);
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#faf7f0"}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                      style={{
                        padding: "8px 14px",
                        fontSize: "13px",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        color: "#1a150e",
                        transition: "background-color 0.2s"
                      }}
                    >
                      <strong style={{ fontSize: "13px" }}>{file.name}</strong>
                      <span style={{ fontSize: "11px", color: "var(--muted)" }}>
                        Category: {INSTRUMENT_TYPES.find(t => t.id === file.category)?.label || file.category}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              
              {matchingInstruments.length === 0 && matchingFiles.length === 0 && (
                <div style={{ padding: "16px", textAlign: "center", color: "var(--muted)", fontSize: "13px" }}>
                  No matching instruments or records found.
                </div>
              )}
            </div>
          );
        })()}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <button 
          onClick={() => {
            setIsHistoryModalOpen(true);
            fetchPayments();
          }} 
          className="btn-outline" 
          style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px" }}
        >
          <Receipt size={14} style={{ color: "var(--secondary)" }} />
          <span>Payment History & Invoices</span>
        </button>

        <button onClick={handleVerifyIntegrity} className="btn-outline" style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px" }}>
          <ShieldAlert size={14} style={{ color: "var(--secondary)" }} />
          <span>Sync Integrity</span>
        </button>
      </div>

      {/* Payment History Modal */}
      {isHistoryModalOpen && (
        <div 
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.6)",
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
              padding: "28px",
              maxWidth: "760px",
              width: "100%",
              boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
              border: "1px solid rgba(217, 184, 133, 0.3)",
              display: "flex",
              flexDirection: "column",
              maxHeight: "85vh",
              overflowY: "auto"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f0e9df", paddingBottom: "16px", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Receipt size={20} style={{ color: "#b28e46" }} />
                <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "20px", fontWeight: "750", color: "#1a150e", margin: 0 }}>
                  Payment History & Invoices
                </h2>
              </div>
              <button 
                onClick={() => setIsHistoryModalOpen(false)}
                style={{ background: "none", border: "none", color: "#6b5a45", cursor: "pointer", display: "flex", alignItems: "center" }}
              >
                <X size={20} />
              </button>
            </div>

            {loadingPayments ? (
              <div style={{ textAlign: "center", padding: "40px", color: "var(--muted)", fontSize: "14px" }}>
                Loading records...
              </div>
            ) : payments.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px", color: "var(--muted)", fontSize: "14px" }}>
                No successful payments found.
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13.5px" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #e5e7eb", color: "#6b5a45", fontWeight: "700" }}>
                      <th style={{ padding: "10px 12px" }}>Date</th>
                      <th style={{ padding: "10px 12px" }}>Plan</th>
                      <th style={{ padding: "10px 12px" }}>Invoice Number</th>
                      <th style={{ padding: "10px 12px" }}>Amount</th>
                      <th style={{ padding: "10px 12px", textAlign: "right" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p) => {
                      const pDate = new Date(p.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                      });
                      return (
                        <tr key={p.orderId} style={{ borderBottom: "1px solid #f3f4f6" }}>
                          <td style={{ padding: "12px", color: "#6b5a45" }}>{pDate}</td>
                          <td style={{ padding: "12px", color: "#1a150e", fontWeight: "600", textTransform: "capitalize" }}>{p.plan} Access</td>
                          <td style={{ padding: "12px", color: "#1a150e" }}>{p.invoiceNumber}</td>
                          <td style={{ padding: "12px", color: "#1a150e", fontWeight: "600" }}>₹{p.totalAmount}</td>
                          <td style={{ padding: "12px", textAlign: "right" }}>
                            <button
                              onClick={() => {
                                setIsHistoryModalOpen(false);
                                router.push(isDemo ? `/vault/invoice/${p.orderId}?demo=true` : `/vault/invoice/${p.orderId}`);
                              }}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                                padding: "6px 10px",
                                backgroundColor: "#fbf5e6",
                                color: "#b28e46",
                                border: "none",
                                borderRadius: "6px",
                                cursor: "pointer",
                                fontSize: "12px",
                                fontWeight: "700"
                              }}
                            >
                              <Download size={12} /> View Invoice
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
