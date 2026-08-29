from typing import Any, Literal

from pydantic import BaseModel, Field


class ResearchTask(BaseModel):
    title: str = Field(..., description="Short title of the task")
    description: str = Field(
        ..., description="Detailed description of what to research"
    )
    type: Literal["web", "academic"] = Field(
        ..., description="Type of research required"
    )


class Source(BaseModel):
    title: str = Field(..., description="Title of the source")
    url: str = Field(..., description="URL of the source")
    source_type: Literal["web", "academic"] = Field(..., description="Source type")
    authors: list[str] = Field(default_factory=list, description="Authors if available")
    year: int | None = Field(default=None, description="Publication year")


class Finding(BaseModel):
    claim: str = Field(..., description="Extracted claim")
    evidence: str = Field(..., description="Supporting context or excerpt")
    source: Source = Field(..., description="Attributed source")


class VerifiedClaim(BaseModel):
    claim: str = Field(..., description="Claim evaluated")
    confidence: Literal["high", "medium", "low"] = Field(
        ..., description="Confidence rating"
    )
    explanation: str = Field(..., description="Evaluation rationale")
    sources: list[Source] = Field(
        default_factory=list, description="Supporting sources"
    )
    status: Literal["supported", "unsupported", "conflicting"] = Field(
        default="supported", description="Verification state"
    )


class ToolCallRecord(BaseModel):
    tool_name: str
    args: dict[str, Any] = Field(default_factory=dict)
    result_summary: str
    agent: str
    timestamp: str


class ResearchState(BaseModel):
    query: str
    tasks: list[ResearchTask] = Field(default_factory=list)
    research_findings: list[Finding] = Field(default_factory=list)
    academic_findings: list[Finding] = Field(default_factory=list)
    claims: list[str] = Field(default_factory=list)
    verified_claims: list[VerifiedClaim] = Field(default_factory=list)
    final_report: str = ""
    sources: list[Source] = Field(default_factory=list)
    tool_calls: list[ToolCallRecord] = Field(default_factory=list)
    status: str = "initialized"
    error: str | None = None


class ResearchRequest(BaseModel):
    query: str = Field(..., min_length=3, description="Research topic or question")


class ResearchResponse(BaseModel):
    query: str
    status: str
    report: str
    sources: list[Source]
    tasks: list[ResearchTask]
    verified_claims: list[VerifiedClaim]
    tool_calls: list[ToolCallRecord] = Field(default_factory=list)
    mcp_info: dict[str, Any] | None = None
    error: str | None = None
