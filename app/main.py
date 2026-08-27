import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.config import HOST, PORT, LLM_PROVIDER, TAVILY_API_KEY
from app.models.research import ResearchRequest, ResearchResponse
from app.workflow.graph import run_research_workflow

logger = logging.getLogger("multi_agent_research.main")

app = FastAPI(
    title="Multi-Agent Research System API",
    description="Backend API for orchestrating multi-agent web and academic research workflows.",
    version="1.0.0"
)

# Enable CORS for local frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    """
    Health check endpoint returning system status and provider configuration state.
    """
    return {
        "status": "ok",
        "service": "Multi-Agent Research System API",
        "llm_provider": LLM_PROVIDER,
        "has_tavily_key": bool(TAVILY_API_KEY),
    }


@app.post("/api/research", response_model=ResearchResponse)
def create_research(request: ResearchRequest):
    """
    Triggers the multi-agent research workflow for a user query.
    Executes Orchestrator -> Research -> Academic -> Fact Checker -> Synthesizer.
    """
    query = request.query.strip()
    if not query or len(query) < 3:
        raise HTTPException(
            status_code=400,
            detail="Research query cannot be empty and must be at least 3 characters long."
        )

    logger.info(f"Received research request: '{query}'")
    final_state = run_research_workflow(query)

    if final_state.error:
        logger.error(f"Research failed: {final_state.error}")
        return ResearchResponse(
            query=query,
            status="failed",
            report=f"Research failed: {final_state.error}",
            sources=[],
            tasks=[],
            verified_claims=[],
            error=final_state.error
        )

    return ResearchResponse(
        query=final_state.query,
        status=final_state.status,
        report=final_state.final_report,
        sources=final_state.sources,
        tasks=final_state.tasks,
        verified_claims=final_state.verified_claims
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=HOST, port=PORT, reload=True)
