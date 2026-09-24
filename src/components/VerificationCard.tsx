import React, { useState } from 'react';
import { VerificationPayload } from '../types/verification';
import { Award, CheckCircle, Copy, Download, ExternalLink, ShieldCheck, Loader2, Linkedin, Github, Globe } from 'lucide-react';
import { sound } from '../game/soundEngine';
import { CERTIFICATE_CONFIG } from '../data/certificateData';

interface VerificationCardProps {
  token: string;
  payload: VerificationPayload;
  onNavigateToVerify?: () => void;
}

export const VerificationCard: React.FC<VerificationCardProps> = ({
  token,
  payload,
  onNavigateToVerify,
}) => {
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleCopy = () => {
    sound.playSuccess();
    navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = async () => {
    if (isDownloading) return;
    sound.playSuccess();
    setIsDownloading(true);
    try {
      // Loaded on demand so the PDF/QR libraries stay out of the initial bundle.
      const { downloadCertificatePdf } = await import('../game/certificateGenerator');
      await downloadCertificatePdf(payload, token);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto my-6 space-y-4">
      {/* Certificate Frame */}
      <div className="relative p-8 bg-[#161b22] border-2 border-[#d29922] rounded-xl shadow-2xl overflow-hidden font-sans text-white text-center">
        {/* Decorative corner badges */}
        <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-[#e3b341] rounded-tl-xl pointer-events-none" />
        <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-[#e3b341] rounded-tr-xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-[#e3b341] rounded-bl-xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-[#e3b341] rounded-br-xl pointer-events-none" />

        {/* Certificate Watermark / Header */}
        <div className="flex flex-col items-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-[#d29922]/20 border-2 border-[#d29922] flex items-center justify-center text-[#e3b341] shadow-glow-yellow">
            <Award className="w-9 h-9" />
          </div>

          <div className="text-[11px] font-mono tracking-widest uppercase text-[#e3b341] font-bold">
            {CERTIFICATE_CONFIG.organization}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            {CERTIFICATE_CONFIG.certificateTitle}
          </h1>
          <p className="text-sm font-bold text-[#58a6ff]">
            {CERTIFICATE_CONFIG.courseName}
          </p>
          <p className="text-xs text-[#8b949e] font-mono">
            {CERTIFICATE_CONFIG.certificateSubtitle}
          </p>
        </div>

        {/* Recipient Details */}
        <div className="my-6 py-4 border-y border-[#30363d]/60 space-y-2">
          <div className="text-xs uppercase tracking-wider text-[#8b949e]">This certificate is proudly awarded to:</div>
          <div className="text-2xl sm:text-3xl font-bold text-[#58a6ff] tracking-wide">
            {payload.name}
          </div>
          <div className="text-xs font-mono text-[#8b949e]">{payload.email}</div>
        </div>

        {/* Course Stats Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-6 font-mono text-xs">
          <div className="bg-[#0d1117] p-3 rounded border border-[#30363d]">
            <span className="text-[#8b949e] text-[10px] block">LESSONS COMPLETED</span>
            <span className="text-white font-bold text-base text-[#2ea043]">
              {payload.completedLessonsCount} / {payload.totalLessonsCount}
            </span>
          </div>

          <div className="bg-[#0d1117] p-3 rounded border border-[#30363d]">
            <span className="text-[#8b949e] text-[10px] block">TOTAL EXPERIENCE</span>
            <span className="text-white font-bold text-base text-[#bc8cff]">{payload.xp} XP</span>
          </div>

          <div className="bg-[#0d1117] p-3 rounded border border-[#30363d]">
            <span className="text-[#8b949e] text-[10px] block">FINAL CHALLENGE</span>
            <span className="text-white font-bold text-base text-[#2ea043]">
              {payload.finalChallengeStatus}
            </span>
          </div>

          <div className="bg-[#0d1117] p-3 rounded border border-[#30363d]">
            <span className="text-[#8b949e] text-[10px] block">COMPLETED ON</span>
            <span className="text-white font-bold text-xs">
              {new Date(payload.completedAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Verification Token Block */}
        <div className="bg-[#0d1117] p-4 rounded-lg border border-[#d29922]/40 text-left font-mono text-xs space-y-2">
          <div className="flex items-center justify-between text-[#8b949e] text-[11px]">
            <div className="flex items-center space-x-1.5 text-[#e3b341]">
              <ShieldCheck className="w-4 h-4" />
              <span className="font-bold">CRYPTOGRAPHIC VERIFICATION TOKEN:</span>
            </div>
            <span className="text-[10px] text-[#2ea043] flex items-center space-x-1">
              <CheckCircle className="w-3 h-3" />
              <span>Signed & Tamper-Proof</span>
            </span>
          </div>

          <div className="bg-[#161b22] p-2.5 rounded border border-[#30363d] text-[#58a6ff] break-all font-mono text-[11px] select-all">
            {token}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px]">
            <span className="text-[#8b949e]">Checksum Digest: {payload.checksum}</span>
            <button
              onClick={handleCopy}
              className="flex items-center space-x-1.5 px-3 py-1 rounded bg-[#21262d] hover:bg-[#30363d] text-white border border-[#30363d] transition"
            >
              <Copy className="w-3.5 h-3.5 text-[#58a6ff]" />
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Verification Token'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Course author credit */}
      <div className="flex flex-wrap items-center justify-center gap-4 font-mono text-[11px] text-[#8b949e]">
        <span>
          Course created by{' '}
          <a
            href={CERTIFICATE_CONFIG.authorLinkedIn}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#58a6ff] hover:underline inline-flex items-center space-x-1"
          >
            <Linkedin className="w-3 h-3" />
            <span>{CERTIFICATE_CONFIG.authorName}</span>
          </a>
        </span>
        <a
          href={CERTIFICATE_CONFIG.authorGitHub}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#58a6ff] hover:underline inline-flex items-center space-x-1"
        >
          <Github className="w-3 h-3" />
          <span>GitHub</span>
        </a>
        <a
          href={CERTIFICATE_CONFIG.authorWebsite}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#58a6ff] hover:underline inline-flex items-center space-x-1"
        >
          <Globe className="w-3 h-3" />
          <span>theboringedit.in</span>
        </a>
        <a
          href={CERTIFICATE_CONFIG.organizationLinkedIn}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#58a6ff] hover:underline inline-flex items-center space-x-1"
        >
          <Linkedin className="w-3 h-3" />
          <span>msc-msit</span>
        </a>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3 font-mono text-xs">
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="flex items-center space-x-2 px-5 py-2.5 rounded bg-[#238636] hover:bg-[#2ea043] disabled:opacity-60 text-white font-bold border border-[#2ea043]/40 transition shadow-glow-green"
        >
          {isDownloading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          <span>{isDownloading ? 'Generating PDF...' : 'Download Certificate (PDF)'}</span>
        </button>

        {onNavigateToVerify && (
          <button
            onClick={onNavigateToVerify}
            className="flex items-center space-x-2 px-4 py-2 rounded bg-[#238636] hover:bg-[#2ea043] text-white font-bold transition shadow-glow-green"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Open in /verify Validator</span>
          </button>
        )}
      </div>
    </div>
  );
};
