import logging
from typing import Any

from app.tools import ToolRegistry

logger = logging.getLogger("multi_agent_research.mcp")


class MCPServer:
    """Model Context Protocol (MCP) Server implementation."""

    def __init__(
        self, name: str = "multi-agent-research-mcp-server", version: str = "1.0.0"
    ):
        self.name = name
        self.version = version
        self.protocol_version = "2024-11-05"

    def get_server_metadata(self) -> dict[str, Any]:
        return {
            "name": self.name,
            "version": self.version,
            "protocol_version": self.protocol_version,
            "capabilities": {
                "tools": {"listChanged": False},
                "resources": {"subscribe": False, "listChanged": False},
                "prompts": {"listChanged": False},
            },
        }

    def list_tools(self) -> list[dict[str, Any]]:
        base_tools = ToolRegistry.get_mcp_tool_definitions()
        full_research_tool = {
            "name": "run_full_research",
            "description": "Executes full multi-agent research workflow (Orchestrator -> Researcher -> Academic -> Fact Checker -> Synthesizer).",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "Research question to investigate",
                    }
                },
                "required": ["query"],
            },
        }
        return base_tools + [full_research_tool]

    def list_resources(self) -> list[dict[str, Any]]:
        return [
            {
                "uri": "research://status",
                "name": "System Health & Provider Status",
                "description": "Current status of LLM providers and search API keys",
                "mimeType": "application/json",
            },
            {
                "uri": "research://schema",
                "name": "Research State Pydantic Schema",
                "description": "JSON schema definition of ResearchState",
                "mimeType": "application/json",
            },
        ]

    def list_prompts(self) -> list[dict[str, Any]]:
        return [
            {
                "name": "deep_research_prompt",
                "description": "Template for triggering multi-agent literature and market research",
                "arguments": [
                    {"name": "topic", "description": "Research topic", "required": True}
                ],
            }
        ]

    def call_tool(self, name: str, arguments: dict[str, Any]) -> dict[str, Any]:
        logger.info(f"MCP tool call: '{name}' with args: {arguments}")

        if name == "run_full_research":
            query = arguments.get("query", "")
            if not query:
                return {
                    "isError": True,
                    "content": [
                        {
                            "type": "text",
                            "text": "Error: 'query' parameter is required.",
                        }
                    ],
                }
            from app.workflow import run_research_workflow

            state = run_research_workflow(query)
            return {
                "isError": bool(state.error),
                "content": [
                    {
                        "type": "text",
                        "text": state.final_report or f"Status: {state.status}",
                    }
                ],
                "structured_output": {
                    "query": state.query,
                    "status": state.status,
                    "tasks_count": len(state.tasks),
                    "sources_count": len(state.sources),
                    "claims_count": len(state.verified_claims),
                    "tool_calls_count": len(state.tool_calls),
                },
            }

        result, record = ToolRegistry.execute_tool(
            name, arguments, agent_name="MCP Client"
        )
        if isinstance(result, dict) and "error" in result:
            return {
                "isError": True,
                "content": [
                    {"type": "text", "text": f"Tool Execution Error: {result['error']}"}
                ],
            }

        import json

        text_content = (
            json.dumps(result, indent=2) if not isinstance(result, str) else result
        )
        return {
            "isError": False,
            "content": [{"type": "text", "text": text_content}],
            "record": record.model_dump(),
        }

    def handle_jsonrpc(self, request: dict[str, Any]) -> dict[str, Any]:
        req_id = request.get("id")
        method = request.get("method")
        params = request.get("params", {})

        if method == "initialize":
            return {
                "jsonrpc": "2.0",
                "id": req_id,
                "result": self.get_server_metadata(),
            }
        elif method == "tools/list":
            return {
                "jsonrpc": "2.0",
                "id": req_id,
                "result": {"tools": self.list_tools()},
            }
        elif method == "tools/call":
            return {
                "jsonrpc": "2.0",
                "id": req_id,
                "result": self.call_tool(
                    params.get("name"), params.get("arguments", {})
                ),
            }
        elif method == "resources/list":
            return {
                "jsonrpc": "2.0",
                "id": req_id,
                "result": {"resources": self.list_resources()},
            }
        elif method == "prompts/list":
            return {
                "jsonrpc": "2.0",
                "id": req_id,
                "result": {"prompts": self.list_prompts()},
            }
        elif method == "ping":
            return {"jsonrpc": "2.0", "id": req_id, "result": {}}
        else:
            return {
                "jsonrpc": "2.0",
                "id": req_id,
                "error": {
                    "code": -32601,
                    "message": f"Method '{method}' not supported.",
                },
            }


mcp_server = MCPServer()


def handle_mcp_jsonrpc(payload: dict[str, Any]) -> dict[str, Any]:
    return mcp_server.handle_jsonrpc(payload)


class MCPClient:
    def __init__(self, server_target: Any | None = None):
        self.server = server_target or mcp_server

    def discover_tools(self) -> list[dict[str, Any]]:
        res = self.server.handle_jsonrpc(
            {"jsonrpc": "2.0", "id": 1, "method": "tools/list"}
        )
        return res.get("result", {}).get("tools", [])

    def invoke_tool(self, tool_name: str, arguments: dict[str, Any]) -> dict[str, Any]:
        res = self.server.handle_jsonrpc(
            {
                "jsonrpc": "2.0",
                "id": 2,
                "method": "tools/call",
                "params": {"name": tool_name, "arguments": arguments},
            }
        )
        return res.get("result", {})
