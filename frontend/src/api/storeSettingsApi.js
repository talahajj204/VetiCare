function validateClinicId(value) {
  const clinicId = Number(value);

  if (
    !Number.isSafeInteger(clinicId) ||
    clinicId <= 0 ||
    clinicId > 2147483647
  ) {
    throw new Error("Invalid clinic.");
  }

  return clinicId;
}

async function request(
  url,
  { signal, body, method = "GET", authenticated = false } = {}
) {
  const response = await fetch(url, {
    method,
    signal,
    credentials: authenticated ? "include" : "omit",
    cache: "no-store",
    headers: {
      Accept: "application/json",
      ...(body !== undefined
        ? { "Content-Type": "application/json" }
        : {}),
    },
    ...(body !== undefined
      ? { body: JSON.stringify(body) }
      : {}),
  });

  if (!response.ok) {
    let message =
      response.status === 401
        ? "Please sign in to continue."
        : response.status === 403
          ? "You do not have permission to manage store settings."
          : response.status === 404
            ? "This store is unavailable."
            : response.status === 413
              ? "The selected images are too large. Please use smaller images."
              : "Unable to complete the settings request.";

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
      // Keep the default message.
    }

    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  const settings = await response.json();

  if (
    !settings ||
    typeof settings !== "object" ||
    Array.isArray(settings) ||
    !settings.storeColors ||
    typeof settings.storeColors !== "object" ||
    Array.isArray(settings.storeColors)
  ) {
    throw new Error(
      "The server returned invalid store settings."
    );
  }

  return settings;
}

// Administrator: read settings for the signed-in clinic.
export function getAdminStoreSettings({ signal } = {}) {
  return request("/api/store-settings", {
    signal,
    authenticated: true,
  });
}

// Administrator: save settings for the signed-in clinic.
export function updateStoreSettings(settings, { signal } = {}) {
  return request("/api/store-settings", {
    method: "PUT",
    body: settings,
    signal,
    authenticated: true,
  });
}

// Customer: read public settings for a specific clinic.
export function getPublicStoreSettings(
  clinicId,
  { signal } = {}
) {
  const validClinicId = validateClinicId(clinicId);

  return request(
    `/api/store/${validClinicId}/settings`,
    { signal }
  );
}