import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-[#E2E7E4] py-8 text-xs text-[#516260]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-[#155E59] flex items-center justify-center text-white">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <span className="font-semibold text-sm text-[#202B2A]">
              Satya<span className="text-[#155E59]">Check</span>
            </span>
            <span className="text-[#798B89] ml-2 hidden sm:inline">•</span>
            <span className="text-[#798B89] hidden sm:inline">Evidence-first claim verification</span>
          </div>

          <nav className="flex flex-wrap items-center gap-4 text-xs">
            <Link to="/" className="hover:text-[#155E59] transition-colors">
              Home
            </Link>
            <Link to="/verify" className="hover:text-[#155E59] transition-colors">
              Verify
            </Link>
            <Link to="/report" className="hover:text-[#155E59] transition-colors">
              Reports
            </Link>
            <Link to="/how-it-works" className="hover:text-[#155E59] transition-colors">
              How It Works
            </Link>
          </nav>
        </div>

        <div className="pt-4 border-t border-[#E8ECE9] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] text-[#798B89]">
          <p>© {new Date().getFullYear()} SatyaCheck. Built for source comparison, passage diffing, and publication recency checks.</p>
          <p>Pre-indexed demonstration mode. Does not invent unverified conclusions.</p>
        </div>
      </div>
    </footer>
  );
};
