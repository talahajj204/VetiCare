using System.ComponentModel.DataAnnotations;
using VetClinic.Application.DTOs;
using VetClinic.Application.Interfaces;
using VetClinic.Core.Entities;
using VetClinic.Core.Interfaces;

namespace VetClinic.Application.Services;

public class PrescriptionService : IPrescriptionService
{
    private readonly IPrescriptionRepository _repository;
    private readonly IPetRepository _petRepository;

    public PrescriptionService(
        IPrescriptionRepository repository,
        IPetRepository petRepository)
    {
        _repository = repository;
        _petRepository = petRepository;
    }

    public async Task<List<PrescriptionDto>> GetAllAsync(
        int clinicId,
        int? petId = null)
    {
        ValidateClinicId(clinicId);

        if (petId.HasValue && petId.Value <= 0)
        {
            throw new ValidationException(
                "Please select a valid pet.");
        }

        var prescriptions = await _repository.GetAllAsync(
            clinicId,
            petId);

        return prescriptions.Select(ToDto).ToList();
    }

    public async Task<PrescriptionDto?> GetByIdAsync(
        int id,
        int clinicId)
    {
        ValidateClinicId(clinicId);

        var prescription = await _repository.GetByIdAsync(
            id,
            clinicId);

        return prescription is null
            ? null
            : ToDto(prescription);
    }

    public async Task<PrescriptionDto> CreateAsync(
        int clinicId,
        CreatePrescriptionDto dto)
    {
        ValidateClinicId(clinicId);
        ValidateDto(dto);

        await ValidatePetAsync(dto.PetId, clinicId);

        var prescription = new Prescription
        {
            ClinicId = clinicId,
            CreatedAt = DateTime.UtcNow
        };

        ApplyChanges(prescription, dto);

        var created = await _repository.AddAsync(prescription);

        var saved = await _repository.GetByIdAsync(
            created.Id,
            clinicId)
            ?? throw new InvalidOperationException(
                "The saved prescription could not be loaded.");

        return ToDto(saved);
    }

    public async Task<PrescriptionDto?> UpdateAsync(
        int id,
        int clinicId,
        UpdatePrescriptionDto dto)
    {
        ValidateClinicId(clinicId);

        var prescription = await _repository.GetByIdAsync(
            id,
            clinicId);

        if (prescription is null)
        {
            return null;
        }

        ValidateDto(dto);

        await ValidatePetAsync(dto.PetId, clinicId);

        ApplyChanges(prescription, dto);

        await _repository.UpdateAsync(prescription);

        var saved = await _repository.GetByIdAsync(
            id,
            clinicId)
            ?? throw new InvalidOperationException(
                "The updated prescription could not be loaded.");

        return ToDto(saved);
    }

    public async Task<bool> DeleteAsync(
        int id,
        int clinicId)
    {
        ValidateClinicId(clinicId);

        var prescription = await _repository.GetByIdAsync(
            id,
            clinicId);

        if (prescription is null)
        {
            return false;
        }

        await _repository.DeleteAsync(prescription);

        return true;
    }

    private async Task ValidatePetAsync(
        int petId,
        int clinicId)
    {
        var pet = await _petRepository.GetByIdAsync(
            petId,
            clinicId);

        if (pet is null)
        {
            throw new ValidationException(
                "The selected pet does not belong to your clinic.");
        }
    }

    private static void ValidateClinicId(int clinicId)
    {
        if (clinicId <= 0)
        {
            throw new ValidationException(
                "A valid clinic is required.");
        }
    }

    private static void ValidateDto(CreatePrescriptionDto dto)
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
                "Please select a valid prescription date.");
        }
    }

    private static void ApplyChanges(
        Prescription prescription,
        CreatePrescriptionDto dto)
    {
        prescription.PetId = dto.PetId;
        prescription.Date = dto.Date!.Value;
        prescription.Veterinarian = dto.Veterinarian?.Trim() ?? string.Empty;
        prescription.Medication = dto.Medication.Trim();
        prescription.Dosage = dto.Dosage.Trim();
        prescription.Instructions =
            dto.Instructions?.Trim() ?? string.Empty;
    }

    private static PrescriptionDto ToDto(
        Prescription prescription)
    {
        var pet = prescription.Pet;
        var owner = pet?.Owner;

        return new PrescriptionDto
        {
            Id = prescription.Id,
            PetId = prescription.PetId,
            Pet = pet?.Name ?? string.Empty,
            OwnerId = pet?.OwnerId ?? 0,
            Owner = owner is null
                ? string.Empty
                : $"{owner.FirstName} {owner.LastName}".Trim(),
            Clinic = prescription.Clinic?.Name ?? string.Empty,
            Date = prescription.Date,
            Veterinarian = prescription.Veterinarian,
            Medication = prescription.Medication,
            Dosage = prescription.Dosage,
            Instructions = prescription.Instructions,
            CreatedAt = prescription.CreatedAt
        };
    }
}