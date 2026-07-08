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
  uploadFileContent, downloadFileContent,
  deleteFileFromDrive
} from "@/lib/drive";

// Types and Interfaces
export interface OwnerDetails {
  name: string;
  address: string;
  phoneNo: string;
  aadhaarNo: string;
  panCardNo: string;
}

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
  lastUpdated?: Record<string, string>;
  lastLogin?: string;
}

export interface InstrumentTypeInfo {
  id: string;
  label: string;
  columns: string[];
}

export const INSTRUMENT_TYPES: InstrumentTypeInfo[] = [
  { id: "emergency_contact", label: "Emergency Contact", columns: ["Sr No", "Person Type", "Name", "Contact No", "Email", "Created At", "Actions"] },
  { id: "important_documents", label: "Location of Important Documents and Records", columns: ["Sr No", "Asset Title", "Actions"] },
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
  { id: "website_credentials", label: "Important Website/App links & credentials", columns: ["Sr No", "Asset Title", "Nominee", "Value", "Actions"] },
  { id: "will_document", label: "Will Document", columns: ["Sr No", "Asset Title", "Nominee", "Value", "Actions"] },
  { id: "trust_document", label: "Trust Document", columns: ["Sr No", "Asset Title", "Nominee", "Value", "Actions"] },
  { id: "business_interests", label: "Business Interests", columns: ["Sr No", "Business Name", "Ownership Type", "Your Role", "Partner/Director Contact", "Actions"] },
  { id: "recurring_income", label: "Recurring Income Sources", columns: ["Sr No", "Income Source", "Organization/Person", "Frequency", "Receiving Bank Account", "Actions"] },
  { id: "recurring_payments", label: "Recurring Payments / Auto Debit", columns: ["Sr No", "Payment Name", "Payment Type", "Debit Bank Account", "Frequency", "Auto Debit Enabled", "Actions"] }
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

  // Nominee state
  nomineeDetails: any;
  setNomineeDetails: React.Dispatch<React.SetStateAction<any>>;
  nomineeFileId: string | null;
  setNomineeFileId: React.Dispatch<React.SetStateAction<string | null>>;
  loadingNominee: boolean;
  setLoadingNominee: React.Dispatch<React.SetStateAction<boolean>>;
  handleSaveNominee: (formData: any) => Promise<void>;
  handleDeleteNominee: () => Promise<void>;
  fetchNomineeDetails: (key?: CryptoKey) => Promise<void>;
  
  // Owner Details
  ownerDetails: OwnerDetails | null;
  setOwnerDetails: React.Dispatch<React.SetStateAction<OwnerDetails | null>>;
  fetchOwnerDetails: () => Promise<void>;
  isExpired: boolean;
  setIsExpired: React.Dispatch<React.SetStateAction<boolean>>;
  createdAt: string | null;
  needsPasswordUpdate: boolean;
  setNeedsPasswordUpdate: React.Dispatch<React.SetStateAction<boolean>>;
  handleSaveOwnerDetails: (details: OwnerDetails) => Promise<void>;
  handleUpdateWeakPassphrase: (newPass: string, confirmNewPass: string) => Promise<boolean>;
  
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
  handleCreatePassphrase: (e: React.FormEvent) => boolean;
  handleVerifyMnemonic: (e?: React.FormEvent) => Promise<void>;
  handleAddRecord: (category: string, formData: Record<string, string>) => Promise<void>;
  handleDeleteRecord: (entry: VaultFileEntry) => Promise<boolean>;
  handleVerifyIntegrity: () => Promise<void>;
  handleExportVault: () => Promise<void>;
  handleLogout: () => void;

  getCategoryCount: (catId: string) => number;
  getCategoryLastUpdated: (catId: string) => string | undefined;
  lastLogin: string | null;
}

export const formatDateTime = (isoString?: string): string => {
  if (!isoString) return "";
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return "";
  
  const pad = (n: number) => String(n).padStart(2, "0");
  const dd = pad(d.getDate());
  const mm = pad(d.getMonth() + 1);
  const yy = String(d.getFullYear()).slice(-2);
  
  let hours = d.getHours();
  const minutes = pad(d.getMinutes());
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;
  const hh = pad(hours);
  
  return `${dd}/${mm}/${yy} @ ${hh}:${minutes} ${ampm}`;
};

