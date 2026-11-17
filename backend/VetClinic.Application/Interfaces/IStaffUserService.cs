using VetClinic.Application.DTOs;

namespace VetClinic.Application.Interfaces;

public interface IStaffUserService
{
    Task<List<StaffUserDto>> GetAllAsync(int clinicId);

    Task<StaffUserDto?> GetByIdAsync(
        int clinicId,
        string userId);

    Task<StaffUserDto> CreateAsync(
        int clinicId,
        CreateStaffUserDto dto);

    Task<StaffUserDto?> UpdateAsync(
        int clinicId,
        string userId,
        UpdateStaffUserDto dto);

    Task<StaffUserDto?> SetActiveAsync(
        int clinicId,
        string userId,
        bool isActive);
}