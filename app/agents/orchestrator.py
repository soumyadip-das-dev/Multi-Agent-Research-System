import json
import logging
from app.models.research import ResearchState, ResearchTask
from app.config import get_llm

logger = logging.getLogger("multi_agent_research.agents.orchestrator")

ORCHESTRATOR_SYSTEM_PROMPT = """
You are the Orchestrator Agent in a Multi-Agent Research System.

YOUR RESPONSIBILITY:
- Analyze the user's research question.
- Decompose the research question into 4 to 5 distinct, well-defined research tasks.
- Assign each task a type: either 'web' (for industry trends, broad market stats, operational reports) or 'academic' (for peer-reviewed studies, controlled trials, empirical literature).
- DO NOT perform the actual research. Your sole job is delegation and task decomposition.

OUTPUT FORMAT:
Return ONLY a valid JSON array of objects, with no extra text or markdown formatting.
Each object must have:
- "title": string (short descriptive title)
- "description": string (specific instruction of what to search and investigate)
- "type": "web" or "academic"
"""


def run_orchestrator(state: ResearchState) -> ResearchState:
    """
    Orchestrator Agent node function for LangGraph workflow.
    Decomposes state.query into research subtasks.
    """
    logger.info(f"Orchestrator Agent starting analysis for query: '{state.query}'")
    llm = get_llm()
    tasks = []

    if llm:
        try:
            prompt = f"{ORCHESTRATOR_SYSTEM_PROMPT}\n\nResearch Question:\n\"{state.query}\""
            response = llm.invoke(prompt)
            content = response.content if hasattr(response, "content") else str(response)
            
            # Clean JSON formatting wrappers if present
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[1].split("```")[0].strip()

            raw_tasks = json.loads(content)
            for t in raw_tasks:
                tasks.append(ResearchTask(
                    title=t.get("title", "Research Subtask"),
                    description=t.get("description", state.query),
                    type="academic" if t.get("type") == "academic" else "web"
                ))
            logger.info(f"Orchestrator generated {len(tasks)} tasks via LLM.")
        except Exception as e:
            logger.warning(f"LLM task decomposition failed: {e}. Falling back to default task generator.")

    if not tasks:
        tasks = _generate_default_tasks(state.query)
        logger.info(f"Orchestrator generated {len(tasks)} default tasks.")

    state.tasks = tasks
    state.status = "orchestration_completed"
    return state


def _generate_default_tasks(query: str) -> list[ResearchTask]:
    """Generates standard structured tasks when LLM is unavailable."""
    return [
        ResearchTask(
            title="Current Adoption and Market Trends",
            description=f"Investigate current industry adoption trends and usage data regarding: {query}",
            type="web"
        ),
        ResearchTask(
            title="Impact on Productivity and Operational Efficiency",
            description=f"Analyze quantifiable productivity gains or efficiency metrics related to: {query}",
            type="web"
        ),
        ResearchTask(
            title="Empirical Controlled Studies & Literature",
            description=f"Search academic literature and peer-reviewed trials evaluating: {query}",
            type="academic"
        ),
        ResearchTask(
            title="Skill Requirements and Workforce Transformation",
            description=f"Identify key skill shifts, career changes, and workforce impacts associated with: {query}",
            type="web"
        ),
        ResearchTask(
            title="Code Quality, Security, and Risk Evaluation",
            description=f"Review academic research on quality, security vulnerabilities, and technical risks regarding: {query}",
            type="academic"
        )
    ]
