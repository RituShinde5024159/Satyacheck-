import type { ClaimVerification } from '../types';

export const MOCK_CLAIMS: ClaimVerification[] = [
  {
    id: 'sc-8491',
    claim: 'Renewable energy accounted for over 30% of global electricity generation for the first time in 2023.',
    claimant: 'Global Energy Transition Forum',
    timestamp: '2024-03-12',
    category: 'Science & Climate',
    verdict: 'verified_true',
    verdictLabel: 'Verified True',
    confidenceScore: 96,
    summary: 'Corroborated by the International Energy Agency (IEA) and Ember Global Electricity Review. Driven primarily by record additions in solar PV and wind generation capacity.',
    methodologyNotes: 'Cross-verified against primary statistical databases from the IEA, IRENA, and national grid operator audit sheets.',
    sources: [
      {
        id: 'src-1',
        title: 'Global Electricity Review 2024 Report',
        publisher: 'Ember Energy Analytics',
        url: 'https://ember-climate.org',
        credibilityScore: 98,
        publishedDate: 'May 2024',
        excerpt: 'Renewables generated a record 30.3% of global electricity in 2023, up from 29.4% in 2022.',
        stance: 'supports'
      },
      {
        id: 'src-2',
        title: 'Renewables 2023 Analysis and Forecast to 2028',
        publisher: 'International Energy Agency (IEA)',
        url: 'https://iea.org',
        credibilityScore: 99,
        publishedDate: 'Jan 2024',
        excerpt: 'Global renewable capacity additions reached nearly 510 GW in 2023, representing the fastest growth rate in two decades.',
        stance: 'supports'
      }
    ]
  },
  {
    id: 'sc-8492',
    claim: 'Consuming raw Himalayan salt with warm water cures clinical hypertension within 14 days.',
    claimant: 'Viral Wellness Video (TikTok/Instagram)',
    timestamp: '2024-03-10',
    category: 'Public Health',
    verdict: 'fabricated',
    verdictLabel: 'Fabricated & Harmful',
    confidenceScore: 99,
    summary: 'Directly refuted by clinical cardiological consensus. Himalayan pink salt consists of 96-99% sodium chloride; excess sodium intake exacerbates arterial hypertension rather than curing it.',
    methodologyNotes: 'Clinical trial registries and peer-reviewed journals (AHA, ESC, WHO) show zero empirical support. Medically dangerous advice.',
    fallaciesIdentified: ['Appeal to Nature Fallacy', 'Unsupported Medical Cure Claim'],
    sources: [
      {
        id: 'src-3',
        title: 'Dietary Sodium and Hypertension Guideline',
        publisher: 'American Heart Association (AHA)',
        url: 'https://heart.org',
        credibilityScore: 99,
        publishedDate: 'Nov 2023',
        excerpt: 'Clinical evidence confirms reducing sodium intake is one of the most effective lifestyle interventions to reduce blood pressure.',
        stance: 'refutes'
      },
      {
        id: 'src-4',
        title: 'Mineral Composition and Toxicity Assessment of Pink Salts',
        publisher: 'Foods Journal (Peer-Reviewed)',
        url: 'https://mdpi.com',
        credibilityScore: 94,
        publishedDate: 'Sep 2022',
        excerpt: 'Pink salt provides negligible non-sodium mineral benefits and contains equivalent hypertensive sodium density to regular table salt.',
        stance: 'refutes'
      }
    ]
  },
  {
    id: 'sc-8493',
    claim: 'The global central bank interest rate cuts in late 2024 have completely halted corporate debt refinancing defaults.',
    claimant: 'Financial Newsletter Digest',
    timestamp: '2024-03-08',
    category: 'Economics',
    verdict: 'misleading',
    verdictLabel: 'Misleading Context',
    confidenceScore: 91,
    summary: 'While monetary easing softened borrowing spreads for investment-grade issuers, corporate default rates in speculative-grade (high-yield) tranches remained elevated throughout Q4.',
    methodologyNotes: 'Evaluated default indexes from Moody’s, S&P Global Ratings, and the Bank for International Settlements.',
    fallaciesIdentified: ['Overgeneralization', 'Cherry-picking Timeframes'],
    sources: [
      {
        id: 'src-5',
        title: 'Global Corporate Default Study Q4',
        publisher: 'S&P Global Ratings',
        url: 'https://spglobal.com',
        credibilityScore: 97,
        publishedDate: 'Jan 2025',
        excerpt: 'High-yield debt defaults stabilized but remained at 3.9%, well above zero, despite base rate reductions.',
        stance: 'contextualizes'
      }
    ]
  },
  {
    id: 'sc-8494',
    claim: 'Quantum computers have officially broken RSA-2048 encryption standards in active production environments.',
    claimant: 'Tech Blog Headline',
    timestamp: '2024-03-05',
    category: 'Technology',
    verdict: 'fabricated',
    verdictLabel: 'Fabricated',
    confidenceScore: 98,
    summary: 'No functional quantum system possesses the thousands of logical (error-corrected) qubits required to execute Shor’s algorithm on RSA-2048 keys. Standard cryptography remains intact today.',
    methodologyNotes: 'Verified against NIST post-quantum standardization timelines and IEEE Quantum computing reports.',
    fallaciesIdentified: ['Sensationalist Headline Inflation'],
    sources: [
      {
        id: 'src-6',
        title: 'Post-Quantum Cryptography Standardization Status',
        publisher: 'National Institute of Standards and Technology (NIST)',
        url: 'https://nist.gov',
        credibilityScore: 99,
        publishedDate: 'Aug 2024',
        excerpt: 'Commercial RSA implementations are not currently susceptible to existing NISQ-era quantum hardware.',
        stance: 'refutes'
      }
    ]
  },
  {
    id: 'sc-8495',
    claim: 'A new European Union directive mandates algorithmic transparency reports for all AI systems deployed in high-risk sectors.',
    claimant: 'Policy Brief / Reuters',
    timestamp: '2024-03-01',
    category: 'Policy & Governance',
    verdict: 'verified_true',
    verdictLabel: 'Verified True',
    confidenceScore: 97,
    summary: 'The EU Artificial Intelligence Act specifically requires rigorous documentation, conformity assessments, and algorithmic transparency for AI classified under high-risk tiers.',
    methodologyNotes: 'Directly cross-referenced with EU Official Journal text of Regulation (EU) 2024/1689.',
    sources: [
      {
        id: 'src-7',
        title: 'Regulation (EU) 2024/1689 of the European Parliament and of the Council',
        publisher: 'Official Journal of the European Union',
        url: 'https://eur-lex.europa.eu',
        credibilityScore: 100,
        publishedDate: 'Jul 2024',
        excerpt: 'Providers of high-risk AI systems shall draw up the technical documentation before that system is placed on the market or put into service.',
        stance: 'supports'
      }
    ]
  },
  {
    id: 'sc-8496',
    claim: 'Eating dark chocolate with 70%+ cacao increases cognitive processing speed by 40% after a single serving.',
    claimant: 'Lifestyle Magazine',
    timestamp: '2024-02-26',
    category: 'Public Health',
    verdict: 'unsubstantiated',
    verdictLabel: 'Cannot Confirm (Insufficient Evidence)',
    confidenceScore: 88,
    summary: 'While flavanols in cacao have modest vascular benefits studied over longitudinal horizons, no statistically sound replication demonstrates a 40% immediate acute boost in processing speed.',
    methodologyNotes: 'Systematic literature review on PubMed and Cochrane Library found only small, underpowered exploratory studies with high risk of bias.',
    fallaciesIdentified: ['Magnitude Exaggeration'],
    sources: [
      {
        id: 'src-8',
        title: 'Flavanols and Cognitive Function: A Meta-Analysis',
        publisher: 'Cochrane Database of Systematic Reviews',
        url: 'https://cochranelibrary.com',
        credibilityScore: 96,
        publishedDate: '2023',
        excerpt: 'Evidence for acute cognitive enhancement following single-dose flavanol supplementation remains inconclusive and clinically unproven.',
        stance: 'contextualizes'
      }
    ]
  }
];
