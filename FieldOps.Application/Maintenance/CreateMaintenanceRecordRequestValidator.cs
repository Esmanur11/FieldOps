using FieldOps.Domain.Interfaces;
using FluentValidation;

namespace FieldOps.Application.Maintenance;

public class CreateMaintenanceRecordRequestValidator : AbstractValidator<CreateMaintenanceRecordRequest>
{
    public CreateMaintenanceRecordRequestValidator(IMachineRepository machineRepository)
    {
        RuleFor(x => x.MachineId)
            .MustAsync(async (machineId, cancellation) => await machineRepository.GetByIdAsync(machineId) is not null)
            .WithMessage("Belirtilen makine bulunamadı.");

        RuleFor(x => x.MaintenanceDate)
            .NotEmpty();

        RuleFor(x => x.Type)
            .NotEmpty()
            .MaximumLength(30);

        RuleFor(x => x.PerformedBy)
            .NotEmpty()
            .MaximumLength(150);

        RuleFor(x => x.Cost)
            .GreaterThanOrEqualTo(0)
            .When(x => x.Cost.HasValue);
    }
}
