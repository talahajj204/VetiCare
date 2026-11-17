using VetClinic.Core.Entities;

namespace VetClinic.Core.Interfaces;

public interface IVaccinationRepository
{
    Task<List<Vaccination>> GetAllAsync(
        int clinicId,
        int? petId = null);

    Task<Vaccination?> GetByIdAsync(
        int id,
        int clinicId);

    Task<Vaccination> AddAsync(
        Vaccination vaccination);

    Task UpdateAsync(
        Vaccination vaccination);

    Task DeleteAsync(
        Vaccination vaccination);
}