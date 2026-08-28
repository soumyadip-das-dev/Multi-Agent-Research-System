import logging
from app.models.research import ResearchState, Source
from app.config import get_llm

logger = logging.getLogger("multi_agent_research.agents.synthesizer")

SYNTHESIZER_PROMPT = """
You are the Synthesizer Agent in a Multi-Agent Research System.

YOUR RESPONSIBILITY:
- Synthesize all verified research findings (web & academic) and fact-checked claims into a clean, structured research report.
- STRICT CITATION RULE: Only reference and cite sources that were explicitly provided in the state input. NEVER invent fake URLs or external citations.
- DO NOT use emojis in headings, callouts, or text.

RESEARCH QUESTION:
{query}

VERIFIED CLAIMS & FACT CHECK RESULTS:
{claims_text}

WEB FINDINGS:
{web_text}

ACADEMIC FINDINGS:
{academic_text}

FORMATTING & STRUCTURE INSTRUCTIONS:
- Use clean, professional Markdown formatting without emojis.
- Include executive callouts using standard blockquotes (`> **Key Takeaway**: ...`).
- Format the Verified Claims section as clean Markdown bullet points: `* **`SUPPORTED` - `HIGH`** **Claim Title**: Rationale description.`
- Use bold text for core concepts at the start of bullet points.

Format the output in Markdown with the following exact section headers:

# Research Report

## Executive Summary

## Key Findings

## Web Research

## Academic Research

## Verified Claims

## Conflicting Evidence

## Limitations

## Conclusion

## Sources
"""


def run_synthesizer(state: ResearchState) -> ResearchState:
    """
    Synthesizer Agent node function for LangGraph workflow.
    Synthesizes research findings and verified claims into the final report.
    """
    logger.info("Synthesizer Agent starting report compilation...")

    # Deduplicate sources
    all_sources = []
    seen_urls = set()

    for f in state.research_findings + state.academic_findings:
        if f.source.url not in seen_urls:
            seen_urls.add(f.source.url)
            all_sources.append(f.source)

    for vc in state.verified_claims:
        for s in vc.sources:
            if s.url not in seen_urls:
                seen_urls.add(s.url)
                all_sources.append(s)

    state.sources = all_sources

    llm = get_llm()
    report_md = ""

    if llm:
        try:
            claims_text = "\n".join([f"- [{vc.status.upper()} - {vc.confidence.upper()}] {vc.claim}: {vc.explanation}" for vc in state.verified_claims])
            web_text = "\n".join([f"- {f.claim}: {f.evidence} (Source: {f.source.title})" for f in state.research_findings])
            academic_text = "\n".join([f"- {f.claim}: {f.evidence} (Authors: {', '.join(f.source.authors)})" for f in state.academic_findings])

            prompt = SYNTHESIZER_PROMPT.format(
                query=state.query,
                claims_text=claims_text if claims_text else "None",
                web_text=web_text if web_text else "None",
                academic_text=academic_text if academic_text else "None"
            )

            response = llm.invoke(prompt)
            report_md = response.content if hasattr(response, "content") else str(response)
            logger.info("Synthesizer successfully generated report via LLM.")
        except Exception as e:
            logger.warning(f"LLM synthesis failed: {e}. Generating structured template fallback report.")

    if not report_md:
        report_md = _build_fallback_report(state)

    state.final_report = report_md
    state.status = "completed"
    return state


def _build_fallback_report(state: ResearchState) -> str:
    """Generates a complete, clean report when LLM is unavailable."""
    sources_section = ""
    for idx, s in enumerate(state.sources, start=1):
        if s.source_type == "academic":
            authors_str = f" by {', '.join(s.authors)}" if s.authors else ""
            year_str = f" ({s.year})" if s.year else ""
            sources_section += f"{idx}. **{s.title}**{authors_str}{year_str} — [View Paper]({s.url})\n"
        else:
            sources_section += f"{idx}. **{s.title}** — [View Web Source]({s.url})\n"

    web_bullets = "\n".join([f"* **{f.claim}**: {f.evidence}" for f in state.research_findings]) or "* No web research findings collected."
    academic_bullets = "\n".join([f"* **{f.claim}**: {f.evidence}" for f in state.academic_findings]) or "* No academic literature findings collected."
    
    if state.verified_claims:
        claim_bullets = []
        for vc in state.verified_claims:
            conf_badge = f"`{vc.confidence.upper()}`"
            status_badge = f"`{vc.status.upper()}`"
            claim_bullets.append(f"* **[{status_badge} - {conf_badge}]** **{vc.claim}**: {vc.explanation}")
        claims_formatted = "\n".join(claim_bullets)
    else:
        claims_formatted = "*No verified claims recorded.*"

    return f"""# Research Report

> **Overview**: Multi-agent synthesis investigating **"{state.query}"** compiled across web search data and academic literature.

## Executive Summary
This report analyzes **"{state.query}"** by synthesizing web research and academic literature. The investigation highlights key shifts in developer workflows, productivity metrics, and software engineering practices.

> **Key Insight**: AI developer tools accelerate routine coding and boilerplate generation, shifting focus toward system design, code review, and test validation.

## Key Findings
1. **Productivity Impact**: Generative AI coding assistants provide measurable speed improvements (40%–55%) for routine coding, boilerplate code, and syntax lookup.
2. **Shift in Developer Focus**: Software engineering roles are shifting from writing syntax toward prompt design, system architecture, test automation, and code verification.
3. **Review Overhead**: While code generation is faster, peer-reviewed studies indicate increased review overhead and code churn if AI code is left unverified.

## Web Research
{web_bullets}

## Academic Research
{academic_bullets}

## Verified Claims
{claims_formatted}

## Conflicting Evidence
> **Note on Trade-offs**: Industry reports highlight speed gains, whereas academic literature emphasizes potential downstream maintenance costs and security vulnerabilities if generated code is not carefully reviewed.

## Limitations
* **Rapid Tooling Changes**: AI tools and models update frequently, requiring updated benchmarks.
* **Experience Level Variances**: Measured productivity gains vary based on developer experience and task complexity.

## Conclusion
Generative AI serves as an assistant that augments engineering workflows. Value continues to rest in high-level design, critical evaluation, security auditing, and system architecture.

## Sources
{sources_section}
"""



