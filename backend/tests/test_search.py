from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_search_returns_results():
    # Arrange
    query = "cardiac"

    # Act
    response = client.get(f"/api/search/?q={query}")
    data = response.json()

    # Assert
    assert response.status_code == 200
    assert data["query"] == "cardiac"
    assert data["total"] > 0
    assert len(data["results"]) > 0

def test_search_requires_min_length():
    # Arrange
    query = "a"

    # Act
    response = client.get(f"/api/search/?q={query}")

    # Assert
    assert response.status_code == 422

def test_search_result_has_required_fields():
    # Arrange
    query = "cardiac"
    number_of_results = 1

    # Act
    response = client.get(f"/api/search/?q={query}&max_results={number_of_results}")
    result = response.json()["results"][0]

    # Assert
    assert response.status_code == 200
    assert "pmid" in result
    assert "title" in result
    assert "authors" in result

def test_get_article_invalid_pmid():
    # Arrange
    pmid = "00000000"

    # Act
    response = client.get(f"/api/search/{pmid}")

    # Assert
    assert response.status_code == 404

def test_search_accepts_journal_and_date_filters():
    # Arrange
    params = {
        "q": "cardiac",
        "journal": "The Lancet",
        "date_from": "2020/01/01",
        "date_to": "2024/12/31",
    }

    # Act
    response = client.get("/api/search/", params=params)

    # Assert
    assert response.status_code == 200
    assert response.json()["query"] == "cardiac"

