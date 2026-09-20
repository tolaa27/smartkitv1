'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useEdTech } from '@/context/EdTechContext';
import { sound } from '@/utils/sound';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  Volume2,
  Sparkles,
  Star,
  RefreshCw,
  CheckCircle,
  RotateCcw,
  HelpCircle,
  BookOpen,
} from 'lucide-react';

interface SentenceLevel {
  id: string;
  grade: 1 | 2 | 3;
  correctOrder: string[];
  illustrationType: 'reading_boy' | 'cat_fish' | 'girl_flowers' | 'walk_school' | 'farmer_rice';
  meaningKh: string;
  meaningEn: string;
  hintKh: string;
}

const SENTENCE_LEVELS: SentenceLevel[] = [
  // Grade 1
  {
    id: 'g1-1',
    grade: 1,
    correctOrder: ['សុខ', 'អាន', 'សៀវភៅ'],
    illustrationType: 'reading_boy',
    meaningKh: 'សុខ អាន សៀវភៅ',
    meaningEn: 'Sok reads a book',
    hintKh: 'តើនរណាជាអ្នកធ្វើសកម្មភាព? (សុខ)',
  },
  {
    id: 'g1-2',
    grade: 1,
    correctOrder: ['កូនឆ្មា', 'ញ៉ាំ', 'ត្រីអាំង'],
    illustrationType: 'cat_fish',
    meaningKh: 'កូនឆ្មា ញ៉ាំ ត្រីអាំង',
    meaningEn: 'The kitten eats grilled fish',
    hintKh: 'តើសត្វអ្វីកំពុងញ៉ាំអាហារ? (កូនឆ្មា)',
  },
  {
    id: 'g1-3',
    grade: 1,
    correctOrder: ['ប្អូនស្រី', 'ស្រោច', 'ផ្កា'],
    illustrationType: 'girl_flowers',
    meaningKh: 'ប្អូនស្រី ស្រោច ផ្កា',
    meaningEn: 'Little sister waters flowers',
    hintKh: 'តើប្អូនស្រីកំពុងធ្វើអ្វីលើផ្កា?',
  },
  // Grade 2
  {
    id: 'g2-1',
    grade: 2,
    correctOrder: ['សិស្សានុសិស្ស', 'ដើរទៅ', 'សាលារៀន'],
    illustrationType: 'walk_school',
    meaningKh: 'សិស្សានុសិស្ស ដើរទៅ សាលារៀន',
    meaningEn: 'Students walk to school',
    hintKh: 'រៀបចំតាមលំដាប់៖ អ្នកណា + ធ្វើអ្វី + ទៅណា',
  },
  {
    id: 'g2-2',
    grade: 2,
    correctOrder: ['ប្អូនស្រី', 'ជួយ', 'ដាំផ្កា', 'ជាមួយម្ដាយ'],
    illustrationType: 'girl_flowers',
    meaningKh: 'ប្អូនស្រី ជួយ ដាំផ្កា ជាមួយម្ដាយ',
    meaningEn: 'Sister helps mother plant flowers',
    hintKh: 'អ្នកណាជួយដាំផ្កា?',
  },
  // Grade 3
  {
    id: 'g3-1',
    grade: 3,
    correctOrder: ['កសិករ', 'សប្បាយរីករាយ', 'ច្រូតស្រូវ', 'ក្នុងវាលស្រែ'],
    illustrationType: 'farmer_rice',
    meaningKh: 'កសិករ សប្បាយរីករាយ ច្រូតស្រូវ ក្នុងវាលស្រែ',
    meaningEn: 'The cheerful farmer harvests rice in the field',
    hintKh: 'ពាក្យពណ៌នាអំពីអារម្មណ៍របស់កសិករ',
  },
];

