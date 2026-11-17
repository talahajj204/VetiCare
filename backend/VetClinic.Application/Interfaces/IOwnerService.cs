using VetClinic.Application.DTOs;

namespace VetClinic.Application.Interfaces;

public interface IOwnerService
{
    Task<List<OwnerDto>> GetAllAsync(int clinicId);

    Task<OwnerDto?> GetByIdAsync(int id, int clinicId);

    Task<OwnerDto> CreateAsync(
        int clinicId,
        CreateOwnerDto dto);

    Task<OwnerDto?> UpdateAsync(
        int id,
        int clinicId,
        UpdateOwnerDto dto);

    Task<bool> DeleteAsync(int id, int clinicId);
}