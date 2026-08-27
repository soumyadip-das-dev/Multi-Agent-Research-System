import pytest
from app.models.research import (
    ResearchTask,
    Source,
    Finding,
    VerifiedClaim,
    ResearchState,
    ResearchRequest,
    ResearchResponse
)


def test_research_task_model():
    task = ResearchTask(
        title="AI Productivity Impact",
        description="Investigate developer productivity statistics.",
        type="web"
    )
    assert task.title == "AI Productivity Impact"
    assert task.type == "web"


def test_source_model():
    source = Source(
        title="McKinsey Report",
        url="https://mckinsey.com/report",
        source_type="web"
    )
    assert source.title == "McKinsey Report"
    assert source.authors == []
    assert source.year is None


def test_verified_claim_model():
    source = Source(
        title="Copilot Study",
        url="https://github.blog/study",
        source_type="web"
    )
    verified = VerifiedClaim(
        claim="AI tools speed up coding by 50%",
        confidence="high",
        explanation="Supported by multiple empirical studies.",
        sources=[source],
        status="supported"
    )
    assert verified.confidence == "high"
    assert verified.status == "supported"
    assert len(verified.sources) == 1


def test_research_state_defaults():
    state = ResearchState(query="Impact of AI on software engineering")
    assert state.query == "Impact of AI on software engineering"
    assert state.tasks == []
    assert state.research_findings == []
    assert state.academic_findings == []
    assert state.status == "initialized"
