import { authFetch } from "./authFetch";

/**
 * Consulta las plazas disponibles para un campo, fecha y slot.
 * @param fieldId ID del campo
 * @param date Fecha en formato YYYY-MM-DD
 * @param slot Número de slot (1-4)
 * @returns número de plazas disponibles
 */
export async function getAvailableSpots(fieldId: number, date: string, slot: number): Promise<number> {
  const res = await authFetch(`/api/fields/${fieldId}/availability?date=${date}&slot=${slot}`);
  if (!res.ok) throw new Error("No se pudo consultar la disponibilidad");
  const data = await res.json();
  return typeof data.availableSpots === "number" ? data.availableSpots : 0;
}
