import React from 'react';
import { Link } from 'react-router-dom';
import { SEOHelmet } from '../../components/common/SEOHelmet';
import { Shield, FileText, Building2, Server, Scale, AlertCircle } from 'lucide-react';

export const MentionsLegales = () => {
  return (
    <div className="bg-slate-50 min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <SEOHelmet
        title="Mentions Légales - B.C.A. Tiaret"
        description="Mentions légales, identification de l'éditeur, agréments officiels et informations juridiques du centre B.C.A. à Tiaret (Algérie)."
      />

      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-100 p-8 sm:p-12">
        {/* Header */}
        <div className="border-b border-slate-100 pb-8 mb-8 text-center sm:text-left">
          <span className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-brand-600 bg-brand-50 px-3 py-1 rounded-full mb-3">
            <Scale className="w-3.5 h-3.5 mr-1.5" />
            Informations Juridiques
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Mentions Légales
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            En vigueur au 1er Janvier 2026 — Conforme à la réglementation de la République Algérienne Démocratique et Populaire.
          </p>
        </div>

        {/* Content sections */}
        <div className="space-y-10 text-sm text-slate-600 leading-relaxed">
          {/* Section 1 : Éditeur du site */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center">
              <Building2 className="w-5 h-5 mr-2.5 text-brand-600" />
              1. Éditeur de la plateforme
            </h2>
            <p>
              Le site web <strong>B.C.A.</strong> (accessible à l'adresse officielle du domaine) est édité et administré par l'établissement :
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-slate-700 font-medium">
              <li><strong>Raison sociale :</strong> B.C.A. — Centre de Formation Continue & Agence de Communication</li>
              <li><strong>Statut juridique :</strong> Société / Établissement privé de formation professionnelle</li>
              <li><strong>Agrément :</strong> Établissement agréé par le Ministère de la Formation et de l'Enseignement Professionnels (MFEP) d'Algérie</li>
              <li><strong>Siège social :</strong> Cité Administrative, Boulevard Principal, Tiaret, Algérie</li>
              <li><strong>Numéro d'immatriculation (CNRC) :</strong> Immatriculé au Centre National du Registre du Commerce de Tiaret</li>
              <li><strong>Numéro d'Identification Fiscale (NIF) :</strong> Déclaré auprès de la direction des impôts de la wilaya de Tiaret</li>
              <li><strong>Contact téléphonique :</strong> 0550 00 00 00 / 046 00 00 00</li>
              <li><strong>Adresse électronique :</strong> contact@bca-tiaret.dz</li>
              <li><strong>Directeur de la publication :</strong> Le Directeur Général du Centre B.C.A.</li>
            </ul>
          </section>

          {/* Section 2 : Hébergement */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center">
              <Server className="w-5 h-5 mr-2.5 text-brand-600" />
              2. Hébergement & Infrastructure Technique
            </h2>
            <p>
              La plateforme web et la base de données sont hébergées sur une infrastructure serveur sécurisée conforme aux standards de haute disponibilité et de cybersécurité :
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-slate-700">
              <li><strong>Chiffrement des échanges :</strong> Protocole HTTPS / Certificat TLS Let's Encrypt (chiffrement RSA 2048 bits / AES 256).</li>
              <li><strong>Sauvegardes :</strong> Sauvegarde quotidienne chiffrée de la base de données MongoDB et des médias stockés.</li>
              <li><strong>Supervision technique :</strong> Monitoring 24h/24 et pare-feu réseau contre les attaques DDoS et requêtes malveillantes.</li>
            </ul>
          </section>

          {/* Section 3 : Propriété intellectuelle */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center">
              <Shield className="w-5 h-5 mr-2.5 text-brand-600" />
              3. Propriété Intellectuelle & Droits d'Auteur
            </h2>
            <p>
              L’ensemble des contenus présents sur cette plateforme (textes pédagogiques, programmes de formation, supports de communication, photographies, logos, charte graphique, vidéos et code source) est protégé par les lois régissant la propriété intellectuelle et les droits d'auteur en Algérie (ordonnance n° 03-05 relative aux droits d'auteur et aux droits voisins sous la tutelle de l'<strong>ONDA</strong>).
            </p>
            <p>
              Toute reproduction, distribution, modification, adaptation, retransmission ou publication, même partielle, de ces différents éléments est strictement interdite sans l'accord exprès par écrit de la direction de B.C.A.
            </p>
          </section>

          {/* Section 4 : Annonces et contenus tiers */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2.5 text-brand-600" />
              4. Espace Publicitaire & Annonces Locales
            </h2>
            <p>
              La plateforme B.C.A. héberge un annuaire professionnel, des bannières publicitaires et un espace de petites annonces locales à Tiaret :
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-slate-700">
              <li>
                <strong>Annonceurs partenaires :</strong> Les visuels, descriptifs et marques déposées figurant dans l'annuaire sont la propriété respective des annonceurs enregistrés.
              </li>
              <li>
                <strong>Modération :</strong> B.C.A. applique une modération préalable sur les petites annonces et propositions d'événements. Toutefois, B.C.A. ne saurait être tenu responsable des transactions, offres d'emploi ou engagements conclus directement entre usagers ou auprès d'un annonceur tiers.
              </li>
            </ul>
          </section>

          {/* Section 5 : Liens hypertextes */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center">
              <FileText className="w-5 h-5 mr-2.5 text-brand-600" />
              5. Liens Hypertextes & Services Tiers
            </h2>
            <p>
              Le site peut contenir des liens hypertextes vers d'autres sites web (réseaux sociaux, organismes publics, partenaires). N'exerçant aucun contrôle sur ces sites tiers, le centre B.C.A. décline toute responsabilité quant à leurs contenus, politiques de confidentialité ou pratiques commerciales.
            </p>
          </section>

          {/* Section 6 : Droit applicable */}
          <section className="space-y-3 bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <h2 className="text-base font-bold text-slate-900">
              6. Droit Applicable & Juridiction Compétente
            </h2>
            <p className="text-xs text-slate-600">
              Les présentes mentions légales sont régies par le droit algérien. Tout litige relatif à l’utilisation de la plateforme web B.C.A., à défaut de règlement amiable, sera soumis à la compétence exclusive des tribunaux compétents du ressort territorial de la wilaya de Tiaret.
            </p>
          </section>
        </div>

        {/* Back Link */}
        <div className="mt-10 pt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <Link to="/" className="text-brand-600 hover:underline font-semibold">
            ← Retour à l'accueil
          </Link>
          <Link to="/confidentialite" className="text-brand-600 hover:underline font-semibold">
            Consulter la politique de confidentialité →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MentionsLegales;
