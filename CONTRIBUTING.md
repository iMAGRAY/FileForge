# 🤝 Contributing to Ultra Code Manager Enhanced

Thank you for your interest in contributing to Ultra Code Manager Enhanced! This document provides guidelines and information for contributors.

## 🚀 Quick Start for Contributors

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/ultra-code-manager-enhanced.git
   cd ultra-code-manager-enhanced
   ```
3. **Set up development environment**:
   ```bash
   npm install
   pip install -r requirements.txt -r requirements-dev.txt
   make  # or build_vs.bat on Windows
   ```
4. **Create a feature branch**:
   ```bash
   git checkout -b feature/amazing-new-feature
   ```

## 📋 Development Guidelines

### Code Style

#### JavaScript/Node.js
- Use **2 spaces** for indentation
- Follow **ESLint** configuration
- Add **JSDoc comments** for public methods
- Use **descriptive variable names**

```javascript
/**
 * Creates a new file with specified content
 * @param {string} filePath - Path to the file to create
 * @param {string} content - Content to write to the file
 * @param {boolean} overwrite - Whether to overwrite existing file
 * @returns {Promise<Object>} Operation result
 */
async createNewFile(filePath, content = '', overwrite = false) {
  const normalizedPath = this.normalizePath(filePath);
  // Implementation...
}
```

#### Python
- Follow **PEP 8** style guide
- Use **type hints** for function parameters and return values
- Add **docstrings** for all functions and classes
- Use **black** for code formatting

```python
def create_embedding(self, text: str) -> np.ndarray:
    """
    Create vector embedding for the given text.
    
    Args:
        text: Input text to vectorize
        
    Returns:
        Numpy array containing the embedding vector
        
    Raises:
        ValueError: If text is empty or invalid
    """
    if not text.strip():
        raise ValueError("Text cannot be empty")
    return self.model.encode([text])[0]
```

#### C++
- Follow **Google C++ Style Guide**
- Use **snake_case** for variables and functions
- Use **PascalCase** for classes
- Add **Doxygen comments** for documentation

```cpp
/**
 * @brief Reads file content with optimized performance
 * @param filepath Path to the file to read
 * @return File content as string
 * @throws std::runtime_error if file cannot be read
 */
