// src/components/student/ClassDocumentsRail.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  Sparkles,
  Eye,
  Volume2,
  Download,
  BookOpen,
  X,
  GraduationCap,
  Layers,
  CheckCircle,
} from 'lucide-react';
import { Document, Grade, DocumentSubject } from '@/lib/supabase/types';
import { SupabaseService } from '@/lib/supabase/service';
import { sound } from '@/utils/sound';
import { SpeakerButton } from '@/components/common/SpeakerButton';
import { GradeLevel } from '@/types/game';
import { useEdTech } from '@/context/EdTechContext';

export interface ClassDocumentsRailProps {
  currentGradeLevel: GradeLevel;
  selectedSubject: 'all' | 'khmer' | 'math' | 'science' | 'social';
  onPracticeLesson?: (doc: Document) => void;
}

export function ClassDocumentsRail({
  currentGradeLevel,
  selectedSubject,
  onPracticeLesson,
}: ClassDocumentsRailProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDoc, setActiveDoc] = useState<Document | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [allGrades, allDocs] = await Promise.all([
          SupabaseService.getGrades(),
          SupabaseService.getDocuments(),
        ]);
        setGrades(allGrades);
        setDocuments(allDocs);
      } catch (err) {
        console.warn('[ClassDocumentsRail] Fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const { student } = useEdTech();

  // Match the student's grade level (1, 2, or 3) or direct grade_id
  const matchingGrade = useMemo(() => {
    if (student?.gradeId) {
      const direct = grades.find((g) => g.id === student.gradeId);
      if (direct) return direct;
    }
    return grades.find((g) => {
      const name = g.name.toLowerCase();
      if (currentGradeLevel === 1) return name.includes('១') || name.includes('1');
      if (currentGradeLevel === 2) return name.includes('២') || name.includes('2');
      if (currentGradeLevel === 3) return name.includes('៣') || name.includes('3');
      return false;
    });
  }, [grades, currentGradeLevel, student]);

  // Filter documents strictly by student's grade and active subject
  const enrolledDocuments = useMemo(() => {
    return documents.filter((doc) => {
      // 1. Strict Grade filtering by grade_id
      const matchesGrade = matchingGrade
        ? doc.grade_id === matchingGrade.id
        : true;

      // 2. Subject filtering
      const matchesSubject =
        selectedSubject === 'all' ||
        selectedSubject === 'social' || // if social selected, show related
        doc.subject === selectedSubject;

      return matchesGrade && matchesSubject;
    });
  }, [documents, matchingGrade, selectedSubject]);

  const getSubjectBadge = (subject: DocumentSubject) => {
    switch (subject) {
      case 'khmer':
        return {
          label: '📖 ភាសាខ្មែរ',
          style: 'bg-emerald-100 text-emerald-900 border-emerald-300',
          cardBg: 'hover:border-emerald-400 bg-linear-to-b from-emerald-50/40 to-white',
          btnBg: 'bg-emerald-500 hover:bg-emerald-600',
        };
      case 'math':
        return {
          label: '🔢 គណិតវិទ្យា',
          style: 'bg-amber-100 text-amber-900 border-amber-300',
          cardBg: 'hover:border-amber-400 bg-linear-to-b from-amber-50/40 to-white',
          btnBg: 'bg-amber-500 hover:bg-amber-600',
        };
      case 'science':
        return {
          label: '🔬 វិទ្យាសាស្ត្រ',
          style: 'bg-teal-100 text-teal-900 border-teal-300',
          cardBg: 'hover:border-teal-400 bg-linear-to-b from-teal-50/40 to-white',
          btnBg: 'bg-teal-500 hover:bg-teal-600',
        };
      default:
        return {
          label: '📚 មេរៀន',
          style: 'bg-slate-100 text-slate-800 border-slate-200',
          cardBg: 'hover:border-indigo-400 bg-linear-to-b from-indigo-50/40 to-white',
          btnBg: 'bg-indigo-600 hover:bg-indigo-700',
        };
    }
  };

  if (loading) {
    return (
      <div className="py-6 text-center text-xs text-amber-800 font-semibold font-khmer flex items-center justify-center gap-2">
        <Sparkles className="w-4 h-4 animate-spin text-amber-500" />
        <span>កំពុងទាញយកឯកសារថ្នាក់រៀន...</span>
      </div>
    );
  }

  return (
    <section className="space-y-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/60 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center text-lg shadow-2xs font-bold">
            📑
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-slate-900 font-khmer">
                ឯកសារ និងសន្លឹកកិច្ចការថ្នាក់រៀន
              </h2>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                សម្រាប់សិស្ស
              </span>
            </div>
            <p className="text-xs text-slate-500 font-khmer">
              ឯកសារ និងរូបថតមេរៀនដែលលោកគ្រូ-អ្នកគ្រូបានដាក់សម្រាប់{' '}
              {matchingGrade?.name || `ថ្នាក់ទី ${currentGradeLevel}`}
            </p>
          </div>
        </div>

        <span className="text-xs font-bold text-slate-500 self-start sm:self-auto bg-white px-3 py-1 rounded-full border border-slate-200 shadow-2xs">
          មាន {enrolledDocuments.length} ឯកសារ
        </span>
      </div>

      {/* Cards Grid */}
      {enrolledDocuments.length === 0 ? (
        <div className="p-8 rounded-3xl border-2 border-dashed border-amber-200 bg-amber-50/40 text-center space-y-2">
          <div className="text-3xl">🎒</div>
          <p className="text-sm font-bold text-slate-700 font-khmer">
            មិនទាន់មានឯកសារសម្រាប់ជម្រើសនេះនៅឡើយទេ
          </p>
          <p className="text-xs text-slate-500 font-khmer">
            ឯកសារដែលលោកគ្រូ-អ្នកគ្រូផ្ទុកឡើង នឹងបង្ហាញនៅត្រង់នេះដោយស្វ័យប្រវត្តិ។
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {enrolledDocuments.map((doc) => {
            const badge = getSubjectBadge(doc.subject);
            return (
              <div
                key={doc.id}
                onClick={() => {
                  sound.playPop();
                  setActiveDoc(doc);
                }}
                className={`clay-card rounded-3xl border-2 border-slate-200/80 p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between cursor-pointer group select-none ${badge.cardBg}`}
              >
                <div>
                  {/* Top Preview Thumbnail */}
                  <div className="relative h-40 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80 flex items-center justify-center mb-3">
                    {doc.file_type === 'pdf' ? (
                      <div className="flex flex-col items-center justify-center text-slate-400 gap-1.5 p-4 text-center">
                        <FileText className="w-12 h-12 text-rose-500" />
                        <span className="text-[11px] font-bold text-slate-700 uppercase">
                          សន្លឹកកិច្ចការ PDF
                        </span>
                      </div>
                    ) : (
                      <img
                        src={doc.file_url}
                        alt={doc.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}

                    {/* Subject Pill Top Left */}
                    <div className="absolute top-2.5 left-2.5">
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full border shadow-2xs font-khmer ${badge.style}`}
                      >
                        {badge.label}
                      </span>
                    </div>

                    {/* Quick Speaker Button */}
                    <div
                      className="absolute top-2.5 right-2.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <SpeakerButton
                        text={`${doc.title}។ ${doc.description || ''}`}
                        className="w-8 h-8 bg-white/90 hover:bg-white text-slate-800 shadow-sm rounded-full"
                        size="sm"
                      />
                    </div>

                    {/* OCR Chip if available */}
                    {doc.ocr_text && (
                      <div className="absolute bottom-2 left-2.5 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                        <Sparkles className="w-2.5 h-2.5" />
                        <span>អានអត្ថបទបាន</span>
                      </div>
                    )}
                  </div>

                  {/* Title and Description */}
                  <h3 className="font-heading font-black text-slate-900 text-sm sm:text-base leading-snug font-khmer line-clamp-2 group-hover:text-amber-700 transition-colors">
                    {doc.title}
                  </h3>
                  {doc.description && (
                    <p className="text-xs text-slate-600 font-khmer line-clamp-2 mt-1 leading-relaxed">
                      {doc.description}
                    </p>
                  )}
                </div>

                {/* Bottom Action Footer */}
                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-mono">
                    {new Date(doc.created_at).toLocaleDateString('km-KH')}
                  </span>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      sound.playPop();
                      setActiveDoc(doc);
                    }}
                    className={`btn-kid py-1.5 px-3.5 rounded-xl text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-all ${badge.btnBg}`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>បើកមើល</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* =================================================================== */}
      {/* INTERACTIVE READ-ONLY STUDENT DOCUMENT PREVIEW MODAL                */}
      {/* =================================================================== */}
      {activeDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border-2 border-amber-300 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-scale-up">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-linear-to-r from-amber-400 via-amber-500 to-yellow-400 text-amber-950 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">🎒</span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-white/40 px-2 py-0.5 rounded-full">
                      សន្លឹកកិច្ចការសិស្ស
                    </span>
                    <span className="text-xs font-bold text-amber-900">
                      {activeDoc.grade_name || `ថ្នាក់ទី ${currentGradeLevel}`}
                    </span>
                  </div>
                  <h3 className="font-heading font-black text-base sm:text-lg leading-snug mt-0.5 font-khmer">
                    {activeDoc.title}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveDoc(null)}
                className="w-9 h-9 rounded-full bg-white/40 hover:bg-white text-amber-950 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
              {/* Image / PDF Viewport */}
              <div className="rounded-2xl border-2 border-amber-200 bg-slate-900 overflow-hidden flex items-center justify-center max-h-80 shadow-inner">
                {activeDoc.file_type === 'pdf' ? (
                  <div className="p-8 text-center text-white space-y-3">
                    <FileText className="w-16 h-16 text-rose-400 mx-auto" />
                    <p className="text-sm font-bold font-khmer">{activeDoc.title}</p>
                    <a
                      href={activeDoc.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-amber-300 hover:text-white underline font-bold mt-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>ចុចទីនេះដើម្បីទាញយក ឬបើកមើលឯកសារ PDF ពេញលេញ</span>
                    </a>
                  </div>
                ) : (
                  <img
                    src={activeDoc.file_url}
                    alt={activeDoc.title}
                    className="max-h-80 max-w-full object-contain"
                  />
                )}
              </div>

              {/* Instructions / Description with Audio Button */}
              {activeDoc.description && (
                <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-900 font-khmer">
                      ការណែនាំពីលោកគ្រូ-អ្នកគ្រូ ៖
                    </span>
                    <button
                      type="button"
                      onClick={() => sound.speakKhmer(activeDoc.description || '')}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-900 hover:text-amber-950 bg-amber-200/60 px-2 py-0.5 rounded-lg transition-colors cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>ស្តាប់ការណែនាំ</span>
                    </button>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 font-khmer leading-relaxed">
                    {activeDoc.description}
                  </p>
                </div>
              )}

              {/* OCR Read-Aloud Text Box */}
              {activeDoc.ocr_text && (
                <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5 font-khmer">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      <span>អត្ថបទមេរៀន (OCR Text Reader)</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => sound.speakKhmer(activeDoc.ocr_text || activeDoc.title)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-900 bg-emerald-200/60 hover:bg-emerald-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>អានអត្ថបទឱ្យកូនស្តាប់</span>
                    </button>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-emerald-100 font-khmer text-xs leading-relaxed text-slate-800">
                    {activeDoc.ocr_text}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-khmer">
                កុមារឆ្លាត • របៀបអានសម្រាប់សិស្ស (Read-Only)
              </span>
              <button
                type="button"
                onClick={() => setActiveDoc(null)}
                className="py-2 px-5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
              >
                យល់ព្រម (Done)
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default ClassDocumentsRail;
