const BASE_URL = "/api/reports";

function validateDate(value) {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    throw new Error("Choose a valid date range.");
  }

  return value;
}

function validateReport(report, startDate, endDate) {
  if (
    !report ||
    typeof report !== "object" ||
    report.startDate !== startDate ||
    report.endDate !== endDate ||
    typeof report.clinicName !== "string" ||
    typeof report.clinicLogo !== "string" ||
    !Array.isArray(report.appointments) ||
    !Array.isArray(report.vaccinations) ||
    !Array.isArray(report.invoices)
  ) {
    throw new Error("The server returned invalid report data.");
  }

  const validRecord = (record) =>
    record &&
    Number.isSafeInteger(record.id) &&
    record.id > 0 &&
    typeof record.date === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(record.date) &&
    typeof record.status === "string";

  const validAppointments = report.appointments.every(
    (item) =>
      validRecord(item) &&
      typeof item.pet === "string" &&
      typeof item.owner === "string"
  );

  const validVaccinations = report.vaccinations.every(
    (item) =>
      validRecord(item) &&
      typeof item.pet === "string" &&
      typeof item.vaccine === "string"
  );

  const validInvoices = report.invoices.every(
    (item) =>
      validRecord(item) &&
      typeof item.invoiceNumber === "string" &&
      typeof item.amount === "number" &&
      Number.isFinite(item.amount) &&
      item.amount >= 0
  );

  if (
    !validAppointments ||
    !validVaccinations ||
    !validInvoices
  ) {
    throw new Error("The server returned invalid report records.");
  }

  return report;
}

async function requestReport(
  path,
  startDate,
  endDate,
  { signal } = {}
) {
  const start = validateDate(startDate);
  const end = validateDate(endDate);

  if (start > end) {
    throw new Error("From date cannot be after To date.");
  }

  const query = new URLSearchParams({
    startDate: start,
    endDate: end,
  });

  const response = await fetch(
    `${BASE_URL}${path}?${query.toString()}`,
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
          ? "You do not have permission to access this report."
          : response.status === 404
            ? "The reports endpoint is unavailable. Restart the backend."
            : "Unable to load the report.";

    const problem = await response.json().catch(() => null);

    const errors = problem?.errors
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

  const report = await response.json();

  return validateReport(report, start, end);
}

export function getReport(
  startDate,
  endDate,
  options = {}
) {
  return requestReport("", startDate, endDate, options);
}

export function getReportForPrint(
  startDate,
  endDate,
  options = {}
) {
  return requestReport("/print", startDate, endDate, options);
}