/* =============================================
   DONNÉES : Centrales nucléaires françaises + STATIONS RÉELLES
   ============================================= */
const PLANTS = [
  
  { id: 'belleville',  name: 'Belleville',     lat: 47.508, lon: 2.872,   river: 'Loire',                    active: true,  stationCodes: ['04048510', '04048520'] },
  { id: 'dampierre',   name: 'Dampierre',       lat: 47.735, lon: 2.518,   river: 'Loire',                    active: true,  stationCodes: ['04048520', '04048530'] },
  { id: 'st-laurent',  name: 'Saint-Laurent',   lat: 47.720, lon: 1.572,   river: 'Loire',                    active: true,  stationCodes: ['04048530', '04048540'] },
  { id: 'bugey',       name: 'Bugey',           lat: 45.797, lon: 5.270,   river: 'Rhône',                    active: true,  stationCodes: ['06000010', '06000020'] },
  { id: 'cruas',       name: 'Cruas-Meysse',    lat: 44.630, lon: 4.757,   river: 'Rhône',                    active: true,  stationCodes: ['06000020', '06000030'] },
  { id: 'st-alban',    name: 'Saint-Alban',     lat: 45.474, lon: 4.814,   river: 'Rhône',                    active: true,  stationCodes: ['06000030', '06000040'] },
  { id: 'tricastin',   name: 'Tricastin',       lat: 44.332, lon: 4.728,   river: 'Rhône (canal de Donzère)', active: true,  stationCodes: ['06000040'] },
  { id: 'blayais',     name: 'Blayais',         lat: 45.256, lon: -0.697,  river: 'Estuaire de la Gironde',   active: true,  stationCodes: [] },
  { id: 'cattenom',    name: 'Cattenom',        lat: 49.403, lon: 6.218,   river: 'Moselle',                  active: true,  stationCodes: [] },
  { id: 'chinon',      name: 'Chinon',          lat: 47.237, lon: 0.174,   river: 'Vienne',                   active: true,  stationCodes: [] },
  { id: 'chooz',       name: 'Chooz',           lat: 50.090, lon: 4.789,   river: 'Meuse',                    active: true,  stationCodes: [] },
  { id: 'civaux',      name: 'Civaux',          lat: 46.460, lon: 0.653,   river: 'Vienne',                   active: true,  stationCodes: [] },
  { id: 'fessenheim',  name: 'Fessenheim',      lat: 47.903, lon: 7.567,   river: "Canal d'Alsace",           active: false, stationCodes: [] },
  { id: 'flamanville', name: 'Flamanville',     lat: 49.523, lon: -1.887,  river: 'Manche (circuit ouvert)',  active: true,  stationCodes: [] },
  { id: 'golfech',     name: 'Golfech',         lat: 44.106, lon: 0.847,   river: 'Garonne',                  active: true,  stationCodes: ['05154250', '05152000', '05117000'] },
  { id: 'gravelines',  name: 'Gravelines',      lat: 51.012, lon: 2.132,   river: 'Mer du Nord',              active: true,  stationCodes: [] },
  { id: 'nogent',      name: 'Nogent',          lat: 48.520, lon: 3.519,   river: 'Seine',                    active: true,  stationCodes: [] },
  { id: 'paluel',      name: 'Paluel',          lat: 49.859, lon: 0.628,   river: 'Manche (circuit ouvert)',  active: true,  stationCodes: [] },
  { id: 'penly',       name: 'Penly',           lat: 49.972, lon: 1.213,   river: 'Manche (circuit ouvert)',  active: true,  stationCodes: [] },
];

/* =============================================
   SEUILS DE TEMPÉRATURE → COULEURS
   ============================================= */
const THRESHOLDS = [
  { max: 10,   color: '#3b82f6', bg: '#0f2a5a' },
  { max: 15,   color: '#22c55e', bg: '#052e16' },
  { max: 20,   color: '#eab308', bg: '#3a2000' },
  { max: 25,   color: '#f97316', bg: '#3b1200' },
  { max: Infinity, color: '#ef4444', bg: '#3b0505' },
];

/* =============================================
   UTILITAIRES
   ============================================= */
function tempInfo(t) {
  if (t === null || t === undefined) return { color: '#475569', bg: '#1e293b' };
  return THRESHOLDS.find(th => t < th.max);
}

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const toRad = x => x * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function fmtDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : '';
}

