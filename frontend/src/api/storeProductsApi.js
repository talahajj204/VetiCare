function validateId(value, label) {
  const id = Number(value);

  if (
    !Number.isSafeInteger(id) ||
    id <= 0 ||
    id > 2147483647
  ) {
    throw new Error(`Invalid ${label}.`);
  }

  return id;
}

async function request(clinicId, path = "", { signal } = {}) {
  const validClinicId = validateId(clinicId, "clinic");

  const response = await fetch(
    `/api/store/${validClinicId}/products${path}`,
    {
      method: "GET",
      credentials: "omit",
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
      signal,
    }
  );

  if (!response.ok) {
    let message =
      response.status === 404
        ? "This store or product is unavailable."
        : "Unable to load store products. Please try again.";

    try {
      const problem = await response.json();

      message =
        problem.detail ||
        problem.title ||
        message;
    } catch {
      // Keep the default message.
    }

    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return response.json();
}

export async function getStoreProducts(
  clinicId,
  { signal } = {}
) {
  const products = await request(clinicId, "", { signal });

  if (!Array.isArray(products)) {
    throw new Error("The server returned invalid product data.");
  }

  return products;
}

export async function getStoreProduct(
  clinicId,
  productId,
  { signal } = {}
) {
  const validProductId = validateId(productId, "product");

  const product = await request(
    clinicId,
    `/${validProductId}`,
    { signal }
  );

  if (
    !product ||
    typeof product !== "object" ||
    Array.isArray(product) ||
    Number(product.id) !== validProductId ||
    Number(product.clinicId) !== Number(clinicId)
  ) {
    throw new Error("The server returned invalid product data.");
  }

  return product;
}