using System.ComponentModel.DataAnnotations;
using System.Security.Cryptography;
using System.Text;
using VetClinic.Application.DTOs;
using VetClinic.Application.Interfaces;
using VetClinic.Core.Entities;
using VetClinic.Core.Interfaces;

namespace VetClinic.Application.Services;

public class StoreOrderService : IStoreOrderService
{
    private const decimal MaxMoney = 9999999999999999.99m;

    private readonly IStoreOrderRepository _repository;
    private readonly Func<int, decimal> _getDeliveryFee;

    public StoreOrderService(
        IStoreOrderRepository repository,
        Func<int, decimal> getDeliveryFee)
    {
        _repository = repository;
        _getDeliveryFee = getDeliveryFee;
    }

    public async Task<List<StoreOrderDto>> GetAllAsync(
        int clinicId)
    {
        await ValidateClinicAsync(clinicId);

        var orders = await _repository.GetAllAsync(clinicId);

        return orders.Select(ToDto).ToList();
    }

    public async Task<StoreOrderDto?> GetByIdAsync(
        int id,
        int clinicId)
    {
        await ValidateClinicAsync(clinicId);

        var order = await _repository.GetByIdAsync(
            id,
            clinicId);

        return order is null ? null : ToDto(order);
    }

    public async Task<StoreOrderDto?> GetCustomerOrderAsync(
        int id,
        int clinicId,
        string trackingToken)
    {
        await ValidateClinicAsync(clinicId);

        if (!IsValidToken(trackingToken))
        {
            return null;
        }

        var order = await _repository.GetByIdAsync(
            id,
            clinicId);

        if (order is null ||
            !TokenMatches(
                order.TrackingTokenHash,
                trackingToken))
        {
            return null;
        }

        return ToDto(order);
    }

    public async Task<StoreOrderDto> CreateAsync(
        int clinicId,
        string trackingToken,
        CreateStoreOrderDto dto)
    {
        await ValidateClinicAsync(clinicId);

        Validator.ValidateObject(
            dto,
            new ValidationContext(dto),
            validateAllProperties: true);

        if (dto.RequestId == Guid.Empty)
        {
            throw new ValidationException(
                "A valid request ID is required.");
        }

        if (!IsValidToken(trackingToken))
        {
            throw new ValidationException(
                "A valid order tracking token is required.");
        }

        var customerName = dto.CustomerName.Trim();
        var customerPhone = dto.CustomerPhone.Trim();
        var deliveryMethod = dto.DeliveryMethod.Trim();
        var paymentMethod = dto.PaymentMethod.Trim()
            .ToLowerInvariant();

        var address = dto.Address?.Trim() ?? string.Empty;
        var addressDetails =
            dto.AddressDetails?.Trim() ?? string.Empty;
        var notes = dto.Notes?.Trim() ?? string.Empty;

        if (string.IsNullOrWhiteSpace(customerName) ||
            string.IsNullOrWhiteSpace(customerPhone))
        {
            throw new ValidationException(
                "Customer name and phone are required.");
        }

        if (deliveryMethod != "delivery" &&
            deliveryMethod != "pickup")
        {
            throw new ValidationException(
                "Choose delivery or pickup.");
        }

        if (deliveryMethod == "delivery" &&
            string.IsNullOrWhiteSpace(address))
        {
            throw new ValidationException(
                "A delivery address is required.");
        }

        // Card payments need a payment provider integration.
        if (paymentMethod != "cash")
        {
            throw new ValidationException(
                "Online card payments are not available. " +
                "Please choose cash.");
        }

        var quantities = GetQuantities(dto.Items);

        return await _repository.ExecuteInTransactionAsync(
            async () =>
            {
                // Recheck the clinic inside the transaction.
                await ValidateClinicAsync(clinicId);

                var existing =
                    await _repository.GetByRequestIdAsync(
                        dto.RequestId,
                        clinicId);

                if (existing is not null)
                {
                    if (!TokenMatches(
                        existing.TrackingTokenHash,
                        trackingToken))
                    {
                        throw new ValidationException(
                            "This request could not be verified.");
                    }

                    ValidateRepeatedRequest(
                        existing,
                        dto,
                        quantities);

                    return ToDto(existing);
                }

                if (!await _repository.StatusExistsAsync(
                    clinicId,
                    "Pending"))
                {
                    throw new ValidationException(
                        "The clinic must configure an active " +
                        "'Pending' order status in Settings.");
                }

                var deliveryFee = deliveryMethod == "delivery"
                    ? _getDeliveryFee(clinicId)
                    : 0m;

                ValidateMoney(deliveryFee);

                var order = new StoreOrder
                {
                    ClinicId = clinicId,
                    RequestId = dto.RequestId,
                    CustomerName = customerName,
                    CustomerPhone = customerPhone,
                    DeliveryMethod = deliveryMethod,
                    Address = deliveryMethod == "delivery"
                        ? address
                        : "Clinic Pickup",
                    AddressDetails = deliveryMethod == "delivery"
                        ? addressDetails
                        : string.Empty,
                    Notes = notes,
                    PaymentMethod = paymentMethod,
                    PaymentStatus = "Unpaid",
                    Status = "Pending",
                    DeliveryStatus = deliveryMethod == "delivery"
                        ? "Pending"
                        : "NotRequired",
                    DeliveryFee = deliveryFee,
                    TrackingTokenHash = HashToken(trackingToken),
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
                            "in this store.");

                    if (!product.ShowOnStore)
                    {
                        throw new ValidationException(
                            $"'{product.Name}' is not available " +
                            "in this store.");
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

                    order.Items.Add(new StoreOrderItem
                    {
                        ClinicId = clinicId,
                        StoreOrder = order,
                        Product = product,
                        ProductName = product.Name,
                        CategoryName = product.Category.Title,
                        Image = product.Image,
                        Quantity = entry.Value,
                        UnitPrice = product.SellingPrice,
                        Total = lineTotal
                    });

                    order.Subtotal += lineTotal;
                    ValidateMoney(order.Subtotal);

                    product.Quantity -= entry.Value;
                }

                order.Total =
                    order.Subtotal + order.DeliveryFee;

                ValidateMoney(order.Total);

                await _repository.AddAsync(order);
                await _repository.SaveChangesAsync();

                return ToDto(order);
            });
    }

