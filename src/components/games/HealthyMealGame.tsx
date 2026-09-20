'use client';

import React, { useState } from 'react';
import { useEdTech } from '@/context/EdTechContext';
import { sound } from '@/utils/sound';
import confetti from 'canvas-confetti';
import { ArrowLeft, Star, RefreshCw, CheckCircle2 } from 'lucide-react';

type FoodGroup = 'energy' | 'growth' | 'protect';

interface FoodItem {
  id: string;
  nameKh: string;
  emoji: string;
  group: FoodGroup;
}

const FOOD_ITEMS: FoodItem[] = [
  { id: 'f1', nameKh: 'បាយ (Rice)', emoji: '🍚', group: 'energy' },
  { id: 'f2', nameKh: 'ត្រី (Fish)', emoji: '🐟', group: 'growth' },
  { id: 'f3', nameKh: 'ស្ពៃ (Greens)', emoji: '🥬', group: 'protect' },
  { id: 'f4', nameKh: 'ពោត (Corn)', emoji: '🌽', group: 'energy' },
  { id: 'f5', nameKh: 'ស៊ុត (Egg)', emoji: '🥚', group: 'growth' },
  { id: 'f6', nameKh: 'ចេក (Banana)', emoji: '🍌', group: 'protect' },
];

export const HealthyMealGame: React.FC = () => {
  const { grade, recordGameProgress, setActiveGame } = useEdTech();
  const [unassignedFoods, setUnassignedFoods] = useState<FoodItem[]>(FOOD_ITEMS);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [slots, setSlots] = useState<{ [key in FoodGroup]: FoodItem[] }>({
    energy: [],
    growth: [],
    protect: [],
  });
  const [score, setScore] = useState<number>(0);
  const [gameFinished, setGameFinished] = useState<boolean>(false);

  const handleSelectFood = (food: FoodItem) => {
    sound.playPop();
    setSelectedFood(food);
  };

  const handleAssignToGroup = (targetGroup: FoodGroup) => {
    if (!selectedFood) return;

    if (selectedFood.group === targetGroup) {
      sound.playSuccess();
      sound.playStar();
      setSlots(prev => ({
        ...prev,
        [targetGroup]: [...prev[targetGroup], selectedFood],
      }));
      const nextUnassigned = unassignedFoods.filter(f => f.id !== selectedFood.id);
      setUnassignedFoods(nextUnassigned);
      setSelectedFood(null);
      const points = 100;
      setScore(prev => prev + points);

      if (nextUnassigned.length === 0) {
        confetti({ particleCount: 90, spread: 70 });
        setGameFinished(true);
        recordGameProgress('healthy-meal', 'science', score + points, 3);
      }
    } else {
      sound.playWrong();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="flex items-center justify-between bg-white p-4 rounded-3xl border-4 border-rose-300 shadow-lg">
        <button
          onClick={() => {
            sound.playPop();
            setActiveGame(null);
          }}
          className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-rose-100 hover:bg-rose-200 text-rose-950 font-bold btn-kid text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>ថយក្រោយ</span>
        </button>
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-bold font-heading text-rose-900">
            🍱 ចានអាហារសុខភាព (Healthy Bento)
          </h2>
          <p className="text-xs text-rose-700 font-medium">
            ក្រុមអាហារទាំង៣ • ថ្នាក់ទី {grade}
          </p>
        </div>
        <div className="text-sm font-bold text-rose-900 bg-rose-50 px-3 py-1.5 rounded-2xl border-2 border-rose-200">
          ពិន្ទុ: {score}
        </div>
      </div>

      {gameFinished ? (
        <div className="bg-white rounded-3xl p-8 border-4 border-rose-400 text-center shadow-2xl space-y-6">
          <div className="text-5xl">🍱🎉</div>
          <h3 className="text-3xl font-extrabold text-rose-950 font-heading">
            ចានអាហារសុខភាពមានតុល្យភាពល្អឥតខ្ចោះ!
          </h3>
          <p className="text-slate-600">
            ប្អូនបានបែងចែកក្រុមអាហារថាមពល លូតលាស់ និងការពារបានត្រឹមត្រូវទាំងអស់!
          </p>
          <div className="flex justify-center gap-3">
            {[1, 2, 3].map(st => (
              <Star key={st} className="w-12 h-12 fill-amber-400 text-amber-500 scale-110" />
            ))}
          </div>
          <button
            onClick={() => {
              sound.playPop();
              setUnassignedFoods(FOOD_ITEMS);
              setSelectedFood(null);
              setSlots({ energy: [], growth: [], protect: [] });
              setScore(0);
              setGameFinished(false);
            }}
            className="px-6 py-3 rounded-2xl bg-rose-500 text-white font-bold btn-kid"
          >
            រៀបចំម្ដងទៀត
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Available Food Basket */}
          <div className="bg-amber-50 rounded-3xl p-5 border-3 border-amber-300">
            <span className="text-xs font-bold text-amber-900 uppercase block mb-2">
              អាហារដែលត្រូវរៀបចំចូលចាន (Tap a food item first):
            </span>
            <div className="flex flex-wrap gap-3">
              {unassignedFoods.map(food => {
                const isSelected = selectedFood?.id === food.id;
                return (
                  <button
                    key={food.id}
                    onClick={() => handleSelectFood(food)}
                    className={`px-4 py-2.5 rounded-2xl font-bold flex items-center gap-2 btn-kid transition-all ${
                      isSelected
                        ? 'bg-amber-400 text-amber-950 ring-4 ring-amber-300 scale-105'
                        : 'bg-white text-slate-800 border-2 border-amber-200'
                    }`}
                  >
                    <span className="text-2xl">{food.emoji}</span>
                    <span className="font-khmer">{food.nameKh}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3 Bento Compartments */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* 1. Energy */}
            <div
              onClick={() => handleAssignToGroup('energy')}
              className="bg-yellow-50/80 rounded-3xl p-5 border-4 border-yellow-400 cursor-pointer hover:bg-yellow-100 transition-all space-y-2 min-h-[180px]"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-900 font-khmer text-sm">⚡️ ក្រុមថាមពល</span>
                <span className="text-xs text-amber-700 bg-yellow-200 px-2 py-0.5 rounded-full">
                  បាយ មើម
                </span>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                {slots.energy.map(f => (
                  <span key={f.id} className="bg-white px-2.5 py-1.5 rounded-xl text-sm font-bold border border-yellow-300 flex items-center gap-1 shadow-sm">
                    {f.emoji} {f.nameKh}
                  </span>
                ))}
              </div>
            </div>

            {/* 2. Growth */}
            <div
              onClick={() => handleAssignToGroup('growth')}
              className="bg-blue-50/80 rounded-3xl p-5 border-4 border-blue-400 cursor-pointer hover:bg-blue-100 transition-all space-y-2 min-h-[180px]"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-blue-900 font-khmer text-sm">💪 ក្រុមលូតលាស់</span>
                <span className="text-xs text-blue-700 bg-blue-200 px-2 py-0.5 rounded-full">
                  សាច់ ត្រី ស៊ុត
                </span>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                {slots.growth.map(f => (
                  <span key={f.id} className="bg-white px-2.5 py-1.5 rounded-xl text-sm font-bold border border-blue-300 flex items-center gap-1 shadow-sm">
                    {f.emoji} {f.nameKh}
                  </span>
                ))}
              </div>
            </div>

            {/* 3. Protection */}
            <div
              onClick={() => handleAssignToGroup('protect')}
              className="bg-emerald-50/80 rounded-3xl p-5 border-4 border-emerald-400 cursor-pointer hover:bg-emerald-100 transition-all space-y-2 min-h-[180px]"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-900 font-khmer text-sm">🛡️ ក្រុមការពារ</span>
                <span className="text-xs text-emerald-700 bg-emerald-200 px-2 py-0.5 rounded-full">
                  បន្លែ ផ្លែឈើ
                </span>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                {slots.protect.map(f => (
                  <span key={f.id} className="bg-white px-2.5 py-1.5 rounded-xl text-sm font-bold border border-emerald-300 flex items-center gap-1 shadow-sm">
                    {f.emoji} {f.nameKh}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
