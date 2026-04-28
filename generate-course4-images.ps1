# generate-course4-images.ps1
# Creates 5 informational PNG diagrams for Course 4: Salmonella & Food Safety
# Run with: powershell -ExecutionPolicy Bypass -File generate-course4-images.ps1

Add-Type -AssemblyName System.Drawing

$outDir = "D:\Course agent\Course 4"
if (-not (Test-Path $outDir)) { New-Item -ItemType Directory $outDir | Out-Null }

# --- Helpers -------------------------------------------------
function MkFont($name, $size, $bold=$false) {
    $style = if ($bold) { [System.Drawing.FontStyle]::Bold } else { [System.Drawing.FontStyle]::Regular }
    return New-Object System.Drawing.Font($name, $size, $style)
}
function MkFontBI($name, $size) {
    return New-Object System.Drawing.Font($name, $size, ([System.Drawing.FontStyle]::Bold -bor [System.Drawing.FontStyle]::Italic))
}
function MkBrush($hex) {
    $c = [System.Drawing.ColorTranslator]::FromHtml("#$hex")
    return New-Object System.Drawing.SolidBrush($c)
}
function MkPen($hex, $w) {
    $c = [System.Drawing.ColorTranslator]::FromHtml("#$hex")
    return New-Object System.Drawing.Pen($c, $w)
}
function CenterSF {
    $sf = New-Object System.Drawing.StringFormat
    $sf.Alignment     = [System.Drawing.StringAlignment]::Center
    $sf.LineAlignment = [System.Drawing.StringAlignment]::Center
    return $sf
}
function NearSF {
    $sf = New-Object System.Drawing.StringFormat
    $sf.Alignment     = [System.Drawing.StringAlignment]::Near
    $sf.LineAlignment = [System.Drawing.StringAlignment]::Center
    $sf.Trimming      = [System.Drawing.StringTrimming]::Word
    return $sf
}
function WrapSF {
    $sf = New-Object System.Drawing.StringFormat
    $sf.Alignment = [System.Drawing.StringAlignment]::Center
    $sf.Trimming  = [System.Drawing.StringTrimming]::Word
    return $sf
}

$sfC    = CenterSF
$sfN    = NearSF
$sfW    = WrapSF

Write-Host "Generating Course 4 diagrams..." -ForegroundColor Cyan

# =============================================================
# IMG 1 — Salmonella Classification in Commercial Poultry
# =============================================================
$W = 700; $H = 340
$bmp = New-Object System.Drawing.Bitmap($W, $H)
$g   = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode     = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAlias
$g.Clear([System.Drawing.Color]::White)

# Header
$g.FillRectangle((MkBrush "1F3864"), 0, 0, $W, 52)
$fH  = MkFont "Segoe UI" 13 $true
$fT  = MkFont "Segoe UI" 11 $true
$fS  = MkFontBI "Segoe UI" 10
$fD  = MkFont "Segoe UI" 9
$bW  = MkBrush "FFFFFF"
$bB  = MkBrush "3C3C3C"
$g.DrawString("Salmonella Classification in Commercial Poultry", $fH, $bW, ([System.Drawing.RectangleF]::new(5, 0, $W-10, 52)), $sfC)

$colDefs = @(
    @{bg="BDD7EE"; hd="2E74B5"; titleStr="Paratyphoid Serovars"; seroStr="S. Enteritidis`nS. Typhimurium`nS. Infantis"; detailStr="Most common food safety concern. Silent carriers - no signs in adult birds. Primary risk to eggs, meat, and consumers."},
    @{bg="FDEBD0"; hd="D35400"; titleStr="Fowl Typhoid";         seroStr="Salmonella Gallinarum";                          detailStr="Affects adult layers and breeders. High mortality possible. Reportable disease in Canada. Notify CFIA immediately."},
    @{bg="FADBD8"; hd="C0392B"; titleStr="Pullorum Disease";      seroStr="Salmonella Pullorum";                            detailStr="Severe mortality in chicks 0-3 weeks. Transmitted in hatching eggs. Reportable disease in Canada. Notify CFIA immediately."}
)

$n   = $colDefs.Count
$mg  = 10; $gap = 8
$colW = ($W - 2*$mg - ($n-1)*$gap) / $n
$colY = 58; $colH = $H - 68

