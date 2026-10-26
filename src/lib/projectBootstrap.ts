/**
 * projectBootstrap.ts — Centralized Project Lifecycle, Package Installation & Runtime Service
 *
 * Implements a strict, reliable lifecycle:
 * idle → validating → installing → starting → waiting-for-server → running
 *
 * Handles:
 * - Framework & Dependency Detection (React, Vite, Express, EJS, Node.js, Static HTML)
 * - Controlled package installation with exit code verification
 * - Script execution with fallback detection (dev -> start -> node entry)
 * - Accurate server-ready URL mapping to the active project
 * - Process cleanup and orphaned server prevention
 */

import { getWebContainer, clearWebContainerFS } from './webcontainer';
import { processManager } from './processManager';
import { fsSyncService } from './fsSync';
import type { FileNode } from '@/types';
import type { FileSystemTree } from '@webcontainer/api';

export type BootstrapState =
  | 'idle'
  | 'validating'
  | 'installing'
  | 'starting'
  | 'waiting-for-server'
  | 'running'
  | 'error'
  | 'stopped';

export interface BootstrapStatus {
  projectId: string;
  state: BootstrapState;
  message: string;
  error?: string;
  serverUrl?: string;
  port?: number;
  framework: 'react' | 'express' | 'ejs' | 'node' | 'static';
  hasPackageJson: boolean;
  script?: string;
}

type StatusListener = (status: BootstrapStatus) => void;

class ProjectBootstrapService {
  private currentStatus: Map<string, BootstrapStatus> = new Map();
  private listeners: Set<StatusListener> = new Set();
  private activeBootstraps: Map<string, AbortController> = new Map();
  private staticServerProjects: Set<string> = new Set();

  constructor() {
    processManager.setOnServerReady((projectId, url, port) => {
      this.registerServerUrl(projectId, url, port);
    });
  }

