"""Core DexScreener scraper logic."""

import json
import re
import sys
import time
from datetime import datetime
from pathlib import Path

import requests

from .config import (
    BASE_URL,
    MAJORS,
    MAX_PAGES,
    MIN_LIQUIDITY,
    MIN_VOLUME,
    OUTPUT_DIR,
    RATE_LIMIT_DELAY,
)


def log(msg: str) -> None:
    """Print timestamped log message."""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{timestamp}] {msg}")
    sys.stdout.flush()


def get_output_dir() -> Path:
    """Get or create output directory with today's date."""
    today = datetime.now().strftime("%Y-%m-%d")
    output_dir = OUTPUT_DIR / today
    output_dir.mkdir(parents=True, exist_ok=True)
    return output_dir


def get_state_file() -> Path:
    """Get path to state file for resuming."""
    return get_output_dir() / "scraper_state.json"


def load_state() -> dict:
    """Load scraper state for resuming."""
    state_file = get_state_file()
    if state_file.exists():
        with open(state_file, encoding="utf-8") as f:
            return json.load(f)
    return {
        "last_page": 0,
        "total_pairs": 0,
        "total_volume": 0.0,
        "majors_volume": 0.0,
        "lowcaps_volume": 0.0,
        "seen_addresses": [],
    }


def save_state(state: dict) -> None:
    """Save scraper state for resuming."""
    state_file = get_state_file()
    with open(state_file, "w", encoding="utf-8") as f:
        json.dump(state, f, indent=2)


def fetch_page(page_num: int) -> dict:
    """Fetch a page and extract the SERVER_DATA JSON."""
    params = (
        f"rankBy=volume&order=desc"
        f"&minLiq={MIN_LIQUIDITY}&min24HVol={MIN_VOLUME}"
        "&profile=0"
    )
    if page_num == 1:
        url = f"{BASE_URL}/?{params}"
    else:
        url = f"{BASE_URL}/page-{page_num}?{params}"

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    }

    try:
        r = requests.get(url, headers=headers, timeout=30)
        r.raise_for_status()

        match = re.search(
            r"window\.__SERVER_DATA\s*=\s*(\{.*?\});?\s*</script>",
            r.text,
            re.DOTALL,
        )
        if match:
            json_str = match.group(1)
            json_str = re.sub(r":undefined\b", ":null", json_str)
            json_str = re.sub(r",undefined\b", ",null", json_str)
            json_str = re.sub(r"\bundefined\b", "null", json_str)
            json_str = re.sub(r":NaN\b", ":null", json_str)
            json_str = re.sub(r":Infinity\b", ":null", json_str)
            json_str = re.sub(r":-Infinity\b", ":null", json_str)
            json_str = re.sub(r'new Date\("([^"]+)"\)', r'"\1"', json_str)
            json_str = re.sub(r'new URL\("([^"]+)"\)', r'"\1"', json_str)

            try:
                return json.loads(json_str)
            except json.JSONDecodeError as e:
                log(f"  JSON parse error on page {page_num}: {e}")
                return {}
        log(f"  No SERVER_DATA found on page {page_num}")
        return {}

    except requests.exceptions.RequestException as e:
        log(f"  Network error on page {page_num}: {e}")
        return {}


def extract_pairs(data: dict) -> list[dict]:
    """Extract pairs from SERVER_DATA structure."""
    try:
        pairs = (
            data.get("route", {})
            .get("data", {})
            .get("dexScreenerData", {})
            .get("pairs", [])
        )
        return pairs if isinstance(pairs, list) else []
    except Exception:
        return []


def get_volume_h24(pair: dict) -> float:
    """Extract 24h volume from pair data."""
    try:
        vol = pair.get("volume", {})
        if isinstance(vol, dict) and vol.get("h24") is not None:
            return float(vol["h24"])
    except (TypeError, ValueError):
        pass
    return 0.0


def get_market_cap(pair: dict) -> float:
    """Extract market cap from pair data."""
    try:
        mc = pair.get("marketCap") or 0
        return float(mc) if mc else 0.0
    except (TypeError, ValueError):
        return 0.0


def is_major_pair(pair: dict) -> bool:
    """Check if both tokens in pair are majors."""
    try:
        base = pair.get("baseToken", {}).get("symbol", "").upper()
        quote = pair.get("quoteToken", {}).get("symbol", "").upper()
        return base in MAJORS and quote in MAJORS
    except Exception:
        return False


def format_vol(vol: float) -> str:
    """Format volume for display."""
    if vol >= 1e9:
        return f"${vol / 1e9:.2f}B"
    if vol >= 1e6:
        return f"${vol / 1e6:.1f}M"
    if vol >= 1e3:
        return f"${vol / 1e3:.1f}K"
    return f"${vol:.0f}"


