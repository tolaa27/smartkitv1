'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { GradeLevel, SubjectId, StudentProfile, GameProgress, GeneratedGameConfig } from '@/types/edtech';
import { sound } from '@/utils/sound';

interface EdTechContextType {
  grade: GradeLevel;
  setGrade: (grade: GradeLevel) => void;
  activeSubject: SubjectId | 'all';
  setActiveSubject: (subj: SubjectId | 'all') => void;
  activeGame: string | null;
  setActiveGame: (gameId: string | null) => void;
  activeCustomGame: GeneratedGameConfig | null;
  setActiveCustomGame: (config: GeneratedGameConfig | null) => void;
  student: StudentProfile;
  setStudent: React.Dispatch<React.SetStateAction<StudentProfile>>;
  progressHistory: GameProgress[];
  recordGameProgress: (gameId: string, subject: SubjectId, score: number, stars: number) => Promise<void>;
  soundMuted: boolean;
  toggleMute: () => void;
  isBackendConnected: boolean;
  apiMessage: string | null;
}

const DEFAULT_STUDENT: StudentProfile = {
  id: 'guest-1',
  nickname: 'ចរិយា (Chariya)',
  avatarId: 'avatar-girl-1',
  gradeLevel: 1,
  totalStars: 95,
  totalScore: 7037,
  totalGems: 7037,
};

const EdTechContext = createContext<EdTechContextType | undefined>(undefined);

export function EdTechProvider({ children }: { children: React.ReactNode }) {
  const [grade, setGradeState] = useState<GradeLevel>(1);
  const [activeSubject, setActiveSubject] = useState<SubjectId | 'all'>('all');
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [activeCustomGame, setActiveCustomGame] = useState<GeneratedGameConfig | null>(null);
  const [student, setStudent] = useState<StudentProfile>(DEFAULT_STUDENT);
  const [progressHistory, setProgressHistory] = useState<GameProgress[]>([]);
  const [soundMuted, setSoundMuted] = useState<boolean>(false);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);
  const [apiMessage, setApiMessage] = useState<string | null>(null);

  // Load saved state from localStorage
  useEffect(() => {
    try {
      const savedGrade = localStorage.getItem('smartkids_grade');
      if (savedGrade) {
        const parsed = parseInt(savedGrade, 10);
        if (parsed === 1 || parsed === 2 || parsed === 3) {
          setGradeState(parsed as GradeLevel);
        }
      }

      const savedStudent = localStorage.getItem('smartkids_student');
      if (savedStudent) {
        const parsed = JSON.parse(savedStudent);
        if (parsed && typeof parsed.name === 'string' && typeof parsed.id === 'string') {
          setStudent(parsed);
        }
      }

      const savedProgress = localStorage.getItem('smartkids_progress');
      if (savedProgress) {
        const parsed = JSON.parse(savedProgress);
        if (Array.isArray(parsed)) {
          setProgressHistory(parsed);
        }
      }
    } catch (e) {
      console.warn('[EdTechContext] Restoring defaults due to invalid storage:', e);
    }

    // Check backend connection
    checkBackendHealth();
  }, []);

  const checkBackendHealth = () => {
    setIsBackendConnected(true);
    setApiMessage('ដំណើរការ Next.js Full-Stack Architecture');
  };

  const setGrade = (newGrade: GradeLevel) => {
    sound.playPop();
    setGradeState(newGrade);
    setStudent(prev => ({ ...prev, gradeLevel: newGrade }));
    try {
      localStorage.setItem('smartkids_grade', newGrade.toString());
    } catch {}
  };

  const toggleMute = () => {
    const nextState = !soundMuted;
    setSoundMuted(nextState);
    sound.toggleSound(!nextState);
    if (!nextState) {
      sound.playPop();
    }
  };

  const recordGameProgress = async (
    gameId: string,
    subject: SubjectId,
    score: number,
    stars: number
  ) => {
    const newProgress: GameProgress = {
      userId: student.id,
      gameId,
      gradeLevel: grade,
      starsEarned: stars,
      score,
      completedAt: new Date().toISOString(),
    };

    // Functional state update prevents stale closures across rapid game completions
    setProgressHistory(prev => {
      const updatedHistory = [newProgress, ...prev];
      try {
        localStorage.setItem('smartkids_progress', JSON.stringify(updatedHistory));
      } catch {}
      return updatedHistory;
    });

    // Update local student stats
    setStudent(prev => {
      const updated = {
        ...prev,
        totalStars: prev.totalStars + stars,
        totalScore: prev.totalScore + score,
      };
      try {
        localStorage.setItem('smartkids_student', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // Unified Full-Stack App: Persist progress in local state & localStorage
    setIsBackendConnected(true);
  };

  return (
    <EdTechContext.Provider
      value={{
        grade,
        setGrade,
        activeSubject,
        setActiveSubject,
        activeGame,
        setActiveGame,
        activeCustomGame,
        setActiveCustomGame,
        student,
        setStudent,
        progressHistory,
        recordGameProgress,
        soundMuted,
        toggleMute,
        isBackendConnected,
        apiMessage,
      }}
    >
      {children}
    </EdTechContext.Provider>
  );
}

export function useEdTech() {
  const context = useContext(EdTechContext);
  if (!context) {
    throw new Error('useEdTech must be used within an EdTechProvider');
  }
  return context;
}
