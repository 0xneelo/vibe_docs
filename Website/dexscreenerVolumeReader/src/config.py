"""Scraper configuration and constants."""

from pathlib import Path

# Filters
MIN_VOLUME = 10_000       # $10K minimum 24h volume
MIN_LIQUIDITY = 10_000    # $10K minimum liquidity (removes fake volume)
MIN_MARKET_CAP = 0        # No minimum market cap filter

# Scraper
BASE_URL = "https://dexscreener.com"
OUTPUT_DIR = Path("data")
RATE_LIMIT_DELAY = 0.3  # seconds between requests
MAX_PAGES = 200

# Major tokens - CoinGecko top 100 + common wrapped/bridge variants for DEX pairs
# Used to classify pairs: major/major = "majors", else = "lowcaps"
MAJORS = frozenset({
    "A7A5", "ADA", "AAVE", "ALGO", "APT", "ARB", "ATOM", "ASTER", "BCH", "BDX",
    "BGB", "BNB", "BONK", "BTC", "BUIDL", "BFUSD", "CAKE", "CC", "CRO", "DAI",
    "DOGE", "DOT", "ENA", "ETC", "EUTBL", "FIL", "FIGR_HELOC", "FLR", "GHO",
    "GT", "HASH", "HBAR", "HYPE", "HTX", "ICP", "JAAA", "JTRSY", "JUP", "KAS",
    "KCS", "LEO", "LINK", "LTC", "M", "MNT", "MORPHO", "MYX", "NEAR", "NEXO",
    "NIGHT", "OKB", "ONDO", "OUSG", "PAXG", "PEPE", "PI", "POL", "PUMP",
    "PYUSD", "QNT", "RAIN", "RENDER", "RLUSD", "SEI", "SHIB", "SKY", "STX",
    "SUI", "TAO", "TRUMP", "TON", "TRX", "UNI", "USD0", "USD1", "USDAI", "USDC",
    "USDD", "USDE", "USDF", "USDG", "USDS", "USDT", "USDTB", "USDY", "USYC",
    "USTB", "VET", "WBT", "WLFI", "WLD", "XAUT", "XDC", "XLM", "XMR", "XRP",
    "ZEC",
    "WETH", "STETH", "WSTETH", "RETH", "CBETH", "FRXETH", "SFRXETH",
    "WBTC", "BTCB", "CBBTC", "UBTC", "TBTC",
    "WSOL", "WPSOL", "MSOL", "JITOSOL", "BSOL", "WBNB",
    "WAVAX", "WMATIC", "WFTM", "WCRO", "WROSE", "WKAVA", "WMNT", "WONE",
    "WHYPE",
    "BUSD", "TUSD", "FRAX", "LUSD", "FDUSD", "CRVUSD", "MIM", "USDP",
    "GUSD", "DOLA", "EURC", "EURT", "USDT.E", "USDC.E", "INJ", "XTZ", "EGLD",
})
