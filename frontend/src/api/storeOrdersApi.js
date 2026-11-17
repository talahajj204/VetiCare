function validateId(value, label) {
  const id = Number(value);

  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new Error(`A valid ${label} is required.`);
  }

  return String(id);
}

function validateToken(token) {
  if (
    typeof token !== "string" ||
    !/^[a-fA-F0-9]{64}$/.test(token)
  ) {
    throw new Error("A valid order tracking token is required.");
  }

  return token;
}

// Generate once per new order and reuse when retrying.
export function createOrderTrackingToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));

  return Array.from(
    bytes,
    (byte) => byte.toString(16).padStart(2, "0")
  ).join("");
}

async function request(
  clinicId,
  path,
  trackingToken,
  options = {}
) {
  const clinic = validateId(clinicId, "clinic ID");
  const token = validateToken(trackingToken);

  const response = await fetch(
    `/api/store/${clinic}/orders${path}`,
    {
      ...options,
      credentials: "omit",
      cache: "no-store",
      headers: {
        ...(options.body
          ? { "Content-Type": "application/json" }
          : {}),
        ...options.headers,
        "X-Order-Token": token,
      },
    }
  );

  if (!response.ok) {
    let message =
      response.status === 404
        ? "The order was not found or could not be verified."
        : response.status === 429
          ? "Too many requests. Please try again shortly."
          : "Unable to complete the store order request.";

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

export function createStoreOrder(
  clinicId,
  order,
  trackingToken
) {
  return request(clinicId, "", trackingToken, {
    method: "POST",
    body: JSON.stringify(order),
  });
}

export function getCustomerOrder(
  clinicId,
  orderId,
  trackingToken,
  { signal } = {}
) {
  const id = validateId(orderId, "order ID");

  return request(clinicId, `/${id}`, trackingToken, {
    method: "GET",
    signal,
  });
}
export async function getStoreCheckoutSettings(
  clinicId,
  { signal } = {}
) {
  const clinic = validateId(clinicId, "clinic ID");

  const response = await fetch(
    `/api/store/${clinic}/checkout`,
    {
      method: "GET",
      credentials: "omit",
      cache: "no-store",
      signal,
    }
  );

  if (!response.ok) {
    const error = new Error(
      response.status === 404
        ? "This clinic's store is unavailable."
        : "Unable to load checkout settings."
    );

    error.status = response.status;
    throw error;
  }

  const settings = await response.json();

  if (
    !settings ||
    typeof settings.deliveryAvailable !== "boolean" ||
    !Array.isArray(settings.paymentMethods) ||
    settings.paymentMethods.some(
      (method) =>
        typeof method !== "string" || !method.trim()
    )
  ) {
    throw new Error(
      "The server returned invalid checkout settings."
    );
  }

  if (
    settings.deliveryAvailable &&
    (
      typeof settings.deliveryFee !== "number" ||
      !Number.isFinite(settings.deliveryFee) ||
      settings.deliveryFee < 0
    )
  ) {
    throw new Error(
      "The server returned an invalid delivery fee."
    );
  }

  return settings;
}