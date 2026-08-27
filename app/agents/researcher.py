import logging
from app.models.research import ResearchState, Finding, Source
from app.tools.web_search import search_web
from app.config import get_llm

logger = logging.getLogger("multi_agent_research.agents.researcher")


def run_researcher(state: ResearchState) -> ResearchState:
    """
    Research Agent node function for LangGraph workflow.
    Executes all web-assigned research tasks.
    """
    web_tasks = [t for t in state.tasks if t.type == "web"]
    logger.info(f"Research Agent starting web research for {len(web_tasks)} tasks...")

    findings = []
    
    for task in web_tasks:
        search_results = search_web(query=task.description, max_results=3)
        for res in search_results:
            source = Source(
                title=res.get("title", "Web Source"),
                url=res.get("url", "https://example.com"),
                source_type="web"
            )
            finding = Finding(
                claim=f"{task.title}: {res.get('title')}",
                evidence=res.get("content", "No content summary extracted."),
                source=source
            )
            findings.append(finding)

    state.research_findings = findings
    logger.info(f"Research Agent gathered {len(findings)} web findings.")
    return state
