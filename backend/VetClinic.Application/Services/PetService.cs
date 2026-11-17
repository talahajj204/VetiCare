using System.ComponentModel.DataAnnotations;
using VetClinic.Application.DTOs;
using VetClinic.Application.Interfaces;
using VetClinic.Core.Entities;
using VetClinic.Core.Interfaces;

namespace VetClinic.Application.Services;

public class PetService : IPetService
{
    private readonly IPetRepository _petRepository;
    private readonly IOwnerRepository _ownerRepository;

    public PetService(
        IPetRepository petRepository,
        IOwnerRepository ownerRepository)
    {
        _petRepository = petRepository;
        _ownerRepository = ownerRepository;
    }

    public async Task<List<PetDto>> GetAllAsync(int clinicId)
    {
        ValidateClinicId(clinicId);

        var pets = await _petRepository.GetAllAsync(clinicId);

        return pets.Select(MapToDto).ToList();
    }

    public async Task<PetDto?> GetByIdAsync(
        int id,
        int clinicId)
    {
        ValidateClinicId(clinicId);

        var pet = await _petRepository.GetByIdAsync(
            id,
            clinicId);

        return pet is null ? null : MapToDto(pet);
    }

    public async Task<PetDto> CreateAsync(
        int clinicId,
        CreatePetDto dto)
    {
        ValidateClinicId(clinicId);
        ValidateDto(dto);

        var owner = await GetOwnerAsync(
            dto.OwnerId,
            clinicId);

        var pet = new Pet
        {
            ClinicId = clinicId,
            CreatedAt = DateTime.UtcNow
        };

        ApplyChanges(pet, dto, owner);

        await _petRepository.AddAsync(pet);

        return MapToDto(pet);
    }

    public async Task<PetDto?> UpdateAsync(
        int id,
        int clinicId,
        UpdatePetDto dto)
    {
        ValidateClinicId(clinicId);
        ValidateDto(dto);

        var pet = await _petRepository.GetByIdAsync(
            id,
            clinicId);

        if (pet is null)
        {
            return null;
        }

        var owner = await GetOwnerAsync(
            dto.OwnerId,
            clinicId);

        ApplyChanges(pet, dto, owner);

        await _petRepository.UpdateAsync(pet);

        return MapToDto(pet);
    }

    public async Task<bool> DeleteAsync(
        int id,
        int clinicId)
    {
        ValidateClinicId(clinicId);

        var pet = await _petRepository.GetByIdAsync(
            id,
            clinicId);

        if (pet is null)
        {
            return false;
        }

        await _petRepository.DeleteAsync(pet);

        return true;
    }

    private async Task<Owner> GetOwnerAsync(
        int ownerId,
        int clinicId)
    {
        var owner = await _ownerRepository.GetByIdAsync(
            ownerId,
            clinicId);

        if (owner is null)
        {
            throw new ValidationException(
                "The selected owner does not exist in your clinic.");
        }

        return owner;
    }

    private static void ValidateClinicId(int clinicId)
    {
        if (clinicId <= 0)
        {
            throw new ValidationException(
                "A valid clinic is required.");
        }
    }

    private static void ValidateDto(CreatePetDto dto)
    {
        Validator.ValidateObject(
            dto,
            new ValidationContext(dto),
            validateAllProperties: true);

        if (dto.DateOfBirth.HasValue &&
            dto.DateOfBirth.Value >
            DateOnly.FromDateTime(DateTime.UtcNow))
        {
            throw new ValidationException(
                "Date of birth cannot be in the future.");
        }

        if (dto.EstimatedDOB && !dto.DateOfBirth.HasValue)
        {
            throw new ValidationException(
                "An estimated birth date must include a date.");
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
        Pet pet,
        CreatePetDto dto,
        Owner owner)
    {
        pet.OwnerId = owner.Id;
        pet.Owner = owner;

        pet.Name = Clean(dto.Name);
        pet.Species = Clean(dto.Species);
        pet.Breed = Clean(dto.Breed);
        pet.Sex = Clean(dto.Sex);

        pet.DateOfBirth = dto.DateOfBirth;
        pet.EstimatedDOB = dto.EstimatedDOB;
        pet.Age = Clean(dto.Age);

        pet.Color = Clean(dto.Color);
        pet.ColorHex = Clean(dto.ColorHex);

        pet.Weight = dto.Weight;
        pet.MicrochipNumber = Clean(dto.MicrochipNumber);
        pet.BloodType = Clean(dto.BloodType);

        pet.Allergies = Clean(dto.Allergies);
        pet.ChronicConditions = Clean(dto.ChronicConditions);
        pet.Notes = Clean(dto.Notes);
        pet.ProfilePhoto = Clean(dto.ProfilePhoto);
    }

    private static PetDto MapToDto(Pet pet)
    {
        return new PetDto
        {
            Id = pet.Id,
            ClinicId = pet.ClinicId,
            OwnerId = pet.OwnerId,

            Owner = $"{pet.Owner.FirstName} {pet.Owner.LastName}"
                .Trim(),

            Name = pet.Name,
            Species = pet.Species,
            Breed = pet.Breed,
            Sex = pet.Sex,

            DateOfBirth = pet.DateOfBirth,
            EstimatedDOB = pet.EstimatedDOB,
            Age = pet.Age,

            Color = pet.Color,
            ColorHex = pet.ColorHex,
            Weight = pet.Weight,

            MicrochipNumber = pet.MicrochipNumber,
            BloodType = pet.BloodType,
            Allergies = pet.Allergies,
            ChronicConditions = pet.ChronicConditions,

            Notes = pet.Notes,
            ProfilePhoto = pet.ProfilePhoto,
            CreatedAt = pet.CreatedAt
        };
    }
}