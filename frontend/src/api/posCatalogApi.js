const BASE_URL = "/api/pos/catalog";

async function request(path, { signal } = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
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
          ? "You do not have permission to access POS."
          : "Unable to load the POS catalog.";

    const problem = await response.json().catch(() => null);

    const errors =
      problem?.errors &&
      typeof problem.errors === "object"
        ? Object.values(problem.errors)
            .flat()
            .filter((value) => typeof value === "string")
        : [];

    if (errors.length > 0) {
      message = errors.join("\n");
    } else if (typeof problem?.detail === "string") {
      message = problem.detail;
    }

    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  const data = await response.json();

  if (!Array.isArray(data)) {
    throw new Error(
      "The server returned invalid POS catalog data."
    );
  }

  return data;
}

export function getPosProducts(options = {}) {
  return request("/products", options);
}

export function getPosCategories(options = {}) {
  return request("/categories", options);
}