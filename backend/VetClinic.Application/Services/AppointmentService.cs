using System.ComponentModel.DataAnnotations;
using VetClinic.Application.DTOs;
using VetClinic.Application.Interfaces;
using VetClinic.Core.Entities;
using VetClinic.Core.Interfaces;

namespace VetClinic.Application.Services;

public class AppointmentService : IAppointmentService
{
    private readonly IAppointmentRepository _appointmentRepository;
    private readonly IPetRepository _petRepository;

    public AppointmentService(
        IAppointmentRepository appointmentRepository,
        IPetRepository petRepository)
    {
        _appointmentRepository = appointmentRepository;
        _petRepository = petRepository;
    }

    public async Task<List<AppointmentDto>> GetAllAsync(
        int clinicId,
        int? petId = null)
    {
        ValidateClinicId(clinicId);

        if (petId.HasValue)
        {
            await GetPetAsync(petId.Value, clinicId);
        }

        var appointments = await _appointmentRepository
            .GetAllAsync(clinicId, petId);

        return appointments.Select(ToDto).ToList();
    }

    public async Task<AppointmentDto?> GetByIdAsync(
        int id,
        int clinicId)
    {
        ValidateClinicId(clinicId);

        var appointment = await _appointmentRepository
            .GetByIdAsync(id, clinicId);

        return appointment is null
            ? null
            : ToDto(appointment);
    }

    public async Task<AppointmentDto> CreateAsync(
        int clinicId,
        CreateAppointmentDto dto)
    {
        ValidateClinicId(clinicId);
        ValidateDto(dto);

        var pet = await GetPetAsync(dto.PetId, clinicId);

        var appointment = new Appointment
        {
            ClinicId = clinicId,
            CreatedAt = DateTime.UtcNow
        };

        ApplyChanges(appointment, dto, pet);

        var savedAppointment = await _appointmentRepository
            .AddAsync(appointment);

        return ToDto(savedAppointment);
    }

    public async Task<AppointmentDto?> UpdateAsync(
        int id,
        int clinicId,
        UpdateAppointmentDto dto)
    {
        ValidateClinicId(clinicId);
        ValidateDto(dto);

        var appointment = await _appointmentRepository
            .GetByIdAsync(id, clinicId);

        if (appointment is null)
        {
            return null;
        }

        var pet = await GetPetAsync(dto.PetId, clinicId);

        ApplyChanges(appointment, dto, pet);

        await _appointmentRepository.UpdateAsync(appointment);

        return ToDto(appointment);
    }

    public async Task<bool> DeleteAsync(
        int id,
        int clinicId)
    {
        ValidateClinicId(clinicId);

        var appointment = await _appointmentRepository
            .GetByIdAsync(id, clinicId);

        if (appointment is null)
        {
            return false;
        }

        await _appointmentRepository.DeleteAsync(appointment);

        return true;
    }

    private async Task<Pet> GetPetAsync(
        int petId,
        int clinicId)
    {
        if (petId <= 0)
        {
            throw new ValidationException(
                "Please select a valid pet.");
        }

        var pet = await _petRepository.GetByIdAsync(
            petId,
            clinicId);

        if (pet is null)
        {
            throw new ValidationException(
                "The selected pet was not found in your clinic.");
        }

        return pet;
    }

    private static void ValidateClinicId(int clinicId)
    {
        if (clinicId <= 0)
        {
            throw new ValidationException(
                "A valid clinic is required.");
        }
    }

    private static void ValidateDto(CreateAppointmentDto dto)
    {
        ArgumentNullException.ThrowIfNull(dto);

        Validator.ValidateObject(
            dto,
            new ValidationContext(dto),
            validateAllProperties: true);

        if (!dto.Date.HasValue ||
            dto.Date.Value == DateOnly.MinValue)
        {
            throw new ValidationException(
                "Please select a valid appointment date.");
        }
    }

    private static void ApplyChanges(
        Appointment appointment,
        CreateAppointmentDto dto,
        Pet pet)
    {
        appointment.PetId = pet.Id;
        appointment.Pet = pet;
        appointment.Type = dto.Type.Trim();
        appointment.Date = dto.Date!.Value;
      appointment.Time = dto.Time!.Value;
        appointment.Veterinarian = dto.Veterinarian.Trim();
        appointment.Reason = dto.Reason.Trim();
        appointment.Status = dto.Status.Trim();
    }

    private static AppointmentDto ToDto(
        Appointment appointment)
    {
        return new AppointmentDto
        {
            Id = appointment.Id,
            PetId = appointment.PetId,
            Pet = appointment.Pet.Name,
            OwnerId = appointment.Pet.OwnerId,
            Owner = (
                $"{appointment.Pet.Owner.FirstName} " +
                $"{appointment.Pet.Owner.LastName}"
            ).Trim(),
            Type = appointment.Type,
            Date = appointment.Date,
            Time = appointment.Time,
            Veterinarian = appointment.Veterinarian,
            Reason = appointment.Reason,
            Status = appointment.Status,
            CreatedAt = appointment.CreatedAt
        };
    }
}