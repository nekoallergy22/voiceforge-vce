import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
    try {
        console.log('VoiceForge extension is activating...');
        
        const disposable = vscode.commands.registerCommand('voiceforge.openEditor', (uri: vscode.Uri) => {
            try {
                console.log('Opening VoiceForge editor for:', uri.fsPath);
                
                const panel = vscode.window.createWebviewPanel(
                    'voiceforge',
                    'VoiceForge',
                    vscode.ViewColumn.One,
                    {
                        enableScripts: true,
                        retainContextWhenHidden: true
                    }
                );

                const filePath = uri.fsPath;
                
                if (!fs.existsSync(filePath)) {
                    vscode.window.showErrorMessage(`File not found: ${filePath}`);
                    return;
                }
                
                const fileContent = fs.readFileSync(filePath, 'utf8');
                const lines = fileContent.split('\n');

                const fileName = path.basename(filePath);
                panel.webview.html = getWebviewContent(lines, fileName);
                
                console.log('Webview content set successfully');

                panel.webview.onDidReceiveMessage(
                    message => {
                        try {
                            switch (message.command) {
                                case 'save':
                                    const updatedContent = message.lines.join('\n');
                                    fs.writeFileSync(filePath, updatedContent, 'utf8');
                                    vscode.window.showInformationMessage('File saved successfully!');
                                    break;
                            }
                        } catch (error) {
                            console.error('Error handling webview message:', error);
                            vscode.window.showErrorMessage(`Error saving file: ${error instanceof Error ? error.message : String(error)}`);
                        }
                    },
                    undefined,
                    context.subscriptions
                );
            } catch (error) {
                console.error('Error opening VoiceForge editor:', error);
                vscode.window.showErrorMessage(`Failed to open VoiceForge: ${error instanceof Error ? error.message : String(error)}`);
            }
        });

        context.subscriptions.push(disposable);
        console.log('VoiceForge extension activated successfully');
    } catch (error) {
        console.error('Error activating VoiceForge extension:', error);
        vscode.window.showErrorMessage(`Failed to activate VoiceForge: ${error instanceof Error ? error.message : String(error)}`);
    }
}

