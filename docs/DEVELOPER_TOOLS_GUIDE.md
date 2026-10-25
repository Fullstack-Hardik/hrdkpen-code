# HRDK Pen — Developer Tools User Guide

## 1. Developer Navigation & Shortcuts

| Action | Windows / Linux Shortcut | macOS Shortcut | Description |
| :--- | :--- | :--- | :--- |
| **Command Palette** | `Ctrl + Shift + P` or `Ctrl + K` | `Cmd + Shift + P` or `Cmd + K` | Universal searchable menu for all IDE actions |
| **Quick Run Code** | `F5` or `Ctrl + Enter` | `F5` or `Cmd + Enter` | Executes the active file in its native runtime |
| **Toggle Terminal** | `Ctrl + \`` | `Cmd + \`` | Show / hide the xterm.js terminal panel |
| **Format Document** | `Shift + Alt + F` | `Shift + Option + F` | Format active file with Prettier |
| **Global File Search** | `Ctrl + Shift + F` | `Cmd + Shift + F` | Search text across all workspace files |
| **AI Assistant** | `Ctrl + Shift + A` | `Cmd + Shift + A` | Open the HRDK Pen AI Assistant sidebar |
| **Zen Mode** | `Ctrl + K Z` | `Cmd + K Z` | Focus mode hiding toolbars and activity bars |

---

## 2. Integrated Developer Panels

### 2.1 Language Runtimes & Environments Panel
Located in the Activity Bar (Server icon), this view provides deep visibility into:
- The currently active programming language.
- Real underlying runtime (Browser, WebContainer, Pyodide WASM, Piston Sandbox).
- Installed compiler and language version numbers.
- Package manager compatibility (npm, pip, cargo, etc.).
- Direct "Run Test Snippet" action to verify runtime connectivity.

### 2.2 Advanced Terminal (`Terminal.tsx`)
- Powered by `@xterm/xterm` and `@xterm/addon-fit`.
- Multi-language awareness: automatically streams compilation, standard output, standard error, exit codes, and duration.
- Direct interactive bash/sh prompt for Node.js WebContainer projects.

### 2.3 Command Palette (`CommandPalette.tsx`)
- Real-time fuzzy filtering of all commands and workspace files.
- Grouped sections:
  1. **Editor & Execution**: Run code, format, toggle terminal.
  2. **AI Coding Assistant**: Explain code, fix errors, refactor.
  3. **Views & Navigation**: Jump directly to Runtimes, Projects, Documentation, Settings.
  4. **Workspace Files**: Click or arrow-navigate to switch active files immediately.
  5. **Language Runtimes Available**: Inspect or switch language profiles.

### 2.4 Settings & Themes Card
- 14 curated themes including Catppuccin Mocha (`smart-dark`), Pure Black (OLED), Dracula, Nord, Monokai, SynthWave '84, Tokyo Night, and Cyber Neon.
- Font family selection: Cascadia Code, JetBrains Mono, Fira Code, Ubuntu Mono with programming ligatures.
- Live syntax highlighting preview card reflecting all configuration adjustments in real time.
