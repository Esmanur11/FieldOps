using FieldOps.Domain.Entities;
using FieldOps.Domain.Interfaces;

namespace FieldOps.Application.Sites;

public class SiteService
{
    private readonly ISiteRepository _repository;

    public SiteService(ISiteRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<SiteDto>> GetAllAsync()
    {
        var sites = await _repository.GetAllAsync();
        return sites.Select(ToDto);
    }

    public async Task<SiteDto?> GetByIdAsync(int id)
    {
        var site = await _repository.GetByIdAsync(id);
        return site is null ? null : ToDto(site);
    }

    public async Task<int> CreateAsync(CreateSiteRequest request)
    {
        var site = new Site
        {
            Name = request.Name,
            Location = request.Location,
            StartDate = request.StartDate,
            Status = request.Status,
            Latitude = request.Latitude,
            Longitude = request.Longitude,
            CompletionPercentage = request.CompletionPercentage
        };

        return await _repository.AddAsync(site);
    }

    public async Task<bool> UpdateAsync(int id, CreateSiteRequest request)
    {
        var existing = await _repository.GetByIdAsync(id);
        if (existing is null)
        {
            return false;
        }

        existing.Name = request.Name;
        existing.Location = request.Location;
        existing.StartDate = request.StartDate;
        existing.Status = request.Status;
        existing.Latitude = request.Latitude;
        existing.Longitude = request.Longitude;
        existing.CompletionPercentage = request.CompletionPercentage;

        await _repository.UpdateAsync(existing);
        return true;
    }

    private static SiteDto ToDto(Site site) => new()
    {
        Id = site.Id,
        Name = site.Name,
        Location = site.Location,
        StartDate = site.StartDate,
        Status = site.Status,
        Latitude = site.Latitude,
        Longitude = site.Longitude,
        CompletionPercentage = site.CompletionPercentage
    };
}
