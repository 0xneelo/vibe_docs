# Vibe Docs

Research papers, dissertations, and documentation for Vibe Trading—permissionless perpetual futures and derivative market infrastructure.

## Structure

| Folder | Description |
|--------|-------------|
| **01_usdc_token_perps** | USDC token-margined perpetuals comparison |
| **02_perps_categories_zscore** | Bootstrap Trilemma, framework, Z-Score |
| **03_listing_monopoly** | Token lifecycle, listing monopoly thesis |
| **04_proof_of_value** | LP economics, capital efficiency, value creation |
| **09_token_margined_issues_perculator** | Token-margined structural risks, Percolator analysis |
| **11_due_diligence_questionnaire** | DDQ, risk walkthrough, solver scenarios |

## Papers

- **Perps Categories / Bootstrap Trilemma** — Categorizing perpetual protocols; why single-architecture fails
- **Listing Monopoly** — Control token lifecycle → control crypto; Binance, PumpFun, gap
- **Proof of Value** — LP value proposition, ~100x capital efficiency, 160+ launch partners
- **Token-Margined Issues** — Why inverted/token-margined perps are structurally problematic (Percolator)

## Excluded from Repo

Transcripts, voice notes, and raw text transcriptions are excluded via `.gitignore` (audio files, transcript folders).

## Development

Enable the [pre-push changelog date check](githooks/README.md): from the repo root run `git config core.hooksPath githooks` once per clone.

### Website dev server on your phone (same Wi‑Fi)

From the `Website` folder run `npm run dev`. Vite prints a **Network** URL (for example `http://192.168.x.x:5173/`). Open that on your phone.

- **Windows:** If the page does not load, allow **Node.js** or **private network** access when the firewall prompt appears, or add an inbound rule for TCP port **5173** (and **4173** if you use `npm run preview`).
- **PC IP:** In PowerShell, `Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -notmatch 'Loopback' }` or run `ipconfig` and use your Wi‑Fi adapter’s IPv4 address.

---

*Vibe Trading — Permissionless Perpetual Markets*
