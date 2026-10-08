import React from "react";
import { X, Copy, Check, Terminal, Network, Tag, Calendar, Activity } from "lucide-react";
import type { DockerContainer } from "../../types/docker";
import { formatDate } from "../../utils/formatters";

interface Props {
    container: DockerContainer | null;
    onClose: () => void;
}

export default function ContainerModal({ container, onClose }: Props) {
    const [copied, setCopied] = React.useState(false);

    if (!container) return null;

    const isRunning = container.state === "running";

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="modal-title-wrap">
                        <div className={`status-indicator-lg ${isRunning ? "running" : "stopped"}`}>
                            <span className="dot" />
                        </div>
                        <div>
                            <h2>{container.name || "Unnamed Container"}</h2>
                            <span className="modal-subtitle mono">{container.id}</span>
                        </div>
                    </div>
                    <button className="icon-button modal-close" onClick={onClose} title="Close">
                        <X size={18} />
                    </button>
                </div>

                <div className="modal-body">
                    <div className="modal-grid">
                        <div className="modal-card">
                            <div className="card-label">
                                <Activity size={14} /> State & Status
                            </div>
                            <div className="card-value-row">
                                <span className={`state-badge ${isRunning ? "running" : "stopped"}`}>
                                    <span className="badge-dot" />
                                    {container.state.toUpperCase()}
                                </span>
                                <span className="status-text">{container.status}</span>
                            </div>
                        </div>

                        <div className="modal-card">
                            <div className="card-label">
                                <Calendar size={14} /> Created
                            </div>
                            <div className="card-val mono">{formatDate(container.created)}</div>
                        </div>

                        <div className="modal-card full-span">
                            <div className="card-label">
                                <Tag size={14} /> Image
                            </div>
                            <div className="card-val-copy">
                                <span className="mono">{container.image}</span>
                                <button className="copy-btn" onClick={() => handleCopy(container.image)} title="Copy Image Tag">
                                    {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                                </button>
                            </div>
                        </div>

                        <div className="modal-card full-span">
                            <div className="card-label">
                                <Network size={14} /> Port Bindings ({container.ports?.length || 0})
                            </div>
                            {container.ports && container.ports.length > 0 ? (
                                <div className="ports-chip-grid">
                                    {container.ports.map((p, idx) => (
                                        <div key={idx} className="port-chip">
                                            <span className="public-port mono">{p.publicPort ? `${p.publicPort} → ` : ""}</span>
                                            <span className="private-port mono">{p.privatePort}/{p.type}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted text-sm">No ports mapped or exposed</p>
                            )}
                        </div>

                        <div className="modal-card full-span">
                            <div className="card-label">
                                <Terminal size={14} /> Quick CLI Commands
                            </div>
                            <div className="cli-box">
                                <span className="mono text-muted">docker logs {container.id.slice(0, 12)}</span>
                                <button className="copy-btn" onClick={() => handleCopy(`docker logs ${container.id.slice(0, 12)}`)} title="Copy command">
                                    <Copy size={14} />
                                </button>
                            </div>
                            <div className="cli-box" style={{ marginTop: "6px" }}>
                                <span className="mono text-muted">docker exec -it {container.id.slice(0, 12)} sh</span>
                                <button className="copy-btn" onClick={() => handleCopy(`docker exec -it ${container.id.slice(0, 12)} sh`)} title="Copy command">
                                    <Copy size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn-secondary" onClick={onClose}>Close</button>
                    <button className="btn-primary" onClick={() => handleCopy(container.id)}>
                        {copied ? <><Check size={14} /> Copied ID</> : <><Copy size={14} /> Copy Container ID</>}
                    </button>
                </div>
            </div>
        </div>
    );
}
