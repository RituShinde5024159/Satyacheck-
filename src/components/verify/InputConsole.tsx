import React, { useState, useRef } from 'react';
import type { InputMode, SupportedLanguage, VerificationReport } from '../../types';
import { 
  FileText, 
  Image, 
  File, 
  Globe, 
  Upload, 
  X, 
  AlertCircle, 
  Send, 
  RotateCcw, 
  Sparkles,
  Loader2
} from 'lucide-react';
import { Button } from '../common/Button';
import { DEMONSTRATION_REPORTS } from '../../data/demonstrationReports';
import { verifyText, verifyImage, verifyPdf, verifyUrl, BackendError } from '../../services/api';

interface InputConsoleProps {
  initialMode?: InputMode;
  initialQuery?: string;
  initialUrl?: string;
  onVerificationComplete: (report: VerificationReport) => void;
  isLoading?: boolean;
}

const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10MB
const MAX_PDF_BYTES = 15 * 1024 * 1024; // 15MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
const ALLOWED_PDF_TYPES = ['application/pdf'];

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const InputConsole: React.FC<InputConsoleProps> = ({
  initialMode = 'text',
  initialQuery = '',
  initialUrl = '',
  onVerificationComplete,
  isLoading: externalLoading = false,
}) => {
  const [mode, setMode] = useState<InputMode>(initialMode);
  const [language, setLanguage] = useState<SupportedLanguage>('en');
  const [textInput, setTextInput] = useState<string>(initialQuery);
  const [urlInput, setUrlInput] = useState<string>(initialUrl);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setTextInput('');
    setUrlInput('');
    setSelectedFile(null);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleModeChange = (newMode: InputMode) => {
    setMode(newMode);
    setErrorMessage(null);
  };

  const validateAndSetFile = (file: File) => {
    setErrorMessage(null);

    if (mode === 'image') {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        setErrorMessage('Unsupported image format. Please upload PNG, JPG, or WebP files.');
        return;
      }
      if (file.size > MAX_IMAGE_BYTES) {
        setErrorMessage(`File is too large (${formatBytes(file.size)}). Image limit is 10 MB.`);
        return;
      }
    } else if (mode === 'pdf') {
      if (!ALLOWED_PDF_TYPES.includes(file.type) && !file.name.toLowerCase().endsWith('.pdf')) {
        setErrorMessage('Unsupported document format. Please upload a standard PDF document.');
        return;
      }
      if (file.size > MAX_PDF_BYTES) {
        setErrorMessage(`File is too large (${formatBytes(file.size)}). PDF document limit is 15 MB.`);
        return;
      }
    }

    setSelectedFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const loadDemoScenario = (scenarioId: string) => {
    const report = DEMONSTRATION_REPORTS.find((r) => r.id === scenarioId);
    if (!report) return;

    setMode(report.inputMode);
    setLanguage(report.language);
    setErrorMessage(null);

    if (report.inputMode === 'url' && report.sourceUrl) {
      setUrlInput(report.sourceUrl);
      setTextInput('');
      setSelectedFile(null);
    } else {
      setTextInput(report.rawInput);
      setUrlInput('');
      setSelectedFile(null);
    }

    // Direct fulfillment of demonstration scenario
    onVerificationComplete(report);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (mode === 'text') {
      const trimmed = textInput.trim();
      if (!trimmed) {
        setErrorMessage('Please enter the statement or message text to verify.');
        return;
      }
      if (trimmed.length < 10) {
        setErrorMessage('Please enter a complete statement (at least 10 characters) for factual claim extraction.');
        return;
      }
    } else if (mode === 'url') {
      const trimmed = urlInput.trim();
      if (!trimmed) {
        setErrorMessage('Please provide a public URL to verify.');
        return;
      }
      try {
        const parsed = new URL(trimmed);
        if (!['http:', 'https:'].includes(parsed.protocol)) {
          setErrorMessage('URL must begin with http:// or https://');
          return;
        }
      } catch {
        setErrorMessage('Invalid web address format. Please provide a valid URL (e.g. https://example.com/article).');
        return;
      }
    } else if (mode === 'image' || mode === 'pdf') {
      if (!selectedFile && !textInput.trim()) {
        setErrorMessage(`Please select a ${mode === 'image' ? 'screenshot/image' : 'PDF document'} or provide the extracted claim text.`);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      let report: VerificationReport;

      if (mode === 'text') {
        report = await verifyText(textInput.trim(), language);
      } else if (mode === 'url') {
        report = await verifyUrl(urlInput.trim(), language);
      } else if (mode === 'image' && selectedFile) {
        report = await verifyImage(selectedFile, language);
      } else if (mode === 'pdf' && selectedFile) {
        report = await verifyPdf(selectedFile, language);
      } else {
        // Image/PDF fallback with entered transcription text
        report = await verifyText(textInput.trim(), language);
      }

      onVerificationComplete(report);
    } catch (err) {
      if (err instanceof BackendError) {
        if (err.httpStatus === 503) {
          setErrorMessage(
            'Live verification is unavailable: ' + err.detail +
            ' — Set GEMINI_API_KEY and a search provider key to enable real verification.'
          );
        } else if (err.httpStatus === 422) {
          setErrorMessage('Invalid request: ' + err.detail);
        } else {
          setErrorMessage('Backend error (' + err.httpStatus + '): ' + err.detail);
        }
      } else {
        // Network failure — backend is offline
        setErrorMessage(
          'Cannot reach the verification backend. ' +
          'Start the FastAPI server (py -m uvicorn backend.app:app --reload) or check your VITE_API_BASE_URL.'
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isBusy = isSubmitting || externalLoading;

  return (
    <div className="space-y-6">
      {/* Console Card */}
      <div className="rounded-md border border-[#DCE2DF] bg-white p-5 sm:p-6 shadow-xs space-y-5">
        {/* Top bar: Mode Tabs + Language selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8ECE9] pb-4">
          {/* Mode Selector Tabs */}
          <div className="inline-flex items-center gap-1 p-1 bg-[#E8ECE9]/70 rounded">
            <button
              type="button"
              onClick={() => handleModeChange('text')}
              disabled={isBusy}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors cursor-pointer ${
                mode === 'text'
                  ? 'bg-white text-[#202B2A] shadow-xs'
                  : 'text-[#516260] hover:text-[#202B2A]'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-[#155E59]" />
              <span>Text Message</span>
            </button>

            <button
              type="button"
              onClick={() => handleModeChange('image')}
              disabled={isBusy}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors cursor-pointer ${
                mode === 'image'
                  ? 'bg-white text-[#202B2A] shadow-xs'
                  : 'text-[#516260] hover:text-[#202B2A]'
              }`}
            >
              <Image className="w-3.5 h-3.5 text-[#155E59]" />
              <span>Screenshot / Image</span>
            </button>

            <button
              type="button"
              onClick={() => handleModeChange('pdf')}
              disabled={isBusy}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors cursor-pointer ${
                mode === 'pdf'
                  ? 'bg-white text-[#202B2A] shadow-xs'
                  : 'text-[#516260] hover:text-[#202B2A]'
              }`}
            >
              <File className="w-3.5 h-3.5 text-[#155E59]" />
              <span>PDF Document</span>
            </button>

            <button
              type="button"
              onClick={() => handleModeChange('url')}
              disabled={isBusy}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors cursor-pointer ${
                mode === 'url'
                  ? 'bg-white text-[#202B2A] shadow-xs'
                  : 'text-[#516260] hover:text-[#202B2A]'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-[#155E59]" />
              <span>Public URL</span>
            </button>
          </div>

          {/* Language Selector */}
          <div className="flex items-center gap-2">
            <label htmlFor="language-select" className="text-xs font-medium text-[#516260] shrink-0">
              Analysis Language:
            </label>
            <select
              id="language-select"
              value={language}
              disabled={isBusy}
              onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
              className="p-1.5 text-xs bg-[#FAFAF7] border border-[#DCE2DF] rounded focus:border-[#155E59] text-[#202B2A] focus:outline-none"
            >
              <option value="en">English (Default)</option>
              <option value="hi">हिन्दी (Hindi)</option>
              <option value="mr">मराठी (Marathi)</option>
            </select>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Mode 1: Text message */}
          {mode === 'text' && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="text-input" className="block text-xs font-semibold uppercase tracking-wider text-[#202B2A]">
                  Message, Forward, or Statement <span className="text-[#932222]">*</span>
                </label>
                <span className="text-[11px] text-[#798B89]">
                  Multi-claim messages will be broken down automatically
                </span>
              </div>
              <textarea
                id="text-input"
                rows={5}
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                disabled={isBusy}
                placeholder="Paste the message, WhatsApp forward, social media post, or political statement here..."
                className="w-full p-3 text-sm bg-[#FAFAF7] border border-[#DCE2DF] rounded focus:border-[#155E59] focus:bg-white focus:outline-none text-[#202B2A] placeholder-[#798B89] transition-colors"
              />
            </div>
          )}

          {/* Mode 2 & 3: File Upload (Image / PDF) */}
          {(mode === 'image' || mode === 'pdf') && (
            <div className="space-y-4">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                disabled={isBusy}
                accept={mode === 'image' ? 'image/png,image/jpeg,image/webp' : 'application/pdf'}
                className="hidden"
              />

              {/* Upload Dropzone */}
              {!selectedFile ? (
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-md p-6 text-center cursor-pointer transition-colors ${
                    isDragOver 
                      ? 'border-[#155E59] bg-[#E4F2E9]/40' 
                      : 'border-[#DCE2DF] hover:border-[#155E59] bg-[#FAFAF7]'
                  }`}
                >
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="w-10 h-10 rounded-full bg-[#E8ECE9] flex items-center justify-center text-[#155E59]">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs font-semibold text-[#202B2A]">
                        Click to browse or drop {mode === 'image' ? 'screenshot/image' : 'PDF document'} here
                      </p>
                      <p className="text-[11px] text-[#798B89]">
                        {mode === 'image' 
                          ? 'Supports PNG, JPG, or WebP up to 10 MB' 
                          : 'Supports standard searchable or scanned PDF documents up to 15 MB'}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                /* Selected File Card */
                <div className="flex items-center justify-between p-3 rounded border border-[#C6E2D1] bg-[#E4F2E9]/40">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-[#155E59] text-white flex items-center justify-center shrink-0">
                      {mode === 'image' ? <Image className="w-4 h-4" /> : <File className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[#202B2A] line-clamp-1">
                        {selectedFile.name}
                      </p>
                      <p className="text-[11px] text-[#516260]">
                        Size: {formatBytes(selectedFile.size)} • Type: {selectedFile.type || 'Document'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isBusy}
                      className="text-xs text-[#155E59] hover:underline font-medium cursor-pointer"
                    >
                      Change File
                    </button>
                    <button
                      type="button"
                      onClick={removeSelectedFile}
                      disabled={isBusy}
                      aria-label="Remove selected file"
                      className="p-1 rounded text-[#798B89] hover:text-[#932222] hover:bg-white transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Optional Text Context for file */}
              <div className="space-y-1.5">
                <label htmlFor="context-text" className="block text-xs font-medium text-[#516260]">
                  Transcription / Accompanying Text <span className="text-[#798B89] font-normal">(Optional context from OCR or caption)</span>
                </label>
                <textarea
                  id="context-text"
                  rows={3}
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  disabled={isBusy}
                  placeholder={`Optional: add or correct extracted text from the ${mode}...`}
                  className="w-full p-2.5 text-xs bg-[#FAFAF7] border border-[#DCE2DF] rounded focus:border-[#155E59] text-[#202B2A] placeholder-[#798B89]"
                />
              </div>
            </div>
          )}

          {/* Mode 4: Public URL */}
          {mode === 'url' && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="url-input" className="block text-xs font-semibold uppercase tracking-wider text-[#202B2A]">
                    Public Article or Post URL <span className="text-[#932222]">*</span>
                  </label>
                  <span className="text-[11px] text-[#798B89]">
                    Full web address starting with https://
                  </span>
                </div>
                <div className="relative">
                  <input
                    id="url-input"
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    disabled={isBusy}
                    placeholder="https://example.com/news/article-headline"
                    className="w-full p-2.5 pl-9 text-xs sm:text-sm bg-[#FAFAF7] border border-[#DCE2DF] rounded focus:border-[#155E59] focus:bg-white text-[#202B2A] placeholder-[#798B89]"
                  />
                  <Globe className="w-4 h-4 text-[#798B89] absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>

              {/* Optional focus statement */}
              <div className="space-y-1.5">
                <label htmlFor="url-focus" className="block text-xs font-medium text-[#516260]">
                  Specific Assertion to Audit <span className="text-[#798B89] font-normal">(Optional — defaults to full article fact-check)</span>
                </label>
                <input
                  id="url-focus"
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  disabled={isBusy}
                  placeholder="e.g., Claim that ministry announced new 50% subsidy"
                  className="w-full p-2.5 text-xs bg-[#FAFAF7] border border-[#DCE2DF] rounded focus:border-[#155E59] text-[#202B2A] placeholder-[#798B89]"
                />
              </div>
            </div>
          )}

          {/* Validation Error Banner */}
          {errorMessage && (
            <div className="flex items-start gap-2 p-3 rounded bg-[#FDF0F0] border border-[#F3C5C5] text-xs text-[#932222]">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Bottom Actions Bar */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-[#E8ECE9]">
            <div className="flex items-center gap-2">
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={isBusy}
                icon={isBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                iconPosition="left"
              >
                {isBusy ? 'Analyzing Claims & Sources...' : 'Verify Claim'}
              </Button>

              <Button
                type="button"
                variant="subtle"
                size="md"
                disabled={isBusy}
                onClick={resetForm}
                icon={<RotateCcw className="w-3.5 h-3.5" />}
              >
                Clear
              </Button>
            </div>

            <div className="text-[11px] text-[#798B89]">
              Evaluates individual claims independently
            </div>
          </div>
        </form>
      </div>

      {/* Demonstration Benchmark Scenarios */}
      <div className="rounded-md border border-[#DCE2DF] bg-[#FAFAF7] p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#202B2A]">
            <Sparkles className="w-3.5 h-3.5 text-[#155E59]" />
            <span>Demonstration Benchmark Scenarios</span>
          </div>
          <span className="text-[11px] text-[#798B89]">
            Pre-audited records covering all 5 verdicts
          </span>
        </div>

        <p className="text-xs text-[#516260]">
          Select any benchmark scenario below to inspect how multi-claim decomposition, source passages, Claim-to-Evidence Diff, and Temporal engines function:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
          {DEMONSTRATION_REPORTS.map((demo) => {
            const primaryVerdict = demo.claims[0]?.verdict || 'Cannot confirm';
            return (
              <button
                key={demo.id}
                type="button"
                onClick={() => loadDemoScenario(demo.id)}
                disabled={isBusy}
                className="text-left p-2.5 rounded border border-[#E2E7E4] bg-white hover:border-[#155E59] hover:shadow-xs transition-all cursor-pointer space-y-1.5"
              >
                <div className="flex items-center justify-between gap-1">
                  <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded ${
                    primaryVerdict === 'Verified' ? 'bg-[#E4F2E9] text-[#165B36]' :
                    primaryVerdict === 'False' ? 'bg-[#FDF0F0] text-[#932222]' :
                    primaryVerdict === 'Outdated' ? 'bg-[#F6EFE0] text-[#8C5E14]' :
                    primaryVerdict === 'Partly supported' ? 'bg-[#E8F1F5] text-[#1B5072]' :
                    'bg-[#E8ECE9] text-[#516260]'
                  }`}>
                    {demo.claims.length > 1 ? 'Multi-Claim' : primaryVerdict}
                  </span>
                  <span className="text-[10px] text-[#798B89] uppercase font-mono">
                    {demo.language}
                  </span>
                </div>

                <p className="text-xs font-medium text-[#202B2A] line-clamp-2">
                  {demo.rawInput}
                </p>

                <div className="text-[10px] text-[#798B89] flex items-center justify-between pt-0.5 border-t border-[#F0F2F1]">
                  <span>{demo.claims.length} {demo.claims.length === 1 ? 'claim' : 'claims'} evaluated</span>
                  <span className="text-[#155E59] font-medium">Load scenario &rarr;</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
