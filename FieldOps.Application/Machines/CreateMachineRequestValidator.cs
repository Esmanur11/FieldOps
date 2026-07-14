using FieldOps.Domain.Interfaces;
using FluentValidation;

namespace FieldOps.Application.Machines;

public class CreateMachineRequestValidator : AbstractValidator<CreateMachineRequest>
{
    public CreateMachineRequestValidator(ISiteRepository siteRepository)
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .MaximumLength(100);

        RuleFor(x => x.Type)
            .NotEmpty()
            .MaximumLength(50);

        RuleFor(x => x.SerialNumber)
            .MaximumLength(100);

        RuleFor(x => x.Status)
            .NotEmpty()
            .MaximumLength(30);

        RuleFor(x => x.SiteId)
            .GreaterThan(0)
            .MustAsync(async (siteId, cancellation) => await siteRepository.GetByIdAsync(siteId) is not null)
            .WithMessage("Belirtilen şantiye bulunamadı.");
    }
}
