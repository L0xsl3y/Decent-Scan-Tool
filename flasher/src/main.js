// Decent Scan flasher: esptool-js on top of web-serial-polyfill (WebUSB),
// so it works in Chrome on Android, which has no Web Serial over USB.
import { ESPLoader, Transport } from "esptool-js";
import { serial as usbSerial } from "web-serial-polyfill";

const ESPRESSIF_VID = 0x303a;
const $ = (id) => document.getElementById(id);
const logEl = $("log");
const statusEl = $("status");

let transport = null;
let loader = null;
let manifest = null;

function log(msg) {
  logEl.textContent += msg + "\n";
  logEl.scrollTop = logEl.scrollHeight;
}
function status(msg, isErr = false) {
  statusEl.textContent = msg;
  statusEl.classList.toggle("err", isErr);
  log((isErr ? "ERROR: " : "") + msg);
}
const terminal = {
  clean() {},
  writeLine: (d) => log(d),
  write: (d) => { logEl.textContent += d; },
};

async function loadManifest() {
  try {
    const r = await fetch("firmware/manifest.json", { cache: "no-cache" });
    if (!r.ok) throw new Error("HTTP " + r.status);
    manifest = await r.json();
    $("fw-info").textContent =
      `Latest release: ${manifest.version} (${manifest.chip}, built ${manifest.built})`;
  } catch (e) {
    $("fw-info").textContent = "No hosted firmware found. You can still flash a .bin file.";
    document.querySelector('input[value="file"]').checked = true;
  }
}

function setConnected(on) {
  $("connect").disabled = on;
  $("flash").disabled = !on;
  $("disconnect").disabled = !on;
}

async function requestPort() {
  // Desktop Chrome has real Web Serial; Android Chrome only has WebUSB.
  if ("serial" in navigator) {
    return navigator.serial.requestPort({ filters: [{ usbVendorId: ESPRESSIF_VID }] });
  }
  if ("usb" in navigator) {
    return usbSerial.requestPort({ filters: [{ usbVendorId: ESPRESSIF_VID }] });
  }
  throw new Error("This browser has neither Web Serial nor WebUSB. Use Chrome.");
}

async function connect() {
  try {
    status("Pick the ESP32-S3 (USB JTAG/serial debug unit) in the popup…");
    const port = await requestPort();
    transport = new Transport(port, false);
    loader = new ESPLoader({ transport, baudrate: 921600, romBaudrate: 115200, terminal });
    const chip = await loader.main("default_reset");
    status(`Connected: ${chip}`);
    if (!chip.includes("ESP32-S3")) {
      status(`Connected to ${chip}, but this firmware is for the ESP32-S3.`, true);
    }
    setConnected(true);
  } catch (e) {
    status(`Connect failed: ${e.message || e}. Is the board in download mode (hold BOOT, tap RESET)?`, true);
    await cleanup();
  }
}

async function fetchBin(path) {
  const r = await fetch("firmware/" + path, { cache: "no-cache" });
  if (!r.ok) throw new Error(`Download ${path}: HTTP ${r.status}`);
  return new Uint8Array(await r.arrayBuffer());
}

async function buildFileArray() {
  const src = document.querySelector('input[name="src"]:checked').value;
  if (src === "file") {
    const f = $("file").files[0];
    if (!f) throw new Error("Choose a .bin file first.");
    return { files: [{ data: new Uint8Array(await f.arrayBuffer()), address: 0 }],
             mode: "keep", freq: "keep", size: "keep" };
  }
  if (!manifest) throw new Error("No hosted firmware available.");
  const files = [];
  for (const p of manifest.parts) {
    status(`Downloading ${p.path}…`);
    files.push({ data: await fetchBin(p.path), address: parseInt(p.offset, 16) });
  }
  return { files, mode: manifest.flash_mode, freq: manifest.flash_freq, size: manifest.flash_size };
}

async function flash() {
  $("flash").disabled = true;
  try {
    const img = await buildFileArray();
    if ($("erase").checked) {
      status("Erasing flash (this takes ~20 s)…");
      await loader.eraseFlash();
    }
    status("Flashing…");
    const total = img.files.reduce((a, f) => a + f.data.length, 0);
    const done = new Array(img.files.length).fill(0);
    await loader.writeFlash({
      fileArray: img.files,
      flashMode: img.mode, flashFreq: img.freq, flashSize: img.size,
      eraseAll: false, compress: true,
      reportProgress: (i, written) => {
        done[i] = written;
        $("progress").value = (100 * done.reduce((a, b) => a + b, 0)) / total;
      },
    });
    $("progress").value = 100;
    status("Flash complete. Resetting… If the LED doesn't blink, tap RESET.");
    try { await loader.after("hard_reset"); } catch (_) { /* fine, user can tap RESET */ }
    await cleanup();
  } catch (e) {
    status(`Flash failed: ${e.message || e}`, true);
    $("flash").disabled = false;
  }
}

async function cleanup() {
  try { if (transport) await transport.disconnect(); } catch (_) {}
  transport = null; loader = null;
  setConnected(false);
}

document.querySelectorAll('input[name="src"]').forEach((el) =>
  el.addEventListener("change", () => {
    if (el.value === "file" && el.checked) $("file").click();
  }));
$("file").addEventListener("change", () => {
  const f = $("file").files[0];
  if (f) log(`Selected ${f.name} (${f.size} bytes)`);
});
$("connect").addEventListener("click", connect);
$("flash").addEventListener("click", flash);
$("disconnect").addEventListener("click", async () => { await cleanup(); status("Disconnected."); });

if (!("serial" in navigator) && !("usb" in navigator)) {
  status("This browser has no WebUSB. Open this page in Chrome.", true);
  $("connect").disabled = true;
}
loadManifest();
