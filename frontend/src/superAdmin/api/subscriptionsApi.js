export async function subscriptionsRequest(
  path = "",
  options = {},
  base = "/api/super-admin/subscriptions"
) {
  const response = await fetch(`${base}${path}`, {
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

  const data =
    response.status === 204
      ? null
      : await response.json().catch(() => null);

  if (!response.ok) {
    const validation = data?.errors
      ? Object.values(data.errors).flat().join(" ")
      : "";

    throw new Error(
      validation ||
      data?.message ||
      data?.detail ||
      (response.status === 401
        ? "Please sign in again."
        : response.status === 403
          ? "Only a Super Admin can manage subscriptions."
          : "Unable to complete the request. Please try again.")
    );
  }

  return data;
}
