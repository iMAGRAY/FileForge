#!/usr/bin/env python3
"""
FileForge - API Examples
===========================================

This file demonstrates how to interact with FileForge
through various methods and provides practical examples for developers.
"""

import json
import subprocess
import sys
from typing import Dict, Any, List, Optional

class FileForgeAPI:
    """
    Python wrapper for FileForge MCP server
    """
    
    def __init__(self, server_path: str = "./src/fileforge.cjs"):
        """Initialize the API wrapper"""
        self.server_path = server_path
        self.timeout = 30
    
    def _execute_mcp_call(self, action: str, **kwargs) -> Dict[str, Any]:
        """
        Execute an MCP call to FileForge
        
        Args:
            action: The action to perform
            **kwargs: Additional parameters for the action
            
        Returns:
            Dictionary with the result
        """
        request = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "tools/call",
            "params": {
                "name": "ultra_code_manager",
                "arguments": {
                    "action": action,
                    **kwargs
                }
            }
        }
        
        try:
            # In a real implementation, this would use proper MCP client
            # This is a simplified example
            print(f"🚀 Executing: {action}")
            print(f"📝 Request: {json.dumps(request, indent=2)}")
            return {"success": True, "action": action, "params": kwargs}
        except Exception as e:
            return {"success": False, "error": str(e)}

# ========================================
# FILE OPERATIONS EXAMPLES
# ========================================

def example_file_operations():
    """Demonstrate basic file operations"""
    api = FileForgeAPI()
    
    print("📁 FILE OPERATIONS EXAMPLES")
    print("=" * 50)
    
    # 1. Create a new file
    print("\n1. Creating new file...")
    result = api._execute_mcp_call(
        "create_file",
        file_path="./examples/demo_file.py",
        new_content='''#!/usr/bin/env python3
"""Demo file created by FileForge"""

def hello_world():
    """A simple hello world function"""
    print("Hello from FileForge!")
    return "success"

if __name__ == "__main__":
    hello_world()
''',
        operation_params={"overwrite": True}
    )
    print(f"✅ Result: {result}")
    
    # 2. Read file in chunks
    print("\n2. Reading file in chunks...")
    result = api._execute_mcp_call(
        "read_file_chunked",
        file_path="./examples/demo_file.py",
        chunk_size=5,
        start_line=1,
        end_line=10
    )
    print(f"✅ Result: {result}")
    
    # 3. Find code structures
    print("\n3. Finding code structures...")
    result = api._execute_mcp_call(
        "find_code_structures",
        file_path="./examples/demo_file.py",
        structure_type="function"
    )
    print(f"✅ Result: {result}")

def example_batch_operations():
    """Demonstrate batch operations"""
    api = FileForgeAPI()
    
    print("\n🚀 BATCH OPERATIONS EXAMPLES")
    print("=" * 50)
    
    # Create multiple directories and files
    result = api._execute_mcp_call(
        "batch_operations",
        operations=[
            {"type": "create_directory", "path": "./examples/test_project"},
            {"type": "create_directory", "path": "./examples/test_project/src"},
            {"type": "create_directory", "path": "./examples/test_project/tests"},
            {"type": "create_directory", "path": "./examples/test_project/docs"}
        ]
    )
    print(f"✅ Batch directories created: {result}")
    
    # Process multiple files
    result = api._execute_mcp_call(
        "process_multiple_files",
        operation_type="backup",
        file_paths=[
            "./examples/demo_file.py",
            "./src/fileforge.cjs"
        ],
        operation_params={"backup_dir": "./examples/backups"}
    )
    print(f"✅ Multiple files processed: {result}")

