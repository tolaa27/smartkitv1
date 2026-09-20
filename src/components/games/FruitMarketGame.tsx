'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useEdTech } from '@/context/EdTechContext';
import { sound } from '@/utils/sound';
import confetti from 'canvas-confetti';
import {
  Volume2,
  Sparkles,
  Star,
  RefreshCw,
  ShoppingBag,
  ArrowLeft,
  CheckCircle,
  HelpCircle,
  Award,
} from 'lucide-react';

interface Question {
  operand1: number;
  operand2: number;
  operator: '+' | '-' | '×' | '÷';
  answer: number;
  fruitNameKh: string;
  fruitEmoji: string;
  questionKh: string;
}

const FRUITS_CATALOG = [
  { nameKh: 'ស្វាយ', nameEn: 'Mango', emoji: '🥭', color: 'from-amber-400 to-yellow-500' },
  { nameKh: 'ចេក', nameEn: 'Banana', emoji: '🍌', color: 'from-yellow-300 to-amber-400' },
  { nameKh: 'ដូង', nameEn: 'Coconut', emoji: '🥥', color: 'from-stone-500 to-amber-800' },
  { nameKh: 'ឪឡឹក', nameEn: 'Watermelon', emoji: '🍉', color: 'from-emerald-400 to-rose-500' },
];

