const BASE_URL = import.meta.env.VITE_API_BASE_URL;

async function parseBody(res) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return { message: text };
  }
}

function pickErrorMessage(data, status) {
  return (
    data?.message ||
    data?.error ||
    data?.detail ||
    data?.title ||
    `HTTP ${status}`
  );
}

export async function apiGet(path) {
  const res = await fetch(`${BASE_URL}${path}`);
  const data = await parseBody(res);

  if (!res.ok) {
    throw new Error(pickErrorMessage(data, res.status));
  }
  return data;
}

export async function apiPost(path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await parseBody(res);

  if (!res.ok) {
    throw new Error(pickErrorMessage(data, res.status));
  }
  return data;
}