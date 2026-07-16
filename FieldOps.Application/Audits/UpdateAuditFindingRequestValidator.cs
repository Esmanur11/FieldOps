using FluentValidation;

namespace FieldOps.Application.Audits;

public class UpdateAuditFindingRequestValidator : AbstractValidator<UpdateAuditFindingRequest>
{
    public UpdateAuditFindingRequestValidator()
    {
        RuleFor(x => x.Severity)
            .Must(severity => severity is "low" or "medium" or "high" or "critical")
            .WithMessage("Önem derecesi 'low', 'medium', 'high' veya 'critical' olmalı.");

        RuleFor(x => x.Description)
            .NotEmpty();

        RuleFor(x => x.Category)
            .MaximumLength(50);

        RuleFor(x => x.Status)
            .NotEmpty()
            .MaximumLength(30);
    }
}
