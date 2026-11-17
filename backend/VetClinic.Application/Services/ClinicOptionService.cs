using System.ComponentModel.DataAnnotations;
using VetClinic.Application.DTOs;
using VetClinic.Application.Interfaces;
using VetClinic.Core.Entities;
using VetClinic.Core.Interfaces;

namespace VetClinic.Application.Services;

public class ClinicOptionService : IClinicOptionService
{
    private readonly IClinicOptionRepository _repository;

    private static readonly Dictionary<string, int> AllowedLists =
        new(StringComparer.Ordinal)
        {
            ["appointments.types"] = 100,
            ["appointments.statuses"] = 100,

            ["vaccination.vaccineNames"] = 200,
            ["vaccination.statuses"] = 100,

            ["reminder.types"] = 100,
            ["reminder.statuses"] = 100,

            ["billing.consultations"] = 100,
            ["billing.statuses"] = 100,

            ["users.roles"] = 100,
            ["pos.paymentMethods"] = 100,

            // Existing settings lists.
            ["medicalRecords"] = 100,
            ["petOwners"] = 100,
            ["medication"] = 100,
            ["ordersSalesBilling"] = 100,
            ["revenueExpenses"] = 100,
            ["userAuditLog"] = 100,

            // Preserve previous unsorted lists.
            ["appointments"] = 200,
            ["vaccination"] = 200,
            ["reminder"] = 200
        };

    public ClinicOptionService(
        IClinicOptionRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<ClinicOptionDto>> GetAllAsync(
        int clinicId,
        string? listKey = null,
        bool includeInactive = false)
    {
        ValidateClinicId(clinicId);

        string? key = null;

        if (!string.IsNullOrWhiteSpace(listKey))
        {
            key = ValidateListKey(listKey);
        }

        var options = await _repository.GetAllAsync(
            clinicId,
            key,
            includeInactive);

        return options.Select(ToDto).ToList();
    }

    public async Task<ClinicOptionDto?> GetByIdAsync(
        int id,
        int clinicId)
    {
        ValidateClinicId(clinicId);

        var option = await _repository.GetByIdAsync(
            id,
            clinicId);

        return option is null ? null : ToDto(option);
    }

    public async Task<ClinicOptionDto> CreateAsync(
        int clinicId,
        CreateClinicOptionDto dto)
    {
        ValidateClinicId(clinicId);

        Validator.ValidateObject(
            dto,
            new ValidationContext(dto),
            validateAllProperties: true);

        var key = ValidateListKey(dto.ListKey);
        var value = ValidateValue(key, dto.Value);

        if (await _repository.ExistsAsync(
            clinicId,
            key,
            value))
        {
            throw new ValidationException(
                "This option already exists in this list. " +
                "If it is inactive, reactivate it instead.");
        }

        var option = new ClinicOption
        {
            ClinicId = clinicId,
            ListKey = key,
            Value = value,
            SortOrder = dto.SortOrder,
            IsActive = dto.IsActive,
            CreatedAt = DateTime.UtcNow
        };

        await _repository.AddAsync(option);
        await _repository.SaveChangesAsync();

        return ToDto(option);
    }

    public async Task<ClinicOptionDto?> UpdateAsync(
        int id,
        int clinicId,
        UpdateClinicOptionDto dto)
    {
        ValidateClinicId(clinicId);

        Validator.ValidateObject(
            dto,
            new ValidationContext(dto),
            validateAllProperties: true);

        var option = await _repository.GetByIdAsync(
            id,
            clinicId);

        if (option is null)
        {
            return null;
        }

        var key = ValidateListKey(option.ListKey);
        var value = ValidateValue(key, dto.Value);

        if (await _repository.ExistsAsync(
            clinicId,
            key,
            value,
            excludeId: id))
        {
            throw new ValidationException(
                "This option already exists in this list.");
        }

        option.Value = value;
        option.SortOrder = dto.SortOrder;
        option.IsActive = dto.IsActive;

        await _repository.SaveChangesAsync();

        return ToDto(option);
    }

    private static void ValidateClinicId(int clinicId)
    {
        if (clinicId <= 0)
        {
            throw new ValidationException(
                "A valid clinic is required.");
        }
    }

    private static string ValidateListKey(string? listKey)
    {
        var key = listKey?.Trim() ?? string.Empty;

        if (!AllowedLists.ContainsKey(key))
        {
            throw new ValidationException(
                "The selected option list is not supported.");
        }

        return key;
    }

    private static string ValidateValue(
        string listKey,
        string? value)
    {
        var trimmed = value?.Trim() ?? string.Empty;
        var maxLength = AllowedLists[listKey];

        if (string.IsNullOrWhiteSpace(trimmed))
        {
            throw new ValidationException(
                "Please enter an option name.");
        }

        if (trimmed.Length > maxLength)
        {
            throw new ValidationException(
                $"Option name must be {maxLength} " +
                "characters or fewer.");
        }

        return trimmed;
    }

    private static ClinicOptionDto ToDto(ClinicOption option)
    {
        return new ClinicOptionDto
        {
            Id = option.Id,
            ListKey = option.ListKey,
            Value = option.Value,
            SortOrder = option.SortOrder,
            IsActive = option.IsActive
        };
    }
}