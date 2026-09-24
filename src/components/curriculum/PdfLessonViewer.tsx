// src/components/curriculum/PdfLessonViewer.tsx
// Production-Ready Interactive PDF Curriculum Document Viewer
// Supports PDF upload, URL ingest, MoEYS textbook presets, page navigation,
// zoom, text extraction, bounding-box selection, and direct dispatch to Lesson & Video AI engines.

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  FileText,
  Upload,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Sparkles,
  Video,
  Crop,
  Copy,
  Check,
  RotateCw,
  Eye,
  AlertCircle,
  BookOpen,
  Loader2,
  Layers,
  Search,
} from 'lucide-react';
import { soundSynthesizer } from '@/lib/audio/SoundSynthesizer';
import { BoundingBoxCoordinates, PdfCurriculumReference } from '@/types/lesson-studio';

// Preset MoEYS curriculum documents for immediate classroom use
export interface PresetCurriculumDoc {
  id: string;
  titleKhmer: string;
  titleEnglish: string;
  gradeLevel: 1 | 2 | 3;
  subject: 'math' | 'science' | 'khmer' | 'social';
  totalPages: number;
  pages: Array<{
    pageNumber: number;
    titleKhmer: string;
    contentKhmer: string;
    keyTerms: string[];
    diagramLabelKhmer?: string;
    diagramType?: 'comparison' | 'stages' | 'spatial' | 'phonetics';
  }>;
}

