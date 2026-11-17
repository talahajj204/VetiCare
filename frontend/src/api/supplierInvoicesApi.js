const BASE_URL = "/api/supplier-invoices";

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
    let message = "Unable to process the supplier invoice.";

    if (response.status === 401) {
      message = "Please sign in again.";
    } else if (response.status === 403) {
      message =
        "You do not have permission to perform this action.";
    } else if (response.status === 404) {
      message = "The supplier invoice endpoint or invoice was not found.";
    }

    const problem = await response.json().catch(() => null);

    const errors = problem?.errors
      ? Object.values(problem.errors)
          .flat()
          .filter((value) => typeof value === "string")
      : [];

    if (errors.length > 0) {
      message = errors.join("\n");
    } else if (problem?.detail) {
      message = problem.detail;
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export async function getSupplierInvoices({ signal } = {}) {
  const invoices = await request("", {
    method: "GET",
    signal,
  });

  if (!Array.isArray(invoices)) {
    throw new Error("The server returned an invalid invoice list.");
  }

  return invoices;
}

export function getSupplierInvoice(id, { signal } = {}) {
  return request(`/${encodeURIComponent(id)}`, {
    method: "GET",
    signal,
  });
}

export function createSupplierInvoice(invoice) {
  return request("", {
    method: "POST",
    body: JSON.stringify(invoice),
  });
}