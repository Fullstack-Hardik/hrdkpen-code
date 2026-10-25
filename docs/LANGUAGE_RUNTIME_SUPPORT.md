# HRDK Pen — Language & Runtime Support Specification

## 1. Supported Languages & Runtime Matrix

| Language | Tier | Monaco ID | Execution Runtime | Compiler / Engine | Package Manager | Debugging / Diagnostics | Verification Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **HTML / CSS** | Tier 1 | `html`, `css` | Browser DOM Sandbox | Web Browser Engine | N/A | Console logs, live preview | Verified & Operational |
| **JavaScript** | Tier 1 | `javascript` | WebContainer / Browser | Node.js 18.x / V8 | `npm` (WebContainer) | Stack trace, console, error lens | Verified & Operational |
| **TypeScript** | Tier 1 | `typescript` | WebContainer / Browser | TypeScript 5.x Transpiler | `npm` | Monaco Language Server / TSC | Verified & Operational |
| **Python** | Tier 1 | `python` | Pyodide WASM | CPython 3.12 (WebAssembly) | `micropip` / Pyodide Packages | sys.stderr, Syntax errors | Verified & Operational |
| **C** | Tier 2 | `c` | Isolated Sandbox | GCC 10.2.0 (`-std=c11`) | Standard Library | Compiler stdout/stderr, exit code | Verified & Operational |
| **C++** | Tier 2 | `cpp` | Isolated Sandbox | G++ 10.2.0 (`-std=c++17`) | Standard Library | Compiler stdout/stderr, exit code | Verified & Operational |
| **Java** | Tier 2 | `java` | Isolated Sandbox | OpenJDK 15.0.2 | Standard Library / Maven (Remote) | javac diagnostics, JVM exceptions | Verified & Operational |
| **Rust** | Tier 2 | `rust` | Isolated Sandbox | rustc 1.68.2 (Cargo) | Cargo (Remote) | rustc borrow checker diagnostics | Verified & Operational |
| **Go** | Tier 2 | `go` | Isolated Sandbox | Go 1.16.2 Toolchain | `go.mod` | Compiler errors, exit codes | Verified & Operational |
| **C# (.NET)** | Tier 2 | `csharp` | Isolated Sandbox | Mono / .NET 6.12.0 | NuGet | Roslyn build errors | Verified & Operational |
| **SQL** | Tier 3 | `sql` | In-Memory Relational Engine | HRDK Relational Engine | Bundled Schema | Syntax & execution validation | Verified & Operational |

---

## 2. Runtime Environments

### 2.1 Browser DOM Sandbox
- **Target**: Pure HTML5, CSS3, DOM manipulations.
- **Isolation**: Contained inside isolated `iframe` with restricted permissions.
- **Features**: Live automatic reloading, responsive container previews, and error interception.

### 2.2 WebContainer (Node.js 18 in WebAssembly)
- **Target**: Node.js scripts, React + Vite projects, Express REST APIs.
- **Capabilities**: Full POSIX filesystem emulation, TCP networking simulation, real `npm install`, real development server port detection.
- **Limitations**: Native compiled addons (C/C++ binary addons requiring node-gyp) are not supported inside browser WASM.

### 2.3 Pyodide (Python 3.12 WebAssembly)
- **Target**: Python educational programming, algorithms, data analytics.
- **Capabilities**: Standard CPython runtime in WebAssembly with `math`, `json`, `collections`, `itertools`, and supported pure Python packages.
- **Limitations**: Sockets, direct OS threading, and binary extensions without WASM wheels cannot execute client-side.

### 2.4 Piston Remote Sandbox
- **Target**: C, C++, Java, Rust, Go, C#.
- **Security & Quotas**: 
  - Ephemeral disposable container per execution.
  - Strict 5–10 second timeout preventing infinite loops or fork-bombs.
  - Memory ceiling and CPU affinity constraints.
  - No access to private credentials or parent host environment.
