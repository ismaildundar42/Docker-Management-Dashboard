import { useState, useEffect, useCallback } from "react";
import {
    Boxes,
    RotateCw,
    Folder,
} from "lucide-react";
import type { ComposeStack, DockerContainer } from "../types/docker";
import { dockerApi } from "../services/dockerApi";
import { truncate } from "../utils/formatters";

interface Props {
    searchQuery: string;
    onSelectContainer: (container: DockerContainer) => void;
}

export default function ComposePage({ searchQuery, onSelectContainer }: Props) {
    const [stacks, setStacks] = useState<ComposeStack[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadStacks = useCallback(async (refresh = false) => {
        if (refresh) setRefreshing(true);
        else setLoading(true);

        try {
            const data = await dockerApi.composeStacks();
            setStacks(data || []);
        } catch (err) {
            console.error("Failed to load compose stacks:", err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        void loadStacks();
    }, [loadStacks]);

    const filteredStacks = stacks.filter((s) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            s.name.toLowerCase().includes(q) ||
            s.workingDir.toLowerCase().includes(q) ||
            s.services.some((srv) => srv.serviceName.toLowerCase().includes(q) || srv.image.toLowerCase().includes(q))
        );
    });

    return (
        <div className="subpage-view">
            <div className="page-header-row">
                <div className="page-header-text">
                    <div className="page-badge">
                        <Boxes size={13} />
                        DOCKER COMPOSE ORCHESTRATION
                    </div>
                    <h1 className="page-title">Compose Stacks</h1>
                    <p className="page-subtitle">
                        Multi-container applications grouped and managed by Docker Compose
                    </p>
                </div>

                <div className="page-actions">
                    <button
                        className={`refresh-btn ${refreshing ? "is-refreshing" : ""}`}
                        disabled={refreshing || loading}
                        onClick={() => void loadStacks(true)}
                    >
                        <RotateCw size={14} className={refreshing ? "spin-icon" : ""} />
                        <span>{refreshing ? "Syncing..." : "Sync Stacks"}</span>
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="loading-view">
                    <div className="loading-spinner" />
                    <p>Detecting Docker Compose stacks...</p>
                </div>
            ) : filteredStacks.length > 0 ? (
                <div className="compose-stacks-grid">
                    {filteredStacks.map((stack) => (
                        <div key={stack.name} className="compose-stack-card">
                            <div className="stack-header">
                                <div className="stack-title-group">
                                    <div className="stack-icon-wrap">
                                        <Boxes size={20} className="text-cyan" />
                                    </div>
                                    <div>
                                        <h3 className="stack-name">{stack.name}</h3>
                                        <div className="stack-path-info mono" title={stack.workingDir}>
                                            <Folder size={12} className="text-muted" />
                                            <span>{truncate(stack.workingDir || "Default context", 38)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="stack-status-badge">
                                    <span className="dot-mini green" />
                                    <span>{stack.runningServices} / {stack.totalServices} Services Running</span>
                                </div>
                            </div>

                            <div className="stack-services-list">
                                <div className="services-header-label">SERVICES IN STACK</div>
                                {stack.services.map((srv) => {
                                    const isRunning = srv.state === "running";
                                    return (
                                        <div
                                            key={srv.containerId}
                                            className="service-row-item"
                                            onClick={() =>
                                                onSelectContainer({
                                                    id: srv.containerId,
                                                    name: srv.containerName,
                                                    image: srv.image,
                                                    state: srv.state,
                                                    status: srv.status,
                                                    created: "",
                                                    ports: srv.ports,
                                                })
                                            }
                                        >
                                            <div className="service-info-left">
                                                <div className={`status-indicator-sm ${isRunning ? "running" : "stopped"}`}>
                                                    <span className="dot" />
                                                </div>
                                                <div>
                                                    <div className="service-name-row">
                                                        <strong className="srv-name">{srv.serviceName}</strong>
                                                        <span className="srv-cname mono text-muted">({srv.containerName})</span>
                                                    </div>
                                                    <span className="srv-img mono text-dim">{truncate(srv.image, 30)}</span>
                                                </div>
                                            </div>

                                            <div className="service-info-right">
                                                {srv.ports && srv.ports.length > 0 && (
                                                    <div className="ports-preview">
                                                        {srv.ports.map((p, idx) => (
                                                            <span key={idx} className="port-tag mono">
                                                                {p.publicPort ? `${p.publicPort}:` : ""}{p.privatePort}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                                <span className={`state-badge ${isRunning ? "running" : "stopped"}`}>
                                                    <span className="badge-dot" />
                                                    {srv.state}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="panel-card">
                    <div className="empty-state">
                        <Boxes size={36} className="text-muted" />
                        <p className="empty-title">No Docker Compose stacks found</p>
                        <span className="empty-desc">
                            {searchQuery
                                ? `No compose projects match "${searchQuery}"`
                                : "Start containers using `docker compose up` to view organized multi-container stacks here."}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
