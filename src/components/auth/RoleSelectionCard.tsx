// src/components/auth/RoleSelectionCard.tsx
'use client';

import React from 'react';
import { LucideIcon, ArrowRight } from 'lucide-react';

export interface RoleSelectionCardProps {
  id: string;
  role: 'student' | 'teacher';
  icon: React.ReactNode;
  pillLabel: string;
  titleKhmer: string;
  titleLatin: string;
  description: string;
  authMethodIcon: LucideIcon;
  authMethodText: string;
  onClick: () => void;
  className?: string;
}

/**
 * RoleSelectionCard
 *
 * Modern, playful, yet clean EdTech card component for authentication role selection.
 * Designed with Duolingo-meets-Stripe clarity:
 * - Symmetrical neutral resting state (#FFFFFF, slate border, soft ambient shadow)
 * - Strict Khmer script diacritic clearance (line-height 1.65-1.75, open circular glyphs)
 * - Role-specific hover/focus accents (Amber for Student, Indigo for Teacher)
 * - Docked bottom baseline anchor for auth method & action button
 * - WCAG AA compliant contrast & accessible keyboard focus rings
 */
export function RoleSelectionCard({
  id,
  role,
  icon,
  pillLabel,
  titleKhmer,
  titleLatin,
  description,
  authMethodIcon: AuthMethodIcon,
  authMethodText,
  onClick,
  className = '',
}: RoleSelectionCardProps) {
  const isStudent = role === 'student';

  // Role-specific micro-interaction and color tokens
  const roleStyles = isStudent
    ? {
        // Icon container: Soft pastel yellow
        iconBg: 'bg-amber-50 border-amber-100 text-amber-950',
        // Hover/focus border, lift, warm glow, focus ring
        cardHover:
          'hover:border-amber-400 hover:-translate-y-1.5 hover:shadow-[0_12px_28px_-6px_rgba(245,158,11,0.22)] focus-visible:border-amber-400 focus-visible:-translate-y-1.5 focus-visible:shadow-[0_12px_28px_-6px_rgba(245,158,11,0.22)] focus-visible:ring-amber-500',
        // Pill tag
        badgeBg: 'bg-amber-100/70 text-amber-800 border-amber-200/60',
        // Auth method hint
        hintText: 'text-amber-800',
        hintIcon: 'text-amber-600',
        // Action button
        actionBtn: 'bg-amber-500 hover:bg-amber-600 group-hover:bg-amber-500 text-white shadow-amber-500/20',
      }
    : {
        // Icon container: Soft sky/indigo
        iconBg: 'bg-indigo-50 border-indigo-100 text-indigo-950',
        // Hover/focus border, lift, cool glow, focus ring
        cardHover:
          'hover:border-indigo-400 hover:-translate-y-1.5 hover:shadow-[0_12px_28px_-6px_rgba(79,70,229,0.22)] focus-visible:border-indigo-400 focus-visible:-translate-y-1.5 focus-visible:shadow-[0_12px_28px_-6px_rgba(79,70,229,0.22)] focus-visible:ring-indigo-600',
        // Pill tag
        badgeBg: 'bg-indigo-100/70 text-indigo-800 border-indigo-200/60',
        // Auth method hint
        hintText: 'text-indigo-800',
        hintIcon: 'text-indigo-600',
        // Action button
        actionBtn: 'bg-indigo-600 hover:bg-indigo-700 group-hover:bg-indigo-600 text-white shadow-indigo-600/20',
      };

  return (
    <button
      id={id}
      type="button"
      onClick={onClick}
      aria-label={`${titleKhmer} (${titleLatin}) - ${authMethodText}`}
      style={{ fontFamily: "'Kantumruy Pro', 'Noto Sans Khmer', system-ui, sans-serif" }}
      className={`
        relative flex flex-col justify-between h-full w-full text-left
        p-6 sm:p-7 md:p-8
        bg-white border border-slate-200/80
        rounded-2xl md:rounded-[24px]
        shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]
        cursor-pointer group select-none
        transition-all duration-200 ease-out
        focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2
        ${roleStyles.cardHover}
        ${className}
      `}
    >
      {/* Top Body Container */}
      <div className="flex flex-col items-start w-full">
        {/* Header Row: Icon Container + Small Pill Chip */}
        <div className="flex items-center justify-between w-full mb-5">
          <div
            className={`
              w-14 h-14 sm:w-16 sm:h-16
              rounded-2xl border
              flex items-center justify-center text-3xl
              shrink-0 transition-transform duration-200 ease-out
              group-hover:scale-105
              ${roleStyles.iconBg}
            `}
          >
            {icon}
          </div>
          <span
            className={`
              text-xs font-semibold px-2.5 py-1 rounded-full border
              transition-colors duration-200 leading-normal
              ${roleStyles.badgeBg}
            `}
          >
            {pillLabel}
          </span>
        </div>

        {/* Role Title with proper Khmer diacritic clearance */}
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-[1.65] py-1 mb-1 tracking-tight">
          <span>{titleKhmer}</span>{' '}
          <span className="text-slate-500 font-medium text-lg sm:text-xl">
            ({titleLatin})
          </span>
        </h2>

        {/* Role Description with generous line-height for legibility */}
        <p className="text-xs sm:text-sm text-slate-600 font-normal leading-[1.75] mt-1">
          {description}
        </p>
      </div>

      {/* Bottom Baseline Anchor: Snaps to exact horizontal baseline across both cards */}
      <div className="pt-5 mt-6 border-t border-slate-100 flex items-center justify-between w-full">
        <span
          className={`
            text-xs sm:text-sm font-medium flex items-center gap-1.5
            transition-colors duration-200
            ${roleStyles.hintText}
          `}
        >
          <AuthMethodIcon className={`w-4 h-4 shrink-0 ${roleStyles.hintIcon}`} aria-hidden="true" />
          <span className="leading-[1.75]">{authMethodText}</span>
        </span>

        {/* Circular Action Button */}
        <span
          className={`
            w-10 h-10 sm:w-11 sm:h-11 rounded-full
            flex items-center justify-center shrink-0
            shadow-sm transition-all duration-200 ease-out
            group-hover:scale-105
            ${roleStyles.actionBtn}
          `}
          aria-hidden="true"
        >
          <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-200 ease-out group-hover:translate-x-0.5" />
        </span>
      </div>
    </button>
  );
}

export default RoleSelectionCard;
