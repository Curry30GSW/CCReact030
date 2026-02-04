export async function fetchAndBearer(
  endpoint: string,
  options: RequestInit = {}
) {
  const isProduction = import.meta.env.MODE === 'production';
  
  // Determinar la URL base
  let baseUrl: string;
  
  if (isProduction) {
    baseUrl = import.meta.env.VITE_API_URL || '/CarteraCastigada/api';
  } else {
    // En desarrollo: usa localhost
    baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
  }
  
  // Limpiar el endpoint (remover /api duplicado si existe)
  let cleanEndpoint = endpoint;
  if (cleanEndpoint.startsWith('/api')) {
    cleanEndpoint = cleanEndpoint.substring(4);
  }
  if (!cleanEndpoint.startsWith('/')) {
    cleanEndpoint = '/' + cleanEndpoint;
  }
  
  // Construir URL final
  const url = isProduction 
    ? `${baseUrl}${cleanEndpoint}`
    : `${baseUrl}/api${cleanEndpoint}`;
  
  const headers: HeadersInit = {
    ...(options.body instanceof FormData
      ? {}
      : { "Content-Type": "application/json" }),
    ...(options.headers || {}),
  };

  const res = await fetch(url, {
    ...options,
    headers,
    credentials: "include", 
  });

  return res;
}