using FieldOps.Domain.Interfaces;
using FluentValidation;

namespace FieldOps.Application.Shifts;

public class CreateShiftRequestValidator : AbstractValidator<CreateShiftRequest>
{
    public CreateShiftRequestValidator(ISiteRepository siteRepository)
    {
        RuleFor(x => x.SiteId)
            .MustAsync(async (siteId, cancellation) => await siteRepository.GetByIdAsync(siteId) is not null)
            .WithMessage("Belirtilen şantiye bulunamadı.");

        RuleFor(x => x.Name)
            .NotEmpty()
            .MaximumLength(50);

        // Night shifts (EndTime < StartTime) are valid; only a zero-duration shift is rejected.
        RuleFor(x => x.EndTime)
            .NotEqual(x => x.StartTime)
            .WithMessage("Başlangıç ve bitiş saati aynı olamaz.");
    }
}
