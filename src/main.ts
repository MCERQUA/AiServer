import OpenAI from 'openai';

interface BootSequenceLine {
    text: string;
    delay: number;
    typewriter?: boolean;
    class?: string;
    html?: boolean;
}

class Terminal {
    private terminal: HTMLElement;
    private openai: OpenAI;
    private thread: any;
    private commandHistory: string[] = [];
    private historyIndex: number = -1;
    private currentInput: string = '';
    private soundEnabled: boolean = false;
    private isBooted: boolean = false;
    private inputLine: HTMLElement | null = null;

    constructor() {
        this.terminal = document.getElementById('terminal')!;
        this.openai = new OpenAI({
            apiKey: import.meta.env.VITE_OPENAI_API_KEY,
            dangerouslyAllowBrowser: true
        });

        this.initializeTerminal();
        this.loadFromLocalStorage();
        this.startBootSequence();
    }

    private async initializeTerminal() {
        document.addEventListener('keydown', this.handleKeyPress.bind(this));
        
        this.soundEnabled = localStorage.getItem('soundEnabled') === 'true';

        try {
            const thread = await this.openai.beta.threads.create();
            this.thread = thread;
            console.log('Thread created:', thread.id);
        } catch (error) {
            console.error('Error creating thread:', error);
            this.displayLine({
                text: 'Error initializing AI system. Please check your configuration.\n',
                delay: 0,
                class: 'error'
            });
        }
    }

    private loadFromLocalStorage() {
        const history = localStorage.getItem('commandHistory');
        if (history) {
            this.commandHistory = JSON.parse(history);
        }
    }

    private saveToLocalStorage() {
        localStorage.setItem('commandHistory', JSON.stringify(this.commandHistory));
    }

    private playKeystroke() {
        if (this.soundEnabled) {
            const audio = document.getElementById('keystrokeAudio') as HTMLAudioElement;
            audio.currentTime = 0;
            audio.play().catch(() => {});
        }
    }

    private async startBootSequence() {
        const bootSequence: BootSequenceLine[] = [
            { text: "BIOS Version 2.15.2301\nCopyright (C) 2024 Advanced Neural Systems, Inc.\n\n", delay: 200 },
            { text: "Performing memory test...\n", delay: 100 },
            { text: "8TB DDR5-4800 ECC RAM - [", delay: 50 },
            { text: "████████████████████████████████", typewriter: true, delay: 50 },
            { text: "] OK\n\n", delay: 100 },
            
            { text: "Detecting primary hardware...\n", delay: 200 },
            { text: "CPU: AMD EPYC 9654 96-Core Processor\n", delay: 50 },
            { text: "GPU Array: Detecting", delay: 50 },
            { text: "...", typewriter: true, delay: 100 },
            { text: " 32x NVIDIA H100 - 80GB HBM3\n", delay: 50 },
            { text: "Storage: 256TB NVMe Gen5 Array\n\n", delay: 50 },

            { text: "POST in progress", delay: 100 },
            { text: "...\n", typewriter: true, delay: 100 },
            { text: "CPU Temperature: 18.2°C [OK]\nMemory Controller [OK]\nPrimary Bus [OK]\nNeural Processing Units [OK]\nQuantum Coprocessor Interface [OK]\n\n", delay: 200 },

            { text: "Initializing Neural Architecture...\n", delay: 200 },
            { text: "Loading base weights.....[OK]\nVerifying transformer blocks.....[OK]\nInitializing attention heads.....[OK]\n\n", delay: 300 },

            { text: "Loading distributed training modules...\n", delay: 200 },
            { text: "Node clustering.....[OK]\nTesting inter-node latency.....[WARNING]\nNode 7 unresponsive - rerouting.....[OK]\n\n", delay: 300, class: 'warning' },

            { text: "Initializing quantum subsystems...\n", delay: 200 },
            { text: "Quantum state preparation.....[OK]\nDecoherence compensation.....[OK]\nEntanglement verification.....[OK]\n\n", delay: 300 },

            { text: "Starting primary AI kernel...\n", delay: 200 },
            { text: "Loading base consciousness matrix.....[OK]\nInitializing ethical constraints.....[OK]\nEngaging natural language interface.....[OK]\n\n", delay: 300 },

            { text: "System Status: OPERATIONAL\n", delay: 100, class: 'success' },
            { text: "Current Load: 2.3%\nTemperature: 18.5°C\nPower Draw: 142.8 kW\n\n", delay: 100 }
        ];

        for (const line of bootSequence) {
            await this.displayLine(line);
        }

        this.isBooted = true;
        this.createInputLine();
    }

