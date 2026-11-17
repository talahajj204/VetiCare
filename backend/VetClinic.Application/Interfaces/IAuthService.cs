using VetClinic.Application.DTOs;

namespace VetClinic.Application.Interfaces;

public interface IAuthService
{
    Task<AuthUserDto?> LoginAsync(LoginDto request);

    Task LogoutAsync();

    Task<AuthUserDto?> GetUserAsync(string userId);
}