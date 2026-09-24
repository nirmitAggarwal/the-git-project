import React, { useEffect, useRef, useState } from 'react';
import { Commit, RepositoryState } from '../types/git';
import { Eye, GitCommit, GitBranch, ArrowRight, X } from 'lucide-react';

interface GitGraphCanvasProps {
  repoState: RepositoryState;
  onSelectCommit?: (commit: Commit) => void;
}

interface NodePosition {
  commit: Commit;
  x: number;
  y: number;
  lane: number;
  branchName: string;
  color: string;
}

const BRANCH_COLORS = [
  '#2ea043', // Green (main)
  '#58a6ff', // Blue (feature 1)
  '#bc8cff', // Purple (feature 2)
  '#f0883e', // Orange (hotfix)
  '#39d353', // Bright Green
  '#79c0ff', // Light Blue
];

export const GitGraphCanvas: React.FC<GitGraphCanvasProps> = ({ repoState, onSelectCommit }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [selectedCommit, setSelectedCommit] = useState<Commit | null>(null);
  const [hoveredNode, setHoveredNode] = useState<NodePosition | null>(null);

  // Layout commit nodes in a topological tree
  const computeNodePositions = (): NodePosition[] => {
    const commits = Object.values(repoState.commits);
    if (commits.length === 0) return [];

    // Sort commits chronologically
    const sorted = [...commits].sort((a, b) => a.timestamp - b.timestamp);

    const positions: NodePosition[] = [];
    const branchLanes: Record<string, number> = { main: 0 };
    let nextLane = 1;

    // Track which lane each branch is on
    sorted.forEach((commit, index) => {
      let branchName = commit.branch || 'main';
      if (branchLanes[branchName] === undefined) {
        branchLanes[branchName] = nextLane++;
      }

      const lane = branchLanes[branchName];
      const color = BRANCH_COLORS[lane % BRANCH_COLORS.length];

      // Horizontal spacing
      const x = 70 + index * 95;
      // Vertical lane spacing
      const y = 80 + lane * 55;

      positions.push({
        commit,
        x,
        y,
        lane,
        branchName,
        color,
      });
    });

    return positions;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let pulseOffset = 0;

    const render = () => {
      pulseOffset += 0.05;
      const positions = computeNodePositions();

      // Adjust canvas resolution for sharp retina screens
      const dpr = window.devicePixelRatio || 1;
      const width = Math.max(canvas.clientWidth, positions.length * 105 + 160);
      const height = canvas.clientHeight || 220;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      // Draw subtle background grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      if (positions.length === 0) {
        ctx.fillStyle = '#8b949e';
        ctx.font = '13px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(
          repoState.initialized
            ? 'No commits yet. Run `git add` and `git commit` to create your first node!'
            : 'Repository not initialized. Type `git init` to begin.',
          width / 2,
          height / 2
        );
        ctx.restore();
        return;
      }

      const posMap = new Map<string, NodePosition>();
      positions.forEach(p => posMap.set(p.commit.id, p));

      // 1. Draw Connection Lines (Bezier curves between parents and children)
      positions.forEach(child => {
        child.commit.parentIds.forEach(parentId => {
          const parent = posMap.get(parentId);
          if (!parent) return;

          ctx.beginPath();
          ctx.lineWidth = 3;
          ctx.strokeStyle = child.color;

          if (parent.y === child.y) {
            // Straight horizontal line
            ctx.moveTo(parent.x, parent.y);
            ctx.lineTo(child.x, child.y);
          } else {
            // Smooth S-curve / Bezier branch connection
            ctx.moveTo(parent.x, parent.y);
            const midX = (parent.x + child.x) / 2;
            ctx.bezierCurveTo(midX, parent.y, midX, child.y, child.x, child.y);
          }
          ctx.stroke();
        });
      });

      // 2. Draw Commit Nodes
      positions.forEach(node => {
        const isHead = repoState.headCommitId === node.commit.id;
        const isHovered = hoveredNode?.commit.id === node.commit.id;
        const isSelected = selectedCommit?.id === node.commit.id;

        // Outer glow on HEAD or selected
        if (isHead || isSelected) {
          const glowRadius = 16 + Math.sin(pulseOffset) * 3;
          const gradient = ctx.createRadialGradient(node.x, node.y, 8, node.x, node.y, glowRadius);
          gradient.addColorStop(0, node.color + 'aa');
          gradient.addColorStop(1, 'transparent');
          ctx.beginPath();
          ctx.arc(node.x, node.y, glowRadius, 0, Math.PI * 2);
          ctx.fillStyle = gradient;
          ctx.fill();
        }

        // Base node circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, isHovered ? 11 : 9, 0, Math.PI * 2);
        ctx.fillStyle = '#0d1117';
        ctx.fill();
        ctx.lineWidth = isHead ? 3.5 : 2.5;
        ctx.strokeStyle = node.color;
        ctx.stroke();

        // Inner center dot
        ctx.beginPath();
        ctx.arc(node.x, node.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.fill();

        // Short commit hash label below node
        ctx.fillStyle = isHovered ? '#ffffff' : '#8b949e';
        ctx.font = '11px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(node.commit.shortId, node.x, node.y + 24);

        // Branch badges pointing to this commit
        const branchesHere = Object.entries(repoState.branches)
          .filter(([, cId]) => cId === node.commit.id)
          .map(([bName]) => bName);

        // Remote tracking branches pointing to this commit
        const remotesHere = Object.entries(repoState.remoteTrackingBranches)
          .filter(([, cId]) => cId === node.commit.id)
          .map(([rbName]) => rbName);

        let badgeY = node.y - 18;

        // Draw HEAD indicator if pointing here
        if (isHead) {
          const headText = `HEAD -> ${repoState.currentBranch}`;
          const headWidth = ctx.measureText(headText).width + 12;

          ctx.fillStyle = '#238636';
          ctx.beginPath();
          ctx.roundRect(node.x - headWidth / 2, badgeY - 14, headWidth, 18, 4);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 10px "JetBrains Mono", monospace';
          ctx.textAlign = 'center';
          ctx.fillText(headText, node.x, badgeY - 1);

          badgeY -= 22;
        }

        // Draw other branch labels (if not already covered by HEAD)
        branchesHere.forEach(b => {
          if (isHead && b === repoState.currentBranch) return;
          const bText = b;
          const bWidth = ctx.measureText(bText).width + 12;

          ctx.fillStyle = '#1f242c';
          ctx.strokeStyle = '#58a6ff';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect(node.x - bWidth / 2, badgeY - 14, bWidth, 18, 4);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#58a6ff';
          ctx.font = '10px "JetBrains Mono", monospace';
          ctx.textAlign = 'center';
          ctx.fillText(bText, node.x, badgeY - 1);

          badgeY -= 22;
        });

        // Draw remote labels e.g. origin/main
        remotesHere.forEach(rb => {
          const rbText = rb;
          const rbWidth = ctx.measureText(rbText).width + 12;

          ctx.fillStyle = '#1f242c';
          ctx.strokeStyle = '#f85149';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect(node.x - rbWidth / 2, badgeY - 14, rbWidth, 18, 4);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#f85149';
          ctx.font = '10px "JetBrains Mono", monospace';
          ctx.textAlign = 'center';
          ctx.fillText(rbText, node.x, badgeY - 1);

          badgeY -= 22;
        });
      });

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [repoState, hoveredNode, selectedCommit]);

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const positions = computeNodePositions();
    const hovered = positions.find(node => {
      const dist = Math.hypot(node.x - mouseX, node.y - mouseY);
      return dist <= 16;
    });

    setHoveredNode(hovered || null);
    canvas.style.cursor = hovered ? 'pointer' : 'default';
  };

  const handleCanvasClick = () => {
    if (hoveredNode) {
      setSelectedCommit(hoveredNode.commit);
      if (onSelectCommit) {
        onSelectCommit(hoveredNode.commit);
      }
    }
  };

  return (
    <div className="relative flex flex-col w-full bg-[#0d1117] border border-[#30363d] rounded-lg overflow-hidden shadow-md">
      {/* Visual Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#161b22] border-b border-[#30363d] text-xs font-mono text-[#8b949e]">
        <div className="flex items-center space-x-2">
          <GitBranch className="w-3.5 h-3.5 text-[#58a6ff]" />
          <span className="font-semibold text-[#c9d1d9]">VISUAL GIT GRAPH (DAG)</span>
          <span className="bg-[#21262d] px-1.5 py-0.5 rounded text-[11px] text-[#58a6ff]">
            branch: {repoState.currentBranch}
          </span>
        </div>
        <div className="flex items-center space-x-3 text-[11px]">
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-[#2ea043] animate-pulse"></span>
            <span>HEAD: {repoState.headCommitId ? repoState.headCommitId.slice(0, 7) : 'none'}</span>
          </span>
          <span>Click node to inspect</span>
        </div>
      </div>

      {/* Canvas container with horizontal scroll support */}
      <div ref={containerRef} className="w-full overflow-x-auto overflow-y-hidden p-2 min-h-[200px] flex items-center">
        <canvas
          ref={canvasRef}
          className="block h-[200px]"
          onMouseMove={handleCanvasMouseMove}
          onClick={handleCanvasClick}
          onMouseLeave={() => setHoveredNode(null)}
        />
      </div>

      {/* Commit Detail Modal / Popover */}
      {selectedCommit && (
        <div className="p-3 bg-[#161b22] border-t border-[#30363d] text-xs font-mono animate-fadeIn flex flex-col gap-2">
          <div className="flex items-center justify-between text-[#c9d1d9] border-b border-[#21262d] pb-2">
            <div className="flex items-center space-x-2">
              <GitCommit className="w-4 h-4 text-[#58a6ff]" />
              <span className="font-semibold text-sm text-[#58a6ff]">{selectedCommit.shortId}</span>
              <span className="text-[#8b949e]">— {selectedCommit.message}</span>
            </div>
            <button
              onClick={() => setSelectedCommit(null)}
              className="p-1 hover:bg-[#21262d] rounded text-[#8b949e] hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-[#8b949e]">
            <div>
              <span className="block text-[#6e7681]">AUTHOR</span>
              <span className="text-[#c9d1d9] truncate">{selectedCommit.author}</span>
            </div>
            <div>
              <span className="block text-[#6e7681]">DATE</span>
              <span className="text-[#c9d1d9]">{new Date(selectedCommit.timestamp).toLocaleTimeString()}</span>
            </div>
            <div>
              <span className="block text-[#6e7681]">PARENTS</span>
              <span className="text-[#c9d1d9]">
                {selectedCommit.parentIds.length > 0
                  ? selectedCommit.parentIds.map(p => p.slice(0, 7)).join(', ')
                  : '(root commit)'}
              </span>
            </div>
            <div>
              <span className="block text-[#6e7681]">FILES INCLUDED</span>
              <span className="text-[#2ea043] font-semibold">{Object.keys(selectedCommit.files).length} files</span>
            </div>
          </div>

          {/* Files snapshot preview */}
          <div className="bg-[#0d1117] p-2 rounded border border-[#21262d]">
            <span className="text-[#8b949e] text-[10px] block mb-1">SNAPSHOT CONTENTS:</span>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(selectedCommit.files).map(([fname, content]) => (
                <span
                  key={fname}
                  className="bg-[#1f242c] text-[#79c0ff] px-2 py-0.5 rounded text-[11px] border border-[#30363d] flex items-center space-x-1"
                >
                  <span>{fname}</span>
                  <span className="text-[#6e7681]">({content.length}b)</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
