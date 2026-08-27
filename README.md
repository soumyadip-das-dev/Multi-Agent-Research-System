# Multi-Agent Research System

A clean, modular, learning-focused **Multi-Agent Research System** built with Python, FastAPI, LangGraph, Pydantic, Tavily Web Search, Semantic Scholar Academic Search, and a modern React + Tailwind CSS frontend dashboard.

---

## 1. Overview

The **Multi-Agent Research System** takes a user's research question, decomposes it into specialized subtasks, delegates work across distinct AI agents (web research, academic paper search, fact-checking), collects evidence, and synthesizes a structured research report with authentic source citations.

### Problem
Single prompt-based LLM queries often suffer from:
* Hallucinated links and unverifiable claims.
* Lack of academic rigor or peer-reviewed citations.
* Monolithic prompt execution without modular delegation or auditability.

### Solution
This project demonstrates practical multi-agent orchestration by dividing research responsibilities into **5 specialized agent nodes** connected via **LangGraph**:
1. **Orchestrator Agent**: Analyzes queries and decomposes them into web and academic tasks.
2. **Research Agent**: Performs web research using Tavily API.
3. **Academic Agent**: Queries peer-reviewed literature using Semantic Scholar API.
4. **Fact Checker Agent**: Validates claims against evidence and tags confidence levels (`HIGH`, `MEDIUM`, `LOW`).
5. **Synthesizer Agent**: Combines verified findings into a structured report citing only real, supplied sources.

---

## 2. System Architecture

```text
                              USER QUERY
                                  |
                                  v
                         +----------------+
                         |  Orchestrator  |
                         |     Agent      |
                         +-------+--------+
                                 |
                      +----------+----------+
                      |                     |
                      v                     v
              +---------------+     +---------------+
              |   Research    |     |   Academic    |
              |     Agent     |     |     Agent     |
              +-------+-------+     +-------+-------+
                      |                     |
                      +----------+----------+
                                 |
                                 v
                        +----------------+
                        |  Fact Checker  |
                        |     Agent      |
                        +-------+--------+
                                |
                                v
                        +----------------+
                        |  Synthesizer   |
                        |     Agent      |
                        +-------+--------+
                                |
                                v
                         FINAL REPORT
```

---

## 3. Agents Breakdown

| Agent | Responsibility | Output |
| :--- | :--- | :--- |
| **Orchestrator Agent** | Analyzes the research question and decomposes it into subtasks. | List of `ResearchTask` (`type: "web"` or `"academic"`) |
| **Research Agent** | Executes web research tasks via Tavily API. | List of `Finding` objects with web source URLs |
| **Academic Agent** | Searches literature via Semantic Scholar API. | List of `Finding` objects with paper titles, authors, and year |
| **Fact Checker Agent** | Compares claims against evidence and identifies contradictions. | List of `VerifiedClaim` objects with confidence scores (`HIGH`, `MEDIUM`, `LOW`) |
| **Synthesizer Agent** | Compiles verified findings into a final Markdown research report. | Structured Markdown report adhering strictly to supplied sources |

---

## 4. Shared Research State (`ResearchState`)

State is managed cleanly across agent nodes using Pydantic:

```python
class ResearchState(BaseModel):
    query: str
    tasks: list[ResearchTask]
    research_findings: list[Finding]
    academic_findings: list[Finding]
    claims: list[str]
    verified_claims: list[VerifiedClaim]
    final_report: str
    sources: list[Source]
    status: str
    error: Optional[str]
```

---

## 5. Technology Stack

### Backend
* **Python 3.10+**
* **FastAPI** & **Uvicorn** (REST API)
* **LangGraph** (State graph workflow orchestration)
* **LangChain** (`langchain-google-genai` / `langchain-openai`)
* **Pydantic v2** (Structured data validation & state modeling)
* **Tavily API** (Web search tool)
* **Semantic Scholar API** (Academic research tool)
* **Pytest** (Automated unit & integration testing)

### Frontend
* **React 19** & **Vite**
* **Tailwind CSS v4** (Modern dark-themed UI)
* **Lucide React** (Iconography)
* **React Markdown** (Report rendering)

---

## 6. Project Structure

