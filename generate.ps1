# generate.ps1 — Creates T-FLAWS.docx using OpenXML (no Word install needed)
Add-Type -AssemblyName System.IO.Compression.FileSystem
Add-Type -AssemblyName System.Drawing

# UTF-8 without BOM — works in all PowerShell versions
$utf8 = New-Object System.Text.UTF8Encoding $false
function WriteFile($path, $content) {
    [System.IO.File]::WriteAllText($path, $content, $utf8)
}

$outPath = "D:\Course agent\T-FLAWS_Assessment_Management_Tool.docx"
$tmpDir  = Join-Path $env:TEMP "tflaws_docx"
if (Test-Path $tmpDir) { Remove-Item $tmpDir -Recurse -Force }
New-Item -ItemType Directory -Path $tmpDir | Out-Null
New-Item -ItemType Directory -Path "$tmpDir\_rels" | Out-Null
New-Item -ItemType Directory -Path "$tmpDir\word" | Out-Null
New-Item -ItemType Directory -Path "$tmpDir\word\_rels" | Out-Null
New-Item -ItemType Directory -Path "$tmpDir\word\media" | Out-Null

# ── IMAGE GENERATION ─────────────────────────────────────────
function CreateDiagram($outFile, $title, $scores) {
    # scores = array of @{Score="0"; Label="Normal"; Desc="..."; BgColor="#4CAF50"; Dark=$false}
    $W = 630; $H = 310
    $bmp = New-Object System.Drawing.Bitmap($W, $H)
    $g   = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode      = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint  = [System.Drawing.Text.TextRenderingHint]::AntiAlias
    $g.Clear([System.Drawing.Color]::White)

    # Header bar
    $hdrColor = [System.Drawing.Color]::FromArgb(31, 56, 100)
    $g.FillRectangle((New-Object System.Drawing.SolidBrush($hdrColor)), 0, 0, $W, 52)
    $titleFont = New-Object System.Drawing.Font("Segoe UI", 12, [System.Drawing.FontStyle]::Bold)
    $sfC = New-Object System.Drawing.StringFormat
    $sfC.Alignment = [System.Drawing.StringAlignment]::Center
    $sfC.LineAlignment = [System.Drawing.StringAlignment]::Center
    $g.DrawString($title, $titleFont, [System.Drawing.Brushes]::White,
        [System.Drawing.RectangleF]::new(5, 0, $W-10, 52), $sfC)

    # Score boxes
    $n = $scores.Count
    $margin = 10; $gap = 6
    $boxW = ($W - 2*$margin - ($n-1)*$gap) / $n
    $boxY = 60; $boxH = $H - 70

    $sfTop = New-Object System.Drawing.StringFormat
    $sfTop.Alignment = [System.Drawing.StringAlignment]::Center
    $labelFont = New-Object System.Drawing.Font("Segoe UI", 11, [System.Drawing.FontStyle]::Bold)
    $subFont   = New-Object System.Drawing.Font("Segoe UI", 9,  [System.Drawing.FontStyle]::Bold)
    $descFont  = New-Object System.Drawing.Font("Segoe UI", 8.5)
    $sfWrap    = New-Object System.Drawing.StringFormat
    $sfWrap.Alignment  = [System.Drawing.StringAlignment]::Center
    $sfWrap.Trimming   = [System.Drawing.StringTrimming]::Word

    for ($i = 0; $i -lt $n; $i++) {
        $x = $margin + $i * ($boxW + $gap)
        $s = $scores[$i]
        $bgCol = [System.Drawing.ColorTranslator]::FromHtml($s.BgColor)
        $bgBrush = New-Object System.Drawing.SolidBrush($bgCol)
        $g.FillRectangle($bgBrush, $x, $boxY, $boxW, $boxH)
        $bgBrush.Dispose()

        $txtBrush = if ($s.Dark) { [System.Drawing.Brushes]::White } else { [System.Drawing.Brushes]::Black }

        # Score number
        $g.DrawString("Score $($s.Score)", $labelFont, $txtBrush,
            [System.Drawing.RectangleF]::new($x, $boxY+6, $boxW, 26), $sfTop)
        # Divider line
        $divPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(80,0,0,0), 1)
        $g.DrawLine($divPen, $x+8, $boxY+34, $x+$boxW-8, $boxY+34)
        $divPen.Dispose()
        # Short label
        $g.DrawString($s.Label, $subFont, $txtBrush,
            [System.Drawing.RectangleF]::new($x+4, $boxY+37, $boxW-8, 22), $sfTop)
        # Description
        $g.DrawString($s.Desc, $descFont, $txtBrush,
            [System.Drawing.RectangleF]::new($x+5, $boxY+61, $boxW-10, $boxH-66), $sfWrap)
    }

    # Outer border
    $bdrPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(46,116,181), 2)
    $g.DrawRectangle($bdrPen, 1, 1, $W-2, $H-2)
    $bdrPen.Dispose()

    $bmp.Save($outFile, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose(); $bmp.Dispose()
}

function CreateDistributionDiagram($outFile) {
    $W = 630; $H = 310
    $bmp = New-Object System.Drawing.Bitmap($W, $H)
    $g   = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode     = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAlias
    $g.Clear([System.Drawing.Color]::White)

    $hdrColor = [System.Drawing.Color]::FromArgb(31, 56, 100)
    $g.FillRectangle((New-Object System.Drawing.SolidBrush($hdrColor)), 0, 0, $W, 52)
    $titleFont = New-Object System.Drawing.Font("Segoe UI", 12, [System.Drawing.FontStyle]::Bold)
    $sfC = New-Object System.Drawing.StringFormat
    $sfC.Alignment = [System.Drawing.StringAlignment]::Center
    $sfC.LineAlignment = [System.Drawing.StringAlignment]::Center
    $g.DrawString("Flock Distribution Patterns", $titleFont, [System.Drawing.Brushes]::White,
        [System.Drawing.RectangleF]::new(5, 0, $W-10, 52), $sfC)

    $panelFont = New-Object System.Drawing.Font("Segoe UI", 10, [System.Drawing.FontStyle]::Bold)
    $subFont   = New-Object System.Drawing.Font("Segoe UI", 8.5)
    $sfC2 = New-Object System.Drawing.StringFormat; $sfC2.Alignment = [System.Drawing.StringAlignment]::Center

    # Panel backgrounds
    $g.FillRectangle((New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(230,255,230))), 10, 60, 295, 238)
    $g.FillRectangle((New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255,230,230))), 315, 60, 305, 238)

    # Panel labels
    $g.DrawString("NORMAL — Even Distribution", $panelFont, [System.Drawing.Brushes]::DarkGreen,
        [System.Drawing.RectangleF]::new(10, 62, 295, 22), $sfC2)
    $g.DrawString("ABNORMAL — Clustering", $panelFont, [System.Drawing.Brushes]::DarkRed,
        [System.Drawing.RectangleF]::new(315, 62, 305, 22), $sfC2)

    $birdBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(70,130,180))
    $clusterBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(200,60,60))

    # Even distribution dots (left panel)
    $rng = New-Object System.Random(42)
    for ($i = 0; $i -lt 55; $i++) {
        $dx = 18 + $rng.Next(260)
        $dy = 90 + $rng.Next(195)
        $g.FillEllipse($birdBrush, $dx, $dy, 8, 8)
    }

    # Clustered dots (right panel — birds grouped in two clusters)
    for ($i = 0; $i -lt 55; $i++) {
        $cluster = $rng.Next(2)
        if ($cluster -eq 0) { $dx = 330 + $rng.Next(80); $dy = 95 + $rng.Next(80) }
        else                 { $dx = 490 + $rng.Next(80); $dy = 180 + $rng.Next(80) }
        $g.FillEllipse($clusterBrush, $dx, $dy, 8, 8)
    }

    $birdBrush.Dispose(); $clusterBrush.Dispose()

    # Sub-labels
    $g.DrawString("Birds spread evenly`nacross full barn floor", $subFont, [System.Drawing.Brushes]::DarkGreen,
        [System.Drawing.RectangleF]::new(10, 270, 295, 30), $sfC2)
    $g.DrawString("Dense clusters = temperature`nor air quality problem", $subFont, [System.Drawing.Brushes]::DarkRed,
        [System.Drawing.RectangleF]::new(315, 270, 305, 30), $sfC2)

    # Border
    $bdrPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(46,116,181), 2)
    $g.DrawRectangle($bdrPen, 1, 1, $W-2, $H-2)
    $bdrPen.Dispose()

    $bmp.Save($outFile, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose(); $bmp.Dispose()
}

