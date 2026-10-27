import React from 'react';
import { Link } from 'react-router-dom';
import { SEOHelmet } from '../../components/common/SEOHelmet';
import { ShieldCheck, Lock, Eye, FileCheck, UserCheck, HelpCircle } from 'lucide-react';

export const Confidentialite = () => {
  return (
    <div className="bg-slate-50 min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <SEOHelmet
        title="Politique de Confidentialité - B.C.A. Tiaret"
        description="Politique de protection des données à caractère personnel du centre B.C.A. à Tiaret, rédigée en conformité stricte avec la Loi algérienne n° 18-07."
      />

      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-100 p-8 sm:p-12">
        {/* Header */}
        <div className="border-b border-slate-100 pb-8 mb-8 text-center sm:text-left">
          <span className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full mb-3">
            <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
            Loi Algérienne n° 18-07
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Politique de Confidentialité & Protection des Données
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Dernière mise à jour : Janvier 2026 — Applicable aux utilisateurs du site web du centre B.C.A. Tiaret.
          </p>
        </div>

        {/* Content sections */}
        <div className="space-y-10 text-sm text-slate-600 leading-relaxed">
          {/* Section 1 : Engagement et cadre légal */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center">
              <ShieldCheck className="w-5 h-5 mr-2.5 text-emerald-600" />
              1. Engagement & Conformité à la Loi n° 18-07
            </h2>
            <p>
              Le centre de formation et de communication <strong>B.C.A.</strong> (Tiaret) attache une importance primordiale au respect de la vie privée et à la sécurité des données de ses apprenants, partenaires et visiteurs.
            </p>
            <p>
              Les traitements de données à caractère personnel effectués sur ce site sont régis par les dispositions de la <strong>Loi n° 18-07 du 25 Ramadhan 1439 correspondant au 10 juin 2018 relative à la protection des personnes physiques dans le traitement des données à caractère personnel</strong>, promulguée par la République Algérienne Démocratique et Populaire, et supervisée par l'<strong>Autorité Nationale de Protection des Données à caractère Personnel (ANPDP)</strong>.
            </p>
          </section>

          {/* Section 2 : Données collectées */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center">
              <Eye className="w-5 h-5 mr-2.5 text-brand-600" />
              2. Nature des Données Collectées
            </h2>
            <p>
              B.C.A. ne collecte que les informations strictement nécessaires aux services demandés :
            </p>
            <ul className="list-disc list-inside space-y-2 pl-2 text-slate-700">
              <li>
                <strong>Préinscriptions aux formations :</strong> Nom, prénom, date de naissance (facultative), numéro de téléphone, adresse e-mail, niveau d'études, commune/wilaya de résidence, formation et session visées.
              </li>
              <li>
                <strong>Demandes de devis & prestations :</strong> Identité du contact, nom de l'entreprise ou organisme, coordonnées téléphoniques, e-mail, type de prestation (communication, vidéo, publicité).
              </li>
              <li>
                <strong>Formulaire de contact général :</strong> Nom complet, téléphone, adresse e-mail, objet et message.
              </li>
              <li>
                <strong>Propositions d'événements & petites annonces :</strong> Nom de l'organisateur ou annonceur, contact téléphonique, description de l'événement ou de l'annonce soumise à modération.
              </li>
              <li>
                <strong>Données de navigation et logs techniques :</strong> Adresse IP anonymisée, horodatage des requêtes, type de navigateur pour la sécurisation du serveur et la prévention des fraudes.
              </li>
            </ul>
          </section>

          {/* Section 3 : Finalités du traitement */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center">
              <FileCheck className="w-5 h-5 mr-2.5 text-brand-600" />
              3. Finalités du Traitement
            </h2>
            <p>Les données recueillies sont destinées exclusivement à :</p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-slate-700">
              <li>L'instruction administrative et la validation des préinscriptions aux sessions de formation.</li>
              <li>L'établissement et la transmission des devis de communication et régie publicitaire.</li>
              <li>La réponse aux interrogations transmises via le formulaire de contact.</li>
              <li>La modération et publication des annonces locales et événements de la région de Tiaret.</li>
              <li>L'amélioration de l'expérience utilisateur et la sécurité technique de la plateforme.</li>
            </ul>
            <p className="font-semibold text-slate-800">
              B.C.A. s'interdit formellement de commercialiser, louer ou céder vos données à des tiers ou à des courtiers de données.
            </p>
          </section>

          {/* Section 4 : Sécurité et hébergement */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center">
              <Lock className="w-5 h-5 mr-2.5 text-brand-600" />
              4. Sécurité & Confidentialité des Données
            </h2>
            <p>
              Des mesures techniques et organisationnelles renforcées sont déployées pour préserver l'intégrité et la confidentialité des données :
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-slate-700">
              <li>Chiffrement SSL/TLS de l'ensemble des flux web (HTTPS).</li>
              <li>Hachage cryptographique des mots de passe utilisateurs (Bcrypt avec salage).</li>
              <li>Authentification sécurisée par tokens JWT avec cookies <code>httpOnly</code> protégés contre les failles XSS et CSRF.</li>
              <li>Protection des formulaires contre les attaques automatisées par système Honeypot et limitation du débit de requêtes (Rate Limiting).</li>
              <li>Accès aux données réservé uniquement au personnel habilité de la direction de B.C.A.</li>
            </ul>
          </section>

          {/* Section 5 : Durée de conservation */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center">
              <UserCheck className="w-5 h-5 mr-2.5 text-brand-600" />
              5. Durée de Conservation des Données
            </h2>
            <ul className="list-disc list-inside space-y-1 pl-2 text-slate-700">
              <li><strong>Préinscriptions non concrétisées :</strong> 12 mois à compter du dernier contact.</li>
              <li><strong>Dossiers des stagiaires formés :</strong> Archivage pédagogique légal (attestations de réussite et certifications délivrées) conformément aux exigences du Ministère de tutelle.</li>
              <li><strong>Messages de contact & demandes de devis :</strong> 2 ans à des fins de suivi commercial.</li>
              <li><strong>Petites annonces expirées :</strong> Suppression automatique après la date de fin de validité.</li>
            </ul>
          </section>

          {/* Section 6 : Vos droits et recours */}
          <section className="space-y-3 bg-brand-50/50 p-6 rounded-2xl border border-brand-100">
            <h2 className="text-base font-bold text-brand-900 flex items-center">
              <HelpCircle className="w-5 h-5 mr-2 text-brand-600" />
              6. Vos Droits (Articles 32 à 37 de la Loi 18-07)
            </h2>
            <p className="text-slate-700 text-xs leading-relaxed">
              En vertu de la législation algérienne, vous disposez d'un droit d'accès, d'information, de rectification, de mise à jour, d'effacement et d'opposition au traitement de vos données personnelles.
            </p>
            <div className="pt-2 text-xs text-slate-700">
              Pour exercer vos droits, vous pouvez contacter directement le délégué à la protection des données de B.C.A. :
              <div className="mt-2 pl-2 border-l-2 border-brand-500 font-mono text-slate-800">
                <p>E-mail : contact@bca-tiaret.dz (mentionner en objet : "Exercice Droit Loi 18-07")</p>
                <p>Courrier : Centre B.C.A., Cité Administrative, Tiaret, Algérie</p>
                <p>Téléphone : 0550 00 00 00</p>
              </div>
            </div>
          </section>
        </div>

        {/* Back Link */}
        <div className="mt-10 pt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <Link to="/" className="text-brand-600 hover:underline font-semibold">
            ← Revenir à l'accueil
          </Link>
          <Link to="/mentions-legales" className="text-brand-600 hover:underline font-semibold">
            Consulter les mentions légales →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Confidentialite;
