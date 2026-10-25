/**
 * languageRegistry.ts — HRDK Pen Unified Language Runtime Architecture
 * 
 * Provides typed definitions, execution environments, toolchains, package management,
 * and compiler specifications for Tier 1, Tier 2, and Tier 3 languages.
 */

export type RuntimeEnvironment = 'browser-sandbox' | 'webcontainer' | 'pyodide' | 'remote-sandbox' | 'local-sql';

export interface LanguageCapability {
  run: boolean;
  build: boolean;
  test: boolean;
  format: boolean;
  lint: boolean;
  debug: boolean;
  packageManagement: boolean;
  livePreview: boolean;
}

export interface LanguageDefinition {
  id: string;
  name: string;
  aliases: string[];
  fileExtensions: string[];
  monacoLangId: string;
  category: 'web' | 'scripting' | 'compiled' | 'database' | 'systems';
  tier: 1 | 2 | 3;
  runtimeEnv: RuntimeEnvironment;
  runtimeName: string;
  runtimeVersion: string;
  capabilities: LanguageCapability;
  packageManager?: {
    name: string;
    manifestFile: string;
    lockFile?: string;
    installCommand: string;
  };
  compilerStandard?: string;
  defaultFilename: string;
  sampleCode: string;
  description: string;
  docsUrl: string;
}

