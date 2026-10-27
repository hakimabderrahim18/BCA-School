import React, { useState } from 'react';
import { Facebook, MessageCircle, Twitter, Linkedin, Link2, Check } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const ShareButtons = ({ url, title, description = '' }) => {
  const [copied, setCopied] = useState(false);
  const toast = useToast();

  const shareUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Lien copié dans le presse-papiers !');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error('Impossible de copier le lien.');
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider me-1">
        Partager :
      </span>

      {/* Partage Facebook */}
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white flex items-center justify-center transition shadow-sm"
        title="Partager sur Facebook"
        aria-label="Partager sur Facebook"
      >
        <Facebook className="w-4 h-4" />
      </a>

      {/* Partage WhatsApp */}
      <a
        href={`https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white flex items-center justify-center transition shadow-sm"
        title="Partager sur WhatsApp"
        aria-label="Partager sur WhatsApp"
      >
        <MessageCircle className="w-4 h-4" />
      </a>

      {/* Partage Twitter / X */}
      <a
        href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-900 hover:text-white flex items-center justify-center transition shadow-sm"
        title="Partager sur X"
        aria-label="Partager sur X"
      >
        <Twitter className="w-4 h-4" />
      </a>

      {/* Partage LinkedIn */}
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-700 hover:text-white flex items-center justify-center transition shadow-sm"
        title="Partager sur LinkedIn"
        aria-label="Partager sur LinkedIn"
      >
        <Linkedin className="w-4 h-4" />
      </a>

      {/* Copier le lien */}
      <button
        type="button"
        onClick={handleCopyLink}
        className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 hover:bg-brand-600 hover:text-white flex items-center justify-center transition shadow-sm"
        title="Copier le lien"
        aria-label="Copier le lien"
      >
        {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Link2 className="w-4 h-4" />}
      </button>
    </div>
  );
};
