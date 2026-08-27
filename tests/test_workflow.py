from app.workflow.graph import run_research_workflow


def test_full_research_workflow():
    query = "What is the impact of generative AI on software engineering jobs?"
    state = run_research_workflow(query)
    
    assert state.query == query
    assert state.status == "completed"
    assert len(state.tasks) >= 3
    assert len(state.research_findings) > 0
    assert len(state.academic_findings) > 0
    assert len(state.verified_claims) > 0
    assert len(state.sources) > 0
    assert "# Research Report" in state.final_report
    assert "## Key Findings" in state.final_report