export const MOEYS_CURRICULUM_PRESETS: PresetCurriculumDoc[] = [
  {
    id: 'moeys-math-g1-ch3',
    titleKhmer: 'គណិតវិទ្យា ថ្នាក់ទី១៖ មេរៀនទី៣ ការប្រៀបធៀបទំហំ និងប្រវែង',
    titleEnglish: 'Math Grade 1: Chapter 3 Size and Length Comparison',
    gradeLevel: 1,
    subject: 'math',
    totalPages: 3,
    pages: [
      {
        pageNumber: 1,
        titleKhmer: 'ការប្រៀបធៀបទំហំ (ធំជាង - តូចជាង)',
        contentKhmer:
          'មេរៀនទី៣៖ ការប្រៀបធៀបទំហំ\n១. ផ្លែឪឡឹក មានទំហំធំជាង ផ្លែក្រូច។\n២. ផ្លែក្រូច មានទំហំតូចជាង ផ្លែឪឡឹក។\n៣. គោ មានទំហំធំជាង ពពែ។\n៤. ពពែ មានទំហំតូចជាង គោ។\nចូរសង្កេតរូបភាព និងប្រាប់ថា តើវត្ថុណាធំជាង ឬតូចជាង?',
        keyTerms: ['ធំជាង (Bigger)', 'តូចជាង (Smaller)', 'ផ្លែឪឡឹក', 'ផ្លែក្រូច', 'ប្រៀបធៀប'],
        diagramLabelKhmer: 'រូបភាពប្រៀបធៀបផ្លែឈើ និងសត្វ',
        diagramType: 'comparison',
      },
      {
        pageNumber: 2,
        titleKhmer: 'ការប្រៀបធៀបប្រវែង (វែងជាង - ខ្លីជាង)',
        contentKhmer:
          'មេរៀនទី៣ (បន្ត)៖ ការប្រៀបធៀបប្រវែង\n១. បន្ទាត់ឈើ មានប្រវែងវែងជាង ខ្មៅដៃ។\n២. ខ្មៅដៃ មានប្រវែងខ្លីជាង បន្ទាត់ឈើ។\n៣. ពស់វែងជាង កង្កែប។\n៤. កង្កែបខ្លីជាង ពស់។\nលំហាត់អនុវត្ត៖ ចូរគូសរង្វង់ជុំវិញវត្ថុដែលវែងជាងគេ។',
        keyTerms: ['វែងជាង (Longer)', 'ខ្លីជាង (Shorter)', 'បន្ទាត់', 'ខ្មៅដៃ', 'ប្រវែង'],
        diagramLabelKhmer: 'រូបភាពប្រៀបធៀបប្រវែងបន្ទាត់ និងខ្មៅដៃ',
        diagramType: 'comparison',
      },
      {
        pageNumber: 3,
        titleKhmer: 'ការប្រៀបធៀបកម្ពស់ (ខ្ពស់ជាង - ទាបជាង)',
        contentKhmer:
          'មេរៀនទី៣ (បន្ត)៖ ការប្រៀបធៀបកម្ពស់\n១. ដើមត្នោត មានកម្ពស់ខ្ពស់ជាង ដើមចេក។\n២. ដើមចេក មានកម្ពស់ទាបជាង ដើមត្នោត។\n៣. សត្វហ្ស៊ីរ៉ាហ្វ ខ្ពស់ជាង សត្វសេះបង្កង់។\nចូរប្រាប់ឈ្មោះវត្ថុដែលខ្ពស់ជាងគេនៅក្នុងថ្នាក់រៀនរបស់អ្នក។',
        keyTerms: ['ខ្ពស់ជាង (Taller)', 'ទាបជាង (Shorter/Lower)', 'ដើមត្នោត', 'ដើមចេក'],
        diagramLabelKhmer: 'រូបភាពដើមត្នោត និងដើមចេក',
        diagramType: 'spatial',
      },
    ],
  },
  {
    id: 'moeys-sci-g1-plants',
    titleKhmer: 'វិទ្យាសាស្ត្រ ថ្នាក់ទី១៖ ការដុះពន្លក និងលូតលាស់នៃរុក្ខជាតិ',
    titleEnglish: 'Science Grade 1: Plant Germination and Growth',
    gradeLevel: 1,
    subject: 'science',
    totalPages: 2,
    pages: [
      {
        pageNumber: 1,
        titleKhmer: 'តម្រូវការនៃការដុះពន្លកគ្រាប់ពូជ',
        contentKhmer:
          'មេរៀនទី១៖ ការដុះពន្លកនៃគ្រាប់ពូជ\nគ្រាប់ពូជរុក្ខជាតិត្រូវការកត្តាសំខាន់ៗចំនួន ៣ ដើម្បីដុះពន្លក៖\n១. ទឹក (Water): ធ្វើឱ្យគ្រាប់ពូជទន់ និងចាប់ផ្តើមដុះឫស។\n២. ខ្យល់ (Air): ផ្តល់អុកស៊ីសែនសម្រាប់ដកដង្ហើម។\n៣. កម្ដៅសមស្រប (Temperature): ជួយឱ្យកោសិកាដំណើរការ។\nនៅពេលមានសំណើម ឫសដុះចេញមុនគេ បន្ទាប់មកពន្លកស្លឹកដុះឡើងលើ។',
        keyTerms: ['គ្រាប់ពូជ', 'ដុះពន្លក', 'សំណើម', 'ពន្លឺថ្ងៃ', 'ឫស', 'ដើម'],
        diagramLabelKhmer: 'ដ្យាក្រាមដំណាក់កាលគ្រាប់សណ្តែកដុះពន្លក',
        diagramType: 'stages',
      },
      {
        pageNumber: 2,
        titleKhmer: 'ការលូតលាស់ និងផ្នែកផ្សេងៗនៃរុក្ខជាតិ',
        contentKhmer:
          'ផ្នែកសំខាន់ៗនៃរុក្ខជាតិពេញវ័យរួមមាន៖\n១. ឫស (Roots): ស្រូបយកទឹក និងជីជាតិពីដី។\n២. ដើម (Stem): ទ្រទ្រង់មែកធាង និងបញ្ជូនទឹកទៅស្លឹក។\n៣. ស្លឹក (Leaves): ធ្វើរស្មីសំយោគដោយប្រើពន្លឺព្រះអាទិត្យ។\n៤. ផ្កា និងផ្លែ (Flowers & Fruits): បង្កើតគ្រាប់ពូជថ្មីសម្រាប់បន្តពូជ។',
        keyTerms: ['ឫស', 'ដើម', 'ស្លឹក', 'ផ្កា', 'ផ្លែ', 'រស្មីសំយោគ'],
        diagramLabelKhmer: 'រូបភាពផ្នែកទាំង ៤ នៃរុក្ខជាតិ',
        diagramType: 'stages',
      },
    ],
  },
  {
    id: 'moeys-khmer-g2-consonants',
    titleKhmer: 'ភាសាខ្មែរ ថ្នាក់ទី២៖ ព្យញ្ជនៈផ្ញើជើង និងស្រះផ្សំ',
    titleEnglish: 'Khmer Language Grade 2: Subscript Consonants and Vowels',
    gradeLevel: 2,
    subject: 'khmer',
    totalPages: 2,
    pages: [
      {
        pageNumber: 1,
        titleKhmer: 'ព្យញ្ជនៈផ្ញើជើង «ក្រ» «ត្រ» «ប្រ»',
        contentKhmer:
          'មេរៀនទី៥៖ ព្យញ្ជនៈផ្ញើជើង\n- ក + ជើង រ = ក្រ (ឧទាហរណ៍៖ ក្រូច, ក្របី, ក្រដាស)\n- ត + ជើង រ = ត្រ (ឧទាហរណ៍៖ ត្រី, ត្រកួន, ត្រសក់)\n- ប + ជើង រ = ប្រ (ឧទាហរណ៍៖ ប្រាក់, ប្រាសាទ, ប្រអប់)\nអានឃ្លា៖ «បងប្រុសនាំខ្ញុំទៅស្ទូចត្រីនៅមាត់ស្ទឹង»។',
        keyTerms: ['ព្យញ្ជនៈផ្ញើជើង', 'ក្រូច', 'ត្រី', 'ប្រាក់', 'ជើង រ'],
        diagramLabelKhmer: 'តារាងព្យញ្ជនៈផ្សំជើង រ',
        diagramType: 'phonetics',
      },
      {
        pageNumber: 2,
        titleKhmer: 'លំហាត់បង្កើតពាក្យ និងឃ្លាខ្លីៗ',
        contentKhmer:
          'ចូរជ្រើសរើសពាក្យត្រឹមត្រូវបំពេញក្នុងចន្លោះ៖\n១. ឪពុកខ្ញុំទៅទិញ [ត្រី / ក្រូច] នៅផ្សារលើ។\n២. កូនសិស្សសរសេរអក្សរលើ [ក្រដាស / ប្រាក់] ដោយខ្មៅដៃ។\n៣. ប្រទេសកម្ពុជាមាន [ប្រាសាទ / ត្រសក់] អង្គរវត្តដ៏ល្បីល្បាញ។',
        keyTerms: ['លំហាត់', 'បំពេញចន្លោះ', 'ផ្សារលើ', 'ប្រាសាទអង្គរវត្ត'],
        diagramLabelKhmer: 'រូបភាពលំហាត់ជ្រើសរើសពាក្យ',
        diagramType: 'phonetics',
      },
    ],
  },
];

