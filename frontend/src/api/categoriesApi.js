const BASE_URL = "/api/categories";

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
            ? "Category not found."
            : "Unable to complete the category request.";

    try {
      const problem = await response.json();

      const errors = problem.errors
        ? Object.values(problem.errors).flat().join(" ")
        : "";

      message =
        errors ||
        problem.message ||
        problem.detail ||
        problem.title ||
        message;
    } catch {
      // Keep the default message when the response is not JSON.
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}
export async function reorderCategories(orderedIds) {
  if (
    !Array.isArray(orderedIds) ||
    orderedIds.length === 0 ||
    orderedIds.some(
      (id) => !Number.isSafeInteger(id) || id <= 0
    ) ||
    new Set(orderedIds).size !== orderedIds.length
  ) {
    throw new Error("The category order is invalid.");
  }

  const categories = await request("/reorder", {
    method: "PUT",
    body: JSON.stringify(orderedIds),
  });

  if (!Array.isArray(categories)) {
    throw new Error(
      "The server returned invalid category data."
    );
  }

  return categories;
}


export async function getCategories({ signal } = {}) {
  const categories = await request("", { signal });

  if (!Array.isArray(categories)) {
    throw new Error("The server returned invalid category data.");
  }

  return categories;
}

export function getCategory(id, { signal } = {}) {
  return request(`/${id}`, { signal });
}

export function createCategory(category) {
  return request("", {
    method: "POST",
    body: JSON.stringify(category),
  });
}

export function updateCategory(id, category) {
  return request(`/${id}`, {
    method: "PUT",
    body: JSON.stringify(category),
  });
}

export function deleteCategory(id) {
  return request(`/${id}`, {
    method: "DELETE",
  });
  
}