import json
import logging
from app.models.research import ResearchState, VerifiedClaim, Source
from app.config import get_llm

logger = logging.getLogger("multi_agent_research.agents.fact_checker")

FACT_CHECKER_PROMPT = """
You are the Fact Checker Agent in a Multi-Agent Research System.

YOUR RESPONSIBILITY:
- Evaluate the factual claims and evidence collected from web and academic research.
- Assign a confidence rating for each claim: 'high', 'medium', or 'low'.
- Determine verification status: 'supported' (backed by multiple/strong sources), 'unsupported' (lacks direct proof or speculative), or 'conflicting' (evidence shows opposing findings).
- Provide a clear, objective explanation of your rationale.

INPUT FINDINGS:
{findings_text}

OUTPUT FORMAT:
Return ONLY a valid JSON array of objects with no markdown formatting.
Each object must have:
- "claim": string
- "confidence": "high", "medium", or "low"
- "explanation": string (brief justification)
- "status": "supported", "unsupported", or "conflicting"
"""


def run_fact_checker(state: ResearchState) -> ResearchState:
    """
    Fact Checker Agent node function for LangGraph workflow.
    Evaluates claims from research findings and returns verified claims.
    """
    all_findings = state.research_findings + state.academic_findings
    logger.info(f"Fact Checker Agent analyzing {len(all_findings)} collected findings...")

    if not all_findings:
        state.verified_claims = []
        state.status = "fact_checked"
        return state

    verified_claims = []
    llm = get_llm()

    if llm:
        try:
            findings_text = "\n".join([
                f"- Claim: {f.claim}\n  Evidence: {f.evidence}\n  Source: {f.source.title} ({f.source.url})"
                for f in all_findings
            ])
            prompt = FACT_CHECKER_PROMPT.format(findings_text=findings_text)
            response = llm.invoke(prompt)
            content = response.content if hasattr(response, "content") else str(response)

            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[1].split("```")[0].strip()

            raw_claims = json.loads(content)
            for item in raw_claims:
                # Find matching sources from all_findings
                matching_sources = [f.source for f in all_findings if item.get("claim", "").lower() in f.claim.lower() or f.claim.lower() in item.get("claim", "").lower()]
                if not matching_sources:
                    matching_sources = [f.source for f in all_findings[:2]]

                verified_claims.append(VerifiedClaim(
                    claim=item.get("claim", "Extracted Research Claim"),
                    confidence=item.get("confidence", "medium"),
                    explanation=item.get("explanation", "Evaluated based on gathered web and academic evidence."),
                    sources=matching_sources,
                    status=item.get("status", "supported")
                ))
            logger.info(f"Fact Checker generated {len(verified_claims)} verified claims via LLM.")
        except Exception as e:
            logger.warning(f"LLM fact-checking failed: {e}. Using deterministic evaluation fallback.")

    if not verified_claims:
        verified_claims = _evaluate_claims_fallback(all_findings)

    state.verified_claims = verified_claims
    state.status = "fact_checking_completed"
    return state


def _evaluate_claims_fallback(findings: list) -> list[VerifiedClaim]:
    """Evaluates findings deterministically when LLM is unavailable."""
    verified = []
    for f in findings:
        conf = "high" if f.source.source_type == "academic" else "medium"
        status = "supported"
        explanation = f"Supported by {'academic paper' if f.source.source_type == 'academic' else 'industry web source'}: {f.source.title}."
        
        # Check for potential exaggerated claim keywords
        if "eliminate 100%" in f.evidence.lower() or "replace all" in f.evidence.lower():
            conf = "low"
            status = "unsupported"
            explanation = "Claim lacks empirical support and relies on exaggerated predictions."

        verified.append(VerifiedClaim(
            claim=f.claim,
            confidence=conf,
            explanation=explanation,
            sources=[f.source],
            status=status
        ))
    return verified
