"""Analyze scraped data - compute lowcap volume with filters."""

import json
from pathlib import Path

from .config import MIN_LIQUIDITY, MIN_MARKET_CAP
from .scraper import format_vol


def analyze_data_dir(data_dir: Path) -> dict:
    """
    Analyze all pair JSON files in a data directory.
    Returns totals for pairs passing min liquidity and min market cap.
    """
    pairs_dir = data_dir / "pairs"
    if not pairs_dir.exists():
        return {}

    total_volume = 0.0
    majors_volume = 0.0
    lowcaps_volume = 0.0
    total_pairs = 0
    skipped_mc = 0
    skipped_liq = 0

    for path in sorted(pairs_dir.glob("page_*.json")):
        with open(path, encoding="utf-8") as f:
            pairs = json.load(f)

        for p in pairs:
            liq = p.get("liquidity", 0) or 0
            mc = p.get("market_cap", 0) or 0
            vol = p.get("volume_24h", 0) or 0

            if liq < MIN_LIQUIDITY:
                skipped_liq += 1
                continue
            if mc > 0 and mc < MIN_MARKET_CAP:
                skipped_mc += 1
                continue

            total_pairs += 1
            total_volume += vol
            if p.get("is_major"):
                majors_volume += vol
            else:
                lowcaps_volume += vol

    return {
        "total_pairs": total_pairs,
        "total_volume_usd": total_volume,
        "majors_volume_usd": majors_volume,
        "lowcaps_volume_usd": lowcaps_volume,
        "lowcaps_share_pct": (100 * lowcaps_volume / total_volume) if total_volume > 0 else 0,
        "skipped_market_cap": skipped_mc,
        "skipped_liquidity": skipped_liq,
    }


def main() -> None:
    """Analyze most recent data directory."""
    data_root = Path("data")
    if not data_root.exists():
        print("No data/ directory found. Run: python main.py --fresh")
        return

    dirs = sorted([d for d in data_root.iterdir() if d.is_dir()], reverse=True)
    if not dirs:
        print("No date subdirs in data/")
        return

    latest = dirs[0]
    print(f"Analyzing: {latest}")
    print(f"Filters: min liquidity ${MIN_LIQUIDITY:,}, min market cap ${MIN_MARKET_CAP:,}\n")

    result = analyze_data_dir(latest)
    if not result:
        print("No pair data found.")
        return

    print("=" * 50)
    print("LOWCAP VOLUME (pairs passing filters)")
    print("=" * 50)
    print(f"Total pairs:       {result['total_pairs']:,}")
    print(f"Total 24h volume:  {format_vol(result['total_volume_usd'])}")
    print(f"Majors volume:     {format_vol(result['majors_volume_usd'])}")
    print(f"Lowcaps volume:    {format_vol(result['lowcaps_volume_usd'])}")
    print(f"Lowcaps share:     {result['lowcaps_share_pct']:.1f}%")
    if result.get("skipped_market_cap"):
        print(f"Skipped (mc < ${MIN_MARKET_CAP:,}): {result['skipped_market_cap']:,}")
    if result.get("skipped_liquidity"):
        print(f"Skipped (liq < ${MIN_LIQUIDITY:,}): {result['skipped_liquidity']:,}")


if __name__ == "__main__":
    main()
