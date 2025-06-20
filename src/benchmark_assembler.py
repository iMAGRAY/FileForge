#!/usr/bin/env python3
"""
⚡ BENCHMARK ASSEMBLER - Тестирование производительности assembler программы
Сравнение скорости между assembler оптимизированными операциями и стандартными
"""

import os
import time
import json
import subprocess
import tempfile
import psutil
from pathlib import Path
import matplotlib.pyplot as plt
import numpy as np

class AssemblerBenchmark:
    def __init__(self):
        self.assembler_path = "./file_assembler.exe"
        self.test_dir = Path("./benchmark_tests")
        self.test_dir.mkdir(exist_ok=True)
        
    def generate_test_file(self, size_kb: int) -> str:
        """Создание тестового файла заданного размера"""
        content = "Hello World!\n" * (size_kb * 1024 // 13)  # ~13 символов на строку
        test_file = self.test_dir / f"test_{size_kb}kb.txt"
        
        with open(test_file, 'w') as f:
            f.write(content)
        
        return str(test_file)
    
    def benchmark_read_operation(self, file_path: str) -> dict:
        """Бенчмарк операции чтения"""
        # Тест assembler чтения
        start_time = time.perf_counter()
        try:
            result = subprocess.run([
                self.assembler_path, 
                "read", 
                json.dumps({"filepath": file_path})
            ], capture_output=True, text=True, timeout=30)
            
            assembler_time = time.perf_counter() - start_time
            assembler_result = json.loads(result.stdout) if result.stdout else None
            assembler_success = assembler_result and assembler_result.get("success", False)
        except Exception as e:
            assembler_time = float('inf')
            assembler_success = False
            assembler_result = {"error": str(e)}
        
        # Тест стандартного чтения
        start_time = time.perf_counter()
        try:
            with open(file_path, 'r') as f:
                content = f.read()
            standard_time = time.perf_counter() - start_time
            standard_success = True
        except Exception as e:
            standard_time = float('inf')
            standard_success = False
        
        return {
            "assembler": {
                "time": assembler_time,
                "success": assembler_success,
                "performance_mb_sec": assembler_result.get("performance_MB_per_sec", 0) if assembler_result else 0
            },
            "standard": {
                "time": standard_time,
                "success": standard_success
            },
            "speedup": standard_time / assembler_time if assembler_time > 0 else 0
        }
    
    def benchmark_write_operation(self, content: str) -> dict:
        """Бенчмарк операции записи"""
        assembler_file = self.test_dir / "assembler_write_test.txt"
        standard_file = self.test_dir / "standard_write_test.txt"
        
        # Тест assembler записи
        start_time = time.perf_counter()
        try:
            result = subprocess.run([
                self.assembler_path,
                "write",
                json.dumps({"filepath": str(assembler_file), "content": content})
            ], capture_output=True, text=True, timeout=30)
            
            assembler_time = time.perf_counter() - start_time
            assembler_result = json.loads(result.stdout) if result.stdout else None
            assembler_success = assembler_result and assembler_result.get("success", False)
        except Exception as e:
            assembler_time = float('inf')
            assembler_success = False
            assembler_result = {"error": str(e)}
        
        # Тест стандартной записи
        start_time = time.perf_counter()
        try:
            with open(standard_file, 'w') as f:
                f.write(content)
            standard_time = time.perf_counter() - start_time
            standard_success = True
        except Exception as e:
            standard_time = float('inf')
            standard_success = False
        
        # Очистка
        for f in [assembler_file, standard_file]:
            if f.exists():
                f.unlink()
        
        return {
            "assembler": {
                "time": assembler_time,
                "success": assembler_success,
                "performance_mb_sec": assembler_result.get("performance_MB_per_sec", 0) if assembler_result else 0
            },
            "standard": {
                "time": standard_time,
                "success": standard_success
            },
            "speedup": standard_time / assembler_time if assembler_time > 0 else 0
        }
    
    def run_comprehensive_benchmark(self) -> dict:
        """Запуск полного бенчмарка"""
        print("🚀 Запуск комплексного бенчмарка assembler программы...")
        
        # Проверка наличия assembler программы
        if not os.path.exists(self.assembler_path):
            print(f"❌ Assembler программа не найдена: {self.assembler_path}")
            print("   Запустите 'make all' для компиляции")
            return {}
        
        file_sizes = [1, 10, 100, 1000, 5000]  # KB
        results = {
            "read_benchmarks": [],
            "write_benchmarks": [],
            "system_info": {
                "cpu_count": psutil.cpu_count(),
                "memory_gb": psutil.virtual_memory().total / (1024**3),
                "cpu_freq_mhz": psutil.cpu_freq().max if psutil.cpu_freq() else "Unknown"
            }
        }
        
        print(f"💻 Система: {results['system_info']['cpu_count']} CPU, {results['system_info']['memory_gb']:.1f}GB RAM")
        
        # Бенчмарк чтения
        print("\n📖 Тестирование операций чтения...")
        for size_kb in file_sizes:
            print(f"   Тестирование файла {size_kb}KB...")
            test_file = self.generate_test_file(size_kb)
            
            # Усреднение по 3 запускам
            read_times = []
            for _ in range(3):
                benchmark_result = self.benchmark_read_operation(test_file)
                read_times.append(benchmark_result)
            
            # Усреднение результатов
            avg_result = {
                "file_size_kb": size_kb,
                "assembler_avg_time": np.mean([r["assembler"]["time"] for r in read_times]),
                "standard_avg_time": np.mean([r["standard"]["time"] for r in read_times]),
                "avg_speedup": np.mean([r["speedup"] for r in read_times]),
                "assembler_performance_mb_sec": np.mean([r["assembler"]["performance_mb_sec"] for r in read_times])
            }
            results["read_benchmarks"].append(avg_result)
            
            print(f"     Speedup: {avg_result['avg_speedup']:.2f}x, {avg_result['assembler_performance_mb_sec']:.1f} MB/s")
        
        # Бенчмарк записи
        print("\n✏️ Тестирование операций записи...")
        for size_kb in file_sizes:
            print(f"   Тестирование записи {size_kb}KB...")
            test_content = "Test content line\n" * (size_kb * 1024 // 18)
            
            # Усреднение по 3 запускам
            write_times = []
            for _ in range(3):
                benchmark_result = self.benchmark_write_operation(test_content)
                write_times.append(benchmark_result)
            
            avg_result = {
                "file_size_kb": size_kb,
                "assembler_avg_time": np.mean([r["assembler"]["time"] for r in write_times]),
                "standard_avg_time": np.mean([r["standard"]["time"] for r in write_times]),
                "avg_speedup": np.mean([r["speedup"] for r in write_times]),
                "assembler_performance_mb_sec": np.mean([r["assembler"]["performance_mb_sec"] for r in write_times])
            }
            results["write_benchmarks"].append(avg_result)
            
            print(f"     Speedup: {avg_result['avg_speedup']:.2f}x, {avg_result['assembler_performance_mb_sec']:.1f} MB/s")
        
        return results
    
    def generate_benchmark_report(self, results: dict):
        """Создание отчета по бенчмарку"""
        if not results:
            return
        
        print("\n" + "="*60)
        print("📊 ОТЧЕТ ПО ПРОИЗВОДИТЕЛЬНОСТИ ASSEMBLER ПРОГРАММЫ")
        print("="*60)
        
        # Чтение
        print("\n📖 ОПЕРАЦИИ ЧТЕНИЯ:")
        print("Size (KB) | Assembler (ms) | Standard (ms) | Speedup | MB/s")
        print("-" * 60)
        for r in results["read_benchmarks"]:
            print(f"{r['file_size_kb']:8} | {r['assembler_avg_time']*1000:13.2f} | {r['standard_avg_time']*1000:12.2f} | {r['avg_speedup']:6.2f}x | {r['assembler_performance_mb_sec']:5.1f}")
        
        # Запись
        print("\n✏️ ОПЕРАЦИИ ЗАПИСИ:")
        print("Size (KB) | Assembler (ms) | Standard (ms) | Speedup | MB/s")
        print("-" * 60)
        for r in results["write_benchmarks"]:
            print(f"{r['file_size_kb']:8} | {r['assembler_avg_time']*1000:13.2f} | {r['standard_avg_time']*1000:12.2f} | {r['avg_speedup']:6.2f}x | {r['assembler_performance_mb_sec']:5.1f}")
        
        # Статистика
        read_speedups = [r['avg_speedup'] for r in results["read_benchmarks"]]
        write_speedups = [r['avg_speedup'] for r in results["write_benchmarks"]]
        
        print(f"\n📈 ИТОГОВАЯ СТАТИСТИКА:")
        print(f"Среднее ускорение чтения: {np.mean(read_speedups):.2f}x")
        print(f"Максимальное ускорение чтения: {max(read_speedups):.2f}x")
        print(f"Среднее ускорение записи: {np.mean(write_speedups):.2f}x")
        print(f"Максимальное ускорение записи: {max(write_speedups):.2f}x")
        
        # Сохранение JSON отчета
        report_file = self.test_dir / "benchmark_report.json"
        with open(report_file, 'w') as f:
            json.dump(results, f, indent=2)
        
        print(f"\n💾 Детальный отчет сохранен: {report_file}")
    
    def cleanup(self):
        """Очистка тестовых файлов"""
        if self.test_dir.exists():
            for file in self.test_dir.iterdir():
                if file.is_file():
                    file.unlink()
            print(f"🧹 Тестовые файлы очищены")

def main():
    """Основная функция"""
    benchmark = AssemblerBenchmark()
    
    try:
        results = benchmark.run_comprehensive_benchmark()
        benchmark.generate_benchmark_report(results)
        
        print("\n🎉 Бенчмарк завершен успешно!")
        
    except KeyboardInterrupt:
        print("\n⚠️ Бенчмарк прерван пользователем")
    except Exception as e:
        print(f"\n❌ Ошибка во время бенчмарка: {e}")
    finally:
        benchmark.cleanup()

if __name__ == "__main__":
    main() 