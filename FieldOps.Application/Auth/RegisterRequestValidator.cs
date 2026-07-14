using FieldOps.Domain.Interfaces;
using FluentValidation;

namespace FieldOps.Application.Auth;

public class RegisterRequestValidator : AbstractValidator<RegisterRequest>
{
    public RegisterRequestValidator(IUserRepository userRepository, IPersonnelRepository personnelRepository)
    {
        RuleFor(x => x.Username)
            .NotEmpty()
            .MaximumLength(100)
            .MustAsync(async (username, cancellation) => await userRepository.GetByUsernameAsync(username) is null)
            .WithMessage("Bu kullanıcı adı zaten kullanılıyor.");

        RuleFor(x => x.Password)
            .NotEmpty()
            .MinimumLength(8)
            .WithMessage("Şifre en az 8 karakter olmalı.");

        RuleFor(x => x.Role)
            .NotEmpty()
            .MaximumLength(30);

        RuleFor(x => x.PersonnelId)
            .MustAsync(async (personnelId, cancellation) => await personnelRepository.GetByIdAsync(personnelId!.Value) is not null)
            .When(x => x.PersonnelId.HasValue)
            .WithMessage("Belirtilen personel bulunamadı.");
    }
}
