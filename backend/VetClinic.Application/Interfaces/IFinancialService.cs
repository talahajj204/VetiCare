using VetClinic.Application.DTOs;

namespace VetClinic.Application.Interfaces;

public interface IFinancialService
{
    Task<List<FinancialEntryDto>> GetAllAsync(int clinicId);

    Task<FinancialEntryDto?> GetByIdAsync(
        int id,
        int clinicId);

    Task<FinancialEntryDto> CreateAsync(
        int clinicId,
        CreateFinancialEntryDto dto);

    Task<bool> DeleteAsync(
        int id,
        int clinicId);
}