export interface PageExtractContext {
  text: string;
  pageNumber: number;
  totalPages: number;
  fileName: string;
  documentId: string;
  subject?: 'math' | 'science' | 'khmer' | 'social';
  gradeLevel?: 1 | 2 | 3;
  coordinates?: BoundingBoxCoordinates;
  keyTerms?: string[];
  snippetImageBase64?: string;
  isSnippetCrop?: boolean;
}

interface PdfLessonViewerProps {
  initialUrl?: string;
  onExtractPageContext: (context: PageExtractContext) => void;
  onSendToAiVideo?: (context: PageExtractContext) => void;
  onSendToGameStudio?: (context: PageExtractContext) => void;
  className?: string;
}

export function PdfLessonViewer({
  initialUrl,
  onExtractPageContext,
  onSendToAiVideo,
  onSendToGameStudio,
  className = '',
}: PdfLessonViewerProps) {
  // Active document state
  const [selectedPresetId, setSelectedPresetId] = useState<string>('moeys-math-g1-ch3');
  const [isCustomUpload, setIsCustomUpload] = useState<boolean>(false);
  const [customFileName, setCustomFileName] = useState<string>('');
  const [customPdfBuffer, setCustomPdfBuffer] = useState<ArrayBuffer | null>(null);

  // PDF.js runtime document state
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(3);
  const [scale, setScale] = useState<number>(1.0);
  const [rotation, setRotation] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Viewer UI features
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isSelectingBox, setIsSelectingBox] = useState<boolean>(false);
  const [boxSelection, setBoxSelection] = useState<BoundingBoxCoordinates | null>(null);
  const [showOcrDrawer, setShowOcrDrawer] = useState<boolean>(false);
  const [extractedPageText, setExtractedPageText] = useState<string>('');
  const [copyFeedback, setCopyFeedback] = useState<boolean>(false);

  // Drag & drop state
  const [isDraggingFile, setIsDraggingFile] = useState<boolean>(false);

  // Remote URL input state
  const [urlInput, setUrlInput] = useState<string>('');
  const [showUrlInput, setShowUrlInput] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const selectionStartRef = useRef<{ x: number; y: number } | null>(null);

  // Current active preset (if using presets)
  const currentPreset = MOEYS_CURRICULUM_PRESETS.find((p) => p.id === selectedPresetId);

  // ==========================================================================
  // 1. PDF.JS INITIALIZATION & LOADING
  // ==========================================================================
  const loadPdfFromSource = useCallback(
    async (source: string | ArrayBuffer) => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const pdfjsLib = await import('pdfjs-dist');
        if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
          pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
        }

        const loadingTask = pdfjsLib.getDocument(
          typeof source === 'string' ? { url: source } : { data: source }
        );
        const doc = await loadingTask.promise;
        setPdfDoc(doc);
        setTotalPages(doc.numPages);
        setCurrentPage(1);
        setIsCustomUpload(true);
        soundSynthesizer.playSuccess();
      } catch (err: unknown) {
        console.warn('PDF.js rendering fallback triggered:', err);
        // If external PDF fails to load, fallback to preset or graceful error
        setErrorMessage(
          'មិនអាចបើកឯកសារ PDF នេះដោយផ្ទាល់បានទេ។ ប្រព័ន្ធបានប្តូរទៅកាន់គំរូសៀវភៅ MoEYS ដើម្បីបន្តការងារ។'
        );
        setIsCustomUpload(false);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Handle preset selection
  const handleSelectPreset = (presetId: string) => {
    soundSynthesizer.playClick();
    setSelectedPresetId(presetId);
    setIsCustomUpload(false);
    setPdfDoc(null);
    setCurrentPage(1);
    const preset = MOEYS_CURRICULUM_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setTotalPages(preset.totalPages);
      const pageOne = preset.pages[0];
      setExtractedPageText(pageOne ? pageOne.contentKhmer : '');
    }
  };

  // Handle local file drop or upload
  const handleFileIngest = async (file: File) => {
    soundSynthesizer.playPop();
    setCustomFileName(file.name);
    setBoxSelection(null);

    if (file.type === 'application/pdf') {
      const buffer = await file.arrayBuffer();
      setCustomPdfBuffer(buffer);
      await loadPdfFromSource(buffer);
    } else if (file.type === 'text/plain') {
      const text = await file.text();
      setIsCustomUpload(true);
      setPdfDoc(null);
      setExtractedPageText(text);
      setTotalPages(1);
      setCurrentPage(1);
      soundSynthesizer.playSuccess();
    } else {
      setErrorMessage('សូមជ្រើសរើសឯកសារ PDF ឬ TXT');
    }
  };

  // Render active page to canvas if using real PDF.js
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;

    let isCancelled = false;

    const renderPage = async () => {
      setIsLoading(true);
      try {
        const page = await pdfDoc.getPage(currentPage);
        if (isCancelled) return;

        const viewport = page.getViewport({ scale, rotation });
        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        if (!context) return;

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        await page.render(renderContext).promise;

        // Extract text
        const textContent = await page.getTextContent();
        const extracted = textContent.items
          .map((item: any) => item.str || '')
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();
        setExtractedPageText(extracted || 'ខ្លឹមសារត្រូវបានទាញយកពីទំព័រ PDF');
      } catch (err) {
        console.error('Canvas render error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    renderPage();

    return () => {
      isCancelled = true;
    };
  }, [pdfDoc, currentPage, scale, rotation]);

  // Sync extracted text when using presets
  useEffect(() => {
    if (!isCustomUpload && currentPreset) {
      const pageData = currentPreset.pages.find((p) => p.pageNumber === currentPage);
      if (pageData) {
        setExtractedPageText(pageData.contentKhmer);
      }
    }
  }, [currentPage, currentPreset, isCustomUpload]);

  // ==========================================================================
  // 2. PAGE NAVIGATION & ZOOM CONTROLS
  // ==========================================================================
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      soundSynthesizer.playClick();
      setCurrentPage((prev) => prev - 1);
      setBoxSelection(null);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      soundSynthesizer.playClick();
      setCurrentPage((prev) => prev + 1);
      setBoxSelection(null);
    }
  };

  const goToFirstPage = () => {
    if (currentPage !== 1) {
      soundSynthesizer.playClick();
      setCurrentPage(1);
      setBoxSelection(null);
    }
  };

  const goToLastPage = () => {
    if (currentPage !== totalPages) {
      soundSynthesizer.playClick();
      setCurrentPage(totalPages);
      setBoxSelection(null);
    }
  };

  const handleZoomIn = () => {
    soundSynthesizer.playPop();
    setScale((prev) => Math.min(prev + 0.2, 2.0));
  };

  const handleZoomOut = () => {
    soundSynthesizer.playPop();
    setScale((prev) => Math.max(prev - 0.2, 0.6));
  };

  const handleResetZoom = () => {
    soundSynthesizer.playClick();
    setScale(1.0);
  };

  const toggleFullscreen = () => {
    soundSynthesizer.playPop();
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.error('Fullscreen request error:', err);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // ==========================================================================
  // 3. BOUNDING BOX INTERACTIVE SELECTION
  // ==========================================================================
  const handleOverlayMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isSelectingBox || !overlayRef.current) return;
    const rect = overlayRef.current.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);
    selectionStartRef.current = { x, y };
    setBoxSelection({
      x,
      y,
      width: 0,
      height: 0,
      pageNumber: currentPage,
    });
  };

  const handleOverlayMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isSelectingBox || !selectionStartRef.current || !overlayRef.current) return;
    const rect = overlayRef.current.getBoundingClientRect();
    const currentX = Math.round(e.clientX - rect.left);
    const currentY = Math.round(e.clientY - rect.top);

    const x = Math.min(selectionStartRef.current.x, currentX);
    const y = Math.min(selectionStartRef.current.y, currentY);
    const width = Math.abs(currentX - selectionStartRef.current.x);
    const height = Math.abs(currentY - selectionStartRef.current.y);

    setBoxSelection({
      x,
      y,
      width,
      height,
      pageNumber: currentPage,
    });
  };

  const handleOverlayMouseUp = () => {
    if (!isSelectingBox || !selectionStartRef.current) return;
    selectionStartRef.current = null;
    soundSynthesizer.playPop();
  };

  // ==========================================================================
  // 4. DISPATCH ACTIONS (SEND TO GAME / SEND TO AI VIDEO)
  // ==========================================================================
  const buildCurrentExtractContext = (): PageExtractContext => {
    const fileName = isCustomUpload
      ? customFileName || 'Custom_Curriculum.pdf'
      : currentPreset?.titleKhmer || 'MoEYS_Curriculum.pdf';

    const documentId = isCustomUpload ? 'custom-uploaded-doc' : currentPreset?.id || 'moeys-doc';

    const pageData = !isCustomUpload
      ? currentPreset?.pages.find((p) => p.pageNumber === currentPage)
      : null;

    return {
      text: extractedPageText,
      pageNumber: currentPage,
      totalPages,
      fileName,
      documentId,
      subject: currentPreset?.subject || 'math',
      gradeLevel: currentPreset?.gradeLevel || 1,
      coordinates: boxSelection || undefined,
      keyTerms: pageData?.keyTerms || [],
    };
  };

  // Slices canvas area into base64 image snippet (react-pdf-highlighter pattern)
  const getCroppedSnippetBase64 = (): string | undefined => {
    if (!boxSelection || boxSelection.width < 10 || boxSelection.height < 10) return undefined;

    try {
      if (pdfDoc && canvasRef.current) {
        const sourceCanvas = canvasRef.current;
        const cropCanvas = document.createElement('canvas');
        cropCanvas.width = boxSelection.width;
        cropCanvas.height = boxSelection.height;
        const ctx = cropCanvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(
            sourceCanvas,
            boxSelection.x,
            boxSelection.y,
            boxSelection.width,
            boxSelection.height,
            0,
            0,
            boxSelection.width,
            boxSelection.height
          );
          return cropCanvas.toDataURL('image/png');
        }
      } else {
        // Preset MoEYS curriculum fallback snippet generator
        const cropCanvas = document.createElement('canvas');
        cropCanvas.width = Math.max(boxSelection.width, 320);
        cropCanvas.height = Math.max(boxSelection.height, 160);
        const ctx = cropCanvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#FFFDF7';
          ctx.fillRect(0, 0, cropCanvas.width, cropCanvas.height);
          ctx.strokeStyle = '#F59E0B';
          ctx.lineWidth = 3;
          ctx.strokeRect(4, 4, cropCanvas.width - 8, cropCanvas.height - 8);
          ctx.fillStyle = '#78350F';
          ctx.font = 'bold 15px sans-serif';
          ctx.fillText(currentPreset?.titleKhmer || 'MoEYS Snippet', 16, 32);
          ctx.fillStyle = '#334155';
          ctx.font = '13px sans-serif';
          const snippetText = extractedPageText.slice(0, 90) + '...';
          ctx.fillText(snippetText, 16, 64);
          return cropCanvas.toDataURL('image/png');
        }
      }
    } catch (err) {
      console.warn('Could not extract canvas snippet:', err);
    }
    return undefined;
  };

  const handleConvertSnippetToGame = () => {
    soundSynthesizer.playSuccess();
    soundSynthesizer.playCoin();
    const snippetBase64 = getCroppedSnippetBase64();
    const context: PageExtractContext = {
      ...buildCurrentExtractContext(),
      snippetImageBase64: snippetBase64,
      isSnippetCrop: true,
    };
    onExtractPageContext(context);
    if (onSendToGameStudio) {
      onSendToGameStudio(context);
    }
  };

  const handleSendToGenerator = () => {
    soundSynthesizer.playSuccess();
    const context = buildCurrentExtractContext();
    onExtractPageContext(context);
    if (onSendToGameStudio) {
      onSendToGameStudio(context);
    }
  };

  const handleSendToVideo = () => {
    soundSynthesizer.playSuccess();
    const context = buildCurrentExtractContext();
    onExtractPageContext(context);
    if (onSendToAiVideo) {
      onSendToAiVideo(context);
    }
  };

  const handleCopyExtractedText = () => {
    if (!extractedPageText) return;
    navigator.clipboard.writeText(extractedPageText);
    soundSynthesizer.playCoin();
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  return (
    <div
      ref={containerRef}
      className={`flex flex-col bg-white rounded-3xl border-2 border-amber-200/90 shadow-md overflow-hidden ${
        isFullscreen ? 'p-6 fixed inset-0 z-50 rounded-none' : ''
      } ${className}`}
    >
      {/* =================================================================== */}
      {/* 1. TOP VIEWER TOOLBAR */}
      {/* =================================================================== */}
      <div className="p-3.5 bg-gradient-to-r from-amber-50/80 via-white to-amber-50/80 border-b border-amber-200 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Document Preset Picker & Upload Trigger */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 bg-amber-100/70 px-2.5 py-1.5 rounded-xl border border-amber-300/80">
            <BookOpen className="w-4 h-4 text-amber-900" />
            <span className="text-xs font-bold text-amber-950 font-kantumruy hidden sm:inline">
              ឯកសារ MoEYS:
            </span>
            <select
              value={isCustomUpload ? 'custom' : selectedPresetId}
              onChange={(e) => {
                if (e.target.value !== 'custom') {
                  handleSelectPreset(e.target.value);
                }
              }}
              className="text-xs font-bold font-kantumruy bg-transparent border-0 outline-hidden text-slate-800 cursor-pointer max-w-[180px] sm:max-w-[220px] truncate"
            >
              {MOEYS_CURRICULUM_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.titleKhmer}
                </option>
              ))}
              {isCustomUpload && <option value="custom">ឯកសារផ្ទាល់ខ្លួន: {customFileName}</option>}
            </select>
          </div>

          {/* Upload Button */}
          <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-amber-50 border-2 border-amber-200/80 text-amber-900 text-xs font-bold cursor-pointer transition shadow-2xs leading-[1.8] active:translate-y-0.5">
            <Upload className="w-3.5 h-3.5 text-indigo-600" />
            <span className="font-kantumruy">បញ្ចូល PDF</span>
            <input
              type="file"
              accept=".pdf,.txt"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileIngest(e.target.files[0]);
                  e.target.value = '';
                }
              }}
            />
          </label>
        </div>

        {/* Center: Page Controls */}
        <div className="flex items-center gap-1 bg-amber-50/80 px-2 py-1 rounded-2xl border-2 border-amber-200/80">
          <button
            onClick={goToFirstPage}
            disabled={currentPage <= 1 || isLoading}
            className="p-1.5 rounded-lg hover:bg-white text-amber-900 disabled:opacity-30 transition cursor-pointer"
            title="ទំព័រដំបូង"
          >
            <ChevronsLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={goToPreviousPage}
            disabled={currentPage <= 1 || isLoading}
            className="p-1.5 rounded-lg hover:bg-white text-amber-900 disabled:opacity-30 transition cursor-pointer"
            title="ទំព័រមុន"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1 px-2 text-xs font-bold text-amber-950 font-mono">
            <span>{currentPage}</span>
            <span className="text-amber-400">/</span>
            <span>{totalPages}</span>
          </div>

          <button
            onClick={goToNextPage}
            disabled={currentPage >= totalPages || isLoading}
            className="p-1.5 rounded-lg hover:bg-white text-amber-900 disabled:opacity-30 transition cursor-pointer"
            title="ទំព័របន្ទាប់"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={goToLastPage}
            disabled={currentPage >= totalPages || isLoading}
            className="p-1.5 rounded-lg hover:bg-white text-amber-900 disabled:opacity-30 transition cursor-pointer"
            title="ទំព័រចុងក្រោយ"
          >
            <ChevronsRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right: Zoom & Tool Toggles */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleZoomOut}
            disabled={scale <= 0.6}
            className="p-1.5 rounded-xl hover:bg-amber-100 text-amber-900 transition cursor-pointer"
            title="បង្រួម (Zoom Out)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono font-bold text-amber-800 min-w-[40px] text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            disabled={scale >= 2.0}
            className="p-1.5 rounded-xl hover:bg-amber-100 text-amber-900 transition cursor-pointer"
            title="ពង្រីក (Zoom In)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <div className="h-4 w-[1px] bg-amber-200 mx-0.5" />

          {/* Crop / Box selection toggle */}
          <button
            onClick={() => {
              soundSynthesizer.playClick();
              setIsSelectingBox(!isSelectingBox);
            }}
            className={`p-1.5 rounded-xl transition flex items-center gap-1 text-xs font-bold cursor-pointer ${
              isSelectingBox
                ? 'bg-amber-500 text-white shadow-xs'
                : 'hover:bg-amber-100 text-amber-900'
            }`}
            title="ជ្រើសរើសតំបន់ជាក់លាក់ (Select Crop Box)"
          >
            <Crop className="w-4 h-4" />
          </button>

          {/* Text preview drawer toggle */}
          <button
            onClick={() => setShowOcrDrawer(!showOcrDrawer)}
            className={`p-1.5 rounded-xl transition flex items-center gap-1 text-xs font-bold cursor-pointer ${
              showOcrDrawer ? 'bg-indigo-600 text-white' : 'hover:bg-amber-100 text-amber-900'
            }`}
            title="មើលអត្ថបទដែលទាញយក (Extracted Text)"
          >
            <Layers className="w-4 h-4" />
          </button>

          {/* Fullscreen toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-xl hover:bg-amber-100 text-amber-900 transition cursor-pointer"
            title="ពេញអេក្រង់ (Full Screen)"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 2. MAIN DOCUMENT CANVAS / PREVIEW WORKSPACE */}
      {/* =================================================================== */}
      <div className="relative flex-1 bg-[#FFFDF7]/70 min-h-[420px] max-h-[640px] overflow-auto flex items-center justify-center p-4 select-none">
        {/* Drag over indicator */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDraggingFile(true);
          }}
          onDragLeave={() => setIsDraggingFile(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDraggingFile(false);
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
              handleFileIngest(e.dataTransfer.files[0]);
            }
          }}
          className="absolute inset-0 z-10 pointer-events-auto"
          style={{ pointerEvents: isSelectingBox ? 'none' : 'auto' }}
        >
          {isDraggingFile && (
            <div className="absolute inset-0 bg-indigo-500/20 backdrop-blur-xs border-4 border-dashed border-indigo-500 rounded-2xl flex flex-col items-center justify-center text-indigo-800 z-30 font-bold font-kantumruy">
              <Upload className="w-12 h-12 mb-2 animate-bounce" />
              <span>ទម្លាក់ឯកសារ PDF ឬ TXT នៅទីនេះ</span>
            </div>
          )}
        </div>

        {/* Loading Spinner */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex flex-col items-center justify-center z-20 gap-2">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
            <span className="text-xs font-bold text-slate-700 font-kantumruy">
              កំពុងដំណើរការទំព័រ PDF...
            </span>
          </div>
        )}

        {/* PDF.js Canvas Renderer (for uploaded PDF files) */}
        {pdfDoc ? (
          <div
            className="relative shadow-xl rounded-2xl overflow-hidden bg-white border-2 border-amber-200/80"
            style={{ transform: `scale(${scale})`, transformOrigin: 'center center' }}
          >
            <canvas ref={canvasRef} className="block max-w-full" />

            {/* Interactive Bounding Box Overlay */}
            <div
              ref={overlayRef}
              onMouseDown={handleOverlayMouseDown}
              onMouseMove={handleOverlayMouseMove}
              onMouseUp={handleOverlayMouseUp}
              className={`absolute inset-0 z-20 ${
                isSelectingBox ? 'cursor-crosshair bg-indigo-500/5' : 'pointer-events-none'
              }`}
            >
              {boxSelection && (
                <div
                  className="absolute border-2 border-dashed border-amber-500 bg-amber-500/20 rounded-md pointer-events-none"
                  style={{
                    left: `${boxSelection.x}px`,
                    top: `${boxSelection.y}px`,
                    width: `${boxSelection.width}px`,
                    height: `${boxSelection.height}px`,
                  }}
                >
                  <span className="absolute -top-6 left-0 bg-amber-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded font-mono shadow-xs">
                    {boxSelection.width} × {boxSelection.height} px
                  </span>

                  {/* Floating Action Pill: Convert Snippet to Game (react-pdf-highlighter pattern) */}
                  {boxSelection.width > 30 && boxSelection.height > 30 && (
                    <div
                      className="absolute -bottom-10 left-1/2 -translate-x-1/2 pointer-events-auto z-30"
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleConvertSnippetToGame();
                        }}
                        className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 border-b-4 border-amber-700 active:border-b-0 active:translate-y-1 text-white font-black text-[11px] shadow-lg flex items-center gap-1.5 cursor-pointer leading-[1.8] whitespace-nowrap"
                        title="បម្លែងតំបន់ដែលបានជ្រើសរើសជាហ្គេមភ្លាមៗ (Convert Snippet to Game)"
                      >
                        <Sparkles className="w-3 h-3 text-yellow-200" />
                        <span>បម្លែងជាហ្គេមភ្លាមៗ</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* High-Fidelity MoEYS Curriculum Interactive Page (Presets Fallback) */
          <div
            className="relative bg-white shadow-xl rounded-3xl border-2 border-amber-200/80 w-full max-w-[580px] p-6 sm:p-8 flex flex-col gap-6 transition-transform"
            style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}
          >
            {/* Textbook Page Header */}
            <div className="border-b-2 border-amber-300/80 pb-4 flex items-center justify-between">
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[11px] font-black font-kantumruy">
                  ក្រសួងអប់រំ យុវជន និងកីឡា (MoEYS) • ថ្នាក់ទី {currentPreset?.gradeLevel || 1}
                </span>
                <h3 className="text-base sm:text-lg font-black text-slate-900 font-kantumruy mt-1.5">
                  {currentPreset?.pages.find((p) => p.pageNumber === currentPage)?.titleKhmer ||
                    currentPreset?.titleKhmer}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-2xl shadow-2xs">
                {currentPreset?.subject === 'math'
                  ? '📐'
                  : currentPreset?.subject === 'science'
                  ? '🌱'
                  : '📖'}
              </div>
            </div>

            {/* Illustrated Curriculum Content Diagram */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50/50 to-orange-50/30 border border-amber-200/70 flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                <span className="flex items-center gap-1 font-kantumruy">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  {currentPreset?.pages.find((p) => p.pageNumber === currentPage)
                    ?.diagramLabelKhmer || 'រូបភាពគំនូរមេរៀន'}
                </span>
                <span className="text-[10px] text-amber-700 bg-amber-200/60 px-2 py-0.5 rounded-full">
                  ទំព័រទី {currentPage}
                </span>
              </div>

              {/* Dynamic Visual Simulation based on Subject */}
              {currentPreset?.subject === 'math' && (
                <div className="grid grid-cols-2 gap-3 p-4 bg-white rounded-xl border border-amber-200 text-center">
                  <div className="p-3 bg-emerald-50 rounded-xl flex flex-col items-center">
                    <span className="text-4xl sm:text-5xl">🍉</span>
                    <span className="text-xs font-bold text-emerald-900 font-kantumruy mt-2">
                      ផ្លែឪឡឹក (ធំជាង)
                    </span>
                  </div>
                  <div className="p-3 bg-orange-50 rounded-xl flex flex-col items-center">
                    <span className="text-2xl sm:text-3xl mt-3">🍊</span>
                    <span className="text-xs font-bold text-orange-900 font-kantumruy mt-4">
                      ផ្លែក្រូច (តូចជាង)
                    </span>
                  </div>
                </div>
              )}

              {currentPreset?.subject === 'science' && (
                <div className="grid grid-cols-3 gap-2 p-3 bg-white rounded-xl border border-amber-200 text-center">
                  <div className="p-2 bg-sky-50 rounded-xl flex flex-col items-center">
                    <span className="text-3xl">💧</span>
                    <span className="text-[11px] font-bold text-sky-900 font-kantumruy mt-1">
                      ១. ទឹក / សំណើម
                    </span>
                  </div>
                  <div className="p-2 bg-amber-50 rounded-xl flex flex-col items-center">
                    <span className="text-3xl">☀️</span>
                    <span className="text-[11px] font-bold text-amber-900 font-kantumruy mt-1">
                      ២. កម្តៅសមស្រប
                    </span>
                  </div>
                  <div className="p-2 bg-emerald-50 rounded-xl flex flex-col items-center">
                    <span className="text-3xl">🌱</span>
                    <span className="text-[11px] font-bold text-emerald-900 font-kantumruy mt-1">
                      ៣. ដុះពន្លក
                    </span>
                  </div>
                </div>
              )}

              {currentPreset?.subject === 'khmer' && (
                <div className="grid grid-cols-3 gap-2 p-3 bg-white rounded-xl border border-amber-200 text-center">
                  <div className="p-2 bg-indigo-50 rounded-xl flex flex-col items-center">
                    <span className="text-2xl font-black text-indigo-900 font-battambang">ក្រ</span>
                    <span className="text-[11px] font-bold text-slate-700 font-kantumruy mt-1">
                      ក្រូច 🍊
                    </span>
                  </div>
                  <div className="p-2 bg-indigo-50 rounded-xl flex flex-col items-center">
                    <span className="text-2xl font-black text-indigo-900 font-battambang">ត្រ</span>
                    <span className="text-[11px] font-bold text-slate-700 font-kantumruy mt-1">
                      ត្រី 🐟
                    </span>
                  </div>
                  <div className="p-2 bg-indigo-50 rounded-xl flex flex-col items-center">
                    <span className="text-2xl font-black text-indigo-900 font-battambang">ប្រ</span>
                    <span className="text-[11px] font-bold text-slate-700 font-kantumruy mt-1">
                      ប្រាក់ 🪙
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Page Curriculum Text */}
            <div className="text-slate-800 text-xs sm:text-sm font-medium font-kantumruy leading-[1.9] whitespace-pre-line bg-amber-50/50 p-4 rounded-2xl border-2 border-amber-200/70">
              {extractedPageText}
            </div>

            {/* Key Vocabulary Pills */}
            {currentPreset?.pages.find((p) => p.pageNumber === currentPage)?.keyTerms && (
              <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-amber-200/70">
                <span className="text-[11px] font-bold text-amber-800 font-kantumruy leading-[1.8]">
                  ពាក្យគន្លឹះ:
                </span>
                {currentPreset?.pages
                  .find((p) => p.pageNumber === currentPage)
                  ?.keyTerms.map((term) => (
                    <span
                      key={term}
                      className="px-2.5 py-0.5 rounded-lg bg-amber-100/70 text-amber-900 font-bold text-[11px] font-kantumruy border border-amber-300/80 leading-[1.8]"
                    >
                      {term}
                    </span>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* =================================================================== */}
      {/* 3. OCR / TEXT EXTRACTION SLIDE-OUT DRAWER */}
      {/* =================================================================== */}
      {showOcrDrawer && (
        <div className="bg-amber-50/90 border-t-2 border-amber-300 p-4 flex flex-col gap-3 transition">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-800" />
              <span className="text-xs font-bold text-amber-950 font-kantumruy leading-[1.8]">
                អត្ថបទដកស្រង់ពីទំព័រទី {currentPage} (Extracted OCR Text):
              </span>
              <span className="text-[10px] bg-amber-200/80 text-amber-900 font-mono px-2 py-0.5 rounded-full">
                {extractedPageText.length} តួអក្សរ
              </span>
            </div>
            <button
              onClick={handleCopyExtractedText}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white hover:bg-amber-100 text-amber-900 border-2 border-amber-300 text-xs font-bold transition cursor-pointer leading-[1.8]"
            >
              {copyFeedback ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copyFeedback ? 'បានចម្លង!' : 'ចម្លងអត្ថបទ'}</span>
            </button>
          </div>
          <textarea
            rows={3}
            value={extractedPageText}
            onChange={(e) => setExtractedPageText(e.target.value)}
            className="w-full p-3 text-xs font-medium font-kantumruy bg-white rounded-2xl border-2 border-amber-300 focus:outline-hidden focus:ring-4 focus:ring-amber-100 leading-[1.8]"
            placeholder="ខ្លឹមសារអត្ថបទ..."
          />
        </div>
      )}

      {/* =================================================================== */}
      {/* 4. BOTTOM ACTION DISPATCH BAR */}
      {/* =================================================================== */}
      <div className="p-3 bg-white border-t-2 border-amber-200/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-amber-900 font-kantumruy leading-[1.8]">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>ទំព័រទី {currentPage} ត្រៀមរួចរាល់សម្រាប់បញ្ជូនទៅកាន់ Studio</span>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Send to AI Video Button */}
          <button
            onClick={handleSendToVideo}
            className="px-3.5 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 border-b-4 border-purple-800 active:border-b-0 active:translate-y-1 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer leading-[1.8]"
          >
            <Video className="w-4 h-4 text-white" />
            <span className="font-kantumruy">បង្កើតវីដេអូ AI</span>
          </button>

          {/* Send Page to Lesson Generator / AI (Primary Required Action) */}
          <button
            onClick={handleSendToGenerator}
            className="px-4 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 border-b-4 border-amber-600 active:border-b-0 active:translate-y-1 text-white font-black text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer leading-[1.8]"
          >
            <Sparkles className="w-4 h-4 text-white" />
            <span className="font-kantumruy">បញ្ជូនទំព័រនេះទៅកាន់ Lesson Studio</span>
          </button>
        </div>
      </div>
    </div>
  );
}
