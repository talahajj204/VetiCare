const BASE_URL = "/api/orders";

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
            ? "The order or endpoint was not found."
            : "Unable to complete the order request.";

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
    throw new Error("The server returned an invalid order list.");
  }

  return records;
}

function validateId(id) {
  if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
    throw new Error("A valid order ID is required.");
  }

  return encodeURIComponent(id);
}

export async function getOrders({ signal } = {}) {
  return validateList(
    await request("", {
      method: "GET",
      signal,
    })
  );
}

export function getOrder(id, { signal } = {}) {
  return request(`/${validateId(id)}`, {
    method: "GET",
    signal,
  });
}

export function updateOrderStatus(id, status) {
  return request(`/${validateId(id)}/status`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });
}

export async function getPendingOrderDeliveries({
  signal,
} = {}) {
  return validateList(
    await request("/deliveries", {
      method: "GET",
      signal,
    })
  );
}

export function markOrderDelivered(id) {
  return request(`/${validateId(id)}/delivery/complete`, {
    method: "POST",
  });
}