def example_embeddings_operations():
    """Demonstrate embeddings operations"""
    api = FileForgeAPI()
    
    print("\n🧠 EMBEDDINGS OPERATIONS EXAMPLES")
    print("=" * 50)
    
    # 1. Check if embedding exists
    result = api._execute_mcp_call(
        "has_embedding",
        file_path="./examples/demo_file.py"
    )
    print(f"✅ Embedding exists check: {result}")
    
    # 2. Create smart embedding
    result = api._execute_mcp_call(
        "smart_create_embedding",
        file_path="./examples/demo_file.py",
        operation_params={"forceRecreate": False}
    )
    print(f"✅ Smart embedding created: {result}")
    
    # 3. Get embedding cache info
    result = api._execute_mcp_call(
        "get_embedding_cache_info"
    )
    print(f"✅ Embedding cache info: {result}")

def example_advanced_features():
    """Demonstrate advanced features"""
    api = FileForgeAPI()
    
    print("\n⚡ ADVANCED FEATURES EXAMPLES")
    print("=" * 50)
    
    # 1. Find and replace with regex
    result = api._execute_mcp_call(
        "find_and_replace",
        file_path="./examples/demo_file.py",
        search_pattern=r"def (\w+)\(",
        replacement=r"def enhanced_\1(",
        is_regex=True,
        create_backup=True
    )
    print(f"✅ Regex find and replace: {result}")
    
    # 2. Generate diff between files
    result = api._execute_mcp_call(
        "generate_diff",
        file_path="./examples/demo_file.py",
        file_path_2="./examples/demo_file.py.backup",
        operation_params={"context_lines": 3}
    )
    print(f"✅ Diff generated: {result}")
    
    # 3. Complete file processing with performance analysis
    result = api._execute_mcp_call(
        "process_file_complete",
        file_path="./examples/demo_file.py",
        operation_params={
            "includeEmbeddings": True,
            "analyzePerformance": True,
            "useAssembler": True
        }
    )
    print(f"✅ Complete file processing: {result}")

def example_performance_monitoring():
    """Demonstrate performance monitoring"""
    api = FileForgeAPI()
    
    print("\n📊 PERFORMANCE MONITORING EXAMPLES")
    print("=" * 50)
    
    # Get comprehensive performance stats
    result = api._execute_mcp_call("get_performance_stats")
    print(f"✅ Performance statistics: {result}")

def example_error_handling_and_recovery():
    """Demonstrate error handling and recovery"""
    api = FileForgeAPI()
    
    print("\n🛡️ ERROR HANDLING & RECOVERY EXAMPLES")
    print("=" * 50)
    
    # 1. Safe operation with backup
    result = api._execute_mcp_call(
        "replace_lines",
        file_path="./examples/demo_file.py",
        start_line=5,
        end_line=7,
        new_content="# This is a safe replacement with backup",
        create_backup=True
    )
    print(f"✅ Safe replacement with backup: {result}")
    
    # 2. Rollback operation (would use real operation_id)
    result = api._execute_mcp_call(
        "rollback_operation",
        operation_id="replace_lines_20250120_143052_demo"
    )
    print(f"✅ Operation rollback: {result}")

# ========================================
# JSON-RPC EXAMPLES
# ========================================

def example_raw_jsonrpc_calls():
    """Show raw JSON-RPC call examples"""
    print("\n🔧 RAW JSON-RPC EXAMPLES")
    print("=" * 50)
    
    # List available tools
    list_tools_request = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "tools/list"
    }
    print("📋 List Tools Request:")
    print(json.dumps(list_tools_request, indent=2))
    
    # Call specific tool
    call_tool_request = {
        "jsonrpc": "2.0", 
        "id": 2,
        "method": "tools/call",
        "params": {
            "name": "ultra_code_manager",
            "arguments": {
                "action": "create_file",
                "file_path": "./test.py",
                "new_content": "print('Hello World')"
            }
        }
    }
    print("\n🛠️ Call Tool Request:")
    print(json.dumps(call_tool_request, indent=2))
    
    # Expected response format
    expected_response = {
        "jsonrpc": "2.0",
        "id": 2,
        "result": {
            "content": [
                {
                    "type": "text",
                    "text": "File created successfully: ./test.py"
                }
            ]
        }
    }
    print("\n✅ Expected Response:")
    print(json.dumps(expected_response, indent=2))

