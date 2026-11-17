using VetClinic.Core.Entities;

namespace VetClinic.Core.Interfaces;

public interface IMedicationRepository
{
    Task<List<Medication>> GetAllAsync(
        int clinicId,
        int? petId = null);

    Task<Medication?> GetByIdAsync(
        int id,
        int clinicId);

    Task<Medication> AddAsync(
        Medication medication);

    Task UpdateAsync(
        Medication medication);

    Task DeleteAsync(
        Medication medication);
}