function CreateWeightDiagram($outFile) {
    $W = 630; $H = 310
    $bmp = New-Object System.Drawing.Bitmap($W, $H)
    $g   = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode     = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAlias
    $g.Clear([System.Drawing.Color]::White)

    $hdrColor = [System.Drawing.Color]::FromArgb(31, 56, 100)
    $g.FillRectangle((New-Object System.Drawing.SolidBrush($hdrColor)), 0, 0, $W, 52)
    $titleFont = New-Object System.Drawing.Font("Segoe UI", 12, [System.Drawing.FontStyle]::Bold)
    $sfC = New-Object System.Drawing.StringFormat
    $sfC.Alignment = [System.Drawing.StringAlignment]::Center
    $sfC.LineAlignment = [System.Drawing.StringAlignment]::Center
    $g.DrawString("Body Weight Distribution — Uniform vs Non-Uniform Flock", $titleFont, [System.Drawing.Brushes]::White,
        [System.Drawing.RectangleF]::new(5, 0, $W-10, 52), $sfC)

    $panelFont = New-Object System.Drawing.Font("Segoe UI", 10, [System.Drawing.FontStyle]::Bold)
    $axisFont  = New-Object System.Drawing.Font("Segoe UI", 8)
    $sfC2 = New-Object System.Drawing.StringFormat; $sfC2.Alignment = [System.Drawing.StringAlignment]::Center

    # Panel backgrounds
    $g.FillRectangle((New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(240,248,255))), 10, 60, 295, 238)
    $g.FillRectangle((New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255,245,240))), 315, 60, 305, 238)

    $g.DrawString("Uniform Flock  (CV < 10%)", $panelFont, [System.Drawing.Brushes]::DarkGreen,
        [System.Drawing.RectangleF]::new(10, 62, 295, 22), $sfC2)
    $g.DrawString("Non-Uniform Flock  (CV > 15%)", $panelFont, [System.Drawing.Brushes]::DarkRed,
        [System.Drawing.RectangleF]::new(315, 62, 305, 22), $sfC2)

    # Draw histogram bars - left (narrow bell)
    $barHeightsL = @(5, 15, 35, 65, 95, 120, 135, 120, 95, 65, 35, 15, 5)
    $barW = 20; $baseY = 270
    $startX = 18
    $barBrushL = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(46,116,181))
    for ($i = 0; $i -lt $barHeightsL.Count; $i++) {
        $bx = $startX + $i * ($barW + 2)
        $bh = $barHeightsL[$i]
        $g.FillRectangle($barBrushL, $bx, $baseY-$bh, $barW, $bh)
    }
    $barBrushL.Dispose()

    # Axis labels left
    $g.DrawString("Light", $axisFont, [System.Drawing.Brushes]::Gray, [System.Drawing.PointF]::new(15, 273))
    $g.DrawString("Body Weight", $axisFont, [System.Drawing.Brushes]::Gray, [System.Drawing.RectangleF]::new(10, 273, 295, 16), $sfC2)
    $g.DrawString("Heavy", $axisFont, [System.Drawing.Brushes]::Gray, [System.Drawing.PointF]::new(260, 273))

    # Draw histogram bars - right (wide/flat)
    $barHeightsR = @(20, 30, 40, 55, 60, 65, 60, 55, 50, 45, 40, 35, 20)
    $startXR = 322
    $barBrushR = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(200,80,60))
    for ($i = 0; $i -lt $barHeightsR.Count; $i++) {
        $bx = $startXR + $i * ($barW + 2)
        $bh = $barHeightsR[$i]
        $g.FillRectangle($barBrushR, $bx, $baseY-$bh, $barW, $bh)
    }
    $barBrushR.Dispose()

    $g.DrawString("Light", $axisFont, [System.Drawing.Brushes]::Gray, [System.Drawing.PointF]::new(318, 273))
    $g.DrawString("Body Weight", $axisFont, [System.Drawing.Brushes]::Gray, [System.Drawing.RectangleF]::new(315, 273, 305, 16), $sfC2)
    $g.DrawString("Heavy", $axisFont, [System.Drawing.Brushes]::Gray, [System.Drawing.PointF]::new(568, 273))

    # Border
    $bdrPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(46,116,181), 2)
    $g.DrawRectangle($bdrPen, 1, 1, $W-2, $H-2)
    $bdrPen.Dispose()

    $bmp.Save($outFile, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose(); $bmp.Dispose()
}

# Generate the 6 images
Write-Host "Generating diagrams..." -ForegroundColor Cyan

CreateDiagram "$tmpDir\word\media\img1.png" "Footpad Dermatitis Scoring Scale (Welfare Quality(r))" @(
    @{Score="0"; Label="Normal";   Desc="No lesion. Intact plantar skin. No discoloration."; BgColor="#C8E6C9"; Dark=$false},
    @{Score="1"; Label="Mild";     Desc="Superficial lesion. Mild discoloration. Surface erosion only."; BgColor="#FFF9C4"; Dark=$false},
    @{Score="2"; Label="Severe";   Desc="Deep ulceration. Necrosis. Affects >1/3 of footpad surface."; BgColor="#EF9A9A"; Dark=$false}
)

CreateDiagram "$tmpDir\word\media\img2.png" "Feather Coverage Scoring Scale (LayWel Protocol)" @(
    @{Score="0"; Label="Full Cover";   Desc="Complete feather coverage. No bare areas visible."; BgColor="#1565C0"; Dark=$true},
    @{Score="1"; Label="Slight Loss";  Desc="Fewer than 5 feathers missing. No bare skin visible."; BgColor="#42A5F5"; Dark=$false},
    @{Score="2"; Label="Moderate";     Desc="Bare skin visible. Area less than 5 cm2."; BgColor="#FFF176"; Dark=$false},
    @{Score="3"; Label="Significant";  Desc="Bare area 5-10 cm2. Multiple body regions affected."; BgColor="#FFA726"; Dark=$false},
    @{Score="4"; Label="Severe";       Desc="Bare area >10 cm2 or open wound present."; BgColor="#C62828"; Dark=$true}
)

