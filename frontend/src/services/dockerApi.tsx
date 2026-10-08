import type {
    DockerContainer,
    DockerImage,
    DockerVolume,
    DockerNetwork,
    ContainerInspect,
    ContainerLogsResponse,
    ContainerStats,
    ComposeStack,
} from "../types/docker";

const API = "/api/docker";

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API}/${endpoint}`, {
        headers: {
            "Content-Type": "application/json",
            ...options?.headers,
        },
        ...options,
    });

    if (!response.ok) {
        let errorMsg = `API error: ${response.status}`;
        try {
            const errData = await response.json();
            if (errData?.error) errorMsg = errData.error;
            else if (errData?.message) errorMsg = errData.message;
        } catch {
            // response was not JSON
        }
        throw new Error(errorMsg);
    }

    return response.json() as Promise<T>;
}

export const dockerApi = {
    // Containers
    containers: () => request<DockerContainer[]>("containers"),
    inspectContainer: (id: string) => request<ContainerInspect>(`containers/${id}/inspect`),
    startContainer: (id: string) => request<{ success: boolean; message: string }>(`containers/${id}/start`, { method: "POST" }),
    stopContainer: (id: string) => request<{ success: boolean; message: string }>(`containers/${id}/stop`, { method: "POST" }),
    restartContainer: (id: string) => request<{ success: boolean; message: string }>(`containers/${id}/restart`, { method: "POST" }),
    removeContainer: (id: string, force = false) =>
        request<{ success: boolean; message: string }>(`containers/${id}?force=${force}`, { method: "DELETE" }),
    containerLogs: (id: string, tail = 150) => request<ContainerLogsResponse>(`containers/${id}/logs?tail=${tail}`),
    containerStats: (id: string) => request<ContainerStats>(`containers/${id}/stats`),

    // Images
    images: () => request<DockerImage[]>("images"),
    inspectImage: (id: string) => request<any>(`images/${id}/inspect`),

    // Volumes
    volumes: () => request<DockerVolume[]>("volumes"),
    inspectVolume: (name: string) => request<any>(`volumes/${name}/inspect`),

    // Networks
    networks: () => request<DockerNetwork[]>("networks"),
    inspectNetwork: (id: string) => request<any>(`networks/${id}/inspect`),

    // Compose Stacks
    composeStacks: () => request<ComposeStack[]>("compose/stacks"),
};