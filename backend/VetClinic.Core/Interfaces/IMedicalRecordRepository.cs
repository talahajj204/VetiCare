using VetClinic.Core.Entities;

namespace VetClinic.Core.Interfaces;

public interface IMedicalRecordRepository
{
    Task<List<MedicalRecord>> GetAllAsync(
        int clinicId,
        int? petId = null);

    Task<MedicalRecord?> GetByIdAsync(
        int id,
        int clinicId);

    Task<MedicalRecord> AddAsync(MedicalRecord record);

    Task UpdateAsync(MedicalRecord record);

    Task DeleteAsync(MedicalRecord record);
}