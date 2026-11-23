# ExamVue 365 Flow - local preview server (no install needed)
param([int]$Port = 8080, [string]$Directory)
$ErrorActionPreference = 'Stop'
$previewExport = $null
if ($Directory) {
  $root = (Resolve-Path -LiteralPath $Directory).Path
} elseif (Test-Path Env:LANDING_PUBLIC_ORIGIN) {
  $previewExport = Join-Path ([IO.Path]::GetTempPath()) ("examvue-handoff-" + [Guid]::NewGuid())
  & node (Join-Path $PSScriptRoot 'export-handoff.mjs') $previewExport | Out-Host
  if ($LASTEXITCODE -ne 0) { throw '인계본 내보내기에 실패했습니다.' }
  $root = Join-Path $previewExport 'dist'
} else {
  $root = (Resolve-Path (Join-Path $PSScriptRoot '..\dist')).Path
}
$mime = @{
  '.html'='text/html; charset=utf-8'; '.css'='text/css; charset=utf-8'; '.js'='text/javascript; charset=utf-8'
  '.json'='application/json'; '.svg'='image/svg+xml'; '.png'='image/png'; '.jpg'='image/jpeg'; '.jpeg'='image/jpeg'
  '.webp'='image/webp'; '.gif'='image/gif'; '.ico'='image/x-icon'; '.woff2'='font/woff2'; '.woff'='font/woff'; '.txt'='text/plain; charset=utf-8'
}
$listener = $null
try {
for ($p = $Port; $p -lt $Port + 20; $p++) {
  try { $listener = New-Object System.Net.HttpListener; $listener.Prefixes.Add("http://localhost:$p/"); $listener.Start(); $Port = $p; break }
  catch { $listener = $null }
}
if (-not $listener) { throw '사용 가능한 포트를 찾지 못했습니다.' }
$url = "http://localhost:$Port/"
Write-Host ""
Write-Host "  ExamVue 365 Flow 로컬 서버 실행 중" -ForegroundColor Cyan
Write-Host "  메인          : $url"
Write-Host "  원격진료 페이지 : ${url}telemedicine#pricing"
Write-Host "  종료하려면 이 창을 닫거나 Ctrl+C 를 누르세요."
Write-Host ""
Start-Process $url
  while ($listener.IsListening) {
    $ctx = $listener.GetContext(); $res = $ctx.Response
    try {
      $path = [Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath).TrimStart('/')
      if ($path -eq '') { $path = 'index.html' }
      $file = [IO.Path]::GetFullPath((Join-Path $root $path))
      if (-not $file.StartsWith($root)) { $res.StatusCode = 403; $res.Close(); continue }
      if ((Test-Path $file -PathType Container)) { $file = Join-Path $file 'index.html' }
      if (-not (Test-Path $file -PathType Leaf) -and (Test-Path "$file.html" -PathType Leaf)) { $file = "$file.html" }
      if (Test-Path $file -PathType Leaf) {
        $ext = [IO.Path]::GetExtension($file).ToLower()
        $res.ContentType = if ($mime.ContainsKey($ext)) { $mime[$ext] } else { 'application/octet-stream' }
        $res.Headers.Add('Cache-Control','no-store')
        $bytes = [IO.File]::ReadAllBytes($file); $res.ContentLength64 = $bytes.Length
        $res.OutputStream.Write($bytes, 0, $bytes.Length)
        Write-Host ("200  /" + $path)
      } else {
        $res.StatusCode = 404; $b = [Text.Encoding]::UTF8.GetBytes('Not found'); $res.OutputStream.Write($b,0,$b.Length)
        Write-Host ("404  /" + $path) -ForegroundColor Yellow
      }
    } catch { try { $res.StatusCode = 500 } catch {} }
    finally { try { $res.Close() } catch {} }
  }
} finally {
  if ($listener) { $listener.Stop() }
  if ($previewExport) { Remove-Item -LiteralPath $previewExport -Recurse -Force }
}
