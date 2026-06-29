/* =============================================
   DONNÉES : Centrales nucléaires françaises
   ============================================= */
const PLANTS = [
  { id: 'belleville',   name: 'Belleville',     lat: 47.508, lon: 2.872,   river: 'Loire', active: true, stationCodes: ['04048510', '04048520'] },
  { id: 'dampierre',    name: 'Dampierre',      lat: 47.735, lon: 2.518,   river: 'Loire', active: true, stationCodes: ['04048520', '04048530'] },
  { id: 'st-laurent',   name: 'Saint-Laurent',  lat: 47.720, lon: 1.572,   river: 'Loire', active: true, stationCodes: ['04048530', '04048540'] },
  { id: 'bugey',        name: 'Bugey',          lat: 45.797, lon: 5.270,   river: 'Rhône', active: true, stationCodes: ['06000010', '06000020'] },
  { id: 'cruas',        name: 'Cruas-Meysse',   lat: 44.630, lon: 4.757,   river: 'Rhône', active: true, stationCodes: ['06000020', '06000030'] },
  { id: 'st-alban',     name: 'Saint-Alban',    lat: 45.474, lon: 4.814,   river: 'Rhône', active: true, stationCodes: ['06000030', '06000040'] },
  { id: 'tricastin',    name: 'Tricastin',      lat: 44.332, lon: 4.728,   river: 'Rhône (canal)', active: true, stationCodes: ['06000040'] },
  { id: 'blayais',      name: 'Blayais',        lat: 45.256, lon: -0.697,  river: 'Gironde', active: true, stationCodes: [] },
  { id: 'cattenom',     name: 'Cattenom',       lat: 49.403, lon: 6.218,   river: 'Moselle', active: true, stationCodes: [] },
  { id: 'chinon',       name: 'Chinon',         lat: 47.237, lon: 0.174,   river: 'Vienne', active: true, stationCodes: [] },
  { id: 'chooz',        name: 'Chooz',          lat: 50.090, lon: 4.789,   river: 'Meuse', active: true, stationCodes: [] },
  { id: 'civaux',       name: 'Civaux',         lat: 46.460, lon: 0.653,   river: 'Vienne', active: true, stationCodes: [] },
  { id: 'fessenheim',   name: 'Fessenheim',     lat: 47.903, lon: 7.567,   river: "Canal d'Alsace", active: false, stationCodes: [] },
  { id: 'flamanville',  name: 'Flamanville',    lat: 49.523, lon: -1.887,  river: 'Manche', active: true, stationCodes: [] },
  { id: 'golfech',      name: 'Golfech',        lat: 44.106, lon: 0.847,   river: 'Garonne', active: true, stationCodes: ['05154250', '05152000'] },
  { id: 'gravelines',   name: 'Gravelines',     lat: 51.012, lon: 2.132,   river: 'Mer du Nord', active: true, stationCodes: [] },
  { id: 'nogent',       name: 'Nogent',         lat: 48.520, lon: 3.519,   river: 'Seine', active: true, stationCodes: [] },
  { id: 'paluel',       name: 'Paluel',         lat: 49.859, lon: 0.628,   river: 'Manche', active: true, stationCodes: [] },
  { id: 'penly',        name: 'Penly',          lat: 49.972, lon: 1.213,   river: 'Manche', active: true, stationCodes: [] },
];

const THRESHOLDS = [
  { max: 10, color: '#3b82f6', bg: '#0f2a5a' },
  { max: 15, color: '#22c55e', bg: '#052e16' },
  { max: 20, color: '#eab308', bg: '#3a2000' },
  { max: 25, color: '#f97316', bg: '#3b1200' },
  { max: Infinity, color: '#ef4444', bg: '#3b0505' },
];

/* =============================================
   UTILITAIRES
   ============================================= */
function tempInfo(t) {
  if (t === null || t === undefined) return { color: '#475569', bg: '#1e293b' };
  return THRESHOLDS.find(th => t < th.max);
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

function fmtDate(d) {
  return d ? new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : '';
}

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : '';
}

function freshnessInfo(dateStr) {
  const days = (Date.now() - new Date(dateStr)) / 86400000;
  if (days <= 1) return { icon: '🟢', color: '#22c55e', label: `Il y a ${Math.round(days * 24)}h` };
  if (days <= 7) return { icon: '🟢', color: '#22c55e', label: `Il y a ${Math.round(days)}j` };
  return { icon: '🟠', color: '#f97316', label: `Données anciennes` };
}

function makeIcon(color, active) {
  const html = `<div style="width:34px;height:34px;background:${color}cc;border:2px solid ${color};border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;">☢</div>`;
  return L.divIcon({ html, iconSize: [34, 34], iconAnchor: [17, 17], popupAnchor: [0, -20] });
}

/* =============================================
   API HUB'EAU
   ============================================= */
async function fetchWithTimeout(url) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    return res.ok ? await res.json() : null;
  } catch { return null; }
}

async function fetchLatestReading(code, dateFrom = null) {
  let url = `https://hubeau.eaufrance.fr/api/v1/temperature/chronique?code_station=${code}&size=1&sort=desc&format=json`;
  if (dateFrom) url += `&date_debut_mesure=${dateFrom}`;
  const res = await fetchWithTimeout(url);
  return res?.data?.[0] ?? null;
}

async function fetchStations(lat, lon) {
  const url = `https://hubeau.eaufrance.fr/api/v1/temperature/station?latitude=${lat}&longitude=${lon}&distance=50&size=5&format=json`;
  const res = await fetchWithTimeout(url);
  return res?.data || [];
}

/* =============================================
   MOTEUR DE CHARGEMENT
   ============================================= */
async function loadPlant(plant, markers) {
  const ctEl = document.getElementById(`ct-${plant.id}`);
  let result = null;

  // 1. Priorité aux codes manuels
  for (const code of plant.stationCodes) {
    const reading = await fetchLatestReading(code, daysAgo(30));
    if (reading) { result = { reading, station: { code_station: code } }; break; }
  }

  // 2. Fallback automatique
  if (!result) {
    const stations = await fetchStations(plant.lat, plant.lon);
    for (const st of stations) {
      const reading = await fetchLatestReading(st.code_station, daysAgo(30));
      if (reading) { result = { reading, station: st }; break; }
    }
  }

  if (!result) {
    ctEl.innerHTML = `<span class="text-dim">Indisponible</span>`;
    return;
  }

  const { reading, station } = result;
  const { color, bg } = tempInfo(reading.resultat);
  const fresh = freshnessInfo(reading.date_mesure_temp);

  ctEl.innerHTML = `<span style="background:${bg};color:${color};padding:2px 6px;border-radius:4px">🌡️ ${reading.resultat.toFixed(1)}°C</span> ${fresh.icon}`;
  markers[plant.id].setIcon(makeIcon(color, plant.active));
}

/* =============================================
   INITIALISATION
   ============================================= */
function init() {
  const map = L.map('map').setView([46.8, 2.5], 6);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
  
  const markers = {};
  const list = document.getElementById('plants-list');

  PLANTS.forEach(plant => {
    const card = document.createElement('div');
    card.className = 'plant-card';
    card.innerHTML = `<div>${plant.name}</div><div id="ct-${plant.id}">⏳ ...</div>`;
    list.appendChild(card);
    markers[plant.id] = L.marker([plant.lat, plant.lon], { icon: makeIcon('#475569', plant.active) }).addTo(map);
  });

  PLANTS.forEach(p => loadPlant(p, markers));
}

document.addEventListener('DOMContentLoaded', init);