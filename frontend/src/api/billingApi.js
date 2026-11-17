const BASE_URL = "/api/billing";

function validateId(value) {
  const id = Number(value);

  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new Error("A valid invoice ID is required.");
  }

  return String(id);
}

function validateRowVersion(rowVersion) {
  // SQL Server rowversion is 8 bytes, serialized as Base64.
  if (
    typeof rowVersion !== "string" ||
    !/^[A-Za-z0-9+/]{11}=$/.test(rowVersion)
  ) {
    throw new Error(
      "The invoice version is missing or invalid. " +
      "Refresh the invoice and try again."
    );
  }

  return rowVersion;
}

function validateInvoice(invoice) {
  if (
    !invoice ||
    typeof invoice !== "object" ||
    !Number.isSafeInteger(invoice.id) ||
    invoice.id <= 0 ||
    !Array.isArray(invoice.lines) ||
    !Array.isArray(invoice.payments) ||
    typeof invoice.total !== "number" ||
    !Number.isFinite(invoice.total) ||
    typeof invoice.amountPaid !== "number" ||
    !Number.isFinite(invoice.amountPaid) ||
    typeof invoice.balance !== "number" ||
    !Number.isFinite(invoice.balance)
  ) {
    throw new Error(
      "The server returned invalid invoice data."
    );
  }

  validateRowVersion(invoice.rowVersion);

  return invoice;
}

async function request(path = "", options = {}) {
  let response;

  try {
    response = await fetch(`${BASE_URL}${path}`, {
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
  } catch (error) {
    if (error.name === "AbortError") {
      throw error;
    }

    throw new Error(
      "Unable to connect to the server. " +
      "If you were saving an invoice or payment, " +
      "retry the same request to avoid duplicates."
    );
  }

  if (!response.ok) {
    const problem = await response.json().catch(() => null);

    const errors = problem?.errors
      ? Object.values(problem.errors)
          .flat()
          .filter((value) => typeof value === "string")
          .join("\n")
      : "";

    const fallback =
      response.status === 401
        ? "Please sign in to continue."
        : response.status === 403
          ? "You do not have permission to perform this action."
          : response.status === 404
            ? "The invoice or billing endpoint was not found."
            : response.status === 409
              ? "This invoice has changed. Refresh it and try again."
              : "Unable to complete the billing request.";

    const error = new Error(
      errors ||
        problem?.detail ||
        problem?.title ||
        fallback
    );

    error.status = response.status;
    throw error;
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export async function getBillingInvoices(
  { signal } = {}
) {
  const invoices = await request("", { signal });

  if (!Array.isArray(invoices)) {
    throw new Error(
      "The server returned invalid billing data."
    );
  }

  return invoices.map(validateInvoice);
}

export async function getBillingInvoice(
  id,
  { signal } = {}
) {
  const invoice = await request(
    `/${validateId(id)}`,
    { signal }
  );

  return validateInvoice(invoice);
}

export async function createBillingInvoice(invoice) {
  // Generate requestId once in the page and reuse it
  // if this operation needs to be retried.
  const saved = await request("", {
    method: "POST",
    body: JSON.stringify(invoice),
  });

  return validateInvoice(saved);
}

export async function updateBillingInvoice(
  id,
  invoice
) {
  validateRowVersion(invoice?.rowVersion);

  const saved = await request(`/${validateId(id)}`, {
    method: "PUT",
    body: JSON.stringify(invoice),
  });

  return validateInvoice(saved);
}

export async function recordBillingPayment(
  id,
  payment
) {
  validateRowVersion(payment?.rowVersion);

  // payment.requestId must also be reused on retries.
  const saved = await request(
    `/${validateId(id)}/payments`,
    {
      method: "POST",
      body: JSON.stringify(payment),
    }
  );

  return validateInvoice(saved);
}

export function deleteBillingInvoice(
  id,
  rowVersion
) {
  return request(`/${validateId(id)}`, {
    method: "DELETE",
    body: JSON.stringify({
      rowVersion: validateRowVersion(rowVersion),
    }),
  });
}