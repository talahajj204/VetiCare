const BASE_URL = "/api/audit-log";

export async function getAuditLogs({ signal } = {}) {
  const response = await fetch(BASE_URL, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
    signal,
  });

  if (!response.ok) {
    let message =
      response.status === 401
        ? "Please sign in to continue."
        : response.status === 403
          ? "You do not have permission to view the audit log."
          : response.status === 404
            ? "The audit log endpoint is unavailable. Restart the backend."
            : "Unable to load audit log records.";

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

  const records = await response.json();

  if (!Array.isArray(records)) {
    throw new Error(
      "The server returned invalid audit log data."
    );
  }

  return records.map((record) => {
    if (
      !record ||
      !Number.isSafeInteger(record.id) ||
      record.id <= 0 ||
      typeof record.user !== "string" ||
      typeof record.action !== "string" ||
      typeof record.record !== "string" ||
      typeof record.createdAt !== "string" ||
      Number.isNaN(Date.parse(record.createdAt))
    ) {
      throw new Error(
        "The server returned an invalid audit log record."
      );
    }

    const timestamp = new Date(record.createdAt);

    const year = timestamp.getFullYear();
    const month = String(
      timestamp.getMonth() + 1
    ).padStart(2, "0");
    const day = String(
      timestamp.getDate()
    ).padStart(2, "0");

    return {
      id: record.id,
      user: record.user,
      action: record.action,
      record: record.record,
      createdAt: record.createdAt,
      date: `${year}-${month}-${day}`,
      time: timestamp.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    };
  });
}