using VetClinic.Core.Entities;

namespace VetClinic.Core.Interfaces;

public interface IFinancialRepository
{
    Task<bool> IsClinicActiveAsync(int clinicId);

    Task<List<FinancialEntry>> GetAllAsync(int clinicId);

    Task<FinancialEntry?> GetByIdAsync(
        int id,
        int clinicId);

    Task<FinancialEntry?> GetByRequestIdAsync(
        Guid requestId,
        int clinicId);

    Task AddAsync(FinancialEntry entry);

    void Remove(FinancialEntry entry);

    Task SaveChangesAsync();

    Task<T> ExecuteInTransactionAsync<T>(
        Func<Task<T>> operation);
}