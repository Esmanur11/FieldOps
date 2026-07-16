using FieldOps.Domain.Interfaces;
using FluentValidation;

namespace FieldOps.Application.WorkOrders;

public class CreateWorkOrderRequestValidator : AbstractValidator<CreateWorkOrderRequest>
{
    public CreateWorkOrderRequestValidator(ISiteRepository siteRepository, IPersonnelRepository personnelRepository)
    {
        RuleFor(x => x.SiteId)
            .MustAsync(async (siteId, cancellation) => await siteRepository.GetByIdAsync(siteId) is not null)
            .WithMessage("Belirtilen şantiye bulunamadı.");

        RuleFor(x => x.Title)
            .NotEmpty()
            .MaximumLength(200);

        RuleFor(x => x.Priority)
            .Must(priority => priority is "low" or "medium" or "high" or "critical")
            .WithMessage("Öncelik 'low', 'medium', 'high' veya 'critical' olmalı.");

        RuleFor(x => x.AssignedTo)
            .MustAsync(async (assignedTo, cancellation) => await personnelRepository.GetByIdAsync(assignedTo!.Value) is not null)
            .When(x => x.AssignedTo.HasValue)
            .WithMessage("Belirtilen personel bulunamadı.");
    }
}
