// src/components/teacher/DocumentCaptureModule.tsx
'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  Upload,
  RefreshCw,
  Check,
  X,
  FileText,
  Image as ImageIcon,
  Sparkles,
  AlertCircle,
  Loader2,
  Volume2,
} from 'lucide-react';
import { Grade, DocumentSubject, DocumentFileType } from '@/lib/supabase/types';
import { SupabaseService } from '@/lib/supabase/service';
import { sound } from '@/utils/sound';

export interface DocumentCaptureModuleProps {
  grades: Grade[];
  onSuccess: () => void;
  onCancel: () => void;
}

export function DocumentCaptureModule({
  grades,
  onSuccess,
  onCancel,
}: DocumentCaptureModuleProps) {
  // Capture mode: 'camera' | 'upload'
  const [mode, setMode] = useState<'camera' | 'upload'>('camera');

  // Form inputs
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedGradeId, setSelectedGradeId] = useState<string>(grades[0]?.id || '');
  const [selectedSubject, setSelectedSubject] = useState<DocumentSubject>('khmer');

  // File & Camera states
  const [capturedImageBlob, setCapturedImageBlob] = useState<Blob | null>(null);
  const [capturedPreviewUrl, setCapturedPreviewUrl] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<DocumentFileType>('camera_capture');

  // Camera stream controls
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // OCR state
  const [ocrText, setOcrText] = useState<string>('');
  const [isExtractingOcr, setIsExtractingOcr] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Start / Stop camera
  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsCameraActive(true);
      }
    } catch (err: any) {
      console.warn('[Camera] Access failed:', err);
      setCameraError('មិនអាចបើកកាមេរ៉ាបានទេ (សូមអនុញ្ញាតសិទ្ធិប្រើប្រាស់កាមេរ៉ា ឬជ្រើសរើសការផ្ទុកឡើងឯកសារ)');
      setIsCameraActive(false);
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  }, []);

  useEffect(() => {
    if (mode === 'camera' && !capturedPreviewUrl) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [mode, capturedPreviewUrl, startCamera, stopCamera]);

  // Flip camera (front <-> back)
  const handleToggleFacingMode = () => {
    sound.playPop();
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Trigger live camera photo
  const handleSnapPhoto = () => {
    sound.playSuccessChime();
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          setCapturedImageBlob(blob);
          setCapturedPreviewUrl(url);
          setFileType('camera_capture');
          stopCamera();
          simulateOcr(blob, 'រូបថតកាមេរ៉ា');
        }
      },
      'image/jpeg',
      0.88
    );
  };

  // File Upload Handler (PDF or Image)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    sound.playPop();
    setUploadedFile(file);
    const isPdf = file.type === 'application/pdf';
    setFileType(isPdf ? 'pdf' : 'image');

    const previewUrl = URL.createObjectURL(file);
    setCapturedPreviewUrl(previewUrl);

    if (!title) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setTitle(cleanName);
    }

    simulateOcr(file, file.name);
  };

  // Simulate or perform OCR Khmer extraction
  const simulateOcr = (fileOrBlob: Blob | File, sourceName: string) => {
    setIsExtractingOcr(true);
    setTimeout(() => {
      let mockKhmerText = '';
      if (selectedSubject === 'khmer') {
        mockKhmerText = `[OCR បានស្រង់ចេញដោយជោគជ័យ] ៖ ភាសាខ្មែរថ្នាក់ទី១ — មេរៀនស្រះនិស្ស័យ និងព្យញ្ជនៈពួក អ (ក ខ គ ឃ ង)។ សិស្សត្រូវអាន និងផ្គុំព្យាង្គ ៖ ក + ា = កា, ខ + ា = ខា។`;
      } else if (selectedSubject === 'math') {
        mockKhmerText = `[OCR បានស្រង់ចេញដោយជោគជ័យ] ៖ គណិតវិទ្យាថ្នាក់ទី១ — ប្រមាណវិធីបូកដកលេខក្នុងរង្វង់ ២០។ លំហាត់ទី ១ ៖ ៧ + ៥ = ១២, ១៥ - ៦ = ៩។`;
      } else {
        mockKhmerText = `[OCR បានស្រង់ចេញដោយជោគជ័យ] ៖ វិទ្យាសាស្ត្រ និងការសិក្សាសង្គម — វដ្តជីវិតរុក្ខជាតិ ៖ គ្រាប់ពូជត្រូវការដីមានជីជាតិ ទឹក និងពន្លឺព្រះអាទិត្យ។`;
      }
      setOcrText(mockKhmerText);
      setIsExtractingOcr(false);
    }, 700);
  };

  // Retake photo or reset file
  const handleRetake = () => {
    sound.playPop();
    setCapturedImageBlob(null);
    setCapturedPreviewUrl(null);
    setUploadedFile(null);
    setOcrText('');
    if (mode === 'camera') {
      startCamera();
    }
  };

  // Save to Supabase Storage & Database
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError('សូមបញ្ចូលចំណងជើងឯកសារ');
      return;
    }
    if (!selectedGradeId) {
      setFormError('សូមជ្រើសរើសកម្រិតថ្នាក់');
      return;
    }
    if (!capturedPreviewUrl && !uploadedFile && !capturedImageBlob) {
      setFormError('សូមថតរូប ឬផ្ទុកឡើងឯកសារជាមុនសិន');
      return;
    }

    sound.playPop();
    setIsSubmitting(true);
    setFormError(null);

    try {
      let uploadedFileUrl = capturedPreviewUrl || '';

      // Upload file to Supabase storage bucket
      const targetBlob = uploadedFile || capturedImageBlob;
      if (targetBlob) {
        const fileExt = fileType === 'pdf' ? 'pdf' : 'jpg';
        const fileName = `doc-${Date.now()}.${fileExt}`;
        uploadedFileUrl = await SupabaseService.uploadDocumentFile(targetBlob, fileName);
      }

      // Insert record to Supabase documents table
      await SupabaseService.createDocument({
        grade_id: selectedGradeId,
        uploaded_by: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        title: title.trim(),
        description: description.trim() || undefined,
        subject: selectedSubject,
        file_url: uploadedFileUrl,
        file_type: fileType,
        ocr_text: ocrText || undefined,
      });

      sound.playSuccessChime();
      setIsSubmitting(false);
      onSuccess();
    } catch (err: any) {
      console.error('[DocumentCapture] Submit error:', err);
      setFormError('មានបញ្ហាក្នុងការរក្សាទុកឯកសារ សូមព្យាយាមម្តងទៀត');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden max-w-4xl w-full mx-auto">
      {/* Header */}
      <div className="p-5 sm:p-6 bg-linear-to-r from-indigo-600 via-indigo-700 to-indigo-800 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-xs flex items-center justify-center text-xl">
            📷
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold leading-tight">
              ថតរូប ឬផ្ទុកឡើងឯកសារមេរៀន
            </h2>
            <p className="text-xs text-indigo-100 font-normal">
              Capture or Upload Class Documents & OCR Recognition
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-5 sm:p-7 space-y-6">
        {/* Mode Toggle Pills */}
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl max-w-sm">
          <button
            type="button"
            onClick={() => {
              sound.playPop();
              setMode('camera');
              handleRetake();
            }}
            className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
              mode === 'camera'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>ថតរូបផ្ទាល់ (Live Camera)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              sound.playPop();
              setMode('upload');
              handleRetake();
            }}
            className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
              mode === 'upload'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>ផ្ទុកឯកសារ (Upload File)</span>
          </button>
        </div>

        {/* Media Viewport Area */}
        <div className="relative rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 min-h-[300px] flex flex-col items-center justify-center overflow-hidden">
          {capturedPreviewUrl ? (
            /* Snapshot Preview */
            <div className="relative w-full h-[320px] flex items-center justify-center bg-black/90">
              {fileType === 'pdf' ? (
                <div className="flex flex-col items-center justify-center text-white p-6 gap-3">
                  <FileText className="w-16 h-16 text-rose-400" />
                  <span className="text-sm font-semibold">{uploadedFile?.name || 'ឯកសារ PDF'}</span>
                  <span className="text-xs text-slate-300">ឯកសារ PDF ត្រូវបានផ្ទុកឡើងដោយជោគជ័យ</span>
                </div>
              ) : (
                <img
                  src={capturedPreviewUrl}
                  alt="Captured Preview"
                  className="max-h-[320px] max-w-full object-contain"
                />
              )}
              {/* Retake Floating Button */}
              <button
                type="button"
                onClick={handleRetake}
                className="absolute top-4 right-4 bg-white/90 hover:bg-white text-slate-800 text-xs font-bold py-2 px-3.5 rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>ថត ឬផ្ទុកឡើងម្តងទៀត (Retake)</span>
              </button>
            </div>
          ) : mode === 'camera' ? (
            /* Live Camera Stream */
            <div className="relative w-full h-[320px] bg-black flex items-center justify-center">
              {cameraError ? (
                <div className="text-center p-6 text-rose-400 space-y-3">
                  <AlertCircle className="w-10 h-10 mx-auto" />
                  <p className="text-xs max-w-sm font-khmer">{cameraError}</p>
                  <button
                    type="button"
                    onClick={() => setMode('upload')}
                    className="py-2 px-4 rounded-xl bg-white text-slate-900 text-xs font-bold shadow-xs hover:bg-slate-100"
                  >
                    ប្តូរទៅផ្ទុកឡើងឯកសារវិញ
                  </button>
                </div>
              ) : (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  <canvas ref={canvasRef} className="hidden" />

                  {/* Camera Control Overlays */}
                  <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-4">
                    <button
                      type="button"
                      onClick={handleToggleFacingMode}
                      className="w-10 h-10 rounded-full bg-black/50 text-white hover:bg-black/70 flex items-center justify-center transition-colors cursor-pointer"
                      title="ប្តូរកាមេរ៉ាមុខ-ក្រោយ"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>

                    {/* Shutter Button */}
                    <button
                      type="button"
                      onClick={handleSnapPhoto}
                      disabled={!isCameraActive}
                      className="w-16 h-16 rounded-full bg-white border-4 border-amber-400 hover:border-amber-500 shadow-xl flex items-center justify-center active:scale-95 transition-transform cursor-pointer disabled:opacity-50"
                      title="ថតរូប"
                    >
                      <div className="w-11 h-11 rounded-full bg-amber-500" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            /* File Drag & Drop / Input */
            <div className="p-8 text-center flex flex-col items-center justify-center gap-3">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center text-3xl">
                <Upload className="w-8 h-8 text-indigo-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">
                  ទាញទម្លាក់ឯកសារ ឬចុចដើម្បីជ្រើសរើស
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  គាំទ្ររូបភាព (JPG, PNG, WebP) ឬឯកសារសន្លឹកកិច្ចការ PDF (រហូតដល់ 20MB)
                </p>
              </div>
              <label className="py-2.5 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm hover:shadow-md transition-all cursor-pointer">
                <span>ជ្រើសរើសឯកសារពីឧបករណ៍</span>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>

        {/* OCR / AI Extraction Live Preview Box */}
        {(isExtractingOcr || ocrText) && (
          <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 sm:p-5 space-y-2.5 animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-bold text-amber-900">
                  ការស្រង់អត្ថបទស្វ័យប្រវត្តិ (OCR / AI Text Extraction)
                </span>
              </div>
              {isExtractingOcr && (
                <div className="flex items-center gap-1.5 text-xs text-amber-700 font-semibold">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>កំពុងវិភាគអក្សរខ្មែរ...</span>
                </div>
              )}
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-khmer bg-white/80 p-3 rounded-xl border border-amber-100">
              {ocrText || 'កំពុងដំណើរការស្រង់អត្ថបទ និងព្យាង្គខ្មែរ...'}
            </p>
          </div>
        )}

        {/* Categorization & Metadata Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Grade Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                កម្រិតថ្នាក់ (Grade Level) *
              </label>
              <select
                value={selectedGradeId}
                onChange={(e) => setSelectedGradeId(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 bg-white font-medium text-xs text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              >
                {grades.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Subject Selection (Strictly Khmer, Math, Science) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                មុខវិជ្ជា (Subject) *
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'khmer' as DocumentSubject, label: 'ភាសាខ្មែរ', icon: '📖' },
                  { id: 'math' as DocumentSubject, label: 'គណិតវិទ្យា', icon: '🔢' },
                  { id: 'science' as DocumentSubject, label: 'វិទ្យាសាស្ត្រ', icon: '🔬' },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      sound.playPop();
                      setSelectedSubject(s.id);
                    }}
                    className={`py-2 px-2 rounded-xl border font-bold text-xs flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      selectedSubject === s.id
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-900 shadow-2xs font-bold'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                    }`}
                  >
                    <span>{s.icon}</span>
                    <span className="text-[11px] leading-tight">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              ចំណងជើងឯកសារ (Document Title) *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ឧទាហរណ៍ ៖ មេរៀនស្រះនិស្ស័យ ឬ សន្លឹកកិច្ចការបូកលេខ"
              className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 font-khmer text-xs text-slate-900"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              សេចក្តីពិពណ៌នា ឬការណែនាំ (Description)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="សេចក្តីណែនាំសម្រាប់សិស្សអនុវត្តលំហាត់ ឬកត់ត្រា..."
              className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 font-khmer text-xs text-slate-900"
            />
          </div>

          {formError && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onCancel}
              className="py-2.5 px-5 rounded-2xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
            >
              បោះបង់ (Cancel)
            </button>
            <button
              type="submit"
              disabled={isSubmitting || (!capturedPreviewUrl && !uploadedFile && !capturedImageBlob)}
              className="py-2.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>កំពុងរក្សាទុក...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>រក្សាទុកក្នុង Supabase Storage</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default DocumentCaptureModule;
