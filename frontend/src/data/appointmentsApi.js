const API_URL = "/api/appointments";

async function request(url, options = {}) {
  const response = await fetch(url, {
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
    let message = "Unable to complete the appointment request.";

    if (response.status === 401) {
      message = "Your session has expired. Please sign in again.";
    } else if (response.status === 403) {
      message = "You do not have access to these appointments.";
    } else if (response.status === 404) {
      message = "The appointment was not found.";
    }

    try {
      const data = await response.json();

      if (data.errors) {
        const errors = Object.values(data.errors)
          .flat()
          .filter(Boolean);

        if (errors.length) {
          message = errors.join("\n");
        }
      } else if (response.status !== 401 &&
                 response.status !== 403 &&
                 data.detail) {
        message = data.detail;
      }
    } catch {
      // Keep the message above when the response has no JSON.
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

function normalizeAppointment(appointment) {
  return {
    ...appointment,
    petId: String(appointment.petId ?? ""),
    ownerId: String(appointment.ownerId ?? ""),
    pet: appointment.pet || "",
    owner: appointment.owner || "",
    type: appointment.type || "Consultation",
    date: appointment.date || "",
    time: appointment.time
      ? appointment.time.slice(0, 5)
      : "",
    veterinarian: appointment.veterinarian || "",
    reason: appointment.reason || "",
    status: appointment.status || "Pending",
  };
}

function createPayload(appointment) {
  const petId = Number(appointment.petId);

  if (!Number.isInteger(petId) || petId <= 0) {
    throw new Error("Please select a pet.");
  }

  return {
    petId,
    type: String(appointment.type || "").trim(),
    date: appointment.date || null,
    time: appointment.time
      ? `${appointment.time.slice(0, 5)}:00`
      : null,
    veterinarian: String(
      appointment.veterinarian || ""
    ).trim(),
    reason: String(appointment.reason || "").trim(),
    status: String(appointment.status || "").trim(),
  };
}

export async function getAppointments({
  petId,
  signal,
} = {}) {
  const params = new URLSearchParams();

  if (petId !== undefined && petId !== null && petId !== "") {
    params.set("petId", String(petId));
  }

  const query = params.toString();

  const appointments = await request(
    query ? `${API_URL}?${query}` : API_URL,
    { signal }
  );

  if (!Array.isArray(appointments)) {
    throw new Error("The server returned invalid appointment data.");
  }

  return appointments.map(normalizeAppointment);
}

export async function getAppointment(id, { signal } = {}) {
  const appointment = await request(
    `${API_URL}/${encodeURIComponent(id)}`,
    { signal }
  );

  return normalizeAppointment(appointment);
}

export async function createAppointment(appointment) {
  const saved = await request(API_URL, {
    method: "POST",
    body: JSON.stringify(createPayload(appointment)),
  });

  return normalizeAppointment(saved);
}

export async function updateAppointment(id, appointment) {
  const saved = await request(
    `${API_URL}/${encodeURIComponent(id)}`,
    {
      method: "PUT",
      body: JSON.stringify(createPayload(appointment)),
    }
  );

  return normalizeAppointment(saved);
}

export async function deleteAppointment(id) {
  await request(
    `${API_URL}/${encodeURIComponent(id)}`,
    { method: "DELETE" }
  );
}