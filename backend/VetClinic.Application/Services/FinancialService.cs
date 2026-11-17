using System.ComponentModel.DataAnnotations;
using VetClinic.Application.DTOs;
using VetClinic.Application.Interfaces;
using VetClinic.Core.Entities;
using VetClinic.Core.Interfaces;

namespace VetClinic.Application.Services;

public class FinancialService : IFinancialService
{
    private readonly IFinancialRepository _repository;

    private static readonly HashSet<string> RevenueTypes =
        new(StringComparer.Ordinal)
        {
            "Visit",
            "Vaccination",
            "Medication",
            "Prescription",
            "Surgery",
            "Laboratory",
            "Grooming",
            "Other"
        };

    private static readonly HashSet<string> ExpenseTypes =
        new(StringComparer.Ordinal)
        {
            "Medical Supplies",
            "Medication",
            "Equipment",
            "Salary",
            "Rent",
            "Utilities",
            "Maintenance",
            "Marketing",
            "Other"
        };

    public FinancialService(IFinancialRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<FinancialEntryDto>> GetAllAsync(
        int clinicId)
    {
        await ValidateClinicAsync(clinicId);

        var entries =
            await _repository.GetAllAsync(clinicId);

        return entries.Select(ToDto).ToList();
    }

    public async Task<FinancialEntryDto?> GetByIdAsync(
        int id,
        int clinicId)
    {
        await ValidateClinicAsync(clinicId);
        ValidateId(id);

        var entry = await _repository.GetByIdAsync(
            id,
            clinicId);

        return entry is null ? null : ToDto(entry);
    }

    public async Task<FinancialEntryDto> CreateAsync(
        int clinicId,
        CreateFinancialEntryDto dto)
    {
        await ValidateClinicAsync(clinicId);
        ValidateInput(dto);

        var kind = dto.Kind;
        var type = dto.Type.Trim();
        var description = dto.Description.Trim();

        return await _repository.ExecuteInTransactionAsync(
            async () =>
            {
                await ValidateClinicAsync(clinicId);

                var existing =
                    await _repository.GetByRequestIdAsync(
                        dto.RequestId,
                        clinicId);

                if (existing is not null)
                {
                    var sameRequest =
                        existing.Kind == kind &&
                        existing.Date == dto.Date &&
                        existing.Type == type &&
                        existing.Description == description &&
                        existing.Amount == dto.Amount;

                    if (!sameRequest)
                    {
                        throw new ValidationException(
                            "This request ID belongs to a different record. Refresh the page.");
                    }

                    return ToDto(existing);
                }

                var entry = new FinancialEntry
                {
                    ClinicId = clinicId,
                    RequestId = dto.RequestId,
                    Kind = kind,
                    Date = dto.Date,
                    Type = type,
                    Description = description,
                    Amount = dto.Amount,
                    CreatedAt = DateTime.UtcNow
                };

                await _repository.AddAsync(entry);
                await _repository.SaveChangesAsync();

                return ToDto(entry);
            });
    }

    public async Task<bool> DeleteAsync(
        int id,
        int clinicId)
    {
        await ValidateClinicAsync(clinicId);
        ValidateId(id);

        return await _repository.ExecuteInTransactionAsync(
            async () =>
            {
                await ValidateClinicAsync(clinicId);

                var entry = await _repository.GetByIdAsync(
                    id,
                    clinicId);

                if (entry is null)
                {
                    return false;
                }

                _repository.Remove(entry);

                await _repository.SaveChangesAsync();

                return true;
            });
    }

    private async Task ValidateClinicAsync(int clinicId)
    {
        if (clinicId <= 0 ||
            !await _repository.IsClinicActiveAsync(clinicId))
        {
            throw new ValidationException(
                "A valid active clinic is required.");
        }
    }

    private static void ValidateId(int id)
    {
        if (id <= 0)
        {
            throw new ValidationException(
                "A valid financial record ID is required.");
        }
    }

    private static void ValidateInput(
        CreateFinancialEntryDto? dto)
    {
        if (dto is null)
        {
            throw new ValidationException(
                "Financial record details are required.");
        }

        Validator.ValidateObject(
            dto,
            new ValidationContext(dto),
            validateAllProperties: true);

        if (dto.RequestId == Guid.Empty)
        {
            throw new ValidationException(
                "A valid request ID is required.");
        }

        if (dto.Date == default)
        {
            throw new ValidationException(
                "Choose a date.");
        }

        if (string.IsNullOrWhiteSpace(dto.Type))
        {
            throw new ValidationException(
                "Choose a type.");
        }

        if (string.IsNullOrWhiteSpace(dto.Description))
        {
            throw new ValidationException(
                "Enter a description.");
        }

        var type = dto.Type.Trim();

        if (dto.Kind == "Revenue")
        {
            if (!RevenueTypes.Contains(type))
            {
                throw new ValidationException(
                    "Choose a valid revenue type.");
            }
        }
        else if (dto.Kind == "Expense")
        {
            if (!ExpenseTypes.Contains(type))
            {
                throw new ValidationException(
                    "Choose a valid expense type.");
            }
        }
        else
        {
            throw new ValidationException(
                "Choose Revenue or Expense.");
        }

        if (dto.Amount < 0m ||
            dto.Amount > 9999999999999999.99m ||
            decimal.Round(dto.Amount, 2) != dto.Amount)
        {
            throw new ValidationException(
                "Amount must be non-negative and have at most two decimal places.");
        }
    }

    private static FinancialEntryDto ToDto(
        FinancialEntry entry)
    {
        return new FinancialEntryDto
        {
            Id = entry.Id,
            RequestId = entry.RequestId,
            Kind = entry.Kind,
            Date = entry.Date,
            Type = entry.Type,
            Description = entry.Description,
            Amount = entry.Amount,
            CreatedAt = entry.CreatedAt
        };
    }
}