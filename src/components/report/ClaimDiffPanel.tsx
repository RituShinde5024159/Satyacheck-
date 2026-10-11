import React from 'react';
import type { ClaimDiff } from '../../types';
import { Check, AlertCircle } from 'lucide-react';

interface ClaimDiffPanelProps {
  diff: ClaimDiff;
}

export const ClaimDiffPanel: React.FC<ClaimDiffPanelProps> = ({ diff }) => {
  const hasSupported = diff.supportedDetails && diff.supportedDetails.length > 0;
  const hasMismatches = diff.mismatches && diff.mismatches.length > 0;

  if (!hasSupported && !hasMismatches) {
    return null;
  }

  return (
    <div className="rounded border border-[#E2E7E4] bg-[#FAFAF7] p-3.5 space-y-3 text-xs">
      <div className="font-semibold text-[#202B2A] flex items-center justify-between">
        <span className="uppercase tracking-wider text-[11px] text-[#516260]">
          Claim-to-Evidence Diff
        </span>
        <span className="text-[11px] text-[#798B89] font-normal">
          Passage-level comparison
        </span>
      </div>

      {/* Supported Elements */}
      {hasSupported && (
        <div className="space-y-1.5">
          <span className="text-[11px] font-medium text-[#165B36] flex items-center gap-1">
            <Check className="w-3.5 h-3.5" />
            <span>Supported by Source Text:</span>
          </span>
          <ul className="space-y-1 pl-4 list-disc text-[#202B2A]">
            {diff.supportedDetails.map((item, idx) => (
              <li key={idx} className="leading-relaxed">
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Specific Mismatches */}
      {hasMismatches && (
        <div className="space-y-2 pt-1">
          <span className="text-[11px] font-medium text-[#7D5B11] flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Detected Discrepancies & Mismatches:</span>
          </span>

          <div className="space-y-2">
            {diff.mismatches.map((mismatch, idx) => (
              <div 
                key={idx} 
                className="p-2.5 rounded bg-white border border-[#EADBAC] space-y-1.5"
              >
                <div className="flex items-center justify-between font-semibold text-[11px] text-[#202B2A]">
                  <span className="bg-[#F8ECCC] text-[#7D5B11] px-1.5 py-0.5 rounded">
                    Field: {mismatch.field}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                  <div className="p-1.5 rounded bg-[#FDF0F0] border border-[#F4CDCD] text-[#932222]">
                    <span className="font-semibold block text-[10px] uppercase">Claim Stated:</span>
                    <span className="font-mono">{mismatch.claimValue}</span>
                  </div>
                  <div className="p-1.5 rounded bg-[#E4F2E9] border border-[#C6E2D1] text-[#165B36]">
                    <span className="font-semibold block text-[10px] uppercase">Evidence Found:</span>
                    <span className="font-mono">{mismatch.evidenceValue}</span>
                  </div>
                </div>

                <p className="text-[11px] text-[#516260] pt-0.5 leading-relaxed">
                  {mismatch.explanation}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
