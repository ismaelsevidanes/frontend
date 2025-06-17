// Helper para peticiones autenticadas que gestiona expiración de token y redirección automática

export async function authFetch(input: RequestInfo, init: RequestInit = {}) {
  const token = localStorage.getItem("token");
  const headers = {
    ...(init.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const response = await fetch(input, { ...init, headers });
  if (response.status === 401 || response.status === 403) {
    localStorage.removeItem("token");
    window.location.href = "/login";
    throw new Error("Token expirado o inválido. Redirigiendo al login.");
  }
  return response;
}
