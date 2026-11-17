const API_URL = "/api/clinic-options";

async function requestOptions(path, options = {}) {
  const response = await fetch(path, {
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
    let message = "Unable to complete the request.";

    if (response.status === 401) {
      message =
        "Your session has expired. Please sign in again.";
    } else if (response.status === 403) {
      message =
        "You do not have permission to manage these options.";
    } else if (response.status === 404) {
      message = "The option was not found.";
    } else {
      try {
        const problem = await response.json();

        const errors = Object.values(problem.errors || {})
          .flat()
          .filter((value) => typeof value === "string");

        if (errors.length) {
          message = errors.join("\n");
        } else if (typeof problem.detail === "string") {
          message = problem.detail;
        } else if (typeof problem.title === "string") {
          message = problem.title;
        }
      } catch {
        // Keep the default message.
      }
    }

    const error = new Error(message);
    error.status = response.status;

    throw error;
  }

  if (response.status === 204) return null;

  return response.json();
}

export async function getClinicOptions({
  listKey,
  includeInactive = false,
  signal,
} = {}) {
  const query = new URLSearchParams();

  if (listKey) {
    query.set("listKey", listKey);
  }

  if (includeInactive) {
    query.set("includeInactive", "true");
  }

  const queryString = query.toString();

  const data = await requestOptions(
    `${API_URL}${queryString ? `?${queryString}` : ""}`,
    { signal }
  );

  if (!Array.isArray(data)) {
    throw new Error(
      "The server returned invalid option data."
    );
  }

  return data;
}

export async function createClinicOption({
  listKey,
  value,
  sortOrder = 0,
  isActive = true,
}) {
  return requestOptions(API_URL, {
    method: "POST",
    body: JSON.stringify({
      listKey,
      value,
      sortOrder,
      isActive,
    }),
  });
}

export async function updateClinicOption(
  id,
  {
    value,
    sortOrder = 0,
    isActive = true,
  }
) {
  return requestOptions(
    `${API_URL}/${encodeURIComponent(id)}`,
    {
      method: "PUT",
      body: JSON.stringify({
        value,
        sortOrder,
        isActive,
      }),
    }
  );
}