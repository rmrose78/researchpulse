from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import search, reading_list
from app.database import engine, Base
import app.models.reading_list

app = FastAPI(
    title="ResearchPulse API",
    description="Biomedical research discovery platform",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Trust requests from our React app
    allow_credentials=True,
    allow_methods=["*"],                      # Allow GET, POST, PUT, DELETE etc
    allow_headers=["*"],                      # Allow any headers
)

# Auto-create tables on startup
Base.metadata.create_all(bind=engine)

app.include_router(search.router)
app.include_router(reading_list.router)

@app.get("/health") 
async def health_check():
    return {"status": "ok", "service": "ResearchPulse API"}