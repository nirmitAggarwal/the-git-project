import React, { useState, useEffect } from 'react';
import { ConflictState } from '../types/git';
import { AlertTriangle, Check, Layers, Code, Sparkles } from 'lucide-react';
import { sound } from '../game/soundEngine';

interface ConflictResolverModalProps {
  conflict: ConflictState;
  onResolve: (resolvedContent: string) => void;
  onCancel?: () => void;
}

export const ConflictResolverModal: React.FC<ConflictResolverModalProps> = ({
  conflict,
  onResolve,
}) => {
  const [editorText, setEditorText] = useState('');

  useEffect(() => {
    // Initial conflicted content with standard markers
    setEditorText(
      `<<<<<<< HEAD (Current Change)\n${conflict.currentContent.trim()}\n=======\n${conflict.incomingContent.trim()}\n>>>>>>> incoming (Incoming Change)\n`
    );
  }, [conflict]);

  const handleKeepCurrent = () => {
    sound.playKeypress();
    setEditorText(conflict.currentContent.trim() + '\n');
  };

  const handleKeepIncoming = () => {
    sound.playKeypress();
    setEditorText(conflict.incomingContent.trim() + '\n');
  };

  const handleKeepBoth = () => {
    sound.playKeypress();
    setEditorText(`${conflict.currentContent.trim()}\n${conflict.incomingContent.trim()}\n`);
  };

  const handleSaveAndStage = () => {
    sound.playSuccess();
    onResolve(editorText);
  };

  const hasConflictMarkers =
    editorText.includes('<<<<<<<') || editorText.includes('=======') || editorText.includes('>>>>>>>');

  return (
    <div className="w-full bg-[#161b22] border-2 border-[#f0883e] rounded-lg overflow-hidden shadow-2xl font-mono text-xs my-3 animate-fadeIn">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#f0883e]/10 border-b border-[#f0883e]/30">
        <div className="flex items-center space-x-2 text-[#f0883e]">
          <AlertTriangle className="w-4 h-4 animate-bounce" />
          <span className="font-bold uppercase tracking-wider text-xs">
            Merge Conflict Detected in: <span className="underline">{conflict.file}</span>
          </span>
        </div>
        <span className="text-[11px] text-[#8b949e]">VS Code Conflict Resolution Style</span>
      </div>

      {/* Helper Bar / Quick Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 bg-[#0d1117] border-b border-[#30363d]">
        <div className="flex items-center space-x-2">
          <span className="text-[#8b949e] text-[11px]">Quick Resolution:</span>
          <button
            onClick={handleKeepCurrent}
            className="px-2.5 py-1 rounded bg-[#238636]/20 hover:bg-[#238636]/30 text-[#2ea043] border border-[#2ea043]/40 font-semibold transition"
          >
            Accept Current (HEAD)
          </button>
          <button
            onClick={handleKeepIncoming}
            className="px-2.5 py-1 rounded bg-[#58a6ff]/20 hover:bg-[#58a6ff]/30 text-[#58a6ff] border border-[#58a6ff]/40 font-semibold transition"
          >
            Accept Incoming
          </button>
          <button
            onClick={handleKeepBoth}
            className="px-2.5 py-1 rounded bg-[#bc8cff]/20 hover:bg-[#bc8cff]/30 text-[#bc8cff] border border-[#bc8cff]/40 font-semibold transition"
          >
            Accept Both
          </button>
        </div>

        <button
          onClick={handleSaveAndStage}
          disabled={hasConflictMarkers}
          className={`flex items-center space-x-1.5 px-3 py-1 rounded font-bold text-white transition ${
            hasConflictMarkers
              ? 'bg-[#30363d] cursor-not-allowed text-[#8b949e]'
              : 'bg-[#238636] hover:bg-[#2ea043] shadow-glow-green cursor-pointer'
          }`}
        >
          <Check className="w-3.5 h-3.5" />
          <span>Stage Resolved File (git add {conflict.file})</span>
        </button>
      </div>

      {/* Side-by-side / Interactive Editor */}
      <div className="p-4 bg-[#0d1117] space-y-3">
        <div className="text-[11px] text-[#8b949e] flex items-center justify-between">
          <span>Edit the file below or use one of the quick buttons above. All markers must be cleared:</span>
          {hasConflictMarkers ? (
            <span className="text-[#f85149] font-bold">⚠️ Unresolved markers remain</span>
          ) : (
            <span className="text-[#2ea043] font-bold">✓ Ready to stage</span>
          )}
        </div>

        <div className="relative">
          <textarea
            value={editorText}
            onChange={e => setEditorText(e.target.value)}
            rows={8}
            className="w-full p-3 bg-[#161b22] border border-[#30363d] rounded text-[#c9d1d9] font-mono text-xs leading-relaxed focus:outline-none focus:border-[#58a6ff]"
          />
        </div>
      </div>
    </div>
  );
};
