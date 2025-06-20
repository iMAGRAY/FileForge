# 🔥 Installation Guide - FileForge v3.2

This guide will walk you through installing and configuring FileForge for different platforms and MCP clients.

## 🏗️ Prerequisites

### Required Software
- **Node.js** v18.0 or higher ([Download](https://nodejs.org/))
- **Python** v3.8 or higher ([Download](https://python.org/))
- **Git** for cloning the repository
- **C++ Compiler** for assembler module:
  - Windows: Visual Studio 2019+ or MSVC Build Tools
  - Linux: GCC 9+ or Clang 10+
  - macOS: Xcode Command Line Tools

### Hardware Requirements
- **RAM**: Minimum 4GB (8GB+ recommended for large projects)
- **Storage**: 100MB for installation + space for embeddings cache
- **CPU**: Multi-core processor recommended for optimal performance

## 📦 Installation Steps

### 1. Clone Repository

```bash
git clone https://github.com/iMAGRAY/FileForge.git
cd FileForge
```

### 2. Install Node.js Dependencies

```bash
npm install
```

Required packages will be installed:
- `@modelcontextprotocol/sdk` - MCP protocol implementation
- Supporting libraries for JSON-RPC communication

### 3. Install Python Dependencies

```bash
# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

Python packages installed:
- `sentence-transformers` - Vector embeddings generation
- `faiss-cpu` or `faiss-gpu` - Fast similarity search
- `numpy` - Numerical computations
- `tqdm` - Progress bars
- `torch` - PyTorch for ML models

### 4. Build C++ Assembler Module

#### Windows (Visual Studio)
```bash
# Run the automated build script
build_vs.bat
```

Or manually:
```bash
cl /EHsc /O2 src/file_assembler.cpp /Fefile_assembler.exe
```

#### Linux/macOS (Make)
```bash
make
```

Or manually:
```bash
g++ -O3 -std=c++17 src/file_assembler.cpp -o file_assembler
```

### 5. Verify Installation

```bash
# Test Node.js components
node src/fileforge.cjs --test

# Test Python components  
python src/embedding_manager.py test

# Test C++ assembler
./file_assembler test '{"filepath": "test.txt"}'
```

## ⚙️ Configuration

### MCP Client Configuration

#### Cursor IDE

Create or edit `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "fileforge": {
      "command": "node",
      "args": ["/path/to/fileforge/src/fileforge.cjs"],
      "timeout": 30,
      "env": {
        "DEBUG": "1",
        "PYTHONPATH": "/path/to/fileforge"
      }
    }
  }
}
```

**Windows Path Example:**
```json
{
  "mcpServers": {
    "fileforge": {
      "command": "node",
      "args": ["C:/mcp-servers/fileforge/src/fileforge.cjs"],
      "timeout": 30,
      "env": {
        "DEBUG": "1"
      }
    }
  }
}
```

#### Claude Desktop

Create or edit `~/.claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "fileforge": {
      "command": "node",
      "args": ["/path/to/fileforge/src/fileforge.cjs"],
      "timeout": 30
    }
  }
}
```

### Environment Variables

Optional environment variables for customization:

```bash
# Enable debug mode
export DEBUG=1

# Custom embeddings directory
export EMBEDDINGS_DIR=/custom/path/embeddings

# Assembler performance tuning
export ASSEMBLER_BUFFER_SIZE=8192

# Python model cache directory
export TRANSFORMERS_CACHE=/custom/cache/path
```

## 🧪 Testing Installation

### 1. Basic Functionality Test

```bash
# Start the MCP server in test mode
node src/fileforge.cjs
```

Expected output:
```
FileForge MCP Server запущен
Server ready on stdio transport
```

### 2. Component Tests

#### Test File Operations
```javascript
// In your MCP client
{
  "action": "create_file",
  "file_path": "./test.txt",
  "new_content": "Hello FileForge!"
}
```

#### Test Assembler Integration  
```javascript
{
  "action": "read_file_chunked",
  "file_path": "./test.txt",
  "chunk_size": 10
}
```

#### Test Embeddings System
```javascript
{
  "action": "smart_create_embedding", 
  "file_path": "./test.txt"
}
```

### 3. Performance Benchmark

```bash
# Run comprehensive benchmarks
python src/benchmark_assembler.py

