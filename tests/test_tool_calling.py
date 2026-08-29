from app.tools import ToolRegistry, web_search_tool, academic_search_tool
from app.models import ResearchState, ResearchTask
from app.agents import run_researcher, run_academic



def test_tool_registry_get_tools():
    tools = ToolRegistry.get_all_tools()
    assert len(tools) >= 2
    tool_names = [t.name for t in tools]
    assert "web_search" in tool_names
    assert "academic_search" in tool_names


def test_tool_registry_execute_web_search():
    results, record = ToolRegistry.execute_tool("web_search", {"query": "AI productivity", "max_results": 2}, agent_name="TestAgent")
    assert isinstance(results, list)
    assert len(results) > 0
    assert record.tool_name == "web_search"
    assert record.agent == "TestAgent"
    assert "query" in record.args


def test_tool_registry_execute_academic_search():
    results, record = ToolRegistry.execute_tool("academic_search", {"query": "Machine learning", "max_results": 2}, agent_name="TestAgent")
    assert isinstance(results, list)
    assert len(results) > 0
    assert record.tool_name == "academic_search"


def test_researcher_agent_records_tool_calls():
    state = ResearchState(
        query="Generative AI",
        tasks=[ResearchTask(title="Web Task", description="AI productivity", type="web")]
    )
    res_state = run_researcher(state)
    assert len(res_state.tool_calls) == 1
    assert res_state.tool_calls[0].tool_name == "web_search"
    assert res_state.tool_calls[0].agent == "Research Agent"


def test_academic_agent_records_tool_calls():
    state = ResearchState(
        query="Generative AI",
        tasks=[ResearchTask(title="Academic Task", description="Controlled study", type="academic")]
    )

    res_state = run_academic(state)
    assert len(res_state.tool_calls) == 1
    assert res_state.tool_calls[0].tool_name == "academic_search"
    assert res_state.tool_calls[0].agent == "Academic Agent"
