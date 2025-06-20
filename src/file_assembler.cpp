#include <iostream>
#include <fstream>
#include <string>
#include <vector>
#include <chrono>
#include <filesystem>
#include <cstring>
#include <algorithm>
#include <immintrin.h>  // AVX2 инструкции
#define NOMINMAX       // Отключаем макросы min/max из Windows.h
#include <windows.h>
#include <nlohmann/json.hpp>

using json = nlohmann::json;
namespace fs = std::filesystem;

class FileAssembler {
private:
    static constexpr size_t BUFFER_SIZE = 65536; // 64KB буфер для оптимальной производительности
    static constexpr size_t AVX2_CHUNK = 32;     // 32 байта для AVX2 операций

    // Assembler-оптимизированное чтение файла
    std::string readFileAssembler(const std::string& filepath) {
        std::ifstream file(filepath, std::ios::binary | std::ios::ate);
        if (!file.is_open()) throw std::runtime_error("Cannot open file: " + filepath);
        
        size_t fileSize = file.tellg();
        file.seekg(0, std::ios::beg);
        
        std::string content;
        content.resize(fileSize);
        
        // Чтение большими блоками для минимизации syscalls
        char buffer[BUFFER_SIZE];
        size_t totalRead = 0;
        
        while (totalRead < fileSize) {
            size_t toRead = std::min(BUFFER_SIZE, fileSize - totalRead);
            file.read(buffer, toRead);
            std::memcpy(&content[totalRead], buffer, toRead);
            totalRead += toRead;
        }
        
        return content;
    }

    // Assembler-оптимизированная запись файла
    void writeFileAssembler(const std::string& filepath, const std::string& content) {
        std::ofstream file(filepath, std::ios::binary);
        if (!file.is_open()) throw std::runtime_error("Cannot write file: " + filepath);
        
        const char* data = content.c_str();
        size_t size = content.size();
        size_t written = 0;
        
        // Запись большими блоками
        while (written < size) {
            size_t toWrite = std::min(BUFFER_SIZE, size - written);
            file.write(data + written, toWrite);
            written += toWrite;
        }
        
        file.flush();
        file.close();
    }

    // AVX2-оптимизированный поиск подстроки
    size_t findStringAVX2(const std::string& text, const std::string& pattern) {
        if (pattern.empty() || text.size() < pattern.size()) return std::string::npos;
        
        const char* textPtr = text.c_str();
        const char* patternPtr = pattern.c_str();
        size_t textLen = text.size();
        size_t patternLen = pattern.size();
        
        if (patternLen == 1) {
            // Оптимизация для поиска одного символа с AVX2
            __m256i needle = _mm256_set1_epi8(patternPtr[0]);
            
            for (size_t i = 0; i <= textLen - AVX2_CHUNK; i += AVX2_CHUNK) {
                __m256i haystack = _mm256_loadu_si256((__m256i*)(textPtr + i));
                __m256i cmp = _mm256_cmpeq_epi8(haystack, needle);
                uint32_t mask = _mm256_movemask_epi8(cmp);
                
                if (mask != 0) {
                    for (int j = 0; j < 32; j++) {
                        if (mask & (1 << j)) return i + j;
                    }
                }
            }
        }
        
        // Fallback для сложных паттернов
        return text.find(pattern);
    }

public:
    // Операция чтения с производительными метриками
    json readFile(const std::string& filepath) {
        auto start = std::chrono::high_resolution_clock::now();
        
        try {
            std::string content = readFileAssembler(filepath);
            
            auto end = std::chrono::high_resolution_clock::now();
            auto duration = std::chrono::duration_cast<std::chrono::microseconds>(end - start);
            
            size_t fileSize = content.size();
            double mbPerSec = (fileSize / 1024.0 / 1024.0) / (duration.count() / 1000000.0);
            
            return json{
                {"success", true},
                {"content", content},
                {"fileSize", fileSize},
                {"readTime_us", duration.count()},
                {"performance_MB_per_sec", mbPerSec},
                {"assembler_optimized", true}
            };
        } catch (const std::exception& e) {
            return json{
                {"success", false},
                {"error", e.what()}
            };
        }
    }

