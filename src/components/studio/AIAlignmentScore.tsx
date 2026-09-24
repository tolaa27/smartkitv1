// src/components/studio/AIAlignmentScore.tsx
// Meaningful Pedagogical Curriculum Alignment Score & AI Improver

'use client';

import React from 'react';
import { ShieldCheck, Sparkles, AlertCircle, Wand2 } from 'lucide-react';
import { CurriculumAlignmentData } from '@/lib/ai/types';
import { soundSynthesizer } from '@/lib/audio/SoundSynthesizer';

interface AIAlignmentScoreProps {
  alignment: CurriculumAlignmentData;
  onFixAlignment: () => void;
  isLoading?: boolean;
}

export const AIAlignmentScore: React.FC<AIAlignmentScoreProps> = ({
  alignment,
  onFixAlignment,
  isLoading = false,
}) => {
  const criteria = [
    { label: 'កម្មវិធីសិក្សាជាតិ (Curriculum)', score: alignment.curriculumScore },
    { label: 'កម្រិតថ្នាក់ (Grade Level)', score: alignment.gradeLevelScore },
    { label: 'ប្រធានបទ (Topic)', score: alignment.topicRelevanceScore },
    { label: 'ការវាយតម្លៃ (Assessment)', score: alignment.assessmentQualityScore },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>ការវិភាគគុណភាពមេរៀន (AI Alignment)</span>
        </div>
        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
          {alignment.overallScore}% Overall
        </span>
      </div>

      {/* Progress Bars */}
      <div className="space-y-2">
        {criteria.map((item, idx) => (
          <div key={idx} className="space-y-1">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
              <span>{item.label}</span>
              <span className="font-mono">{item.score}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                style={{ width: `${item.score}%` }}
                className={`h-full rounded-full transition-all duration-500 ${
                  item.score >= 90
                    ? 'bg-emerald-500'
                    : item.score >= 75
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Pedagogical Explanation & Suggestions */}
      {alignment.explanation && (
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-700 font-khmer leading-[1.8]">
          <p>{alignment.explanation}</p>
          {alignment.suggestions && alignment.suggestions.length > 0 && (
            <ul className="mt-1.5 space-y-0.5 text-slate-600">
              {alignment.suggestions.map((s, i) => (
                <li key={i} className="flex items-start gap-1">
                  <span className="text-amber-500 font-bold">•</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Fix / Improve with AI Button */}
      <button
        type="button"
        onClick={() => {
          soundSynthesizer.playClick();
          onFixAlignment();
        }}
        disabled={isLoading}
        className="w-full py-2 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-900 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
      >
        <Wand2 className="w-3.5 h-3.5 text-purple-600" />
        <span>កែលម្អការអនុលោមតាមកម្មវិធីសិក្សា (Fix with AI)</span>
      </button>
    </div>
  );
};
