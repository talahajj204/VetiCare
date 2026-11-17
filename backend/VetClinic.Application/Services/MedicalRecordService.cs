using System.ComponentModel.DataAnnotations;
using VetClinic.Application.DTOs;
using VetClinic.Application.Interfaces;
using VetClinic.Core.Entities;
using VetClinic.Core.Interfaces;

namespace VetClinic.Application.Services;

public class MedicalRecordService : IMedicalRecordService
{
    private readonly IMedicalRecordRepository _recordRepository;
    private readonly IPetRepository _petRepository;

    public MedicalRecordService(
        IMedicalRecordRepository recordRepository,
        IPetRepository petRepository)
    {
        _recordRepository = recordRepository;
        _petRepository = petRepository;
    }

    public async Task<List<MedicalRecordDto>> GetAllAsync(
        int clinicId,
        int? petId = null)
    {
        ValidateClinicId(clinicId);

        if (petId.HasValue)
        {
            await GetPetAsync(petId.Value, clinicId);
        }

        var records = await _recordRepository.GetAllAsync(
            clinicId,
            petId);

        return records.Select(MapToDto).ToList();
    }

    public async Task<MedicalRecordDto?> GetByIdAsync(
        int id,
        int clinicId)
    {
        ValidateClinicId(clinicId);

        var record = await _recordRepository.GetByIdAsync(
            id,
            clinicId);

        return record is null ? null : MapToDto(record);
    }

    public async Task<MedicalRecordDto> CreateAsync(
        int clinicId,
        CreateMedicalRecordDto dto)
    {
        ValidateClinicId(clinicId);
        ValidateDto(dto);

        var pet = await GetPetAsync(dto.PetId, clinicId);

        var record = new MedicalRecord
        {
            ClinicId = clinicId,
            CreatedAt = DateTime.UtcNow
        };

        ApplyChanges(record, dto, pet);

        await _recordRepository.AddAsync(record);

        return MapToDto(record);
    }

    public async Task<MedicalRecordDto?> UpdateAsync(
        int id,
        int clinicId,
        UpdateMedicalRecordDto dto)
    {
        ValidateClinicId(clinicId);
        ValidateDto(dto);

        var record = await _recordRepository.GetByIdAsync(
            id,
            clinicId);

        if (record is null)
        {
            return null;
        }

        var pet = await GetPetAsync(dto.PetId, clinicId);

        ApplyChanges(record, dto, pet);

        await _recordRepository.UpdateAsync(record);

        return MapToDto(record);
    }

    public async Task<bool> DeleteAsync(
        int id,
        int clinicId)
    {
        ValidateClinicId(clinicId);

        var record = await _recordRepository.GetByIdAsync(
            id,
            clinicId);

        if (record is null)
        {
            return false;
        }

        await _recordRepository.DeleteAsync(record);

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
                "The selected pet does not exist in your clinic.");
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

    private static void ValidateDto(
        CreateMedicalRecordDto dto)
    {
        Validator.ValidateObject(
            dto,
            new ValidationContext(dto),
            validateAllProperties: true);

        if (!dto.Date.HasValue ||
            dto.Date.Value == DateOnly.MinValue)
        {
            throw new ValidationException(
                "A valid visit date is required.");
        }

        if (dto.FollowUpDate.HasValue &&
            dto.FollowUpDate.Value < dto.Date.Value)
        {
            throw new ValidationException(
                "Follow-up date cannot be before the visit date.");
        }

        if (dto.Weight.HasValue &&
            decimal.Round(dto.Weight.Value, 2) != dto.Weight.Value)
        {
            throw new ValidationException(
                "Weight can have a maximum of two decimal places.");
        }
    }

    private static string Clean(string? value)
    {
        return value?.Trim() ?? string.Empty;
    }

    private static void ApplyChanges(
        MedicalRecord record,
        CreateMedicalRecordDto dto,
        Pet pet)
    {
        record.PetId = pet.Id;
        record.Pet = pet;

        record.Date = dto.Date!.Value;
        record.Veterinarian = Clean(dto.Veterinarian);
        record.ReasonForVisit = Clean(dto.ReasonForVisit);

        record.Symptoms = Clean(dto.Symptoms);
        record.Procedures = Clean(dto.Procedures);
        record.Weight = dto.Weight;
        record.FollowUpDate = dto.FollowUpDate;

        record.Diagnosis = Clean(dto.Diagnosis);
        record.Treatment = Clean(dto.Treatment);
        record.Notes = Clean(dto.Notes);

        record.FileName = Clean(dto.FileName);
        record.Status = Clean(dto.Status);
    }

    private static MedicalRecordDto MapToDto(
        MedicalRecord record)
    {
        return new MedicalRecordDto
        {
            Id = record.Id,
            ClinicId = record.ClinicId,
            PetId = record.PetId,
            Pet = record.Pet.Name,

            OwnerId = record.Pet.OwnerId,
            Owner =
                $"{record.Pet.Owner.FirstName} " +
                $"{record.Pet.Owner.LastName}".Trim(),

            Date = record.Date,
            Veterinarian = record.Veterinarian,
            ReasonForVisit = record.ReasonForVisit,

            Symptoms = record.Symptoms,
            Procedures = record.Procedures,
            Weight = record.Weight,
            FollowUpDate = record.FollowUpDate,

            Diagnosis = record.Diagnosis,
            Treatment = record.Treatment,
            Notes = record.Notes,

            FileName = record.FileName,
            Status = record.Status,
            CreatedAt = record.CreatedAt
        };
    }
}