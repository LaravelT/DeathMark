"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FolderKey, LogOut, Notebook, ChevronDown, ChevronRight, Coins, UserCheck, User, ShieldCheck } from "lucide-react";
import { useVault, INSTRUMENT_TYPES, getRecordDisplayName } from "./VaultContext";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const {
    session, isDemo, vaultIndex, getCategoryCount, handleLogout,
    instrumentsOpen, setInstrumentsOpen, openCategories, setOpenCategories,
    nomineeDetails, searchTerm, ownerDetails
  } = useVault();

  // If a category has files, we can automatically expand it if we are currently visiting its route
  useEffect(() => {
    INSTRUMENT_TYPES.forEach(type => {
      if (pathname.includes(`/vault/${type.id}`)) {
        setOpenCategories(prev => ({ ...prev, [type.id]: true }));
      }
    });
  }, [pathname]);

  const toggleCategoryExpand = (catId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOpenCategories(prev => ({ ...prev, [catId]: !prev[catId] }));
  };

  return (
    <aside className="sidebar-container">
      {/* Logo */}
      <div className="profile-section" style={{ borderBottom: "1px solid var(--card-border)", padding: "12px 16px" }}>
        <div className="flex-center" style={{ gap: "10px", justifyContent: "flex-start", width: "100%" }}>
          <img 
            src="/assets/legacybridge-logo.png" 
            alt="LegacyBridge Logo" 
            style={{ height: "64px", width: "64px", objectFit: "contain", marginLeft: "-8px", marginRight: "-4px" }} 
          />
          <span className="brand-title" style={{ fontSize: "17px", fontWeight: "700", color: "#1a150e", WebkitTextFillColor: "#1a150e", letterSpacing: "0.01em" }}>
            LegacyBridge
          </span>
        </div>
      </div>

      {/* Profile */}
      <div className="profile-section">
        <div>
          <span className="profile-name">
            {session?.user?.name || "Harshal Patil"}
          </span>
          <span style={{ fontSize: "11px", display: "block", color: "var(--muted)" }}>Owner</span>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="sidebar-menu">
        <Link 
          href={isDemo ? "/vault?demo=true" : "/vault"}
          className={`menu-item ${pathname === "/vault" ? "active" : ""}`}
          style={{ textDecoration: "none" }}
        >
          <span className="menu-icon-text">
            <Notebook size={18} />
            <span>Dashboard</span>
          </span>
        </Link>

        <Link 
          href={isDemo ? "/vault/nominee?demo=true" : "/vault/nominee"}
          className={`menu-item ${pathname === "/vault/nominee" ? "active" : ""}`}
          style={{ textDecoration: "none" }}
        >
          <span className="menu-icon-text">
            <UserCheck size={18} />
            <span>Vault Nominee</span>
          </span>
          {nomineeDetails && (
            <span style={{ fontSize: "10px", backgroundColor: "rgba(16,185,129,0.15)", color: "#10b981", padding: "1px 6px", borderRadius: "10px", fontWeight: "bold" }}>
              Enrolled
            </span>
          )}
        </Link>

        <Link 
          href={isDemo ? "/vault/owner?demo=true" : "/vault/owner"}
          className={`menu-item ${pathname === "/vault/owner" ? "active" : ""}`}
          style={{ textDecoration: "none" }}
        >
          <span className="menu-icon-text">
            <User size={18} />
            <span>Vault Owner</span>
          </span>
          {ownerDetails && (
            <span style={{ fontSize: "10px", backgroundColor: "rgba(56,189,248,0.15)", color: "#38bdf8", padding: "1px 6px", borderRadius: "10px", fontWeight: "bold" }}>
              Saved
            </span>
          )}
        </Link>


        <button 
          onClick={() => setInstrumentsOpen(!instrumentsOpen)}
          className={`menu-item ${pathname.includes("/vault/") ? "active" : ""}`}
          style={{ cursor: "pointer" }}
        >
          <span className="menu-icon-text">
            <Coins size={18} />
            <span>Instruments</span>
          </span>
          <ChevronDown size={14} style={{ transform: instrumentsOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
        </button>

        {/* Submenu Dropdown Items */}
        {instrumentsOpen && (
          <div className="submenu-container">
            {INSTRUMENT_TYPES.filter((type) => {
              if (!searchTerm) return true;
              return type.label.toLowerCase().includes(searchTerm.toLowerCase());
            }).map((type) => {
              const count = getCategoryCount(type.id);
              const isCatActive = pathname === `/vault/${type.id}`;
              const isExpanded = !!openCategories[type.id];
              const categoryFiles = vaultIndex.files.filter(f => f.category === type.id);

              return (
                <div key={type.id} style={{ display: "flex", flexDirection: "column" }}>
                  <div 
                    className={`submenu-item ${isCatActive ? "active" : ""}`}
                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingRight: "4px" }}
                  >
                    <Link
                      href={isDemo ? `/vault/${type.id}?demo=true` : `/vault/${type.id}`}
                      style={{ textDecoration: "none", color: "inherit", flex: 1, display: "flex", alignItems: "center", gap: "8px" }}
                    >
                      <span className="submenu-dot">→</span>
                      <span style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", maxWidth: "160px" }}>{type.label}</span>
                      {count > 0 && (
                        <span style={{ fontSize: "11px", backgroundColor: "rgba(99,102,241,0.15)", color: "#818cf8", padding: "1px 6px", borderRadius: "10px", fontWeight: "bold" }}>
                          {count}
                        </span>
                      )}
                    </Link>

                    {categoryFiles.length > 0 && (
                      <button
                        onClick={(e) => toggleCategoryExpand(type.id, e)}
                        style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", padding: "4px 8px", display: "flex", alignItems: "center" }}
                      >
                        {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                      </button>
                    )}
                  </div>

                  {/* Sidebar Drilldown Child Files */}
                  {isExpanded && categoryFiles.length > 0 && (
                    <div className="nested-records-container">
                      {categoryFiles.map((file) => (
                        <Link
                          key={file.id}
                          href={isDemo ? `/vault/${type.id}?id=${file.id}&demo=true` : `/vault/${type.id}?id=${file.id}`}
                          className="nested-record-item"
                          style={{ textDecoration: "none" }}
                        >
                          • {getRecordDisplayName(file)}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Encryption Badge Card */}
      <div style={{ padding: "0 16px", marginBottom: "12px" }}>
        <div style={{
          backgroundColor: "#faf7f0",
          border: "1px solid rgba(217, 184, 133, 0.25)",
          borderRadius: "12px",
          padding: "12px 14px",
          display: "flex",
          alignItems: "center",
          gap: "12px"
        }}>
          <div style={{ color: "#b28e46", display: "flex", alignItems: "center" }}>
            <ShieldCheck size={20} />
          </div>
          <div>
            <h4 style={{ fontSize: "11px", fontWeight: "700", color: "#1a150e", margin: 0 }}>Your data is encrypted</h4>
            <p style={{ fontSize: "10px", color: "#8c7a6b", margin: 0, marginTop: "2px" }}>Zero-Knowledge. Always.</p>
          </div>
        </div>
      </div>

      {/* Logout/Lock */}
      <div style={{ marginTop: "auto", padding: "16px", borderTop: "1px solid var(--card-border)" }}>
        <button onClick={handleLogout} className="menu-item" style={{ color: "var(--danger)", width: "100%", background: "none", border: "none" }}>
          <span className="menu-icon-text" style={{ color: "var(--danger)" }}>
            <LogOut size={18} />
            <span>Logout</span>
          </span>
        </button>
      </div>
    </aside>
  );
}
