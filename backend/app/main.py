from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Thermo Shelter 1 API",
    description="Backend for passive shelter thermal simulation and optimization.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "project": "Thermo Shelter 1",
        "status": "running",
        "message": "Thermo Shelter backend is online",
    }


@app.get("/api/health")
def health():
    return {
        "status": "healthy",
        "service": "thermal-backend",
    }