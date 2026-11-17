using System.ComponentModel.DataAnnotations;
using VetClinic.Application.DTOs;
using VetClinic.Application.Interfaces;
using VetClinic.Core.Entities;
using VetClinic.Core.Interfaces;

namespace VetClinic.Application.Services;

public class PosOperationsService : IPosOperationsService
{
    private const decimal MaxMoney = 9999999999999999.99m;

    private readonly IPosOperationsRepository _repository;

    public PosOperationsService(
        IPosOperationsRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<HeldSaleDto>> GetHeldSalesAsync(
        int clinicId)
    {
        ValidateClinicId(clinicId);

        var heldSales =
            await _repository.GetHeldSalesAsync(clinicId);

        return heldSales.Select(ToHeldDto).ToList();
    }

    public async Task<HeldSaleDto?> GetHeldSaleAsync(
        int id,
        int clinicId)
    {
        ValidateClinicId(clinicId);

        var held = await _repository.GetHeldSaleAsync(
            id,
            clinicId);

        if (held is null || held.CompletedSaleId.HasValue)
        {
            return null;
        }

        return ToHeldDto(held);
    }

    public async Task<HeldSaleDto> HoldSaleAsync(
        int clinicId,
        string userId,
        CreateHeldSaleDto dto)
    {
        ValidateClinicId(clinicId);
        ValidateUserId(userId);

        Validator.ValidateObject(
            dto,
            new ValidationContext(dto),
            validateAllProperties: true);

        if (dto.RequestId == Guid.Empty)
        {
            throw new ValidationException(
                "A valid request ID is required.");
        }

        ValidateMoney(dto.Discount);

        var quantities = GetQuantities(dto.Items);

        return await _repository.ExecuteInTransactionAsync(
            async () =>
            {
                var existing =
                    await _repository.GetHeldSaleByRequestIdAsync(
                        dto.RequestId,
                        clinicId);

                if (existing is not null)
                {
                    var requestedName =
                        NormalizeCustomerName(dto.CustomerName);

                    var sameItems =
                        existing.Items.Count == quantities.Count &&
                        existing.Items.All(item =>
                            quantities.TryGetValue(
                                item.ProductId,
                                out var quantity) &&
                            quantity == item.Quantity);

                    var sameCustomer =
                        dto.OwnerId.HasValue ||
                        existing.CustomerName == requestedName;

                    if (!sameItems ||
                        !sameCustomer ||
                        existing.CreatedByUserId != userId ||
                        existing.OwnerId != dto.OwnerId ||
                        existing.Discount != dto.Discount ||
                        existing.HasDelivery != dto.HasDelivery)
                    {
                        throw new ValidationException(
                            "This request ID belongs to a " +
                            "different held sale.");
                    }

                    if (existing.CompletedSaleId.HasValue)
                    {
                        throw new ValidationException(
                            "This held sale has already " +
                            "been completed.");
                    }

                    return ToHeldDto(existing);
                }

                var customerName =
                    NormalizeCustomerName(dto.CustomerName);

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

                if (customerName.Length > 200)
                {
                    throw new ValidationException(
                        "Customer name must be 200 " +
                        "characters or fewer.");
                }

                var held = new HeldSale
                {
                    ClinicId = clinicId,
                    RequestId = dto.RequestId,
                    OwnerId = dto.OwnerId,
                    CustomerName = customerName,
                    CreatedByUserId = userId,
                    HasDelivery = dto.HasDelivery,
                    Discount = dto.Discount,
                    CreatedAt = DateTime.UtcNow
                };

                decimal subtotal = 0;

                foreach (var entry in quantities)
                {
                    var product = await _repository.GetProductAsync(
                        entry.Key,
                        clinicId)
                        ?? throw new ValidationException(
                            "A selected product was not found.");

                    if (!product.ShowOnPOS)
                    {
                        throw new ValidationException(
                            $"'{product.Name}' is not " +
                            "available on the POS.");
                    }

                    if (product.Quantity < entry.Value)
                    {
                        throw new ValidationException(
                            $"Not enough stock for " +
                            $"'{product.Name}'.");
                    }

                    ValidateMoney(product.SellingPrice);

                    subtotal +=
                        product.SellingPrice * entry.Value;

                    ValidateMoney(subtotal);

                    held.Items.Add(new HeldSaleItem
                    {
                        ClinicId = clinicId,
                        HeldSale = held,
                        Product = product,
                        ProductName = product.Name,
                        Quantity = entry.Value,
                        UnitPrice = product.SellingPrice
                    });
                }

                if (held.Discount > subtotal)
                {
                    throw new ValidationException(
                        "Discount cannot exceed the subtotal.");
                }

                // Holding a cart does not reserve or reduce stock.
                await _repository.AddHeldSaleAsync(held);
                await _repository.SaveChangesAsync();

                return ToHeldDto(held);
            });
    }

    public async Task<List<DeliverySaleDto>>
        GetPendingDeliveriesAsync(int clinicId)
    {
        ValidateClinicId(clinicId);

        var sales =
            await _repository.GetPendingDeliveriesAsync(clinicId);

        return sales.Select(ToDeliveryDto).ToList();
    }

    public async Task<DeliverySaleDto?> MarkDeliveredAsync(
        int saleId,
        int clinicId)
    {
        ValidateClinicId(clinicId);

        return await _repository
            .ExecuteInTransactionAsync<DeliverySaleDto?>(
                async () =>
                {
                    var sale = await _repository.GetSaleAsync(
                        saleId,
                        clinicId);

                    if (sale is null)
                    {
                        return null;
                    }

                    if (!sale.HasDelivery)
                    {
                        throw new ValidationException(
                            "This sale does not require delivery.");
                    }

                    if (sale.DeliveryStatus == "Delivered")
                    {
                        return ToDeliveryDto(sale);
                    }

                    if (sale.DeliveryStatus != "Pending")
                    {
                        throw new ValidationException(
                            "This sale is not awaiting delivery.");
                    }

                    var refunded =
                        await _repository.GetRefundItemsAsync(
                            saleId,
                            clinicId);

                    var fullyRefunded = sale.Items.All(item =>
                        refunded
                            .Where(refund =>
                                refund.SaleItemId == item.Id)
                            .Sum(refund =>
                                (long)refund.Quantity) >=
                        item.Quantity);

                    if (fullyRefunded)
                    {
                        throw new ValidationException(
                            "A fully refunded sale cannot " +
                            "be delivered.");
                    }

                    sale.DeliveryStatus = "Delivered";
                    sale.DeliveredAt = DateTime.UtcNow;

                    await _repository.SaveChangesAsync();

                    return ToDeliveryDto(sale);
                });
    }

    public async Task<List<RefundableSaleDto>>
        GetRefundableSalesAsync(int clinicId)
    {
        ValidateClinicId(clinicId);

        var sales =
            await _repository.GetSalesForRefundAsync(clinicId);

        var result = new List<RefundableSaleDto>();

        foreach (var sale in sales)
        {
            var refunds = await _repository.GetRefundItemsAsync(
                sale.Id,
                clinicId);

            var dto = new RefundableSaleDto
            {
                Id = sale.Id,
                CustomerName = sale.CustomerName,
                Total = sale.Total,
                RefundedTotal = refunds.Sum(item => item.Amount),
                CreatedAt = sale.CreatedAt,
                Items = sale.Items
                    .OrderBy(item => item.Id)
                    .Select(item =>
                    {
                        var refundedQuantity = refunds
                            .Where(refund =>
                                refund.SaleItemId == item.Id)
                            .Sum(refund => refund.Quantity);

                        return new RefundableSaleItemDto
                        {
                            SaleItemId = item.Id,
                            ProductName = item.ProductName,
                            SoldQuantity = item.Quantity,
                            RefundedQuantity = refundedQuantity,
                            RemainingQuantity = Math.Max(
                                item.Quantity - refundedQuantity,
                                0),
                            UnitPrice = item.UnitPrice
                        };
                    })
                    .ToList()
            };

            if (dto.Items.Any(item =>
                item.RemainingQuantity > 0))
            {
                result.Add(dto);
            }
        }

        return result;
    }    public async Task<SaleRefundDto> RefundSaleAsync(
        int clinicId,
        string userId,
        CreateSaleRefundDto dto)
    {
        ValidateClinicId(clinicId);
        ValidateUserId(userId);

        Validator.ValidateObject(
            dto,
            new ValidationContext(dto),
            validateAllProperties: true);

        if (dto.RequestId == Guid.Empty)
        {
            throw new ValidationException(
                "A valid request ID is required.");
        }

        var reason = dto.Reason.Trim();

        if (string.IsNullOrWhiteSpace(reason))
        {
            throw new ValidationException(
                "Please enter a refund reason.");
        }

        if (dto.Items is null ||
            dto.Items.Count == 0 ||
            dto.Items.Count > 200)
        {
            throw new ValidationException(
                "Select between 1 and 200 refund items.");
        }

        var quantities = new SortedDictionary<int, int>();

        foreach (var item in dto.Items)
        {
            if (item is null)
            {
                throw new ValidationException(
                    "A refund item is invalid.");
            }

            Validator.ValidateObject(
                item,
                new ValidationContext(item),
                validateAllProperties: true);

            quantities.TryGetValue(
                item.SaleItemId,
                out var previous);

            if (previous > int.MaxValue - item.Quantity)
            {
                throw new ValidationException(
                    "A refund quantity is too large.");
            }

            quantities[item.SaleItemId] =
                previous + item.Quantity;
        }

        return await _repository.ExecuteInTransactionAsync(
            async () =>
            {
                var existing =
                    await _repository.GetRefundByRequestIdAsync(
                        dto.RequestId,
                        clinicId);

                if (existing is not null)
                {
                    var sameItems =
                        existing.Items.Count == quantities.Count &&
                        existing.Items.All(item =>
                            quantities.TryGetValue(
                                item.SaleItemId,
                                out var quantity) &&
                            quantity == item.Quantity);

                    if (!sameItems ||
                        existing.SaleId != dto.SaleId ||
                        existing.Reason != reason ||
                        existing.CreatedByUserId != userId)
                    {
                        throw new ValidationException(
                            "This request ID belongs to a " +
                            "different refund.");
                    }

                    return ToRefundDto(existing);
                }

                var sale = await _repository.GetSaleAsync(
                    dto.SaleId,
                    clinicId)
                    ?? throw new ValidationException(
                        "The original sale was not found.");

                if (quantities.Keys.Any(id =>
                    !sale.Items.Any(item => item.Id == id)))
                {
                    throw new ValidationException(
                        "A selected item does not belong " +
                        "to this sale.");
                }

                var previousRefunds =
                    await _repository.GetRefundItemsAsync(
                        sale.Id,
                        clinicId);

                var refundableAmounts =
                    AllocateSaleTotal(sale);

                var refund = new SaleRefund
                {
                    ClinicId = clinicId,
                    RequestId = dto.RequestId,
                    SaleId = sale.Id,
                    Sale = sale,
                    CreatedByUserId = userId,
                    Reason = reason,
                    CreatedAt = DateTime.UtcNow
                };

                var selectedItems = sale.Items
                    .Where(item =>
                        quantities.ContainsKey(item.Id))
                    .OrderBy(item => item.ProductId)
                    .ThenBy(item => item.Id);

                foreach (var saleItem in selectedItems)
                {
                    var quantity = quantities[saleItem.Id];

                    var previousForItem = previousRefunds
                        .Where(item =>
                            item.SaleItemId == saleItem.Id)
                        .ToList();

                    var refundedQuantity = previousForItem
                        .Sum(item => (long)item.Quantity);

                    if (refundedQuantity + quantity >
                        saleItem.Quantity)
                    {
                        throw new ValidationException(
                            $"The refund quantity for " +
                            $"'{saleItem.ProductName}' exceeds " +
                            "the remaining refundable quantity.");
                    }

                    var product =
                        await _repository.GetProductAsync(
                            saleItem.ProductId,
                            clinicId)
                        ?? throw new ValidationException(
                            $"The product '{saleItem.ProductName}' " +
                            "was not found.");

                    if (product.Quantity < 0 ||
                        product.Quantity >
                            int.MaxValue - quantity)
                    {
                        throw new ValidationException(
                            $"The stock quantity for " +
                            $"'{product.Name}' is invalid " +
                            "or too large.");
                    }

                    var allocatedAmount =
                        refundableAmounts[saleItem.Id];

                    var nextRefundedQuantity =
                        refundedQuantity + quantity;

                    // Calculate the cumulative refund so the final
                    // returned unit receives any rounding remainder.
                    var cumulativeAmount = RoundMoney(
                        allocatedAmount *
                        nextRefundedQuantity /
                        saleItem.Quantity);

                    var alreadyRefundedAmount = previousForItem
                        .Sum(item => item.Amount);

                    var amount =
                        cumulativeAmount - alreadyRefundedAmount;

                    ValidateMoney(amount);

                    product.Quantity += quantity;

                    refund.Items.Add(new SaleRefundItem
                    {
                        ClinicId = clinicId,
                        SaleRefund = refund,
                        SaleItemId = saleItem.Id,
                        SaleItem = saleItem,
                        Quantity = quantity,
                        Amount = amount
                    });

                    refund.Total += amount;
                    ValidateMoney(refund.Total);
                }

                var totalPreviouslyRefunded =
                    previousRefunds.Sum(item => item.Amount);

                if (totalPreviouslyRefunded + refund.Total >
                    sale.Total)
                {
                    throw new ValidationException(
                        "The refund exceeds the original " +
                        "sale total.");
                }

                var fullyRefunded = sale.Items.All(item =>
                {
                    var previouslyReturned = previousRefunds
                        .Where(previous =>
                            previous.SaleItemId == item.Id)
                        .Sum(previous =>
                            (long)previous.Quantity);

                    quantities.TryGetValue(
                        item.Id,
                        out var requestedQuantity);

                    return previouslyReturned +
                        requestedQuantity == item.Quantity;
                });

                if (fullyRefunded &&
                    sale.DeliveryStatus == "Pending")
                {
                    sale.DeliveryStatus = "Cancelled";
                }

                await _repository.AddRefundAsync(refund);
                await _repository.SaveChangesAsync();

                return ToRefundDto(refund);
            });
    }

    private static Dictionary<int, decimal> AllocateSaleTotal(
        Sale sale)
    {
        ValidateMoney(sale.Subtotal);
        ValidateMoney(sale.Total);

        var items = sale.Items
            .OrderBy(item => item.Id)
            .ToList();

        if (items.Count == 0 ||
            items.Any(item =>
                item.Quantity <= 0 ||
                item.Total < 0) ||
            items.Sum(item => item.Total) != sale.Subtotal ||
            sale.Total > sale.Subtotal)
        {
            throw new ValidationException(
                "The original sale contains invalid totals.");
        }

        foreach (var item in items)
        {
            ValidateMoney(item.Total);
        }

        var result = items.ToDictionary(
            item => item.Id,
            _ => 0m);

        if (sale.Subtotal == 0)
        {
            return result;
        }

        // Distribute the discounted total across the original lines.
        // Work in cents so a full refund equals the sale total exactly.
        var totalCents = sale.Total * 100m;

        var allocations = items.Select(item =>
        {
            var exactCents =
                totalCents * (item.Total / sale.Subtotal);

            var wholeCents = decimal.Floor(exactCents);

            return new
            {
                item.Id,
                WholeCents = wholeCents,
                Remainder = exactCents - wholeCents
            };
        }).ToList();

        var remainingCents =
            totalCents -
            allocations.Sum(item => item.WholeCents);

        if (remainingCents < 0 ||
            remainingCents > allocations.Count ||
            decimal.Truncate(remainingCents) != remainingCents)
        {
            throw new ValidationException(
                "The refund allocation could not be calculated.");
        }

        foreach (var allocation in allocations)
        {
            result[allocation.Id] =
                allocation.WholeCents / 100m;
        }

        foreach (var allocation in allocations
            .OrderByDescending(item => item.Remainder)
            .ThenBy(item => item.Id)
            .Take((int)remainingCents))
        {
            result[allocation.Id] += 0.01m;
        }

        return result;
    }

    private static SortedDictionary<int, int> GetQuantities(
        List<CreateSaleItemDto>? items)
    {
        if (items is null ||
            items.Count == 0 ||
            items.Count > 200)
        {
            throw new ValidationException(
                "Select between 1 and 200 products.");
        }

        var quantities = new SortedDictionary<int, int>();

        foreach (var item in items)
        {
            if (item is null)
            {
                throw new ValidationException(
                    "A product item is invalid.");
            }

            Validator.ValidateObject(
                item,
                new ValidationContext(item),
                validateAllProperties: true);

            quantities.TryGetValue(
                item.ProductId,
                out var previous);

            if (previous > int.MaxValue - item.Quantity)
            {
                throw new ValidationException(
                    "A product quantity is too large.");
            }

            quantities[item.ProductId] =
                previous + item.Quantity;
        }

        return quantities;
    }

    private static string NormalizeCustomerName(string? name)
    {
        var trimmed = name?.Trim();

        return string.IsNullOrWhiteSpace(trimmed)
            ? "Walk-in Customer"
            : trimmed;
    }

    private static void ValidateClinicId(int clinicId)
    {
        if (clinicId <= 0)
        {
            throw new ValidationException(
                "A valid clinic is required.");
        }
    }

    private static void ValidateUserId(string userId)
    {
        if (string.IsNullOrWhiteSpace(userId) ||
            userId.Length > 450)
        {
            throw new ValidationException(
                "A valid user is required.");
        }
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

    private static decimal RoundMoney(decimal value)
    {
        return decimal.Round(
            value,
            2,
            MidpointRounding.AwayFromZero);
    }

    private static HeldSaleDto ToHeldDto(HeldSale held)
    {
        return new HeldSaleDto
        {
            Id = held.Id,
            RequestId = held.RequestId,
            OwnerId = held.OwnerId,
            CustomerName = held.CustomerName,
            HasDelivery = held.HasDelivery,
            Discount = held.Discount,
            CreatedAt = held.CreatedAt,
            CompletedSaleId = held.CompletedSaleId,

            Items = held.Items
                .OrderBy(item => item.Id)
                .Select(item => new HeldSaleItemDto
                {
                    ProductId = item.ProductId,
                    ProductName = item.ProductName,
                    Quantity = item.Quantity,
                    UnitPrice = item.UnitPrice
                })
                .ToList()
        };
    }

    private static DeliverySaleDto ToDeliveryDto(Sale sale)
    {
        return new DeliverySaleDto
        {
            Id = sale.Id,
            CustomerName = sale.CustomerName,
            Total = sale.Total,
            DeliveryStatus = sale.DeliveryStatus,
            CreatedAt = sale.CreatedAt,
            DeliveredAt = sale.DeliveredAt
        };
    }

    private static SaleRefundDto ToRefundDto(SaleRefund refund)
    {
        return new SaleRefundDto
        {
            Id = refund.Id,
            RequestId = refund.RequestId,
            SaleId = refund.SaleId,
            Reason = refund.Reason,
            Total = refund.Total,
            CreatedAt = refund.CreatedAt,

            Items = refund.Items
                .OrderBy(item => item.Id)
                .Select(item => new SaleRefundItemDto
                {
                    SaleItemId = item.SaleItemId,
                    ProductName = item.SaleItem.ProductName,
                    Quantity = item.Quantity,
                    Amount = item.Amount
                })
                .ToList()
        };
    }
}