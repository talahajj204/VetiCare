const PETS_API = "/api/pets";

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
      message = "You do not have permission to access these pets.";
    } else if (response.status === 404) {
      message = "The requested pet could not be found.";
    } else {
      try {
        const problem = await response.json();

        const errors = Object.values(problem.errors || {})
          .flat()
          .filter((value) => typeof value === "string");

        if (errors.length > 0) {
          message = errors.join("\n");
        } else if (typeof problem.message === "string") {
          message = problem.message;
        } else if (typeof problem.detail === "string") {
          message = problem.detail;
        }
      } catch {
        // Keep the default message if the response is not JSON.
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

function normalizePet(pet) {
  return {
    ...pet,
    name: pet.name || "",
    owner: pet.owner || "",
    ownerId: pet.ownerId ?? "",
    species: pet.species || "",
    breed: pet.breed || "",
    sex: pet.sex || "",
    dateOfBirth: pet.dateOfBirth || "",
    estimatedDOB: Boolean(pet.estimatedDOB),
    age: pet.age || "",
    color: pet.color || "",
    colorHex: pet.colorHex || "#55b7b2",
    weight:
      pet.weight === null || pet.weight === undefined
        ? ""
        : String(pet.weight),
    microchipNumber: pet.microchipNumber || "",
    bloodType: pet.bloodType || "",
    allergies: pet.allergies || "",
    chronicConditions: pet.chronicConditions || "",
    notes: pet.notes || "",
    profilePhoto: pet.profilePhoto || "",
    timeline: Array.isArray(pet.timeline) ? pet.timeline : [],
  };
}

function petPayload(pet) {
  const ownerId = Number(pet.ownerId);

  if (!Number.isInteger(ownerId) || ownerId <= 0) {
    throw new Error("Please select a valid owner.");
  }

  const weightText = String(pet.weight ?? "").trim();
  const weight = weightText === "" ? null : Number(weightText);

  if (
    weight !== null &&
    (!Number.isFinite(weight) || weight < 0)
  ) {
    throw new Error("Please enter a valid, non-negative weight.");
  }

  return {
    ownerId,
    name: String(pet.name ?? "").trim(),
    species: String(pet.species ?? "").trim(),
    breed: String(pet.breed ?? "").trim(),
    sex: String(pet.sex ?? "").trim(),
    dateOfBirth: pet.dateOfBirth || null,
    estimatedDOB: Boolean(pet.estimatedDOB),
    age: String(pet.age ?? "").trim(),
    color: String(pet.color ?? "").trim(),
    colorHex: pet.colorHex || "#55b7b2",
    weight,
    microchipNumber: String(pet.microchipNumber ?? "").trim(),
    bloodType: String(pet.bloodType ?? "").trim(),
    allergies: String(pet.allergies ?? "").trim(),
    chronicConditions: String(pet.chronicConditions ?? "").trim(),
    notes: String(pet.notes ?? "").trim(),
    profilePhoto: pet.profilePhoto || "",
  };
}

function petPath(id) {
  return `${PETS_API}/${encodeURIComponent(String(id))}`;
}

export async function getPets({ signal } = {}) {
  const pets = await request(PETS_API, { signal });

  if (!Array.isArray(pets)) {
    throw new Error("The server returned an invalid pets list.");
  }

  return pets.map(normalizePet);
}

export async function getPet(id, { signal } = {}) {
  const pet = await request(petPath(id), { signal });

  return normalizePet(pet);
}

export async function createPet(pet) {
  const createdPet = await request(PETS_API, {
    method: "POST",
    body: JSON.stringify(petPayload(pet)),
  });

  return normalizePet(createdPet);
}

export async function updatePet(id, pet) {
  const updatedPet = await request(petPath(id), {
    method: "PUT",
    body: JSON.stringify(petPayload(pet)),
  });

  return normalizePet(updatedPet);
}

export async function deletePet(id) {
  await request(petPath(id), {
    method: "DELETE",
  });
}