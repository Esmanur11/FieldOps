using FieldOps.Domain.Entities;
using FieldOps.Domain.Interfaces;

namespace FieldOps.Application.Materials;

public class MaterialService
{
    private readonly IMaterialRepository _repository;

    public MaterialService(IMaterialRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<MaterialDto>> GetAllAsync()
    {
        var materials = await _repository.GetAllAsync();
        return materials.Select(ToDto);
    }

    public async Task<MaterialDto?> GetByIdAsync(int id)
    {
        var material = await _repository.GetByIdAsync(id);
        return material is null ? null : ToDto(material);
    }

    public async Task<int> CreateAsync(CreateMaterialRequest request)
    {
        var material = new Material
        {
            Name = request.Name,
            Unit = request.Unit,
            UnitCost = request.UnitCost
        };

        return await _repository.AddAsync(material);
    }

    private static MaterialDto ToDto(Material material) => new()
    {
        Id = material.Id,
        Name = material.Name,
        Unit = material.Unit,
        UnitCost = material.UnitCost
    };
}