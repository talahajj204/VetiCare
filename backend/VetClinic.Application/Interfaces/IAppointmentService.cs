using VetClinic.Application.DTOs;

namespace VetClinic.Application.Interfaces;

public interface IAppointmentService
{
    Task<List<AppointmentDto>> GetAllAsync(
        int clinicId,
        int? petId = null);

    Task<AppointmentDto?> GetByIdAsync(
        int id,
        int clinicId);

    Task<AppointmentDto> CreateAsync(
        int clinicId,
        CreateAppointmentDto dto);

    Task<AppointmentDto?> UpdateAsync(
        int id,
        int clinicId,
        UpdateAppointmentDto dto);

    Task<bool> DeleteAsync(
        int id,
        int clinicId);
}