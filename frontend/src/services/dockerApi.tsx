import type {
    DockerContainer,
    DockerImage,
    DockerVolume,
    DockerNetwork,
} from "../types/docker";

const API = "/api/docker";

async function get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API}/${endpoint}`);

    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }

    return response.json() as Promise<T>;
}

export const dockerApi = {
    containers: () => get<DockerContainer[]>("containers"),
    images: () => get<DockerImage[]>("images"),
    volumes: () => get<DockerVolume[]>("volumes"),
    networks: () => get<DockerNetwork[]>("networks"),
};