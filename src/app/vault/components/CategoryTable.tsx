"use client";

import React from "react";
import { Eye, Trash2 } from "lucide-react";
import { VaultFileEntry, INSTRUMENT_TYPES, useVault } from "./VaultContext";

interface CategoryTableProps {
  categoryId: string;
  entries: VaultFileEntry[];
  onView: (entry: VaultFileEntry) => void;
  onDelete: (entry: VaultFileEntry) => void;
}

export default function CategoryTable({ categoryId, entries, onView, onDelete }: CategoryTableProps) {
  const { readOnly } = useVault();
  const currentInfo = INSTRUMENT_TYPES.find((i) => i.id === categoryId);
  if (!currentInfo) return null;

  const renderCellContent = (entry: VaultFileEntry, col: string, index: number) => {
    const details = entry.details || {};

    if (col === "Sr No") return index + 1;
    if (col === "Actions") {
      return (
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={() => onView(entry)} className="btn-outline" style={{ padding: "4px 8px", fontSize: "12px", display: "flex", alignItems: "center", gap: "4px" }}>
            <Eye size={12} />
            <span>View</span>
          </button>
          {!readOnly && (
            <button onClick={() => onDelete(entry)} className="btn-pink" style={{ padding: "4px 8px", fontSize: "12px" }}>
              <Trash2 size={12} />
            </button>
          )}
        </div>
      );
    }
    if (col === "Created At") {
      const d = new Date(entry.createdAt);
      if (isNaN(d.getTime())) return "N/A";
      const pad = (n: number) => String(n).padStart(2, "0");
      const dd = pad(d.getDate());
      const mm = pad(d.getMonth() + 1);
      const yy = String(d.getFullYear()).slice(-2);
      return `${dd}/${mm}/${yy}`;
    }

    // Mapping columns to entry details
    if (col === "Person Type") return details.personType || "Executor";
    if (col === "Name") return details.personName || entry.name;
    if (col === "Contact No") return details.contactNo || "N/A";
    if (col === "Email") return details.email || "N/A";

    if (col === "Property Name") return details.propertyName || entry.name;
    if (col === "Address") return details.propertyAddress || details.walletAddress || "N/A";
    if (col === "Owner") return details.ownerName || "Self";
    if (col === "Value") return details.propertyValue || details.amount || "N/A";

    if (col === "DP Name" || col === "Broker Name" || col === "Fund House" || col === "Bank Name" || col === "Issuer" || col === "Exchange/Wallet" || col === "Wallet Name") {
      return details.dpName || details.brokerName || details.fundHouse || details.bankName || details.issuerName || details.exchangeWallet || details.walletName || entry.name;
    }
    if (col === "Client ID" || col === "Client UCC" || col === "Folio No" || col === "Account No" || col === "UAN/Account" || col === "Receipt No" || col === "Cert No" || col === "Linked Mobile No") {
      return details.clientId || details.clientUcc || details.folioNo || details.accountNo || details.uanNumber || details.receiptNo || details.certNo || details.linkedMobile || "N/A";
    }
    if (col === "Scheme" || col === "Type" || col === "Coin") {
      return details.schemeName || details.accountType || details.coinToken || "N/A";
    }
    if (col === "Nominee") return details.nomineeName || "None";
    if (col === "Amount") return details.amount || details.propertyValue || "N/A";
    if (col === "Maturity") return details.maturityDate || "N/A";
    if (col === "Blockchain") return details.blockchain || "Ethereum";
    if (col === "NFT Name") return details.nftName || entry.name;
    if (col === "Collection") return details.collectionName || "N/A";

    if (col === "Provider") return details.providerName || "N/A";
    if (col === "Company") return details.companyName || "N/A";
    if (col === "Startup Name") return details.startupName || "N/A";
    if (col === "Equity %") return details.equityPercent || "N/A";
    if (col === "Investment") return details.amount || "N/A";
    if (col === "Asset Title") return details.assetTitle || entry.name;
    if (col === "Fund Name") return details.fundName || "N/A";
    if (col === "Investment Code") return details.investmentCode || "N/A";

    // New categories columns
    if (col === "Business Name") return details.businessName || entry.name;
    if (col === "Ownership Type") return details.ownershipType || "N/A";
    if (col === "Your Role") return details.yourRole || "N/A";
    if (col === "Partner/Director Contact") return details.partnerDirectorContact || "N/A";
    
    if (col === "Income Source") return details.incomeSource || entry.name;
    if (col === "Organization/Person") return details.organizationPerson || "N/A";
    if (col === "Frequency") return details.frequency || "N/A";
    if (col === "Receiving Bank Account") return details.receivingBankAccount || "N/A";
    
    if (col === "Payment Name") return details.paymentName || entry.name;
    if (col === "Payment Type") return details.paymentType || "N/A";
    if (col === "Debit Bank Account") return details.debitBankAccount || "N/A";
    if (col === "Auto Debit Enabled") return details.autoDebitEnabled || "N/A";

    return "N/A";
  };

  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            {currentInfo.columns.map((col) => (
              <th key={col}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, idx) => (
            <tr key={entry.id}>
              {currentInfo.columns.map((col) => (
                <td key={col}>{renderCellContent(entry, col, idx)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
