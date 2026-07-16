using FieldOps.Domain.Interfaces;
using FluentValidation;

namespace FieldOps.Application.Maintenance;

public class CreateMachineUsageLogRequestValidator : AbstractValidator<CreateMachineUsageLogRequest>
{
    public CreateMachineUsageLogRequestValidator(
        IMachineRepository machineRepository,
        IPersonnelRepository personnelRepository)
    {
        RuleFor(x => x.MachineId)
            .MustAsync(async (machineId, cancellation) => await machineRepository.GetByIdAsync(machineId) is not null)
            .WithMessage("Belirtilen makine bulunamadı.");

        RuleFor(x => x.LogDate)
            .NotEmpty();

        RuleFor(x => x.HoursUsed)
            .GreaterThan(0)
            .WithMessage("Kullanım saati 0'dan büyük olmalı.");

        RuleFor(x => x.FuelConsumed)
            .GreaterThanOrEqualTo(0)
            .When(x => x.FuelConsumed.HasValue);

        RuleFor(x => x.OperatorId)
            .MustAsync(async (operatorId, cancellation) => await personnelRepository.GetByIdAsync(operatorId) is not null)
            .WithMessage("Belirtilen operatör bulunamadı.");
    }
}
