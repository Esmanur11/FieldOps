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

        RuleFor(x => x.Latitude)
            .InclusiveBetween(-90, 90)
            .When(x => x.Latitude.HasValue);

        RuleFor(x => x.Longitude)
            .InclusiveBetween(-180, 180)
            .When(x => x.Longitude.HasValue);

        RuleFor(x => x.CompletionPercentage)
            .InclusiveBetween(0, 100);
    }
}
