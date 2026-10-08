import { useState } from "react";
import { Network, Copy, Check, Globe } from "lucide-react";
import type { DockerNetwork } from "../types/docker";

interface Props {
    networks: DockerNetwork[];
    searchQuery: string;
}

export default function NetworksPage({ networks, searchQuery }: Props) {
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(text);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const filtered = networks.filter((net) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            net.name?.toLowerCase().includes(q) ||
            net.driver?.toLowerCase().includes(q) ||
            net.scope?.toLowerCase().includes(q) ||
            net.id?.toLowerCase().includes(q)
        );
    });

    return (
        <div className="subpage-view">
            <div className="page-header-row">
                <div className="page-header-text">
                    <div className="page-badge">
                        <Network size={13} />
                        NETWORKING LAYER
                    </div>
                    <h1 className="page-title">Virtual Networks</h1>
                    <p className="page-subtitle">
                        Bridge, host, overlay, and custom container network topologies
                    </p>
                </div>

                <div className="summary-pill-group">
                    <div className="summary-pill">
                        <span className="summary-lbl">Active Networks</span>
                        <span className="summary-val">{networks.length}</span>
                    </div>
                </div>
            </div>

            <div className="panel-card table-panel">
                <div className="table-wrapper">
                    <table className="custom-table">
                        <thead>
                            <tr>
                                <th>NETWORK NAME</th>
                                <th>NETWORK ID</th>
                                <th>DRIVER</th>
                                <th>SCOPE</th>
                                <th style={{ textAlign: "right" }}>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((net) => {
                                const shortId = net.id?.slice(0, 12) || "-";
                                const isBridge = net.driver === "bridge";

                                return (
                                    <tr key={net.id}>
                                        <td>
                                            <div className="flex-align-gap">
                                                <Globe size={16} className={isBridge ? "text-cyan" : "text-indigo"} />
                                                <span className="mono font-bold text-primary">{net.name}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="id-cell">
                                                <span className="mono text-muted">{shortId}</span>
                                                <button
                                                    className="copy-btn-mini"
                                                    onClick={() => handleCopy(net.id)}
                                                    title="Copy Network ID"
                                                >
                                                    {copiedId === net.id ? (
                                                        <Check size={12} color="#10b981" />
                                                    ) : (
                                                        <Copy size={12} />
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`driver-badge mono ${net.driver}`}>
                                                {net.driver}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="scope-tag mono">{net.scope || "local"}</span>
                                        </td>
                                        <td style={{ textAlign: "right" }}>
                                            <button
                                                className="btn-secondary-sm"
                                                onClick={() => handleCopy(`docker network inspect ${net.name}`)}
                                                title="Copy network inspect command"
                                            >
                                                Inspect Command
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={5}>
                                        <div className="empty-state">
                                            <Network size={32} className="text-muted" />
                                            <p className="empty-title">No networks found</p>
                                            <span className="empty-desc">
                                                {searchQuery ? `No networks match "${searchQuery}"` : "No virtual networks available."}
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
