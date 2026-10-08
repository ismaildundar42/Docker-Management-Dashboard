export interface DockerPort {
    privatePort: number;
    publicPort?: number;
    type: string;
    ip?: string;
}

export interface DockerContainer {
    id: string;
    fullId?: string;
    name: string;
    image: string;
    state: string;
    status: string;
    created: string;
    ports: DockerPort[];
}

export interface ContainerStats {
    cpuPercent: number;
    memoryUsage: number;
    memoryLimit: number;
    memoryPercent: number;
    networkRxBytes: number;
    networkTxBytes: number;
    blockReadBytes: number;
    blockWriteBytes: number;
    pids: number;
}

export interface ContainerLogsResponse {
    containerId: string;
    lines: string[];
}

export interface MountPoint {
    type: string;
    name: string;
    source: string;
    destination: string;
    mode: string;
    rw: boolean;
}

export interface NetworkSettings {
    networkId: string;
    ipAddress: string;
    gateway: string;
    macAddress: string;
}

export interface ContainerInspect {
    id: string;
    name: string;
    image: string;
    imageId: string;
    state: string;
    status: string;
    running: boolean;
    paused: boolean;
    restarting: boolean;
    exitCode: number;
    created: string;
    startedAt: string;
    finishedAt: string;
    platform: string;
    driver: string;
    path: string;
    args: string[];
    env: string[];
    workingDir: string;
    restartPolicy: string;
    ports: DockerPort[];
    mounts: MountPoint[];
    networks: Record<string, NetworkSettings>;
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
    createdAt?: string;
}

export interface DockerNetwork {
    id: string;
    name: string;
    driver: string;
    scope: string;
    containers?: number;
}

export interface ComposeService {
    containerId: string;
    containerName: string;
    serviceName: string;
    state: string;
    status: string;
    image: string;
    ports: DockerPort[];
}

export interface ComposeStack {
    name: string;
    workingDir: string;
    configFiles: string;
    totalServices: number;
    runningServices: number;
    services: ComposeService[];
}