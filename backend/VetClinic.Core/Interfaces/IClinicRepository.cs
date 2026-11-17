using VetClinic.Core.Entities;

namespace VetClinic.Core.Interfaces;

public interface IClinicRepository
{
    Task<List<Clinic>> GetAllAsync();

    Task<Clinic?> GetByIdAsync(int id);

    Task<Clinic> AddAsync(Clinic clinic);

    Task UpdateAsync(Clinic clinic);
}