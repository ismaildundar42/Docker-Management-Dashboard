import type React from "react";
import {
    LayoutDashboard,
    Box,
    Layers,
    HardDrive,
    Network,
    Server,
    Activity,
} from "lucide-react";

export type Page = "dashboard" | "containers" | "images" | "volumes" | "networks";

type Props = {
    page: Page;
    onNavigate: (page: Page) => void;
    counts: {
        containers: number;
        runningContainers: number;
        images: number;
        volumes: number;
        networks: number;
    };
};

export default function Sidebar({ page, onNavigate, counts }: Props) {
    const navigation: { id: Page; label: string; icon: React.ReactNode; badge?: number; badgeTone?: string }[] = [
        {
            id: "dashboard",
            label: "Overview",
            icon: <LayoutDashboard size={18} />,
        },
        {
            id: "containers",
            label: "Containers",
            icon: <Box size={18} />,
            badge: counts.containers,
            badgeTone: counts.runningContainers > 0 ? "badge-running" : "badge-neutral",
        },
        {
            id: "images",
            label: "Images",
            icon: <Layers size={18} />,
            badge: counts.images,
        },
        {
            id: "volumes",
            label: "Volumes",
            icon: <HardDrive size={18} />,
            badge: counts.volumes,
        },
        {
            id: "networks",
            label: "Networks",
            icon: <Network size={18} />,
            badge: counts.networks,
        },
    ];

    return (
        <aside className="sidebar">
            <div className="brand-wrap">
                <div className="brand-logo-glow">
                    <div className="brand-icon">
                        <Server size={20} className="icon-pulse" />
                    </div>
                </div>
                <div className="brand-text">
                    <div className="brand-name">
                        Container<span className="brand-highlight">Scope</span>
                    </div>
                    <div className="brand-tagline">DOCKER INTELLIGENCE</div>
                </div>
            </div>

            <div className="sidebar-group-title">WORKSPACE</div>

            <nav className="sidebar-nav">
                {navigation.map((item) => {
                    const isActive = page === item.id;
                    return (
                        <button
                            key={item.id}
                            className={`nav-btn ${isActive ? "active" : ""}`}
                            onClick={() => onNavigate(item.id)}
                        >
                            <div className="nav-left">
                                <span className="nav-icon-wrap">{item.icon}</span>
                                <span className="nav-text">{item.label}</span>
                            </div>
                            {typeof item.badge === "number" && (
                                <span className={`nav-badge ${item.badgeTone || ""}`}>
                                    {item.badge}
                                </span>
                            )}
                            {isActive && <div className="nav-active-pill" />}
                        </button>
                    );
                })}
            </nav>

            <div className="sidebar-footer">
                <div className="engine-card">
                    <div className="engine-card-top">
                        <div className="engine-title">
                            <Activity size={14} className="engine-icon" />
                            <span>Docker Host</span>
                        </div>
                        <span className="engine-live-tag">RUNNING</span>
                    </div>
                    <div className="engine-meta">
                        <div className="engine-stat">
                            <span className="stat-label">Active Containers</span>
                            <span className="stat-val">{counts.runningContainers} / {counts.containers}</span>
                        </div>
                        <div className="mini-progress-bar">
                            <div
                                className="mini-progress-fill"
                                style={{
                                    width: counts.containers ? `${(counts.runningContainers / counts.containers) * 100}%` : "0%",
                                }}
                            />
                        </div>
                    </div>
                </div>

                <div className="sidebar-legal">
                    <span>CONTAINERSCOPE V1.0</span>
                    <span className="dot-sep">•</span>
                    <span>API READY</span>
                </div>
            </div>
        </aside>
    );
}