function yearsAgo(n) {
  const d = new Date();
  d.setFullYear(d.getFullYear() - n);
  return d.toISOString().split('T')[0];
}

/* =============================================
   FRAÎCHEUR DES DONNÉES
   ============================================= */
function freshnessInfo(dateStr) {
  const days = (Date.now() - new Date(dateStr)) / 86400000;
  if (days <= 1)    return { icon: '🟢', color: '#22c55e', label: `Il y a ${Math.round(days * 24)}h` };
  if (days <= 7)    return { icon: '🟢', color: '#22c55e', label: `Il y a ${Math.round(days)}j` };
  if (days <= 30)   return { icon: '🟡', color: '#eab308', label: `Il y a ${Math.round(days)}j` };
  if (days <= 180)  return { icon: '🟠', color: '#f97316', label: `Il y a ~${Math.round(days / 30)} mois` };
  return { icon: '🔴', color: '#ef4444', label: `Données de ${new Date(dateStr).getFullYear()}` };
}

/* =============================================
   ICÔNE MARQUEUR (Leaflet)
   ============================================= */
function makeIcon(color, active) {
  const glow = active ? `box-shadow:0 0 10px ${color}88, 0 0 3px ${color};` : '';
  const alpha = active ? 'cc' : '44';
  const html = `
    <div style="
      width:34px; height:34px;
      background:${color}${alpha};
      border:2px solid ${color};
      border-radius:50%;
      display:flex; align-items:center; justify-content:center;
      font-size:15px; line-height:1;
      ${glow}
      cursor:pointer;
    ">☢</div>
  `;
  return L.divIcon({
    html,
    className: '',
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -20]
  });
}

/* =============================================
   CONTENU POPUP
   ============================================= */
function buildPopup(plant, station, reading) {
  const icon = plant.active ? '☢️' : '🔒';

  if (!station || !reading) {
    return `
      <div class="popup-inner">
        <div class="popup-name">${icon} ${plant.name}</div>
        <div class="popup-river">📍 ${plant.river}</div>
        <div class="popup-nodata" style="margin-top:10px">
          ${plant.stationCodes.length > 0 ? 'Aucune donnée récente pour les stations prioritaires.' : 'Aucune station de mesure à proximité.'}
        </div>
      </div>
    `;
  }

  const { color } = tempInfo(reading.resultat);
  const fresh = freshnessInfo(reading.date_mesure_temp);
  const dist = Math.round(haversine(plant.lat, plant.lon, station.latitude, station.longitude));
  const riv = capitalize(station.libelle_cours_eau || station.code_station);
  const date = fmtDate(reading.date_mesure_temp);
  const time = new Date(reading.date_mesure_temp).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const oldDataWarning = fresh.icon === '🟡' || fresh.icon === '🟠' || fresh.icon === '🔴'
    ? `<div class="popup-warn" style="color:#ef4444; font-weight:bold; margin-top:8px;">
        ⚠️ Données anciennes (${date})
       </div>`
    : '';

  const tempWarning = reading.resultat >= 24
    ? `<div class="popup-warn" style="color:#ef4444; font-weight:bold; margin-top:8px;">
        ⚠️ Seuil critique approché (${reading.resultat.toFixed(1)} °C)
       </div>`
    : '';

  return `
    <div class="popup-inner">
      <div class="popup-name">${icon} ${plant.name}</div>
      <div class="popup-river">📍 ${plant.river}</div>
      <div class="popup-temp-big" style="color:${color}">${reading.resultat.toFixed(1)} °C</div>
      <div class="popup-meta">
        📡 ${station.libelle_station || station.code_station}<br>
        🌊 ${riv}<br>
        📏 ${dist} km de la centrale<br>
        🕒 ${time}
      </div>
      <div class="freshness-badge" style="color:${fresh.color}; border-color:${fresh.color}22; background:${fresh.color}11; margin-top:8px;">
        ${fresh.icon} ${fresh.label}
      </div>
      ${oldDataWarning}
      ${tempWarning}
    </div>
  `;
}

/* =============================================
   API HUB'EAU
   ============================================= */
const API_TIMEOUT = 5000; // Timeout de 5 secondes

async function fetchWithTimeout(url) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    return null;
  }
}

