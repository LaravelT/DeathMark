"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Check, ShieldCheck, Zap, Sparkles, Award } from "lucide-react";
import { useVault } from "../components/VaultContext";

export default function PlansPage() {
  const router = useRouter();
  const { activatePlan, plan, isDemo } = useVault();

  const handleActivate = async (planType: string) => {
    const success = await activatePlan(planType);
    if (success) {
      if (planType === "free_trial") {
        // Set a session variable or redirect with query param to trigger the dashboard message
        sessionStorage.setItem("just_activated_trial", "true");
      }
      router.push(isDemo ? "/vault?demo=true" : "/vault");
    }
  };

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
            disabled={plan === "free_trial" || plan === "annual" || plan === "lifetime"}
            style={{ 
              marginTop: "auto", 
              width: "100%", 
              padding: "14px", 
              borderRadius: "12px", 
              border: "1px solid var(--card-border)", 
              backgroundColor: plan === "free_trial" ? "rgba(0,0,0,0.05)" : "#ffffff", 
              color: "#1a150e", 
              fontWeight: "700",
              cursor: plan === "free_trial" || plan === "annual" || plan === "lifetime" ? "not-allowed" : "pointer",
              transition: "all 0.2s ease"
            }}
          >
            {plan === "free_trial" ? "Current Plan" : "Start Setup"}
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
            <span style={{ fontSize: "36px", fontWeight: "800", color: "#ffffff" }}>₹999</span>
            <span style={{ color: "#a5b4fc", marginLeft: "8px", fontSize: "14px" }}>/ year</span>
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
            <span style={{ fontSize: "36px", fontWeight: "800", color: "#1a150e" }}>₹4,999</span>
            <span style={{ color: "var(--muted)", marginLeft: "8px", fontSize: "14px" }}>/ one-time</span>
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
    </div>
  );
}
