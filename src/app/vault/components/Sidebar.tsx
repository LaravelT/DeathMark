"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FolderKey, LogOut, Notebook, ChevronDown, ChevronRight, Coins, UserCheck, User, ShieldCheck } from "lucide-react";
import { useVault, INSTRUMENT_TYPES, getRecordDisplayName, PARENT_CATEGORIES } from "./VaultContext";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const {
    session, isDemo, vaultIndex, getCategoryCount, handleLogout,
    instrumentsOpen, setInstrumentsOpen, openCategories, setOpenCategories,
    nomineeDetails, searchTerm, ownerDetails
  } = useVault();

  const [expandedParents, setExpandedParents] = useState<Record<string, boolean>>({});

  const toggleParentExpand = (parentId: string) => {
    setExpandedParents(prev => ({ ...prev, [parentId]: !prev[parentId] }));
  };

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
      <div className="profile-section" style={{ borderBottom: "1px solid var(--card-border)", padding: "16px" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%" }}>
          <img 
            src="/assets/legacybridge-logo.png" 
            alt="LegacyBridge Logo" 
            style={{ height: "100px", width: "auto", objectFit: "contain" }} 
          />
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

        <Link 
          href={isDemo ? "/vault/plans?demo=true" : "/vault/plans"}
          className={`menu-item ${pathname === "/vault/plans" ? "active" : ""}`}
          style={{ textDecoration: "none" }}
        >
          <span className="menu-icon-text">
            <Coins size={18} />
            <span>Plans & Pricing</span>
          </span>
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
          <div className="submenu-container" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {PARENT_CATEGORIES.map((parent) => {
              const isParentExpanded = !!expandedParents[parent.id];
              // Calculate total count under this parent
              const totalCount = parent.subCategories.reduce((acc, subId) => acc + getCategoryCount(subId), 0);

              return (
                <div key={parent.id} style={{ display: "flex", flexDirection: "column", borderBottom: "1px solid rgba(217, 184, 133, 0.08)", paddingBottom: "6px" }}>
                  <button
                    onClick={() => toggleParentExpand(parent.id)}
                    className="submenu-item"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 12px",
                      background: "none",
                      border: "none",
                      width: "100%",
                      textAlign: "left",
                      cursor: "pointer",
                      color: isParentExpanded ? "var(--primary)" : "inherit",
                      fontWeight: isParentExpanded ? "600" : "normal"
                    }}
                  >
                    <span style={{ fontSize: "13px", lineHeight: "1.4", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {parent.label}
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      {totalCount > 0 && (
                        <span style={{ fontSize: "10px", backgroundColor: "rgba(178,142,70,0.15)", color: "#b28e46", padding: "1px 6px", borderRadius: "10px", fontWeight: "bold" }}>
                          {totalCount}
                        </span>
                      )}
                      {isParentExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </div>
                  </button>

                  {/* Subcategories (dropdown list) */}
                  {isParentExpanded && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px", paddingLeft: "16px", marginTop: "4px", borderLeft: "2px solid rgba(178,142,70,0.15)" }}>
                      {parent.subCategories.map((subId) => {
                        const type = INSTRUMENT_TYPES.find(t => t.id === subId);
                        if (!type) return null;

                        const count = getCategoryCount(subId);
                        const isCatActive = pathname === `/vault/${subId}`;
                        const isExpanded = !!openCategories[subId];
                        const categoryFiles = vaultIndex.files.filter(f => f.category === subId);

                        return (
                          <div key={subId} style={{ display: "flex", flexDirection: "column" }}>
                            <div 
                              className={`submenu-item ${isCatActive ? "active" : ""}`}
                              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 8px 6px 4px" }}
                            >
                              <Link
                                href={isDemo ? `/vault/${subId}?demo=true` : `/vault/${subId}`}
                                style={{ textDecoration: "none", color: "inherit", flex: 1, display: "flex", alignItems: "center", gap: "6px", fontSize: "12.5px" }}
                              >
                                <span>•</span>
                                <span style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", maxWidth: "140px" }}>{type.label}</span>
                                {count > 0 && (
                                  <span style={{ fontSize: "10px", backgroundColor: "rgba(99,102,241,0.15)", color: "#818cf8", padding: "1px 5px", borderRadius: "8px", fontWeight: "bold" }}>
                                    {count}
                                  </span>
                                )}
                              </Link>

                              {categoryFiles.length > 0 && (
                                <button
                                  onClick={(e) => toggleCategoryExpand(subId, e)}
                                  style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", padding: "2px 4px", display: "flex", alignItems: "center" }}
                                >
                                  {isExpanded ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
                                </button>
                              )}
                            </div>

                            {/* Sidebar Drilldown Child Files */}
                            {isExpanded && categoryFiles.length > 0 && (
                              <div className="nested-records-container" style={{ paddingLeft: "12px" }}>
                                {categoryFiles.map((file) => (
                                  <Link
                                    key={file.id}
                                    href={isDemo ? `/vault/${subId}?id=${file.id}&demo=true` : `/vault/${subId}?id=${file.id}`}
                                    className="nested-record-item"
                                    style={{ textDecoration: "none", fontSize: "12px" }}
                                  >
                                    - {getRecordDisplayName(file)}
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
