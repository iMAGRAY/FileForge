# 🔥 Basic Usage Examples - FileForge

This document contains practical examples of using FileForge MCP server.

## 📁 File Operations

### Creating New Files

```javascript
// Create a simple Python file
{
  "action": "create_file",
  "file_path": "./src/hello.py",
  "new_content": "#!/usr/bin/env python3\nprint('Hello from FileForge!')"
}

// Create with overwrite protection
{
  "action": "create_file", 
  "file_path": "./config.json",
  "new_content": "{\n  \"version\": \"1.0.0\",\n  \"debug\": true\n}",
  "operation_params": {"overwrite": false}
}

// Force overwrite existing file
{
  "action": "create_file",
  "file_path": "./backup.txt", 
  "new_content": "New backup content",
  "operation_params": {"overwrite": true}
}
```

### Reading Files in Chunks

```javascript
// Read first 50 lines
{
  "action": "read_file_chunked",
  "file_path": "./large_file.py",
  "chunk_size": 50,
  "start_line": 1,
  "end_line": 50
}

// Read specific range
{
  "action": "read_file_chunked",
  "file_path": "./source.js",
  "start_line": 100,
  "end_line": 200,
  "chunk_size": 25
}

// Read entire file in chunks
{
  "action": "read_file_chunked",
  "file_path": "./document.md",
  "chunk_size": 100
}
```

### Replacing Content

```javascript
// Replace specific lines
{
  "action": "replace_lines",
  "file_path": "./app.py",
  "start_line": 10,
  "end_line": 15,
  "new_content": "# Updated function\ndef new_function():\n    return 'Updated!'"
}

// Replace single line
{
  "action": "replace_lines",
  "file_path": "./config.py",
  "start_line": 5,
  "end_line": 5,
  "new_content": "DEBUG = False"
}
```

### Inserting Content

```javascript
// Insert at specific line
{
  "action": "insert_lines",
  "file_path": "./main.py", 
  "start_line": 10,
  "new_content": "import logging\nlogging.basicConfig(level=logging.INFO)"
}

// Insert at beginning
{
  "action": "insert_lines",
  "file_path": "./script.py",
  "start_line": 1,
  "new_content": "#!/usr/bin/env python3\n# -*- coding: utf-8 -*-"
}
```

### Deleting Lines

```javascript
// Delete range of lines
{
  "action": "delete_lines",
  "file_path": "./old_code.py",
  "start_line": 50,
  "end_line": 75
}

// Delete single line
{
  "action": "delete_lines",
  "file_path": "./temp.txt",
  "start_line": 3,
  "end_line": 3
}
```

## 🔍 Code Analysis

### Finding Code Structures

```javascript
// Find all functions
{
  "action": "find_code_structures",
  "file_path": "./module.py",
  "structure_type": "function"
}

// Find all classes
{
  "action": "find_code_structures", 
  "file_path": "./models.py",
  "structure_type": "class"
}

// Find all methods
{
  "action": "find_code_structures",
  "file_path": "./service.js",
  "structure_type": "method"
}

// Find arrow functions (JavaScript)
{
  "action": "find_code_structures",
  "file_path": "./components.jsx",
  "structure_type": "arrow"
}

// Find all structures
{
  "action": "find_code_structures",
  "file_path": "./complete.py",
  "structure_type": "all"
}
```

### Search and Replace

```javascript
// Simple text replacement
{
  "action": "find_and_replace",
  "file_path": "./config.py",
  "search_pattern": "DEBUG = True",
  "replacement": "DEBUG = False"
}

// Regex replacement
{
  "action": "find_and_replace",
  "file_path": "./api.py",
  "search_pattern": "def old_api_\\w+\\(",
  "replacement": "def new_api_method(",
  "is_regex": true
}

// Multiple replacements with backup
{
  "action": "find_and_replace",
  "file_path": "./legacy.js",
  "search_pattern": "var ",
  "replacement": "const ",
  "create_backup": true
}
```

### Generating Diffs

```javascript
// Compare two files
{
  "action": "generate_diff",
  "file_path": "./version1.py",
  "file_path_2": "./version2.py"
}

// Compare with specific options
{
  "action": "generate_diff",
  "file_path": "./old/config.json",
  "file_path_2": "./new/config.json",
  "operation_params": {
    "context_lines": 5,
    "ignore_whitespace": true
  }
}
```

## 🚀 Batch Operations

### File System Operations

