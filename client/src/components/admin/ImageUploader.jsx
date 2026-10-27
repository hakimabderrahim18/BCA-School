import React, { useRef } from 'react';
import { UploadCloud, X, Image as ImageIcon } from 'lucide-react';
import { getImageUrl } from '../../utils/imageUrl';

export const ImageUploader = ({
  label,
  value,
  currentImage,
  previewUrl,
  onChange,
  onFileSelect,
  onClear,
  helpText = 'Formats acceptés : JPG, PNG, WebP (max 5 Mo)',
  error,
}) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (onFileSelect) {
        onFileSelect(file);
      }
      const localPreview = URL.createObjectURL(file);
      if (onChange) {
        onChange(localPreview);
      }
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onClear) onClear();
    if (onChange) onChange('');
    if (onFileSelect) onFileSelect(null);
  };

  const rawImage = previewUrl || currentImage || value;
  const displayImage = getImageUrl(rawImage);

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          {label}
        </label>
      )}

      {displayImage ? (
        <div className="relative group rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 aspect-video max-h-56 flex items-center justify-center">
          <img
            src={displayImage}
            alt="Aperçu"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-lg bg-white/90 text-slate-900 text-xs font-semibold hover:bg-white transition cursor-pointer"
            >
              Changer l'image
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition cursor-pointer"
              title="Supprimer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center bg-slate-50/50 hover:bg-slate-50 ${
            error ? 'border-red-400' : 'border-slate-300 hover:border-brand-500'
          }`}
        >
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mb-2">
            <UploadCloud className="w-6 h-6" />
          </div>
          <span className="text-xs font-bold text-slate-700">
            Cliquez pour téléverser une image
          </span>
          <span className="text-[11px] text-slate-400 mt-1">{helpText}</span>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/jpg"
        onChange={handleFileChange}
        className="hidden"
      />

      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
};

export default ImageUploader;
