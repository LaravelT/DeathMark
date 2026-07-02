"use client";

import React from "react";

interface TailoredFormProps {
  categoryId: string;
  formData: Record<string, string>;
  updateFormField: (key: string, value: string) => void;
}

export default function TailoredForm({ categoryId, formData, updateFormField }: TailoredFormProps) {
  const handleDateChange = (key: string, val: string) => {
    const clean = val.replace(/\D/g, "");
    let formatted = clean;
    if (clean.length > 2) {
      formatted = clean.slice(0, 2) + "/" + clean.slice(2);
    }
    if (clean.length > 4) {
      formatted = clean.slice(0, 2) + "/" + clean.slice(2, 4) + "/" + clean.slice(4, 6);
    }
    updateFormField(key, formatted);
  };

  switch (categoryId) {
    case "emergency_contact":
      return (
        <div className="form-grid form-grid-3">
          <div>
            <label className="form-label">Select Person Type <span style={{ color: "var(--danger)" }}>*</span></label>
            <select 
              value={formData.personType || ""} 
              onChange={(e) => updateFormField("personType", e.target.value)} 
              className="form-select"
              required
            >
              <option value="">--Select--</option>
              <option value="Self">Self</option>
              <option value="Spouse">Spouse</option>
              <option value="Child">Child</option>
              <option value="Father">Father</option>
              <option value="Mother">Mother</option>
              <option value="Guardian">Guardian</option>
              <option value="Executor">Executor</option>
              <option value="Lawyer">Lawyer</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="form-label">Person Name <span style={{ color: "var(--danger)" }}>*</span></label>
            <input 
              type="text" 
              value={formData.personName || ""} 
              onChange={(e) => updateFormField("personName", e.target.value)} 
              className="form-input" 
              placeholder="Enter Person name" 
              required 
            />
          </div>
          <div>
            <label className="form-label">Person Contact No <span style={{ color: "var(--danger)" }}>*</span></label>
            <input 
              type="text" 
              value={formData.contactNo || ""} 
              onChange={(e) => updateFormField("contactNo", e.target.value.replace(/\D/g, ''))} 
              className="form-input" 
              placeholder="10-digit Contact No" 
              required 
              pattern="\d{10}"
              maxLength={10}
              title="Contact number must be exactly 10 digits"
            />
          </div>
          <div className="form-field-full">
            <label className="form-label">Person Email</label>
            <input 
              type="email" 
              value={formData.email || ""} 
              onChange={(e) => updateFormField("email", e.target.value)} 
              className="form-input" 
              placeholder="Enter Person Email" 
            />
          </div>
          <div className="form-field-full">
            <label className="form-label">Person Address</label>
            <input 
              type="text" 
              value={formData.address || ""} 
              onChange={(e) => updateFormField("address", e.target.value)} 
              className="form-input" 
              placeholder="Enter Person Address" 
            />
          </div>
        </div>
      );

    case "real_estate":
      return (
        <div className="form-grid form-grid-3">
          <div>
            <label className="form-label">Property Name <span style={{ color: "var(--danger)" }}>*</span></label>
            <input type="text" value={formData.propertyName || ""} onChange={(e) => updateFormField("propertyName", e.target.value)} className="form-input" placeholder="e.g. Landmark Apartment" required />
          </div>
          <div>
            <label className="form-label">Property Type</label>
            <input type="text" value={formData.propertyType || ""} onChange={(e) => updateFormField("propertyType", e.target.value)} className="form-input" placeholder="e.g. Apartment, Land, Villa" />
          </div>
          <div>
            <label className="form-label">Owner Name <span style={{ color: "var(--danger)" }}>*</span></label>
            <input type="text" value={formData.ownerName || ""} onChange={(e) => updateFormField("ownerName", e.target.value)} className="form-input" placeholder="Owner name" required />
          </div>
          <div>
            <label className="form-label">Ownership (Self/Joint)</label>
            <select value={formData.ownershipType || "Self"} onChange={(e) => updateFormField("ownershipType", e.target.value)} className="form-select">
              <option value="Self">Self</option>
              <option value="Joint">Joint</option>
            </select>
          </div>
          <div>
            <label className="form-label">Co-owner (if any)</label>
            <input type="text" value={formData.coOwner || ""} onChange={(e) => updateFormField("coOwner", e.target.value)} className="form-input" placeholder="Co-owner Name" />
          </div>
          <div>
            <label className="form-label">Estimated Value</label>
            <input type="text" value={formData.propertyValue || ""} onChange={(e) => updateFormField("propertyValue", e.target.value)} className="form-input" placeholder="e.g. ₹2,50,000" />
          </div>
          <div className="form-field-full">
            <label className="form-label">Property Address <span style={{ color: "var(--danger)" }}>*</span></label>
            <input type="text" value={formData.propertyAddress || ""} onChange={(e) => updateFormField("propertyAddress", e.target.value)} className="form-input" placeholder="Enter Address details" required />
          </div>
          <div>
            <label className="form-label">Document Location</label>
            <input type="text" value={formData.documentLocation || ""} onChange={(e) => updateFormField("documentLocation", e.target.value)} className="form-input" placeholder="e.g. Safe locker, locker key" />
          </div>
          <div className="form-field-full">
            <label className="form-label">What should my nominee know?</label>
            <textarea value={formData.nomineeKnow || ""} onChange={(e) => updateFormField("nomineeKnow", e.target.value)} className="form-textarea" placeholder="Enter instructions for nominee..." rows={4} />
          </div>
        </div>
      );

    case "demat_account":
      return (
        <div className="form-grid form-grid-3">
          <div>
            <label className="form-label">DP Name / Broker Name <span style={{ color: "var(--danger)" }}>*</span></label>
            <input type="text" value={formData.dpName || ""} onChange={(e) => updateFormField("dpName", e.target.value)} className="form-input" placeholder="e.g. Zerodha, NSDL" required />
          </div>
          <div>
            <label className="form-label">Depository (NSDL/CDSL)</label>
            <select value={formData.depository || ""} onChange={(e) => updateFormField("depository", e.target.value)} className="form-select">
              <option value="">--Select--</option>
              <option value="NSDL">NSDL</option>
              <option value="CDSL">CDSL</option>
            </select>
          </div>
          <div>
            <label className="form-label">DP ID / Client ID / BO ID <span style={{ color: "var(--danger)" }}>*</span></label>
            <input type="text" value={formData.clientId || ""} onChange={(e) => updateFormField("clientId", e.target.value)} className="form-input" placeholder="Enter BO ID / Client ID" required />
          </div>
          <div>
            <label className="form-label">Nominee Name <span style={{ color: "var(--danger)" }}>*</span></label>
            <input type="text" value={formData.nomineeName || ""} onChange={(e) => updateFormField("nomineeName", e.target.value)} className="form-input" placeholder="Nominee" required />
          </div>
          <div>
            <label className="form-label">Nominee Added (Yes/No)</label>
            <select value={formData.nomineeAdded || "Yes"} onChange={(e) => updateFormField("nomineeAdded", e.target.value)} className="form-select">
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>
          <div>
            <label className="form-label">Registered Mobile</label>
            <input type="text" value={formData.registeredMobile || ""} onChange={(e) => updateFormField("registeredMobile", e.target.value.replace(/\D/g, ''))} className="form-input" placeholder="10-digit Registered Mobile" pattern="\d{10}" maxLength={10} />
          </div>
          <div>
            <label className="form-label">Registered Email</label>
            <input type="email" value={formData.registeredEmail || ""} onChange={(e) => updateFormField("registeredEmail", e.target.value)} className="form-input" placeholder="Registered Email Address" />
          </div>
          <div className="form-field-full">
            <label className="form-label">What should my nominee know?</label>
            <textarea value={formData.nomineeKnow || ""} onChange={(e) => updateFormField("nomineeKnow", e.target.value)} className="form-textarea" placeholder="Enter instructions for nominee..." rows={4} />
          </div>
        </div>
      );

    case "trading_account":
      return (
        <div className="form-grid form-grid-3">
          <div>
            <label className="form-label">Broker Name <span style={{ color: "var(--danger)" }}>*</span></label>
            <input type="text" value={formData.brokerName || ""} onChange={(e) => updateFormField("brokerName", e.target.value)} className="form-input" placeholder="e.g. AngelOne, Groww" required />
          </div>
          <div>
            <label className="form-label">Client UCC / Code <span style={{ color: "var(--danger)" }}>*</span></label>
            <input type="text" value={formData.clientUcc || ""} onChange={(e) => updateFormField("clientUcc", e.target.value)} className="form-input" placeholder="Enter Client UCC" required />
          </div>
          <div>
            <label className="form-label">Client ID (Optional)</label>
            <input type="text" value={formData.clientId || ""} onChange={(e) => updateFormField("clientId", e.target.value)} className="form-input" placeholder="Enter Client ID" />
          </div>
          <div>
            <label className="form-label">Nominee Name <span style={{ color: "var(--danger)" }}>*</span></label>
            <input type="text" value={formData.nomineeName || ""} onChange={(e) => updateFormField("nomineeName", e.target.value)} className="form-input" placeholder="Nominee" required />
          </div>
          <div>
            <label className="form-label">Nominee Added (Yes/No)</label>
            <select value={formData.nomineeAdded || "Yes"} onChange={(e) => updateFormField("nomineeAdded", e.target.value)} className="form-select">
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>
          <div>
            <label className="form-label">Registered Mobile</label>
            <input type="text" value={formData.registeredMobile || ""} onChange={(e) => updateFormField("registeredMobile", e.target.value.replace(/\D/g, ''))} className="form-input" placeholder="10-digit Registered Mobile" pattern="\d{10}" maxLength={10} />
          </div>
          <div>
            <label className="form-label">Registered Email</label>
            <input type="email" value={formData.registeredEmail || ""} onChange={(e) => updateFormField("registeredEmail", e.target.value)} className="form-input" placeholder="Registered Email" />
          </div>
          <div className="form-field-full">
            <label className="form-label">What should my nominee know?</label>
            <textarea value={formData.nomineeKnow || ""} onChange={(e) => updateFormField("nomineeKnow", e.target.value)} className="form-textarea" placeholder="Enter instructions for nominee..." rows={4} />
          </div>
        </div>
      );

    case "mutual_fund":
      return (
        <div className="form-grid form-grid-3">
          <div>
            <label className="form-label">Fund House / AMC / Investment Platform <span style={{ color: "var(--danger)" }}>*</span></label>
            <input type="text" value={formData.fundHouse || ""} onChange={(e) => updateFormField("fundHouse", e.target.value)} className="form-input" placeholder="e.g. SBI Mutual Fund, Groww" required />
          </div>
          <div>
            <label className="form-label">AMC / Investment Platform (Label/Ref)</label>
            <input type="text" value={formData.amcPlatform || ""} onChange={(e) => updateFormField("amcPlatform", e.target.value)} className="form-input" placeholder="AMC / Platform Name" />
          </div>
          <div>
            <label className="form-label">Folio Number <span style={{ color: "var(--danger)" }}>*</span></label>
            <input type="text" value={formData.folioNo || ""} onChange={(e) => updateFormField("folioNo", e.target.value)} className="form-input" placeholder="Enter Folio number" required />
          </div>
          <div>
            <label className="form-label">Scheme Name <span style={{ color: "var(--danger)" }}>*</span></label>
            <input type="text" value={formData.schemeName || ""} onChange={(e) => updateFormField("schemeName", e.target.value)} className="form-input" placeholder="e.g. Bluechip Growth Fund" required />
          </div>
          <div>
            <label className="form-label">Holding Type (Single/Joint/Anyone or Survivor)</label>
            <input type="text" value={formData.holdingType || ""} onChange={(e) => updateFormField("holdingType", e.target.value)} className="form-input" placeholder="e.g. Single" />
          </div>
          <div>
            <label className="form-label">Units (Optional)</label>
            <input type="text" value={formData.holdingUnits || ""} onChange={(e) => updateFormField("holdingUnits", e.target.value)} className="form-input" placeholder="Number of units" />
          </div>
          <div>
            <label className="form-label">Nominee Name</label>
            <input type="text" value={formData.nomineeName || ""} onChange={(e) => updateFormField("nomineeName", e.target.value)} className="form-input" placeholder="Nominee name" />
          </div>
          <div>
            <label className="form-label">Nominee Added</label>
            <select value={formData.nomineeAdded || "Yes"} onChange={(e) => updateFormField("nomineeAdded", e.target.value)} className="form-select">
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>
          <div>
            <label className="form-label">Registered Mobile</label>
            <input type="text" value={formData.registeredMobile || ""} onChange={(e) => updateFormField("registeredMobile", e.target.value.replace(/\D/g, ''))} className="form-input" placeholder="10-digit Mobile" pattern="\d{10}" maxLength={10} />
          </div>
          <div className="form-field-full">
            <label className="form-label">What should my nominee know?</label>
            <textarea value={formData.nomineeKnow || ""} onChange={(e) => updateFormField("nomineeKnow", e.target.value)} className="form-textarea" placeholder="Enter instructions for nominee..." rows={4} />
          </div>
        </div>
      );

    case "pms":
      return (
        <div className="form-grid form-grid-3">
          <div>
            <label className="form-label">PMS Provider <span style={{ color: "var(--danger)" }}>*</span></label>
            <input type="text" value={formData.providerName || ""} onChange={(e) => updateFormField("providerName", e.target.value)} className="form-input" placeholder="e.g. Kotak PMS, ASK" required />
          </div>
          <div>
            <label className="form-label">Portfolio Name</label>
            <input type="text" value={formData.portfolioName || ""} onChange={(e) => updateFormField("portfolioName", e.target.value)} className="form-input" placeholder="Portfolio Name" />
          </div>
          <div>
            <label className="form-label">Account Number <span style={{ color: "var(--danger)" }}>*</span></label>
            <input type="text" value={formData.accountNo || ""} onChange={(e) => updateFormField("accountNo", e.target.value)} className="form-input" placeholder="Enter PMS Account No" required />
          </div>
          <div>
            <label className="form-label">Relationship Manager</label>
            <input type="text" value={formData.relationshipManager || ""} onChange={(e) => updateFormField("relationshipManager", e.target.value)} className="form-input" placeholder="RM Name" />
          </div>
          <div>
            <label className="form-label">Contact Number</label>
            <input type="text" value={formData.contactNumber || ""} onChange={(e) => updateFormField("contactNumber", e.target.value.replace(/\D/g, ''))} className="form-input" placeholder="RM Contact No" pattern="\d{10}" maxLength={10} />
          </div>
          <div>
            <label className="form-label">Nominee Name <span style={{ color: "var(--danger)" }}>*</span></label>
            <input type="text" value={formData.nomineeName || ""} onChange={(e) => updateFormField("nomineeName", e.target.value)} className="form-input" placeholder="Nominee registered" required />
          </div>
          <div>
            <label className="form-label">Nominee Added</label>
            <select value={formData.nomineeAdded || "Yes"} onChange={(e) => updateFormField("nomineeAdded", e.target.value)} className="form-select">
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>
          <div>
            <label className="form-label">Portfolio Value (Optional)</label>
            <input type="text" value={formData.amount || ""} onChange={(e) => updateFormField("amount", e.target.value)} className="form-input" placeholder="e.g. ₹5,00,000" />
          </div>
          <div className="form-field-full">
            <label className="form-label">What should my nominee know?</label>
            <textarea value={formData.nomineeKnow || ""} onChange={(e) => updateFormField("nomineeKnow", e.target.value)} className="form-textarea" placeholder="Enter instructions for nominee..." rows={4} />
          </div>
        </div>
      );

    case "aif":
      return (
        <div className="form-grid form-grid-3">
          <div>
            <label className="form-label">Fund Name <span style={{ color: "var(--danger)" }}>*</span></label>
            <input type="text" value={formData.fundName || ""} onChange={(e) => updateFormField("fundName", e.target.value)} className="form-input" placeholder="e.g. True Beacon AIF" required />
          </div>
          <div>
            <label className="form-label">Category</label>
            <input type="text" value={formData.category || ""} onChange={(e) => updateFormField("category", e.target.value)} className="form-input" placeholder="e.g. Category II, Category III" />
          </div>
          <div>
            <label className="form-label">Investment Code / Folio <span style={{ color: "var(--danger)" }}>*</span></label>
            <input type="text" value={formData.investmentCode || ""} onChange={(e) => updateFormField("investmentCode", e.target.value)} className="form-input" placeholder="Enter Investment Code" required />
          </div>
          <div>
            <label className="form-label">Investment Manager</label>
            <input type="text" value={formData.investmentManager || ""} onChange={(e) => updateFormField("investmentManager", e.target.value)} className="form-input" placeholder="Investment Manager" />
          </div>
          <div>
            <label className="form-label">Contact Number</label>
            <input type="text" value={formData.contactNumber || ""} onChange={(e) => updateFormField("contactNumber", e.target.value.replace(/\D/g, ''))} className="form-input" placeholder="Contact number" pattern="\d{10}" maxLength={10} />
          </div>
          <div>
            <label className="form-label">Nominee Name <span style={{ color: "var(--danger)" }}>*</span></label>
            <input type="text" value={formData.nomineeName || ""} onChange={(e) => updateFormField("nomineeName", e.target.value)} className="form-input" placeholder="Nominee registered" required />
          </div>
          <div>
            <label className="form-label">Nominee Added</label>
            <select value={formData.nomineeAdded || "Yes"} onChange={(e) => updateFormField("nomineeAdded", e.target.value)} className="form-select">
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>
          <div>
            <label className="form-label">Investment Value (Optional)</label>
            <input type="text" value={formData.amount || ""} onChange={(e) => updateFormField("amount", e.target.value)} className="form-input" placeholder="e.g. ₹1,00,00,000" />
          </div>
          <div className="form-field-full">
            <label className="form-label">What should my nominee know?</label>
            <textarea value={formData.nomineeKnow || ""} onChange={(e) => updateFormField("nomineeKnow", e.target.value)} className="form-textarea" placeholder="Enter instructions for nominee..." rows={4} />
          </div>
        </div>
      );

    case "private_equity":
      return (
        <div className="form-grid form-grid-3">
          <div>
            <label className="form-label">Company / Fund Name <span style={{ color: "var(--danger)" }}>*</span></label>
            <input type="text" value={formData.companyName || ""} onChange={(e) => updateFormField("companyName", e.target.value)} className="form-input" placeholder="e.g. Acme Corp" required />
          </div>
          <div>
            <label className="form-label">Investment Through</label>
            <input type="text" value={formData.investmentThrough || ""} onChange={(e) => updateFormField("investmentThrough", e.target.value)} className="form-input" placeholder="e.g. AngelList, Direct" />
          </div>
          <div>
            <label className="form-label">Contact Person</label>
            <input type="text" value={formData.contactPerson || ""} onChange={(e) => updateFormField("contactPerson", e.target.value)} className="form-input" placeholder="Contact Person" />
          </div>
          <div>
            <label className="form-label">Contact Number</label>
            <input type="text" value={formData.contactNumber || ""} onChange={(e) => updateFormField("contactNumber", e.target.value.replace(/\D/g, ''))} className="form-input" placeholder="Contact number" pattern="\d{10}" maxLength={10} />
          </div>
          <div>
            <label className="form-label">Investment Amount <span style={{ color: "var(--danger)" }}>*</span></label>
            <input type="text" value={formData.amount || ""} onChange={(e) => updateFormField("amount", e.target.value)} className="form-input" placeholder="e.g. ₹10,00,000" required />
          </div>
          <div>
            <label className="form-label">Nominee Name <span style={{ color: "var(--danger)" }}>*</span></label>
            <input type="text" value={formData.nomineeName || ""} onChange={(e) => updateFormField("nomineeName", e.target.value)} className="form-input" placeholder="Nominee" required />
          </div>
          <div>
            <label className="form-label">Nominee Added</label>
            <select value={formData.nomineeAdded || "Yes"} onChange={(e) => updateFormField("nomineeAdded", e.target.value)} className="form-select">
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>
          <div className="form-field-full">
            <label className="form-label">What should my nominee know?</label>
            <textarea value={formData.nomineeKnow || ""} onChange={(e) => updateFormField("nomineeKnow", e.target.value)} className="form-textarea" placeholder="Enter instructions for nominee..." rows={4} />
          </div>
        </div>
      );

    case "startup_investments":
      return (
        <div className="form-grid form-grid-3">
          <div>
            <label className="form-label">Startup Name <span style={{ color: "var(--danger)" }}>*</span></label>
            <input type="text" value={formData.startupName || ""} onChange={(e) => updateFormField("startupName", e.target.value)} className="form-input" placeholder="e.g. TechLabs Pvt Ltd" required />
          </div>
          <div>
            <label className="form-label">Founder / Contact Person</label>
            <input type="text" value={formData.founderContact || ""} onChange={(e) => updateFormField("founderContact", e.target.value)} className="form-input" placeholder="Founder Name" />
          </div>
          <div>
            <label className="form-label">Investment Mode</label>
            <input type="text" value={formData.investmentMode || ""} onChange={(e) => updateFormField("investmentMode", e.target.value)} className="form-input" placeholder="e.g. SAFE, Equity Shares, CCD" />
          </div>
          <div>
            <label className="form-label">Shareholding Details</label>
            <input type="text" value={formData.shareholdingDetails || ""} onChange={(e) => updateFormField("shareholdingDetails", e.target.value)} className="form-input" placeholder="e.g. Certificate No, Folio" />
          </div>
          <div>
            <label className="form-label">Equity % <span style={{ color: "var(--danger)" }}>*</span></label>
            <input type="text" value={formData.equityPercent || ""} onChange={(e) => updateFormField("equityPercent", e.target.value)} className="form-input" placeholder="e.g. 2.5%" required />
          </div>
          <div>
            <label className="form-label">Amount Invested <span style={{ color: "var(--danger)" }}>*</span></label>
            <input type="text" value={formData.amount || ""} onChange={(e) => updateFormField("amount", e.target.value)} className="form-input" placeholder="e.g. ₹5,00,000" required />
          </div>
          <div>
            <label className="form-label">Contact Number</label>
            <input type="text" value={formData.contactNumber || ""} onChange={(e) => updateFormField("contactNumber", e.target.value.replace(/\D/g, ''))} className="form-input" placeholder="Contact number" pattern="\d{10}" maxLength={10} />
          </div>
          <div>
            <label className="form-label">Nominee Name <span style={{ color: "var(--danger)" }}>*</span></label>
            <input type="text" value={formData.nomineeName || ""} onChange={(e) => updateFormField("nomineeName", e.target.value)} className="form-input" placeholder="Nominee" required />
          </div>
          <div className="form-field-full">
            <label className="form-label">What should my nominee know?</label>
            <textarea value={formData.nomineeKnow || ""} onChange={(e) => updateFormField("nomineeKnow", e.target.value)} className="form-textarea" placeholder="Enter instructions for nominee..." rows={4} />
          </div>
        </div>
      );

    case "pf_ppf_epf":
      return (
        <div className="form-grid form-grid-3">
          <div>
            <label className="form-label">Account Number / UAN <span style={{ color: "var(--danger)" }}>*</span></label>
            <input 
              type="text" 
              value={formData.uanNumber || ""} 
              onChange={(e) => updateFormField("uanNumber", e.target.value.replace(/\D/g, ''))} 
              className="form-input" 
              placeholder="Enter UAN or PPF Account No" 
              required 
              pattern="\d{11,17}"
              maxLength={17}
              title="UAN or Account Number must be between 11 and 17 digits"
            />
          </div>
          <div>
            <label className="form-label">Account Type</label>
            <select value={formData.accountType || "EPF"} onChange={(e) => updateFormField("accountType", e.target.value)} className="form-select">
              <option value="EPF">EPF</option>
              <option value="PPF">PPF</option>
              <option value="GPF">GPF</option>
            </select>
          </div>
          <div>
            <label className="form-label">Employer / Bank</label>
            <input type="text" value={formData.employerBank || ""} onChange={(e) => updateFormField("employerBank", e.target.value)} className="form-input" placeholder="Employer Name or Bank Name" />
          </div>
          <div>
            <label className="form-label">Nominee Name <span style={{ color: "var(--danger)" }}>*</span></label>
            <input type="text" value={formData.nomineeName || ""} onChange={(e) => updateFormField("nomineeName", e.target.value)} className="form-input" placeholder="Nominee" required />
          </div>
          <div>
            <label className="form-label">Nominee Added</label>
            <select value={formData.nomineeAdded || "Yes"} onChange={(e) => updateFormField("nomineeAdded", e.target.value)} className="form-select">
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>
          <div>
            <label className="form-label">Registered Mobile</label>
            <input type="text" value={formData.registeredMobile || ""} onChange={(e) => updateFormField("registeredMobile", e.target.value.replace(/\D/g, ''))} className="form-input" placeholder="10-digit Mobile" pattern="\d{10}" maxLength={10} />
          </div>
          <div>
            <label className="form-label">Balance Amount (Optional)</label>
            <input type="text" value={formData.amount || ""} onChange={(e) => updateFormField("amount", e.target.value)} className="form-input" placeholder="e.g. ₹15,00,000" />
          </div>
          <div className="form-field-full">
            <label className="form-label">What should my nominee know?</label>
            <textarea value={formData.nomineeKnow || ""} onChange={(e) => updateFormField("nomineeKnow", e.target.value)} className="form-textarea" placeholder="Enter instructions for nominee..." rows={4} />
          </div>
        </div>
      );

    case "bank_account":
      return (
        <div className="form-grid form-grid-3">
          <div>
            <label className="form-label">Bank Name <span style={{ color: "var(--danger)" }}>*</span></label>
            <input type="text" value={formData.bankName || ""} onChange={(e) => updateFormField("bankName", e.target.value)} className="form-input" placeholder="e.g. HDFC Bank" required />
          </div>
          <div>
            <label className="form-label">Branch</label>
            <input type="text" value={formData.branch || ""} onChange={(e) => updateFormField("branch", e.target.value)} className="form-input" placeholder="Branch Name" />
          </div>
          <div>
            <label className="form-label">Account Number <span style={{ color: "var(--danger)" }}>*</span></label>
            <input type="text" value={formData.accountNo || ""} onChange={(e) => updateFormField("accountNo", e.target.value)} className="form-input" placeholder="Enter Account number" required />
          </div>
          <div>
            <label className="form-label">Account Type</label>
            <select value={formData.accountType || "Savings"} onChange={(e) => updateFormField("accountType", e.target.value)} className="form-select">
              <option value="Savings">Savings</option>
              <option value="Current">Current</option>
              <option value="Salary">Salary</option>
            </select>
          </div>
          <div>
            <label className="form-label">IFSC Code</label>
            <input 
              type="text" 
              value={formData.ifscCode || ""} 
              onChange={(e) => updateFormField("ifscCode", e.target.value.toUpperCase())} 
              className="form-input" 
              placeholder="IFSC Code" 
              pattern="[A-Z]{4}0[A-Z0-9]{6}"
              maxLength={11}
              style={{ textTransform: "uppercase" }}
              title="IFSC code must be 11 characters (e.g. HDFC0001234)"
            />
          </div>
          <div>
            <label className="form-label">Joint Holder</label>
            <input type="text" value={formData.jointHolder || ""} onChange={(e) => updateFormField("jointHolder", e.target.value)} className="form-input" placeholder="Joint Holder Name (if any)" />
          </div>
          <div>
            <label className="form-label">Nominee Name <span style={{ color: "var(--danger)" }}>*</span></label>
            <input type="text" value={formData.nomineeName || ""} onChange={(e) => updateFormField("nomineeName", e.target.value)} className="form-input" placeholder="Nominee registered" required />
          </div>
          <div>
            <label className="form-label">Nominee Added</label>
            <select value={formData.nomineeAdded || "Yes"} onChange={(e) => updateFormField("nomineeAdded", e.target.value)} className="form-select">
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>
          <div className="form-field-full">
            <label className="form-label">What should my nominee know?</label>
            <textarea value={formData.nomineeKnow || ""} onChange={(e) => updateFormField("nomineeKnow", e.target.value)} className="form-textarea" placeholder="Enter instructions for nominee..." rows={4} />
          </div>
        </div>
      );

    case "fixed_deposits":
      return (
        <div className="form-grid form-grid-3">
          <div>
            <label className="form-label">Bank Name / NBFC <span style={{ color: "var(--danger)" }}>*</span></label>
            <input type="text" value={formData.bankName || ""} onChange={(e) => updateFormField("bankName", e.target.value)} className="form-input" placeholder="e.g. ICICI Bank, Bajaj Finance" required />
          </div>
          <div>
            <label className="form-label">Bank / NBFC Name</label>
            <input type="text" value={formData.bankNbfc || ""} onChange={(e) => updateFormField("bankNbfc", e.target.value)} className="form-input" placeholder="Bank or NBFC" />
          </div>
          <div>
            <label className="form-label">Receipt Number / FD Number <span style={{ color: "var(--danger)" }}>*</span></label>
            <input type="text" value={formData.receiptNo || ""} onChange={(e) => updateFormField("receiptNo", e.target.value)} className="form-input" placeholder="FD Number" required />
          </div>
          <div>
            <label className="form-label">Branch</label>
            <input type="text" value={formData.branch || ""} onChange={(e) => updateFormField("branch", e.target.value)} className="form-input" placeholder="Branch Name" />
          </div>
          <div>
            <label className="form-label">FD Principal Amount <span style={{ color: "var(--danger)" }}>*</span></label>
            <input type="text" value={formData.amount || ""} onChange={(e) => updateFormField("amount", e.target.value)} className="form-input" placeholder="Amount deposited" required />
          </div>
          <div>
            <label className="form-label">Maturity Date</label>
            <input 
              type="text" 
              value={formData.maturityDate || ""} 
              onChange={(e) => handleDateChange("maturityDate", e.target.value)} 
              className="form-input" 
              placeholder="DD/MM/YY" 
              pattern="^(0[1-9]|[12]\d|3[01])/(0[1-9]|1[0-2])/\d{2}$"
              maxLength={8}
              title="Maturity date must be in DD/MM/YY format (e.g. 25/12/26)"
            />
          </div>
          <div>
            <label className="form-label">Nominee Name <span style={{ color: "var(--danger)" }}>*</span></label>
            <input type="text" value={formData.nomineeName || ""} onChange={(e) => updateFormField("nomineeName", e.target.value)} className="form-input" placeholder="Nominee" required />
          </div>
          <div>
            <label className="form-label">Nominee Added</label>
            <select value={formData.nomineeAdded || "Yes"} onChange={(e) => updateFormField("nomineeAdded", e.target.value)} className="form-select">
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>
          <div className="form-field-full">
            <label className="form-label">What should my nominee know?</label>
            <textarea value={formData.nomineeKnow || ""} onChange={(e) => updateFormField("nomineeKnow", e.target.value)} className="form-textarea" placeholder="Enter instructions for nominee..." rows={4} />
          </div>
        </div>
      );

    case "crypto_currency":
      return (
        <div className="form-grid form-grid-3">
          <div>
            <label className="form-label">Exchange / Wallet Name <span style={{ color: "var(--danger)" }}>*</span></label>
            <input type="text" value={formData.exchangeWallet || ""} onChange={(e) => updateFormField("exchangeWallet", e.target.value)} className="form-input" placeholder="e.g. Ledger, Binance" required />
          </div>
          <div>
            <label className="form-label">Wallet Name</label>
            <input type="text" value={formData.walletName || ""} onChange={(e) => updateFormField("walletName", e.target.value)} className="form-input" placeholder="e.g. MetaMask, TrustWallet" />
          </div>
          <div>
            <label className="form-label">Coin / Token Symbol <span style={{ color: "var(--danger)" }}>*</span></label>
            <input type="text" value={formData.coinToken || ""} onChange={(e) => updateFormField("coinToken", e.target.value)} className="form-input" placeholder="e.g. BTC, ETH" required />
          </div>
          <div>
            <label className="form-label">Wallet Public Address (Optional)</label>
            <input type="text" value={formData.walletAddress || ""} onChange={(e) => updateFormField("walletAddress", e.target.value)} className="form-input" placeholder="0x..." />
          </div>
          <div>
            <label className="form-label">Recovery Phrase Location</label>
            <input type="text" value={formData.recoveryPhraseLocation || ""} onChange={(e) => updateFormField("recoveryPhraseLocation", e.target.value)} className="form-input" placeholder="e.g. Physical Safe, Encrypted USB" />
          </div>
          <div>
            <label className="form-label">Nominee Aware (Yes/No)</label>
            <select value={formData.nomineeAware || "No"} onChange={(e) => updateFormField("nomineeAware", e.target.value)} className="form-select">
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>
          <div className="form-field-full">
            <label className="form-label">Backup Seed Mnemonic (Notes)</label>
            <textarea value={formData.notes || ""} onChange={(e) => updateFormField("notes", e.target.value)} className="form-textarea" placeholder="Warning: Write your seed phrase here with caution. Make sure your vault password is secure." rows={4} />
          </div>
          <div className="form-field-full">
            <label className="form-label">What should my nominee know?</label>
            <textarea value={formData.nomineeKnow || ""} onChange={(e) => updateFormField("nomineeKnow", e.target.value)} className="form-textarea" placeholder="Enter instructions for nominee..." rows={4} />
          </div>
        </div>
      );

    case "nft":
      return (
        <div className="form-grid form-grid-3">
          <div>
            <label className="form-label">NFT Name <span style={{ color: "var(--danger)" }}>*</span></label>
            <input type="text" value={formData.nftName || ""} onChange={(e) => updateFormField("nftName", e.target.value)} className="form-input" placeholder="e.g. Bored Ape #1234" required />
          </div>
          <div>
            <label className="form-label">Marketplace</label>
            <input type="text" value={formData.marketplace || ""} onChange={(e) => updateFormField("marketplace", e.target.value)} className="form-input" placeholder="e.g. OpenSea, Rarible" />
          </div>
          <div>
            <label className="form-label">Wallet Name</label>
            <input type="text" value={formData.walletName || ""} onChange={(e) => updateFormField("walletName", e.target.value)} className="form-input" placeholder="e.g. MetaMask" />
          </div>
          <div>
            <label className="form-label">Collection Name <span style={{ color: "var(--danger)" }}>*</span></label>
            <input type="text" value={formData.collectionName || ""} onChange={(e) => updateFormField("collectionName", e.target.value)} className="form-input" placeholder="e.g. BAYC" required />
          </div>
          <div>
            <label className="form-label">Blockchain</label>
            <select value={formData.blockchain || "Ethereum"} onChange={(e) => updateFormField("blockchain", e.target.value)} className="form-select">
              <option value="Ethereum">Ethereum</option>
              <option value="Solana">Solana</option>
              <option value="Polygon">Polygon</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="form-label">Recovery Phrase Location</label>
            <input type="text" value={formData.recoveryPhraseLocation || ""} onChange={(e) => updateFormField("recoveryPhraseLocation", e.target.value)} className="form-input" placeholder="Recovery Phrase Location" />
          </div>
          <div>
            <label className="form-label">Nominee Name <span style={{ color: "var(--danger)" }}>*</span></label>
            <input type="text" value={formData.nomineeName || ""} onChange={(e) => updateFormField("nomineeName", e.target.value)} className="form-input" placeholder="Nominee" required />
          </div>
          <div>
            <label className="form-label">Nominee Aware (Yes/No)</label>
            <select value={formData.nomineeAware || "No"} onChange={(e) => updateFormField("nomineeAware", e.target.value)} className="form-select">
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>
          <div className="form-field-full">
            <label className="form-label">What should my nominee know?</label>
            <textarea value={formData.nomineeKnow || ""} onChange={(e) => updateFormField("nomineeKnow", e.target.value)} className="form-textarea" placeholder="Enter instructions for nominee..." rows={4} />
          </div>
        </div>
      );

    case "bonds_certificates":
      return (
        <div className="form-grid form-grid-3">
          <div>
            <label className="form-label">Investment Type (REIT/SGB/Bonds etc)</label>
            <input type="text" value={formData.investmentType || ""} onChange={(e) => updateFormField("investmentType", e.target.value)} className="form-input" placeholder="e.g. SGB, REIT, Bonds" />
          </div>
          <div>
            <label className="form-label">Issuer Name <span style={{ color: "var(--danger)" }}>*</span></label>
            <input type="text" value={formData.issuerName || ""} onChange={(e) => updateFormField("issuerName", e.target.value)} className="form-input" placeholder="e.g. RBI, NHAI, Sovereign Gold Bonds" required />
          </div>
          <div>
            <label className="form-label">Certificate / Folio / Bond Ledger ID <span style={{ color: "var(--danger)" }}>*</span></label>
            <input type="text" value={formData.certNo || ""} onChange={(e) => updateFormField("certNo", e.target.value)} className="form-input" placeholder="Enter Certificate or Folio No" required />
          </div>
          <div>
            <label className="form-label">Investment Face Value / Amount <span style={{ color: "var(--danger)" }}>*</span></label>
            <input type="text" value={formData.amount || ""} onChange={(e) => updateFormField("amount", e.target.value)} className="form-input" placeholder="e.g. ₹50,00,000" required />
          </div>
          <div>
            <label className="form-label">Maturity Date (Optional)</label>
            <input 
              type="text" 
              value={formData.maturityDate || ""} 
              onChange={(e) => handleDateChange("maturityDate", e.target.value)} 
              className="form-input" 
              placeholder="DD/MM/YY" 
              pattern="^(0[1-9]|[12]\d|3[01])/(0[1-9]|1[0-2])/\d{2}$"
              maxLength={8}
              title="Maturity date must be in DD/MM/YY format (e.g. 25/12/26)"
            />
          </div>
          <div>
            <label className="form-label">Nominee Name <span style={{ color: "var(--danger)" }}>*</span></label>
            <input type="text" value={formData.nomineeName || ""} onChange={(e) => updateFormField("nomineeName", e.target.value)} className="form-input" placeholder="Nominee" required />
          </div>
          <div>
            <label className="form-label">Nominee Added</label>
            <select value={formData.nomineeAdded || "Yes"} onChange={(e) => updateFormField("nomineeAdded", e.target.value)} className="form-select">
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>
          <div className="form-field-full">
            <label className="form-label">What should my nominee know?</label>
            <textarea value={formData.nomineeKnow || ""} onChange={(e) => updateFormField("nomineeKnow", e.target.value)} className="form-textarea" placeholder="Enter instructions for nominee..." rows={4} />
          </div>
        </div>
      );

    case "mobile_wallet":
      return (
        <div className="form-grid form-grid-3">
          <div>
            <label className="form-label">Wallet Name <span style={{ color: "var(--danger)" }}>*</span></label>
            <input type="text" value={formData.walletName || ""} onChange={(e) => updateFormField("walletName", e.target.value)} className="form-input" placeholder="e.g. Paytm, PhonePe, Google Pay" required />
          </div>
          <div>
            <label className="form-label">Registered Mobile <span style={{ color: "var(--danger)" }}>*</span></label>
            <input 
              type="text" 
              value={formData.registeredMobile || formData.linkedMobile || ""} 
              onChange={(e) => {
                updateFormField("registeredMobile", e.target.value.replace(/\D/g, ''));
                updateFormField("linkedMobile", e.target.value.replace(/\D/g, ''));
              }} 
              className="form-input" 
              placeholder="10-digit Mobile No" 
              required 
              pattern="\d{10}"
              maxLength={10}
              title="Registered mobile number must be exactly 10 digits"
            />
          </div>
          <div>
            <label className="form-label">Linked Bank</label>
            <input type="text" value={formData.linkedBank || ""} onChange={(e) => updateFormField("linkedBank", e.target.value)} className="form-input" placeholder="Linked Bank Name" />
          </div>
          <div>
            <label className="form-label">UPI ID (Optional)</label>
            <input type="text" value={formData.upiId || ""} onChange={(e) => updateFormField("upiId", e.target.value)} className="form-input" placeholder="e.g. name@okhdfc" />
          </div>
          <div>
            <label className="form-label">Nominee Name / Legal Successor</label>
            <input type="text" value={formData.nomineeName || ""} onChange={(e) => updateFormField("nomineeName", e.target.value)} className="form-input" placeholder="Nominee name" />
          </div>
          <div>
            <label className="form-label">Nominee Aware</label>
            <select value={formData.nomineeAware || "No"} onChange={(e) => updateFormField("nomineeAware", e.target.value)} className="form-select">
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>
          <div className="form-field-full">
            <label className="form-label">What should my nominee know?</label>
            <textarea value={formData.nomineeKnow || ""} onChange={(e) => updateFormField("nomineeKnow", e.target.value)} className="form-textarea" placeholder="Enter instructions for nominee..." rows={4} />
          </div>
        </div>
      );

    case "physical_shares":
      return (
        <div className="form-grid form-grid-3">
          <div>
            <label className="form-label">Company Name (Asset Title) <span style={{ color: "var(--danger)" }}>*</span></label>
            <input type="text" value={formData.companyName || formData.assetTitle || ""} onChange={(e) => {
              updateFormField("companyName", e.target.value);
              updateFormField("assetTitle", e.target.value);
            }} className="form-input" placeholder="e.g. Reliance Industries Ltd" required />
          </div>
          <div>
            <label className="form-label">Certificate Number</label>
            <input type="text" value={formData.certificateNumber || ""} onChange={(e) => updateFormField("certificateNumber", e.target.value)} className="form-input" placeholder="Certificate Number" />
          </div>
          <div>
            <label className="form-label">Quantity</label>
            <input type="text" value={formData.quantity || ""} onChange={(e) => updateFormField("quantity", e.target.value)} className="form-input" placeholder="Quantity of shares" />
          </div>
          <div>
            <label className="form-label">Storage Location</label>
            <input type="text" value={formData.storageLocation || ""} onChange={(e) => updateFormField("storageLocation", e.target.value)} className="form-input" placeholder="e.g. Home Safe Locker" />
          </div>
          <div>
            <label className="form-label">Estimated Value <span style={{ color: "var(--danger)" }}>*</span></label>
            <input type="text" value={formData.amount || ""} onChange={(e) => updateFormField("amount", e.target.value)} className="form-input" placeholder="e.g. ₹5,00,000" required />
          </div>
          <div>
            <label className="form-label">Nominee Name <span style={{ color: "var(--danger)" }}>*</span></label>
            <input type="text" value={formData.nomineeName || ""} onChange={(e) => updateFormField("nomineeName", e.target.value)} className="form-input" placeholder="Nominee" required />
          </div>
          <div>
            <label className="form-label">Nominee Aware</label>
            <select value={formData.nomineeAware || "No"} onChange={(e) => updateFormField("nomineeAware", e.target.value)} className="form-select">
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>
          <div className="form-field-full">
            <label className="form-label">What should my nominee know?</label>
            <textarea value={formData.nomineeKnow || ""} onChange={(e) => updateFormField("nomineeKnow", e.target.value)} className="form-textarea" placeholder="Enter instructions for nominee..." rows={4} />
          </div>
        </div>
      );

    case "life_insurance":
      return (
        <div className="form-grid form-grid-3">
          <div>
            <label className="form-label">Insurance Company (Asset Title) <span style={{ color: "var(--danger)" }}>*</span></label>
            <input type="text" value={formData.insuranceCompany || formData.assetTitle || ""} onChange={(e) => {
              updateFormField("insuranceCompany", e.target.value);
              updateFormField("assetTitle", e.target.value);
            }} className="form-input" placeholder="e.g. LIC India" required />
          </div>
          <div>
            <label className="form-label">Policy Number <span style={{ color: "var(--danger)" }}>*</span></label>
            <input type="text" value={formData.policyNo || ""} onChange={(e) => updateFormField("policyNo", e.target.value)} className="form-input" placeholder="Enter Policy No" required />
          </div>
          <div>
            <label className="form-label">Policy Type</label>
            <input type="text" value={formData.policyType || ""} onChange={(e) => updateFormField("policyType", e.target.value)} className="form-input" placeholder="e.g. Term Insurance, Endowment" />
          </div>
          <div>
            <label className="form-label">Sum Assured / Value <span style={{ color: "var(--danger)" }}>*</span></label>
            <input type="text" value={formData.amount || ""} onChange={(e) => updateFormField("amount", e.target.value)} className="form-input" placeholder="e.g. ₹10,00,000" required />
          </div>
          <div>
            <label className="form-label">Nominee Name <span style={{ color: "var(--danger)" }}>*</span></label>
            <input type="text" value={formData.nomineeName || ""} onChange={(e) => updateFormField("nomineeName", e.target.value)} className="form-input" placeholder="Nominee" required />
          </div>
          <div>
            <label className="form-label">Agent / Relationship Manager</label>
            <input type="text" value={formData.agentRelationshipManager || ""} onChange={(e) => updateFormField("agentRelationshipManager", e.target.value)} className="form-input" placeholder="Agent Name & Contact" />
          </div>
          <div className="form-field-full">
            <label className="form-label">What should my nominee know?</label>
            <textarea value={formData.nomineeKnow || ""} onChange={(e) => updateFormField("nomineeKnow", e.target.value)} className="form-textarea" placeholder="Enter instructions for nominee..." rows={4} />
          </div>
        </div>
      );

    case "health_insurance":
      return (
        <div className="form-grid form-grid-3">
          <div>
            <label className="form-label">Insurance Company (Asset Title) <span style={{ color: "var(--danger)" }}>*</span></label>
            <input type="text" value={formData.insuranceCompany || formData.assetTitle || ""} onChange={(e) => {
              updateFormField("insuranceCompany", e.target.value);
              updateFormField("assetTitle", e.target.value);
            }} className="form-input" placeholder="e.g. Star Health Insurance" required />
          </div>
          <div>
            <label className="form-label">Policy Number <span style={{ color: "var(--danger)" }}>*</span></label>
            <input type="text" value={formData.policyNo || ""} onChange={(e) => updateFormField("policyNo", e.target.value)} className="form-input" placeholder="Enter Policy No" required />
          </div>
          <div>
            <label className="form-label">Covered Members</label>
            <input type="text" value={formData.coveredMembers || ""} onChange={(e) => updateFormField("coveredMembers", e.target.value)} className="form-input" placeholder="e.g. Spouse, Self, Kids" />
          </div>
          <div>
            <label className="form-label">TPA / Claim Contact</label>
            <input type="text" value={formData.tpaClaimContact || ""} onChange={(e) => updateFormField("tpaClaimContact", e.target.value)} className="form-input" placeholder="TPA Contact details" />
          </div>
          <div>
            <label className="form-label">Cover Value <span style={{ color: "var(--danger)" }}>*</span></label>
            <input type="text" value={formData.amount || ""} onChange={(e) => updateFormField("amount", e.target.value)} className="form-input" placeholder="e.g. ₹5,00,000" required />
          </div>
          <div>
            <label className="form-label">Nominee Name <span style={{ color: "var(--danger)" }}>*</span></label>
            <input type="text" value={formData.nomineeName || ""} onChange={(e) => updateFormField("nomineeName", e.target.value)} className="form-input" placeholder="Nominee" required />
          </div>
          <div>
            <label className="form-label">Nominee Aware</label>
            <select value={formData.nomineeAware || "No"} onChange={(e) => updateFormField("nomineeAware", e.target.value)} className="form-select">
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>
          <div className="form-field-full">
            <label className="form-label">What should my nominee know?</label>
            <textarea value={formData.nomineeKnow || ""} onChange={(e) => updateFormField("nomineeKnow", e.target.value)} className="form-textarea" placeholder="Enter instructions for nominee..." rows={4} />
          </div>
        </div>
      );

    case "general_insurance":
      return (
        <div className="form-grid form-grid-3">
          <div>
            <label className="form-label">Insurance Type (Vehicle, Home, etc.)</label>
            <input type="text" value={formData.insuranceType || ""} onChange={(e) => updateFormField("insuranceType", e.target.value)} className="form-input" placeholder="e.g. Car Insurance" />
          </div>
          <div>
            <label className="form-label">Insurance Company (Asset Title) <span style={{ color: "var(--danger)" }}>*</span></label>
            <input type="text" value={formData.insuranceCompany || formData.assetTitle || ""} onChange={(e) => {
              updateFormField("insuranceCompany", e.target.value);
              updateFormField("assetTitle", e.target.value);
            }} className="form-input" placeholder="e.g. HDFC Ergo" required />
          </div>
          <div>
            <label className="form-label">Policy Number <span style={{ color: "var(--danger)" }}>*</span></label>
            <input type="text" value={formData.policyNo || ""} onChange={(e) => updateFormField("policyNo", e.target.value)} className="form-input" placeholder="Enter Policy No" required />
          </div>
          <div>
            <label className="form-label">Asset Covered</label>
            <input type="text" value={formData.assetCovered || ""} onChange={(e) => updateFormField("assetCovered", e.target.value)} className="form-input" placeholder="e.g. Creta Car MH12" />
          </div>
          <div>
            <label className="form-label">Expiry Date</label>
            <input type="text" value={formData.expiryDate || ""} onChange={(e) => updateFormField("expiryDate", e.target.value)} className="form-input" placeholder="Expiry Date Details" />
          </div>
          <div>
            <label className="form-label">Sum Insured / Value <span style={{ color: "var(--danger)" }}>*</span></label>
            <input type="text" value={formData.amount || ""} onChange={(e) => updateFormField("amount", e.target.value)} className="form-input" placeholder="e.g. ₹3,50,000" required />
          </div>
          <div>
            <label className="form-label">Nominee Name <span style={{ color: "var(--danger)" }}>*</span></label>
            <input type="text" value={formData.nomineeName || ""} onChange={(e) => updateFormField("nomineeName", e.target.value)} className="form-input" placeholder="Nominee" required />
          </div>
          <div className="form-field-full">
            <label className="form-label">What should my nominee know?</label>
            <textarea value={formData.nomineeKnow || ""} onChange={(e) => updateFormField("nomineeKnow", e.target.value)} className="form-textarea" placeholder="Enter instructions for nominee..." rows={4} />
          </div>
        </div>
      );

    case "loan_given":
      return (
        <div className="form-grid form-grid-3">
          <div>
            <label className="form-label">Borrower Name (Asset Title) <span style={{ color: "var(--danger)" }}>*</span></label>
            <input type="text" value={formData.borrowerName || formData.assetTitle || ""} onChange={(e) => {
              updateFormField("borrowerName", e.target.value);
              updateFormField("assetTitle", e.target.value);
            }} className="form-input" placeholder="e.g. Rajesh Kumar" required />
          </div>
          <div>
            <label className="form-label">Loan Amount <span style={{ color: "var(--danger)" }}>*</span></label>
            <input type="text" value={formData.amount || ""} onChange={(e) => updateFormField("amount", e.target.value)} className="form-input" placeholder="e.g. ₹2,00,000" required />
          </div>
          <div>
            <label className="form-label">Date Given</label>
            <input type="text" value={formData.dateGiven || ""} onChange={(e) => updateFormField("dateGiven", e.target.value)} className="form-input" placeholder="e.g. 15/01/2026" />
          </div>
          <div>
            <label className="form-label">Supporting Document Location</label>
            <input type="text" value={formData.supportingDocumentLocation || ""} onChange={(e) => updateFormField("supportingDocumentLocation", e.target.value)} className="form-input" placeholder="e.g. Safe Vault, Google Drive link" />
          </div>
          <div>
            <label className="form-label">Repayment Status</label>
            <input type="text" value={formData.repaymentStatus || ""} onChange={(e) => updateFormField("repaymentStatus", e.target.value)} className="form-input" placeholder="e.g. Ongoing, Due" />
          </div>
          <div>
            <label className="form-label">Nominee Name / Successor <span style={{ color: "var(--danger)" }}>*</span></label>
            <input type="text" value={formData.nomineeName || ""} onChange={(e) => updateFormField("nomineeName", e.target.value)} className="form-input" placeholder="Nominee" required />
          </div>
          <div>
            <label className="form-label">Due Date (Optional)</label>
            <input 
              type="text" 
              value={formData.dueDate || ""} 
              onChange={(e) => handleDateChange("dueDate", e.target.value)} 
              className="form-input" 
              placeholder="DD/MM/YY" 
              pattern="^(0[1-9]|[12]\d|3[01])/(0[1-9]|1[0-2])/\d{2}$"
              maxLength={8}
              title="Due date must be in DD/MM/YY format (e.g. 25/12/26)"
            />
          </div>
          <div className="form-field-full">
            <label className="form-label">What should my nominee know?</label>
            <textarea value={formData.nomineeKnow || ""} onChange={(e) => updateFormField("nomineeKnow", e.target.value)} className="form-textarea" placeholder="Enter instructions for nominee..." rows={4} />
          </div>
        </div>
      );

    case "movable_assets":
      return (
        <div className="form-grid form-grid-3">
          <div>
            <label className="form-label">Asset Name (Asset Title) <span style={{ color: "var(--danger)" }}>*</span></label>
            <input type="text" value={formData.assetName || formData.assetTitle || ""} onChange={(e) => {
              updateFormField("assetName", e.target.value);
              updateFormField("assetTitle", e.target.value);
            }} className="form-input" placeholder="e.g. Gold Necklace" required />
          </div>
          <div>
            <label className="form-label">Asset Category</label>
            <input type="text" value={formData.assetCategory || ""} onChange={(e) => updateFormField("assetCategory", e.target.value)} className="form-input" placeholder="e.g. Jewellery, Art, Cash" />
          </div>
          <div>
            <label className="form-label">Current Location / Storage</label>
            <input type="text" value={formData.currentLocation || formData.location || ""} onChange={(e) => {
              updateFormField("currentLocation", e.target.value);
              updateFormField("location", e.target.value);
            }} className="form-input" placeholder="e.g. Bank Locker No 12" />
          </div>
          <div>
            <label className="form-label">Approximate Purchase Year</label>
            <input type="text" value={formData.approximatePurchaseYear || ""} onChange={(e) => updateFormField("approximatePurchaseYear", e.target.value)} className="form-input" placeholder="e.g. 2021" />
          </div>
          <div>
            <label className="form-label">Owner</label>
            <input type="text" value={formData.owner || ""} onChange={(e) => updateFormField("owner", e.target.value)} className="form-input" placeholder="Owner Name" />
          </div>
          <div>
            <label className="form-label">Estimated Value <span style={{ color: "var(--danger)" }}>*</span></label>
            <input type="text" value={formData.amount || ""} onChange={(e) => updateFormField("amount", e.target.value)} className="form-input" placeholder="e.g. ₹3,50,000" required />
          </div>
          <div>
            <label className="form-label">Nominee Name <span style={{ color: "var(--danger)" }}>*</span></label>
            <input type="text" value={formData.nomineeName || ""} onChange={(e) => updateFormField("nomineeName", e.target.value)} className="form-input" placeholder="Nominee" required />
          </div>
          <div className="form-field-full">
            <label className="form-label">What should my nominee know?</label>
            <textarea value={formData.nomineeKnow || ""} onChange={(e) => updateFormField("nomineeKnow", e.target.value)} className="form-textarea" placeholder="Enter instructions for nominee..." rows={4} />
          </div>
        </div>
      );

    case "vehicle_details":
      return (
        <div className="form-grid form-grid-3">
          <div>
            <label className="form-label">Vehicle Type (Car/Bike etc.)</label>
            <input type="text" value={formData.vehicleType || ""} onChange={(e) => updateFormField("vehicleType", e.target.value)} className="form-input" placeholder="e.g. Car, Motorcycle" />
          </div>
          <div>
            <label className="form-label">Vehicle Model (Asset Title) <span style={{ color: "var(--danger)" }}>*</span></label>
            <input type="text" value={formData.assetTitle || ""} onChange={(e) => updateFormField("assetTitle", e.target.value)} className="form-input" placeholder="e.g. Honda City" required />
          </div>
          <div>
            <label className="form-label">Registration / Plate No <span style={{ color: "var(--danger)" }}>*</span></label>
            <input 
              type="text" 
              value={formData.registrationNo || ""} 
              onChange={(e) => updateFormField("registrationNo", e.target.value.toUpperCase())} 
              className="form-input" 
              placeholder="e.g. MH-12-AB-1234" 
              required 
              style={{ textTransform: "uppercase" }}
            />
          </div>
          <div>
            <label className="form-label">Insurance Company</label>
            <input type="text" value={formData.insuranceCompany || ""} onChange={(e) => updateFormField("insuranceCompany", e.target.value)} className="form-input" placeholder="Insurance Provider" />
          </div>
          <div>
            <label className="form-label">RC Location</label>
            <input type="text" value={formData.rcLocation || ""} onChange={(e) => updateFormField("rcLocation", e.target.value)} className="form-input" placeholder="RC Book Location" />
          </div>
          <div>
            <label className="form-label">Primary Driver</label>
            <input type="text" value={formData.primaryDriver || ""} onChange={(e) => updateFormField("primaryDriver", e.target.value)} className="form-input" placeholder="Primary Driver" />
          </div>
          <div>
            <label className="form-label">Estimated Value <span style={{ color: "var(--danger)" }}>*</span></label>
            <input type="text" value={formData.amount || ""} onChange={(e) => updateFormField("amount", e.target.value)} className="form-input" placeholder="e.g. ₹6,00,000" required />
          </div>
          <div>
            <label className="form-label">Nominee Name <span style={{ color: "var(--danger)" }}>*</span></label>
            <input type="text" value={formData.nomineeName || ""} onChange={(e) => updateFormField("nomineeName", e.target.value)} className="form-input" placeholder="Nominee" required />
          </div>
          <div className="form-field-full">
            <label className="form-label">What should my nominee know?</label>
            <textarea value={formData.nomineeKnow || ""} onChange={(e) => updateFormField("nomineeKnow", e.target.value)} className="form-textarea" placeholder="Enter instructions for nominee..." rows={4} />
          </div>
        </div>
      );

    case "bank_locker":
      return (
        <div className="form-grid form-grid-3">
          <div>
            <label className="form-label">Bank Name (Asset Title) <span style={{ color: "var(--danger)" }}>*</span></label>
            <input type="text" value={formData.bankName || formData.assetTitle || ""} onChange={(e) => {
              updateFormField("bankName", e.target.value);
              updateFormField("assetTitle", e.target.value);
            }} className="form-input" placeholder="e.g. HDFC Bank" required />
          </div>
          <div>
            <label className="form-label">Branch</label>
            <input type="text" value={formData.branch || ""} onChange={(e) => updateFormField("branch", e.target.value)} className="form-input" placeholder="Branch Name" />
          </div>
          <div>
            <label className="form-label">Locker Number <span style={{ color: "var(--danger)" }}>*</span></label>
            <input type="text" value={formData.lockerNumber || formData.lockerNo || ""} onChange={(e) => {
              updateFormField("lockerNumber", e.target.value);
              updateFormField("lockerNo", e.target.value);
            }} className="form-input" placeholder="Locker Number" required />
          </div>
          <div>
            <label className="form-label">Key Location</label>
            <input type="text" value={formData.keyLocation || ""} onChange={(e) => updateFormField("keyLocation", e.target.value)} className="form-input" placeholder="Key Location" />
          </div>
          <div>
            <label className="form-label">Joint Holder</label>
            <input type="text" value={formData.jointHolder || ""} onChange={(e) => updateFormField("jointHolder", e.target.value)} className="form-input" placeholder="Joint Holder Name" />
          </div>
          <div>
            <label className="form-label">Nominee Name <span style={{ color: "var(--danger)" }}>*</span></label>
            <input type="text" value={formData.nomineeName || ""} onChange={(e) => updateFormField("nomineeName", e.target.value)} className="form-input" placeholder="Nominee" required />
          </div>
          <div>
            <label className="form-label">Annual Rent / Value (Optional)</label>
            <input type="text" value={formData.amount || ""} onChange={(e) => updateFormField("amount", e.target.value)} className="form-input" placeholder="e.g. ₹5,00,000" />
          </div>
          <div className="form-field-full">
            <label className="form-label">What should my nominee know?</label>
            <textarea value={formData.nomineeKnow || ""} onChange={(e) => updateFormField("nomineeKnow", e.target.value)} className="form-textarea" placeholder="Enter instructions for nominee..." rows={4} />
          </div>
        </div>
      );

    case "membership_details":
      return (
        <div className="form-grid form-grid-3">
          <div>
            <label className="form-label">Membership Name (Asset Title) <span style={{ color: "var(--danger)" }}>*</span></label>
            <input type="text" value={formData.membershipName || formData.assetTitle || ""} onChange={(e) => {
              updateFormField("membershipName", e.target.value);
              updateFormField("assetTitle", e.target.value);
            }} className="form-input" placeholder="e.g. Country Club" required />
          </div>
          <div>
            <label className="form-label">Membership Number <span style={{ color: "var(--danger)" }}>*</span></label>
            <input type="text" value={formData.membershipNumber || formData.membershipId || ""} onChange={(e) => {
              updateFormField("membershipNumber", e.target.value);
              updateFormField("membershipId", e.target.value);
            }} className="form-input" placeholder="Membership ID Number" required />
          </div>
          <div>
            <label className="form-label">Organization</label>
            <input type="text" value={formData.organization || ""} onChange={(e) => updateFormField("organization", e.target.value)} className="form-input" placeholder="Organization" />
          </div>
          <div>
            <label className="form-label">Renewal Date</label>
            <input type="text" value={formData.renewalDate || ""} onChange={(e) => updateFormField("renewalDate", e.target.value)} className="form-input" placeholder="Renewal Date" />
          </div>
          <div>
            <label className="form-label">Contact Person</label>
            <input type="text" value={formData.contactPerson || ""} onChange={(e) => updateFormField("contactPerson", e.target.value)} className="form-input" placeholder="Contact Person" />
          </div>
          <div>
            <label className="form-label">Nominee Name / Beneficiary <span style={{ color: "var(--danger)" }}>*</span></label>
            <input type="text" value={formData.nomineeName || ""} onChange={(e) => updateFormField("nomineeName", e.target.value)} className="form-input" placeholder="Nominee" required />
          </div>
          <div>
            <label className="form-label">Value / Fee (Optional)</label>
            <input type="text" value={formData.amount || ""} onChange={(e) => updateFormField("amount", e.target.value)} className="form-input" placeholder="e.g. ₹1,00,000" />
          </div>
          <div className="form-field-full">
            <label className="form-label">What should my nominee know?</label>
            <textarea value={formData.nomineeKnow || ""} onChange={(e) => updateFormField("nomineeKnow", e.target.value)} className="form-textarea" placeholder="Enter instructions for nominee..." rows={4} />
          </div>
        </div>
      );

    case "liabilities_details":
      return (
        <div className="form-grid form-grid-3">
          <div>
            <label className="form-label">Liability Type</label>
            <input type="text" value={formData.liabilityType || ""} onChange={(e) => updateFormField("liabilityType", e.target.value)} className="form-input" placeholder="e.g. Home Loan, Personal Loan" />
          </div>
          <div>
            <label className="form-label">Institution / Lender (Asset Title) <span style={{ color: "var(--danger)" }}>*</span></label>
            <input type="text" value={formData.institutionLender || formData.assetTitle || ""} onChange={(e) => {
              updateFormField("institutionLender", e.target.value);
              updateFormField("assetTitle", e.target.value);
            }} className="form-input" placeholder="e.g. SBI Bank" required />
          </div>
          <div>
            <label className="form-label">Loan Account Number</label>
            <input type="text" value={formData.loanAccountNumber || ""} onChange={(e) => updateFormField("loanAccountNumber", e.target.value)} className="form-input" placeholder="Loan Account No" />
          </div>
          <div>
            <label className="form-label">EMI From Bank</label>
            <input type="text" value={formData.emiFromBank || ""} onChange={(e) => updateFormField("emiFromBank", e.target.value)} className="form-input" placeholder="Paying Bank Account Details" />
          </div>
          <div>
            <label className="form-label">Co-borrower</label>
            <input type="text" value={formData.coBorrower || ""} onChange={(e) => updateFormField("coBorrower", e.target.value)} className="form-input" placeholder="Co-borrower Name (if any)" />
          </div>
          <div>
            <label className="form-label">Outstanding Amount <span style={{ color: "var(--danger)" }}>*</span></label>
            <input type="text" value={formData.amount || ""} onChange={(e) => updateFormField("amount", e.target.value)} className="form-input" placeholder="e.g. ₹25,00,000" required />
          </div>
          <div>
            <label className="form-label">Nominee / Co-borrower Name <span style={{ color: "var(--danger)" }}>*</span></label>
            <input type="text" value={formData.nomineeName || ""} onChange={(e) => updateFormField("nomineeName", e.target.value)} className="form-input" placeholder="Co-borrower or contact" required />
          </div>
          <div>
            <label className="form-label">Due Date / EMI Date</label>
            <input type="text" value={formData.dueDate || ""} onChange={(e) => updateFormField("dueDate", e.target.value)} className="form-input" placeholder="e.g. 5th of every month" />
          </div>
          <div className="form-field-full">
            <label className="form-label">What should my nominee know?</label>
            <textarea value={formData.nomineeKnow || ""} onChange={(e) => updateFormField("nomineeKnow", e.target.value)} className="form-textarea" placeholder="Enter instructions for nominee..." rows={4} />
          </div>
        </div>
      );

    case "will_document":
      return (
        <div className="form-grid form-grid-3">
          <div>
            <label className="form-label">Will Title (Asset Title) <span style={{ color: "var(--danger)" }}>*</span></label>
            <input type="text" value={formData.assetTitle || ""} onChange={(e) => updateFormField("assetTitle", e.target.value)} className="form-input" placeholder="e.g. Main Will 2026" required />
          </div>
          <div>
            <label className="form-label">Will Exists (Yes/No)</label>
            <select value={formData.willExists || "Yes"} onChange={(e) => updateFormField("willExists", e.target.value)} className="form-select">
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>
          <div>
            <label className="form-label">Physical / Original Location <span style={{ color: "var(--danger)" }}>*</span></label>
            <input type="text" value={formData.originalLocation || formData.location || ""} onChange={(e) => {
              updateFormField("originalLocation", e.target.value);
              updateFormField("location", e.target.value);
            }} className="form-input" placeholder="e.g. Lawyer's Office Safe" required />
          </div>
          <div>
            <label className="form-label">Executor Name <span style={{ color: "var(--danger)" }}>*</span></label>
            <input type="text" value={formData.executorName || formData.nomineeName || ""} onChange={(e) => {
              updateFormField("executorName", e.target.value);
              updateFormField("nomineeName", e.target.value);
            }} className="form-input" placeholder="Executor Name" required />
          </div>
          <div>
            <label className="form-label">Lawyer Name</label>
            <input type="text" value={formData.lawyerName || ""} onChange={(e) => updateFormField("lawyerName", e.target.value)} className="form-input" placeholder="Lawyer Name & Contact" />
          </div>
          <div>
            <label className="form-label">Date of Will / Revision</label>
            <input 
              type="text" 
              value={formData.willDate || ""} 
              onChange={(e) => handleDateChange("willDate", e.target.value)} 
              className="form-input" 
              placeholder="DD/MM/YY" 
              pattern="^(0[1-9]|[12]\d|3[01])/(0[1-9]|1[0-2])/\d{2}$"
              maxLength={8}
              title="Date of Will must be in DD/MM/YY format (e.g. 25/12/26)"
            />
          </div>
          <div className="form-field-full">
            <label className="form-label">What should my nominee know?</label>
            <textarea value={formData.nomineeKnow || ""} onChange={(e) => updateFormField("nomineeKnow", e.target.value)} className="form-textarea" placeholder="Enter instructions for nominee..." rows={4} />
          </div>
        </div>
      );

    case "trust_document":
      return (
        <div className="form-grid form-grid-3">
          <div>
            <label className="form-label">Trust Name (Asset Title) <span style={{ color: "var(--danger)" }}>*</span></label>
            <input type="text" value={formData.trustName || formData.assetTitle || ""} onChange={(e) => {
              updateFormField("trustName", e.target.value);
              updateFormField("assetTitle", e.target.value);
            }} className="form-input" placeholder="e.g. Family Welfare Trust" required />
          </div>
          <div>
            <label className="form-label">Trustee Name <span style={{ color: "var(--danger)" }}>*</span></label>
            <input type="text" value={formData.trusteeName || formData.nomineeName || ""} onChange={(e) => {
              updateFormField("trusteeName", e.target.value);
              updateFormField("nomineeName", e.target.value);
            }} className="form-input" placeholder="Trustee Name" required />
          </div>
          <div>
            <label className="form-label">Trust Date</label>
            <input type="text" value={formData.trustDate || ""} onChange={(e) => updateFormField("trustDate", e.target.value)} className="form-input" placeholder="Trust Creation Date" />
          </div>
          <div>
            <label className="form-label">Document Location <span style={{ color: "var(--danger)" }}>*</span></label>
            <input type="text" value={formData.documentLocation || formData.location || ""} onChange={(e) => {
              updateFormField("documentLocation", e.target.value);
              updateFormField("location", e.target.value);
            }} className="form-input" placeholder="Physical location of deed" required />
          </div>
          <div>
            <label className="form-label">Registration ID / Code</label>
            <input type="text" value={formData.registrationId || ""} onChange={(e) => updateFormField("registrationId", e.target.value)} className="form-input" placeholder="Registration ID" />
          </div>
          <div>
            <label className="form-label">Lawyer Name</label>
            <input type="text" value={formData.lawyerName || ""} onChange={(e) => updateFormField("lawyerName", e.target.value)} className="form-input" placeholder="Lawyer Name & Contact" />
          </div>
          <div>
            <label className="form-label">Trust Asset Value (Optional)</label>
            <input type="text" value={formData.amount || ""} onChange={(e) => updateFormField("amount", e.target.value)} className="form-input" placeholder="e.g. ₹50,00,000" />
          </div>
          <div className="form-field-full">
            <label className="form-label">What should my nominee know?</label>
            <textarea value={formData.nomineeKnow || ""} onChange={(e) => updateFormField("nomineeKnow", e.target.value)} className="form-textarea" placeholder="Enter instructions for nominee..." rows={4} />
          </div>
        </div>
      );

    case "website_credentials":
      return (
        <div className="form-grid form-grid-3">
          <div>
            <label className="form-label">Website / App Name (Asset Title) <span style={{ color: "var(--danger)" }}>*</span></label>
            <input type="text" value={formData.websiteAppName || formData.assetTitle || ""} onChange={(e) => {
              updateFormField("websiteAppName", e.target.value);
              updateFormField("assetTitle", e.target.value);
            }} className="form-input" placeholder="e.g. Upstox Portal" required />
          </div>
          <div>
            <label className="form-label">Username / Email <span style={{ color: "var(--danger)" }}>*</span></label>
            <input type="text" value={formData.usernameEmail || formData.username || ""} onChange={(e) => {
              updateFormField("usernameEmail", e.target.value);
              updateFormField("username", e.target.value);
            }} className="form-input" placeholder="Login username or email" required />
          </div>
          <div>
            <label className="form-label">Purpose</label>
            <input type="text" value={formData.purpose || ""} onChange={(e) => updateFormField("purpose", e.target.value)} className="form-input" placeholder="e.g. Stocks trading, Crypto wallet" />
          </div>
          <div>
            <label className="form-label">Recovery Email / Mobile</label>
            <input type="text" value={formData.recoveryEmailMobile || ""} onChange={(e) => updateFormField("recoveryEmailMobile", e.target.value)} className="form-input" placeholder="Recovery Contact Info" />
          </div>
          <div>
            <label className="form-label">Recovery Method Location</label>
            <input type="text" value={formData.recoveryMethodLocation || ""} onChange={(e) => updateFormField("recoveryMethodLocation", e.target.value)} className="form-input" placeholder="e.g. Hard drive, physical locker" />
          </div>
          <div>
            <label className="form-label">Website URL / Link (Optional)</label>
            <input 
              type="text" 
              value={formData.websiteUrl || ""} 
              onChange={(e) => updateFormField("websiteUrl", e.target.value)} 
              className="form-input" 
              placeholder="e.g. https://upstox.com" 
            />
          </div>
          <div>
            <label className="form-label">Nominee / Recipient Name <span style={{ color: "var(--danger)" }}>*</span></label>
            <input type="text" value={formData.nomineeName || ""} onChange={(e) => updateFormField("nomineeName", e.target.value)} className="form-input" placeholder="Who should receive this" required />
          </div>
          <div>
            <label className="form-label">Associated Value (Optional)</label>
            <input type="text" value={formData.amount || ""} onChange={(e) => updateFormField("amount", e.target.value)} className="form-input" placeholder="Portfolio/Wallet value" />
          </div>
          <div className="form-field-full">
            <label className="form-label">Password / Access Hints (Notes) <span style={{ color: "var(--danger)" }}>*</span></label>
            <textarea value={formData.notes || ""} onChange={(e) => updateFormField("notes", e.target.value)} className="form-textarea" placeholder="Warning: Write hints rather than plaintext passwords for better security." rows={4} required />
          </div>
          <div className="form-field-full">
            <label className="form-label">What should my nominee know?</label>
            <textarea value={formData.nomineeKnow || ""} onChange={(e) => updateFormField("nomineeKnow", e.target.value)} className="form-textarea" placeholder="Enter instructions for nominee..." rows={4} />
          </div>
        </div>
      );

    case "business_interests":
      return (
        <div className="form-grid form-grid-3">
          <div>
            <label className="form-label">Business Name <span style={{ color: "var(--danger)" }}>*</span></label>
            <input type="text" value={formData.businessName || formData.assetTitle || ""} onChange={(e) => {
              updateFormField("businessName", e.target.value);
              updateFormField("assetTitle", e.target.value);
            }} className="form-input" placeholder="e.g. Tech Solutions LLP" required />
          </div>
          <div>
            <label className="form-label">Ownership Type <span style={{ color: "var(--danger)" }}>*</span></label>
            <input type="text" value={formData.ownershipType || ""} onChange={(e) => updateFormField("ownershipType", e.target.value)} className="form-input" placeholder="e.g. Sole Proprietorship, LLP, Pvt Ltd" required />
          </div>
          <div>
            <label className="form-label">Your Role <span style={{ color: "var(--danger)" }}>*</span></label>
            <input type="text" value={formData.yourRole || ""} onChange={(e) => updateFormField("yourRole", e.target.value)} className="form-input" placeholder="e.g. Partner, Director, Owner" required />
          </div>
          <div>
            <label className="form-label">Partner/Director Contact</label>
            <input type="text" value={formData.partnerDirectorContact || ""} onChange={(e) => updateFormField("partnerDirectorContact", e.target.value)} className="form-input" placeholder="Partner Name & Contact" />
          </div>
          <div>
            <label className="form-label">Business Address</label>
            <input type="text" value={formData.businessAddress || ""} onChange={(e) => updateFormField("businessAddress", e.target.value)} className="form-input" placeholder="Business Address" />
          </div>
          <div className="form-field-full">
            <label className="form-label">What should my nominee know?</label>
            <textarea value={formData.nomineeKnow || ""} onChange={(e) => updateFormField("nomineeKnow", e.target.value)} className="form-textarea" placeholder="Enter instructions for nominee..." rows={4} />
          </div>
        </div>
      );

    case "recurring_income":
      return (
        <div className="form-grid form-grid-3">
          <div>
            <label className="form-label">Income Source <span style={{ color: "var(--danger)" }}>*</span></label>
            <input type="text" value={formData.incomeSource || formData.assetTitle || ""} onChange={(e) => {
              updateFormField("incomeSource", e.target.value);
              updateFormField("assetTitle", e.target.value);
            }} className="form-input" placeholder="e.g. Rental Income, Salary" required />
          </div>
          <div>
            <label className="form-label">Organization/Person <span style={{ color: "var(--danger)" }}>*</span></label>
            <input type="text" value={formData.organizationPerson || ""} onChange={(e) => updateFormField("organizationPerson", e.target.value)} className="form-input" placeholder="Source Provider Name" required />
          </div>
          <div>
            <label className="form-label">Frequency <span style={{ color: "var(--danger)" }}>*</span></label>
            <input type="text" value={formData.frequency || ""} onChange={(e) => updateFormField("frequency", e.target.value)} className="form-input" placeholder="e.g. Monthly, Quarterly" required />
          </div>
          <div>
            <label className="form-label">Receiving Bank Account</label>
            <input type="text" value={formData.receivingBankAccount || ""} onChange={(e) => updateFormField("receivingBankAccount", e.target.value)} className="form-input" placeholder="e.g. HDFC Savings a/c *1234" />
          </div>
          <div>
            <label className="form-label">Contact Person</label>
            <input type="text" value={formData.contactPerson || ""} onChange={(e) => updateFormField("contactPerson", e.target.value)} className="form-input" placeholder="Contact details" />
          </div>
          <div className="form-field-full">
            <label className="form-label">What should my nominee know?</label>
            <textarea value={formData.nomineeKnow || ""} onChange={(e) => updateFormField("nomineeKnow", e.target.value)} className="form-textarea" placeholder="Enter instructions for nominee..." rows={4} />
          </div>
        </div>
      );

    case "recurring_payments":
      return (
        <div className="form-grid form-grid-3">
          <div>
            <label className="form-label">Payment Name <span style={{ color: "var(--danger)" }}>*</span></label>
            <input type="text" value={formData.paymentName || formData.assetTitle || ""} onChange={(e) => {
              updateFormField("paymentName", e.target.value);
              updateFormField("assetTitle", e.target.value);
            }} className="form-input" placeholder="e.g. Home Loan EMI, Netflix" required />
          </div>
          <div>
            <label className="form-label">Payment Type (EMI/SIP/Subscription etc.) <span style={{ color: "var(--danger)" }}>*</span></label>
            <input type="text" value={formData.paymentType || ""} onChange={(e) => updateFormField("paymentType", e.target.value)} className="form-input" placeholder="e.g. EMI, SIP, Subscription" required />
          </div>
          <div>
            <label className="form-label">Debit Bank Account</label>
            <input type="text" value={formData.debitBankAccount || ""} onChange={(e) => updateFormField("debitBankAccount", e.target.value)} className="form-input" placeholder="e.g. SBI Account *5678" />
          </div>
          <div>
            <label className="form-label">Frequency</label>
            <input type="text" value={formData.frequency || ""} onChange={(e) => updateFormField("frequency", e.target.value)} className="form-input" placeholder="e.g. Monthly" />
          </div>
          <div>
            <label className="form-label">Auto Debit Enabled (Yes/No)</label>
            <select value={formData.autoDebitEnabled || "Yes"} onChange={(e) => updateFormField("autoDebitEnabled", e.target.value)} className="form-select">
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>
          <div className="form-field-full">
            <label className="form-label">What should my nominee know?</label>
            <textarea value={formData.nomineeKnow || ""} onChange={(e) => updateFormField("nomineeKnow", e.target.value)} className="form-textarea" placeholder="Enter instructions for nominee..." rows={4} />
          </div>
        </div>
      );

    default:
      // Generic fallback form for instruments with unlisted/simple shapes
      return (
        <div className="form-grid form-grid-3">
          <div className="form-field-full">
            <label className="form-label">Asset Title / Label <span style={{ color: "var(--danger)" }}>*</span></label>
            <input type="text" value={formData.propertyName || formData.personName || formData.assetTitle || ""} onChange={(e) => updateFormField("assetTitle", e.target.value)} className="form-input" placeholder="Name or title" required />
          </div>
          <div className="form-field-full">
            <label className="form-label">Detailed Description / Instructions <span style={{ color: "var(--danger)" }}>*</span></label>
            <textarea value={formData.notes || ""} onChange={(e) => updateFormField("notes", e.target.value)} className="form-textarea" placeholder="Explain details here..." rows={6} required />
          </div>
        </div>
      );
  }
}
