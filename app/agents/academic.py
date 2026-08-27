import logging
from app.models.research import ResearchState, Finding, Source
from app.tools.academic_search import search_academic

logger = logging.getLogger("multi_agent_research.agents.academic")


def run_academic(state: ResearchState) -> ResearchState:
    """
    Academic Agent node function for LangGraph workflow.
    Executes all academic research tasks using Semantic Scholar.
    """
    academic_tasks = [t for t in state.tasks if t.type == "academic"]
    logger.info(f"Academic Agent starting literature search for {len(academic_tasks)} tasks...")

    findings = []

    for task in academic_tasks:
        paper_results = search_academic(query=task.description, max_results=3)
        for p in paper_results:
            source = Source(
                title=p.get("title", "Academic Paper"),
                url=p.get("url", "https://semanticscholar.org"),
                source_type="academic",
                authors=p.get("authors", []),
                year=p.get("year")
            )
            finding = Finding(
                claim=f"{task.title}: {p.get('title')} ({p.get('year', 2024)})",
                evidence=p.get("content", "Abstract unavailable."),
                source=source
            )
            findings.append(finding)

    state.academic_findings = findings
    logger.info(f"Academic Agent gathered {len(findings)} academic findings.")
    return state
