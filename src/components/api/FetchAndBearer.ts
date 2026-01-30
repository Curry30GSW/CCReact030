export async function fetchAndBearer(
  endpoint: string,
  options: RequestInit = {}
) {
  const headers: HeadersInit = {
    ...(options.body instanceof FormData
      ? {}
      : { "Content-Type": "application/json" }),
    ...(options.headers || {}),
  };

  const res = await fetch(
    `http://localhost:5000${endpoint}`,
    {
      ...options,
      headers,
      credentials: "include", 
    }
  );

  return res;
}
