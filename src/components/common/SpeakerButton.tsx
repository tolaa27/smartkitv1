'use client';

import React, { useState, useEffect } from 'react';
import { Volume2, Volume1 } from 'lucide-react';
import { sound, SpeechEngine } from '@/utils/sound';

interface SpeakerButtonProps {
  text: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
  title?: string;
}

export const SpeakerButton: React.FC<SpeakerButtonProps> = ({
  text,
  size = 'sm',
  className = '',
  title = 'ស្ដាប់ការបញ្ចេញសំឡេង (Listen to voice)',
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // Warm up audio context on mount
    SpeechEngine.init();
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playPop();
    setIsPlaying(true);
    SpeechEngine.speak(text);

    const activeDuration = Math.max(1200, Math.min(text.length * 80, 4000));
    const timer = setTimeout(() => {
      setIsPlaying(false);
    }, activeDuration);

    return () => clearTimeout(timer);
  };

  const sizeClasses = {
    xs: 'p-1 text-xs w-6 h-6',
    sm: 'p-1.5 text-xs w-7 h-7',
    md: 'p-2 text-sm w-9 h-9',
    lg: 'p-2.5 text-base w-11 h-11',
  };

  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      title={title}
      className={`rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 transition-all duration-150 inline-flex items-center justify-center shadow-xs shrink-0 active:scale-95 overflow-visible ${sizeClasses[size]} ${
        isPlaying ? 'ring-2 ring-amber-400 bg-amber-200 shadow-md scale-105' : ''
      } ${className}`}
    >
      {isPlaying ? (
        <Volume1 className={`${iconSizes[size]} animate-pulse text-amber-950`} />
      ) : (
        <Volume2 className={iconSizes[size]} />
      )}
    </button>
  );
};

