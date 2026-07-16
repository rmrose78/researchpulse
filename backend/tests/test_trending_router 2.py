from fastapi.testclient import TestClient
from app.main import app
from app.database import sessionLocal
from app.models.trending import TrendingSnapshot


def _delete_snapshots(specialty: str):
    db = sessionLocal()
    db.query(TrendingSnapshot).filter(TrendingSnapshot.specialty == specialty).delete()
    db.commit()
    db.close()


def test_get_trending_rejects_unknown_specialty():
    # Arrange
    with TestClient(app) as client:
        # Act
        response = client.get("/api/trending/", params={"specialty": "not_a_real_specialty"})

        # Assert
        assert response.status_code == 422


def test_get_trending_requires_specialty_param():
    # Arrange
    with TestClient(app) as client:
        # Act
        response = client.get("/api/trending/")

        # Assert
        assert response.status_code == 422


def test_get_trending_rejects_unsupported_window_days():
    # Arrange
    with TestClient(app) as client:
        # Act
        response = client.get(
            "/api/trending/", params={"specialty": "cardiology", "window_days": 45}
        )

        # Assert
        assert response.status_code == 422


def test_get_trending_returns_ranked_results_for_a_real_specialty():
    # Arrange — first-ever request for this specialty computes live, so this
    # test hits real PubMed + Semantic Scholar, mirroring test_search.py's style.
    _delete_snapshots("cardiology")
    with TestClient(app) as client:
        # Act
        response = client.get("/api/trending/", params={"specialty": "cardiology"})
        data = response.json()

        # Assert
        assert response.status_code == 200
        assert data["specialty"] == "cardiology"
        assert data["window_days"] == 365
        assert "computed_at" in data
        # A non-empty assertion here matters: it's what catches a citation
        # lookup that's silently broken (e.g. reading the wrong externalIds
        # key) and returning an empty-but-technically-valid result set.
        assert len(data["results"]) > 0
        for article in data["results"]:
            assert article["citation_count"] >= 1
            assert "velocity" in article
    _delete_snapshots("cardiology")


def test_get_trending_availability_reflects_cached_state_without_network_calls():
    # Arrange — insert a cached snapshot directly, no PubMed/Semantic Scholar involved
    _delete_snapshots("cardiology")
    db = sessionLocal()
    db.add(
        TrendingSnapshot(
            specialty="cardiology", mode="trending", window_days=365, payload=[]
        )
    )
    db.commit()
    db.close()

    with TestClient(app) as client:
        # Act
        response = client.get("/api/trending/availability", params={"window_days": 365})
        data = response.json()

        # Assert
        assert response.status_code == 200
        assert data["window_days"] == 365
        assert data["available"]["cardiology"] is False
    _delete_snapshots("cardiology")


def test_get_trending_availability_omits_specialties_never_computed_at_this_window():
    # Arrange
    _delete_snapshots("neurology")

    with TestClient(app) as client:
        # Act
        response = client.get("/api/trending/availability", params={"window_days": 365})
        data = response.json()

        # Assert
        assert response.status_code == 200
        assert "neurology" not in data["available"]
