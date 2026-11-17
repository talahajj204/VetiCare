using System.ComponentModel.DataAnnotations;
using VetClinic.Application.DTOs;
using VetClinic.Application.Interfaces;
using VetClinic.Core.Entities;
using VetClinic.Core.Interfaces;

namespace VetClinic.Application.Services;

public class ReminderService : IReminderService
{
    private readonly IReminderRepository _reminderRepository;
    private readonly IPetRepository _petRepository;

    public ReminderService(
        IReminderRepository reminderRepository,
        IPetRepository petRepository)
    {
        _reminderRepository = reminderRepository;
        _petRepository = petRepository;
    }

    public async Task<List<ReminderDto>> GetAllAsync(
        int clinicId,
        int? petId = null)
    {
        ValidateClinicId(clinicId);

        if (petId.HasValue)
        {
            await GetPetAsync(petId.Value, clinicId);
        }

        var reminders = await _reminderRepository
            .GetAllAsync(clinicId, petId);

        return reminders.Select(ToDto).ToList();
    }

    public async Task<ReminderDto?> GetByIdAsync(
        int id,
        int clinicId)
    {
        ValidateClinicId(clinicId);

        var reminder = await _reminderRepository
            .GetByIdAsync(id, clinicId);

        return reminder is null ? null : ToDto(reminder);
    }

    public async Task<ReminderDto> CreateAsync(
        int clinicId,
        CreateReminderDto dto)
    {
        ValidateClinicId(clinicId);
        ValidateDto(dto);

        var pet = await GetPetAsync(dto.PetId, clinicId);

        var reminder = new Reminder
        {
            ClinicId = clinicId,
            CreatedAt = DateTime.UtcNow
        };

        ApplyChanges(reminder, dto, pet);

        var saved = await _reminderRepository
            .AddAsync(reminder);

        return ToDto(saved);
    }

    public async Task<ReminderDto?> UpdateAsync(
        int id,
        int clinicId,
        UpdateReminderDto dto)
    {
        ValidateClinicId(clinicId);
        ValidateDto(dto);

        var reminder = await _reminderRepository
            .GetByIdAsync(id, clinicId);

        if (reminder is null)
        {
            return null;
        }

        var pet = await GetPetAsync(dto.PetId, clinicId);

        ApplyChanges(reminder, dto, pet);

        await _reminderRepository.UpdateAsync(reminder);

        return ToDto(reminder);
    }

    public async Task<bool> DeleteAsync(
        int id,
        int clinicId)
    {
        ValidateClinicId(clinicId);

        var reminder = await _reminderRepository
            .GetByIdAsync(id, clinicId);

        if (reminder is null)
        {
            return false;
        }

        await _reminderRepository.DeleteAsync(reminder);

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

    private static void ValidateDto(CreateReminderDto dto)
    {
        ArgumentNullException.ThrowIfNull(dto);

        Validator.ValidateObject(
            dto,
            new ValidationContext(dto),
            validateAllProperties: true);

        if (!dto.DueDate.HasValue ||
            dto.DueDate.Value == DateOnly.MinValue)
        {
            throw new ValidationException(
                "Please select a valid due date.");
        }
    }

    private static void ApplyChanges(
        Reminder reminder,
        CreateReminderDto dto,
        Pet pet)
    {
        reminder.PetId = pet.Id;
        reminder.Pet = pet;
        reminder.Type = dto.Type.Trim();
        reminder.DueDate = dto.DueDate!.Value;
        reminder.Message = dto.Message.Trim();
        reminder.Status = dto.Status.Trim();
    }

    private static ReminderDto ToDto(Reminder reminder)
    {
        return new ReminderDto
        {
            Id = reminder.Id,
            PetId = reminder.PetId,
            Pet = reminder.Pet.Name,
            OwnerId = reminder.Pet.OwnerId,
            Owner = (
                $"{reminder.Pet.Owner.FirstName} " +
                $"{reminder.Pet.Owner.LastName}"
            ).Trim(),
            Type = reminder.Type,
            DueDate = reminder.DueDate,
            Message = reminder.Message,
            Status = reminder.Status,
            CreatedAt = reminder.CreatedAt
        };
    }
}