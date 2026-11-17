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

async function request(
  clinicId,
  path = "",
  { signal } = {}
) {
  const validClinicId = validateId(clinicId, "clinic");

  const response = await fetch(
    `/api/store/${validClinicId}/categories${path}`,
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
        ? "This store or category is unavailable."
        : "Unable to load store categories. Please try again.";

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

function isValidCategory(category, clinicId) {
  return (
    category !== null &&
    typeof category === "object" &&
    !Array.isArray(category) &&
    Number.isSafeInteger(category.id) &&
    category.id > 0 &&
    Number(category.clinicId) === Number(clinicId) &&
    typeof category.title === "string"
  );
}

export async function getStoreCategories(
  clinicId,
  { signal } = {}
) {
  const categories = await request(
    clinicId,
    "",
    { signal }
  );

  if (
    !Array.isArray(categories) ||
    !categories.every((category) =>
      isValidCategory(category, clinicId)
    )
  ) {
    throw new Error(
      "The server returned invalid category data."
    );
  }

  return [...categories].sort(
    (a, b) =>
      a.sortOrder - b.sortOrder ||
      a.title.localeCompare(b.title) ||
      a.id - b.id
  );
}

export async function getStoreCategory(
  clinicId,
  categoryId,
  { signal } = {}
) {
  const validCategoryId = validateId(
    categoryId,
    "category"
  );

  const category = await request(
    clinicId,
    `/${validCategoryId}`,
    { signal }
  );

  if (
    !isValidCategory(category, clinicId) ||
    category.id !== validCategoryId
  ) {
    throw new Error(
      "The server returned invalid category data."
    );
  }

  return category;
}