"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Printer, ArrowLeft, Download } from "lucide-react";

function numberToWordsINR(num: number): string {
  const a = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
    "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"
  ];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const g = ["", "Thousand", "Lakh", "Crore"];

  if (num === 0) return "Zero";

  function helper(n: number): string {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + a[n % 10] : "");
    return a[Math.floor(n / 100)] + " Hundred" + (n % 100 !== 0 ? " " + helper(n % 100) : "");
  }

  let words = "";
  const parts = [];
  // Hundreds
  parts.push(num % 1000);
  num = Math.floor(num / 1000);
  // Thousands
  parts.push(num % 100);
  num = Math.floor(num / 100);
  // Lakhs
  parts.push(num % 100);
  num = Math.floor(num / 100);
  // Crores
  parts.push(num);

  for (let i = 3; i >= 0; i--) {
    const val = parts[i];
    if (val > 0) {
      const partWords = helper(val);
      words += (words ? " " : "") + partWords + (g[i] ? " " + g[i] : "");
    }
  }

  return `INR ${words} Only/-`;
}

export default function InvoicePage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [payment, setPayment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!orderId) return;

    const fetchInvoice = async () => {
      if (orderId.startsWith("order_demo") || window.location.search.includes("demo=true")) {
        setPayment({
          orderId: "order_demo_1",
          invoiceNumber: "SP/LB/26-27/0001",
          createdAt: new Date().toISOString(),
          plan: "annual",
          baseAmount: 1000,
          gstAmount: 180,
          cgst: 90,
          sgst: 90,
          igst: 0,
          totalAmount: 1180,
          billingName: "Chirag Patel (Demo)",
          billingAddress: "6, Naresh Smruti, Mulund West, Mumbai - 400080",
          state: "Maharashtra",
          billingEmail: "demo@solutionplanets.com",
          billingMobile: "9082151500",
          gstNo: "27ABOFS3036K1ZR",
          status: "completed"
        });
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/payment/invoice-details?orderId=${orderId}`);
        if (!res.ok) {
          throw new Error("Failed to load invoice details");
        }
        const data = await res.json();
        setPayment(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [orderId]);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", backgroundColor: "#f9fafb" }}>
        <div style={{ width: "30px", height: "30px", border: "3px solid #e5e7eb", borderTopColor: "#b28e46", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
        <style jsx>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  if (error || !payment) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#ef4444" }}>
        <h3>Error loading invoice</h3>
        <p>{error || "Invoice not found"}</p>
        <button onClick={() => router.back()} style={{ marginTop: "16px", padding: "8px 16px", backgroundColor: "#b28e46", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}>
          Go Back
        </button>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    const runHtml2Pdf = () => {
      const element = document.querySelector(".invoice-card");
      if (!element) return;
      
      const clone = element.cloneNode(true) as HTMLElement;
      clone.style.boxShadow = "none";
      clone.style.padding = "20px";
      clone.style.maxWidth = "100%";

      // @ts-ignore
      window.html2pdf()
        .set({
          margin: 15,
          filename: `Invoice_${payment.invoiceNumber.replace(/\//g, "-")}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, logging: false, useCORS: true },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
        })
        .from(clone)
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

  const formattedDate = new Date(payment.createdAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });

  const startDateStr = new Date(payment.createdAt).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });

  const expiryDate = new Date(payment.createdAt);
  expiryDate.setFullYear(expiryDate.getFullYear() + 1);
  expiryDate.setDate(expiryDate.getDate() - 1);
  const expiryDateStr = expiryDate.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });

  return (
    <div style={{ backgroundColor: "#f3f4f6", minHeight: "100vh", padding: "40px 20px" }} className="invoice-container">
      {/* Action Bar */}
      <div className="no-print" style={{ maxWidth: "800px", margin: "0 auto 20px auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button 
          onClick={() => router.back()} 
          style={{ display: "flex", alignItems: "center", gap: "8px", background: "none", border: "none", color: "#6b5a45", cursor: "pointer", fontWeight: "600", fontSize: "14px" }}
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
        <div style={{ display: "flex", gap: "10px" }}>
          <button 
            onClick={handlePrint}
            style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px", backgroundColor: "#ffffff", color: "#b28e46", border: "1px solid #b28e46", borderRadius: "8px", cursor: "pointer", fontWeight: "700", fontSize: "14px" }}
          >
            <Printer size={16} /> Print Invoice
          </button>
          <button 
            onClick={handleDownloadPDF}
            style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px", backgroundColor: "#b28e46", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "700", fontSize: "14px", boxShadow: "0 4px 12px rgba(178, 142, 70, 0.2)" }}
          >
            <Download size={16} /> Download PDF
          </button>
        </div>
      </div>

      {/* Invoice Card */}
      <div 
        style={{
          backgroundColor: "#ffffff",
          maxWidth: "800px",
          margin: "0 auto",
          padding: "40px",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
          color: "#000000",
          fontFamily: "system-ui, -apple-system, sans-serif",
          lineHeight: "1.4"
        }}
        className="invoice-card"
      >
        {/* Title */}
        <h1 style={{ fontSize: "22px", fontWeight: "800", color: "#000000", textAlign: "center", margin: "0 0 20px 0", textTransform: "uppercase", letterSpacing: "0.05em" }}>Tax Invoice</h1>

        {/* Company Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
          <div>
            <div style={{ fontSize: "14px", fontWeight: "700", color: "#000000", marginBottom: "4px" }}>Solution Planets</div>
            <div style={{ fontSize: "12px", color: "#000000" }}>
              6, Naresh Smruti, Mulund West<br />
              Mumbai - 400080, Maharashtra, India.<br />
              <strong>GSTIN:</strong> 27ABOFS3036K1ZR<br />
              <strong>Email:</strong> info@solutionplanets.com<br />
              <strong>Mobile:</strong> +91-9082151500
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <img src="/assets/legacybridge-logo.png" alt="LegacyBridge" style={{ height: "50px", marginBottom: "10px", filter: "grayscale(100%)" }} />
            <div style={{ fontSize: "12px", color: "#000000" }}>
              <strong>Invoice #:</strong> {payment.invoiceNumber}<br />
              <strong>Date:</strong> {formattedDate}
            </div>
          </div>
        </div>

        {/* Divider line */}
        <hr style={{ border: "0", borderTop: "1px solid #000000", margin: "0 0 20px 0" }} />

        {/* Bill To */}
        <div style={{ marginBottom: "30px" }}>
          <div style={{ fontSize: "13px", fontWeight: "700", color: "#000000", textTransform: "uppercase", marginBottom: "6px" }}>Bill To:</div>
          <div style={{ fontSize: "13px", color: "#000000" }}>
            <strong style={{ fontSize: "14px", textTransform: "uppercase" }}>{payment.billingName}</strong><br />
            Address: {payment.billingAddress}<br />
            State/Place of Supply: {payment.state}<br />
            Email: {payment.billingEmail || payment.userId}<br />
            Mobile: {payment.billingMobile || "-"}<br />
            {payment.gstNo && (
              <>
                <strong>GSTIN:</strong> {payment.gstNo}<br />
              </>
            )}
          </div>
        </div>

        {/* Invoice Item Table */}
        <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #000000", marginBottom: "0px", textAlign: "left", fontSize: "12.5px" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #000000", backgroundColor: "#f9f9f9" }}>
              <th style={{ padding: "8px", borderRight: "1px solid #000000", width: "40px" }}>Sr</th>
              <th style={{ padding: "8px", borderRight: "1px solid #000000" }}>Description</th>
              <th style={{ padding: "8px", borderRight: "1px solid #000000", width: "80px" }}>HSN</th>
              <th style={{ padding: "8px", borderRight: "1px solid #000000", width: "90px", textAlign: "right" }}>Price</th>
              <th style={{ padding: "8px", borderRight: "1px solid #000000", width: "50px", textAlign: "right" }}>Qty</th>
              <th style={{ padding: "8px", textAlign: "right", width: "110px" }}>Total</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: "1px solid #000000", minHeight: "60px" }}>
              <td style={{ padding: "8px", borderRight: "1px solid #000000", verticalAlign: "top" }}>1</td>
              <td style={{ padding: "8px", borderRight: "1px solid #000000", verticalAlign: "top" }}>
                <strong>LegacyBridge Premium Plan - {payment.plan === "annual" ? "Annual Access" : "Lifetime Access"}</strong><br />
                {payment.plan === "annual" ? (
                  <span style={{ fontSize: "11px", color: "#555" }}>({startDateStr} - {expiryDateStr})</span>
                ) : (
                  <span style={{ fontSize: "11px", color: "#555" }}>(One-Time / Unlimited Duration)</span>
                )}
              </td>
              <td style={{ padding: "8px", borderRight: "1px solid #000000", verticalAlign: "top" }}>997331</td>
              <td style={{ padding: "8px", borderRight: "1px solid #000000", verticalAlign: "top", textAlign: "right" }}>
                {payment.baseAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
              <td style={{ padding: "8px", borderRight: "1px solid #000000", verticalAlign: "top", textAlign: "right" }}>1</td>
              <td style={{ padding: "8px", verticalAlign: "top", textAlign: "right" }}>
                {payment.baseAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
            </tr>

            {/* Calculations */}
            <tr style={{ borderBottom: "1px solid #000000" }}>
              <td colSpan={5} style={{ padding: "8px", textAlign: "right", borderRight: "1px solid #000000" }}>Subtotal ( INR )</td>
              <td style={{ padding: "8px", textAlign: "right" }}>
                {payment.baseAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
            </tr>

            {payment.cgst > 0 && (
              <>
                <tr style={{ borderBottom: "1px solid #000000" }}>
                  <td colSpan={5} style={{ padding: "8px", textAlign: "right", borderRight: "1px solid #000000" }}>CGST (9%)</td>
                  <td style={{ padding: "8px", textAlign: "right" }}>
                    {payment.cgst.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
                <tr style={{ borderBottom: "1px solid #000000" }}>
                  <td colSpan={5} style={{ padding: "8px", textAlign: "right", borderRight: "1px solid #000000" }}>SGST (9%)</td>
                  <td style={{ padding: "8px", textAlign: "right" }}>
                    {payment.sgst.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              </>
            )}

            {payment.igst > 0 && (
              <tr style={{ borderBottom: "1px solid #000000" }}>
                <td colSpan={5} style={{ padding: "8px", textAlign: "right", borderRight: "1px solid #000000" }}>IGST (18%)</td>
                <td style={{ padding: "8px", textAlign: "right" }}>
                  {payment.igst.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
              </tr>
            )}

            {/* Final Total and Rupees in Words */}
            <tr>
              <td colSpan={5} style={{ padding: "10px 8px", borderRight: "1px solid #000000", verticalAlign: "middle" }}>
                <div style={{ fontSize: "11px", textTransform: "uppercase", color: "#555", marginBottom: "4px" }}>Amount Chargeable (in words):</div>
                <strong style={{ fontSize: "12px" }}>{numberToWordsINR(payment.totalAmount)}</strong>
              </td>
              <td style={{ padding: "10px 8px", textAlign: "right", fontSize: "14px", fontWeight: "800", verticalAlign: "middle" }}>
                INR {payment.totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Footer Notes */}
        <div style={{ marginTop: "30px", textAlign: "center", fontSize: "10.5px" }}>
          <div style={{ color: "#555" }}>This is a system generated invoice.</div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body {
            background-color: #ffffff !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .no-print {
            display: none !important;
          }
          .invoice-container {
            background-color: #ffffff !important;
            padding: 0 !important;
            min-height: auto !important;
          }
          .invoice-card {
            box-shadow: none !important;
            padding: 0 !important;
            border: none !important;
            max-width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
}
