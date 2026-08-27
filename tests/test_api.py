from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_api_empty_query():
    response = client.post("/api/research", json={"query": "  "})
    assert response.status_code in (400, 422)



def test_api_research_endpoint():
    response = client.post("/api/research", json={"query": "Generative AI coding tools"})
    assert response.status_code == 200
    data = response.json()
    assert data["query"] == "Generative AI coding tools"
    assert data["status"] == "completed"
    assert "report" in data
    assert "# Research Report" in data["report"]
    assert isinstance(data["sources"], list)
    assert len(data["sources"]) > 0
    assert isinstance(data["tasks"], list)
    assert isinstance(data["verified_claims"], list)
