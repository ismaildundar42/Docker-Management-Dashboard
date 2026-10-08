import { useState, useEffect, useRef, useCallback } from "react";
import {
    X,
    Copy,
    Check,
    Play,
    Square,
    RotateCw,
    Trash2,
    Activity,
    Terminal,
    Settings,
    Network,
    Cpu,
    HardDrive,
    Search,
    Download,
    ArrowDown,
} from "lucide-react";
import type { DockerContainer, ContainerInspect, ContainerStats } from "../../types/docker";
import { dockerApi } from "../../services/dockerApi";
import { useToast } from "../../context/ToastContext";
import { formatBytes, formatDate } from "../../utils/formatters";

interface Props {
    container: DockerContainer | null;
    onClose: () => void;
    onRefreshList: () => void;
}

type TabType = "metrics" | "logs" | "config" | "mounts";

export default function ContainerModal({ container, onClose, onRefreshList }: Props) {
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState<TabType>("metrics");
    const [inspectData, setInspectData] = useState<ContainerInspect | null>(null);
    const [stats, setStats] = useState<ContainerStats | null>(null);
    const [logs, setLogs] = useState<string[]>([]);
    const [tail, setTail] = useState<number>(150);
    const [logSearch, setLogSearch] = useState<string>("");
    const [autoScroll, setAutoScroll] = useState<boolean>(true);
    const [copied, setCopied] = useState<string | null>(null);

    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [loadingLogs, setLoadingLogs] = useState<boolean>(false);

    const logsEndRef = useRef<HTMLDivElement>(null);

    const containerId = container?.id || "";

    // Load Inspect Details
    const loadInspect = useCallback(async () => {
        if (!containerId) return;
        try {
            const data = await dockerApi.inspectContainer(containerId);
            setInspectData(data);
        } catch (err) {
            console.error("Inspect error:", err);
        }
    }, [containerId]);

    // Load Stats
    const loadStats = useCallback(async () => {
        if (!containerId || container?.state !== "running") return;
        try {
            const s = await dockerApi.containerStats(containerId);
            setStats(s);
        } catch (err) {
            console.error("Stats error:", err);
        }
    }, [containerId, container?.state]);

    // Load Logs
    const loadLogs = useCallback(async () => {
        if (!containerId) return;
        setLoadingLogs(true);
        try {
            const logData = await dockerApi.containerLogs(containerId, tail);
            setLogs(logData.lines || []);
        } catch (err) {
            console.error("Logs error:", err);
        } finally {
            setLoadingLogs(false);
        }
    }, [containerId, tail]);

    useEffect(() => {
        if (container) {
            void loadInspect();
            if (container.state === "running") {
                void loadStats();
            }
            void loadLogs();
        } else {
            setInspectData(null);
            setStats(null);
            setLogs([]);
        }
    }, [container, loadInspect, loadStats, loadLogs]);

    // Polling for metrics and logs if tab active and running
    useEffect(() => {
        if (!container || container.state !== "running") return;

        let interval: any;
        if (activeTab === "metrics") {
            interval = setInterval(() => {
                void loadStats();
            }, 3000);
        } else if (activeTab === "logs") {
            interval = setInterval(() => {
                void loadLogs();
            }, 4000);
        }

        return () => clearInterval(interval);
    }, [container, activeTab, loadStats, loadLogs]);

    // Auto-scroll logs
    useEffect(() => {
        if (autoScroll && activeTab === "logs") {
            logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [logs, autoScroll, activeTab]);

    if (!container) return null;

    const isRunning = inspectData ? inspectData.running : container.state === "running";

    // Container Actions
    const handleAction = async (action: "start" | "stop" | "restart" | "remove") => {
        setActionLoading(action);
        try {
            if (action === "start") {
                await dockerApi.startContainer(container.id);
                showToast("success", "Container Started", `${container.name} is now running.`);
            } else if (action === "stop") {
                await dockerApi.stopContainer(container.id);
                showToast("warning", "Container Stopped", `${container.name} was stopped.`);
            } else if (action === "restart") {
                await dockerApi.restartContainer(container.id);
                showToast("success", "Container Restarted", `${container.name} restarted successfully.`);
            } else if (action === "remove") {
                if (window.confirm(`Are you sure you want to delete container ${container.name}?`)) {
                    await dockerApi.removeContainer(container.id, true);
                    showToast("error", "Container Removed", `${container.name} has been removed.`);
                    onRefreshList();
                    onClose();
                    return;
                }
            }
            onRefreshList();
            void loadInspect();
            if (action !== "stop") void loadStats();
        } catch (err) {
            showToast("error", `Failed to ${action} container`, err instanceof Error ? err.message : "Unknown error");
        } finally {
            setActionLoading(null);
        }
    };

    const handleCopy = (text: string, key = "default") => {
        navigator.clipboard.writeText(text);
        setCopied(key);
        showToast("info", "Copied to clipboard", text);
        setTimeout(() => setCopied(null), 2000);
    };

    const handleDownloadLogs = () => {
        const element = document.createElement("a");
        const file = new Blob([logs.join("\n")], { type: "text/plain" });
        element.href = URL.createObjectURL(file);
        element.download = `${container.name || container.id}-logs.txt`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    const filteredLogs = logs.filter((l) => (logSearch ? l.toLowerCase().includes(logSearch.toLowerCase()) : true));

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-container modal-container-lg" onClick={(e) => e.stopPropagation()}>
                {/* Modal Top Header */}
                <div className="modal-header-hero">
                    <div className="modal-title-left">
                        <div className={`status-indicator-lg ${isRunning ? "running" : "stopped"}`}>
                            <span className="dot" />
                        </div>
                        <div>
                            <div className="modal-title-row">
                                <h2>{container.name || "Unnamed"}</h2>
                                <span className={`state-badge ${isRunning ? "running" : "stopped"}`}>
                                    <span className="badge-dot" />
                                    {isRunning ? "RUNNING" : "STOPPED"}
                                </span>
                            </div>
                            <div className="modal-meta-row mono text-muted">
                                <span>{container.id}</span>
                                <span className="dot-sep">•</span>
                                <span>{container.image}</span>
                            </div>
                        </div>
                    </div>

                    {/* Action Controls */}
                    <div className="modal-header-controls">
                        <div className="action-button-group">
                            {!isRunning ? (
                                <button
                                    className="btn-action-start"
                                    disabled={actionLoading !== null}
                                    onClick={() => void handleAction("start")}
                                    title="Start Container"
                                >
                                    {actionLoading === "start" ? <RotateCw size={14} className="spin-icon" /> : <Play size={14} />}
                                    <span>Start</span>
                                </button>
                            ) : (
                                <button
                                    className="btn-action-stop"
                                    disabled={actionLoading !== null}
                                    onClick={() => void handleAction("stop")}
                                    title="Stop Container"
                                >
                                    {actionLoading === "stop" ? <RotateCw size={14} className="spin-icon" /> : <Square size={14} />}
                                    <span>Stop</span>
                                </button>
                            )}

                            <button
                                className="btn-action-restart"
                                disabled={actionLoading !== null}
                                onClick={() => void handleAction("restart")}
                                title="Restart Container"
                            >
                                <RotateCw size={14} className={actionLoading === "restart" ? "spin-icon" : ""} />
                                <span>Restart</span>
                            </button>

                            <button
                                className="btn-action-delete"
                                disabled={actionLoading !== null}
                                onClick={() => void handleAction("remove")}
                                title="Remove Container"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>

                        <button className="icon-button modal-close" onClick={onClose} title="Close">
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="modal-tab-bar">
                    <button
                        className={`modal-tab ${activeTab === "metrics" ? "active" : ""}`}
                        onClick={() => setActiveTab("metrics")}
                    >
                        <Activity size={15} /> Metrics & Overview
                    </button>
                    <button
                        className={`modal-tab ${activeTab === "logs" ? "active" : ""}`}
                        onClick={() => setActiveTab("logs")}
                    >
                        <Terminal size={15} /> Live Logs {logs.length > 0 && <span className="tab-pill">{logs.length}</span>}
                    </button>
                    <button
                        className={`modal-tab ${activeTab === "config" ? "active" : ""}`}
                        onClick={() => setActiveTab("config")}
                    >
                        <Settings size={15} /> Configuration & Env
                    </button>
                    <button
                        className={`modal-tab ${activeTab === "mounts" ? "active" : ""}`}
                        onClick={() => setActiveTab("mounts")}
                    >
                        <Network size={15} /> Networks & Mounts
                    </button>
                </div>

                {/* Modal Tab Content Body */}
                <div className="modal-body-scrollable">
                    {/* TAB 1: METRICS & OVERVIEW */}
                    {activeTab === "metrics" && (
                        <div className="tab-metrics-layout">
                            {/* Live Stats Row */}
                            <div className="metrics-cards-row">
                                <div className="detail-metric-box">
                                    <div className="metric-box-top">
                                        <span className="box-title"><Cpu size={14} className="text-cyan" /> CPU UTILIZATION</span>
                                        <span className="box-val-tag cyan">{stats ? `${stats.cpuPercent}%` : isRunning ? "Calculating..." : "0.0%"}</span>
                                    </div>
                                    <div className="metric-progress-track">
                                        <div
                                            className="metric-progress-fill cyan"
                                            style={{ width: `${Math.min(100, stats?.cpuPercent || 0)}%` }}
                                        />
                                    </div>
                                    <div className="metric-box-bottom">
                                        <span>Current host load share</span>
                                    </div>
                                </div>

                                <div className="detail-metric-box">
                                    <div className="metric-box-top">
                                        <span className="box-title"><HardDrive size={14} className="text-purple" /> RAM MEMORY USAGE</span>
                                        <span className="box-val-tag purple">{stats ? `${stats.memoryPercent}%` : isRunning ? "Calculating..." : "0.0%"}</span>
                                    </div>
                                    <div className="metric-progress-track">
                                        <div
                                            className="metric-progress-fill purple"
                                            style={{ width: `${Math.min(100, stats?.memoryPercent || 0)}%` }}
                                        />
                                    </div>
                                    <div className="metric-box-bottom">
                                        <span>{stats ? `${formatBytes(stats.memoryUsage)} / ${formatBytes(stats.memoryLimit)}` : "Memory offline"}</span>
                                    </div>
                                </div>

                                <div className="detail-metric-box">
                                    <div className="metric-box-top">
                                        <span className="box-title"><Network size={14} className="text-green" /> NETWORK I/O</span>
                                        <span className="box-val-tag green">LIVE</span>
                                    </div>
                                    <div className="net-io-metrics">
                                        <div className="net-stat"><span>RX (In):</span> <strong>{formatBytes(stats?.networkRxBytes || 0)}</strong></div>
                                        <div className="net-stat"><span>TX (Out):</span> <strong>{formatBytes(stats?.networkTxBytes || 0)}</strong></div>
                                    </div>
                                    <div className="metric-box-bottom">
                                        <span>Active PIDs: <strong>{stats?.pids || 0}</strong></span>
                                    </div>
                                </div>
                            </div>

                            {/* Container Specs Overview Grid */}
                            <div className="specs-detail-grid">
                                <div className="spec-item">
                                    <span className="spec-label">Container Status</span>
                                    <span className="spec-value">{container.status}</span>
                                </div>
                                <div className="spec-item">
                                    <span className="spec-label">Created Time</span>
                                    <span className="spec-value mono">{formatDate(container.created)}</span>
                                </div>
                                <div className="spec-item">
                                    <span className="spec-label">Started At</span>
                                    <span className="spec-value mono">{inspectData?.startedAt ? formatDate(inspectData.startedAt) : "-"}</span>
                                </div>
                                <div className="spec-item">
                                    <span className="spec-label">Restart Policy</span>
                                    <span className="spec-value mono">{inspectData?.restartPolicy || "no"}</span>
                                </div>
                                <div className="spec-item full-width">
                                    <span className="spec-label">Image Reference</span>
                                    <div className="spec-copy-row">
                                        <span className="mono">{container.image}</span>
                                        <button className="copy-btn-mini" onClick={() => handleCopy(container.image, "img")}>
                                            {copied === "img" ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
                                        </button>
                                    </div>
                                </div>
                                <div className="spec-item full-width">
                                    <span className="spec-label">Exposed Ports ({container.ports?.length || 0})</span>
                                    <div className="ports-chip-grid">
                                        {container.ports && container.ports.length > 0 ? (
                                            container.ports.map((p, idx) => (
                                                <div key={idx} className="port-chip">
                                                    <span className="public-port mono">{p.publicPort ? `${p.publicPort} → ` : ""}</span>
                                                    <span className="private-port mono">{p.privatePort}/{p.type}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <span className="text-muted text-sm">No ports mapped</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 2: LIVE LOGS */}
                    {activeTab === "logs" && (
                        <div className="tab-logs-layout">
                            <div className="logs-toolbar">
                                <div className="logs-search">
                                    <Search size={14} className="text-muted" />
                                    <input
                                        type="text"
                                        placeholder="Filter logs by keyword or regex..."
                                        value={logSearch}
                                        onChange={(e) => setLogSearch(e.target.value)}
                                    />
                                    {logSearch && <button onClick={() => setLogSearch("")}>×</button>}
                                </div>

                                <div className="logs-actions">
                                    <select
                                        className="tail-select"
                                        value={tail}
                                        onChange={(e) => setTail(Number(e.target.value))}
                                    >
                                        <option value={50}>Last 50 lines</option>
                                        <option value={150}>Last 150 lines</option>
                                        <option value={300}>Last 300 lines</option>
                                        <option value={1000}>Last 1000 lines</option>
                                    </select>

                                    <button
                                        className={`btn-toolbar-toggle ${autoScroll ? "active" : ""}`}
                                        onClick={() => setAutoScroll(!autoScroll)}
                                        title="Toggle auto-scroll to bottom"
                                    >
                                        <ArrowDown size={14} /> Auto-scroll
                                    </button>

                                    <button
                                        className="btn-toolbar-action"
                                        onClick={() => void loadLogs()}
                                        title="Refresh logs now"
                                    >
                                        <RotateCw size={14} className={loadingLogs ? "spin-icon" : ""} />
                                    </button>

                                    <button
                                        className="btn-toolbar-action"
                                        onClick={() => handleCopy(logs.join("\n"), "logs")}
                                        title="Copy all logs"
                                    >
                                        <Copy size={14} />
                                    </button>

                                    <button
                                        className="btn-toolbar-action"
                                        onClick={handleDownloadLogs}
                                        title="Download logs as .txt"
                                    >
                                        <Download size={14} />
                                    </button>
                                </div>
                            </div>

                            <div className="terminal-log-viewer">
                                {filteredLogs.length > 0 ? (
                                    filteredLogs.map((line, idx) => (
                                        <div key={idx} className="log-line">
                                            <span className="line-num">{idx + 1}</span>
                                            <span className="line-text">{line}</span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="logs-empty">
                                        {loadingLogs ? "Fetching container logs..." : "No logs recorded for this container."}
                                    </div>
                                )}
                                <div ref={logsEndRef} />
                            </div>
                        </div>
                    )}

                    {/* TAB 3: CONFIG & ENV */}
                    {activeTab === "config" && (
                        <div className="tab-config-layout">
                            <div className="config-section">
                                <h4 className="config-section-title">Environment Variables ({inspectData?.env?.length || 0})</h4>
                                <div className="env-table-wrap">
                                    <table className="env-table">
                                        <thead>
                                            <tr>
                                                <th>VARIABLE KEY</th>
                                                <th>VALUE</th>
                                                <th style={{ width: "40px" }}></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {inspectData?.env && inspectData.env.length > 0 ? (
                                                inspectData.env.map((e, idx) => {
                                                    const eqIdx = e.indexOf("=");
                                                    const key = eqIdx > -1 ? e.slice(0, eqIdx) : e;
                                                    const val = eqIdx > -1 ? e.slice(eqIdx + 1) : "";
                                                    return (
                                                        <tr key={idx}>
                                                            <td><span className="mono env-key">{key}</span></td>
                                                            <td><span className="mono env-val">{val}</span></td>
                                                            <td>
                                                                <button
                                                                    className="copy-btn-mini"
                                                                    onClick={() => handleCopy(e, `env-${idx}`)}
                                                                    title="Copy"
                                                                >
                                                                    {copied === `env-${idx}` ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            ) : (
                                                <tr>
                                                    <td colSpan={3} className="text-muted text-sm">No environment variables specified</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="config-section">
                                <h4 className="config-section-title">Execution Parameters</h4>
                                <div className="config-key-vals">
                                    <div className="cfg-row">
                                        <span className="cfg-key">Working Directory:</span>
                                        <span className="mono cfg-val">{inspectData?.workingDir || "/"}</span>
                                    </div>
                                    <div className="cfg-row">
                                        <span className="cfg-key">Platform:</span>
                                        <span className="mono cfg-val">{inspectData?.platform || "linux/amd64"}</span>
                                    </div>
                                    <div className="cfg-row">
                                        <span className="cfg-key">Storage Driver:</span>
                                        <span className="mono cfg-val">{inspectData?.driver || "overlay2"}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 4: NETWORKS & MOUNTS */}
                    {activeTab === "mounts" && (
                        <div className="tab-network-mounts-layout">
                            <div className="config-section">
                                <h4 className="config-section-title">Mounted Volumes & Binds ({inspectData?.mounts?.length || 0})</h4>
                                <div className="mounts-list">
                                    {inspectData?.mounts && inspectData.mounts.length > 0 ? (
                                        inspectData.mounts.map((m, idx) => (
                                            <div key={idx} className="mount-card">
                                                <div className="mount-header">
                                                    <span className="mount-type-badge mono">{m.type.toUpperCase()}</span>
                                                    <span className="mount-rw-badge">{m.rw ? "Read / Write" : "Read-Only"}</span>
                                                </div>
                                                <div className="mount-paths">
                                                    <div className="path-row">
                                                        <span className="path-label">Host / Source:</span>
                                                        <span className="mono path-val">{m.source}</span>
                                                    </div>
                                                    <div className="path-row">
                                                        <span className="path-label">Destination:</span>
                                                        <span className="mono path-val text-cyan">{m.destination}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="empty-sub-card">No volumes mounted</div>
                                    )}
                                </div>
                            </div>

                            <div className="config-section">
                                <h4 className="config-section-title">Attached Networks</h4>
                                <div className="networks-list">
                                    {inspectData?.networks && Object.keys(inspectData.networks).length > 0 ? (
                                        Object.entries(inspectData.networks).map(([netName, netConfig]) => (
                                            <div key={netName} className="net-card">
                                                <div className="net-card-top">
                                                    <span className="net-name mono">{netName}</span>
                                                    <span className="mono text-muted text-sm">{netConfig.macAddress}</span>
                                                </div>
                                                <div className="net-ip-row">
                                                    <div className="ip-box"><span>IP Address:</span> <strong className="mono">{netConfig.ipAddress || "-"}</strong></div>
                                                    <div className="ip-box"><span>Gateway:</span> <strong className="mono">{netConfig.gateway || "-"}</strong></div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="empty-sub-card">No network configs found</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Modal Footer */}
                <div className="modal-footer">
                    <button className="btn-secondary" onClick={onClose}>Close</button>
                    <button className="btn-primary" onClick={() => handleCopy(container.id, "cid")}>
                        {copied === "cid" ? <><Check size={14} /> Copied ID</> : <><Copy size={14} /> Copy Container ID</>}
                    </button>
                </div>
            </div>
        </div>
    );
}
