from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import get_pool, close_pool
from routes import router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await get_pool()
    yield
    # Shutdown
    await close_pool()


app = FastAPI(
    title="LGIA API",
    description="Local Geo-Info Application API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(router)


@app.get("/")
async def root():
    return {"message": "LGIA FastAPI Backend", "status": "running"}


@app.get("/health")
async def health():
    return {"status": "healthy"}
