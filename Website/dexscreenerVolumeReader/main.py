#!/usr/bin/env python3
"""Entry point - run: python main.py [--fresh] | python main.py analyze"""

import sys

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "analyze":
        from src.analyze import main as analyze_main

        analyze_main()
    else:
        from src.main import main

        main()
