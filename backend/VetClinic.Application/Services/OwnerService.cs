using System.ComponentModel.DataAnnotations;
using VetClinic.Application.DTOs;
using VetClinic.Application.Interfaces;
using VetClinic.Core.Entities;
using VetClinic.Core.Interfaces;

namespace VetClinic.Application.Services;

public class OwnerService : IOwnerService
{
    private readonly IOwnerRepository _repository;

    public OwnerService(IOwnerRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<OwnerDto>> GetAllAsync(int clinicId)
    {
        ValidateClinicId(clinicId);

        var owners = await _repository.GetAllAsync(clinicId);

        return owners.Select(ToDto).ToList();
    }

    public async Task<OwnerDto?> GetByIdAsync(
        int id,
        int clinicId)
    {
        ValidateClinicId(clinicId);

        var owner = await _repository.GetByIdAsync(id, clinicId);

        return owner is null ? null : ToDto(owner);
    }

    public async Task<OwnerDto> CreateAsync(
        int clinicId,
        CreateOwnerDto dto)
    {
        ValidateClinicId(clinicId);
        ValidateDto(dto);

        var owner = new Owner
        {
            ClinicId = clinicId,
            FirstName = Clean(dto.FirstName),
            LastName = Clean(dto.LastName),
            Email = Clean(dto.Email),
            Phone = Clean(dto.Phone),
            Address = Clean(dto.Address),
            EmergencyContact = Clean(dto.EmergencyContact),
            Notes = Clean(dto.Notes),
            Status = "active",
            CreatedAt = DateTime.UtcNow
        };

        await _repository.AddAsync(owner);

        return ToDto(owner);
    }

    public async Task<OwnerDto?> UpdateAsync(
        int id,
        int clinicId,
        UpdateOwnerDto dto)
    {
        ValidateClinicId(clinicId);
        ValidateDto(dto);

        var owner = await _repository.GetByIdAsync(id, clinicId);

        if (owner is null)
        {
            return null;
        }

        owner.FirstName = Clean(dto.FirstName);
        owner.LastName = Clean(dto.LastName);
        owner.Email = Clean(dto.Email);
        owner.Phone = Clean(dto.Phone);
        owner.Address = Clean(dto.Address);
        owner.EmergencyContact = Clean(dto.EmergencyContact);
        owner.Notes = Clean(dto.Notes);
        owner.Status = Clean(dto.Status);

        await _repository.UpdateAsync(owner);

        return ToDto(owner);
    }

    public async Task<bool> DeleteAsync(
        int id,
        int clinicId)
    {
        ValidateClinicId(clinicId);

        var owner = await _repository.GetByIdAsync(id, clinicId);

        if (owner is null)
        {
            return false;
        }

        if (!string.Equals(
            owner.Status,
            "inactive",
            StringComparison.OrdinalIgnoreCase))
        {
            throw new ValidationException(
                "You must set this owner as Inactive before deleting."
            );
        }

        await _repository.DeleteAsync(owner);

        return true;
    }

    private static OwnerDto ToDto(Owner owner)
    {
        return new OwnerDto
        {
            Id = owner.Id,
            ClinicId = owner.ClinicId,
            FirstName = owner.FirstName,
            LastName = owner.LastName,
            Email = owner.Email,
            Phone = owner.Phone,
            Address = owner.Address,
            EmergencyContact = owner.EmergencyContact,
            Notes = owner.Notes,
            Status = owner.Status,
            CreatedAt = owner.CreatedAt
        };
    }

    private static string Clean(string? value)
    {
        return value?.Trim() ?? string.Empty;
    }

    private static void ValidateDto(object dto)
    {
        Validator.ValidateObject(
            dto,
            new ValidationContext(dto),
            validateAllProperties: true
        );
    }

    private static void ValidateClinicId(int clinicId)
    {
        if (clinicId <= 0)
        {
            throw new ValidationException(
                "A valid clinic is required."
            );
        }
    }
}