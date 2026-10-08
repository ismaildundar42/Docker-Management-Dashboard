export function formatBytes(bytes: number, decimals = 2): string {
    if (!bytes || bytes === 0) return "0 B";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["B", "KB", "MB", "GB", "TB", "PB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function formatDate(timestamp: string | number): string {
    if (!timestamp) return "-";
    try {
        const date = typeof timestamp === "number" ? new Date(timestamp * 1000) : new Date(timestamp);
        if (isNaN(date.getTime())) return String(timestamp);
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    } catch {
        return String(timestamp);
    }
}

export function timeAgo(timestamp: string | number): string {
    if (!timestamp) return "-";
    try {
        const date = typeof timestamp === "number" ? new Date(timestamp * 1000) : new Date(timestamp);
        if (isNaN(date.getTime())) return String(timestamp);
        const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
        if (seconds < 60) return `${Math.max(1, seconds)}s ago`;
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    } catch {
        return "-";
    }
}

export function truncate(text: string, max = 24): string {
    if (!text) return "";
    return text.length > max ? `${text.slice(0, max)}...` : text;
}
