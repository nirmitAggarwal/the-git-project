import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Terminal as TerminalIcon, CornerDownLeft, Sparkles, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { sound } from '../game/soundEngine';

interface HistoryEntry {
  command: string;
  output: string;
  exitCode: number;
}

interface TerminalProps {
  currentBranch: string;
  onExecuteCommand: (command: string) => { stdout: string; exitCode: number; actionTaken?: string };
  availableFiles?: string[];
  suggestedCommand?: string;
  onShowHint?: () => void;
}

const COMMON_GIT_COMMANDS = [
  'git init',
  'git status',
  'git add .',
  'git add index.html',
  'git commit -m ""',
  'git log',
  'git log --oneline',
  'git show',
  'git branch',
  'git switch main',
  'git checkout main',
  'git merge',
  'git restore',
  'git reset --hard HEAD~1',
  'git revert',
  'git remote -v',
  'git remote add origin',
  'git push origin main',
  'git pull origin main',
  'git fetch origin',
  'clear',
  'ls',
  'cat',
  'help',
];

export const Terminal: React.FC<TerminalProps> = ({
  currentBranch,
  onExecuteCommand,
  availableFiles = [],
  suggestedCommand,
  onShowHint,
}) => {
  const [inputVal, setInputVal] = useState('');
  const [history, setHistory] = useState<HistoryEntry[]>([
    {
      command: '',
      output: `Welcome to the Git Terminal Simulator!\nType 'git status' or 'help' to get started.\nUse Tab for autocomplete, ↑/↓ for command history.`,
      exitCode: 0,
    },
  ]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  const terminalEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    sound.playKeypress();

    // Enter to execute command
    if (e.key === 'Enter') {
      const cmd = inputVal.trim();
      if (!cmd) return;

      const res = onExecuteCommand(cmd);

      if (res.actionTaken === 'CLEAR') {
        setHistory([]);
      } else {
        if (res.exitCode === 0) {
          sound.playSuccess();
        } else {
          sound.playError();
        }

        setHistory(prev => [
          ...prev,
          {
            command: cmd,
            output: res.stdout,
            exitCode: res.exitCode,
          },
        ]);
      }

      setCommandHistory(prev => [...prev, cmd]);
      setHistoryIndex(-1);
      setInputVal('');
      return;
    }

    // Up Arrow: History backward
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length === 0) return;
      const nextIdx = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIdx);
      setInputVal(commandHistory[nextIdx] || '');
      return;
    }

    // Down Arrow: History forward
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex === -1) return;
      const nextIdx = historyIndex + 1;
      if (nextIdx >= commandHistory.length) {
        setHistoryIndex(-1);
        setInputVal('');
      } else {
        setHistoryIndex(nextIdx);
        setInputVal(commandHistory[nextIdx]);
      }
      return;
    }

    // Tab: Autocomplete
    if (e.key === 'Tab') {
      e.preventDefault();
      const current = inputVal.trim();
      if (!current) return;

      const matches = COMMON_GIT_COMMANDS.filter(c => c.startsWith(current));
      if (matches.length === 1) {
        setInputVal(matches[0]);
      } else if (availableFiles.length > 0) {
        const fileMatches = availableFiles.filter(f => f.startsWith(current.split(' ').pop() || ''));
        if (fileMatches.length === 1) {
          const parts = current.split(' ');
          parts[parts.length - 1] = fileMatches[0];
          setInputVal(parts.join(' '));
        }
      }
    }
  };

  const handleClear = () => {
    setHistory([]);
    inputRef.current?.focus();
  };

  const handlePasteSuggestion = () => {
    if (suggestedCommand) {
      setInputVal(suggestedCommand);
      inputRef.current?.focus();
    }
  };

  // Convert ANSI escape codes or newlines to styled HTML
  const formatOutput = (text: string) => {
    if (!text) return null;
    const lines = text.split('\n');

    return lines.map((line, idx) => {
      // Colorize ANSI green \x1b[32m
      let styled = line
        .replace(/\x1b\[32m(.*?)\x1b\[0m/g, '<span class="text-[#2ea043] font-semibold">$1</span>')
        .replace(/\x1b\[31m(.*?)\x1b\[0m/g, '<span class="text-[#f85149] font-semibold">$1</span>')
        .replace(/\x1b\[33m(.*?)\x1b\[0m/g, '<span class="text-[#d29922] font-semibold">$1</span>')
        .replace(/\x1b\[36m(.*?)\x1b\[0m/g, '<span class="text-[#58a6ff] font-semibold">$1</span>');

      return (
        <div
          key={idx}
          className="leading-relaxed"
          dangerouslySetInnerHTML={{ __html: styled || '&nbsp;' }}
        />
      );
    });
  };

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      className="flex flex-col w-full h-[320px] bg-[#0d1117] border border-[#30363d] rounded-lg overflow-hidden shadow-xl font-mono text-xs cursor-text"
    >
      {/* Terminal Title Bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#161b22] border-b border-[#30363d] select-none text-[#8b949e]">
        <div className="flex items-center space-x-2">
          {/* macOS style dots */}
          <div className="flex space-x-1.5 mr-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#f85149]/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#d29922]/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#2ea043]/80 inline-block" />
          </div>
          <TerminalIcon className="w-3.5 h-3.5 text-[#58a6ff]" />
          <span className="font-semibold text-[#c9d1d9]">TERMINAL</span>
          <span className="text-[10px] text-[#6e7681]">bash — 80x24</span>
        </div>

        <div className="flex items-center space-x-2 text-[11px]">
          {suggestedCommand && (
            <button
              onClick={e => {
                e.stopPropagation();
                handlePasteSuggestion();
              }}
              className="flex items-center space-x-1 px-2 py-0.5 rounded bg-[#21262d] hover:bg-[#30363d] text-[#58a6ff] hover:text-[#79c0ff] transition"
              title="Click to paste suggested command"
            >
              <Sparkles className="w-3 h-3" />
              <span>Paste: {suggestedCommand}</span>
            </button>
          )}

          {onShowHint && (
            <button
              onClick={e => {
                e.stopPropagation();
                onShowHint();
              }}
              className="text-[#d29922] hover:underline px-1"
            >
              Need Hint?
            </button>
          )}

          <button
            onClick={e => {
              e.stopPropagation();
              handleClear();
            }}
            className="p-1 hover:bg-[#21262d] rounded text-[#8b949e] hover:text-white transition"
            title="Clear terminal"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Output Console Scroll Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 text-[#c9d1d9] selection:bg-[#238636] selection:text-white">
        {history.map((entry, i) => (
          <div key={i} className="space-y-1">
            {entry.command && (
              <div className="flex items-center space-x-2 text-[#8b949e]">
                <span className="text-[#58a6ff] font-bold">git-dev</span>
                <span>in</span>
                <span className="text-[#3fb950]">~/project</span>
                <span className="text-[#bc8cff]">({currentBranch})</span>
                <span className="text-[#c9d1d9]">$</span>
                <span className="text-white font-semibold">{entry.command}</span>
              </div>
            )}
            {entry.output && (
              <div
                className={`font-mono text-xs pl-2 border-l-2 ${
                  entry.exitCode === 0 ? 'border-[#30363d] text-[#c9d1d9]' : 'border-[#f85149] text-[#f85149]'
                }`}
              >
                {formatOutput(entry.output)}
              </div>
            )}
          </div>
        ))}

        {/* Live Input Line */}
        <div className="flex items-center space-x-2 pt-1">
          <span className="text-[#58a6ff] font-bold">git-dev</span>
          <span>in</span>
          <span className="text-[#3fb950]">~/project</span>
          <span className="text-[#bc8cff]">({currentBranch})</span>
          <span className="text-[#c9d1d9] font-bold">$</span>
          <input
            ref={inputRef}
            type="text"
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-white outline-none caret-[#2ea043] font-mono text-xs"
            placeholder="Type a git command (e.g. git status)..."
            autoFocus
            spellCheck={false}
            autoComplete="off"
          />
          <CornerDownLeft className="w-3 h-3 text-[#6e7681]" />
        </div>

        <div ref={terminalEndRef} />
      </div>
    </div>
  );
};
