import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { getImageUrl } from '../../utils/imageUrl';

export const Lightbox = ({
  isOpen,
  onClose,
  items,
  images,
  currentIndex = 0,
  onIndexChange,
  onNavigate,
}) => {
  const mediaList = items || images || [];
  const handleIndexChange = onIndexChange || onNavigate || (() => {});

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen || !mediaList.length) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handleIndexChange((currentIndex - 1 + mediaList.length) % mediaList.length);
      if (e.key === 'ArrowRight') handleIndexChange((currentIndex + 1) % mediaList.length);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, mediaList.length, onClose, handleIndexChange]);

  if (!isOpen || !mediaList || !mediaList.length) return null;

  const rawItem = mediaList[currentIndex] || mediaList[0];
  const currentItem = typeof rawItem === 'string' ? { url: rawItem } : rawItem;

  const handlePrev = (e) => {
    e.stopPropagation();
    handleIndexChange((currentIndex - 1 + mediaList.length) % mediaList.length);
  };

  const handleNext = (e) => {
    e.stopPropagation();
    handleIndexChange((currentIndex + 1) % mediaList.length);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-md p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Bouton de fermeture */}
      <button
        onClick={onClose}
        className="absolute top-5 end-5 z-50 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition focus:outline-none cursor-pointer"
        aria-label="Fermer"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Flèche Précédent */}
      {mediaList.length > 1 && (
        <button
          onClick={handlePrev}
          className="absolute start-4 z-50 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white transition focus:outline-none cursor-pointer"
          aria-label="Précédent"
        >
          <ChevronLeft className="w-6 h-6 rtl:rotate-180" />
        </button>
      )}

      {/* Média central (Image ou Vidéo Embed) */}
      <div
        className="max-w-5xl max-h-[85vh] flex flex-col items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {currentItem?.type === 'video' ? (
          <div className="w-[85vw] max-w-4xl aspect-video rounded-xl overflow-hidden shadow-2xl bg-black">
            {currentItem.embedUrl ? (
              <iframe
                src={currentItem.embedUrl}
                title={currentItem.title || 'Vidéo B.C.A.'}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video
                src={currentItem.url}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            )}
          </div>
        ) : (
          <img
            src={getImageUrl(currentItem?.url || currentItem)}
            alt={currentItem?.title || 'Galerie B.C.A.'}
            className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-2xl"
          />
        )}

        {/* Légende du média */}
        {(currentItem?.title || currentItem?.caption) && (
          <div className="mt-4 text-center text-white max-w-xl">
            {currentItem.title && (
              <h4 className="text-base font-bold">{currentItem.title}</h4>
            )}
            {currentItem.caption && (
              <p className="text-xs text-slate-300 mt-1">{currentItem.caption}</p>
            )}
            <span className="text-[11px] text-slate-400 mt-2 block">
              {currentIndex + 1} / {mediaList.length}
            </span>
          </div>
        )}
      </div>

      {/* Flèche Suivant */}
      {mediaList.length > 1 && (
        <button
          onClick={handleNext}
          className="absolute end-4 z-50 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white transition focus:outline-none cursor-pointer"
          aria-label="Suivant"
        >
          <ChevronRight className="w-6 h-6 rtl:rotate-180" />
        </button>
      )}
    </div>
  );
};

export default Lightbox;
