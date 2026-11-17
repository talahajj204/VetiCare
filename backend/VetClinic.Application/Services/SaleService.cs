using System.ComponentModel.DataAnnotations;
using VetClinic.Application.DTOs;
using VetClinic.Application.Interfaces;
using VetClinic.Core.Entities;
using VetClinic.Core.Interfaces;

namespace VetClinic.Application.Services;

public class SaleService : ISaleService
{
    private const decimal ExchangeRate = 89500m;
    private const decimal MaxMoney = 9999999999999999.99m;

    private readonly ISaleRepository _repository;
    private readonly IPosOperationsRepository _posRepository;

    public SaleService(
        ISaleRepository repository,
        IPosOperationsRepository posRepository)
    {
        _repository = repository;
        _posRepository = posRepository;
    }

    public async Task<List<SaleDto>> GetAllAsync(int clinicId)
    {
        ValidateClinicId(clinicId);

        var sales = await _repository.GetAllAsync(clinicId);

        return sales.Select(ToDto).ToList();
    }

    public async Task<SaleDto?> GetByIdAsync(
        int id,
        int clinicId)
    {
        ValidateClinicId(clinicId);

        var sale = await _repository.GetByIdAsync(
            id,
            clinicId);

        return sale is null ? null : ToDto(sale);
    }

    public async Task<SaleDto> CreateAsync(
        int clinicId,
        CreateSaleDto dto)
    {
        ValidateClinicId(clinicId);

        Validator.ValidateObject(
            dto,
            new ValidationContext(dto),
            validateAllProperties: true);

        if (dto.RequestId == Guid.Empty)
        {
            throw new ValidationException(
                "A valid sale request ID is required.");
        }

        var paymentMethod = dto.PaymentMethod.Trim();

        if (string.IsNullOrWhiteSpace(paymentMethod))
        {
            throw new ValidationException(
                "Please select a payment method.");
        }

        if (dto.Items is null ||
            dto.Items.Count == 0 ||
            dto.Items.Count > 200)
        {
            throw new ValidationException(
                "A sale must contain between 1 and 200 items.");
        }

        ValidateMoney(dto.Discount);
        ValidateMoney(dto.ReceivedUsd);
        ValidateMoney(dto.ReceivedLbp);

        foreach (var item in dto.Items)
        {
            if (item is null)
            {
                throw new ValidationException(
                    "A sale item is invalid.");
            }

            Validator.ValidateObject(
                item,
                new ValidationContext(item),
                validateAllProperties: true);
        }

        var quantities = new SortedDictionary<int, int>();

        foreach (var item in dto.Items)
        {
            quantities.TryGetValue(
                item.ProductId,
                out var currentQuantity);

            if (currentQuantity > int.MaxValue - item.Quantity)
            {
                throw new ValidationException(
                    "A product quantity is too large.");
            }

            quantities[item.ProductId] =
                currentQuantity + item.Quantity;
        }

        return await _repository.ExecuteInTransactionAsync(
            async () =>
            {
                var existing = await _repository
                    .GetByRequestIdAsync(
                        dto.RequestId,
                        clinicId);

                if (existing is not null)
                {
                    ValidateRepeatedRequest(
                        existing,
                        dto,
                        paymentMethod,
                        quantities);

                    if (dto.HeldSaleId.HasValue)
                    {
                        var previousHeld =
                            await _posRepository.GetHeldSaleAsync(
                                dto.HeldSaleId.Value,
                                clinicId);

                        if (previousHeld is null ||
                            previousHeld.CompletedSaleId !=
                                existing.Id)
                        {
                            throw new ValidationException(
                                "This request ID belongs to " +
                                "a different held-sale checkout.");
                        }
                    }

                    return ToDto(existing);
                }

                HeldSale? heldSale = null;

                if (dto.HeldSaleId.HasValue)
                {
                    heldSale =
                        await _posRepository.GetHeldSaleAsync(
                            dto.HeldSaleId.Value,
                            clinicId)
                        ?? throw new ValidationException(
                            "The held sale was not found.");

                    if (heldSale.CompletedSaleId.HasValue)
                    {
                        throw new ValidationException(
                            "This held sale has already " +
                            "been completed.");
                    }
                }

                if (!await _repository.PaymentMethodExistsAsync(
                    clinicId,
                    paymentMethod))
                {
                    throw new ValidationException(
                        "Select an active payment method " +
                        "configured in Settings.");
                }

                var customerName =
                    dto.CustomerName?.Trim() ?? string.Empty;

                if (dto.OwnerId.HasValue)
                {
                    var owner = await _repository.GetOwnerAsync(
                        dto.OwnerId.Value,
                        clinicId)
                        ?? throw new ValidationException(
                            "The selected owner was not found " +
                            "in your clinic.");

                    customerName =
                        $"{owner.FirstName} {owner.LastName}".Trim();
                }
                else if (string.IsNullOrWhiteSpace(customerName))
                {
                    customerName = "Walk-in Customer";
                }

                if (customerName.Length > 200)
                {
                    throw new ValidationException(
                        "Customer name must be 200 characters " +
                        "or fewer.");
                }

                var sale = new Sale
                {
                    ClinicId = clinicId,
                    RequestId = dto.RequestId,
                    OwnerId = dto.OwnerId,
                    CustomerName = customerName,
                    PaymentMethod = paymentMethod,
                    HasDelivery = dto.HasDelivery,
                    DeliveryStatus = dto.HasDelivery
                        ? "Pending"
                        : "NotRequired",
                    Discount = dto.Discount,
                    ReceivedUsd = dto.ReceivedUsd,
                    ReceivedLbp = dto.ReceivedLbp,
                    ExchangeRate = ExchangeRate,
                    CreatedAt = DateTime.UtcNow
                };

                foreach (var entry in quantities)
                {
                    var product =
                        await _repository.GetProductAsync(
                            entry.Key,
                            clinicId)
                        ?? throw new ValidationException(
                            "A selected product was not found " +
                            "in your clinic.");

                    if (!product.ShowOnPOS)
                    {
                        throw new ValidationException(
                            $"'{product.Name}' is not available " +
                            "on the POS.");
                    }

                    if (product.Quantity < entry.Value)
                    {
                        throw new ValidationException(
                            $"Not enough stock for '{product.Name}'. " +
                            $"Available: {product.Quantity}.");
                    }

                    ValidateMoney(product.SellingPrice);

                    var lineTotal =
                        product.SellingPrice * entry.Value;

                    ValidateMoney(lineTotal);

                    sale.Items.Add(new SaleItem
                    {
                        ClinicId = clinicId,
                        Sale = sale,
                        Product = product,
                        ProductName = product.Name,
                        CategoryName = product.Category.Title,
                        Quantity = entry.Value,
                        UnitPrice = product.SellingPrice,
                        Total = lineTotal
                    });

                    sale.Subtotal += lineTotal;
                    ValidateMoney(sale.Subtotal);

                    product.Quantity -= entry.Value;
                }

                if (sale.Discount > sale.Subtotal)
                {
                    throw new ValidationException(
                        "Discount cannot exceed the subtotal.");
                }

                sale.Total = sale.Subtotal - sale.Discount;

                var paid =
                    sale.ReceivedUsd +
                    sale.ReceivedLbp / sale.ExchangeRate;

                sale.TotalPaid = RoundMoney(paid);

                if (paid + 0.000001m < sale.Total)
                {
                    throw new ValidationException(
                        "Amount received is less than " +
                        "the amount due.");
                }

                sale.Change = RoundMoney(
                    Math.Max(paid - sale.Total, 0m));

                ValidateMoney(sale.Total);
                ValidateMoney(sale.TotalPaid);
                ValidateMoney(sale.Change);

                await _repository.AddAsync(sale);

                if (heldSale is not null)
                {
                    heldSale.CompletedSale = sale;
                }

                await _repository.SaveChangesAsync();

                return ToDto(sale);
            });
    }

