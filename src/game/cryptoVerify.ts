import { VerificationPayload, VerificationResult } from '../types/verification';

// Deterministic cryptographic hash function (SHA-256 via SubtleCrypto or robust fallback)
async function sha256(message: string): Promise<string> {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const msgUint8 = new TextEncoder().encode(message);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  // Fallback simple bitwise hash for SSR or non-crypto environments
  let hash = 0;
  for (let i = 0; i < message.length; i++) {
    const char = message.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

// Fixed salt / course salt (organizer verification format)
const COURSE_SECRET_SALT = 'GIT_GITHUB_GAME_PROD_VERIFY_SALT_2026';

export async function generateVerificationToken(data: Omit<VerificationPayload, 'checksum'>): Promise<string> {
  const canonicalString = `${data.name.trim().toLowerCase()}|${data.email.trim().toLowerCase()}|${data.completedAt}|${data.courseVersion}|${data.scorePercentage}|${data.completedLessonsCount}|${COURSE_SECRET_SALT}`;
  const fullHash = await sha256(canonicalString);
  const shortChecksum = fullHash.substring(0, 12).toUpperCase();

  const payloadWithChecksum: VerificationPayload = {
    ...data,
    checksum: shortChecksum,
  };

  const jsonStr = JSON.stringify(payloadWithChecksum);
  // Base64 encode safe for URLs/strings
  const base64Payload = btoa(unescape(encodeURIComponent(jsonStr)));
  
  // Format: GITGAME-<CHECKSUM_PART1>-<CHECKSUM_PART2>-<COMPACT_BASE64>
  const chunk1 = shortChecksum.slice(0, 6);
  const chunk2 = shortChecksum.slice(6, 12);
  
  return `GITGAME-${chunk1}-${chunk2}-${base64Payload}`;
}

export async function verifyToken(token: string): Promise<VerificationResult> {
  if (!token || !token.startsWith('GITGAME-')) {
    return {
      isValid: false,
      errorMessage: 'Invalid token format. Tokens must begin with "GITGAME-".',
    };
  }

  const parts = token.split('-');
  if (parts.length < 4) {
    return {
      isValid: false,
      errorMessage: 'Malformed verification token structure.',
    };
  }

  const providedChecksum = (parts[1] + parts[2]).toUpperCase();
  const base64Data = parts.slice(3).join('-'); // handles any dashes in base64 if any

  try {
    const jsonStr = decodeURIComponent(escape(atob(base64Data)));
    const payload: VerificationPayload = JSON.parse(jsonStr);

    // Verify canonical digest
    const canonicalString = `${payload.name.trim().toLowerCase()}|${payload.email.trim().toLowerCase()}|${payload.completedAt}|${payload.courseVersion}|${payload.scorePercentage}|${payload.completedLessonsCount}|${COURSE_SECRET_SALT}`;
    const calculatedHash = await sha256(canonicalString);
    const expectedChecksum = calculatedHash.substring(0, 12).toUpperCase();

    if (expectedChecksum !== providedChecksum || payload.checksum !== expectedChecksum) {
      return {
        isValid: false,
        errorMessage: 'Token signature mismatch! The verification token may have been tampered with.',
      };
    }

    if (payload.completedLessonsCount < 12 || payload.finalChallengeStatus !== 'Passed') {
      return {
        isValid: false,
        errorMessage: 'Course requirements incomplete in this credential.',
      };
    }

    return {
      isValid: true,
      payload,
    };
  } catch {
    return {
      isValid: false,
      errorMessage: 'Could not decode verification payload. Invalid or corrupted token.',
    };
  }
}
