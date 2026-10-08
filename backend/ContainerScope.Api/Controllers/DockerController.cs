using ContainerScope.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace ContainerScope.Api.Controllers;

[ApiController]
[Route("api/docker")]
public class DockerController : ControllerBase
{
    private readonly IDockerService _dockerService;
    private readonly ILogger<DockerController> _logger;

    public DockerController(IDockerService dockerService, ILogger<DockerController> logger)
    {
        _dockerService = dockerService;
        _logger = logger;
    }

    [HttpGet("containers")]
    public async Task<IActionResult> GetContainers()
    {
        try
        {
            var containers = await _dockerService.GetContainersAsync();
            var result = containers.Select(container => new
            {
                Id = container.ID.Length >= 12 ? container.ID[..12] : container.ID,
                FullId = container.ID,
                Name = container.Names?.FirstOrDefault()?.TrimStart('/'),
                Image = container.Image,
                State = container.State,
                Status = container.Status,
                Created = container.Created,
                Ports = container.Ports?.Select(port => new
                {
                    PrivatePort = port.PrivatePort,
                    PublicPort = port.PublicPort > 0 ? (int?)port.PublicPort : null,
                    Type = port.Type,
                    Ip = port.IP
                }).ToList() ?? new()
            });

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get containers");
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpGet("containers/{id}/inspect")]
    public async Task<IActionResult> InspectContainer(string id)
    {
        try
        {
            var inspection = await _dockerService.InspectContainerAsync(id);
            return Ok(inspection);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to inspect container {ContainerId}", id);
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpPost("containers/{id}/start")]
    public async Task<IActionResult> StartContainer(string id)
    {
        try
        {
            var success = await _dockerService.StartContainerAsync(id);
            return Ok(new { success, message = "Container started successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to start container {ContainerId}", id);
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost("containers/{id}/stop")]
    public async Task<IActionResult> StopContainer(string id)
    {
        try
        {
            var success = await _dockerService.StopContainerAsync(id);
            return Ok(new { success, message = "Container stopped successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to stop container {ContainerId}", id);
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost("containers/{id}/restart")]
    public async Task<IActionResult> RestartContainer(string id)
    {
        try
        {
            var success = await _dockerService.RestartContainerAsync(id);
            return Ok(new { success, message = "Container restarted successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to restart container {ContainerId}", id);
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpDelete("containers/{id}")]
    public async Task<IActionResult> RemoveContainer(string id, [FromQuery] bool force = false)
    {
        try
        {
            var success = await _dockerService.RemoveContainerAsync(id, force);
            return Ok(new { success, message = "Container removed successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to remove container {ContainerId}", id);
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet("containers/{id}/logs")]
    public async Task<IActionResult> GetContainerLogs(string id, [FromQuery] int tail = 150)
    {
        try
        {
            var logs = await _dockerService.GetContainerLogsAsync(id, tail);
            return Ok(logs);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get logs for container {ContainerId}", id);
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpGet("containers/{id}/stats")]
    public async Task<IActionResult> GetContainerStats(string id)
    {
        try
        {
            var stats = await _dockerService.GetContainerStatsAsync(id);
            return Ok(stats);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get stats for container {ContainerId}", id);
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpGet("images")]
    public async Task<IActionResult> GetImages()
    {
        try
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
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get images");
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpGet("images/{id}/inspect")]
    public async Task<IActionResult> InspectImage(string id)
    {
        try
        {
            var inspect = await _dockerService.InspectImageAsync(id);
            return Ok(inspect);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to inspect image {ImageId}", id);
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpGet("volumes")]
    public async Task<IActionResult> GetVolumes()
    {
        try
        {
            var volumes = await _dockerService.GetVolumesAsync();
            return Ok(volumes.Volumes?.Select(volume => new
            {
                Name = volume.Name,
                Driver = volume.Driver,
                Mountpoint = volume.Mountpoint,
                CreatedAt = volume.CreatedAt
            }) ?? Enumerable.Empty<object>());
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get volumes");
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpGet("volumes/{name}/inspect")]
    public async Task<IActionResult> InspectVolume(string name)
    {
        try
        {
            var inspect = await _dockerService.InspectVolumeAsync(name);
            return Ok(inspect);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to inspect volume {VolumeName}", name);
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpGet("networks")]
    public async Task<IActionResult> GetNetworks()
    {
        try
        {
            var networks = await _dockerService.GetNetworksAsync();
            return Ok(networks.Select(network => new
            {
                Id = network.ID,
                Name = network.Name,
                Driver = network.Driver,
                Scope = network.Scope,
                Containers = network.Containers?.Count ?? 0
            }));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get networks");
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpGet("networks/{id}/inspect")]
    public async Task<IActionResult> InspectNetwork(string id)
    {
        try
        {
            var inspect = await _dockerService.InspectNetworkAsync(id);
            return Ok(inspect);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to inspect network {NetworkId}", id);
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpGet("compose/stacks")]
    public async Task<IActionResult> GetComposeStacks()
    {
        try
        {
            var stacks = await _dockerService.GetComposeStacksAsync();
            return Ok(stacks);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get compose stacks");
            return StatusCode(500, new { error = ex.Message });
        }
    }
}