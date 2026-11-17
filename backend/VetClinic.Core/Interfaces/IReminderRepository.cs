using VetClinic.Core.Entities;

namespace VetClinic.Core.Interfaces;

public interface IReminderRepository
{
    Task<List<Reminder>> GetAllAsync(
        int clinicId,
        int? petId = null);

    Task<Reminder?> GetByIdAsync(
        int id,
        int clinicId);

    Task<Reminder> AddAsync(
        Reminder reminder);

    Task UpdateAsync(
        Reminder reminder);

    Task DeleteAsync(
        Reminder reminder);
}