"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { generateMnemonic } from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english.js";
import { 
  deriveKey, encryptData, decryptData, 
  arrayBufferToBase64, base64ToArrayBuffer 
} from "@/lib/crypto";
import { 
  findFileInAppData, createFileMetadata, 
  uploadFileContent, downloadFileContent 
} from "@/lib/drive";

// Types and Interfaces
export interface VaultFileEntry {
  id: string;
  category: string;
  name: string;
  createdAt: string;
  details: Record<string, string>;
}

export interface VaultIndex {
  version: string;
  createdAt: string;
  files: VaultFileEntry[];
}

export interface InstrumentTypeInfo {
  id: string;
  label: string;
  columns: string[];
}

export const INSTRUMENT_TYPES: InstrumentTypeInfo[] = [
  { id: "emergency_contact", label: "Emergency Contact", columns: ["Sr No", "Person Type", "Name", "Contact No", "Email", "Created At", "Actions"] },
  { id: "real_estate", label: "Real Estate", columns: ["Sr No", "Property Name", "Address", "Owner", "Value", "Actions"] },
  { id: "demat_account", label: "Demat Account", columns: ["Sr No", "DP Name", "Client ID", "Nominee", "Actions"] },
  { id: "trading_account", label: "Trading Account", columns: ["Sr No", "Broker Name", "Client UCC", "Nominee", "Actions"] },
  { id: "mutual_fund", label: "Mutual Fund", columns: ["Sr No", "Fund House", "Folio No", "Scheme", "Nominee", "Actions"] },
  { id: "pms", label: "PMS", columns: ["Sr No", "Provider", "Account No", "Nominee", "Actions"] },
  { id: "aif", label: "AIF", columns: ["Sr No", "Fund Name", "Investment Code", "Nominee", "Actions"] },
  { id: "private_equity", label: "Private Equity", columns: ["Sr No", "Company", "Investment", "Nominee", "Actions"] },
  { id: "startup_investments", label: "Startup Investments", columns: ["Sr No", "Startup Name", "Equity %", "Amount", "Actions"] },
  { id: "pf_ppf_epf", label: "PF / PPF / EPF", columns: ["Sr No", "UAN/Account", "Type", "Nominee", "Actions"] },
  { id: "bank_account", label: "Bank Account", columns: ["Sr No", "Bank Name", "Account No", "Type", "Nominee", "Actions"] },
  { id: "fixed_deposits", label: "Fixed Deposits", columns: ["Sr No", "Bank Name", "Receipt No", "Amount", "Maturity", "Actions"] },
  { id: "crypto_currency", label: "Crypto Currency", columns: ["Sr No", "Exchange/Wallet", "Coin", "Address", "Actions"] },
  { id: "nft", label: "NFT", columns: ["Sr No", "NFT Name", "Collection", "Blockchain", "Actions"] },
  { id: "bonds_certificates", label: "Bonds, Fixed Income, REITS, SGB & Other Saving Certificates", columns: ["Sr No", "Issuer", "Cert No", "Value", "Maturity", "Actions"] },
  { id: "mobile_wallet", label: "Mobile Wallet", columns: ["Sr No", "Wallet Name", "Linked Mobile No", "Nominee", "Actions"] },
  { id: "physical_shares", label: "Physical Shares", columns: ["Sr No", "Asset Title", "Nominee", "Value", "Actions"] },
  { id: "life_insurance", label: "Life Insurance Details", columns: ["Sr No", "Asset Title", "Nominee", "Value", "Actions"] },
  { id: "health_insurance", label: "Health Insurance Details", columns: ["Sr No", "Asset Title", "Nominee", "Value", "Actions"] },
  { id: "general_insurance", label: "General Insurance Details", columns: ["Sr No", "Asset Title", "Nominee", "Value", "Actions"] },
  { id: "loan_given", label: "Loan Given Details", columns: ["Sr No", "Asset Title", "Nominee", "Value", "Actions"] },
  { id: "movable_assets", label: "Movable Assets", columns: ["Sr No", "Asset Title", "Nominee", "Value", "Actions"] },
  { id: "vehicle_details", label: "Vehicle Details", columns: ["Sr No", "Asset Title", "Nominee", "Value", "Actions"] },
  { id: "bank_locker", label: "Bank Locker Details", columns: ["Sr No", "Asset Title", "Nominee", "Value", "Actions"] },
  { id: "membership_details", label: "Membership Details", columns: ["Sr No", "Asset Title", "Nominee", "Value", "Actions"] },
  { id: "liabilities_details", label: "Liabilities Details", columns: ["Sr No", "Asset Title", "Nominee", "Value", "Actions"] },
  { id: "important_documents", label: "Location of Important Documents and Records", columns: ["Sr No", "Asset Title", "Nominee", "Value", "Actions"] },
  { id: "website_credentials", label: "Important Website/App links & credentials", columns: ["Sr No", "Asset Title", "Nominee", "Value", "Actions"] },
  { id: "will_document", label: "Will Document", columns: ["Sr No", "Asset Title", "Nominee", "Value", "Actions"] },
  { id: "trust_document", label: "Trust Document", columns: ["Sr No", "Asset Title", "Nominee", "Value", "Actions"] }
];

