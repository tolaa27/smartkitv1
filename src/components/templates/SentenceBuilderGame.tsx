'use client';

import React, { useState, useEffect } from 'react';
import { GameLevel } from '@/types/edtech';
import { SoundFX, sound } from '@/utils/sound';
import { SpeakerButton } from '@/components/common/SpeakerButton';
import { CheckCircle2, RotateCcw, AlertCircle, Volume2 } from 'lucide-react';

interface SentenceBuilderGameProps {
  level: GameLevel;
  onLevelComplete: (scoreGain: number) => void;
}

export const SentenceBuilderGame: React.FC<SentenceBuilderGameProps> = ({
  level,
  onLevelComplete,
}) => {
  const initialTiles = level.gameplayData.tiles || [];

  const [availableTiles, setAvailableTiles] = useState<typeof initialTiles>([]);
  const [placedTiles, setPlacedTiles] = useState<typeof initialTiles>([]);
  const [feedback, setFeedback] = useState<{ message: string; isCorrect: boolean } | null>(null);

  useEffect(() => {
    // Shuffle tiles
    const shuffled = [...initialTiles].sort(() => Math.random() - 0.5);
    setAvailableTiles(shuffled);
    setPlacedTiles([]);
    setFeedback(null);
  }, [level, initialTiles]);

  const handleSelectTile = (tile: (typeof initialTiles)[0]) => {
    SoundFX.playSnap();
    setAvailableTiles(prev => prev.filter(t => t.id !== tile.id));
    setPlacedTiles(prev => [...prev, tile]);
    sound.speakKhmer(tile.textKhmer);
  };

  const handleReturnTile = (tile: (typeof initialTiles)[0]) => {
    SoundFX.playPop();
    setPlacedTiles(prev => prev.filter(t => t.id !== tile.id));
    setAvailableTiles(prev => [...prev, tile]);
    setFeedback(null);
  };

  const handleReset = () => {
    SoundFX.playPop();
    const shuffled = [...initialTiles].sort(() => Math.random() - 0.5);
    setAvailableTiles(shuffled);
    setPlacedTiles([]);
    setFeedback(null);
  };

  const handleSpeakSentence = () => {
    const text = placedTiles.map(t => t.textKhmer).join(' ');
    if (text) {
      sound.speakKhmer(text);
    }
  };

  const handleCheckAnswer = () => {
    if (placedTiles.length !== initialTiles.length) return;

    const isCorrect = placedTiles.every((tile, idx) => tile.order === idx + 1);

    if (isCorrect) {
      SoundFX.playSuccess();
      SoundFX.playStar();
      setFeedback({
        message: 'អស្ចារ្យណាស់! ការផ្គុំពាក្យនេះត្រឹមត្រូវទាំងស្រុង! 🎉',
        isCorrect: true,
      });

      setTimeout(() => {
        onLevelComplete(110);
      }, 1200);
    } else {
      SoundFX.playGentleError();
      setFeedback({
        message: 'មិនទាន់ត្រូវតាមលំដាប់ទេ! ចុចដកពាក្យចេញដើម្បីតម្រៀបឡើងវិញណា៎! 😊',
        isCorrect: false,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Prompt Banner */}
      <div className="bg-sky-50 rounded-2xl p-4 border-2 border-sky-200 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <SpeakerButton text={level.promptText} size="sm" />
          <p className="text-base sm:text-lg font-extrabold text-sky-950 font-khmer">
            {level.promptText}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {placedTiles.length > 0 && (
            <button
              onClick={handleSpeakSentence}
              className="text-xs font-bold text-sky-700 bg-sky-100 hover:bg-sky-200 px-2.5 py-1.5 rounded-xl flex items-center gap-1 transition-colors"
              title="ស្ដាប់សំឡេងល្បះទាំងមូល"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>ស្ដាប់ល្បះ</span>
            </button>
          )}
          <button
            onClick={handleReset}
            className="text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 px-2.5 py-1.5 rounded-xl border border-slate-200 flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>សម្អាត</span>
          </button>
        </div>
      </div>

      {/* Answer Slot Area */}
      <div className="bg-amber-50/70 rounded-3xl p-6 border-4 border-dashed border-amber-300 shadow-inner space-y-2">
        <span className="text-xs font-bold text-amber-900 uppercase tracking-wider block">
          ប្រអប់ផ្គុំល្បះ/ពាក្យ (Placed Tiles) — ចុចលើពាក្យដើម្បីដកចេញ:
        </span>

        <div className="min-h-[70px] bg-white rounded-2xl p-3 border-2 border-amber-200 flex flex-wrap items-center gap-2.5">
          {placedTiles.length === 0 ? (
            <p className="text-slate-400 text-sm font-khmer italic mx-auto">
              សូមចុចលើប្លុកពាក្យខាងក្រោមដើម្បីតម្រៀប...
            </p>
          ) : (
            placedTiles.map(tile => (
              <div
                key={tile.id}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-sky-400 to-sky-500 text-white font-extrabold text-lg sm:text-xl rounded-2xl border-b-4 border-sky-700 shadow-md font-khmer"
              >
                <button
                  onClick={() => handleReturnTile(tile)}
                  className="hover:text-rose-200 transition-colors flex items-center gap-1"
                  title="ចុចដើម្បីដកចេញ"
                >
                  <span>{tile.textKhmer}</span>
                  <span className="text-xs opacity-75">✕</span>
                </button>
                <SpeakerButton
                  text={tile.textKhmer}
                  size="xs"
                  className="bg-white/20 text-white border-white/30 hover:bg-white/40"
                />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Available Word / Syllable Tokens */}
      <div className="bg-white rounded-3xl p-5 border-3 border-sky-200 shadow-sm space-y-4">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
          ពាក្យសម្រាប់ជ្រើសរើស (Available Tokens):
        </span>

        <div className="flex flex-wrap items-center justify-center gap-3">
          {availableTiles.map(tile => (
            <div
              key={tile.id}
              className="inline-flex items-center gap-1.5 p-1.5 bg-gradient-to-b from-amber-200 to-amber-300 hover:from-amber-300 hover:to-amber-400 text-amber-950 font-black rounded-2xl border-b-4 border-amber-500 shadow-sm transition-all"
            >
              <button
                onClick={() => handleSelectTile(tile)}
                className="px-3 py-1.5 text-xl font-khmer btn-kid"
                title="ជ្រើសរើស"
              >
                {tile.textKhmer}
              </button>
              <SpeakerButton
                text={tile.textKhmer}
                size="xs"
                className="bg-white/60 text-amber-900 border-amber-300 hover:bg-white"
                title="ស្ដាប់"
              />
            </div>
          ))}
        </div>

        {/* Check Button */}
        <button
          onClick={handleCheckAnswer}
          disabled={placedTiles.length === 0}
          className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-white font-extrabold text-base shadow-md btn-kid flex items-center justify-center gap-2 border-b-4 border-emerald-700"
        >
          <CheckCircle2 className="w-5 h-5" />
          <span>ផ្ទៀងផ្ទាត់ (Check Answer)</span>
        </button>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl border-2 font-bold text-sm flex items-center gap-2 animate-bounce ${
            feedback.isCorrect
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
              : 'bg-rose-50 text-rose-800 border-rose-300'
          }`}
        >
          {feedback.isCorrect ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}
    </div>
  );
};
