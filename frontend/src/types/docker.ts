export interface DockerPort {
    privatePort: number;
    publicPort?: number;
    type: string;
}

export interface DockerContainer {
    id: string;
    name: string;
    image: string;
    state: string;
    status: string;
    created: string;
    ports: DockerPort[];
}

export interface DockerImage {
    id: string;
    tags: string[];
    size: number;
    created: string;
}

export interface DockerVolume {
    name: string;
    driver: string;
    mountpoint: string;
}

export interface DockerNetwork {
    id: string;
    name: string;
    driver: string;
    scope: string;
}