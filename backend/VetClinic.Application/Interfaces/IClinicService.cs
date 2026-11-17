using VetClinic.Application.DTOs;

namespace VetClinic.Application.Interfaces;

public interface IClinicService
{
    Task<List<ClinicDto>> GetAllAsync();

    Task<ClinicDto?> GetByIdAsync(int id);

    Task<ClinicDto> CreateAsync(CreateClinicDto dto);

    Task<ClinicDto?> UpdateAsync(int id, UpdateClinicDto dto);
}