async function fetchStations(lat, lon, delta = 0.35) {
  const bbox = `${lon - delta},${lat - delta},${lon + delta},${lat + delta}`;
  const url = `https://hubeau.eaufrance.fr/api/v1/temperature/station?bbox=${bbox}&size=20&format=json`;
  const result = await fetchWithTimeout(url);
  if (!result?.data) return [];

  // Filtrer les stations actives (pas de date_mise_hors_service)
  return result.data.filter(station => !station.date_mise_hors_service) || [];
}

async function fetchLatestReading(code, dateFrom = null) {
  let url = `https://hubeau.eaufrance.fr/api/v1/temperature/chronique?code_station=${code}&size=1&sort=desc&format=json`;
  if (dateFrom) url += `&date_debut_mesure_temp=${dateFrom}`;
  const result = await fetchWithTimeout(url);
  return result?.data?.[0] ?? null;
}

/* =============================================
   CHARGEMENT D'UNE CENTRALE (AVEC STATIONS PRIORITAIRES)
   ============================================= */
async function loadPlant(plant, markers) {
  const ctEl = document.getElementById(`ct-${plant.id}`);

  // 1. Essayer d'abord les stations prioritaires (stationCodes)
  if (plant.stationCodes && plant.stationCodes.length > 0) {
    for (const code of plant.stationCodes) {
      const reading = await fetchLatestReading(code, yearsAgo(0.08)); // 30 jours max
      if (reading) {
        // Trouver les infos de la station (pour le libellé et les coordonnées)
        // Si on n'a pas les infos, on utilise celles de la centrale
        const station = {
          code_station: code,
          libelle_station: `Station ${code}`,
          latitude: plant.lat,
          longitude: plant.lon,
          libelle_cours_eau: plant.river
        };

        const temp = reading.resultat;
        const { color, bg } = tempInfo(temp);
        const fresh = freshnessInfo(reading.date_mesure_temp);
        const riv = capitalize(plant.river);

        // Mise à jour de la card
        ctEl.innerHTML = `
          <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap">
            <span class="temp-pill" style="background:${bg}; color:${color}; border:1px solid ${color}55">
              🌡️ ${temp.toFixed(1)} °C
            </span>
            <span class="freshness-inline" style="color:${fresh.color}">${fresh.icon} ${fresh.label}</span>
          </div>
          <div class="card-riv-name">${riv}</div>
        `;

        // Mise à jour du marqueur
        markers[plant.id].setIcon(makeIcon(color, plant.active));
        markers[plant.id].setPopupContent(buildPopup(plant, station, reading), { maxWidth: 270 });
        return;
      }
    }
  }

  // 2. Si aucune station prioritaire n'a de données, chercher des stations proches
  const stations = await fetchStations(plant.lat, plant.lon);
  if (!stations.length) {
    ctEl.innerHTML = `<span class="text-dim">Pas de station à proximité</span>`;
    markers[plant.id].setPopupContent(buildPopup(plant, null, null), { maxWidth: 270 });
    return;
  }

  // 3. Trouver la meilleure mesure parmi les stations proches (moins de 30 jours)
  const best = await findBestReading(plant, stations);
  if (!best) {
    ctEl.innerHTML = `<span class="text-dim">Aucune donnée récente</span>`;
    markers[plant.id].setPopupContent(buildPopup(plant, stations[0], null), { maxWidth: 270 });
    return;
  }

  const { station, reading } = best;
  const temp = reading.resultat;
  const { color, bg } = tempInfo(temp);
  const fresh = freshnessInfo(reading.date_mesure_temp);
  const riv = capitalize(station.libelle_cours_eau || station.code_station);

  // Mise à jour de la card
  ctEl.innerHTML = `
    <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap">
      <span class="temp-pill" style="background:${bg}; color:${color}; border:1px solid ${color}55">
        🌡️ ${temp.toFixed(1)} °C
      </span>
      <span class="freshness-inline" style="color:${fresh.color}">${fresh.icon} ${fresh.label}</span>
    </div>
    <div class="card-riv-name">${riv}</div>
  `;

  // Mise à jour du marqueur
  markers[plant.id].setIcon(makeIcon(color, plant.active));
  markers[plant.id].setPopupContent(buildPopup(plant, station, reading), { maxWidth: 270 });
}

