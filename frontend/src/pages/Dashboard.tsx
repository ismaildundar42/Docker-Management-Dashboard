import {
    Box,
    Play,
    Layers,
    HardDrive,
    Network,
    ArrowUpRight,
    ChevronRight,
    Activity,
    Server,
} from "lucide-react";
import type {
    DockerContainer,
    DockerImage,
    DockerVolume,
    DockerNetwork,
} from "../types/docker";
import type { Page } from "../components/layout/Sidebar";
import { formatBytes, truncate } from "../utils/formatters";

interface Props {
    containers: DockerContainer[];
    images: DockerImage[];
    volumes: DockerVolume[];
    networks: DockerNetwork[];
    onNavigate: (page: Page) => void;
    onSelectContainer: (container: DockerContainer) => void;
    searchQuery: string;
}

export default function Dashboard({
    containers,
    images,
    volumes,
    networks,
    onNavigate,
    onSelectContainer,
    searchQuery,
}: Props) {
    const runningContainers = containers.filter((c) => c.state === "running");
    const stoppedContainers = containers.filter((c) => c.state !== "running");
    const totalImageSize = images.reduce((acc, img) => acc + (img.size || 0), 0);

    const runningPct = containers.length > 0 ? Math.round((runningContainers.length / containers.length) * 100) : 0;
    const stoppedPct = containers.length > 0 ? 100 - runningPct : 0;

    const filteredContainers = containers.filter((c) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            c.name?.toLowerCase().includes(q) ||
            c.image?.toLowerCase().includes(q) ||
            c.id?.toLowerCase().includes(q) ||
            c.status?.toLowerCase().includes(q)
        );
    });

    return (
        <div className="dashboard-view">
            {/* Top Page Header */}
            <div className="page-header-row">
                <div className="page-header-text">
                    <div className="page-badge">
                        <span className="badge-pulse" />
                        DOCKER HOST ENVIRONMENT
                    </div>
                    <h1 className="page-title">Infrastructure Overview</h1>
                    <p className="page-subtitle">
                        Real-time status and resource metrics of your Docker daemon
                    </p>
                </div>

                <div className="page-actions">
                    <button className="btn-primary" onClick={() => onNavigate("containers")}>
                        <Box size={16} /> Manage Containers
                    </button>
                    <button className="btn-secondary" onClick={() => onNavigate("images")}>
                        <Layers size={16} /> View Images
                    </button>
                </div>
            </div>

            {/* Metric KPI Cards */}
            <div className="metrics-grid">
                <div className="metric-card card-blue" onClick={() => onNavigate("containers")}>
                    <div className="metric-card-inner">
                        <div className="metric-header">
                            <span className="metric-label">TOTAL CONTAINERS</span>
                            <div className="metric-icon-wrap blue">
                                <Box size={20} />
                            </div>
                        </div>
                        <div className="metric-body">
                            <span className="metric-number">{containers.length}</span>
                            <span className="metric-trend positive">
                                {runningContainers.length} Active
                            </span>
                        </div>
                        <div className="metric-footer">
                            <span>{stoppedContainers.length} stopped containers</span>
                            <ArrowUpRight size={14} className="metric-arrow" />
                        </div>
                    </div>
                </div>

                <div className="metric-card card-green" onClick={() => onNavigate("containers")}>
                    <div className="metric-card-inner">
                        <div className="metric-header">
                            <span className="metric-label">RUNNING FLEET</span>
                            <div className="metric-icon-wrap green">
                                <Play size={20} />
                            </div>
                        </div>
                        <div className="metric-body">
                            <span className="metric-number">{runningContainers.length}</span>
                            <span className="metric-trend-pill">
                                {runningPct}% Online
                            </span>
                        </div>
                        <div className="metric-footer">
                            <span>Ready to serve traffic</span>
                            <ArrowUpRight size={14} className="metric-arrow" />
                        </div>
                    </div>
                </div>

                <div className="metric-card card-purple" onClick={() => onNavigate("images")}>
                    <div className="metric-card-inner">
                        <div className="metric-header">
                            <span className="metric-label">DOCKER IMAGES</span>
                            <div className="metric-icon-wrap purple">
                                <Layers size={20} />
                            </div>
                        </div>
                        <div className="metric-body">
                            <span className="metric-number">{images.length}</span>
                            <span className="metric-trend-pill purple">
                                {formatBytes(totalImageSize)}
                            </span>
                        </div>
                        <div className="metric-footer">
                            <span>Cached on local engine</span>
                            <ArrowUpRight size={14} className="metric-arrow" />
                        </div>
                    </div>
                </div>

                <div className="metric-card card-amber" onClick={() => onNavigate("volumes")}>
                    <div className="metric-card-inner">
                        <div className="metric-header">
                            <span className="metric-label">VOLUMES & NETWORKS</span>
                            <div className="metric-icon-wrap amber">
                                <HardDrive size={20} />
                            </div>
                        </div>
                        <div className="metric-body">
                            <span className="metric-number">{volumes.length + networks.length}</span>
                            <span className="metric-trend neutral">
                                {volumes.length} Vol / {networks.length} Net
                            </span>
                        </div>
                        <div className="metric-footer">
                            <span>Persistent resources</span>
                            <ArrowUpRight size={14} className="metric-arrow" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Middle Section: Runtime Distribution & Infrastructure Cards */}
            <div className="split-grid">
                {/* Health & Runtime Panel */}
                <div className="panel-card">
                    <div className="panel-header">
                        <div className="panel-title-wrap">
                            <Activity size={18} className="text-cyan" />
                            <div>
                                <h3 className="panel-title">Fleet Runtime Health</h3>
                                <p className="panel-desc">Real-time container execution ratio</p>
                            </div>
                        </div>
                        <span className="panel-chip">{containers.length} TOTAL</span>
                    </div>

                    <div className="runtime-health-body">
                        <div className="segmented-progress-bar">
                            <div
                                className="segment running"
                                style={{ width: `${runningPct}%` }}
                                title={`Running: ${runningPct}%`}
                            />
                            <div
                                className="segment stopped"
                                style={{ width: `${stoppedPct}%` }}
                                title={`Stopped: ${stoppedPct}%`}
                            />
                        </div>

                        <div className="health-stat-cards">
                            <div className="health-stat">
                                <div className="stat-bullet green" />
                                <div>
                                    <div className="stat-num">{runningContainers.length}</div>
                                    <div className="stat-sub">Running ({runningPct}%)</div>
                                </div>
                            </div>
                            <div className="health-stat">
                                <div className="stat-bullet amber" />
                                <div>
                                    <div className="stat-num">{stoppedContainers.length}</div>
                                    <div className="stat-sub">Stopped ({stoppedPct}%)</div>
                                </div>
                            </div>
                            <div className="health-stat">
                                <div className="stat-bullet purple" />
                                <div>
                                    <div className="stat-num">{images.length}</div>
                                    <div className="stat-sub">Local Images</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Infrastructure Quick Access */}
                <div className="panel-card">
                    <div className="panel-header">
                        <div className="panel-title-wrap">
                            <Server size={18} className="text-indigo" />
                            <div>
                                <h3 className="panel-title">Docker Engine Resources</h3>
                                <p className="panel-desc">Storage and networking layers</p>
                            </div>
                        </div>
                    </div>

                    <div className="resource-stack">
                        <div className="resource-item" onClick={() => onNavigate("images")}>
                            <div className="res-icon purple"><Layers size={18} /></div>
                            <div className="res-info">
                                <span className="res-title">Images</span>
                                <span className="res-sub">{images.length} repositories ({formatBytes(totalImageSize)})</span>
                            </div>
                            <ChevronRight size={16} className="res-arrow" />
                        </div>

                        <div className="resource-item" onClick={() => onNavigate("volumes")}>
                            <div className="res-icon blue"><HardDrive size={18} /></div>
                            <div className="res-info">
                                <span className="res-title">Persistent Volumes</span>
                                <span className="res-sub">{volumes.length} named volumes mapped</span>
                            </div>
                            <ChevronRight size={16} className="res-arrow" />
                        </div>

                        <div className="resource-item" onClick={() => onNavigate("networks")}>
                            <div className="res-icon cyan"><Network size={18} /></div>
                            <div className="res-info">
                                <span className="res-title">Virtual Networks</span>
                                <span className="res-sub">{networks.length} virtual bridges / drivers</span>
                            </div>
                            <ChevronRight size={16} className="res-arrow" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Containers Table Panel */}
            <div className="panel-card table-panel">
                <div className="panel-header">
                    <div className="panel-title-wrap">
                        <Box size={18} className="text-blue" />
                        <div>
                            <h3 className="panel-title">Recent Containers</h3>
                            <p className="panel-desc">Click any container for deep inspection and logs</p>
                        </div>
                    </div>
                    <button className="btn-table-action" onClick={() => onNavigate("containers")}>
                        View All Containers ({containers.length}) <ChevronRight size={14} />
                    </button>
                </div>

                <div className="table-wrapper">
                    <table className="custom-table">
                        <thead>
                            <tr>
                                <th>CONTAINER</th>
                                <th>IMAGE</th>
                                <th>STATE</th>
                                <th>STATUS</th>
                                <th>PORTS</th>
                                <th style={{ textAlign: "right" }}>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredContainers.slice(0, 8).map((container) => {
                                const isRunning = container.state === "running";
                                return (
                                    <tr
                                        key={container.id}
                                        onClick={() => onSelectContainer(container)}
                                        className="clickable-row"
                                    >
                                        <td>
                                            <div className="container-name-cell">
                                                <div className={`status-indicator-sm ${isRunning ? "running" : "stopped"}`}>
                                                    <span className="dot" />
                                                </div>
                                                <div>
                                                    <span className="container-name">{container.name || "Unnamed"}</span>
                                                    <span className="container-id mono">{container.id}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="image-badge mono" title={container.image}>
                                                {truncate(container.image, 28)}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`state-badge ${isRunning ? "running" : "stopped"}`}>
                                                <span className="badge-dot" />
                                                {container.state}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="status-text">{container.status}</span>
                                        </td>
                                        <td>
                                            {container.ports && container.ports.length > 0 ? (
                                                <div className="ports-preview">
                                                    {container.ports.map((p, idx) => (
                                                        <span key={idx} className="port-tag mono">
                                                            {p.publicPort ? `${p.publicPort}:` : ""}{p.privatePort}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-dim">—</span>
                                            )}
                                        </td>
                                        <td style={{ textAlign: "right" }}>
                                            <button
                                                className="btn-inspect"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onSelectContainer(container);
                                                }}
                                            >
                                                Inspect
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                            {filteredContainers.length === 0 && (
                                <tr>
                                    <td colSpan={6}>
                                        <div className="empty-state">
                                            <Box size={32} className="text-muted" />
                                            <p className="empty-title">No matching containers found</p>
                                            <span className="empty-desc">
                                                {searchQuery ? `No containers match "${searchQuery}"` : "Your Docker engine has no containers yet."}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}