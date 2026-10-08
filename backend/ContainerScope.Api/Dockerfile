# Multi-stage build for ASP.NET Core Web API
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ["ContainerScope.Api.csproj", "./"]
RUN dotnet restore "ContainerScope.Api.csproj"

COPY . .
RUN dotnet publish "ContainerScope.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:5000
ENV ASPNETCORE_ENVIRONMENT=Production

EXPOSE 5000

ENTRYPOINT ["dotnet", "ContainerScope.Api.dll"]
