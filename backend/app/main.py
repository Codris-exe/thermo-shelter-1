from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.location import router as location_router
from app.api.optimization import router as optimization_router
from app.api.simulation import router as simulation_router
from app.api.solar import router as solar_router
from app.api.weather import router as weather_router


app = FastAPI(
    title="Thermo Shelter 1 API",
    description=(
        "Backend for passive shelter thermal simulation, "
        "real weather analysis, solar modeling and optimization."
    ),
    version="0.4.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(simulation_router)
app.include_router(location_router)
app.include_router(weather_router)
app.include_router(solar_router)
app.include_router(optimization_router)


@app.get("/")
def root():
    return {
        "name": "Thermo Shelter 1 API",
        "status": "running",
        "version": "0.4.0",
    }


@app.get("/api/health")
def health():
    return {
        "status": "healthy",
    }