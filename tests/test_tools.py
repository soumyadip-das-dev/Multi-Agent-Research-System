from app.tools.web_search import search_web
from app.tools.academic_search import search_academic


def test_web_search_empty_query():
    results = search_web("")
    assert results == []


def test_web_search_simulated_fallback():
    results = search_web("generative AI developer productivity", max_results=2)
    assert len(results) <= 2
    assert len(results) > 0
    first = results[0]
    assert "title" in first
    assert "url" in first
    assert "content" in first
    assert first["source_type"] == "web"


def test_academic_search_empty_query():
    results = search_academic("   ")
    assert results == []


def test_academic_search_simulated_fallback():
    results = search_academic("developer productivity study", max_results=2)
    assert len(results) <= 2
    assert len(results) > 0
    first = results[0]
    assert "title" in first
    assert "authors" in first
    assert "year" in first
    assert first["source_type"] == "academic"
