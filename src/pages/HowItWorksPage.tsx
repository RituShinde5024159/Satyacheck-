import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Binary, 
  Database, 
  Scale, 
  CheckCircle2, 
  FileCheck, 
  Lock
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';

export const HowItWorksPage: React.FC = () => {
  const pipelineSteps = [
    {
      step: '01',
      title: 'Claim Extraction & Passage Normalization',
      description: 'Incoming messages or forwards are broken down into verifiable factual propositions, isolating key entities, figures, dates, and locations.',
      icon: <Binary className="w-5 h-5 text-[#155E59]" />,
      badge: 'Step 1: Extraction',
    },
    {
      step: '02',
      title: 'Relevant Evidence Retrieval',
      description: 'SatyaCheck queries verified databases, archival indices, and reliable news repositories to retrieve relevant passages related to the statement.',
      icon: <Database className="w-5 h-5 text-[#155E59]" />,
      badge: 'Step 2: Retrieval',
    },
    {
      step: '03',
      title: 'Claim-to-Evidence Diff & Passage Comparison',
      description: 'Retrieved source passages are compared directly against the claim statement, highlighting discrepancies in figures, omitted qualifiers, or altered phrasing.',
      icon: <Scale className="w-5 h-5 text-[#155E59]" />,
      badge: 'Step 3: Comparison',
    },
    {
      step: '04',
      title: 'Temporal Verification & Evidence Sufficiency',
      description: 'Checks publication and update dates to surface outdated information, and returns Cannot Confirm when available evidence is insufficient.',
      icon: <FileCheck className="w-5 h-5 text-[#155E59]" />,
      badge: 'Step 4: Evaluation',
    },
  ];

  const evidenceHierarchy = [
    {
      level: 'Tier 1 — Primary Public Records',
      sources: 'Official statistical registries, legislative gazette text, authenticated filings, and primary sensor records.',
      weight: 'Primary Corroboration',
    },
    {
      level: 'Tier 2 — Peer-Reviewed Academic Literature',
      sources: 'Systematic reviews, meta-analyses, and empirical trial data in reputable indexed journals.',
      weight: 'Secondary Corroboration',
    },
    {
      level: 'Tier 3 — Accredited Primary News Dispatches',
      sources: 'Direct on-the-ground wire reporting from accredited agencies with documented correction policies.',
      weight: 'Contextual Corroboration',
    },
    {
      level: 'Tier 4 — Unverified Social Commentary',
      sources: 'Social media posts, unsourced blogs, and sponsored promotional materials.',
      weight: 'Insufficient for Verification',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-12">
      {/* Header */}
      <div className="border-b border-[#E2E7E4] pb-6 space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#202B2A] tracking-tight">
          How SatyaCheck Verifies Claims
        </h1>
        <p className="text-xs sm:text-sm text-[#516260] max-w-2xl leading-relaxed">
          SatyaCheck retrieves relevant evidence, compares individual claims with source passages, and shows publication dates when available.
        </p>
      </div>

      {/* 4-Step Pipeline */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-[#202B2A] tracking-tight">
            The 4-Stage Verification Pipeline
          </h2>
          <p className="text-sm text-[#516260] mt-1">
            From raw statement ingestion to peer-reproducible verdict synthesis.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pipelineSteps.map((step) => (
            <Card key={step.step} variant="default" padding="lg" className="space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#155E59] bg-[#E4F2E9] px-2.5 py-0.5 rounded border border-[#C6E2D1]">
                    {step.badge}
                  </span>
                  <span className="text-lg font-mono font-bold text-[#D0D7D4]">
                    {step.step}
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <div className="w-8 h-8 rounded bg-[#EEF6F4] flex items-center justify-center shrink-0">
                    {step.icon}
                  </div>
                  <h3 className="text-base font-semibold text-[#202B2A]">
                    {step.title}
                  </h3>
                </div>

                <p className="text-xs sm:text-sm text-[#516260] leading-relaxed">
                  {step.description}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Evidentiary Hierarchy Table */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-[#202B2A] tracking-tight">
            Evidence Source Hierarchy
          </h2>
          <p className="text-sm text-[#516260] mt-1">
            Claims are not weighted by popularity or social engagement; evidence is graded by empirical provenance.
          </p>
        </div>

        <div className="border border-[#DCE2DF] rounded-md overflow-hidden bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="bg-[#FAFAF7] border-b border-[#DCE2DF] text-[#202B2A] font-semibold">
                  <th className="py-3 px-4">Tier & Classification</th>
                  <th className="py-3 px-4">Eligible Sources</th>
                  <th className="py-3 px-4 text-right">Evidentiary Weight</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8ECE9]">
                {evidenceHierarchy.map((tier, index) => (
                  <tr key={index} className="hover:bg-[#FAFAF7]/50">
                    <td className="py-3.5 px-4 font-medium text-[#202B2A]">
                      {tier.level}
                    </td>
                    <td className="py-3.5 px-4 text-[#516260] leading-relaxed">
                      {tier.sources}
                    </td>
                    <td className="py-3.5 px-4 text-right font-semibold text-[#155E59] whitespace-nowrap">
                      {tier.weight}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Non-Partisan & Transparency Charter */}
      <section className="bg-white border border-[#DCE2DF] rounded-md p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-3 text-[#155E59]">
          <Lock className="w-6 h-6" />
          <h2 className="text-xl font-semibold text-[#202B2A]">
            Editorial Independence & Non-Partisan Charter
          </h2>
        </div>
        <p className="text-sm text-[#516260] leading-relaxed">
          SatyaCheck does not receive funding from political parties, PACs, or sponsored corporate entities seeking to influence public discourse. All evaluation metrics, confidence scoring algorithms, and reference repositories are openly cited. If an assertion is challenged with new peer-reviewed data, audits are updated and time-stamped in the public ledger.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#E8ECE9] text-xs">
          <div className="flex items-center gap-2 text-[#202B2A] font-medium">
            <CheckCircle2 className="w-4 h-4 text-[#155E59]" />
            <span>Open Reference Links</span>
          </div>
          <div className="flex items-center gap-2 text-[#202B2A] font-medium">
            <CheckCircle2 className="w-4 h-4 text-[#155E59]" />
            <span>Transparent Correction Log</span>
          </div>
          <div className="flex items-center gap-2 text-[#202B2A] font-medium">
            <CheckCircle2 className="w-4 h-4 text-[#155E59]" />
            <span>Zero Algorithmic Shadowing</span>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <div className="text-center pt-4">
        <Link to="/verify">
          <Button variant="primary" size="lg" icon={<ArrowRight className="w-4 h-4" />} iconPosition="right">
            Test a Claim Now
          </Button>
        </Link>
      </div>
    </div>
  );
};
