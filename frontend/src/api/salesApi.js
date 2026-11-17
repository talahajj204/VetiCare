const BASE_URL = "/api/sales";

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
            ? "The sale or sales endpoint was not found."
            : "Unable to complete the sales request.";

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

export async function getSales({ signal } = {}) {
  const sales = await request("", {
    method: "GET",
    signal,
  });

  if (!Array.isArray(sales)) {
    throw new Error("The server returned invalid sales data.");
  }

  return sales;
}

export function getSale(id, { signal } = {}) {
  return request(`/${encodeURIComponent(id)}`, {
    method: "GET",
    signal,
  });
}

export function createSale(sale) {
  return request("", {
    method: "POST",
    body: JSON.stringify(sale),
  });
}