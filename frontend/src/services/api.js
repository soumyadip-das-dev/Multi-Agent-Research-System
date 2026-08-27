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
