# ⚡ ContainerScope — Modern Docker Intelligence & Fleet Management Dashboard

<div align="center">

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![.NET 8.0](https://img.shields.io/badge/.NET-8.0-512BD4?logo=dotnet)
![React 19](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)
![Docker](https://img.shields.io/badge/Docker-Engine%20API-2496ED?logo=docker)
![Vite](https://img.shields.io/badge/Vite-Build-646CFF?logo=vite)

**ContainerScope** is a high-performance, ultra-sleek, real-time Docker intelligence dashboard and container fleet management platform built with ASP.NET Core 8 Web API, React 19, TypeScript, and modern cyberpunk-graphite dark mode aesthetics.

<br />

<img src="docs/screenshots/dashboard_preview.jpg" alt="ContainerScope Dashboard Preview" width="100%" style="border-radius: 12px; box-shadow: 0 12px 32px rgba(0,0,0,0.6);" />

</div>

---

## 🌟 Highlights

- ⚡ **Zero-Lag Docker Engine Interface:** Direct asynchronous connection to the Docker daemon socket (`npipe` on Windows, `/var/run/docker.sock` on Linux/macOS).
- 📊 **Real-Time Fleet Health & KPI Cards:** Live monitoring of active vs. stopped containers, aggregated repository image sizes, and persistent storage volumes.
- 💻 **Live Terminal Log Streaming:** High-performance dark console viewer with auto-scroll, search filters, tail selectors, clipboard copy, and `.txt` log download.
- 📈 **Dynamic CPU & Memory Gauges:** Instant calculations for CPU utilization percentage, RAM limits vs. current consumption, Network I/O (RX/TX), and active PID counts.
- 🚀 **One-Click Container Lifecycle:** Start, stop, restart, and remove containers with toast notification feedback.
- 📦 **Docker Compose Stacks:** Automatic project stack discovery based on container labels.

---

## 📸 Screenshots & Showcase

### 1. Main Infrastructure Dashboard
> Overview of running containers, storage distribution, fleet runtime ratio, and interactive container data table.

<div align="center">
  <img src="docs/screenshots/dashboard_preview.jpg" alt="Main Dashboard Overview" width="95%" />
</div>

<br />

### 2. Deep Container Inspection & Live Log Streamer
> Multi-tab container inspector with real-time CPU/RAM meters, live log viewer, environment variable registry, port bindings, and volume mounts.

<div align="center">
  <img src="docs/screenshots/container_modal_preview.jpg" alt="Container Inspection Modal" width="95%" />
</div>

---

## ✨ Features Breakdown

### 1. 📊 Real-Time Fleet Intelligence
- **Fleet Health Bar:** Visual percentage ratio of running vs. dormant containers.
- **Resource Inventory:** Total images, persistent named volumes, and virtual network topology.
- **Auto-Sync:** Background polling at customizable intervals (`5s`, `10s`, `30s`, or manual).

### 2. ⚡ Container Operations & Actions
- **Quick Controls:** Start, stop, restart, or remove containers directly from the table or modal.
- **Toast Notifications:** Instant visual feedback on every action.

### 3. 📈 CPU / RAM Performance Metrics
- **Live Performance Gauges:** Accurate CPU percentage and RAM memory consumption graphs.
- **Network & Process Stats:** Real-time RX/TX network traffic and active process count (PIDs).

### 4. 💻 Live Terminal Log Viewer
- **Log Stream:** Real-time container stdout/stderr log inspector.
- **Log Tools:** Keyword search, configurable line tailing (`50`, `150`, `300`, `1000`), copy, and log export.

### 5. 📦 Docker Compose Orchestration
- **Stack Discovery:** Automatically groups containers belonging to the same Compose project (`com.docker.compose.project`).
- **Service Status:** View service status, port mappings, and working directory context.

### 6. 🔍 Deep Resource Inspection
- **Containers:** Environment variables, port bindings, volume mounts, restart policies, exit codes, and network IPAM details.
- **Images:** Repository tags, formatted byte sizes, and ready-to-use `docker run` commands.
- **Volumes:** Volume drivers, host mountpoint paths with quick copy buttons.
- **Networks:** Virtual bridges, host configurations, and overlay scopes.

---

## 🏗️ Architecture

```
ContainerScope/
├── backend/
│   └── ContainerScope.Api/     # ASP.NET Core 8 Web API (.NET 8 + Docker.DotNet)
│       ├── Controllers/        # DockerController REST Endpoints
│       ├── Services/           # DockerService implementation
│       ├── Models/             # Strongly typed DTOs & Stats models
│       └── Dockerfile          # Multi-stage production container
├── frontend/                   # React 19 + TypeScript + Vite
│   ├── src/
│   │   ├── components/         # Sidebar, Topbar, ContainerModal
│   │   ├── context/            # ToastNotification Context
│   │   ├── pages/              # Dashboard, Containers, Compose, Images, Volumes, Networks
│   │   ├── services/           # dockerApi REST client
│   │   └── types/              # Docker TypeScript definitions
│   ├── nginx.conf              # Nginx reverse proxy configuration
│   └── Dockerfile              # Multi-stage production container
├── docs/
│   └── screenshots/            # Visual previews and assets
└── docker-compose.yml          # One-click deployment with Docker socket mount
```

---

## 🚀 Getting Started

### Option 1: Run with Docker Compose (Recommended)

Run the entire platform with a single command:

```bash
# 1. Clone the repository
git clone https://github.com/ismaildundar42/Docker-Management-Dashboard.git
cd Docker-Management-Dashboard

# 2. Start the stack
docker compose up -d --build
```

Access the application:
- **Frontend Dashboard:** [http://localhost:3000](http://localhost:3000)
- **Backend API Swagger:** [http://localhost:5000/swagger](http://localhost:5000/swagger)

---

### Option 2: Local Development

#### Prerequisites
- [.NET 8.0 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 18+](https://nodejs.org/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Running)

#### 1. Start Backend API
```bash
cd backend/ContainerScope.Api
dotnet run
```
*API will listen on `https://localhost:7160` (or `http://localhost:5000`)*

#### 2. Start Frontend Dev Server
```bash
cd frontend
npm install
npm run dev
```
*Frontend dev server will start at `http://localhost:5173`.*

---

## 📡 REST API Reference

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/docker/containers` | `GET` | List all containers |
| `/api/docker/containers/{id}/inspect` | `GET` | Deep container configuration & specs |
| `/api/docker/containers/{id}/start` | `POST` | Start a container |
| `/api/docker/containers/{id}/stop` | `POST` | Stop a container |
| `/api/docker/containers/{id}/restart` | `POST` | Restart a container |
| `/api/docker/containers/{id}` | `DELETE` | Remove a container |
| `/api/docker/containers/{id}/logs` | `GET` | Fetch container stdout/stderr logs |
| `/api/docker/containers/{id}/stats` | `GET` | Real-time CPU%, RAM, Network I/O stats |
| `/api/docker/compose/stacks` | `GET` | List grouped Docker Compose stacks |
| `/api/docker/images` | `GET` | List all local Docker images |
| `/api/docker/images/{id}/inspect` | `GET` | Deep image inspection |
| `/api/docker/volumes` | `GET` | List persistent Docker volumes |
| `/api/docker/volumes/{name}/inspect` | `GET` | Deep volume inspection |
| `/api/docker/networks` | `GET` | List virtual Docker networks |
| `/api/docker/networks/{id}/inspect` | `GET` | Deep network inspection |

---

## 🛡️ License
Distributed under the MIT License. See `LICENSE` for more information.