/* =============================================
   TROUVER LA MEILLEURE MESURE (MOINS DE 30 JOURS)
   ============================================= */
async function findBestReading(plant, stations) {
  if (!stations.length) return null;

  // Chercher des données des 30 derniers jours
  const recentDateFrom = yearsAgo(0.08); // ~30 jours
  const candidates = await Promise.all(
    stations.map(async (station) => {
      const reading = await fetchLatestReading(station.code_station, recentDateFrom);
      if (!reading) return null;
      return { station, reading };
    })
  );

  const recent = candidates.filter(Boolean);
  if (recent.length > 0) {
    recent.sort((a, b) => new Date(b.reading.date_mesure_temp) - new Date(a.reading.date_mesure_temp));
    return recent[0];
  }

  // Si aucune donnée récente, retourner null
  return null;
}

/* =============================================
   SÉLECTION D'UNE CENTRALE (SIDEBAR)
   ============================================= */
function selectCard(id) {
  document.querySelectorAll('.plant-card').forEach(c => c.classList.remove('selected'));
  const card = document.getElementById(`card-${id}`);
  if (card) {
    card.classList.add('selected');
    card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

/* =============================================
   INITIALISATION
   ============================================= */
function init() {
  const map = L.map('map').setView([46.8, 2.5], 6);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '© <a href="https://openstreetmap.org/copyright">OpenStreetMap</a> · données <a href="https://hubeau.eaufrance.fr">Hub\'Eau</a>',
  }).addTo(map);

  const markers = {};
  const list = document.getElementById('plants-list');

  PLANTS.forEach(plant => {
    // Card sidebar
    const card = document.createElement('div');
    card.className = 'plant-card' + (plant.active ? '' : ' closed');
    card.id = `card-${plant.id}`;
    card.innerHTML = `
      <div class="card-top">
        <div class="card-name">${plant.active ? '☢️' : '🔒'} ${plant.name}</div>
        ${!plant.active ? '<span class="badge-closed">Fermée 2020</span>' : ''}
      </div>
      <div class="card-river">🌊 ${plant.river}</div>
      <div class="card-temp" id="ct-${plant.id}"><span class="text-dim">⏳ …</span></div>
    `;
    card.addEventListener('click', () => {
      selectCard(plant.id);
      map.setView([plant.lat, plant.lon], 11, { animate: true });
      markers[plant.id]?.openPopup();
    });
    list.appendChild(card);

    // Marqueur carte
    const marker = L.marker([plant.lat, plant.lon], {
      icon: makeIcon('#475569', plant.active),
      title: plant.name,
    }).addTo(map);
    marker.bindPopup(buildPopup(plant, null, null), { maxWidth: 270 });
    marker.on('click', () => selectCard(plant.id));
    markers[plant.id] = marker;
  });

  // Chargement initial des données
  const txt = document.getElementById('load-text');
  const spinner = document.getElementById('spinner');
  let done = 0;
  const queue = [...PLANTS];

  async function worker() {
    while (queue.length) {
      const plant = queue.shift();
      await loadPlant(plant, markers);
      done++;
      txt.textContent = `${done} / ${PLANTS.length} centrales`;
    }
  }

  Promise.all(Array.from({ length: 5 }, worker)).then(() => {
    spinner.style.display = 'none';
    txt.textContent = `✓ Données chargées — Hub'Eau`;
  });

  // Rafraîchissement automatique toutes les 5 minutes
  setInterval(() => {
    spinner.style.display = 'inline-block';
    txt.textContent = '↻ Rafraîchissement...';
    const refreshQueue = [...PLANTS];
    let refreshDone = 0;

    async function refreshWorker() {
      while (refreshQueue.length) {
        const plant = refreshQueue.shift();
        await loadPlant(plant, markers);
        refreshDone++;
        txt.textContent = `${refreshDone} / ${PLANTS.length} centrales`;
      }
    }

    Promise.all(Array.from({ length: 5 }, refreshWorker)).then(() => {
      spinner.style.display = 'none';
      txt.textContent = `✓ Mise à jour — ${new Date().toLocaleTimeString('fr-FR')}`;
    });
  }, 5 * 60 * 1000); // 5 minutes
}

// Démarrage
document.addEventListener('DOMContentLoaded', init);