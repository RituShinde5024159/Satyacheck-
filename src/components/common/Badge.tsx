import React from 'react';
import type { Verdict, EvidenceQuality } from '../../types';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  HelpCircle, 
  ShieldCheck, 
  Layers 
} from 'lucide-react';

interface BadgeProps {
  verdict?: Verdict | string;
  evidenceQuality?: EvidenceQuality;
  label?: string;
  variant?: 'neutral' | 'teal' | 'amber' | 'green' | 'red';
  size?: 'sm' | 'md';
  showIcon?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  verdict,
  evidenceQuality,
  label,
  variant = 'neutral',
  size = 'md',
  showIcon = true,
  className = '',
}) => {
  const sizeClasses = size === 'sm' 
    ? 'px-2 py-0.5 text-xs' 
    : 'px-2.5 py-1 text-xs font-medium';

  // Evidence Quality Badge
  if (evidenceQuality) {
    const qualityConfig = {
      Strong: {
        bg: 'bg-[#E4F2E9] text-[#165B36] border-[#C6E2D1]',
        label: 'Evidence: Strong',
      },
      Limited: {
        bg: 'bg-[#F8ECCC] text-[#7D5B11] border-[#EADBAC]',
        label: 'Evidence: Limited',
      },
      Conflicting: {
        bg: 'bg-[#FDF0F0] text-[#932222] border-[#F4CDCD]',
        label: 'Evidence: Conflicting',
      },
      Absent: {
        bg: 'bg-[#E8ECE9] text-[#516260] border-[#D9E0DD]',
        label: 'Evidence: Absent',
      },
    };

    const config = qualityConfig[evidenceQuality] || qualityConfig.Absent;

    return (
      <span className={`inline-flex items-center gap-1.5 rounded border tracking-tight font-medium ${config.bg} ${sizeClasses} ${className}`}>
        {showIcon && <Layers className="w-3.5 h-3.5 shrink-0" />}
        <span>{label || config.label}</span>
      </span>
    );
  }

  // Verdict Badge
  if (verdict) {
    const norm = String(verdict).toLowerCase().replace(/_/g, ' ');

    if (norm === 'verified' || norm === 'verified true') {
      return (
        <span className={`inline-flex items-center gap-1.5 rounded border border-[#C6E2D1] bg-[#E4F2E9] text-[#165B36] font-medium tracking-tight ${sizeClasses} ${className}`}>
          {showIcon && <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
          <span>{label || 'Verified'}</span>
        </span>
      );
    }

    if (norm === 'false' || norm === 'fabricated') {
      return (
        <span className={`inline-flex items-center gap-1.5 rounded border border-[#F4CDCD] bg-[#FDF0F0] text-[#932222] font-medium tracking-tight ${sizeClasses} ${className}`}>
          {showIcon && <XCircle className="w-3.5 h-3.5 shrink-0" />}
          <span>{label || 'False'}</span>
        </span>
      );
    }

    if (norm === 'outdated') {
      return (
        <span className={`inline-flex items-center gap-1.5 rounded border border-[#E3DAC5] bg-[#F4F1E8] text-[#7A6124] font-medium tracking-tight ${sizeClasses} ${className}`}>
          {showIcon && <Clock className="w-3.5 h-3.5 shrink-0" />}
          <span>{label || 'Outdated'}</span>
        </span>
      );
    }

    if (norm === 'partly supported' || norm === 'mostly true' || norm === 'misleading') {
      return (
        <span className={`inline-flex items-center gap-1.5 rounded border border-[#EADBAC] bg-[#F8ECCC] text-[#7D5B11] font-medium tracking-tight ${sizeClasses} ${className}`}>
          {showIcon && <AlertTriangle className="w-3.5 h-3.5 shrink-0" />}
          <span>{label || 'Partly supported'}</span>
        </span>
      );
    }

    // Default / Cannot confirm
    return (
      <span className={`inline-flex items-center gap-1.5 rounded border border-[#D9E0DD] bg-[#E8ECE9] text-[#4A5B59] font-medium tracking-tight ${sizeClasses} ${className}`}>
        {showIcon && <HelpCircle className="w-3.5 h-3.5 shrink-0" />}
        <span>{label || 'Cannot confirm'}</span>
      </span>
    );
  }

  // Non-verdict generic variants
  const variantStyles = {
    neutral: 'border-[#D9E0DD] bg-[#E8ECE9] text-[#202B2A]',
    teal: 'border-[#155E59]/25 bg-[#EEF6F4] text-[#155E59]',
    green: 'border-[#C6E2D1] bg-[#E4F2E9] text-[#165B36]',
    amber: 'border-[#EADBAC] bg-[#F8ECCC] text-[#7D5B11]',
    red: 'border-[#F4CDCD] bg-[#FDF0F0] text-[#932222]',
  };

  return (
    <span className={`inline-flex items-center gap-1 rounded border font-medium tracking-tight ${variantStyles[variant]} ${sizeClasses} ${className}`}>
      {showIcon && <ShieldCheck className="w-3.5 h-3.5 shrink-0" />}
      <span>{label}</span>
    </span>
  );
};
