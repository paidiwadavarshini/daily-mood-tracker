/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import {
  Lock,
  Unlock,
  Key,
  Plus,
  Trash2,
  Sparkles,
  Wind,
  Play,
  Pause,
  RotateCcw,
  Download,
  Upload,
  ShieldCheck,
  AlertCircle,
  Calendar,
  ArrowLeft,
  Heart,
  Bookmark,
  Coffee,
  CheckCircle,
  Info
} from "lucide-react";
import {
  encryptText,
  decryptText,
  createPhraseVerificationToken,
  verifyPassphrase
} from "./lib/crypto";
import {
  BreathingExercise,
  GeminiAnalysis,
  JournalEntry,
  UnlockedJournalEntry
} from "./types";

// Dynamic emotion styling mapping
const colorThemeMap: Record<string, {
  bg: string;
  btn: string;
  badge: string;
  border: string;
  ring: string;
  text: string;
  accent: string;
  glow: string;
}> = {
  indigo: {
    bg: "bg-[#f4f7f6] dark:bg-[#1e2221]",
    btn: "bg-[#5a6a5d] hover:bg-[#4a5a4d] text-white shadow-xs",
    badge: "bg-[#e8ece9] text-[#425045] border-[#d8deda] dark:bg-[#2b352e] dark:text-[#a0b0a5] dark:border-[#38433c]",
    border: "border-[#e2e8e4] dark:border-[#2f3832]",
    ring: "focus:ring-[#5a6a5d]/20 focus:border-[#5a6a5d]",
    text: "text-[#4c5c50] dark:text-[#a0b0a5]",
    accent: "bg-[#5a6a5d] dark:bg-[#6c7d70]",
    glow: "bg-[#5a6a5d]/10"
  },
  teal: {
    bg: "bg-[#f1f4f1] dark:bg-[#1a201b]",
    btn: "bg-[#5a6a5d] hover:bg-[#4a5a4d] text-[#ffffff]",
    badge: "bg-[#e2e8e2] text-[#415043] border-[#ccd6cc] dark:bg-[#202b22] dark:text-[#9bb09e] dark:border-[#2e3d31]",
    border: "border-[#dee5de] dark:border-[#29352c]",
    ring: "focus:ring-[#5a6a5d]/20 focus:border-[#5a6a5d]",
    text: "text-[#5a6a5d] dark:text-[#8ea092]",
    accent: "bg-[#5a6a5d] dark:bg-[#788a7c]",
    glow: "bg-[#5a6a5d]/10"
  },
  amber: {
    bg: "bg-[#faf6f0] dark:bg-[#23201a]",
    btn: "bg-[#8c6b4e] hover:bg-[#73563b] text-white",
    badge: "bg-[#f1eae0] text-[#735133] border-[#e2d6c4] dark:bg-[#3d3328] dark:text-[#cfbeab] dark:border-[#4d4033]",
    border: "border-[#ebdcc8] dark:border-[#45392d]",
    ring: "focus:ring-[#8c6b4e]/20 focus:border-[#8c6b4e]",
    text: "text-[#8c6b4e] dark:text-[#c4a68a]",
    accent: "bg-[#8c6b4e] dark:bg-[#ab896a]",
    glow: "bg-[#8c6b4e]/10"
  },
  rose: {
    bg: "bg-[#faf3f3] dark:bg-[#261f1f]",
    btn: "bg-[#a66a6a] hover:bg-[#8c5656] text-white",
    badge: "bg-[#f2e6e6] text-[#8c4c4c] border-[#e6d0d0] dark:bg-[#3d2b2b] dark:text-[#d9a3a3] dark:border-[#4d3636]",
    border: "border-[#ebd4d4] dark:border-[#473030]",
    ring: "focus:ring-[#a66a6a]/20 focus:border-[#a66a6a]",
    text: "text-[#a66a6a] dark:text-[#d49898]",
    accent: "bg-[#a66a6a] dark:bg-[#bf8080]",
    glow: "bg-[#a66a6a]/10"
  },
  emerald: {
    bg: "bg-[#f2f7f4] dark:bg-[#1a231f]",
    btn: "bg-[#3d4f45] hover:bg-[#2d3b33] text-white",
    badge: "bg-[#e3ede8] text-[#2f4237] border-[#ccdcd4] dark:bg-[#24332c] dark:text-[#8bb59f] dark:border-[#33473d]",
    border: "border-[#dee9e4] dark:border-[#2e4037]",
    ring: "focus:ring-[#3d4f45]/20 focus:border-[#3d4f45]",
    text: "text-[#3d4f45] dark:text-[#7ba18d]",
    accent: "bg-[#3d4f45] dark:bg-[#526d5f]",
    glow: "bg-[#3d4f45]/10"
  },
  sky: {
    bg: "bg-[#f3f6f8] dark:bg-[#1c2226]",
    btn: "bg-[#4f6475] hover:bg-[#3d4f5d] text-white",
    badge: "bg-[#e5ecf0] text-[#344857] border-[#d0dee6] dark:bg-[#25323c] dark:text-[#8fb4cf] dark:border-[#354654]",
    border: "border-[#e1ebf0] dark:border-[#2f3f4c]",
    ring: "focus:ring-[#4f6475]/20 focus:border-[#4f6475]",
    text: "text-[#4f6475] dark:text-[#85a8c4]",
    accent: "bg-[#4f6475] dark:bg-[#6c869c]",
    glow: "bg-[#4f6475]/10"
  },
  violet: {
    bg: "bg-[#f6f3f8] dark:bg-[#221c26]",
    btn: "bg-[#6a5b7c] hover:bg-[#554763] text-white",
    badge: "bg-[#ebe5f0] text-[#4d3d5e] border-[#dbd0e6] dark:bg-[#2e233c] dark:text-[#b49fcf] dark:border-[#3f3054]",
    border: "border-[#e5dbf0] dark:border-[#3a2c4d]",
    ring: "focus:ring-[#6a5b7c]/20 focus:border-[#6a5b7c]",
    text: "text-[#6a5b7c] dark:text-[#aa95c4]",
    accent: "bg-[#6a5b7c] dark:bg-[#8e7da3]",
    glow: "bg-[#6a5b7c]/10"
  },
  fuchsia: {
    bg: "bg-[#f9f3f6] dark:bg-[#261c22]",
    btn: "bg-[#7a5369] hover:bg-[#613f51] text-white",
    badge: "bg-[#f2e5eb] text-[#5c374b] border-[#e6ced9] dark:bg-[#3c2332] dark:text-[#cfa4be] dark:border-[#543044]",
    border: "border-[#ebd4e0] dark:border-[#4a2b3b]",
    ring: "focus:ring-[#7a5369]/20 focus:border-[#7a5369]",
    text: "text-[#7a5369] dark:text-[#bf8dab]",
    accent: "bg-[#7a5369] dark:bg-[#a67491]",
    glow: "bg-[#7a5369]/10"
  }
};

