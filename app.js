const FARM = {
  nome: "Fazenda do Padrinho",
  latitude: -20.0130583,
  longitude: -45.9368333,
  elevacao: 730
};

let currentPosition = null;
let heading = null;
let orientationEvents = 0;

const $ = id => document.getElementById(id);

$("https").textContent = window.isSecureContext ? "SIM" : "NÃO";

function normalize360(x) {
  return (x % 360 + 360) % 360;
}

function angleDiff(a, b) {
  return ((a - b + 540) % 360) - 180;
}

function distanceBearing(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const toRad = d => d * Math.PI / 180;
  const p1 = toRad(lat1), p2 = toRad(lat2);
  const dLat = toRad(lat2-lat1);
  const dLon = toRad(lon2-lon1);

  const a = Math.sin(dLat/2)**2 +
            Math.cos(p1)*Math.cos(p2)*Math.sin(dLon/2)**2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R*c;

  const y = Math.sin(dLon)*Math.cos(p2);
  const x = Math.cos(p1)*Math.sin(p2) -
            Math.sin(p1)*Math.cos(p2)*Math.cos(dLon);
  const bearing = normalize360(Math.atan2(y,x) * 180/Math.PI);

  return {distance, bearing};
}

function formatDistance(m) {
  return m < 1000 ? `${Math.round(m)} m` : `${(m/1000).toFixed(2)} km`;
}

function updateFarm() {
  if (!currentPosition || heading === null) return;

  const {latitude, longitude, accuracy} = currentPosition.coords;
  const r = distanceBearing(latitude, longitude, FARM.latitude, FARM.longitude);
  const diff = angleDiff(r.bearing, heading);

  $("farmData").textContent =
`Coordenada: ${FARM.latitude.toFixed(7)}, ${FARM.longitude.toFixed(7)}
Elevação: ${FARM.elevacao} m
Bearing até a fazenda: ${r.bearing.toFixed(1)}°
Heading do celular: ${heading.toFixed(1)}°
Diferença angular: ${diff.toFixed(1)}°
Distância: ${formatDistance(r.distance)}
Precisão GPS: ${Math.round(accuracy)} m`;

  $("markerDistance").textContent = formatDistance(r.distance);
  $("marker").classList.remove("hidden");

  // Campo horizontal simples: 70° de FOV aproximado.
  // É apenas para validar a direção; não representa ainda uma projeção AR calibrada.
  const fov = 70;
  let x = 50 + (diff / (fov/2)) * 50;
  x = Math.max(-20, Math.min(120, x));
  $("marker").style.left = `${x}%`;
}

function onOrientation(e) {
  orientationEvents++;
  let h = null;

  // Android Chrome normalmente fornece alpha como azimute quando absolute=true.
  if (e.absolute && typeof e.alpha === "number") {
    h = normalize360(e.alpha);
  } else if (typeof e.webkitCompassHeading === "number") {
    h = normalize360(e.webkitCompassHeading);
  } else if (typeof e.alpha === "number") {
    h = normalize360(e.alpha);
  }

  if (h !== null) {
    heading = h;
    $("orientationStatus").textContent = "OK";
  }

  $("orientationData").textContent =
`Eventos: ${orientationEvents}
absolute: ${e.absolute}
alpha: ${typeof e.alpha === "number" ? e.alpha.toFixed(2)+"°" : "—"}
beta: ${typeof e.beta === "number" ? e.beta.toFixed(2)+"°" : "—"}
gamma: ${typeof e.gamma === "number" ? e.gamma.toFixed(2)+"°" : "—"}
heading usado: ${heading === null ? "—" : heading.toFixed(1)+"°"}`;

  updateFarm();
}

async function startOrientation() {
  try {
    if (typeof DeviceOrientationEvent === "undefined") {
      $("orientationStatus").textContent = "NÃO DISPONÍVEL";
      return;
    }

    if (typeof DeviceOrientationEvent.requestPermission === "function") {
      const permission = await DeviceOrientationEvent.requestPermission();
      if (permission !== "granted") {
        $("orientationStatus").textContent = "PERMISSÃO NEGADA";
        return;
      }
    }

    window.addEventListener("deviceorientationabsolute", onOrientation, true);
    window.addEventListener("deviceorientation", onOrientation, true);
  } catch (err) {
    $("orientationStatus").textContent = "ERRO";
    $("orientationData").textContent = String(err);
  }
}

async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {facingMode: {ideal: "environment"}},
      audio: false
    });
    $("camera").srcObject = stream;
    $("cameraStatus").textContent = "OK";
  } catch (err) {
    $("cameraStatus").textContent = "ERRO";
  }
}

function startGPS() {
  if (!navigator.geolocation) {
    $("gpsStatus").textContent = "NÃO DISPONÍVEL";
    return;
  }

  navigator.geolocation.watchPosition(
    pos => {
      currentPosition = pos;
      $("gpsStatus").textContent = "OK";
      $("gpsData").textContent =
`Latitude: ${pos.coords.latitude.toFixed(7)}
Longitude: ${pos.coords.longitude.toFixed(7)}
Precisão: ${Math.round(pos.coords.accuracy)} m
Altitude: ${pos.coords.altitude == null ? "—" : pos.coords.altitude.toFixed(1)+" m"}`;

      updateFarm();
    },
    err => {
      $("gpsStatus").textContent = "ERRO";
      $("gpsData").textContent = `${err.code}: ${err.message}`;
    },
    {enableHighAccuracy:true, maximumAge:1000, timeout:20000}
  );
}

$("startBtn").addEventListener("click", async () => {
  $("startBtn").disabled = true;
  $("startBtn").textContent = "TESTANDO...";
  await startCamera();
  startGPS();
  await startOrientation();
  $("startBtn").textContent = "TESTE ATIVO";
});
