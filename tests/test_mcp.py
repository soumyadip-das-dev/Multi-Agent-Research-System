from app.mcp import mcp_server, handle_mcp_jsonrpc, MCPClient


def test_mcp_server_initialize():
    req = {"jsonrpc": "2.0", "id": 1, "method": "initialize"}
    resp = handle_mcp_jsonrpc(req)
    assert resp["jsonrpc"] == "2.0"
    assert resp["id"] == 1
    assert "result" in resp
    assert resp["result"]["name"] == mcp_server.name
    assert "capabilities" in resp["result"]


def test_mcp_server_list_tools():
    req = {"jsonrpc": "2.0", "id": 2, "method": "tools/list"}
    resp = handle_mcp_jsonrpc(req)
    tools = resp.get("result", {}).get("tools", [])
    tool_names = [t["name"] for t in tools]
    assert "web_search" in tool_names
    assert "academic_search" in tool_names
    assert "run_full_research" in tool_names


def test_mcp_server_call_web_search_tool():
    req = {
        "jsonrpc": "2.0",
        "id": 3,
        "method": "tools/call",
        "params": {
            "name": "web_search",
            "arguments": {"query": "AI engineering", "max_results": 2}
        }
    }
    resp = handle_mcp_jsonrpc(req)
    assert resp["id"] == 3
    result = resp.get("result", {})
    assert result.get("isError") is False
    assert len(result.get("content", [])) > 0


def test_mcp_client_discover_and_invoke():
    client = MCPClient()
    tools = client.discover_tools()
    assert len(tools) >= 3

    res = client.invoke_tool("web_search", {"query": "Developer productivity", "max_results": 1})
    assert res.get("isError") is False
    assert "content" in res
