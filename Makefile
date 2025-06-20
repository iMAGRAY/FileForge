# MAKEFILE для Ultra Code Manager Enhanced
# Компиляция C++ assembler программы с максимальными оптимизациями

CXX = g++
TARGET = file_assembler.exe
SOURCE = file_assembler.cpp

# Флаги компилятора для максимальной производительности
CXXFLAGS = -std=c++17 -O3 -march=native -mtune=native -flto \
           -ffast-math -funroll-loops -finline-functions \
           -mavx2 -mfma -DNDEBUG

# Библиотеки
LIBS = -static-libgcc -static-libstdc++

# Включение nlohmann/json (header-only библиотека)
INCLUDES = -I./json/include

# Windows-специфичные флаги
ifeq ($(OS),Windows_NT)
    CXXFLAGS += -D_WIN32_WINNT=0x0601
    LIBS += -lws2_32
endif

.PHONY: all clean install setup test benchmark

all: setup $(TARGET)

# Основная цель компиляции
$(TARGET): $(SOURCE)
	@echo "🔨 Компиляция assembler программы с AVX2 оптимизациями..."
	$(CXX) $(CXXFLAGS) $(INCLUDES) -o $(TARGET) $(SOURCE) $(LIBS)
	@echo "✅ Assembler программа скомпилирована: $(TARGET)"

# Настройка окружения
setup:
	@echo "🔧 Настройка окружения для Ultra Code Manager Enhanced..."
	@if not exist json mkdir json
	@if not exist json\include mkdir json\include
	@if not exist json\include\nlohmann mkdir json\include\nlohmann
	@if not exist json\include\nlohmann\json.hpp (echo 📥 Загрузка nlohmann/json... && curl -L https://github.com/nlohmann/json/releases/latest/download/json.hpp -o json\include\nlohmann\json.hpp)
	@if not exist embeddings mkdir embeddings
	@echo "✅ Окружение настроено"

# Установка Python зависимостей
install: setup
	@echo "📦 Установка Python зависимостей..."
	pip install -r requirements.txt
	@echo "✅ Python зависимости установлены"

# Тестирование assembler программы
test: $(TARGET)
	@echo "🧪 Тестирование assembler программы..."
	@echo {"filepath":"test.txt"} > test_params.json
	@echo "Test content for assembler" > test.txt
	@$(TARGET) read "{\"filepath\":\"test.txt\"}"
	@del test.txt test_params.json
	@echo "✅ Тестирование завершено"

# Бенчмарк производительности
benchmark: $(TARGET)
	@echo "⚡ Запуск бенчмарка производительности..."
	@python benchmark_assembler.py
	@echo "✅ Бенчмарк завершен"

# Очистка
clean:
	@echo "🧹 Очистка файлов..."
	@if exist $(TARGET) del $(TARGET)
	@if exist *.o del *.o
	@if exist *.tmp del *.tmp
	@if exist *.backup.* del *.backup.*
	@echo "✅ Очистка завершена"

# Полная очистка включая зависимости
distclean: clean
	@echo "🗑️ Полная очистка..."
	@if exist json rmdir /s /q json
	@if exist embeddings rmdir /s /q embeddings
	@if exist __pycache__ rmdir /s /q __pycache__
	@echo "✅ Полная очистка завершена"

# Справка
help:
	@echo "🚀 Ultra Code Manager Enhanced - Makefile"
	@echo "Доступные команды:"
	@echo "  make all       - Полная сборка (setup + compile)"
	@echo "  make setup     - Настройка окружения"
	@echo "  make install   - Установка Python зависимостей"
	@echo "  make test      - Тестирование assembler программы"
	@echo "  make benchmark - Бенчмарк производительности"
	@echo "  make clean     - Очистка скомпилированных файлов"
	@echo "  make distclean - Полная очистка"
	@echo "  make help      - Эта справка" 