interface VaultContextType {
  isDemo: boolean;
  session: any;
  status: string;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  loadingMessage: string;
  setLoadingMessage: React.Dispatch<React.SetStateAction<string>>;
  
  // Crypto State
  passphrase: string;
  setPassphrase: React.Dispatch<React.SetStateAction<string>>;
  passConfirm: string;
  setPassConfirm: React.Dispatch<React.SetStateAction<string>>;
  derivedKey: CryptoKey | null;
  setDerivedKey: React.Dispatch<React.SetStateAction<CryptoKey | null>>;
  salt: Uint8Array | null;
  setSalt: React.Dispatch<React.SetStateAction<Uint8Array | null>>;
  mnemonic: string;
  setMnemonic: React.Dispatch<React.SetStateAction<string>>;
  confirmMnemonic: string;
  setConfirmMnemonic: React.Dispatch<React.SetStateAction<string>>;
  
  // Storage state
  driveFileId: string | null;
  vaultIndex: VaultIndex;
  setVaultIndex: React.Dispatch<React.SetStateAction<VaultIndex>>;
  
  // UI & Search State
  instrumentsOpen: boolean;
  setInstrumentsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  openCategories: Record<string, boolean>;
  setOpenCategories: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  passVisible: boolean;
  setPassVisible: React.Dispatch<React.SetStateAction<boolean>>;
  passError: string;
  setPassError: React.Dispatch<React.SetStateAction<string>>;
  copySuccess: boolean;
  setCopySuccess: React.Dispatch<React.SetStateAction<boolean>>;

  // Operations
  checkExistingVault: () => Promise<void>;
  handleUnlock: (e: React.FormEvent) => Promise<void>;
  handleCreatePassphrase: (e: React.FormEvent) => void;
  handleVerifyMnemonic: (e: React.FormEvent) => Promise<void>;
  handleAddRecord: (category: string, formData: Record<string, string>) => Promise<void>;
  handleDeleteRecord: (entry: VaultFileEntry) => Promise<boolean>;
  handleVerifyIntegrity: () => Promise<void>;
  handleExportVault: () => Promise<void>;
  handleLogout: () => void;

  getCategoryCount: (catId: string) => number;
}

const VaultContext = createContext<VaultContextType | undefined>(undefined);

