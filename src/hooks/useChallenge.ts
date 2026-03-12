import { useState, useEffect, useRef, useCallback } from 'react';
import { encodeChallenge, Version } from '../utils/hmac';
import { CHALLENGE_TTL } from '../theme';

export interface ChallengeState {
  challenge: string;
  timeLeft: number;
  newChallenge: (version: Version) => void;
}

export function useChallenge(initialVersion: Version): ChallengeState {
  const [challenge, setChallenge] = useState(() => encodeChallenge(initialVersion));
  const [timeLeft, setTimeLeft] = useState(CHALLENGE_TTL);

  // Ref damit der Interval-Callback immer die aktuelle Version kennt
  const versionRef = useRef<Version>(initialVersion);
  versionRef.current = initialVersion;

  const newChallenge = useCallback((version: Version) => {
    setChallenge(encodeChallenge(version));
    setTimeLeft(CHALLENGE_TTL);
  }, []);

  const newChallengeRef = useRef(newChallenge);
  newChallengeRef.current = newChallenge;

  useEffect(() => {
    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          newChallengeRef.current(versionRef.current);
          return CHALLENGE_TTL;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return { challenge, timeLeft, newChallenge };
}
