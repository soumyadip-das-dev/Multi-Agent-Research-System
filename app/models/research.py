from typing import Literal, Optional
from pydantic import BaseModel, Field


class ResearchTask(BaseModel):
    """Represents a decomposed subtask for either web or academic research."""
    title: str = Field(..., description="Short title of the research task")
    description: str = Field(..., description="Detailed description of what to research")
    type: Literal["web", "academic"] = Field(..., description="Type of research required")


class Source(BaseModel):
    """Metadata for a web or academic source."""
    title: str = Field(..., description="Title of the webpage or academic paper")
    url: str = Field(..., description="URL of the source")
    source_type: Literal["web", "academic"] = Field(..., description="Source categorization")
    authors: list[str] = Field(default_factory=list, description="List of paper/article authors if available")
    year: Optional[int] = Field(default=None, description="Publication year if available")


class Finding(BaseModel):
    """A claim and supporting evidence extracted from a specific source."""
    claim: str = Field(..., description="Specific claim or finding extracted")
    evidence: str = Field(..., description="Direct supporting context or excerpt")
    source: Source = Field(..., description="Source attribution for this finding")


class VerifiedClaim(BaseModel):
    """Evaluation result for an extracted claim by the Fact Checker Agent."""
    claim: str = Field(..., description="The factual claim being evaluated")
    confidence: Literal["high", "medium", "low"] = Field(..., description="Confidence level based on evidence")
    explanation: str = Field(..., description="Rationale for confidence score and evidence alignment")
    sources: list[Source] = Field(default_factory=list, description="Attributed sources supporting or refuting the claim")
    status: Literal["supported", "unsupported", "conflicting"] = Field(
        default="supported",
        description="Verification state of the claim"
    )


class ResearchState(BaseModel):
    """Shared state object passed through the LangGraph agent workflow."""
    query: str = Field(..., description="Original user research question")
    tasks: list[ResearchTask] = Field(default_factory=list, description="Generated subtasks")
    research_findings: list[Finding] = Field(default_factory=list, description="General web research findings")
    academic_findings: list[Finding] = Field(default_factory=list, description="Academic literature findings")
    claims: list[str] = Field(default_factory=list, description="Extracted claims to verify")
    verified_claims: list[VerifiedClaim] = Field(default_factory=list, description="Fact-checked claims")
    final_report: str = Field(default="", description="Synthesized final research report in Markdown")
    sources: list[Source] = Field(default_factory=list, description="Deduplicated list of all referenced sources")
    status: str = Field(default="initialized", description="Current workflow state")
    error: Optional[str] = Field(default=None, description="Error message if workflow fails")


class ResearchRequest(BaseModel):
    """Payload for POST /api/research."""
    query: str = Field(..., min_length=3, description="The research question to investigate")


class ResearchResponse(BaseModel):
    """Response payload for POST /api/research."""
    query: str
    status: str
    report: str
    sources: list[Source]
    tasks: list[ResearchTask]
    verified_claims: list[VerifiedClaim]
    error: Optional[str] = None
