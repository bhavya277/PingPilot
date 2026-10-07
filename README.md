# PingPilot

> **Local-First AI Network Diagnostic Co-Pilot for Gamers & Esports Enthusiasts**

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg?style=flat&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF.svg?style=flat&logo=vite&logoColor=white)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC.svg?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Ollama](https://img.shields.io/badge/Ollama-Local%20LLM-black.svg?style=flat&logo=ollama&logoColor=white)](https://ollama.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 📖 Overview

**PingPilot** is an intelligent, privacy-first desktop network diagnostic suite engineered to pinpoint why your games are lagging, stuttering, or dropping packets. 

Unlike generic internet speed tests that only report downstream/upstream bandwidth, PingPilot tests the **entire route** between your PC, local gateway router, ISP DNS resolver, global internet backbone, and the actual matchmaking/tick servers of popular games. It then pairs the diagnostic metrics with an **embedded Local AI analysis engine (via Ollama)** to translate complex telemetry into plain-English root causes and immediate, step-by-step fix recommendations.

---

## ✨ Key Features

- **🎮 Game-Specific Server Presets**: Real-time diagnostic ping, jitter, and packet loss tests against actual game backbones:
  - **Valorant** (*Riot Direct Global Backbone*)
  - **Counter-Strike 2** (*Valve Steam Datagram Relay - SDR*)
  - **Fortnite** (*Epic Games AWS QoS Endpoints*)
  - **Apex Legends** (*EA Global Multiplay Relay*)
  - **Call of Duty: Mobile** (*Activision Blizzard Edge*)
  - **PUBG** (*Krafton AWS Edge*)
  - *Custom Target IP / Host support*
- **🧠 Local AI Co-Pilot (Ollama)**: Uses local LLMs (e.g., `llama3.2`, `mistral`, `qwen2.5`, `phi3`) running on your machine to analyze telemetry without sending any personal or diagnostic data to cloud services.
- **🛡️ Fallback Heuristic Engine**: Built-in deterministic rule engine ensures 100% offline functionality even when Ollama is not installed or active.
- **📡 Step-by-Step Diagnostic SSE Stream**: Real-time Server-Sent Events (SSE) provide live progress and instant metric updates for:
  - Default Gateway Latency & Health
  - ISP DNS Resolution Latency
  - Edge Public Reference Ping & Jitter (RFC 3550 standard)
  - Game Server RTT, Min/Max/Avg, and Packet Loss
  - Hop-by-hop Traceroute Bottleneck Detection
  - HTTP Download Throughput & Bufferbloat Indicators
- **🗺️ Interactive Route Visualizer**: Visual hop-by-hop node map from `Local PC ➜ Gateway ➜ ISP DNS ➜ Internet ➜ Game Server`.
- **📊 Metric Analytics & Latency Charts**: Real-time jitter distribution, packet loss graphs, and sample-by-sample RTT telemetry.
- **🧪 Interactive Simulation / Demo Mode**: Test drive PingPilot with 4 realistic preset scenarios:
  - *Wi-Fi Jitter & Congestion*
  - *ISP Routing Degradation & Hop Spike*
  - *Severe Packet Loss & Bufferbloat*
  - *Pristine Low-Ping Fiber*
- **🗃️ Local History & Comparison**: Stores sessions in a local SQLite database with side-by-side session comparisons to evaluate network tweaks over time.

---

## 🏗️ Architecture

```mermaid
flowchart LR
    subgraph Client["Frontend (React 19 + Vite)"]
        UI[Tailwind UI & Visualizers]
        SSE[SSE Event Listener]
    end

    subgraph Server["Backend (FastAPI Engine)"]
        API[FastAPI Endpoints]
        Diag[Network Diagnostics Engine]
        Heuristics[Heuristic Evaluator]
        DB[(SQLite DB / aiosqlite)]
    end

    subgraph AI["Local AI Layer"]
        Ollama[Ollama Local Daemon<br/>(Llama 3.2 / Mistral)]
    end

    subgraph Network["Network Targets"]
        GW[Default Gateway / Router]
        DNS[DNS Resolvers]
        Edge[Cloudflare Edge 1.1.1.1]
        GameServer[Game Backbone Servers]
    end

    UI -->|Trigger Diagnosis| API
    API -->|SSE Events| SSE
    API --> Diag
    Diag --> GW
    Diag --> DNS
    Diag --> Edge
    Diag --> GameServer
    Diag --> Heuristics
    Heuristics --> Ollama
    Ollama --> API
    API --> DB
```

---

## 🛠️ Tech Stack

### **Backend**
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python 3.10+)
- **Server**: [Uvicorn](https://www.uvicorn.org/) (Standard ASGI)
- **Validation**: [Pydantic v2](https://docs.pydantic.dev/) & `pydantic-settings`
- **Database**: [aiosqlite](https://github.com/omnilib/aiosqlite) (Async SQLite local storage)
- **Network & Diagnostics**: `psutil`, `dnspython`, `httpx`
- **AI Integration**: Native REST integration with local [Ollama](https://ollama.com) API

### **Frontend**
- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler / Dev Server**: [Vite 8](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Visuals & UX**: [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti), Glassmorphic dark theme

---

## ⚡ Quick Start

### Prerequisites
- **Python**: 3.10 or higher
- **Node.js**: 18.x or higher (with npm)
- *(Optional, for AI analysis)*: [Ollama](https://ollama.com/)

---

### Option A: One-Click Launch (Windows)

Simply double-click:
```bat
run_all.bat
```
This automatically starts the FastAPI backend on `http://127.0.0.1:8000` and launches the Vite React frontend on `http://localhost:5173`.

---

---

### Option B: Manual Setup

#### 1. Clone the Repository
```bash
git clone https://github.com/bhavya277/PingPilot.git
cd PingPilot
```

#### 2. Backend Setup
```bash
# Navigate to backend or root
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/macOS:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run backend
python run.py
```
> The backend will be live at `http://127.0.0.1:8000` (API Docs at `http://127.0.0.1:8000/docs`).

#### 3. Frontend Setup
```bash
# In a new terminal, navigate to frontend
cd frontend

# Install packages
npm install

# Start Vite development server
npm run dev
```
> Open `http://localhost:5173` in your browser.

---

## 🌐 Deploy to Vercel

You can deploy the PingPilot Web Dashboard directly to [Vercel](https://vercel.com):

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fbhavya277%2FPingPilot)

### Method 1: Via Vercel Web Dashboard (Recommended)
1. Go to [vercel.com/new](https://vercel.com/new) and import your repository `bhavya277/PingPilot`.
2. Vercel will automatically detect `vercel.json` and configure:
   - **Framework Preset**: Vite
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Output Directory**: `frontend/dist`
3. *(Optional)* If you have a custom backend hosted on a cloud server or tunnel, set the environment variable:
   - `VITE_API_BASE`: `https://your-backend-domain.com/api`
4. Click **Deploy**.

> **Note on Web/Vercel Preview**: When running in the cloud on Vercel without a local desktop backend connected, PingPilot automatically activates its **Interactive Demo & Simulation Engine**, allowing anyone to test live-feel scenarios (Valorant Wi-Fi jitter, CS2 route loss, Apex fiber) and review AI reports directly in the browser!

### Method 2: Via Vercel CLI
```bash
npm install -g vercel
vercel
```


---

## 🤖 Configuring Local AI (Ollama)

PingPilot uses Ollama for local privacy-friendly analysis.

1. **Download & Install Ollama** from [ollama.com](https://ollama.com).
2. **Pull a model** (recommended: `llama3.2` or `mistral`):
   ```bash
   ollama pull llama3.2
   ```
3. **Start Ollama** (runs on default port `11434`):
   ```bash
   ollama serve
   ```
4. PingPilot will automatically detect your Ollama instance and available models upon startup!

---

## ⚙️ Environment Configuration

Create a `.env` file in the root directory (or copy from `.env.example`):

```env
# Server
HOST=127.0.0.1
PORT=8000

# Ollama Local AI Configuration
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=llama3.2

# SQLite Local Database Storage
SQLITE_DB_PATH=backend/data/pingpilot.db
```

---

## 🔌 API Endpoints Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Healthcheck and version status |
| `GET` | `/api/system` | System info, gateway, and Ollama status |
| `GET` | `/api/games` | List of built-in game server presets |
| `POST` | `/api/diagnostics/stream` | **SSE Stream** for real-time diagnostic execution |
| `POST` | `/api/diagnostics/run` | Execute diagnostic run and return synchronous result |
| `GET` | `/api/diagnostics/{id}` | Retrieve specific diagnostic session report |
| `GET` | `/api/history` | List past diagnostic session history |
| `POST` | `/api/ai/analyze` | Re-run AI analysis on an existing diagnostic payload |

---

## 🧪 Testing

PingPilot includes automated end-to-end integration tests:

```bash
# Run comprehensive e2e test suite
python test_e2e.py

# Run standalone diagnostic test
python test_diagnostics.py
```

---

## 🔒 Privacy Guarantee

- **100% Local Execution**: All network tests run directly on your host machine.
- **Zero Cloud Leakage**: No telemetry, IP addresses, or diagnostic logs are sent to remote analytics servers.
- **Local AI Inference**: Ollama processes data entirely in local memory/VRAM.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to open issues or submit Pull Requests for new game server presets, diagnostic capabilities, or UI improvements.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
