import logging

from langgraph.graph import END, START, StateGraph  # type: ignore

from app.agents import (
    run_academic,
    run_fact_checker,
    run_orchestrator,
    run_researcher,
    run_synthesizer,
)
from app.models import ResearchState

logger = logging.getLogger("multi_agent_research.workflow")


def build_research_graph():
    """Constructs and compiles the LangGraph multi-agent research state graph."""
    builder = StateGraph(ResearchState)

    builder.add_node("orchestrator", run_orchestrator)
    builder.add_node("researcher", run_researcher)
    builder.add_node("academic", run_academic)
    builder.add_node("fact_checker", run_fact_checker)
    builder.add_node("synthesizer", run_synthesizer)

    builder.add_edge(START, "orchestrator")
    builder.add_edge("orchestrator", "researcher")
    builder.add_edge("researcher", "academic")
    builder.add_edge("academic", "fact_checker")
    builder.add_edge("fact_checker", "synthesizer")
    builder.add_edge("synthesizer", END)

    return builder.compile()


research_workflow = build_research_graph()


def run_research_workflow(query: str) -> ResearchState:
    """Executes the full multi-agent research workflow for a user query."""
    logger.info(f"Starting research workflow for: '{query}'")
    initial_state = ResearchState(query=query)

    try:
        final_state = research_workflow.invoke(initial_state)
        if isinstance(final_state, ResearchState):
            return final_state
        return ResearchState(**final_state)
    except Exception as e:
        logger.error(f"Workflow execution failed: {e}", exc_info=True)
        initial_state.status = "error"
        initial_state.error = str(e)
        return initial_state
