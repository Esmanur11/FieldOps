using FieldOps.Domain.Interfaces;
using FluentValidation;

namespace FieldOps.Application.Users;

public class CreateUserRequestValidator : AbstractValidator<CreateUserRequest>
{
    public CreateUserRequestValidator(IUserRepository userRepository, IPersonnelRepository personnelRepository)
    {
        RuleFor(x => x.Username)
            .NotEmpty()
            .MaximumLength(100)
            .MustAsync(async (username, cancellation) => await userRepository.GetByUsernameAsync(username) is null)
            .WithMessage("Bu kullanıcı adı zaten kullanılıyor.");

        RuleFor(x => x.Password)
            .NotEmpty()
            .MinimumLength(12)
            .WithMessage("Şifre en az 12 karakter olmalı.")
            .Matches("[A-Z]")
            .WithMessage("Şifre en az bir büyük harf içermeli.")
            .Matches("[a-z]")
            .WithMessage("Şifre en az bir küçük harf içermeli.")
            .Matches("[0-9]")
            .WithMessage("Şifre en az bir rakam içermeli.")
            .Matches("[^a-zA-Z0-9]")
            .WithMessage("Şifre en az bir özel karakter içermeli.");

        RuleFor(x => x.Role)
            .Must(role => role is "Admin" or "User")
            .WithMessage("Rol 'Admin' veya 'User' olmalı.");

        RuleFor(x => x.PersonnelId)
            .MustAsync(async (personnelId, cancellation) => await personnelRepository.GetByIdAsync(personnelId) is not null)
            .WithMessage("Belirtilen personel bulunamadı.");

        RuleFor(x => x.PersonnelId)
            .MustAsync(async (personnelId, cancellation) => !await userRepository.ExistsForPersonnelAsync(personnelId))
            .WithMessage("Bu personelin zaten bir hesabı var.");
    }
}
