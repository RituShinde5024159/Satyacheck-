import React from 'react';
import type { VerificationReport } from '../../types';
import { ShieldCheck, Printer } from 'lucide-react';
import { Badge } from '../common/Badge';

interface ProofCardProps {
  report: VerificationReport;
}

export const ProofCard: React.FC<ProofCardProps> = ({ report }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Action Bar */}
      <div className="flex items-center justify-between no-print">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#516260]">
          Print-Friendly Proof Card
        </span>
        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded bg-[#155E59] text-white hover:bg-[#0F4541] transition-colors cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print / Save as PDF</span>
        </button>
      </div>

      {/* Printable Card Container */}
      <div 
        id="printable-proof-card"
        className="rounded border-2 border-[#155E59] bg-white p-6 space-y-5 text-[#202B2A] shadow-xs print:border-black print:p-8 print:shadow-none"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E2E7E4] pb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-[#155E59] text-white flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base tracking-tight leading-none text-[#202B2A]">
                Satya<span className="text-[#155E59]">Check</span>
              </h3>
              <span className="text-[10px] text-[#798B89] uppercase tracking-wider font-semibold">
                Evidence Verification Audit Card
              </span>
            </div>
          </div>

          <div className="text-right text-[11px] text-[#516260]">
            <div>Ref: <strong className="font-mono text-[#202B2A]">{report.id}</strong></div>
            <div>Date: {report.submittedAt}</div>
          </div>
        </div>

        {/* Input Text */}
        <div className="space-y-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#798B89]">
            Submitted Content:
          </span>
          <p className="text-xs font-medium text-[#202B2A] bg-[#FAFAF7] p-2.5 rounded border border-[#E8ECE9]">
            "{report.rawInput}"
          </p>
        </div>

        {/* Individual Claims Summary Table */}
        <div className="space-y-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#798B89]">
            Independent Claim Determinations ({report.claims.length}):
          </span>

          <div className="space-y-3">
            {report.claims.map((claim, idx) => (
              <div 
                key={claim.id}
                className="p-3 rounded border border-[#E2E7E4] bg-[#FAFAF7] text-xs space-y-2"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="font-semibold text-[#202B2A]">
                    Claim {idx + 1}: "{claim.originalText}"
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Badge verdict={claim.verdict} size="sm" />
                    <Badge evidenceQuality={claim.evidenceQuality} size="sm" />
                  </div>
                </div>

                <p className="text-[11px] text-[#516260] leading-relaxed">
                  {claim.explanation}
                </p>

                {/* Primary Source Reference */}
                {claim.sources.length > 0 && (
                  <div className="text-[10px] text-[#798B89] pt-1 border-t border-[#E8ECE9] flex items-center justify-between">
                    <span>Source: <strong className="text-[#202B2A]">{claim.sources[0].publisher}</strong></span>
                    {claim.sources[0].publishedDate && (
                      <span>Published: {claim.sources[0].publishedDate}</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Proof Footer */}
        <div className="border-t border-[#E2E7E4] pt-3 flex flex-col sm:flex-row items-center justify-between text-[10px] text-[#798B89] gap-2">
          <span>Evaluated through direct source comparison and temporal timestamp verification.</span>
          <span className="font-mono">satyacheck.org/verify</span>
        </div>
      </div>
    </div>
  );
};