function getWebviewContent(lines: string[], fileName: string): string {
    let contentLineNumber = 0;
    const lineInputs = lines.map((line, index) => {
        const isEmpty = line.trim() === '';
        const isHeading = line.trim().match(/^#{1,6}\s+(.*)/);
        
        // Only increment for non-empty, non-heading lines
        if (!isEmpty && !isHeading) {
            contentLineNumber++;
        }
        
        if (isHeading) {
            const headingMatch = line.trim().match(/^(#{1,6})/);
            const headingLevel = headingMatch ? headingMatch[1].length : 1;
            const headingText = line.trim().replace(/^#{1,6}\s+/, '');
            return `<div class="line-container heading-container">
                <div class="heading-display heading-${headingLevel}">${escapeHtml(headingText)}</div>
                <input type="hidden" class="line-input" value="${escapeHtml(line)}" data-line="${index}" data-is-heading="true">
            </div>`;
        }
        
        if (isEmpty) {
            return `<div class="line-container empty-line">
                <input type="hidden" class="line-input" value="" data-line="${index}" data-is-empty="true">
            </div>`;
        }
        
        return `<div class="line-container">
            <span class="line-number">${contentLineNumber}</span>
            <input type="text" class="line-input" value="${escapeHtml(line)}" data-line="${index}">
            <div class="line-buttons">
                <button class="line-button play-button" onclick="playLine(${index})">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z"/>
                    </svg>
                </button>
                <button class="line-button stop-button" onclick="stopLine(${index})">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <rect x="6" y="6" width="12" height="12"/>
                    </svg>
                </button>
            </div>
            <div class="numeric-inputs">
                <input type="number" class="numeric-input slide-no" placeholder="0" min="0" step="1" value="0" onkeydown="handleTabNavigation(event, ${index})" onchange="handleSlideNoChange(event, ${contentLineNumber})">
                <input type="number" class="numeric-input contents-no" placeholder="0" min="0" step="1" value="1" readonly>
            </div>
        </div>`;
    }).join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>VoiceForge</title>
    <style>
        body {
            font-family: var(--vscode-font-family);
            background-color: var(--vscode-editor-background);
            color: var(--vscode-editor-foreground);
            margin: 0;
            padding: 20px;
        }
        .line-container {
            display: flex;
            align-items: center;
            margin-bottom: 8px;
        }
        .line-number {
            width: 40px;
            text-align: right;
            margin-right: 12px;
            color: var(--vscode-editorLineNumber-foreground);
            font-size: 12px;
        }
        .line-input {
            flex: 1;
            background-color: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border: 1px solid var(--vscode-input-border);
            border-radius: 2px;
            padding: 4px 8px;
            font-family: var(--vscode-editor-font-family);
            font-size: var(--vscode-editor-font-size);
        }
        .line-input:focus {
            border-color: var(--vscode-focusBorder);
            outline: none;
        }
        .header {
            padding: 15px 0;
            margin-bottom: 20px;
            border-bottom: 1px solid var(--vscode-widget-border);
        }
        .header-top {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }
        .file-name {
            font-size: 16px;
            font-weight: bold;
            color: var(--vscode-editor-foreground);
        }
        .header-controls {
            display: flex;
            align-items: center;
            gap: 20px;
        }
        .control-group {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .control-group label {
            font-size: 12px;
            color: var(--vscode-descriptionForeground);
            white-space: nowrap;
        }
        .api-key-input {
            width: 200px;
            padding: 4px 8px;
            border: 1px solid var(--vscode-input-border);
            border-radius: 2px;
            background-color: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            font-size: 12px;
        }
        .api-key-input:focus {
            border-color: var(--vscode-focusBorder);
            outline: none;
        }
        .control-buttons {
            display: flex;
            gap: 8px;
        }
        .header-button {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 6px 12px;
            border: none;
            border-radius: 3px;
            cursor: pointer;
            font-size: 12px;
            font-weight: 500;
        }
        .export-button {
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
        }
        .export-button:hover {
            background-color: var(--vscode-button-hoverBackground);
        }
        .json-button {
            background-color: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
        }
        .json-button:hover {
            background-color: var(--vscode-button-secondaryHoverBackground);
        }
        .line-buttons {
            display: flex;
            gap: 4px;
            margin-left: 8px;
        }
        .line-button {
            width: 24px;
            height: 24px;
            border: none;
            border-radius: 2px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
        }
        .line-button:hover {
            background-color: var(--vscode-button-secondaryHoverBackground);
        }
        .play-button svg {
            color: var(--vscode-charts-green);
        }
        .stop-button svg {
            color: var(--vscode-charts-red);
        }
        .numeric-inputs {
            display: flex;
            gap: 8px;
            margin-left: 12px;
        }
        .numeric-input {
            width: 40px;
            padding: 4px 4px;
            border: 1px solid var(--vscode-input-border);
            border-radius: 2px;
            background-color: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            font-size: 12px;
            text-align: center;
        }
        .numeric-input:focus {
            border-color: var(--vscode-focusBorder);
            outline: none;
        }
        .numeric-input:disabled {
            background-color: var(--vscode-input-background);
            color: var(--vscode-disabledForeground);
            cursor: not-allowed;
        }
        .column-headers {
            display: flex;
            align-items: center;
            margin-top: 10px;
            padding: 5px 0;
            border-bottom: 1px solid var(--vscode-widget-border);
            font-size: 11px;
            color: var(--vscode-descriptionForeground);
        }
        .col-header {
            display: flex;
            align-items: center;
        }
        .col-no {
            width: 40px;
            margin-right: 12px;
            text-align: center;
        }
        .col-text {
            flex: 1;
            margin-right: 8px;
        }
        .col-buttons {
            width: 56px;
            margin-right: 12px;
        }
        .col-slide {
            width: 40px;
            margin-right: 8px;
            text-align: center;
        }
        .col-contents {
            width: 40px;
            text-align: center;
        }
        .empty-line {
            height: 16px;
            margin: 8px 0;
        }
        .slide-no::-webkit-outer-spin-button,
        .slide-no::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
        }
        .slide-no[type=number] {
            -moz-appearance: textfield;
        }
        .contents-no {
            background-color: var(--vscode-input-background);
            color: var(--vscode-disabledForeground);
            cursor: default;
        }
        .contents-no::-webkit-outer-spin-button,
        .contents-no::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
        }
        .contents-no[type=number] {
            -moz-appearance: textfield;
        }
        .heading-container {
            background-color: var(--vscode-editor-background);
            margin: 12px 0;
        }
        .heading-display {
            font-weight: bold;
            color: var(--vscode-editor-foreground);
            padding: 8px 12px;
            border-left: 4px solid var(--vscode-focusBorder);
        }
        .heading-1 {
            font-size: 18px;
            border-left-color: var(--vscode-charts-red);
        }
        .heading-2 {
            font-size: 16px;
            border-left-color: var(--vscode-charts-orange);
        }
        .heading-3 {
            font-size: 14px;
            border-left-color: var(--vscode-charts-yellow);
        }
        .heading-4 {
            font-size: 13px;
            border-left-color: var(--vscode-charts-green);
        }
        .heading-5 {
            font-size: 12px;
            border-left-color: var(--vscode-charts-blue);
        }
        .heading-6 {
            font-size: 11px;
            border-left-color: var(--vscode-charts-purple);
        }
        .empty-input {
            background-color: var(--vscode-editor-inactiveSelectionBackground);
            opacity: 0.6;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="header-top">
            <div class="file-name">${escapeHtml(fileName)}</div>
            <div class="header-controls">
                <div class="control-group">
                    <label for="api-key">Google TTS API Key:</label>
                    <input type="password" id="api-key" class="api-key-input" placeholder="Enter your API key" />
                </div>
                <div class="control-buttons">
                    <button class="header-button export-button" onclick="exportAudio()">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                        Export Audio
                    </button>
                    <button class="header-button json-button" onclick="exportJson()">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2m7 6h3v2h-3v3h-2v-3H7V9h3V6h2v3z"/>
                        </svg>
                        Generate JSON
                    </button>
                </div>
            </div>
        </div>
        <div class="column-headers">
            <span class="col-header col-no">No</span>
            <span class="col-header col-text">Text</span>
            <span class="col-header col-buttons"></span>
            <span class="col-header col-slide">Slide No</span>
            <span class="col-header col-contents">Contents No</span>
        </div>
    </div>
    <div class="editor-container">
        ${lineInputs}
    </div>

    <script>
        const vscode = acquireVsCodeApi();

        function saveFile() {
            const inputs = document.querySelectorAll('.line-input');
            const lines = Array.from(inputs).map(input => {
                const isEmpty = input.dataset.isEmpty === 'true';
                const isHeading = input.dataset.isHeading === 'true';
                
                if (isEmpty) {
                    return ''; // Preserve empty lines
                }
                if (isHeading) {
                    return input.value; // Preserve original heading markup
                }
                return input.value;
            });
            
            vscode.postMessage({
                command: 'save',
                lines: lines
            });
        }

        function playLine(lineIndex) {
            // Placeholder function for play functionality
            console.log('Play line:', lineIndex);
        }

        function stopLine(lineIndex) {
            // Placeholder function for stop functionality
            console.log('Stop line:', lineIndex);
        }

        function exportAudio() {
            // Placeholder function for future audio export functionality
            alert('Audio export feature will be implemented in future versions.');
        }

        function exportJson() {
            const containers = document.querySelectorAll('.line-container:not(.heading-container):not(.empty-line)');
            const jsonData = [];
            
            containers.forEach((container, index) => {
                const lineInput = container.querySelector('.line-input');
                const slideInput = container.querySelector('.slide-no');
                const contentsInput = container.querySelector('.contents-no');
                
                if (lineInput && slideInput && contentsInput) {
                    jsonData.push({
                        no: index + 1,
                        text: lineInput.value,
                        slideNo: parseInt(slideInput.value) || 0,
                        contentsNo: parseInt(contentsInput.value) || 1
                    });
                }
            });
            
            // Create downloadable JSON file
            const jsonString = JSON.stringify(jsonData, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            // Create temporary download link
            const a = document.createElement('a');
            a.href = url;
            a.download = 'voiceforge-data.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            console.log('JSON exported:', jsonData);
        }

        function handleTabNavigation(event, currentIndex) {
            if (event.key === 'Tab') {
                event.preventDefault();
                const slideInputs = document.querySelectorAll('.slide-no');
                const currentInput = event.target;
                let currentSlideIndex = -1;
                
                slideInputs.forEach((input, index) => {
                    if (input === currentInput) {
                        currentSlideIndex = index;
                    }
                });
                
                if (currentSlideIndex !== -1 && currentSlideIndex < slideInputs.length - 1) {
                    slideInputs[currentSlideIndex + 1].focus();
                }
            }
        }

        function calculateContentsNumbers() {
            try {
                const containers = document.querySelectorAll('.line-container:not(.heading-container):not(.empty-line)');
                
                if (containers.length === 0) {
                    console.log('No content containers found, skipping calculation');
                    return;
                }
                
                let currentSlideValue = null;
                let contentsCounter = 1;
                
                containers.forEach((container) => {
                    const slideInput = container.querySelector('.slide-no');
                    const contentsInput = container.querySelector('.contents-no');
                    
                    if (!slideInput || !contentsInput) return;
                    
                    const slideValue = parseInt(slideInput.value) || 0;
                    
                    if (currentSlideValue !== slideValue) {
                        // Slide number changed, reset contents counter
                        currentSlideValue = slideValue;
                        contentsCounter = 1;
                    }
                    
                    contentsInput.value = contentsCounter;
                    contentsCounter++;
                });
            } catch (error) {
                console.error('Error in calculateContentsNumbers:', error);
            }
        }

        function handleSlideNoChange(event, currentLineNo) {
            const newValue = parseInt(event.target.value) || 0;
            const slideInputs = document.querySelectorAll('.slide-no');
            const currentInput = event.target;
            let currentSlideIndex = -1;
            
            slideInputs.forEach((input, index) => {
                if (input === currentInput) {
                    currentSlideIndex = index;
                }
            });
            
            // Update all subsequent slide numbers to the same value
            if (currentSlideIndex !== -1) {
                for (let i = currentSlideIndex + 1; i < slideInputs.length; i++) {
                    slideInputs[i].value = newValue;
                }
            }
            
            // Recalculate all contents numbers
            calculateContentsNumbers();
        }

        // Initialize contents numbers
        function initializeContentsNumbers() {
            try {
                calculateContentsNumbers();
            } catch (error) {
                console.error('Error initializing contents numbers:', error);
            }
        }
        
        // Single initialization after DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initializeContentsNumbers);
        } else {
            // DOM is already ready
            setTimeout(initializeContentsNumbers, 100);
        }

        document.addEventListener('keydown', function(e) {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                saveFile();
            }
        });
    </script>
</body>
</html>`;
}

function escapeHtml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

export function deactivate() {}