# Expected results:
# - Assembler read speed: 200-500 MB/s
# - Standard read speed: 20-50 MB/s  
# - Embeddings creation: 5-50 files/s
```

## 🔧 Troubleshooting

### Common Issues

#### 1. "Module not found" errors
```bash
# Reinstall Node.js dependencies
npm install --force

# Clear npm cache if needed
npm cache clean --force
```

#### 2. Python embedding errors
```bash
# Reinstall Python dependencies
pip uninstall -r requirements.txt -y
pip install -r requirements.txt

# For GPU support (optional)
pip install faiss-gpu torch torchvision torchaudio
```

#### 3. C++ compilation errors

**Windows:**
- Install Visual Studio Build Tools
- Ensure MSVC compiler is in PATH
- Try running from "Developer Command Prompt"

**Linux/macOS:**
- Install build-essential: `sudo apt install build-essential`
- Update GCC: `sudo apt install gcc-9 g++-9`
- Install Xcode tools: `xcode-select --install`

#### 4. MCP Client Connection Issues

- Verify absolute paths in configuration
- Check file permissions (755 for executables)
- Restart MCP client after configuration changes
- Check client logs for detailed error messages

### Debug Mode

Enable detailed logging:

```bash
# Set environment variable
export DEBUG=1

# Or edit configuration
{
  "env": {"DEBUG": "1", "MCP_LOG_LEVEL": "debug"}
}
```

### Performance Issues

#### Low Performance
- Ensure C++ assembler compiled with optimizations (`-O3`)
- Use SSD storage for embeddings cache
- Increase available RAM for large file operations
- Enable GPU acceleration for embeddings (install `faiss-gpu`)

#### High Memory Usage
- Reduce `chunk_size` parameter for large files
- Clean embeddings cache: `rm -rf embeddings/*`
- Adjust `max_workers` in multi-file operations
- Monitor with: `node --max-old-space-size=4096`

## 🔄 Updates

### Updating to Latest Version

```bash
# Pull latest changes
git pull origin main

# Update dependencies
npm install
pip install -r requirements.txt

# Rebuild C++ components
make clean && make
# or
build_vs.bat

# Restart MCP client
```

### Version Compatibility

| Ultra Code Manager | Node.js | Python | MCP SDK |
|-------------------|---------|--------|---------|
| v3.2.x | 18+ | 3.8+ | 1.12.x |
| v3.1.x | 18+ | 3.8+ | 1.11.x |
| v3.0.x | 16+ | 3.7+ | 1.10.x |

## 📞 Support

If you encounter issues:

1. 📖 Check this installation guide
2. 🐛 Search [existing issues](https://github.com/your-username/ultra-code-manager-enhanced/issues)
3. 💬 Ask in [discussions](https://github.com/your-username/ultra-code-manager-enhanced/discussions)
4. 🆕 Create new issue with:
   - OS and version
   - Node.js and Python versions
   - Complete error messages
   - Steps to reproduce

## ✅ Verification Checklist

- [ ] Node.js v18+ installed
- [ ] Python v3.8+ installed  
- [ ] C++ compiler available
- [ ] Repository cloned
- [ ] `npm install` completed successfully
- [ ] `pip install -r requirements.txt` completed
- [ ] C++ assembler built (`file_assembler.exe` or `file_assembler`)
- [ ] MCP client configuration updated
- [ ] Test file operations work
- [ ] Embeddings system functional
- [ ] Performance benchmarks acceptable

**🎉 Congratulations! Ultra Code Manager Enhanced is ready to revolutionize your code management!**