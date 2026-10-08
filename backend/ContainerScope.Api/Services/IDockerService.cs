using Docker.DotNet.Models;

namespace ContainerScope.Api.Services;

public interface IDockerService
{
    Task<IList<ContainerListResponse>> GetContainersAsync();
    Task<IList<ImagesListResponse>> GetImagesAsync();

    Task<VolumesListResponse> GetVolumesAsync();

    Task<IList<NetworkResponse>> GetNetworksAsync();
}