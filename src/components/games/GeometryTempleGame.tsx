'use client';

import React, { useState } from 'react';
import { useEdTech } from '@/context/EdTechContext';
import { sound } from '@/utils/sound';
import confetti from 'canvas-confetti';
import { ArrowLeft, Star, Sparkles, RefreshCw, CheckCircle2 } from 'lucide-react';

interface ShapeTarget {
  slotId: string;
  nameKh: string;
  nameEn: string;
  type: 'triangle' | 'square' | 'circle' | 'rectangle' | 'cylinder' | 'cube';
  hintKh: string;
}

export const GeometryTempleGame: React.FC = () => {
  const { grade, recordGameProgress, setActiveGame } = useEdTech();

  const shapeTargets: ShapeTarget[] = [
    { slotId: 'roof-1', nameKh: 'ត្រីកោណ (កំពូលប្រាសាទ)', nameEn: 'Triangle', type: 'triangle', hintKh: 'មានជ្រុង ៣ និងកំពូល ៣' },
    { slotId: 'pillar-1', nameKh: 'ស៊ីឡាំង (សសរប្រាសាទ)', nameEn: 'Cylinder', type: 'cylinder', hintKh: 'មានផ្ទៃរាងមូល ២ នៅសងខាង' },
    { slotId: 'door-1', nameKh: 'ចតុកោណកែង (ទ្វារធំ)', nameEn: 'Rectangle', type: 'rectangle', hintKh: 'មានជ្រុងឈមគ្នាស្របគ្នា និងស្មើគ្នា' },
    { slotId: 'base-1', nameKh: 'គូប (ខឿនប្រាសាទ)', nameEn: 'Cube', type: 'cube', hintKh: 'មានមុខ ៦ ជាការ៉េទាំងអស់' },
  ];

  const [currentSlotIdx, setCurrentSlotIdx] = useState<number>(0);
  const currentSlot = shapeTargets[currentSlotIdx];
  const [repairedSlots, setRepairedSlots] = useState<string[]>([]);
  const [score, setScore] = useState<number>(0);
  const [gameFinished, setGameFinished] = useState<boolean>(false);

  const availableShapes = [
    { type: 'triangle', nameKh: 'ត្រីកោណ', emoji: '🔺' },
    { type: 'square', nameKh: 'ការ៉េ', emoji: '🟩' },
    { type: 'circle', nameKh: 'រង្វង់', emoji: '🟡' },
    { type: 'rectangle', nameKh: 'ចតុកោណកែង', emoji: '🚪' },
    { type: 'cylinder', nameKh: 'ស៊ីឡាំង', emoji: '🏛️' },
    { type: 'cube', nameKh: 'គូប', emoji: '🧊' },
  ];

  const handleSelectShape = (shapeType: string) => {
    if (!currentSlot) return;

    if (shapeType === currentSlot.type) {
      sound.playSuccess();
      sound.playStar();
      const nextRepaired = [...repairedSlots, currentSlot.slotId];
      setRepairedSlots(nextRepaired);
      const points = 150;
      setScore(prev => prev + points);

      if (currentSlotIdx + 1 >= shapeTargets.length) {
        confetti({ particleCount: 90, spread: 70 });
        setGameFinished(true);
        recordGameProgress('geometry-temple', 'math', score + points, 3);
      } else {
        setCurrentSlotIdx(prev => prev + 1);
      }
    } else {
      sound.playWrong();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="flex items-center justify-between bg-white p-4 rounded-3xl border-4 border-amber-300 shadow-lg">
        <button
          onClick={() => {
            sound.playPop();
            setActiveGame(null);
          }}
          className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold btn-kid text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>ថយក្រោយ</span>
        </button>
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-bold font-heading text-amber-900">
            🏛️ អ្នកសាងសង់ប្រាសាទធរណីមាត្រ
          </h2>
          <p className="text-xs text-amber-700 font-medium">
            Geometry Temple Builder • ថ្នាក់ទី {grade}
          </p>
        </div>
        <div className="text-sm font-bold text-amber-900 bg-amber-50 px-3 py-1.5 rounded-2xl border-2 border-amber-200">
          ពិន្ទុ: {score}
        </div>
      </div>

      {gameFinished ? (
        <div className="bg-white rounded-3xl p-8 border-4 border-amber-400 text-center shadow-2xl space-y-6">
          <div className="text-5xl">🏛️✨</div>
          <h3 className="text-3xl font-extrabold text-amber-950 font-heading">
            ប្រាសាទបុរាណត្រូវបានជួសជុលរួចរាល់!
          </h3>
          <p className="text-slate-600">
            ប្អូនពូកែសម្គាល់រូបធរណីមាត្រ ២D និង ៣D ណាស់!
          </p>
          <div className="flex justify-center gap-3">
            {[1, 2, 3].map(st => (
              <Star key={st} className="w-12 h-12 fill-amber-400 text-amber-500 scale-110" />
            ))}
          </div>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => {
                sound.playPop();
                setCurrentSlotIdx(0);
                setRepairedSlots([]);
                setScore(0);
                setGameFinished(false);
              }}
              className="px-6 py-3 rounded-2xl bg-emerald-500 text-white font-bold btn-kid flex items-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              <span>ជួសជុលម្ដងទៀត</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Temple Graphic */}
          <div className="bg-amber-50 rounded-3xl p-6 border-4 border-amber-300 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-48 h-48 bg-white rounded-2xl border-3 border-amber-200 flex flex-col items-center justify-center p-4 shadow-inner relative">
              <span className="text-6xl mb-2">🏛️</span>
              <span className="text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full">
                ផ្នែកត្រូវជួសជុល ({currentSlotIdx + 1}/4)
              </span>
              <p className="text-base font-black text-amber-950 mt-2 font-khmer">
                {currentSlot.nameKh}
              </p>
              <span className="text-xs text-amber-700 mt-1">
                {currentSlot.hintKh}
              </span>
            </div>
          </div>

          {/* Shape Selector */}
          <div className="bg-white rounded-3xl p-6 border-4 border-amber-200 shadow-md space-y-4">
            <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
              ជ្រើសរើសរូបធរណីមាត្រដែលត្រឹមត្រូវ (Select Shape):
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {availableShapes.map(sh => (
                <button
                  key={sh.type}
                  onClick={() => handleSelectShape(sh.type)}
                  className="p-4 rounded-2xl bg-amber-50 hover:bg-amber-100 border-2 border-amber-200 hover:border-amber-400 btn-kid flex flex-col items-center justify-center gap-1 transition-all"
                >
                  <span className="text-3xl">{sh.emoji}</span>
                  <span className="text-sm font-bold text-amber-950 font-khmer">
                    {sh.nameKh}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
