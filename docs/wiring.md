# Wiring (breadboard prototype)

Power the board from **USB only**. Don't connect the car's 12 V (OBD pin 16)
during the prototype stage.

## ESP32-S3 ↔ SN65HVD230

| SN65HVD230 | ESP32-S3 | Notes |
|---|---|---|
| 3V3 / VCC | 3V3 | 3.3 V transceiver: never 5 V |
| GND | GND | |
| CTX (D) | GPIO5 | `CONFIG_DST_CAN_TX_GPIO`, changeable in `idf.py menuconfig` → Decent Scan Tool |
| CRX (R) | GPIO4 | `CONFIG_DST_CAN_RX_GPIO` |
| CANH | OBD pin 6 | |
| CANL | OBD pin 14 | |
| (GND) | OBD pins 4 + 5 | shared ground with the car |

Most SN65HVD230 breakout boards have a 120 Ω termination resistor (often
marked R2). The car's bus is already terminated. If you see errors on the car, try
removing that resistor. For the no-car loopback self-test it doesn't matter.

## Status LED

Stage 1 blinks the on-board RGB LED (WS2812) on GPIO48 (DevKitC-1 v1.0). If
yours doesn't blink, your board may be v1.1 (GPIO38) or have a plain LED. Change
it in menuconfig → Decent Scan Tool → Status LED.

## Expansion header (planned)

| Module | Bus | Notes |
|---|---|---|
| MCP2518FD | SPI | CAN FD |
| L9637 | UART | K-line on OBD pins 7 / 15 |
| ID EEPROM (each module) | I2C | used to auto-detect modules |

Pin assignments for the header will be documented here when the modules are added.
