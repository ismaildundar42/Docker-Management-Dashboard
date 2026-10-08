import { useCallback, useEffect, useState } from "react";
import Sidebar, { type Page } from "./components/layout/Sidebar";
import Topbar from "./components/layout/Topbar";
import Dashboard from "./pages/Dashboard";
import ContainersPage from "./pages/ContainersPage";
import ImagesPage from "./pages/ImagesPage";
import VolumesPage from "./pages/VolumesPage";
import NetworksPage from "./pages/NetworksPage";
import ContainerModal from "./components/dashboard/ContainerModal";
import { dockerApi } from "./services/dockerApi";
import type {
    DockerContainer,
    DockerImage,
    DockerVolume,
    DockerNetwork,
} from "./types/docker";
import "./App.css";

function App() {
    const [page, setPage] = useState<Page>("dashboard");
    const [containers, setContainers] = useState<DockerContainer[]>([]);
    const [images, setImages] = useState<DockerImage[]>([]);
    const [volumes, setVolumes] = useState<DockerVolume[]>([]);
    const [networks, setNetworks] = useState<DockerNetwork[]>([]);
    
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [autoRefreshInterval, setAutoRefreshInterval] = useState<number>(10000); // default 10s
    const [selectedContainer, setSelectedContainer] = useState<DockerContainer | null>(null);

    const loadData = useCallback(async (refresh = false) => {
        if (refresh) setRefreshing(true);
        else setLoading(true);

        try {
            const [c, i, v, n] = await Promise.all([
                dockerApi.containers(),
                dockerApi.images(),
                dockerApi.volumes(),
                dockerApi.networks(),
            ]);

            setContainers(c || []);
            setImages(i || []);
            setVolumes(v || []);
            setNetworks(n || []);
            setError("");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to connect to Docker API");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    // Initial load
    useEffect(() => {
        void loadData();
    }, [loadData]);

    // Auto-refresh timer
    useEffect(() => {
        if (autoRefreshInterval <= 0) return;
        const interval = setInterval(() => {
            void loadData(true);
        }, autoRefreshInterval);
        return () => clearInterval(interval);
    }, [autoRefreshInterval, loadData]);

    const runningContainersCount = containers.filter((c) => c.state === "running").length;

    return (
        <div className="app-shell">
            <Sidebar
                page={page}
                onNavigate={setPage}
                counts={{
                    containers: containers.length,
                    runningContainers: runningContainersCount,
                    images: images.length,
                    volumes: volumes.length,
                    networks: networks.length,
                }}
            />

            <div className="main-shell">
                <Topbar
                    page={page}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    refreshing={refreshing}
                    loading={loading}
                    error={error}
                    onRefresh={() => void loadData(true)}
                    autoRefreshInterval={autoRefreshInterval}
                    setAutoRefreshInterval={setAutoRefreshInterval}
                />

                <main className="content">
                    {error && (
                        <div className="error-banner">
                            <strong>Connection Warning:</strong> {error}. Ensure your backend API is running on port 7160.
                        </div>
                    )}

                    {loading ? (
                        <div className="loading-view">
                            <div className="loading-spinner" />
                            <p>Querying Docker daemon sockets...</p>
                        </div>
                    ) : page === "dashboard" ? (
                        <Dashboard
                            containers={containers}
                            images={images}
                            volumes={volumes}
                            networks={networks}
                            onNavigate={setPage}
                            onSelectContainer={setSelectedContainer}
                            searchQuery={searchQuery}
                        />
                    ) : page === "containers" ? (
                        <ContainersPage
                            containers={containers}
                            onSelectContainer={setSelectedContainer}
                            searchQuery={searchQuery}
                        />
                    ) : page === "images" ? (
                        <ImagesPage
                            images={images}
                            searchQuery={searchQuery}
                        />
                    ) : page === "volumes" ? (
                        <VolumesPage
                            volumes={volumes}
                            searchQuery={searchQuery}
                        />
                    ) : page === "networks" ? (
                        <NetworksPage
                            networks={networks}
                            searchQuery={searchQuery}
                        />
                    ) : null}
                </main>
            </div>

            {/* Container Inspection Modal */}
            <ContainerModal
                container={selectedContainer}
                onClose={() => setSelectedContainer(null)}
            />
        </div>
    );
}

export default App;