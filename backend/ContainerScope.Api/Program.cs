using ContainerScope.Api.Services;
using Docker.DotNet;
using System.Runtime.InteropServices;

var builder = WebApplication.CreateBuilder(args);

// Configure Cross-Platform Docker Client Configuration
static Uri GetDockerUri()
{
    var customHost = Environment.GetEnvironmentVariable("DOCKER_HOST");
    if (!string.IsNullOrWhiteSpace(customHost))
    {
        return new Uri(customHost);
    }

    if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
    {
        return new Uri("npipe://./pipe/docker_engine");
    }

    return new Uri("unix:///var/run/docker.sock");
}

builder.Services.AddSingleton(
    new DockerClientConfiguration(GetDockerUri())
        .CreateClient());

builder.Services.AddScoped<IDockerService, DockerService>();

// CORS for Vite local dev
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");
app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();
