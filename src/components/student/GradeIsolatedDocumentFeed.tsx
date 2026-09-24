// src/components/student/GradeIsolatedDocumentFeed.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  Sparkles,
  Eye,
  Volume2,
  Download,
  BookOpen,
  Camera,
  Layers,
  CheckCircle,
  X,
  ExternalLink,
  GraduationCap,
  Loader2,
} from 'lucide-react';
import { Document, DocumentSubject } from '@/lib/supabase/types';
import { SupabaseService } from '@/lib/supabase/service';
import { sound } from '@/utils/sound';

export interface GradeIsolatedDocumentFeedProps {
  gradeId?: string | null;
  gradeName?: string;
  searchQuery?: string;
}

export function GradeIsolatedDocumentFeed({
  gradeId,
  gradeName = 'ថ្នាក់រៀនរបស់អ្នក',
  searchQuery = '',
}: GradeIsolatedDocumentFeedProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedSubject, setSelectedSubject] = useState<DocumentSubject | 'all'>('all');
  const [activeDoc, setActiveDoc] = useState<Document | null>(null);

  // Read aloud text state
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Fetch documents for the specific student's grade
  useEffect(() => {
    let isMounted = true;
    async function loadClassDocuments() {
      setLoading(true);
      try {
        const docs = await SupabaseService.getDocuments(gradeId || undefined);
        if (isMounted) {
          setDocuments(docs);
        }
      } catch (err) {
        console.warn('[GradeIsolatedDocumentFeed] Error loading documents:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadClassDocuments();
    return () => {
      isMounted = false;
    };
  }, [gradeId]);

  // Filter documents by subject and search query
  const filteredDocs = useMemo(() => {
    let result = documents;

    if (selectedSubject !== 'all') {
      result = result.filter((d) => d.subject === selectedSubject);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          (d.description && d.description.toLowerCase().includes(q)) ||
          (d.ocr_text && d.ocr_text.toLowerCase().includes(q))
      );
    }

    return result;
  }, [documents, selectedSubject, searchQuery]);

  // Text to Speech read aloud
  const handleReadAloud = (doc: Document) => {
    sound.playPop();
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const textToSpeak = `${doc.title}។ ${doc.description || ''} ${doc.ocr_text || ''}`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = 'km-KH';
    utterance.rate = 0.9;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const subjectBadges: Record<DocumentSubject | 'all', { label: string; color: string }> = {
    all: { label: 'ទាំងអស់ (All)', color: 'bg-slate-100 text-slate-700' },
    khmer: { label: '🇰🇭 ភាសាខ្មែរ', color: 'bg-amber-100 text-amber-900 border-amber-200' },
    math: { label: '🔢 គណិតវិទ្យា', color: 'bg-blue-100 text-blue-900 border-blue-200' },
    science: { label: '🔬 វិទ្យាសាស្ត្រ', color: 'bg-emerald-100 text-emerald-900 border-emerald-200' },
  };

  return (
    <div
      style={{ fontFamily: "'Kantumruy Pro', 'Noto Sans Khmer', system-ui, sans-serif" }}
      className="space-y-6 w-full max-w-6xl mx-auto py-2"
    >
      {/* Grade Feed Header & Subject Filter Rail */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white/80 backdrop-blur-xs p-4 sm:p-5 rounded-3xl border border-amber-200/70 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-amber-400/90 text-slate-950 flex items-center justify-center text-lg font-bold">
              📑
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              ឯកសារថ្នាក់រៀន ៖ {gradeName}
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            មេរៀន សន្លឹកកិច្ចការ និងរូបថតកាមេរ៉ាដែលលោកគ្រូ-អ្នកគ្រូបានដាក់ឱ្យថ្នាក់របស់អ្នក
          </p>
        </div>

        {/* Subject Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none py-0.5">
          {(['all', 'khmer', 'math', 'science'] as const).map((subj) => {
            const isSelected = selectedSubject === subj;
            const badge = subjectBadges[subj];
            return (
              <button
                key={subj}
                type="button"
                onClick={() => {
                  sound.playPop();
                  setSelectedSubject(subj);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer select-none leading-none ${
                  isSelected
                    ? 'bg-amber-500 border-amber-500 text-white shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {badge.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Grid */}
      {loading ? (
        <div className="py-16 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500 mx-auto" />
          <p className="text-xs text-slate-500 font-medium">កំពុងទាញយកឯកសារមេរៀន...</p>
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="py-16 px-4 bg-white/60 border-2 border-dashed border-amber-200 rounded-3xl text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center text-3xl mx-auto shadow-2xs">
            🎒
          </div>
          <h3 className="font-bold text-base text-slate-800">
            មិនទាន់មានឯកសារសម្រាប់មុខវិជ្ជានេះនៅឡើយទេ
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            លោកគ្រូ-អ្នកគ្រូ នឹងបន្ថែមឯកសារ ឬថតរូបមេរៀនថ្មីៗក្នុងពេលឆាប់ៗនេះ។ សូមសាកល្បងជ្រើសរើសមុខវិជ្ជាផ្សេង!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDocs.map((doc) => {
            const isCamera = doc.file_type === 'camera_capture';
            const isPdf = doc.file_type === 'pdf';

            return (
              <div
                key={doc.id}
                className="bg-white rounded-3xl border-2 border-slate-200/80 hover:border-amber-400 p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group overflow-hidden"
              >
                {/* Image / File Preview Box */}
                <div
                  onClick={() => {
                    sound.playPop();
                    setActiveDoc(doc);
                  }}
                  className="relative w-full h-44 rounded-2xl bg-slate-100 overflow-hidden border border-slate-200/80 cursor-pointer group-hover:brightness-95 transition-all mb-3.5"
                >
                  <img
                    src={doc.file_url}
                    alt={doc.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=800&q=80';
                    }}
                  />

                  {/* Top Badges */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold flex items-center gap-1">
                      {isCamera ? (
                        <>
                          <Camera className="w-3 h-3 text-amber-400" />
                          <span>រូបថតកាមេរ៉ា</span>
                        </>
                      ) : isPdf ? (
                        <>
                          <FileText className="w-3 h-3 text-rose-400" />
                          <span>សន្លឹកកិច្ចការ PDF</span>
                        </>
                      ) : (
                        <>
                          <BookOpen className="w-3 h-3 text-sky-400" />
                          <span>មេរៀន</span>
                        </>
                      )}
                    </span>
                  </div>

                  <div className="absolute top-2.5 right-2.5">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        doc.subject === 'khmer'
                          ? 'bg-amber-100 text-amber-900'
                          : doc.subject === 'math'
                          ? 'bg-blue-100 text-blue-900'
                          : 'bg-emerald-100 text-emerald-900'
                      }`}
                    >
                      {doc.subject}
                    </span>
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="py-1.5 px-3 rounded-full bg-white/95 text-slate-900 font-bold text-xs shadow-md flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      <span>មើលឯកសារ</span>
                    </span>
                  </div>
                </div>

                {/* Document Information */}
                <div className="space-y-2 flex-1">
                  <h3 className="font-bold text-sm text-slate-900 line-clamp-1 leading-snug group-hover:text-amber-950">
                    {doc.title}
                  </h3>

                  {doc.description && (
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {doc.description}
                    </p>
                  )}

                  {doc.ocr_text && (
                    <div className="p-2 rounded-xl bg-amber-50/70 border border-amber-200/60 text-[11px] text-amber-900 line-clamp-2">
                      <span className="font-bold">📝 អត្ថបទដកស្រង់ ៖</span> {doc.ocr_text}
                    </div>
                  )}
                </div>

                {/* Footer Action Buttons */}
                <div className="pt-3.5 mt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleReadAloud(doc)}
                    aria-label="អានជាសំឡេង"
                    className="p-2 rounded-xl bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 transition-colors cursor-pointer"
                    title="ចុចដើម្បីអានជាសំឡេង"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        sound.playPop();
                        setActiveDoc(doc);
                      }}
                      className="py-1.5 px-3 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer active:scale-95 shadow-2xs"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>បើកមើល</span>
                    </button>
                    <a
                      href={doc.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
                      title="ទាញយក / បើកតំណភ្ជាប់"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Interactive Full Preview Modal */}
      {activeDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center text-xl font-bold shadow-2xs">
                  📄
                </span>
                <div>
                  <h3 className="font-bold text-base text-slate-900 line-clamp-1">
                    {activeDoc.title}
                  </h3>
                  <span className="text-xs text-slate-500 font-khmer">
                    មុខវិជ្ជា ៖ {activeDoc.subject.toUpperCase()} • ថ្នាក់រៀន ៖ {gradeName}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleReadAloud(activeDoc)}
                  className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-amber-50 text-slate-700 cursor-pointer"
                  title="អានជាសំឡេង"
                >
                  <Volume2 className="w-4 h-4 text-amber-600" />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDoc(null)}
                  className="p-2 rounded-xl bg-slate-200/80 hover:bg-slate-300 text-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
              <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 max-h-[60vh] flex items-center justify-center">
                <img
                  src={activeDoc.file_url}
                  alt={activeDoc.title}
                  className="w-full h-auto max-h-[55vh] object-contain"
                />
              </div>

              {activeDoc.description && (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <h4 className="text-xs font-bold text-slate-700 mb-1">ការណែនាំពីលោកគ្រូ-អ្នកគ្រូ ៖</h4>
                  <p className="text-xs text-slate-600 leading-relaxed font-khmer">
                    {activeDoc.description}
                  </p>
                </div>
              )}

              {activeDoc.ocr_text && (
                <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80">
                  <h4 className="text-xs font-bold text-amber-900 mb-1">អត្ថបទស្រង់ចេញពីមេរៀន (OCR) ៖</h4>
                  <p className="text-xs text-amber-950 leading-relaxed font-khmer">
                    {activeDoc.ocr_text}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50">
              <a
                href={activeDoc.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs"
              >
                <ExternalLink className="w-4 h-4" />
                <span>បើកមើលរូបភាពពេញ</span>
              </a>
              <button
                type="button"
                onClick={() => setActiveDoc(null)}
                className="py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs cursor-pointer"
              >
                បិទ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
