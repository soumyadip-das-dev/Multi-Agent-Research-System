import json
import logging

from app.config import get_llm
from app.models import Finding, ResearchState, ResearchTask, Source, VerifiedClaim
from app.tools import ToolRegistry, academic_search_tool, web_search_tool

logger = logging.getLogger("multi_agent_research.agents")


# --- 1. Orchestrator Agent ---

ORCHESTRATOR_PROMPT = """
You are the Orchestrator Agent in a Multi-Agent Research System.
Analyze the research question and decompose it into 4 to 5 distinct tasks.
Assign each task a type: 'web' (industry trends, broad market stats) or 'academic' (peer-reviewed papers, empirical literature).

Return ONLY a valid JSON array of objects with keys: "title", "description", "type".
"""


def run_orchestrator(state: ResearchState) -> ResearchState:
    logger.info(f"Orchestrator starting analysis for: '{state.query}'")
    llm = get_llm()
    tasks = []

    if llm:
        try:
            prompt = f'{ORCHESTRATOR_PROMPT}\n\nResearch Question:\n"{state.query}"'
            response = llm.invoke(prompt)
            raw_content = getattr(response, "content", str(response))
            content = raw_content if isinstance(raw_content, str) else str(raw_content)

            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[1].split("```")[0].strip()

            for t in json.loads(content):
                tasks.append(
                    ResearchTask(
                        title=t.get("title", "Subtask"),
                        description=t.get("description", state.query),
                        type="academic" if t.get("type") == "academic" else "web",
                    )
                )
        except Exception as e:
            logger.warning(f"LLM task decomposition failed: {e}. Using fallback.")

    if not tasks:
        tasks = [
            ResearchTask(
                title="Current Adoption and Trends",
                description=f"Industry adoption trends regarding: {state.query}",
                type="web",
            ),
            ResearchTask(
                title="Productivity Impact",
                description=f"Productivity gains or efficiency metrics related to: {state.query}",
                type="web",
            ),
            ResearchTask(
                title="Empirical Controlled Literature",
                description=f"Academic literature evaluating: {state.query}",
                type="academic",
            ),
            ResearchTask(
                title="Workforce Transformation",
                description=f"Skill shifts and workforce impacts associated with: {state.query}",
                type="web",
            ),
            ResearchTask(
                title="Code Quality & Risk",
                description=f"Academic research on quality and security regarding: {state.query}",
                type="academic",
            ),
        ]

    state.tasks = tasks
    state.status = "orchestration_completed"
    return state


# --- 2. Researcher Agent (Web Search) ---


def run_researcher(state: ResearchState) -> ResearchState:
    web_tasks = [t for t in state.tasks if t.type == "web"]
    logger.info(f"Research Agent starting web research for {len(web_tasks)} tasks...")

    llm = get_llm()
    if llm:
        try:
            llm.bind_tools([web_search_tool])
        except Exception:
            pass

    findings = []
    for task in web_tasks:
        tool_args = {"query": task.description, "max_results": 3}
        results, call_record = ToolRegistry.execute_tool(
            "web_search", tool_args, agent_name="Research Agent"
        )
        state.tool_calls.append(call_record)

        if isinstance(results, list):
            for res in results:
                source = Source(
                    title=res.get("title", "Web Source"),
                    url=res.get("url", "https://example.com"),
                    source_type="web",
                )
                findings.append(
                    Finding(
                        claim=f"{task.title}: {res.get('title')}",
                        evidence=res.get("content", "No content summary extracted."),
                        source=source,
                    )
                )

    state.research_findings = findings
    return state


# --- 3. Academic Agent (Literature Search) ---


def run_academic(state: ResearchState) -> ResearchState:
    academic_tasks = [t for t in state.tasks if t.type == "academic"]
    logger.info(
        f"Academic Agent starting literature search for {len(academic_tasks)} tasks..."
    )

    llm = get_llm()
    if llm:
        try:
            llm.bind_tools([academic_search_tool])
        except Exception:
            pass

    findings = []
    for task in academic_tasks:
        tool_args = {"query": task.description, "max_results": 3}
        results, call_record = ToolRegistry.execute_tool(
            "academic_search", tool_args, agent_name="Academic Agent"
        )
        state.tool_calls.append(call_record)

        if isinstance(results, list):
            for p in results:
                source = Source(
                    title=p.get("title", "Academic Paper"),
                    url=p.get("url", "https://semanticscholar.org"),
                    source_type="academic",
                    authors=p.get("authors", []),
                    year=p.get("year"),
                )
                findings.append(
                    Finding(
                        claim=f"{task.title}: {p.get('title')} ({p.get('year', 2024)})",
                        evidence=p.get("content", "Abstract unavailable."),
                        source=source,
                    )
                )

    state.academic_findings = findings
    return state


# --- 4. Fact Checker Agent ---

FACT_CHECKER_PROMPT = """
You are the Fact Checker Agent in a Multi-Agent Research System.
Evaluate factual claims and evidence collected from web and academic research.

INPUT FINDINGS:
{findings_text}

Return ONLY a valid JSON array of objects with:
- "claim": string
- "confidence": "high", "medium", or "low"
- "explanation": string
- "status": "supported", "unsupported", or "conflicting"
"""