// Default tranquil breathing exercises available universally
const DEFAULT_UNIVERSAL_EXERCISES: BreathingExercise[] = [
  {
    name: "Classic Box Breathing",
    inhale: 4,
    hold: 4,
    exhale: 4,
    holdPostExhale: 4,
    cycles: 4,
    description: "Used by elite professionals to immediately clear performance anxiety and reset the nervous system."
  },
  {
    name: "4-7-8 Relieving Sigh",
    inhale: 4,
    hold: 7,
    exhale: 8,
    holdPostExhale: 0,
    cycles: 4,
    description: "A natural tranquilizer for the nervous system that eases the mind into peaceful sleep or focus."
  },
  {
    name: "Balanced Sama Vritti",
    inhale: 5,
    hold: 0,
    exhale: 5,
    holdPostExhale: 0,
    cycles: 5,
    description: "An equalized breathing rhythm that creates subtle equilibrium and mental clarity."
  }
];

export default function App() {
  // Session / Authorization state
  const [masterPassword, setMasterPassword] = useState<string | null>(null);
  const [witnessToken, setWitnessToken] = useState<string | null>(() => {
    return localStorage.getItem("mindfulness_journal_witness");
  });

  // Local entries dataset
  const [encryptedEntries, setEncryptedEntries] = useState<JournalEntry[]>(() => {
    const raw = localStorage.getItem("mindfulness_journal_entries");
    return raw ? JSON.parse(raw) : [];
  });
  const [unlockedEntries, setUnlockedEntries] = useState<UnlockedJournalEntry[]>([]);

  // Editor states
  const [newEntryText, setNewEntryText] = useState("");
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Authentication inputs
  const [passphraseInput, setPassphraseInput] = useState("");
  const [onboardingPassphrase, setOnboardingPassphrase] = useState("");
  const [onboardingConfirmPassphrase, setOnboardingConfirmPassphrase] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);

  // Utility alerts
  const [sysNotification, setSysNotification] = useState<{ message: string; type: "success" | "info" | "error" } | null>(null);

  // Active breathing exercise in general playground or active entry
  const [activePlaygroundExercise, setActivePlaygroundExercise] = useState<BreathingExercise>(DEFAULT_UNIVERSAL_EXERCISES[0]);

  // Effect to sync encrypted entries to localStorage
  useEffect(() => {
    localStorage.setItem("mindfulness_journal_entries", JSON.stringify(encryptedEntries));
  }, [encryptedEntries]);

  // Automatically decrypt entries when masterPassword changes or encryptedEntries changes
  useEffect(() => {
    if (!masterPassword) {
      setUnlockedEntries([]);
      return;
    }

    const decryptAll = async () => {
      const decryptedList: UnlockedJournalEntry[] = [];
      for (const item of encryptedEntries) {
        try {
          const decryptedText = await decryptText(item.encryptedBundle, masterPassword);
          const parsed = JSON.parse(decryptedText);
          decryptedList.push({
            id: item.id,
            createdAt: item.createdAt,
            entryText: parsed.entryText,
            analysis: parsed.analysis
          });
        } catch (e) {
          console.error("Single decrypter parse error on ID:", item.id, e);
          // If a key fails or is corrupted, we keep going so other records aren't blocked
        }
      }

      // Sort by date newest first
      decryptedList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setUnlockedEntries(decryptedList);
    };

    decryptAll();
  }, [masterPassword, encryptedEntries]);

  // Handle setting New Master Password (Onboarding)
  const handleOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (onboardingPassphrase.length < 6) {
      setAuthError("For proper security, please choose a password with at least 6 characters.");
      return;
    }

    if (onboardingPassphrase !== onboardingConfirmPassphrase) {
      setAuthError("Passwords do not match. Please verify your typed entry.");
      return;
    }

    try {
      // Create validation witness token
      const token = await createPhraseVerificationToken(onboardingPassphrase);
      localStorage.setItem("mindfulness_journal_witness", token);
      setWitnessToken(token);
      setMasterPassword(onboardingPassphrase);
      setNewEntryText("");
      showToast("Secure Journal Sanctuary successfully initialized!", "success");
    } catch (err: any) {
      setAuthError("Cryptographic engine error during setup: " + err.message);
    }
  };

  // Handle Unlocking Journal (Returning User)
  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!witnessToken) {
      setAuthError("Encryption system is not initialized. Please reload.");
      return;
    }

    try {
      const isValid = await verifyPassphrase(witnessToken, passphraseInput);
      if (isValid) {
        setMasterPassword(passphraseInput);
        setPassphraseInput("");
        showToast("Welcome back. Sanctuary unlocked.", "success");
      } else {
        setAuthError("Incorrect passphrase. Please try again to unlock your journal.");
      }
    } catch (err) {
      setAuthError("Decryptor failed. Ensure standard Web Cryptography is enabled.");
    }
  };

  // Helper Toast Notification
  const showToast = (message: string, type: "success" | "info" | "error" = "info") => {
    setSysNotification({ message, type });
    setTimeout(() => {
      setSysNotification(prev => prev?.message === message ? null : prev);
    }, 4500);
  };

  // Handle submitting new entry to Gemini + Encrypting & Storing
  const handleAnalyzeAndSave = async () => {
    if (!newEntryText.trim()) {
      showToast("Please express your thoughts before submitting.", "info");
      return;
    }

    if (!masterPassword) {
      showToast("Session security key not found. Please log in again.", "error");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      // 1. Send plain content to backend API
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entryText: newEntryText })
      });

      if (!res.ok) {
        const errPayload = await res.json().catch(() => ({}));
        throw new Error(errPayload.error || "Analyzing journal entry failed. Please ensure GEMINI_API_KEY is configured in your secrets.");
      }

      const analysis: GeminiAnalysis = await res.json();

      // 2. Encrypt both raw text and Gemini analysis together locally
      const dataToEncrypt = JSON.stringify({
        entryText: newEntryText,
        analysis
      });

      const encryptedBundle = await encryptText(dataToEncrypt, masterPassword);

      // 3. Create stored representation
      const newEntry: JournalEntry = {
        id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
        createdAt: new Date().toISOString(),
        encryptedBundle
      };

      setEncryptedEntries(prev => [...prev, newEntry]);
      setSelectedEntryId(newEntry.id);
      setNewEntryText("");
      showToast("Entry analyzed, encrypted and added to your private journal.", "success");

    } catch (error: any) {
      console.error(error);
      setAnalysisError(error.message || "An unknown network error occurred.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle entry deletion
  const handleDeleteEntry = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Are you absolutely sure you want to permanently delete this secure journal entry? This action is irreversible.")) {
      setEncryptedEntries(prev => prev.filter(item => item.id !== id));
      if (selectedEntryId === id) {
        setSelectedEntryId(null);
      }
      showToast("Entry permanently purged.", "success");
    }
  };

  // Lock session immediately
  const handleLockJournal = () => {
    setMasterPassword(null);
    setSelectedEntryId(null);
    setNewEntryText("");
    setPassphraseInput("");
    showToast("Journal locked securely.", "info");
  };

  // Completely wipe local system
  const handlePurgeSanctuary = () => {
    if (window.confirm("WARNING: Doing this will permanently delete your Master Password, your secure verification key, and ALL encrypted journal entries forever. There is NO recovery. Proceed?")) {
      localStorage.removeItem("mindfulness_journal_witness");
      localStorage.removeItem("mindfulness_journal_entries");
      setMasterPassword(null);
      setWitnessToken(null);
      setEncryptedEntries([]);
      setUnlockedEntries([]);
      setSelectedEntryId(null);
      setNewEntryText("");
      setOnboardingPassphrase("");
      setOnboardingConfirmPassphrase("");
      showToast("Full system purge complete.", "error");
    }
  };

  // Export encrypted backup
  const handleExportBackup = () => {
    try {
      const data = {
        witness: localStorage.getItem("mindfulness_journal_witness"),
        entries: encryptedEntries,
        exportedAt: new Date().toISOString()
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `mindfulness_journal_backup_${new Date().toISOString().slice(0,10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast("Encrypted backup exported. Save this file safely!", "success");
    } catch (err) {
      showToast("Export failed.", "error");
    }
  };

  // Import encrypted backup
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!parsed.witness || !Array.isArray(parsed.entries)) {
          showToast("Invalid backup file format. Must contain valid encryption parameters.", "error");
          return;
        }

        if (window.confirm("This will overwrite your existing private keys and append imported entries. Continue?")) {
          localStorage.setItem("mindfulness_journal_witness", parsed.witness);
          setWitnessToken(parsed.witness);
          setMasterPassword(null); // Force lock so they must unlock with the imported file's passphrase

          // Filter out duplicate IDs
          setEncryptedEntries(prev => {
            const currentIds = new Set(prev.map(i => i.id));
            const newImports = parsed.entries.filter((i: any) => !currentIds.has(i.id));
            return [...prev, ...newImports];
          });

          showToast("Data imported. Please unlock using the backup's password.", "success");
        }
      } catch (err) {
        showToast("Corrupted or parsing-failed backup file.", "error");
      }
    };
    reader.readAsText(file);
  };

  // Find the unlocked version of currently selected entry
  const activeUnlockedEntry = unlockedEntries.find(e => e.id === selectedEntryId);

  // Dynamic Theme based on active entry's emotion colorTheme or fallback to indigo
  const activeThemeId = activeUnlockedEntry?.analysis?.colorTheme || "indigo";
  const activeTheme = colorThemeMap[activeThemeId] || colorThemeMap.indigo;

  return (
    <div className="min-h-screen bg-[#fcfaf7] dark:bg-[#121312] text-[#3d423e] dark:text-[#c5cbc6] font-sans transition-colors duration-500 overflow-x-hidden selection:bg-[#5a6a5d]/10 selection:text-[#5a6a5d]">
      
      {/* Toast Alert Banner */}
      {sysNotification && (
        <div 
          id="toast-notification"
          className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl border shadow-lg text-sm transition-all duration-300 transform translate-y-0 opacity-100 max-w-sm ${
            sysNotification.type === "success" 
              ? "bg-[#f1fcf5] dark:bg-[#142319]/80 border-[#ceedda] dark:border-[#233f2d] text-[#2c6e49] dark:text-[#88d49e]"
              : sysNotification.type === "error"
              ? "bg-[#fdf3f3] dark:bg-[#281414]/80 border-[#fcd5d5] dark:border-[#422222] text-[#b33a3a] dark:text-[#f88e8e]"
              : "bg-[#f7f5f0]/95 dark:bg-[#1a1c19]/95 border-[#e8e4db] dark:border-[#2f3531] text-[#3d423e] dark:text-[#c5cbc6]"
          }`}
        >
          {sysNotification.type === "success" && <CheckCircle className="h-5 w-5 text-[#42ab6b] flex-shrink-0" id="toast-success-icon" />}
          {sysNotification.type === "error" && <AlertCircle className="h-5 w-5 text-[#d9534f] flex-shrink-0" id="toast-error-icon" />}
          {sysNotification.type === "info" && <Info className="h-5 w-5 text-[#5a6a5d] flex-shrink-0" id="toast-info-icon" />}
          <span className="font-medium">{sysNotification.message}</span>
        </div>
      )}

      {/* 1. Onboarding Screen (New User Setup) */}
      {!witnessToken && (
        <div className="flex items-center justify-center min-h-screen px-4 py-12 bg-gradient-to-b from-[#fcfaf7] to-[#f4f1ea] dark:from-[#121312] dark:to-[#171917]" id="onboarding-container">
          <div className="w-full max-w-lg p-10 bg-[#f7f5f0] dark:bg-[#1a1c19] rounded-3xl border border-[#e8e4db] dark:border-[#2f3531] shadow-xl transition-all duration-300" id="onboarding-card">
            
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center p-4 bg-[#e8ece9] dark:bg-[#222924] rounded-full mb-4 text-[#5a6a5d] dark:text-[#8ea092]" id="onboarding-header-icon">
                <Wind className="h-9 w-9 animate-pulse" />
              </div>
              <h1 className="text-3xl font-serif font-medium tracking-tight text-[#2c332e] dark:text-[#e4e9e4]" id="onboarding-title animate">
                Solace Sanctum
              </h1>
              <p className="mt-2 text-xs text-[#7a827c] dark:text-[#95a197] max-w-sm mx-auto" id="onboarding-subtitle">
                A private space for your emotional state where thoughts are fully E2E encrypted right on your client device.
              </p>
            </div>

            <div className="p-5 bg-white dark:bg-[#121312] rounded-2xl border border-[#e8e4db] dark:border-[#2f3531] text-xs leading-relaxed text-[#5a6a5d] dark:text-[#a0b0a2] space-y-2 mb-6" id="onboarding-explanation">
              <div className="flex gap-2 font-semibold text-[#2c332e] dark:text-[#e4e9e4] mb-1">
                <ShieldCheck className="h-4 w-4 text-[#5a6a5d] flex-shrink-0" />
                <span>Zero-Knowledge Secure Cryptography</span>
              </div>
              <p>
                Your journal thoughts are computationally scrambled using AES-GCM-256 and stored locally. No server, developer, or artificial model ever has access to your unencrypted key.
              </p>
            </div>

            <form onSubmit={handleOnboarding} className="space-y-4" id="onboarding-form">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#7a827c] dark:text-[#95a197] mb-1.5">
                  Choose a Master Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#b8bfb9]" id="onboarding-passphrase-icon-wrapper">
                    <Key className="h-4 w-4" />
                  </span>
                  <input
                    id="onboarding-passphrase-input"
                    type="password"
                    required
                    value={onboardingPassphrase}
                    onChange={(e) => setOnboardingPassphrase(e.target.value)}
                    placeholder="Password (minimum 6 characters)"
                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-[#121312] border border-[#e8e4db] dark:border-[#2f3531] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5a6a5d]/10 focus:border-[#5a6a5d] transition-all placeholder-[#b8bfb9] dark:placeholder-[#4f5651] text-[#2c332e] dark:text-[#e4e9e4]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#7a827c] dark:text-[#95a197] mb-1.5">
                  Confirm Master Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#b8bfb9]" id="onboarding-confirm-icon-wrapper">
                    <Lock className="h-4 w-4" />
                  </span>
                  <input
                    id="onboarding-confirm-input"
                    type="password"
                    required
                    value={onboardingConfirmPassphrase}
                    onChange={(e) => setOnboardingConfirmPassphrase(e.target.value)}
                    placeholder="Verify password"
                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-[#121312] border border-[#e8e4db] dark:border-[#2f3531] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5a6a5d]/10 focus:border-[#5a6a5d] transition-all placeholder-[#b8bfb9] dark:placeholder-[#4f5651] text-[#2c332e] dark:text-[#e4e9e4]"
                  />
                </div>
              </div>

              {authError && (
                <div className="flex items-center gap-2 p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 text-xs rounded-xl" id="onboarding-error">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <button
                id="onboarding-submit-button"
                type="submit"
                className="w-full py-3.5 px-4 bg-[#5a6a5d] hover:bg-[#4a5a4d] text-white rounded-xl text-sm font-semibold transition-all shadow-sm active:scale-98 cursor-pointer"
              >
                Create Secure Sanctum
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-[#e8e4db] dark:border-[#2f3531] text-center" id="onboarding-or-import-wrapper">
              <span className="text-xs text-[#7a827c] dark:text-[#95a197]">Have an existing backup (.json)?</span>
              <label 
                id="import-backup-label"
                className="block mt-1 cursor-pointer text-xs font-semibold text-[#5a6a5d] dark:text-[#8ea092] hover:underline"
              >
                Import encrypted backup file
                <input
                  id="onboarding-import-file-input"
                  type="file"
                  accept=".json"
                  onChange={handleImportBackup}
                  className="hidden"
                />
              </label>
            </div>

          </div>
        </div>
      )}

      {/* 2. Lock Screen (Returning User Password Entry) */}
      {witnessToken && !masterPassword && (
        <div className="flex items-center justify-center min-h-screen px-4 py-12 bg-gradient-to-b from-[#fcfaf7] to-[#f4f1ea] dark:from-[#121312] dark:to-[#171917]" id="lock-screen-container">
          <div className="w-full max-w-md p-10 bg-[#f7f5f0] dark:bg-[#1a1c19] rounded-3xl border border-[#e8e4db] dark:border-[#2f3531] shadow-xl text-center" id="lock-screen-card">
            
            <div className="inline-flex items-center justify-center p-4 bg-[#e8ece9] dark:bg-[#222924] rounded-full mb-4 text-[#5a6a5d] dark:text-[#8ea092]" id="lock-screen-badge">
              <Lock className="h-8 w-8 animate-pulse text-[#5a6a5d] dark:text-[#8ea092]" />
            </div>

            <h1 className="text-2xl font-serif font-medium tracking-tight text-[#2c332e] dark:text-[#e4e9e4]" id="lock-screen-title">
              Sanctum Locked
            </h1>
            <p className="mt-1.5 text-xs text-[#7a827c] dark:text-[#95a197] mb-6" id="lock-screen-subtitle">
              Enter your master security password to decrypt and open your private journal.
            </p>

            <form onSubmit={handleUnlock} className="space-y-4" id="lock-form">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#b8bfb9]" id="lock-input-icon">
                  <Key className="h-4 w-4" />
                </span>
                <input
                  id="lock-passphrase-input"
                  type="password"
                  required
                  value={passphraseInput}
                  onChange={(e) => setPassphraseInput(e.target.value)}
                  placeholder="Master Password"
                  autoFocus
                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-[#121312] border border-[#e8e4db] dark:border-[#2f3531] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5a6a5d]/10 focus:border-[#5a6a5d] transition-all placeholder-[#b8bfb9] dark:placeholder-[#4f5651] text-[#2c332e] dark:text-[#e4e9e4]"
                />
              </div>

              {authError && (
                <div className="flex items-center gap-2 p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 text-xs rounded-xl text-left" id="lock-error-container">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <button
                id="lock-submit-button"
                type="submit"
                className="w-full py-3.5 px-4 bg-[#5a6a5d] hover:bg-[#4a5a4d] text-white rounded-xl text-sm font-semibold transition-all shadow-sm active:scale-98 cursor-pointer"
              >
                Open Sanctum
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-[#e8e4db] dark:border-[#2f3531] flex flex-col gap-3 text-center text-xs text-[#7a827c] dark:text-[#95a197]" id="lock-footer-utilities">
              <label className="cursor-pointer text-[#5a6a5d] dark:text-[#8ea092] hover:underline font-medium animate" id="lock-import-backup">
                Import backup file (.json)
                <input
                  id="lock-import-file-input"
                  type="file"
                  accept=".json"
                  onChange={handleImportBackup}
                  className="hidden"
                />
              </label>

              <button 
                id="purge-sanctuary-button"
                onClick={handlePurgeSanctuary} 
                className="text-red-500 dark:text-red-400 hover:underline font-medium cursor-pointer"
              >
                Reset & wipe complete sanctuary data
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 3. Primary Dashboard Sanctuary (Unlocked Application) */}
      {masterPassword && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-all duration-500" id="active-sanctuary-dashboard">
          
          {/* Main Top Header */}
          <header className="flex flex-col md:flex-row md:items-center md:justify-between pb-6 mb-6 border-b border-[#e8e4db] dark:border-[#2f3531] gap-4" id="dashboard-header">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#5a6a5d] rounded-full flex items-center justify-center text-white" id="header-logo-container">
                  <Wind className="h-4.5 w-4.5" />
                </div>
                <h1 className="text-2xl font-serif font-medium tracking-tight text-[#2c332e] dark:text-[#e4e9e4]" id="header-app-title">
                  Solace Sanctum
                </h1>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-[#f0f2ef] dark:bg-[#1b211c] border border-[#e8e4db] dark:border-[#2e3b32] rounded-full text-[10px] uppercase tracking-widest font-semibold text-[#5a6a5d] dark:text-[#a0b0a2]" id="header-security-tag">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></div>
                  <span>Secure E2E</span>
                </div>
              </div>
              <p className="text-xs text-[#7a827c] dark:text-[#95a197] mt-1.5" id="header-desc font-serif">
                A secure client-encrypted space for evening reflections and emotional balance.
              </p>
            </div>

            {/* Utility buttons row */}
            <div className="flex flex-wrap items-center gap-2 md:self-center" id="header-utilities">
              <button
                id="export-backup-button"
                onClick={handleExportBackup}
                title="Export Encrypted Storage JSON"
                className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-[#1a1c19] text-[#5a6a5d] dark:text-[#a0b0a2] border border-[#e8e4db] dark:border-[#2f3531] rounded-xl text-xs font-medium hover:bg-[#fcfaf7] dark:hover:bg-[#121312] transition cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export Backup</span>
              </button>

              <label 
                id="import-backup-label-dashboard"
                className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-[#1a1c19] text-[#5a6a5d] dark:text-[#a0b0a2] border border-[#e8e4db] dark:border-[#2f3531] rounded-xl text-xs font-medium hover:bg-[#fcfaf7] dark:hover:bg-[#121312] transition cursor-pointer"
              >
                <Upload className="h-3.5 w-3.5" />
                <span>Import Backup</span>
                <input
                  id="dashboard-import-file-input"
                  type="file"
                  accept=".json"
                  onChange={handleImportBackup}
                  className="hidden"
                />
              </label>

              <button
                id="lock-dashboard-button"
                onClick={handleLockJournal}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-[#5a6a5d] hover:bg-[#4a5a4d] text-white rounded-xl text-xs font-medium transition cursor-pointer shadow-xs"
              >
                <Lock className="h-3.5 w-3.5" />
                <span>Lock Sanctum</span>
              </button>
            </div>
          </header>

          {/* Primary Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="dashboard-grid">
            
            {/* LEFT COLUMN: Entry Logs Sidebar (4 cols) */}
            <aside className="lg:col-span-4 space-y-6" id="dashboard-sidebar">
              
              {/* Write New Entry button */}
              <button
                id="write-new-entry-button"
                onClick={() => setSelectedEntryId(null)}
                className={`w-full py-3.5 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer ${
                  selectedEntryId === null 
                    ? "bg-[#5a6a5d] hover:bg-[#4a5a4d] text-white shadow-sm shadow-[#5a6a5d]/20" 
                    : "bg-white dark:bg-[#1a1c19] border border-[#e8e4db] dark:border-[#2f3531] text-[#5a6a5d] dark:text-[#a0b0a2] hover:bg-[#fcfaf7] dark:hover:bg-[#121312]"
                }`}
              >
                <Plus className="h-4 w-4" />
                <span>Express Current State</span>
              </button>

              {/* History card container */}
              <div className="bg-[#f7f5f0] dark:bg-[#1a1c19] rounded-2xl border border-[#e8e4db] dark:border-[#2f3531] shadow-xs overflow-hidden" id="entry-list-card">
                <div className="p-4 border-b border-[#e8e4db] dark:border-[#2f3531] flex items-center justify-between" id="sidebar-header">
                  <div className="flex items-center gap-2">
                    <Bookmark className="h-4 w-4 text-[#5a6a5d] dark:text-[#8ea092]" />
                    <h2 className="text-xs font-bold uppercase tracking-wider text-[#5a6a5d] dark:text-[#8ea092]">
                      Private Archives ({unlockedEntries.length})
                    </h2>
                  </div>
                </div>

                {/* Entry records */}
                <div className="divide-y divide-[#e8e4db] dark:divide-[#2f3531] max-h-[580px] overflow-y-auto" id="entries-scroller">
                  {unlockedEntries.length === 0 ? (
                    <div className="p-10 text-center" id="empty-entries-view">
                      <p className="text-xs text-[#7a827c] dark:text-[#95a197]">Your private archives are empty.</p>
                      <p className="text-[10px] text-[#b8bfb9] dark:text-[#5c685f] mt-1.5 max-w-[200px] mx-auto leading-relaxed">
                        Hold a moment of quiet, then write down your thoughts to map your mental trends.
                      </p>
                    </div>
                  ) : (
                    unlockedEntries.map((item) => {
                      const itemTheme = colorThemeMap[item.analysis.colorTheme] || colorThemeMap.indigo;
                      const isSelected = selectedEntryId === item.id;
                      const formattedDate = new Date(item.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                      });
                      const formattedTime = new Date(item.createdAt).toLocaleTimeString(undefined, {
                        hour: "2-digit",
                        minute: "2-digit"
                      });

                      return (
                        <div
                          key={item.id}
                          id={`sidebar-entry-${item.id}`}
                          onClick={() => setSelectedEntryId(item.id)}
                          className={`p-4 transition-all duration-250 cursor-pointer flex items-start gap-3 relative hover:bg-[#faf9f6]/75 dark:hover:bg-[#151715]/40 ${
                            isSelected 
                              ? "bg-[#fcfaf7] dark:bg-[#121312] border-l-4 border-[#5a6a5d] dark:border-[#8ea092]" 
                              : "border-l-4 border-transparent"
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-[10px] text-[#7a827c] dark:text-[#95a197] flex items-center gap-1 font-mono">
                                <Calendar className="h-3 w-3 shrink-0" />
                                {formattedDate} • {formattedTime}
                              </span>
                              
                              <button
                                id={`delete-entry-button-${item.id}`}
                                onClick={(e) => handleDeleteEntry(item.id, e)}
                                title="Delete securely"
                                className="text-[#b8bfb9] hover:text-red-500 dark:text-[#4f5651] dark:hover:text-red-400 p-1 rounded-sm transition"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>

                            <p className="text-xs text-[#3d423e] dark:text-[#e4e9e4] mt-1.5 line-clamp-1 font-serif">
                              {item.entryText}
                            </p>

                            <div className="flex items-center gap-2 mt-2">
                              {/* Emotion Pill */}
                              <span 
                                id={`emotion-badge-${item.id}`}
                                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${itemTheme.badge}`}
                              >
                                {item.analysis.emotion}
                              </span>
                              
                              <span className="text-[10px] text-[#7a827c] dark:text-[#95a197]">
                                Intensity: {item.analysis.intensity}/10
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Secure system stats / instructions block */}
              <div className="bg-[#f7f5f0] dark:bg-[#1a1c19] border border-[#e8e4db] dark:border-[#2f3531] p-5 rounded-2xl space-y-3" id="sidebar-privacy-info">
                <div className="flex items-center gap-2 text-[#2c332e] dark:text-[#e4e9e4]">
                  <ShieldCheck className="h-4 w-4 text-[#5a6a5d] dark:text-[#8ea092] shrink-0" />
                  <span className="text-xs font-bold uppercase tracking-wider">Sanctuary Vault Stats</span>
                </div>
                <div className="space-y-1.5 text-[11px] text-[#7a827c] dark:text-[#95a197] font-mono">
                  <div className="flex justify-between">
                    <span>Stored blocks:</span>
                    <span className="text-[#2c332e] dark:text-[#e4e9e4] font-bold">{encryptedEntries.length} items</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Algorithm:</span>
                    <span className="text-[#2c332e] dark:text-[#e4e9e4]">AES-GCM-256</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Key Stretching:</span>
                    <span className="text-[#2c332e] dark:text-[#e4e9e4]">PBKDF2 (100k)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Secure Host:</span>
                    <span className="text-[#2c332e] dark:text-[#e4e9e4]">Local-only</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-[#e8e4db] dark:border-[#2f3531] text-[10px] leading-relaxed text-[#7a827c] dark:text-[#88948b]">
                  Your password remains fully sandboxed in memory. Scrambled ciphertext blocks are generated entirely on your system before saving.
                </div>
              </div>
            </aside>

            {/* RIGHT COLUMN: Interactive Workstage Area (8 cols) */}
            <main className="lg:col-span-8" id="dashboard-main">
              
              {/* MODE A: Create New Journal Entry */}
              {selectedEntryId === null ? (
                <div className="bg-white dark:bg-[#1a1c19] rounded-3xl border border-[#e8e4db] dark:border-[#2f3531] p-6 md:p-10 shadow-sm" id="create-entry-workspace">
                  <div className="flex items-center gap-2 mb-3" id="workspace-new-header">
                    <Sparkles className="h-5 w-5 text-[#5a6a5d] dark:text-[#8ea092]" />
                    <h2 className="text-2xl font-serif text-[#2c332e] dark:text-[#e4e9e4] font-medium tracking-tight">
                      Evening Reflection
                    </h2>
                  </div>

                  <p className="text-xs text-[#7a827c] dark:text-[#95a197] mb-6 leading-relaxed" id="workspace-new-explanation">
                    Take a deep breath. Express yourself without boundaries. Reflections are analyzed in-memory via safe API loops, generating mindful exercises aligned with your state.
                  </p>

                  <div className="space-y-4" id="editor-container">
                    <textarea
                      id="journal-editor-textarea"
                      rows={8}
                      value={newEntryText}
                      onChange={(e) => setNewEntryText(e.target.value)}
                      placeholder="Start writing. How do you feel today?"
                      disabled={isAnalyzing}
                      className="w-full p-6 text-[15px] font-serif bg-[#fcfaf7] dark:bg-[#121312] border border-[#e8e4db] dark:border-[#2f3531] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#5a6a5d]/10 focus:border-[#5a6a5d] transition-all text-[#2c332e] dark:text-[#e4e9e4] placeholder-[#b8bfb9] dark:placeholder-[#4f5651] resize-y leading-relaxed"
                    />

                    {analysisError && (
                      <div className="flex items-start gap-2.5 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-400 text-xs rounded-xl" id="editor-error-box">
                        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                        <div className="space-y-1.5">
                          <p className="font-bold">Sanctuary API Interruption</p>
                          <p className="leading-relaxed">{analysisError}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between" id="editor-footer">
                      <div className="text-[11px] text-[#7a827c] dark:text-[#95a197] font-mono">
                        {newEntryText.length} characters • {newEntryText.split(/\s+/).filter(Boolean).length} words
                      </div>

                      <button
                        id="editor-submit-button"
                        onClick={handleAnalyzeAndSave}
                        disabled={isAnalyzing || !newEntryText.trim()}
                        className="px-7 py-3.5 bg-[#5a6a5d] hover:bg-[#4a5a4d] transition-all disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-sm shadow-[#5a6a5d]/20 active:scale-98"
                      >
                        {isAnalyzing ? (
                          <>
                            <Wind className="h-4 w-4 animate-spin text-white" />
                            <span>Reflecting on your words...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 text-white" />
                            <span>Submit & Reflect</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Standard Peaceful Breathing Playground when editor is idle */}
                  {!isAnalyzing && (
                    <div className="mt-10 pt-8 border-t border-[#e8e4db] dark:border-[#2f3531]" id="playground-container">
                      <div className="flex items-center gap-2 mb-4" id="playground-header">
                        <Wind className="h-5 w-5 text-[#5a6a5d] dark:text-[#8ea092]" />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-[#5a6a5d] dark:text-[#8ea092]">
                          Mindfulness Breathing Playground
                        </h3>
                      </div>
                      <p className="text-xs text-[#7a827c] dark:text-[#95a197] mb-6 leading-relaxed" id="playground-description">
                        Practice instant-grounding custom breaths right now. Select an exercise profile to load its guide:
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6" id="playground-profile-selectors">
                        {DEFAULT_UNIVERSAL_EXERCISES.map((ex, i) => (
                          <button
                            key={i}
                            id={`playground-profile-btn-${i}`}
                            onClick={() => setActivePlaygroundExercise(ex)}
                            className={`p-3.5 border rounded-xl text-left transition cursor-pointer text-xs ${
                              activePlaygroundExercise.name === ex.name
                                ? "bg-[#e8ece9]/50 dark:bg-[#1f2821]/45 border-[#5a6a5d] dark:border-[#8ea092] shadow-xs"
                                : "bg-white dark:bg-[#121312] border-[#e8e4db] dark:border-[#2f3531] hover:bg-[#faf9f6] dark:hover:bg-[#151715]"
                            }`}
                          >
                            <span className="font-bold block text-[#2c332e] dark:text-[#e4e9e4] font-serif">{ex.name}</span>
                            <span className="text-[10px] text-[#7a827c] dark:text-[#95a197] mt-1.5 block line-clamp-1">{ex.description}</span>
                          </button>
                        ))}
                      </div>

                      <BreathingVisualizer exercise={activePlaygroundExercise} themeColor="teal" />
                    </div>
                  )}

                </div>
              ) : (
                
                // MODE B: Detailed Journal Record View (Decrypted)
                activeUnlockedEntry ? (
                  <div className="space-y-6" id="detail-entry-workspace">
                    
                    {/* Active Entry Action Bar */}
                    <div className="flex items-center justify-between" id="detail-action-bar">
                      <button
                        id="back-to-writing-button"
                        onClick={() => setSelectedEntryId(null)}
                        className="flex items-center gap-1.5 text-xs text-[#5a6a5d] hover:text-[#2c332e] dark:text-[#8ea092] dark:hover:text-[#e4e9e4] transition cursor-pointer"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Return to sanctuary reflections</span>
                      </button>

                      <div className="text-xs text-[#7a827c] dark:text-[#95a197] flex items-center gap-2 font-mono">
                        <span>Journal Log #{activeUnlockedEntry.id.substring(0, 5)}</span>
                        <span>•</span>
                        <span>{new Date(activeUnlockedEntry.createdAt).toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Main Decrypted Journal Box */}
                    <div className="bg-white dark:bg-[#1a1c19] rounded-3xl border border-[#e8e4db] dark:border-[#2f3531] p-6 md:p-10 shadow-sm" id="detail-entry-card">
                      
                      {/* Section: Raw Decrypted Reflection */}
                      <fieldset className="border border-[#e8e4db] dark:border-[#2f3531] p-6 rounded-2xl mb-8 bg-[#fcfaf7] dark:bg-[#121312]" id="detail-reflection-box">
                        <legend className="px-2.5 text-xs font-bold uppercase tracking-wider text-[#5a6a5d] dark:text-[#8ea092] flex items-center gap-1.5">
                          <Bookmark className="h-3 w-3" />
                          <span>Decrypted Reflection</span>
                        </legend>
                        <p className="text-[15px] font-serif text-[#2c332e] dark:text-[#e4e9e4] leading-relaxed whitespace-pre-wrap select-text">
                          {activeUnlockedEntry.entryText}
                        </p>
                      </fieldset>

                      <hr className="border-[#e8e4db] dark:border-[#2f3531] mb-8" />

                      {/* Section: Emotion Dashboard & AI Insights */}
                      <div className="mb-8" id="detail-insight-hub">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-[#5a6a5d] dark:text-[#8ea092] mb-4 flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-[#5a6a5d] dark:text-[#8ea092]" />
                          <span>Emotional Analysis Resonance</span>
                        </h3>Complexity Control

                        {/* Emotion Metrics Layout */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center" id="insights-grid">
                          <div className={`p-6 rounded-2xl border ${activeTheme.border} ${activeTheme.bg}`} id="insight-primary-emotion">
                            <span className="text-[10px] font-bold tracking-wider uppercase text-[#7a827c] dark:text-zinc-400">Primary Tone</span>
                            <div className="flex items-baseline gap-2 mt-2">
                              <span className={`text-4xl font-serif font-semibold tracking-tight ${activeTheme.text}`}>
                                {activeUnlockedEntry.analysis.emotion}
                              </span>
                              <span className="text-[10px] text-[#7a827c] dark:text-zinc-400 font-medium font-mono">Emotion Match</span>
                            </div>

                            <div className="mt-5" id="intensity-meter">
                              <div className="flex justify-between text-xs font-medium text-[#c5cbc6] combine:mix-blend-difference mb-1">
                                <span>Intensity rating</span>
                                <span className="font-bold">{activeUnlockedEntry.analysis.intensity} / 10</span>
                              </div>
                              {/* Custom progress bar */}
                              <div className="w-full bg-[#fcfaf7]/50 dark:bg-black/30 rounded-full h-2 overflow-hidden border border-[#faf9f6]/20">
                                <div 
                                  id="intensity-fill-bar"
                                  className={`h-full rounded-full transition-all duration-1000 ${activeTheme.accent}`}
                                  style={{ width: `${activeUnlockedEntry.analysis.intensity * 10}%` }}
                                />
                              </div>
                            </div>
                          </div>

                          <div className="p-6 bg-[#faf9f6] dark:bg-[#121312] border border-[#e8e4db] dark:border-[#2f3531] rounded-2xl leading-relaxed text-xs text-[#5a6a5d] dark:text-[#a0b0a2]" id="insight-validation-box">
                            <h4 className="font-semibold text-[#2c332e] dark:text-[#e4e9e4] mb-1 font-serif">Mindfulness Coping Routine</h4>
                            <p className="mb-2 italic leading-relaxed">“{activeUnlockedEntry.analysis.copingMechanism}”</p>
                            <span className="text-[10px] text-[#7a827c] dark:text-zinc-550 block pt-1.5 mt-2 border-t border-[#e8e4db] dark:border-[#2f3531] font-mono">
                              Validated locally via memory pipeline with Gemini Flash.
                            </span>
                          </div>
                        </div>

                        {/* Support Commentary Word Block */}
                        <div className="mt-4 p-6 bg-[#faf9f6] dark:bg-[#121312] border border-[#e8e4db] dark:border-[#2f3531] rounded-2xl" id="insight-response-text">
                          <p className="text-[10px] text-[#7a827c] dark:text-[#95a197] uppercase tracking-wider font-bold mb-2">Empathetic Response</p>
                          <p className="text-sm font-serif text-[#3d423e] dark:text-[#e4e9e4] italic leading-relaxed">
                            {activeUnlockedEntry.analysis.shortResponseText}
                          </p>
                        </div>
                      </div>

                      <hr className="border-[#e8e4db] dark:border-[#2f3531] mb-8" />

                      {/* Section: Uplifting Affirmative Quote Card */}
                      <blockquote className="relative p-6 md:p-8 bg-gradient-to-r from-[#e8ece9]/30 to-white dark:from-[#222924]/20 dark:to-[#1a1c19] border-l-4 border-[#5a6a5d] dark:border-[#8ea092] rounded-r-2xl m-0 mb-8 shadow-xs" id="detail-quote-block">
                        <p className="text-base md:text-[17px] text-[#2c332e] dark:text-[#e4e9e4] font-serif italic leading-relaxed relative z-10">
                          “{activeUnlockedEntry.analysis.quote}”
                        </p>
                        <cite className="block text-[10px] font-semibold uppercase tracking-widest text-[#7a827c] dark:text-[#95a197] mt-3 not-italic font-mono">
                          — {activeUnlockedEntry.analysis.quoteAuthor}
                        </cite>
                      </blockquote>

                      <hr className="border-[#e8e4db] dark:border-[#2f3531] mb-8" />

                      {/* Section: Tailored Dynamic Breathing Exercise Companion */}
                      <div id="detail-breathing-section">
                        <div className="flex items-center gap-2 mb-4" id="breathing-companion-header">
                          <Wind className="h-5 w-5 text-[#5a6a5d] dark:text-[#8ea092]" />
                          <h4 className="text-xs font-bold uppercase tracking-wider text-[#5a6a5d] dark:text-[#8ea092]">
                            Custom Breathing Resonance Guide
                          </h4>
                        </div>
                        
                        <p className="text-xs text-[#7a827c] dark:text-[#95a197] mb-6 leading-relaxed" id="breathing-companion-explanation">
                          Gemini has computed a custom breathing frequency based specifically on your emotional intensity level. Practice it below to alleviate tension.
                        </p>

                        <BreathingVisualizer 
                          exercise={activeUnlockedEntry.analysis.breathingExercise} 
                          themeColor={activeUnlockedEntry.analysis.colorTheme} 
                        />
                      </div>

                    </div>
                  </div>
                ) : (
                  <div className="p-12 text-center bg-white dark:bg-[#1a1c19] rounded-3xl border border-[#e8e4db] dark:border-[#2f3531] shadow-xs" id="detail-corrupted-placeholder">
                    <p className="text-xs text-red-500 font-mono">Error loading journal decrypted entry memory block.</p>
                  </div>
                )
              )}

            </main>

          </div>
        </div>
      )}

    </div>
  );
}

// ==========================================
// CALMING INTERACTIVE BREATHING COMPONENT
// ==========================================
interface VisualizerProps {
  exercise: BreathingExercise;
  themeColor: string;
}

function BreathingVisualizer({ exercise, themeColor }: VisualizerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [phase, setPhase] = useState<"Inhale" | "Hold" | "Exhale" | "Hold (Empty)">("Inhale");
  const [secondsLeft, setSecondsLeft] = useState(exercise.inhale);
  const [cyclesCompleted, setCyclesCompleted] = useState(1);

  // References to keep callbacks current and avoid timing state drift
  const cycleRef = useRef(1);
  const phaseRef = useRef<"Inhale" | "Hold" | "Exhale" | "Hold (Empty)">("Inhale");

  // Reset exercise states whenever the exercise changes
  useEffect(() => {
    setIsPlaying(false);
    setPhase("Inhale");
    setSecondsLeft(exercise.inhale);
    setCyclesCompleted(1);
    cycleRef.current = 1;
    phaseRef.current = "Inhale";
  }, [exercise]);

  // Interval timer for breathing guide
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    if (isPlaying) {
      timer = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            // Determine and transition to next breathing state
            let nextPhase: typeof phase = "Inhale";
            let nextSeconds = exercise.inhale;

            if (phaseRef.current === "Inhale") {
              if (exercise.hold > 0) {
                nextPhase = "Hold";
                nextSeconds = exercise.hold;
              } else {
                nextPhase = "Exhale";
                nextSeconds = exercise.exhale;
              }
            } else if (phaseRef.current === "Hold") {
              nextPhase = "Exhale";
              nextSeconds = exercise.exhale;
            } else if (phaseRef.current === "Exhale") {
              if (exercise.holdPostExhale > 0) {
                nextPhase = "Hold (Empty)";
                nextSeconds = exercise.holdPostExhale;
              } else {
                nextPhase = "Inhale";
                nextSeconds = exercise.inhale;
                cycleRef.current += 1;
                setCyclesCompleted(cycleRef.current);
              }
            } else if (phaseRef.current === "Hold (Empty)") {
              nextPhase = "Inhale";
              nextSeconds = exercise.inhale;
              cycleRef.current += 1;
              setCyclesCompleted(cycleRef.current);
            }

            phaseRef.current = nextPhase;
            setPhase(nextPhase);
            return nextSeconds;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, exercise]);

  // Animation scaling mapped based on active phase
  let currentCircleScale = "scale-100";
  if (isPlaying) {
    if (phase === "Inhale") {
      currentCircleScale = "scale-175 duration-[4000ms] ease-out";
    } else if (phase === "Hold") {
      currentCircleScale = "scale-175 duration-1000 ease-in-out pulse-glow";
    } else if (phase === "Exhale") {
      currentCircleScale = "scale-100 duration-[4000ms] ease-in";
    } else {
      currentCircleScale = "scale-100 duration-1000 ease-in-out";
    }
  }

  // Visual text hints for user validation
  const promptMessageMap = {
    "Inhale": "Expand your lungs... breathe in slow",
    "Hold": "Pause... float on the breath",
    "Exhale": "Let it all release... empty completely",
    "Hold (Empty)": "Rest... sit in the tranquility"
  };

  // Profile theme configuration classes
  const themeAccentStyleMap: Record<string, string> = {
    indigo: "from-indigo-400 to-violet-500 hover:from-indigo-500 hover:to-violet-600 shadow-indigo-100 text-indigo-600 dark:text-indigo-400 shadow-xs",
    teal: "from-teal-400 to-emerald-500 hover:from-teal-500 hover:to-emerald-600 shadow-teal-100 text-teal-600 dark:text-teal-400 shadow-xs",
    amber: "from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 shadow-amber-100 text-amber-600 dark:text-amber-400 shadow-xs",
    rose: "from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600 shadow-rose-100 text-rose-600 dark:text-rose-400 shadow-xs",
    emerald: "from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 shadow-emerald-100 text-emerald-600 dark:text-emerald-400 shadow-xs",
    sky: "from-sky-400 to-indigo-500 hover:from-sky-500 hover:to-indigo-600 shadow-sky-100 text-sky-600 dark:text-sky-400 shadow-xs",
    violet: "from-violet-400 to-fuchsia-500 hover:from-violet-500 hover:to-fuchsia-600 shadow-violet-100 text-violet-600 dark:text-violet-400 shadow-xs",
    fuchsia: "from-fuchsia-400 to-pink-500 hover:from-fuchsia-500 hover:to-pink-600 shadow-fuchsia-100 text-fuchsia-600 dark:text-fuchsia-400 shadow-xs"
  };

  const activeAccent = themeAccentStyleMap[themeColor] || themeAccentStyleMap.indigo;

  return (
    <div className="p-6 bg-[#faf9f6]/60 dark:bg-[#121312]/60 border border-[#e8e4db] dark:border-[#2f3531] rounded-2xl" id="breathing-visual-container">
      
      {/* Title & Setup Details */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6" id="visualizer-headline">
        <div>
          <h5 className="font-serif font-medium text-[#2c332e] dark:text-[#e4e9e4] text-base" id="exercise-name">
            {exercise.name}
          </h5>
          <p className="text-xs text-[#7a827c] dark:text-[#95a197] mt-0.5" id="exercise-description">
            {exercise.description}
          </p>
        </div>

        {/* Phase states badge */}
        <div className="flex items-center gap-1.5 self-start sm:self-center" id="exercise-intervals-row">
          <span className="text-[10px] font-mono px-2 py-1 bg-[#ffffff] dark:bg-[#1a1c19] border border-[#e8e4db] dark:border-[#2f3531] rounded-md text-[#5a6a5d] dark:text-[#8ea092]">
            In: {exercise.inhale}s
          </span>
          {exercise.hold > 0 && (
            <span className="text-[10px] font-mono px-2 py-1 bg-[#ffffff] dark:bg-[#1a1c19] border border-[#e8e4db] dark:border-[#2f3531] rounded-md text-[#5a6a5d] dark:text-[#8ea092]">
              Hold: {exercise.hold}s
            </span>
          )}
          <span className="text-[10px] font-mono px-2 py-1 bg-[#ffffff] dark:bg-[#1a1c19] border border-[#e8e4db] dark:border-[#2f3531] rounded-md text-[#5a6a5d] dark:text-[#8ea092]">
            Out: {exercise.exhale}s
          </span>
          {exercise.holdPostExhale > 0 && (
            <span className="text-[10px] font-mono px-2 py-1 bg-[#ffffff] dark:bg-[#1a1c19] border border-[#e8e4db] dark:border-[#2f3531] rounded-md text-[#5a6a5d] dark:text-[#8ea092]">
              Rest: {exercise.holdPostExhale}s
            </span>
          )}
        </div>
      </div>

      {/* Main Breathing Core animation */}
      <div className="flex flex-col items-center justify-center py-10" id="visualizer-stage">
        
        {/* Calm expanding/shrinking ring element */}
        <div className="relative flex items-center justify-center w-52 h-52 mb-8" id="pulse-bubble-wrapper">
          
          {/* Glowing Aura Ring */}
          <div 
            id="aura-ring"
            className={`absolute rounded-full w-24 h-24 bg-gradient-to-r opacity-20 blur-xl transition-all duration-1000 ${
              isPlaying ? "scale-220 opacity-30" : "scale-100"
            } ${activeAccent}`}
          />

          {/* Centered Pulse Circle (Transitions natively utilizing scale transforms computed above) */}
          <div 
            id="lungs-guide-bubble"
            className={`absolute w-12 h-12 rounded-full bg-gradient-to-tr opacity-75 shadow-lg transform transition-all ${currentCircleScale} ${activeAccent}`}
          />

          {/* Prompt labels Overlay */}
          <div className="relative text-center z-10 flex flex-col items-center justify-center p-3" id="hud-overlay-text">
            <span className="text-3xl font-serif font-semibold tracking-tight text-white drop-shadow-xs" id="hud-timer">
              {secondsLeft}s
            </span>
            <span className="text-[9px] uppercase tracking-widest font-bold text-white/90 drop-shadow-xs mt-1" id="hud-phase">
              {phase}
            </span>
          </div>
        </div>

        {/* Guiding validation commentary message */}
         <p className="text-xs text-[#7a827c] dark:text-[#95a197] font-medium italic text-center h-4 max-w-sm" id="calm-instruction-prompt">
          {isPlaying ? promptMessageMap[phase] : "Ready to align. Tap start to begin custom breathing."}
        </p>

        {/* Control toolbar row */}
        <div className="flex items-center gap-3 mt-8" id="breathing-controls">
          <button
            id="breathing-start-pause-btn"
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-5 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer text-white bg-gradient-to-r shadow-xs ${activeAccent}`}
          >
            {isPlaying ? (
              <>
                <Pause className="h-3 w-3 fill-white" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="h-3 w-3 fill-white" />
                <span>Start Practice</span>
              </>
            )}
          </button>

          <button
            id="breathing-reset-btn"
            onClick={() => {
              setIsPlaying(false);
              setPhase("Inhale");
              setSecondsLeft(exercise.inhale);
              setCyclesCompleted(1);
              cycleRef.current = 1;
              phaseRef.current = "Inhale";
            }}
            title="Reset Breathing Loop"
            className="p-2.5 bg-white hover:bg-[#faf9f6] dark:bg-[#121312] dark:hover:bg-[#1c1d1a] text-[#5a6a5d] dark:text-[#8ea092] border border-[#e8e4db] dark:border-[#2f3531] rounded-xl transition cursor-pointer"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          <div className="text-[10px] font-mono text-[#7a827c] dark:text-[#95a197] pl-3 border-l border-[#e8e4db] dark:border-[#2f3531]" id="breathing-cycles-counter">
            Cycles Completed: <span className="font-bold text-[#2c332e] dark:text-[#e4e9e4]">{cyclesCompleted}</span>
          </div>
        </div>

      </div>

    </div>
  );
}
