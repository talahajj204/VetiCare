const BASE_URL = "/api/financial";

function validateId(value) {
  const id = Number(value);

  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new Error("A valid financial record ID is required.");
  }

  return id;
}

function validateEntry(entry) {
  if (
    !entry ||
    typeof entry !== "object" ||
    !Number.isSafeInteger(entry.id) ||
    entry.id <= 0 ||
    !["Revenue", "Expense"].includes(entry.kind) ||
    typeof entry.date !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(entry.date) ||
    typeof entry.type !== "string" ||
    typeof entry.description !== "string" ||
    typeof entry.amount !== "number" ||
    !Number.isFinite(entry.amount) ||
    entry.amount < 0
  ) {
    throw new Error(
      "The server returned invalid financial record data."
    );
  }

  return entry;
}

async function request(path = "", options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    credentials: "include",
    cache: "no-store",
    headers: {
      ...(options.body
        ? { "Content-Type": "application/json" }
        : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    let message =
      response.status === 401
        ? "Please sign in to continue."
        : response.status === 403
          ? "You do not have permission to perform this action."
          : response.status === 404
            ? "Financial record not found."
            : "Unable to complete the financial request.";

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

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export async function getFinancialEntries({ signal } = {}) {
  const entries = await request("", {
    method: "GET",
    signal,
  });

  if (!Array.isArray(entries)) {
    throw new Error(
      "The server returned invalid financial data."
    );
  }

  return entries.map(validateEntry);
}

export async function getFinancialEntry(
  id,
  { signal } = {}
) {
  const entry = await request(`/${validateId(id)}`, {
    method: "GET",
    signal,
  });

  return validateEntry(entry);
}

export async function createFinancialEntry(entry) {
  const saved = await request("", {
    method: "POST",
    body: JSON.stringify({
      requestId: entry.requestId,
      kind: entry.kind,
      date: entry.date,
      type: entry.type,
      description: entry.description,
      amount: Number(entry.amount),
    }),
  });

  return validateEntry(saved);
}

export function deleteFinancialEntry(id) {
  return request(`/${validateId(id)}`, {
    method: "DELETE",
  });
}