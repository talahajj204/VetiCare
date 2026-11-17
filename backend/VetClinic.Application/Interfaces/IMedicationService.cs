using VetClinic.Application.DTOs;

namespace VetClinic.Application.Interfaces;

public interface IMedicationService
{
    Task<List<MedicationDto>> GetAllAsync(
        int clinicId,
        int? petId = null);

    Task<MedicationDto?> GetByIdAsync(
        int id,
        int clinicId);

    Task<MedicationDto> CreateAsync(
        int clinicId,
        CreateMedicationDto dto);

    Task<MedicationDto?> UpdateAsync(
        int id,
        int clinicId,
        UpdateMedicationDto dto);

    Task<bool> DeleteAsync(
        int id,
        int clinicId);
}