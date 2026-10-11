import React, { useState } from 'react';
import type { VerificationReport } from '../../types';
import { 
  Copy, 
  Check, 
  RotateCcw, 
  Printer, 
  FileText, 
  Globe, 
  Image, 
  File, 
  Sparkles,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Button } from '../common/Button';
import { ClaimCard } from './ClaimCard';
import { ProofCard } from './ProofCard';

interface ReportViewProps {
  report: VerificationReport;
  onReset: () => void;
}

export const ReportView: React.FC<ReportViewProps> = ({ report, onReset }) => {
  const [copied, setCopied] = useState(false);
  const [showProofCard, setShowProofCard] = useState(false);

  const handleCopySummary = async () => {
    const text = generateReportSummaryText(report);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback for clipboard if permissions restricted
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="space-y-6">
      {/* Demonstration disclaimer if sample */}
      {report.isDemonstration && (
        <div className="p-3.5 rounded bg-[#E8ECE9]/70 border border-[#DCE2DF] text-xs text-[#516260] flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-[#155E59] shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-semibold text-[#202B2A]">
              Demonstration Report (Sample Data):
            </span>
            <p className="leading-relaxed">
              This report represents a curated benchmark case illustrating multi-claim extraction, passage diffs, and temporal verification. Live search retrieval APIs are currently offline.
            </p>
          </div>
        </div>
      )}

      {/* Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-md border border-[#E2E7E4] bg-white no-print">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#798B89]">
            Report ID:
          </span>
          <span className="font-mono text-xs font-medium text-[#202B2A] bg-[#FAFAF7] px-2 py-0.5 rounded border border-[#E8ECE9]">
            {report.id}
          </span>
          <span className="text-xs text-[#798B89]">• {report.submittedAt}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="subtle"
            size="sm"
            onClick={handleCopySummary}
            icon={copied ? <Check className="w-3.5 h-3.5 text-[#165B36]" /> : <Copy className="w-3.5 h-3.5" />}
          >
            {copied ? 'Summary Copied!' : 'Copy Summary'}
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setShowProofCard(!showProofCard)}
            icon={<Printer className="w-3.5 h-3.5" />}
          >
            {showProofCard ? 'Hide Proof Card' : 'Proof Card'}
          </Button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={onReset}
            icon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Verify Another
          </Button>
        </div>
      </div>

      {/* Submitted Content Header Card */}
      <div className="rounded-md border border-[#DCE2DF] bg-white p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E8ECE9] pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#516260]">
              Audited Submission
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded bg-[#E8ECE9] text-[#202B2A]">
              {report.inputMode === 'text' && <FileText className="w-3 h-3 text-[#155E59]" />}
              {report.inputMode === 'image' && <Image className="w-3 h-3 text-[#155E59]" />}
              {report.inputMode === 'pdf' && <File className="w-3 h-3 text-[#155E59]" />}
              {report.inputMode === 'url' && <Globe className="w-3 h-3 text-[#155E59]" />}
              <span className="capitalize">{report.inputMode} Input</span>
            </span>
            <span className="text-[11px] text-[#798B89] uppercase font-mono px-1.5 py-0.5 rounded bg-[#FAFAF7] border border-[#E8ECE9]">
              Lang: {report.language}
            </span>
          </div>

          {report.sourceFileName && (
            <span className="text-xs text-[#516260] font-mono">
              File: {report.sourceFileName}
            </span>
          )}

          {report.sourceUrl && (
            <a
              href={report.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs text-[#155E59] hover:underline"
            >
              <span>{report.sourceUrl.replace(/^https?:\/\//, '').slice(0, 30)}...</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>

        {/* Raw Input Text */}
        <div className="space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#798B89]">
            Original Submitted Text / Caption:
          </span>
          <p className="text-sm font-medium text-[#202B2A] bg-[#FAFAF7] p-3 rounded border border-[#E8ECE9] leading-relaxed">
            "{report.rawInput}"
          </p>
        </div>

        {/* Overall Synthesis */}
        <div className="space-y-1 pt-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#798B89]">
            Overall Evidence Synthesis:
          </span>
          <p className="text-xs sm:text-sm text-[#202B2A] leading-relaxed">
            {report.overallSummary}
          </p>
        </div>
      </div>

      {/* Extracted Atomic Claims Section */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <div>
            <h3 className="text-base font-bold text-[#202B2A] tracking-tight">
              Independently Evaluated Factual Claims ({report.claims.length})
            </h3>
            <p className="text-xs text-[#516260]">
              Complex messages are decomposed so each factual assertion receives its own evidence-backed determination.
            </p>
          </div>
        </div>

        {/* Render each claim */}
        <div className="space-y-4">
          {report.claims.map((claim, index) => (
            <ClaimCard key={claim.id} claim={claim} index={index} />
          ))}
        </div>
      </div>

      {/* Print-Friendly Proof Card Section (Collapsible toggle or inline) */}
      <div className="rounded-md border border-[#DCE2DF] bg-white p-4 space-y-4">
        <button
          type="button"
          onClick={() => setShowProofCard(!showProofCard)}
          className="w-full flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#202B2A] cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-[#155E59]" />
            <span>Print-Friendly Proof Card & Export</span>
          </span>
          {showProofCard ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showProofCard && (
          <div className="pt-3 border-t border-[#E8ECE9]">
            <ProofCard report={report} />
          </div>
        )}
      </div>

      {/* Bottom Start Another CTA */}
      <div className="p-4 rounded-md border border-[#E2E7E4] bg-[#FAFAF7] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <span className="text-[#516260]">
          Want to audit another claim, forward, image screenshot, or web link?
        </span>
        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={onReset}
          icon={<RotateCcw className="w-3.5 h-3.5" />}
        >
          Verify Another Claim
        </Button>
      </div>
    </div>
  );
};

function generateReportSummaryText(report: VerificationReport): string {
  const lines: string[] = [
    `========================================`,
    `SATYACHECK VERIFICATION REPORT`,
    `Report Reference: ${report.id}`,
    `Date: ${report.submittedAt}`,
    `Input Mode: ${report.inputMode.toUpperCase()}`,
    `Language: ${report.language.toUpperCase()}`,
    `========================================`,
    ``,
    `SUBMITTED INPUT:`,
    `"${report.rawInput}"`,
  ];

  if (report.sourceFileName) {
    lines.push(`Source File: ${report.sourceFileName}`);
  }
  if (report.sourceUrl) {
    lines.push(`Source URL: ${report.sourceUrl}`);
  }

  lines.push(
    ``,
    `OVERALL AUDIT SUMMARY:`,
    report.overallSummary,
    ``,
    `EXTRACTED INDEPENDENT CLAIMS (${report.claims.length}):`
  );

  report.claims.forEach((claim, idx) => {
    lines.push(
      `----------------------------------------`,
      `CLAIM ${idx + 1}: "${claim.originalText}"`,
      `VERDICT: ${claim.verdict}`,
      `EVIDENCE QUALITY: ${claim.evidenceQuality}`,
      `EXPLANATION: ${claim.explanation}`
    );

    if (claim.safeAbstentionReason) {
      lines.push(`SAFE ABSTENTION NOTE: ${claim.safeAbstentionReason}`);
    }

    if (claim.diff.mismatches.length > 0) {
      lines.push(`CLAIM-TO-EVIDENCE MISMATCHES:`);
      claim.diff.mismatches.forEach((m) => {
        lines.push(`  - [${m.field.toUpperCase()}]: Claim states "${m.claimValue}" vs Evidence "${m.evidenceValue}" (${m.explanation})`);
      });
    }

    if (claim.temporal.publishedDate) {
      lines.push(`TEMPORAL RECORD: Published ${claim.temporal.publishedDate}${claim.temporal.isExpired ? ' [OUTDATED / SUPERSEDED]' : ''}`);
    }

    if (claim.sources.length > 0) {
      lines.push(`PRIMARY SOURCES:`);
      claim.sources.forEach((s) => {
        lines.push(`  - ${s.publisher}: "${s.passageText}" (${s.url})`);
      });
    }
  });

  lines.push(
    ``,
    `========================================`,
    `Evaluated through empirical source comparison and temporal verification.`,
    `SatyaCheck — Transparent Evidence Auditing`,
    `https://satyacheck.org`
  );

  return lines.join('\n');
}
