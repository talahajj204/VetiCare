using VetClinic.Application.DTOs;

namespace VetClinic.Application.Interfaces;

public interface IPetService
{
    Task<List<PetDto>> GetAllAsync(int clinicId);

    Task<PetDto?> GetByIdAsync(
        int id,
        int clinicId);

    Task<PetDto> CreateAsync(
        int clinicId,
        CreatePetDto dto);

    Task<PetDto?> UpdateAsync(
        int id,
        int clinicId,
        UpdatePetDto dto);

    Task<bool> DeleteAsync(
        int id,
        int clinicId);
}