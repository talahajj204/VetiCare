using System.ComponentModel.DataAnnotations;
using VetClinic.Application.DTOs;
using VetClinic.Application.Interfaces;
using VetClinic.Core.Entities;
using VetClinic.Core.Interfaces;

namespace VetClinic.Application.Services;

public class VaccinationService : IVaccinationService
{
    private readonly IVaccinationRepository _vaccinationRepository;
    private readonly IPetRepository _petRepository;

    public VaccinationService(
        IVaccinationRepository vaccinationRepository,
        IPetRepository petRepository)
    {
        _vaccinationRepository = vaccinationRepository;
        _petRepository = petRepository;
    }

    public async Task<List<VaccinationDto>> GetAllAsync(
        int clinicId,
        int? petId = null)
    {
        ValidateClinicId(clinicId);

        if (petId.HasValue)
        {
            await GetPetAsync(petId.Value, clinicId);
        }

        var vaccinations = await _vaccinationRepository
            .GetAllAsync(clinicId, petId);

        return vaccinations.Select(ToDto).ToList();
    }

    public async Task<VaccinationDto?> GetByIdAsync(
        int id,
        int clinicId)
    {
        ValidateClinicId(clinicId);

        var vaccination = await _vaccinationRepository
            .GetByIdAsync(id, clinicId);

        return vaccination is null
            ? null
            : ToDto(vaccination);
    }

    public async Task<VaccinationDto> CreateAsync(
        int clinicId,
        CreateVaccinationDto dto)
    {
        ValidateClinicId(clinicId);
        ValidateDto(dto);

        var pet = await GetPetAsync(dto.PetId, clinicId);

        var vaccination = new Vaccination
        {
            ClinicId = clinicId,
            CreatedAt = DateTime.UtcNow
        };

        ApplyChanges(vaccination, dto, pet);

        var saved = await _vaccinationRepository
            .AddAsync(vaccination);

        return ToDto(saved);
    }

    public async Task<VaccinationDto?> UpdateAsync(
        int id,
        int clinicId,
        UpdateVaccinationDto dto)
    {
        ValidateClinicId(clinicId);
        ValidateDto(dto);

        var vaccination = await _vaccinationRepository
            .GetByIdAsync(id, clinicId);

        if (vaccination is null)
        {
            return null;
        }

        var pet = await GetPetAsync(dto.PetId, clinicId);

        ApplyChanges(vaccination, dto, pet);

        await _vaccinationRepository.UpdateAsync(vaccination);

        return ToDto(vaccination);
    }

    public async Task<bool> DeleteAsync(
        int id,
        int clinicId)
    {
        ValidateClinicId(clinicId);

        var vaccination = await _vaccinationRepository
            .GetByIdAsync(id, clinicId);

        if (vaccination is null)
        {
            return false;
        }

        await _vaccinationRepository.DeleteAsync(vaccination);

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

    private static void ValidateDto(CreateVaccinationDto dto)
    {
        ArgumentNullException.ThrowIfNull(dto);

        Validator.ValidateObject(
            dto,
            new ValidationContext(dto),
            validateAllProperties: true);

        if (!dto.DateGiven.HasValue ||
            dto.DateGiven.Value == DateOnly.MinValue)
        {
            throw new ValidationException(
                "Please select a valid date given.");
        }

        if (!dto.NextDueDate.HasValue ||
            dto.NextDueDate.Value == DateOnly.MinValue)
        {
            throw new ValidationException(
                "Please select a valid next due date.");
        }

        if (dto.NextDueDate.Value < dto.DateGiven.Value)
        {
            throw new ValidationException(
                "Next due date cannot be before the date given.");
        }
    }

    private static void ApplyChanges(
        Vaccination vaccination,
        CreateVaccinationDto dto,
        Pet pet)
    {
        vaccination.PetId = pet.Id;
        vaccination.Pet = pet;
        vaccination.Vaccine = dto.Vaccine.Trim();
        vaccination.DateGiven = dto.DateGiven!.Value;
        vaccination.NextDueDate = dto.NextDueDate!.Value;
        vaccination.Status = dto.Status.Trim();
        vaccination.Notes = (dto.Notes ?? string.Empty).Trim();
    }

    private static VaccinationDto ToDto(
        Vaccination vaccination)
    {
        return new VaccinationDto
        {
            Id = vaccination.Id,
            PetId = vaccination.PetId,
            Pet = vaccination.Pet.Name,
            OwnerId = vaccination.Pet.OwnerId,
            Owner = (
                $"{vaccination.Pet.Owner.FirstName} " +
                $"{vaccination.Pet.Owner.LastName}"
            ).Trim(),
            Vaccine = vaccination.Vaccine,
            DateGiven = vaccination.DateGiven,
            NextDueDate = vaccination.NextDueDate,
            Status = vaccination.Status,
            Notes = vaccination.Notes,
            CreatedAt = vaccination.CreatedAt
        };
    }
}