    private static void ValidateRepeatedRequest(
        Sale existing,
        CreateSaleDto dto,
        string paymentMethod,
        SortedDictionary<int, int> quantities)
    {
        var sameItems =
            existing.Items.Count == quantities.Count &&
            existing.Items.All(item =>
                quantities.TryGetValue(
                    item.ProductId,
                    out var quantity) &&
                quantity == item.Quantity);

        var sameCustomer =
            dto.OwnerId.HasValue ||
            string.Equals(
                existing.CustomerName,
                string.IsNullOrWhiteSpace(dto.CustomerName)
                    ? "Walk-in Customer"
                    : dto.CustomerName.Trim(),
                StringComparison.Ordinal);

        if (!sameItems ||
            !sameCustomer ||
            existing.OwnerId != dto.OwnerId ||
            existing.PaymentMethod != paymentMethod ||
            existing.HasDelivery != dto.HasDelivery ||
            existing.Discount != dto.Discount ||
            existing.ReceivedUsd != dto.ReceivedUsd ||
            existing.ReceivedLbp != dto.ReceivedLbp)
        {
            throw new ValidationException(
                "This request ID belongs to a different sale. " +
                "Start a new checkout.");
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

    private static SaleDto ToDto(Sale sale)
    {
        return new SaleDto
        {
            Id = sale.Id,
            RequestId = sale.RequestId,
            OwnerId = sale.OwnerId,
            CustomerName = sale.CustomerName,
            PaymentMethod = sale.PaymentMethod,
            HasDelivery = sale.HasDelivery,
            DeliveryStatus = sale.DeliveryStatus,
            DeliveredAt = sale.DeliveredAt,
            Subtotal = sale.Subtotal,
            Discount = sale.Discount,
            Total = sale.Total,
            ReceivedUsd = sale.ReceivedUsd,
            ReceivedLbp = sale.ReceivedLbp,
            ExchangeRate = sale.ExchangeRate,
            TotalPaid = sale.TotalPaid,
            Change = sale.Change,
            CreatedAt = sale.CreatedAt,

            Items = sale.Items
                .OrderBy(item => item.Id)
                .Select(item => new SaleItemDto
                {
                    Id = item.Id,
                    ProductId = item.ProductId,
                    ProductName = item.ProductName,
                    CategoryName = item.CategoryName,
                    Quantity = item.Quantity,
                    UnitPrice = item.UnitPrice,
                    Total = item.Total
                })
                .ToList()
        };
    }
}