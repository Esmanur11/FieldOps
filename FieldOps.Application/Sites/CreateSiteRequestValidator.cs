using FluentValidation;

namespace FieldOps.Application.Sites;

public class CreateSiteRequestValidator : AbstractValidator<CreateSiteRequest>
{
    public CreateSiteRequestValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .MaximumLength(150);

        RuleFor(x => x.Location)
            .MaximumLength(250);

        RuleFor(x => x.StartDate)
            .NotEmpty();

        RuleFor(x => x.Status)
            .NotEmpty()
            .MaximumLength(30);
    }
}
