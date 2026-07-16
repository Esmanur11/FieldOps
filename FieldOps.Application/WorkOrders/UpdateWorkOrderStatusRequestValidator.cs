using FluentValidation;

namespace FieldOps.Application.WorkOrders;

public class UpdateWorkOrderStatusRequestValidator : AbstractValidator<UpdateWorkOrderStatusRequest>
{
    public UpdateWorkOrderStatusRequestValidator()
    {
        RuleFor(x => x.Status)
            .Must(status => status is "open" or "in_progress" or "completed" or "cancelled")
            .WithMessage("Durum 'open', 'in_progress', 'completed' veya 'cancelled' olmalı.");
    }
}
