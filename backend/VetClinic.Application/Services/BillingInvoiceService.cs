using System.ComponentModel.DataAnnotations;
using VetClinic.Application.DTOs;
using VetClinic.Application.Interfaces;
using VetClinic.Core.Entities;
using VetClinic.Core.Interfaces;

namespace VetClinic.Application.Services;

public class BillingInvoiceService : IBillingInvoiceService
{
    private const decimal MaxMoney = 9999999999999999.99m;

    private readonly IBillingInvoiceRepository _repository;

    public BillingInvoiceService(
        IBillingInvoiceRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<BillingInvoiceDto>> GetAllAsync(
        int clinicId)
    {
        await ValidateClinicAsync(clinicId);

        var invoices = await _repository.GetAllAsync(clinicId);

        return invoices.Select(ToDto).ToList();
    }

    public async Task<BillingInvoiceDto?> GetByIdAsync(
        int id,
        int clinicId)
    {
        await ValidateClinicAsync(clinicId);
        ValidateId(id);

        var invoice = await _repository.GetByIdAsync(
            id,
            clinicId);

        return invoice is null ? null : ToDto(invoice);
    }

    public async Task<BillingInvoiceDto> CreateAsync(
        int clinicId,
        CreateBillingInvoiceDto dto)
    {
        await ValidateClinicAsync(clinicId);
        ValidateInput(dto);

        if (dto.RequestId == Guid.Empty)
        {
            throw new ValidationException(
                "A valid request ID is required.");
        }

        if (dto.Lines.Any(line => line.Id.HasValue))
        {
            throw new ValidationException(
                "New lines must not contain existing IDs.");
        }

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
                    ValidateRepeatedCreate(existing, dto);

                    return ToDto(existing);
                }

                var numberExists =
                    await _repository.InvoiceNumberExistsAsync(
                        clinicId,
                        dto.InvoiceNumber.Trim());

                if (numberExists)
                {
                    throw new ValidationException(
                        "An invoice with this number already exists in your clinic.");
                }

                await ValidateOptionsAsync(clinicId, dto);

                var now = DateTime.UtcNow;

                var invoice = new BillingInvoice
                {
                    ClinicId = clinicId,
                    RequestId = dto.RequestId,
                    InvoiceNumber = dto.InvoiceNumber.Trim(),
                    OwnerName = dto.OwnerName.Trim(),
                    Date = dto.Date,
                    Status = dto.Status.Trim(),
                    Total = CalculateTotal(dto.Lines),
                    AmountPaid = 0m,
                    CreatedAt = now,
                    UpdatedAt = now
                };

                ApplyLines(invoice, dto.Lines);

                await _repository.AddAsync(invoice);
                await _repository.SaveChangesAsync();

                return ToDto(invoice);
            });
    }

    public async Task<BillingInvoiceDto?> UpdateAsync(
        int id,
        int clinicId,
        UpdateBillingInvoiceDto dto)
    {
        await ValidateClinicAsync(clinicId);
        ValidateId(id);
        ValidateInput(dto);
        ValidateVersion(dto.RowVersion);

        return await _repository
            .ExecuteInTransactionAsync<BillingInvoiceDto?>(
                async () =>
                {
                    await ValidateClinicAsync(clinicId);

                    var invoice =
                        await _repository.GetByIdAsync(
                            id,
                            clinicId);

                    if (invoice is null)
                    {
                        return null;
                    }

                    EnsureVersion(invoice, dto.RowVersion);

                    var numberExists =
                        await _repository.InvoiceNumberExistsAsync(
                            clinicId,
                            dto.InvoiceNumber.Trim(),
                            id);

                    if (numberExists)
                    {
                        throw new ValidationException(
                            "An invoice with this number already exists in your clinic.");
                    }

                    var byId = invoice.Lines
                        .ToDictionary(line => line.Id);

                    var invalidLine = dto.Lines.Any(line =>
                        line.Id.HasValue &&
                        !byId.ContainsKey(line.Id.Value));

                    if (invalidLine)
                    {
                        throw new ValidationException(
                            "A line does not belong to this invoice.");
                    }

                    await ValidateOptionsAsync(
                        clinicId,
                        dto,
                        invoice);

                    var total = CalculateTotal(dto.Lines);

                    if (total < invoice.AmountPaid)
                    {
                        throw new ValidationException(
                            "The total cannot be less than payments already recorded.");
                    }

                    if (invoice.Payments.Count > 0 &&
                        !SameFinancialLines(invoice, dto))
                    {
                        throw new ValidationException(
                            "This invoice has recorded payments. Its status, name and date can be changed, " +
                            "but its paid line items cannot be rewritten.");
                    }

                    _repository.SetOriginalRowVersion(
                        invoice,
                        dto.RowVersion);

                    invoice.InvoiceNumber =
                        dto.InvoiceNumber.Trim();

                    invoice.OwnerName = dto.OwnerName.Trim();
                    invoice.Date = dto.Date;

                    // Save the status selected from Settings.
                    invoice.Status = dto.Status.Trim();

                    invoice.Total = total;
                    invoice.UpdatedAt = DateTime.UtcNow;

                    ApplyLines(invoice, dto.Lines);

                    await _repository.SaveChangesAsync();

                    return ToDto(invoice);
                });
    }

    // Retained for compatibility with the existing interface/controller.
    public Task<BillingInvoiceDto?> RecordPaymentAsync(
        int id,
        int clinicId,
        RecordBillingPaymentDto dto)
    {
        throw new ValidationException(
            "Payment recording is not enabled in this billing workflow.");
    }

    public async Task<bool> DeleteAsync(
        int id,
        int clinicId,
        byte[] rowVersion)
    {
        await ValidateClinicAsync(clinicId);
        ValidateId(id);
        ValidateVersion(rowVersion);

        return await _repository.ExecuteInTransactionAsync(
            async () =>
            {
                await ValidateClinicAsync(clinicId);

                var invoice = await _repository.GetByIdAsync(
                    id,
                    clinicId);

                if (invoice is null)
                {
                    return false;
                }

                EnsureVersion(invoice, rowVersion);

                if (invoice.Payments.Count > 0 ||
                    invoice.AmountPaid > 0m)
                {
                    throw new ValidationException(
                        "An invoice with recorded payments cannot be deleted.");
                }

                _repository.SetOriginalRowVersion(
                    invoice,
                    rowVersion);

                _repository.Remove(invoice);

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
                "A valid invoice ID is required.");
        }
    }

    private static void ValidateVersion(byte[]? rowVersion)
    {
        if (rowVersion is null || rowVersion.Length != 8)
        {
            throw new ValidationException(
                "Refresh and reopen the invoice before trying again.");
        }
    }

    private static void EnsureVersion(
        BillingInvoice invoice,
        byte[] rowVersion)
    {
        if (!invoice.RowVersion.SequenceEqual(rowVersion))
        {
            throw new ValidationException(
                "This invoice changed. Refresh and reopen it before trying again.");
        }
    }

    private static void ValidateInput(
        BillingInvoiceInputDto? dto)
    {
        if (dto is null)
        {
            throw new ValidationException(
                "Invoice details are required.");
        }

        Validator.ValidateObject(
            dto,
            new ValidationContext(dto),
            validateAllProperties: true);

        if (string.IsNullOrWhiteSpace(dto.InvoiceNumber) ||
            string.IsNullOrWhiteSpace(dto.OwnerName))
        {
            throw new ValidationException(
                "Invoice number and owner name are required.");
        }

        if (string.IsNullOrWhiteSpace(dto.Status))
        {
            throw new ValidationException(
                "Choose an invoice status saved in Settings.");
        }

        if (dto.Date == default)
        {
            throw new ValidationException(
                "Choose an invoice date.");
        }

        if (dto.Lines is null ||
            dto.Lines.Count is < 1 or > 200)
        {
            throw new ValidationException(
                "An invoice must have between 1 and 200 lines.");
        }

        var ids = new HashSet<int>();

        foreach (var line in dto.Lines)
        {
            if (line is null)
            {
                throw new ValidationException(
                    "An invoice line is invalid.");
            }

            Validator.ValidateObject(
                line,
                new ValidationContext(line),
                validateAllProperties: true);

            if (string.IsNullOrWhiteSpace(line.Type) ||
                string.IsNullOrWhiteSpace(line.Description))
            {
                throw new ValidationException(
                    "Each line needs a type and description.");
            }

            if (line.Id.HasValue &&
                !ids.Add(line.Id.Value))
            {
                throw new ValidationException(
                    "An invoice line ID is duplicated.");
            }

            ValidateMoney(line.UnitPrice);
        }

        CalculateTotal(dto.Lines);
    }

    private async Task ValidateOptionsAsync(
        int clinicId,
        BillingInvoiceInputDto dto,
        BillingInvoice? original = null)
    {
        var status = dto.Status.Trim();

        if (original?.Status != status &&
            !await _repository.StatusExistsAsync(
                clinicId,
                status))
        {
            throw new ValidationException(
                "Choose an active invoice status saved in Settings.");
        }

        var originals = original?.Lines
            .ToDictionary(line => line.Id);

        var activeTypes = new Dictionary<string, bool>(
            StringComparer.Ordinal);

        foreach (var line in dto.Lines)
        {
            var type = line.Type.Trim();

            if (line.Id.HasValue &&
                originals is not null &&
                originals.TryGetValue(
                    line.Id.Value,
                    out var oldLine) &&
                oldLine.Type == type)
            {
                continue;
            }

            if (!activeTypes.TryGetValue(type, out var active))
            {
                active =
                    await _repository.LineTypeExistsAsync(
                        clinicId,
                        type);

                activeTypes[type] = active;
            }

            if (!active)
            {
                throw new ValidationException(
                    "Choose invoice line types saved in Settings → Billing → Consultation.");
            }
        }
    }

    private void ApplyLines(
        BillingInvoice invoice,
        IEnumerable<BillingInvoiceLineInputDto> input)
    {
        var submitted = input.ToList();

        var originals = invoice.Lines
            .ToDictionary(line => line.Id);

        var retained = submitted
            .Where(line => line.Id.HasValue)
            .Select(line => line.Id!.Value)
            .ToHashSet();

        var removed = invoice.Lines
            .Where(line => !retained.Contains(line.Id))
            .ToList();

        _repository.RemoveLines(removed);

        foreach (var line in removed)
        {
            invoice.Lines.Remove(line);
        }

        for (var index = 0; index < submitted.Count; index++)
        {
            var source = submitted[index];

            BillingInvoiceLine target;

            if (source.Id.HasValue)
            {
                target = originals[source.Id.Value];
            }
            else
            {
                target = new BillingInvoiceLine
                {
                    ClinicId = invoice.ClinicId,
                    BillingInvoice = invoice
                };

                invoice.Lines.Add(target);
            }

            target.Type = source.Type.Trim();
            target.Description = source.Description.Trim();
            target.Quantity = source.Quantity;
            target.UnitPrice = source.UnitPrice;
            target.Total = source.Quantity * source.UnitPrice;
            target.SortOrder = index + 1;
        }
    }

    private static decimal CalculateTotal(
        IEnumerable<BillingInvoiceLineInputDto> lines)
    {
        decimal total = 0m;

        foreach (var line in lines)
        {
            var amount = line.Quantity * line.UnitPrice;

            ValidateMoney(amount);

            total += amount;

            ValidateMoney(total);
        }

        return total;
    }

    private static void ValidateMoney(decimal value)
    {
        if (value < 0m ||
            value > MaxMoney ||
            decimal.Round(value, 2) != value)
        {
            throw new ValidationException(
                "Amounts must be valid, non-negative and have at most two decimal places.");
        }
    }

    private static bool SameFinancialLines(
        BillingInvoice existing,
        BillingInvoiceInputDto dto)
    {
        var saved = existing.Lines
            .OrderBy(line => line.SortOrder)
            .ThenBy(line => line.Id)
            .ToList();

        if (saved.Count != dto.Lines.Count)
        {
            return false;
        }

        return saved
            .Select((line, index) =>
                line.Type == dto.Lines[index].Type.Trim() &&
                line.Description ==
                    dto.Lines[index].Description.Trim() &&
                line.Quantity == dto.Lines[index].Quantity &&
                line.UnitPrice == dto.Lines[index].UnitPrice)
            .All(same => same);
    }

    private static void ValidateRepeatedCreate(
        BillingInvoice existing,
        CreateBillingInvoiceDto dto)
    {
        if (existing.InvoiceNumber != dto.InvoiceNumber.Trim() ||
            existing.OwnerName != dto.OwnerName.Trim() ||
            existing.Date != dto.Date ||
            existing.Status != dto.Status.Trim() ||
            !SameFinancialLines(existing, dto))
        {
            throw new ValidationException(
                "This request ID belongs to a different invoice. Refresh the invoice list.");
        }
    }

    private static BillingInvoiceDto ToDto(
        BillingInvoice invoice)
    {
        return new BillingInvoiceDto
        {
            Id = invoice.Id,
            RequestId = invoice.RequestId,
            InvoiceNumber = invoice.InvoiceNumber,
            OwnerName = invoice.OwnerName,
            Date = invoice.Date,
            Status = invoice.Status,
            Total = invoice.Total,
            AmountPaid = invoice.AmountPaid,
            Balance = invoice.Total - invoice.AmountPaid,
            CreatedAt = invoice.CreatedAt,
            UpdatedAt = invoice.UpdatedAt,
            RowVersion = invoice.RowVersion.ToArray(),

            Lines = invoice.Lines
                .OrderBy(line => line.SortOrder)
                .ThenBy(line => line.Id)
                .Select(line => new BillingInvoiceLineDto
                {
                    Id = line.Id,
                    Type = line.Type,
                    Description = line.Description,
                    Quantity = line.Quantity,
                    UnitPrice = line.UnitPrice,
                    Total = line.Total,
                    SortOrder = line.SortOrder
                })
                .ToList(),

            Payments = invoice.Payments
                .OrderByDescending(payment => payment.CreatedAt)
                .ThenByDescending(payment => payment.Id)
                .Select(payment => new BillingPaymentDto
                {
                    Id = payment.Id,
                    RequestId = payment.RequestId,
                    Amount = payment.Amount,
                    PaymentMethod = payment.PaymentMethod,
                    Notes = payment.Notes,
                    CreatedAt = payment.CreatedAt
                })
                .ToList()
        };
    }
}