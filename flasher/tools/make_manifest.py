#!/usr/bin/env python3
"""Build flasher/dist/firmware/manifest.json from ESP-IDF's flasher_args.json.

usage: make_manifest.py <flasher_args.json> <version> <built-date> <out.json>
"""
import json
import os
import sys

args_path, version, built, out_path = sys.argv[1:5]
with open(args_path) as f:
    fa = json.load(f)

parts = [
    {"offset": off, "path": os.path.basename(path)}
    for off, path in sorted(fa["flash_files"].items(), key=lambda kv: int(kv[0], 16))
]
fs = fa["flash_settings"]
manifest = {
    "version": version,
    "built": built,
    "chip": fa.get("extra_esptool_args", {}).get("chip", "esp32s3"),
    "flash_mode": fs["flash_mode"],
    "flash_freq": fs["flash_freq"],
    "flash_size": fs["flash_size"],
    "parts": parts,
}
with open(out_path, "w") as f:
    json.dump(manifest, f, indent=2)
print(json.dumps(manifest, indent=2))
