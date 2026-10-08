import { useState } from "react";
import { HardDrive, Copy, Check, Folder } from "lucide-react";
import type { DockerVolume } from "../types/docker";

interface Props {
    volumes: DockerVolume[];
    searchQuery: string;
}

export default function VolumesPage({ volumes, searchQuery }: Props) {
    const [copiedPath, setCopiedPath] = useState<string | null>(null);

    const handleCopy = (path: string) => {
        navigator.clipboard.writeText(path);
        setCopiedPath(path);
        setTimeout(() => setCopiedPath(null), 2000);
    };

    const filtered = volumes.filter((vol) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            vol.name?.toLowerCase().includes(q) ||
            vol.driver?.toLowerCase().includes(q) ||
            vol.mountpoint?.toLowerCase().includes(q)
        );
    });

    return (
        <div className="subpage-view">
            <div className="page-header-row">
                <div className="page-header-text">
                    <div className="page-badge">
                        <HardDrive size={13} />
                        STORAGE MANAGEMENT
                    </div>
                    <h1 className="page-title">Volumes</h1>
                    <p className="page-subtitle">
                        Persistent data volumes attached to containers and engine storage
                    </p>
                </div>

                <div className="summary-pill-group">
                    <div className="summary-pill">
                        <span className="summary-lbl">Total Volumes</span>
                        <span className="summary-val">{volumes.length}</span>
                    </div>
                </div>
            </div>

            <div className="panel-card table-panel">
                <div className="table-wrapper">
                    <table className="custom-table">
                        <thead>
                            <tr>
                                <th>VOLUME NAME</th>
                                <th>DRIVER</th>
                                <th>HOST MOUNTPOINT</th>
                                <th style={{ textAlign: "right" }}>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((vol) => (
                                <tr key={vol.name}>
                                    <td>
                                        <div className="flex-align-gap">
                                            <Folder size={16} className="text-amber" />
                                            <span className="mono font-bold text-primary">{vol.name}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="driver-badge mono">{vol.driver || "local"}</span>
                                    </td>
                                    <td>
                                        <div className="mount-cell">
                                            <span className="mono text-muted text-sm" title={vol.mountpoint}>
                                                {vol.mountpoint || "-"}
                                            </span>
                                            {vol.mountpoint && (
                                                <button
                                                    className="copy-btn-mini"
                                                    onClick={() => handleCopy(vol.mountpoint)}
                                                    title="Copy mount path"
                                                >
                                                    {copiedPath === vol.mountpoint ? (
                                                        <Check size={12} color="#10b981" />
                                                    ) : (
                                                        <Copy size={12} />
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                    <td style={{ textAlign: "right" }}>
                                        <button
                                            className="btn-secondary-sm"
                                            onClick={() => handleCopy(vol.name)}
                                            title="Copy volume name"
                                        >
                                            Copy Name
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={4}>
                                        <div className="empty-state">
                                            <HardDrive size={32} className="text-muted" />
                                            <p className="empty-title">No storage volumes found</p>
                                            <span className="empty-desc">
                                                {searchQuery ? `No volumes match "${searchQuery}"` : "No volumes defined on this Docker daemon."}
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
