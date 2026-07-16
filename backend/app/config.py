from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    pubmed_base_url: str = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils"
    pubmed_api_key: str = ""
    semantic_scholar_base_url: str = "https://api.semanticscholar.org"
    semantic_scholar_api_key: str = ""
    app_name: str = "ResearchPulse"
    database_url: str = "postgresql://localhost/researchpulse"

    model_config = SettingsConfigDict(env_file=".env")

settings = Settings()

