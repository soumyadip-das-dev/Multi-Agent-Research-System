from app.models import ResearchState, ResearchTask
from app.agents import (
    run_orchestrator,
    run_researcher,
    run_academic,
    run_fact_checker,
    run_synthesizer
)



def test_orchestrator_agent():
    state = ResearchState(query="Impact of AI on software engineering")
    res_state = run_orchestrator(state)
    assert len(res_state.tasks) >= 3
    types = {t.type for t in res_state.tasks}
    assert "web" in types or "academic" in types


def test_researcher_agent():
    state = ResearchState(
        query="AI productivity",
        tasks=[
            ResearchTask(title="Productivity Task", description="AI developer productivity", type="web")
        ]
    )
    res_state = run_researcher(state)
    assert len(res_state.research_findings) > 0
    first = res_state.research_findings[0]
    assert first.source.source_type == "web"


def test_academic_agent():
    state = ResearchState(
        query="Academic AI study",
        tasks=[
            ResearchTask(title="Academic Task", description="Controlled study on AI code quality", type="academic")
        ]
    )
    res_state = run_academic(state)
    assert len(res_state.academic_findings) > 0
    first = res_state.academic_findings[0]
    assert first.source.source_type == "academic"


def test_fact_checker_agent():
    state = ResearchState(query="Fact check test")
    state = run_orchestrator(state)
    state = run_researcher(state)
    state = run_academic(state)
    res_state = run_fact_checker(state)
    assert len(res_state.verified_claims) > 0
    first = res_state.verified_claims[0]
    assert first.confidence in ["high", "medium", "low"]


def test_synthesizer_agent():
    state = ResearchState(query="Synthesis test")
    state = run_orchestrator(state)
    state = run_researcher(state)
    state = run_academic(state)
    state = run_fact_checker(state)
    res_state = run_synthesizer(state)
    assert "# Research Report" in res_state.final_report
    assert "## Executive Summary" in res_state.final_report
    assert len(res_state.sources) > 0