def process_page(page_num: int, state: dict) -> dict:
    """Process a single page and return page stats."""
    data = fetch_page(page_num)
    pairs = extract_pairs(data)

    seen_set = set(state.get("seen_addresses", []))

    page_stats = {
        "page": page_num,
        "timestamp": datetime.now().isoformat(),
        "pairs_found": len(pairs),
        "new_pairs": 0,
        "page_volume": 0.0,
        "page_majors": 0.0,
        "page_lowcaps": 0.0,
        "pair_details": [],
    }

    for pair in pairs:
        addr = pair.get("pairAddress", "")
        chain = pair.get("chainId", "")
        key = f"{chain}:{addr}"

        if key in seen_set:
            continue

        seen_set.add(key)
        vol = get_volume_h24(pair)
        is_major = is_major_pair(pair)

        base = pair.get("baseToken", {}).get("symbol", "?")
        quote = pair.get("quoteToken", {}).get("symbol", "?")
        liq = pair.get("liquidity") or {}
        liq_usd = liq.get("usd", 0) if isinstance(liq, dict) else 0

        page_stats["new_pairs"] += 1
        page_stats["page_volume"] += vol

        if is_major:
            page_stats["page_majors"] += vol
        else:
            page_stats["page_lowcaps"] += vol

        page_stats["pair_details"].append({
            "chain": chain,
            "pair": f"{base}/{quote}",
            "address": addr,
            "volume_24h": vol,
            "is_major": is_major,
            "liquidity": liq_usd,
            "market_cap": get_market_cap(pair),
        })

    state["seen_addresses"] = list(seen_set)
    state["last_page"] = page_num
    state["total_pairs"] += page_stats["new_pairs"]
    state["total_volume"] += page_stats["page_volume"]
    state["majors_volume"] += page_stats["page_majors"]
    state["lowcaps_volume"] += page_stats["page_lowcaps"]

    return page_stats


def run_scrape(*, fresh: bool = False) -> dict:
    """
    Run the full scrape. Returns final state/summary.
    Set fresh=True to ignore saved state and start from page 1.
    """
    log("=" * 70)
    log("DexScreener Volume Scraper")
    log(
        f"Filters: min 24h vol ${MIN_VOLUME:,}, min liquidity ${MIN_LIQUIDITY:,}"
    )
    log("=" * 70)

    state = {} if fresh else load_state()
    if fresh:
        state = {
            "last_page": 0,
            "total_pairs": 0,
            "total_volume": 0.0,
            "majors_volume": 0.0,
            "lowcaps_volume": 0.0,
            "seen_addresses": [],
        }

    start_page = state["last_page"] + 1

    if start_page > 1:
        log(f"Resuming from page {start_page}")
        log(f"  Already: {state['total_pairs']:,} pairs, {format_vol(state['total_volume'])}")

    output_dir = get_output_dir()
    pages_file = output_dir / "pages.jsonl"
    if fresh and pages_file.exists():
        pages_file.unlink()

    consecutive_empty = 0
    log(f"\nOutput: {output_dir}\n")

    try:
        for page_num in range(start_page, MAX_PAGES + 1):
            page_stats = process_page(page_num, state)

            if page_stats["pairs_found"] == 0:
                consecutive_empty += 1
                log(f"Page {page_num:4d}: No pairs (empty {consecutive_empty}/5)")
                if consecutive_empty >= 5:
                    log("Stopping after 5 empty pages.")
                    break
            else:
                consecutive_empty = 0
                lowcaps_pct = (
                    (state["lowcaps_volume"] / state["total_volume"] * 100)
                    if state["total_volume"] > 0
                    else 0
                )
                log(
                    f"Page {page_num:4d}: +{page_stats['new_pairs']:3d} pairs, "
                    f"+{format_vol(page_stats['page_volume']):>10s} | "
                    f"Total: {state['total_pairs']:6,} pairs, "
                    f"{format_vol(state['total_volume']):>10s} | "
                    f"Lowcaps: {lowcaps_pct:.1f}%"
                )

                with open(pages_file, "a", encoding="utf-8") as f:
                    stats_to_save = {k: v for k, v in page_stats.items() if k != "pair_details"}
                    f.write(json.dumps(stats_to_save) + "\n")

                pairs_dir = output_dir / "pairs"
                pairs_dir.mkdir(exist_ok=True)
                with open(pairs_dir / f"page_{page_num:04d}.json", "w", encoding="utf-8") as f:
                    json.dump(page_stats["pair_details"], f, indent=2)

            save_state(state)

            if page_stats["new_pairs"] == 0 and page_stats["pairs_found"] > 0:
                log(f"  (All pairs on page {page_num} already seen)")

            time.sleep(RATE_LIMIT_DELAY)

    except KeyboardInterrupt:
        log("\n\nInterrupted. State saved. Run again to resume.")
        save_state(state)
        return state

    # Final summary
    log("\n" + "=" * 70)
    log("SCRAPE COMPLETE")
    log("=" * 70)
    log(f"Total pairs:       {state['total_pairs']:,}")
    log(f"Total 24h volume:  {format_vol(state['total_volume'])}")
    log(f"Majors volume:     {format_vol(state['majors_volume'])}")
    log(f"Lowcaps volume:    {format_vol(state['lowcaps_volume'])}")
    if state["total_volume"] > 0:
        log(f"Lowcaps share:     {100 * state['lowcaps_volume'] / state['total_volume']:.1f}%")
    log(f"Output:            {output_dir}")

    summary = {
        "date": datetime.now().isoformat(),
        "filters": {
            "min_volume_usd": MIN_VOLUME,
            "min_liquidity_usd": MIN_LIQUIDITY,
        },
        "total_pairs": state["total_pairs"],
        "total_volume_usd": state["total_volume"],
        "majors_volume_usd": state["majors_volume"],
        "lowcaps_volume_usd": state["lowcaps_volume"],
        "lowcaps_share_pct": (
            (100 * state["lowcaps_volume"] / state["total_volume"])
            if state["total_volume"] > 0
            else 0
        ),
        "pages_scraped": state["last_page"],
    }

    with open(output_dir / "summary.json", "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2)

    log(f"\nSummary saved to {output_dir / 'summary.json'}")
    return state
