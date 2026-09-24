// src/components/teacher/ClassManagerModal.tsx
'use client';

import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Edit2,
  Check,
  GraduationCap,
  Users,
  FileText,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { Grade } from '@/lib/supabase/types';
import { SupabaseService } from '@/lib/supabase/service';
import { sound } from '@/utils/sound';

export interface ClassManagerModalProps {
  grades: Grade[];
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

export function ClassManagerModal({
  grades,
  isOpen,
  onClose,
  onRefresh,
}: ClassManagerModalProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newGradeName, setNewGradeName] = useState('');
  const [newGradeDesc, setNewGradeDesc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Edit states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  if (!isOpen) return null;

  const handleCreateGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGradeName.trim()) {
      setError('សូមបញ្ចូលឈ្មោះថ្នាក់រៀន');
      return;
    }

    sound.playPop();
    setIsSubmitting(true);
    setError(null);

    try {
      await SupabaseService.createGrade({
        name: newGradeName.trim(),
        description: newGradeDesc.trim() || undefined,
      });
      sound.playSuccessChime();
      setNewGradeName('');
      setNewGradeDesc('');
      setIsAdding(false);
      setIsSubmitting(false);
      onRefresh();
    } catch {
      setError('មានបញ្ហាក្នុងការបង្កើតថ្នាក់ថ្មី');
      setIsSubmitting(false);
    }
  };

  const handleStartEdit = (g: Grade) => {
    sound.playPop();
    setEditingId(g.id);
    setEditName(g.name);
  };

  const handleSaveEdit = async (id: string) => {
    if (!editName.trim()) return;
    sound.playPop();
    try {
      await SupabaseService.updateGrade(id, { name: editName.trim() });
      sound.playSuccessChime();
      setEditingId(null);
      onRefresh();
    } catch {
      setError('មិនអាចកែប្រែថ្នាក់រៀនបានទេ');
    }
  };

  const handleDelete = async (id: string) => {
    if (grades.length <= 1) {
      setError('មិនអាចលុបថ្នាក់រៀនទាំងអស់បានទេ');
      return;
    }
    sound.playPop();
    try {
      await SupabaseService.deleteGrade(id);
      sound.playSuccessChime();
      onRefresh();
    } catch {
      setError('មិនអាចលុបថ្នាក់រៀនបានទេ');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="p-5 bg-linear-to-r from-indigo-600 to-indigo-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-xl">
              🏫
            </div>
            <div>
              <h2 className="text-lg font-bold leading-tight">
                គ្រប់គ្រងថ្នាក់រៀន និងកម្រិតសិក្សា
              </h2>
              <p className="text-xs text-indigo-100 font-normal">
                Manage MoEYS Classes, Grades & Student Enrollment
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Existing Grades List */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">
                បញ្ជីថ្នាក់រៀនបច្ចុប្បន្ន ({grades.length})
              </span>
              {!isAdding && (
                <button
                  type="button"
                  onClick={() => {
                    sound.playPop();
                    setIsAdding(true);
                  }}
                  className="py-1.5 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>បន្ថែមថ្នាក់ថ្មី</span>
                </button>
              )}
            </div>

            <div className="space-y-2">
              {grades.map((grade) => (
                <div
                  key={grade.id}
                  className="p-3.5 rounded-2xl border border-slate-200 hover:border-indigo-300 bg-white shadow-2xs flex items-center justify-between transition-all"
                >
                  {editingId === grade.id ? (
                    <div className="flex items-center gap-2 flex-1 mr-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="px-2.5 py-1.5 rounded-xl border border-indigo-400 font-khmer text-xs flex-1"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(grade.id)}
                        className="p-1.5 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600"
                        title="រក្សាទុក"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="p-1.5 rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300"
                        title="បោះបង់"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base">🎒</span>
                        <h3 className="text-sm font-bold text-slate-800">{grade.name}</h3>
                      </div>
                      {grade.description && (
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                          {grade.description}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3 text-slate-400" />
                          <span>{grade.student_count || 20} សិស្ស</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText className="w-3 h-3 text-slate-400" />
                          <span>{grade.document_count || 0} ឯកសារ</span>
                        </span>
                      </div>
                    </div>
                  )}

                  {editingId !== grade.id && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(grade)}
                        className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                        title="កែប្រែឈ្មោះថ្នាក់"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(grade.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="លុបថ្នាក់"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Add New Class Form */}
          {isAdding && (
            <form onSubmit={handleCreateGrade} className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200 space-y-3 animate-fade-in">
              <span className="text-xs font-bold text-indigo-900 block">
                ទម្រង់បន្ថែមថ្នាក់រៀនថ្មី
              </span>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  ឈ្មោះថ្នាក់ (Class / Grade Name) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ឧទាហរណ៍ ៖ ថ្នាក់ទី៤ (Grade 4) ឬ ថ្នាក់ត្រៀម"
                  value={newGradeName}
                  onChange={(e) => setNewGradeName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-indigo-300 bg-white font-khmer text-xs focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  ការពិពណ៌នា (Description)
                </label>
                <input
                  type="text"
                  placeholder="ឧទាហរណ៍ ៖ កម្មវិធីសិក្សាភាសាខ្មែរ និងគណិតវិទ្យា"
                  value={newGradeDesc}
                  onChange={(e) => setNewGradeDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-indigo-300 bg-white font-khmer text-xs focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="py-1.5 px-3 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-white"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="py-1.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5"
                >
                  {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>បង្កើតថ្នាក់</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-5 rounded-2xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            បិទ (Close)
          </button>
        </div>
      </div>
    </div>
  );
}

export default ClassManagerModal;