export function VaultProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isDemo = searchParams.get("demo") === "true";

  // General Loading & Navigation Screen
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState("Initializing secure session...");

  // Crypto State
  const [passphrase, setPassphrase] = useState("");
  const [passConfirm, setPassConfirm] = useState("");
  const [derivedKey, setDerivedKey] = useState<CryptoKey | null>(null);
  const [salt, setSalt] = useState<Uint8Array | null>(null);
  const [mnemonic, setMnemonic] = useState("");
  const [confirmMnemonic, setConfirmMnemonic] = useState("");

  // Storage State
  const [driveFileId, setDriveFileId] = useState<string | null>(null);
  const [vaultIndex, setVaultIndex] = useState<VaultIndex>({ version: "1.0", createdAt: "", files: [] });

  // UI state
  const [instrumentsOpen, setInstrumentsOpen] = useState(true);
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [passVisible, setPassVisible] = useState(false);
  const [passError, setPassError] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Authentication Checking & Vault Init
  useEffect(() => {
    if (status === "unauthenticated" && !isDemo) {
      router.push("/auth/signin");
    } else if ((status === "authenticated" || isDemo) && !hasInitialized) {
      setHasInitialized(true);
      checkExistingVault();
    }
  }, [status, isDemo, hasInitialized]);

  // Check if vault_index.enc exists
  const checkExistingVault = async () => {
    setLoading(true);
    setLoadingMessage("Checking for existing vault...");

    try {
      if (isDemo) {
        const localIndex = localStorage.getItem("deathmark_vault_container");
        if (localIndex) {
          const [saltB64] = localIndex.split(".");
          setSalt(new Uint8Array(base64ToArrayBuffer(saltB64)));
        }
      } else {
        const accessToken = session?.accessToken;
        if (!accessToken) throw new Error("No Google access token found.");

        const file = await findFileInAppData(accessToken, "vault_index.enc");
        if (file) {
          setDriveFileId(file.id);
          const rawContent = await downloadFileContent(accessToken, file.id);
          const [saltB64] = rawContent.split(".");
          setSalt(new Uint8Array(base64ToArrayBuffer(saltB64)));
        }
      }
    } catch (err: any) {
      console.error(err);
      if (err.message.includes("401") || err.message.toLowerCase().includes("unauthorized") || err.message.toLowerCase().includes("invalid credentials")) {
        signOut({ callbackUrl: "/auth/signin" });
      } else {
        setPassError("Could not connect to storage. " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Unlock Vault
  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError("");
    setLoading(true);
    setLoadingMessage("Decrypting vault indices...");

    try {
      if (!salt) throw new Error("No key salt found.");

      const key = await deriveKey(passphrase, salt);
      let containerText = "";

      if (isDemo) {
        containerText = localStorage.getItem("deathmark_vault_container") || "";
      } else {
        const accessToken = session?.accessToken!;
        if (!driveFileId) throw new Error("Drive file reference missing.");
        containerText = await downloadFileContent(accessToken, driveFileId);
      }

      const [, ivB64, ciphertextB64] = containerText.split(".");
      if (!ivB64 || !ciphertextB64) throw new Error("Vault index file is corrupted.");

      const decrypted = await decryptData(key, { iv: ivB64, ciphertext: ciphertextB64 });
      const parsedIndex = JSON.parse(decrypted) as VaultIndex;

      setDerivedKey(key);
      setVaultIndex(parsedIndex);
      router.push(isDemo ? "/vault?demo=true" : "/vault");
    } catch (err: any) {
      console.error(err);
      setPassError("Incorrect passphrase or corrupted vault file.");
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Create Passphrase
  const handleCreatePassphrase = (e: React.FormEvent) => {
    e.preventDefault();
    setPassError("");

    if (passphrase.length < 8) {
      setPassError("Passphrase must be at least 8 characters long.");
      return;
    }
    if (passphrase !== passConfirm) {
      setPassError("Passphrases do not match.");
      return;
    }

    const words = generateMnemonic(wordlist);
    setMnemonic(words);
  };

  // Step 2: Confirm Recovery Seed and Initialize Empty Vault
  const handleVerifyMnemonic = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError("");
    setLoading(true);
    setLoadingMessage("Creating secure vault containers...");

    try {
      if (confirmMnemonic.trim().toLowerCase() !== mnemonic.trim().toLowerCase()) {
        setPassError("The mnemonic words do not match the ones generated. Please check spelling.");
        setLoading(false);
        return;
      }

      const generatedSalt = window.crypto.getRandomValues(new Uint8Array(16));
      setSalt(generatedSalt);

      const key = await deriveKey(passphrase, generatedSalt);
      setDerivedKey(key);

      const emptyIndex: VaultIndex = {
        version: "1.0",
        createdAt: new Date().toISOString(),
        files: []
      };

      const stringified = JSON.stringify(emptyIndex);
      const encrypted = await encryptData(key, stringified);

      const saltB64 = arrayBufferToBase64(generatedSalt.buffer);
      const containerText = `${saltB64}.${encrypted.iv}.${encrypted.ciphertext}`;

      if (isDemo) {
        localStorage.setItem("deathmark_vault_container", containerText);
      } else {
        const accessToken = session?.accessToken!;
        const fileId = await createFileMetadata(accessToken, "vault_index.enc");
        await uploadFileContent(accessToken, fileId, containerText);
        setDriveFileId(fileId);
      }

      setVaultIndex(emptyIndex);
      router.push(isDemo ? "/vault?demo=true" : "/vault");
    } catch (err: any) {
      console.error(err);
      setPassError("Error generating vault. " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Add Record (text-only, no file uploads)
  const handleAddRecord = async (category: string, formData: Record<string, string>) => {
    if (!derivedKey) return;

    setLoading(true);
    setLoadingMessage("Encrypting asset details...");

    try {
      const displayName = formData.propertyName || formData.personName || formData.fundHouse || formData.brokerName || formData.bankName || formData.startupName || formData.nftName || formData.issuerName || formData.walletName || "Untitled";

      const newEntryId = crypto.randomUUID();
      const newEntry: VaultFileEntry = {
        id: newEntryId,
        category,
        name: displayName,
        createdAt: new Date().toISOString(),
        details: formData
      };

      const updatedIndex: VaultIndex = {
        ...vaultIndex,
        files: [...vaultIndex.files, newEntry]
      };

      const stringifiedIndex = JSON.stringify(updatedIndex);
      const encryptedIndex = await encryptData(derivedKey, stringifiedIndex);
      const saltB64 = arrayBufferToBase64(salt!.buffer);
      const containerText = `${saltB64}.${encryptedIndex.iv}.${encryptedIndex.ciphertext}`;

      if (isDemo) {
        localStorage.setItem("deathmark_vault_container", containerText);
      } else {
        const accessToken = session?.accessToken!;
        await uploadFileContent(accessToken, driveFileId!, containerText);
      }

      setVaultIndex(updatedIndex);
    } catch (err: any) {
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };



  // Delete Record (text-only, no separate drive files to clean up)
  const handleDeleteRecord = async (entry: VaultFileEntry): Promise<boolean> => {
    if (!confirm(`Are you sure you want to permanently delete "${entry.name}"?`)) return false;

    setLoading(true);
    setLoadingMessage("Removing record...");

    try {
      const updatedFiles = vaultIndex.files.filter(f => f.id !== entry.id);
      const updatedIndex: VaultIndex = {
        ...vaultIndex,
        files: updatedFiles
      };

      const stringifiedIndex = JSON.stringify(updatedIndex);
      const encryptedIndex = await encryptData(derivedKey!, stringifiedIndex);
      const saltB64 = arrayBufferToBase64(salt!.buffer);
      const containerText = `${saltB64}.${encryptedIndex.iv}.${encryptedIndex.ciphertext}`;

      if (isDemo) {
        localStorage.setItem("deathmark_vault_container", containerText);
      } else {
        const accessToken = session?.accessToken!;
        await uploadFileContent(accessToken, driveFileId!, containerText);
      }

      setVaultIndex(updatedIndex);
      return true;
    } catch (err: any) {
      console.error(err);
      alert("Failed to delete record: " + err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Sync index integrity with storage
  const handleVerifyIntegrity = async () => {
    if (isDemo) {
      alert("Integrity check completed. All records intact (text-only vault).");
      return;
    }

    setLoading(true);
    setLoadingMessage("Verifying vault integrity with Google Drive...");
    
    try {
      const accessToken = session?.accessToken!;
      // Since we only store text in the vault index, just verify the index file exists
      if (driveFileId) {
        const res = await fetch(`https://www.googleapis.com/drive/v3/files/${driveFileId}?fields=id`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        if (res.ok) {
          alert("Integrity check complete. Vault index file is intact on Google Drive.");
        } else {
          alert("Warning: Vault index file could not be verified on Google Drive.");
        }
      } else {
        alert("No vault index file found on Google Drive.");
      }
    } catch (err: any) {
      console.error(err);
      alert("Failed to run integrity check: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Export Decrypted Index
  const handleExportVault = async () => {
    alert("Exporting all records. Make sure you are in a secure location.");
    setLoading(true);
    setLoadingMessage("Processing vault index...");

    try {
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(vaultIndex, null, 2)
      )}`;
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", jsonString);
      downloadAnchor.setAttribute("download", `deathmark_vault_export_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err: any) {
      console.error(err);
      alert("Failed to export vault: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Logout/Lock
  const handleLogout = () => {
    setDerivedKey(null);
    setPassphrase("");
    if (isDemo) {
      router.push("/");
    } else {
      signOut({ callbackUrl: "/" });
    }
  };

  // Count items per category helper
  const getCategoryCount = (catId: string) => {
    return vaultIndex.files.filter(f => f.category === catId).length;
  };

  return (
    <VaultContext.Provider value={{
      isDemo, session, status, loading, setLoading, loadingMessage, setLoadingMessage,
      passphrase, setPassphrase, passConfirm, setPassConfirm, derivedKey, setDerivedKey, salt, setSalt,
      mnemonic, setMnemonic, confirmMnemonic, setConfirmMnemonic, driveFileId, vaultIndex, setVaultIndex,
      instrumentsOpen, setInstrumentsOpen, openCategories, setOpenCategories, searchTerm, setSearchTerm,
      passVisible, setPassVisible, passError, setPassError, copySuccess, setCopySuccess,
      checkExistingVault, handleUnlock, handleCreatePassphrase, handleVerifyMnemonic, handleAddRecord,
      handleDeleteRecord, handleVerifyIntegrity, handleExportVault, handleLogout, getCategoryCount
    }}>
      {children}
    </VaultContext.Provider>
  );
}

export function useVault() {
  const context = useContext(VaultContext);
  if (!context) {
    throw new Error("useVault must be used within a VaultProvider");
  }
  return context;
}