    public async Task<List<StoreOrderDto>>
        GetPendingDeliveriesAsync(int clinicId)
    {
        await ValidateClinicAsync(clinicId);

        var orders =
            await _repository.GetPendingDeliveriesAsync(
                clinicId);

        return orders.Select(ToDto).ToList();
    }    public async Task<StoreOrderDto?> UpdateStatusAsync(
        int id,
        int clinicId,
        UpdateStoreOrderStatusDto dto)
    {
        await ValidateClinicAsync(clinicId);

        Validator.ValidateObject(
            dto,
            new ValidationContext(dto),
            validateAllProperties: true);

        var status = dto.Status.Trim();

        if (string.IsNullOrWhiteSpace(status))
        {
            throw new ValidationException(
                "Please select an order status.");
        }

        return await _repository
            .ExecuteInTransactionAsync<StoreOrderDto?>(
                async () =>
                {
                    var order = await _repository.GetByIdAsync(
                        id,
                        clinicId);

                    if (order is null)
                    {
                        return null;
                    }

                    if (order.Status == status)
                    {
                        return ToDto(order);
                    }

                    if (order.CancelledAt.HasValue)
                    {
                        throw new ValidationException(
                            "A cancelled order cannot be reopened.");
                    }

                    if (order.DeliveredAt.HasValue ||
                        order.Status == "Completed" ||
                        order.Status == "Delivered")
                    {
                        throw new ValidationException(
                            "A completed order cannot be " +
                            "changed through the status list.");
                    }

                    if (!await _repository.StatusExistsAsync(
                        clinicId,
                        status))
                    {
                        throw new ValidationException(
                            "Select an active order status " +
                            "configured in Settings.");
                    }

                    if (status == "Cancelled")
                    {
                        if (order.PaymentStatus != "Unpaid")
                        {
                            throw new ValidationException(
                                "A paid order requires a refund " +
                                "before cancellation.");
                        }

                        foreach (var item in order.Items
                            .OrderBy(item => item.ProductId))
                        {
                            var product =
                                await _repository.GetProductAsync(
                                    item.ProductId,
                                    clinicId)
                                ?? throw new ValidationException(
                                    "An order product was not found.");

                            if (item.Quantity <= 0 ||
                                product.Quantity < 0 ||
                                product.Quantity >
                                    int.MaxValue - item.Quantity)
                            {
                                throw new ValidationException(
                                    $"The stock quantity for " +
                                    $"'{product.Name}' is invalid " +
                                    "or too large.");
                            }

                            product.Quantity += item.Quantity;
                        }

                        order.CancelledAt = DateTime.UtcNow;

                        if (order.DeliveryMethod == "delivery")
                        {
                            order.DeliveryStatus = "Cancelled";
                        }
                    }
                    else if (status == "Delivered")
                    {
                        if (order.DeliveryMethod != "delivery")
                        {
                            throw new ValidationException(
                                "Use Completed for a pickup order.");
                        }

                        order.DeliveryStatus = "Delivered";
                        order.DeliveredAt = DateTime.UtcNow;
                    }
                    else if (status == "Completed" &&
                             order.DeliveryMethod == "delivery")
                    {
                        order.DeliveryStatus = "Delivered";
                        order.DeliveredAt = DateTime.UtcNow;
                    }

                    order.Status = status;
                    order.StatusUpdatedAt = DateTime.UtcNow;

                    await _repository.SaveChangesAsync();

                    return ToDto(order);
                });
    }

