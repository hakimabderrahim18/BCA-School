import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageCircle, X } from 'lucide-react';

export const FloatingWhatsApp = () => {
  const { t } = useTranslation();
  const [showTooltip, setShowTooltip] = useState(true);
  const phoneNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '213550000000';
  const defaultMessage = encodeURIComponent(
    t(
      'common.whatsapp_message',
      'Bonjour B.C.A., je souhaiterais avoir des renseignements concernant vos formations et prestations.'
    )
  );

  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${defaultMessage}`;

  return (
    <div className="fixed bottom-6 end-6 z-50 flex items-center gap-3 select-none">
      {/* Infobulle de bienvenue WhatsApp */}
      {showTooltip && (
        <div className="hidden sm:flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl shadow-xl border border-slate-100 text-xs text-slate-700 animate-in fade-in slide-in-from-end-2 duration-300">
          <span>{t('common.whatsapp_prompt', "Besoin d'un renseignement ? Discutez avec nous !")}</span>
          <button
            onClick={() => setShowTooltip(false)}
            className="text-slate-400 hover:text-slate-600 p-0.5 rounded"
            aria-label="Fermer l'infobulle"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Bouton d'action flottant */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="relative group flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg hover:shadow-emerald-500/30 transition-all duration-300 hover:scale-110 active:scale-95 focus:outline-none focus:ring-4 focus:ring-emerald-400/40"
        aria-label="Contacter le centre B.C.A. sur WhatsApp"
      >
        {/* Effet d'onde pulsée */}
        <span className="absolute -inset-1 rounded-full bg-emerald-500/30 animate-ping -z-10" />

        <MessageCircle className="w-7 h-7 fill-white/20" />
      </a>
    </div>
  );
};