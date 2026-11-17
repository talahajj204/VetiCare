using VetClinic.Application.DTOs;

namespace VetClinic.Application.Interfaces;

public interface IVaccinationService
{
    Task<List<VaccinationDto>> GetAllAsync(
        int clinicId,
        int? petId = null);

    Task<VaccinationDto?> GetByIdAsync(
        int id,
        int clinicId);

    Task<VaccinationDto> CreateAsync(
        int clinicId,
        CreateVaccinationDto dto);

    Task<VaccinationDto?> UpdateAsync(
        int id,
        int clinicId,
        UpdateVaccinationDto dto);

    Task<bool> DeleteAsync(
        int id,
        int clinicId);
}