import logging
from typing import Any

from fastapi import FastAPI, HTTPException, Request  # type: ignore
from fastapi.middleware.cors import CORSMiddleware  # type: ignore

from app.config import HOST, LLM_PROVIDER, PORT, TAVILY_API_KEY
from app.mcp import MCPClient, handle_mcp_jsonrpc, mcp_server
from app.models import ResearchRequest, ResearchResponse
from app.workflow import run_research_workflow

logger = logging.getLogger("multi_agent_research.main")

app = FastAPI(
    title="Multi-Agent Research System API",
    description="Backend API for orchestrating multi-agent research workflows with MCP and Native Tool Calling.",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    tools = mcp_server.list_tools()
    return {
        "status": "ok",
        "service": "Multi-Agent Research System API",
        "llm_provider": LLM_PROVIDER,
        "has_tavily_key": bool(TAVILY_API_KEY),
        "mcp_server": {
            "name": mcp_server.name,
            "version": mcp_server.version,
            "protocol_version": mcp_server.protocol_version,
            "tools_count": len(tools),
        },
    }


@app.post("/api/research", response_model=ResearchResponse)
def create_research(request: ResearchRequest):
    query = request.query.strip()
    if not query or len(query) < 3:
        raise HTTPException(
            status_code=400,
            detail="Research query cannot be empty and must be at least 3 characters long.",
        )

    logger.info(f"Received research request: '{query}'")
    final_state = run_research_workflow(query)

    mcp_info = {
        "server_name": mcp_server.name,
        "tools_available": [t["name"] for t in mcp_server.list_tools()],
        "tool_calls_executed": len(final_state.tool_calls),
    }

    if final_state.error:
        logger.error(f"Research failed: {final_state.error}")
        return ResearchResponse(
            query=query,
            status="failed",
            report=f"Research failed: {final_state.error}",
            sources=[],
            tasks=[],
            verified_claims=[],
            tool_calls=final_state.tool_calls,
            mcp_info=mcp_info,
            error=final_state.error,
        )

    return ResearchResponse(
        query=final_state.query,
        status=final_state.status,
        report=final_state.final_report,
        sources=final_state.sources,
        tasks=final_state.tasks,
        verified_claims=final_state.verified_claims,
        tool_calls=final_state.tool_calls,
        mcp_info=mcp_info,
    )


@app.get("/api/mcp/tools")
def get_mcp_tools():
    client = MCPClient()
    tools = client.discover_tools()
    return {"mcp_server": mcp_server.name, "tools": tools}


@app.post("/api/mcp/call")
def call_mcp_tool(payload: dict[str, Any]):
    tool_name = payload.get("tool_name")
    arguments = payload.get("arguments", {})
    if not tool_name:
        raise HTTPException(
            status_code=400, detail="Missing required field 'tool_name'"
        )

    client = MCPClient()
    result = client.invoke_tool(tool_name, arguments)
    return {"tool_name": tool_name, "arguments": arguments, "result": result}


@app.post("/mcp")
async def mcp_jsonrpc_endpoint(request: Request):
    try:
        body = await request.json()
        return handle_mcp_jsonrpc(body)
    except Exception as e:
        logger.error(f"MCP JSON-RPC request error: {e}", exc_info=True)
        return {
            "jsonrpc": "2.0",
            "id": None,
            "error": {"code": -32700, "message": f"Invalid JSON payload: {e!s}"},
        }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host=HOST, port=PORT, reload=True)
