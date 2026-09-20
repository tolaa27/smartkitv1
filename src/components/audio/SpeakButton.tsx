// src/components/audio/SpeakButton.tsx
'use client';

import React, { useState } from 'react';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';
import { speechService } from '@/lib/audio/speechHook';
import { motion } from 'framer-motion';

interface SpeakButtonProps {
  text: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  label?: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'glass';
}

export const SpeakButton: React.FC<SpeakButtonProps> = ({
  text,
  className = '',
  size = 'md',
  showLabel = false,
  label = 'ស្ដាប់សម្លេង',
  variant = 'primary',
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!text) return;

    setIsPlaying(true);
    speechService.speak(text, () => {
      setIsPlaying(false);
    });
  };

  const sizeClasses = {
    sm: 'p-1.5 text-xs',
    md: 'p-2.5 text-sm',
    lg: 'p-3.5 text-base',
  }[size];

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }[size];

  const variantClasses = {
    primary:
      'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md active:translate-y-0.5 border-b-2 border-indigo-800',
    secondary:
      'bg-amber-400 hover:bg-amber-500 text-amber-950 shadow-md active:translate-y-0.5 border-b-2 border-amber-600',
    ghost: 'bg-transparent hover:bg-slate-100 text-slate-700 active:bg-slate-200',
    glass:
      'bg-white/80 hover:bg-white text-indigo-700 shadow-sm backdrop-blur-sm border border-indigo-100',
  }[variant];

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.94 }}
      onClick={handleSpeak}
      disabled={isPlaying}
      title={text}
      aria-label={`Listen to Khmer pronunciation: ${text}`}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl font-bold transition-all font-kantumruy ${sizeClasses} ${variantClasses} ${className}`}
    >
      {isPlaying ? (
        <motion.div
          animate={{ scale: [1, 1.25, 1] }}
          transition={{ repeat: Infinity, duration: 0.7 }}
        >
          <Volume2 className={`${iconSizes} text-white animate-pulse`} />
        </motion.div>
      ) : (
        <Volume2 className={iconSizes} />
      )}
      {showLabel && <span>{isPlaying ? 'កំពុងអាន...' : label}</span>}
    </motion.button>
  );
};

export default SpeakButton;
