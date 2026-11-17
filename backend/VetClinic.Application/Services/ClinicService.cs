using System.ComponentModel.DataAnnotations;
using VetClinic.Application.DTOs;
using VetClinic.Application.Interfaces;
using VetClinic.Core.Entities;
using VetClinic.Core.Interfaces;

namespace VetClinic.Application.Services;

public class ClinicService : IClinicService
{
    private readonly IClinicRepository _repository;

    public ClinicService(IClinicRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<ClinicDto>> GetAllAsync()
    {
        var clinics = await _repository.GetAllAsync();

        return clinics.Select(ToDto).ToList();
    }

    public async Task<ClinicDto?> GetByIdAsync(int id)
    {
        var clinic = await _repository.GetByIdAsync(id);

        return clinic is null ? null : ToDto(clinic);
    }

    public async Task<ClinicDto> CreateAsync(CreateClinicDto dto)
    {
        Validate(dto);

        var clinic = new Clinic
        {
            Name = dto.Name.Trim(),
            LogoUrl = CleanOptional(dto.LogoUrl),
            Email = CleanOptional(dto.Email),
            Address = CleanOptional(dto.Address),
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        var savedClinic = await _repository.AddAsync(clinic);

        return ToDto(savedClinic);
    }

    public async Task<ClinicDto?> UpdateAsync(
        int id,
        UpdateClinicDto dto)
    {
        Validate(dto);

        var clinic = await _repository.GetByIdAsync(id);

        if (clinic is null)
        {
            return null;
        }

        clinic.Name = dto.Name.Trim();
        clinic.LogoUrl = CleanOptional(dto.LogoUrl);
        clinic.Email = CleanOptional(dto.Email);
        clinic.Address = CleanOptional(dto.Address);
        clinic.IsActive = dto.IsActive;

        await _repository.UpdateAsync(clinic);

        return ToDto(clinic);
    }

    private static ClinicDto ToDto(Clinic clinic)
    {
        return new ClinicDto
        {
            Id = clinic.Id,
            Name = clinic.Name,
            LogoUrl = clinic.LogoUrl,
            Email = clinic.Email,
            Address = clinic.Address,
            IsActive = clinic.IsActive,
            CreatedAt = clinic.CreatedAt
        };
    }

    private static string? CleanOptional(string? value)
    {
        return string.IsNullOrWhiteSpace(value)
            ? null
            : value.Trim();
    }

    private static void Validate(object dto)
    {
        Validator.ValidateObject(
            dto,
            new ValidationContext(dto),
            validateAllProperties: true
        );
    }
}