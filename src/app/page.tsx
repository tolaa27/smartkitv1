// src/app/page.tsx
// SmartKids Root Platform: Dedicated Student Hub UI (For Kids)
// Playful, gamified primary edtech experience for Grades 1-3.

'use client';

import React, { useState } from 'react';
import { GeneratedGameConfig } from '@/types/game';
import { SpeechEngine } from '@/utils/speech';

// EdTech context & student mode components
import { useEdTech } from '@/context/EdTechContext';
import { HeaderNav } from '@/components/HeaderNav';
import { GameHub } from '@/components/GameHub';
import { FruitMarketGame } from '@/components/games/FruitMarketGame';
import { KhmerSentenceGame } from '@/components/games/KhmerSentenceGame';
import { BeanGerminationGame } from '@/components/games/BeanGerminationGame';
import { GeometryTempleGame } from '@/components/games/GeometryTempleGame';
import { SpellingTrainGame } from '@/components/games/SpellingTrainGame';
import { HealthyMealGame } from '@/components/games/HealthyMealGame';
import { UniversalGameRunner } from '@/components/templates/UniversalGameRunner';
import { ClassroomPinModal } from '@/components/ClassroomPinModal';
import { SubtitleBanner } from '@/components/common/SubtitleBanner';
import { MoEYSCurriculumApp } from '@/components/curriculum/MoEYSCurriculumApp';
import { TeacherStudioWorkspace } from '@/components/studio/TeacherStudioWorkspace';

function MainEdTechApp() {
  const {
    activeGame,
    setActiveGame,
    activeCustomGame,
    setActiveCustomGame,
  } = useEdTech();

  // Root view mode state: 'student' (Student Game Hub) vs 'studio' (Teacher Studio)
  const [viewMode, setViewMode] = useState<'student' | 'studio'>('student');
  const [curriculumOpen, setCurriculumOpen] = useState<boolean>(false);
  const [pinModalOpen, setPinModalOpen] = useState<boolean>(false);
  const [playSessionId, setPlaySessionId] = useState<number>(() => Date.now());

  const handleSelectGame = (game: GeneratedGameConfig) => {
    SpeechEngine.stop();
    setPlaySessionId(Date.now());
    setActiveGame(null);
    setActiveCustomGame(game);
  };

  const handleExitGame = () => {
    SpeechEngine.stop();
    setPlaySessionId(Date.now());
    setActiveGame(null);
    setActiveCustomGame(null);
  };

  const handleGoHome = () => {
    SpeechEngine.stop();
    setPlaySessionId(Date.now());
    setActiveGame(null);
    setActiveCustomGame(null);
    setCurriculumOpen(false);
    setViewMode('student');
  };

  // If in Teacher Studio Mode, render the full Studio Workspace
  if (viewMode === 'studio') {
    return (
      <TeacherStudioWorkspace
        onBackToStudentMode={() => {
          SpeechEngine.stop();
          setViewMode('student');
        }}
        onPlayInStudentHub={(game) => {
          SpeechEngine.stop();
          setPlaySessionId(Date.now());
          setActiveGame(null);
          setActiveCustomGame(game);
          setViewMode('student');
        }}
      />
    );
  }

  // Otherwise: Render the Student Mode (Game Hub / Lessons)
  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF7]">
      <HeaderNav
        viewMode={viewMode}
        onToggleViewMode={() => {
          SpeechEngine.stop();
          setViewMode('studio');
        }}
        onOpenStudio={() => {
          SpeechEngine.stop();
          setViewMode('studio');
        }}
        onOpenPinModal={() => {
          SpeechEngine.stop();
          setPinModalOpen(true);
        }}
        onOpenCurriculum={() => {
          SpeechEngine.stop();
          setCurriculumOpen(true);
        }}
        onGoHome={handleGoHome}
      />

      {/* Floating Active Khmer Speech Subtitle Chip */}
      <SubtitleBanner />

      <main className="flex-1 pb-16">
        {/* If MoEYS Curriculum Practice is active */}
        {curriculumOpen ? (
          <MoEYSCurriculumApp
            onExit={() => {
              SpeechEngine.stop();
              setCurriculumOpen(false);
            }}
          />
        ) : activeCustomGame ? (
          /* Universal Game Runner with safe playSessionId container bounding */
          <div
            key={`${activeCustomGame.id}_${playSessionId}`}
            className="w-full animate-fade-in"
          >
            <UniversalGameRunner
              gameConfig={activeCustomGame}
              onExit={handleExitGame}
            />
          </div>
        ) : (
          /* Bespoke Interactive Games with safe key bounding */
          <div
            key={`${activeGame || 'hub'}_${playSessionId}`}
            className="w-full animate-fade-in"
          >
            {activeGame === 'fruit-market' && <FruitMarketGame />}
            {activeGame === 'sentence-puzzle' && <KhmerSentenceGame />}
            {activeGame === 'plant-lab' && <BeanGerminationGame />}
            {activeGame === 'geometry-temple' && <GeometryTempleGame />}
            {activeGame === 'spelling-train' && <SpellingTrainGame />}
            {activeGame === 'healthy-meal' && <HealthyMealGame />}
            {!activeGame && (
              <GameHub
                onOpenStudio={() => {
                  SpeechEngine.stop();
                  setViewMode('studio');
                }}
                onOpenPinModal={() => {
                  SpeechEngine.stop();
                  setPinModalOpen(true);
                }}
                onOpenCurriculum={() => {
                  SpeechEngine.stop();
                  setCurriculumOpen(true);
                }}
                onSelectGame={handleSelectGame}
              />
            )}
          </div>
        )}
      </main>

      {/* Classroom PIN Dialog */}
      <ClassroomPinModal
        isOpen={pinModalOpen}
        onClose={() => setPinModalOpen(false)}
        onJoinGame={(game) => {
          SpeechEngine.stop();
          setPlaySessionId(Date.now());
          setActiveGame(null);
          setActiveCustomGame(game);
        }}
      />

      <footer className="bg-amber-100/60 border-t-2 border-amber-200 py-6 text-center text-xs text-amber-900 font-medium">
        <div className="max-w-7xl mx-auto px-4 space-y-1">
          <p className="font-bold font-heading">
            🇰🇭 កុមារឆ្លាត (SmartKids Cambodia) — វេទិកាអប់រំបឋមសិក្សាអន្តរកម្ម MoEYS (៤២ ល្បែងសិក្សា)
          </p>
          <p className="text-slate-500 font-khmer">
            បំពាក់ដោយ AI Game Studio • កម្មវិធីសិក្សាថ្នាក់ជាតិថ្នាក់ទី ១-៣ (ភាសាខ្មែរ គណិតវិទ្យា វិទ្យាសាស្ត្រ និងសង្គម)
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function Home() {
  return <MainEdTechApp />;
}
