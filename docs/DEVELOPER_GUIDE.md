# 🛠️ Developer Guide - FileForge

This guide is for developers who want to understand, modify, or extend FileForge.

## 🏗️ Architecture Overview

FileForge follows a modular architecture with three main components:

```
┌─────────────────────────────────────────────┐
│              MCP Server Layer               │
│         (ultra_code_manager_enhanced.cjs)   │
├─────────────────────────────────────────────┤
│              Core Components                │
├─────────────────────┬───────────────────────┤
│    File Operations  │   Vector Embeddings   │
│    (JavaScript)     │     (Python)          │
├─────────────────────┼───────────────────────┤
│             Performance Layer               │
│            (C++ Assembler)                  │
└─────────────────────────────────────────────┘
```

### Component Details

#### 1. MCP Server Layer (`ultra_code_manager_enhanced.cjs`)
- **Purpose**: Main entry point, MCP protocol handler
- **Technology**: Node.js + @modelcontextprotocol/sdk
- **Responsibilities**:
  - JSON-RPC 2.0 protocol handling
  - Input validation and sanitization
  - Operation routing and orchestration
  - Error handling and response formatting

#### 2. File Operations (JavaScript)
- **Purpose**: Core file manipulation logic
- **Technology**: Node.js File System API
- **Features**:
  - Chunked reading for large files
  - Atomic operations with backup/rollback
  - Path normalization and validation
  - Batch operations coordination

#### 3. Vector Embeddings (`embedding_manager.py`)
- **Purpose**: Semantic code analysis and search
- **Technology**: Python + sentence-transformers + FAISS
- **Features**:
  - Code vectorization using transformer models
  - Fast similarity search with FAISS indexing
  - Intelligent caching and embedding management

#### 4. Performance Layer (`file_assembler.cpp`)
- **Purpose**: High-performance file operations
- **Technology**: C++ with STL and system APIs
- **Benefits**:
  - 10x faster file I/O operations
  - Memory-efficient large file processing
  - Direct system call optimizations

## 🔧 Development Setup

### Prerequisites
```bash
# Development tools
npm install -g typescript
npm install -g @types/node
pip install pytest black flake8
```

### Environment Setup
```bash
# Clone and setup
git clone <repository>
cd fileforge

# Install dependencies
npm install
pip install -r requirements.txt -r requirements-dev.txt

# Build C++ components
make debug  # or build_vs.bat for Windows

# Run tests
npm test
python -m pytest tests/
```

### Development Dependencies
```json
{
  "devDependencies": {
    "@types/node": "^18.0.0",
    "jest": "^29.0.0",
    "@jest/globals": "^29.0.0",
    "typescript": "^5.0.0"
  }
}
```

## 📁 Project Structure

```
fileforge/
├── src/
│   ├── ultra_code_manager_enhanced.cjs    # Main MCP server
│   ├── file_assembler.cpp                 # C++ performance module
│   ├── embedding_manager.py               # Python embeddings
│   └── benchmark_assembler.py             # Performance benchmarks
├── tests/
│   ├── test_file_operations.js            # File operations tests
│   ├── test_embeddings.py                 # Embeddings tests
│   └── test_integration.js                # Integration tests
├── docs/
│   ├── API.md                             # API documentation
│   ├── PERFORMANCE.md                     # Performance analysis
│   └── TROUBLESHOOTING.md                 # Common issues
├── examples/                              # Usage examples
├── package.json                           # Node.js configuration
├── requirements.txt                       # Python dependencies
├── Makefile                               # Build configuration
└── README.md                              # Main documentation
```

## 🔍 Core Classes and Functions

### FileForge Class

