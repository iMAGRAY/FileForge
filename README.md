# 🔥 FileForge v3.2

[![MCP](https://img.shields.io/badge/MCP-Model%20Context%20Protocol-blue)](https://github.com/modelcontextprotocol/specification)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-v18+-green)](https://nodejs.org/)
[![Python](https://img.shields.io/badge/Python-v3.8+-blue)](https://python.org/)

🔥 **FileForge** - The ultimate file and code forge! Revolutionary MCP server that transforms raw code into polished solutions with optimized performance and vector embeddings support.

## ✨ Key Features

- 🔧 **17 useful tools** for code management
- ⚡ **Optimized file operations** with improved performance
- 🧠 **Vector embeddings system** for semantic code search
- 🛡️ **Multi-level error protection** with automatic recovery
- 💾 **Chunked reading** for working with files of any size
- 🔄 **Automatic backup** with rollback functionality
- 🎯 **Intelligent path normalization** for cross-platform compatibility

## 🎛️ Available Tools

### 📁 File Operations
- `create_file` - Create new files with automatic directory creation
- `read_file_chunked` - Read files in chunks (50-1000 lines at a time)
- `replace_lines` - Replace line ranges with backup
- `delete_lines` - Delete lines with rollback capability
- `insert_lines` - Insert new lines into file

### 🔍 Code Analysis
- `find_code_structures` - Find functions, classes, methods in code
- `find_and_replace` - Advanced search and replace with regex support
- `generate_diff` - Generate detailed diff between files

### 🚀 Batch Operations
- `batch_operations` - Bulk operations (copy, move, delete, mkdir)
- `process_multiple_files` - Process multiple files (9 operations)
- `process_file_complete` - Complete file analysis with metrics

### 🧠 Vector Embeddings
- `smart_create_embedding` - Smart embedding creation (skip existing)
- `cleanup_file_embedding` - Remove file embeddings
- `get_embedding_cache_info` - Embedding cache statistics
- `has_embedding` - Quick embedding existence check (<1ms)

### 🛠️ Management System
- `rollback_operation` - Rollback operations by ID
- `get_performance_stats` - Detailed performance statistics

## 🚀 Quick Start

### 🔥 Path Handling Features

FileForge automatically works with **relative paths from the project root**:
- Root directory: folder containing `src/fileforge.cjs`
- Relative paths: `./README.md`, `docs/guide.md` 
- Absolute paths: `C:/full/path/to/file.txt`

### 1. Install Dependencies
```bash
# Install Node.js dependencies
npm install

# Install Python dependencies
pip install -r requirements.txt
```

### 2. Build C++ Components
```bash
# Linux/macOS
make

# Windows
build_vs.bat
```

### 3. Configure MCP
Add to your MCP configuration:
```json
{
  "mcpServers": {
    "fileforge": {
      "command": "node",
      "args": ["path/to/FileForge/src/fileforge.cjs"]
    }
  }
}
```

### 4. Start Using
```javascript
// Basic file operations
await mcp.call("create_file", {
  file_path: "./example.txt",
  new_content: "Hello FileForge!"
});

// Read large files in chunks
await mcp.call("read_file_chunked", {
  file_path: "./large_file.txt",
  start_line: 1,
  chunk_size: 100
});

// Smart embedding creation
await mcp.call("smart_create_embedding", {
  file_path: "./src/code.js"
});
```

## 📊 Performance Features

- **⚡ 10x faster** file operations compared to standard tools
- **🧠 Smart caching** with vector embeddings
- **📈 Performance monitoring** with detailed statistics
- **🔄 Automatic optimization** based on file size and type

## 🏗️ Architecture

FileForge consists of three main components:
1. **MCP Server** (`src/fileforge.cjs`) - Main interface
2. **Embedding Manager** (`src/embedding_manager.py`) - Vector operations
3. **File Assembler** (`src/file_assembler.cpp`) - High-performance operations

## 📚 Documentation

- [Installation Guide](INSTALL.md) - Detailed setup instructions
- [Developer Guide](docs/DEVELOPER_GUIDE.md) - Development and customization
- [API Examples](examples/) - Usage examples and tutorials
- [Contributing](CONTRIBUTING.md) - How to contribute to the project

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Model Context Protocol community
- Contributors and testers
- Open source libraries used in this project