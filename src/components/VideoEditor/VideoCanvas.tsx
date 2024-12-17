import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, useMotionValue, animate } from 'framer-motion';
import { 
  PlayIcon, 
  PauseIcon,
  MagnifyingGlassIcon,
  ArrowsUpDownIcon,
  ArrowsRightLeftIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/solid';
import { ExportDialog } from './ExportDialog';
import { AudioExtractor, AudioExtractionProgress } from '../../utils/audioExtractor';

interface VideoCanvasProps {
  videoFile: File;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  cutStart: number;
  cutEnd: number;
  onTimeUpdate: (time: number) => void;
  onDurationChange: (duration: number) => void;
  onTogglePlay: () => void;
  onVideoRef: (element: HTMLVideoElement | null) => void;
  onTransformChange: (transform: { x: number; y: number; scale: number }) => void;
  onExportDialogOpen: (open: boolean) => void;
}

export const VideoCanvas: React.FC<VideoCanvasProps> = ({ 
  videoFile, 
  isPlaying, 
  currentTime,
  duration,
  cutStart,
  cutEnd,
  onTimeUpdate, 
  onDurationChange,
  onTogglePlay,
  onVideoRef,
  onTransformChange,
  onExportDialogOpen
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const backgroundVideoRef = useRef<HTMLVideoElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [overlayDimensions, setOverlayDimensions] = useState({ width: 0, height: 0 });
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const videoUrlRef = useRef<string | null>(null);
  const [justDragged, setJustDragged] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [audioExtractionProgress, setAudioExtractionProgress] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [extractionError, setExtractionError] = useState<string | null>(null);

  // Position et échelle de la vidéo
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const scale = useMotionValue(1);

  // Constantes de zoom
  const MIN_ZOOM = 0.2;
  const MAX_ZOOM = 3;
  const ZOOM_STEP = 0.05;

  // Calculer les dimensions de l'overlay en fonction de la hauteur du conteneur
  useEffect(() => {
    const updateOverlayDimensions = () => {
      if (containerRef.current) {
        const containerHeight = containerRef.current.clientHeight;
        const containerWidth = containerRef.current.clientWidth;
        
        // Calculer la largeur basée sur le ratio 9:16
        const targetWidth = (containerHeight * 9) / 16;
        
        // Si la largeur calculée est trop grande, utiliser la largeur du conteneur
        if (targetWidth > containerWidth) {
          const height = (containerWidth * 16) / 9;
          setOverlayDimensions({ width: containerWidth, height });
        } else {
          setOverlayDimensions({ width: targetWidth, height: containerHeight });
        }
      }
    };

    // Observer les changements de taille du conteneur
    const resizeObserver = new ResizeObserver(updateOverlayDimensions);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // Mise à jour initiale
    updateOverlayDimensions();

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Mise à jour des transformations
  useEffect(() => {
    onTransformChange?.({
      x: x.get(),
      y: y.get(),
      scale: scale.get()
    });
  }, [x, y, scale, onTransformChange]);

  // Création de l'URL de la vidéo
  useEffect(() => {
    if (videoFile) {
      if (videoUrlRef.current) URL.revokeObjectURL(videoUrlRef.current);
      videoUrlRef.current = URL.createObjectURL(videoFile);
    }
    return () => {
      if (videoUrlRef.current) URL.revokeObjectURL(videoUrlRef.current);
    };
  }, [videoFile]);

  // Ajustement initial de la vidéo
  useEffect(() => {
    const video = videoRef.current;
    const handleVideoLoad = () => {
      const container = containerRef.current;
      
      if (!video || !container || !video.videoWidth || !video.videoHeight) return;
      
      const targetHeight = container.clientHeight * 0.8;
      const newScale = targetHeight / video.clientHeight;
      
      animate(scale, newScale, { duration: 0.3 });
      animate(x, 0, { duration: 0.3 });
      animate(y, 0, { duration: 0.3 });
    };

    video?.addEventListener('loadedmetadata', handleVideoLoad);
    return () => {
      video?.removeEventListener('loadedmetadata', handleVideoLoad);
    };
  }, [scale, x, y, videoFile]);

  // Synchronisation de la vidéo de fond
  useEffect(() => {
    const video = videoRef.current;
    const bgVideo = backgroundVideoRef.current;
    if (!video || !bgVideo) return;

    const syncVideos = () => {
      if (Math.abs(bgVideo.currentTime - video.currentTime) > 0.1) {
        bgVideo.currentTime = video.currentTime;
      }
    };

    video.addEventListener('timeupdate', syncVideos);
    return () => video.removeEventListener('timeupdate', syncVideos);
  }, []);

  // Gestion de la lecture vidéo
  useEffect(() => {
    const video = videoRef.current;
    const bgVideo = backgroundVideoRef.current;
    if (!video || !bgVideo) return;

    if (isPlaying) {
      video.play().catch(console.error);
      bgVideo.play().catch(console.error);
    } else {
      video.pause();
      bgVideo.pause();
    }
  }, [isPlaying]);

  // Synchronisation du temps
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !video.duration || !Number.isFinite(currentTime) || Math.abs(video.currentTime - currentTime) < 0.1) return;
    video.currentTime = currentTime;
  }, [currentTime]);

  // Mettre à jour les transformations quand elles changent
  useEffect(() => {
    onTransformChange?.({
      x: x.get(),
      y: y.get(),
      scale: scale.get()
    });
  }, [x, y, scale, onTransformChange]);

  // Lancer l'extraction audio
  useEffect(() => {
    if (videoFile && videoRef.current) {
      const videoUrl = URL.createObjectURL(videoFile);
      videoRef.current.src = videoUrl;

      setIsExtracting(true);
      setExtractionError(null);
      
      const extractor = new AudioExtractor();
      extractor.extractAudio(videoFile, (progress: AudioExtractionProgress) => {
        setAudioExtractionProgress(progress.progress);
        if (progress.status === 'error') {
          setExtractionError('Erreur lors de l\'extraction audio');
          setIsExtracting(false);
        }
      })
        .then((blob: Blob) => {
          console.log('Extraction terminée, blob créé:', blob);
          setAudioBlob(blob);
          setIsExtracting(false);
        })
        .catch((error: Error) => {
          console.error('Erreur extraction:', error);
          setExtractionError(error.message);
          setIsExtracting(false);
        });

      return () => {
        URL.revokeObjectURL(videoUrl);
      };
    }
  }, [videoFile]);

  // Gestion du zoom
  const handleZoom = useCallback((direction: 'in' | 'out') => {
    const currentScale = scale.get();
    let newScale;

    const adjustedStep = ZOOM_STEP * Math.max(1, currentScale);

    if (direction === 'in') {
      newScale = currentScale + adjustedStep;
    } else {
      newScale = currentScale - adjustedStep;
    }

    newScale = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, newScale));
    scale.set(newScale);
  }, [scale]);

  // Gestion du zoom à la molette
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const wheelHandler = (e: WheelEvent) => {
      if (!isHovering) return;
      e.preventDefault();

      const direction = e.deltaY < 0 ? 'in' : 'out';
      handleZoom(direction);
    };

    container.addEventListener('wheel', wheelHandler, { passive: false });
    return () => container.removeEventListener('wheel', wheelHandler);
  }, [handleZoom, isHovering]);

  // Ajustement vertical
  const handleVerticalFit = useCallback(() => {
    if (!videoRef.current || !overlayRef.current) return;
    
    const video = videoRef.current;
    const overlay = overlayRef.current;
    
    const newScale = overlay.clientHeight / video.clientHeight;
    const boundedScale = Math.min(Math.max(newScale, MIN_ZOOM), MAX_ZOOM);
    
    animate(scale, boundedScale, { duration: 0.3 });
    animate(y, 0, { duration: 0.3 });
  }, [scale, y]);

  // Ajustement horizontal
  const handleHorizontalFit = useCallback(() => {
    if (!videoRef.current || !overlayRef.current) return;
    
    const video = videoRef.current;
    const overlay = overlayRef.current;
    
    const newScale = overlay.clientWidth / video.clientWidth;
    const boundedScale = Math.min(Math.max(newScale, MIN_ZOOM), MAX_ZOOM);
    
    animate(scale, boundedScale, { duration: 0.3 });
    animate(x, 0, { duration: 0.3 });
  }, [scale, x]);

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setJustDragged(true);
    setTimeout(() => setJustDragged(false), 100);
  };

  const handleVideoClick = (e: React.MouseEvent) => {
    if (justDragged) return;
    
    if (e.target === videoRef.current) {
      e.stopPropagation();
    }
  };

  useEffect(() => {
    if (videoRef.current) {
      onVideoRef?.(videoRef.current);
    }
  }, [onVideoRef]);

  const handleExtractAudio = async () => {
    try {
      setIsExtracting(true);
      setExtractionError(null);
      
      const extractor = new AudioExtractor();
      extractor.extractAudio(videoFile, (progress: AudioExtractionProgress) => {
        setAudioExtractionProgress(progress.progress);
        if (progress.status === 'error') {
          setExtractionError('Erreur lors de l\'extraction audio');
        }
      })
        .then((blob: Blob) => {
          console.log('Extraction terminée, blob créé:', blob);
          setAudioBlob(blob);
          setIsExtracting(false);
        })
        .catch((error: Error) => {
          console.error('Erreur extraction:', error);
          setExtractionError(error.message);
          setIsExtracting(false);
        });
        
    } catch (error) {
      console.error('Erreur lors de l\'extraction:', error);
      setExtractionError(error instanceof Error ? error.message : 'Erreur inconnue');
      setIsExtracting(false);
    }
  };

  const handleDownloadAudio = () => {
    if (!audioBlob) return;
    
    const url = URL.createObjectURL(audioBlob);
    const a = document.createElement('a');
    const fileName = `${videoFile.name.replace(/\.[^/.]+$/, '')}_audio.webm`;
    
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-full overflow-hidden transition-colors duration-200 bg-gray-900"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Vidéo de fond floutée */}
      <div className="absolute inset-0 transition-opacity duration-200 opacity-50">
        <video
          ref={backgroundVideoRef}
          src={videoUrlRef.current || undefined}
          className="w-full h-full object-cover scale-110"
          style={{
            filter: 'blur(16px)',
          }}
          muted
          playsInline
        />
      </div>

      {/* Vidéo draggable */}
      <motion.video
        ref={videoRef}
        src={videoUrlRef.current || undefined}
        className="absolute w-full h-full origin-center cursor-move object-contain"
        style={{
          x,
          y,
          scale,
        }}
        drag
        dragTransition={{ 
          power: 0.3,
          timeConstant: 200,
          modifyTarget: target => Math.round(target)
        }}
        dragMomentum={false}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onTimeUpdate={(e) => onTimeUpdate((e.target as HTMLVideoElement).currentTime)}
        onDurationChange={(e) => onDurationChange((e.target as HTMLVideoElement).duration)}
        playsInline
        onClick={handleVideoClick}
      />

      {/* Bouton play/pause au hover */}
      {isHovering && !isDragging && (
        <div 
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <button 
            className="p-4 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/60 transition-colors pointer-events-auto"
            onClick={(e) => {
              e.stopPropagation();
              onTogglePlay?.();
            }}
          >
            {isPlaying ? (
              <PauseIcon className="w-12 h-12 text-white" />
            ) : (
              <PlayIcon className="w-12 h-12 text-white" />
            )}
          </button>
        </div>
      )}


      {/* Bouton d'export */}
      <button
        onClick={() => {
          setExportDialogOpen(true);
          onExportDialogOpen?.(true);
        }}
        className="absolute top-4 right-4 px-4 py-2 bg-blue-500/70 backdrop-blur-md rounded-lg text-white hover:bg-blue-800/80 transition-all duration-300 flex items-center gap-2 border border-white/20 shadow-lg"
      >
        <ArrowDownTrayIcon className="w-5 h-5" />
        <span className="text-sm font-medium">Export</span>
      </button>

      {/* Bouton d'export audio */}
      <button
        onClick={handleExtractAudio}
        disabled={isExtracting}
        className={`absolute top-4 right-72 px-4 py-2 backdrop-blur-md rounded-lg text-white transition-all duration-300 flex items-center gap-2 border border-white/20 shadow-lg ${
          isExtracting 
            ? 'bg-gray-500/70 cursor-not-allowed opacity-50' 
            : 'bg-blue-500/70 hover:bg-blue-800/80 cursor-pointer'
        }`}
      >
        {isExtracting ? (
          <>
            <span className="animate-spin">⏳</span>
            <span>Extraction... {audioExtractionProgress}%</span>
          </>
        ) : (
          'Extraire l\'audio'
        )}
      </button>

      {audioBlob && !isExtracting && (
        <button
          onClick={handleDownloadAudio}
          className="absolute top-4 right-140 px-4 py-2 bg-green-500/70 backdrop-blur-md rounded-lg text-white hover:bg-green-800/80 transition-all duration-300 flex items-center gap-2 border border-white/20 shadow-lg"
        >
          <ArrowDownTrayIcon className="w-5 h-5" />
          <span className="text-sm font-medium">Télécharger l'audio</span>
        </button>
      )}

      {extractionError && (
        <div className="absolute bottom-16 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-lg">
          {extractionError}
        </div>
      )}

      {/* Overlay 9:16 */}
      <div 
        ref={overlayRef}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 border-2 border-white/30 pointer-events-none"
        style={{
          width: overlayDimensions.width,
          height: overlayDimensions.height,
          aspectRatio: '9/16'
        }}
      >
        {/* Grille 3x3 */}
        <div className={`absolute inset-0 transition-opacity duration-200 ${isDragging ? 'opacity-100' : 'opacity-0'}`}>
          {/* Lignes verticales */}
          <div className="absolute left-1/3 top-0 w-[2px] h-full bg-white/50 shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
          <div className="absolute left-2/3 top-0 w-[2px] h-full bg-white/50 shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
          
          {/* Lignes horizontales */}
          <div className="absolute top-1/3 left-0 h-[2px] w-full bg-white/50 shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
          <div className="absolute top-2/3 left-0 h-[2px] w-full bg-white/50 shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
        </div>
      </div>

      {/* Size control bar */}
      <div className="absolute left-8 bottom-4 bg-black/50 rounded-lg backdrop-blur-sm p-2 flex gap-2">
        <button
          onClick={handleVerticalFit}
          className="p-2 rounded hover:bg-white/10 transition-colors"
          title="Fit to overlay height"
        >
          <ArrowsUpDownIcon className="w-6 h-6 text-white" />
        </button>
        
        <button
          onClick={handleHorizontalFit}
          className="p-2 rounded hover:bg-white/10 transition-colors"
          title="Fit to overlay width"
        >
          <ArrowsRightLeftIcon className="w-6 h-6 text-white" />
        </button>

        <div className="w-px h-6 bg-white/20 my-2" />

        <button
          onClick={() => handleZoom('in')}
          className="p-2 rounded hover:bg-white/10 transition-colors relative"
          title="Zoom in"
        >
          <MagnifyingGlassIcon className="w-6 h-6 text-white" />
          <span className="absolute text-white font-bold text-sm right-1 bottom-1">+</span>
        </button>

        <button
          onClick={() => handleZoom('out')}
          className="p-2 rounded hover:bg-white/10 transition-colors relative"
          title="Zoom out"
        >
          <MagnifyingGlassIcon className="w-6 h-6 text-white" />
          <span className="absolute text-white font-bold text-sm right-1 bottom-1">-</span>
        </button>
      </div>

      {/* Dialog d'export */}
      <ExportDialog
        open={exportDialogOpen}
        onClose={() => {
          setExportDialogOpen(false);
          onExportDialogOpen?.(false);
        }}
        videoRef={videoRef}
        backgroundVideoRef={backgroundVideoRef}
        overlayDimensions={overlayDimensions}
        videoTransform={{ x: x.get(), y: y.get(), scale: scale.get() }}
        startTime={cutStart}
        endTime={cutEnd}
      />
    </div>
  );
};
