const BASE_URL = "/api/pos";

async function request(path, options = {}) {
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
            ? "The requested record or endpoint was not found."
            : "Unable to complete the POS request.";

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

    const error = new Error(message);
    error.status = response.status;

    throw error;
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

function validateList(records) {
  if (!Array.isArray(records)) {
    throw new Error("The server returned an invalid list.");
  }

  return records;
}

export async function getHeldSales({ signal } = {}) {
  return validateList(
    await request("/held-sales", {
      method: "GET",
      signal,
    })
  );
}

export function getHeldSale(id, { signal } = {}) {
  return request(`/held-sales/${encodeURIComponent(id)}`, {
    method: "GET",
    signal,
  });
}

export function holdSale(data) {
  return request("/held-sales", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getPendingDeliveries({ signal } = {}) {
  return validateList(
    await request("/deliveries", {
      method: "GET",
      signal,
    })
  );
}

export function markSaleDelivered(saleId) {
  return request(
    `/deliveries/${encodeURIComponent(saleId)}/complete`,
    {
      method: "POST",
    }
  );
}

export async function getRefundableSales({ signal } = {}) {
  return validateList(
    await request("/refundable-sales", {
      method: "GET",
      signal,
    })
  );
}

export function refundSale(data) {
  return request("/refunds", {
    method: "POST",
    body: JSON.stringify(data),
  });
}