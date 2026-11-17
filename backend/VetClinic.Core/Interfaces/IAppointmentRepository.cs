using VetClinic.Core.Entities;

namespace VetClinic.Core.Interfaces;

public interface IAppointmentRepository
{
    Task<List<Appointment>> GetAllAsync(
        int clinicId,
        int? petId = null);

    Task<Appointment?> GetByIdAsync(
        int id,
        int clinicId);

    Task<Appointment> AddAsync(
        Appointment appointment);

    Task UpdateAsync(
        Appointment appointment);

    Task DeleteAsync(
        Appointment appointment);
}