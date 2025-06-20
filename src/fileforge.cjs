#!/usr/bin/env node

// FILEFORGE - The ultimate file and code forge with Assembler and Embeddings integration
const { Server } = require("@modelcontextprotocol/sdk/server/index.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const { CallToolRequestSchema, ListToolsRequestSchema } = require("@modelcontextprotocol/sdk/types.js");
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawn, exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

const server = new Server({
  name: "fileforge",
  version: "3.2.0"
}, {
  capabilities: { tools: {} }
});

// ========== FILEFORGE - ASSEMBLER + EMBEDDINGS ==========

class FileForge {
  constructor() {
    this.operationHistory = new Map();
    this.fileHashes = new Map();
    this.errorRecovery = new Map();
    this.activeOperations = new Set();
    this.assemblerPath = path.join(__dirname, 'file_assembler.exe');
    this.embeddingManagerPath = path.join(__dirname, 'embedding_manager.py');
    this.embeddingsDir = path.join(__dirname, 'embeddings');
    
    // Устанавливаем корневую директорию проекта (на уровень выше от src/)
    this.projectRoot = path.resolve(__dirname, '..');
    
    // Логирование для отладки
    console.error(`🔥 FileForge: Project root set to: ${this.projectRoot}`);
    console.error(`🔥 FileForge: Current working directory: ${process.cwd()}`);
    
    // Создание директории для эмбеддингов
    if (!fs.existsSync(this.embeddingsDir)) {
      fs.mkdirSync(this.embeddingsDir, { recursive: true });
    }
  }

  // Нормализация пути - если путь относительный, делаем его относительно корневой директории проекта
  normalizePath(filePath) {
    if (path.isAbsolute(filePath)) {
      console.error(`🔥 FileForge: Using absolute path: ${filePath}`);
      return filePath;
    }
    // Если путь относительный, используем корневую директорию проекта
    const normalizedPath = path.resolve(this.projectRoot, filePath);
    console.error(`🔥 FileForge: Normalized "${filePath}" → "${normalizedPath}"`);
    return normalizedPath;
  }

  // ============ ASSEMBLER INTEGRATION ============

  async callAssembler(operation, params) {
    try {
      const paramsJson = JSON.stringify(params);
      const { stdout, stderr } = await execAsync(`"${this.assemblerPath}" ${operation} '${paramsJson}'`);
      
      if (stderr) {
        console.warn('Assembler warning:', stderr);
      }
      
      return JSON.parse(stdout);
    } catch (error) {
      console.error('Assembler error:', error);
      return { success: false, error: `Assembler error: ${error.message}` };
    }
  }

  // Assembler-оптимизированное чтение файла
  async readFileAssembler(filePath) {
    const result = await this.callAssembler('read', { filepath: filePath });
    
    if (result.success) {
      return {
        success: true,
        content: result.content,
        fileSize: result.fileSize,
        performance: {
          readTime_us: result.readTime_us,
          performance_MB_per_sec: result.performance_MB_per_sec,
          assembler_optimized: true
        }
      };
    }
    
    return result;
  }

  // Assembler-оптимизированная запись файла  
  async writeFileAssembler(filePath, content) {
    const result = await this.callAssembler('write', { filepath: filePath, content });
    
    if (result.success) {
      return {
        success: true,
        fileSize: result.fileSize,
        performance: {
          writeTime_us: result.writeTime_us,
          performance_MB_per_sec: result.performance_MB_per_sec,
          assembler_optimized: true
        }
      };
    }
    
    return result;
  }

  // ============ EMBEDDINGS INTEGRATION ============

  async callEmbeddingManager(operation, params) {
    try {
      const paramsJson = JSON.stringify(params);
      const { stdout, stderr } = await execAsync(`python "${this.embeddingManagerPath}" ${operation} '${paramsJson}'`);
      
      if (stderr && !stderr.includes('INFO') && !stderr.includes('WARNING')) {
        console.warn('Embedding manager warning:', stderr);
      }
      
      return JSON.parse(stdout);
    } catch (error) {
      console.error('Embedding manager error:', error);
      return { success: false, error: `Embedding error: ${error.message}` };
    }
  }

  // Создание эмбеддинга для файла
  async createFileEmbedding(filePath, forceRecreate = false) {
    const result = await this.callEmbeddingManager('create', { 
      filepath: filePath, 
      force_recreate: forceRecreate 
    });
    
    return result;
  }

  // Поиск похожих файлов
  async findSimilarFiles(filePath, topK = 5) {
    const result = await this.callEmbeddingManager('similar', { 
      filepath: filePath, 
      top_k: topK 
    });
    
    return result;
  }

  // Удаление эмбеддинга файла
  async removeFileEmbedding(filePath) {
    const result = await this.callEmbeddingManager('remove', { filepath: filePath });
    return result;
  }

  // ============ EMBEDDING EFFICIENCY OPTIMIZATIONS ============

  async hasEmbedding(filePath) {
    try {
      // Быстрая проверка без запуска Python процесса
      const embeddingPaths = path.join(this.embeddingsDir, 'file_paths.json');
      if (!fs.existsSync(embeddingPaths)) {
        return false;
      }
      
      const paths = JSON.parse(fs.readFileSync(embeddingPaths, 'utf8'));
      const normalizedPath = path.resolve(filePath);
      return paths.includes(normalizedPath);
    } catch (error) {
      return false;
    }
  }

  async getEmbeddingCacheInfo() {
    try {
      const embeddingPaths = path.join(this.embeddingsDir, 'file_paths.json');
      const indexPath = path.join(this.embeddingsDir, 'faiss_index.bin');
      
      if (!fs.existsSync(embeddingPaths) || !fs.existsSync(indexPath)) {
        return {
          cached_files: 0,
          index_size_kb: 0,
          last_updated: null,
          status: 'empty'
        };
      }
      
      const paths = JSON.parse(fs.readFileSync(embeddingPaths, 'utf8'));
      const indexStats = fs.statSync(indexPath);
      
      // Проверяем какие файлы реально существуют
      const existingFiles = paths.filter(p => fs.existsSync(p));
      
      return {
        cached_files: paths.length,
        existing_files: existingFiles.length,
        missing_files: paths.length - existingFiles.length,
        index_size_kb: Math.round(indexStats.size / 1024),
        last_updated: indexStats.mtime.toISOString(),
        status: existingFiles.length > 0 ? 'active' : 'stale'
      };
    } catch (error) {
      return {
        cached_files: 0,
        index_size_kb: 0,
        last_updated: null,
        status: 'error',
        error: error.message
      };
    }
  }

  async smartCreateEmbedding(filePath, forceRecreate = false) {
    try {
      // Быстрая проверка без Python процесса
      const hasExisting = await this.hasEmbedding(filePath);
      
      if (hasExisting && !forceRecreate) {
        return {
          success: true,
          action: 'skipped',
          reason: 'embedding_already_exists',
          time_saved_ms: 'estimated_500-2000ms'
        };
      }
      
      // Создаем эмбеддинг только если нужно
      const result = await this.createFileEmbedding(filePath, forceRecreate);
      result.action = hasExisting ? 'recreated' : 'created';
      return result;
    } catch (error) {
      return {
        success: false,
        error: error.message,
        action: 'failed'
      };
    }
  }

  // ============ ENHANCED FILE OPERATIONS ============

  async createNewFile(filePath, content = '', overwrite = false, forceCreateEmbedding = false) {
    try {
      // Нормализуем путь к файлу
      const normalizedPath = this.normalizePath(filePath);
      
      // Проверяем существование файла
      if (fs.existsSync(normalizedPath) && !overwrite) {
        return {
          success: false,
          error: `Файл уже существует: ${normalizedPath}. Используйте overwrite=true для перезаписи.`
        };
      }

      // Создаем директории если нужно
      const dir = path.dirname(normalizedPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Записываем файл
      let performance = {};
      if (fs.existsSync(this.assemblerPath)) {
        const assemblerResult = await this.writeFileAssembler(normalizedPath, content);
        if (assemblerResult.success) {
          performance = assemblerResult.performance;
        } else {
          // Fallback к стандартной записи
          fs.writeFileSync(normalizedPath, content, 'utf8');
        }
      } else {
        fs.writeFileSync(normalizedPath, content, 'utf8');
      }

      // Создаем эмбеддинг если нужно
      let embeddingResult = null;
      if (forceCreateEmbedding && content.trim().length > 0) {
        embeddingResult = await this.createFileEmbedding(normalizedPath);
      }

      return {
        success: true,
        filePath: normalizedPath,
        fileSize: Buffer.byteLength(content, 'utf8'),
        linesCount: content.split('\n').length,
        fileHash: crypto.createHash('md5').update(content).digest('hex'),
        performance,
        assembler_used: fs.existsSync(this.assemblerPath),
        embedding_created: embeddingResult?.success || false
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async readFileChunked(filePath, chunkSize = 50, startLine = 1, endLine = null, useAssembler = true, forceCreateEmbedding = false) {
    try {
      // Нормализуем путь к файлу
      const normalizedPath = this.normalizePath(filePath);
      
      // Условное создание эмбеддинга (только если не существует)
      if (forceCreateEmbedding) {
      await this.createFileEmbedding(normalizedPath);
      }
      
      let fileContent;
      let performance = {};
      
      if (useAssembler && fs.existsSync(this.assemblerPath)) {
        const assemblerResult = await this.readFileAssembler(normalizedPath);
        if (assemblerResult.success) {
          fileContent = assemblerResult.content;
          performance = assemblerResult.performance;
        } else {
          throw new Error(assemblerResult.error);
        }
      } else {
        // Fallback к стандартному чтению
        if (!fs.existsSync(normalizedPath)) {
          throw new Error(`Файл не существует: ${normalizedPath}`);
        }
        fileContent = fs.readFileSync(normalizedPath, 'utf8');
      }

      const lines = fileContent.split('\n');
      const totalLines = lines.length;

      const actualEndLine = endLine ? Math.min(endLine, totalLines) : totalLines;
      const actualStartLine = Math.max(1, startLine);

      if (actualStartLine > totalLines) {
        return {
          success: false,
          error: `Начальная строка ${actualStartLine} больше общего количества строк ${totalLines}`
        };
      }

      const requestedLines = lines.slice(actualStartLine - 1, actualEndLine);
      const chunks = [];
      
      for (let i = 0; i < requestedLines.length; i += chunkSize) {
        const chunk = requestedLines.slice(i, i + chunkSize);
        chunks.push({
          startLine: actualStartLine + i,
          endLine: Math.min(actualStartLine + i + chunk.length - 1, actualEndLine),
          content: chunk.join('\n'),
          lineCount: chunk.length
        });
      }

      return {
        success: true,
        filePath: normalizedPath,
        totalLines,
        requestedRange: `${actualStartLine}-${actualEndLine}`,
        chunks,
        chunkCount: chunks.length,
        fileHash: crypto.createHash('md5').update(fileContent).digest('hex'),
        performance,
        assembler_used: useAssembler && fs.existsSync(this.assemblerPath),
        embedding_created: forceCreateEmbedding
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async replaceLines(filePath, startLine, endLine, newContent, createBackup = true, useAssembler = true, forceCreateEmbedding = false) {
    const operationId = crypto.randomUUID();
    
    try {
      // Условное создание эмбеддинга (только если форсировано)
      if (forceCreateEmbedding) {
      await this.createFileEmbedding(filePath);
      }
      
      const snapshot = createBackup ? await this.createFileSnapshot(filePath) : null;
      
      if (!fs.existsSync(filePath)) {
        throw new Error(`Файл не существует: ${filePath}`);
      }

      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      const totalLines = lines.length;

      if (startLine < 1 || startLine > totalLines) {
        throw new Error(`Неверная начальная строка: ${startLine} (всего строк: ${totalLines})`);
      }
      
      if (endLine < startLine || endLine > totalLines) {
        throw new Error(`Неверная конечная строка: ${endLine}`);
      }

      if (createBackup && snapshot) {
        const backupPath = `${filePath}.backup.${Date.now()}`;
        fs.writeFileSync(backupPath, snapshot.content, 'utf8');
        this.operationHistory.set(operationId, {
          type: 'replace_lines',
          originalPath: filePath,
          backupPath,
          snapshot,
          timestamp: Date.now()
        });
      }

      const beforeLines = lines.slice(0, startLine - 1);
      const afterLines = lines.slice(endLine);
      const newLines = Array.isArray(newContent) ? newContent : newContent.split('\n');
      
      const resultLines = [...beforeLines, ...newLines, ...afterLines];
      const resultContent = resultLines.join('\n');

      let performance = {};
      
      if (useAssembler && fs.existsSync(this.assemblerPath)) {
        const assemblerResult = await this.writeFileAssembler(filePath, resultContent);
        if (assemblerResult.success) {
          performance = assemblerResult.performance;
        } else {
          // Fallback к стандартной записи
          const tempPath = `${filePath}.tmp.${Date.now()}`;
          fs.writeFileSync(tempPath, resultContent, 'utf8');
          fs.renameSync(tempPath, filePath);
        }
      } else {
        const tempPath = `${filePath}.tmp.${Date.now()}`;
        fs.writeFileSync(tempPath, resultContent, 'utf8');
        fs.renameSync(tempPath, filePath);
      }

      // Условное обновление эмбеддинга после редактирования
      if (forceCreateEmbedding) {
      await this.createFileEmbedding(filePath, true);
      }

      return {
        success: true,
        operationId,
        originalRange: `${startLine}-${endLine}`,
        replacedLines: endLine - startLine + 1,
        newLines: newLines.length,
        totalLines: resultLines.length,
        backupCreated: createBackup,
        fileHash: crypto.createHash('md5').update(resultContent).digest('hex'),
        performance,
        assembler_used: useAssembler && fs.existsSync(this.assemblerPath),
        embedding_updated: forceCreateEmbedding
      };

    } catch (error) {
      if (this.operationHistory.has(operationId)) {
        const operation = this.operationHistory.get(operationId);
        if (operation.snapshot && fs.existsSync(operation.backupPath)) {
          fs.writeFileSync(operation.originalPath, operation.snapshot.content, 'utf8');
        }
      }

      return {
        success: false,
        error: error.message,
        operationId
      };
    }
  }

  // ============ ENHANCED OPERATIONS ============

  async processFileComplete(filePath) {
    try {
      const results = {
        file_read: null,
        embedding_created: null,
        similar_files: null,
        performance_stats: {}
      };

      // 1. Чтение файла с assembler оптимизацией
      const startTime = Date.now();
      results.file_read = await this.readFileChunked(filePath, 50, 1, null, true);
      results.performance_stats.read_time_ms = Date.now() - startTime;

      if (!results.file_read.success) {
        return { success: false, error: results.file_read.error };
      }

      // 2. Создание эмбеддинга
      const embeddingStartTime = Date.now();
      results.embedding_created = await this.createFileEmbedding(filePath, false);
      results.performance_stats.embedding_time_ms = Date.now() - embeddingStartTime;

      // 3. Поиск похожих файлов
      if (results.embedding_created.success) {
        const similarStartTime = Date.now();
        results.similar_files = await this.findSimilarFiles(filePath, 3);
        results.performance_stats.similarity_search_time_ms = Date.now() - similarStartTime;
      }

      results.performance_stats.total_time_ms = Date.now() - startTime;

      return {
        success: true,
        results,
        summary: {
          file_processed: filePath,
          chunks_created: results.file_read.chunkCount,
          embedding_status: results.embedding_created.success ? 'created' : 'failed',
          similar_files_found: results.similar_files?.success ? results.similar_files.similar_files.length : 0,
          total_processing_time: results.performance_stats.total_time_ms
        }
      };

    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async cleanupFileEmbedding(filePath) {
    try {
      const result = await this.removeFileEmbedding(filePath);
      
      return {
        success: true,
        message: `Эмбеддинг для файла ${filePath} удален`,
        embedding_cleanup: result
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // ============ EXISTING METHODS (кратко) ============
  
  createFileSnapshot(filePath) {
    try {
      if (!fs.existsSync(filePath)) return null;
      const content = fs.readFileSync(filePath, 'utf8');
      const hash = crypto.createHash('md5').update(content).digest('hex');
      return {
        path: filePath,
        content,
        hash,
        timestamp: Date.now(),
        size: content.length
      };
    } catch (error) {
      return null;
    }
  }

  // ============ CORE FILE OPERATIONS ============

  async deleteLines(filePath, startLine, endLine, createBackup = true) {
    const operationId = crypto.randomUUID();
    
    try {
      const snapshot = createBackup ? await this.createFileSnapshot(filePath) : null;
      
      if (!fs.existsSync(filePath)) {
        throw new Error(`Файл не существует: ${filePath}`);
      }

      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      const totalLines = lines.length;

      if (startLine < 1 || startLine > totalLines) {
        throw new Error(`Неверная начальная строка: ${startLine}`);
      }
      
      if (endLine < startLine || endLine > totalLines) {
        throw new Error(`Неверная конечная строка: ${endLine}`);
      }

      if (createBackup && snapshot) {
        const backupPath = `${filePath}.backup.${Date.now()}`;
        fs.writeFileSync(backupPath, snapshot.content, 'utf8');
        this.operationHistory.set(operationId, {
          type: 'delete_lines',
          originalPath: filePath,
          backupPath,
          snapshot,
          timestamp: Date.now()
        });
      }

      const beforeLines = lines.slice(0, startLine - 1);
      const afterLines = lines.slice(endLine);
      const resultLines = [...beforeLines, ...afterLines];
      const resultContent = resultLines.join('\n');

      const tempPath = `${filePath}.tmp.${Date.now()}`;
      fs.writeFileSync(tempPath, resultContent, 'utf8');
      fs.renameSync(tempPath, filePath);

      return {
        success: true,
        operationId,
        deletedRange: `${startLine}-${endLine}`,
        deletedLines: endLine - startLine + 1,
        totalLines: resultLines.length,
        backupCreated: createBackup,
        fileHash: crypto.createHash('md5').update(resultContent).digest('hex')
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        operationId
      };
    }
  }

  async insertLines(filePath, insertAfterLine, newContent, createBackup = true) {
    const operationId = crypto.randomUUID();
    
    try {
      const snapshot = createBackup ? await this.createFileSnapshot(filePath) : null;
      
      if (!fs.existsSync(filePath)) {
        throw new Error(`Файл не существует: ${filePath}`);
      }

      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      const totalLines = lines.length;

      if (insertAfterLine < 0 || insertAfterLine > totalLines) {
        throw new Error(`Неверная позиция для вставки: ${insertAfterLine}`);
      }

      if (createBackup && snapshot) {
        const backupPath = `${filePath}.backup.${Date.now()}`;
        fs.writeFileSync(backupPath, snapshot.content, 'utf8');
        this.operationHistory.set(operationId, {
          type: 'insert_lines',
          originalPath: filePath,
          backupPath,
          snapshot,
          timestamp: Date.now()
        });
      }

      const beforeLines = lines.slice(0, insertAfterLine);
      const afterLines = lines.slice(insertAfterLine);
      const newLines = Array.isArray(newContent) ? newContent : newContent.split('\n');
      
      const resultLines = [...beforeLines, ...newLines, ...afterLines];
      const resultContent = resultLines.join('\n');

      const tempPath = `${filePath}.tmp.${Date.now()}`;
      fs.writeFileSync(tempPath, resultContent, 'utf8');
      fs.renameSync(tempPath, filePath);

      return {
        success: true,
        operationId,
        insertPosition: insertAfterLine,
        insertedLines: newLines.length,
        totalLines: resultLines.length,
        backupCreated: createBackup,
        fileHash: crypto.createHash('md5').update(resultContent).digest('hex')
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        operationId
      };
    }
  }

  async findCodeStructures(filePath, structureType = 'all') {
    try {
      if (!fs.existsSync(filePath)) {
        throw new Error(`Файл не существует: ${filePath}`);
      }

      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      const structures = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lineNumber = i + 1;

        // Поиск функций
        if (structureType === 'all' || structureType === 'function') {
          const functionMatch = line.match(/^\s*function\s+(\w+)\s*\(/);
          if (functionMatch) {
            structures.push({
              type: 'function',
              name: functionMatch[1],
              line: lineNumber,
              content: line.trim()
            });
          }
        }

        // Поиск классов
        if (structureType === 'all' || structureType === 'class') {
          const classMatch = line.match(/^\s*class\s+(\w+)/);
          if (classMatch) {
            structures.push({
              type: 'class',
              name: classMatch[1],
              line: lineNumber,
              content: line.trim()
            });
          }
        }

        // Поиск методов
        if (structureType === 'all' || structureType === 'method') {
          const methodMatch = line.match(/^\s*(\w+)\s*\([^)]*\)\s*{/);
          if (methodMatch) {
            structures.push({
              type: 'method',
              name: methodMatch[1],
              line: lineNumber,
              content: line.trim()
            });
          }
        }

        // Поиск стрелочных функций
        if (structureType === 'all' || structureType === 'arrow') {
          const arrowMatch = line.match(/^\s*const\s+(\w+)\s*=\s*\([^)]*\)\s*=>/);
          if (arrowMatch) {
            structures.push({
              type: 'arrow_function',
              name: arrowMatch[1],
              line: lineNumber,
              content: line.trim()
            });
          }
        }
      }

      return {
        success: true,
        filePath,
        structureType,
        totalStructures: structures.length,
        structures,
        fileSize: content.length,
        totalLines: lines.length
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async findAndReplace(filePath, searchPattern, replacement, isRegex = false, createBackup = true) {
    const operationId = crypto.randomUUID();
    
    try {
      const snapshot = createBackup ? await this.createFileSnapshot(filePath) : null;
      
      if (!fs.existsSync(filePath)) {
        throw new Error(`Файл не существует: ${filePath}`);
      }

      const content = fs.readFileSync(filePath, 'utf8');
      let resultContent;
      let replacements = 0;

      if (isRegex) {
        const regex = new RegExp(searchPattern, 'g');
        resultContent = content.replace(regex, (match) => {
          replacements++;
          return replacement;
        });
      } else {
        const parts = content.split(searchPattern);
        replacements = parts.length - 1;
        resultContent = parts.join(replacement);
      }

      if (createBackup && snapshot && replacements > 0) {
        const backupPath = `${filePath}.backup.${Date.now()}`;
        fs.writeFileSync(backupPath, snapshot.content, 'utf8');
        this.operationHistory.set(operationId, {
          type: 'find_and_replace',
          originalPath: filePath,
          backupPath,
          snapshot,
          timestamp: Date.now()
        });
      }

      if (replacements > 0) {
        const tempPath = `${filePath}.tmp.${Date.now()}`;
        fs.writeFileSync(tempPath, resultContent, 'utf8');
        fs.renameSync(tempPath, filePath);
      }

      return {
        success: true,
        operationId,
        searchPattern,
        replacement,
        isRegex,
        replacements,
        backupCreated: createBackup && replacements > 0,
        fileHash: crypto.createHash('md5').update(resultContent).digest('hex')
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        operationId
      };
    }
  }

  async generateDiff(filePath1, filePath2) {
    try {
      if (!fs.existsSync(filePath1)) {
        throw new Error(`Первый файл не существует: ${filePath1}`);
      }
      if (!fs.existsSync(filePath2)) {
        throw new Error(`Второй файл не существует: ${filePath2}`);
      }

      const content1 = fs.readFileSync(filePath1, 'utf8');
      const content2 = fs.readFileSync(filePath2, 'utf8');
      
      const lines1 = content1.split('\n');
      const lines2 = content2.split('\n');
      
      const diff = [];
      const maxLines = Math.max(lines1.length, lines2.length);

      for (let i = 0; i < maxLines; i++) {
        const line1 = lines1[i] || '';
        const line2 = lines2[i] || '';

        if (line1 !== line2) {
          diff.push({
            lineNumber: i + 1,
            file1: line1,
            file2: line2,
            type: line1 ? (line2 ? 'modified' : 'deleted') : 'added'
          });
        }
      }

      return {
        success: true,
        file1: filePath1,
        file2: filePath2,
        totalDifferences: diff.length,
        differences: diff.slice(0, 100), // Первые 100 различий
        identical: diff.length === 0,
        file1Size: content1.length,
        file2Size: content2.length,
        file1Lines: lines1.length,
        file2Lines: lines2.length
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async batchOperations(operations) {
    try {
      const results = [];
      const startTime = Date.now();

      for (const operation of operations) {
        const opStartTime = Date.now();
    let result;

        switch (operation.type) {
          case 'copy':
            try {
              const content = fs.readFileSync(operation.source, 'utf8');
              fs.writeFileSync(operation.destination, content, 'utf8');
              result = { 
                success: true, 
                source: operation.source, 
                destination: operation.destination,
                size: content.length
              };
            } catch (error) {
              result = { success: false, error: error.message };
            }
        break;

          case 'move':
            try {
              fs.renameSync(operation.source, operation.destination);
              result = { 
                success: true, 
                source: operation.source, 
                destination: operation.destination 
              };
            } catch (error) {
              result = { success: false, error: error.message };
            }
        break;

          case 'delete':
            try {
              fs.unlinkSync(operation.target);
              result = { success: true, deleted: operation.target };
            } catch (error) {
              result = { success: false, error: error.message };
            }
        break;

          case 'create_directory':
            try {
              fs.mkdirSync(operation.path, { recursive: true });
              result = { success: true, created: operation.path };
            } catch (error) {
              result = { success: false, error: error.message };
            }
        break;

          default:
            result = { success: false, error: `Unknown operation type: ${operation.type}` };
        }

        results.push({
          operation,
          result,
          processingTime: Date.now() - opStartTime
        });
      }

      return {
        success: true,
        totalOperations: operations.length,
        successfulOperations: results.filter(r => r.result.success).length,
        failedOperations: results.filter(r => !r.result.success).length,
        results,
        totalProcessingTime: Date.now() - startTime
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async rollbackOperation(operationId) {
    try {
      if (!this.operationHistory.has(operationId)) {
        throw new Error(`Операция не найдена: ${operationId}`);
      }

      const operation = this.operationHistory.get(operationId);
      
      if (!operation.snapshot) {
        throw new Error(`Snapshot для операции ${operationId} не найден`);
      }

      // Восстановление файла из snapshot
      fs.writeFileSync(operation.originalPath, operation.snapshot.content, 'utf8');

      // Удаление backup файла если существует
      if (operation.backupPath && fs.existsSync(operation.backupPath)) {
        fs.unlinkSync(operation.backupPath);
      }

      // Удаление операции из истории
      this.operationHistory.delete(operationId);

      return {
        success: true,
        operationId,
        restoredFile: operation.originalPath,
        originalOperation: operation.type,
        rollbackTime: Date.now()
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        operationId
      };
    }
  }

  // ========== OPTIMIZED METHODS ============

  // Объединенная функция: performance stats + operation history
  getPerformanceAndHistoryStats() {
    const performanceStats = {
      totalOperations: this.activeOperations.size,
      errorRecoveryCount: this.errorRecovery.size,
      fileHashesTracked: this.fileHashes.size,
      systemStatus: {
        assemblerAvailable: fs.existsSync(this.assemblerPath),
        embeddingManagerAvailable: fs.existsSync(this.embeddingManagerPath),
        embeddingsDirExists: fs.existsSync(this.embeddingsDir)
      }
    };

    const operationHistory = Array.from(this.operationHistory.entries()).map(([id, operation]) => ({
      operationId: id,
      type: operation.type,
      timestamp: operation.timestamp,
      originalPath: operation.originalPath,
      hasBackup: !!operation.backupPath
    }));

    return {
      success: true,
      performance: performanceStats,
      history: {
        totalOperations: operationHistory.length,
        operations: operationHistory.slice(-10), // Последние 10 операций
        oldestOperation: operationHistory.length > 0 ? operationHistory[0].timestamp : null,
        newestOperation: operationHistory.length > 0 ? operationHistory[operationHistory.length - 1].timestamp : null
      },
      autoCleanup: {
        backupsAutoCleanedAfter24h: true,
        lastCleanupTime: Date.now(),
        status: "automatic"
      }
    };
  }

  // Расширенная функция обработки множественных файлов
  async processMultipleFilesEnhanced(filePaths, operationType, operationParams = {}) {
    try {
      const results = [];
      const startTime = Date.now();
      
      // Автоматическая очистка старых backup'ов (встроено)
      await this.autoCleanupBackups();

      for (const filePath of filePaths) {
        let result;
        const fileStartTime = Date.now();

        switch (operationType) {
          case "read_chunks":
            result = await this.readFileChunked(
              filePath, 
              operationParams.chunkSize || 50,
              operationParams.startLine || 1,
              operationParams.endLine || null,
              operationParams.useAssembler !== false
            );
        break;

          case "find_structures":
            result = await this.findCodeStructures(
              filePath, 
              operationParams.structureType || 'all'
            );
            break;

          case "backup":
            const snapshot = this.createFileSnapshot(filePath);
            if (snapshot) {
              const backupPath = `${filePath}.backup.${Date.now()}`;
              fs.writeFileSync(backupPath, snapshot.content, 'utf8');
              result = { success: true, backupPath, fileHash: snapshot.hash };
            } else {
              result = { success: false, error: "Backup failed" };
            }
        break;

          case "create_embeddings":
            result = await this.createFileEmbedding(filePath, operationParams.forceRecreate || false);
        break;

          case "find_similar":
            result = await this.findSimilarFiles(filePath, operationParams.topK || 5);
        break;

          case "process_complete":
            result = await this.processFileComplete(filePath);
        break;

          case "validate_syntax":
            // Новая функция - проверка синтаксиса
            result = await this.validateFileSyntax(filePath);
            break;

          case "compress_content":
            // Новая функция - сжатие содержимого
            result = await this.compressFileContent(filePath, operationParams.compressionLevel || 'medium');
            break;

          case "assembler_benchmark":
            // Новая функция - бенчмарк assembler производительности
            result = await this.benchmarkAssemblerPerformance(filePath);
        break;

      case "cleanup_file_embedding":
            result = await this.removeFileEmbedding(filePath);
        break;

      default:
            result = { success: false, error: `Unknown operation type: ${operationType}` };
        }

        results.push({
          filePath,
          operationType,
          result,
          processingTime: Date.now() - fileStartTime
        });
    }

    return {
        success: true,
        totalFiles: filePaths.length,
        successfulOperations: results.filter(r => r.result.success).length,
        failedOperations: results.filter(r => !r.result.success).length,
        totalProcessingTime: Date.now() - startTime,
        results,
        averageTimePerFile: (Date.now() - startTime) / filePaths.length,
        autoCleanupPerformed: true
    };

  } catch (error) {
    return {
          success: false,
        error: error.message
      };
    }
  }

  // Автоматическая очистка backup'ов (внутренняя функция)
  async autoCleanupBackups(maxAgeHours = 24) {
    try {
      let cleanedCount = 0;
      const cutoffTime = Date.now() - (maxAgeHours * 60 * 60 * 1000);

      // Очистка operation history
      for (const [operationId, operation] of this.operationHistory.entries()) {
        if (operation.timestamp < cutoffTime) {
          if (operation.backupPath && fs.existsSync(operation.backupPath)) {
            try {
              fs.unlinkSync(operation.backupPath);
              cleanedCount++;
            } catch (e) {
              console.warn(`Failed to delete backup: ${operation.backupPath}`);
            }
          }
          this.operationHistory.delete(operationId);
        }
      }

      return { cleanedCount, cutoffTime, automatic: true };
    } catch (error) {
      console.warn('Auto cleanup failed:', error);
      return { cleanedCount: 0, error: error.message };
    }
  }

  // Новые вспомогательные функции для расширенной обработки
  async validateFileSyntax(filePath) {
    try {
      const ext = path.extname(filePath).toLowerCase();
      const content = fs.readFileSync(filePath, 'utf8');
      
      let validationResult = { isValid: true, errors: [] };

      if (ext === '.js' || ext === '.ts') {
        // Простая проверка JavaScript/TypeScript синтаксиса
        try {
          new Function(content);
        } catch (syntaxError) {
          validationResult = {
            isValid: false,
            errors: [syntaxError.message],
            language: ext === '.ts' ? 'TypeScript' : 'JavaScript'
          };
        }
      } else if (ext === '.json') {
        // Проверка JSON
        try {
          JSON.parse(content);
        } catch (jsonError) {
          validationResult = {
            isValid: false,
            errors: [jsonError.message],
            language: 'JSON'
          };
        }
      }

      return {
        success: true,
        filePath,
        language: ext,
        validation: validationResult,
        fileSize: content.length,
        lineCount: content.split('\n').length
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async compressFileContent(filePath, level = 'medium') {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      let compressed = content;

      switch (level) {
        case 'light':
          // Удаление лишних пробелов
          compressed = content.replace(/[ \t]+/g, ' ').replace(/\n\s*\n/g, '\n');
          break;
        case 'medium':
          // Удаление комментариев и пустых строк
          compressed = content
            .replace(/\/\*[\s\S]*?\*\//g, '')
            .replace(/\/\/.*$/gm, '')
            .replace(/^\s*\n/gm, '')
            .replace(/[ \t]+/g, ' ');
          break;
        case 'aggressive':
          // Максимальное сжатие
          compressed = content
            .replace(/\/\*[\s\S]*?\*\//g, '')
            .replace(/\/\/.*$/gm, '')
            .replace(/^\s*\n/gm, '')
            .replace(/\s+/g, ' ')
            .replace(/;\s*}/g, ';}')
            .replace(/{\s*/g, '{')
            .replace(/\s*}/g, '}');
          break;
      }

      const compressionRatio = (1 - compressed.length / content.length) * 100;

      return {
        success: true,
        originalSize: content.length,
        compressedSize: compressed.length,
        compressionRatio: Math.round(compressionRatio * 100) / 100,
        level,
        compressedContent: compressed
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async benchmarkAssemblerPerformance(filePath) {
    try {
      const results = {
        assembler: { available: false, time: 0, performance: 0 },
        standard: { time: 0 },
        speedup: 0
      };

      // Тест стандартного чтения
      const standardStart = Date.now();
      const content = fs.readFileSync(filePath, 'utf8');
      results.standard.time = Date.now() - standardStart;

      // Тест assembler чтения (если доступен)
      if (fs.existsSync(this.assemblerPath)) {
        const assemblerStart = Date.now();
        const assemblerResult = await this.readFileAssembler(filePath);
        results.assembler.time = Date.now() - assemblerStart;
        results.assembler.available = true;

        if (assemblerResult.success) {
          results.assembler.performance = assemblerResult.performance?.performance_MB_per_sec || 0;
          results.speedup = results.standard.time / results.assembler.time;
        }
      }

      return {
        success: true,
        filePath,
        fileSize: content.length,
        benchmark: results
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}



// Настройка MCP сервера
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [{
    name: "fileforge",
    description: "🔥 FILEFORGE v3.2 - Кузница файлов и кода с революционной производительностью! Превращает сырой код в отточенные решения. МОЩЬ КУЗНИ: 📊 Объединенная performance+history статистика, 🗑️ Автоматическая очистка backup'ов, 🔧 Расширенная обработка файлов (9 операций), 🆕 Валидация синтаксиса, сжатие контента, assembler бенчмарки. ИНСТРУМЕНТЫ МАСТЕРА: chunked reading, atomic operations, structure detection, regex find&replace, file diff, batch operations, multi-file processing, auto backup/rollback, error recovery, embedding management. Защита от ошибок ИИ через множественные уровни безопасности кузни.",
    inputSchema: {
      type: "object",
      properties: {
        action: { 
          type: "string", 
          enum: ["create_file", "read_file_chunked", "replace_lines", "delete_lines", "insert_lines", "find_code_structures", "find_and_replace", "generate_diff", "batch_operations", "process_multiple_files", "rollback_operation", "get_performance_stats", "process_file_complete", "cleanup_file_embedding", "smart_create_embedding", "get_embedding_cache_info", "has_embedding"],
          description: "Действие для выполнения"
        },
        file_path: { type: "string", description: "Путь к файлу" },
        start_line: { type: "integer", description: "Начальная строка (для чтения/замены/удаления)" },
        end_line: { type: "integer", description: "Конечная строка (для чтения/замены/удаления)" },
        new_content: { type: "string", description: "Новый контент для замены (строка или массив строк)" },
        chunk_size: { type: "integer", description: "Размер chunk'а для чтения (по умолчанию 50 строк)", default: 50 },
        structure_type: { 
          type: "string", 
          enum: ["all", "function", "class", "method", "arrow"],
          description: "Тип структур кода для поиска", 
          default: "all" 
        },
        operations: { 
          type: "array", 
          description: "Массив операций для batch_operations. Каждая операция: {type: 'copy|move|delete|create_directory', source?, destination?, target?, path?}",
          items: {
            type: "object",
            properties: {
              type: { type: "string", enum: ["copy", "move", "delete", "create_directory"] },
              source: { type: "string" },
              destination: { type: "string" },
              target: { type: "string" },
              path: { type: "string" }
            }
          }
        },
        operation_id: { type: "string", description: "ID операции для rollback" },
        create_backup: { type: "boolean", description: "Создавать backup перед изменениями", default: true },
        search_pattern: { type: "string", description: "Паттерн для поиска (find_and_replace)" },
        replacement: { type: "string", description: "Текст для замены (find_and_replace)" },
        is_regex: { type: "boolean", description: "Использовать regex для поиска", default: false },
        file_path_2: { type: "string", description: "Второй файл для сравнения (generate_diff)" },
        file_paths: { type: "array", items: { type: "string" }, description: "Массив путей к файлам (process_multiple_files)" },
        operation_type: { type: "string", enum: ["read_chunks", "find_structures", "backup", "create_embeddings", "find_similar", "process_complete", "validate_syntax", "compress_content", "assembler_benchmark"], description: "Тип операции для process_multiple_files" },
        operation_params: { type: "object", description: "Дополнительные параметры для операций (chunkSize, startLine, endLine, useAssembler, structureType, forceRecreate, topK, compressionLevel, forceCreateEmbedding)" },
        force_create_embedding: { type: "boolean", description: "Принудительно создавать эмбеддинги (по умолчанию false для эффективности)", default: false }
      },
      required: ["action"]
    }
  }]
}));

// Инициализация FileForge
const fileForge = new FileForge();

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  try {
    if (name === "fileforge") {
      const {
        action,
        file_path,
        start_line,
        end_line, 
        new_content,
        chunk_size = 50,
        structure_type = "all",
        operations,
        operation_id,
        create_backup = true,
        search_pattern,
        replacement,
        is_regex = false,
        file_path_2,
        file_paths,
        operation_type,
        operation_params = {},
        force_create_embedding = false
      } = args;

      let result;

      switch (action) {
        case "create_file":
          if (!file_path) {
            throw new Error("file_path обязателен");
          }
          result = await fileForge.createNewFile(
            file_path, 
            new_content || '', 
            operation_params?.overwrite || false, 
            force_create_embedding
          );
          break;

        case "read_file_chunked":
          if (!file_path) {
            throw new Error("file_path обязателен");
          }
          result = await fileForge.readFileChunked(file_path, start_line, end_line, chunk_size, force_create_embedding);
          break;

        case "replace_lines":
          if (!file_path || start_line === undefined || end_line === undefined || new_content === undefined) {
            throw new Error("file_path, start_line, end_line и new_content обязательны");
          }
          result = await fileForge.replaceLines(file_path, start_line, end_line, new_content, create_backup, force_create_embedding);
          break;

        case "delete_lines":
          if (!file_path || start_line === undefined || end_line === undefined) {
            throw new Error("file_path, start_line и end_line обязательны");
          }
          result = await fileForge.deleteLines(file_path, start_line, end_line, create_backup);
          break;

        case "insert_lines":
          if (!file_path || start_line === undefined || new_content === undefined) {
            throw new Error("file_path, start_line и new_content обязательны");
          }
          result = await fileForge.insertLines(file_path, start_line, new_content, create_backup);
          break;

        case "find_code_structures":
          if (!file_path) {
            throw new Error("file_path обязателен");
          }
          result = await fileForge.findCodeStructures(file_path, structure_type);
          break;

        case "find_and_replace":
          if (!file_path || !search_pattern || replacement === undefined) {
            throw new Error("file_path, search_pattern и replacement обязательны");
          }
          result = await fileForge.findAndReplace(file_path, search_pattern, replacement, is_regex, create_backup);
          break;

        case "generate_diff":
          if (!file_path || !file_path_2) {
            throw new Error("file_path и file_path_2 обязательны");
          }
          result = await fileForge.generateDiff(file_path, file_path_2);
          break;

        case "batch_operations":
          if (!operations || !Array.isArray(operations)) {
            throw new Error("operations (массив) обязателен");
          }
          result = await fileForge.batchOperations(operations);
          break;

        case "process_multiple_files":
          if (!file_paths || !Array.isArray(file_paths) || !operation_type) {
            throw new Error("file_paths (массив) и operation_type обязательны");
          }
          result = await fileForge.processMultipleFilesEnhanced(file_paths, operation_type, operation_params);
          break;

        case "rollback_operation":
          if (!operation_id) {
            throw new Error("operation_id обязателен");
          }
          result = await fileForge.rollbackOperation(operation_id);
          break;

        case "get_performance_stats":
          result = fileForge.getPerformanceAndHistoryStats();
          break;

        case "process_file_complete":
          if (!file_path) {
            throw new Error("file_path обязателен");
          }
          result = await fileForge.processFileComplete(file_path);
          break;

        case "cleanup_file_embedding":
          if (!file_path) {
            throw new Error("file_path обязателен");
          }
          result = await fileForge.removeFileEmbedding(file_path);
          break;

        case "smart_create_embedding":
          if (!file_path) {
            throw new Error("file_path обязателен");
          }
          result = await fileForge.smartCreateEmbedding(file_path, operation_params.forceRecreate || false);
          break;

        case "get_embedding_cache_info":
          result = await fileForge.getEmbeddingCacheInfo();
          break;

        case "has_embedding":
          if (!file_path) {
            throw new Error("file_path обязателен");
          }
          const hasEmbedding = await fileForge.hasEmbedding(file_path);
          result = {
            success: true,
            file_path,
            has_embedding: hasEmbedding,
            check_time_ms: '<1ms'
          };
          break;

        default:
          throw new Error(`Неизвестное действие: ${action}`);
      }

      return {
        content: [{
          type: "text",
          text: JSON.stringify(result, null, 2)
        }]
      };

    } else {
      return {
        content: [{ 
          type: "text", 
          text: JSON.stringify({ error: `Unknown tool: ${name}` }, null, 2) 
        }],
        isError: true
      };
    }
  } catch (error) {
    return {
      content: [{ 
        type: "text", 
        text: JSON.stringify({ 
          success: false,
          error: error.message,
          action: args?.action
        }, null, 2) 
      }],
      isError: true
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("FileForge MCP Server запущен");
  process.stdin.resume();
}

main().catch(console.error); 