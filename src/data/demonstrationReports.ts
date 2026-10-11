import type { VerificationReport } from '../types';

export const DEMONSTRATION_REPORTS: VerificationReport[] = [
  // 1. Multi-Claim Scenario: Partly Supported
  {
    id: 'demo-scholarship-scheme',
    submittedAt: '2026-03-24',
    inputMode: 'text',
    language: 'en',
    rawInput: 'Breaking: PM Shishyavrutti Yojana 2026 launched! Central government is giving ₹50,000 direct cash grant to all college students. Applications close this Friday, 31st March. Apply now before portal closes.',
    overallSummary: 'The viral forward mixes a real central scholarship program with heavily distorted amounts, false universal eligibility, and an expired deadline from an older academic cycle.',
    isDemonstration: true,
    category: 'Policy & Governance',
    claims: [
      {
        id: 'claim-1',
        originalText: 'PM Shishyavrutti Yojana (Scholarship Scheme) launched by Central Government exists.',
        normalizedClaim: 'The Central Government administers a Prime Minister scholarship program for eligible students.',
        verdict: 'Verified',
        evidenceQuality: 'Strong',
        explanation: 'The Government of India administers the Prime Minister Scholarship Scheme (PMSS) via the Kendriya Sainik Board and National Scholarship Portal.',
        diff: {
          supportedDetails: [
            'Program name: Prime Minister Scholarship Scheme (PMSS)',
            'Administering body: Central Government / Ministry of Defence & Welfare'
          ],
          mismatches: []
        },
        temporal: {
          claimTimeframe: '2026 Cycle',
          evidencePublishedDate: '2024-07-15',
          evidenceUpdatedDate: '2025-11-20',
          isExpired: false,
          temporalNote: 'Official scheme guidelines are currently active and recognized on the National Scholarship Portal.'
        },
        sources: [
          {
            id: 'src-pmss-1',
            publisher: 'National Scholarship Portal (NSP)',
            title: 'Prime Minister Scholarship Scheme Guidelines and Eligibility',
            url: 'https://scholarships.gov.in',
            publishedDate: '2024-07-15',
            lastUpdatedDate: '2025-11-20',
            passageText: 'The Prime Minister Scholarship Scheme (PMSS) was introduced to encourage higher technical and professional education for dependent wards and widows of ex-servicemen and central armed police personnel.',
            stance: 'supports'
          }
        ]
      },
      {
        id: 'claim-2',
        originalText: 'Central government is giving ₹50,000 direct cash grant to all college students.',
        normalizedClaim: 'Every college student receives a universal cash disbursement of ₹50,000.',
        verdict: 'False',
        evidenceQuality: 'Strong',
        explanation: 'There is no universal ₹50,000 disbursement for all students. The scheme provides restricted stipends ranging from ₹2,500 to ₹3,000 per month (₹30,000 to ₹36,000/year) strictly to eligible dependent wards of armed police and military personnel.',
        diff: {
          supportedDetails: [
            'Financial support provided for higher education'
          ],
          mismatches: [
            {
              field: 'Eligibility',
              claimValue: 'All college students',
              evidenceValue: 'Strictly dependent wards and widows of CAPF/AR & ex-servicemen meeting minimum 60% marks in 10+2',
              explanation: 'The forwarded claim omits narrow quota eligibility and claims universal student distribution.'
            },
            {
              field: 'Disbursement Amount',
              claimValue: '₹50,000 cash grant',
              evidenceValue: '₹2,500/month for boys, ₹3,000/month for girls',
              explanation: 'Official stipends are monthly disbursements rather than a lump-sum ₹50,000 grant.'
            }
          ]
        },
        temporal: {
          claimTimeframe: '2026',
          evidencePublishedDate: '2025-08-01',
          isExpired: false,
          temporalNote: 'Current financial year limits confirmed from official circular.'
        },
        sources: [
          {
            id: 'src-pmss-2',
            publisher: 'Kendriya Sainik Board (KSB)',
            title: 'PMSS Financial Grant Allocation Rates',
            url: 'https://ksb.gov.in',
            publishedDate: '2025-08-01',
            passageText: 'Scholarship amounts: ₹2,500/- per month for male students and ₹3,000/- per month for female students. Claims of unconditional ₹50,000 cash payments are unauthorized and fraudulent.',
            stance: 'refutes'
          }
        ]
      },
      {
        id: 'claim-3',
        originalText: 'Applications close this Friday, 31st March.',
        normalizedClaim: 'The portal deadline for registration is 31st March 2026.',
        verdict: 'Outdated',
        evidenceQuality: 'Strong',
        explanation: 'The 31st March closing date corresponds to a previous 2023 academic cycle. The National Scholarship Portal operates on separate deadlines for new and renewal applicants.',
        diff: {
          supportedDetails: [],
          mismatches: [
            {
              field: 'Deadline Date',
              claimValue: 'This Friday, 31st March 2026',
              evidenceValue: 'Historical deadline: 31st March 2023; Current academic cycle calendar follows Ministry annual notification',
              explanation: 'Recycled deadline text from an expired notification.'
            }
          ]
        },
        temporal: {
          claimTimeframe: 'March 2026',
          evidencePublishedDate: '2023-03-31',
          expiryDeadline: '2023-03-31',
          isExpired: true,
          temporalNote: 'Temporal analysis reveals this exact deadline notice was first published in March 2023 and expired 3 years ago.'
        },
        sources: [
          {
            id: 'src-pmss-3',
            publisher: 'Press Information Bureau (PIB Fact Check)',
            title: 'Advisory on Fraudulent Scholarship Links and Recycled Deadlines',
            url: 'https://pib.gov.in',
            publishedDate: '2024-04-12',
            passageText: 'A viral message claiming the PM Scholarship scheme closes on 31 March with ₹50,000 aid is recycled from 2023. Citizens are advised not to share unverified links.',
            stance: 'refutes'
          }
        ]
      }
    ]
  },

  // 2. Scenario 2: Outdated (Emergency Curfew Circular)
  {
    id: 'demo-curfew-order',
    submittedAt: '2026-03-18',
    inputMode: 'image',
    sourceFileName: 'forwarded_circular_curfew.jpg',
    sourceFileSize: 482100,
    language: 'en',
    rawInput: 'URGENT: State Home Department mandates a complete 3-day weekend lockdown starting tonight. Public transportation suspended and all shops closed.',
    overallSummary: 'The viral screenshot is a genuine government notification issued in April 2020 during early pandemic restrictions. It is being recirculated without its original date stamp.',
    isDemonstration: true,
    category: 'Public Health',
    claims: [
      {
        id: 'claim-curfew-1',
        originalText: 'State Home Department mandates a complete 3-day weekend lockdown starting tonight.',
        normalizedClaim: 'A mandatory 3-day lockdown is in effect this weekend.',
        verdict: 'Outdated',
        evidenceQuality: 'Strong',
        explanation: 'The forwarded order was issued on 17 April 2020 under the Epidemic Diseases Act. It was formally repealed in May 2020. No current lockdown or movement curfew has been issued.',
        diff: {
          supportedDetails: [
            'Government circular signature and department seal are authentic historical assets.'
          ],
          mismatches: [
            {
              field: 'Applicability Period',
              claimValue: 'Starting tonight (Current)',
              evidenceValue: 'Active between 17 April 2020 and 20 April 2020',
              explanation: 'Circulated without the original issue year to produce a false sense of urgency.'
            }
          ]
        },
        temporal: {
          claimTimeframe: 'Present day',
          evidencePublishedDate: '2020-04-17',
          expiryDeadline: '2020-05-31',
          isExpired: true,
          temporalNote: 'Temporal Truth Engine detected an 80-month gap between the original promulgation date and the current forward date.'
        },
        sources: [
          {
            id: 'src-curfew-1',
            publisher: 'State Disaster Management Authority Gazette',
            title: 'Order No. DMU/2020/CR.92/DisM-1 (Historical COVID-19 Containment)',
            url: 'https://maharashtra.gov.in',
            publishedDate: '2020-04-17',
            lastUpdatedDate: '2020-05-31',
            passageText: 'In exercise of powers conferred under Section 24 of the Disaster Management Act, movement restrictions are ordered from 17th April to 20th April 2020. [Order lapsed on 31 May 2020].',
            stance: 'refutes'
          }
        ]
      }
    ]
  },

  // 3. Scenario 3: False (Fabricated Health Cure)
  {
    id: 'demo-himalayan-salt',
    submittedAt: '2026-03-10',
    inputMode: 'text',
    language: 'en',
    rawInput: 'Medical secret: Drinking raw Himalayan pink salt with warm water cures clinical hypertension in 14 days and clears arterial blockages.',
    overallSummary: 'The statement promotes a medically dangerous dietary claim. Pink salt is 98% sodium chloride; excess sodium is directly linked to arterial stiffening and elevated blood pressure.',
    isDemonstration: true,
    category: 'Public Health',
    claims: [
      {
        id: 'claim-salt-1',
        originalText: 'Drinking raw Himalayan pink salt with warm water cures clinical hypertension in 14 days.',
        normalizedClaim: 'Himalayan pink salt consumption cures arterial hypertension within two weeks.',
        verdict: 'False',
        evidenceQuality: 'Strong',
        explanation: 'Clinical cardiology consensus directly refutes this claim. Pink salt contains comparable sodium density to regular table salt. Increasing sodium intake elevates vascular resistance rather than reversing hypertension.',
        diff: {
          supportedDetails: [],
          mismatches: [
            {
              field: 'Physiological Effect',
              claimValue: 'Cures clinical hypertension and clears arterial plaque',
              evidenceValue: 'Excess sodium exacerbates hypertension, increases stroke risk, and raises arterial strain',
              explanation: 'The claim contradicts established cardiovascular clinical guidelines.'
            },
            {
              field: 'Time Horizon',
              claimValue: '14-day permanent cure',
              evidenceValue: 'Hypertension requires ongoing medical management and sodium reduction',
              explanation: 'Fabricated curative timeline with no clinical trial evidence.'
            }
          ]
        },
        temporal: {
          claimTimeframe: '14 days',
          evidencePublishedDate: '2023-11-15',
          isExpired: false,
          temporalNote: 'Evaluated against the American Heart Association and WHO Dietary Sodium Guidelines.'
        },
        sources: [
          {
            id: 'src-salt-1',
            publisher: 'American Heart Association (AHA)',
            title: 'Dietary Sodium and Blood Pressure Clinical Advisory',
            url: 'https://heart.org',
            publishedDate: '2023-11-15',
            passageText: 'No dietary salt—including Himalayan pink salt, sea salt, or rock salt—cures hypertension. All salts consist predominantly of sodium chloride. Excess sodium causes the body to hold extra water, putting extra strain on blood vessels and the heart.',
            stance: 'refutes'
          },
          {
            id: 'src-salt-2',
            publisher: 'World Health Organization (WHO)',
            title: 'Guideline: Sodium Intake for Adults and Children',
            url: 'https://who.int',
            publishedDate: '2023-03-09',
            passageText: 'Strong evidence demonstrates that sodium reduction substantially reduces systolic and diastolic blood pressure in both hypertensive and normotensive adults.',
            stance: 'refutes'
          }
        ]
      }
    ]
  },

  // 4. Scenario 4: Verified (EU AI Act Law)
  {
    id: 'demo-eu-ai-act',
    submittedAt: '2026-03-01',
    inputMode: 'url',
    sourceUrl: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=OJ:L_202401689',
    language: 'en',
    rawInput: 'The European Union has enacted Regulation (EU) 2024/1689 mandating algorithmic transparency reports and risk documentation for all high-risk AI deployments.',
    overallSummary: 'The claim accurately summarizes official statutory obligations codified in the European Union Artificial Intelligence Act.',
    isDemonstration: true,
    category: 'Technology',
    claims: [
      {
        id: 'claim-ai-1',
        originalText: 'Regulation (EU) 2024/1689 mandates algorithmic transparency and risk documentation for high-risk AI systems.',
        normalizedClaim: 'EU legislation requires technical documentation and transparency for AI systems classified as high-risk.',
        verdict: 'Verified',
        evidenceQuality: 'Strong',
        explanation: 'Article 11 and Article 13 of Regulation (EU) 2024/1689 specifically mandate detailed technical documentation and transparency reports before high-risk AI systems are placed on the market or put into service.',
        diff: {
          supportedDetails: [
            'Regulation number: Regulation (EU) 2024/1689',
            'Requirement: Algorithmic transparency and technical risk documentation',
            'Scope: High-risk artificial intelligence systems'
          ],
          mismatches: []
        },
        temporal: {
          claimTimeframe: 'Active Law',
          evidencePublishedDate: '2024-07-12',
          isExpired: false,
          temporalNote: 'Regulation published in the Official Journal on 12 July 2024; entered into force on 1 August 2024 with phased operational deadlines.'
        },
        sources: [
          {
            id: 'src-ai-1',
            publisher: 'Official Journal of the European Union',
            title: 'Regulation (EU) 2024/1689 of the European Parliament and of the Council',
            url: 'https://eur-lex.europa.eu',
            publishedDate: '2024-07-12',
            passageText: 'Providers of high-risk AI systems shall draw up technical documentation demonstrating compliance and ensuring that their systems are designed and developed in such a way to allow deployers to interpret outputs and use them appropriately.',
            stance: 'supports'
          }
        ]
      }
    ]
  },

  // 5. Scenario 5: Cannot Confirm (Local Civic Rumor / Safe Abstention)
  {
    id: 'demo-local-civic-rumor',
    submittedAt: '2026-03-22',
    inputMode: 'text',
    language: 'en',
    rawInput: 'Notice from neighbor: Ward 14 Municipal Office in Kothrud is closing down all offline citizen counters next Monday and Tuesday for an internal audit.',
    overallSummary: 'No municipal gazette, official citizen advisory, or official statement exists corroborating or refuting this localized claim. SatyaCheck safely abstains rather than making an unverified guess.',
    isDemonstration: true,
    category: 'General Media',
    claims: [
      {
        id: 'claim-civic-1',
        originalText: 'Ward 14 Municipal Office in Kothrud is closing down offline citizen counters next Monday and Tuesday.',
        normalizedClaim: 'The Kothrud Ward 14 civic office will be closed for offline services next Monday and Tuesday.',
        verdict: 'Cannot confirm',
        evidenceQuality: 'Absent',
        explanation: 'A comprehensive query of municipal press releases, circulars, and the Pune Municipal Corporation public portal yielded no announcements regarding counter closures. Absence of public evidence does not establish whether the rumor is true or false.',
        diff: {
          supportedDetails: [],
          mismatches: []
        },
        temporal: {
          claimTimeframe: 'Upcoming Monday-Tuesday',
          isExpired: false,
          temporalNote: 'No time-stamped official advisory has been issued for the dates in question.'
        },
        safeAbstentionReason: 'Evidence is absent across official citizen advisories and public gazettes. In accordance with SatyaCheck safe abstention protocols, an unsubstantiated judgment is withheld.',
        sources: [
          {
            id: 'src-civic-1',
            publisher: 'Pune Municipal Corporation (PMC) Citizen Notices',
            title: 'Official Civic Circulars and Public Advisories Repository',
            url: 'https://pmc.gov.in',
            publishedDate: '2026-03-22',
            passageText: 'Current public advisories show regular operational hours (09:45 to 17:30) across all 15 ward offices. No temporary closure notification has been promulgated for Ward 14.',
            stance: 'inconclusive'
          }
        ]
      }
    ]
  }
];