export const LANGUAGE_REGISTRY: Record<string, LanguageDefinition> = {
  // ─── TIER 1: CORE & CLIENT/CONTAINER RUNTIMES ───
  html: {
    id: 'html',
    name: 'HTML5',
    aliases: ['html', 'htm', 'xhtml'],
    fileExtensions: ['.html', '.htm'],
    monacoLangId: 'html',
    category: 'web',
    tier: 1,
    runtimeEnv: 'browser-sandbox',
    runtimeName: 'Browser DOM Engine (Chromium/Webkit/Gecko)',
    runtimeVersion: 'HTML5 Standard',
    capabilities: {
      run: true,
      build: false,
      test: false,
      format: true,
      lint: true,
      debug: true,
      packageManagement: false,
      livePreview: true,
    },
    defaultFilename: 'index.html',
    sampleCode: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>HRDK Pen HTML5</title>
  <style>
    body { font-family: system-ui, sans-serif; display: grid; place-content: center; height: 100vh; margin: 0; background: #0f172a; color: #f8fafc; }
    h1 { color: #38bdf8; }
  </style>
</head>
<body>
  <h1>Hello from HRDK Pen HTML5!</h1>
  <p>Live preview updates in real-time with zero latency.</p>
</body>
</html>`,
    description: 'HyperText Markup Language with responsive live DOM sandbox.',
    docsUrl: 'https://developer.mozilla.org/en-US/docs/Web/HTML',
  },

  css: {
    id: 'css',
    name: 'CSS3',
    aliases: ['css'],
    fileExtensions: ['.css'],
    monacoLangId: 'css',
    category: 'web',
    tier: 1,
    runtimeEnv: 'browser-sandbox',
    runtimeName: 'Browser CSSOM Engine',
    runtimeVersion: 'CSS3 / CSS4 Modern',
    capabilities: {
      run: true,
      build: false,
      test: false,
      format: true,
      lint: true,
      debug: true,
      packageManagement: false,
      livePreview: true,
    },
    defaultFilename: 'style.css',
    sampleCode: `/* Modern CSS */
:root {
  --primary-glow: #60a5fa;
}
body {
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #090d16;
  color: #e2e8f0;
}`,
    description: 'Cascading Style Sheets with flexbox, grid, and variable styling.',
    docsUrl: 'https://developer.mozilla.org/en-US/docs/Web/CSS',
  },

  javascript: {
    id: 'javascript',
    name: 'JavaScript',
    aliases: ['javascript', 'js', 'node', 'mjs', 'cjs'],
    fileExtensions: ['.js', '.mjs', '.cjs'],
    monacoLangId: 'javascript',
    category: 'scripting',
    tier: 1,
    runtimeEnv: 'webcontainer',
    runtimeName: 'WebContainer Node.js 18',
    runtimeVersion: 'v18.18.0 (V8 Engine)',
    capabilities: {
      run: true,
      build: true,
      test: true,
      format: true,
      lint: true,
      debug: true,
      packageManagement: true,
      livePreview: true,
    },
    packageManager: {
      name: 'npm',
      manifestFile: 'package.json',
      lockFile: 'package-lock.json',
      installCommand: 'npm install',
    },
    defaultFilename: 'index.js',
    sampleCode: `// HRDK Pen JavaScript Execution
const os = require('os');

console.log('⚡ Node.js Version:', process.version);
console.log('⚡ Memory Total:', Math.round(os.totalmem() / 1024 / 1024), 'MB');

function calculateFibonacci(n) {
  let [a, b] = [0, 1];
  for (let i = 0; i < n; i++) [a, b] = [b, a + b];
  return a;
}

console.log('Fibonacci(12) =', calculateFibonacci(12));`,
    description: 'Modern ES2023+ JavaScript running on local Node.js WebContainer with full npm support.',
    docsUrl: 'https://nodejs.org/docs',
  },

  typescript: {
    id: 'typescript',
    name: 'TypeScript',
    aliases: ['typescript', 'ts'],
    fileExtensions: ['.ts'],
    monacoLangId: 'typescript',
    category: 'scripting',
    tier: 1,
    runtimeEnv: 'webcontainer',
    runtimeName: 'TypeScript Compiler + Node.js 18',
    runtimeVersion: 'TypeScript 5.5 + Node 18',
    capabilities: {
      run: true,
      build: true,
      test: true,
      format: true,
      lint: true,
      debug: true,
      packageManagement: true,
      livePreview: true,
    },
    packageManager: {
      name: 'npm',
      manifestFile: 'package.json',
      lockFile: 'package-lock.json',
      installCommand: 'npm install',
    },
    defaultFilename: 'index.ts',
    sampleCode: `// HRDK Pen TypeScript
interface Developer {
  name: string;
  skills: string[];
  active: boolean;
}

const me: Developer = {
  name: "Full-Stack Engineer",
  skills: ["React", "TypeScript", "Node.js", "Docker"],
  active: true,
};

console.log(\`Developer initialized: \${me.name} [\${me.skills.join(', ')}]\`);`,
    description: 'Type-safe JavaScript superset with strict compiler checking and type definitions.',
    docsUrl: 'https://www.typescriptlang.org/docs/',
  },

  python: {
    id: 'python',
    name: 'Python',
    aliases: ['python', 'py'],
    fileExtensions: ['.py'],
    monacoLangId: 'python',
    category: 'scripting',
    tier: 1,
    runtimeEnv: 'pyodide',
    runtimeName: 'Pyodide (WebAssembly CPython)',
    runtimeVersion: 'CPython 3.12 (Pyodide v0.27.6)',
    capabilities: {
      run: true,
      build: false,
      test: true,
      format: true,
      lint: true,
      debug: false,
      packageManagement: true,
      livePreview: false,
    },
    packageManager: {
      name: 'micropip',
      manifestFile: 'requirements.txt',
      installCommand: 'micropip.install()',
    },
    defaultFilename: 'main.py',
    sampleCode: `# HRDK Pen Python Runtime
import sys
import math

print(f"🐍 Python Runtime: {sys.version.split()[0]}")
print(f"Platform: {sys.platform}")

def is_prime(n):
    if n <= 1: return False
    return all(n % i != 0 for i in range(2, int(math.isqrt(n)) + 1))

primes = [x for x in range(2, 50) if is_prime(x)]
print(f"Primes under 50: {primes}")`,
    description: 'In-browser scientific CPython environment with standard library and micropip package loader.',
    docsUrl: 'https://docs.python.org/3/',
  },

  // ─── TIER 2: COMPILED & SYSTEMS LANGUAGES (SECURE REMOTE SANDBOX) ───
  c: {
    id: 'c',
    name: 'C',
    aliases: ['c'],
    fileExtensions: ['.c', '.h'],
    monacoLangId: 'c',
    category: 'compiled',
    tier: 2,
    runtimeEnv: 'remote-sandbox',
    runtimeName: 'GCC Compiler Engine',
    runtimeVersion: 'GCC 13.2.0 (C17 Standard)',
    capabilities: {
      run: true,
      build: true,
      test: false,
      format: true,
      lint: true,
      debug: false,
      packageManagement: false,
      livePreview: false,
    },
    compilerStandard: '-std=c17 -O2 -Wall',
    defaultFilename: 'main.c',
    sampleCode: `#include <stdio.h>
#include <stdlib.h>

int main() {
    printf("⚡ Compiled C Environment\\n");
    printf("Standard: C17 with GCC\\n\\n");
    
    int numbers[] = {10, 20, 30, 40, 50};
    int sum = 0;
    size_t count = sizeof(numbers) / sizeof(numbers[0]);
    
    for (size_t i = 0; i < count; i++) {
        sum += numbers[i];
    }
    
    printf("Sum of array = %d\\n", sum);
    return 0;
}`,
    description: 'Systems programming language compiled with strict diagnostics and memory limits.',
    docsUrl: 'https://en.cppreference.com/w/c',
  },

  cpp: {
    id: 'cpp',
    name: 'C++',
    aliases: ['cpp', 'cc', 'cxx', 'c++'],
    fileExtensions: ['.cpp', '.cc', '.cxx', '.hpp'],
    monacoLangId: 'cpp',
    category: 'compiled',
    tier: 2,
    runtimeEnv: 'remote-sandbox',
    runtimeName: 'G++ Compiler Engine',
    runtimeVersion: 'G++ 13.2.0 (C++20 Standard)',
    capabilities: {
      run: true,
      build: true,
      test: false,
      format: true,
      lint: true,
      debug: false,
      packageManagement: false,
      livePreview: false,
    },
    compilerStandard: '-std=c++20 -O2 -Wall',
    defaultFilename: 'main.cpp',
    sampleCode: `#include <iostream>
#include <vector>
#include <numeric>
#include <algorithm>

int main() {
    std::cout << "🚀 Modern C++20 Sandbox\\n";
    
    std::vector<int> data = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
    
    int sum = std::accumulate(data.begin(), data.end(), 0);
    std::cout << "Vector sum: " << sum << "\\n";
    
    std::ranges::for_each(data, [](int n) {
        if (n % 2 == 0) std::cout << n << " ";
    });
    std::cout << " (even elements)\\n";
    return 0;
}`,
    description: 'Modern object-oriented and systems programming with standard library algorithms.',
    docsUrl: 'https://en.cppreference.com/w/cpp',
  },

  java: {
    id: 'java',
    name: 'Java',
    aliases: ['java'],
    fileExtensions: ['.java'],
    monacoLangId: 'java',
    category: 'compiled',
    tier: 2,
    runtimeEnv: 'remote-sandbox',
    runtimeName: 'OpenJDK 21 LTS',
    runtimeVersion: 'Java 21 HotSpot',
    capabilities: {
      run: true,
      build: true,
      test: true,
      format: true,
      lint: true,
      debug: false,
      packageManagement: true,
      livePreview: false,
    },
    packageManager: {
      name: 'Maven',
      manifestFile: 'pom.xml',
      installCommand: 'mvn compile',
    },
    defaultFilename: 'Main.java',
    sampleCode: `import java.util.List;
import java.util.stream.Collectors;

public class Main {
    public static void main(String[] args) {
        System.out.println("☕ OpenJDK 21 LTS Runtime");
        
        List<String> frameworks = List.of("Spring Boot", "Quarkus", "Micronaut", "Vert.x");
        
        String result = frameworks.stream()
            .filter(f -> f.startsWith("S") || f.startsWith("Q"))
            .collect(Collectors.joining(", "));
            
        System.out.println("Selected Frameworks: " + result);
    }
}`,
    description: 'Enterprise object-oriented language with OpenJDK 21 LTS compiler and execution sandbox.',
    docsUrl: 'https://docs.oracle.com/en/java/',
  },

  rust: {
    id: 'rust',
    name: 'Rust',
    aliases: ['rust', 'rs'],
    fileExtensions: ['.rs'],
    monacoLangId: 'rust',
    category: 'systems',
    tier: 2,
    runtimeEnv: 'remote-sandbox',
    runtimeName: 'rustc / Cargo Engine',
    runtimeVersion: 'Rust 1.80.0 (2021 Edition)',
    capabilities: {
      run: true,
      build: true,
      test: true,
      format: true,
      lint: true,
      debug: false,
      packageManagement: true,
      livePreview: false,
    },
    packageManager: {
      name: 'Cargo',
      manifestFile: 'Cargo.toml',
      lockFile: 'Cargo.lock',
      installCommand: 'cargo build',
    },
    defaultFilename: 'main.rs',
    sampleCode: `fn main() {
    println!("🦀 Rust Safety & High-Performance Sandbox");
    
    let numbers: Vec<i32> = (1..=10).collect();
    let evens: Vec<i32> = numbers.into_iter().filter(|x| x % 2 == 0).collect();
    
    println!("Evens: {:?}", evens);
}`,
    description: 'Memory-safe systems programming language with zero-cost abstractions.',
    docsUrl: 'https://doc.rust-lang.org/',
  },

  go: {
    id: 'go',
    name: 'Go',
    aliases: ['go', 'golang'],
    fileExtensions: ['.go'],
    monacoLangId: 'go',
    category: 'compiled',
    tier: 2,
    runtimeEnv: 'remote-sandbox',
    runtimeName: 'Go Toolchain',
    runtimeVersion: 'Go 1.22.4',
    capabilities: {
      run: true,
      build: true,
      test: true,
      format: true,
      lint: true,
      debug: false,
      packageManagement: true,
      livePreview: false,
    },
    packageManager: {
      name: 'Go Modules',
      manifestFile: 'go.mod',
      lockFile: 'go.sum',
      installCommand: 'go mod download',
    },
    defaultFilename: 'main.go',
    sampleCode: `package main

import (
	"fmt"
	"runtime"
	"time"
)

func main() {
	fmt.Println("🐹 Go Runtime Toolchain")
	fmt.Printf("Arch: %s | CPUs: %d\\n", runtime.GOARCH, runtime.NumCPU())
	fmt.Println("Time:", time.Now().Format(time.RFC1123))
}`,
    description: 'Concise, fast, and concurrent cloud systems language by Google.',
    docsUrl: 'https://go.dev/doc/',
  },

  csharp: {
    id: 'csharp',
    name: 'C# / .NET',
    aliases: ['csharp', 'cs', 'dotnet'],
    fileExtensions: ['.cs'],
    monacoLangId: 'csharp',
    category: 'compiled',
    tier: 2,
    runtimeEnv: 'remote-sandbox',
    runtimeName: '.NET 8.0 SDK',
    runtimeVersion: '.NET 8.0 LTS (Roslyn)',
    capabilities: {
      run: true,
      build: true,
      test: true,
      format: true,
      lint: true,
      debug: false,
      packageManagement: true,
      livePreview: false,
    },
    packageManager: {
      name: 'NuGet',
      manifestFile: 'Program.csproj',
      installCommand: 'dotnet restore',
    },
    defaultFilename: 'Program.cs',
    sampleCode: `using System;
using System.Linq;

class Program
{
    static void Main()
    {
        Console.WriteLine("🎯 .NET 8.0 Roslyn Sandbox");
        var scores = new int[] { 95, 82, 100, 67, 91 };
        var average = scores.Average();
        Console.WriteLine($"Average Score: {average:F2}");
    }
}`,
    description: 'Modern, object-oriented language for cloud and cross-platform apps on .NET.',
    docsUrl: 'https://learn.microsoft.com/en-us/dotnet/csharp/',
  },

  // ─── TIER 3: SPECIALIZED & DATABASE LANGUAGES ───
  sql: {
    id: 'sql',
    name: 'SQL (SQLite)',
    aliases: ['sql', 'sqlite', 'sqlite3'],
    fileExtensions: ['.sql'],
    monacoLangId: 'sql',
    category: 'database',
    tier: 3,
    runtimeEnv: 'local-sql',
    runtimeName: 'Local Web SQL / SQLite In-Memory',
    runtimeVersion: 'SQLite 3.42 WebAssembly',
    capabilities: {
      run: true,
      build: false,
      test: false,
      format: true,
      lint: true,
      debug: false,
      packageManagement: false,
      livePreview: false,
    },
    defaultFilename: 'queries.sql',
    sampleCode: `-- HRDK Pen SQL Sandbox
CREATE TABLE developers (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    salary INTEGER
);

INSERT INTO developers (name, role, salary) VALUES
    ('Alex Turner', 'Architect', 140000),
    ('Sara Chen', 'Frontend Lead', 125000),
    ('Devon Vance', 'DevOps', 130000);

SELECT role, AVG(salary) AS avg_salary
FROM developers
GROUP BY role
ORDER BY avg_salary DESC;`,
    description: 'Relational query language with interactive local schema and query evaluation.',
    docsUrl: 'https://sqlite.org/docs.html',
  },

  bash: {
    id: 'bash',
    name: 'Bash Shell',
    aliases: ['bash', 'sh', 'zsh', 'shell'],
    fileExtensions: ['.sh', '.bash'],
    monacoLangId: 'shell',
    category: 'scripting',
    tier: 3,
    runtimeEnv: 'webcontainer',
    runtimeName: 'WebContainer Posix jsh',
    runtimeVersion: 'Posix Compatible Shell',
    capabilities: {
      run: true,
      build: false,
      test: false,
      format: true,
      lint: false,
      debug: false,
      packageManagement: false,
      livePreview: false,
    },
    defaultFilename: 'script.sh',
    sampleCode: `#!/bin/bash
# HRDK Pen WebContainer Shell Script
echo "Executing Posix environment tasks..."
uname -a
echo "Workspace files:"
ls -la`,
    description: 'POSIX shell script runner isolated securely within the WebContainer virtual filesystem.',
    docsUrl: 'https://webcontainers.io',
  },

  json: {
    id: 'json',
    name: 'JSON',
    aliases: ['json'],
    fileExtensions: ['.json'],
    monacoLangId: 'json',
    category: 'web',
    tier: 1,
    runtimeEnv: 'browser-sandbox',
    runtimeName: 'V8 JSON Parser & Validator',
    runtimeVersion: 'RFC 8259 Standard',
    capabilities: {
      run: false,
      build: false,
      test: false,
      format: true,
      lint: true,
      debug: false,
      packageManagement: false,
      livePreview: false,
    },
    defaultFilename: 'config.json',
    sampleCode: `{
  "name": "hrdk-pen-workspace",
  "version": "2.0.0",
  "private": true,
  "settings": {
    "autoSave": true,
    "theme": "smart-dark"
  }
}`,
    description: 'JavaScript Object Notation with real-time schema validation and formatting.',
    docsUrl: 'https://www.json.org/',
  },

  markdown: {
    id: 'markdown',
    name: 'Markdown',
    aliases: ['markdown', 'md'],
    fileExtensions: ['.md', '.markdown'],
    monacoLangId: 'markdown',
    category: 'web',
    tier: 1,
    runtimeEnv: 'browser-sandbox',
    runtimeName: 'GitHub Flavored Markdown Renderer',
    runtimeVersion: 'GFM Spec v0.29',
    capabilities: {
      run: false,
      build: false,
      test: false,
      format: true,
      lint: false,
      debug: false,
      packageManagement: false,
      livePreview: true,
    },
    defaultFilename: 'README.md',
    sampleCode: `# Project Title

A clean, modern project built inside **HRDK Pen**.

## Features
- ⚡ Instant live preview
- 💻 Multi-language execution
- 🎨 Catppuccin and customized themes
`,
    description: 'Lightweight markup language with rendered live preview tab.',
    docsUrl: 'https://docs.github.com/en/get-started/writing-on-github',
  },
};

/**
 * Resolves a language definition from a filename or language ID.
 */
export function resolveLanguage(filenameOrId: string): LanguageDefinition {
  const clean = filenameOrId.toLowerCase().trim();
  
  // Direct ID check
  if (LANGUAGE_REGISTRY[clean]) {
    return LANGUAGE_REGISTRY[clean];
  }

  // File extension check
  const ext = '.' + (clean.split('.').pop() || '');
  for (const lang of Object.values(LANGUAGE_REGISTRY)) {
    if (lang.fileExtensions.includes(ext) || lang.aliases.includes(clean)) {
      return lang;
    }
  }

  // Fallback to JavaScript
  return LANGUAGE_REGISTRY.javascript;
}

/**
 * Array of all supported languages in HRDK Pen.
 */
export const SUPPORTED_LANGUAGES: LanguageDefinition[] = Object.values(LANGUAGE_REGISTRY);
