using VetClinic.Application.DTOs;

namespace VetClinic.Application.Interfaces;

public interface IClinicOptionService
{
    Task<List<ClinicOptionDto>> GetAllAsync(
        int clinicId,
        string? listKey = null,
        bool includeInactive = false);

    Task<ClinicOptionDto?> GetByIdAsync(
        int id,
        int clinicId);

    Task<ClinicOptionDto> CreateAsync(
        int clinicId,
        CreateClinicOptionDto dto);

    Task<ClinicOptionDto?> UpdateAsync(
        int id,
        int clinicId,
        UpdateClinicOptionDto dto);
}