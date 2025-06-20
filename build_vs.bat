@echo off
echo 🚀 FILEFORGE - BUILD WITH VISUAL STUDIO 2022

REM Initialize Visual Studio Environment
call "C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Auxiliary\Build\vcvars64.bat"

echo 🔧 Setting up environment...
if not exist json mkdir json
if not exist json\include mkdir json\include
if not exist json\include\nlohmann mkdir json\include\nlohmann

REM Check for nlohmann/json
if not exist json\include\nlohmann\json.hpp (
    echo 📥 Downloading nlohmann/json.hpp...
    powershell -Command "Invoke-WebRequest -Uri 'https://github.com/nlohmann/json/releases/latest/download/json.hpp' -OutFile 'json\include\nlohmann\json.hpp'"
)

if not exist embeddings mkdir embeddings

echo 🔨 Compiling src/file_assembler.cpp with AVX2 optimizations...

REM Compilation via cl.exe with maximum optimizations
cl.exe /std:c++17 /O2 /Oi /Ot /GL /arch:AVX2 /EHsc ^
       /DNDEBUG /D_WIN32_WINNT=0x0601 ^
       /I"json\include" ^
       src\file_assembler.cpp ^
       /Fe:file_assembler.exe ^
       /link /LTCG

if %ERRORLEVEL% equ 0 (
    echo ✅ Assembler program successfully compiled: file_assembler.exe
    
    REM Test assembler program
    echo 🧪 Testing assembler program...
    echo Test content for assembler > test.txt
    file_assembler.exe read "{\"filepath\":\"test.txt\"}"
    del test.txt
    echo ✅ Testing completed successfully!
) else (
    echo ❌ Compilation error!
    exit /b 1
)

pause 