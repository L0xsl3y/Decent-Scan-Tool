# Decent Scan Tool

A DIY OBD-II scan tool: an ESP32-S3 with an SN65HVD230 CAN transceiver, plus an
Android app that talks to it over Bluetooth LE. Everything can be built, installed
and flashed from an Android tablet. GitHub Actions does the builds.

| Folder | What |
|---|---|
| `firmware/` | ESP32-S3 firmware (ESP-IDF) |
| `app/` | Android app (Kotlin + Jetpack Compose, minSdk 26) |
| `flasher/` | Web page that flashes the ESP32-S3 from Chrome on Android over WebUSB |
| `docs/` | Wiring, protocol, and build/flash instructions for a tablet-only setup |
| `.github/workflows/` | CI: builds on every push; a release plus a Pages deploy on every `v*` tag |

Start here: **[docs/build-and-flash.md](docs/build-and-flash.md)**.

## Why ESP-IDF (not Arduino/PlatformIO)

- **TWAI**: the native IDF driver exposes every mode this project needs
  (self-test, listen-only, normal), hardware acceptance filters, alerts, and bus-off recovery.
- **BLE**: NimBLE in IDF is smaller and faster than the Arduino BLE wrapper, and
  gives full control over MTU, connection interval and notifications, which a CAN
  sniffer needs.
- **OTA + rollback**: OTA partitions, rollback and `esp_ota_*` are built in.
- **CI**: Espressif ships an official Docker image (`espressif/idf`), so builds
  are reproducible on GitHub Actions with nothing installed by hand.
- **Later work**: USB CDC (TinyUSB), light sleep with GPIO wake, SPI for the
  MCP2518FD, and UART for the L9637 are all first-class in IDF.

## Safety

This tool only sends standard OBD-II diagnostic requests. It never writes to
modules, codes them, or flashes ECUs. Clearing DTCs (service 04) needs an
explicit confirmation from the app.
