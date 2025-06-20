# 🔥 FileForge Installation Hub

Welcome to the FileForge Installation Hub! Choose your editor for one-click setup:

## 🚀 One-Click Installation

### 🤖 [Claude Desktop](install-claude.html)
AI-powered conversations with enhanced file management capabilities.

### 💫 [Cursor IDE](install-cursor.html) 
AI-first code editor with native MCP support and advanced features.

### 📝 [VS Code](install-vscode.html)
Popular code editor with extension-based MCP integration.

### 🔄 [Continue.dev](install-continue.html)
Open-source AI code assistant with multi-platform support.

## ⚡ Universal Configuration

For any MCP-compatible editor, use this configuration:

```json
{
  "mcpServers": {
    "fileforge": {
      "command": "npx",
      "args": ["--yes", "github:iMAGRAY/FileForge", "node", "src/fileforge.cjs"]
    }
  }
}
```

## 🌟 Features

- **Zero Installation**: Install directly from GitHub
- **Advanced File Operations**: Chunked reading, batch operations, atomic transactions
- **Smart Code Analysis**: Function detection, embeddings, semantic search
- **Performance Monitoring**: Detailed statistics and optimization insights
- **Safe Operations**: Automatic backups, rollback support, error recovery
- **Universal Compatibility**: Works with all MCP-compatible editors

## 📖 Documentation

- [📚 Main Documentation](../README.md)
- [⚙️ Configuration Guide](../MCP_CONFIGURATIONS.md)
- [🔧 Developer Guide](../docs/DEVELOPER_GUIDE.md)
- [🐙 GitHub Repository](https://github.com/iMAGRAY/FileForge)

## 🆘 Support

Need help? 
- [Report Issues](https://github.com/iMAGRAY/FileForge/issues)
- [View Examples](../examples/)
- [Check Troubleshooting](../MCP_CONFIGURATIONS.md#troubleshooting)

---

Made with ❤️ by the FileForge team 