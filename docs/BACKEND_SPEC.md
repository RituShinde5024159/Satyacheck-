# SatyaCheck Backend API Specification (FastAPI)

This document describes the REST API contract expected by the SatyaCheck frontend.

## Base URL
* Local Development: `http://localhost:8000`
* Production: Set via `VITE_API_BASE_URL`

## 1. System Health
### `GET /api/health`
Returns service availability status.

**Response:**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "search_engine": "connected"
}
```

---

## 2. Text Message Verification
### `POST /api/verify/text`
Decomposes raw text/WhatsApp forwards into atomic claims and queries evidence indices.

**Request:** `application/json`
```json
{
  "text": "PM Shishyavrutti Yojana gives ₹50,000 to all students. Applications close 31 March.",
  "language": "en" // "en" | "hi" | "mr"
}
```

**Response:** `200 OK` (See Full Report Schema below)

---

## 3. Image & Screenshot Verification
### `POST /api/verify/image`
Extracts text using OCR and evaluates assertions against credible evidence archives.

**Request:** `multipart/form-data`
* `file`: Binary image file (image/png, image/jpeg, image/webp; max 10MB)
* `language`: string (`"en"` | `"hi"` | `"mr"`)

**Response:** `200 OK` (See Full Report Schema below)

---

## 4. PDF Document Verification
### `POST /api/verify/pdf`
Extracts document sections from circulars, gazettes, or notices and evaluates claims.

**Request:** `multipart/form-data`
* `file`: Binary document file (application/pdf; max 15MB)
* `language`: string (`"en"` | `"hi"` | `"mr"`)

**Response:** `200 OK` (See Full Report Schema below)

---

## 5. Public URL Verification
### `POST /api/verify/url`
Scrapes the target public article/post, extracts central claims, and evaluates them.

**Request:** `application/json`
```json
{
  "url": "https://example.com/article-or-circular",
  "language": "en"
}
```

**Response:** `200 OK` (See Full Report Schema below)

---

## 6. Report Retrieval
### `GET /api/reports/{id}`
Retrieves a previously computed audit record.

---

## Core Report Schema (JSON)
```json
{
  "id": "report-9812",
  "submittedAt": "2026-03-24",
  "inputMode": "text",
  "language": "en",
  "rawInput": "Original submitted statement",
  "overallSummary": "Summary synthesizing individual claim findings.",
  "isDemonstration": false,
  "claims": [
    {
      "id": "claim-1",
      "originalText": "Verbatim claim statement from user input",
      "normalizedClaim": "Normalized factual proposition",
      "verdict": "Partly supported", // "Verified" | "False" | "Outdated" | "Partly supported" | "Cannot confirm"
      "evidenceQuality": "Strong", // "Strong" | "Limited" | "Conflicting" | "Absent"
      "explanation": "Clear, plain-language reasoning without artificial confidence probability.",
      "diff": {
        "supportedDetails": ["Matching scheme name"],
        "mismatches": [
          {
            "field": "Disbursement Amount",
            "claimValue": "₹50,000",
            "evidenceValue": "₹2,500/month",
            "explanation": "Official stipend is ₹2,500/mo, not a lump sum ₹50,000."
          }
        ]
      },
      "temporal": {
        "claimTimeframe": "2026",
        "evidencePublishedDate": "2024-07-15",
        "evidenceUpdatedDate": "2025-11-20",
        "expiryDeadline": "2023-03-31",
        "isExpired": true,
        "temporalNote": "The 31 March deadline text is recycled from an expired 2023 notice."
      },
      "safeAbstentionReason": null,
      "sources": [
        {
          "id": "src-1",
          "publisher": "National Scholarship Portal",
          "title": "Prime Minister Scholarship Scheme Guidelines",
          "url": "https://scholarships.gov.in",
          "publishedDate": "2024-07-15",
          "lastUpdatedDate": "2025-11-20",
          "passageText": "Verbatim excerpt from official document.",
          "stance": "partial" // "supports" | "refutes" | "partial" | "inconclusive"
        }
      ]
    }
  ]
}
```
