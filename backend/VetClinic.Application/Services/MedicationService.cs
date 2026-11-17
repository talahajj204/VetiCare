using System.ComponentModel.DataAnnotations;
using VetClinic.Application.DTOs;
using VetClinic.Application.Interfaces;
using VetClinic.Core.Entities;
using VetClinic.Core.Interfaces;

namespace VetClinic.Application.Services;

public class MedicationService : IMedicationService
{
    private readonly IMedicationRepository _medicationRepository;
    private readonly IPetRepository _petRepository;

    public MedicationService(
        IMedicationRepository medicationRepository,
        IPetRepository petRepository)
    {
        _medicationRepository = medicationRepository;
        _petRepository = petRepository;
    }

    public async Task<List<MedicationDto>> GetAllAsync(
        int clinicId,
        int? petId = null)
    {
        ValidateClinicId(clinicId);

        if (petId.HasValue)
        {
            await GetPetAsync(petId.Value, clinicId);
        }

        var medications = await _medicationRepository
            .GetAllAsync(clinicId, petId);

        return medications.Select(ToDto).ToList();
    }

    public async Task<MedicationDto?> GetByIdAsync(
        int id,
        int clinicId)
    {
        ValidateClinicId(clinicId);

        var medication = await _medicationRepository
            .GetByIdAsync(id, clinicId);

        return medication is null
            ? null
            : ToDto(medication);
    }

    public async Task<MedicationDto> CreateAsync(
        int clinicId,
        CreateMedicationDto dto)
    {
        ValidateClinicId(clinicId);
        ValidateDto(dto);

        var pet = await GetPetAsync(dto.PetId, clinicId);

        var medication = new Medication
        {
            ClinicId = clinicId,
            CreatedAt = DateTime.UtcNow
        };

        ApplyChanges(medication, dto, pet);

        var saved = await _medicationRepository
            .AddAsync(medication);

        return ToDto(saved);
    }

    public async Task<MedicationDto?> UpdateAsync(
        int id,
        int clinicId,
        UpdateMedicationDto dto)
    {
        ValidateClinicId(clinicId);
        ValidateDto(dto);

        var medication = await _medicationRepository
            .GetByIdAsync(id, clinicId);

        if (medication is null)
        {
            return null;
        }

        var pet = await GetPetAsync(dto.PetId, clinicId);

        ApplyChanges(medication, dto, pet);

        await _medicationRepository.UpdateAsync(medication);

        return ToDto(medication);
    }

    public async Task<bool> DeleteAsync(
        int id,
        int clinicId)
    {
        ValidateClinicId(clinicId);

        var medication = await _medicationRepository
            .GetByIdAsync(id, clinicId);

        if (medication is null)
        {
            return false;
        }

        await _medicationRepository.DeleteAsync(medication);

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

    private static void ValidateDto(CreateMedicationDto dto)
    {
        ArgumentNullException.ThrowIfNull(dto);

        Validator.ValidateObject(
            dto,
            new ValidationContext(dto),
            validateAllProperties: true);

        if (!dto.StartDate.HasValue ||
            dto.StartDate.Value == DateOnly.MinValue)
        {
            throw new ValidationException(
                "Please select a valid start date.");
        }

        if (dto.EndDate.HasValue &&
            dto.EndDate.Value < dto.StartDate.Value)
        {
            throw new ValidationException(
                "End date cannot be before the start date.");
        }
    }

    private static void ApplyChanges(
        Medication medication,
        CreateMedicationDto dto,
        Pet pet)
    {
        medication.PetId = pet.Id;
        medication.Pet = pet;
        medication.Name = dto.Medication.Trim();
        medication.Dosage = dto.Dosage.Trim();
        medication.Frequency = dto.Frequency.Trim();
        medication.Route = dto.Route.Trim();
        medication.StartDate = dto.StartDate!.Value;
        medication.EndDate = dto.EndDate;
        medication.Instructions =
            (dto.Instructions ?? string.Empty).Trim();
        medication.Status = dto.Status.Trim();
    }

    private static MedicationDto ToDto(
        Medication medication)
    {
        return new MedicationDto
        {
            Id = medication.Id,
            PetId = medication.PetId,
            Pet = medication.Pet.Name,
            OwnerId = medication.Pet.OwnerId,
            Owner = (
                $"{medication.Pet.Owner.FirstName} " +
                $"{medication.Pet.Owner.LastName}"
            ).Trim(),
            Medication = medication.Name,
            Dosage = medication.Dosage,
            Frequency = medication.Frequency,
            Route = medication.Route,
            StartDate = medication.StartDate,
            EndDate = medication.EndDate,
            Instructions = medication.Instructions,
            Status = medication.Status,
            CreatedAt = medication.CreatedAt
        };
    }
}