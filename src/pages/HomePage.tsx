import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  ArrowRight, 
  GitCompare, 
  Clock, 
  Scale, 
  FileText, 
  Image, 
  File, 
  Globe, 
  Upload
} from 'lucide-react';
import { Button } from '../components/common/Button';

type InputMode = 'text' | 'image' | 'pdf' | 'url';

export const HomePage: React.FC = () => {
  const [inputMode, setInputMode] = useState<InputMode>('text');
  const [claimInput, setClaimInput] = useState('');
  const [selectedFileName, setSelectedFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (inputMode === 'url') {
      if (claimInput.trim()) {
        navigate(`/verify?type=url&url=${encodeURIComponent(claimInput.trim())}`);
      } else {
        navigate('/verify?type=url');
      }
      return;
    }

    if (inputMode === 'image') {
      const payload = selectedFileName || claimInput.trim();
      if (payload) {
        navigate(`/verify?type=image&claim=${encodeURIComponent(payload)}`);
      } else {
        navigate('/verify?type=image');
      }
      return;
    }

    if (inputMode === 'pdf') {
      const payload = selectedFileName || claimInput.trim();
      if (payload) {
        navigate(`/verify?type=pdf&claim=${encodeURIComponent(payload)}`);
      } else {
        navigate('/verify?type=pdf');
      }
      return;
    }

    // Default: text
    if (claimInput.trim()) {
      navigate(`/verify?type=text&claim=${encodeURIComponent(claimInput.trim())}`);
    } else {
      navigate('/verify');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFileName(file.name);
      if (!claimInput) {
        setClaimInput(file.name);
      }
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-16">
      {/* Hero & Verification Input */}
      <section className="text-center space-y-6">
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#202B2A] tracking-tight max-w-2xl mx-auto leading-tight">
            Don't Just Trust the Forward. Verify the Evidence.
          </h1>
          <p className="text-sm sm:text-base text-[#516260] max-w-xl mx-auto font-normal leading-relaxed">
            Check suspicious messages, forwarded claims, and links against credible sources. See what the evidence supports, where text diverges, and whether information is outdated.
          </p>
        </div>

        {/* Verification Input Box */}
        <div className="max-w-2xl mx-auto pt-2 space-y-3">
          {/* Simple Source Format Selector */}
          <div className="inline-flex items-center gap-1 p-1 bg-[#E8ECE9]/70 rounded">
            <button
              type="button"
              onClick={() => {
                setInputMode('text');
                setSelectedFileName('');
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors cursor-pointer ${
                inputMode === 'text'
                  ? 'bg-white text-[#202B2A] shadow-xs'
                  : 'text-[#516260] hover:text-[#202B2A]'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-[#155E59]" />
              <span>Text</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setInputMode('image');
                setSelectedFileName('');
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors cursor-pointer ${
                inputMode === 'image'
                  ? 'bg-white text-[#202B2A] shadow-xs'
                  : 'text-[#516260] hover:text-[#202B2A]'
              }`}
            >
              <Image className="w-3.5 h-3.5 text-[#155E59]" />
              <span>Image</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setInputMode('pdf');
                setSelectedFileName('');
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors cursor-pointer ${
                inputMode === 'pdf'
                  ? 'bg-white text-[#202B2A] shadow-xs'
                  : 'text-[#516260] hover:text-[#202B2A]'
              }`}
            >
              <File className="w-3.5 h-3.5 text-[#155E59]" />
              <span>PDF</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setInputMode('url');
                setSelectedFileName('');
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors cursor-pointer ${
                inputMode === 'url'
                  ? 'bg-white text-[#202B2A] shadow-xs'
                  : 'text-[#516260] hover:text-[#202B2A]'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-[#155E59]" />
              <span>Public URL</span>
            </button>
          </div>

          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept={inputMode === 'image' ? 'image/*' : '.pdf'}
            className="hidden"
          />

          {/* Active Input Container */}
          <form onSubmit={handleVerifySubmit} className="flex flex-col sm:flex-row gap-2 p-2 bg-white border border-[#DCE2DF] rounded-md shadow-xs">
            <div className="flex-1 flex items-center px-3 gap-2">
              {inputMode === 'text' && <Search className="w-4 h-4 text-[#798B89] shrink-0" />}
              {inputMode === 'image' && <Image className="w-4 h-4 text-[#798B89] shrink-0" />}
              {inputMode === 'pdf' && <File className="w-4 h-4 text-[#798B89] shrink-0" />}
              {inputMode === 'url' && <Globe className="w-4 h-4 text-[#798B89] shrink-0" />}

              {inputMode === 'url' ? (
                <input
                  type="url"
                  value={claimInput}
                  onChange={(e) => setClaimInput(e.target.value)}
                  placeholder="Paste link to news article or social post (https://...)"
                  className="w-full bg-transparent border-0 text-xs sm:text-sm text-[#202B2A] placeholder-[#798B89] focus:outline-none"
                />
              ) : inputMode === 'image' || inputMode === 'pdf' ? (
                <div className="flex-1 flex items-center gap-2">
                  <input
                    type="text"
                    value={claimInput}
                    onChange={(e) => setClaimInput(e.target.value)}
                    placeholder={
                      selectedFileName
                        ? `Selected: ${selectedFileName}`
                        : inputMode === 'image'
                        ? 'Choose image or type message from screenshot...'
                        : 'Choose PDF or type document text...'
                    }
                    className="w-full bg-transparent border-0 text-xs sm:text-sm text-[#202B2A] placeholder-[#798B89] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={triggerFileUpload}
                    className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded bg-[#E8ECE9] text-[#202B2A] hover:bg-[#DCE1DE] cursor-pointer"
                  >
                    <Upload className="w-3 h-3" />
                    <span>{selectedFileName ? 'Change' : 'Browse'}</span>
                  </button>
                </div>
              ) : (
                <input
                  type="text"
                  value={claimInput}
                  onChange={(e) => setClaimInput(e.target.value)}
                  placeholder="Paste a suspicious forward, headline, or claim to verify..."
                  className="w-full bg-transparent border-0 text-xs sm:text-sm text-[#202B2A] placeholder-[#798B89] focus:outline-none"
                />
              )}
            </div>

            <Button type="submit" variant="primary" size="md" icon={<ArrowRight className="w-4 h-4" />} iconPosition="right">
              Verify Claim
            </Button>
          </form>

          {/* Honest Status & Demonstration Sample Prompts */}
          <div className="space-y-1.5 text-xs text-[#516260]">
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              <span className="text-[#798B89]">Try benchmark examples:</span>
              <button 
                type="button" 
                onClick={() => navigate('/verify?id=demo-scholarship-scheme')}
                className="text-[#155E59] hover:underline cursor-pointer"
              >
                Scholarship scheme (3 claims)
              </button>
              <span className="text-[#DCE2DF]">•</span>
              <button 
                type="button" 
                onClick={() => navigate('/verify?id=demo-curfew-order')}
                className="text-[#155E59] hover:underline cursor-pointer"
              >
                Curfew order (Outdated)
              </button>
              <span className="text-[#DCE2DF]">•</span>
              <button 
                type="button" 
                onClick={() => navigate('/verify?id=demo-himalayan-salt')}
                className="text-[#155E59] hover:underline cursor-pointer"
              >
                Himalayan salt cure (False)
              </button>
              <span className="text-[#DCE2DF]">•</span>
              <button 
                type="button" 
                onClick={() => navigate('/verify?id=demo-civic-drinking-water')}
                className="text-[#155E59] hover:underline cursor-pointer"
              >
                Civic rumor (Cannot confirm)
              </button>
            </div>

            <p className="text-[11px] text-[#798B89]">
              Demonstration mode: Live search APIs are not connected. Pre-audited benchmark cases demonstrate interface output.
            </p>
          </div>
        </div>
      </section>

      {/* Verification Workflow (Short & Clean) */}
      <section className="border-t border-[#E2E7E4] pt-12 space-y-6">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-[#202B2A] tracking-tight">
            How Verification Works
          </h2>
          <p className="text-xs sm:text-sm text-[#516260]">
            A transparent 3-step evaluation comparing statements directly with source text.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="text-xs font-semibold text-[#155E59] flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-[#E4F2E9] text-[#165B36] flex items-center justify-center text-[10px] font-bold">1</span>
              <span>Retrieve Relevant Passages</span>
            </div>
            <p className="text-xs text-[#516260] leading-relaxed">
              Finds primary reporting, public records, and official notices relevant to the specific assertions in the statement.
            </p>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-semibold text-[#155E59] flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-[#E4F2E9] text-[#165B36] flex items-center justify-center text-[10px] font-bold">2</span>
              <span>Compare Source Passages</span>
            </div>
            <p className="text-xs text-[#516260] leading-relaxed">
              Checks the submitted message against retrieved text line-by-line to detect altered numbers, cherry-picked quotes, or omitted qualifiers.
            </p>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-semibold text-[#155E59] flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-[#E4F2E9] text-[#165B36] flex items-center justify-center text-[10px] font-bold">3</span>
              <span>Check Recency & Sufficiency</span>
            </div>
            <p className="text-xs text-[#516260] leading-relaxed">
              Surfaces publication timestamps to catch superseded information, and safely returns <span className="font-medium text-[#202B2A]">Cannot Confirm</span> if evidence is absent or inconclusive.
            </p>
          </div>
        </div>
      </section>

      {/* Signature Features (Three Concise Explanations) */}
      <section className="border-t border-[#E2E7E4] pt-12 space-y-6">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-[#202B2A] tracking-tight">
            Key Verification Features
          </h2>
          <p className="text-xs sm:text-sm text-[#516260]">
            Core tools designed to help readers understand why a claim is true, misleading, or unverified.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="p-4 rounded border border-[#E2E7E4] bg-white space-y-2">
            <div className="flex items-center gap-2">
              <GitCompare className="w-4 h-4 text-[#155E59]" />
              <h3 className="text-sm font-semibold text-[#202B2A]">
                Claim-to-Evidence Diff
              </h3>
            </div>
            <p className="text-xs text-[#516260] leading-relaxed">
              Highlights exact word and figure differences between a claim and its source text, showing where claims exaggerate or change details.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-4 rounded border border-[#E2E7E4] bg-white space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#155E59]" />
              <h3 className="text-sm font-semibold text-[#202B2A]">
                Temporal Truth Engine
              </h3>
            </div>
            <p className="text-xs text-[#516260] leading-relaxed">
              Checks publication and last-updated timestamps to identify claims that were once accurate but have since been superseded by newer events.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-4 rounded border border-[#E2E7E4] bg-white space-y-2">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-[#155E59]" />
              <h3 className="text-sm font-semibold text-[#202B2A]">
                Evidence Sufficiency & Safe Abstention
              </h3>
            </div>
            <p className="text-xs text-[#516260] leading-relaxed">
              Refuses to guess. When reliable evidence is absent or conflicting, SatyaCheck returns <span className="font-medium text-[#202B2A]">Cannot Confirm</span> instead of guessing.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