for ($i = 0; $i -lt $n; $i++) {
    $cx = $mg + $i * ($colW + $gap)
    $cd = $colDefs[$i]
    $g.FillRectangle((MkBrush $cd.bg), $cx, $colY, $colW, $colH)
    $g.FillRectangle((MkBrush $cd.hd), $cx, $colY, $colW, 30)
    $titleRect  = [System.Drawing.RectangleF]::new($cx+4,  $colY+2,  $colW-8,  28)
    $seroRect   = [System.Drawing.RectangleF]::new($cx+6,  $colY+36, $colW-12, 54)
    $lineY      = $colY + 93
    $detailRect = [System.Drawing.RectangleF]::new($cx+6,  $colY+100,$colW-12, $colH-108)
    $g.DrawString($cd.titleStr,  $fT, $bW, $titleRect,  $sfC)
    $g.DrawString($cd.seroStr,   $fS, $bB, $seroRect,   $sfW)
    $g.DrawLine((MkPen "AAAAAA" 1), $cx+10, $lineY, $cx+$colW-10, $lineY)
    $g.DrawString($cd.detailStr, $fD, $bB, $detailRect, $sfW)
}
$g.DrawRectangle((MkPen "2E74B5" 2), 1, 1, $W-2, $H-2)
$bmp.Save("$outDir\img1.png", [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose(); $bmp.Dispose()
Write-Host "  img1.png done" -ForegroundColor Green

# =============================================================
# IMG 2 — Temperature Control for Salmonella Safety
# =============================================================
$W = 700; $H = 370
$bmp = New-Object System.Drawing.Bitmap($W, $H)
$g   = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode     = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAlias
$g.Clear([System.Drawing.Color]::White)

$g.FillRectangle((MkBrush "1F3864"), 0, 0, $W, 52)
$fH2 = MkFont "Segoe UI" 12 $true
$g.DrawString("Salmonella and Temperature: What Every Farmer Must Know", $fH2, (MkBrush "FFFFFF"), ([System.Drawing.RectangleF]::new(5, 0, $W-10, 52)), $sfC)

$zones = @(
    @{bg="CCE5FF"; hd="1F3864"; lbl="Frozen Storage"; tmp="-18°C or below";  ht=58; detail="Salmonella SURVIVES but does not multiply. Freezing does not kill bacteria. Cook thoroughly after thawing."},
    @{bg="BDD7EE"; hd="2E74B5"; lbl="Refrigeration";  tmp="0°C to 4°C";      ht=54; detail="Growth greatly slowed. Hold fresh poultry and eggs at or below 4°C. Reduces but does not eliminate risk."},
    @{bg="FDEBD0"; hd="D35400"; lbl="DANGER ZONE";    tmp="4°C to 60°C";     ht=72; detail="Rapid bacterial multiplication. Never leave raw poultry, eggs, or cooked poultry in this range for more than 2 hours."},
    @{bg="FADBD8"; hd="C0392B"; lbl="Cooking Kill Zone"; tmp="60°C to 74°C"; ht=58; detail="Salmonella begins dying. Must reach 74°C throughout the product to ensure complete destruction."},
    @{bg="D5F5E3"; hd="2D6A4F"; lbl="Safe Internal Temp"; tmp="74°C or above"; ht=54; detail="Salmonella destroyed. All poultry products must reach 74°C internal temp throughout."}
)

$barX = 195
$barW2 = $W - $barX - 12
$zy = 56
$fLbl  = MkFont "Segoe UI" 10 $true
$fDtl  = MkFont "Segoe UI" 9
foreach ($z in $zones) {
    $h2 = $z.ht
    $g.FillRectangle((MkBrush $z.bg), $barX, $zy, $barW2, $h2)
    $g.FillRectangle((MkBrush $z.hd), 0,     $zy, $barX-4, $h2)
    $lblRect = [System.Drawing.RectangleF]::new(4, $zy, $barX-8, $h2)
    $dtlRect = [System.Drawing.RectangleF]::new($barX+8, $zy+4, $barW2-14, $h2-8)
    $lblStr  = $z.lbl + "`n" + $z.tmp
    $g.DrawString($lblStr,    $fLbl, (MkBrush "FFFFFF"), $lblRect, $sfC)
    $g.DrawString($z.detail,  $fDtl, (MkBrush "3C3C3C"), $dtlRect, $sfW)
    $g.DrawLine((MkPen "CCCCCC" 1), 0, $zy+$h2, $W, $zy+$h2)
    $zy += $h2
}
$g.DrawRectangle((MkPen "2E74B5" 2), 1, 1, $W-2, $H-2)
$bmp.Save("$outDir\img2.png", [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose(); $bmp.Dispose()
Write-Host "  img2.png done" -ForegroundColor Green

# =============================================================
# IMG 3 — Salmonella Transmission Routes
# =============================================================
$W = 700; $H = 340
$bmp = New-Object System.Drawing.Bitmap($W, $H)
$g   = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode     = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAlias
$g.Clear([System.Drawing.Color]::White)

$g.FillRectangle((MkBrush "1F3864"), 0, 0, $W, 52)
$fH3 = MkFont "Segoe UI" 13 $true
$g.DrawString("Salmonella Transmission Routes in Commercial Poultry", $fH3, (MkBrush "FFFFFF"), ([System.Drawing.RectangleF]::new(5, 0, $W-10, 52)), $sfC)

# Left panel: Vertical
$g.FillRectangle((MkBrush "EBF5FB"), 10, 58, 330, $H-68)
$g.FillRectangle((MkBrush "2E74B5"), 10, 58, 330, 30)
$g.DrawString("VERTICAL TRANSMISSION", (MkFont "Segoe UI" 11 $true), (MkBrush "FFFFFF"), ([System.Drawing.RectangleF]::new(10, 58, 330, 30)), $sfC)

$vertSteps = @(
    "1. Breeder hen colonized with S. Enteritidis",
    "2. Ovary or oviduct infected during egg formation",
    "3. Internal egg contamination - shell looks clean",
    "4. Hatching egg carries Salmonella to hatchery",
    "5. Day-old chick arrives already infected",
    "6. Flock positive from day 1"
)
$fStp = MkFont "Segoe UI" 9
$sy3  = 96
foreach ($s in $vertSteps) {
    $r = [System.Drawing.RectangleF]::new(18, $sy3, 314, 22)
    $g.DrawString($s, $fStp, (MkBrush "3C3C3C"), $r, $sfN)
    $sy3 += 28
}
$g.DrawString("Prevention: Vaccinate breeders. Test flocks.", (MkFont "Segoe UI" 9 $true), (MkBrush "2E74B5"), ([System.Drawing.RectangleF]::new(18, $sy3, 314, 22)), $sfN)

# Right panel: Horizontal
$g.FillRectangle((MkBrush "FEF9E7"), 348, 58, 344, $H-68)
$g.FillRectangle((MkBrush "D35400"), 348, 58, 344, 30)
$g.DrawString("HORIZONTAL TRANSMISSION", (MkFont "Segoe UI" 11 $true), (MkBrush "FFFFFF"), ([System.Drawing.RectangleF]::new(348, 58, 344, 30)), $sfC)

$horizSources = @(
    "[Feed]     Contaminated feed ingredients",
    "[Water]    Unclean water or drinker biofilm",
    "[Rodents]  Rats and mice in the barn",
    "[Insects]  Darkling beetles and flies",
    "[People]   Workers moving between barns",
    "[Equip]    Shared tools and vehicles"
)
$hy3 = 96
foreach ($src in $horizSources) {
    $r = [System.Drawing.RectangleF]::new(356, $hy3, 328, 22)
    $g.DrawString($src, $fStp, (MkBrush "3C3C3C"), $r, $sfN)
    $hy3 += 28
}
$g.DrawString("Prevention: Biosecurity + hygiene at every entry.", (MkFont "Segoe UI" 9 $true), (MkBrush "D35400"), ([System.Drawing.RectangleF]::new(356, $hy3, 328, 22)), $sfN)

# Centre divider
$g.DrawLine((MkPen "1F3864" 2), 344, 58, 344, $H-10)
$g.DrawRectangle((MkPen "2E74B5" 2), 1, 1, $W-2, $H-2)
$bmp.Save("$outDir\img3.png", [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose(); $bmp.Dispose()
Write-Host "  img3.png done" -ForegroundColor Green

# =============================================================
# IMG 4 — Barn Cleanout and Disinfection Protocol
# =============================================================
$W = 700; $H = 490
$bmp = New-Object System.Drawing.Bitmap($W, $H)
$g   = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode     = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAlias
$g.Clear([System.Drawing.Color]::White)

$g.FillRectangle((MkBrush "1F3864"), 0, 0, $W, 52)
$fH4 = MkFont "Segoe UI" 12 $true
$g.DrawString("Between-Flock Cleanout and Disinfection Protocol", $fH4, (MkBrush "FFFFFF"), ([System.Drawing.RectangleF]::new(5, 0, $W-10, 52)), $sfC)

$steps4 = @(
    @{num="1"; ti="Remove all birds and equipment";    dt="Complete depopulation. Remove feeders, drinkers, all equipment from barn.";               bg="EBF5FB"},
    @{num="2"; ti="Full litter removal";               dt="Remove all litter, manure, and debris including corners, wall edges, and under equipment."; bg="E8F8F5"},
    @{num="3"; ti="Dry sweep and blow-down";            dt="Clean ceiling, fans, lights, and attic. Work top to bottom. Remove all dry organic matter."; bg="EBF5FB"},
    @{num="4"; ti="Pre-soak and pressure wash";         dt="Apply detergent foam. Pressure-wash all surfaces top to bottom. Full wet clean.";           bg="E8F8F5"},
    @{num="5"; ti="Dry completely";                    dt="Allow barn to dry fully. Disinfectants are inactivated by moisture and organic material.";   bg="EBF5FB"},
    @{num="6"; ti="Apply approved disinfectant";        dt="Correct concentration per label. Full contact time. Rotate disinfectant class each flock."; bg="E8F8F5"},
    @{num="7"; ti="Downtime and environmental swab";   dt="Minimum 7-14 days empty. Collect environmental swabs. Culture and document results.";        bg="FDFEFE"}
)

$fNum  = MkFont "Segoe UI" 14 $true
$fTi   = MkFont "Segoe UI" 10 $true
$fDt4  = MkFont "Segoe UI" 9

$sfNtop = New-Object System.Drawing.StringFormat
$sfNtop.Alignment     = [System.Drawing.StringAlignment]::Near
$sfNtop.LineAlignment = [System.Drawing.StringAlignment]::Near

$stpH  = [Math]::Floor(($H - 58) / $steps4.Count)

for ($i = 0; $i -lt $steps4.Count; $i++) {
    $s4   = $steps4[$i]
    $sy4  = [int](58 + $i * $stpH)
    $g.FillRectangle((MkBrush $s4.bg), 0, $sy4, $W, $stpH)
    $g.FillRectangle((MkBrush "1F3864"), 0, $sy4, 52, $stpH)
    $numRect = [System.Drawing.RectangleF]::new(0,   $sy4+2,  52,  $stpH-4)
    $tiRect  = [System.Drawing.RectangleF]::new(60,  $sy4+5,  248, $stpH-10)
    $dtRect  = [System.Drawing.RectangleF]::new(316, $sy4+5,  376, $stpH-10)
    $g.DrawString($s4.num, $fNum, (MkBrush "FFFFFF"), $numRect, $sfC)
    $g.DrawString($s4.ti,  $fTi,  (MkBrush "1F3864"), $tiRect,  $sfNtop)
    $g.DrawString($s4.dt,  $fDt4, (MkBrush "3C3C3C"), $dtRect,  $sfNtop)
    $g.DrawLine((MkPen "CCCCCC" 1), 0,   $sy4+$stpH, $W,   $sy4+$stpH)
    $g.DrawLine((MkPen "CCCCCC" 1), 312, $sy4,       312,  $sy4+$stpH)
}
$g.DrawRectangle((MkPen "2E74B5" 2), 1, 1, $W-2, $H-2)
$bmp.Save("$outDir\img4.png", [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose(); $bmp.Dispose()
Write-Host "  img4.png done" -ForegroundColor Green

# =============================================================
# IMG 5 — Biosecurity Zones and Entry Protocol
# =============================================================
$W = 700; $H = 340
$bmp = New-Object System.Drawing.Bitmap($W, $H)
$g   = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode     = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAlias
$g.Clear([System.Drawing.Color]::White)

$g.FillRectangle((MkBrush "1F3864"), 0, 0, $W, 52)
$fH5 = MkFont "Segoe UI" 12 $true
$g.DrawString("Biosecurity Zones and Entry Protocol for Salmonella Control", $fH5, (MkBrush "FFFFFF"), ([System.Drawing.RectangleF]::new(5, 0, $W-10, 52)), $sfC)

# Clean zone (left) green
$g.FillRectangle((MkBrush "D5F5E3"), 10,  58, 195, $H-68)
$g.FillRectangle((MkBrush "2D6A4F"), 10,  58, 195, 30)
$g.DrawString("CLEAN ZONE",   (MkFont "Segoe UI" 11 $true), (MkBrush "FFFFFF"), ([System.Drawing.RectangleF]::new(10, 58, 195, 30)), $sfC)

$cleanItems5 = @("Production barn", "Chick rearing area", "Feed storage bins", "Drinker system", "Your dedicated equipment")
$cy5 = 96; $fIt5 = MkFont "Segoe UI" 9
foreach ($it in $cleanItems5) {
    $r = [System.Drawing.RectangleF]::new(18, $cy5, 178, 22)
    $g.DrawString("+ " + $it, $fIt5, (MkBrush "2D6A4F"), $r, $sfN)
    $cy5 += 26
}
$noteR = [System.Drawing.RectangleF]::new(14, $cy5+8, 185, 40)
$g.DrawString("Dedicated barn clothing and boots ONLY", (MkFont "Segoe UI" 9 $true), (MkBrush "2D6A4F"), $noteR, $sfW)

# Entry point (centre) gold
$g.FillRectangle((MkBrush "FEF9E7"), 213, 58, 274, $H-68)
$g.FillRectangle((MkBrush "C9A84C"), 213, 58, 274, 30)
$g.DrawString("ENTRY POINT CONTROLS", (MkFont "Segoe UI" 10 $true), (MkBrush "FFFFFF"), ([System.Drawing.RectangleF]::new(213, 58, 274, 30)), $sfC)

$entryItems5 = @(
    ">> Boot dip or footbath",
    ">> Change into barn coveralls",
    ">> Handwashing station",
    ">> Visitor log sign-in",
    ">> PPE: gloves when handling birds",
    ">> 48-hr farm downtime rule enforced"
)
$ey5 = 96; $fEnt = MkFont "Segoe UI" 9
foreach ($e in $entryItems5) {
    $r = [System.Drawing.RectangleF]::new(220, $ey5, 260, 22)
    $g.DrawString($e, $fEnt, (MkBrush "3C3C3C"), $r, $sfN)
    $ey5 += 28
}

# Dirty zone (right) red
$g.FillRectangle((MkBrush "FDEDEC"), 495, 58, 197, $H-68)
$g.FillRectangle((MkBrush "C0392B"), 495, 58, 197, 30)
$g.DrawString("OUTSIDE ZONE", (MkFont "Segoe UI" 11 $true), (MkBrush "FFFFFF"), ([System.Drawing.RectangleF]::new(495, 58, 197, 30)), $sfC)

$dirtyItems5 = @("Public road", "Delivery vehicles", "Visitor vehicles", "Catching crew trucks", "Litter disposal area")
$dy5 = 96
foreach ($it in $dirtyItems5) {
    $r = [System.Drawing.RectangleF]::new(502, $dy5, 182, 22)
    $g.DrawString("x  " + $it, $fIt5, (MkBrush "C0392B"), $r, $sfN)
    $dy5 += 26
}
$noteR2 = [System.Drawing.RectangleF]::new(498, $dy5+8, 185, 40)
$g.DrawString("No outside vehicles past this line", (MkFont "Segoe UI" 9 $true), (MkBrush "C0392B"), $noteR2, $sfW)

# Zone dividers: between left/center and center/right panels
$g.DrawLine((MkPen "1F3864" 2), 209, 58, 209, $H-10)
$g.DrawLine((MkPen "1F3864" 2), 491, 58, 491, $H-10)
$g.DrawRectangle((MkPen "2E74B5" 2), 1, 1, $W-2, $H-2)
$bmp.Save("$outDir\img5.png", [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose(); $bmp.Dispose()
Write-Host "  img5.png done" -ForegroundColor Green

Write-Host "`nAll 5 diagrams saved to: $outDir" -ForegroundColor Cyan
