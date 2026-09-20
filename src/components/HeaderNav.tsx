// src/components/HeaderNav.tsx
'use client';

import React, { useState } from 'react';
import { useEdTech } from '@/context/EdTechContext';
import { GradeLevel } from '@/types/edtech';
import { sound } from '@/utils/sound';
import {
  Star,
  Sparkles,
  Volume2,
  VolumeX,
  Home,
  KeyRound,
  GraduationCap,
  Flame,
  Diamond,
} from 'lucide-react';

interface HeaderNavProps {
  onOpenStudio?: () => void;
  onOpenPinModal?: () => void;
  onOpenCurriculum?: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  onOpenStudio,
  onOpenPinModal,
  onOpenCurriculum,
}) => {
  const {
    grade,
    setGrade,
    student,
    soundMuted,
    toggleMute,
    activeGame,
    setActiveGame,
    activeCustomGame,
    setActiveCustomGame,
  } = useEdTech();

  const isPlayingGame = !!activeGame || !!activeCustomGame;

  const grades: {
    level: GradeLevel;
    labelKh: string;
    labelEn: string;
    badgeEmoji: string;
    activeStyle: string;
  }[] = [
    {
      level: 1,
      labelKh: 'ថ្នាក់ទី ១',
      labelEn: 'Grade 1',
      badgeEmoji: '🌱',
      activeStyle:
        'bg-emerald-500 text-white border-b-4 border-emerald-700 shadow-[0_4px_0_#047857] scale-102',
    },
    {
      level: 2,
      labelKh: 'ថ្នាក់ទី ២',
      labelEn: 'Grade 2',
      badgeEmoji: '🌟',
      activeStyle:
        'bg-amber-500 text-amber-950 border-b-4 border-amber-700 shadow-[0_4px_0_#B45309] scale-102',
    },
    {
      level: 3,
      labelKh: 'ថ្នាក់ទី ៣',
      labelEn: 'Grade 3',
      badgeEmoji: '🚀',
      activeStyle:
        'bg-blue-600 text-white border-b-4 border-blue-800 shadow-[0_4px_0_#1E40AF] scale-102',
    },
  ];

  const handleGoHome = () => {
    sound.playPop();
    setActiveGame(null);
    setActiveCustomGame(null);
  };

  const handleSelectGrade = (newGrade: GradeLevel) => {
    sound.playPop();
    setGrade(newGrade);
    sound.speakKhmer(
      newGrade === 1 ? 'ថ្នាក់ទីមួយ' : newGrade === 2 ? 'ថ្នាក់ទីពីរ' : 'ថ្នាក់ទីបី'
    );
  };

  const handleSpeakerClick = () => {
    toggleMute();
    if (soundMuted) {
      sound.speakKhmer('សំឡេងបានបើក!');
    }
  };

  const calculatedGems =
    student.totalGems ?? Math.max(12, Math.floor(student.totalScore / 50) + 12);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b-3 border-amber-200 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Mascot Brand & Home Button */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={handleGoHome}
            className="flex items-center gap-2 group cursor-pointer focus-visible:outline-none"
            title="ទំព័រដើម SmartKids"
          >
            <div className="w-11 h-11 sm:w-13 sm:h-13 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-2xl p-1.5 shadow-md border-2 border-amber-300 flex items-center justify-center transform group-hover:scale-105 group-active:scale-95 transition-transform">
              <span className="text-2xl sm:text-3xl animate-bounce-gentle" role="img" aria-label="Elephant Mascot">
                🐘
              </span>
            </div>
            <div className="hidden min-[480px]:block text-left">
              <div className="flex items-center gap-1.5">
                <span className="font-heading font-black text-lg sm:text-xl text-slate-800 tracking-tight">
                  SmartKids
                </span>
                <span className="bg-amber-100 text-amber-900 text-[10px] font-black px-1.5 py-0.5 rounded-md border border-amber-300 uppercase font-mono">
                  MoEYS
                </span>
              </div>
              <p className="text-[11px] font-bold text-slate-400 font-khmer line-clamp-1">
                បឋមសិក្សា (ថ្នាក់ទី១ - ថ្នាក់ទី២)
              </p>
            </div>
          </button>

          {isPlayingGame && (
            <button
              onClick={handleGoHome}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-black transition-all btn-squishy"
              title="ត្រឡប់ទៅមជ្ឈមណ្ឌល"
            >
              <Home className="w-4 h-4 text-blue-600" />
              <span className="hidden sm:inline">ទំព័រដើម</span>
            </button>
          )}
        </div>

        {/* Center: Unified Grade Switcher (Single Source of Truth) */}
        <div className="flex items-center bg-amber-100/70 p-1 rounded-2xl border-2 border-amber-300 shadow-inner">
          {grades.map(g => {
            const isActive = grade === g.level;
            return (
              <button
                key={g.level}
                type="button"
                onClick={() => handleSelectGrade(g.level)}
                className={`min-h-[40px] sm:min-h-[44px] px-3 sm:px-4 py-1.5 rounded-xl font-heading font-black text-xs sm:text-sm flex items-center gap-1.5 transition-all btn-squishy select-none cursor-pointer ${
                  isActive
                    ? g.activeStyle
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
                aria-pressed={isActive}
              >
                <span className="text-base sm:text-lg">{g.badgeEmoji}</span>
                <span className="font-khmer">{g.labelKh}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Gamified Stats (Stars, Gems, Audio, Studio) */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Stars Pill */}
          <div className="bg-amber-50 px-2.5 sm:px-3 py-1.5 rounded-2xl border-2 border-amber-300 flex items-center gap-1.5 shadow-xs">
            <Star className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 fill-amber-400 animate-spin-slow" />
            <span className="font-heading font-black text-amber-950 text-xs sm:text-sm">
              {student.totalStars}
            </span>
          </div>

          {/* Gems Pill */}
          <div className="hidden sm:flex bg-sky-50 px-3 py-1.5 rounded-2xl border-2 border-sky-300 items-center gap-1.5 shadow-xs">
            <Diamond className="w-4 h-4 sm:w-5 sm:h-5 text-sky-500 fill-sky-400" />
            <span className="font-heading font-black text-sky-950 text-xs sm:text-sm">
              {calculatedGems}
            </span>
          </div>

          {/* Audio Toggle Button */}
          <button
            type="button"
            onClick={handleSpeakerClick}
            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl border-2 flex items-center justify-center transition-all btn-squishy cursor-pointer ${
              soundMuted
                ? 'bg-rose-50 border-rose-300 text-rose-500 hover:bg-rose-100'
                : 'bg-emerald-50 border-emerald-300 text-emerald-600 hover:bg-emerald-100'
            }`}
            title={soundMuted ? 'បើកសំឡេង (Unmute)' : 'បិទសំឡេង (Mute)'}
            aria-label={soundMuted ? 'បើកសំឡេង' : 'បិទសំឡេង'}
          >
            {soundMuted ? (
              <VolumeX className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5 animate-pulse-gentle" />
            )}
          </button>

          {/* Classroom PIN button */}
          {onOpenPinModal && (
            <button
              type="button"
              onClick={() => {
                sound.playPop();
                onOpenPinModal();
              }}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 border-2 border-emerald-300 text-emerald-800 rounded-2xl text-xs font-black transition-all btn-squishy cursor-pointer"
              title="ចូលបន្ទប់រៀនតាមរយៈកូដ PIN"
            >
              <KeyRound className="w-4 h-4 text-emerald-600" />
              <span>កូដ PIN</span>
            </button>
          )}

          {/* Teacher AI Studio */}
          {onOpenStudio && (
            <button
              type="button"
              onClick={() => {
                sound.playPop();
                onOpenStudio();
              }}
              className="hidden lg:inline-flex items-center gap-1.5 px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl text-xs font-black shadow-sm transition-all btn-squishy cursor-pointer"
              title="បើកស្ទូឌីយោគ្រូបង្រៀន AI"
            >
              <GraduationCap className="w-4 h-4" />
              <span>ស្ទូឌីយោគ្រូ</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
