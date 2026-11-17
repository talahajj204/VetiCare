using VetClinic.Core.Entities;

namespace VetClinic.Core.Interfaces;

public interface IPetRepository
{
    Task<List<Pet>> GetAllAsync(int clinicId);

    Task<Pet?> GetByIdAsync(int id, int clinicId);

    Task<Pet> AddAsync(Pet pet);

    Task UpdateAsync(Pet pet);

    Task DeleteAsync(Pet pet);
}