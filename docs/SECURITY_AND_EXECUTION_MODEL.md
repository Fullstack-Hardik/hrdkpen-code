# HRDK Pen — Security & Execution Model

## 1. Principles of Secure Execution

In a browser-based IDE, code execution introduces two distinct security boundaries:
1. **Client-Side Security**: Preventing malicious user scripts from reading sensitive browser storage (cookies, IndexedDB tokens, AI credentials).
2. **Backend / Sandbox Security**: Preventing untrusted compiled code from compromising the host infrastructure, performing network attacks, or exhausting computing resources.

---

## 2. Multi-Tier Execution Architecture

### 2.1 Browser DOM Sandbox (HTML/CSS/JS)
- **Mechanism**: Executed inside an isolated `<iframe>` element.
- **Restrictions**: 
  - Cross-origin isolation using `sandbox="allow-scripts"` (without `allow-same-origin` on production hosts) to eliminate DOM and storage access.
  - Intercepted `console.log`, `console.error`, and `window.alert` preventing page lockup.

### 2.2 WebContainer Sandbox (Node.js 18)
- **Mechanism**: Runs entirely inside the browser's WebAssembly and SharedArrayBuffer memory space.
- **Security Advantages**:
  - Zero server-side compute required.
  - Zero access to user's local operating system or local disk.
  - Fully contained in browser tab lifecycle; closing the tab immediately terminates all virtual processes.

### 2.3 Pyodide WebAssembly (Python 3.12)
- **Mechanism**: Compiled CPython bytecode execution within a WebAssembly sandbox.
- **Security Advantages**:
  - No socket permissions or raw OS syscalls.
  - Standard IO redirection via internal memory buffers.

### 2.4 Remote Sandboxed Execution (Piston API)
- **Mechanism**: For compiled languages (C, C++, Java, Rust, Go, C#), requests are sent to an isolated containerized sandbox.
- **Guarantees**:
  - **No Unrestricted Host Shells**: Arbitrary commands cannot escape the ephemeral container.
  - **Execution Timeouts**: Hard termination at 5,000ms–10,000ms prevents infinite recursion and CPU hogging.
  - **Resource Capping**: Memory allocations capped at 512MB per process.
  - **Stateless Lifecycle**: Sandboxes are disposed immediately following code evaluation.

---

## 3. Secrets & Credential Management
- **No Embedded Client Secrets**: Third-party API keys (Supabase service keys, cloud deployment credentials) are never bundled in client distribution packages.
- **User-Provided API Keys**: When users configure OpenAI or Anthropic API keys in the settings panel, keys are saved only to the user's local browser IndexedDB storage and never transmitted to external telemetry servers.
