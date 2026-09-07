"""Opt-in acquisition of one small pilot extract into a new directory."""

import argparse
import hashlib
import json
import subprocess
from datetime import datetime, timezone
from pathlib import Path

ENDPOINT = "https://overpass-api.de/api/interpreter"
QUERY = Path(__file__).with_name("query.ql")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("output_directory", type=Path, help="A new directory; existing snapshots are never overwritten")
    args = parser.parse_args()
    if args.output_directory.exists():
        raise ValueError("Choose a new output directory to preserve the existing snapshot")
    result = subprocess.run(
        ["curl", "--fail", "--silent", "--show-error", "--max-time", "50",
         "--max-filesize", "16777216", "--data-urlencode", f"data@{QUERY}", ENDPOINT],
        check=True, capture_output=True,
    )
    raw = json.loads(result.stdout)
    if raw.get("remark") or not raw.get("elements") or not raw.get("osm3s", {}).get("timestamp_osm_base"):
        raise ValueError("Overpass returned an incomplete or empty response; no snapshot saved")
    metadata = {
        "endpoint": ENDPOINT,
        "retrieved_at": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "sha256": hashlib.sha256(result.stdout).hexdigest(),
        "query": QUERY.read_text(),
        "query_bbox": [-87.634, 41.882, -87.624, 41.890],
    }
    args.output_directory.mkdir(parents=True)
    (args.output_directory / "source.json").write_bytes(result.stdout)
    (args.output_directory / "acquisition.json").write_text(json.dumps(metadata, indent=2) + "\n")
    print(f"Saved {len(raw['elements'])} source records in {args.output_directory}")


if __name__ == "__main__":
    main()
