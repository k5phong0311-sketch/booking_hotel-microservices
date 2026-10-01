@echo off
echo ===================================================
echo     KHOI DONG HE THONG BOOKING HOTEL MICROSERVICES
echo ===================================================
echo.

echo [1/6] API Gateway (Port 3000)...
start "API Gateway (3000)" cmd /k "cd api-gateway && npm run start:dev"

echo [2/6] User Service (Port 3001)...
start "User Service (3001)" cmd /k "cd user-service && npm run start:dev"

echo [3/6] Room Service (Port 3002)...
start "Room Service (3002)" cmd /k "cd room-service && npm run start:dev"

echo [4/6] Booking Service (Port 3003)...
start "Booking Service (3003)" cmd /k "cd booking-service && npm run start:dev"

echo [5/6] Payment Service (Port 3004)...
start "Payment Service (3004)" cmd /k "cd payment-service && npm run start:dev"

echo [6/6] Frontend React (Port 5173)...
start "Frontend React (5173)" cmd /k "cd frontend && npm run dev"

echo.
echo ===================================================
echo DONE! Da mo 6 cua so terminal de chay cac services.
echo Truy cap trang web tai: http://localhost:5173
echo ===================================================
pause
