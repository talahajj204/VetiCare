const BASE_URL = "/api/dashboard";

function validateDate(value, label) {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    throw new Error(`Choose a valid ${label}.`);
  }

  const date = new Date(`${value}T00:00:00Z`);

  if (
    !Number.isFinite(date.getTime()) ||
    date.toISOString().slice(0, 10) !== value
  ) {
    throw new Error(`Choose a valid ${label}.`);
  }

  return value;
}

function isCount(value) {
  return Number.isSafeInteger(value) && value >= 0;
}

function isNonNegativeNumber(value) {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= 0
  );
}

function validateDashboard(data) {
  const valid =
    data &&
    isCount(data.todayAppointments) &&
    isCount(data.activePets) &&
    isCount(data.petOwners) &&
    isCount(data.outstandingInvoices) &&
    Array.isArray(data.appointments) &&
    data.appointments.every(
      (item) =>
        item &&
        typeof item.month === "string" &&
        isCount(item.appointments)
    ) &&
    Array.isArray(data.petDistribution) &&
    data.petDistribution.every(
      (item) =>
        item &&
        typeof item.name === "string" &&
        isCount(item.count) &&
        isNonNegativeNumber(item.value) &&
        item.value <= 100
    ) &&
    Array.isArray(data.revenue) &&
    data.revenue.every(
      (item) =>
        item &&
        typeof item.month === "string" &&
        isNonNegativeNumber(item.revenue)
    );

  if (!valid) {
    throw new Error(
      "The server returned invalid dashboard data."
    );
  }

  return data;
}

export async function getDashboard(
  { today, startDate, endDate },
  { signal } = {}
) {
  validateDate(today, "today date");
  validateDate(startDate, "From date");
  validateDate(endDate, "To date");

  if (startDate > endDate) {
    throw new Error(
      "From date cannot be after To date."
    );
  }

  const query = new URLSearchParams({
    today,
    startDate,
    endDate,
  });

  const response = await fetch(
    `${BASE_URL}?${query.toString()}`,
    {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      signal,
    }
  );

  if (!response.ok) {
    let message =
      response.status === 401
        ? "Please sign in to continue."
        : response.status === 403
          ? "You do not have permission to view the dashboard."
          : response.status === 404
            ? "Dashboard endpoint not found. Restart the backend."
            : "Unable to load the dashboard.";

    const problem = await response.json().catch(() => null);

    const errors =
      problem?.errors &&
      typeof problem.errors === "object"
        ? Object.values(problem.errors)
            .flat()
            .filter((value) => typeof value === "string")
        : [];

    if (errors.length > 0) {
      message = errors.join("\n");
    } else if (typeof problem?.detail === "string") {
      message = problem.detail;
    } else if (typeof problem?.title === "string") {
      message = problem.title;
    }

    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return validateDashboard(await response.json());
}
