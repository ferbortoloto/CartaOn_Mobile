/**
 * Utilitário de cálculo de tempo de deslocamento.
 * Usa a fórmula de Haversine para distância em linha reta entre coordenadas,
 * estimando o tempo com velocidade urbana média de 25 km/h + 5 min de buffer.
 */

const EARTH_RADIUS_KM = 6371;
const URBAN_SPEED_KMH = 25;
const BUFFER_MINUTES = 5;

/**
 * Calcula distância em km entre dois pontos usando Haversine.
 * @param {{ latitude: number, longitude: number }} coord1
 * @param {{ latitude: number, longitude: number }} coord2
 * @returns {number} distância em km
 */
export function haversineDistance(coord1, coord2) {
  const toRad = (deg) => (deg * Math.PI) / 180;

  const dLat = toRad(coord2.latitude - coord1.latitude);
  const dLon = toRad(coord2.longitude - coord1.longitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(coord1.latitude)) *
      Math.cos(toRad(coord2.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

/**
 * Estima o tempo de deslocamento em minutos entre dois pontos.
 * Arredonda para o múltiplo de 5 mais próximo acima e adiciona buffer.
 * @param {{ latitude: number, longitude: number }} coord1
 * @param {{ latitude: number, longitude: number }} coord2
 * @returns {number} tempo estimado em minutos
 */
export function estimateTravelTime(coord1, coord2) {
  if (!coord1 || !coord2) return DEFAULT_TRAVEL_TIME;

  const distanceKm = haversineDistance(coord1, coord2);
  const rawMinutes = (distanceKm / URBAN_SPEED_KMH) * 60;
  const roundedUp = Math.ceil(rawMinutes / 5) * 5;
  return roundedUp + BUFFER_MINUTES;
}

/**
 * Tempo padrão de deslocamento (minutos) usado quando não há coordenadas.
 */
export const DEFAULT_TRAVEL_TIME = 15;

/**
 * Formata o tempo de deslocamento para exibição.
 * @param {number} minutes
 * @returns {string} ex: "20 min" ou "1h 10 min"
 */
export function formatTravelTime(minutes) {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m} min`;
}

/**
 * Verifica se o gap disponível entre aulas é suficiente para o deslocamento.
 * @param {number} gapMinutes - tempo disponível entre fim de uma aula e início da próxima
 * @param {number} travelMinutes - tempo estimado de deslocamento
 * @returns {{ ok: boolean, margin: number, status: 'ok' | 'warning' | 'conflict' }}
 */
export function checkGap(gapMinutes, travelMinutes) {
  const margin = gapMinutes - travelMinutes;
  if (margin >= 5) return { ok: true, margin, status: 'ok' };
  if (margin >= 0) return { ok: false, margin, status: 'warning' };
  return { ok: false, margin, status: 'conflict' };
}

/**
 * Formata a distância para exibição.
 * @param {{ latitude: number, longitude: number }} coord1
 * @param {{ latitude: number, longitude: number }} coord2
 * @returns {string} ex: "2.3 km" ou "850 m"
 */
export function formatDistance(coord1, coord2) {
  if (!coord1 || !coord2) return '';
  const km = haversineDistance(coord1, coord2);
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}
