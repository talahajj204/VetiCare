const BASE_URL = "/api/clinics";

function validateId(value) {
  const id = Number(value);

  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new Error("A valid clinic ID is required.");
  }

  return id;
}

async function request(path = "", options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    credentials: "include",
    cache: "no-store",
    headers: {
      Accept: "application/json",
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
          ? "Only a Super Admin can manage clinics."
          : response.status === 404
            ? "Clinic not found."
            : "Unable to complete the clinic request.";

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
    } else if (typeof problem?.title === "string") {
      message = problem.title;
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

function optionalText(value) {
  return typeof value === "string" && value.trim()
    ? value.trim()
    : null;
}

function clinicPayload(clinic) {
  const name = String(clinic.name ?? "").trim();

  if (!name) {
    throw new Error("Please enter a clinic name.");
  }

  return {
    name,
    logoUrl: optionalText(clinic.logoUrl),
    email: optionalText(clinic.email),
    address: optionalText(clinic.address),
  };
}

export async function getClinics({ signal } = {}) {
  const clinics = await request("", { signal });

  if (!Array.isArray(clinics)) {
    throw new Error(
      "The server returned invalid clinic data."
    );
  }

  return clinics;
}

export function getClinic(id, { signal } = {}) {
  return request(`/${validateId(id)}`, { signal });
}

export function createClinic(clinic) {
  return request("", {
    method: "POST",
    body: JSON.stringify(clinicPayload(clinic)),
  });
}

export function updateClinic(id, clinic) {
  if (typeof clinic.isActive !== "boolean") {
    throw new Error("Choose whether the clinic is active.");
  }

  return request(`/${validateId(id)}`, {
    method: "PUT",
    body: JSON.stringify({
      ...clinicPayload(clinic),
      isActive: clinic.isActive,
    }),
  });
}
