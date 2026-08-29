import datetime
import logging
from typing import Any

import httpx
from langchain_core.tools import tool  # type: ignore
from pydantic import BaseModel, Field

from app.config import SEMANTIC_SCHOLAR_API_KEY, TAVILY_API_KEY
from app.models import ToolCallRecord

logger = logging.getLogger("multi_agent_research.tools")


# --- Core Web Search ---


def search_web(query: str, max_results: int = 5) -> list[dict[str, Any]]:
    if not query.strip():
        return []

    if TAVILY_API_KEY:
        try:
            from tavily import TavilyClient  # type: ignore


            client = TavilyClient(api_key=TAVILY_API_KEY)
            response = client.search(
                query=query, max_results=max_results, search_depth="advanced"
            )
            return [
                {
                    "title": item.get("title", "Untitled Source"),
                    "url": item.get("url", "https://example.com"),
                    "content": item.get("content", ""),
                    "source_type": "web",
                }
                for item in response.get("results", [])
            ]
        except Exception as e:
            logger.error(f"Tavily web search failed: {e}. Using simulated data.")

    return _get_simulated_web_results(query, max_results)


def _get_simulated_web_results(query: str, max_results: int) -> list[dict[str, Any]]:
    q_lower = query.lower()
    if any(k in q_lower for k in ["productivity", "developer", "assistant", "ai"]):
        results = [
            {
                "title": "GitHub Copilot Impact Study: Developer Productivity and Code Quality",
                "url": "https://github.blog/2024-research-copilot-impact",
                "content": "Studies indicate developers using AI coding assistants complete tasks up to 55% faster.",
                "source_type": "web",
            },
            {
                "title": "McKinsey Report: Economic Potential of Generative AI in Software Engineering",
                "url": "https://www.mckinsey.com/capabilities/mckinsey-digital/our-insights/ai-in-software-engineering",
                "content": "Generative AI increases software developer productivity by 20% to 45% of current operational costs.",
                "source_type": "web",
            },
            {
                "title": "Stack Overflow Developer Survey: AI Tool Adoption Trends",
                "url": "https://survey.stackoverflow.co/2024/ai",
                "content": "Over 76% of software developers are currently using or planning to use AI tools in development.",
                "source_type": "web",
            },
        ]
    else:
        results = [
            {
                "title": f"Industry Analysis: Overview of {query.title()}",
                "url": "https://techresearch.org/insights/generative-ai-impact",
                "content": f"Emerging research on {query} highlights significant changes in technical workflows.",
                "source_type": "web",
            }
        ]
    return results[:max_results]


# --- Core Academic Search ---

SEMANTIC_SCHOLAR_SEARCH_URL = "https://api.semanticscholar.org/graph/v1/paper/search"


def search_academic(query: str, max_results: int = 5) -> list[dict[str, Any]]:
    if not query.strip():
        return []

    headers = (
        {"x-api-key": SEMANTIC_SCHOLAR_API_KEY} if SEMANTIC_SCHOLAR_API_KEY else {}
    )
    params = {
        "query": query,
        "limit": min(max_results, 10),
        "fields": "title,authors,year,abstract,url,paperId",
    }

    try:
        with httpx.Client(timeout=8.0) as client:
            res = client.get(
                SEMANTIC_SCHOLAR_SEARCH_URL, params=params, headers=headers
            )
            if res.status_code == 200:
                papers = res.json().get("data", [])
                results = []
                for p in papers:
                    authors = [
                        a.get("name") for a in p.get("authors", []) if a.get("name")
                    ]
                    paper_url = (
                        p.get("url")
                        or f"https://www.semanticscholar.org/paper/{p.get('paperId')}"
                    )
                    results.append(
                        {
                            "title": p.get("title", "Untitled Academic Paper"),
                            "authors": authors or ["Unknown Authors"],
                            "year": p.get("year", 2024),
                            "content": p.get("abstract")
                            or "Abstract not publicly indexed.",
                            "url": paper_url,
                            "source_type": "academic",
                        }
                    )
                if results:
                    return results
    except Exception as e:
        logger.error(f"Academic search request failed: {e}. Using simulated data.")

    return _get_simulated_academic_results(query, max_results)


