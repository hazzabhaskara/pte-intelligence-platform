@echo off
TITLE PTE Academic Personal Intelligence Platform - Localhost Runner
COLOR 0A

echo ======================================================================
echo    PTE ACADEMIC PERSONAL INTELLIGENCE PLATFORM (LOCAL RUNNER)
echo    Target: Australia Work and Holiday Visa Subclass 462
echo    Official Legal Target: 24 Overall  ^|  Safe Target: 36+ Overall
echo ======================================================================
echo.

echo [1/3] Memeriksa environment lokal...
where python >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Python tidak ditemukan di PATH sistem Anda.
    pause
    exit /b 1
)

where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js tidak ditemukan di PATH sistem Anda.
    pause
    exit /b 1
)

echo [2/3] Menyiapkan pembukaan browser...
start /b "" powershell -WindowStyle Hidden -Command "Start-Sleep -Seconds 2; Start-Process 'http://localhost:3005/dashboard'"

echo [3/3] Meluncurkan server lokal Next.js di Port 3005...
echo ======================================================================
echo CATATAN PENTING:
echo JANGAN TUTUP jendela terminal/CMD ini selama memakai aplikasi!
echo Jika jendela ini ditutup, halaman browser akan menampilkan ERR_CONNECTION_REFUSED.
echo Cukup minimize jendela ini jika ingin merapikan layar.
echo ======================================================================
echo.
npm run start -p 3005

pause