    public async Task<StoreOrderDto?> MarkDeliveredAsync(
        int id,
        int clinicId)
    {
        await ValidateClinicAsync(clinicId);

        return await _repository
            .ExecuteInTransactionAsync<StoreOrderDto?>(
                async () =>
                {
                    var order = await _repository.GetByIdAsync(
                        id,
                        clinicId);

                    if (order is null)
                    {
                        return null;
                    }

                    if (order.DeliveryMethod != "delivery")
                    {
                        throw new ValidationException(
                            "This order is for clinic pickup.");
                    }

                    if (order.CancelledAt.HasValue ||
                        order.DeliveryStatus == "Cancelled")
                    {
                        throw new ValidationException(
                            "A cancelled order cannot be delivered.");
                    }

                    if (order.DeliveredAt.HasValue ||
                        order.DeliveryStatus == "Delivered")
                    {
                        return ToDto(order);
                    }

                    if (order.DeliveryStatus != "Pending")
                    {
                        throw new ValidationException(
                            "This order is not awaiting delivery.");
                    }

                    order.DeliveryStatus = "Delivered";
                    order.DeliveredAt = DateTime.UtcNow;

                    if (await _repository.StatusExistsAsync(
                        clinicId,
                        "Delivered"))
                    {
                        order.Status = "Delivered";
                    }
                    else if (await _repository.StatusExistsAsync(
                        clinicId,
                        "Completed"))
                    {
                        order.Status = "Completed";
                    }

                    order.StatusUpdatedAt = DateTime.UtcNow;

                    // Delivery completion does not by itself
                    // confirm that payment has been collected.
                    await _repository.SaveChangesAsync();

                    return ToDto(order);
                });
    }

    private async Task ValidateClinicAsync(int clinicId)
    {
        if (clinicId <= 0)
        {
            throw new ValidationException(
                "A valid clinic is required.");
        }

        var clinic = await _repository.GetClinicAsync(clinicId);

        if (clinic is null)
        {
            throw new ValidationException(
                "This clinic is unavailable.");
        }
    }

    private static SortedDictionary<int, int> GetQuantities(
        List<CreateStoreOrderItemDto>? items)
    {
        if (items is null ||
            items.Count == 0 ||
            items.Count > 200)
        {
            throw new ValidationException(
                "An order must contain between 1 and 200 items.");
        }

        var quantities = new SortedDictionary<int, int>();

        foreach (var item in items)
        {
            if (item is null)
            {
                throw new ValidationException(
                    "An order item is invalid.");
            }

            Validator.ValidateObject(
                item,
                new ValidationContext(item),
                validateAllProperties: true);

            quantities.TryGetValue(
                item.ProductId,
                out var previousQuantity);

            if (previousQuantity >
                int.MaxValue - item.Quantity)
            {
                throw new ValidationException(
                    "A product quantity is too large.");
            }

            quantities[item.ProductId] =
                previousQuantity + item.Quantity;
        }

        return quantities;
    }

