import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { SEOHelmet } from '../../components/common/SEOHelmet';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Textarea } from '../../components/common/Textarea';
import { ImageUploader } from '../../components/admin/ImageUploader';
import {
  Settings,
  Save,
  Building,
  Phone,
  Share2,
  Tag,
  Search,
  Sparkles,
  Layers,
  Image as ImageIcon,
} from 'lucide-react';

export const SettingsManager = () => {
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Settings State
  const [settings, setSettings] = useState({
    siteName: 'B.C.A. - Centre de Formation & Communication',
    tagline: 'L’excellence en formation et communication professionnelle à Tiaret',
    logo: '',
    logoWhite: '',
    favicon: '',
    homePhotos: {
      heroSlide1: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1920&q=80',
      heroSlide2: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1920&q=80',
      heroSlide3: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1920&q=80',
      ctaBanner: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1920&q=80',
    },
    contact: {
      address: 'Cité Administrative, Boulevard Principal, Tiaret',
      commune: 'Tiaret',
      wilaya: 'Tiaret (14)',
      phone1: '0550 00 00 00',
      phone2: '046 00 00 00',
      email: 'contact@bca-tiaret.dz',
      whatsappNumber: '213550000000',
      openingHours: 'Du Samedi au Jeudi : 08h30 - 17h00',
      mapEmbedUrl: '',
    },
    socialLinks: {
      facebook: '',
      instagram: '',
      linkedin: '',
      youtube: '',
      tiktok: '',
    },
    adPricing: {
      bannerHomeTop: '25 000 DA / mois',
      bannerHomeMiddle: '18 000 DA / mois',
      sponsoredArticle: '12 000 DA',
      advertiserPageAnnual: '35 000 DA / an',
    },
    seo: {
      defaultTitle: 'B.C.A. Tiaret - Centre de Formation & Agence de Communication',
      defaultDescription: 'Formations certifiantes, agence de communication média, annonces locales et actualités à Tiaret (Algérie).',
      keywords: 'formation tiaret, communication tiaret, annuaire tiaret, actualites tiaret',
    },
  });

  const [filesToUpload, setFilesToUpload] = useState({});

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const res = await api.get('/settings');
        if (res.data.data) {
          const d = res.data.data;
          setSettings({
            ...d,
            homePhotos: {
              heroSlide1: d.homePhotos?.heroSlide1 || 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1920&q=80',
              heroSlide2: d.homePhotos?.heroSlide2 || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1920&q=80',
              heroSlide3: d.homePhotos?.heroSlide3 || 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1920&q=80',
              ctaBanner: d.homePhotos?.ctaBanner || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1920&q=80',
            },
            adPricing: {
              bannerHomeTop: d.adPricing?.bannerHomeTop || '25 000 DA / mois',
              bannerHomeMiddle: d.adPricing?.bannerHomeMiddle || '18 000 DA / mois',
              sponsoredArticle: d.adPricing?.sponsoredArticle || '12 000 DA',
              advertiserPageAnnual: d.adPricing?.advertiserPageAnnual || '35 000 DA / an',
            },
          });
        }
      } catch (err) {
        console.error('Erreur chargement paramètres:', err);
        showToast('Impossible de charger les paramètres.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handlePhotoFileSelect = (key, file) => {
    setFilesToUpload((prev) => ({ ...prev, [key]: file }));
    if (file) {
      const localUrl = URL.createObjectURL(file);
      setSettings((prev) => ({
        ...prev,
        homePhotos: {
          ...(prev.homePhotos || {}),
          [key]: localUrl,
        },
      }));
    }
  };

  const handleBrandFileSelect = (key, file) => {
    setFilesToUpload((prev) => ({ ...prev, [key]: file }));
    if (file) {
      const localUrl = URL.createObjectURL(file);
      setSettings((prev) => ({
        ...prev,
        [key]: localUrl,
      }));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const data = new FormData();
      data.append('siteName', settings.siteName || '');
      data.append('tagline', settings.tagline || '');
      if (settings.contact) data.append('contact', JSON.stringify(settings.contact));
      if (settings.socialLinks) data.append('socialLinks', JSON.stringify(settings.socialLinks));
      if (settings.adPricing) data.append('adPricing', JSON.stringify(settings.adPricing));
      if (settings.seo) data.append('seo', JSON.stringify(settings.seo));
      if (settings.homePhotos) data.append('homePhotos', JSON.stringify(settings.homePhotos));

      // Append all selected files for upload
      Object.entries(filesToUpload).forEach(([key, file]) => {
        if (file) {
          data.append(key, file);
        }
      });

      const res = await api.put('/settings', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data?.data) {
        setSettings((prev) => ({
          ...prev,
          ...res.data.data,
        }));
        setFilesToUpload({});
      }

      showToast('Paramètres et visuels enregistrés avec succès !', 'success');
    } catch (err) {
      console.error('Erreur sauvegarde paramètres:', err);
      showToast(err.response?.data?.message || 'Erreur lors de la sauvegarde.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-500">Chargement de la configuration générale...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SEOHelmet title="Paramètres Généraux du Site - B.C.A. Admin" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center">
            <Settings className="w-6 h-6 mr-2 text-brand-600" />
            Paramètres & Configuration du Site
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configurez les photos de l'accueil, l'identité de marque, les coordonnées, tarifs publicitaires et SEO.
          </p>
        </div>
        <Button onClick={handleSave} variant="primary" size="md" loading={saving}>
          <Save className="w-4 h-4 mr-1.5" /> Enregistrer les réglages
        </Button>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Section 1: Photos & Visuels de la Page d'Accueil */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center">
              <ImageIcon className="w-5 h-5 mr-2 text-brand-600" />
              Photos & Visuels de la Page d'Accueil
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Personnalisez les diapositives du grand carrousel de bienvenue et la bannière d'appel à l'action. Téléversez une photo locale ou entrez directement une URL.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Slide 1 : Formations */}
            <div className="p-5 rounded-2xl border border-slate-200/80 bg-slate-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-brand-100 text-brand-700 text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5" /> Diapositive 1 - Pôle Formation
                </span>
                <span className="text-[11px] text-slate-400">1920 x 800px recommandé</span>
              </div>
              <p className="text-xs text-slate-600">
                Arrière-plan du slide d'accroche formation : <em>"Formez-vous aux Métiers d'Avenir à Tiaret"</em>.
              </p>
              <ImageUploader
                value={settings.homePhotos?.heroSlide1}
                previewUrl={settings.homePhotos?.heroSlide1}
                onFileSelect={(file) => handlePhotoFileSelect('heroSlide1', file)}
                onChange={(url) =>
                  setSettings({
                    ...settings,
                    homePhotos: { ...settings.homePhotos, heroSlide1: url },
                  })
                }
              />
              <Input
                label="Ou URL directe de l'image"
                value={settings.homePhotos?.heroSlide1 || ''}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    homePhotos: { ...settings.homePhotos, heroSlide1: e.target.value },
                  })
                }
                placeholder="https://..."
              />
            </div>

            {/* Slide 2 : Agence & Médias */}
            <div className="p-5 rounded-2xl border border-slate-200/80 bg-slate-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-accent-100 text-accent-700 text-xs font-bold">
                  <Layers className="w-3.5 h-3.5" /> Diapositive 2 - Agence de Communication
                </span>
                <span className="text-[11px] text-slate-400">1920 x 800px recommandé</span>
              </div>
              <p className="text-xs text-slate-600">
                Arrière-plan du slide communication : <em>"Propulsez l'Image et la Visibilité de Votre Entreprise"</em>.
              </p>
              <ImageUploader
                value={settings.homePhotos?.heroSlide2}
                previewUrl={settings.homePhotos?.heroSlide2}
                onFileSelect={(file) => handlePhotoFileSelect('heroSlide2', file)}
                onChange={(url) =>
                  setSettings({
                    ...settings,
                    homePhotos: { ...settings.homePhotos, heroSlide2: url },
                  })
                }
              />
              <Input
                label="Ou URL directe de l'image"
                value={settings.homePhotos?.heroSlide2 || ''}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    homePhotos: { ...settings.homePhotos, heroSlide2: e.target.value },
                  })
                }
                placeholder="https://..."
              />
            </div>

            {/* Slide 3 : Portail & Agenda */}
            <div className="p-5 rounded-2xl border border-slate-200/80 bg-slate-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-700 text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5" /> Diapositive 3 - Portail & Agenda Tiaret
                </span>
                <span className="text-[11px] text-slate-400">1920 x 800px recommandé</span>
              </div>
              <p className="text-xs text-slate-600">
                Arrière-plan du slide portail : <em>"Toute l'Actualité et les Événements de la Wilaya de Tiaret"</em>.
              </p>
              <ImageUploader
                value={settings.homePhotos?.heroSlide3}
                previewUrl={settings.homePhotos?.heroSlide3}
                onFileSelect={(file) => handlePhotoFileSelect('heroSlide3', file)}
                onChange={(url) =>
                  setSettings({
                    ...settings,
                    homePhotos: { ...settings.homePhotos, heroSlide3: url },
                  })
                }
              />
              <Input
                label="Ou URL directe de l'image"
                value={settings.homePhotos?.heroSlide3 || ''}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    homePhotos: { ...settings.homePhotos, heroSlide3: e.target.value },
                  })
                }
                placeholder="https://..."
              />
            </div>

            {/* CTA Banner : Appel à l'action */}
            <div className="p-5 rounded-2xl border border-slate-200/80 bg-slate-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-100 text-purple-700 text-xs font-bold">
                  <Layers className="w-3.5 h-3.5" /> Bannière Appel à l'Action (CTA Accueil)
                </span>
                <span className="text-[11px] text-slate-400">1920 x 600px recommandé</span>
              </div>
              <p className="text-xs text-slate-600">
                Visuel d'arrière-plan du grand bandeau final : <em>"Prêt à Développer Vos Compétences ou Accélérer Votre Entreprise ?"</em>.
              </p>
              <ImageUploader
                value={settings.homePhotos?.ctaBanner}
                previewUrl={settings.homePhotos?.ctaBanner}
                onFileSelect={(file) => handlePhotoFileSelect('ctaBanner', file)}
                onChange={(url) =>
                  setSettings({
                    ...settings,
                    homePhotos: { ...settings.homePhotos, ctaBanner: url },
                  })
                }
              />
              <Input
                label="Ou URL directe de l'image"
                value={settings.homePhotos?.ctaBanner || ''}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    homePhotos: { ...settings.homePhotos, ctaBanner: e.target.value },
                  })
                }
                placeholder="https://..."
              />
            </div>
          </div>
        </div>

        {/* Section 2: Identification & Logos de Marque */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center">
            <Building className="w-4 h-4 mr-2 text-brand-600" />
            Identité du Centre & Logotypes
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nom de la plateforme / Centre"
              value={settings.siteName}
              onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
              required
            />
            <Input
              label="Slogan / Tagline d'accroche"
              value={settings.tagline}
              onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
            <div>
              <ImageUploader
                label="Logo Principal (Sur fond clair)"
                value={settings.logo}
                previewUrl={settings.logo}
                onFileSelect={(file) => handleBrandFileSelect('logo', file)}
                onChange={(url) => setSettings({ ...settings, logo: url })}
                helpText="PNG ou WebP transparent recommandé"
              />
            </div>
            <div>
              <ImageUploader
                label="Logo Blanc (Sur fond sombre / Header)"
                value={settings.logoWhite}
                previewUrl={settings.logoWhite}
                onFileSelect={(file) => handleBrandFileSelect('logoWhite', file)}
                onChange={(url) => setSettings({ ...settings, logoWhite: url })}
                helpText="Version blanche détourée pour navigation sombre"
              />
            </div>
            <div>
              <ImageUploader
                label="Favicon (Icône d'onglet navigateur)"
                value={settings.favicon}
                previewUrl={settings.favicon}
                onFileSelect={(file) => handleBrandFileSelect('favicon', file)}
                onChange={(url) => setSettings({ ...settings, favicon: url })}
                helpText="Format ICO ou PNG carré 32x32px ou 64x64px"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Coordonnées & Horaires */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center">
            <Phone className="w-4 h-4 mr-2 text-brand-600" />
            Coordonnées, Horaires & Plan d'Accès
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Téléphone principal"
              value={settings.contact?.phone1 || ''}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  contact: { ...settings.contact, phone1: e.target.value },
                })
              }
              placeholder="0550 00 00 00"
            />
            <Input
              label="Téléphone secondaire / Fixe"
              value={settings.contact?.phone2 || ''}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  contact: { ...settings.contact, phone2: e.target.value },
                })
              }
              placeholder="046 00 00 00"
            />
            <Input
              label="Numéro WhatsApp direct"
              value={settings.contact?.whatsappNumber || ''}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  contact: { ...settings.contact, whatsappNumber: e.target.value },
                })
              }
              placeholder="213550000000"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Adresse e-mail officielle"
              type="email"
              value={settings.contact?.email || ''}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  contact: { ...settings.contact, email: e.target.value },
                })
              }
              placeholder="contact@bca-tiaret.dz"
            />
            <Input
              label="Commune"
              value={settings.contact?.commune || ''}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  contact: { ...settings.contact, commune: e.target.value },
                })
              }
              placeholder="Tiaret"
            />
            <Input
              label="Wilaya"
              value={settings.contact?.wilaya || ''}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  contact: { ...settings.contact, wilaya: e.target.value },
                })
              }
              placeholder="Tiaret (14)"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Adresse physique complète"
              value={settings.contact?.address || ''}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  contact: { ...settings.contact, address: e.target.value },
                })
              }
              placeholder="Cité Administrative, Boulevard Principal, Tiaret"
            />
            <Input
              label="Horaires d'ouverture au public"
              value={settings.contact?.openingHours || ''}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  contact: { ...settings.contact, openingHours: e.target.value },
                })
              }
              placeholder="Du Samedi au Jeudi : 08h30 - 17h00"
            />
          </div>

          <Input
            label="Lien iframe Google Maps / OpenStreetMap"
            value={settings.contact?.mapEmbedUrl || ''}
            onChange={(e) =>
              setSettings({
                ...settings,
                contact: { ...settings.contact, mapEmbedUrl: e.target.value },
              })
            }
            placeholder="https://maps.google.com/maps?q=Tiaret..."
          />
        </div>

        {/* Section 4: Réseaux Sociaux */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center">
            <Share2 className="w-4 h-4 mr-2 text-brand-600" />
            Liens Réseaux Sociaux Officiels
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Page Facebook"
              value={settings.socialLinks?.facebook || ''}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  socialLinks: { ...settings.socialLinks, facebook: e.target.value },
                })
              }
              placeholder="https://facebook.com/bca.tiaret"
            />
            <Input
              label="Compte Instagram"
              value={settings.socialLinks?.instagram || ''}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  socialLinks: { ...settings.socialLinks, instagram: e.target.value },
                })
              }
              placeholder="https://instagram.com/bca.tiaret"
            />
            <Input
              label="Page LinkedIn"
              value={settings.socialLinks?.linkedin || ''}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  socialLinks: { ...settings.socialLinks, linkedin: e.target.value },
                })
              }
              placeholder="https://linkedin.com/company/bca-tiaret"
            />
          </div>
        </div>

        {/* Section 5: Grille Tarifaire Publicitaire */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center">
            <Tag className="w-4 h-4 mr-2 text-brand-600" />
            Tarifs Publicitaires Publics (Page Annonces & Publicité)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Bannière d'accueil - Haut"
              value={settings.adPricing?.bannerHomeTop || ''}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  adPricing: { ...settings.adPricing, bannerHomeTop: e.target.value },
                })
              }
              placeholder="25 000 DA / mois"
            />
            <Input
              label="Grand Encart Central"
              value={settings.adPricing?.bannerHomeMiddle || ''}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  adPricing: { ...settings.adPricing, bannerHomeMiddle: e.target.value },
                })
              }
              placeholder="18 000 DA / mois"
            />
            <Input
              label="Article sponsorisé"
              value={settings.adPricing?.sponsoredArticle || ''}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  adPricing: { ...settings.adPricing, sponsoredArticle: e.target.value },
                })
              }
              placeholder="12 000 DA"
            />
            <Input
              label="Page annonceur dédiée (annuelle)"
              value={settings.adPricing?.advertiserPageAnnual || ''}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  adPricing: { ...settings.adPricing, advertiserPageAnnual: e.target.value },
                })
              }
              placeholder="35 000 DA / an"
            />
          </div>
        </div>

        {/* Section 6: SEO par Défaut */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center">
            <Search className="w-4 h-4 mr-2 text-brand-600" />
            Référencement Naturel (SEO par défaut)
          </h2>

          <Input
            label="Titre par défaut (Balise Title)"
            value={settings.seo?.defaultTitle || ''}
            onChange={(e) =>
              setSettings({
                ...settings,
                seo: { ...settings.seo, defaultTitle: e.target.value },
              })
            }
          />

          <Textarea
            label="Description par défaut (Meta Description)"
            value={settings.seo?.defaultDescription || ''}
            onChange={(e) =>
              setSettings({
                ...settings,
                seo: { ...settings.seo, defaultDescription: e.target.value },
              })
            }
            rows={2}
          />

          <Input
            label="Mots-clés généraux (Keywords)"
            value={settings.seo?.keywords || ''}
            onChange={(e) =>
              setSettings({
                ...settings,
                seo: { ...settings.seo, keywords: e.target.value },
              })
            }
            placeholder="formation, tiaret, communication, centre"
          />
        </div>

        <div className="flex justify-end">
          <Button type="submit" variant="primary" size="lg" loading={saving}>
            <Save className="w-4 h-4 mr-2" /> Enregistrer toutes les modifications
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SettingsManager;
