namespace ContainerScope.Api.Models;

public class ContainerStatsDto
{
    public double CpuPercent { get; set; }
    public ulong MemoryUsage { get; set; }
    public ulong MemoryLimit { get; set; }
    public double MemoryPercent { get; set; }
    public ulong NetworkRxBytes { get; set; }
    public ulong NetworkTxBytes { get; set; }
    public ulong BlockReadBytes { get; set; }
    public ulong BlockWriteBytes { get; set; }
    public long Pids { get; set; }
}

public class ContainerLogResponse
{
    public string ContainerId { get; set; } = string.Empty;
    public List<string> Lines { get; set; } = new();
}

public class ContainerInspectDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Image { get; set; } = string.Empty;
    public string ImageId { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public bool Running { get; set; }
    public bool Paused { get; set; }
    public bool Restarting { get; set; }
    public int ExitCode { get; set; }
    public DateTime Created { get; set; }
    public DateTime StartedAt { get; set; }
    public DateTime FinishedAt { get; set; }
    public string Platform { get; set; } = string.Empty;
    public string Driver { get; set; } = string.Empty;
    public string Path { get; set; } = string.Empty;
    public List<string> Args { get; set; } = new();
    public List<string> Env { get; set; } = new();
    public string WorkingDir { get; set; } = string.Empty;
    public string RestartPolicy { get; set; } = string.Empty;
    public List<PortMappingDto> Ports { get; set; } = new();
    public List<MountDto> Mounts { get; set; } = new();
    public Dictionary<string, NetworkSettingDto> Networks { get; set; } = new();
}

public class PortMappingDto
{
    public int PrivatePort { get; set; }
    public int? PublicPort { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Ip { get; set; } = string.Empty;
}

public class MountDto
{
    public string Type { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Source { get; set; } = string.Empty;
    public string Destination { get; set; } = string.Empty;
    public string Mode { get; set; } = string.Empty;
    public bool RW { get; set; }
}

public class NetworkSettingDto
{
    public string NetworkId { get; set; } = string.Empty;
    public string IpAddress { get; set; } = string.Empty;
    public string Gateway { get; set; } = string.Empty;
    public string MacAddress { get; set; } = string.Empty;
}

public class ComposeStackDto
{
    public string Name { get; set; } = string.Empty;
    public string WorkingDir { get; set; } = string.Empty;
    public string ConfigFiles { get; set; } = string.Empty;
    public int TotalServices { get; set; }
    public int RunningServices { get; set; }
    public List<ComposeServiceDto> Services { get; set; } = new();
}

public class ComposeServiceDto
{
    public string ContainerId { get; set; } = string.Empty;
    public string ContainerName { get; set; } = string.Empty;
    public string ServiceName { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string Image { get; set; } = string.Empty;
    public List<PortMappingDto> Ports { get; set; } = new();
}
