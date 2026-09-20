'use client';

import React, { useState } from 'react';
import { useEdTech } from '@/context/EdTechContext';
import { GradeLevel } from '@/types/edtech';
import { sound } from '@/utils/sound';
import {
  Star,
  Volume2,
  VolumeX,
  Home,
  Sparkles,
  Settings,
  KeyRound,
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
  CloudOff,
  BookOpen,
} from 'lucide-react';

interface HeaderProps {
  onOpenStudio?: () => void;
  onOpenPinModal?: () => void;
  onOpenCurriculum?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
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
    isBackendConnected,
  } = useEdTech();

  const [settingsOpen, setSettingsOpen] = useState(false);
  const isPlayingGame = !!activeGame || !!activeCustomGame;

  const grades: {
    level: GradeLevel;
    labelKh: string;
    labelEn: string;
    activeColor: string;
    shadowColor: string;
    badgeEmoji: string;
  }[] = [
    {
      level: 1,
      labelKh: 'ថ្នាក់ទី ១',
      labelEn: 'Grade 1',
      activeColor: 'bg-emerald-500 text-white border-emerald-600',
      shadowColor: '#059669',
      badgeEmoji: '🌱',
    },
    {
      level: 2,
      labelKh: 'ថ្នាក់ទី ២',
      labelEn: 'Grade 2',
      activeColor: 'bg-amber-500 text-amber-950 border-amber-600',
      shadowColor: '#D97706',
      badgeEmoji: '🌟',
    },
    {
      level: 3,
      labelKh: 'ថ្នាក់ទី ៣',
      labelEn: 'Grade 3',
      activeColor: 'bg-blue-600 text-white border-blue-700',
      shadowColor: '#1D4ED8',
      badgeEmoji: '🚀',
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
  };

  const handleSpeakerClick = () => {
    toggleMute();
    if (soundMuted) {
      sound.speakKhmer('សូមស្វាគមន៍មកកាន់ កុមារឆ្លាត SmartKids Cambodia!');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#FFFDF7]/95 backdrop-blur-md border-b-4 border-amber-300 shadow-[0_8px_20px_rgba(245,158,11,0.12)]">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* 1. LEFT: Mascot Badge + SmartKids Logo */}
        <div
          onClick={handleGoHome}
          className="flex items-center gap-2.5 cursor-pointer group select-none"
          title="ត្រឡប់ទៅទំព័រដើម (SmartKids Home)"
        >
          {/* Friendly 3.5D Illustrated Elephant Mascot */}
          <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-200 p-1 shadow-[0_6px_0_#D97706,0_8px_16px_rgba(217,119,6,0.25)] border-2 border-amber-400 group-hover:scale-105 transition-transform flex items-center justify-center animate-playful-bounce">
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full drop-shadow-sm"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Elephant Body / Head */}
              <circle cx="50" cy="52" r="32" fill="#93C5FD" stroke="#1D4ED8" strokeWidth="2.5" />
              {/* Big Fluffy Ears */}
              <ellipse cx="22" cy="46" rx="14" ry="18" fill="#BFDBFE" stroke="#1D4ED8" strokeWidth="2.5" />
              <ellipse cx="22" cy="46" rx="8" ry="12" fill="#F472B6" opacity="0.75" />
              <ellipse cx="78" cy="46" rx="14" ry="18" fill="#BFDBFE" stroke="#1D4ED8" strokeWidth="2.5" />
              <ellipse cx="78" cy="46" rx="8" ry="12" fill="#F472B6" opacity="0.75" />
              {/* Cute Cheek Blushes */}
              <ellipse cx="36" cy="60" rx="4.5" ry="3" fill="#F472B6" opacity="0.8" />
              <ellipse cx="64" cy="60" rx="4.5" ry="3" fill="#F472B6" opacity="0.8" />
              {/* Friendly Eyes */}
              <ellipse cx="40" cy="48" rx="4" ry="5.5" fill="#1E293B" />
              <circle cx="38.5" cy="46" r="1.8" fill="#FFFFFF" />
              <ellipse cx="60" cy="48" rx="4" ry="5.5" fill="#1E293B" />
              <circle cx="58.5" cy="46" r="1.8" fill="#FFFFFF" />
              {/* Cute Trunk */}
              <path
                d="M 48 56 C 48 64, 46 72, 54 74 C 57 74, 58 71, 56 68 C 54 65, 52 62, 52 56"
                stroke="#1D4ED8"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
              />
              {/* Little Star Cap / Flower */}
              <circle cx="50" cy="22" r="5" fill="#FBBF24" stroke="#D97706" strokeWidth="1.5" />
            </svg>
            <span className="absolute -top-1 -right-1 text-xs">✨</span>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-xl sm:text-2xl font-black font-heading text-amber-950 tracking-tight leading-none">
                កុមារឆ្លាត
              </h1>
              <span className="text-[11px] font-black bg-gradient-to-r from-amber-300 to-yellow-300 text-amber-950 px-2 py-0.5 rounded-full border border-amber-400 shadow-xs">
                SmartKids
              </span>
            </div>
            <p className="text-[11px] text-amber-800/80 font-bold font-khmer mt-0.5">
              MoEYS Lower Primary • ថ្នាក់ទី ១-៣
            </p>
          </div>
        </div>

        {/* 2. CENTER: Giant Tactile Grade Switcher Toggle Pills */}
        <div className="order-3 sm:order-2 w-full sm:w-auto flex justify-center">
          <div className="bg-[#FFF8E7] p-1.5 rounded-3xl border-3 border-amber-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] flex items-center gap-1.5">
            {grades.map(g => {
              const isSelected = grade === g.level;
              return (
                <button
                  key={g.level}
                  onClick={() => handleSelectGrade(g.level)}
                  className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl font-black text-xs sm:text-sm font-heading transition-all duration-150 flex items-center gap-1.5 select-none ${
                    isSelected
                      ? `${g.activeColor} shadow-[0_4px_0_${g.shadowColor},0_6px_12px_rgba(0,0,0,0.12)] -translate-y-1`
                      : 'bg-white hover:bg-amber-100/80 text-amber-950 border-2 border-amber-200/80 shadow-xs'
                  }`}
                  title={`${g.labelKh} (${g.labelEn})`}
                >
                  <span className="text-base leading-none">{g.badgeEmoji}</span>
                  <span className="font-khmer font-black">{g.labelKh}</span>
                  {isSelected && (
                    <Sparkles className="w-3.5 h-3.5 animate-spin text-yellow-200" style={{ animationDuration: '3s' }} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. RIGHT: Gamified Kid Profile Pill + Sound Button + Hidden Settings */}
        <div className="order-2 sm:order-3 flex items-center gap-2 sm:gap-3">
          {/* Profile Pill: Chariya, ⭐️ 95, 💎 7,037 */}
          <div className="bg-white/95 backdrop-blur-md p-1.5 pl-2.5 pr-3 rounded-2xl border-2 border-amber-300 shadow-[0_4px_0_#FCD34D,0_6px_12px_rgba(0,0,0,0.05)] flex items-center gap-2.5">
            {/* Avatar illustration of 'Chariya' */}
            <div className="relative">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-pink-200 via-amber-100 to-rose-200 border-2 border-amber-300 flex items-center justify-center text-xl sm:text-2xl shadow-inner">
                👧
              </div>
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
            </div>

            {/* Name and Stats */}
            <div className="flex flex-col">
              <span className="text-xs sm:text-sm font-black font-khmer text-amber-950 leading-tight">
                ចរិយា (Chariya)
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                {/* Star Counter */}
                <div
                  className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200 text-amber-700 font-black text-xs shadow-xs"
                  title="ផ្កាយទទួលបាន (Stars)"
                >
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500 animate-pulse" />
                  <span>{student.totalStars || 95}</span>
                </div>

                {/* Coin / Gem Counter */}
                <div
                  className="flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200 text-emerald-800 font-black text-xs shadow-xs"
                  title="គ្រាប់ត្បូងសន្សំ (Gems / Coins)"
                >
                  <span className="text-xs">💎</span>
                  <span>{(student.totalGems || student.totalScore || 7037).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* MoEYS Curriculum Worksheets Trigger */}
          {onOpenCurriculum && (
            <button
              onClick={() => {
                sound.playPop();
                onOpenCurriculum();
              }}
              className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-xs btn-squishy shadow-xs border border-purple-700 select-none"
              title="វិញ្ញាសាកម្មវិធីសិក្សាជាតិ MoEYS (ថ្នាក់ទី ១-២)"
            >
              <BookOpen className="w-4 h-4" />
              <span>វិញ្ញាសា MoEYS</span>
            </button>
          )}

          {/* Big Sound / Voice-Over Speaker Button */}
          <button
            onClick={handleSpeakerClick}
            className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center text-white font-black transition-all btn-squishy select-none ${
              soundMuted
                ? 'bg-rose-500 hover:bg-rose-600 border-b-4 border-rose-700 shadow-[0_4px_0_#9F1239]'
                : 'bg-gradient-to-tr from-blue-600 to-sky-400 hover:from-blue-700 hover:to-sky-500 border-b-4 border-blue-800 shadow-[0_4px_0_#1E40AF,0_8px_16px_rgba(37,99,235,0.3)]'
            }`}
            title={soundMuted ? 'បើកសំឡេង (Unmute Sound & Speech)' : 'បិទសំឡេង (Mute)'}
          >
            {soundMuted ? (
              <VolumeX className="w-5 h-5 sm:w-6 sm:h-6" />
            ) : (
              <div className="relative flex items-center justify-center">
                <Volume2 className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
              </div>
            )}
          </button>

          {/* Clean Teacher / Parent Hidden Settings Cog */}
          <div className="relative">
            <button
              onClick={() => {
                sound.playPop();
                setSettingsOpen(!settingsOpen);
              }}
              className="w-10 h-10 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-900 border-2 border-amber-300 flex items-center justify-center transition-transform active:scale-95 shadow-xs"
              title="ការកំណត់សម្រាប់គ្រូ / អាណាព្យាបាល (Teacher & Parent Settings)"
            >
              <Settings className={`w-5 h-5 transition-transform duration-300 ${settingsOpen ? 'rotate-90 text-amber-950' : ''}`} />
            </button>

            {/* Hidden Settings Dropdown Menu */}
            {settingsOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-3xl p-3 border-3 border-amber-300 shadow-2xl z-50 space-y-2 animate-fade-in">
                <div className="p-2 bg-amber-50 rounded-2xl border border-amber-200">
                  <div className="flex items-center gap-1.5 text-xs font-black text-amber-950">
                    <ShieldCheck className="w-4 h-4 text-amber-700" />
                    <span>ផ្ទាំងគ្រប់គ្រងគ្រូបង្រៀន & អាណាព្យាបាល</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Teacher & Parent Dashboard Controls
                  </p>
                </div>

                {onOpenCurriculum && (
                  <button
                    onClick={() => {
                      setSettingsOpen(false);
                      onOpenCurriculum();
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-950 text-xs font-bold flex items-center gap-2 transition-colors text-left"
                  >
                    <BookOpen className="w-4 h-4 text-purple-700" />
                    <span>វិញ្ញាសា MoEYS ថ្នាក់ទី ១-២</span>
                  </button>
                )}

                {onOpenStudio && (
                  <button
                    onClick={() => {
                      setSettingsOpen(false);
                      onOpenStudio();
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 text-xs font-bold flex items-center gap-2 transition-colors text-left"
                  >
                    <Sparkles className="w-4 h-4 text-amber-700" />
                    <span>AI Game Studio (បង្កើតហ្គេម)</span>
                  </button>
                )}

                {onOpenPinModal && (
                  <button
                    onClick={() => {
                      setSettingsOpen(false);
                      onOpenPinModal();
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-950 text-xs font-bold flex items-center gap-2 transition-colors text-left"
                  >
                    <KeyRound className="w-4 h-4 text-sky-700" />
                    <span>បញ្ចូលលេខកូដ PIN ថ្នាក់រៀន</span>
                  </button>
                )}

                {isPlayingGame && (
                  <button
                    onClick={() => {
                      setSettingsOpen(false);
                      handleGoHome();
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-900 text-xs font-bold flex items-center gap-2 transition-colors text-left"
                  >
                    <Home className="w-4 h-4 text-rose-600" />
                    <span>ចាកចេញទៅទំព័រដើម</span>
                  </button>
                )}

                <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 px-2">
                  <span className="flex items-center gap-1">
                    {isBackendConnected ? (
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <CloudOff className="w-3 h-3 text-slate-400" />
                    )}
                    {isBackendConnected ? 'Online API' : 'Standalone'}
                  </span>
                  <span className="font-mono">v2026.1</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
