import React, { useState } from 'react';
import type { ExtractedClaim } from '../../types';
import { Badge } from '../common/Badge';
import { ClaimDiffPanel } from './ClaimDiffPanel';
import { TemporalTruthPanel } from './TemporalTruthPanel';
import { ChevronDown, ChevronUp, ExternalLink, ShieldAlert, BookOpen } from 'lucide-react';

interface ClaimCardProps {
  claim: ExtractedClaim;
  index: number;
}

export const ClaimCard: React.FC<ClaimCardProps> = ({ claim, index }) => {
  const [sourcesOpen, setSourcesOpen] = useState(false);

  return (
    <div className="rounded-md border border-[#E2E7E4] bg-white p-4 sm:p-5 space-y-4">
      {/* Header: Claim Number & Badges */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-[#E8ECE9]">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-[#155E59] text-white flex items-center justify-center text-[10px] font-bold">
            {index + 1}
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#798B89]">
            Extracted Factual Claim
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge verdict={claim.verdict} />
          <Badge evidenceQuality={claim.evidenceQuality} />
        </div>
      </div>

      {/* Original Claim Text */}
      <div className="space-y-1">
        <h4 className="text-sm font-semibold text-[#202B2A] leading-snug">
          "{claim.originalText}"
        </h4>
        {claim.normalizedClaim !== claim.originalText && (
          <p className="text-xs text-[#516260]">
            Proposition: {claim.normalizedClaim}
          </p>
        )}
      </div>

      {/* Plain Language Explanation */}
      <div className="text-xs sm:text-sm text-[#202B2A] leading-relaxed bg-[#FAFAF7] p-3 rounded border border-[#E8ECE9]">
        <span className="font-semibold block text-[#516260] text-[11px] uppercase tracking-wider mb-1">
          Evaluation Summary:
        </span>
        {claim.explanation}
      </div>

      {/* Safe Abstention Notice (if Cannot confirm or evidence absent) */}
      {claim.safeAbstentionReason && (
        <div className="p-3 rounded bg-[#E8ECE9]/70 border border-[#D9E0DD] text-xs text-[#516260] space-y-1">
          <div className="font-semibold text-[#202B2A] flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-[#155E59]" />
            <span>Evidence Sufficiency & Safe Abstention:</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            {claim.safeAbstentionReason}
          </p>
        </div>
      )}

      {/* Signature Innovation A: Claim-to-Evidence Diff */}
      <ClaimDiffPanel diff={claim.diff} />

      {/* Signature Innovation B: Temporal Truth Engine */}
      <TemporalTruthPanel temporal={claim.temporal} />

      {/* Expandable Primary Sources */}
      {claim.sources && claim.sources.length > 0 && (
        <div className="pt-2 border-t border-[#E8ECE9]">
          <button
            type="button"
            onClick={() => setSourcesOpen(!sourcesOpen)}
            className="w-full flex items-center justify-between text-xs font-medium text-[#155E59] hover:underline py-1 cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              <span>
                {sourcesOpen ? 'Hide' : 'Inspect'} Retrieved Source Passages ({claim.sources.length})
              </span>
            </span>
            {sourcesOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {sourcesOpen && (
            <div className="mt-3 space-y-2.5">
              {claim.sources.map((src) => (
                <div 
                  key={src.id}
                  className="p-3 rounded border border-[#E2E7E4] bg-[#FAFAF7] text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#202B2A]">{src.publisher}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                      src.stance === 'supports' ? 'bg-[#E4F2E9] text-[#165B36]' :
                      src.stance === 'refutes' ? 'bg-[#FDF0F0] text-[#932222]' :
                      'bg-[#E8ECE9] text-[#516260]'
                    }`}>
                      Stance: {src.stance}
                    </span>
                  </div>

                  <p className="font-medium text-[#155E59]">{src.title}</p>
                  
                  <blockquote className="border-l-2 border-[#155E59]/40 pl-2.5 italic text-[#516260] text-[11px] leading-relaxed">
                    "{src.passageText}"
                  </blockquote>

                  <div className="pt-1 flex items-center justify-between text-[11px] text-[#798B89]">
                    {src.publishedDate ? (
                      <span>Published: {src.publishedDate}</span>
                    ) : (
                      <span>Date: Not recorded</span>
                    )}
                    <a
                      href={src.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[#155E59] hover:underline font-medium"
                    >
                      <span>Direct Source</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