    private static void ValidateRepeatedRequest(
        StoreOrder existing,
        CreateStoreOrderDto dto,
        SortedDictionary<int, int> quantities)
    {
        var deliveryMethod = dto.DeliveryMethod.Trim();

        var expectedAddress = deliveryMethod == "delivery"
            ? dto.Address?.Trim() ?? string.Empty
            : "Clinic Pickup";

        var expectedDetails = deliveryMethod == "delivery"
            ? dto.AddressDetails?.Trim() ?? string.Empty
            : string.Empty;

        var sameItems =
            existing.Items.Count == quantities.Count &&
            existing.Items.All(item =>
                quantities.TryGetValue(
                    item.ProductId,
                    out var quantity) &&
                quantity == item.Quantity);

        if (!sameItems ||
            existing.CustomerName != dto.CustomerName.Trim() ||
            existing.CustomerPhone != dto.CustomerPhone.Trim() ||
            existing.DeliveryMethod != deliveryMethod ||
            existing.Address != expectedAddress ||
            existing.AddressDetails != expectedDetails ||
            existing.Notes !=
                (dto.Notes?.Trim() ?? string.Empty) ||
            existing.PaymentMethod !=
                dto.PaymentMethod.Trim().ToLowerInvariant())
        {
            throw new ValidationException(
                "This request ID belongs to a different order.");
        }
    }

    private static bool IsValidToken(string? token)
    {
        return token is not null &&
            token.Length == 64 &&
            token.All(character =>
                character is >= '0' and <= '9' ||
                character is >= 'a' and <= 'f' ||
                character is >= 'A' and <= 'F');
    }

    private static string HashToken(string token)
    {
        var bytes = Encoding.UTF8.GetBytes(token);
        var hash = SHA256.HashData(bytes);

        return Convert.ToHexString(hash);
    }

    private static bool TokenMatches(
        string storedHash,
        string token)
    {
        if (!IsValidToken(token) ||
            string.IsNullOrWhiteSpace(storedHash) ||
            storedHash.Length != 64)
        {
            return false;
        }

        try
        {
            var expected = Convert.FromHexString(storedHash);

            var actual = SHA256.HashData(
                Encoding.UTF8.GetBytes(token));

            return CryptographicOperations.FixedTimeEquals(
                expected,
                actual);
        }
        catch (FormatException)
        {
            return false;
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

    private static StoreOrderDto ToDto(StoreOrder order)
    {
        return new StoreOrderDto
        {
            Id = order.Id,
            RequestId = order.RequestId,

            Customer = new StoreOrderCustomerDto
            {
                FullName = order.CustomerName,
                Phone = order.CustomerPhone
            },

            DeliveryMethod = order.DeliveryMethod,
            Address = order.Address,
            AddressDetails = order.AddressDetails,
            Notes = order.Notes,
            PaymentMethod = order.PaymentMethod,
            PaymentStatus = order.PaymentStatus,
            Status = order.Status,
            DeliveryStatus = order.DeliveryStatus,
            Subtotal = order.Subtotal,
            DeliveryFee = order.DeliveryFee,
            Total = order.Total,
            Date = order.CreatedAt,
            StatusUpdatedAt = order.StatusUpdatedAt,
            DeliveredAt = order.DeliveredAt,

            Items = order.Items
                .OrderBy(item => item.Id)
                .Select(item => new StoreOrderItemDto
                {
                    Id = item.Id,
                    ProductId = item.ProductId,
                    Name = item.ProductName,
                    Category = item.CategoryName,
                    Image = item.Image,
                    Quantity = item.Quantity,
                    Price = item.UnitPrice,
                    Total = item.Total
                })
                .ToList()
        };
    }
}