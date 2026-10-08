using ContainerScope.Api.Models;
using Docker.DotNet.Models;

namespace ContainerScope.Api.Services;

public interface IDockerService
{
    Task<IList<ContainerListResponse>> GetContainersAsync();
    Task<ContainerInspectDto> InspectContainerAsync(string id);
    Task<bool> StartContainerAsync(string id);
    Task<bool> StopContainerAsync(string id);
    Task<bool> RestartContainerAsync(string id);
    Task<bool> RemoveContainerAsync(string id, bool force = false);
    Task<ContainerLogResponse> GetContainerLogsAsync(string id, int tail = 150);
    Task<ContainerStatsDto> GetContainerStatsAsync(string id);

    Task<IList<ImagesListResponse>> GetImagesAsync();
    Task<ImageInspectResponse> InspectImageAsync(string id);

    Task<VolumesListResponse> GetVolumesAsync();
    Task<VolumeResponse> InspectVolumeAsync(string name);

    Task<IList<NetworkResponse>> GetNetworksAsync();
    Task<NetworkResponse> InspectNetworkAsync(string id);

    Task<List<ComposeStackDto>> GetComposeStacksAsync();
}