CreateDiagram "$tmpDir\word\media\img3.png" "Bristol Gait Scoring Scale (Kestin et al., 1992)" @(
    @{Score="0"; Label="Normal";       Desc="Normal gait. Full weight bearing. Fluid movement."; BgColor="#2E7D32"; Dark=$true},
    @{Score="1"; Label="Slight";       Desc="Minor gait abnormality. Slight limp or stiffness."; BgColor="#8BC34A"; Dark=$false},
    @{Score="2"; Label="Definite";     Desc="Definite gait abnormality. Noticeable difficulty walking."; BgColor="#FFF176"; Dark=$false},
    @{Score="3"; Label="Marked";       Desc="Marked impairment. Reluctant to move. Significant pain."; BgColor="#FF8F00"; Dark=$false},
    @{Score="4"; Label="Severe";       Desc="Unable to walk without wing support. Cannot reach resources."; BgColor="#E53935"; Dark=$true},
    @{Score="5"; Label="Cannot Walk";  Desc="Unable to walk. Lateral recumbency. Immediate action required."; BgColor="#880E4F"; Dark=$true}
)

CreateDistributionDiagram "$tmpDir\word\media\img4.png"
CreateWeightDiagram        "$tmpDir\word\media\img5.png"

CreateDiagram "$tmpDir\word\media\img6.png" "Key Skin Conditions in Commercial Broiler Production" @(
    @{Score="A"; Label="Cellulitis";      Desc="Subcutaneous fibrinous exudate. #1 cause of whole-carcass condemnation. Entry via skin breaks."; BgColor="#EF5350"; Dark=$true},
    @{Score="B"; Label="Breast Blister";  Desc="Fluid-filled swelling over keel bone. Caused by chronic breast-to-litter contact in heavy birds."; BgColor="#FF8F00"; Dark=$false},
    @{Score="C"; Label="Ammonia Burn";    Desc="Reddened inflamed ventral skin. Indicates litter moisture >35% and ammonia >25 ppm."; BgColor="#FFF176"; Dark=$false}
)

Write-Host "Diagrams created." -ForegroundColor Green

# ── DRAWING XML helper ────────────────────────────────────────
$script:imgIdx = 0
function ImgXml($caption) {
    $script:imgIdx++
    $id   = $script:imgIdx
    $rId  = "rId$(2 + $id)"   # rId3 .. rId8  (rId1=styles, rId2=settings)
    # 6.5 inches wide x 3.25 inches tall in EMUs (1 inch = 914400 EMU)
    $cx = 5943600; $cy = 2971800
    $xml = @"
<w:p><w:pPr><w:jc w:val="center"/><w:spacing w:before="160" w:after="0"/></w:pPr><w:r><w:drawing>
<wp:inline xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" distT="0" distB="0" distL="0" distR="0">
<wp:extent cx="$cx" cy="$cy"/>
<wp:effectExtent l="0" t="0" r="0" b="0"/>
<wp:docPr id="$id" name="Figure$id"/>
<wp:cNvGraphicFramePr><a:graphicFrameLocks xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" noChangeAspect="1"/></wp:cNvGraphicFramePr>
<a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
<a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
<pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
<pic:nvPicPr><pic:cNvPr id="$id" name="img$id.png"/><pic:cNvPicPr><a:picLocks noChangeAspect="1"/></pic:cNvPicPr></pic:nvPicPr>
<pic:blipFill>
<a:blip r:embed="$rId" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"/>
<a:stretch><a:fillRect/></a:stretch>
</pic:blipFill>
<pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="$cx" cy="$cy"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr>
</pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>
<w:p><w:pPr><w:jc w:val="center"/><w:spacing w:before="80" w:after="280"/></w:pPr><w:r><w:rPr><w:i/><w:color w:val="595959"/><w:sz w:val="20"/></w:rPr><w:t xml:space="preserve">$(esc $caption)</w:t></w:r></w:p>
"@
    return $xml
}

# ── [Content_Types].xml ──────────────────────────────────────
WriteFile "$tmpDir\[Content_Types].xml" @'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml"  ContentType="application/xml"/>
  <Default Extension="png"  ContentType="image/png"/>
  <Override PartName="/word/document.xml"
    ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml"
    ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
  <Override PartName="/word/settings.xml"
    ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml"/>
</Types>
'@

# ── _rels/.rels ──────────────────────────────────────────────
WriteFile "$tmpDir\_rels\.rels" @'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument"
    Target="word/document.xml"/>
</Relationships>
'@

# ── word/_rels/document.xml.rels ─────────────────────────────
WriteFile "$tmpDir\word\_rels\document.xml.rels" @'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles"
    Target="styles.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/settings"
    Target="settings.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image"
    Target="media/img1.png"/>
  <Relationship Id="rId4" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image"
    Target="media/img2.png"/>
  <Relationship Id="rId5" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image"
    Target="media/img3.png"/>
  <Relationship Id="rId6" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image"
    Target="media/img4.png"/>
  <Relationship Id="rId7" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image"
    Target="media/img5.png"/>
  <Relationship Id="rId8" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image"
    Target="media/img6.png"/>
</Relationships>
'@

# ── word/settings.xml ────────────────────────────────────────
WriteFile "$tmpDir\word\settings.xml" @'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:settings xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:defaultTabStop w:val="720"/>
</w:settings>
'@

# ── word/styles.xml ──────────────────────────────────────────
WriteFile "$tmpDir\word\styles.xml" @'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
          xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml">
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal">
    <w:name w:val="Normal"/>
    <w:pPr><w:spacing w:after="160" w:line="276" w:lineRule="auto"/></w:pPr>
    <w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="24"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading1">
    <w:name w:val="heading 1"/>
    <w:basedOn w:val="Normal"/>
    <w:pPr>
      <w:outlineLvl w:val="0"/>
      <w:spacing w:before="480" w:after="240"/>
      <w:pageBreakBefore/>
    </w:pPr>
    <w:rPr>
      <w:rFonts w:ascii="Calibri Light" w:hAnsi="Calibri Light"/>
      <w:b/><w:color w:val="1F3864"/><w:sz w:val="36"/>
    </w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading2">
    <w:name w:val="heading 2"/>
    <w:basedOn w:val="Normal"/>
    <w:pPr>
      <w:outlineLvl w:val="1"/>
      <w:spacing w:before="360" w:after="160"/>
    </w:pPr>
    <w:rPr>
      <w:rFonts w:ascii="Calibri Light" w:hAnsi="Calibri Light"/>
      <w:b/><w:color w:val="2E74B5"/><w:sz w:val="30"/>
    </w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Caption">
    <w:name w:val="caption"/>
    <w:basedOn w:val="Normal"/>
    <w:pPr><w:jc w:val="center"/><w:spacing w:before="80" w:after="280"/></w:pPr>
    <w:rPr>
      <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>
      <w:i/><w:color w:val="595959"/><w:sz w:val="20"/>
    </w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Bibliography">
    <w:name w:val="Bibliography"/>
    <w:basedOn w:val="Normal"/>
    <w:pPr>
      <w:spacing w:after="120"/>
      <w:ind w:left="720" w:hanging="720"/>
    </w:pPr>
    <w:rPr>
      <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="22"/>
    </w:rPr>
  </w:style>
