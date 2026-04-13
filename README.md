# The Vibe (research) Papers

Research papers, dissertations, and documentation for Vibe Trading—permissionless perpetual futures and derivative market infrastructure.

## Read online (immersive site)

The markdown in this repo is also published as a **reader-first website** on GitHub Pages: **[https://0xneelo.github.io/vibe_docs/](https://0xneelo.github.io/vibe_docs/)**

Use it when you want **navigation, typography, and layout tuned for long reads**—chapter landings, section sidebars, in-page tables of contents, and rendered math—instead of browsing raw files on GitHub. The [Library](https://0xneelo.github.io/vibe_docs/library) lists every chapter; each opens into its sections with prev/next paging.

**Local dev:** from the `Website` folder, `npm run dev` (Vite). Production builds use the `/vibe_docs/` base path so URLs match GitHub Pages.

## Interactive simulators

The website ships **live simulators** (TypeScript / Plotly in the app shell):

| Simulator | On GitHub Pages | What it is |
|-----------|-----------------|------------|
| **Funding** | [Open funding simulator](https://0xneelo.github.io/vibe_docs/simulations/funding) | Regime and PnL-style dynamics for the funding-rate model (routes to the local TS build). |
| **Z-score cone traversal** | [Open Z-score simulator](https://0xneelo.github.io/vibe_docs/simulations/z-score) | 3D cone / convergence-field exploration aligned with the perp-categories framework. |

There is also an **API-backed** funding variant in the **Simulations** menu on the site (`/simulations/funding-api`). Formal assumptions and notation live in **[chapter 15 — Funding rate model](https://0xneelo.github.io/vibe_docs/chapters/15-funding-model)**.

## Repository structure (`Docs/public/`)

Source for the papers is under **`Docs/public/`**—one top-level folder per numbered chapter (mirrors the site’s chapter slugs).

| Folder | Description |
|--------|-------------|
| **01_perp_classes_zscore** | Perp protocol taxonomy, Bootstrap Trilemma, Z-score framework |
| **02_proof_of_value** | LP economics, capital efficiency, value creation narrative |
| **03_listing_monopoly** | Token lifecycle, listing monopoly thesis |
| **04_ode_to_the_orderbook** | Ode to the order book (part 1)—lifecycle, limits, assembly line |
| **05_ode_to_the_orderbook_part2** | Order book continuation |
| **06_usdc_token_perps** | USDC vs token margin, hybrid perpetual design |
| **07_token_margined_issues_perculator** | Token-margined structural risks, Percolator-style analysis |
| **08_due_diligence_questionnaire** | DDQ, risk walkthrough, solver scenarios |
| **09_fix_industry_one_primitive** | Missing primitive: information, issuance, and market verification |
| **10_vibe_pillars** | Vibe protocol pillars |
| **11_gametheory_of_listings** | Game theory of listings |
| **12_case_study_symm_lp** | Symmetric LP case study |
| **13_framework_value_permissionless_perps** | Proof-of-value style framework for permissionless perps |
| **14_information_trade_convergence** | Information and trade convergence, verification layer |
| **15_funding_model** | Funding-rate engine: derivation, defenses, scenarios; ties to simulators above |
| **16_listing_additional** | Field notes: long-tail perps (CLOBs, pools, flow-sensitive venues), liquidity as trader UX |

## Papers (themes)

- **Perp classes / Bootstrap Trilemma** — Why a single architecture does not cover the whole perpetual design space.
- **Listing monopoly** — Control over the token lifecycle as industry leverage; CEX, launchpads, and protocol listings.
- **Proof of value / LP narrative** — Capital efficiency, revenue share, and LP-facing value proposition.
- **Order book essays** — What CLOBs are good for, where they break, hardening the lifecycle.
- **Token-margined issues (Percolator)** — Why inverted / token-collateral perps carry structural failure modes.
- **Funding model** — Formal funding mechanics, stress behavior, and interactive exploration on the site.
- **Listing + liquidity annex (16)** — Permissionless listing vs tradeable liquidity; exchange “deviation” and trader experience.

## Excluded from repo

Transcripts, voice notes, and raw text transcriptions are excluded via `.gitignore` (audio files, transcript folders).

## Development

Enable the [pre-push changelog date check](githooks/README.md): from the repo root run `git config core.hooksPath githooks` once per clone.

### Website dev server on your phone (same Wi‑Fi)

From the `Website` folder run `npm run dev`. Vite prints a **Network** URL (for example `http://192.168.x.x:5173/`). Open that on your phone.

- **Windows:** If the page does not load, allow **Node.js** or **private network** access when the firewall prompt appears, or add an inbound rule for TCP port **5173** (and **4173** if you use `npm run preview`).
- **PC IP:** In PowerShell, `Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -notmatch 'Loopback' }` or run `ipconfig` and use your Wi‑Fi adapter’s IPv4 address.

---

*Vibe Trading — Permissionless Perpetual Markets*
