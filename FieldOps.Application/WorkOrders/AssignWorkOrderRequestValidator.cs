using FieldOps.Domain.Interfaces;
using FluentValidation;

namespace FieldOps.Application.WorkOrders;

public class AssignWorkOrderRequestValidator : AbstractValidator<AssignWorkOrderRequest>
{
    public AssignWorkOrderRequestValidator(IPersonnelRepository personnelRepository)
    {
        RuleFor(x => x.AssignedTo)
            .MustAsync(async (assignedTo, cancellation) => await personnelRepository.GetByIdAsync(assignedTo!.Value) is not null)
            .When(x => x.AssignedTo.HasValue)
            .WithMessage("Belirtilen personel bulunamadı.");
    }
}
