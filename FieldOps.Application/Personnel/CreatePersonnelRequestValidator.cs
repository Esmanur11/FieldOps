using FieldOps.Domain.Interfaces;
using FluentValidation;

namespace FieldOps.Application.Personnel;

public class CreatePersonnelRequestValidator : AbstractValidator<CreatePersonnelRequest>
{
    public CreatePersonnelRequestValidator(ISiteRepository siteRepository)
    {
        RuleFor(x => x.FullName)
            .NotEmpty()
            .MaximumLength(150);

        RuleFor(x => x.Role)
            .NotEmpty()
            .MaximumLength(50);

        RuleFor(x => x.Phone)
            .MaximumLength(20);

        RuleFor(x => x.HireDate)
            .NotEmpty();

        RuleFor(x => x.Status)
            .NotEmpty()
            .MaximumLength(30);

        RuleFor(x => x.SiteId)
            .GreaterThan(0)
            .MustAsync(async (siteId, cancellation) => await siteRepository.GetByIdAsync(siteId) is not null)
            .WithMessage("Belirtilen şantiye bulunamadı.");
    }
}
