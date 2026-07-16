using FieldOps.Domain.Interfaces;
using FluentValidation;

namespace FieldOps.Application.Audits;

public class CreateAuditFindingRequestValidator : AbstractValidator<CreateAuditFindingRequest>
{
    public CreateAuditFindingRequestValidator(IAuditRepository auditRepository)
    {
        RuleFor(x => x.AuditId)
            .MustAsync(async (auditId, cancellation) => await auditRepository.GetByIdAsync(auditId) is not null)
            .WithMessage("Belirtilen denetim bulunamadı.");

        RuleFor(x => x.Severity)
            .Must(severity => severity is "low" or "medium" or "high" or "critical")
            .WithMessage("Önem derecesi 'low', 'medium', 'high' veya 'critical' olmalı.");

        RuleFor(x => x.Description)
            .NotEmpty();

        RuleFor(x => x.Category)
            .MaximumLength(50);
    }
}
