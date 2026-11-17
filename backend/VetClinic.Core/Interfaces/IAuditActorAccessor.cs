namespace VetClinic.Core.Interfaces;

public interface IAuditActorAccessor
{
    bool HasHttpRequest { get; }

    bool IsAuthenticated { get; }

    string? UserId { get; }
}