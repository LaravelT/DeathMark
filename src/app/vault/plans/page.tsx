"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { useVault } from "../components/VaultContext";

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh",
  "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir",
  "Ladakh", "Lakshadweep", "Puducherry"
];

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function PlansPage() {
  const router = useRouter();
  const { activatePlan, plan, isDemo, ownerDetails, session, hasUsedTrial } = useVault();

  // Checkout modal state
  const [selectedPlan, setSelectedPlan] = useState<"annual" | "lifetime" | null>(null);
  const [billingName, setBillingName] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [billingState, setBillingState] = useState("Maharashtra"); // default
  const [billingEmail, setBillingEmail] = useState("");
  const [billingMobile, setBillingMobile] = useState("");
  const [gstNo, setGstNo] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (ownerDetails?.name) {
      setBillingName(ownerDetails.name);
    }
    if (ownerDetails?.address) {
      setBillingAddress(ownerDetails.address);
    }
    if (ownerDetails?.phoneNo) {
      setBillingMobile(ownerDetails.phoneNo);
    }
    if (session?.user?.email) {
      setBillingEmail(session.user.email);
    }
  }, [ownerDetails, session]);

  const handleActivate = async (planType: string) => {
    if (planType === "free_trial") {
      const success = await activatePlan(planType);
      if (success) {
        sessionStorage.setItem("just_activated_trial", "true");
        router.push(isDemo ? "/vault?demo=true" : "/vault");
      }
    } else {
      setSelectedPlan(planType as "annual" | "lifetime");
    }
  };

  const getPricingDetails = () => {
    const base = selectedPlan === "annual" ? 1000 : 5000;
    const gst = Math.round(base * 0.18);
    const total = base + gst;
    const isMH = billingState.toLowerCase() === "maharashtra";
    const cgst = isMH ? Math.round(base * 0.09) : 0;
    const sgst = isMH ? Math.round(base * 0.09) : 0;
    const igst = !isMH ? gst : 0;

    return { base, gst, total, cgst, sgst, igst };
  };

  const handlePayment = async () => {
    if (!billingName.trim()) {
      alert("Please enter billing name");
      return;
    }
    if (!billingAddress.trim()) {
      alert("Please enter billing address");
      return;
    }
    if (!billingEmail.trim()) {
      alert("Please enter billing email");
      return;
    }
    if (!billingMobile.trim()) {
      alert("Please enter billing mobile number");
      return;
    }

    setIsProcessing(true);

    try {
      if (isDemo) {
        // Simulate successful payment in demo mode
        const success = await activatePlan(selectedPlan!);
        if (success) {
          setSelectedPlan(null);
          router.push("/vault?demo=true");
        }
        setIsProcessing(false);
        return;
      }

      // Load Razorpay Script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        alert("Failed to load Razorpay SDK. Check your internet connection.");
        setIsProcessing(false);
        return;
      }

      // Create Order on backend
      const orderRes = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: selectedPlan,
          state: billingState,
          billingName,
          billingAddress,
          billingEmail,
          billingMobile,
          gstNo
        }),
      });

      if (!orderRes.ok) {
        const err = await orderRes.json();
        throw new Error(err.error || "Failed to create order");
      }

      const orderData = await orderRes.json();

      // Fetch Razorpay Config key
      const configRes = await fetch("/api/payment/config");
      const configData = await configRes.json();

      const options = {
        key: configData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "LegacyBridge",
        description: `LegacyBridge - ${selectedPlan === "annual" ? "Annual" : "Lifetime"} Premium Vault Access`,
        order_id: orderData.orderId,
        handler: async function (response: any) {
          setIsProcessing(true);
          try {
            const verifyRes = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                plan: selectedPlan,
                state: billingState,
                billingName,
                billingAddress
              })
            });

            if (verifyRes.ok) {
              // Refresh state and redirect
              await activatePlan(selectedPlan!);
              setSelectedPlan(null);
              router.push("/vault");
            } else {
              const err = await verifyRes.json();
              alert("Payment verification failed: " + (err.error || "Unknown error"));
            }
          } catch (e: any) {
            alert("Verification error: " + e.message);
          } finally {
            setIsProcessing(false);
          }
        },
        prefill: {
          name: billingName,
          email: billingEmail,
          contact: billingMobile
        },
        theme: {
          color: "#b28e46"
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();

    } catch (error: any) {
      console.error(error);
      alert("Error starting payment: " + error.message);
      setIsProcessing(false);
    }
  };

  const { base, gst, total, cgst, sgst, igst } = selectedPlan ? getPricingDetails() : { base: 0, gst: 0, total: 0, cgst: 0, sgst: 0, igst: 0 };

  return (
    <div style={{ padding: "40px 20px", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: "48px" }}>
        <h1 
          style={{ 
            fontFamily: "'Playfair Display', Georgia, serif", 
            fontSize: "36px", 
            fontWeight: "750", 
            color: "#1a150e",
            marginBottom: "12px"
          }}
        >
          Choose Your Inheritance Vault Plan
        </h1>
        <p style={{ color: "var(--muted)", fontSize: "16px", maxWidth: "600px", margin: "0 auto" }}>
          Secure your wealth details and legal wishes. Start with our 48-hour free trial or upgrade to lifetime premium access.
        </p>
      </div>

      <div 
        style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", 
          gap: "32px",
          alignItems: "stretch"
        }}
      >
        {/* Plan 1: 48-Hour Setup */}
        <div 
          style={{ 
            background: "#ffffff", 
            border: "1px solid rgba(217, 184, 133, 0.25)", 
            borderRadius: "24px", 
            padding: "32px",
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 10px 30px rgba(139, 92, 26, 0.02)",
            position: "relative",
            transition: "transform 0.2s ease"
          }}
        >
          <div style={{ display: "inline-flex", padding: "6px 12px", borderRadius: "20px", backgroundColor: "#fbf5e6", color: "#b28e46", fontSize: "12px", fontWeight: "700", textTransform: "uppercase", width: "fit-content", marginBottom: "20px", letterSpacing: "0.05em" }}>
            Setup Access
          </div>
          <h3 style={{ fontSize: "22px", fontWeight: "750", color: "#1a150e", margin: "0 0 10px 0" }}>48-Hour Setup</h3>
          <div style={{ display: "flex", alignItems: "baseline", marginBottom: "24px" }}>
            <span style={{ fontSize: "36px", fontWeight: "800", color: "#1a150e" }}>₹0</span>
            <span style={{ color: "var(--muted)", marginLeft: "8px", fontSize: "14px" }}>/ first 48 hours</span>
          </div>

          <ul style={{ listStyle: "none", padding: 0, margin: "0 0 32px 0", display: "flex", flexDirection: "column", gap: "12px" }}>
            {[
              "Google login",
              "Create vault",
              "Add nominee",
              "Fill wealth-information forms",
              "Preview your vault"
            ].map((feature, i) => (
              <li key={i} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", color: "#6b5a45" }}>
                <Check size={16} style={{ color: "#b28e46" }} />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <button 
            onClick={() => handleActivate("free_trial")}
            disabled={plan === "free_trial" || plan === "annual" || plan === "lifetime" || hasUsedTrial}
            style={{ 
              marginTop: "auto", 
              width: "100%", 
              padding: "14px", 
              borderRadius: "12px", 
              border: "1px solid var(--card-border)", 
              backgroundColor: plan === "free_trial" || hasUsedTrial ? "rgba(0,0,0,0.05)" : "#ffffff", 
              color: "#1a150e", 
              fontWeight: "700",
              cursor: plan === "free_trial" || plan === "annual" || plan === "lifetime" || hasUsedTrial ? "not-allowed" : "pointer",
              transition: "all 0.2s ease"
            }}
          >
            {plan === "free_trial" ? "Current Plan" : hasUsedTrial ? "Trial Already Used" : "Start Setup"}
          </button>
        </div>

        {/* Plan 2: Annual Access */}
        <div 
          style={{ 
            background: "#0d1321", 
            border: "1px solid rgba(217, 184, 133, 0.4)", 
            borderRadius: "24px", 
            padding: "32px",
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
            position: "relative",
            transition: "transform 0.2s ease",
            transform: "scale(1.02)"
          }}
        >
          <div style={{ display: "inline-flex", padding: "6px 12px", borderRadius: "20px", backgroundColor: "#b28e46", color: "#ffffff", fontSize: "12px", fontWeight: "700", textTransform: "uppercase", width: "fit-content", marginBottom: "20px", letterSpacing: "0.05em" }}>
            Recommended
          </div>
          <h3 style={{ fontSize: "22px", fontWeight: "750", color: "#ffffff", margin: "0 0 10px 0" }}>Annual Access</h3>
          <div style={{ display: "flex", alignItems: "baseline", marginBottom: "24px" }}>
            <span style={{ fontSize: "36px", fontWeight: "800", color: "#ffffff" }}>₹1,000</span>
            <span style={{ color: "#a5b4fc", marginLeft: "8px", fontSize: "14px" }}>+ 18% GST / year</span>
          </div>

          <ul style={{ listStyle: "none", padding: 0, margin: "0 0 32px 0", display: "flex", flexDirection: "column", gap: "12px" }}>
            {[
              "Full vault access",
              "Unlimited entries",
              "Encrypted Google Drive storage",
              "Nominee claim activation",
              "Review reminders"
            ].map((feature, i) => (
              <li key={i} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", color: "#c7d2fe" }}>
                <Check size={16} style={{ color: "#b28e46" }} />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <button 
            onClick={() => handleActivate("annual")}
            disabled={plan === "annual" || plan === "lifetime"}
            style={{ 
              marginTop: "auto", 
              width: "100%", 
              padding: "14px", 
              borderRadius: "12px", 
              border: "none", 
              backgroundColor: plan === "annual" ? "rgba(255,255,255,0.15)" : "#b28e46", 
              color: "#ffffff", 
              fontWeight: "700",
              cursor: plan === "annual" || plan === "lifetime" ? "not-allowed" : "pointer",
              transition: "all 0.2s ease"
            }}
          >
            {plan === "annual" ? "Current Plan" : "Activate Annual"}
          </button>
        </div>

        {/* Plan 3: Lifetime Access */}
        <div 
          style={{ 
            background: "#ffffff", 
            border: "1px solid rgba(217, 184, 133, 0.25)", 
            borderRadius: "24px", 
            padding: "32px",
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 10px 30px rgba(139, 92, 26, 0.02)",
            position: "relative",
            transition: "transform 0.2s ease"
          }}
        >
          <div style={{ display: "inline-flex", padding: "6px 12px", borderRadius: "20px", backgroundColor: "#fbf5e6", color: "#b28e46", fontSize: "12px", fontWeight: "700", textTransform: "uppercase", width: "fit-content", marginBottom: "20px", letterSpacing: "0.05em" }}>
            One-Time
          </div>
          <h3 style={{ fontSize: "22px", fontWeight: "750", color: "#1a150e", margin: "0 0 10px 0" }}>Lifetime Access</h3>
          <div style={{ display: "flex", alignItems: "baseline", marginBottom: "24px" }}>
            <span style={{ fontSize: "36px", fontWeight: "800", color: "#1a150e" }}>₹5,000</span>
            <span style={{ color: "var(--muted)", marginLeft: "8px", fontSize: "14px" }}>+ 18% GST / one-time</span>
          </div>

          <ul style={{ listStyle: "none", padding: 0, margin: "0 0 32px 0", display: "flex", flexDirection: "column", gap: "12px" }}>
            {[
              "Lifetime vault access",
              "No annual renewal worry",
              "Unlimited entries",
              "Nominee claim activation",
              "Future standard updates"
            ].map((feature, i) => (
              <li key={i} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", color: "#6b5a45" }}>
                <Check size={16} style={{ color: "#b28e46" }} />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <button 
            onClick={() => handleActivate("lifetime")}
            disabled={plan === "lifetime"}
            style={{ 
              marginTop: "auto", 
              width: "100%", 
              padding: "14px", 
              borderRadius: "12px", 
              border: "1px solid var(--card-border)", 
              backgroundColor: plan === "lifetime" ? "rgba(0,0,0,0.05)" : "#ffffff", 
              color: "#1a150e", 
              fontWeight: "700",
              cursor: plan === "lifetime" ? "not-allowed" : "pointer",
              transition: "all 0.2s ease"
            }}
          >
            {plan === "lifetime" ? "Current Plan" : "Choose Lifetime"}
          </button>
        </div>
      </div>

      {/* Checkout Modal */}
      {selectedPlan && (
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
              borderRadius: "24px",
              padding: "32px",
              maxWidth: "520px",
              width: "100%",
              boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
              border: "1px solid rgba(217, 184, 133, 0.3)",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              maxHeight: "90vh",
              overflowY: "auto"
            }}
          >
            <div style={{ borderBottom: "1px solid #f0e9df", paddingBottom: "12px" }}>
              <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "22px", fontWeight: "750", color: "#1a150e", margin: 0 }}>
                Billing & Checkout
              </h2>
              <p style={{ color: "var(--muted)", fontSize: "13px", margin: "4px 0 0 0" }}>
                Please fill in billing details to calculate tax and generate the invoice.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                <label style={{ fontSize: "11px", fontWeight: "700", color: "#1a150e" }}>Billing Name *</label>
                <input 
                  type="text" 
                  value={billingName} 
                  onChange={(e) => setBillingName(e.target.value)} 
                  placeholder="Full name for invoice"
                  style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #dcd1c4", fontSize: "13px" }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                <label style={{ fontSize: "11px", fontWeight: "700", color: "#1a150e" }}>Billing Address *</label>
                <textarea 
                  value={billingAddress} 
                  onChange={(e) => setBillingAddress(e.target.value)} 
                  placeholder="Complete Address"
                  rows={2}
                  style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #dcd1c4", fontSize: "13px", resize: "none" }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                <label style={{ fontSize: "11px", fontWeight: "700", color: "#1a150e" }}>State (For GST calculation) *</label>
                <select 
                  value={billingState} 
                  onChange={(e) => setBillingState(e.target.value)}
                  style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #dcd1c4", fontSize: "13px", backgroundColor: "#fff" }}
                >
                  {INDIAN_STATES.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "3px", flex: "1 1 200px" }}>
                  <label style={{ fontSize: "11px", fontWeight: "700", color: "#1a150e" }}>Email *</label>
                  <input 
                    type="email" 
                    value={billingEmail} 
                    onChange={(e) => setBillingEmail(e.target.value)} 
                    placeholder="email@example.com"
                    style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #dcd1c4", fontSize: "13px" }}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "3px", flex: "1 1 200px" }}>
                  <label style={{ fontSize: "11px", fontWeight: "700", color: "#1a150e" }}>Mobile *</label>
                  <input 
                    type="text" 
                    value={billingMobile} 
                    onChange={(e) => setBillingMobile(e.target.value)} 
                    placeholder="10-digit number"
                    style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #dcd1c4", fontSize: "13px" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                <label style={{ fontSize: "11px", fontWeight: "700", color: "#1a150e" }}>GST Number (Optional)</label>
                <input 
                  type="text" 
                  value={gstNo} 
                  onChange={(e) => setGstNo(e.target.value.toUpperCase())} 
                  placeholder="15-digit GSTIN"
                  style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #dcd1c4", fontSize: "13px", textTransform: "uppercase" }}
                />
              </div>
            </div>

            {/* GST Summary */}
            <div style={{ backgroundColor: "#faf8f5", padding: "12px", borderRadius: "12px", border: "1px solid #f0e9df" }}>
              <h3 style={{ fontSize: "11px", fontWeight: "700", color: "#1a150e", margin: "0 0 8px 0", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Pricing Details
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "13px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", color: "#6b5a45" }}>
                  <span>Base Amount:</span>
                  <span>₹{base.toLocaleString("en-IN")}</span>
                </div>
                {cgst > 0 && (
                  <>
                    <div style={{ display: "flex", justifyContent: "space-between", color: "#6b5a45" }}>
                      <span>CGST (9%):</span>
                      <span>₹{cgst.toLocaleString("en-IN")}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", color: "#6b5a45" }}>
                      <span>SGST (9%):</span>
                      <span>₹{sgst.toLocaleString("en-IN")}</span>
                    </div>
                  </>
                )}
                {igst > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", color: "#6b5a45" }}>
                    <span>IGST (18%):</span>
                    <span>₹{igst.toLocaleString("en-IN")}</span>
                  </div>
                )}
                <div style={{ borderTop: "1px dashed #dcd1c4", margin: "4px 0", paddingTop: "4px", display: "flex", justifyContent: "space-between", fontWeight: "700", color: "#1a150e", fontSize: "15px" }}>
                  <span>Total Amount:</span>
                  <span>₹{total.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button 
                onClick={() => setSelectedPlan(null)}
                disabled={isProcessing}
                style={{ 
                  flex: 1, 
                  padding: "10px", 
                  borderRadius: "10px", 
                  border: "1px solid #dcd1c4", 
                  backgroundColor: "#fff", 
                  color: "#1a150e", 
                  fontWeight: "700", 
                  cursor: "pointer",
                  fontSize: "13px"
                }}
              >
                Cancel
              </button>
              <button 
                onClick={handlePayment}
                disabled={isProcessing}
                style={{ 
                  flex: 1, 
                  padding: "10px", 
                  borderRadius: "10px", 
                  border: "none", 
                  backgroundColor: "#b28e46", 
                  color: "#fff", 
                  fontWeight: "700", 
                  cursor: isProcessing ? "not-allowed" : "pointer",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "13px"
                }}
              >
                {isProcessing ? "Processing..." : "Proceed to Pay"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
