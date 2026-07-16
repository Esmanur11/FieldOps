using FieldOps.Domain.Interfaces;
using FluentValidation;

namespace FieldOps.Application.Shifts;

public class CreateShiftAssignmentRequestValidator : AbstractValidator<CreateShiftAssignmentRequest>
{
    public CreateShiftAssignmentRequestValidator(IShiftRepository shiftRepository, IPersonnelRepository personnelRepository)
    {
        RuleFor(x => x.ShiftId)
            .MustAsync(async (shiftId, cancellation) => await shiftRepository.GetByIdAsync(shiftId) is not null)
            .WithMessage("Belirtilen vardiya bulunamadı.");

        RuleFor(x => x.PersonnelId)
            .MustAsync(async (personnelId, cancellation) => await personnelRepository.GetByIdAsync(personnelId) is not null)
            .WithMessage("Belirtilen personel bulunamadı.");

        RuleFor(x => x.WorkDate)
            .NotEmpty();
    }
}
