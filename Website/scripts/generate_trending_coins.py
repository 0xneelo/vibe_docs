from __future__ import annotations

import json
import re
import sys
from datetime import UTC, datetime
from pathlib import Path
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


WEBSITE_ROOT = Path(__file__).resolve().parent.parent
OUTPUT_FILE = WEBSITE_ROOT / "public" / "generated" / "trending-coins.json"

DEXSCREENER_URL = (
    "https://dexscreener.com/?rankBy=trendingScoreH6&order=desc&maxAge=168&profile=1"
)

SERVER_DATA_RE = re.compile(
    r"window\.__SERVER_DATA\s*=\s*(\{.*?\});?\s*</script>",
    re.DOTALL,
)

FALLBACK_COINS = [
    {"symbol": "SOL", "name": "Solana", "url": "https://dexscreener.com/solana"},
    {"symbol": "ETH", "name": "Ethereum", "url": "https://dexscreener.com/ethereum"},
    {"symbol": "BTC", "name": "Bitcoin", "url": "https://dexscreener.com/ethereum/wbtc"},
    {"symbol": "BONK", "name": "Bonk", "url": "https://dexscreener.com/solana/bonk"},
    {"symbol": "PEPE", "name": "Pepe", "url": "https://dexscreener.com/ethereum/pepe"},
    {"symbol": "DOGE", "name": "Dogecoin", "url": "https://dexscreener.com/solana/doge"},
]


def _normalize_server_data(text: str) -> str:
    text = re.sub(r":undefined\b", ":null", text)
    text = re.sub(r",undefined\b", ",null", text)
    text = re.sub(r"\bundefined\b", "null", text)
    text = re.sub(r":NaN\b", ":null", text)
    text = re.sub(r":Infinity\b", ":null", text)
    text = re.sub(r":-Infinity\b", ":null", text)
    text = re.sub(r'new Date\("([^"]+)"\)', r'"\1"', text)
    text = re.sub(r'new URL\("([^"]+)"\)', r'"\1"', text)
    return text


def _fetch_trending_pairs() -> list[dict[str, Any]]:
    request = Request(
        DEXSCREENER_URL,
        headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
    )

    with urlopen(request, timeout=30) as response:  # nosec B310
        html = response.read().decode("utf-8", errors="ignore")

    match = SERVER_DATA_RE.search(html)
    if not match:
        return []

    server_data = json.loads(_normalize_server_data(match.group(1)))
    pairs = (
        server_data.get("route", {})
        .get("data", {})
        .get("dexScreenerData", {})
        .get("pairs", [])
    )
    if isinstance(pairs, list):
        return pairs
    return []


def _map_pair(pair: dict[str, Any]) -> dict[str, Any]:
    base = pair.get("baseToken") or {}
    quote = pair.get("quoteToken") or {}
    symbol = str(base.get("symbol") or quote.get("symbol") or "?").upper()
    name = str(base.get("name") or base.get("symbol") or symbol)
    chain = str(pair.get("chainId") or "")
    pair_address = str(pair.get("pairAddress") or "")
    profile_url = (
        f"https://dexscreener.com/{chain}/{pair_address}"
        if chain and pair_address
        else DEXSCREENER_URL
    )
    return {
        "symbol": symbol,
        "name": name,
        "chain": chain,
        "url": profile_url,
        "priceUsd": pair.get("priceUsd"),
        "volumeH24": (pair.get("volume") or {}).get("h24"),
        "liquidityUsd": (pair.get("liquidity") or {}).get("usd"),
        "priceChangeH24": (pair.get("priceChange") or {}).get("h24"),
    }


def _dedupe_top20(mapped_pairs: list[dict[str, Any]]) -> list[dict[str, Any]]:
    seen: set[tuple[str, str]] = set()
    top: list[dict[str, Any]] = []
    for coin in mapped_pairs:
        key = (coin.get("symbol", ""), coin.get("chain", ""))
        if key in seen:
            continue
        seen.add(key)
        top.append(coin)
        if len(top) >= 20:
            break
    return top


def _write_payload(coins: list[dict[str, Any]], source: str) -> None:
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    payload = {
        "generatedAt": datetime.now(UTC).isoformat(),
        "source": source,
        "count": len(coins),
        "coins": coins,
    }
    OUTPUT_FILE.write_text(json.dumps(payload, indent=2), encoding="utf-8")


def main() -> int:
    try:
        pairs = _fetch_trending_pairs()
        mapped = [_map_pair(pair) for pair in pairs]
        coins = _dedupe_top20(mapped)
        if not coins:
            raise RuntimeError("No trending pairs returned from DexScreener.")
        _write_payload(coins, DEXSCREENER_URL)
        print(f"Generated {OUTPUT_FILE} with {len(coins)} trending coins.")
        return 0
    except (HTTPError, URLError, TimeoutError, json.JSONDecodeError, RuntimeError) as error:
        if OUTPUT_FILE.exists():
            print(f"Warning: DexScreener fetch failed ({error}). Keeping previous trending file.")
            return 0

        print(f"Warning: DexScreener fetch failed ({error}). Writing fallback trending data.")
        _write_payload(FALLBACK_COINS[:20], "fallback")
        return 0
    except Exception as error:  # pragma: no cover
        print(f"Unexpected trending generation error: {error}")
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