```javascript
class FileForge {
  constructor() {
    this.operationHistory = new Map();
    this.fileHashes = new Map();
    this.assemblerPath = "./file_assembler.exe";
    this.embeddingsDir = "./embeddings";
  }

  // Core file operations
  async createNewFile(filePath, content, overwrite, forceCreateEmbedding)
  async readFileChunked(filePath, chunkSize, startLine, endLine, useAssembler)
  async replaceLines(filePath, startLine, endLine, newContent, createBackup)
  async deleteLines(filePath, startLine, endLine, createBackup)
  async insertLines(filePath, startLine, newContent, createBackup)

  // Analysis operations
  async findCodeStructures(filePath, structureType)
  async findAndReplace(filePath, searchPattern, replacement, isRegex)
  async generateDiff(filePath1, filePath2)

  // Batch operations
  async batchOperations(operations, createBackup)
  async processMultipleFiles(operationType, filePaths, operationParams)

  // Embeddings integration
  async createFileEmbedding(filePath)
  async smartCreateEmbedding(filePath, forceRecreate)
  async hasEmbedding(filePath)

  // System management
  async rollbackOperation(operationId)
  async getPerformanceStats()
}
```

### Key Methods Deep Dive

#### Path Normalization
```javascript
normalizePath(filePath) {
  if (path.isAbsolute(filePath)) {
    return filePath;
  }
  return path.resolve(process.cwd(), filePath);
}
```

#### Assembler Integration
```javascript
async readFileAssembler(filePath) {
  const input = JSON.stringify({
    action: "read_file",
    filepath: filePath,
    buffer_size: 8192
  });
  
  return new Promise((resolve, reject) => {
    const process = spawn(this.assemblerPath, [], {
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    process.stdin.write(input);
    process.stdin.end();
    // ... handle response
  });
}
```

#### Chunked Reading Algorithm
```javascript
async readFileChunked(filePath, chunkSize = 50, startLine = 1, endLine = null) {
  const lines = fileContent.split('\n');
  const chunks = [];
  
  for (let i = actualStartLine - 1; i < actualEndLine; i += chunkSize) {
    const chunkLines = lines.slice(i, Math.min(i + chunkSize, actualEndLine));
    chunks.push({
      chunkIndex: Math.floor(i / chunkSize) + 1,
      startLine: i + 1,
      endLine: Math.min(i + chunkSize, actualEndLine),
      content: chunkLines.join('\n'),
      lineCount: chunkLines.length
    });
  }
  
  return chunks;
}
```

## 🧠 Embeddings System

### Python Integration

```python
class EmbeddingManager:
    def __init__(self, model_name="sentence-transformers/all-MiniLM-L6-v2"):
        self.model = SentenceTransformer(model_name)
        self.index = faiss.IndexFlatIP(384)  # 384-dimensional vectors
        
    def create_embedding(self, text: str) -> np.ndarray:
        return self.model.encode([text])[0]
        
    def find_similar(self, query_embedding: np.ndarray, k: int = 5):
        scores, indices = self.index.search(
            query_embedding.reshape(1, -1), k
        )
        return scores[0], indices[0]
```

### JavaScript-Python Bridge

```javascript
async createFileEmbedding(filePath) {
  const pythonProcess = spawn('python', [
    'src/embedding_manager.py',
    'create',
    filePath
  ]);
  
  return new Promise((resolve, reject) => {
    let output = '';
    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    pythonProcess.on('close', (code) => {
      if (code === 0) {
        resolve(JSON.parse(output));
      } else {
        reject(new Error(`Python process failed with code ${code}`));
      }
    });
  });
}
```

## ⚡ Performance Optimizations

### C++ Assembler Module

```cpp
class FileAssembler {
private:
    static const size_t BUFFER_SIZE = 8192;
    
public:
    std::string readFile(const std::string& filepath) {
        std::ifstream file(filepath, std::ios::binary);
        file.seekg(0, std::ios::end);
        size_t fileSize = file.tellg();
        file.seekg(0, std::ios::beg);
        
        std::string content;
        content.reserve(fileSize);
        
        char buffer[BUFFER_SIZE];
        while (file.read(buffer, BUFFER_SIZE) || file.gcount() > 0) {
            content.append(buffer, file.gcount());
        }
        
        return content;
    }
};
```

### Memory Management

