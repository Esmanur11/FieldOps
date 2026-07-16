using FluentValidation;

namespace FieldOps.Application.Materials;

public class CreateMaterialRequestValidator : AbstractValidator<CreateMaterialRequest>
{
    public CreateMaterialRequestValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .MaximumLength(150);

        RuleFor(x => x.Unit)
            .NotEmpty()
            .MaximumLength(20);

        RuleFor(x => x.UnitCost)
            .GreaterThanOrEqualTo(0)
            .When(x => x.UnitCost.HasValue);
    }
}