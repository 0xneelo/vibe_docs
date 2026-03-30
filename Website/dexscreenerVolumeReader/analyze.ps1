# Quick analysis of scraped data - min $10k liquidity, min $10k market cap
$MIN_LIQ = 10000
$MIN_MC = 10000
$dataDir = "data\2026-02-05\pairs"
$totalVol = 0; $majorsVol = 0; $lowcapsVol = 0
$totalPairs = 0; $skippedMc = 0; $skippedLiq = 0

Get-ChildItem $dataDir -Filter "page_*.json" | Sort-Object Name | ForEach-Object {
    $pairs = Get-Content $_.FullName -Raw | ConvertFrom-Json
    foreach ($p in $pairs) {
        $liq = if ($p.liquidity) { [double]$p.liquidity } else { 0 }
        $mc = if ($p.market_cap) { [double]$p.market_cap } else { 0 }
        $vol = if ($p.volume_24h) { [double]$p.volume_24h } else { 0 }
        if ($liq -lt $MIN_LIQ) { $script:skippedLiq++; return }
        if ($mc -gt 0 -and $mc -lt $MIN_MC) { $script:skippedMc++; return }
        $script:totalPairs++; $script:totalVol += $vol
        if ($p.is_major) { $script:majorsVol += $vol } else { $script:lowcapsVol += $vol }
    }
}
$pct = if ($totalVol -gt 0) { 100 * $lowcapsVol / $totalVol } else { 0 }
Write-Host "`n=== LOWCAP VOLUME (min liq `$$MIN_LIQ, min mc `$$MIN_MC) ==="
Write-Host "Total pairs:    $totalPairs"
Write-Host ("Total 24h vol:  `${0:N0}" -f $totalVol)
Write-Host ("Majors volume:  `${0:N0}" -f $majorsVol)
Write-Host ("Lowcaps volume: `${0:N0}" -f $lowcapsVol)
Write-Host ("Lowcaps share:  {0:N1}%" -f $pct)
if ($skippedMc -gt 0) { Write-Host "Skipped (mc < `$$MIN_MC): $skippedMc" }
if ($skippedLiq -gt 0) { Write-Host "Skipped (liq < `$$MIN_LIQ): $skippedLiq" }
