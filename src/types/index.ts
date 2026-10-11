// SatyaCheck Core Domain Types

export type Verdict = 
  | 'Verified'
  | 'False'
  | 'Outdated'
  | 'Partly supported'
  | 'Cannot confirm';

export type EvidenceQuality = 
  | 'Strong'
  | 'Limited'
  | 'Conflicting'
  | 'Absent';

export type InputMode = 'text' | 'image' | 'pdf' | 'url';

export type SupportedLanguage = 'en' | 'hi' | 'mr';

export type ClaimCategory = 
  | 'Public Health'
  | 'Economics'
  | 'Science & Climate'
  | 'Policy & Governance'
  | 'Technology'
  | 'General Media';

export interface SourcePassage {
  id: string;
  publisher: string;
  url: string;
  title: string;
  publishedDate?: string;
  lastUpdatedDate?: string;
  passageText: string;
  stance: 'supports' | 'refutes' | 'partial' | 'inconclusive';
}

export interface ClaimMismatch {
  field: string; // e.g., "Amount", "Eligibility", "Deadline", "Causal Link"
  claimValue: string;
  evidenceValue: string;
  explanation: string;
}

export interface ClaimDiff {
  supportedDetails: string[];
  mismatches: ClaimMismatch[];
}

export interface TemporalDetails {
  claimTimeframe?: string;
  evidencePublishedDate?: string;
  evidenceUpdatedDate?: string;
  expiryDeadline?: string;
  isExpired: boolean;
  temporalNote: string;
}

export interface ExtractedClaim {
  id: string;
  originalText: string;
  normalizedClaim: string;
  verdict: Verdict;
  evidenceQuality: EvidenceQuality;
  explanation: string;
  diff: ClaimDiff;
  temporal: TemporalDetails;
  sources: SourcePassage[];
  safeAbstentionReason?: string;
}

export interface VerificationReport {
  id: string;
  submittedAt: string;
  inputMode: InputMode;
  language: SupportedLanguage;
  rawInput: string;
  sourceFileName?: string;
  sourceFileSize?: number;
  sourceUrl?: string;
  overallSummary: string;
  claims: ExtractedClaim[];
  isDemonstration: boolean;
  category?: ClaimCategory;
}

export interface NavLinkItem {
  name: string;
  path: string;
}

// Legacy compatibility types for benchmark audit archives
export type VerdictType = 'verified_true' | 'mostly_true' | 'misleading' | 'fabricated' | 'unsubstantiated';

export interface LegacySource {
  id: string;
  title: string;
  publisher: string;
  url: string;
  credibilityScore: number;
  publishedDate: string;
  excerpt: string;
  stance: 'supports' | 'refutes' | 'contextualizes';
}

export interface ClaimVerification {
  id: string;
  claim: string;
  claimant?: string;
  timestamp: string;
  category: ClaimCategory;
  verdict: VerdictType;
  verdictLabel: string;
  confidenceScore: number;
  summary: string;
  methodologyNotes: string;
  fallaciesIdentified?: string[];
  sources: LegacySource[];
}
