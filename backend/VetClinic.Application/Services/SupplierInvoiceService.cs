using System.ComponentModel.DataAnnotations;
using VetClinic.Application.DTOs;
using VetClinic.Application.Interfaces;
using VetClinic.Core.Entities;
using VetClinic.Core.Interfaces;

namespace VetClinic.Application.Services;

public class SupplierInvoiceService : ISupplierInvoiceService
{
    private const decimal MaxMoney = 9999999999999999.99m;

    private readonly ISupplierInvoiceRepository _repository;

    public SupplierInvoiceService(
        ISupplierInvoiceRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<SupplierInvoiceDto>> GetAllAsync(
        int clinicId)
    {
        ValidateClinicId(clinicId);

        var invoices = await _repository.GetAllAsync(clinicId);

        return invoices.Select(ToDto).ToList();
    }

    public async Task<SupplierInvoiceDto?> GetByIdAsync(
        int id,
        int clinicId)
    {
        ValidateClinicId(clinicId);

        var invoice = await _repository.GetByIdAsync(
            id,
            clinicId);

        return invoice is null ? null : ToDto(invoice);
    }

    public async Task<SupplierInvoiceDto> CreateAsync(
        int clinicId,
        CreateSupplierInvoiceDto dto)
    {
        ValidateClinicId(clinicId);

        Validator.ValidateObject(
            dto,
            new ValidationContext(dto),
            validateAllProperties: true);

        var supplierName = dto.SupplierName.Trim();
        var invoiceNumber = dto.InvoiceNumber.Trim();

        if (string.IsNullOrWhiteSpace(supplierName) ||
            string.IsNullOrWhiteSpace(invoiceNumber))
        {
            throw new ValidationException(
                "Supplier name and invoice number are required.");
        }

        if (dto.Date is null || dto.Date.Value == default)
        {
            throw new ValidationException(
                "A valid invoice date is required.");
        }

        if (dto.Items is null || dto.Items.Count == 0)
        {
            throw new ValidationException(
                "Add at least one invoice item.");
        }

        if (decimal.Round(dto.TaxRate, 2) != dto.TaxRate)
        {
            throw new ValidationException(
                "Tax rate must have at most two decimal places.");
        }

        foreach (var item in dto.Items)
        {
            if (item is null)
            {
                throw new ValidationException(
                    "An invoice item is invalid.");
            }

            Validator.ValidateObject(
                item,
                new ValidationContext(item),
                validateAllProperties: true);

            ValidateMoney(item.PurchasePrice);

            if (!item.ProductId.HasValue &&
                (!item.CategoryId.HasValue ||
                 string.IsNullOrWhiteSpace(item.ProductName)))
            {
                throw new ValidationException(
                    "Choose an existing product, or enter a " +
                    "new product name and category.");
            }
        }

        return await _repository.ExecuteInTransactionAsync(
            async () =>
            {
                if (await _repository.InvoiceExistsAsync(
                    clinicId,
                    supplierName,
                    invoiceNumber))
                {
                    throw new ValidationException(
                        "This invoice number already exists " +
                        "for this supplier.");
                }

                var invoice = new SupplierInvoice
                {
                    ClinicId = clinicId,
                    SupplierName = supplierName,
                    InvoiceNumber = invoiceNumber,
                    Date = dto.Date.Value,
                    Notes = dto.Notes?.Trim() ?? string.Empty,
                    TaxRate = dto.TaxRate,
                    CreatedAt = DateTime.UtcNow
                };

                var newProductNames = new HashSet<string>(
                    StringComparer.OrdinalIgnoreCase);

                foreach (var item in dto.Items)
                {
                    Product product;

                    if (item.ProductId.HasValue)
                    {
                        product = await _repository.GetProductAsync(
                            item.ProductId.Value,
                            clinicId)
                            ?? throw new ValidationException(
                                "A selected product was not found " +
                                "in your clinic.");

                        if (product.Quantity < 0 ||
                            product.Quantity >
                                int.MaxValue - item.Quantity)
                        {
                            throw new ValidationException(
                                $"The stock quantity for " +
                                $"'{product.Name}' is invalid or too large.");
                        }

                        product.Quantity += item.Quantity;
                        product.PurchasePrice = item.PurchasePrice;
                    }
                    else
                    {
                        var productName = item.ProductName.Trim();

                        if (!newProductNames.Add(productName) ||
                            await _repository.ProductNameExistsAsync(
                                clinicId,
                                productName))
                        {
                            throw new ValidationException(
                                $"A product named '{productName}' " +
                                "already exists. Select it as an " +
                                "existing product.");
                        }

                        var category =
                            await _repository.GetCategoryAsync(
                                item.CategoryId!.Value,
                                clinicId)
                            ?? throw new ValidationException(
                                "The selected category was not " +
                                "found in your clinic.");

                        product = new Product
                        {
                            ClinicId = clinicId,
                            CategoryId = category.Id,
                            Category = category,
                            Name = productName,
                            Description = string.Empty,
                            Quantity = item.Quantity,
                            MinimumStock = 0,
                            PurchasePrice = item.PurchasePrice,
                            SellingPrice = 0,
                            Image = string.Empty,
                            ShowOnStore = false,
                            ShowOnPOS = false,
                            Featured = false,
                            CreatedAt = DateTime.UtcNow
                        };

                        await _repository.AddProductAsync(product);
                    }

                    var subtotal = RoundMoney(
                        item.PurchasePrice * item.Quantity);

                    var taxAmount = item.IsTaxable
                        ? RoundMoney(
                            subtotal * invoice.TaxRate / 100m)
                        : 0m;

                    var total = subtotal + taxAmount;

                    ValidateMoney(subtotal);
                    ValidateMoney(taxAmount);
                    ValidateMoney(total);

                    invoice.Items.Add(new SupplierInvoiceItem
                    {
                        ClinicId = clinicId,
                        SupplierInvoice = invoice,
                        Product = product,
                        ProductName = product.Name,
                        CategoryName = product.Category.Title,
                        Quantity = item.Quantity,
                        PurchasePrice = item.PurchasePrice,
                        IsTaxable = item.IsTaxable,
                        Subtotal = subtotal,
                        TaxAmount = taxAmount,
                        Total = total
                    });

                    invoice.Subtotal += subtotal;
                    invoice.TaxTotal += taxAmount;
                    invoice.Total += total;

                    ValidateMoney(invoice.Subtotal);
                    ValidateMoney(invoice.TaxTotal);
                    ValidateMoney(invoice.Total);
                }

                await _repository.AddAsync(invoice);
                await _repository.SaveChangesAsync();

                return ToDto(invoice);
            });
    }

    private static void ValidateClinicId(int clinicId)
    {
        if (clinicId <= 0)
        {
            throw new ValidationException(
                "A valid clinic is required.");
        }
    }

    private static decimal RoundMoney(decimal value)
    {
        return decimal.Round(
            value,
            2,
            MidpointRounding.AwayFromZero);
    }

    private static void ValidateMoney(decimal value)
    {
        if (value < 0 || value > MaxMoney)
        {
            throw new ValidationException(
                "A monetary amount is outside the allowed range.");
        }

        if (decimal.Round(value, 2) != value)
        {
            throw new ValidationException(
                "Monetary amounts must have at most " +
                "two decimal places.");
        }
    }

    private static SupplierInvoiceDto ToDto(
        SupplierInvoice invoice)
    {
        return new SupplierInvoiceDto
        {
            Id = invoice.Id,
            SupplierName = invoice.SupplierName,
            InvoiceNumber = invoice.InvoiceNumber,
            Date = invoice.Date,
            Notes = invoice.Notes,
            TaxRate = invoice.TaxRate,
            Subtotal = invoice.Subtotal,
            TaxTotal = invoice.TaxTotal,
            Total = invoice.Total,
            CreatedAt = invoice.CreatedAt,

            Items = invoice.Items
                .OrderBy(item => item.Id)
                .Select(item => new SupplierInvoiceItemDto
                {
                    Id = item.Id,
                    ProductId = item.ProductId,
                    ProductName = item.ProductName,
                    CategoryName = item.CategoryName,
                    Quantity = item.Quantity,
                    PurchasePrice = item.PurchasePrice,
                    IsTaxable = item.IsTaxable,
                    Subtotal = item.Subtotal,
                    TaxAmount = item.TaxAmount,
                    Total = item.Total
                })
                .ToList()
        };
    }
}