export const KhmerSentenceGame: React.FC = () => {
  const { grade, recordGameProgress, setActiveGame } = useEdTech();

  // Filter levels matching grade
  const gradeLevels = useMemo(() => {
    const list = SENTENCE_LEVELS.filter(l => l.grade === grade);
    return list.length > 0 ? list : SENTENCE_LEVELS.filter(l => l.grade === 1);
  }, [grade]);

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const currentLevel = gradeLevels[currentIndex] || gradeLevels[0];

  // Token state
  const [availableWords, setAvailableWords] = useState<{ id: string; text: string }[]>([]);
  const [placedWords, setPlacedWords] = useState<{ id: string; text: string }[]>([]);
  const [feedback, setFeedback] = useState<{ status: 'idle' | 'correct' | 'incorrect'; messageKh: string }>({
    status: 'idle',
    messageKh: '',
  });

  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [gameFinished, setGameFinished] = useState<boolean>(false);

  // Initialize and shuffle words
  const initLevel = (level: SentenceLevel) => {
    const tokens = level.correctOrder.map((text, idx) => ({
      id: `${text}-${idx}-${Math.random()}`,
      text,
    }));

    // Fisher-Yates shuffle
    const shuffled = [...tokens];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    setAvailableWords(shuffled);
    setPlacedWords([]);
    setFeedback({ status: 'idle', messageKh: '' });
  };

  useEffect(() => {
    if (currentLevel) {
      initLevel(currentLevel);
    }
  }, [currentLevel, currentIndex]);

  // Tap word to place
  const handleSelectWord = (word: { id: string; text: string }) => {
    sound.playPop();
    setAvailableWords(prev => prev.filter(w => w.id !== word.id));
    setPlacedWords(prev => [...prev, word]);
  };

  // Tap placed word to return
  const handleReturnWord = (word: { id: string; text: string }) => {
    sound.playPop();
    setPlacedWords(prev => prev.filter(w => w.id !== word.id));
    setAvailableWords(prev => [...prev, word]);
  };

  // Clear all back to available
  const handleResetSlots = () => {
    sound.playPop();
    initLevel(currentLevel);
  };

  // Audio speech readout
  const speakCurrentPlaced = () => {
    const textToSpeak = placedWords.length > 0
      ? placedWords.map(w => w.text).join(' ')
      : currentLevel.meaningKh;
    sound.speakKhmer(textToSpeak);
  };

  // Check correctness
  const handleCheckAnswer = () => {
    if (!currentLevel) return;

    const currentString = placedWords.map(w => w.text).join(' ');
    const correctString = currentLevel.correctOrder.join(' ');

    if (currentString === correctString) {
      sound.playSuccess();
      sound.playStar();

      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#38BDF8', '#4ADE80', '#FBBF24', '#F87171'],
      });

      const nextStreak = streak + 1;
      const points = 120 + nextStreak * 30;
      setScore(prev => prev + points);
      setStreak(nextStreak);
      setFeedback({
        status: 'correct',
        messageKh: 'អបអរសាទរ! ល្បះនេះត្រឹមត្រូវទាំងស្រុងហើយ! 🎉',
      });

      if (currentIndex + 1 >= gradeLevels.length) {
        const finalStars = nextStreak >= 3 ? 3 : nextStreak >= 2 ? 2 : 1;
        setGameFinished(true);
        recordGameProgress('sentence-puzzle', 'khmer', score + points, finalStars);
      } else {
        setTimeout(() => {
          setCurrentIndex(prev => prev + 1);
        }, 1500);
      }
    } else {
      sound.playWrong();
      setStreak(0);
      setFeedback({
        status: 'incorrect',
        messageKh: 'មិនទាន់ត្រូវតាមលំដាប់ទេ! សាកល្បងម្ដងទៀត ឬមើលជំនួយណា៎! 😊',
      });
    }
  };

  // Render cartoon illustration
  const renderIllustration = (type: SentenceLevel['illustrationType']) => {
    switch (type) {
      case 'reading_boy':
        return (
          <div className="w-full h-44 bg-gradient-to-b from-sky-100 to-amber-100 rounded-3xl flex items-center justify-center p-4 border-2 border-amber-200">
            <svg viewBox="0 0 200 140" className="h-full drop-shadow">
              {/* Desk */}
              <rect x="40" y="105" width="120" height="15" rx="4" fill="#D97706" />
              <rect x="50" y="120" width="10" height="20" fill="#B45309" />
              <rect x="140" y="120" width="10" height="20" fill="#B45309" />
              {/* Boy Head */}
              <circle cx="100" cy="45" r="22" fill="#FBBF24" />
              {/* Hair */}
              <path d="M78 40 Q 100 15 122 40 Q 110 32 100 32 Q 90 32 78 40" fill="#374151" />
              {/* Face features */}
              <circle cx="93" cy="45" r="2.5" fill="#1F2937" />
              <circle cx="107" cy="45" r="2.5" fill="#1F2937" />
              <path d="M96 55 Q 100 58 104 55" stroke="#92400E" strokeWidth="2" fill="none" />
              {/* Shirt */}
              <path d="M82 67 L 118 67 L 125 105 L 75 105 Z" fill="#38BDF8" />
              {/* Book */}
              <polygon points="80,102 100,96 120,102 120,112 100,106 80,112" fill="#F87171" />
              <polygon points="100,96 100,106 120,112 120,102" fill="#EF4444" />
              <line x1="85" y1="102" x2="97" y2="99" stroke="#FFF" strokeWidth="1.5" />
              <line x1="103" y1="99" x2="115" y2="102" stroke="#FFF" strokeWidth="1.5" />
            </svg>
          </div>
        );
      case 'cat_fish':
        return (
          <div className="w-full h-44 bg-gradient-to-b from-yellow-50 to-orange-100 rounded-3xl flex items-center justify-center p-4 border-2 border-orange-200">
            <svg viewBox="0 0 200 140" className="h-full drop-shadow">
              {/* Plate */}
              <ellipse cx="130" cy="115" rx="35" ry="12" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="2" />
              {/* Fish */}
              <ellipse cx="130" cy="113" rx="20" ry="7" fill="#FB923C" />
              <polygon points="150,113 160,107 160,119" fill="#EA580C" />
              <circle cx="116" cy="111" r="1.5" fill="#000" />
              {/* Cute Cat */}
              <circle cx="70" cy="85" r="26" fill="#FDBA74" />
              {/* Ears */}
              <polygon points="50,65 58,40 70,60" fill="#FB923C" />
              <polygon points="70,60 82,40 90,65" fill="#FB923C" />
              {/* Eyes & nose */}
              <circle cx="62" cy="83" r="2.5" fill="#1F2937" />
              <circle cx="78" cy="83" r="2.5" fill="#1F2937" />
              <polygon points="68,89 72,89 70,92" fill="#BE123C" />
              <path d="M66 94 Q 70 98 74 94" stroke="#BE123C" strokeWidth="1.5" fill="none" />
              {/* Whiskers */}
              <line x1="45" y1="84" x2="56" y2="86" stroke="#78350F" strokeWidth="1.5" />
              <line x1="45" y1="92" x2="56" y2="90" stroke="#78350F" strokeWidth="1.5" />
              <line x1="84" y1="86" x2="95" y2="84" stroke="#78350F" strokeWidth="1.5" />
              <line x1="84" y1="90" x2="95" y2="92" stroke="#78350F" strokeWidth="1.5" />
            </svg>
          </div>
        );
      case 'girl_flowers':
        return (
          <div className="w-full h-44 bg-gradient-to-b from-emerald-50 to-pink-50 rounded-3xl flex items-center justify-center p-4 border-2 border-emerald-200">
            <svg viewBox="0 0 200 140" className="h-full drop-shadow">
              {/* Grass */}
              <rect x="0" y="115" width="200" height="25" fill="#86EFAC" />
              {/* Flowers */}
              <circle cx="140" cy="95" r="8" fill="#F43F5E" />
              <circle cx="140" cy="95" r="4" fill="#FDE047" />
              <line x1="140" y1="103" x2="140" y2="120" stroke="#16A34A" strokeWidth="3" />

              <circle cx="165" cy="100" r="7" fill="#A855F7" />
              <circle cx="165" cy="100" r="3" fill="#FDE047" />
              <line x1="165" y1="107" x2="165" y2="120" stroke="#16A34A" strokeWidth="3" />
              {/* Girl */}
              <circle cx="80" cy="50" r="18" fill="#FDE68A" />
              {/* Hair */}
              <circle cx="65" cy="45" r="8" fill="#4B5563" />
              <circle cx="95" cy="45" r="8" fill="#4B5563" />
              <path d="M66 40 Q 80 26 94 40 Z" fill="#4B5563" />
              {/* Dress */}
              <polygon points="80,68 62,110 98,110" fill="#FB7185" />
              {/* Watering Can */}
              <rect x="100" y="85" width="18" height="14" rx="2" fill="#38BDF8" />
              <line x1="118" y1="88" x2="128" y2="82" stroke="#38BDF8" strokeWidth="3" />
              {/* Water droplets */}
              <circle cx="132" cy="85" r="1.5" fill="#0284C7" />
              <circle cx="135" cy="89" r="1.5" fill="#0284C7" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-full h-44 bg-gradient-to-b from-sky-100 to-amber-50 rounded-3xl flex items-center justify-center p-4 border-2 border-sky-200">
            <div className="text-center">
              <span className="text-5xl">🏫 🌾 🎒</span>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-3xl border-4 border-sky-300 shadow-lg">
        <button
          onClick={() => {
            sound.playPop();
            setActiveGame(null);
          }}
          className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-sky-100 hover:bg-sky-200 text-sky-950 font-bold transition-all btn-kid text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>ថយក្រោយ</span>
        </button>

        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-bold font-heading text-sky-900 flex items-center justify-center gap-2">
            <span>🧩 រូបភាពបង្កើតរឿង (Sentence Puzzle)</span>
          </h2>
          <p className="text-xs text-sky-700 font-medium">
            ភាសាខ្មែរ • ថ្នាក់ទី {grade} • កម្រិតទី {currentIndex + 1}/{gradeLevels.length}
          </p>
        </div>

        <button
          onClick={speakCurrentPlaced}
          className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold transition-all text-sm border-2 border-amber-300"
          title="អានល្បះនេះ (Read sentence)"
        >
          <Volume2 className="w-4 h-4" />
          <span>ស្ដាប់សំឡេង</span>
        </button>
      </div>

      {gameFinished ? (
        <div className="bg-white rounded-3xl p-8 border-4 border-sky-400 text-center shadow-2xl space-y-6 animate-fade-in">
          <div className="w-20 h-20 mx-auto bg-sky-100 rounded-full flex items-center justify-center text-4xl shadow-inner border-2 border-sky-300 animate-bounce">
            🎉
          </div>
          <div>
            <h3 className="text-3xl font-extrabold text-sky-950 font-heading">
              អស្ចារ្យណាស់! ប្អូនពូកែភាសាខ្មែរ!
            </h3>
            <p className="text-slate-600 mt-1">
              បានផ្គុំល្បះត្រឹមត្រូវគ្រប់ចំនួនកម្រិតសម្រាប់ថ្នាក់ទី {grade}
            </p>
          </div>

          <div className="flex justify-center gap-3">
            {[1, 2, 3].map(st => (
              <Star
                key={st}
                className="w-12 h-12 fill-amber-400 text-amber-500 scale-110 drop-shadow-md"
              />
            ))}
          </div>

          <div className="bg-sky-50 rounded-2xl p-4 max-w-sm mx-auto border-2 border-sky-200 flex justify-around">
            <div>
              <span className="text-xs text-sky-700 block">ពិន្ទុ</span>
              <span className="text-2xl font-black text-sky-950">{score}</span>
            </div>
            <div className="h-10 w-px bg-sky-200" />
            <div>
              <span className="text-xs text-sky-700 block">ផ្កាយ</span>
              <span className="text-2xl font-black text-amber-600">3 ⭐️</span>
            </div>
          </div>

          <div className="flex justify-center gap-4 pt-2">
            <button
              onClick={() => {
                sound.playPop();
                setGameFinished(false);
                setCurrentIndex(0);
                setScore(0);
                setStreak(0);
                initLevel(gradeLevels[0]);
              }}
              className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-base btn-kid flex items-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              <span>លេងឡើងវិញ</span>
            </button>
            <button
              onClick={() => {
                sound.playPop();
                setActiveGame(null);
              }}
              className="px-6 py-3 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-base btn-kid"
            >
              ទំព័រដើម
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Picture Card */}
          <div className="bg-white rounded-3xl p-6 border-4 border-amber-200 shadow-md">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-amber-500" />
                រូបភាពបំផុសគំនិត (Picture Prompt)
              </span>
              <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2.5 py-1 rounded-full">
                ជំនួយ៖ {currentLevel.hintKh}
              </span>
            </div>

            {renderIllustration(currentLevel.illustrationType)}
          </div>

          {/* Answer Drop Area / Sentence Slot */}
          <div className="bg-amber-50/80 rounded-3xl p-6 border-4 border-dashed border-amber-300 shadow-inner space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                ប្រអប់ផ្គុំល្បះ (Placed Words) - ចុចលើពាក្យដើម្បីដកចេញ
              </span>
              {placedWords.length > 0 && (
                <button
                  onClick={handleResetSlots}
                  className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-bold bg-rose-50 px-2.5 py-1 rounded-xl border border-rose-200"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>សម្អាត (Reset)</span>
                </button>
              )}
            </div>

            <div className="min-h-[72px] bg-white rounded-2xl p-3 border-2 border-amber-200 flex flex-wrap items-center gap-2.5">
              {placedWords.length === 0 ? (
                <p className="text-slate-400 text-sm font-khmer italic mx-auto">
                  សូមចុចលើប្លុកពាក្យខាងក្រោមដើម្បីតម្រៀបល្បះ...
                </p>
              ) : (
                placedWords.map((word, idx) => (
                  <button
                    key={word.id}
                    onClick={() => handleReturnWord(word)}
                    className="px-4 py-2.5 bg-gradient-to-r from-sky-400 to-sky-500 text-white font-bold text-base sm:text-lg rounded-2xl border-b-4 border-sky-700 shadow-md hover:bg-rose-500 hover:border-rose-700 transition-all font-khmer active:translate-y-0.5 group flex items-center gap-1.5"
                    title="ចុចដើម្បីដកពាក្យនេះចេញ"
                  >
                    <span>{word.text}</span>
                    <span className="text-xs opacity-70 group-hover:opacity-100">✕</span>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Word Pool */}
          <div className="bg-white rounded-3xl p-6 border-4 border-sky-200 shadow-md space-y-3">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
              ពាក្យសម្រាប់ជ្រើសរើស (Available Word Tokens) - ចុចដើម្បីដាក់
            </span>

            <div className="flex flex-wrap items-center justify-center gap-3 py-2">
              {availableWords.map(word => (
                <button
                  key={word.id}
                  onClick={() => handleSelectWord(word)}
                  className="px-5 py-3 bg-gradient-to-b from-amber-200 to-amber-300 hover:from-amber-300 hover:to-amber-400 text-amber-950 font-extrabold text-lg sm:text-xl rounded-2xl border-b-4 border-amber-500 shadow btn-kid transition-all font-khmer"
                >
                  {word.text}
                </button>
              ))}
            </div>

            {/* Check button & Feedback */}
            <div className="pt-2">
              <button
                onClick={handleCheckAnswer}
                disabled={placedWords.length === 0}
                className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-white font-extrabold text-lg shadow-lg btn-kid flex items-center justify-center gap-2 border-b-4 border-emerald-700"
              >
                <CheckCircle className="w-5 h-5" />
                <span>ផ្ទៀងផ្ទាត់ល្បះ (Check Sentence)</span>
              </button>
            </div>

            {feedback.status !== 'idle' && (
              <div
                className={`p-4 rounded-2xl border-2 font-bold text-sm flex items-center gap-2 animate-bounce ${
                  feedback.status === 'correct'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-rose-50 text-rose-800 border-rose-300'
                }`}
              >
                {feedback.status === 'correct' ? (
                  <Sparkles className="w-5 h-5 text-emerald-600 shrink-0" />
                ) : (
                  <HelpCircle className="w-5 h-5 text-rose-600 shrink-0" />
                )}
                <span>{feedback.messageKh}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