std::string readFile(const std::string& filepath) {
    // Implementation...
}
```

### Testing Requirements

#### Unit Tests
All new features **MUST** include unit tests:

```javascript
// tests/test_new_feature.js
describe('New Feature', () => {
  test('should work correctly with valid input', async () => {
    const result = await manager.newFeature('valid_input');
    expect(result.success).toBe(true);
  });
  
  test('should handle invalid input gracefully', async () => {
    const result = await manager.newFeature('');
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});
```

#### Integration Tests
Major features should include integration tests:

```javascript
// tests/test_integration.js
describe('MCP Integration', () => {
  test('should handle JSON-RPC calls correctly', async () => {
    const request = {
      jsonrpc: "2.0",
      method: "tools/call",
      params: { /* ... */ }
    };
    
    const response = await handleMCPRequest(request);
    expect(response.jsonrpc).toBe("2.0");
    expect(response.result).toBeDefined();
  });
});
```

#### Performance Tests
Performance-critical features should include benchmarks:

```python
# tests/test_performance.py
def test_assembler_performance():
    """Test that assembler operations are faster than standard operations"""
    large_content = 'x' * (1024 * 1024)  # 1MB content
    
    standard_time = benchmark_standard_operation(large_content)
    assembler_time = benchmark_assembler_operation(large_content)
    
    assert assembler_time < standard_time, "Assembler should be faster"
```

## 🐛 Bug Reports

When reporting bugs, please include:

1. **Ultra Code Manager Enhanced version**
2. **Operating system and version**
3. **Node.js and Python versions**
4. **Detailed description** of the issue
5. **Steps to reproduce** the bug
6. **Expected vs actual behavior**
7. **Log output** (if available)
8. **MCP client used** (Cursor, Claude Desktop, etc.)

### Bug Report Template

```markdown
## Bug Report

**Version**: Ultra Code Manager Enhanced v3.2.0
**OS**: Windows 11 / Ubuntu 22.04 / macOS 13
**Node.js**: v18.17.0
**Python**: 3.10.12
**MCP Client**: Cursor IDE v0.40.0

### Description
Brief description of the bug...

### Steps to Reproduce
1. Open Cursor IDE
2. Execute MCP call: `{"action": "create_file", ...}`
3. Observe error...

### Expected Behavior
The file should be created successfully...

### Actual Behavior
Error occurred: "File not found"...

### Logs
```
[DEBUG] 2025-01-20T14:30:52.123Z - Processing file operation
Error: File not found: /path/to/file
```

### Additional Context
Any other relevant information...
```

## ✨ Feature Requests

For new features, please:

1. **Search existing issues** to avoid duplicates
2. **Describe the use case** and problem it solves
3. **Provide examples** of the proposed API
4. **Consider backwards compatibility**
5. **Estimate implementation complexity**

### Feature Request Template

```markdown
## Feature Request

### Problem Statement
Currently, Ultra Code Manager Enhanced doesn't support...

### Proposed Solution
Add a new action `new_action` that would...

### Example Usage
```json
{
  "action": "new_action",
  "file_path": "./example.py",
  "new_parameter": "value"
}
```

### Benefits
- Improved performance for...
- Better user experience when...
- Enables new workflows like...

### Implementation Notes
- Would require changes to...
- Should integrate with existing...
- Potential challenges include...
```

## 🔄 Pull Request Process

### Before Submitting

1. **Ensure all tests pass**:
   ```bash
   npm test
   python -m pytest tests/
   ```

2. **Run linting**:
   ```bash
   npm run lint
   black src/
   ```

3. **Update documentation** if needed
4. **Add changelog entry** to `CHANGELOG.md`
5. **Test with real MCP clients** (Cursor, Claude Desktop)

### Pull Request Guidelines

1. **Use descriptive title**: `feat: add smart file creation with templates`
2. **Fill out PR template** completely
3. **Keep changes focused** - one feature per PR
4. **Include tests** for new functionality
5. **Update docs** if behavior changes
6. **Squash commits** before merging

### PR Template

```markdown
## Pull Request

### Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

### Description
Brief description of what this PR does...

### Related Issues
Fixes #123, Relates to #456

### Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed
- [ ] Performance benchmarks run

### Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] All tests pass
- [ ] No breaking changes (or breaking changes documented)

### Screenshots (if applicable)
Add screenshots or GIFs showing the feature in action...
```

## 🏗️ Development Workflow

### Setting Up Development Environment

```bash
# 1. Clone and setup
git clone https://github.com/YOUR_USERNAME/ultra-code-manager-enhanced.git
cd ultra-code-manager-enhanced

# 2. Install dependencies
npm install
pip install -r requirements.txt -r requirements-dev.txt

# 3. Build C++ components
make  # Linux/macOS
# OR
build_vs.bat  # Windows

# 4. Run tests to ensure everything works
npm test
python -m pytest tests/

# 5. Start developing!
```

### Development Commands

```bash
# Run tests
npm test                    # Node.js tests
python -m pytest tests/    # Python tests

# Code formatting
npm run lint               # JavaScript linting
black src/                 # Python formatting
clang-format src/*.cpp     # C++ formatting

# Build components
make                       # Build C++ assembler
make debug                 # Build with debug symbols
make clean                 # Clean build artifacts

# Documentation
npm run docs               # Generate API docs
mkdocs serve              # Serve documentation locally

# Performance testing
python src/benchmark_assembler.py  # Run benchmarks
```

### Debugging

#### Enable Debug Mode
```bash
export DEBUG=1
export MCP_LOG_LEVEL=debug
node src/ultra_code_manager_enhanced.cjs
```

#### Common Debug Techniques
1. **Add debug logs**:
   ```javascript
   debugLog('Processing operation', { action, filePath, params });
   ```

2. **Use Node.js inspector**:
   ```bash
   node --inspect-brk src/ultra_code_manager_enhanced.cjs
   ```

3. **Python debugging**:
   ```python
   import pdb; pdb.set_trace()
   ```

4. **C++ debugging with GDB**:
   ```bash
   make debug
   gdb ./file_assembler
   ```

## 🌟 Areas for Contribution

We welcome contributions in these areas:

### High Priority
- **Performance optimizations** for large file operations
- **New MCP clients support** (VS Code, other IDEs)
- **Error handling improvements** and recovery mechanisms
- **Documentation improvements** and examples
- **Cross-platform compatibility** fixes

### Medium Priority  
- **New file operation types** (merge, split, etc.)
- **Enhanced embeddings models** support
- **Batch operation improvements**
- **Configuration management** system
- **Logging and monitoring** enhancements

### Low Priority
- **GUI tools** for configuration
- **Web interface** for management
- **Additional language support** (Go, Rust, etc.)
- **Cloud storage integration**
- **Plugin system** for extensions

## 🎯 Recognition

Contributors will be recognized in:

- **README.md** contributors section
- **Release notes** for their contributions
- **GitHub contributors** page
- **Special thanks** in major releases

## 📞 Getting Help

- **GitHub Discussions**: For questions and general discussion
- **GitHub Issues**: For bug reports and feature requests
- **Discord**: [Join our Discord server](https://discord.gg/your-discord)
- **Email**: maintainers@ultra-code-manager.dev

## 📜 Code of Conduct

We are committed to providing a welcoming and inspiring community for all. Please read our [Code of Conduct](CODE_OF_CONDUCT.md) before participating.

### Our Pledge

- **Be respectful** and inclusive
- **Be collaborative** and helpful
- **Be constructive** in feedback
- **Be patient** with newcomers
- **Be professional** in all interactions

---

**🎉 Thank you for contributing to Ultra Code Manager Enhanced! Together we're building the future of code management tools.**