using ContainerScope.Api.Models;
using Docker.DotNet;
using Docker.DotNet.Models;
using System.Text;

namespace ContainerScope.Api.Services;

public class DockerService : IDockerService
{
    private readonly DockerClient _client;

    public DockerService(DockerClient client)
    {
        _client = client;
    }

    public async Task<IList<ContainerListResponse>> GetContainersAsync()
    {
        return await _client.Containers.ListContainersAsync(new ContainersListParameters
        {
            All = true
        });
    }

    public async Task<ContainerInspectDto> InspectContainerAsync(string id)
    {
        var response = await _client.Containers.InspectContainerAsync(id);

        var ports = new List<PortMappingDto>();
        if (response.NetworkSettings?.Ports != null)
        {
            foreach (var kvp in response.NetworkSettings.Ports)
            {
                var parts = kvp.Key.Split('/');
                var privatePort = int.TryParse(parts[0], out var p) ? p : 0;
                var type = parts.Length > 1 ? parts[1] : "tcp";

                if (kvp.Value != null && kvp.Value.Count > 0)
                {
                    foreach (var binding in kvp.Value)
                    {
                        ports.Add(new PortMappingDto
                        {
                            PrivatePort = privatePort,
                            PublicPort = int.TryParse(binding.HostPort, out var hp) ? hp : null,
                            Type = type,
                            Ip = binding.HostIP
                        });
                    }
                }
                else
                {
                    ports.Add(new PortMappingDto
                    {
                        PrivatePort = privatePort,
                        Type = type
                    });
                }
            }
        }

        var mounts = response.Mounts?.Select(m => new MountDto
        {
            Type = m.Type,
            Name = m.Name,
            Source = m.Source,
            Destination = m.Destination,
            Mode = m.Mode,
            RW = m.RW
        }).ToList() ?? new List<MountDto>();

        var networks = new Dictionary<string, NetworkSettingDto>();
        if (response.NetworkSettings?.Networks != null)
        {
            foreach (var net in response.NetworkSettings.Networks)
            {
                networks[net.Key] = new NetworkSettingDto
                {
                    NetworkId = net.Value.NetworkID,
                    IpAddress = net.Value.IPAddress,
                    Gateway = net.Value.Gateway,
                    MacAddress = net.Value.MacAddress
                };
            }
        }

        return new ContainerInspectDto
        {
            Id = response.ID,
            Name = response.Name?.TrimStart('/') ?? string.Empty,
            Image = response.Config?.Image ?? string.Empty,
            ImageId = response.Image ?? string.Empty,
            State = response.State?.Status ?? "unknown",
            Status = response.State?.Status ?? "unknown",
            Running = response.State?.Running ?? false,
            Paused = response.State?.Paused ?? false,
            Restarting = response.State?.Restarting ?? false,
            ExitCode = (int)(response.State?.ExitCode ?? 0),
            Created = response.Created,
            StartedAt = DateTime.TryParse(response.State?.StartedAt, out var st) ? st : DateTime.MinValue,
            FinishedAt = DateTime.TryParse(response.State?.FinishedAt, out var ft) ? ft : DateTime.MinValue,
            Platform = response.Platform ?? string.Empty,
            Driver = response.Driver ?? string.Empty,
            Path = response.Path ?? string.Empty,
            Args = response.Args?.ToList() ?? new List<string>(),
            Env = response.Config?.Env?.ToList() ?? new List<string>(),
            WorkingDir = response.Config?.WorkingDir ?? string.Empty,
            RestartPolicy = response.HostConfig?.RestartPolicy?.Name.ToString() ?? "no",
            Ports = ports,
            Mounts = mounts,
            Networks = networks
        };
    }

    public async Task<bool> StartContainerAsync(string id)
    {
        return await _client.Containers.StartContainerAsync(id, new ContainerStartParameters());
    }

    public async Task<bool> StopContainerAsync(string id)
    {
        return await _client.Containers.StopContainerAsync(id, new ContainerStopParameters
        {
            WaitBeforeKillSeconds = 5
        });
    }

    public async Task<bool> RestartContainerAsync(string id)
    {
        await _client.Containers.RestartContainerAsync(id, new ContainerRestartParameters
        {
            WaitBeforeKillSeconds = 5
        });
        return true;
    }

    public async Task<bool> RemoveContainerAsync(string id, bool force = false)
    {
        await _client.Containers.RemoveContainerAsync(id, new ContainerRemoveParameters
        {
            Force = force,
            RemoveVolumes = true
        });
        return true;
    }

    public async Task<ContainerLogResponse> GetContainerLogsAsync(string id, int tail = 150)
    {
        var logResponse = new ContainerLogResponse { ContainerId = id };

        try
        {
            using var stream = await _client.Containers.GetContainerLogsAsync(id, false, new ContainerLogsParameters
            {
                ShowStdout = true,
                ShowStderr = true,
                Timestamps = true,
                Tail = tail.ToString()
            });

            var (stdout, stderr) = await stream.ReadOutputToEndAsync(CancellationToken.None);

            var rawLines = new List<string>();
            if (!string.IsNullOrEmpty(stdout))
                rawLines.AddRange(stdout.Split(new[] { "\r\n", "\r", "\n" }, StringSplitOptions.RemoveEmptyEntries));
            if (!string.IsNullOrEmpty(stderr))
                rawLines.AddRange(stderr.Split(new[] { "\r\n", "\r", "\n" }, StringSplitOptions.RemoveEmptyEntries));

            logResponse.Lines = rawLines;
        }
        catch (Exception ex)
        {
            logResponse.Lines.Add($"[Error reading logs: {ex.Message}]");
        }

        return logResponse;
    }

