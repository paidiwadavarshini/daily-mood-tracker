/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface BreathingExercise {
  name: string;
  inhale: number;
  hold: number;
  exhale: number;
  holdPostExhale: number;
  cycles: number;
  description: string;
}

export interface GeminiAnalysis {
  emotion: string;
  intensity: number;
  colorTheme: "indigo" | "teal" | "amber" | "rose" | "emerald" | "sky" | "violet" | "fuchsia" | string;
  shortResponseText: string;
  copingMechanism: string;
  breathingExercise: BreathingExercise;
  quote: string;
  quoteAuthor: string;
}

export interface JournalEntry {
  id: string;
  createdAt: string;
  // This stores the base64 encrypted bundle of { entryText: string, analysis: GeminiAnalysis }
  encryptedBundle: string;
}

export interface UnlockedJournalEntry {
  id: string;
  createdAt: string;
  entryText: string;
  analysis: GeminiAnalysis;
}
