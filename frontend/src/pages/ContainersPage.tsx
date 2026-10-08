import React, { useState } from "react";
import {
    Box,
    Copy,
    Check,
} from "lucide-react";
import type { DockerContainer } from "../types/docker";
import { formatDate, truncate } from "../utils/formatters";

interface Props {
    containers: DockerContainer[];
    onSelectContainer: (container: DockerContainer) => void;
    searchQuery: string;
}

export default function ContainersPage({ containers, onSelectContainer, searchQuery }: Props) {
    const [filterState, setFilterState] = useState<"all" | "running" | "stopped">("all");
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const handleCopy = (e: React.MouseEvent, text: string) => {
        e.stopPropagation();
        navigator.clipboard.writeText(text);
        setCopiedId(text);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const runningCount = containers.filter((c) => c.state === "running").length;
    const stoppedCount = containers.length - runningCount;

    const filtered = containers.filter((c) => {
        const matchesState =
            filterState === "all" ? true : filterState === "running" ? c.state === "running" : c.state !== "running";

        if (!matchesState) return false;

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
        <div className="subpage-view">
            <div className="page-header-row">
                <div className="page-header-text">
                    <div className="page-badge">
                        <Box size={13} />
                        CONTAINER MANAGEMENT
                    </div>
                    <h1 className="page-title">Containers Fleet</h1>
                    <p className="page-subtitle">
                        Inspect, monitor and manage active and dormant container instances
                    </p>
                </div>

                <div className="filter-pill-group">
                    <button
                        className={`filter-tab ${filterState === "all" ? "active" : ""}`}
                        onClick={() => setFilterState("all")}
                    >
                        All <span className="tab-counter">{containers.length}</span>
                    </button>
                    <button
                        className={`filter-tab ${filterState === "running" ? "active" : ""}`}
                        onClick={() => setFilterState("running")}
                    >
                        <span className="dot-mini green" /> Running <span className="tab-counter">{runningCount}</span>
                    </button>
                    <button
                        className={`filter-tab ${filterState === "stopped" ? "active" : ""}`}
                        onClick={() => setFilterState("stopped")}
                    >
                        <span className="dot-mini amber" /> Stopped <span className="tab-counter">{stoppedCount}</span>
                    </button>
                </div>
            </div>

            <div className="panel-card table-panel">
                <div className="table-wrapper">
                    <table className="custom-table">
                        <thead>
                            <tr>
                                <th>CONTAINER</th>
                                <th>ID</th>
                                <th>IMAGE</th>
                                <th>STATE</th>
                                <th>STATUS</th>
                                <th>PORTS</th>
                                <th>CREATED</th>
                                <th style={{ textAlign: "right" }}>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((container) => {
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
                                                <span className="container-name font-bold">
                                                    {container.name || "Unnamed"}
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="id-cell">
                                                <span className="mono">{container.id}</span>
                                                <button
                                                    className="copy-btn-mini"
                                                    onClick={(e) => handleCopy(e, container.id)}
                                                    title="Copy ID"
                                                >
                                                    {copiedId === container.id ? (
                                                        <Check size={12} color="#10b981" />
                                                    ) : (
                                                        <Copy size={12} />
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="image-badge mono" title={container.image}>
                                                {truncate(container.image, 26)}
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
                                                            {p.publicPort ? `${p.publicPort}:` : ""}{p.privatePort}/{p.type}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-dim">—</span>
                                            )}
                                        </td>
                                        <td>
                                            <span className="text-muted text-sm">{formatDate(container.created)}</span>
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
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={8}>
                                        <div className="empty-state">
                                            <Box size={32} className="text-muted" />
                                            <p className="empty-title">No containers match the current filter</p>
                                            <span className="empty-desc">
                                                Try changing the filter or clearing the search query.
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