</w:styles>
'@

# ── Helpers ───────────────────────────────────────────────────
function esc($s) { $s -replace '&','&amp;' -replace '<','&lt;' -replace '>','&gt;' -replace '"','&quot;' }

function P($text, $style="Normal", $bold=$false, $color="", $sz=24, $align="", $before=0, $after=160, $indL=0, $indH=0) {
    $pPr = "<w:pStyle w:val=`"$style`"/>"
    if ($align)  { $pPr += "<w:jc w:val=`"$align`"/>" }
    if ($before -gt 0 -or $after -ne 160) { $pPr += "<w:spacing w:before=`"$before`" w:after=`"$after`"/>" }
    if ($indL -gt 0)  { $pPr += "<w:ind w:left=`"$indL`" w:hanging=`"$indH`"/>" }
    $rPr = ""
    if ($bold)   { $rPr += "<w:b/>" }
    if ($color)  { $rPr += "<w:color w:val=`"$color`"/>" }
    if ($sz -ne 24) { $rPr += "<w:sz w:val=`"$sz`"/>" }
    $rPrTag = if ($rPr) { "<w:rPr>$rPr</w:rPr>" } else { "" }
    return "<w:p><w:pPr>$pPr</w:pPr><w:r>$rPrTag<w:t xml:space=`"preserve`">$(esc $text)</w:t></w:r></w:p>"
}

function H1($text) { P $text "Heading1" }
function H2($text) { P $text "Heading2" }
function Body($text) {
    # highlight [NEEDS SOURCE] in red bold
    $parts = $text -split '(\[NEEDS SOURCE[^\]]*\])'
    $runs = ""
    foreach ($part in $parts) {
        if ($part -match '^\[NEEDS SOURCE') {
            $runs += "<w:r><w:rPr><w:b/><w:color w:val=`"CC0000`"/></w:rPr><w:t xml:space=`"preserve`">$(esc $part)</w:t></w:r>"
        } elseif ($part -ne "") {
            $runs += "<w:r><w:t xml:space=`"preserve`">$(esc $part)</w:t></w:r>"
        }
    }
    return "<w:p><w:pPr><w:pStyle w:val=`"Normal`"/><w:spacing w:after=`"200`"/></w:pPr>$runs</w:p>"
}

function Placeholder($caption, $desc) {
    $border = 'w:val="single" w:sz="6" w:space="0" w:color="BFBFBF"'
    $shading = '<w:shd w:val="clear" w:color="auto" w:fill="F2F2F2"/>'
    $tbl = @"
<w:tbl>
  <w:tblPr>
    <w:tblW w:w="5000" w:type="pct"/>
    <w:tblBorders>
      <w:top $border/><w:left $border/><w:bottom $border/><w:right $border/><w:insideH $border/><w:insideV $border/>
    </w:tblBorders>
  </w:tblPr>
  <w:tr><w:tc>
    <w:tcPr>$shading
      <w:tcMar>
        <w:top w:w="216" w:type="dxa"/><w:left w:w="288" w:type="dxa"/>
        <w:bottom w:w="216" w:type="dxa"/><w:right w:w="288" w:type="dxa"/>
      </w:tcMar>
    </w:tcPr>
    <w:p><w:pPr><w:jc w:val="center"/><w:spacing w:before="120" w:after="80"/></w:pPr>
      <w:r><w:rPr><w:b/><w:color w:val="7F7F7F"/><w:sz w:val="28"/></w:rPr>
        <w:t>[ IMAGE PLACEHOLDER ]</w:t></w:r></w:p>
    <w:p><w:pPr><w:jc w:val="center"/><w:spacing w:after="120"/></w:pPr>
      <w:r><w:rPr><w:i/><w:color w:val="888888"/><w:sz w:val="20"/></w:rPr>
        <w:t xml:space="preserve">$(esc $desc)</w:t></w:r></w:p>
  </w:tc></w:tr>
</w:tbl>
"@
    $cap = "<w:p><w:pPr><w:pStyle w:val=`"Caption`"/></w:pPr><w:r><w:rPr><w:i/></w:rPr><w:t xml:space=`"preserve`">$(esc $caption)</w:t></w:r></w:p>"
    return $tbl + $cap
}

function Ref($text) {
    return "<w:p><w:pPr><w:pStyle w:val=`"Bibliography`"/></w:pPr><w:r><w:t xml:space=`"preserve`">$(esc $text)</w:t></w:r></w:p>"
}

# ── Build document body ───────────────────────────────────────
$body = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<w:body>
"@

# COVER PAGE
$body += P "COURSE 1 OF 17 — CANADIAN POULTRY TRAINING SERIES" "Normal" $true "2E74B5" 22 "center" 1800 200
$body += P "T-FLAWS – Assessment Management Tool" "Normal" $true "1F3864" 56 "center" 400 300
$body += P "A Structured Flock Assessment Framework for Commercial Poultry Farmers in Canada" "Normal" $false "2E74B5" 30 "center" 0 600
$body += P "———————————————————————————————" "Normal" $false "2E74B5" 22 "center" 0 400
$body += P "Canadian Poultry Training Series" "Normal" $true "595959" 24 "center" 0 120
$body += P "April 2026  |  Version 1.0" "Normal" $false "595959" 22 "center" 0 800
$body += P "This course has been developed for educational purposes for commercial poultry farmers in Canada. Content is drawn from peer-reviewed literature and industry management guides. Items marked [NEEDS SOURCE] require additional verification before publication." "Normal" $false "808080" 18 "center" 0 120
$body += "<w:p><w:pPr><w:pageBreakBefore/></w:pPr></w:p>"

# INTRODUCTION
$body += H1 "Introduction to T-FLAWS"
$body += Body "If you've been farming poultry for any length of time, you already know that the best producers walk their barns with purpose — they're not just checking on things, they're reading the flock. T-FLAWS gives that instinct a structure. It stands for Toes, Feathers, Legs, Activity, Weight, and Skin — six things you can check on every farm walk that together tell you almost everything you need to know about how your flock is doing right now."
$body += Body "These aren't six separate problems to look for. They're six windows into the same flock. Wet litter shows up in the toes first, then the hocks, then the breast skin. A bird in pain stops moving, which changes your activity scores and then your weight. One issue tends to run into the next. When you assess all six together, you catch things early — before they hit your condemnation rate or your processor audit."
$body += Body "T-FLAWS is also what Canadian welfare audits and Chicken Farmers of Canada programs expect you to be doing. The NFACC Code of Practice (2016) calls for systematic on-farm monitoring. This guide gives you the tools to do that properly, in your own barn, on your own schedule."
$body += H2 "What This Guide Is For"
$body += Body "This guide walks you through each T-FLAWS component: what you're looking at, why it matters to your bottom line and your birds, how to do the assessment properly, what different findings mean, and what to do about them. It's written for experienced commercial broiler, layer, and breeder farmers and the advisors who work alongside them. It's practical — you should be able to walk into your barn with this guide and use it the same day."
$body += H2 "When to Do Your Assessments"
$body += Body "For broilers: walk a full T-FLAWS assessment at Day 7 (just Activity and Weight — are chicks settled in?), Day 14 (all six components — how's early growth going?), Day 21 (mid-cycle check), Day 28 (pre-thinning — what's your condition score?), and Day 35 or at depopulation. For layers and breeders: run a full assessment monthly, and any time something unusual happens — a mortality spike, a feed change, a weather event."

# T — TOES
$body += H1 "T — Toes"
$body += H2 "What Are We Looking At?"
$body += Body "Turn a bird over and look at the bottom of its feet. That's footpad dermatitis — FPD for short, sometimes called pododermatitis. It's a skin breakdown on the plantar surface of the foot, ranging from a bit of discoloration to a deep, painful ulcer. You score it on a simple 0 to 2 scale (Welfare Quality(r), 2009):"
$body += Body "Score 0 — The foot looks healthy. Skin is intact, no dark patches, no swelling. This is what you want to see. Score 1 — Early damage. You'll see some discoloration and the surface skin is starting to erode, but it hasn't broken through to the deeper tissue yet. Score 2 — Serious. Deep ulceration, often with dark necrotic tissue, sometimes covering more than a third of the footpad. These birds are in pain."
$body += Body "While you're at the feet, also note bumblefoot (a swollen, scabby lump caused by a staph infection getting into a skin break), any curled toes, or blackened, necrotic toe tips in young chicks."
$body += H2 "Why It Matters to Your Operation"
$body += Body "FPD is the first thing welfare auditors check when they walk into your barn — it's front and center in the NFACC Code of Practice (2016) and the Chicken Farmers of Canada Animal Care Program. But more than the audit, it matters because Grade 2 feet get condemned at the plant. That's direct revenue lost, bird by bird. And high FPD is a reliable signal that your litter is too wet and your ammonia is too high — problems that are costing you in feed conversion and respiratory health even before you see it in the feet (Ekstrand et al., 1997)."
$body += H2 "How to Do the Assessment"
$body += Body "Pick up at least 100 birds per barn, pulling from at least five different spots across the floor. Check both feet on each bird — the bird's score is whichever foot is worse. Don't bother before Day 21; feet need time to show real lesions. Your target: fewer than 5% of birds with Score 2 lesions (NFACC, 2016). If you're seeing Score 1 in more than 20% of birds at Day 21, that's your warning to act now."
$body += H2 "What to Do When Scores Are High"
$body += Body "Score 1 climbing above 20%: Your litter is getting away from you. Don't wait — look at ventilation rates, check every drinker for leaks, verify nipple height is right for bird size. Score 2 above 5%: This is chronic wet litter. You need a full ventilation and litter review, not just a spot fix. Bumblefoot: Comes from a skin wound getting infected with Staphylococcus aureus — find what's cutting birds' feet (sharp edges, rough flooring) and address it. Curled toes: Usually a riboflavin (Vitamin B2) shortage in the diet or an incubation temperature problem from the hatchery (Merck Veterinary Manual, 2022). Toe necrosis in new chicks: Most often high brooding temperature or dehydration on arrival. Keep ammonia below 25 ppm at bird level at all times — NFACC requires it, and your footpads will thank you (NFACC, 2016). Biotin in the diet should be 150 to 300 mcg per kg of complete feed to support skin integrity (Merck Veterinary Manual, 2022)."
$body += ImgXml "Figure 1. Footpad Dermatitis Scoring Scale (Welfare Quality(r) 0-2). Score 0: healthy intact foot; Score 1: early surface erosion; Score 2: deep ulceration with necrotic tissue."

# F — FEATHERS
$body += H1 "F — Feathers"
$body += H2 "What Are We Looking At?"
$body += Body "Walk through the flock and look at the birds' backs, wings, neck, tail, and breast. You're scoring feather coverage on a 0 to 4 scale, region by region. Score 0 means full, intact feather coverage — no gaps, no bare skin. Score 4 means a large area of bare skin, possibly with open wounds. Anything in between is a gradual progression of feather loss."
$body += Body "The big task here is figuring out why the feathers are gone. Feather pecking pulls feathers out cleanly at the base — you'll often see the quill stub left behind. Mites and lice tend to break and fray feathers rather than pull them out entirely. And if the whole flock is feathering slowly from the start, that's usually a nutrition or genetics issue, not a behavioral one."
$body += H2 "Why It Matters to Your Operation"
$body += Body "Feathers do a lot of work. They keep birds warm and protect the skin underneath. A bird that's lost a significant patch of feathers has to burn extra feed just to stay warm — that FCR penalty runs 5 to 15% depending on how bad the loss is (Riber et al., 2018). In layers, once feather pecking starts and draws blood, it can escalate to full cannibalism in hours (Daigle, 2017). And at the plant, poor feather coverage slows defeathering lines and can result in skin tears that downgrade the carcass."
$body += H2 "How to Do the Assessment"
$body += Body "Score at least 50 birds per barn, looking at each body region separately. In broilers, assess from Day 21 onward. In layers and breeders, do it monthly. When you find feather loss, look closely at the feathers around the bare patch — pulled-out quill stubs point to pecking; broken, dirty, or frayed feathers suggest mites. Check for mites at night (red mite, Dermanyssus gallinae, only feeds after dark). If the loss is uniform across every bird in the flock, look at diet and genetics first."
$body += H2 "What to Do When You See Feather Loss"
$body += Body "Feather loss on back and vent area: Feather pecking is the most likely cause. Pull up your lighting program — drop below 10 lux for broilers, 20 lux for layers, and make sure light is uniform across the barn (NFACC, 2016). Add enrichment like pecking blocks or hanging cabbages. Check that every bird has fair access to feeders and drinkers. Broken or frayed feathers across both sides: Check for mites. Red mite infestations in particular can get severe fast. Deal with it promptly with approved acaricides and a sanitation plan. Stress bars (horizontal weak lines across the feather shaft): These tell you the flock went through a significant stress event sometime in the past — a disease challenge, a temperature extreme, a feed gap. The bars don't fix themselves, but they tell you to go back and look at your records. Sulfur amino acids (methionine and cysteine combined) need to be at breed-recommended levels — low SAA is one of the most common nutritional drivers of feather quality problems."
$body += ImgXml "Figure 2. Feather Coverage Scoring Scale (LayWel Protocol). Score 0: full plumage; Score 2: moderate loss with bare skin visible; Score 4: large bare area, possible skin wound."

# L — LEGS
$body += H1 "L — Legs"
$body += H2 "What Are We Looking At?"
$body += Body "Stand at the end of the barn and watch birds walk undisturbed. You're using the Bristol Gait Scoring Scale (Kestin et al., 1992) — the industry standard for leg assessment:"
$body += Body "Score 0 — Normal. Fluid, balanced movement, full weight on both legs. Score 1 — Slight abnormality. A minor hitch or stiffness you notice but the bird gets around fine. Score 2 — Definite impairment. You can clearly see the problem — a limp, difficulty balancing, slower movement. Score 3 — Marked impairment. The bird is reluctant to move. It will stand still and only move when it has to. It's in significant pain. Score 4 — The bird cannot walk without using its wings for support. It cannot reliably reach feed and water. Score 5 — The bird cannot walk at all. It is in lateral recumbency. This bird needs to be humanely euthanised immediately."
$body += Body "You're also checking hock burn (the dark discoloration or ulceration on the back of the hock joint, scored 0 to 2), and noting any birds with legs that angle inward or outward (valgus/varus deformity). When you do post-mortems on lame birds, check the tibial bone for tibial dyschondroplasia — a white, rubbery plug of cartilage in the growth plate that never turned to bone properly."
$body += H2 "Why It Matters to Your Operation"
$body += Body "Leg problems are the single biggest welfare and production issue in commercial broiler farming. A large-scale UK study found that over 27% of broilers at slaughter had gait score 3 or worse (Knowles et al., 2008). A bird at Score 3 is hurting. It's not walking to the feeder and drinker like it should. It falls behind on weight, it's more likely to end up with breast blisters from lying on wet litter, and it's a red flag for your processor welfare audit. Canadian processor programs all score leg health — high lameness rates have contract consequences."
$body += H2 "How to Do the Assessment"
$body += Body "Watch at least 150 birds moving freely — don't chase them, just observe. Score as you go. After your gait walk, catch 30 birds and flip them to check hock burn on both legs. Do this from Day 28 onward in broilers. If you have dead or culled lame birds, open the tibiae and look for that white cartilage plug — it tells you something about your calcium, phosphorus, and Vitamin D3 balance."
$body += H2 "What to Do When Scores Are High"
$body += Body "Gait Score 3+ in more than 5% of birds: This is serious and it's going to show up on your audit and your weights. Dig into your lighting program first — NFACC (2016) requires at least 6 consecutive hours of darkness per day, and this rest period is directly protective for leg health. Check your bedding depth (minimum 5 cm at placement) and your nutrition against your breed spec. Hock burn Score 2 above 5%: Same root cause as FPD — litter is too wet. The fix is the same: ventilation, drinker management, litter caking removal. Valgus or varus (crooked legs): If it's showing up in multiple birds symmetrically, it's nutritional or genetic. A single bird with one crooked leg is usually an injury. Tibial dyschondroplasia on post-mortem: Review your calcium to phosphorus ratio and Vitamin D3 levels with your nutritionist. Mycotoxin exposure can also cause this, so check your feed source. Swollen, hot joints in multiple birds: That's septic arthritis — get fresh birds to your vet for diagnosis before it spreads."
$body += ImgXml "Figure 3. Bristol Gait Scoring Scale (Kestin et al., 1992). Score 0: normal fluid movement; Score 3: marked impairment, reluctant to walk; Score 5: unable to walk, requires immediate action."

# A — ACTIVITY
$body += H1 "A — Activity"
$body += H2 "What Are We Looking At?"
$body += Body "Activity is about reading the flock as a whole — how birds are moving, where they are in the barn, and how they behave when you walk in. You're looking at three things: flock distribution across the floor, what birds are doing (feeding, drinking, resting, preening), and flight distance — how close you can get before birds move away from you."
$body += Body "Distribution is scored simply: 1 = birds are spread evenly across the whole floor, 2 = some uneven patches, 3 = birds are bunched up in clear clusters with big open areas of bare floor. A good, settled flock should be pretty much everywhere. When they're not, something is pushing them or pulling them to certain spots."
$body += H2 "Why It Matters to Your Operation"
$body += Body "Activity is the earliest warning system you have. Research has shown that feeding behavior starts to change 24 to 48 hours before a disease problem becomes clinically obvious (Dawkins et al., 2004). If you're watching your flock every day, you can often feel that something is off before you can name it. T-FLAWS Activity gives you a structured way to capture that instinct. Clustering always means something. Open bare floor areas are a sign — always. The birds are telling you something about temperature, air quality, lighting, or their own health (EFSA, 2012)."
$body += H2 "How to Do the Assessment"
$body += Body "Before you open the barn door, stop and listen for 30 seconds. Quiet, uniform chatter is good. Distressed noise, silence, or a lot of piling near the door tells you something already. When you enter, pause for two minutes and watch from just inside. Score distribution before the birds react to your presence. Then walk slowly down the center aisle and note how far birds are moving away from you as you approach — target is 1 meter or less. Birds that scatter at 3 meters or more haven't been handled enough and will be hard to manage at depopulation (Jones, 1996). Do a quick behavioral scan: count what 100 birds in front of you are doing right now — feeding, drinking, resting, or other. Do this twice, a minute apart."
$body += H2 "What to Do When Activity Looks Wrong"
$body += Body "Birds clustering near heat sources or brooders: The barn is too cold, or there are cold spots near the walls. Map temperature at 30 cm off the floor across the full barn width — you want uniformity within 2 degrees C. Birds crowded in the center, walls empty: Usually overheating at the perimeter — check side curtain leakage or check if supplemental heat near walls is off. More than 70% of birds sitting during the light period: That's too many. Pain and illness make birds sit, and so does poor air quality. Check ammonia immediately — if it's above 10 ppm at nose height, open ventilation now. CO2 above 3,000 ppm will also cause lethargy (EFSA, 2012). Birds scattering hard when you enter (flight distance over 2 meters): Spend more time in the barn quietly. Daily calm walks reduce fear responses and make catch easier and less stressful for both birds and crew. Sudden piling or pile-up along a wall: Panic response. Look for a light failure, a sudden noise source, or evidence of a predator entry."
$body += ImgXml "Figure 4. Flock Distribution Patterns. Left: birds spread evenly — healthy environment. Right: clustering with bare floor areas — temperature, air quality, or light gradient problem."

# W — WEIGHT
$body += H1 "W — Weight"
$body += H2 "What Are We Looking At?"
$body += Body "Weight tells you two things: how fast your flock is growing compared to where it should be, and how evenly that weight is distributed across the barn. Both matter. The number you care about beyond the average weight is your coefficient of variation — CV% — which is just your standard deviation divided by your mean, times 100. It tells you how spread out your weights are. For broilers, you want CV below 10% at every weigh. For layer pullets approaching the point of lay, you want CV below 8% — non-uniform pullets start laying out of sync, which flattens your peak production (Lohmann Tierzucht, 2021)."
$body += Body "At Day 1, before any of that, there's crop fill. Put your finger on the crop of newly placed chicks. It should feel full — like a small, firm balloon. If it doesn't, those chicks have not found feed and water, and the next few days are going to be a fight."
$body += H2 "Why It Matters to Your Operation"
$body += Body "Weight is the primary number your production contract is built around. Fall behind the breed curve and the gap tends to compound — you don't catch up easily (Zuidhof et al., 2014). And a wide CV% at harvest creates a wide range of carcass sizes, which processors penalise because it disrupts their cut-up lines. In layers, poor uniformity at point of lay is one of the most common causes of a disappointing laying curve — birds that haven't developed evenly won't all peak at the same time."
$body += H2 "How to Do the Assessment"
$body += Body "Weigh at least 100 birds per barn, pulling them from at least five locations spread across the full floor — don't just weigh the birds nearest the door. Calculate your average, your standard deviation, and your CV%. Compare your average to your breed standard growth curve for that day of age. Run this every week starting at Day 7. For crop fill, gently palpate the crop on at least 50 chicks at 24 hours after placement. Your target is 95% or more of those chicks with full crops (Aviagen, 2022). If you're below that, you have a placement issue and Day 1 matters more than almost anything else in the grow-out."
$body += H2 "What to Do When Numbers Are Off"
$body += Body "Average weight more than 10% below breed standard: First, make sure your scale is calibrated — you'd be surprised how often that's the issue. Then look systematically: feed delivery working properly, drinkers flowing at the right rate, air quality acceptable, any subclinical disease pressure? Work through the list. CV above 12%: Your barn has winners and losers. Walk the barn and look for patterns — are the underweight birds concentrated in a particular area? That points to a temperature gradient, a drinker line with low flow, or a feeder not running properly. Every bird should be within 3 meters of a feeder. Bimodal weight distribution (two peaks on your weight chart): This is a clear two-subpopulation problem — something is blocking access for one group of birds. Check for bullying, resource access, and barn gradients. Poor crop fill at 24 hours: Check brooding temperature first (should be 25 to 30 degrees C at chick level), then put crumble right in front of the birds, and verify drinker flow rates. Cold chicks won't eat. Persistent growth lag across multiple flocks: Bring your nutritionist in to look at energy density, amino acid balance, and feed digestibility before you change anything else (Cobb-Vantress, 2021)."
$body += ImgXml "Figure 5. Body Weight Distribution — Uniform Flock (CV < 10%, narrow bell curve) vs. Non-Uniform Flock (CV > 15%, wide flat distribution). Adapted from Aviagen Ross 308 Performance Objectives (2022)."

# S — SKIN
$body += H1 "S — Skin"
$body += H2 "What Are We Looking At?"
$body += Body "Skin assessment goes beyond the feet and hocks — you're checking the rest of the bird's body for damage, inflammation, and discoloration. The main things to look for are:"
$body += Body "Cellulitis: A yellow or greenish fibrinous plaque under the skin, usually on the thigh, lower abdomen, or breast. It feels firm and is attached to the tissue underneath. This is a subcutaneous bacterial infection and it means a total carcass condemnation at the processing plant — the whole bird is lost (Elfadil et al., 1996). Breast blister (sternal bursitis): A fluid-filled swelling right over the keel bone. It varies from a small soft bump to a large, discolored sac. It's caused by birds spending too much time lying on their breast — usually because they're lame or the litter is too wet. Ammonia burn (contact dermatitis): Reddened, inflamed skin on the ventral breast and abdomen. This is chemical damage from prolonged contact with wet, ammonia-rich litter. If you're seeing this, your birds have been lying on bad litter. Skin color problems: Pale skin can signal anemia or blood loss. Blue-tinged (cyanotic) skin means the bird isn't getting enough oxygen — check for ascites or respiratory disease. Yellow skin (jaundice) points to liver problems. Scratches and tears: Small cuts that look minor in the barn become entry points for bacteria — and that becomes cellulitis."
$body += H2 "Why It Matters to Your Operation"
$body += Body "Cellulitis is the number one cause of total carcass condemnation at Canadian broiler processing plants (Elfadil et al., 1996). Not a partial trim — the entire bird is condemned. That's 100% revenue loss for that bird. And because cellulitis starts with a skin wound — often from a catching crew scratch, a rough surface in the barn, or a peck wound — it's also a direct measure of handling quality and biosecurity. When your cellulitis condemnation rate goes up, something in your management or catching system has changed."
$body += H2 "How to Do the Assessment"
$body += Body "During weighing or handling, flip birds ventral-side up and examine the breast, abdomen, and thighs. For breast blisters: press gently over the keel bone — healthy tissue is firm; a blister feels fluctuant (it moves under your finger). Score breast blisters as absent, small (under 2 cm), or large (over 2 cm). For skin color, look at the breast skin in good light and compare bird to bird. In layers and breeders, also check the comb and wattles — pale combs can signal anemia, dark or blackened combs signal circulation problems. Most importantly: pull your processor condemnation report after every kill. Cellulitis condemnation rate by category is the most important skin data you will get, and most processors will give it to you."
$body += H2 "What to Do When You See Skin Problems"
$body += Body "Cellulitis rate rising: This is a catching issue as much as a barn issue. Sit down with your catching crew and review how birds are being handled — wing grabs, overfilling crates, dragging birds across surfaces. Check the barn for anything that could scratch birds: broken slats, sharp wire ends, feeder edges. Review your E. coli vaccination program — Poulvac E. coli (Zoetis, licensed in Canada) is commonly used and can significantly reduce cellulitis rates when timed correctly (Zoetis, 2021). Breast blisters above 5%: Your lame birds are lying down too much. Fix the leg health problem first. Also look at litter quality — soft, dry litter is more forgiving on the breast. In breeders, make sure perches are available and birds are using them. Ammonia burns on ventral skin: Your litter moisture is above 35% and your ammonia is above 25 ppm. This is an urgent ventilation and litter management problem, not just a welfare issue — you are losing condemnation revenue at the plant. Cyanosis or jaundice in multiple birds: Do not wait. This is a same-day call to your poultry vet. Submit two or three fresh, chilled dead birds for post-mortem as soon as possible."
$body += ImgXml "Figure 6. Key Skin Conditions in Commercial Broiler Production. A: Cellulitis — fibrinous plaque, total condemnation. B: Breast Blister over keel bone. C: Ammonia Burn on ventral skin. Sources: Opengart (2008); Elfadil et al. (1996)."

# JOURNALS
$body += H1 "Where to Keep Learning"
$body += Body "If you want to go deeper on any topic in this guide, these are the journals and resources where the science lives. You don't need a university account for everything — many journals have open-access articles, and most Canadian provincial ag extension services have summaries of the most important research in plain language."
$body += H2 "Key Scientific Journals"

$journals = @(
    @("Poultry Science","Oxford University Press / Poultry Science Association","All aspects of poultry production, health, nutrition, genetics, and processing. ISSN: 0032-5791"),
    @("Avian Diseases","American Association of Avian Pathologists (AAAP)","Avian diseases, diagnostic pathology, infectious disease, and immunology. ISSN: 0005-2086"),
    @("World's Poultry Science Journal","Taylor & Francis / World's Poultry Science Association","International poultry science — production, nutrition, genetics, health, and welfare. ISSN: 0043-9339"),
    @("British Poultry Science","Taylor & Francis","European poultry production systems, genetics, nutrition, and welfare. ISSN: 0007-1668"),
    @("Journal of Applied Poultry Research","Oxford University Press / Poultry Science Association","Applied commercial poultry production, management, environment, and processing. ISSN: 1056-6171"),
    @("Avian Pathology","Taylor & Francis","Avian diseases, diagnostics, pathology, and immunology. ISSN: 0307-9457"),
    @("Animal Welfare","UFAW","Animal welfare science, policy, and practice — all species including poultry. ISSN: 0962-7286"),
    @("Applied Animal Behaviour Science","Elsevier","Animal behavior of domestic and laboratory animals; strong poultry welfare coverage. ISSN: 0168-1591"),
    @("Canadian Veterinary Journal","CVMA","Clinical and research articles relevant to veterinary practice in Canada. ISSN: 0008-5286"),
    @("Veterinary Record","BMJ / BVA","Clinical findings, case reports, and research across all species. ISSN: 0042-4900")
)
foreach ($j in $journals) {
    $body += "<w:p><w:pPr><w:pStyle w:val=`"Normal`"/><w:spacing w:after=`"140`"/><w:ind w:left=`"360`" w:hanging=`"360`"/></w:pPr>"
    $body += "<w:r><w:rPr><w:b/></w:rPr><w:t xml:space=`"preserve`">$(esc $j[0])</w:t></w:r>"
    $body += "<w:r><w:t xml:space=`"preserve`">. $(esc $j[1]). $(esc $j[2])</w:t></w:r></w:p>"
}

$body += H2 "Key Institutional Resources"
$resources = @(
    "National Farm Animal Care Council (NFACC) — Codes of Practice: www.nfacc.ca",
    "Canadian Food Inspection Agency (CFIA) — Meat Hygiene and Animal Welfare: www.inspection.gc.ca",
    "Aviagen Technical Resources — Ross Breed Manuals: www.aviagen.com",
    "Cobb-Vantress Technical Resources — Cobb Breed Manuals: www.cobb-vantress.com",
    "Lohmann Tierzucht — Layer Breed Guides: www.lohmann-tierzucht.com",
    "Merck Veterinary Manual — Poultry Section: www.merckvetmanual.com/poultry",
    "Welfare Quality® Assessment Protocols: www.welfarequalitynetwork.net"
)
foreach ($r in $resources) {
    $body += "<w:p><w:pPr><w:pStyle w:val=`"Normal`"/><w:spacing w:after=`"100`"/><w:ind w:left=`"360`" w:hanging=`"200`"/></w:pPr>"
    $body += "<w:r><w:rPr><w:color w:val=`"2E74B5`"/></w:rPr><w:t xml:space=`"preserve`">•  </w:t></w:r>"
    $body += "<w:r><w:t xml:space=`"preserve`">$(esc $r)</w:t></w:r></w:p>"
}

# REFERENCES
$body += H1 "References"
$refs = @(
    "Aviagen. (2022). Ross 308 broiler: Performance objectives. Aviagen Group.",
    "Aviagen. (2022). Ross broiler management handbook. Aviagen Group.",
    "Aviagen. (2022). Ross broiler: Environmental management supplement. Aviagen Group.",
    "Bilcik, B., & Keeling, L. J. (1999). Changes in feather condition in relation to feather pecking and aggressive behaviour in laying hens. British Poultry Science, 40(4), 444–451.",
    "Canadian Food Inspection Agency. (2019). Meat hygiene manual of procedures: Chapter 17. Government of Canada.",
    "Canadian Food Inspection Agency. (2022). Codes of practice for the care and handling of chickens, turkeys and breeders from hatch to slaughter. Government of Canada.",
    "Canadian Veterinary Medical Association. (2020). CVMA position statement on farm animal welfare. CVMA.",
    "CEVA Animal Health. (2020). Poultry feather condition scoring guide. CEVA Sante Animale.",
    "Cobb-Vantress. (2021). Cobb 500 broiler performance and nutrition supplement. Cobb-Vantress Inc.",
    "Cobb-Vantress. (2021). Cobb broiler management guide. Cobb-Vantress Inc.",
    "Daigle, C. L. (2017). The effect of feather pecking on welfare and productivity. Journal of Applied Poultry Research, 26(4), 560–572.",
    "Dawkins, M. S., Donnelly, C. A., & Jones, T. A. (2004). Chicken welfare is influenced more by housing conditions than by stocking density. Nature, 427(6972), 342–344.",
    "Ekstrand, C., Algers, B., & Svedberg, J. (1997). Rearing conditions and foot-pad dermatitis in Swedish broiler chickens. Preventive Veterinary Medicine, 31(3–4), 167–174.",
    "Elfadil, A. A., Vaillancourt, J. P., & Meek, A. H. (1996). Description of cellulitis lesions and associations between cellulitis and other indicators of health in broiler chickens. Avian Diseases, 40(3), 677–688.",
    "European Food Safety Authority. (2012). Scientific opinion on the welfare of chickens on farm. EFSA Journal, 10(1), 2424.",
    "Jones, R. B. (1996). Fear and adaptability in poultry: Insights, implications and imperatives. World's Poultry Science Journal, 52(2), 131–174.",
    "Kestin, S. C., Knowles, T. G., Tinch, A. E., & Gregory, N. G. (1992). Prevalence of leg weakness in broiler chickens and its relationship with genotype. Veterinary Record, 131(9), 190–194.",
    "Knowles, T. G., Kestin, S. C., Haslam, S. M., Brown, S. N., Green, L. E., Butterworth, A., Pope, S. J., Pfeiffer, D., & Nicol, C. J. (2008). Leg disorders in broiler chickens: Prevalence, risk factors and prevention. PLoS ONE, 3(2), e1545.",
    "Lohmann Tierzucht. (2021). Lohmann LSL-Classic management guide. Lohmann Tierzucht GmbH.",
    "Merck Veterinary Manual. (2022). Footpad dermatitis in poultry. Merck & Co., Inc.",
    "Merck Veterinary Manual. (2022). Lameness in poultry. Merck & Co., Inc.",
    "Merck Veterinary Manual. (2022). Skin disorders in poultry. Merck & Co., Inc.",
    "National Farm Animal Care Council. (2016). Code of practice for the care and handling of hatching eggs, breeders, chickens and turkeys. NFACC.",
    "Opengart, K. (2008). Necrotic dermatitis. In Y. M. Saif et al. (Eds.), Diseases of poultry (12th ed., pp. 1092–1095). Blackwell Publishing.",
    "Riber, A. B., van de Weerd, H. A., de Jong, I. C., & Steenfeldt, S. (2018). Review of environmental enrichment for broiler chickens. Poultry Science, 97(2), 378–396.",
    "Shepherd, E. M., & Fairchild, B. D. (2010). Footpad dermatitis in poultry. Poultry Science, 89(10), 2043–2051.",
    "Welfare Quality(R). (2009). Welfare Quality assessment protocol for poultry. Welfare Quality Consortium.",
    "Zoetis. (2021). Poulvac E. coli: Product monograph. Zoetis Canada Inc.",
    "Zuidhof, M. J., Schneider, B. L., Carney, V. L., Korver, D. R., & Robinson, F. E. (2014). Growth, efficiency, and yield of commercial broilers from 1957, 1978, and 2005. Poultry Science, 93(12), 2970–2982."
)
foreach ($r in $refs) { $body += Ref $r }

# Close document
$body += "<w:sectPr><w:pgSz w:w=`"12240`" w:h=`"15840`"/><w:pgMar w:top=`"1440`" w:right=`"1440`" w:bottom=`"1440`" w:left=`"1800`" w:header=`"720`" w:footer=`"720`"/></w:sectPr>"
$body += "</w:body></w:document>"

WriteFile "$tmpDir\word\document.xml" $body

# ── Package as .docx (ZIP) ────────────────────────────────────
if (Test-Path $outPath) { Remove-Item $outPath -Force }
[System.IO.Compression.ZipFile]::CreateFromDirectory($tmpDir, $outPath)
Remove-Item $tmpDir -Recurse -Force

Write-Host ""
Write-Host "SUCCESS!" -ForegroundColor Green
Write-Host "File saved to: $outPath" -ForegroundColor Yellow
Write-Host ""
Write-Host "Done." -ForegroundColor Gray
