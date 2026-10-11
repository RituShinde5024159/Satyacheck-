import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { VerificationReport, InputMode } from '../types';
import { InputConsole } from '../components/verify/InputConsole';
import { ReportView } from '../components/report/ReportView';
import { getReportById, verifyText, verifyUrl, BackendError } from '../services/api';
import { DEMONSTRATION_REPORTS } from '../data/demonstrationReports';
import { ShieldCheck, Info, CheckCircle2, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const VerifyPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const claimParam = searchParams.get('claim') || '';
  const urlParam = searchParams.get('url') || '';
  const typeParam = (searchParams.get('type') || 'text') as InputMode;
  const idParam = searchParams.get('id') || '';

  const [activeReport, setActiveReport] = useState<VerificationReport | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    // If a specific report ID is targeted in query params
    if (idParam) {
      setLoading(true);
      getReportById(idParam).then((rep) => {
        if (rep) {
          setActiveReport(rep);
        }
        setLoading(false);
      });
      return;
    }

    // If a direct benchmark prompt was submitted from homepage
    if (claimParam) {
      // Check if it matches a known benchmark scenario
      const matched = DEMONSTRATION_REPORTS.find((r) => 
        r.rawInput.toLowerCase().includes(claimParam.toLowerCase().slice(0, 20)) ||
        claimParam.toLowerCase().includes(r.rawInput.toLowerCase().slice(0, 20))
      );

      if (matched) {
        setActiveReport(matched);
      } else {
        // Run verification via API service
        setLoading(true);
        setLoadError(null);
        verifyText(claimParam, 'en')
          .then((rep) => {
            setActiveReport(rep);
          })
          .catch((err: unknown) => {
            if (err instanceof BackendError) {
              setLoadError(
                err.httpStatus === 503
                  ? 'Live verification unavailable: ' + err.detail
                  : 'Backend error (' + err.httpStatus + '): ' + err.detail
              );
            } else {
              setLoadError('Cannot reach the verification backend. Start the FastAPI server to enable live verification.');
            }
          })
          .finally(() => setLoading(false));
      }
    } else if (urlParam) {
      const matched = DEMONSTRATION_REPORTS.find((r) => 
        r.sourceUrl && r.sourceUrl.toLowerCase().includes(urlParam.toLowerCase())
      );

      if (matched) {
        setActiveReport(matched);
      } else {
        setLoading(true);
        setLoadError(null);
        verifyUrl(urlParam, 'en')
          .then((rep) => {
            setActiveReport(rep);
          })
          .catch((err: unknown) => {
            if (err instanceof BackendError) {
              setLoadError('Backend error (' + err.httpStatus + '): ' + err.detail);
            } else {
              setLoadError('Cannot reach the verification backend.');
            }
          })
          .finally(() => setLoading(false));
      }
    }
  }, [idParam, claimParam, urlParam]);

  const handleReset = () => {
    setActiveReport(null);
    setLoadError(null);
    setSearchParams({});
  };

  const handleVerificationComplete = (report: VerificationReport) => {
    setActiveReport(report);
    // Update URL quietly to support sharing/reloading
    setSearchParams({ id: report.id });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Page Title & Mission */}
      <div className="border-b border-[#E2E7E4] pb-6 space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#202B2A] tracking-tight">
          {activeReport ? 'Verification Audit Report' : 'Verify a Statement, Forward, or Document'}
        </h1>
        <p className="text-xs sm:text-sm text-[#516260] max-w-2xl leading-relaxed">
          {activeReport 
            ? 'Detailed evidence comparison showing independent claim determinations, source diffs, and temporal validity.'
            : 'Check suspicious messages, images, PDFs, or links against credible sources. See what the evidence supports, where text diverges, and whether facts are outdated.'}
        </p>
      </div>

      {/* Load error banner (from URL-param triggered verification) */}
      {loadError && !activeReport && (
        <div className="p-4 rounded border border-[#F3C5C5] bg-[#FDF0F0] text-sm text-[#932222] space-y-1">
          <p className="font-semibold">Verification failed</p>
          <p className="text-xs">{loadError}</p>
          <button
            type="button"
            onClick={handleReset}
            className="text-xs font-medium text-[#932222] underline cursor-pointer mt-1"
          >
            Clear and try again
          </button>
        </div>
      )}

      {/* Main Workspace Layout */}
      {activeReport ? (
        <ReportView report={activeReport} onReset={handleReset} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Input Console (Left 2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            <InputConsole
              initialMode={typeParam}
              initialQuery={claimParam}
              initialUrl={urlParam}
              onVerificationComplete={handleVerificationComplete}
              isLoading={loading}
            />
          </div>

          {/* Sidebar Guidelines & Protocol (Right col) */}
          <div className="space-y-5">
            {/* Guidelines Card */}
            <div className="rounded-md border border-[#DCE2DF] bg-white p-4 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#202B2A] flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-[#155E59]" />
                <span>Verification Guidelines</span>
              </h3>
              <ul className="space-y-2 text-xs text-[#516260]">
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#155E59] shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-[#202B2A]">Falsifiable assertions:</strong> Submit factual claims that can be checked against records or reporting.
                  </span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#155E59] shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-[#202B2A]">Multi-claim handling:</strong> Complex forwards are decomposed and verified piece-by-piece.
                  </span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#155E59] shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-[#202B2A]">Safe Abstention:</strong> If corroborating evidence is missing, SatyaCheck returns <em>Cannot confirm</em> instead of guessing.
                  </span>
                </li>
              </ul>
            </div>

            {/* Five Verdicts Summary Card */}
            <div className="rounded-md border border-[#DCE2DF] bg-white p-4 space-y-2.5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#202B2A]">
                The 5 Exact Verdicts
              </h3>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between p-1.5 rounded bg-[#E4F2E9]/60 border border-[#C6E2D1]">
                  <span className="font-semibold text-[#165B36]">Verified</span>
                  <span className="text-[#516260]">Strong corroborating evidence</span>
                </div>
                <div className="flex items-center justify-between p-1.5 rounded bg-[#FDF0F0] border border-[#F3C5C5]">
                  <span className="font-semibold text-[#932222]">False</span>
                  <span className="text-[#516260]">Directly contradicted</span>
                </div>
                <div className="flex items-center justify-between p-1.5 rounded bg-[#F6EFE0] border border-[#E7D6B5]">
                  <span className="font-semibold text-[#8C5E14]">Outdated</span>
                  <span className="text-[#516260]">Superseded by later events</span>
                </div>
                <div className="flex items-center justify-between p-1.5 rounded bg-[#E8F1F5] border border-[#C5DCE6]">
                  <span className="font-semibold text-[#1B5072]">Partly supported</span>
                  <span className="text-[#516260]">Core true, details diverge</span>
                </div>
                <div className="flex items-center justify-between p-1.5 rounded bg-[#E8ECE9] border border-[#DCE2DF]">
                  <span className="font-semibold text-[#516260]">Cannot confirm</span>
                  <span className="text-[#798B89]">Evidence absent/inconclusive</span>
                </div>
              </div>
            </div>

            {/* Empirical Guarantee */}
            <div className="p-3.5 rounded border border-[#C6E2D1] bg-[#E4F2E9] text-xs text-[#165B36] space-y-1">
              <div className="font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Empirical Rigor</span>
              </div>
              <p className="text-[11px] leading-relaxed text-[#1B633D]">
                Every verdict is tied directly to verified primary quotations and publication timestamps. No uncalibrated probability scores.
              </p>
              <Link 
                to="/how-it-works" 
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#155E59] hover:underline pt-0.5"
              >
                <span>Read our methodology</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
