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

### 🔥 Особенности работы с путями

FileForge автоматически работает с **относительными путями от корня проекта**:
- Корневая директория: папка содержащая `src/fileforge.cjs`
- Относительные пути: `./README.md`, `docs/guide.md` 
- Абсолютные пути: `C:/full/path/to/file.txt`

### 1. Install Dependencies