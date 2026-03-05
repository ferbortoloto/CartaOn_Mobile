/**
 * Geocoding via Nominatim (OpenStreetMap) — gratuito, sem chave de API.
 * Converte um endereço de texto em { latitude, longitude }.
 */
export async function geocodeAddress(address) {
  const query = encodeURIComponent(`${address}, Brasil`);
  const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1&countrycodes=br`;

  const response = await fetch(url, {
    headers: { 'Accept-Language': 'pt-BR', 'User-Agent': 'CartaOnMOBILE/1.0' },
  });

  if (!response.ok) throw new Error('Erro ao consultar geocoding');

  const data = await response.json();
  if (!data || data.length === 0) return null;

  return {
    latitude: parseFloat(data[0].lat),
    longitude: parseFloat(data[0].lon),
    displayName: data[0].display_name,
  };
}
