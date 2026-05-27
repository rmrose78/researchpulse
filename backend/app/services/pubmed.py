import httpx
import xml.etree.ElementTree as ET
from app.config import settings
from app.schemas.pubmed import ArticleDetail, ArticleSearchResult, SearchResponse

class PubMedService:
    def __init__(self):
        self.base_url = settings.pubmed_base_url
        self.api_key = settings.pubmed_api_key
        self.base_params = {
            "retmode": "xml",
        }
        if self.api_key:
            self.base_params["api_key"] = self.api_key

    async def search(
        self,
        query: str,
        max_results: int = 20,
        date_from: str | None = None,
        date_to: str | None = None, 
        journal: str | None = None,
    ) -> SearchResponse:
        # Build the query string
        full_query = query
        if journal:
            full_query += f' AND "{journal}"[journal]'
        if date_from and date_to:
            full_query += f' AND {date_from}:{date_to}[Date - Publication]'

        # Step 1: esearch - get matching PMIDs
        async with httpx.AsyncClient() as client:
            search_resp = await client.get(
                f"{self.base_url}/esearch.fcgi",
                params={
                    **self.base_params,
                    "db": "pubmed",
                    "term": full_query,
                    "retmax": max_results,
                    "usehistory": "y",
                }
            )
            search_resp.raise_for_status()

        root = ET.fromstring(search_resp.text)
        pmids = [id_elem.text for id_elem in root.findall(".//Id")]
        total = int(root.findtext("Count") or 0)

        if not pmids:
            return SearchResponse(total=total, results=[] , query=query)
    
        # Step 2: efetch - get full records for those PMIDs
        articles = await self._fetch_articles(pmids)
        return SearchResponse(total=total, results=articles, query=query)
    
    async def _fetch_articles(self, pmids: list[str]) -> list[ArticleSearchResult]:
        async with httpx.AsyncClient() as client:
            fetch_resp = await client.get(
                f"{self.base_url}/efetch.fcgi",
                params = {
                    **self.base_params,
                    "db": "pubmed",
                    "id": ",".join(pmids),
                    "rettype": "abstract",
                }
            )
            fetch_resp.raise_for_status()
        return self._parse_articles(fetch_resp.text)
    
    def _parse_articles(self, xml_text: str) -> list[ArticleSearchResult]:
        root = ET.fromstring(xml_text)
        articles = []

        for article in root.findall(".//PubmedArticle"):
            pmid = article.findtext(".//PMID") or ""
            title = article.findtext(".//ArticleTitle") or "No title"
            abstract = article.findtext(".//AbstractText")

            authors = []
            for author in article.findall(".//Author"):
                last = author.findtext("LastName") or ""
                fore = author.findtext("ForeName") or ""
                if last:
                    authors.append(f"{last}, {fore}".strip(", "))
                
            journal = article.findtext(".//Journal/Title")
            pub_date_year = article.findtext(".//PubDate/Year")
            pub_date_month = article.findtext(".//PubDate/Month")
            pub_date = f"{pub_date_year}/{pub_date_month}".strip("/")

            doi = None
            for id_elem in article.findall(".//ArticleId"):
                if id_elem.get("IdType") == "doi":
                    doi = id_elem.text
            
            articles.append(ArticleSearchResult(
                pmid=pmid,
                title=title,
                abstract=abstract,
                authors=authors,
                journal=journal,
                pub_date=pub_date,
                doi=doi,
            ))

        return articles
    
    async def get_article(self, pmid: str):
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                f"{self.base_url}/efetch.fcgi",
                params = {
                    **self.base_params,
                    "db": "pubmed",
                    "id": pmid,
                    "rettype": "abstract",
                }
            )
            resp.raise_for_status()

        root = ET.fromstring(resp.text)
        article = root.find(".//PubmedArticle")

        if article is None:
            return None
        
        pmid_val = article.findtext(".//PMID") or ""
        title = article.findtext(".//ArticleTitle") or ""
        abstract = article.findtext(".//AbstractText")

        authors = []
        for author in article.findall(".//Author"):
            last = author.findtext("LastName") or ""
            fore = author.findtext("ForeName") or ""
            if last:
                authors.append(f"{last}, {fore}".strip(", "))

        journal = article.findtext(".//Journal/Title")
        pub_date_year = article.findtext(".//PubDate/Year") or ""
        pub_date_month = article.findtext(".//PubDate/Month") or ""
        pub_date = f"{pub_date_year}/{pub_date_month}".strip("/")

        doi = None
        for id_elem in article.findall(".//ArticleId"):
            if id_elem.get("IdType") == "doi":
                doi = id_elem.text

        mesh_terms = [
            desc.findtext("DescriptorName") or ""
            for desc in article.findall(".//MeshHeading")
        ]

        keywords = [
            kw.text or ""
            for kw in article.findall(".//Keyword")
        ]

        return ArticleDetail(
            pmid=pmid_val,
            title=title,
            abstract=abstract,
            authors=authors,
            journal=journal,
            pub_date=pub_date,
            doi=doi,
            mesh_terms=[m for m in mesh_terms if m],
            keywords=[k for k in keywords if k],
        )

    # Singleton instance - import this everywhere
pubmed_service = PubMedService()
