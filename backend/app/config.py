from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    pubmed_base_url: str = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils"
    pubmed_api_key: str = ""
    app_name: str = "ResearchPulse"

    class Config:
        env_file = ".env"

settings = Settings()
