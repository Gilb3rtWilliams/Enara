const BASE = (import.meta.env.VITE_API_URL || "http://127.0.0.1:8000").replace(/\/$/, "");

export class ApiError extends Error {}

function describeValidation(detail) {
  if (!Array.isArray(detail)) return null;
  return detail
    .slice(0, 3)
    .map((d) => {
      const field = String(d.loc?.[d.loc.length - 1] ?? "").replace(/_/g, " ");
      return field && field !== "body" ? `${field}: ${d.msg}` : d.msg;
    })
    .join(" ");
}

/** POST /predict. `payload` uses the API's snake_case field names. */
export async function predict(payload) {
  let res;
  try {
    res = await fetch(`${BASE}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new ApiError(
      `Can’t reach the prediction service at ${BASE}. Check that the backend is running, then try again.`
    );
  }

  let body = null;
  try {
    body = await res.json();
  } catch {
    /* non-JSON error body */
  }

  if (!res.ok) {
    const detail = describeValidation(body?.detail);
    throw new ApiError(
      res.status === 422 && detail
        ? `The service rejected an answer. ${detail}`
        : "The prediction service returned an error. Try again in a moment."
    );
  }
  return body;
}
