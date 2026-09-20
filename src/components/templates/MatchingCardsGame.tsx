'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { GameLevel } from '@/types/edtech';
import { SoundFX, sound } from '@/utils/sound';
import { SpeakerButton } from '@/components/common/SpeakerButton';
import { CheckCircle2, Sparkles, HelpCircle } from 'lucide-react';

interface MatchingCardsGameProps {
  level: GameLevel;
  onLevelComplete: (scoreGain: number) => void;
}

interface FlattenedCard {
  cardInstanceId: string;
  matchId: string;
  khmer: string;
  image?: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export const MatchingCardsGame: React.FC<MatchingCardsGameProps> = ({
  level,
  onLevelComplete,
}) => {
  const pairs = useMemo(
    () => level.gameplayData.pairs || [],
    [level.gameplayData.pairs]
  );
  const [cards, setCards] = useState<FlattenedCard[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [matchedCount, setMatchedCount] = useState<number>(0);

  useEffect(() => {
    // Generate card pairs
    const deck: FlattenedCard[] = [];
    pairs.forEach((pair, idx) => {
      // Side A: Text card
      deck.push({
        cardInstanceId: `${pair.id}-text-${idx}`,
        matchId: pair.matchId,
        khmer: pair.khmer,
        image: undefined,
        isFlipped: false,
        isMatched: false,
      });
      // Side B: Image / Symbol card
      deck.push({
        cardInstanceId: `${pair.id}-img-${idx}`,
        matchId: pair.matchId,
        khmer: pair.image ? '' : pair.khmer,
        image: pair.image,
        isFlipped: false,
        isMatched: false,
      });
    });

    // Shuffle cards
    const shuffled = [...deck].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setFlippedIndices([]);
    setMatchedCount(0);
  }, [level, pairs]);

  const handleFlipCard = (index: number) => {
    if (!cards[index] || cards[index].isMatched || cards[index].isFlipped) return;
    if (flippedIndices.length >= 2) return;

    sound.playPop();
    if (cards[index].khmer) {
      sound.speakKhmer(cards[index].khmer);
    }

    // Immutable card update
    setCards(prev => prev.map((c, i) => (i === index ? { ...c, isFlipped: true } : c)));

    const nextFlipped = [...flippedIndices, index];
    setFlippedIndices(nextFlipped);

    if (nextFlipped.length === 2) {
      const firstCard = cards[nextFlipped[0]];
      const secondCard = cards[nextFlipped[1]];

      if (firstCard && secondCard && firstCard.matchId === secondCard.matchId) {
        // Match!
        SoundFX.playSuccess();
        SoundFX.playCoin();
        setTimeout(() => {
          setCards(prev =>
            prev.map((c, i) =>
              i === nextFlipped[0] || i === nextFlipped[1]
                ? { ...c, isMatched: true }
                : c
            )
          );
          setFlippedIndices([]);

          setMatchedCount(prevCount => {
            const nextCount = prevCount + 1;
            if (nextCount >= pairs.length) {
              SoundFX.playStar();
              setTimeout(() => {
                onLevelComplete(120);
              }, 1000);
            }
            return nextCount;
          });
        }, 500);
      } else {
        // No match
        SoundFX.playGentleError();
        setTimeout(() => {
          setCards(prev =>
            prev.map((c, i) =>
              i === nextFlipped[0] || i === nextFlipped[1]
                ? { ...c, isFlipped: false }
                : c
            )
          );
          setFlippedIndices([]);
        }, 1100);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Prompt */}
      <div className="bg-amber-50 rounded-2xl p-4 border-2 border-amber-200 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <SpeakerButton text={level.promptText} size="sm" />
          <p className="text-base sm:text-lg font-extrabold text-amber-950 font-khmer">
            {level.promptText}
          </p>
        </div>
        <span className="text-xs bg-amber-200 text-amber-900 font-extrabold px-3 py-1 rounded-full shrink-0">
          ផ្គូផ្គងត្រូវ: {matchedCount}/{pairs.length} គូ
        </span>
      </div>

      {/* Cards Grid */}
      <div className="bg-white rounded-3xl p-6 border-4 border-amber-300 shadow-sm">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {cards.map((card, index) => {
            const showFace = card.isFlipped || card.isMatched;
            return (
              <button
                key={card.cardInstanceId}
                onClick={() => handleFlipCard(index)}
                disabled={card.isMatched}
                className={`min-h-[110px] sm:min-h-[130px] rounded-2xl p-3 border-3 font-extrabold text-base transition-all btn-kid flex flex-col items-center justify-center text-center ${
                  card.isMatched
                    ? 'bg-emerald-50 border-emerald-400 opacity-80 cursor-default'
                    : showFace
                    ? 'bg-amber-100 border-amber-400 text-amber-950 shadow-md'
                    : 'bg-gradient-to-b from-amber-400 to-yellow-500 border-amber-600 text-white shadow'
                }`}
              >
                {showFace ? (
                  <>
                    {card.image && <span className="text-4xl mb-1">{card.image}</span>}
                    {card.khmer && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="font-khmer text-base sm:text-lg">{card.khmer}</span>
                        <SpeakerButton
                          text={card.khmer}
                          size="xs"
                          className="bg-white/80 border-amber-300 shadow-none"
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-white/80 flex flex-col items-center gap-1">
                    <HelpCircle className="w-8 h-8 opacity-60" />
                    <span className="text-xs font-heading">បើកសន្លឹកបៀ</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
