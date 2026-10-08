using Docker.DotNet;
using Docker.DotNet.Models;

namespace ContainerScope.Api.Services
{
    public class DockerService : IDockerService
    {
        private readonly DockerClient _client;

        public DockerService(DockerClient client)
        {
            _client = client;
        }

        public async Task<IList<ContainerListResponse>> GetContainersAsync()
        {
            return await _client.Containers.ListContainersAsync(
            new ContainersListParameters
            {
                All = true
            });
        }

        public async Task<IList<ImagesListResponse>> GetImagesAsync()
        {
            return await _client.Images.ListImagesAsync(
        new ImagesListParameters
        {
            All = true
        });
        }

        public async Task<IList<NetworkResponse>> GetNetworksAsync()
        {
            return await _client.Networks.ListNetworksAsync();
        }

        public async Task<VolumesListResponse> GetVolumesAsync()
        {
            return await _client.Volumes.ListAsync();
        }
    }
}
