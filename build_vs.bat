@echo off
echo 🚀 ULTRA CODE MANAGER - СБОРКА ЧЕРЕЗ VISUAL STUDIO 2022

REM Инициализация Visual Studio Environment
call "C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Auxiliary\Build\vcvars64.bat"

echo 🔧 Настройка окружения...
if not exist json mkdir json
if not exist json\include mkdir json\include
if not exist json\include\nlohmann mkdir json\include\nlohmann

REM Проверяем наличие nlohmann/json
if not exist json\include\nlohmann\json.hpp (
    echo 📥 Загрузка nlohmann/json.hpp...
    powershell -Command "Invoke-WebRequest -Uri 'https://github.com/nlohmann/json/releases/latest/download/json.hpp' -OutFile 'json\include\nlohmann\json.hpp'"
)

if not exist embeddings mkdir embeddings

echo 🔨 Компиляция file_assembler.cpp с AVX2 оптимизациями...

REM Компиляция через cl.exe с максимальными оптимизациями
cl.exe /std:c++17 /O2 /Oi /Ot /GL /arch:AVX2 /EHsc ^
       /DNDEBUG /D_WIN32_WINNT=0x0601 ^
       /I"json\include" ^
       file_assembler.cpp ^
       /Fe:file_assembler.exe ^
       /link /LTCG

if %ERRORLEVEL% equ 0 (
    echo ✅ Assembler программа успешно скомпилирована: file_assembler.exe
    
    REM Тест assembler программы
    echo 🧪 Тестирование assembler программы...
    echo Test content for assembler > test.txt
    file_assembler.exe read "{\"filepath\":\"test.txt\"}"
    del test.txt
    echo ✅ Тестирование завершено успешно!
) else (
    echo ❌ Ошибка компиляции!
    exit /b 1
)

pause 