```text
multi-agent-research/
├── app/
│   ├── agents/
│   │   ├── orchestrator.py    # Decomposes query into research tasks
│   │   ├── researcher.py      # Web research agent node
│   │   ├── academic.py        # Academic literature agent node
│   │   ├── fact_checker.py    # Claim validation & confidence agent node
│   │   └── synthesizer.py     # Final report compiler node
│   │
│   ├── tools/
│   │   ├── web_search.py      # Tavily web search integration
│   │   └── academic_search.py # Semantic Scholar search integration
│   │
│   ├── models/
│   │   └── research.py        # Pydantic data models & state
│   │
│   ├── workflow/
│   │   └── graph.py           # LangGraph StateGraph workflow definition
│   │
│   ├── config.py              # LLM provider & environment setup
│   └── main.py                # FastAPI endpoints & CORS
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── QueryInput.jsx
│   │   │   ├── ProgressTracker.jsx
│   │   │   ├── ReportViewer.jsx
│   │   │   ├── VerifiedClaimsCard.jsx
│   │   │   ├── SourcesDrawer.jsx
│   │   │   └── StateInspector.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── index.css
│   └── package.json
│
├── tests/
│   ├── test_health.py
│   ├── test_models.py
│   ├── test_tools.py
│   ├── test_agents.py
│   ├── test_workflow.py
│   └── test_api.py
│
├── .env.example
├── requirements.txt
└── README.md
```

---

## 7. Installation & Setup

### Prerequisites
* Python 3.10+
* Node.js v18+ & npm

### 1. Backend Setup

```bash
# Clone or navigate to directory
cd "multi-agent-research"

# Create Python virtual environment
python -m venv .venv

# Activate virtual environment
# Windows:
.\.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

# Install backend dependencies
pip install -r requirements.txt

# Copy environment configuration template
cp .env.example .env
```

### 2. Configure Environment Variables (`.env`)

Edit `.env` to configure your API keys:

```env
LLM_PROVIDER=gemini  # Supported: gemini, openai
GEMINI_API_KEY=your_gemini_api_key_here
TAVILY_API_KEY=your_tavily_api_key_here
SEMANTIC_SCHOLAR_API_KEY=  # Optional
HOST=0.0.0.0
PORT=8000
```

> **Note on Demo Mode**: If no LLM or Tavily API key is provided, the backend seamlessly operates in **Simulated Fallback Mode**, returning realistic research data to enable full frontend and workflow testing out of the box.

### 3. Frontend Setup

```bash
cd frontend
npm install
```

---

## 8. Running Locally

### Start Backend API Server

```bash
# From workspace root with .venv activated:
uvicorn app.main:app --reload --port 8000
```

The backend server runs at `http://localhost:8000`.

### Start Frontend Development Server

```bash
# In another terminal window:
cd frontend
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## 9. API Endpoints

### Health Check

```http
GET /health
```

**Response**:
```json
{
  "status": "ok",
  "service": "Multi-Agent Research System API",
  "llm_provider": "gemini",
  "has_tavily_key": true
}
```

### Execute Research

```http
POST /api/research
```

**Request**:
```json
{
  "query": "What is the impact of generative AI on software engineering jobs?"
}
```

**Response**:
```json
{
  "query": "What is the impact of generative AI on software engineering jobs?",
  "status": "completed",
  "report": "# Research Report\n\n## Executive Summary\n...",
  "sources": [
    {
      "title": "GitHub Copilot Impact Study",
      "url": "https://github.blog/2024-research-copilot-impact",
      "source_type": "web"
    }
  ],
  "tasks": [],
  "verified_claims": []
}
```

---

## 10. Running Tests

Execute the automated test suite with pytest:

```bash
.\.venv\Scripts\python.exe -m pytest -v
```

Test coverage includes:
* `test_health.py` (API `/health` endpoint)
* `test_models.py` (Pydantic data models & state validation)
* `test_tools.py` (Tavily & Semantic Scholar search tools)
* `test_agents.py` (Orchestrator, Researcher, Academic, Fact Checker, Synthesizer)
* `test_workflow.py` (LangGraph state graph execution)
* `test_api.py` (FastAPI `POST /api/research` route)

---

## 11. Interview Talking Points & Design Decisions

### Why use specialized agents instead of one large LLM prompt?
1. **Separation of Concerns**: Delegation allows web tools, paper search tools, and fact-checking logic to execute independently without cluttering prompt contexts.
2. **Auditability & Verification**: The `Fact Checker Agent` acts as a guardrail, explicitly measuring claim confidence before report synthesis.
3. **Citation Integrity**: The `Synthesizer Agent` is strictly instructed to only cite sources present in `ResearchState.sources`, preventing fake URL hallucinations.
4. **Deterministic Orchestration**: LangGraph provides explicit control flow (`START -> Orchestrator -> Research & Academic -> Fact Checker -> Synthesizer -> END`) rather than unbounded autonomous loops.

---

## 12. Future Improvements

* **Streaming Agent Progress**: Implement Server-Sent Events (SSE) or WebSockets to stream state transitions in real time to the frontend.
* **Document RAG Ingestion**: Add PDF upload and vector search (FAISS / ChromaDB) for custom research papers.
* **Human-in-the-Loop**: Allow users to approve or edit research tasks before agent execution.
* **PDF Export**: Export generated reports directly to formatted PDF documents.
