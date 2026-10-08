using ContainerScope.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace ContainerScope.Api.Controllers;

[ApiController]
[Route("api/docker")]
public class DockerController : ControllerBase
{
    private readonly IDockerService _dockerService;

    public DockerController(IDockerService dockerService)
    {
        _dockerService = dockerService;
    }

    [HttpGet("containers")]
    public async Task<IActionResult> GetContainers()
    {
        var containers = await _dockerService.GetContainersAsync();

        var result = containers.Select(container => new
        {
            Id = container.ID[..12],
            Name = container.Names.FirstOrDefault()?.TrimStart('/'),
            Image = container.Image,
            State = container.State,
            Status = container.Status,
            Created = container.Created,
            Ports = container.Ports.Select(port => new
            {
                PrivatePort = port.PrivatePort,
                PublicPort = port.PublicPort,
                Type = port.Type
            })
        });

        return Ok(result);
    }
    [HttpGet("images")]
    public async Task<IActionResult> GetImages()
    {
        var images = await _dockerService.GetImagesAsync();

        return Ok(images.Select(image => new
        {
            Id = image.ID,
            Tags = image.RepoTags,
            Size = image.Size,
            Created = image.Created
        }));
    }
    [HttpGet("volumes")]
    public async Task<IActionResult> GetVolumes()
    {
        var volumes = await _dockerService.GetVolumesAsync();

        return Ok(volumes.Volumes.Select(volume => new
        {
            Name = volume.Name,
            Driver = volume.Driver,
            Mountpoint = volume.Mountpoint
        }));
    }
    [HttpGet("networks")]
    public async Task<IActionResult> GetNetworks()
    {
        var networks = await _dockerService.GetNetworksAsync();

        return Ok(networks.Select(network => new
        {
            Id = network.ID,
            Name = network.Name,
            Driver = network.Driver,
            Scope = network.Scope
        }));
    }
}