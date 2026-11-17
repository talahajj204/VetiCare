using VetClinic.Application.DTOs;

namespace VetClinic.Application.Interfaces;

public interface IStoreSettingsService
{
    Task<StoreSettingsDto> GetAsync(int clinicId);

    Task<StoreSettingsDto> UpdateAsync(
        int clinicId,
        UpdateStoreSettingsDto dto);
}