# SatyaCheck

SatyaCheck is a web application for examining factual claims in messages and public web pages. It extracts claims, searches for relevant web results, and presents an AI-generated comparison with source snippets and links. It is intended to support a person's review of the evidence, not to replace it.

## What it does

- Accepts text claims and public HTTP/HTTPS URLs for live checks.
- Extracts up to eight factual claims from a text submission.
- Retrieves search results using one configured provider: Brave Search, Google Custom Search, or Tavily.
- Compares each claim with the retrieved result snippets and returns a verdict, explanation, evidence-quality label, discrepancies, and available publication dates.
- Shows result sources so users can inspect the original pages.
- Includes prepared demonstration reports and an archive of those reports.
- Uses Gemini for claim extraction and verdict generation by default. If Gemini returns a quota/rate-limit error, it switches to the configured local Ollama model for subsequent AI work until the backend restarts.

### Important limitations

- **Image uploads do not currently use OCR.** The backend receives the file but verifies its filename and metadata, not text inside the image.
- **PDF uploads do not currently extract document text.** The backend uses the filename and metadata, not the PDF contents.
- URL extraction is basic HTML tag removal. Some pages may provide poor text or include metadata rather than clean article text.
- AI verdicts and claim-to-evidence comparisons may be incorrect. Search results and snippets are not a guarantee of truth; open and assess the source links yourself.
- A live report depends on valid AI and search-provider configuration, internet access for search, and available provider quotas.
- Ollama inference speed depends on the local computer. The configured request timeout is up to five minutes; complex or slow requests may still time out.
- Live reports are held in backend memory and are lost when the backend process restarts.
- Language choices appear in the interface and report, but output quality can vary by model and input language.

## Technology

- Frontend: React, TypeScript, Vite, Tailwind CSS
- Backend: Python, FastAPI, Pydantic, HTTPX
- AI: Google Gemini, with local Ollama fallback on Gemini quota/rate-limit errors
- Search: Tavily, Brave Search, or Google Custom Search

## Prerequisites

- Windows 10/11 (commands below use PowerShell)
- Node.js and npm compatible with the installed Vite version
- Python 3.10 or newer
- A Gemini API key for normal AI use
- At least one supported search-provider credential for live evidence retrieval
- Optional: Ollama installed, running, and the selected model downloaded for local fallback

## Installation

Run these commands from the project root (the directory containing `package.json`).

### 1. Create the environment file

```powershell
Copy-Item .env.example .env
```

Open `.env` and add your own credentials. Do not commit this file or paste keys into public issues, screenshots, or chats.

### 2. Install frontend dependencies

```powershell
npm install
```

### 3. Create and install the Python environment

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

If PowerShell blocks virtual-environment activation, use the environment's interpreter directly:

```powershell
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

## Configure API keys

Edit the project-root `.env` file. Add **at least one** search provider key:

```dotenv
GEMINI_API_KEY=your_gemini_key
TAVILY_API_KEY=your_tavily_key
```

The example above uses Tavily; you may instead configure Brave or Google Custom Search. If multiple search providers are configured, the backend selects them in this order:

1. Brave Search (`BRAVE_SEARCH_API_KEY`)
2. Google Custom Search (both `GOOGLE_CSE_API_KEY` and `GOOGLE_CSE_CX`)
3. Tavily (`TAVILY_API_KEY`)

Gemini is required by the current verification pipeline. Ollama is a fallback after Gemini reports quota/rate-limit exhaustion; it does not replace the need for a configured Gemini key in the current setup.

### Optional Ollama fallback

The defaults match a local Ollama installation with the `qwen2.5:7b` model:

```dotenv
# OLLAMA_BASE_URL=http://localhost:11434
# OLLAMA_MODEL=qwen2.5:7b
```

If you need to install the model, start Ollama and run:

```powershell
ollama pull qwen2.5:7b
ollama list
```

Keep Ollama running. The backend switches to it after a Gemini quota/rate-limit error and uses it for later AI work until the backend restarts. On a slower computer, local responses can take several minutes.

## Run locally

Open **two PowerShell terminals** in the project root.

### Terminal 1: backend

```powershell
.\.venv\Scripts\Activate.ps1
python -m uvicorn backend.app:app --reload
```

The API is available at `http://localhost:8000`; interactive API documentation is at `http://localhost:8000/docs`.

### Terminal 2: frontend

```powershell
npm run dev
```

Open the Vite URL printed in the terminal (normally `http://localhost:5173`).

The frontend defaults to the backend at `http://localhost:8000`. To use another backend URL, create a frontend environment file such as `.env.local` and set:

```dotenv
VITE_API_BASE_URL=http://localhost:8000
```

Restart the Vite server after changing frontend environment variables. If deploying the frontend and backend on different origins, configure `FRONTEND_URL` in the backend `.env` with the frontend's origin.

## Use the application

1. Open **Verify** or use the home page's quick-check form.
2. Choose **Text** or **Public URL** for the currently supported live input flows.
3. Submit one concise factual claim or an accessible public article URL.
4. Wait for the report. A submission may contain multiple claims and require multiple AI/search requests.
5. Review the verdict, explanation, evidence quality, comparison details, and dates.
6. Expand the source passages and open original links before relying on the result.

Use the sample scenarios to explore prepared report layouts. Samples are static demonstration data; selecting one does not perform a new live check.

## API endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Basic backend and search-configuration health |
| `POST` | `/api/verify/text` | Verify submitted text |
| `POST` | `/api/verify/url` | Fetch a public URL and verify extracted page text |
| `POST` | `/api/verify/image` | Image-upload placeholder; no OCR |
| `POST` | `/api/verify/pdf` | PDF-upload placeholder; no PDF text extraction |
| `GET` | `/api/reports/{report_id}` | Retrieve a report held in the running backend process |

## Development commands

```powershell
npm run lint
npm run build
python -m pytest backend\tests -q
```

Run the Python test command with the project's virtual environment activated, or use:

```powershell
.\.venv\Scripts\python.exe -m pytest backend\tests -q
```

## Project layout

```text
backend/
  app.py                 FastAPI endpoints
  claim_extractor.py     AI claim extraction
  evidence_retriever.py  Brave, Google CSE, and Tavily adapters
  llm_fallback.py        Ollama HTTP fallback
  pipeline.py            Verification orchestration and report assembly
  verdict_engine.py      Evidence-grounded verdict generation
  tests/                 Backend tests
src/
  components/            Shared UI, verification form, and report display
  data/                  Prepared demonstration reports
  pages/                 Home, Verify, Reports, and How it works pages
  services/api.ts        Frontend-to-backend API client
  types/                 Frontend report and request types
docs/
  BACKEND_SPEC.md        Backend API and behavior notes
```

## Security and privacy

- Keep `.env` and API keys private. The repository ignores local environment files while tracking `.env.example`.
- Do not commit credentials, personal data, or private documents.
- Submitted text and retrieved evidence are sent to configured external AI/search providers during live verification. Review those providers' terms and privacy policies before using sensitive content.
- This project is intended for local development unless deployment security, secrets management, persistence, and operational controls are configured separately.