  subscribe(listener: StatusListener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private updateStatus(projectId: string, update: Partial<BootstrapStatus>) {
    const existing: BootstrapStatus = this.currentStatus.get(projectId) || {
      projectId,
      state: 'idle',
      message: '',
      framework: 'static',
      hasPackageJson: false,
    };
    const next: BootstrapStatus = { ...existing, ...update };
    this.currentStatus.set(projectId, next);
    for (const listener of this.listeners) {
      listener(next);
    }
  }

  getStatus(projectId: string): BootstrapStatus | undefined {
    return this.currentStatus.get(projectId);
  }

  /**
   * Recursively converts workspace FileNode tree into WebContainer FileSystemTree
   */
  private buildTree(nodes: FileNode[], inspectEnabled = false): FileSystemTree {
    const tree: FileSystemTree = {};
    for (const n of nodes) {
      if (n.type === 'file') {
        let contents = n.content ?? '';
        if (inspectEnabled && (n.name === 'index.html' || n.name.endsWith('.html'))) {
          contents = contents.replace(
            /<head([^>]*)>/i,
            `<head$1><script src="https://cdn.jsdelivr.net/npm/eruda"></script><script>eruda.init({defaults:{displaySize:100,transparency:1,theme:'Dark'}}); eruda.show(); eruda._entryBtn.hide();</script>`
          );
        }
        tree[n.name] = { file: { contents } };
      } else if (n.type === 'folder') {
        tree[n.name] = { directory: this.buildTree(n.children ?? [], inspectEnabled) };
      }
    }
    return tree;
  }

  /**
   * Analyzes project files to determine framework, scripts, and dependencies
   */
  analyzeProject(files: FileNode[]): {
    framework: 'react' | 'express' | 'ejs' | 'node' | 'static';
    hasPackageJson: boolean;
    packageJson?: any;
    startScript?: string;
    entryFile?: string;
  } {
    const allFiles: FileNode[] = [];
    const flatten = (nodes: FileNode[]) => {
      for (const n of nodes) {
        if (n.type === 'file') allFiles.push(n);
        if (n.children) flatten(n.children);
      }
    };
    flatten(files);

    const pkgFile = allFiles.find(f => f.name === 'package.json');
    if (!pkgFile || !pkgFile.content) {
      return { framework: 'static', hasPackageJson: false };
    }

    let pkg: any = {};
    try {
      pkg = JSON.parse(pkgFile.content);
    } catch {
      return { framework: 'node', hasPackageJson: true, packageJson: null };
    }

    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    const scripts = pkg.scripts || {};

    // 1. Detect React / Vite
    if (deps['react'] || deps['vite'] || scripts['dev']?.includes('vite') || allFiles.some(f => f.name.endsWith('.jsx') || f.name.endsWith('.tsx'))) {
      const startScript = scripts.dev ? 'dev' : scripts.start ? 'start' : undefined;
      return { framework: 'react', hasPackageJson: true, packageJson: pkg, startScript };
    }

    // 2. Detect EJS with Express
    if (deps['ejs'] || allFiles.some(f => f.name.endsWith('.ejs'))) {
      const startScript = scripts.dev ? 'dev' : scripts.start ? 'start' : undefined;
      const entryFile = pkg.main || (allFiles.some(f => f.name === 'server.js') ? 'server.js' : 'index.js');
      return { framework: 'ejs', hasPackageJson: true, packageJson: pkg, startScript, entryFile };
    }

    // 3. Detect Express
    if (deps['express'] || allFiles.some(f => f.name === 'server.js')) {
      const startScript = scripts.dev ? 'dev' : scripts.start ? 'start' : undefined;
      const entryFile = pkg.main || (allFiles.some(f => f.name === 'server.js') ? 'server.js' : 'index.js');
      return { framework: 'express', hasPackageJson: true, packageJson: pkg, startScript, entryFile };
    }

    // 4. Standard Node.js
    const startScript = scripts.dev ? 'dev' : scripts.start ? 'start' : undefined;
    const entryFile = pkg.main || 'index.js';
    return { framework: 'node', hasPackageJson: true, packageJson: pkg, startScript, entryFile };
  }

  /**
   * Mounts and boots a project reliably
   */
  async bootstrapProject(
    projectId: string,
    files: FileNode[],
    options: {
      forceInstall?: boolean;
      inspectEnabled?: boolean;
      onOutput?: (type: 'log' | 'error' | 'system', text: string) => void;
    } = {}
  ): Promise<BootstrapStatus> {
    // Cancel any previous bootstrap in flight for this project
    const prevController = this.activeBootstraps.get(projectId);
    if (prevController) {
      prevController.abort();
    }
    const abortController = new AbortController();
    this.activeBootstraps.set(projectId, abortController);

    const log = (type: 'log' | 'error' | 'system', msg: string) => {
      options.onOutput?.(type, msg);
    };

    try {
      this.updateStatus(projectId, {
        projectId,
        state: 'validating',
        message: 'Validating project files and mounting filesystem...',
      });

      const wc = await getWebContainer();
      if (abortController.signal.aborted) return this.getStatus(projectId)!;

      // 1. Clean previous processes for this project
      await processManager.killAll(projectId);

      // 2. Mount filesystem
      log('system', 'Mounting project workspace to WebContainer VFS...');
      await clearWebContainerFS();
      const tree = this.buildTree(files, options.inspectEnabled);
      await wc.mount(tree);

      if (abortController.signal.aborted) return this.getStatus(projectId)!;

      // 3. Analyze project
      const analysis = this.analyzeProject(files);
      this.updateStatus(projectId, {
        framework: analysis.framework,
        hasPackageJson: analysis.hasPackageJson,
        script: analysis.startScript,
      });

      // ─── Case A: Static Web Application ───
      if (!analysis.hasPackageJson) {
        log('system', 'Detected static HTML/CSS/JS project. Starting local HTTP preview server...');
        this.updateStatus(projectId, {
          state: 'starting',
          message: 'Starting static preview server...',
        });

        const staticServerScript = `
const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
  let urlPath = req.url.split('?')[0];
  let p = path.join(__dirname, urlPath === '/' ? 'index.html' : urlPath);
  if (!fs.existsSync(p)) { 
    res.statusCode = 404; 
    return res.end('404 Not Found'); 
  }
  const ext = path.extname(p);
  const mime = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.svg': 'image/svg+xml'
  }[ext] || 'text/plain';
  res.setHeader('Content-Type', mime);
  res.end(fs.readFileSync(p));
});

server.listen(3000, () => {
  console.log('Static server ready on port 3000');
});
`;
        await wc.fs.writeFile('/.static-server.js', staticServerScript);
        await processManager.spawn(projectId, 'node', ['/.static-server.js']);

        this.updateStatus(projectId, {
          state: 'running',
          message: 'Static web server running on port 3000',
        });
        return this.getStatus(projectId)!;
      }

      // ─── Case B: Node / React / Express / EJS Project ───
      // Verify node_modules
      let nodeModulesValid = false;
      if (!options.forceInstall) {
        try {
          const nm = await wc.fs.readdir('/node_modules');
          if (nm && nm.length > 0) {
            nodeModulesValid = true;
          }
        } catch {
          nodeModulesValid = false;
        }
      }

      // Install dependencies if missing or requested
      if (!nodeModulesValid) {
        this.updateStatus(projectId, {
          state: 'installing',
          message: 'Installing project dependencies with npm...',
        });
        log('system', '▶ Running npm install --no-audit --no-fund --legacy-peer-deps...');

        // Pause filesystem sync polling so npm extraction does not trigger thrashing
        fsSyncService.pauseSync();
        let exitCode = 1;
        try {
          const installProc = await processManager.spawn(projectId, 'npm', [
            'install',
            '--prefer-offline',
            '--no-audit',
            '--no-fund',
            '--legacy-peer-deps',
          ]);
          exitCode = await installProc.exit;
        } finally {
          fsSyncService.resumeSync();
        }

        if (exitCode !== 0) {
          const err = `npm install failed with exit code ${exitCode}`;
          log('error', `❌ ${err}. Check terminal output for missing dependencies.`);
          this.updateStatus(projectId, {
            state: 'error',
            message: err,
            error: err,
          });
          return this.getStatus(projectId)!;
        }

        log('system', '✓ Dependencies installed successfully.');
        // Trigger a clean single sync of newly generated files (excluding node_modules)
        fsSyncService.triggerSync(500);
      }

      if (abortController.signal.aborted) return this.getStatus(projectId)!;

      // 4. Start Development / Runtime Server
      this.updateStatus(projectId, {
        state: 'starting',
        message: 'Starting project runtime...',
      });

      let startCmd = 'npm';
      let startArgs: string[] = [];

      if (analysis.startScript) {
        startArgs = ['run', analysis.startScript];
      } else if (analysis.packageJson?.scripts?.start) {
        startArgs = ['start'];
      } else if (analysis.entryFile) {
        startCmd = 'node';
        startArgs = [analysis.entryFile];
      } else {
        startCmd = 'node';
        startArgs = ['index.js'];
      }

      log('system', `▶ Launching ${startCmd} ${startArgs.join(' ')}...`);
      const runtimeProc = await processManager.spawn(projectId, startCmd, startArgs);

      this.updateStatus(projectId, {
        state: 'waiting-for-server',
        message: 'Waiting for server port readiness...',
      });

      // Monitor exit in case it immediately crashes
      runtimeProc.exit.then((code) => {
        if (code !== 0 && this.getStatus(projectId)?.state !== 'stopped') {
          const errMsg = `Server exited with code ${code}`;
          log('error', `❌ ${errMsg}`);
          this.updateStatus(projectId, {
            state: 'error',
            message: errMsg,
            error: errMsg,
          });
        }
      });

      return this.getStatus(projectId)!;
    } catch (e: any) {
      const errMsg = e.message || String(e);
      log('error', `Bootstrap failure: ${errMsg}`);
      this.updateStatus(projectId, {
        state: 'error',
        message: 'Bootstrap failed',
        error: errMsg,
      });
      return this.getStatus(projectId)!;
    } finally {
      this.activeBootstraps.delete(projectId);
    }
  }

  /**
   * Registers a server-ready URL to the corresponding project
   */
  registerServerUrl(projectId: string, url: string, port: number) {
    this.updateStatus(projectId, {
      state: 'running',
      serverUrl: url,
      port,
      message: `Application running on port ${port}`,
    });
  }

  /**
   * Stops all runtime processes for a project
   */
  async stopProject(projectId: string) {
    const controller = this.activeBootstraps.get(projectId);
    if (controller) controller.abort();
    await processManager.killAll(projectId);
    this.updateStatus(projectId, {
      state: 'stopped',
      message: 'Project stopped',
      serverUrl: undefined,
    });
  }
}

export const projectBootstrapService = new ProjectBootstrapService();