```javascript
// Avoid memory leaks in large file operations
function processLargeFile(filePath) {
  return new Promise((resolve) => {
    const stream = fs.createReadStream(filePath, { 
      encoding: 'utf8',
      highWaterMark: 16 * 1024 // 16KB chunks
    });
    
    let chunks = [];
    stream.on('data', (chunk) => {
      chunks.push(chunk);
      
      // Process in batches to avoid memory overflow
      if (chunks.length >= 100) {
        processChunkBatch(chunks);
        chunks = [];
      }
    });
    
    stream.on('end', () => {
      if (chunks.length > 0) {
        processChunkBatch(chunks);
      }
      resolve();
    });
  });
}
```

## 🧪 Testing Strategy

### Unit Tests

```javascript
// tests/test_file_operations.js
const { FileForge } = require('../src/ultra_code_manager_enhanced.cjs');

describe('File Operations', () => {
  let manager;
  
  beforeEach(() => {
    manager = new FileForge();
  });
  
  test('should create file with correct content', async () => {
    const result = await manager.createNewFile(
      './test_file.txt',
      'Hello World',
      true
    );
    
    expect(result.success).toBe(true);
    expect(fs.existsSync('./test_file.txt')).toBe(true);
  });
  
  test('should read file in chunks', async () => {
    await manager.createNewFile('./test.txt', 'line1\nline2\nline3\n');
    
    const result = await manager.readFileChunked('./test.txt', 2);
    
    expect(result.chunks).toHaveLength(2);
    expect(result.chunks[0].lineCount).toBe(2);
  });
});
```

### Integration Tests

```javascript
// tests/test_integration.js
describe('MCP Integration', () => {
  test('should handle JSON-RPC call correctly', async () => {
    const request = {
      jsonrpc: "2.0",
      id: 1,
      method: "tools/call",
      params: {
        name: "ultra_code_manager",
        arguments: {
          action: "create_file",
          file_path: "./integration_test.txt",
          new_content: "test content"
        }
      }
    };
    
    const response = await handleMCPRequest(request);
    
    expect(response.jsonrpc).toBe("2.0");
    expect(response.id).toBe(1);
    expect(response.result).toBeDefined();
  });
});
```

### Performance Tests

```javascript
// tests/test_performance.js
describe('Performance', () => {
  test('assembler should be faster than standard operations', async () => {
    const largeContent = 'x'.repeat(1024 * 1024); // 1MB content
    
    const standardStart = Date.now();
    await manager.readFileChunked('./large.txt', 100, 1, null, false);
    const standardTime = Date.now() - standardStart;
    
    const assemblerStart = Date.now();
    await manager.readFileChunked('./large.txt', 100, 1, null, true);
    const assemblerTime = Date.now() - assemblerStart;
    
    expect(assemblerTime).toBeLessThan(standardTime);
  });
});
```

## 🔌 Adding New Features

### 1. Adding a New Action

```javascript
// In the switch statement of handleMCPRequest
case "new_action":
  if (!file_path) {
    throw new Error("file_path обязателен");
  }
  result = await ultraCodeManager.newActionMethod(
    file_path,
    new_parameter,
    operation_params?.option || defaultValue
  );
  break;
```

### 2. Implementing the Method

```javascript
async newActionMethod(filePath, parameter, option = defaultValue) {
  try {
    const normalizedPath = this.normalizePath(filePath);
    
    // Validate inputs
    if (!fs.existsSync(normalizedPath)) {
      throw new Error(`File not found: ${normalizedPath}`);
    }
    
    // Create backup if needed
    const operationId = this.generateOperationId('new_action');
    if (option.createBackup) {
      await this.createBackup(normalizedPath, operationId);
    }
    
    // Perform operation
    const result = await this.performNewAction(normalizedPath, parameter);
    
    // Record operation
    this.recordOperation(operationId, 'new_action', {
      filePath: normalizedPath,
      parameter,
      option
    });
    
    return {
      success: true,
      operationId,
      result,
      filePath: normalizedPath
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}
```

### 3. Adding to Tool Definition

```javascript
const tools = [{
  name: "ultra_code_manager",
  description: "FileForge v3.2 - Advanced code management",
  inputSchema: {
    type: "object",
    properties: {
      action: {
        type: "string",
        enum: [
          // ... existing actions ...
          "new_action"
        ]
      },
      new_parameter: {
        type: "string",
        description: "Description of the new parameter"
      }
    }
  }
}];
```

