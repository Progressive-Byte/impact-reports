export async function fetchReport(id) {
  return publicApiRequest(`/api/public/reports/${id}`);
}

export async function publicApiRequest(endpoint) {
  const response = await fetch(endpoint);

  if (!response.ok) {
    let message;
    try {
      const body = await response.json();
      message = body.message || `Request failed with status ${response.status}`;
    } catch {
      message = `Request failed with status ${response.status}`;
    }
    throw new Error(message);
  }

  return response.json();
}