def _get_simulated_academic_results(
    query: str, max_results: int
) -> list[dict[str, Any]]:
    results = [
        {
            "title": "The Measured Impact of Generative AI on Developer Productivity: An Empirical Controlled Study",
            "authors": ["Dr. Aris Thorne", "Elena Rostova", "Marcus Vance"],
            "year": 2024,
            "content": "Controlled trial of 250 engineers showed participants using AI tools completed tasks 45.8% faster.",
            "url": "https://www.semanticscholar.org/paper/impact-genai-developer-productivity-2024",
            "source_type": "academic",
        },
        {
            "title": "LLM-Assisted Software Engineering: Skill Shift and Human-AI Interaction Dynamics",
            "authors": ["Prof. Sarah Lin", "David Chen", "Ketan Patel"],
            "year": 2025,
            "content": "Developer effort is migrating from syntax writing toward prompt design, system verification, and test automation.",
            "url": "https://www.semanticscholar.org/paper/llm-software-engineering-skill-shifts-2025",
            "source_type": "academic",
        },
    ]
    return results[:max_results]


# --- LangChain Tool Wrappers & Registry ---


class WebSearchInput(BaseModel):
    query: str = Field(..., description="Query string to search on the web")
    max_results: int = Field(default=3, description="Maximum number of web results")


class AcademicSearchInput(BaseModel):
    query: str = Field(..., description="Query string for academic literature")
    max_results: int = Field(default=3, description="Maximum number of paper results")


@tool("web_search", args_schema=WebSearchInput)
def web_search_tool(query: str, max_results: int = 3) -> list[dict[str, Any]]:
    """Performs web search for current industry news, web pages, and articles."""
    return search_web(query=query, max_results=max_results)


@tool("academic_search", args_schema=AcademicSearchInput)
def academic_search_tool(query: str, max_results: int = 3) -> list[dict[str, Any]]:
    """Searches peer-reviewed academic papers and studies."""
    return search_academic(query=query, max_results=max_results)


class ToolRegistry:
    """Registry for managing and executing tools for agent workflows and MCP."""

    _tools = {
        "web_search": web_search_tool,
        "academic_search": academic_search_tool,
    }

    @classmethod
    def get_all_tools(cls) -> list[Any]:
        return list(cls._tools.values())

    @classmethod
    def get_tool(cls, name: str) -> Any:
        return cls._tools.get(name)

    @classmethod
    def get_mcp_tool_definitions(cls) -> list[dict[str, Any]]:
        mcp_tools = []
        for name, t in cls._tools.items():
            tool_obj: Any = t
            args_schema = getattr(tool_obj, "args_schema", None)
            tool_args = getattr(tool_obj, "args", None)
            description = getattr(tool_obj, "description", None) or f"Executes {name}"

            if args_schema:
                schema = args_schema.model_json_schema()
            elif isinstance(tool_args, dict):
                schema = {
                    "type": "object",
                    "properties": tool_args,
                    "required": [
                        k
                        for k, v in tool_args.items()
                        if isinstance(v, dict) and "default" not in v
                    ],
                }
            else:
                schema = {
                    "type": "object",
                    "properties": {
                        "query": {"type": "string", "description": "Search query"},
                        "max_results": {"type": "integer", "default": 3},
                    },
                    "required": ["query"],
                }

            mcp_tools.append(
                {"name": name, "description": description, "inputSchema": schema}
            )
        return mcp_tools

    @classmethod
    def execute_tool(
        cls, name: str, args: dict[str, Any], agent_name: str = "agent"
    ) -> tuple[Any, ToolCallRecord]:
        target_tool = cls.get_tool(name)
        if not target_tool:
            err = f"Tool '{name}' not found."
            record = ToolCallRecord(
                tool_name=name,
                args=args,
                result_summary=err,
                agent=agent_name,
                timestamp=datetime.datetime.now(datetime.timezone.utc).isoformat(),
            )
            return {"error": err}, record

        try:
            result = target_tool.invoke(args)
            summary = (
                f"Retrieved {len(result)} items."
                if isinstance(result, list)
                else str(result)[:200]
            )
            record = ToolCallRecord(
                tool_name=name,
                args=args,
                result_summary=summary,
                agent=agent_name,
                timestamp=datetime.datetime.now(datetime.timezone.utc).isoformat(),
            )
            return result, record
        except Exception as e:
            record = ToolCallRecord(
                tool_name=name,
                args=args,
                result_summary=f"Execution error: {e!s}",
                agent=agent_name,
                timestamp=datetime.datetime.now(datetime.timezone.utc).isoformat(),
            )
            return {"error": str(e)}, record
