// src/components/student/StudentStickyNavPill.tsx
'use client';

import React from 'react';
import { Search } from 'lucide-react';
import { sound } from '@/utils/sound';

export type StudentNavTab = 'moeys' | 'class_docs' | 'games' | 'custom';

export interface StudentStickyNavPillProps {
  activeTab: StudentNavTab;
  onTabChange: (tab: StudentNavTab) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  moeysCount?: number;
  classDocsCount?: number;
  gamesCount?: number;
  customCount?: number;
}

/**
 * Exact UI Match for SmartKids Student Dashboard Sticky Pill Navigation Bar
 * - Soft rounded-full container with border-2 border-amber-200/80 bg-white/90 backdrop-blur-md
 * - Navigation Pills:
 *   1. "📚 មេរៀន MoEYS (4)"
 *   2. "📄📑 ឯកសារថ្នាក់រៀន" (Active tab default: bg-amber-500 text-white font-medium shadow-md)
 *   3. "🎮 ហ្គេម ៤២ (7)"
 *   4. "✨ ផ្ទាល់ខ្លួន (0)"
 * - Right Search Input:
 *   - Rounded pill input with an amber Search icon and placeholder: "ស្វែងរកហ្គេម និងមេរៀន..."
 */
export function StudentStickyNavPill({
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  moeysCount = 4,
  classDocsCount = 3,
  gamesCount = 7,
  customCount = 0,
}: StudentStickyNavPillProps) {
  const tabs: Array<{ id: StudentNavTab; label: string }> = [
    { id: 'moeys', label: `📚 មេរៀន MoEYS (${moeysCount})` },
    { id: 'class_docs', label: `📄📑 ឯកសារថ្នាក់រៀន` },
    { id: 'games', label: `🎮 ហ្គេម ៤២ (${gamesCount})` },
    { id: 'custom', label: `✨ ផ្ទាល់ខ្លួន (${customCount})` },
  ];

  return (
    <div className="sticky top-2 z-40 w-full px-2 sm:px-4 py-2 transition-all">
      <div
        style={{ fontFamily: "'Kantumruy Pro', 'Noto Sans Khmer', system-ui, sans-serif" }}
        className="w-full max-w-6xl mx-auto border-2 border-amber-200/80 rounded-full bg-white/95 backdrop-blur-md shadow-sm p-1.5 sm:p-2 flex flex-col md:flex-row items-center justify-between gap-2.5 sm:gap-4"
      >
        {/* Navigation Pills (Horizontal flex & horizontal scroll on mobile) */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto w-full md:w-auto scrollbar-none py-0.5 px-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  sound.playPop();
                  onTabChange(tab.id);
                }}
                className={`shrink-0 px-3.5 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer select-none leading-none flex items-center justify-center ${
                  isActive
                    ? 'bg-amber-500 text-white font-medium shadow-md scale-102 ring-2 ring-amber-400/50'
                    : 'bg-transparent text-slate-700 hover:text-slate-900 hover:bg-amber-50/80'
                }`}
              >
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Search Input: Rounded pill input with an amber Search icon */}
        <div className="relative w-full md:w-72 shrink-0 px-1 sm:px-0">
          <Search className="w-4 h-4 text-amber-500 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="ស្វែងរកហ្គេម និងមេរៀន..."
            className="w-full pl-10 pr-4 py-2 rounded-full border border-amber-200/90 bg-amber-50/40 hover:bg-white focus:bg-white text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-200/80 shadow-2xs transition-all font-khmer"
          />
        </div>
      </div>
    </div>
  );
}