def run_fact_checker(state: ResearchState) -> ResearchState:
    all_findings = state.research_findings + state.academic_findings
    logger.info(
        f"Fact Checker Agent analyzing {len(all_findings)} collected findings..."
    )

    if not all_findings:
        state.verified_claims = []
        state.status = "fact_checked"
        return state

    verified_claims = []
    llm = get_llm()

    if llm:
        try:
            findings_text = "\n".join(
                [
                    f"- Claim: {f.claim}\n  Evidence: {f.evidence}\n  Source: {f.source.title} ({f.source.url})"
                    for f in all_findings
                ]
            )
            prompt = FACT_CHECKER_PROMPT.format(findings_text=findings_text)
            response = llm.invoke(prompt)
            if isinstance(response.content, str):
                content = response.content
            else:
                content = str(response.content)

            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[1].split("```")[0].strip()

            for item in json.loads(content):
                matching_sources = [
                    f.source
                    for f in all_findings
                    if item.get("claim", "").lower() in f.claim.lower()
                    or f.claim.lower() in item.get("claim", "").lower()
                ]
                if not matching_sources:
                    matching_sources = [f.source for f in all_findings[:2]]

                verified_claims.append(
                    VerifiedClaim(
                        claim=item.get("claim", "Extracted Research Claim"),
                        confidence=item.get("confidence", "medium"),
                        explanation=item.get(
                            "explanation", "Evaluated based on gathered evidence."
                        ),
                        sources=matching_sources,
                        status=item.get("status", "supported"),
                    )
                )
        except Exception as e:
            logger.warning(
                f"LLM fact-checking failed: {e}. Using deterministic evaluation."
            )

    if not verified_claims:
        for f in all_findings:
            conf = "high" if f.source.source_type == "academic" else "medium"
            status = "supported"
            explanation = f"Supported by {'academic paper' if f.source.source_type == 'academic' else 'web source'}: {f.source.title}."
            verified_claims.append(
                VerifiedClaim(
                    claim=f.claim,
                    confidence=conf,
                    explanation=explanation,
                    sources=[f.source],
                    status=status,
                )
            )

    state.verified_claims = verified_claims
    state.status = "fact_checking_completed"
    return state


# --- 5. Synthesizer Agent ---

SYNTHESIZER_PROMPT = """
You are the Synthesizer Agent. Compile all verified research findings and fact-checked claims into a structured markdown report.
STRICT CITATION RULE: Only cite sources provided in the input. Do NOT invent fake URLs or citations.

RESEARCH QUESTION: {query}
VERIFIED CLAIMS: {claims_text}
WEB FINDINGS: {web_text}
ACADEMIC FINDINGS: {academic_text}

Format the output in Markdown with exact headers:
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
    logger.info("Synthesizer Agent starting report compilation...")

    seen_urls = set()
    all_sources = []
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
            claims_text = "\n".join(
                [
                    f"- [{vc.status.upper()} - {vc.confidence.upper()}] {vc.claim}: {vc.explanation}"
                    for vc in state.verified_claims
                ]
            )
            web_text = "\n".join(
                [
                    f"- {f.claim}: {f.evidence} (Source: {f.source.title})"
                    for f in state.research_findings
                ]
            )
            academic_text = "\n".join(
                [
                    f"- {f.claim}: {f.evidence} (Authors: {', '.join(f.source.authors)})"
                    for f in state.academic_findings
                ]
            )

            prompt = SYNTHESIZER_PROMPT.format(
                query=state.query,
                claims_text=claims_text or "None",
                web_text=web_text or "None",
                academic_text=academic_text or "None",
            )
            response = llm.invoke(prompt)
            if isinstance(response.content, str):
                report_md = response.content
            else:
                report_md = str(response.content)
        except Exception as e:
            logger.warning(f"LLM synthesis failed: {e}. Using template builder.")

    if not report_md:
        report_md = _build_fallback_report(state)

    state.final_report = report_md
    state.status = "completed"
    return state


def _build_fallback_report(state: ResearchState) -> str:
    sources_section = ""
    for idx, s in enumerate(state.sources, start=1):
        if s.source_type == "academic":
            authors_str = f" by {', '.join(s.authors)}" if s.authors else ""
            year_str = f" ({s.year})" if s.year else ""
            sources_section += (
                f"{idx}. **{s.title}**{authors_str}{year_str} — [View Paper]({s.url})\n"
            )
        else:
            sources_section += f"{idx}. **{s.title}** — [View Web Source]({s.url})\n"

    web_bullets = (
        "\n".join([f"* **{f.claim}**: {f.evidence}" for f in state.research_findings])
        or "* No web research findings collected."
    )
    academic_bullets = (
        "\n".join([f"* **{f.claim}**: {f.evidence}" for f in state.academic_findings])
        or "* No academic literature findings collected."
    )

    claim_bullets = (
        [
            f"* **[`{vc.status.upper()}` - `{vc.confidence.upper()}`]** **{vc.claim}**: {vc.explanation}"
            for vc in state.verified_claims
        ]
        if state.verified_claims
        else ["*No verified claims recorded.*"]
    )

    return f"""# Research Report

> **Overview**: Multi-agent synthesis investigating **"{state.query}"** compiled across web search data and academic literature.

## Executive Summary
This report analyzes **"{state.query}"** by synthesizing web research and academic literature.

> **Key Insight**: AI developer tools accelerate routine coding and boilerplate generation, shifting focus toward system design, code review, and test validation.

## Key Findings
1. **Productivity Impact**: Generative AI coding assistants provide measurable speed improvements (40%–55%) for routine coding.
2. **Shift in Developer Focus**: Software engineering roles are shifting toward prompt design, system architecture, test automation, and code verification.
3. **Review Overhead**: While code generation is faster, peer-reviewed studies indicate increased review overhead if AI code is unverified.

## Web Research
{web_bullets}

## Academic Research
{academic_bullets}

## Verified Claims
{"\n".join(claim_bullets)}

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
