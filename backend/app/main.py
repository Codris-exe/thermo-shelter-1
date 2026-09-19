import os
import sys
from pathlib import Path

# Ensure the backend directory is in sys.path when invoked directly
BACKEND_ROOT = Path(__file__).resolve().parent.parent
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.historical_weather import router as historical_weather_router
from app.api.location import router as location_router
from app.api.optimization import router as optimization_router
from app.api.simulation import router as simulation_router
from app.api.solar import router as solar_router
from app.api.weather import router as weather_router


app = FastAPI(
    title="Thermo Shelter 1 API",
    description=(
        "Backend for passive shelter thermal simulation, "
        "real weather analysis, historical climate modeling, "
        "solar modeling and optimization."
    ),
    version="0.5.0",
)

allowed_origins_env = os.getenv("ALLOWED_ORIGINS")
if allowed_origins_env:
    origins = [origin.strip() for origin in allowed_origins_env.split(",") if origin.strip()]
else:
    origins = ["http://localhost:3000", "http://127.0.0.1:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(simulation_router)
app.include_router(location_router)
app.include_router(weather_router)
app.include_router(historical_weather_router)
app.include_router(solar_router)
app.include_router(optimization_router)


@app.get("/")
def root():
    return {
        "name": "Thermo Shelter 1 API",
        "status": "running",
        "version": "0.5.0",
    }


@app.get("/api/health")
def health():
    return {
        "status": "healthy",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