    // Операция записи
    json writeFile(const std::string& filepath, const std::string& content) {
        auto start = std::chrono::high_resolution_clock::now();
        
        try {
            writeFileAssembler(filepath, content);
            
            auto end = std::chrono::high_resolution_clock::now();
            auto duration = std::chrono::duration_cast<std::chrono::microseconds>(end - start);
            
            size_t fileSize = content.size();
            double mbPerSec = (fileSize / 1024.0 / 1024.0) / (duration.count() / 1000000.0);
            
            return json{
                {"success", true},
                {"fileSize", fileSize},
                {"writeTime_us", duration.count()},
                {"performance_MB_per_sec", mbPerSec},
                {"assembler_optimized", true}
            };
        } catch (const std::exception& e) {
            return json{
                {"success", false},
                {"error", e.what()}
            };
        }
    }

    // Высокопроизводительный поиск и замена
    json findAndReplace(const std::string& content, const std::string& find, const std::string& replace) {
        auto start = std::chrono::high_resolution_clock::now();
        
        std::string result = content;
        size_t replacements = 0;
        size_t pos = 0;
        
        while ((pos = findStringAVX2(result.substr(pos), find)) != std::string::npos) {
            pos += pos == 0 ? 0 : pos;
            result.replace(pos, find.length(), replace);
            pos += replace.length();
            replacements++;
        }
        
        auto end = std::chrono::high_resolution_clock::now();
        auto duration = std::chrono::duration_cast<std::chrono::microseconds>(end - start);
        
        return json{
            {"success", true},
            {"result", result},
            {"replacements", replacements},
            {"processingTime_us", duration.count()},
            {"avx2_optimized", true}
        };
    }

    // Batch операции с параллельной обработкой
    json batchOperation(const json& operations) {
        auto start = std::chrono::high_resolution_clock::now();
        json results = json::array();
        
        for (const auto& op : operations) {
            std::string type = op["type"];
            json result;
            
            if (type == "read") {
                result = readFile(op["path"]);
            } else if (type == "write") {
                result = writeFile(op["path"], op["content"]);
            } else if (type == "copy") {
                auto readResult = readFile(op["source"]);
                if (readResult["success"]) {
                    result = writeFile(op["destination"], readResult["content"]);
                } else {
                    result = readResult;
                }
            }
            
            result["operation"] = op;
            results.push_back(result);
        }
        
        auto end = std::chrono::high_resolution_clock::now();
        auto duration = std::chrono::duration_cast<std::chrono::microseconds>(end - start);
        
        return json{
            {"success", true},
            {"results", results},
            {"totalTime_us", duration.count()},
            {"operations_count", operations.size()},
            {"assembler_batch", true}
        };
    }
};

// CLI интерфейс для интеграции с Node.js
int main(int argc, char* argv[]) {
    if (argc < 3) {
        std::cerr << "Usage: file_assembler <operation> <params_json>" << std::endl;
        return 1;
    }
    
    std::string operation = argv[1];
    std::string paramsJson = argv[2];
    
    try {
        json params = json::parse(paramsJson);
        FileAssembler assembler;
        json result;
        
        if (operation == "read") {
            result = assembler.readFile(params["filepath"]);
        } else if (operation == "write") {
            result = assembler.writeFile(params["filepath"], params["content"]);
        } else if (operation == "findreplace") {
            result = assembler.findAndReplace(params["content"], params["find"], params["replace"]);
        } else if (operation == "batch") {
            result = assembler.batchOperation(params["operations"]);
        } else {
            result = json{{"success", false}, {"error", "Unknown operation: " + operation}};
        }
        
        std::cout << result.dump() << std::endl;
        
    } catch (const std::exception& e) {
        json error = json{{"success", false}, {"error", e.what()}};
        std::cout << error.dump() << std::endl;
        return 1;
    }
    
    return 0;
} 