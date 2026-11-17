using VetClinic.Application.DTOs;

namespace VetClinic.Application.Interfaces;

public interface IReminderService
{
    Task<List<ReminderDto>> GetAllAsync(
        int clinicId,
        int? petId = null);

    Task<ReminderDto?> GetByIdAsync(
        int id,
        int clinicId);

    Task<ReminderDto> CreateAsync(
        int clinicId,
        CreateReminderDto dto);

    Task<ReminderDto?> UpdateAsync(
        int id,
        int clinicId,
        UpdateReminderDto dto);

    Task<bool> DeleteAsync(
        int id,
        int clinicId);
}