    public async Task<ContainerStatsDto> GetContainerStatsAsync(string id)
    {
        var statsDto = new ContainerStatsDto();
        var tcs = new TaskCompletionSource<ContainerStatsResponse>();

        var progress = new Progress<ContainerStatsResponse>(s =>
        {
            tcs.TrySetResult(s);
        });

        using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(3));

        try
        {
            var statsTask = _client.Containers.GetContainerStatsAsync(id, new ContainerStatsParameters
            {
                Stream = false
            }, progress, cts.Token);

            var stats = await tcs.Task;

            // Calculate CPU Percentage
            var cpuDelta = (double)(stats.CPUStats.CPUUsage.TotalUsage - stats.PreCPUStats.CPUUsage.TotalUsage);
            var systemDelta = (double)(stats.CPUStats.SystemUsage - stats.PreCPUStats.SystemUsage);
            var numCpus = stats.CPUStats.OnlineCPUs > 0
                ? (double)stats.CPUStats.OnlineCPUs
                : (stats.CPUStats.CPUUsage.PercpuUsage?.Count > 0 ? (double)stats.CPUStats.CPUUsage.PercpuUsage.Count : 1.0);

            if (systemDelta > 0.0 && cpuDelta > 0.0)
            {
                statsDto.CpuPercent = Math.Round((cpuDelta / systemDelta) * numCpus * 100.0, 2);
            }

            // Memory Usage
            statsDto.MemoryUsage = stats.MemoryStats.Usage;
            statsDto.MemoryLimit = stats.MemoryStats.Limit;
            if (stats.MemoryStats.Limit > 0)
            {
                statsDto.MemoryPercent = Math.Round(((double)stats.MemoryStats.Usage / stats.MemoryStats.Limit) * 100.0, 2);
            }

            // Network I/O
            if (stats.Networks != null)
            {
                foreach (var net in stats.Networks.Values)
                {
                    statsDto.NetworkRxBytes += net.RxBytes;
                    statsDto.NetworkTxBytes += net.TxBytes;
                }
            }

            statsDto.Pids = (long)stats.PidsStats.Current;
        }
        catch
        {
            // Container may be stopped or stats not available
        }

        return statsDto;
    }

    public async Task<IList<ImagesListResponse>> GetImagesAsync()
    {
        return await _client.Images.ListImagesAsync(new ImagesListParameters
        {
            All = true
        });
    }

    public async Task<ImageInspectResponse> InspectImageAsync(string id)
    {
        return await _client.Images.InspectImageAsync(id);
    }

    public async Task<VolumesListResponse> GetVolumesAsync()
    {
        return await _client.Volumes.ListAsync();
    }

    public async Task<VolumeResponse> InspectVolumeAsync(string name)
    {
        return await _client.Volumes.InspectAsync(name);
    }

    public async Task<IList<NetworkResponse>> GetNetworksAsync()
    {
        return await _client.Networks.ListNetworksAsync();
    }

    public async Task<NetworkResponse> InspectNetworkAsync(string id)
    {
        return await _client.Networks.InspectNetworkAsync(id);
    }

    public async Task<List<ComposeStackDto>> GetComposeStacksAsync()
    {
        var containers = await GetContainersAsync();
        var stacksDict = new Dictionary<string, ComposeStackDto>(StringComparer.OrdinalIgnoreCase);

        foreach (var container in containers)
        {
            if (container.Labels != null && container.Labels.TryGetValue("com.docker.compose.project", out var projectName))
            {
                if (!stacksDict.TryGetValue(projectName, out var stack))
                {
                    container.Labels.TryGetValue("com.docker.compose.project.working_dir", out var workDir);
                    container.Labels.TryGetValue("com.docker.compose.project.config_files", out var configFiles);

                    stack = new ComposeStackDto
                    {
                        Name = projectName,
                        WorkingDir = workDir ?? string.Empty,
                        ConfigFiles = configFiles ?? string.Empty,
                        Services = new List<ComposeServiceDto>()
                    };
                    stacksDict[projectName] = stack;
                }

                container.Labels.TryGetValue("com.docker.compose.service", out var serviceName);

                var ports = container.Ports?.Select(p => new PortMappingDto
                {
                    PrivatePort = p.PrivatePort,
                    PublicPort = p.PublicPort > 0 ? (int?)p.PublicPort : null,
                    Type = p.Type,
                    Ip = p.IP
                }).ToList() ?? new List<PortMappingDto>();

                stack.Services.Add(new ComposeServiceDto
                {
                    ContainerId = container.ID[..Math.Min(12, container.ID.Length)],
                    ContainerName = container.Names?.FirstOrDefault()?.TrimStart('/') ?? "unnamed",
                    ServiceName = serviceName ?? "default",
                    State = container.State,
                    Status = container.Status,
                    Image = container.Image,
                    Ports = ports
                });

                stack.TotalServices = stack.Services.Count;
                stack.RunningServices = stack.Services.Count(s => s.State == "running");
            }
        }

        return stacksDict.Values.OrderBy(s => s.Name).ToList();
    }
}
