using VetClinic.Core.Entities;

namespace VetClinic.Core.Interfaces;

public interface IPrescriptionRepository
{
    Task<List<Prescription>> GetAllAsync(
        int clinicId,
        int? petId = null);

    Task<Prescription?> GetByIdAsync(
        int id,
        int clinicId);

    Task<Prescription> AddAsync(
        Prescription prescription);

    Task UpdateAsync(
        Prescription prescription);

    Task DeleteAsync(
        Prescription prescription);
}