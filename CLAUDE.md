# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a VS Code extension called "MD Line Editor" that provides a line-by-line editor for markdown files using a webview interface. The extension adds a context menu item to markdown files in the explorer, allowing users to open them in a specialized editor where each line can be edited individually with line numbers.

## Architecture

- **Single-file extension**: The main logic is contained in `src/extension.ts`
- **Webview-based UI**: Creates a custom webview panel with HTML/CSS/JavaScript for the editor interface
- **File I/O**: Direct filesystem operations using Node.js `fs` module to read/write markdown files
- **Command registration**: Registers the `mdLineEditor.openEditor` command that appears in explorer context menus for `.md` files

### Key Components

- **Extension activation**: Registers command and handles webview creation
- **Webview content generation**: Creates HTML interface with line-numbered inputs for each line of the markdown file
- **Message handling**: Bidirectional communication between webview and extension for save operations
- **HTML escaping**: Properly escapes content to prevent XSS in the webview

## Common Development Commands

```bash
# Compile TypeScript to JavaScript
npm run compile

# Watch mode for development (auto-compile on changes)
npm run watch

# Prepare for publishing (runs compile)
npm run vscode:prepublish
```

## Build Process

The extension uses TypeScript compilation with the following configuration:
- Source files in `src/` directory
- Compiled output to `out/` directory  
- Target: ES2020, CommonJS modules
- Source maps enabled for debugging
- Entry point: `out/extension.js`

## VS Code Extension Structure

- **Package.json**: Defines extension metadata, commands, menus, and activation events
- **Main entry**: `./out/extension.js` (compiled from `src/extension.ts`)
- **Command**: `mdLineEditor.openEditor` - opens markdown files in line editor
- **Context menu**: Appears on right-click of `.md` files in explorer
- **Activation**: No specific activation events (loads on demand when command is invoked)

## Webview Communication Pattern

The extension uses VS Code's webview API with a message-passing system:
- Extension creates webview panel with HTML content
- Webview sends `save` command with updated line array
- Extension handles save by writing joined lines back to filesystem
- Success feedback shown via VS Code information message