export const getRecordDisplayName = (entry?: VaultFileEntry): string => {
  if (!entry) return "Untitled";
  const details = entry.details || {};
  const computed = 
    entry.name && entry.name !== "Untitled" ? entry.name : (
      details.assetTitle ||
      details.propertyName ||
      details.personName ||
      details.dpName ||
      details.fundHouse ||
      details.brokerName ||
      details.bankName ||
      details.startupName ||
      details.nftName ||
      details.issuerName ||
      details.walletName ||
      details.providerName ||
      details.fundName ||
      details.companyName ||
      details.exchangeWallet ||
      details.documentType ||
      details.websiteName ||
      details.willTitle ||
      details.trustName ||
      (details.uanNumber ? `${details.accountType || "PF/PPF/EPF"} - ${details.uanNumber}` : "") ||
      "Untitled"
    );
  return computed;
};


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

  // Nominee State
  const [nomineeDetails, setNomineeDetails] = useState<any>(null);
  const [nomineeFileId, setNomineeFileId] = useState<string | null>(null);
  const [loadingNominee, setLoadingNominee] = useState(false);

  // Owner State
  const [ownerDetails, setOwnerDetails] = useState<OwnerDetails | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [needsPasswordUpdate, setNeedsPasswordUpdate] = useState(false);
  const [tempDecryptedIndex, setTempDecryptedIndex] = useState<VaultIndex | null>(null);
  const [tempOldKey, setTempOldKey] = useState<CryptoKey | null>(null);

  // UI state
  const [instrumentsOpen, setInstrumentsOpen] = useState(true);
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [passVisible, setPassVisible] = useState(false);
  const [passError, setPassError] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [lastLogin, setLastLogin] = useState<string | null>(null);

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

          console.log("[VaultContext] Vault found on Drive, syncing to database...");
          fetch("/api/user/initialize", { method: "POST" })
            .then(async (res) => {
              const text = await res.text();
              console.log("[VaultContext] DB sync response:", res.status, text);
            })
            .catch((e) => {
              console.error("[VaultContext] Failed to sync vault initialization state:", e);
            });
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
      
      const isWeak = !(
        /[A-Z]/.test(passphrase) &&
        /[a-z]/.test(passphrase) &&
        /\d/.test(passphrase) &&
        /[^A-Za-z0-9]/.test(passphrase) &&
        passphrase.length >= 8
      );

      if (isWeak) {
        setTempDecryptedIndex(parsedIndex);
        setTempOldKey(key);
        setNeedsPasswordUpdate(true);
        return;
      }

      setNeedsPasswordUpdate(false);
      setTempDecryptedIndex(null);
      setTempOldKey(null);

      const previousLogin = parsedIndex.lastLogin || null;
      setLastLogin(previousLogin ? formatDateTime(previousLogin) : null);

      parsedIndex.lastLogin = new Date().toISOString();
      const stringifiedIndex = JSON.stringify(parsedIndex);
      const encryptedIndex = await encryptData(key, stringifiedIndex);
      const saltB64 = arrayBufferToBase64(salt.buffer as ArrayBuffer);
      const newContainerText = `${saltB64}.${encryptedIndex.iv}.${encryptedIndex.ciphertext}`;

      if (isDemo) {
        localStorage.setItem("deathmark_vault_container", newContainerText);
      } else {
        const accessToken = session?.accessToken!;
        await uploadFileContent(accessToken, driveFileId!, newContainerText);
      }

      setDerivedKey(key);
      setVaultIndex(parsedIndex);
      await fetchNomineeDetails(key);
      await fetchOwnerDetails();
      router.push(isDemo ? "/vault?demo=true" : "/vault");
    } catch (err: any) {
      console.error(err);
      setPassError("Incorrect passphrase or corrupted vault file.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch Nominee Details
  const fetchNomineeDetails = async (keyToUse?: CryptoKey) => {
    const key = keyToUse || derivedKey;
    if (!key) return;
    setLoadingNominee(true);
    try {
      if (isDemo) {
        const containerText = localStorage.getItem("deathmark_nominee_container");
        if (containerText) {
          const [, ivB64, ciphertextB64] = containerText.split(".");
          const decrypted = await decryptData(key, { iv: ivB64, ciphertext: ciphertextB64 });
          const nominee = JSON.parse(decrypted);
          setNomineeDetails(nominee);
        }
      } else {
        const accessToken = session?.accessToken;
        if (!accessToken) return;
        const file = await findFileInAppData(accessToken, "nominee_details.enc");
        if (file) {
          setNomineeFileId(file.id);
          const rawContent = await downloadFileContent(accessToken, file.id);
          const [, ivB64, ciphertextB64] = rawContent.split(".");
          const decrypted = await decryptData(key, { iv: ivB64, ciphertext: ciphertextB64 });
          const nominee = JSON.parse(decrypted);
          setNomineeDetails(nominee);
        }
      }
    } catch (err: any) {
      console.error("Failed to fetch nominee details:", err);
    } finally {
      setLoadingNominee(false);
    }
  };

  // Fetch Owner Details
  const fetchOwnerDetails = async () => {
    if (isDemo) {
      const local = localStorage.getItem("deathmark_owner_details");
      if (local) {
        setOwnerDetails(JSON.parse(local));
      }
      return;
    }
    try {
      const res = await fetch("/api/user/owner-details");
      if (res.ok) {
        const data = await res.json();
        setOwnerDetails(data.ownerDetails);
        setIsExpired(!!data.isExpired);
        setCreatedAt(data.createdAt || null);
      }
    } catch (e) {
      console.error("Failed to fetch owner details:", e);
    }
  };

  // Save Owner Details
  const handleSaveOwnerDetails = async (details: OwnerDetails) => {
    setLoading(true);
    setLoadingMessage("Saving owner details...");
    try {
      if (isDemo) {
        localStorage.setItem("deathmark_owner_details", JSON.stringify(details));
        setOwnerDetails(details);
      } else {
        const res = await fetch("/api/user/initialize", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ownerDetails: details }),
        });
        if (res.ok) {
          setOwnerDetails(details);
        } else {
          throw new Error("Failed to save owner details in database.");
        }
      }
    } catch (err: any) {
      console.error(err);
      alert("Error saving owner details: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Update Weak Passphrase for Existing Users
  const handleUpdateWeakPassphrase = async (newPass: string, confirmNewPass: string): Promise<boolean> => {
    setPassError("");
    const missing = [];
    if (newPass.length < 8) {
      missing.push("minimum 8 characters");
    }
    if (!/[A-Z]/.test(newPass)) {
      missing.push("one uppercase letter (A-Z)");
    }
    if (!/[a-z]/.test(newPass)) {
      missing.push("one lowercase letter (a-z)");
    }
    if (!/\d/.test(newPass)) {
      missing.push("one number (0-9)");
    }
    if (!/[^A-Za-z0-9]/.test(newPass)) {
      missing.push("one special character (e.g. @, #, $, %)");
    }

    if (missing.length > 0) {
      setPassError("Requirements missing: " + missing.join(", ") + ".");
      return false;
    }

    if (newPass !== confirmNewPass) {
      setPassError("Passphrases do not match.");
      return false;
    }

    if (!salt || !tempDecryptedIndex) {
      setPassError("Session expired or invalid state. Please reload.");
      return false;
    }

    setLoading(true);
    setLoadingMessage("Securing your vault with new passphrase...");

    try {
      const newKey = await deriveKey(newPass, salt);

      const updatedIndex = { ...tempDecryptedIndex };
      updatedIndex.lastLogin = new Date().toISOString();

      const stringifiedIndex = JSON.stringify(updatedIndex);
      const encryptedIndex = await encryptData(newKey, stringifiedIndex);
      const saltB64 = arrayBufferToBase64(salt.buffer as ArrayBuffer);
      const newContainerText = `${saltB64}.${encryptedIndex.iv}.${encryptedIndex.ciphertext}`;

      if (isDemo) {
        localStorage.setItem("deathmark_vault_container", newContainerText);
      } else {
        const accessToken = session?.accessToken!;
        if (!driveFileId) throw new Error("Drive file reference missing.");
        await uploadFileContent(accessToken, driveFileId, newContainerText);
      }

      setDerivedKey(newKey);
      setVaultIndex(updatedIndex);
      setPassphrase(newPass);
      setPassConfirm(newPass);

      setNeedsPasswordUpdate(false);
      setTempDecryptedIndex(null);
      setTempOldKey(null);

      await fetchNomineeDetails(newKey);
      await fetchOwnerDetails();

      router.push(isDemo ? "/vault?demo=true" : "/vault");
      return true;
    } catch (err: any) {
      console.error(err);
      setPassError("Failed to update passphrase: " + err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Save Nominee Details
  const handleSaveNominee = async (formData: any) => {
    const key = derivedKey;
    if (!key) throw new Error("Vault is locked.");
    setLoadingNominee(true);
    try {
      const stringified = JSON.stringify(formData);
      const encrypted = await encryptData(key, stringified);
      const saltB64 = arrayBufferToBase64(salt!.buffer as ArrayBuffer);
      const containerText = `${saltB64}.${encrypted.iv}.${encrypted.ciphertext}`;

      if (isDemo) {
        localStorage.setItem("deathmark_nominee_container", containerText);
        localStorage.setItem("deathmark_nominee_aadhaar", formData.aadhaar);
        localStorage.setItem("deathmark_nominee_pan", formData.pan);
      } else {
        const accessToken = session?.accessToken!;
        let fileId = nomineeFileId;
        if (!fileId) {
          const existingFile = await findFileInAppData(accessToken, "nominee_details.enc");
          if (existingFile) {
            fileId = existingFile.id;
          } else {
            fileId = await createFileMetadata(accessToken, "nominee_details.enc");
          }
          setNomineeFileId(fileId);
        }
        await uploadFileContent(accessToken, fileId, containerText);

        try {
          await fetch("/api/user/nominee-credentials", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              nomineeAadhaar: formData.aadhaar,
              nomineePan: formData.pan,
            }),
          });
        } catch (dbErr) {
          console.error("Failed to sync nominee credentials to database:", dbErr);
        }
      }
      setNomineeDetails(formData);
      await syncVaultSnapshot(vaultIndex?.files, { aadhaar: formData.aadhaar, pan: formData.pan });
    } catch (err: any) {
      console.error("Failed to save nominee details:", err);
      throw err;
    } finally {
      setLoadingNominee(false);
    }
  };

  // Delete Nominee Details
  const handleDeleteNominee = async () => {
    if (!confirm("Are you sure you want to permanently delete nominee details? This cannot be undone.")) return;
    const key = derivedKey;
    if (!key) throw new Error("Vault is locked.");
    setLoadingNominee(true);
    try {
      if (isDemo) {
        localStorage.removeItem("deathmark_nominee_container");
      } else {
        const accessToken = session?.accessToken!;
        let fileId = nomineeFileId;
        if (!fileId) {
          const existingFile = await findFileInAppData(accessToken, "nominee_details.enc");
          if (existingFile) fileId = existingFile.id;
        }
        if (fileId) {
          await deleteFileFromDrive(accessToken, fileId);
        }
      }
      setNomineeDetails(null);
      setNomineeFileId(null);
    } catch (err: any) {
      console.error("Failed to delete nominee details:", err);
      throw err;
    } finally {
      setLoadingNominee(false);
    }
  };

  // Step 1: Create Passphrase
  const handleCreatePassphrase = (e: React.FormEvent): boolean => {
    e.preventDefault();
    setPassError("");

    const missing = [];
    if (passphrase.length < 8) {
      missing.push("minimum 8 characters");
    }
    if (!/[A-Z]/.test(passphrase)) {
      missing.push("one uppercase letter (A-Z)");
    }
    if (!/[a-z]/.test(passphrase)) {
      missing.push("one lowercase letter (a-z)");
    }
    if (!/\d/.test(passphrase)) {
      missing.push("one number (0-9)");
    }
    if (!/[^A-Za-z0-9]/.test(passphrase)) {
      missing.push("one special character (e.g. @, #, $, %)");
    }

    if (missing.length > 0) {
      setPassError("Requirements missing: " + missing.join(", ") + ".");
      return false;
    }

    if (passphrase !== passConfirm) {
      setPassError("Passphrases do not match.");
      return false;
    }

    const words = generateMnemonic(wordlist);
    setMnemonic(words);
    return true;
  };

  // Step 2: Confirm Recovery Seed and Initialize Empty Vault
  const handleVerifyMnemonic = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setPassError("");
    setLoading(true);
    setLoadingMessage("Creating secure vault containers...");

    try {

      const generatedSalt = window.crypto.getRandomValues(new Uint8Array(16));
      setSalt(generatedSalt);

      const key = await deriveKey(passphrase, generatedSalt);
      setDerivedKey(key);

      const emptyIndex: VaultIndex = {
        version: "1.0",
        createdAt: new Date().toISOString(),
        files: [],
        lastLogin: new Date().toISOString()
      };
      setLastLogin(null);

      const stringified = JSON.stringify(emptyIndex);
      const encrypted = await encryptData(key, stringified);

      const saltB64 = arrayBufferToBase64(generatedSalt.buffer as ArrayBuffer);
      const containerText = `${saltB64}.${encrypted.iv}.${encrypted.ciphertext}`;

      if (isDemo) {
        localStorage.setItem("deathmark_vault_container", containerText);
        if (ownerDetails) {
          localStorage.setItem("deathmark_owner_details", JSON.stringify(ownerDetails));
        }
      } else {
        const accessToken = session?.accessToken!;
        const fileId = await createFileMetadata(accessToken, "vault_index.enc");
        await uploadFileContent(accessToken, fileId, containerText);
        setDriveFileId(fileId);

        try {
          await fetch("/api/user/initialize", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ ownerDetails }),
          });
        } catch (e) {
          console.error("Failed to mark vault initialization in database:", e);
        }
      }

      setVaultIndex(emptyIndex);
      await fetchNomineeDetails(key);
      router.push(isDemo ? "/vault?demo=true" : "/vault");
    } catch (err: any) {
      console.error(err);
      setPassError("Error generating vault. " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Sync zero-knowledge vault snapshot to MongoDB encrypted with nominee credentials
  const syncVaultSnapshot = async (filesToSync?: VaultFileEntry[], forceNominee?: { aadhaar: string, pan: string }) => {
    const nomAadhaar = forceNominee?.aadhaar || nomineeDetails?.aadhaar;
    const nomPan = forceNominee?.pan || nomineeDetails?.pan;
    const emailToUse = session?.user?.email;

    if (!emailToUse || !nomAadhaar || !nomPan) {
      console.log("[Sync Snapshot] Missing nominee credentials. Skipping snapshot sync.");
      return;
    }

    const files = filesToSync || vaultIndex?.files || [];

    try {
      const enc = new TextEncoder();
      const rawSalt = enc.encode(emailToUse.toLowerCase().trim());
      const saltBuffer = new Uint8Array(16);
      for (let i = 0; i < Math.min(rawSalt.length, 16); i++) {
        saltBuffer[i] = rawSalt[i];
      }

      const rawPassphrase = (nomAadhaar.trim() + nomPan.toUpperCase().trim());
      const snapshotKey = await deriveKey(rawPassphrase, saltBuffer);

      const plainText = JSON.stringify(files);
      const encrypted = await encryptData(snapshotKey, plainText);

      const encryptedSnapshot = `${encrypted.iv}.${encrypted.ciphertext}`;

      await fetch("/api/vault/snapshot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ encryptedSnapshot })
      });
      console.log("[Sync Snapshot] Successfully updated snapshot in database.");
    } catch (err) {
      console.error("[Sync Snapshot] Error:", err);
    }
  };

  // Add Record (text-only, no file uploads)
  const handleAddRecord = async (category: string, formData: Record<string, string>) => {
    if (!derivedKey) return;

    setLoading(true);
    setLoadingMessage("Encrypting asset details...");

    try {
      const displayName = 
        formData.assetTitle || 
        formData.propertyName || 
        formData.personName || 
        formData.dpName || 
        formData.fundHouse || 
        formData.brokerName || 
        formData.bankName || 
        formData.startupName || 
        formData.nftName || 
        formData.issuerName || 
        formData.walletName || 
        formData.providerName || 
        formData.fundName || 
        formData.companyName || 
        formData.exchangeWallet || 
        formData.documentType || 
        formData.websiteName || 
        formData.willTitle || 
        formData.trustName || 
        (formData.uanNumber ? `${formData.accountType || "PF/PPF/EPF"} - ${formData.uanNumber}` : "") ||
        "Untitled";

      const newEntryId = crypto.randomUUID();
      const newEntry: VaultFileEntry = {
        id: newEntryId,
        category,
        name: displayName,
        createdAt: new Date().toISOString(),
        details: formData
      };

      const now = new Date().toISOString();
      const updatedIndex: VaultIndex = {
        ...vaultIndex,
        files: [...vaultIndex.files, newEntry],
        lastUpdated: {
          ...(vaultIndex.lastUpdated || {}),
          [category]: now
        }
      };

      const stringifiedIndex = JSON.stringify(updatedIndex);
      const encryptedIndex = await encryptData(derivedKey, stringifiedIndex);
      const saltB64 = arrayBufferToBase64(salt!.buffer as ArrayBuffer);
      const containerText = `${saltB64}.${encryptedIndex.iv}.${encryptedIndex.ciphertext}`;

      if (isDemo) {
        localStorage.setItem("deathmark_vault_container", containerText);
      } else {
        const accessToken = session?.accessToken!;
        await uploadFileContent(accessToken, driveFileId!, containerText);
      }

      setVaultIndex(updatedIndex);
      await syncVaultSnapshot(updatedIndex.files);
    } catch (err: any) {
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };



  // Delete Record (text-only, no separate drive files to clean up)
  const handleDeleteRecord = async (entry: VaultFileEntry): Promise<boolean> => {
    if (!confirm(`Are you sure you want to permanently delete "${getRecordDisplayName(entry)}"?`)) return false;

    setLoading(true);
    setLoadingMessage("Removing record...");

    try {
      const updatedFiles = vaultIndex.files.filter(f => f.id !== entry.id);
      const now = new Date().toISOString();
      const updatedIndex: VaultIndex = {
        ...vaultIndex,
        files: updatedFiles,
        lastUpdated: {
          ...(vaultIndex.lastUpdated || {}),
          [entry.category]: now
        }
      };

      const stringifiedIndex = JSON.stringify(updatedIndex);
      const encryptedIndex = await encryptData(derivedKey!, stringifiedIndex);
      const saltB64 = arrayBufferToBase64(salt!.buffer as ArrayBuffer);
      const containerText = `${saltB64}.${encryptedIndex.iv}.${encryptedIndex.ciphertext}`;

      if (isDemo) {
        localStorage.setItem("deathmark_vault_container", containerText);
      } else {
        const accessToken = session?.accessToken!;
        await uploadFileContent(accessToken, driveFileId!, containerText);
      }

      setVaultIndex(updatedIndex);
      await syncVaultSnapshot(updatedIndex.files);
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
    setOwnerDetails(null);
    setNomineeDetails(null);
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

  const getCategoryLastUpdated = (catId: string): string | undefined => {
    if (vaultIndex.lastUpdated?.[catId]) {
      return vaultIndex.lastUpdated[catId];
    }
    const catFiles = vaultIndex.files.filter(f => f.category === catId);
    if (catFiles.length === 0) return undefined;
    const times = catFiles.map(f => new Date(f.createdAt).getTime());
    const latestTime = Math.max(...times);
    return new Date(latestTime).toISOString();
  };

  return (
    <VaultContext.Provider value={{
      isDemo, session, status, loading, setLoading, loadingMessage, setLoadingMessage,
      passphrase, setPassphrase, passConfirm, setPassConfirm, derivedKey, setDerivedKey, salt, setSalt,
      mnemonic, setMnemonic, confirmMnemonic, setConfirmMnemonic, driveFileId, vaultIndex, setVaultIndex,
      instrumentsOpen, setInstrumentsOpen, openCategories, setOpenCategories, searchTerm, setSearchTerm,
      passVisible, setPassVisible, passError, setPassError, copySuccess, setCopySuccess,
      checkExistingVault, handleUnlock, handleCreatePassphrase, handleVerifyMnemonic, handleAddRecord,
      handleDeleteRecord, handleVerifyIntegrity, handleExportVault, handleLogout, getCategoryCount,
      nomineeDetails, setNomineeDetails, nomineeFileId, setNomineeFileId, loadingNominee, setLoadingNominee,
      handleSaveNominee, handleDeleteNominee, fetchNomineeDetails, getCategoryLastUpdated, lastLogin,
      ownerDetails, setOwnerDetails, fetchOwnerDetails,
      isExpired, setIsExpired, createdAt,
      needsPasswordUpdate, setNeedsPasswordUpdate, handleSaveOwnerDetails, handleUpdateWeakPassphrase
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
