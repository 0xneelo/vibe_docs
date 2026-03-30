# DexScreener Volume Reader

Scrapes DexScreener for DEX pair volumes with configurable filters. Tracks **lowcap volume** (pairs where at least one token is not a major) vs **majors volume** (pairs of two major tokens).

## Filters

- **Min 24h volume:** $10,000  
- **Min liquidity:** $10,000  
- **Min market cap:** $10,000  

## Usage

```bash
# Install
pip install -r requirements.txt

# Run scrape (resumes from last page if interrupted)
python main.py

# Fresh run (ignore saved state)
python main.py --fresh

# Analyze existing data (apply min market cap filter to results)
python main.py analyze
```

## Output

- `data/YYYY-MM-DD/` – daily output
  - `summary.json` – totals, lowcaps vs majors volume
  - `scraper_state.json` – for resume
  - `pages.jsonl` – per-page stats
  - `pairs/page_XXXX.json` – pair details

## Project Layout

```
dexscreenerVolumeReader/
├── main.py           # Entry point
├── src/
│   ├── __init__.py
│   ├── config.py     # Filters, MAJORS, URLs
│   ├── main.py       # CLI
│   └── scraper.py    # Core scrape logic
├── data/             # Scraped output (gitignored)
├── requirements.txt
└── README.md
```
