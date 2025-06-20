#!/usr/bin/env python3
"""
🧠 EMBEDDING MANAGER - Реальная система создания и управления эмбеддингами файлов
"""

import os
import json
import hashlib
import sys
from pathlib import Path
import pickle
import logging

# Настройка логирования
logging.basicConfig(level=logging.ERROR)  # Только ошибки
logger = logging.getLogger(__name__)

try:
    from sentence_transformers import SentenceTransformer
    import faiss
    import numpy as np
except ImportError as e:
    print(json.dumps({"success": False, "error": f"Import error: {str(e)}"}))
    sys.exit(1)

class EmbeddingManager:
    def __init__(self, embeddings_dir="./embeddings", model_name="all-MiniLM-L6-v2"):
        self.embeddings_dir = Path(embeddings_dir)
        self.embeddings_dir.mkdir(exist_ok=True)
        
        self.model_name = model_name
        self.model = None
        self.index = None
        self.file_paths = []
        
        # Пути к файлам
        self.index_path = self.embeddings_dir / "faiss_index.bin"
        self.paths_path = self.embeddings_dir / "file_paths.json"
        self.metadata_path = self.embeddings_dir / "metadata.json"
        
        self._load_model()
        self._load_index()
    
    def _load_model(self):
        """Загрузка модели SentenceTransformers"""
        try:
            self.model = SentenceTransformer(self.model_name)
        except Exception as e:
            raise Exception(f"Failed to load model {self.model_name}: {str(e)}")
    
    def _load_index(self):
        """Загрузка FAISS индекса"""
        try:
            if self.index_path.exists() and self.paths_path.exists():
                self.index = faiss.read_index(str(self.index_path))
                with open(self.paths_path, 'r', encoding='utf-8') as f:
                    self.file_paths = json.load(f)
            else:
                # Создаем новый индекс
                dimension = 384  # Размерность для all-MiniLM-L6-v2
                self.index = faiss.IndexFlatIP(dimension)  # Inner Product для косинусного сходства
                self.file_paths = []
        except Exception as e:
            # Если ошибка загрузки, создаем новый индекс
            dimension = 384
            self.index = faiss.IndexFlatIP(dimension)
            self.file_paths = []
    
    def _save_index(self):
        """Сохранение FAISS индекса"""
        try:
            faiss.write_index(self.index, str(self.index_path))
            with open(self.paths_path, 'w', encoding='utf-8') as f:
                json.dump(self.file_paths, f, ensure_ascii=False, indent=2)
        except Exception as e:
            raise Exception(f"Failed to save index: {str(e)}")
    
    def _read_file_content(self, filepath):
        """Чтение содержимого файла"""
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                return f.read()
        except UnicodeDecodeError:
            try:
                with open(filepath, 'r', encoding='latin-1') as f:
                    return f.read()
            except Exception:
                return None
        except Exception:
            return None
    
    def create_embedding(self, filepath, force_recreate=False):
        """Создание эмбеддинга для файла"""
        try:
            filepath = Path(filepath).resolve()
            
            if not filepath.exists():
                return {"success": False, "error": f"File not found: {filepath}"}
            
            content = self._read_file_content(filepath)
            if content is None:
                return {"success": False, "error": f"Could not read file: {filepath}"}
            
            # Проверяем, есть ли уже эмбеддинг
            filepath_str = str(filepath)
            if filepath_str in self.file_paths and not force_recreate:
                return {
                    "success": True, 
                    "message": "Embedding already exists",
                    "filepath": filepath_str,
                    "action": "skipped"
                }
            
            # Создаем эмбеддинг
            content_for_embedding = content[:1000]  # Первые 1000 символов
            embedding = self.model.encode([content_for_embedding])
            
            # Нормализуем для косинусного сходства
            embedding = embedding / np.linalg.norm(embedding, axis=1, keepdims=True)
            
            # Добавляем в индекс
            if filepath_str in self.file_paths:
                # Обновляем существующий
                idx = self.file_paths.index(filepath_str)
                self.index.remove_ids(np.array([idx], dtype=np.int64))
                self.index.add(embedding)
            else:
                # Добавляем новый
                self.index.add(embedding)
                self.file_paths.append(filepath_str)
            
            self._save_index()
            
            return {
                "success": True,
                "filepath": filepath_str,
                "embedding_dimension": embedding.shape[1],
                "content_length": len(content),
                "action": "created" if not force_recreate else "updated"
            }
            
        except Exception as e:
            return {"success": False, "error": f"Error creating embedding: {str(e)}"}
    
    def find_similar(self, filepath, top_k=5):
        """Поиск похожих файлов"""
        try:
            if self.index.ntotal == 0:
                return {"success": True, "similar_files": [], "message": "No embeddings in index"}
            
            filepath = Path(filepath).resolve()
            content = self._read_file_content(filepath)
            if content is None:
                return {"success": False, "error": f"Could not read file: {filepath}"}
            
            # Создаем эмбеддинг для поиска
            content_for_embedding = content[:1000]
            query_embedding = self.model.encode([content_for_embedding])
            query_embedding = query_embedding / np.linalg.norm(query_embedding, axis=1, keepdims=True)
            
            # Поиск похожих
            k = min(top_k, self.index.ntotal)
            scores, indices = self.index.search(query_embedding, k)
            
            similar_files = []
            for score, idx in zip(scores[0], indices[0]):
                if idx < len(self.file_paths):
                    similar_files.append({
                        "filepath": self.file_paths[idx],
                        "similarity_score": float(score),
                        "exists": Path(self.file_paths[idx]).exists()
                    })
            
            return {
                "success": True,
                "query_file": str(filepath),
                "similar_files": similar_files,
                "total_files_in_index": self.index.ntotal
            }
            
        except Exception as e:
            return {"success": False, "error": f"Error finding similar files: {str(e)}"}
    
    def remove_embedding(self, filepath):
        """Удаление эмбеддинга файла"""
        try:
            filepath_str = str(Path(filepath).resolve())
            
            if filepath_str not in self.file_paths:
                return {"success": True, "message": "Embedding not found", "action": "skipped"}
            
            # Удаляем из списка
            idx = self.file_paths.index(filepath_str)
            self.file_paths.remove(filepath_str)
            
            # Пересоздаем индекс без удаленного элемента
            if self.index.ntotal > 1:
                all_embeddings = []
                for i in range(self.index.ntotal):
                    if i != idx:
                        embedding = self.index.reconstruct(i)
                        all_embeddings.append(embedding)
                
                # Создаем новый индекс
                if all_embeddings:
                    self.index = faiss.IndexFlatIP(384)
                    embeddings_array = np.array(all_embeddings)
                    self.index.add(embeddings_array)
                else:
                    self.index = faiss.IndexFlatIP(384)
            else:
                self.index = faiss.IndexFlatIP(384)
            
            self._save_index()
            
            return {
                "success": True,
                "filepath": filepath_str,
                "action": "removed",
                "remaining_files": len(self.file_paths)
            }
            
        except Exception as e:
            return {"success": False, "error": f"Error removing embedding: {str(e)}"}
    
    def get_stats(self):
        """Статистика системы эмбеддингов"""
        try:
            existing_files = [fp for fp in self.file_paths if Path(fp).exists()]
            
            return {
                "success": True,
                "total_embeddings": self.index.ntotal,
                "total_file_paths": len(self.file_paths),
                "existing_files": len(existing_files),
                "missing_files": len(self.file_paths) - len(existing_files),
                "model_name": self.model_name,
                "index_dimension": 384,
                "embeddings_dir": str(self.embeddings_dir)
            }
            
        except Exception as e:
            return {"success": False, "error": f"Error getting stats: {str(e)}"}

def main():
    """Основная функция для CLI использования"""
    if len(sys.argv) < 3:
        print(json.dumps({"success": False, "error": "Usage: python embedding_manager.py <operation> <params_json>"}))
        return
    
    operation = sys.argv[1]
    try:
        params = json.loads(sys.argv[2])
    except json.JSONDecodeError:
        print(json.dumps({"success": False, "error": "Invalid JSON parameters"}))
        return
    
    try:
        manager = EmbeddingManager()
        
        if operation == "create":
            result = manager.create_embedding(
                params.get("filepath", ""),
                params.get("force_recreate", False)
            )
        elif operation == "similar":
            result = manager.find_similar(
                params.get("filepath", ""),
                params.get("top_k", 5)
            )
        elif operation == "remove":
            result = manager.remove_embedding(params.get("filepath", ""))
        elif operation == "stats":
            result = manager.get_stats()
        else:
            result = {"success": False, "error": f"Unknown operation: {operation}"}
        
        print(json.dumps(result, ensure_ascii=False, indent=2))
        
    except Exception as e:
        print(json.dumps({"success": False, "error": f"Fatal error: {str(e)}"}))

if __name__ == "__main__":
    main() 