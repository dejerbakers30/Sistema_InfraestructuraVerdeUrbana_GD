@echo off
TITLE Configurar Base de Datos - Gemelo Digital

echo ===================================================
echo   Configuracion de Base de Datos PostgreSQL
echo ===================================================
echo.

set /p DB_USER=Usuario PostgreSQL [default: postgres]: 
if "%DB_USER%"=="" set DB_USER=postgres

echo Ejecutando init_db.sql con usuario %DB_USER%...
psql -U %DB_USER% -f "%~dp0init_db.sql"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo Base de datos configurada exitosamente!
) else (
    echo.
    echo Ocurrio un error al ejecutar el script de base de datos.
    echo Asegurate de que PostgreSQL este corriendo y psql este en el PATH.
)

pause
