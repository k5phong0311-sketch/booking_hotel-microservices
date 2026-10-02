@echo off
echo ===================================================
echo   BOOKINGHOTEL MICROSERVICES - DOCKER STARTUP
echo ===================================================
echo.
echo Kiem tra Docker Desktop...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker khong hoat dong! Vui long bat Docker Desktop len truoc.
    pause
    exit /b
)

echo.
echo Dang Build va Khoi dong he thong (Se mat vai phut trong lan dau tien)...
docker-compose up --build -d

echo.
echo He thong dang duoc khoi dong ngam!
echo [Frontend]: http://localhost:5173
echo [API Gateway]: http://localhost:3000
echo.
echo Ban co the xem log bang lenh: docker-compose logs -f
pause
