const BASE_URL = "/api/products";

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
            ? "Product not found."
            : "Unable to complete the product request.";

    try {
      const problem = await response.json();

      const errors = problem.errors
        ? Object.values(problem.errors).flat().join(" ")
        : "";

      message =
        errors ||
        problem.detail ||
        problem.title ||
        message;
    } catch {
      // Keep the default message if the response is not JSON.
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export async function getProducts({ signal } = {}) {
  const products = await request("", { signal });

  if (!Array.isArray(products)) {
    throw new Error("The server returned invalid product data.");
  }

  return products;
}

export function getProduct(id, { signal } = {}) {
  return request(`/${id}`, { signal });
}

export function createProduct(product) {
  return request("", {
    method: "POST",
    body: JSON.stringify(product),
  });
}

export function updateProduct(id, product) {
  return request(`/${id}`, {
    method: "PUT",
    body: JSON.stringify(product),
  });
}

export function deleteProduct(id) {
  return request(`/${id}`, {
    method: "DELETE",
  });
}