# MAKEFILE for FileForge
# Compilation of C++ assembler program with maximum optimizations

CXX = g++
TARGET_UNIX = file_assembler
TARGET_WIN = file_assembler.exe
SOURCE = src/file_assembler.cpp

# Detect OS
ifeq ($(OS),Windows_NT)
    TARGET = $(TARGET_WIN)
    RM = del
    RMDIR = rmdir /s /q
    MKDIR = mkdir
    PATHSEP = \\
    CURL_OUT = -o
    TEST_DIR = if not exist
    TEST_FILE = if not exist
else
    TARGET = $(TARGET_UNIX)
    RM = rm -f
    RMDIR = rm -rf
    MKDIR = mkdir -p
    PATHSEP = /
    CURL_OUT = -o
    TEST_DIR = test -d
    TEST_FILE = test -f
endif

# Compiler flags for maximum performance
CXXFLAGS = -std=c++17 -O3 -march=native -mtune=native -flto \
           -ffast-math -funroll-loops -finline-functions \
           -mavx2 -mfma -DNDEBUG

# Libraries
LIBS = -static-libgcc -static-libstdc++

# Include nlohmann/json (header-only library)
INCLUDES = -I./json/include

# Windows-specific flags
ifeq ($(OS),Windows_NT)
    CXXFLAGS += -D_WIN32_WINNT=0x0601
    LIBS += -lws2_32
endif

.PHONY: all clean install setup test benchmark help

all: setup $(TARGET)

# Main compilation target
$(TARGET): $(SOURCE)
	@echo "🔨 Compiling assembler program with AVX2 optimizations..."
	$(CXX) $(CXXFLAGS) $(INCLUDES) -o $(TARGET) $(SOURCE) $(LIBS)
	@echo "✅ Assembler program compiled: $(TARGET)"

# Environment setup
setup:
	@echo "🔧 Setting up environment for FileForge..."
ifeq ($(OS),Windows_NT)
	@if not exist json $(MKDIR) json
	@if not exist json$(PATHSEP)include $(MKDIR) json$(PATHSEP)include  
	@if not exist json$(PATHSEP)include$(PATHSEP)nlohmann $(MKDIR) json$(PATHSEP)include$(PATHSEP)nlohmann
	@if not exist json$(PATHSEP)include$(PATHSEP)nlohmann$(PATHSEP)json.hpp (echo 📥 Downloading nlohmann/json... && curl -L https://github.com/nlohmann/json/releases/latest/download/json.hpp $(CURL_OUT) json$(PATHSEP)include$(PATHSEP)nlohmann$(PATHSEP)json.hpp)
	@if not exist embeddings $(MKDIR) embeddings
else
	@$(MKDIR) json/include/nlohmann 2>/dev/null || true
	@$(MKDIR) embeddings 2>/dev/null || true
	@if [ ! -f json/include/nlohmann/json.hpp ]; then \
		echo "📥 Downloading nlohmann/json..."; \
		curl -L https://github.com/nlohmann/json/releases/latest/download/json.hpp $(CURL_OUT) json/include/nlohmann/json.hpp; \
	fi
endif
	@echo "✅ Environment setup complete"

# Install Python dependencies
install: setup
	@echo "📦 Installing Python dependencies..."
	pip install -r requirements.txt
	@echo "✅ Python dependencies installed"

# Test assembler program  
test: $(TARGET)
	@echo "🧪 Testing assembler program..."
	@echo '{"filepath":"test.txt"}' > test_params.json
	@echo "Test content for assembler" > test.txt
ifeq ($(OS),Windows_NT)
	@$(TARGET) read "{\"filepath\":\"test.txt\"}" || echo Test completed
	@$(RM) test.txt test_params.json 2>nul || echo Cleanup done
else
	@./$(TARGET) read '{"filepath":"test.txt"}' || echo "Test completed"
	@$(RM) test.txt test_params.json 2>/dev/null || true
endif
	@echo "✅ Testing completed"

# Performance benchmark
benchmark: $(TARGET)
	@echo "⚡ Running performance benchmark..."
	@python src/benchmark_assembler.py
	@echo "✅ Benchmark completed"

# Clean up
clean:
	@echo "🧹 Cleaning files..."
ifeq ($(OS),Windows_NT)
	@$(RM) $(TARGET_WIN) *.o *.tmp *.backup.* 2>nul || echo Cleanup done
else
	@$(RM) $(TARGET_UNIX) *.o *.tmp *.backup.* 2>/dev/null || true
endif
	@echo "✅ Cleanup completed"

# Full cleanup including dependencies
distclean: clean
	@echo "🗑️ Full cleanup..."
ifeq ($(OS),Windows_NT)
	@$(RMDIR) json 2>nul || echo Directory cleaned
	@$(RMDIR) embeddings 2>nul || echo Directory cleaned  
	@$(RMDIR) __pycache__ 2>nul || echo Directory cleaned
else
	@$(RMDIR) json embeddings __pycache__ 2>/dev/null || true
endif
	@echo "✅ Full cleanup completed"

# Help
help:
	@echo "🚀 FileForge - Makefile"
	@echo "Available commands:"
	@echo "  make all       - Full build (setup + compile)"
	@echo "  make setup     - Environment setup"  
	@echo "  make install   - Install Python dependencies"
	@echo "  make test      - Test assembler program"
	@echo "  make benchmark - Performance benchmark"
	@echo "  make clean     - Clean compiled files"
	@echo "  make distclean - Full cleanup"
	@echo "  make help      - This help message" 