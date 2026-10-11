import type { 
  VerificationReport, 
  SupportedLanguage, 
  InputMode, 
  ExtractedClaim 
} from '../types';
import { DEMONSTRATION_REPORTS } from '../data/demonstrationReports';

// API base URL configured via environment variable, defaults to standard local FastAPI port
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export interface VerifyTextRequest {
  text: string;
  language: SupportedLanguage;
}

export interface VerifyUrlRequest {
  url: string;
  language: SupportedLanguage;
}

export interface HealthCheckResponse {
  status: string;
  version?: string;
  connected: boolean;
  searchEngine?: string;
}

/** Error thrown when the backend is reachable but returns a non-OK status. */
export class BackendError extends Error {
  constructor(
    public readonly httpStatus: number,
    public readonly detail: string,
  ) {
    super(detail);
    this.name = 'BackendError';
  }
}

/**
 * Checks connectivity to the FastAPI backend service.
 * Returns connected:false (no throw) when the backend is unreachable.
 */
export async function checkBackendHealth(): Promise<HealthCheckResponse> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    
    const response = await fetch(`${API_BASE_URL}/api/health`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      const data = await response.json();
      return {
        status: data.status || 'ok',
        version: data.version,
        connected: true,
        searchEngine: data.search_engine,
      };
    }
    return { status: 'unreachable', connected: false };
  } catch {
    return { status: 'offline', connected: false };
  }
}

/**
 * Client-side demonstration fallback parser.
 * Matches benchmark demo cases or returns a safe, unverified report for arbitrary text.
 * ONLY called explicitly for demonstration scenarios — never as a silent live-request fallback.
 */
export function generateFallbackDemonstrationReport(
  input: string, 
  mode: InputMode, 
  language: SupportedLanguage,
  meta?: { fileName?: string; fileSize?: number; url?: string }
): VerificationReport {
  const normalized = input.toLowerCase();

  // Match against known demonstration scenarios
  if (normalized.includes('shishyavrutti') || normalized.includes('scholarship') || normalized.includes('50,000') || normalized.includes('50000')) {
    return DEMONSTRATION_REPORTS[0];
  }
  if (normalized.includes('curfew') || normalized.includes('lockdown') || normalized.includes('weekend') || (meta?.fileName && meta.fileName.includes('curfew'))) {
    return DEMONSTRATION_REPORTS[1];
  }
  if (normalized.includes('salt') || normalized.includes('hypertension') || normalized.includes('himalayan')) {
    return DEMONSTRATION_REPORTS[2];
  }
  if (normalized.includes('european union') || normalized.includes('ai act') || normalized.includes('2024/1689') || (meta?.url && meta.url.includes('eur-lex'))) {
    return DEMONSTRATION_REPORTS[3];
  }
  if (normalized.includes('ward 14') || normalized.includes('pune') || normalized.includes('tax collection') || normalized.includes('offline counters')) {
    return DEMONSTRATION_REPORTS[4];
  }

  // Safe abstention report for arbitrary unindexed demonstration inputs
  const genericClaim: ExtractedClaim = {
    id: `claim-${Math.floor(1000 + Math.random() * 9000)}`,
    originalText: input.length > 250 ? `${input.slice(0, 247)}...` : input,
    normalizedClaim: input.trim(),
    verdict: 'Cannot confirm',
    evidenceQuality: 'Absent',
    explanation: 'No corroborated evidence passages were located in demonstration archives for this specific assertion. In demonstration mode with no live search backend connected, SatyaCheck refrains from generating ungrounded conclusions.',
    diff: {
      supportedDetails: [],
      mismatches: []
    },
    temporal: {
      isExpired: false,
      temporalNote: 'No time-stamped official records retrieved for this query.'
    },
    safeAbstentionReason: 'Live search backend is currently disconnected. In accordance with safe abstention protocols, an unsubstantiated verdict is safely withheld.',
    sources: []
  };

  return {
    id: `report-${Date.now()}`,
    submittedAt: new Date().toISOString().split('T')[0],
    inputMode: mode,
    language,
    rawInput: input,
    sourceFileName: meta?.fileName,
    sourceFileSize: meta?.fileSize,
    sourceUrl: meta?.url,
    overallSummary: 'Demonstration run completed. Because the live retrieval engine is offline, evidence is absent for arbitrary input. SatyaCheck returned "Cannot confirm" in compliance with safe abstention rules.',
    claims: [genericClaim],
    isDemonstration: true
  };
}

/**
 * Call the backend and parse the response.
 * - On 200: return the report.
 * - On 4xx/5xx: throw BackendError with the server detail message.
 * - On network failure (fetch throws): throw the original error so the caller
 *   can decide whether to show a demo or an error state.
 */
async function callBackend(url: string, options: RequestInit): Promise<VerificationReport> {
  const response = await fetch(url, options);

  if (response.ok) {
    const data = await response.json();
    return { ...data, isDemonstration: false };
  }

  // Parse FastAPI error detail
  let detail = `HTTP ${response.status}`;
  try {
    const errorBody = await response.json();
    if (typeof errorBody.detail === 'string') {
      detail = errorBody.detail;
    } else if (Array.isArray(errorBody.detail)) {
      // Pydantic validation errors — extract first message
      detail = errorBody.detail.map((e: { msg: string }) => e.msg).join('; ');
    }
  } catch { /* ignore parse error */ }

  throw new BackendError(response.status, detail);
}

/**
 * Verification for raw text input.
 * Throws BackendError if the backend returns a non-OK status.
 * Throws TypeError/DOMException if the backend is unreachable (caller handles).
 */
export async function verifyText(text: string, language: SupportedLanguage): Promise<VerificationReport> {
  return callBackend(`${API_BASE_URL}/api/verify/text`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, language })
  });
}

/**
 * Verification for uploaded image/screenshot.
 */
export async function verifyImage(file: File, language: SupportedLanguage): Promise<VerificationReport> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('language', language);
  return callBackend(`${API_BASE_URL}/api/verify/image`, { method: 'POST', body: formData });
}

/**
 * Verification for uploaded PDF document.
 */
export async function verifyPdf(file: File, language: SupportedLanguage): Promise<VerificationReport> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('language', language);
  return callBackend(`${API_BASE_URL}/api/verify/pdf`, { method: 'POST', body: formData });
}

/**
 * Verification for public URL link.
 */
export async function verifyUrl(url: string, language: SupportedLanguage): Promise<VerificationReport> {
  return callBackend(`${API_BASE_URL}/api/verify/url`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, language })
  });
}

/**
 * Retrieve report by ID.
 * Checks local demonstration collection first, then backend.
 */
export async function getReportById(id: string): Promise<VerificationReport | null> {
  // Check local demonstration collection first
  const demo = DEMONSTRATION_REPORTS.find((r) => r.id === id);
  if (demo) {
    return demo;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/reports/${encodeURIComponent(id)}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    if (response.ok) {
      return await response.json();
    }
  } catch {
    // Backend offline
  }

  return null;
}
