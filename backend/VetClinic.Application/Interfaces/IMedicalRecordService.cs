using VetClinic.Application.DTOs;

namespace VetClinic.Application.Interfaces;

public interface IMedicalRecordService
{
    Task<List<MedicalRecordDto>> GetAllAsync(
        int clinicId,
        int? petId = null);

    Task<MedicalRecordDto?> GetByIdAsync(
        int id,
        int clinicId);

    Task<MedicalRecordDto> CreateAsync(
        int clinicId,
        CreateMedicalRecordDto dto);

    Task<MedicalRecordDto?> UpdateAsync(
        int id,
        int clinicId,
        UpdateMedicalRecordDto dto);

    Task<bool> DeleteAsync(
        int id,
        int clinicId);
}