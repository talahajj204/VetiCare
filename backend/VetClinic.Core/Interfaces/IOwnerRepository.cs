using VetClinic.Core.Entities;

namespace VetClinic.Core.Interfaces;

public interface IOwnerRepository
{
    Task<List<Owner>> GetAllAsync(int clinicId);

    Task<Owner?> GetByIdAsync(int id, int clinicId);

    Task<Owner> AddAsync(Owner owner);

    Task UpdateAsync(Owner owner);

    Task DeleteAsync(Owner owner);
}