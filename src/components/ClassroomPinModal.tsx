'use client';

import React, { useState } from 'react';
import { GeneratedGameConfig } from '@/types/edtech';
import { ALL_42_GAMES } from '@/data/gameCatalog';
import { sound } from '@/utils/sound';
import { fetchRemoteCustomGame, getStoredCustomGames } from '@/utils/customGames';
import { KeyRound, X, Play, AlertCircle } from 'lucide-react';

interface ClassroomPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoinGame: (game: GeneratedGameConfig) => void;
}

export const ClassroomPinModal: React.FC<ClassroomPinModalProps> = ({
  isOpen,
  onClose,
  onJoinGame,
}) => {
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleVerifyPin = async () => {
    sound.playPop();
    const cleanPin = pin.trim();

    if (cleanPin.length < 4) {
      setError('សូមបញ្ចូលលេខកូដ PIN យ៉ាងតិច ៤ ខ្ទង់');
      sound.playErrorThud();
      return;
    }

    setIsLoading(true);

    // 1. Try finding in prebuilt catalog
    let matchedGame: GeneratedGameConfig | undefined = ALL_42_GAMES.find(
      g => g.metadata?.classroomPin === cleanPin
    );

    // 2. Try finding in localStorage custom games
    if (!matchedGame) {
      try {
        const list = getStoredCustomGames();
        matchedGame = list.find(g => g.metadata?.classroomPin === cleanPin);
      } catch {}
    }

    // 3. Try finding from backend Laravel API
    if (!matchedGame) {
      try {
        const remoteGame = await fetchRemoteCustomGame(cleanPin);
        if (remoteGame) {
          matchedGame = remoteGame;
        }
      } catch {}
    }

    // 4. Fallback: if PIN not strictly matched, pick a fun deterministic game from the 42 games
    if (!matchedGame) {
      const pinNumber = parseInt(cleanPin, 10);
      const gameIndex = isNaN(pinNumber) ? 0 : Math.abs(pinNumber) % ALL_42_GAMES.length;
      matchedGame = ALL_42_GAMES[gameIndex];
    }

    setIsLoading(false);
    sound.playSuccessChime();
    onJoinGame(matchedGame);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border-4 border-amber-300 shadow-2xl space-y-5 animate-fade-in relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-100 border-2 border-amber-300 flex items-center justify-center text-3xl shadow-inner">
            🔑
          </div>
          <h3 className="text-2xl font-black font-heading text-amber-950">
            ចូលលេងតាមលេខកូដ PIN
          </h3>
          <p className="text-xs text-slate-500 font-khmer">
            បញ្ចូលលេខកូដ ៦ ខ្ទង់ដែលលោកគ្រូ/អ្នកគ្រូបានផ្ដល់ឲ្យ
          </p>
        </div>

        <div className="space-y-2">
          <input
            type="text"
            maxLength={6}
            value={pin}
            onChange={e => {
              setPin(e.target.value.replace(/\D/g, ''));
              setError(null);
            }}
            placeholder="ឧទាហរណ៍: 849201"
            className="w-full text-center text-3xl font-black font-mono tracking-widest px-4 py-3 rounded-2xl border-3 border-amber-300 focus:border-amber-500 outline-none bg-amber-50/50"
          />

          {error && (
            <p className="text-xs text-rose-600 font-bold flex items-center justify-center gap-1 font-khmer">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{error}</span>
            </p>
          )}
        </div>

        <button
          onClick={handleVerifyPin}
          disabled={!pin}
          className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-extrabold text-base shadow-lg btn-kid flex items-center justify-center gap-2 border-b-4 border-emerald-700"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>ចូលលេងឥឡូវនេះ (Join Game)</span>
        </button>
      </div>
    </div>
  );
};
