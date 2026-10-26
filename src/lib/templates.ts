import { FileNode } from '@/types';

// Simple unique ID generator
const genId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

function createNode(name: string, type: 'file' | 'folder', content?: string, children?: FileNode[]): FileNode {
  return {
    id: genId(),
    name,
    type,
    content,
    children,
    language: type === 'file' ? getLang(name) : undefined,
  };
}

function getLang(name: string) {
  if (name.endsWith('.ts') || name.endsWith('.tsx')) return 'typescript';
  if (name.endsWith('.js') || name.endsWith('.jsx')) return 'javascript';
  if (name.endsWith('.css')) return 'css';
  if (name.endsWith('.html')) return 'html';
  if (name.endsWith('.json')) return 'json';
  if (name.endsWith('.py')) return 'python';
  if (name.endsWith('.c')) return 'c';
  if (name.endsWith('.cpp') || name.endsWith('.cc') || name.endsWith('.h')) return 'cpp';
  if (name.endsWith('.java')) return 'java';
  if (name.endsWith('.rs')) return 'rust';
  if (name.endsWith('.go')) return 'go';
  if (name.endsWith('.cs')) return 'csharp';
  if (name.endsWith('.sql')) return 'sql';
  return 'plaintext';
}

export const TEMPLATES = {
  html: (): FileNode[] => [
    createNode('index.html', 'file', `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HTML Project</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div id="app">
    <h1>Hello World</h1>
    <p>This is a standard HTML/CSS/JS project.</p>
  </div>
  <script src="script.js"></script>
</body>
</html>`),
    createNode('style.css', 'file', `body {
  font-family: system-ui, sans-serif;
  background-color: #1a1b26;
  color: #a9b1d6;
  display: grid;
  place-items: center;
  height: 100vh;
  margin: 0;
}
h1 { color: #7aa2f7; }
`),
    createNode('script.js', 'file', `console.log('App loaded!');
document.querySelector('h1').addEventListener('click', () => {
  alert('Header clicked!');
});
`),
  ],

  react: (): FileNode[] => [
    createNode('package.json', 'file', `{
  "name": "react-vite-app",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "vite": "^5.4.2"
  }
}`),
    createNode('index.html', 'file', `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>React + Vite</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`),
    createNode('vite.config.js', 'file', `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true
  }
})`),
    createNode('src', 'folder', undefined, [
      createNode('main.jsx', 'file', `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`),
      createNode('App.jsx', 'file', `import { useState } from 'react'
import './App.css'

export default function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="container">
      <h1>React + Vite</h1>
      <p className="subtitle">HRDK Pen WebContainer Development Environment</p>
      <div className="card">
        <button onClick={() => setCount((c) => c + 1)}>
          Count is {count}
        </button>
        <p>Edit <code>src/App.jsx</code> and save to test HMR</p>
      </div>
    </div>
  )
}`),
      createNode('App.css', 'file', `.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  font-family: system-ui, -apple-system, sans-serif;
  background: #11111b;
  color: #cdd6f4;
  text-align: center;
}
h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #89b4fa, #b4befe);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.subtitle {
  color: #a6adc8;
  margin-bottom: 2rem;
}
.card {
  padding: 2rem;
  background: #1e1e2e;
  border-radius: 12px;
  border: 1px solid #313244;
}
button {
  background: #89b4fa;
  color: #11111b;
  border: none;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.1s, opacity 0.2s;
}
button:hover {
  opacity: 0.9;
  transform: scale(1.02);
}
button:active {
  transform: scale(0.98);
}
code {
  background: #313244;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
}`),
      createNode('index.css', 'file', `* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}`),
    ]),
  ],

  node: (): FileNode[] => [
    createNode('package.json', 'file', `{
  "name": "node-project",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "start": "node --watch index.js",
    "dev": "node --watch index.js"
  },
  "dependencies": {}
}`),
    createNode('index.js', 'file', `console.log("Hello from Node.js!");

const os = require('os');
console.log('OS platform:', os.platform());
console.log('Arch:', os.arch());
`),
  ],

  express: (): FileNode[] => [
    createNode('package.json', 'file', `{
  "name": "express-api-project",
  "version": "1.0.0",
  "description": "Express.js REST API with route handling",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "node --watch server.js"
  },
  "dependencies": {
    "express": "^4.19.2",
    "cors": "^2.8.5"
  }
}`),
    createNode('server.js', 'file', `const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// API health and test endpoints
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'Welcome to HRDK Pen Express API Server!',
    timestamp: new Date().toISOString(),
    endpoints: ['/api/status', '/api/users']
  });
});

app.get('/api/status', (req, res) => {
  res.json({
    uptime: process.uptime(),
    nodeVersion: process.version,
    memoryUsage: process.memoryUsage()
  });
});

app.get('/api/users', (req, res) => {
  res.json([
    { id: 1, name: 'Alice Developer', role: 'Frontend Engineer' },
    { id: 2, name: 'Bob Architect', role: 'Fullstack Lead' }
  ]);
});

app.listen(port, () => {
  console.log(\`[Express] Server running and listening on port \${port}\`);
});
`),
  ],

  ejs: (): FileNode[] => [
    createNode('package.json', 'file', `{
  "name": "express-ejs-app",
  "version": "1.0.0",
  "description": "Express.js application rendering EJS server templates",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "node --watch server.js"
  },
  "dependencies": {
    "express": "^4.19.2",
    "ejs": "^3.1.10"
  }
}`),
    createNode('server.js', 'file', `const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// Configure EJS view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.render('index', {
    title: 'HRDK Pen EJS App',
    heading: 'Server-Side Rendering with EJS & Express',
    items: ['Fast Node.js VFS', 'Live Template Rendering', 'Zero Host Dependencies']
  });
});

app.listen(port, () => {
  console.log(\`[EJS App] Server listening at http://localhost:\${port}\`);
});
`),
    createNode('views', 'folder', undefined, [
      createNode('index.ejs', 'file', `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><%= title %></title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #0f111a;
      color: #e2e8f0;
      padding: 3rem 2rem;
      max-width: 700px;
      margin: 0 auto;
    }
    h1 { color: #60a5fa; margin-bottom: 0.5rem; }
    p { color: #94a3b8; font-size: 1.1rem; }
    .card {
      background: #1e2230;
      border: 1px solid #334155;
      border-radius: 12px;
      padding: 1.5rem;
      margin-top: 2rem;
    }
    li { margin-bottom: 0.5rem; color: #cbd5e1; }
  </style>
</head>
<body>
  <h1><%= heading %></h1>
  <p>Rendered server-side inside WebContainer runtime.</p>

  <div class="card">
    <h3>Features Active:</h3>
    <ul>
      <% items.forEach(function(item) { %>
        <li>✓ <%= item %></li>
      <% }); %>
    </ul>
  </div>
</body>
</html>`),
    ]),
  ],


  python: (): FileNode[] => [
    createNode('main.py', 'file', `def main():
    print("Hello from Python!")
    name = input("What is your name? ")
    print(f"Welcome to HRDK Pen, {name}")

if __name__ == "__main__":
    main()
`),
  ],

  c: (): FileNode[] => [
    createNode('main.c', 'file', `#include <stdio.h>

int main() {
    printf("Hello from C!\\n");
    return 0;
}
`),
  ],

  cpp: (): FileNode[] => [
    createNode('main.cpp', 'file', `#include <iostream>

int main() {
    std::cout << "Hello from C++ in HRDK Pen!" << std::endl;
    return 0;
}
`),
  ],

  java: (): FileNode[] => [
    createNode('Main.java', 'file', `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello from Java 15 on HRDK Pen!");
        int sum = 0;
        for (int i = 1; i <= 10; i++) sum += i;
        System.out.println("Sum of 1..10 = " + sum);
    }
}
`),
  ],

  rust: (): FileNode[] => [
    createNode('main.rs', 'file', `fn main() {
    println!("Hello from Rust on HRDK Pen!");
    let numbers = vec![1, 2, 3, 4, 5];
    let doubled: Vec<i32> = numbers.iter().map(|x| x * 2).collect();
    println!("Doubled: {:?}", doubled);
}
`),
  ],

  go: (): FileNode[] => [
    createNode('main.go', 'file', `package main

import (
    "fmt"
    "time"
)

func main() {
    fmt.Println("Hello from Go on HRDK Pen!")
    fmt.Printf("Current UTC Time: %s\\n", time.Now().UTC().Format(time.RFC1123))
}
`),
  ],

  csharp: (): FileNode[] => [
    createNode('Program.cs', 'file', `using System;

namespace HrdkPenApp
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("Hello from C# / .NET on HRDK Pen!");
            Console.WriteLine($"Environment: {Environment.OSVersion}");
        }
    }
}
`),
  ],

  sql: (): FileNode[] => [
    createNode('query.sql', 'file', `-- Interactive SQL Playground
CREATE TABLE users (
    id INT,
    username VARCHAR,
    role VARCHAR
);

INSERT INTO users VALUES (1, 'hardik', 'admin');
INSERT INTO users VALUES (2, 'developer', 'engineer');
INSERT INTO users VALUES (3, 'designer', 'ui/ux');

SELECT * FROM users;
`),
  ],

  empty: (): FileNode[] => [],
};
