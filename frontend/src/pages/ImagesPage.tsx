import { useState } from "react";
import { Layers, Copy, Check } from "lucide-react";
import type { DockerImage } from "../types/docker";
import { formatBytes, formatDate } from "../utils/formatters";

interface Props {
    images: DockerImage[];
    searchQuery: string;
}

export default function ImagesPage({ images, searchQuery }: Props) {
    const [copiedTag, setCopiedTag] = useState<string | null>(null);

    const totalSize = images.reduce((acc, img) => acc + (img.size || 0), 0);

    const handleCopy = (tag: string) => {
        navigator.clipboard.writeText(tag);
        setCopiedTag(tag);
        setTimeout(() => setCopiedTag(null), 2000);
    };

    const filtered = images.filter((img) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        const hasTagMatch = img.tags?.some((t) => t.toLowerCase().includes(q));
        const hasIdMatch = img.id?.toLowerCase().includes(q);
        return hasTagMatch || hasIdMatch;
    });

    return (
        <div className="subpage-view">
            <div className="page-header-row">
                <div className="page-header-text">
                    <div className="page-badge">
                        <Layers size={13} />
                        IMAGE REGISTRY
                    </div>
                    <h1 className="page-title">Images Library</h1>
                    <p className="page-subtitle">
                        Local container images, repository tags and disk utilization
                    </p>
                </div>

                <div className="summary-pill-group">
                    <div className="summary-pill">
                        <span className="summary-lbl">Total Images</span>
                        <span className="summary-val">{images.length}</span>
                    </div>
                    <div className="summary-pill">
                        <span className="summary-lbl">Total Disk Space</span>
                        <span className="summary-val purple-text">{formatBytes(totalSize)}</span>
                    </div>
                </div>
            </div>

            <div className="panel-card table-panel">
                <div className="table-wrapper">
                    <table className="custom-table">
                        <thead>
                            <tr>
                                <th>REPOSITORY / TAGS</th>
                                <th>IMAGE ID</th>
                                <th>SIZE</th>
                                <th>CREATED</th>
                                <th style={{ textAlign: "right" }}>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((image) => {
                                const primaryTag = image.tags?.[0] || "<none>:<none>";
                                const shortId = image.id?.replace("sha256:", "").slice(0, 12) || "-";

                                return (
                                    <tr key={image.id}>
                                        <td>
                                            <div className="image-tags-cell">
                                                <div className="image-primary-tag">
                                                    <span className="mono font-bold text-primary">{primaryTag}</span>
                                                    <button
                                                        className="copy-btn-mini"
                                                        onClick={() => handleCopy(primaryTag)}
                                                        title="Copy image name"
                                                    >
                                                        {copiedTag === primaryTag ? (
                                                            <Check size={12} color="#10b981" />
                                                        ) : (
                                                            <Copy size={12} />
                                                        )}
                                                    </button>
                                                </div>
                                                {image.tags && image.tags.length > 1 && (
                                                    <div className="subtags-wrap">
                                                        {image.tags.slice(1).map((tag, idx) => (
                                                            <span key={idx} className="subtag-pill mono">
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <span className="mono text-muted">{shortId}</span>
                                        </td>
                                        <td>
                                            <span className="size-badge mono">{formatBytes(image.size)}</span>
                                        </td>
                                        <td>
                                            <span className="text-muted text-sm">{formatDate(image.created)}</span>
                                        </td>
                                        <td style={{ textAlign: "right" }}>
                                            <button
                                                className="btn-secondary-sm"
                                                onClick={() => handleCopy(`docker run -d ${primaryTag}`)}
                                                title="Copy docker run command"
                                            >
                                                Run Command
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={5}>
                                        <div className="empty-state">
                                            <Layers size={32} className="text-muted" />
                                            <p className="empty-title">No images found</p>
                                            <span className="empty-desc">
                                                {searchQuery ? `No images match "${searchQuery}"` : "No images in local Docker repository."}
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