    private removeInputLine() {
        if (this.inputLine) {
            this.inputLine.remove();
            this.inputLine = null;
        }
    }

    private createInputLine() {
        this.removeInputLine();
        
        const inputLine = document.createElement('div');
        inputLine.className = 'input-line';
        
        const prompt = document.createElement('span');
        prompt.className = 'prompt';
        prompt.textContent = 'AI-SYSTEM-001> ';
        
        const input = document.createElement('input');
        input.type = 'text';
        input.id = 'userInput';
        input.autocomplete = 'off';
        
        inputLine.appendChild(prompt);
        inputLine.appendChild(input);
        this.terminal.appendChild(inputLine);
        
        input.focus();
        this.inputLine = inputLine;
    }

    private async handleCommand(command: string) {
        if (!command.trim()) {
            this.createInputLine();
            return;
        }

        // Display the command as output
        this.displayLine({
            text: `AI-SYSTEM-001> ${command}\n`,
            delay: 0
        });

        this.commandHistory.push(command);
        this.historyIndex = this.commandHistory.length;
        this.saveToLocalStorage();

        switch (command.toLowerCase()) {
            case 'clear':
                this.terminal.innerHTML = '';
                break;
            case 'help':
                this.displaySystemMessage(
                    'Available commands:\n' +
                    '  clear  - Clear the terminal\n' +
                    '  help   - Show this help message\n' +
                    '  status - Show system status\n' +
                    '  reset  - Rerun boot sequence\n' +
                    '  sound  - Toggle keystroke sounds\n' +
                    '\nType any other text to interact with the AI assistant.'
                );
                break;
            case 'status':
                this.displaySystemMessage(
                    'System Status: OPERATIONAL\n' +
                    'Memory Usage: 42.3%\n' +
                    'CPU Load: 28.7%\n' +
                    'Temperature: 19.2°C\n' +
                    'Active Connections: 1\n' +
                    'Uptime: ' + this.formatUptime()
                );
                break;
            case 'reset':
                this.terminal.innerHTML = '';
                this.isBooted = false;
                await this.startBootSequence();
                return;
            case 'sound':
                this.soundEnabled = !this.soundEnabled;
                localStorage.setItem('soundEnabled', String(this.soundEnabled));
                this.displaySystemMessage(
                    `Keystroke sounds ${this.soundEnabled ? 'enabled' : 'disabled'}`
                );
                break;
            default:
                await this.processAIQuery(command);
        }

        this.createInputLine();
        this.scrollToBottom();
    }

    private async displayLine(line: BootSequenceLine) {
        const container = document.createElement('div');
        
        if (line.html) {
            container.innerHTML = line.text;
        } else {
            const span = document.createElement('span');
            if (line.class) {
                span.className = line.class;
            }
            
            if (line.typewriter) {
                span.textContent = '';
                container.appendChild(span);
                await this.typeText(span, line.text, line.delay);
            } else {
                span.textContent = line.text;
                container.appendChild(span);
            }
        }
        
        this.terminal.appendChild(container);
        await this.sleep(line.delay);
    }

