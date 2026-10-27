import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../../utils/imageUrl';

export const PartnersTicker = ({ partners = [], annonceurs = [] }) => {
  const { t } = useTranslation();

  // Combine partenaires institutionnels et annonceurs
  const allLogos = [
    ...partners.map((p) => ({ id: p._id, name: p.name, logo: p.logo, link: p.website })),
    ...annonceurs.map((a) => ({ id: a._id, name: a.name, logo: a.logo, link: `/annonces-publicite/${a.slug}` })),
  ];

  if (!allLogos.length) return null;

  return (
    <section className="py-12 bg-white border-y border-slate-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 text-center">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
          {t('home.advertisers_partners')}
        </span>
      </div>

      <div className="relative w-full flex items-center justify-center">
        {/* Grille responsive des partenaires avec effet de hover soigné */}
        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 max-w-6xl mx-auto px-4">
          {allLogos.map((item) => (
            <div
              key={item.id}
              className="group flex flex-col items-center justify-center p-3 grayscale hover:grayscale-0 opacity-75 hover:opacity-100 transition-all duration-300"
            >
              {item.link ? (
                item.link.startsWith('/') ? (
                  <Link to={item.link} className="flex flex-col items-center">
                    <img
                      src={getImageUrl(item.logo)}
                      alt={item.name}
                      className="h-10 sm:h-12 w-auto max-w-[140px] object-contain group-hover:scale-105 transition-transform"
                      loading="lazy"
                    />
                    <span className="text-[11px] font-semibold text-slate-500 mt-2 text-center group-hover:text-brand-600 transition">
                      {item.name}
                    </span>
                  </Link>
                ) : (
                  <a href={item.link} target="_blank" rel="noreferrer" className="flex flex-col items-center">
                    <img
                      src={getImageUrl(item.logo)}
                      alt={item.name}
                      className="h-10 sm:h-12 w-auto max-w-[140px] object-contain group-hover:scale-105 transition-transform"
                      loading="lazy"
                    />
                    <span className="text-[11px] font-semibold text-slate-500 mt-2 text-center group-hover:text-brand-600 transition">
                      {item.name}
                    </span>
                  </a>
                )
              ) : (
                <div className="flex flex-col items-center">
                  <img
                    src={getImageUrl(item.logo)}
                    alt={item.name}
                    className="h-10 sm:h-12 w-auto max-w-[140px] object-contain"
                    loading="lazy"
                  />
                  <span className="text-[11px] font-semibold text-slate-500 mt-2 text-center">
                    {item.name}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
