import React, { useState } from 'react';
import { verifyToken, generateVerificationToken } from '../game/cryptoVerify';
import { VerificationPayload, VerificationResult } from '../types/verification';
import { ShieldCheck, CheckCircle2, XCircle, Search, ArrowLeft, Award, Sparkles, Download, Loader2 } from 'lucide-react';
import { sound } from '../game/soundEngine';

interface VerifyPageProps {
  onBackToApp: () => void;
  defaultToken?: string;
}

export const VerifyPage: React.FC<VerifyPageProps> = ({ onBackToApp, defaultToken = '' }) => {
  const [tokenInput, setTokenInput] = useState(defaultToken);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!tokenInput.trim()) return;

    setIsVerifying(true);
    sound.playKeypress();

    setTimeout(async () => {
      const res = await verifyToken(tokenInput.trim());
      setResult(res);
      setIsVerifying(false);
      if (res.isValid) {
        sound.playSuccess();
      } else {
        sound.playError();
      }
    }, 400);
  };

  const handleDownloadCertificate = async () => {
    if (!result?.isValid || !result.payload || isDownloading) return;
    sound.playSuccess();
    setIsDownloading(true);
    try {
      const { downloadCertificatePdf } = await import('../game/certificateGenerator');
      await downloadCertificatePdf(result.payload, tokenInput.trim());
    } finally {
      setIsDownloading(false);
    }
  };

  // Generate a test valid credential for demonstration
  const handleLoadDemoToken = async () => {
    sound.playKeypress();
    const demoPayload: Omit<VerificationPayload, 'checksum'> = {
      name: 'Nirmit Sharma',
      email: 'nirmit@example.com',
      courseName: 'Git & GitHub Game: Master Curriculum',
      courseVersion: 'v1.0.0-mvp',
      completedAt: Date.now(),
      scorePercentage: 96,
      xp: 2450,
      completedLessonsCount: 12,
      totalLessonsCount: 12,
      finalChallengeStatus: 'Passed',
    };

    const generated = await generateVerificationToken(demoPayload);
    setTokenInput(generated);
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] flex flex-col font-sans selection:bg-[#238636] selection:text-white">
      {/* Top Header */}
      <header className="bg-[#161b22] border-b border-[#30363d] px-6 py-4 flex items-center justify-between font-mono text-xs">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBackToApp}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-[#21262d] hover:bg-[#30363d] text-white transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Game</span>
          </button>
          <div className="flex items-center space-x-2 text-white font-bold text-sm">
            <ShieldCheck className="w-4 h-4 text-[#2ea043]" />
            <span>CREDENTIAL VERIFICATION PORTAL</span>
          </div>
        </div>

        <button
          onClick={handleLoadDemoToken}
          className="text-[#58a6ff] hover:underline flex items-center space-x-1"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Load Sample Valid Token</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto w-full px-4 py-10 space-y-6 flex-1">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#161b22] border border-[#30363d] text-xs font-mono text-[#e3b341]">
            <Award className="w-3.5 h-3.5" />
            <span>Course Organizer &amp; Recruiter Tool</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Verify Git &amp; GitHub Credential
          </h1>
          <p className="text-xs text-[#8b949e] font-mono max-w-lg mx-auto">
            Paste the unique cryptographic verification token generated upon completion to inspect and validate its authenticity.
          </p>
        </div>

        {/* Input Card */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 shadow-xl space-y-4 font-mono text-xs">
          <form onSubmit={handleVerify} className="space-y-3">
            <label className="text-[#8b949e] font-semibold block uppercase">
              Paste Verification Token (GITGAME-...)
            </label>
            <div className="relative">
              <textarea
                value={tokenInput}
                onChange={e => setTokenInput(e.target.value)}
                placeholder="GITGAME-7F2A9C-91D84B-eyJuYW1lIjoiTmlybWl0IiwiZW1haWwiOiJuaXJtaXRAZXhhbXBsZS5jb20iLC..."
                rows={3}
                className="w-full p-3 bg-[#0d1117] border border-[#30363d] rounded-xl text-white outline-none focus:border-[#2ea043] transition font-mono text-xs break-all"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <span className="text-[11px] text-[#6e7681]">
                Uses SHA-256 HMAC-style deterministic signature checking
              </span>
              <button
                type="submit"
                disabled={isVerifying || !tokenInput.trim()}
                className="px-6 py-2.5 bg-[#238636] hover:bg-[#2ea043] disabled:opacity-50 text-white font-bold rounded-xl shadow-glow-green flex items-center space-x-2 transition cursor-pointer"
              >
                <Search className="w-4 h-4" />
                <span>{isVerifying ? 'Verifying...' : 'Verify Credential'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Verification Result Display */}
        {result && (
          <div className="animate-fadeIn">
            {result.isValid && result.payload ? (
              /* Valid Completion Box */
              <div className="bg-[#161b22] border-2 border-[#2ea043] rounded-2xl p-6 shadow-2xl space-y-6 font-mono text-xs">
                {/* Status Bar */}
                <div className="flex items-center justify-between pb-4 border-b border-[#30363d]">
                  <div className="flex items-center space-x-3 text-[#2ea043]">
                    <div className="w-10 h-10 rounded-full bg-[#2ea043]/20 flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-[#2ea043]" />
                    </div>
                    <div>
                      <div className="text-base font-extrabold text-white">✓ Valid Completion</div>
                      <div className="text-[11px] text-[#2ea043]">Cryptographic signature verified successfully</div>
                    </div>
                  </div>
                  <span className="bg-[#238636]/20 text-[#2ea043] border border-[#2ea043]/40 px-3 py-1 rounded-full font-bold">
                    AUTHENTIC
                  </span>
                </div>

                {/* Verified Metadata Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-[#0d1117] rounded-lg border border-[#30363d] space-y-1">
                    <span className="text-[#8b949e] text-[10px] block uppercase">Student / Candidate Name</span>
                    <span className="text-white font-bold text-sm font-sans">{result.payload.name}</span>
                  </div>

                  <div className="p-3 bg-[#0d1117] rounded-lg border border-[#30363d] space-y-1">
                    <span className="text-[#8b949e] text-[10px] block uppercase">Email / Student ID</span>
                    <span className="text-white font-bold">{result.payload.email}</span>
                  </div>

                  <div className="p-3 bg-[#0d1117] rounded-lg border border-[#30363d] space-y-1">
                    <span className="text-[#8b949e] text-[10px] block uppercase">Course Curriculum</span>
                    <span className="text-[#58a6ff] font-bold">{result.payload.courseName}</span>
                  </div>

                  <div className="p-3 bg-[#0d1117] rounded-lg border border-[#30363d] space-y-1">
                    <span className="text-[#8b949e] text-[10px] block uppercase">Completion Timestamp</span>
                    <span className="text-white font-bold">
                      {new Date(result.payload.completedAt).toLocaleString()}
                    </span>
                  </div>

                  <div className="p-3 bg-[#0d1117] rounded-lg border border-[#30363d] space-y-1">
                    <span className="text-[#8b949e] text-[10px] block uppercase">Lessons Completed</span>
                    <span className="text-[#2ea043] font-bold text-sm">
                      {result.payload.completedLessonsCount} / {result.payload.totalLessonsCount} Modules
                    </span>
                  </div>

                  <div className="p-3 bg-[#0d1117] rounded-lg border border-[#30363d] space-y-1">
                    <span className="text-[#8b949e] text-[10px] block uppercase">Final Practical Challenge</span>
                    <span className="text-[#2ea043] font-bold text-sm flex items-center space-x-1">
                      <span>✓</span>
                      <span>{result.payload.finalChallengeStatus}</span>
                    </span>
                  </div>
                </div>

                {/* Score & Checksum Footer */}
                <div className="pt-3 border-t border-[#30363d] flex flex-wrap items-center justify-between text-[11px] text-[#8b949e]">
                  <div>
                    Score: <span className="text-white font-bold">{result.payload.scorePercentage}%</span> ({result.payload.xp} XP)
                  </div>
                  <div>
                    Tamper Checksum: <code className="text-[#d29922] font-bold">{result.payload.checksum}</code>
                  </div>
                </div>

                {/* Certificate download */}
                <div className="pt-4 border-t border-[#30363d] flex flex-wrap items-center justify-between gap-3">
                  <span className="text-[11px] text-[#8b949e]">
                    Regenerate the official A4 landscape PDF certificate for this credential.
                  </span>
                  <button
                    onClick={handleDownloadCertificate}
                    disabled={isDownloading}
                    className="px-4 py-2 bg-[#238636] hover:bg-[#2ea043] disabled:opacity-60 text-white font-bold rounded-lg flex items-center space-x-2 transition cursor-pointer"
                  >
                    {isDownloading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    <span>{isDownloading ? 'Generating PDF...' : 'Download Certificate (PDF)'}</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Invalid Token Box */
              <div className="bg-[#161b22] border-2 border-[#f85149] rounded-2xl p-6 shadow-2xl space-y-3 font-mono text-xs">
                <div className="flex items-center space-x-3 text-[#f85149]">
                  <div className="w-10 h-10 rounded-full bg-[#f85149]/20 flex items-center justify-center">
                    <XCircle className="w-6 h-6 text-[#f85149]" />
                  </div>
                  <div>
                    <div className="text-base font-extrabold text-white">✕ Invalid Verification Code</div>
                    <div className="text-[11px] text-[#f85149]">The provided token failed cryptographic verification</div>
                  </div>
                </div>
                <div className="p-3 bg-[#0d1117] rounded-lg border border-[#f85149]/30 text-[#8b949e] leading-relaxed">
                  {result.errorMessage || 'The token structure or hash does not match the course verification standards.'}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
