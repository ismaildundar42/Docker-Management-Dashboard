# ⚡ ContainerScope — Modern Docker Intelligence & Fleet Management Dashboard

<div align="center">

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![.NET 8.0](https://img.shields.io/badge/.NET-8.0-512BD4?logo=dotnet)
![React 19](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)
![Docker](https://img.shields.io/badge/Docker-Engine%20API-2496ED?logo=docker)
![Vite](https://img.shields.io/badge/Vite-Build-646CFF?logo=vite)

**ContainerScope** is a high-performance, ultra-sleek, real-time Docker intelligence dashboard and container management platform built with ASP.NET Core 8 Web API, React 19, TypeScript, and modern dark-mode glassmorphic aesthetics.

</div>

---

## ✨ Key Features

### 1. 📊 Real-Time Fleet Intelligence & Metrics
- **Live Fleet Health Bar**: Visual breakdown of running vs. stopped containers.
- **Resource Analytics**: Aggregate disk utilization across images, total named volumes, and virtual network scopes.
- **Auto-Sync & Manual Refresh**: Configurable background polling intervals (`5s`, `10s`, `30s`, or manual).

### 2. ⚡ Container Lifecycle Management
- **Instant Controls**: Start, Stop, Restart, and Remove containers directly from tables or detail modals.
- **Optimistic State Updates & Toast Alerts**: Instant visual feedback for container operations.

### 3. 📈 Real-Time CPU & RAM Utilization
- **Live Performance Gauges**: Real-time CPU percentage calculations and RAM memory limits vs. active usage.
- **Network I/O & Process Monitoring**: Monitor RX/TX bandwidth metrics and active PID count.

### 4. 💻 Live Terminal Log Viewer
- **Console Stream**: Real-time container stdout/stderr log inspector.
- **Log Management**: Auto-scroll toggle, keyword filter/search, configurable line tailing (`50`, `150`, `300`, `1000`), 1-click clipboard copy, and `.txt` log download.

### 5. 📦 Docker Compose Stacks Orchestration
- **Stack Grouping**: Automatically identifies multi-container compose projects from container labels (`com.docker.compose.project`).
- **Service Status**: Inspect individual compose services, images, and port mappings per stack.

### 6. 🔍 Deep Resource Inspection
- **Containers**: Environment variables, port bindings, volume mounts, restart policies, exit codes, and network IPAM details.
- **Images**: Repository tags, formatted byte sizes, and ready-to-use `docker run` commands.
- **Volumes**: Volume drivers, host mountpoint paths with quick copy buttons.
- **Networks**: Virtual bridges, host configurations, and overlay scopes.

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
└── docker-compose.yml          # One-click deployment with Docker socket mount
```

---

## 🚀 Getting Started

### Option 1: Run with Docker Compose (Recommended)

Run the entire application in seconds with Docker Compose:

```bash
# Clone the repository
git clone https://github.com/ismaildundar42/Docker-Management-Dashboard.git
cd Docker-Management-Dashboard

# Start the stack
docker compose up -d --build
```

Access the dashboard in your browser:
- **Frontend Dashboard:** [http://localhost:3000](http://localhost:3000)
- **Backend API:** [http://localhost:5000/swagger](http://localhost:5000/swagger)

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
*Frontend dev server will start at `http://localhost:5173` with hot module replacement.*

---

## 📡 API Reference

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
| `/api/docker/volumes` | `GET` | List persistent Docker volumes |
| `/api/docker/networks` | `GET` | List virtual Docker networks |

---

## 🛡️ License
Distributed under the MIT License. See `LICENSE` for more information.
