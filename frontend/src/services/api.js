const API_BASE_URL = 'http://localhost:8000';

/**
 * Checks backend API health status.
 */
export async function checkBackendHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/health`);
    if (res.ok) {
      return await res.json();
    }
    return { status: 'error' };
  } catch (err) {
    return { status: 'offline' };
  }
}

/**
 * Sends a research question to the multi-agent backend.
 * @param {string} query 
 */
export async function executeResearch(query) {
  const res = await fetch(`${API_BASE_URL}/api/research`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to execute multi-agent research workflow.');
  }

  return await res.json();
}

/**
 * Retrieves registered Model Context Protocol (MCP) tools.
 */
export async function fetchMCPTools() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/mcp/tools`);
    if (res.ok) {
      return await res.json();
    }
    return { mcp_server: 'Unknown', tools: [] };
  } catch (err) {
    console.error('Failed to fetch MCP tools:', err);
    return { mcp_server: 'Offline', tools: [] };
  }
}

/**
 * Directly invokes an MCP tool via API.
 * @param {string} toolName 
 * @param {object} args 
 */
export async function callMCPTool(toolName, args = {}) {
  const res = await fetch(`${API_BASE_URL}/api/mcp/call`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      tool_name: toolName,
      arguments: args,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to execute MCP tool '${toolName}'.`);
  }

  return await res.json();
}

