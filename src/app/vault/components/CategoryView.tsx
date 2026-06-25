"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PlusCircle, FolderKey, Trash2 } from "lucide-react";
import { useVault, INSTRUMENT_TYPES, VaultFileEntry } from "./VaultContext";
import CategoryTable from "./CategoryTable";
import TailoredForm from "./TailoredForm";

interface CategoryViewProps {
  categoryId: string;
}

export default function CategoryView({ categoryId }: CategoryViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const selectedId = searchParams.get("id");
  const action = searchParams.get("action");

  const {
    isDemo, vaultIndex, searchTerm,
    handleAddRecord, handleDeleteRecord
  } = useVault();

  // Local Component States
  const [formData, setFormData] = useState<Record<string, string>>({});

  const currentInfo = INSTRUMENT_TYPES.find(i => i.id === categoryId);

  // Clear local form states when switching categories
  useEffect(() => {
    setFormData({});
  }, [categoryId]);

  if (!currentInfo) {
    return (
      <div className="panel-card flex-center" style={{ padding: "40px" }}>
        <h3 style={{ color: "var(--danger)" }}>Category not found</h3>
      </div>
    );
  }

  // Filter and search entries
  const filteredFiles = vaultIndex.files.filter(f => f.category === categoryId);
  const searchedFiles = filteredFiles.filter(f => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const matchesName = f.name.toLowerCase().includes(term);
    const matchesDetails = Object.values(f.details || {}).some(v => v.toLowerCase().includes(term));
    return matchesName || matchesDetails;
  });

  const selectedEntry = vaultIndex.files.find(f => f.id === selectedId);

  // Form Field Update Helper
  const updateFormField = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  // Submit Handler
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await handleAddRecord(categoryId, formData);
      router.push(isDemo ? `/vault/${categoryId}?demo=true` : `/vault/${categoryId}`);
    } catch (err: any) {
      alert("Failed to save entry: " + err.message);
    }
  };

  // Delete Handler
  const onDelete = async (entry: VaultFileEntry) => {
    const success = await handleDeleteRecord(entry);
    if (success && selectedId === entry.id) {
      router.push(isDemo ? `/vault/${categoryId}?demo=true` : `/vault/${categoryId}`);
    }
  };

  // 1. VIEW MODE: SHOW RECORD DETAILS
  if (selectedEntry) {
    return (
      <div className="panel-card">
        <div className="flex-between" style={{ borderBottom: "1px solid var(--card-border)", paddingBottom: "16px", marginBottom: "24px" }}>
          <div>
            <h2 className="page-title">{selectedEntry.name} Details</h2>
            <span style={{ fontSize: "13px", color: "var(--muted)" }}>
              Type: {currentInfo.label}
            </span>
          </div>
          
          <button 
            onClick={() => onDelete(selectedEntry)} 
            className="btn-pink"
            style={{ padding: "8px 16px" }}
          >
            <Trash2 size={14} />
            <span>Delete Record</span>
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div className="form-grid form-grid-3">
            {Object.entries(selectedEntry.details || {}).map(([key, val]) => (
              <div key={key} style={{ backgroundColor: "#1e293b", padding: "14px", borderRadius: "8px", border: "1px solid var(--card-border)" }}>
                <span style={{ fontSize: "11px", color: "var(--muted)", fontWeight: "600", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <strong style={{ fontSize: "15px", color: "#fff", wordBreak: "break-all" }}>{val || "N/A"}</strong>
              </div>
            ))}
          </div>

          <div style={{ borderTop: "1px solid var(--card-border)", paddingTop: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "12px", color: "var(--muted)" }}>
              Record ID: {selectedEntry.id}
            </span>
            <button onClick={() => router.push(isDemo ? `/vault/${categoryId}?demo=true` : `/vault/${categoryId}`)} className="btn-outline">
              Back to Listing
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. FORM MODE: ADD NEW RECORD
  if (action === "add") {
    return (
      <div className="panel-card">
        <div className="flex-between" style={{ borderBottom: "1px solid var(--card-border)", paddingBottom: "16px", marginBottom: "24px" }}>
          <div>
            <h2 className="page-title">Add {currentInfo.label}</h2>
            <span style={{ fontSize: "13px", color: "var(--muted)" }}>
              Home / {currentInfo.label} / Add record
            </span>
          </div>

          <button onClick={() => router.push(isDemo ? `/vault/${categoryId}?demo=true` : `/vault/${categoryId}`)} className="btn-blue">
            <span>Show All</span>
          </button>
        </div>

        <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <TailoredForm categoryId={categoryId} formData={formData} updateFormField={updateFormField} />

          <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
            <button type="submit" className="btn-blue" style={{ minWidth: "100px" }}>
              Submit
            </button>
            <button type="button" onClick={() => router.push(isDemo ? `/vault/${categoryId}?demo=true` : `/vault/${categoryId}`)} className="btn-pink" style={{ minWidth: "100px" }}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  // 3. TABLE MODE: LIST RECORD ENTRIES
  return (
    <div className="panel-card">
      <div className="flex-between" style={{ marginBottom: "20px" }}>
        <div>
          <h2 className="page-title">Show {currentInfo.label}</h2>
          <span style={{ fontSize: "13px", color: "var(--muted)" }}>
            Home / {currentInfo.label} / Show records
          </span>
        </div>

        <button 
          onClick={() => router.push(isDemo ? `/vault/${categoryId}?action=add&demo=true` : `/vault/${categoryId}?action=add`)} 
          className="btn-blue"
        >
          <PlusCircle size={16} />
          <span>Add New</span>
        </button>
      </div>

      {searchedFiles.length === 0 ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "60px 20px", border: "1px dashed var(--card-border)", borderRadius: "8px", backgroundColor: "rgba(0,0,0,0.15)" }}>
          <FolderKey size={40} style={{ color: "#475569", marginBottom: "16px" }} />
          <span style={{ fontSize: "14px", color: "var(--muted)", fontWeight: "500" }}>No data available in table</span>
        </div>
      ) : (
        <div>
          <CategoryTable 
            categoryId={categoryId} 
            entries={searchedFiles} 
            onView={(entry) => router.push(isDemo ? `/vault/${categoryId}?id=${entry.id}&demo=true` : `/vault/${categoryId}?id=${entry.id}`)} 
            onDelete={onDelete} 
          />
          <div style={{ marginTop: "16px", fontSize: "13px", color: "var(--muted)" }}>
            Showing {searchedFiles.length} of {filteredFiles.length} entries.
          </div>
        </div>
      )}
    </div>
  );
}
