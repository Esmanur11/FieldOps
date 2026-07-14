using FieldOps.Domain.Entities;
using FieldOps.Domain.Interfaces;

namespace FieldOps.Application.Machines;

public class MachineService
{
    private readonly IMachineRepository _repository;

    public MachineService(IMachineRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<MachineDto>> GetAllAsync()
    {
        var machines = await _repository.GetAllAsync();
        return machines.Select(ToDto);
    }

    public async Task<IEnumerable<MachineDto>> GetBySiteIdAsync(int siteId)
    {
        var machines = await _repository.GetBySiteIdAsync(siteId);
        return machines.Select(ToDto);
    }

    public async Task<MachineDto?> GetByIdAsync(int id)
    {
        var machine = await _repository.GetByIdAsync(id);
        return machine is null ? null : ToDto(machine);
    }

    public async Task<int> CreateAsync(CreateMachineRequest request)
    {
        var machine = new Machine
        {
            SiteId = request.SiteId,
            Name = request.Name,
            Type = request.Type,
            SerialNumber = request.SerialNumber,
            PurchaseDate = request.PurchaseDate,
            Status = request.Status
        };

        return await _repository.AddAsync(machine);
    }

    public async Task<bool> UpdateAsync(int id, CreateMachineRequest request)
    {
        var existing = await _repository.GetByIdAsync(id);
        if (existing is null)
        {
            return false;
        }

        existing.SiteId = request.SiteId;
        existing.Name = request.Name;
        existing.Type = request.Type;
        existing.SerialNumber = request.SerialNumber;
        existing.PurchaseDate = request.PurchaseDate;
        existing.Status = request.Status;

        await _repository.UpdateAsync(existing);
        return true;
    }

    private static MachineDto ToDto(Machine machine) => new()
    {
        Id = machine.Id,
        SiteId = machine.SiteId,
        Name = machine.Name,
        Type = machine.Type,
        SerialNumber = machine.SerialNumber,
        PurchaseDate = machine.PurchaseDate,
        Status = machine.Status
    };
}
