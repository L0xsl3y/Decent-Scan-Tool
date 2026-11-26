# Build, install and flash: tablet-only guide

You never build anything on the tablet. GitHub Actions builds everything, and
you download the results.

## One-time GitHub setup (in Chrome on the tablet)

1. Open `https://github.com/l0xsl3y/Decent-Scan-Tool/settings/pages`
   (use "Desktop site" in Chrome's ⋮ menu if the page looks cramped).
2. Under **Build and deployment → Source**, choose **GitHub Actions**.
3. Open `https://github.com/l0xsl3y/Decent-Scan-Tool/settings/environments`,
   tap **github-pages**. Under **Deployment branches and tags**, tap
   **Add deployment branch or tag rule**, choose **Tag**, type `v*`, then save.
   (Releases are built from tags. Without this rule the Pages deploy is refused.)

If a Pages deploy failed before you did this, open the **Actions** tab, choose
**Deploy flasher to Pages**, and tap **Run workflow**.

## Where builds come from

- Every tag `vX.Y.Z` makes a **Release**:
  `https://github.com/l0xsl3y/Decent-Scan-Tool/releases/latest`
  - `decent-scan-X.Y.Z-debug.apk`: the Android app
  - `decent-scan-fw-X.Y.Z-merged.bin`: the whole firmware in one file
  - `bootloader.bin`, `partition-table.bin`, `ota_data_initial.bin`,
    `decent_scan_tool.bin`, `flasher_args.json`: the firmware as separate parts
- The web flasher is at `https://l0xsl3y.github.io/Decent-Scan-Tool/`. It always
  carries the firmware from the latest release.

## Install the app

1. On the tablet, open the latest Release and tap the `.apk` file.
2. When it finishes downloading, tap **Open**. Android asks to allow installs from
   Chrome. Allow it (Settings → Apps → Special app access → Install unknown apps → Chrome).
3. Tap **Install**. If Play Protect warns about an unknown developer, tap
   **More details → Install anyway**. This is normal for self-built debug apps.

Every release is signed with the same debug key, so a newer APK installs over
the old one. You don't need to uninstall first.

## First firmware flash (USB, from Chrome)

You need: a USB-C OTG adapter or cable for the tablet, and a USB cable to the
ESP32-S3 board's **native USB** port. On DevKitC boards that port is labelled
**USB** (not **UART/COM**).

1. Plug the board into the tablet.
2. Put the board in **download mode**: hold **BOOT**, tap **RESET** (RST/EN),
   then let go of **BOOT**.
3. In Chrome, open `https://l0xsl3y.github.io/Decent-Scan-Tool/`.
4. Leave **Latest release** selected. For the very first flash, tick **Erase the whole flash first**.
5. Tap **Connect**. In the popup, choose **USB JTAG/serial debug unit**
   (Espressif) and allow access.
6. Tap **Flash** and wait for 100 %.
7. Tap **RESET** on the board. The firmware starts.

Notes:
- The flasher uses WebUSB (Chrome on Android has no USB Web Serial). It talks to
  the S3's built-in USB-Serial/JTAG port, so you need no USB-UART chip or driver.
- If **Connect** fails, repeat step 2 and try again. If Android shows its own
  "open with app" prompt for the USB device, dismiss it.
- To flash an older version: download its `…-merged.bin` from that Release,
  choose **A merged .bin file**, and pick it.

## Later updates

From stage 5, firmware updates go over Bluetooth from the app (BLE OTA), and you
won't need USB again. USB stays available as a recovery path: the steps above
always work.
