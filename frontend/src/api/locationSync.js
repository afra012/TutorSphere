const API_URL = "http://127.0.0.1:8000/api";

export async function syncProfileAddress(address, token) {
  if (!address?.trim()) return { ok: true };
  try {
    const query = async (q) => {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=bd&q=${encodeURIComponent(q)}`, { headers: { Accept: "application/json" } });
      if (!response.ok) throw new Error("Address lookup failed.");
      return response.json();
    };
    let points = await query(`${address.trim()}, Bangladesh`);
    if (!points.length) points = await query(address.trim());
    const point = points[0];
    if (!point) return { ok: false, message: "Address could not be located. Add a specific area, city, and district to your profile address." };

    const headers = { Authorization: `Bearer ${token}`, Accept: "application/json" };
    const currentResponse = await fetch(`${API_URL}/locations/me`, { headers });
    const currentData = await currentResponse.json();
    if (!currentResponse.ok) return { ok: false, message: currentData.message || "Could not load your current map pin." };

    const current = currentData.location;
    const saveResponse = await fetch(current ? `${API_URL}/locations/${current.id}` : `${API_URL}/locations`, {
      method: current ? "PUT" : "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ latitude: Number(point.lat), longitude: Number(point.lon), address: address.trim() }),
    });
    const savedData = await saveResponse.json();
    if (!saveResponse.ok) return { ok: false, message: savedData.message || "Address found, but the map pin could not be saved." };
    return { ok: true };
  } catch (error) {
    console.error("Profile address map sync failed:", error);
    return { ok: false, message: "Could not connect to the map service. Your profile is saved; try again." };
  }
}
