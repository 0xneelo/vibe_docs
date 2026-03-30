"""Main entry point for DexScreener Volume Scraper."""

import argparse

from .scraper import run_scrape


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Scrape DexScreener for DEX pair volumes (min $10K liquidity, $10K market cap)."
    )
    parser.add_argument(
        "--fresh",
        action="store_true",
        help="Ignore saved state and start from page 1",
    )
    args = parser.parse_args()
    run_scrape(fresh=args.fresh)


if __name__ == "__main__":
    main()
