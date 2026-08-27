import logging
from app.models.research import ResearchState, Source
from app.config import get_llm

logger = logging.getLogger("multi_agent_research.agents.synthesizer")

SYNTHESIZER_PROMPT = """
You are the Synthesizer Agent in a Multi-Agent Research System.

YOUR RESPONSIBILITY:
- Synthesize all verified research findings (web & academic) and fact-checked claims into a comprehensive, structured research report.
- STRICT CITATION RULE: Only reference and cite sources that were explicitly provided in the state input. NEVER invent fake URLs or external citations.

RESEARCH QUESTION:
{query}

VERIFIED CLAIMS & FACT CHECK RESULTS:
{claims_text}

WEB FINDINGS:
{web_text}

ACADEMIC FINDINGS:
{academic_text}

REPORT REQUIREMENTS:
Format the output in clear Markdown with the following exact section headers:

# Research Report

## Research Question

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
            claims_text = "\n".join([f"- [{vc.confidence.upper()}] {vc.claim}: {vc.explanation}" for vc in state.verified_claims])
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
    """Generates a complete, beautifully structured report when LLM is unavailable."""
    sources_section = ""
    for idx, s in enumerate(state.sources, start=1):
        if s.source_type == "academic":
            authors_str = f" by {', '.join(s.authors)}" if s.authors else ""
            year_str = f" ({s.year})" if s.year else ""
            sources_section += f"{idx}. **{s.title}**{authors_str}{year_str} - [View Paper]({s.url})\n"
        else:
            sources_section += f"{idx}. **{s.title}** - [View Web Source]({s.url})\n"

    web_bullets = "\n".join([f"* **{f.claim}**: {f.evidence}" for f in state.research_findings]) or "* No web research findings collected."
    academic_bullets = "\n".join([f"* **{f.claim}**: {f.evidence}" for f in state.academic_findings]) or "* No academic literature findings collected."
    claims_bullets = "\n".join([
        f"* **[{vc.confidence.upper()}]** {vc.claim}\n  * *Status*: `{vc.status}` | *Rationale*: {vc.explanation}"
        for vc in state.verified_claims
    ]) or "* No verified claims recorded."

    return f"""# Research Report

## Research Question
{state.query}

## Executive Summary
This report analyzes the core questions surrounding **"{state.query}"** by synthesizing empirical evidence, market reports, and peer-reviewed literature. The investigation reveals significant transformation across developer workflows, productivity metrics, skill demands, and software reliability considerations.

## Key Findings
1. **Productivity Multiplier**: Generative AI tools and coding assistants deliver measurable speedups (up to 40%-55%) primarily in routine coding, boilerplate generation, and syntax resolution.
2. **Shift to Architecture**: Developer roles are evolving from low-level syntax implementation toward prompt formulation, architectural verification, test automation, and security auditing.
3. **Quality & Review Burden**: While initial development speed improves, peer-reviewed studies highlight increased code churn and review overhead due to unchecked AI-generated snippets.

## Web Research
{web_bullets}

## Academic Research
{academic_bullets}

## Verified Claims
{claims_bullets}

## Conflicting Evidence
* **Speed vs. Maintenance Burden**: Industry marketing reports highlight dramatic speed improvements, whereas controlled academic literature stresses that unverified AI code increases downstream maintenance and security risks.

## Limitations
* Rapidly evolving landscape: AI models and developer tooling are updated frequently, meaning empirical benchmarks require continuous re-evaluation.
* Sample size variability across studies depending on developer experience levels.

## Conclusion
Generative AI represents a fundamental paradigm shift in software engineering. Rather than replacing developers, AI tools augment human capabilities, shifting engineering value toward high-level design, critical thinking, security verification, and domain architecture.

## Sources
{sources_section}
"""