```javascript
// Multiple file operations
{
  "action": "batch_operations",
  "operations": [
    {
      "type": "create_directory",
      "path": "./backup"
    },
    {
      "type": "copy",
      "source": "./important.py",
      "destination": "./backup/important.py"
    },
    {
      "type": "move", 
      "source": "./temp.txt",
      "destination": "./archive/temp.txt"
    },
    {
      "type": "delete",
      "target": "./old_file.log"
    }
  ]
}

// Organizing project structure
{
  "action": "batch_operations",
  "operations": [
    {"type": "create_directory", "path": "./src"},
    {"type": "create_directory", "path": "./tests"},
    {"type": "create_directory", "path": "./docs"},
    {"type": "move", "source": "./main.py", "destination": "./src/main.py"},
    {"type": "move", "source": "./test.py", "destination": "./tests/test.py"}
  ]
}
```

### Processing Multiple Files

```javascript
// Backup multiple files
{
  "action": "process_multiple_files",
  "operation_type": "backup",
  "file_paths": [
    "./src/main.py",
    "./src/utils.py", 
    "./config.json"
  ]
}

// Create embeddings for project files
{
  "action": "process_multiple_files",
  "operation_type": "create_embeddings",
  "file_paths": [
    "./src/model.py",
    "./src/service.py",
    "./src/controller.py"
  ],
  "operation_params": {
    "forceCreateEmbedding": true
  }
}

// Find similar code patterns
{
  "action": "process_multiple_files",
  "operation_type": "find_similar",
  "file_paths": [
    "./src/module1.py",
    "./src/module2.py"
  ],
  "operation_params": {
    "topK": 5,
    "threshold": 0.8
  }
}
```

## 🧠 Vector Embeddings

### Creating Embeddings

```javascript
// Smart embedding creation (skip if exists)
{
  "action": "smart_create_embedding",
  "file_path": "./src/important.py"
}

// Force recreate embedding
{
  "action": "smart_create_embedding", 
  "file_path": "./src/updated.py",
  "operation_params": {
    "forceRecreate": true
  }
}
```

### Managing Embeddings

```javascript
// Check if embedding exists
{
  "action": "has_embedding",
  "file_path": "./src/module.py"
}

// Get embedding cache info
{
  "action": "get_embedding_cache_info"
}

// Clean up embeddings
{
  "action": "cleanup_file_embedding",
  "file_path": "./deleted_file.py"
}
```

## 📊 System Management

### Performance Monitoring

```javascript
// Get performance statistics
{
  "action": "get_performance_stats"
}

// Complete file analysis
{
  "action": "process_file_complete",
  "file_path": "./large_project.py",
  "operation_params": {
    "includeEmbeddings": true,
    "analyzePerformance": true
  }
}
```

### Operation Recovery

```javascript
// Rollback specific operation
{
  "action": "rollback_operation",
  "operation_id": "replace_lines_20250120_143052_abc123"
}

// Get operation history (included in performance stats)
{
  "action": "get_performance_stats"
}
```

## 🔧 Advanced Features

### Custom Parameters

```javascript
// Using assembler for maximum performance
{
  "action": "read_file_chunked",
  "file_path": "./huge_file.py",
  "chunk_size": 1000,
  "operation_params": {
    "useAssembler": true,
    "compressionLevel": 2
  }
}

// Processing with custom settings
{
  "action": "process_file_complete",
  "file_path": "./project.py",
  "operation_params": {
    "chunkSize": 200,
    "startLine": 1,
    "endLine": 500,
    "useAssembler": true,
    "forceCreateEmbedding": false
  }
}
```

### Error Handling Examples

```javascript
// Operations with automatic backup
{
  "action": "replace_lines",
  "file_path": "./critical.py",
  "start_line": 10,
  "end_line": 20,
  "new_content": "# Updated critical code",
  "create_backup": true
}

// Safe batch operations with rollback capability
{
  "action": "batch_operations",
  "operations": [
    {"type": "copy", "source": "./data.json", "destination": "./backup/data.json"}
  ],
  "create_backup": true
}
```

## 💡 Pro Tips

### 1. Performance Optimization
- Use `chunk_size: 100-1000` for large files
- Enable assembler with `useAssembler: true`
- Create embeddings in batch for better performance

### 2. Safety Best Practices
- Always use `create_backup: true` for important operations
- Test operations on copies first
- Use version control alongside FileForge

### 3. Efficient Workflows
- Combine related operations in `batch_operations`
- Use `smart_create_embedding` to avoid duplicates
- Monitor performance with `get_performance_stats`

### 4. Troubleshooting
- Check file paths are absolute or relative to working directory
- Verify file permissions for write operations
- Use debug mode for detailed operation logs

---

**🎯 These examples cover the most common use cases. For advanced scenarios, check the full documentation and source code!**