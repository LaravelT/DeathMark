"use client";

import React, { useState, useEffect } from "react";
import { useVault } from "../components/VaultContext";
import { UserCheck, Shield, Upload, FileText, X } from "lucide-react";

export default function NomineePage() {
  const { nomineeDetails, handleSaveNominee, handleDeleteNominee, loadingNominee } = useVault();
  const [isEditing, setIsEditing] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [aadhaar, setAadhaar] = useState("");
  const [aadhaarAddress, setAadhaarAddress] = useState("");
  const [aadhaarImage, setAadhaarImage] = useState<string | null>(null);
  const [pan, setPan] = useState("");
  const [panImage, setPanImage] = useState<string | null>(null);
  const [dob, setDob] = useState("");
  const [relation, setRelation] = useState("");
  const [hasPan, setHasPan] = useState<"yes" | "no">("yes");

  const handleDateChange = (val: string) => {
    const clean = val.replace(/\D/g, "");
    let formatted = clean;
    if (clean.length > 2) {
      formatted = clean.slice(0, 2) + "/" + clean.slice(2);
    }
    if (clean.length > 4) {
      formatted = clean.slice(0, 2) + "/" + clean.slice(2, 4) + "/" + clean.slice(4, 6);
    }
    setDob(formatted);
  };

  // Local helper states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageError, setImageError] = useState("");

  // Load nominee details into form when editing
  useEffect(() => {
    if (nomineeDetails) {
      setName(nomineeDetails.name || "");
      setPhone(nomineeDetails.phone || "");
      setEmail(nomineeDetails.email || "");
      setAadhaar(nomineeDetails.aadhaar || "");
      setAadhaarAddress(nomineeDetails.aadhaarAddress || "");
      setAadhaarImage(nomineeDetails.aadhaarImage || null);
      setPan(nomineeDetails.pan || "");
      setPanImage(nomineeDetails.panImage || null);
      setDob(nomineeDetails.dob || "");
      setRelation(nomineeDetails.relation || "");
      setHasPan(nomineeDetails.pan ? "yes" : "no");
    }
  }, [nomineeDetails, isEditing]);

  // Handle Aadhaar Image Upload
  const handleAadhaarImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageError("");
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      setImageError("Aadhaar image file size must be less than 1MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAadhaarImage(reader.result as string);
    };
    reader.onerror = () => {
      setImageError("Failed to read Aadhaar image file.");
    };
    reader.readAsDataURL(file);
  };

  // Handle PAN Image Upload
  const handlePanImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageError("");
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      setImageError("PAN image file size must be less than 1MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPanImage(reader.result as string);
    };
    reader.onerror = () => {
      setImageError("Failed to read PAN image file.");
    };
    reader.readAsDataURL(file);
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setImageError("");

    const phoneRegex = /^\d{10}$/;
    const aadhaarRegex = /^\d{12}$/;
    const panRegex = /^[A-Z]{5}\d{4}[A-Z]{1}$/;

    if (!phoneRegex.test(phone)) {
      setImageError("Phone number must be exactly 10 digits.");
      return;
    }
    if (!aadhaarRegex.test(aadhaar)) {
      setImageError("Aadhaar number must be exactly 12 digits.");
      return;
    }
    const dateRegex = /^(0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])\/\d{2}$/;
    if (!dateRegex.test(dob)) {
      setImageError("Date of Birth must be in DD/MM/YY format (e.g. 25/12/90).");
      return;
    }

    if (!relation) {
      setImageError("Please select relation.");
      return;
    }

    if (hasPan === "yes") {
      if (!pan.trim()) {
        setImageError("Please enter PAN card number.");
        return;
      }
      if (!panRegex.test(pan.toUpperCase())) {
        setImageError("PAN number must be in a valid format (e.g. ABCDE1234F).");
        return;
      }
      if (!panImage) {
        setImageError("Please upload nominee PAN card image.");
        return;
      }
    }

    if (!aadhaarImage) {
      setImageError("Please upload nominee Aadhaar card image.");
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        name,
        phone,
        email,
        aadhaar,
        aadhaarAddress,
        aadhaarImage,
        dob,
        relation,
        pan: hasPan === "yes" ? pan.toUpperCase() : "",
        panImage: hasPan === "yes" ? panImage : null,
      };

      await handleSaveNominee(payload);
      setIsEditing(false);
    } catch (err: any) {
      alert("Failed to save nominee details: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render View Details Mode
  if (nomineeDetails && !isEditing) {
    return (
      <div className="panel-card" style={{ maxWidth: "800px", margin: "0 auto" }}>
        <div 
          className="flex-between" 
          style={{ 
            borderBottom: "1px solid var(--card-border)", 
            paddingBottom: "16px", 
            marginBottom: "24px" 
          }}
        >
          <div>
            <h2 className="page-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <UserCheck style={{ color: "var(--success)" }} />
              <span>Primary Nominee Details</span>
            </h2>
            <span style={{ fontSize: "13px", color: "var(--success)", fontWeight: "600" }}>
              Enrolled & Encrypted
            </span>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={() => setIsEditing(true)} className="btn-blue">
              Edit Details
            </button>
            <button 
              type="button" 
              onClick={async () => {
                try {
                  await handleDeleteNominee();
                } catch (err: any) {
                  alert("Failed to delete nominee: " + err.message);
                }
              }} 
              className="btn-pink"
              disabled={loadingNominee}
            >
              Delete Nominee
            </button>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Main details grid */}
          <div className="form-grid form-grid-3">
            <div style={{ backgroundColor: "#1e293b", padding: "14px", borderRadius: "8px", border: "1px solid var(--card-border)" }}>
              <span style={{ fontSize: "11px", color: "var(--muted)", fontWeight: "600", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
                Nominee Name
              </span>
              <strong style={{ fontSize: "15px", color: "#fff" }}>{nomineeDetails.name}</strong>
            </div>

            <div style={{ backgroundColor: "#1e293b", padding: "14px", borderRadius: "8px", border: "1px solid var(--card-border)" }}>
              <span style={{ fontSize: "11px", color: "var(--muted)", fontWeight: "600", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
                Phone Number
              </span>
              <strong style={{ fontSize: "15px", color: "#fff" }}>{nomineeDetails.phone}</strong>
            </div>

            <div style={{ backgroundColor: "#1e293b", padding: "14px", borderRadius: "8px", border: "1px solid var(--card-border)" }}>
              <span style={{ fontSize: "11px", color: "var(--muted)", fontWeight: "600", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
                Email Address
              </span>
              <strong style={{ fontSize: "15px", color: "#fff" }}>{nomineeDetails.email}</strong>
            </div>

            <div style={{ backgroundColor: "#1e293b", padding: "14px", borderRadius: "8px", border: "1px solid var(--card-border)" }}>
              <span style={{ fontSize: "11px", color: "var(--muted)", fontWeight: "600", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
                Aadhaar Card No
              </span>
              <strong style={{ fontSize: "15px", color: "#fff" }}>{nomineeDetails.aadhaar}</strong>
            </div>

            <div style={{ backgroundColor: "#1e293b", padding: "14px", borderRadius: "8px", border: "1px solid var(--card-border)" }}>
              <span style={{ fontSize: "11px", color: "var(--muted)", fontWeight: "600", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
                PAN Card No
              </span>
              <strong style={{ fontSize: "15px", color: "#fff" }}>{nomineeDetails.pan || "Not Provided"}</strong>
            </div>

            <div style={{ backgroundColor: "#1e293b", padding: "14px", borderRadius: "8px", border: "1px solid var(--card-border)" }}>
              <span style={{ fontSize: "11px", color: "var(--muted)", fontWeight: "600", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
                Date of Birth
              </span>
              <strong style={{ fontSize: "15px", color: "#fff" }}>{nomineeDetails.dob || "Not Provided"}</strong>
            </div>

            <div style={{ backgroundColor: "#1e293b", padding: "14px", borderRadius: "8px", border: "1px solid var(--card-border)" }}>
              <span style={{ fontSize: "11px", color: "var(--muted)", fontWeight: "600", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
                Relation
              </span>
              <strong style={{ fontSize: "15px", color: "#fff" }}>{nomineeDetails.relation || "Not Provided"}</strong>
            </div>
          </div>

          <div style={{ backgroundColor: "#1e293b", padding: "14px", borderRadius: "8px", border: "1px solid var(--card-border)" }}>
            <span style={{ fontSize: "11px", color: "var(--muted)", fontWeight: "600", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
              Aadhaar Registered Address
            </span>
            <strong style={{ fontSize: "15px", color: "#fff" }}>{nomineeDetails.aadhaarAddress}</strong>
          </div>

          {/* Document Previews Section */}
          <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", marginTop: "12px" }}>
            {/* Aadhaar Card Image Preview in View mode */}
            {nomineeDetails.aadhaarImage && (
              <div>
                <span style={{ fontSize: "11px", color: "var(--muted)", fontWeight: "600", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>
                  Encrypted Aadhaar Card Document
                </span>
                <div 
                  style={{ 
                    width: "360px", 
                    borderRadius: "8px", 
                    overflow: "hidden", 
                    border: "1px solid var(--card-border)",
                    backgroundColor: "rgba(0,0,0,0.2)"
                  }}
                >
                  <img 
                    src={nomineeDetails.aadhaarImage} 
                    alt="Encrypted Aadhaar Card" 
                    style={{ width: "100%", height: "auto", display: "block" }} 
                  />
                </div>
              </div>
            )}

            {/* PAN Card Image Preview in View mode */}
            {nomineeDetails.pan && nomineeDetails.panImage && (
              <div>
                <span style={{ fontSize: "11px", color: "var(--muted)", fontWeight: "600", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>
                  Encrypted PAN Card Document
                </span>
                <div 
                  style={{ 
                    width: "360px", 
                    borderRadius: "8px", 
                    overflow: "hidden", 
                    border: "1px solid var(--card-border)",
                    backgroundColor: "rgba(0,0,0,0.2)"
                  }}
                >
                  <img 
                    src={nomineeDetails.panImage} 
                    alt="Encrypted PAN Card" 
                    style={{ width: "100%", height: "auto", display: "block" }} 
                  />
                </div>
              </div>
            )}
          </div>

          <div 
            style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "10px", 
              backgroundColor: "rgba(16, 185, 129, 0.05)", 
              border: "1px solid rgba(16, 185, 129, 0.2)", 
              padding: "12px 16px", 
              borderRadius: "8px",
              marginTop: "16px"
            }}
          >
            <Shield style={{ color: "#10b981", flexShrink: 0 }} size={20} />
            <span style={{ fontSize: "13px", color: "#a7f3d0" }}>
              This nominee configuration is stored fully encrypted inside your private Google Drive space. It remains invisible to Google or external services.
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Render Edit/Add Nominee Form
  return (
    <div className="panel-card" style={{ maxWidth: "800px", margin: "0 auto" }}>
      <div 
        className="flex-between" 
        style={{ 
          borderBottom: "1px solid var(--card-border)", 
          paddingBottom: "16px", 
          marginBottom: "24px" 
        }}
      >
        <div>
          <h2 className="page-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <UserCheck style={{ color: "var(--primary)" }} />
            <span>{nomineeDetails ? "Edit Primary Nominee" : "Add Nominee for Your All Details"}</span>
          </h2>
          <span style={{ fontSize: "13px", color: "var(--muted)" }}>
            Establish a single trusted recipient to access your vault records.
          </span>
        </div>

        {nomineeDetails && (
          <button 
            type="button" 
            onClick={() => setIsEditing(false)} 
            className="btn-pink"
            style={{ padding: "8px 16px" }}
          >
            Cancel
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div className="form-grid form-grid-3">
          <div>
            <label className="form-label">Nominee Name <span style={{ color: "var(--danger)" }}>*</span></label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              className="form-input" 
              placeholder="Full legal name" 
              required 
            />
          </div>

          <div>
            <label className="form-label">Nominee Phone Number <span style={{ color: "var(--danger)" }}>*</span></label>
            <input 
              type="text" 
              value={phone} 
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} 
              className="form-input" 
              placeholder="10-digit Nominee Mobile No" 
              required 
              pattern="\d{10}"
              maxLength={10}
              title="Nominee phone number must be exactly 10 digits"
            />
          </div>

          <div>
            <label className="form-label">Nominee Email Address <span style={{ color: "var(--danger)" }}>*</span></label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="form-input" 
              placeholder="nominee@example.com" 
              required 
            />
          </div>

          <div>
            <label className="form-label">Nominee Aadhaar Card No <span style={{ color: "var(--danger)" }}>*</span></label>
            <input 
              type="text" 
              value={aadhaar} 
              onChange={(e) => setAadhaar(e.target.value.replace(/\D/g, ''))} 
              className="form-input" 
              placeholder="12-digit Nominee Aadhaar No" 
              required 
              pattern="\d{12}"
              maxLength={12}
              title="Nominee Aadhaar card number must be exactly 12 digits"
            />
          </div>

          <div>
            <label className="form-label">Do you have a Nominee PAN Card? <span style={{ color: "var(--danger)" }}>*</span></label>
            <select 
              value={hasPan} 
              onChange={(e) => {
                const choice = e.target.value as "yes" | "no";
                setHasPan(choice);
                if (choice === "no") {
                  setPan("");
                  setPanImage(null);
                }
              }} 
              className="form-select"
              required
            >
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>

          {hasPan === "yes" && (
            <div>
              <label className="form-label">Nominee PAN Card No <span style={{ color: "var(--danger)" }}>*</span></label>
              <input 
                type="text" 
                value={pan} 
                onChange={(e) => setPan(e.target.value.toUpperCase())} 
                className="form-input" 
                placeholder="10-digit Nominee PAN No" 
                pattern="[A-Za-z]{5}\d{4}[A-Za-z]{1}"
                maxLength={10}
                required
                title="Nominee PAN card must be in a valid format (e.g. ABCDE1234F)"
                style={{ textTransform: "uppercase" }}
              />
            </div>
          )}

          <div>
            <label className="form-label">Nominee Date of Birth <span style={{ color: "var(--danger)" }}>*</span></label>
            <input 
              type="text" 
              value={dob} 
              onChange={(e) => handleDateChange(e.target.value)} 
              className="form-input" 
              placeholder="DD/MM/YY" 
              required 
              pattern="^(0[1-9]|[12]\d|3[01])/(0[1-9]|1[0-2])/\d{2}$"
              maxLength={8}
              title="Date of Birth must be in DD/MM/YY format (e.g. 25/12/90)"
            />
          </div>

          <div>
            <label className="form-label">Nominee Relation <span style={{ color: "var(--danger)" }}>*</span></label>
            <select 
              value={relation} 
              onChange={(e) => setRelation(e.target.value)} 
              className="form-select"
              required
            >
              <option value="">--Select Nominee Relation--</option>
              <option value="Spouse">Spouse</option>
              <option value="Son">Son</option>
              <option value="Daughter">Daughter</option>
              <option value="Father">Father</option>
              <option value="Mother">Mother</option>
              <option value="Brother">Brother</option>
              <option value="Sister">Sister</option>
              <option value="Grandson">Grandson</option>
              <option value="Granddaughter">Granddaughter</option>
              <option value="Executor">Executor</option>
              <option value="Lawyer">Lawyer</option>
              <option value="Friend">Friend</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div>
          <label className="form-label">Nominee Aadhaar Registered Address <span style={{ color: "var(--danger)" }}>*</span></label>
          <textarea 
            value={aadhaarAddress} 
            onChange={(e) => setAadhaarAddress(e.target.value)} 
            className="form-textarea" 
            placeholder="Nominee Aadhaar card address details..." 
            rows={3} 
            required 
          />
        </div>

        {/* Aadhaar Card Image Upload */}
        <div 
          style={{ 
            border: "1px dashed var(--card-border)", 
            borderRadius: "8px", 
            padding: "20px", 
            backgroundColor: "rgba(0,0,0,0.15)",
            marginTop: "8px"
          }}
        >
          <label className="form-label" style={{ marginBottom: "10px", display: "block" }}>
            Upload Nominee Aadhaar Card Image <span style={{ color: "var(--danger)" }}>*</span> <span style={{ color: "var(--muted)", fontWeight: "normal" }}>(Max 1MB)</span>
          </label>

          <div style={{ display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ position: "relative" }}>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleAadhaarImageChange} 
                id="aadhaar-image-upload" 
                style={{ display: "none" }} 
              />
              <label 
                htmlFor="aadhaar-image-upload" 
                className="btn-outline" 
                style={{ 
                  cursor: "pointer", 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "8px",
                  padding: "10px 16px" 
                }}
              >
                <Upload size={16} />
                <span>Choose Nominee Aadhaar Image</span>
              </label>
            </div>

            {aadhaarImage && (
              <button 
                type="button" 
                onClick={() => setAadhaarImage(null)} 
                className="btn-pink"
                style={{ padding: "8px 12px", display: "flex", alignItems: "center", gap: "4px" }}
              >
                <X size={14} />
                <span>Remove Image</span>
              </button>
            )}
          </div>

          {/* Aadhaar Image Preview Frame */}
          {aadhaarImage && (
            <div 
              style={{ 
                marginTop: "16px", 
                border: "1px solid var(--card-border)", 
                borderRadius: "8px", 
                overflow: "hidden", 
                maxWidth: "320px",
                position: "relative",
                backgroundColor: "rgba(0,0,0,0.2)"
              }}
            >
              <div style={{ backgroundColor: "rgba(0,0,0,0.5)", padding: "4px 8px", display: "flex", alignItems: "center", gap: "6px" }}>
                <FileText size={14} style={{ color: "var(--primary)" }} />
                <span style={{ fontSize: "11px", color: "#fff", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                  nominee_aadhaar_card_attachment.jpg
                </span>
              </div>
              <img 
                src={aadhaarImage} 
                alt="Nominee Aadhaar Preview" 
                style={{ width: "100%", height: "auto", display: "block" }} 
              />
            </div>
          )}
        </div>

        {/* Conditional PAN Card Image Upload */}
        {hasPan === "yes" && (
          <div 
            style={{ 
              border: "1px dashed var(--card-border)", 
              borderRadius: "8px", 
              padding: "20px", 
              backgroundColor: "rgba(0,0,0,0.15)",
              marginTop: "8px"
            }}
          >
            <label className="form-label" style={{ marginBottom: "10px", display: "block" }}>
              Upload Nominee PAN Card Image <span style={{ color: "var(--danger)" }}>*</span> <span style={{ color: "var(--muted)", fontWeight: "normal" }}>(Max 1MB)</span>
            </label>

            <div style={{ display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ position: "relative" }}>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handlePanImageChange} 
                  id="pan-image-upload" 
                  style={{ display: "none" }} 
                />
                <label 
                  htmlFor="pan-image-upload" 
                  className="btn-outline" 
                  style={{ 
                    cursor: "pointer", 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "8px",
                    padding: "10px 16px" 
                  }}
                >
                  <Upload size={16} />
                  <span>Choose Nominee PAN Image</span>
                </label>
              </div>

              {panImage && (
                <button 
                  type="button" 
                  onClick={() => setPanImage(null)} 
                  className="btn-pink"
                  style={{ padding: "8px 12px", display: "flex", alignItems: "center", gap: "4px" }}
                >
                  <X size={14} />
                  <span>Remove Image</span>
                </button>
              )}
            </div>

            {/* Image Preview Frame */}
            {panImage && (
              <div 
                style={{ 
                  marginTop: "16px", 
                  border: "1px solid var(--card-border)", 
                  borderRadius: "8px", 
                  overflow: "hidden", 
                  maxWidth: "320px",
                  position: "relative",
                  backgroundColor: "rgba(0,0,0,0.2)"
                }}
              >
                <div style={{ backgroundColor: "rgba(0,0,0,0.5)", padding: "4px 8px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <FileText size={14} style={{ color: "var(--primary)" }} />
                  <span style={{ fontSize: "11px", color: "#fff", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                    nominee_pan_card_attachment.jpg
                  </span>
                </div>
                <img 
                  src={panImage} 
                  alt="Nominee PAN Preview" 
                  style={{ width: "100%", height: "auto", display: "block" }} 
                />
              </div>
            )}
          </div>
        )}

        {imageError && (
          <span style={{ color: "var(--danger)", fontSize: "13px", display: "block", marginTop: "8px" }}>
            {imageError}
          </span>
        )}

        <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
          <button 
            type="submit" 
            className="btn-blue" 
            style={{ minWidth: "120px" }}
            disabled={isSubmitting || loadingNominee}
          >
            {isSubmitting ? "Encrypting..." : "Save Nominee"}
          </button>
          
          {nomineeDetails && (
            <button 
              type="button" 
              onClick={() => setIsEditing(false)} 
              className="btn-outline" 
              style={{ minWidth: "120px" }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
