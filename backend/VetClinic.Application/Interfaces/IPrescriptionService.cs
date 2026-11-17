using VetClinic.Application.DTOs;

namespace VetClinic.Application.Interfaces;

public interface IPrescriptionService
{
    Task<List<PrescriptionDto>> GetAllAsync(
        int clinicId,
        int? petId = null);

    Task<PrescriptionDto?> GetByIdAsync(
        int id,
        int clinicId);

    Task<PrescriptionDto> CreateAsync(
        int clinicId,
        CreatePrescriptionDto dto);

    Task<PrescriptionDto?> UpdateAsync(
        int id,
        int clinicId,
        UpdatePrescriptionDto dto);

    Task<bool> DeleteAsync(
        int id,
        int clinicId);
}