## 🐛 Debugging

### Debug Mode

```bash
# Enable debug logging
export DEBUG=1
node src/ultra_code_manager_enhanced.cjs
```

### Logging Strategies

```javascript
function debugLog(message, data = null) {
  if (process.env.DEBUG === '1') {
    console.error(`[DEBUG] ${new Date().toISOString()} - ${message}`);
    if (data) {
      console.error(JSON.stringify(data, null, 2));
    }
  }
}

// Usage
debugLog('Processing file operation', { action, filePath, params });
```

### Error Handling Patterns

```javascript
try {
  // Risky operation
  const result = await riskyOperation();
  return { success: true, result };
} catch (error) {
  debugLog('Operation failed', { error: error.message, stack: error.stack });
  
  // Attempt recovery
  if (error.code === 'ENOENT') {
    return { success: false, error: 'File not found', recoverable: true };
  }
  
  // Critical error
  return { success: false, error: error.message, recoverable: false };
}
```

## 📊 Monitoring and Metrics

### Performance Tracking

```javascript
class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
  }
  
  startTimer(operation) {
    this.metrics.set(operation, { startTime: Date.now() });
  }
  
  endTimer(operation) {
    const metric = this.metrics.get(operation);
    if (metric) {
      metric.endTime = Date.now();
      metric.duration = metric.endTime - metric.startTime;
    }
  }
  
  getMetrics() {
    return Object.fromEntries(this.metrics);
  }
}
```

### Health Checks

```javascript
async performHealthCheck() {
  const health = {
    timestamp: new Date().toISOString(),
    assembler: fs.existsSync(this.assemblerPath),
    embeddings: await this.checkEmbeddingsHealth(),
    memory: process.memoryUsage(),
    uptime: process.uptime()
  };
  
  return health;
}
```

## 🚀 Deployment

### Production Configuration

```javascript
// production.config.js
module.exports = {
  server: {
    timeout: 30,
    maxConcurrentOperations: 10,
    enableAssembler: true,
    enableEmbeddings: true
  },
  
  performance: {
    assemblerBufferSize: 16384,
    embeddingBatchSize: 32,
    cacheMaxSize: 1000
  },
  
  security: {
    allowedPaths: ['/app/workspace', '/app/projects'],
    maxFileSize: 100 * 1024 * 1024, // 100MB
    backupRetentionDays: 7
  }
};
```

### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 py3-pip g++ make

# Copy and install dependencies
COPY package*.json ./
RUN npm ci --only=production

COPY requirements.txt ./
RUN pip3 install -r requirements.txt

# Copy source code
COPY src/ ./src/
COPY Makefile ./

# Build C++ components
RUN make

EXPOSE 3000

CMD ["node", "src/ultra_code_manager_enhanced.cjs"]
```

## 🤝 Contributing

### Code Style Guidelines

```javascript
// Use descriptive variable names
const normalizedFilePath = this.normalizePath(filePath);

// Add JSDoc comments for public methods
/**
 * Creates a new file with specified content
 * @param {string} filePath - Path to the file to create
 * @param {string} content - Content to write to the file
 * @param {boolean} overwrite - Whether to overwrite existing file
 * @returns {Promise<Object>} Operation result
 */
async createNewFile(filePath, content = '', overwrite = false) {
  // Implementation
}

// Use consistent error handling
if (!fs.existsSync(filePath)) {
  throw new Error(`File not found: ${filePath}`);
}
```

### Pull Request Process

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Write tests for new functionality
4. Ensure all tests pass: `npm test && python -m pytest`
5. Update documentation if needed
6. Commit changes: `git commit -m 'Add amazing feature'`
7. Push to branch: `git push origin feature/amazing-feature`
8. Open Pull Request

### Code Review Checklist

- [ ] Code follows style guidelines
- [ ] Tests added for new functionality
- [ ] Documentation updated
- [ ] Performance impact considered
- [ ] Security implications reviewed
- [ ] Backward compatibility maintained

---

**🎯 This guide should give you everything needed to understand and extend FileForge. Happy coding!**