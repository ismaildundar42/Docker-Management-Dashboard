import { Search, RotateCw, AlertCircle, ShieldCheck } from "lucide-react";
import type { Page } from "./Sidebar";

interface Props {
    page: Page;
    searchQuery: string;
    onSearchChange: (q: string) => void;
    refreshing: boolean;
    loading: boolean;
    error: string;
    onRefresh: () => void;
    autoRefreshInterval: number;
    setAutoRefreshInterval: (interval: number) => void;
}

export default function Topbar({
    page,
    searchQuery,
    onSearchChange,
    refreshing,
    loading,
    error,
    onRefresh,
    autoRefreshInterval,
    setAutoRefreshInterval,
}: Props) {
    const pageLabels: Record<Page, string> = {
        dashboard: "Overview & Metrics",
        containers: "Containers Fleet",
        compose: "Compose Stacks",
        images: "Images Library",
        volumes: "Storage Volumes",
        networks: "Virtual Networks",
    };

    return (
        <header className="topbar">
            <div className="topbar-left">
                <div className="breadcrumb">
                    <span className="bc-root">CONTAINERSCOPE</span>
                    <span className="bc-sep">/</span>
                    <span className="bc-page">{page.toUpperCase()}</span>
                </div>
                <div className="breadcrumb-sub">
                    {pageLabels[page]}
                </div>
            </div>

            <div className="topbar-center">
                <div className="search-bar">
                    <Search size={15} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search containers, images, ports, volumes..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="search-input"
                    />
                    {searchQuery && (
                        <button className="search-clear" onClick={() => onSearchChange("")}>
                            ×
                        </button>
                    )}
                </div>
            </div>

            <div className="topbar-right">
                <div className="refresh-controls">
                    <select
                        className="interval-select"
                        value={autoRefreshInterval}
                        onChange={(e) => setAutoRefreshInterval(Number(e.target.value))}
                        title="Auto-refresh frequency"
                    >
                        <option value={0}>Auto: Off</option>
                        <option value={5000}>Auto: 5s</option>
                        <option value={10000}>Auto: 10s</option>
                        <option value={30000}>Auto: 30s</option>
                    </select>

                    <button
                        className={`refresh-btn ${refreshing ? "is-refreshing" : ""}`}
                        disabled={refreshing || loading}
                        onClick={onRefresh}
                        title="Manual refresh"
                    >
                        <RotateCw size={14} className={refreshing ? "spin-icon" : ""} />
                        <span>{refreshing ? "Syncing..." : "Sync"}</span>
                    </button>
                </div>

                <div className={`status-pill ${error ? "offline" : "online"}`}>
                    <span className="status-glow-dot" />
                    {error ? (
                        <span className="status-label"><AlertCircle size={13} /> Disconnected</span>
                    ) : loading ? (
                        <span className="status-label">Connecting...</span>
                    ) : (
                        <span className="status-label"><ShieldCheck size={13} /> Engine Live</span>
                    )}
                </div>
            </div>
        </header>
    );
}