# ========================================
# INTEGRATION EXAMPLES
# ========================================

def example_cursor_integration():
    """Examples for Cursor IDE integration"""
    print("\n🎯 CURSOR INTEGRATION EXAMPLES")
    print("=" * 50)
    
    cursor_examples = {
        "create_new_module": {
            "description": "Create a new Python module with template",
            "mcp_call": {
                "action": "create_file",
                "file_path": "./src/new_module.py",
                "new_content": """#!/usr/bin/env python3
'''
New Module Template
Generated by FileForge
'''

class NewModule:
    '''Main class for the new module'''
    
    def __init__(self):
        self.initialized = True
    
    def process(self, data):
        '''Process input data'''
        return data

def main():
    '''Main entry point'''
    module = NewModule()
    print("Module created successfully!")

if __name__ == "__main__":
    main()
""",
                "operation_params": {"overwrite": False}
            }
        },
        
        "refactor_code": {
            "description": "Refactor code using find and replace",
            "mcp_call": {
                "action": "find_and_replace",
                "file_path": "./src/legacy.py",
                "search_pattern": "old_function_name",
                "replacement": "new_function_name",
                "create_backup": True
            }
        },
        
        "analyze_project": {
            "description": "Analyze entire project structure",
            "mcp_call": {
                "action": "process_multiple_files",
                "operation_type": "find_structures",
                "file_paths": ["./src/*.py"],
                "operation_params": {"structureType": "all"}
            }
        }
    }
    
    for name, example in cursor_examples.items():
        print(f"\n📝 {name.upper()}:")
        print(f"   Description: {example['description']}")
        print(f"   MCP Call: {json.dumps(example['mcp_call'], indent=6)}")

def example_claude_integration():
    """Examples for Claude Desktop integration"""
    print("\n🤖 CLAUDE DESKTOP INTEGRATION EXAMPLES")
    print("=" * 50)
    
    claude_workflow = [
        {
            "step": 1,
            "description": "Analyze existing codebase",
            "action": "find_code_structures",
            "params": {"file_path": "./src/main.py", "structure_type": "all"}
        },
        {
            "step": 2, 
            "description": "Create documentation based on analysis",
            "action": "create_file",
            "params": {
                "file_path": "./docs/api_documentation.md",
                "new_content": "# API Documentation\n\nGenerated automatically..."
            }
        },
        {
            "step": 3,
            "description": "Create embeddings for semantic search",
            "action": "smart_create_embedding",
            "params": {"file_path": "./src/main.py"}
        }
    ]
    
    print("🔄 Claude Workflow Example:")
    for step in claude_workflow:
        print(f"   Step {step['step']}: {step['description']}")
        print(f"   Action: {step['action']}")
        print(f"   Params: {json.dumps(step['params'], indent=6)}")
        print()

# ========================================
# MAIN EXECUTION
# ========================================

def main():
    """Run all examples"""
    print("🚀 ULTRA CODE MANAGER ENHANCED - API EXAMPLES")
    print("=" * 60)
    print("Version: 3.2.0")
    print("Documentation: https://github.com/your-username/ultra-code-manager-enhanced")
    print("=" * 60)
    
    try:
        # Run all example categories
        example_file_operations()
        example_batch_operations()
        example_embeddings_operations()
        example_advanced_features()
        example_performance_monitoring()
        example_error_handling_and_recovery()
        example_raw_jsonrpc_calls()
        example_cursor_integration()
        example_claude_integration()
        
        print("\n🎉 ALL EXAMPLES COMPLETED SUCCESSFULLY!")
        print("\n💡 Pro Tips:")
        print("   - Always use create_backup=True for important operations")
        print("   - Monitor performance with get_performance_stats")
        print("   - Use batch_operations for multiple file operations")
        print("   - Create embeddings for semantic code search")
        print("   - Test operations on copies before applying to originals")
        
    except Exception as e:
        print(f"❌ Error running examples: {e}")
        return 1
    
    return 0

if __name__ == "__main__":
    sys.exit(main())