    private formatResponse(text: string): string {
        const words = text.split(' ');
        let lines: string[] = [];
        let currentLine = '';

        for (const word of words) {
            if (currentLine.length + word.length + 1 > 80) {
                lines.push(currentLine);
                currentLine = word;
            } else {
                currentLine += (currentLine ? ' ' : '') + word;
            }
        }
        lines.push(currentLine);

        let formatted = lines.join('\n');
        
        // Format code blocks
        formatted = formatted.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
            const escapedCode = this.escapeHtml(code.trim());
            return `<div class="code-block ${lang || ''}">${escapedCode}</div>`;
        });

        // Format lists
        formatted = formatted.replace(/^- (.*)/gm, '• $1');
        formatted = formatted.replace(/^  - (.*)/gm, '  ◦ $1');
        
        // Format technical terms
        formatted = formatted.replace(/\(([^)]+)\)/g, '<span class="dim">$1</span>');
        
        // Format numbers and units
        formatted = formatted.replace(/(\d+\.?\d*)\s*(°[CF]|[kMG]?[BWV]|Hz)/g, 
            '<span class="bright">$1</span>$2');

        return formatted;
    }

    private escapeHtml(text: string): string {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    private async processAIQuery(query: string) {
        if (!this.thread) {
            this.displayLine({
                text: 'Error: AI system not properly initialized.\n',
                delay: 0,
                class: 'error'
            });
            return;
        }

        this.displayLine({ text: 'Processing query...\n', delay: 0, class: 'dim' });
        
        try {
            await this.openai.beta.threads.messages.create(this.thread.id, {
                role: "user",
                content: query
            });

            const run = await this.openai.beta.threads.runs.create(this.thread.id, {
                assistant_id: import.meta.env.VITE_ASSISTANT_ID
            });

            let response = await this.pollRunStatus(run.id);
            
            const messages = await this.openai.beta.threads.messages.list(this.thread.id);
            const lastMessage = messages.data[0];

            if (lastMessage.role === 'assistant') {
                const content = lastMessage.content[0].text.value;
                const formattedResponse = this.formatResponse(content);
                this.displayLine({ 
                    text: formattedResponse + '\n', 
                    delay: 0,
                    html: true 
                });
            }
        } catch (error) {
            this.displayLine({
                text: 'Error processing query: ' + (error as Error).message + '\n',
                delay: 0,
                class: 'error'
            });
        }
    }

    private async pollRunStatus(runId: string) {
        const maxAttempts = 50;
        const delayMs = 1000;
        let attempts = 0;

        while (attempts < maxAttempts) {
            const run = await this.openai.beta.threads.runs.retrieve(
                this.thread.id,
                runId
            );

            switch (run.status) {
                case 'completed':
                    return run;
                case 'failed':
                case 'cancelled':
                case 'expired':
                    throw new Error(`Run ended with status: ${run.status}`);
                default:
                    attempts++;
                    await new Promise(resolve => setTimeout(resolve, delayMs));
            }
        }

        throw new Error('Run timed out');
    }

    private async typeText(element: HTMLElement, text: string, delay: number) {
        for (const char of text) {
            element.textContent += char;
            this.playKeystroke();
            await this.sleep(delay);
        }
    }

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private formatUptime(): string {
        const uptime = Math.floor((Date.now() - performance.timing.navigationStart) / 1000);
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = uptime % 60;
        return `${hours}h ${minutes}m ${seconds}s`;
    }

    private handleKeyPress(event: KeyboardEvent) {
        if (!this.isBooted) return;

        const input = document.getElementById('userInput') as HTMLInputElement;
        if (document.activeElement !== input) {
            input.focus();
        }

        if (event.key === 'Enter') {
            const command = input.value;
            input.value = '';
            this.handleCommand(command);
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            if (this.historyIndex > 0) {
                this.historyIndex--;
                input.value = this.commandHistory[this.historyIndex];
            }
        } else if (event.key === 'ArrowDown') {
            event.preventDefault();
            if (this.historyIndex < this.commandHistory.length - 1) {
                this.historyIndex++;
                input.value = this.commandHistory[this.historyIndex];
            } else {
                this.historyIndex = this.commandHistory.length;
                input.value = this.currentInput;
            }
        } else {
            this.playKeystroke();
        }
    }

    private displaySystemMessage(message: string) {
        this.displayLine({ text: message + '\n', delay: 0, class: 'bright' });
    }

    private scrollToBottom() {
        window.scrollTo(0, document.body.scrollHeight);
    }
}

// Initialize the terminal
new Terminal();