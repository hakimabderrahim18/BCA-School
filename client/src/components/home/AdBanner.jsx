import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { getImageUrl } from '../../utils/imageUrl';

export const AdBanner = ({ slotKey = 'home_banner_top', className = '' }) => {
  const [ad, setAd] = useState(null);

  useEffect(() => {
    const fetchAd = async () => {
      try {
        const response = await api.get(`/ads/active?slotKey=${slotKey}`);
        if (response.data.success && response.data.data.length > 0) {
          setAd(response.data.data[0]); // Affiche la première bannière prioritaire
        }
      } catch (err) {
        // En cas d'erreur ou d'absence de bannière, n'affiche rien
      }
    };

    fetchAd();
  }, [slotKey]);

  if (!ad) return null;

  const handleAdClick = async () => {
    try {
      await api.post(`/ads/${ad._id}/click`);
    } catch {}
  };

  const isInternalLink = ad.targetUrl.startsWith('/');

  return (
    <div className={`w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-8 ${className}`}>
      <div className="relative group overflow-hidden rounded-2xl shadow-sm hover:shadow-md border border-slate-200 transition-all bg-slate-900">
        <span className="absolute top-2 end-2 z-10 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-black/60 text-slate-300 backdrop-blur-sm">
          Espace Publicitaire
        </span>

        {isInternalLink ? (
          <a
            href={ad.targetUrl}
            onClick={handleAdClick}
            className="block w-full overflow-hidden"
          >
            <img
              src={getImageUrl(ad.imageUrl)}
              alt={ad.title}
              className="w-full h-auto max-h-[160px] sm:max-h-[220px] object-cover group-hover:scale-[1.01] transition-transform duration-300"
              loading="lazy"
            />
          </a>
        ) : (
          <a
            href={ad.targetUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleAdClick}
            className="block w-full overflow-hidden"
          >
            <img
              src={getImageUrl(ad.imageUrl)}
              alt={ad.title}
              className="w-full h-auto max-h-[160px] sm:max-h-[220px] object-cover group-hover:scale-[1.01] transition-transform duration-300"
              loading="lazy"
            />
          </a>
        )}
      </div>
    </div>
  );
};
