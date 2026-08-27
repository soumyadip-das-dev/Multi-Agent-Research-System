import logging
from langgraph.graph import StateGraph, START, END
from app.models.research import ResearchState
from app.agents.orchestrator import run_orchestrator
from app.agents.researcher import run_researcher
from app.agents.academic import run_academic
from app.agents.fact_checker import run_fact_checker
from app.agents.synthesizer import run_synthesizer

logger = logging.getLogger("multi_agent_research.workflow")


def build_research_graph():
    """
    Constructs and compiles the LangGraph multi-agent research state graph.
    Workflow: START -> Orchestrator -> Research -> Academic -> Fact Checker -> Synthesizer -> END.
    """
    builder = StateGraph(ResearchState)

    # Register agent nodes
    builder.add_node("orchestrator", run_orchestrator)
    builder.add_node("researcher", run_researcher)
    builder.add_node("academic", run_academic)
    builder.add_node("fact_checker", run_fact_checker)
    builder.add_node("synthesizer", run_synthesizer)

    # Define linear, deterministic execution flow
    builder.add_edge(START, "orchestrator")
    builder.add_edge("orchestrator", "researcher")
    builder.add_edge("researcher", "academic")
    builder.add_edge("academic", "fact_checker")
    builder.add_edge("fact_checker", "synthesizer")
    builder.add_edge("synthesizer", END)

    return builder.compile()


# Global compiled workflow instance
research_workflow = build_research_graph()


def run_research_workflow(query: str) -> ResearchState:
    """
    Executes the full multi-agent research workflow for a user query.
    
    Args:
        query: User research question.
        
    Returns:
        Final ResearchState containing report, verified claims, tasks, and sources.
    """
    logger.info(f"Starting multi-agent research workflow for query: '{query}'")
    initial_state = ResearchState(query=query)
    
    try:
        final_state_dict = research_workflow.invoke(initial_state)
        if isinstance(final_state_dict, ResearchState):
            return final_state_dict
        return ResearchState(**final_state_dict)
    except Exception as e:
        logger.error(f"Error during research workflow execution: {e}", exc_info=True)
        initial_state.status = "error"
        initial_state.error = str(e)
        return initial_state
