import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Plus, 
  Sparkles, 
  ArrowLeft,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Card } from '../components/common/Card';
import { ReportView } from '../components/report/ReportView';
import { ClaimCard } from '../components/report/ClaimCard';
import type { Verdict, SupportedLanguage, InputMode } from '../types';
import { DEMONSTRATION_REPORTS } from '../data/demonstrationReports';

export const ReportPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const highlightedId = searchParams.get('id');

  const [searchQuery, setSearchQuery] = useState('');
  const [verdictFilter, setVerdictFilter] = useState<Verdict | 'all'>('all');
  const [languageFilter, setLanguageFilter] = useState<SupportedLanguage | 'all'>('all');
  const [modeFilter, setModeFilter] = useState<InputMode | 'all'>('all');
  const [expandedReportId, setExpandedReportId] = useState<string | null>(null);

  // If highlightedId is passed and matches a report, provide full report view directly
  const selectedReport = highlightedId 
    ? DEMONSTRATION_REPORTS.find((r) => r.id === highlightedId) 
    : null;

  const verdicts: { label: string; value: Verdict | 'all' }[] = [
    { label: 'All Verdicts', value: 'all' },
    { label: 'Verified', value: 'Verified' },
    { label: 'False', value: 'False' },
    { label: 'Outdated', value: 'Outdated' },
    { label: 'Partly supported', value: 'Partly supported' },
    { label: 'Cannot confirm', value: 'Cannot confirm' },
  ];

  const filteredReports = DEMONSTRATION_REPORTS.filter((report) => {
    const matchesSearch = 
      report.rawInput.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.overallSummary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.claims.some((c) => 
        c.originalText.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.explanation.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesVerdict = 
      verdictFilter === 'all' || 
      report.claims.some((c) => c.verdict === verdictFilter);

    const matchesLanguage = 
      languageFilter === 'all' || 
      report.language === languageFilter;

    const matchesMode = 
      modeFilter === 'all' || 
      report.inputMode === modeFilter;

    return matchesSearch && matchesVerdict && matchesLanguage && matchesMode;
  });

  const clearFilters = () => {
    setSearchQuery('');
    setVerdictFilter('all');
    setLanguageFilter('all');
    setModeFilter('all');
  };

  const toggleExpand = (id: string) => {
    setExpandedReportId(expandedReportId === id ? null : id);
  };

  // If a report ID was specifically selected from URL, show its full view
  if (selectedReport) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-[#E2E7E4]">
          <button
            type="button"
            onClick={() => setSearchParams({})}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#155E59] hover:underline cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Demonstration Reports</span>
          </button>

          <Link to="/verify">
            <Button variant="primary" size="sm" icon={<Plus className="w-3.5 h-3.5" />}>
              Verify New Claim
            </Button>
          </Link>
        </div>

        <ReportView 
          report={selectedReport} 
          onReset={() => setSearchParams({})} 
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#E2E7E4] pb-6 gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#202B2A] tracking-tight">
            Verification Reports Archive
          </h1>
          <p className="text-xs sm:text-sm text-[#516260] max-w-2xl leading-relaxed">
            Curated benchmark cases illustrating independent claim extraction, source passages, Claim-to-Evidence Diff, and temporal verification.
          </p>
        </div>

        <Link to="/verify">
          <Button variant="primary" size="md" icon={<Plus className="w-4 h-4" />}>
            Verify Claim
          </Button>
        </Link>
      </div>

      {/* Demonstration Notice */}
      <div className="p-3.5 rounded bg-[#E8ECE9]/70 border border-[#DCE2DF] text-xs text-[#516260] flex items-start gap-2.5">
        <Sparkles className="w-4 h-4 text-[#155E59] shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-[#202B2A]">Demonstration Mode:</span>
          <span> Live search retrieval APIs are currently offline. These benchmark records demonstrate how the 5 verdicts (Verified, False, Outdated, Partly supported, Cannot confirm) are determined based strictly on cited evidence.</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-md border border-[#DCE2DF] shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search box */}
          <div className="flex-1 flex items-center px-3 py-2 bg-[#FAFAF7] border border-[#DCE2DF] rounded gap-2 text-sm">
            <Search className="w-4 h-4 text-[#798B89] shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reports by message text, keyword, or claim..."
              className="w-full bg-transparent border-0 text-xs sm:text-sm text-[#202B2A] placeholder-[#798B89] focus:outline-none"
            />
            {searchQuery && (
              <button 
                type="button" 
                onClick={() => setSearchQuery('')}
                className="text-xs text-[#798B89] hover:text-[#202B2A] cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Verdict Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="w-4 h-4 text-[#798B89] hidden sm:block" />
            <select
              value={verdictFilter}
              onChange={(e) => setVerdictFilter(e.target.value as Verdict | 'all')}
              className="p-2 text-xs bg-[#FAFAF7] border border-[#DCE2DF] rounded focus:border-[#155E59] text-[#202B2A] focus:outline-none"
            >
              {verdicts.map((v) => (
                <option key={v.value} value={v.value}>
                  {v.label}
                </option>
              ))}
            </select>

            {/* Language Filter */}
            <select
              value={languageFilter}
              onChange={(e) => setLanguageFilter(e.target.value as SupportedLanguage | 'all')}
              className="p-2 text-xs bg-[#FAFAF7] border border-[#DCE2DF] rounded focus:border-[#155E59] text-[#202B2A] focus:outline-none"
            >
              <option value="all">All Languages</option>
              <option value="en">English</option>
              <option value="hi">हिन्दी (Hindi)</option>
              <option value="mr">मराठी (Marathi)</option>
            </select>

            {/* Format Mode Filter */}
            <select
              value={modeFilter}
              onChange={(e) => setModeFilter(e.target.value as InputMode | 'all')}
              className="p-2 text-xs bg-[#FAFAF7] border border-[#DCE2DF] rounded focus:border-[#155E59] text-[#202B2A] focus:outline-none"
            >
              <option value="all">All Formats</option>
              <option value="text">Text Message</option>
              <option value="image">Image / Screenshot</option>
              <option value="pdf">PDF Document</option>
              <option value="url">Public URL</option>
            </select>
          </div>
        </div>

        {/* Filter Summary */}
        <div className="flex items-center justify-between text-xs text-[#798B89] pt-1 border-t border-[#F0F2F1]">
          <span>Showing {filteredReports.length} of {DEMONSTRATION_REPORTS.length} demonstration reports</span>
          {(verdictFilter !== 'all' || languageFilter !== 'all' || modeFilter !== 'all' || searchQuery) && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-[#155E59] hover:underline cursor-pointer"
            >
              Reset all filters
            </button>
          )}
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {filteredReports.length === 0 ? (
          <div className="p-12 text-center bg-white border border-[#DCE2DF] rounded-md space-y-3">
            <p className="text-sm font-medium text-[#202B2A]">No reports match your current filter criteria.</p>
            <p className="text-xs text-[#798B89]">Try clearing your search query or selecting "All Verdicts".</p>
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        ) : (
          filteredReports.map((report) => {
            const isExpanded = expandedReportId === report.id;

            return (
              <Card 
                key={report.id} 
                variant="default" 
                padding="md"
                className={`transition-all ${isExpanded ? 'border-[#155E59]/50 shadow-xs' : ''}`}
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Render primary verdict or multi-claim indicator */}
                    {report.claims.length === 1 ? (
                      <Badge verdict={report.claims[0].verdict} />
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-[#E8F1F5] text-[#1B5072] border border-[#C5DCE6]">
                        Multi-Claim ({report.claims.length})
                      </span>
                    )}

                    <span className="text-xs text-[#798B89]">• Mode: {report.inputMode}</span>
                    <span className="text-xs text-[#798B89] uppercase font-mono">• Lang: {report.language}</span>
                    <span className="text-xs text-[#798B89]">• Ref: {report.id}</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-[#798B89]">
                    <span>{report.submittedAt}</span>
                  </div>
                </div>

                {/* Submitted Message */}
                <div className="mt-3 space-y-1">
                  <h3 className="text-base font-semibold text-[#202B2A] leading-snug">
                    "{report.rawInput}"
                  </h3>
                </div>

                {/* Overall summary */}
                <p className="mt-2 text-xs sm:text-sm text-[#516260] leading-relaxed">
                  {report.overallSummary}
                </p>

                {/* Inline claim previews */}
                <div className="mt-3 pt-3 border-t border-[#F0F2F1] space-y-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#798B89]">
                    Atomic Claims Overview:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {report.claims.map((claim, idx) => (
                      <div 
                        key={claim.id} 
                        className="p-2 rounded border border-[#E8ECE9] bg-[#FAFAF7] text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-semibold text-[#202B2A] text-[11px]">
                            Claim {idx + 1}
                          </span>
                          <Badge verdict={claim.verdict} size="sm" showIcon={false} />
                        </div>
                        <p className="text-[11px] text-[#516260] line-clamp-2">
                          {claim.originalText}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Expanded Claims Deep-Dive */}
                {isExpanded && (
                  <div className="mt-5 pt-5 border-t border-[#E8ECE9] space-y-4">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-[#202B2A]">
                      Full Evidentiary Claim Audits
                    </h4>
                    {report.claims.map((claim, idx) => (
                      <ClaimCard key={claim.id} claim={claim} index={idx} />
                    ))}
                  </div>
                )}

                {/* Footer action toggle */}
                <div className="mt-4 pt-3 border-t border-[#E8ECE9] flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => toggleExpand(report.id)}
                    className="inline-flex items-center gap-1 text-xs font-medium text-[#155E59] hover:underline cursor-pointer"
                  >
                    <span>{isExpanded ? 'Hide Evidentiary Details' : 'Expand Evidence & Passages'}</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setSearchParams({ id: report.id })}
                      className="text-xs font-medium text-[#155E59] hover:underline cursor-pointer"
                    >
                      Open Dedicated Report View &rarr;
                    </button>
                    <Link
                      to={`/verify?claim=${encodeURIComponent(report.rawInput)}`}
                      className="text-xs text-[#516260] hover:text-[#202B2A] hover:underline"
                    >
                      Audit in Workspace
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};
