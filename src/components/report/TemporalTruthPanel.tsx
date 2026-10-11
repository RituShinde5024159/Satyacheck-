import React from 'react';
import type { TemporalDetails } from '../../types';
import { Clock, Calendar, AlertOctagon, CheckCircle2 } from 'lucide-react';

interface TemporalTruthPanelProps {
  temporal: TemporalDetails;
}

export const TemporalTruthPanel: React.FC<TemporalTruthPanelProps> = ({ temporal }) => {
  if (!temporal.evidencePublishedDate && !temporal.temporalNote) {
    return null;
  }

  return (
    <div className="rounded border border-[#E2E7E4] bg-[#FAFAF7] p-3.5 space-y-2.5 text-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 font-semibold text-[#202B2A]">
          <Clock className="w-3.5 h-3.5 text-[#155E59]" />
          <span className="uppercase tracking-wider text-[11px] text-[#516260]">
            Temporal Truth Engine
          </span>
        </div>

        {temporal.isExpired ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-[#F4F1E8] text-[#7A6124] border border-[#E3DAC5]">
            <AlertOctagon className="w-3 h-3" />
            <span>Superseded / Expired</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-[#E4F2E9] text-[#165B36] border border-[#C6E2D1]">
            <CheckCircle2 className="w-3 h-3" />
            <span>Active Timeline</span>
          </span>
        )}
      </div>

      {/* Date metadata row */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[#516260] pt-1">
        {temporal.evidencePublishedDate && (
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-[#798B89]" />
            <span>Published: <strong className="text-[#202B2A]">{temporal.evidencePublishedDate}</strong></span>
          </span>
        )}
        {temporal.evidenceUpdatedDate && (
          <span>Updated: <strong className="text-[#202B2A]">{temporal.evidenceUpdatedDate}</strong></span>
        )}
        {temporal.expiryDeadline && (
          <span className="text-[#7A6124]">
            Deadline: <strong>{temporal.expiryDeadline}</strong>
          </span>
        )}
        {temporal.claimTimeframe && (
          <span className="text-[#798B89]">
            Forwarded for: <em>{temporal.claimTimeframe}</em>
          </span>
        )}
      </div>

      {/* Note */}
      {temporal.temporalNote && (
        <p className="text-[11px] text-[#516260] leading-relaxed pt-1 border-t border-[#E8ECE9]">
          {temporal.temporalNote}
        </p>
      )}
    </div>
  );
};
