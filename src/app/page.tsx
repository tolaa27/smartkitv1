'use client';

import React, { useState } from 'react';
import { EdTechProvider, useEdTech } from '@/context/EdTechContext';
import { HeaderNav } from '@/components/HeaderNav';
import { GameHub } from '@/components/GameHub';
import { FruitMarketGame } from '@/components/games/FruitMarketGame';
import { KhmerSentenceGame } from '@/components/games/KhmerSentenceGame';
import { BeanGerminationGame } from '@/components/games/BeanGerminationGame';
import { GeometryTempleGame } from '@/components/games/GeometryTempleGame';
import { SpellingTrainGame } from '@/components/games/SpellingTrainGame';
import { HealthyMealGame } from '@/components/games/HealthyMealGame';
import { UniversalGameRunner } from '@/components/templates/UniversalGameRunner';
import { AIGameStudio } from '@/components/studio/AIGameStudio';
import { ClassroomPinModal } from '@/components/ClassroomPinModal';
import { SubtitleBanner } from '@/components/common/SubtitleBanner';
import { MoEYSCurriculumApp } from '@/components/curriculum/MoEYSCurriculumApp';
import { SpeechEngine } from '@/utils/speech';
import { GeneratedGameConfig } from '@/types/edtech';

function MainEdTechApp() {
  const {
    activeGame,
    setActiveGame,
    activeCustomGame,
    setActiveCustomGame,
  } = useEdTech();

  const [curriculumOpen, setCurriculumOpen] = useState<boolean>(false);
  const [studioOpen, setStudioOpen] = useState<boolean>(false);
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

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF7]">
      <HeaderNav
        onOpenStudio={() => {
          SpeechEngine.stop();
          setStudioOpen(true);
        }}
        onOpenPinModal={() => {
          SpeechEngine.stop();
          setPinModalOpen(true);
        }}
        onOpenCurriculum={() => {
          SpeechEngine.stop();
          setCurriculumOpen(true);
        }}
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
        ) : studioOpen ? (
          <AIGameStudio
            onPlayGame={game => {
              SpeechEngine.stop();
              setStudioOpen(false);
              setPlaySessionId(Date.now());
              setActiveCustomGame(game);
              setActiveGame(null);
            }}
            onClose={() => {
              SpeechEngine.stop();
              setStudioOpen(false);
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
                  setStudioOpen(true);
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
        onJoinGame={game => {
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