export const FruitMarketGame: React.FC = () => {
  const { grade, recordGameProgress, setActiveGame } = useEdTech();

  // Mode: addition/subtraction or multiplication/division
  const [operationCategory, setOperationCategory] = useState<'add_sub' | 'mul_div'>(
    grade === 3 ? 'mul_div' : 'add_sub'
  );

  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [bagFruits, setBagFruits] = useState<number>(0);
  const [feedback, setFeedback] = useState<{
    status: 'idle' | 'correct' | 'incorrect';
    messageKh: string;
  }>({ status: 'idle', messageKh: '' });

  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [questionCount, setQuestionCount] = useState<number>(0);
  const [stars, setStars] = useState<number>(0);
  const [gameFinished, setGameFinished] = useState<boolean>(false);

  // Generate question tailored to Grade & Operation
  const generateQuestion = useCallback(() => {
    const selectedFruit = FRUITS_CATALOG[Math.floor(Math.random() * FRUITS_CATALOG.length)];
    let op: '+' | '-' | '×' | '÷' = '+';
    let a = 1;
    let b = 1;
    let ans = 2;

    if (operationCategory === 'add_sub') {
      op = Math.random() > 0.5 ? '+' : '-';

      if (grade === 1) {
        // Grade 1: values <= 20
        if (op === '+') {
          a = Math.floor(Math.random() * 8) + 2; // 2-9
          b = Math.floor(Math.random() * 8) + 1; // 1-8
          ans = a + b;
        } else {
          ans = Math.floor(Math.random() * 9) + 1;
          b = Math.floor(Math.random() * 8) + 1;
          a = ans + b; // ensures a - b >= 1
        }
      } else if (grade === 2) {
        // Grade 2: values <= 100 with carrying
        if (op === '+') {
          a = Math.floor(Math.random() * 45) + 15;
          b = Math.floor(Math.random() * 35) + 10;
          ans = a + b;
        } else {
          ans = Math.floor(Math.random() * 40) + 10;
          b = Math.floor(Math.random() * 30) + 10;
          a = ans + b;
        }
      } else {
        // Grade 3: values up to 500
        if (op === '+') {
          a = Math.floor(Math.random() * 180) + 50;
          b = Math.floor(Math.random() * 150) + 30;
          ans = a + b;
        } else {
          ans = Math.floor(Math.random() * 150) + 50;
          b = Math.floor(Math.random() * 120) + 20;
          a = ans + b;
        }
      }
    } else {
      // Multiplication / Division
      op = Math.random() > 0.4 ? '×' : '÷';

      if (grade === 1) {
        // Basic grouping for Grade 1
        op = '×';
        a = Math.floor(Math.random() * 4) + 2; // 2-5
        b = Math.floor(Math.random() * 4) + 1; // 1-4
        ans = a * b;
      } else if (grade === 2) {
        // Grade 2: multiplication tables 2-5
        if (op === '×') {
          a = Math.floor(Math.random() * 5) + 2;
          b = Math.floor(Math.random() * 8) + 2;
          ans = a * b;
        } else {
          b = Math.floor(Math.random() * 4) + 2;
          ans = Math.floor(Math.random() * 5) + 2;
          a = ans * b;
        }
      } else {
        // Grade 3: tables 2-9 and multi-digit
        if (op === '×') {
          a = Math.floor(Math.random() * 8) + 3;
          b = Math.floor(Math.random() * 8) + 2;
          ans = a * b;
        } else {
          b = Math.floor(Math.random() * 8) + 2;
          ans = Math.floor(Math.random() * 8) + 2;
          a = ans * b;
        }
      }
    }

    const questionKh = `ខ្ញុំចង់បានផ្លែ${selectedFruit.nameKh} ចំនួន៖ ${a} ${op} ${b} = ?`;

    setCurrentQuestion({
      operand1: a,
      operand2: b,
      operator: op,
      answer: ans,
      fruitNameKh: selectedFruit.nameKh,
      fruitEmoji: selectedFruit.emoji,
      questionKh,
    });
    setUserAnswer('');
    setBagFruits(0);
    setFeedback({ status: 'idle', messageKh: '' });
  }, [grade, operationCategory]);

  // Init game
  useEffect(() => {
    generateQuestion();
    setScore(0);
    setStreak(0);
    setQuestionCount(0);
    setStars(0);
    setGameFinished(false);
  }, [generateQuestion]);

  // Voice speech readout
  const speakQuestion = () => {
    if (!currentQuestion) return;
    sound.speakKhmer(currentQuestion.questionKh);
  };

  // Add fruit to bag via direct click
  const addFruitToBag = () => {
    sound.playDrop();
    const newCount = bagFruits + 1;
    setBagFruits(newCount);
    setUserAnswer(newCount.toString());
  };

  // Clear bag
  const clearBag = () => {
    sound.playPop();
    setBagFruits(0);
    setUserAnswer('');
  };

  // Keypad number input
  const handleKeypadPress = (digit: string) => {
    sound.playPop();
    if (userAnswer.length < 5) {
      const next = userAnswer + digit;
      setUserAnswer(next);
      const parsed = parseInt(next, 10);
      if (!isNaN(parsed)) {
        setBagFruits(parsed);
      }
    }
  };

  const handleBackspace = () => {
    sound.playPop();
    const next = userAnswer.slice(0, -1);
    setUserAnswer(next);
    const parsed = parseInt(next, 10);
    setBagFruits(isNaN(parsed) ? 0 : parsed);
  };

  // Submit and validate answer
  const handleSubmitAnswer = () => {
    if (!currentQuestion || !userAnswer) return;

    const numericAnswer = parseInt(userAnswer, 10);
    const isCorrect = numericAnswer === currentQuestion.answer;

    if (isCorrect) {
      sound.playSuccess();
      sound.playStar();

      // Trigger colorful confetti
      confetti({
        particleCount: 75,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FBBF24', '#38BDF8', '#4ADE80', '#F87171'],
      });

      const nextStreak = streak + 1;
      const pointsEarned = 100 + nextStreak * 20;
      setScore(prev => prev + pointsEarned);
      setStreak(nextStreak);
      setFeedback({
        status: 'correct',
        messageKh: `ឆ្លើយត្រូវហើយ! ពូកែណាស់! 🎉 (+${pointsEarned} ពិន្ទុ)`,
      });

      const nextCount = questionCount + 1;
      setQuestionCount(nextCount);

      if (nextCount >= 5) {
        // End of 5-round game
        const finalStars = nextStreak >= 4 ? 3 : nextStreak >= 2 ? 2 : 1;
        setStars(finalStars);
        setGameFinished(true);
        recordGameProgress('fruit-market', 'math', score + pointsEarned, finalStars);
      } else {
        setTimeout(() => {
          generateQuestion();
        }, 1400);
      }
    } else {
      sound.playWrong();
      setStreak(0);
      setFeedback({
        status: 'incorrect',
        messageKh: `មិនទាន់ត្រឹមត្រូវទេ! សាកល្បងម្ដងទៀតណា៎! (ចម្លើយត្រឹមត្រូវគឺ ${currentQuestion.answer})`,
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Top Game Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-3xl border-4 border-amber-300 shadow-lg">
        <button
          onClick={() => {
            sound.playPop();
            setActiveGame(null);
          }}
          className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold transition-all btn-kid text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>ថយក្រោយ</span>
        </button>

        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-bold font-heading text-amber-900 flex items-center justify-center gap-2">
            <span>🛒 ផ្សារផ្លែឈើអច្ឆរិយៈ</span>
          </h2>
          <p className="text-xs text-amber-700 font-medium">
            Fruit Market Counter • ថ្នាក់ទី {grade}
          </p>
        </div>

        {/* Operation Category Switcher */}
        <div className="flex bg-amber-100 p-1 rounded-2xl border-2 border-amber-300 gap-1">
          <button
            onClick={() => {
              sound.playPop();
              setOperationCategory('add_sub');
            }}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
              operationCategory === 'add_sub'
                ? 'bg-amber-500 text-white shadow'
                : 'text-amber-900 hover:bg-amber-200/60'
            }`}
          >
            បូក / ដក (+ -)
          </button>
          <button
            onClick={() => {
              sound.playPop();
              setOperationCategory('mul_div');
            }}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
              operationCategory === 'mul_div'
                ? 'bg-amber-500 text-white shadow'
                : 'text-amber-900 hover:bg-amber-200/60'
            }`}
          >
            គុណ / ចែក (× ÷)
          </button>
        </div>
      </div>

      {gameFinished ? (
        /* End Screen with stars celebration */
        <div className="bg-white rounded-3xl p-8 border-4 border-amber-400 text-center shadow-2xl space-y-6 animate-fade-in">
          <div className="w-20 h-20 mx-auto bg-amber-100 rounded-full flex items-center justify-center text-4xl shadow-inner border-2 border-amber-300 animate-bounce">
            🏆
          </div>
          <div>
            <h3 className="text-3xl font-extrabold text-amber-950 font-heading">
              អបអរសាទរ! ប្អូនឆ្លាតណាស់!
            </h3>
            <p className="text-slate-600 mt-1">
              បានបញ្ចប់ការទិញផ្លែឈើចំនួន ៥ ជុំដោយជោគជ័យ
            </p>
          </div>

          {/* Stars display */}
          <div className="flex justify-center gap-3">
            {[1, 2, 3].map(st => (
              <Star
                key={st}
                className={`w-12 h-12 transition-all duration-300 ${
                  st <= stars
                    ? 'fill-amber-400 text-amber-500 scale-110 drop-shadow-md'
                    : 'text-slate-300 fill-slate-100'
                }`}
              />
            ))}
          </div>

          <div className="bg-amber-50 rounded-2xl p-4 max-w-sm mx-auto border-2 border-amber-200 flex justify-around">
            <div>
              <span className="text-xs text-amber-700 block">ពិន្ទុសរុប</span>
              <span className="text-2xl font-black text-amber-950">{score}</span>
            </div>
            <div className="h-10 w-px bg-amber-200" />
            <div>
              <span className="text-xs text-amber-700 block">ផ្កាយទទួលបាន</span>
              <span className="text-2xl font-black text-amber-950">+{stars} ⭐️</span>
            </div>
          </div>

          <div className="flex justify-center gap-4 pt-2">
            <button
              onClick={() => {
                sound.playPop();
                setGameFinished(false);
                setQuestionCount(0);
                setScore(0);
                setStreak(0);
                generateQuestion();
              }}
              className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-base btn-kid flex items-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              <span>លេងម្ដងទៀត</span>
            </button>
            <button
              onClick={() => {
                sound.playPop();
                setActiveGame(null);
              }}
              className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-base btn-kid"
            >
              ទំព័រដើម
            </button>
          </div>
        </div>
      ) : (
        /* Active Game Arena */
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Column: Customer NPC & Fruit Stall */}
          <div className="md:col-span-7 space-y-4">
            {/* NPC Customer Speech Bubble */}
            <div className="bg-gradient-to-r from-sky-50 to-amber-50 p-5 rounded-3xl border-3 border-sky-300 shadow-md relative">
              <div className="flex items-start gap-4">
                {/* Cute Character Avatar */}
                <div className="w-16 h-16 rounded-2xl bg-white border-3 border-sky-400 flex items-center justify-center text-3xl shadow-md shrink-0">
                  🧒
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-sky-800 bg-sky-200/80 px-2 py-0.5 rounded-full">
                      អតិថិជនកុមារ (Cute Customer)
                    </span>
                    <button
                      onClick={speakQuestion}
                      className="p-1.5 rounded-xl bg-sky-200 hover:bg-sky-300 text-sky-900 transition-colors"
                      title="ស្ដាប់សំឡេង (Audio readout)"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-base sm:text-lg font-bold text-slate-800 font-khmer leading-snug">
                    {currentQuestion ? currentQuestion.questionKh : 'កំពុងរៀបចំ...'}
                  </p>
                </div>
              </div>

              {/* Big Visual Equation Badge */}
              {currentQuestion && (
                <div className="mt-3 bg-white/90 p-3 rounded-2xl border-2 border-sky-200 flex items-center justify-center gap-3 text-2xl font-black text-sky-900">
                  <span className="text-3xl">{currentQuestion.fruitEmoji}</span>
                  <span>{currentQuestion.operand1}</span>
                  <span className="text-amber-500">{currentQuestion.operator}</span>
                  <span>{currentQuestion.operand2}</span>
                  <span className="text-slate-400">=</span>
                  <span className="bg-amber-100 text-amber-900 px-3 py-0.5 rounded-xl border-2 border-amber-300 min-w-[50px] text-center">
                    {userAnswer || '?'}
                  </span>
                </div>
              )}
            </div>

            {/* Interactive Fruit Stall Crates */}
            <div className="bg-amber-100/90 rounded-3xl p-5 border-4 border-amber-300 shadow-inner">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                  តូបផ្លែឈើ (Fruit Stall Crates) - ចុចដើម្បីរាប់ផ្លែឈើ
                </span>
                <span className="text-xs text-amber-800 font-semibold">
                  ជុំទី {questionCount + 1}/5
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {FRUITS_CATALOG.map(fruit => (
                  <button
                    key={fruit.nameEn}
                    onClick={addFruitToBag}
                    className="p-3.5 bg-white rounded-2xl border-3 border-amber-200 hover:border-amber-400 transition-all flex flex-col items-center justify-center btn-kid group"
                  >
                    <span className="text-4xl group-hover:scale-125 transition-transform duration-200">
                      {fruit.emoji}
                    </span>
                    <span className="text-xs font-bold text-slate-800 mt-1 font-khmer">
                      {fruit.nameKh}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded-md mt-0.5">
                      +1 ផ្លែ
                    </span>
                  </button>
                ))}
              </div>

              {/* Shopping Bag Counter */}
              <div className="mt-4 bg-white rounded-2xl p-4 border-2 border-amber-300 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 border-2 border-amber-200 flex items-center justify-center text-amber-600">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 font-bold block">
                      ផ្លែឈើក្នុងថង់ (In Bag)
                    </span>
                    <span className="text-xl font-black text-amber-900">
                      {bagFruits} ផ្លែ
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={clearBag}
                    className="px-3 py-1.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold text-xs transition-colors"
                  >
                    លុប (Clear)
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Kid-Friendly Number Pad & Answer Box */}
          <div className="md:col-span-5 flex flex-col justify-between space-y-4">
            <div className="bg-white rounded-3xl p-5 border-4 border-sky-300 shadow-md">
              <div className="text-center mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase">
                  ក្ដារចុចលេខឆ្លាត (Smart Keypad)
                </span>
                <div className="mt-1 h-14 bg-amber-50 rounded-2xl border-2 border-amber-300 flex items-center justify-center text-2xl font-black text-amber-950 tracking-wider">
                  {userAnswer ? (
                    <span>{userAnswer}</span>
                  ) : (
                    <span className="text-slate-300 text-base font-normal">
                      ចុចលេខ ឬផ្លែឈើ...
                    </span>
                  )}
                </div>
              </div>

              {/* Keypad Grid 1-9 */}
              <div className="grid grid-cols-3 gap-2">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
                  <button
                    key={num}
                    onClick={() => handleKeypadPress(num)}
                    className="h-12 rounded-xl bg-slate-100 hover:bg-amber-100 text-slate-800 font-extrabold text-xl border-b-3 border-slate-300 hover:border-amber-400 active:translate-y-0.5 transition-all"
                  >
                    {num}
                  </button>
                ))}
                <button
                  onClick={handleBackspace}
                  className="h-12 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold text-sm border-b-3 border-rose-300 active:translate-y-0.5 transition-all"
                >
                  ⌫
                </button>
                <button
                  onClick={() => handleKeypadPress('0')}
                  className="h-12 rounded-xl bg-slate-100 hover:bg-amber-100 text-slate-800 font-extrabold text-xl border-b-3 border-slate-300 hover:border-amber-400 active:translate-y-0.5 transition-all"
                >
                  0
                </button>
                <button
                  onClick={() => {
                    sound.playPop();
                    generateQuestion();
                  }}
                  className="h-12 rounded-xl bg-sky-100 hover:bg-sky-200 text-sky-800 font-bold text-xs border-b-3 border-sky-300 active:translate-y-0.5 transition-all flex items-center justify-center"
                  title="ប្តូរសំណួរ"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmitAnswer}
                disabled={!userAnswer}
                className="w-full mt-3 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-extrabold text-lg shadow-lg btn-kid flex items-center justify-center gap-2 border-b-4 border-emerald-700"
              >
                <CheckCircle className="w-5 h-5" />
                <span>ផ្ទៀងផ្ទាត់ចម្លើយ (Submit)</span>
              </button>
            </div>

            {/* Instant Feedback Alert */}
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
