# HRDK Pen — Advanced IDE Architecture Specification

## 1. System Overview

HRDK Pen is a modern, high-performance, browser-based integrated development environment (IDE). It delivers native-grade developer workflows, multi-language execution runtimes, Monaco Editor code intelligence, virtual filesystem synchronization, and contextual AI assistance while maintaining zero required local installation.

```
┌────────────────────────────────────────────────────────────────────────┐
│                         HRDK Pen Client (Browser)                      │
│                                                                        │
│  ┌──────────────────┐ ┌──────────────────────────────────────────────┐ │
│  │   Activity Bar   │ │                  Monaco Editor               │ │
│  │ ───────────────  │ │  - 14 Theme Palettes (Catppuccin base)       │ │
│  │ • File Explorer  │ │  - IntelliSense & Typings                    │ │
│  │ • Global Search  │ │  - Prettier Document Formatting              │ │
│  │ • Runtimes       │ │  - Breadcrumbs & Minimap                     │ │
│  │ • Projects       │ └──────────────────────────────────────────────┘ │
│  │ • Documentation  │ ┌──────────────────────────────────────────────┐ │
│  │ • Whiteboard     │ │         Bottom Diagnostics & Output          │ │
│  │ • Settings Card  │ │  - xterm.js Terminal with Multi-Session      │ │
│  │ • Terminal       │ │  - Output & Compiler Logs Panel              │ │
│  └──────────────────┘ │  - Problems & Error Lens Diagnostic List     │ │
│                       └──────────────────────────────────────────────┘ │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
                                     ▼
               ┌───────────────────────────────────────────┐
               │    Unified Multi-Language Execution Core   │
               │          (unifiedExecutor.ts)             │
               └──────┬─────────────┬─────────────┬────────┘
                      │             │             │
                      ▼             ▼             ▼
             ┌────────────────┐ ┌─────────┐ ┌──────────────┐
             │  Tier 1 Runtimes│ │ Tier 2  │ │   Tier 3     │
             │────────────────│ │─────────│ │──────────────│
             │ • HTML/CSS DOM │ │ • C     │ │ • SQL Rel.   │
             │ • WebContainer │ │ • C++   │ │   In-Memory  │
             │   (Node.js 18) │ │ • Java  │ │   Engine     │
             │ • Pyodide WASM │ │ • Rust  │ └──────────────┘
             │   (Python 3.12)│ │ • Go    │
             └────────────────┘ │ • C#    │
                                └────┬────┘
                                     │
                                     ▼
                      ┌───────────────────────────┐
                      │ Secure Sandboxed Compiler │
                      │       (Piston API)        │
                      └───────────────────────────┘
```

---

## 2. Core Architecture Components

### 2.1 Workspace & Virtual Filesystem (VFS)
- **IndexedDB Persistence**: Workspaces are saved client-side via IndexedDB with dirty-state debounce and crash-resilient restoration.
- **WebContainer VFS Sync**: `fsSyncService` orchestrates bidirectional mirroring between the in-memory React file state and WebContainer's virtual POSIX filesystem.
- **DoctorKit System Health**: Self-healing service continuously monitoring storage quotas, unclosed handles, and container connectivity.

### 2.2 Unified Multi-Language Execution Engine (`src/lib/unifiedExecutor.ts`)
Rather than fragmented, ad-hoc execution routines, HRDK Pen routes all code execution requests through a typed execution dispatcher:
1. **In-Browser DOM/Iframe**: Standard HTML5, CSS3, Vanilla JS execution with console interception and sanitized message channels.
2. **WebContainer Node.js 18**: Full micro-operating system in WebAssembly, providing real `npm install`, `node`, `package.json` support, and local web development servers.
3. **Pyodide WASM CPython 3.12**: Complete client-side Python interpreter with Pyodide package loading (numpy, pandas, etc.) and `sys.stdout`/`sys.stderr` redirection.
4. **Isolated Remote Sandboxing (Piston API)**: Compiled enterprise languages (C, C++, Java 15, Rust 1.68, Go 1.16, C#/.NET) compiled and executed in strictly isolated disposable sandboxes with resource boundaries (CPU, memory, timeout limits).
5. **Relational In-Memory Evaluator**: Client-side SQL engine supporting DDL (`CREATE TABLE`) and DML (`INSERT`, `SELECT`, `WHERE`) without external database overhead.

### 2.3 Integrated Developer Tools
- **Global Command Palette**: Accessible via `Ctrl+K` and `Ctrl+Shift+P` with fuzzy matching across editor commands, views, language runtimes, and open files.
- **xterm.js Terminal Engine**: Real pseudo-terminal connection supporting process spawning, WebContainer shells, and runtime execution streaming.
- **Context-Aware AI Assistant**: Real-time code completions, inline diagnostics explanation, error fixes, and refactoring using safe prompt payloads.
- **Language Runtimes Panel**: Dedicated environment inspector displaying runtime type, compiler versions, package managers, and capabilities.
