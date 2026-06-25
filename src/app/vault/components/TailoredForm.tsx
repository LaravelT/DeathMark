"use client";

import React from "react";

interface TailoredFormProps {
  categoryId: string;
  formData: Record<string, string>;
  updateFormField: (key: string, value: string) => void;
}

export default function TailoredForm({ categoryId, formData, updateFormField }: TailoredFormProps) {
  switch (categoryId) {
    case "emergency_contact":
      return (
        <div className="form-grid form-grid-3">
          <div>
            <label className="form-label">Select Person Type</label>
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
            <label className="form-label">Person Name</label>
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
            <label className="form-label">Person Contact No</label>
            <input 
              type="text" 
              value={formData.contactNo || ""} 
              onChange={(e) => updateFormField("contactNo", e.target.value)} 
              className="form-input" 
              placeholder="Enter Person Contact No" 
              required 
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
          <div className="form-field-full">
            <label className="form-label">Additional Notes</label>
            <textarea 
              value={formData.notes || ""} 
              onChange={(e) => updateFormField("notes", e.target.value)} 
              className="form-textarea" 
              placeholder="Enter Here.." 
              rows={4}
            />
          </div>
        </div>
      );

    case "real_estate":
      return (
        <div className="form-grid form-grid-3">
          <div>
            <label className="form-label">Property Name</label>
            <input type="text" value={formData.propertyName || ""} onChange={(e) => updateFormField("propertyName", e.target.value)} className="form-input" placeholder="e.g. Landmark Apartment" required />
          </div>
          <div>
            <label className="form-label">Owner Name</label>
            <input type="text" value={formData.ownerName || ""} onChange={(e) => updateFormField("ownerName", e.target.value)} className="form-input" placeholder="Owner name" required />
          </div>
          <div>
            <label className="form-label">Estimated Value</label>
            <input type="text" value={formData.propertyValue || ""} onChange={(e) => updateFormField("propertyValue", e.target.value)} className="form-input" placeholder="e.g. $250,000" />
          </div>
          <div className="form-field-full">
            <label className="form-label">Property Address</label>
            <input type="text" value={formData.propertyAddress || ""} onChange={(e) => updateFormField("propertyAddress", e.target.value)} className="form-input" placeholder="Enter Address details" required />
          </div>
          <div className="form-field-full">
            <label className="form-label">Additional Notes</label>
            <textarea value={formData.notes || ""} onChange={(e) => updateFormField("notes", e.target.value)} className="form-textarea" placeholder="Enter Registration detail, registry date..." rows={4} />
          </div>
        </div>
      );

    case "demat_account":
    case "trading_account":
      const isDemat = categoryId === "demat_account";
      return (
        <div className="form-grid form-grid-3">
          <div>
            <label className="form-label">{isDemat ? "DP Name" : "Broker Name"}</label>
            <input type="text" value={isDemat ? formData.dpName || "" : formData.brokerName || ""} onChange={(e) => updateFormField(isDemat ? "dpName" : "brokerName", e.target.value)} className="form-input" placeholder={isDemat ? "e.g. Zerodha, NSDL" : "e.g. AngelOne, Groww"} required />
          </div>
          <div>
            <label className="form-label">{isDemat ? "DP ID / Client ID" : "Client UCC / Code"}</label>
            <input type="text" value={isDemat ? formData.clientId || "" : formData.clientUcc || ""} onChange={(e) => updateFormField(isDemat ? "clientId" : "clientUcc", e.target.value)} className="form-input" placeholder="Enter Account identifier" required />
          </div>
          <div>
            <label className="form-label">Nominee Name</label>
            <input type="text" value={formData.nomineeName || ""} onChange={(e) => updateFormField("nomineeName", e.target.value)} className="form-input" placeholder="Nominee" required />
          </div>
          <div className="form-field-full">
            <label className="form-label">Additional Notes</label>
            <textarea value={formData.notes || ""} onChange={(e) => updateFormField("notes", e.target.value)} className="form-textarea" placeholder="E.g. Link to access, special instructions..." rows={4} />
          </div>
        </div>
      );

    case "mutual_fund":
      return (
        <div className="form-grid form-grid-3">
          <div>
            <label className="form-label">Fund House / AMC</label>
            <input type="text" value={formData.fundHouse || ""} onChange={(e) => updateFormField("fundHouse", e.target.value)} className="form-input" placeholder="e.g. SBI Mutual Fund" required />
          </div>
          <div>
            <label className="form-label">Folio Number</label>
            <input type="text" value={formData.folioNo || ""} onChange={(e) => updateFormField("folioNo", e.target.value)} className="form-input" placeholder="Enter Folio number" required />
          </div>
          <div>
            <label className="form-label">Scheme Name</label>
            <input type="text" value={formData.schemeName || ""} onChange={(e) => updateFormField("schemeName", e.target.value)} className="form-input" placeholder="e.g. Bluechip Growth Fund" required />
          </div>
          <div>
            <label className="form-label">Units (Optional)</label>
            <input type="text" value={formData.holdingUnits || ""} onChange={(e) => updateFormField("holdingUnits", e.target.value)} className="form-input" placeholder="Number of units" />
          </div>
          <div>
            <label className="form-label">Nominee Name</label>
            <input type="text" value={formData.nomineeName || ""} onChange={(e) => updateFormField("nomineeName", e.target.value)} className="form-input" placeholder="Nominee name" />
          </div>
          <div className="form-field-full">
            <label className="form-label">Additional Notes</label>
            <textarea value={formData.notes || ""} onChange={(e) => updateFormField("notes", e.target.value)} className="form-textarea" placeholder="Enter instructions..." rows={4} />
          </div>
        </div>
      );

    case "bank_account":
      return (
        <div className="form-grid form-grid-3">
          <div>
            <label className="form-label">Bank Name</label>
            <input type="text" value={formData.bankName || ""} onChange={(e) => updateFormField("bankName", e.target.value)} className="form-input" placeholder="e.g. HDFC Bank" required />
          </div>
          <div>
            <label className="form-label">Account Number</label>
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
            <input type="text" value={formData.ifscCode || ""} onChange={(e) => updateFormField("ifscCode", e.target.value)} className="form-input" placeholder="IFSC Code" />
          </div>
          <div>
            <label className="form-label">Nominee Name</label>
            <input type="text" value={formData.nomineeName || ""} onChange={(e) => updateFormField("nomineeName", e.target.value)} className="form-input" placeholder="Nominee registered" required />
          </div>
          <div className="form-field-full">
            <label className="form-label">Additional Notes</label>
            <textarea value={formData.notes || ""} onChange={(e) => updateFormField("notes", e.target.value)} className="form-textarea" placeholder="Online credentials, debit card info..." rows={4} />
          </div>
        </div>
      );

    case "fixed_deposits":
      return (
        <div className="form-grid form-grid-3">
          <div>
            <label className="form-label">Bank Name</label>
            <input type="text" value={formData.bankName || ""} onChange={(e) => updateFormField("bankName", e.target.value)} className="form-input" placeholder="e.g. ICICI Bank" required />
          </div>
          <div>
            <label className="form-label">Receipt Number</label>
            <input type="text" value={formData.receiptNo || ""} onChange={(e) => updateFormField("receiptNo", e.target.value)} className="form-input" placeholder="FD Number" required />
          </div>
          <div>
            <label className="form-label">FD Principal Amount</label>
            <input type="text" value={formData.amount || ""} onChange={(e) => updateFormField("amount", e.target.value)} className="form-input" placeholder="Amount deposited" required />
          </div>
          <div>
            <label className="form-label">Maturity Date</label>
            <input type="date" value={formData.maturityDate || ""} onChange={(e) => updateFormField("maturityDate", e.target.value)} className="form-input" />
          </div>
          <div>
            <label className="form-label">Nominee Name</label>
            <input type="text" value={formData.nomineeName || ""} onChange={(e) => updateFormField("nomineeName", e.target.value)} className="form-input" placeholder="Nominee" required />
          </div>
          <div className="form-field-full">
            <label className="form-label">Additional Notes</label>
            <textarea value={formData.notes || ""} onChange={(e) => updateFormField("notes", e.target.value)} className="form-textarea" placeholder="Interest rate, auto-renew status..." rows={4} />
          </div>
        </div>
      );

    case "crypto_currency":
      return (
        <div className="form-grid form-grid-3">
          <div>
            <label className="form-label">Exchange / Wallet Name</label>
            <input type="text" value={formData.exchangeWallet || ""} onChange={(e) => updateFormField("exchangeWallet", e.target.value)} className="form-input" placeholder="e.g. Ledger, Binance" required />
          </div>
          <div>
            <label className="form-label">Coin / Token Symbol</label>
            <input type="text" value={formData.coinToken || ""} onChange={(e) => updateFormField("coinToken", e.target.value)} className="form-input" placeholder="e.g. BTC, ETH" required />
          </div>
          <div>
            <label className="form-label">Wallet Public Address</label>
            <input type="text" value={formData.walletAddress || ""} onChange={(e) => updateFormField("walletAddress", e.target.value)} className="form-input" placeholder="0x..." />
          </div>
          <div className="form-field-full">
            <label className="form-label">Backup Seed Mnemonic (Notes)</label>
            <textarea value={formData.notes || ""} onChange={(e) => updateFormField("notes", e.target.value)} className="form-textarea" placeholder="Warning: Write your seed phrase here with caution. Make sure your vault password is secure." rows={4} />
          </div>
        </div>
      );

    case "bonds_certificates":
      return (
        <div className="form-grid form-grid-3">
          <div>
            <label className="form-label">Issuer Name</label>
            <input type="text" value={formData.issuerName || ""} onChange={(e) => updateFormField("issuerName", e.target.value)} className="form-input" placeholder="e.g. RBI, NHAI, Sovereign Gold Bonds" required />
          </div>
          <div>
            <label className="form-label">Certificate / Folio / Bond Ledger ID</label>
            <input type="text" value={formData.certNo || ""} onChange={(e) => updateFormField("certNo", e.target.value)} className="form-input" placeholder="Enter Certificate or Folio No" required />
          </div>
          <div>
            <label className="form-label">Investment Face Value / Amount</label>
            <input type="text" value={formData.amount || ""} onChange={(e) => updateFormField("amount", e.target.value)} className="form-input" placeholder="e.g. ₹50,000" required />
          </div>
          <div>
            <label className="form-label">Maturity Date (Optional)</label>
            <input type="date" value={formData.maturityDate || ""} onChange={(e) => updateFormField("maturityDate", e.target.value)} className="form-input" />
          </div>
          <div>
            <label className="form-label">Nominee Name</label>
            <input type="text" value={formData.nomineeName || ""} onChange={(e) => updateFormField("nomineeName", e.target.value)} className="form-input" placeholder="Nominee" required />
          </div>
          <div className="form-field-full">
            <label className="form-label">Additional Notes</label>
            <textarea value={formData.notes || ""} onChange={(e) => updateFormField("notes", e.target.value)} className="form-textarea" placeholder="E.g. Interest payout details, depository details..." rows={4} />
          </div>
        </div>
      );

    case "mobile_wallet":
      return (
        <div className="form-grid form-grid-3">
          <div>
            <label className="form-label">Wallet Name</label>
            <input type="text" value={formData.walletName || ""} onChange={(e) => updateFormField("walletName", e.target.value)} className="form-input" placeholder="e.g. Paytm, PhonePe, Google Pay" required />
          </div>
          <div>
            <label className="form-label">Linked Mobile Number</label>
            <input type="text" value={formData.linkedMobile || ""} onChange={(e) => updateFormField("linkedMobile", e.target.value)} className="form-input" placeholder="Enter linked mobile no" required />
          </div>
          <div>
            <label className="form-label">UPI ID (Optional)</label>
            <input type="text" value={formData.upiId || ""} onChange={(e) => updateFormField("upiId", e.target.value)} className="form-input" placeholder="e.g. name@okhdfc" />
          </div>
          <div>
            <label className="form-label">Nominee Name / Legal Successor</label>
            <input type="text" value={formData.nomineeName || ""} onChange={(e) => updateFormField("nomineeName", e.target.value)} className="form-input" placeholder="Nominee name" />
          </div>
          <div className="form-field-full">
            <label className="form-label">Additional Notes</label>
            <textarea value={formData.notes || ""} onChange={(e) => updateFormField("notes", e.target.value)} className="form-textarea" placeholder="E.g. Account limits, backup email..." rows={4} />
          </div>
        </div>
      );

    default:
      // Generic fallback form for instruments with unlisted/simple shapes
      return (
        <div className="form-grid form-grid-3">
          <div>
            <label className="form-label">Asset Title / Label</label>
            <input type="text" value={formData.propertyName || formData.personName || ""} onChange={(e) => updateFormField("propertyName", e.target.value)} className="form-input" placeholder="Name or title" required />
          </div>
          <div>
            <label className="form-label">Associated Nominee</label>
            <input type="text" value={formData.nomineeName || ""} onChange={(e) => updateFormField("nomineeName", e.target.value)} className="form-input" placeholder="Nominee or Custodian" />
          </div>
          <div>
            <label className="form-label">Holding Value / Amount</label>
            <input type="text" value={formData.amount || ""} onChange={(e) => updateFormField("amount", e.target.value)} className="form-input" placeholder="Value/Units" />
          </div>
          <div className="form-field-full">
            <label className="form-label">Detailed Description / Instructions</label>
            <textarea value={formData.notes || ""} onChange={(e) => updateFormField("notes", e.target.value)} className="form-textarea" placeholder="Explain details here..." rows={6} required />
          </div>
        </div>
      );
  }
}
