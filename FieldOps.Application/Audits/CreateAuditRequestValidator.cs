using FieldOps.Domain.Interfaces;
using FluentValidation;

namespace FieldOps.Application.Audits;

public class CreateAuditRequestValidator : AbstractValidator<CreateAuditRequest>
{
    public CreateAuditRequestValidator(ISiteRepository siteRepository, IPersonnelRepository personnelRepository)
    {
        RuleFor(x => x.SiteId)
            .MustAsync(async (siteId, cancellation) => await siteRepository.GetByIdAsync(siteId) is not null)
            .WithMessage("Belirtilen şantiye bulunamadı.");

        RuleFor(x => x.InspectorId)
            .MustAsync(async (inspectorId, cancellation) => await personnelRepository.GetByIdAsync(inspectorId) is not null)
            .WithMessage("Belirtilen denetçi bulunamadı.");

        RuleFor(x => x.AuditDate)
            .NotEmpty();

        RuleFor(x => x.Type)
            .NotEmpty()
            .MaximumLength(50);

        RuleFor(x => x.Status)
            .NotEmpty()
            .MaximumLength(30);
    }
}
