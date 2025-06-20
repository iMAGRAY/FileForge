# 🔧 MCP Configuration Examples

This document provides ready-to-use configurations for different MCP clients to use FileForge directly from GitHub.

## 🌟 Claude Desktop

### Direct from Git (Recommended)
Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "fileforge": {
      "command": "npx",
      "args": [
        "--yes",
        "github:iMAGRAY/FileForge",
        "node",
        "src/fileforge.cjs"
      ],
      "env": {
        "NODE_PATH": "./node_modules"
      }
    }
  }
}
```

### Local Installation
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

## 🔧 Cursor IDE

### Via NPX (Direct from Git)
Add to your `.cursorrules` or MCP settings:

```json
{
  "mcp": {
    "servers": {
      "fileforge": {
        "command": "npx",
        "args": ["--yes", "github:iMAGRAY/FileForge", "npm", "run", "mcp"],
        "cwd": "${workspaceFolder}"
      }
    }
  }
}
```

### Local Installation
```json
{
  "mcp": {
    "servers": {
      "fileforge": {
        "command": "node",
        "args": ["./node_modules/fileforge/src/fileforge.cjs"],
        "cwd": "${workspaceFolder}"
      }
    }
  }
}
```

## 🎯 Continue.dev

### package.json approach
Add to your project's `package.json`:

```json
{
  "devDependencies": {
    "fileforge": "github:iMAGRAY/FileForge"
  },
  "scripts": {
    "fileforge": "fileforge"
  }
}
```

Then configure Continue:
```json
{
  "models": [...],
  "mcpServers": {
    "fileforge": {
      "command": "npm",
      "args": ["run", "fileforge"]
    }
  }
}
```

## 🔄 Alternative Git-based Configurations

### Using Git + Node directly
```json
{
  "mcpServers": {
    "fileforge": {
      "command": "sh",
      "args": [
        "-c",
        "cd /tmp && git clone https://github.com/iMAGRAY/FileForge.git fileforge-temp 2>/dev/null || (cd fileforge-temp && git pull) && cd fileforge-temp && npm install --silent && node src/fileforge.cjs"
      ]
    }
  }
}
```

### Using npx with specific version
```json
{
  "mcpServers": {
    "fileforge": {
      "command": "npx",
      "args": [
        "--yes",
        "github:iMAGRAY/FileForge#v3.2.0",
        "node",
        "src/fileforge.cjs"
      ]
    }
  }
}
```

## 🐳 Docker Configuration (Future)

### Docker Compose
```yaml
version: '3.8'
services:
  fileforge:
    image: fileforge/mcp-server:latest
    volumes:
      - .:/workspace
    working_dir: /workspace
    command: node src/fileforge.cjs
```

### Direct Docker
```json
{
  "mcpServers": {
    "fileforge": {
      "command": "docker",
      "args": [
        "run", "--rm", "-i",
        "-v", "${workspaceFolder}:/workspace",
        "-w", "/workspace",
        "fileforge/mcp-server:latest"
      ]
    }
  }
}
```

## 🔧 Environment Variables

You can customize FileForge behavior with environment variables:

```json
{
  "mcpServers": {
    "fileforge": {
      "command": "npx",
      "args": ["--yes", "github:iMAGRAY/FileForge", "node", "src/fileforge.cjs"],
      "env": {
        "FILEFORGE_CACHE_DIR": "/tmp/fileforge-cache",
        "FILEFORGE_MAX_FILE_SIZE": "10MB",
        "FILEFORGE_EMBEDDING_MODEL": "sentence-transformers/all-MiniLM-L6-v2",
        "FILEFORGE_DEBUG": "false"
      }
    }
  }
}
```

## 🚀 Quick Test

After configuring, test your setup:

1. **Basic functionality test:**
   ```javascript
   // This should work in your MCP client
   await mcp.call("fileforge", {
     action: "create_file",
     file_path: "./test.txt",
     new_content: "Hello FileForge!"
   });
   ```

2. **Performance test:**
   ```javascript
   // Test chunked reading
   await mcp.call("fileforge", {
     action: "read_file_chunked",
     file_path: "./large_file.txt",
     chunk_size: 50
   });
   ```

## 🔍 Troubleshooting

### Common Issues

1. **Permission denied:**
   - Make sure Node.js and npm are installed
   - Check file permissions in your workspace

2. **Module not found:**
   - Try clearing npm cache: `npm cache clean --force`
   - Use absolute paths if relative paths fail

3. **Network issues:**
   - Check internet connection for Git access
   - Consider local installation as fallback

### Debug Mode

Enable debug logging:
```json
{
  "mcpServers": {
    "fileforge": {
      "command": "npx",
      "args": ["--yes", "github:iMAGRAY/FileForge", "node", "src/fileforge.cjs"],
      "env": {
        "FILEFORGE_DEBUG": "true",
        "NODE_ENV": "development"
      }
    }
  }
}
```

## 📝 Notes

- **First run**: May take longer due to Git clone and npm install
- **Updates**: Use `npx --yes` to always get the latest version
- **Caching**: NPX caches packages for faster subsequent runs
- **Offline**: Local installation recommended for offline use

For more details, see our [Installation Guide](INSTALL.md) and [Developer Guide](docs/DEVELOPER_GUIDE.md). 