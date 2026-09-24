const $ = id => document.getElementById(id);

let orientationEvents = 0;
let lastEvent = null;
let watchId = null;

function setText(id, value, cls="") {
  const el = $(id);
  el.textContent = value;
  el.className = cls;
}

function normalizeAngle(v) {
  return (v % 360 + 360) % 360;
}

function cardinal(deg) {
  const dirs = ["N","NE","E","SE","S","SW","W","NW"];
  return dirs[Math.round(deg / 45) % 8];
}

function browserInfo() {
  const ua = navigator.userAgent;
  if (/Android/i.test(ua)) return "Android";
  if (/iPhone|iPad|iPod/i.test(ua)) return "iOS";
  return "Outro";
}

function inspectEnvironment() {
  const secure = window.isSecureContext;
  setText("https", secure ? "SIM" : "NÃO", secure ? "ok" : "error");
  setText("secure", secure ? "SECURE" : "NÃO SEGURO", secure ? "ok" : "error");
  setText("browser", browserInfo());
  setText("orientationApi", typeof DeviceOrientationEvent !== "undefined" ? "SIM" : "NÃO", typeof DeviceOrientationEvent !== "undefined" ? "ok" : "error");
  setText("geoApi", "geolocation" in navigator ? "SIM" : "NÃO", "geolocation" in navigator ? "ok" : "error");
}

async function inspectPermission() {
  if (!navigator.permissions?.query) {
    setText("gpsPermission", "API não disponível", "warn");
    return;
  }

  try {
    const result = await navigator.permissions.query({name: "geolocation"});
    setText("gpsPermission", result.state);
    result.onchange = () => setText("gpsPermission", result.state);
  } catch {
    setText("gpsPermission", "não consultável", "warn");
  }
}

async function startCamera() {
  if (!navigator.mediaDevices?.getUserMedia) {
    setText("cameraStatus", "API NÃO DISPONÍVEL", "error");
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {facingMode: {ideal: "environment"}},
      audio: false
    });
    $("camera").srcObject = stream;
    setText("cameraStatus", "OK", "ok");
  } catch (e) {
    setText("cameraStatus", `${e.name}: ${e.message}`, "error");
  }
}

function startGPS() {
  if (!navigator.geolocation) {
    setText("gpsStatus", "API NÃO DISPONÍVEL", "error");
    return;
  }

  setText("gpsStatus", "SOLICITANDO…");

  watchId = navigator.geolocation.watchPosition(
    pos => {
      const c = pos.coords;
      setText("gpsStatus", "OK", "ok");
      setText("latitude", Number(c.latitude).toFixed(7), "ok");
      setText("longitude", Number(c.longitude).toFixed(7), "ok");
      setText("accuracy", `${Math.round(c.accuracy)} m`, c.accuracy <= 20 ? "ok" : "warn");
      setText("gpsError", "—");
      setText("gpsPermission", "concedida", "ok");
      diagnostic();
    },
    err => {
      setText("gpsStatus", "ERRO", "error");
      setText("gpsError", `${err.code} — ${err.message}`, "error");
      if (err.code === 1) setText("gpsPermission", "negada", "error");
      diagnostic();
    },
    {enableHighAccuracy:true, maximumAge:1000, timeout:20000}
  );
}

async function requestOrientationPermission() {
  if (
    typeof DeviceOrientationEvent !== "undefined" &&
    typeof DeviceOrientationEvent.requestPermission === "function"
  ) {
    const result = await DeviceOrientationEvent.requestPermission();
    if (result !== "granted") throw new Error("Permissão de orientação: " + result);
  }
}

function handleOrientation(e) {
  orientationEvents++;
  lastEvent = e;

  setText("eventCount", String(orientationEvents), "ok");
  setText("absolute", String(e.absolute));
  setText("alpha", Number.isFinite(e.alpha) ? `${e.alpha.toFixed(2)}°` : "null");
  setText("beta", Number.isFinite(e.beta) ? `${e.beta.toFixed(2)}°` : "null");
  setText("gamma", Number.isFinite(e.gamma) ? `${e.gamma.toFixed(2)}°` : "null");

  setText("orientationStatus", "EVENTOS RECEBIDOS", "ok");

  let h = null;

  if (Number.isFinite(e.webkitCompassHeading)) {
    h = e.webkitCompassHeading;
  } else if (Number.isFinite(e.alpha)) {
    h = 360 - e.alpha;
  }

  if (Number.isFinite(h)) {
    h = normalizeAngle(h);
    setText("heading", `${h.toFixed(1)}°`, "ok");
    setText("direction", cardinal(h), "ok");
  } else {
    setText("heading", "não calculável", "warn");
    setText("direction", "—", "warn");
  }

  diagnostic();
}

async function startOrientation() {
  if (typeof DeviceOrientationEvent === "undefined") {
    setText("orientationStatus", "API NÃO DISPONÍVEL", "error");
    return;
  }

  try {
    await requestOrientationPermission();
  } catch (e) {
    setText("orientationStatus", e.message, "error");
    return;
  }

  window.addEventListener("deviceorientationabsolute", handleOrientation, true);
  window.addEventListener("deviceorientation", handleOrientation, true);

  setText("orientationStatus", "AGUARDANDO EVENTO…", "warn");
}

function diagnostic() {
  if (orientationEvents === 0) {
    $("diagnostic").textContent = "Nenhum evento de orientação foi recebido ainda.";
  } else if (watchId === null) {
    $("diagnostic").textContent = "Orientação respondeu. GPS ainda não foi iniciado.";
  } else {
    $("diagnostic").textContent = "Dados recebidos. Não interprete o azimute como definitivo ainda; primeiro vamos validar a rotação do aparelho.";
  }
}

async function start() {
  $("startBtn").disabled = true;
  inspectEnvironment();
  await inspectPermission();
  await startCamera();
  startGPS();
  await startOrientation();
  diagnostic();
}

async function copyDiagnostic() {
  const text = [
    "AR Fazendas — Sensor Debug",
    `HTTPS: ${$("https").textContent}`,
    `Browser: ${$("browser").textContent}`,
    `Camera: ${$("cameraStatus").textContent}`,
    `GPS: ${$("gpsStatus").textContent}`,
    `GPS permission: ${$("gpsPermission").textContent}`,
    `Latitude: ${$("latitude").textContent}`,
    `Longitude: ${$("longitude").textContent}`,
    `Accuracy: ${$("accuracy").textContent}`,
    `GPS error: ${$("gpsError").textContent}`,
    `Orientation API: ${$("orientationApi").textContent}`,
    `Orientation status: ${$("orientationStatus").textContent}`,
    `Events: ${$("eventCount").textContent}`,
    `absolute: ${$("absolute").textContent}`,
    `alpha: ${$("alpha").textContent}`,
    `beta: ${$("beta").textContent}`,
    `gamma: ${$("gamma").textContent}`,
    `heading: ${$("heading").textContent}`,
    `direction: ${$("direction").textContent}`
  ].join("\n");

  try {
    await navigator.clipboard.writeText(text);
    $("copyBtn").textContent = "COPIADO";
    setTimeout(() => $("copyBtn").textContent = "COPIAR DIAGNÓSTICO", 1500);
  } catch {
    alert(text);
  }
}

inspectEnvironment();
$("startBtn").addEventListener("click", start);
$("copyBtn").addEventListener("click", copyDiagnostic);
