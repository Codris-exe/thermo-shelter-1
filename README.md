# Thermo Shelter 1

## Passive Shelter Thermal Simulator

Thermo Shelter 1 is a physics-based design exploration platform for evaluating passive shelter configurations under location-specific weather conditions.

The system combines:

- Interactive 3D shelter visualization
- Real location and weather data
- Solar radiation modeling
- Transient thermal simulation
- Wall and roof R/U-value analysis
- Thermal mass modeling
- Shelter design optimization
- Baseline vs optimized comparison
- PDF analysis report generation

---

## 1. System Architecture

```text
                    ┌──────────────────────┐
                    │    Next.js Frontend  │
                    │                      │
                    │  3D Visualization    │
                    │  Design Controls     │
                    │  Charts              │
                    │  Optimization UI     │
                    │  PDF Report          │
                    └──────────┬───────────┘
                               │
                               │ REST API
                               ▼
                    ┌──────────────────────┐
                    │    FastAPI Backend   │
                    │                      │
                    │ Location             │
                    │ Weather              │
                    │ Solar                │
                    │ Thermal Simulation   │
                    │ Optimization         │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Physics Models       │
                    │                      │
                    │ Envelope R/U         │
                    │ Heat Balance         │
                    │ Thermal Mass         │
                    │ Solar Radiation      │
                    └──────────────────────┘