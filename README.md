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
```

---

## 2. Quick Start

### Windows

You can use either the Command Prompt batch script or PowerShell:

**Option A (Double-Click or CMD):**
```cmd
start.bat
```

**Option B (PowerShell):**
```powershell
.\start.ps1
```

### Linux / macOS

```bash
chmod +x start.sh
./start.sh
```

The script automatically sets up the Python virtual environment (`.venv`), installs dependencies, ensures frontend packages are installed, and launches both services:

- **Landing Page**: [http://localhost:3000](http://localhost:3000)
- **3D Interactive Simulator**: [http://localhost:3000/3d](http://localhost:3000/3d)
- **FastAPI Backend**: [http://localhost:8000](http://localhost:8000)
- **Interactive Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)