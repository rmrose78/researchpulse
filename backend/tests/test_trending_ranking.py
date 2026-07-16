from datetime import date
from app.schemas.pubmed import ArticleSearchResult
from app.services.trending import age_days, compute_velocity, rank_articles


def test_age_days_computes_days_since_publication():
    # Arrange
    today = date(2024, 7, 1)

    # Act
    result = age_days("2024/Jan", today)

    # Assert — Jan 1 2024 -> Jul 1 2024 is 182 days
    assert result == 182


def test_age_days_handles_full_month_names():
    # Arrange
    today = date(2024, 7, 1)

    # Act
    result = age_days("2024/January", today)

    # Assert
    assert result == 182


def test_age_days_returns_none_for_missing_pub_date():
    # Arrange & Act
    result = age_days(None, date(2024, 7, 1))

    # Assert
    assert result is None


def test_age_days_returns_none_for_unparseable_pub_date():
    # Arrange & Act
    result = age_days("not a date", date(2024, 7, 1))

    # Assert
    assert result is None


def test_compute_velocity_uses_age_plus_twenty_one_day_smoothing():
    # Arrange & Act
    result = compute_velocity(citation_count=42, age_in_days=21)

    # Assert — 42 / (21 + 21) == 1.0
    assert result == 1.0


def test_compute_velocity_not_raw_citations_over_age():
    # Arrange & Act
    smoothed = compute_velocity(citation_count=10, age_in_days=0)

    # Assert — raw citations/age would divide by zero; smoothing prevents that
    assert smoothed == 10 / 21


def _article(pmid: str, pub_date: str | None) -> ArticleSearchResult:
    return ArticleSearchResult(
        pmid=pmid, title=f"Article {pmid}", abstract=None, authors=[],
        journal=None, pub_date=pub_date, doi=None,
    )


def test_rank_articles_excludes_zero_citation_articles():
    # Arrange
    articles = [_article("1", "2024/Jan"), _article("2", "2024/Jan")]
    citation_counts = {"1": 0, "2": 5}
    today = date(2024, 7, 1)

    # Act
    ranked = rank_articles(articles, citation_counts, today)

    # Assert
    assert [a.pmid for a in ranked] == ["2"]


def test_rank_articles_excludes_articles_missing_from_citation_counts():
    # Arrange
    articles = [_article("1", "2024/Jan")]
    today = date(2024, 7, 1)

    # Act
    ranked = rank_articles(articles, {}, today)

    # Assert
    assert ranked == []


def test_rank_articles_excludes_unparseable_pub_dates():
    # Arrange
    articles = [_article("1", None)]
    citation_counts = {"1": 5}
    today = date(2024, 7, 1)

    # Act
    ranked = rank_articles(articles, citation_counts, today)

    # Assert
    assert ranked == []


def test_rank_articles_sorts_by_velocity_descending():
    # Arrange — same age, different citation counts -> different velocity
    articles = [_article("low", "2024/Jan"), _article("high", "2024/Jan")]
    citation_counts = {"low": 1, "high": 100}
    today = date(2024, 7, 1)

    # Act
    ranked = rank_articles(articles, citation_counts, today)

    # Assert
    assert [a.pmid for a in ranked] == ["high", "low"]


def test_rank_articles_includes_citation_stat_fields():
    # Arrange
    articles = [_article("1", "2024/Jan")]
    citation_counts = {"1": 28}
    today = date(2024, 7, 15)  # 196 days after Jan 1

    # Act
    ranked = rank_articles(articles, citation_counts, today)

    # Assert
    assert ranked[0].citation_count == 28
    assert ranked[0].velocity == 28 / (196 + 21)
