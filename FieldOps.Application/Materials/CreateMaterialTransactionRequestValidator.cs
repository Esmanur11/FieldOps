using FieldOps.Domain.Interfaces;
using FluentValidation;

namespace FieldOps.Application.Materials;

public class CreateMaterialTransactionRequestValidator : AbstractValidator<CreateMaterialTransactionRequest>
{
    public CreateMaterialTransactionRequestValidator(
        ISiteRepository siteRepository,
        IMaterialRepository materialRepository,
        IPersonnelRepository personnelRepository)
    {
        RuleFor(x => x.SiteId)
            .MustAsync(async (siteId, cancellation) => await siteRepository.GetByIdAsync(siteId) is not null)
            .WithMessage("Belirtilen şantiye bulunamadı.");

        RuleFor(x => x.MaterialId)
            .MustAsync(async (materialId, cancellation) => await materialRepository.GetByIdAsync(materialId) is not null)
            .WithMessage("Belirtilen malzeme bulunamadı.");

        RuleFor(x => x.TransactionType)
            .Must(type => type is "in" or "out")
            .WithMessage("İşlem tipi 'in' veya 'out' olmalı.");

        RuleFor(x => x.Quantity)
            .GreaterThan(0)
            .WithMessage("Miktar 0'dan büyük olmalı.");

        RuleFor(x => x.PerformedBy)
            .MustAsync(async (personnelId, cancellation) => await personnelRepository.GetByIdAsync(personnelId) is not null)
            .WithMessage("Belirtilen personel bulunamadı.");
    }
}