const OWNERS_API = "/api/owners";

async function request(path, options = {}) {
  let response;

  try {
    response = await fetch(path, {
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
      "Unable to connect to the server. Please try again."
    );
  }

  if (!response.ok) {
    let message = "Unable to complete the request.";

    if (response.status === 401) {
      message = "Your session has expired. Please sign in again.";
    } else if (response.status === 403) {
      message = "You do not have permission to access this data.";
    } else if (response.status === 404) {
      message = "The requested owner could not be found.";
    } else {
      const problem = await response.json().catch(() => null);

      if (problem?.errors) {
        const messages = Object.values(problem.errors)
          .flat()
          .filter((value) => typeof value === "string");

        if (messages.length > 0) {
          message = messages.join("\n");
        }
      } else if (typeof problem?.message === "string") {
        message = problem.message;
      }
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

function normalizeOwner(owner) {
  return {
    ...owner,
    firstName: owner.firstName ?? "",
    lastName: owner.lastName ?? "",
    email: owner.email ?? "",
    phone: owner.phone ?? "",
    address: owner.address ?? "",
    emergencyContact: owner.emergencyContact ?? "",
    notes: owner.notes ?? "",
    status: owner.status ?? "active",
    pets: Array.isArray(owner.pets) ? owner.pets : [],
    history: Array.isArray(owner.history) ? owner.history : [],
  };
}

function ownerPayload(owner) {
  return {
    firstName: owner.firstName ?? "",
    lastName: owner.lastName ?? "",
    email: owner.email ?? "",
    phone: owner.phone ?? "",
    address: owner.address ?? "",
    emergencyContact: owner.emergencyContact ?? "",
    notes: owner.notes ?? "",
  };
}

function ownerPath(id) {
  return `${OWNERS_API}/${encodeURIComponent(String(id))}`;
}

export async function getOwners({ signal } = {}) {
  const owners = await request(OWNERS_API, { signal });

  if (!Array.isArray(owners)) {
    throw new Error("The server returned invalid owners data.");
  }

  return owners.map(normalizeOwner);
}

export async function getOwner(id, { signal } = {}) {
  const owner = await request(ownerPath(id), { signal });

  return normalizeOwner(owner);
}

export async function createOwner(owner) {
  const created = await request(OWNERS_API, {
    method: "POST",
    body: JSON.stringify(ownerPayload(owner)),
  });

  return normalizeOwner(created);
}

export async function updateOwner(id, owner) {
  const updated = await request(ownerPath(id), {
    method: "PUT",
    body: JSON.stringify({
      ...ownerPayload(owner),
      status: owner.status ?? "active",
    }),
  });

  return normalizeOwner(updated);
}

export async function deleteOwner(id) {
  await request(ownerPath(id), {
    method: "DELETE",
  });
}