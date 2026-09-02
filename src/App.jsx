import React, { useState } from "react";

const C = {
  green: "#1B3B2E",
  greenSoft: "#2F5D4C",   // vert adouci : tous les aplats (boutons). Le vert profond reste réservé au texte.
  goldDeep: "#A8791F",    // or foncé : lisible sur les fonds crème, contrairement à l'or clair
  gold: "#B8894A",
  goldLight: "#C9A227",
  orange: "#C97B3D",
  ivory: "#FBF6EC",
  cream: "#F3EAD8",
  text: "#2B2B2B",
  warn: "#9A4B32",
};

const SKIN_TYPES = [
  { id: "seche", label: "Sèche", note: "Textures riches, huiles nourrissantes, tensioactifs doux." },
  { id: "grasse", label: "Grasse", note: "Textures légères, non comédogènes, actifs séborégulateurs." },
  { id: "mixte", label: "Mixte", note: "Zonage : léger sur la zone T, plus riche sur les joues." },
  { id: "normale", label: "Normale", note: "Entretien, prévention, protection au long cours." },
  { id: "sensible", label: "Sensible / réactive", note: "Formules sans parfum, peu d'actifs à la fois, patch test conseillé." },
  { id: "mature", label: "Mature", note: "Renouvellement cellulaire ralenti : privilégier stimulants (rétinol doux, peptides) et textures nourrissantes." },
];

const PHOTOTYPES = [
  "Très claire, brûle facilement",
  "Claire",
  "Mate",
  "Foncée",
  "Très foncée, ne brûle jamais",
];

const AGE_RANGES = ["Moins de 25 ans", "25 à 35 ans", "35 à 45 ans", "45 à 55 ans", "55 ans et plus"];

const ROUTINE_STEPS = [
  "Démaquillant", "Nettoyant", "Tonique / lotion", "Essence", "Sérum(s)",
  "Contour des yeux", "Soin solaire (SPF)", "Crème de jour", "Crème de nuit",
  "Exfoliant / gommage", "Masque",
];

// Recommandation du soin institut selon les préoccupations dominantes.
// Ciblage confirmé par Morgane (mots-clés officiels de chaque soin).
// "produits" ici = sélection phare du soin dans son ensemble, indépendamment de la préoccupation précise
// (à ne pas confondre avec les produits par préoccupation, plus ciblés, listés dans CONCERNS).
const SOIN_MAP = {
  glow: {
    name: "Parenthèse Glow",
    tagline: "Éclat • Hydratation • Lumière",
    concerns: ["terne", "hydratation", "taches", "melasma"],
    produits: { coreen: "Beauty of Joseon Glow Serum : Propolis + Niacinamide", parapharmacie: "Vichy Liftactiv Vitamin C Sérum Éclat", bio: "Aroma-Zone Sérum Vitamine C 10%", budget: "The Ordinary Vitamin C Suspension 23% + HA 2%", institut: "Genosys MVS – Multi Vita Radiance Serum", institutBio: "Oxalia Sérum Éclat Absolu + Crème Éclat Absolu SPF30" },
  },
  renaissance: {
    name: "Parenthèse Renaissance",
    tagline: "Régénération • Fermeté • Éclat",
    concerns: ["rides", "relachement", "cou_decollete", "ovale_visage", "cicatrices"],
    produits: { coreen: "Missha Time Revolution Night Repair Ampoule", parapharmacie: "La Roche-Posay Redermic R Rétinol Pur", bio: "Aroma-Zone Sérum Concentré Collagène Végétal 1,5%", budget: "The Inkey List Bakuchiol", institut: "Dermeden Sérum Intense Nuit (rétinol encapsulé, peptides matrikines)", institutBio: "Oxalia Gamme Expert Pro-Âge – Soin de Jour Pro-Âge" },
  },
  reparation: {
    name: "Parenthèse Réparation",
    tagline: "Réconfort • Hydratation • Barrière cutanée",
    concerns: ["barriere", "rougeurs", "imperfections", "acne_hormonale", "cernes", "hydratation"],
    produits: { coreen: "SKIN1004 Centella Probio-Cica Enrich Cream", parapharmacie: "La Roche-Posay Cicaplast Baume B5", bio: "Aroma-Zone Beurre de Karité Brut BIO", budget: "CeraVe Crème Hydratante Visage", institut: "Genosys HSC – Hydro Soothing Cream", institutBio: "Oxalia Crème Tentation Fondante + Sérum Tentation" },
  },
};

// Soins non ciblés par préoccupation : affichés systématiquement en option, hors matching.
// Douceur a un format fixe (gommage + masque) donc une sélection produits dédiée ;
// Plaisir s'adapte à la peau diagnostiquée, donc renvoie vers le protocole par préoccupation plutôt que d'inventer des produits hors-sujet.
const OTHER_SOINS = [
  {
    name: "Parenthèse Douceur",
    duree: "30 min",
    description: "Gommage & masque",
    produits: {
      coreen: "Skinfood Black Sugar Mask Wash Off (gommage) + Innisfree Jeju Volcanic Pore Clay Mask (masque)",
      parapharmacie: "La Roche-Posay Gommage Surfin Physiologique (gommage) + Avène Masque Apaisant Hydratant (masque)",
      bio: "Aroma-Zone Gommage Visage Tonifiant & Revitalisant (gommage) + Masque Peel-off aux Alginates Marins BIO (masque)",
      budget: "Garnier Pure Active Gommage 3en1 (gommage) + Garnier SkinActive Masque Argile (masque)",
      institut: "Genosys Epi Turnover Boosting Peeling Gel (gommage) + Soothing Bomb Sea Algae Mask (masque)",
      institutBio: "Oxalia Riz aux Amandes (gommage) + Masque visage en coton bio (masque)",
    },
  },
  {
    name: "Parenthèse Plaisir",
    duree: "60 min",
    description: "Soin adaptable, tous types de peau",
    note: "Produits choisis selon la problématique diagnostiquée — voir le protocole détaillé par préoccupation ci-dessus.",
  },
];

// Ordre de départage quand deux soins obtiennent le même score.
// Réparation d'abord (le plus enveloppant, le moins risqué sur une peau fragilisée),
// puis Renaissance (le plus complet), puis Glow. Modifiable : c'est un choix de praticienne.
const SOIN_PRIORITY = ["reparation", "renaissance", "glow"];

function computeRecommendedSoins(selectedConcernIds) {
  const scores = Object.entries(SOIN_MAP).map(([key, soin]) => ({
    key,
    soin,
    score: soin.concerns.filter((c) => selectedConcernIds.includes(c)).length,
  }));
  const topScore = Math.max(...scores.map((s) => s.score));
  if (topScore === 0) return [];
  // Un seul soin proposé : deux recommandations à égalité diluent la décision.
  const top = scores.filter((s) => s.score === topScore);
  top.sort((x, y) => SOIN_PRIORITY.indexOf(x.key) - SOIN_PRIORITY.indexOf(y.key));
  return [top[0].soin];
}

const CONCERNS = [
  { id: "hydratation", label: "Déshydratation, tiraillements", actifs: ["Acide hyaluronique", "Glycérine", "Céramides", "Panthénol"],
    produits: { coreen: "Anua Heartleaf 77% Soothing Toner", parapharmacie: "La Roche-Posay Hyalu B5 Sérum", bio: "Aroma-Zone Sérum Acide Hyaluronique 3,5%", budget: "CeraVe Sérum Hydratant Acide Hyaluronique", institut: "Genosys MHS – Moisture Replenishing Hyaluron Serum", institutBio: "Oxalia Crème Doudou Cocoon (soin ultra-hydratant)" } },
  { id: "terne", label: "Teint terne, manque d'éclat", actifs: ["Vitamine C", "Niacinamide", "Exfoliation douce (PHA)"],
    produits: { coreen: "Beauty of Joseon Glow Serum : Propolis + Niacinamide", parapharmacie: "Vichy Liftactiv Vitamin C Sérum Éclat", bio: "Aroma-Zone Sérum Vitamine C 10%", budget: "The Ordinary Vitamin C Suspension 23% + HA 2%", institut: "Genosys MVS – Multi Vita Radiance Serum", institutBio: "Oxalia Sérum Éclat Absolu (concentré éclat & anti-taches)" } },
  { id: "rides", label: "Rides et ridules", actifs: ["Peptides", "Rétinol ou bakuchiol", "PDRN"],
    produits: { coreen: "Missha Time Revolution Night Repair Ampoule", parapharmacie: "La Roche-Posay Redermic R Rétinol Pur", bio: "Aroma-Zone Sérum Concentré Collagène Végétal 1,5%", budget: "The Inkey List Bakuchiol", institut: "Dermeden Sérum Intense Nuit (rétinol encapsulé, peptides matrikines)", institutBio: "Oxalia Gamme Expert Pro-Âge – Masque Pro-Âge Combleur de Rides" } },
  { id: "relachement", label: "Relâchement, perte de fermeté", actifs: ["Collagène", "Élastine", "Peptides fermeté", "Massage liftant"],
    produits: { coreen: "Beauty of Joseon Revive Serum : Ginseng + Snail Mucin", parapharmacie: "Vichy Liftactiv Collagen Specialist", bio: "Aroma-Zone Crème Riche Collagène & Spilanthes", budget: "The Ordinary Buffet (complexe peptides)", institut: "Genosys MFC – Multi Functional Anti Wrinkle Cream", institutBio: "Oxalia L'Onctueux – Masque Visage Anti-Âge Régénérant" } },
  { id: "taches", label: "Taches pigmentaires", actifs: ["Vitamine C", "Arbutine", "Niacinamide", "SPF quotidien"],
    produits: { coreen: "Some By Mi Galactomyces Pure Vitamin C Glow Serum", parapharmacie: "La Roche-Posay Pigmentclar Sérum", bio: "Aroma-Zone Sérum Vitamine C 10%", budget: "The Ordinary Alpha Arbutin 2% + HA", institut: "Genosys SWS – Skin Whitening Serum", institutBio: "Oxalia Sérum Éclat Absolu (concentré éclat & anti-taches)" } },
  { id: "imperfections", label: "Imperfections, points noirs", actifs: ["Niacinamide", "Acide salicylique (BHA)", "Argile"],
    produits: { coreen: "COSRX BHA Blackhead Power Liquid", parapharmacie: "La Roche-Posay Effaclar Duo(+)", bio: "Aroma-Zone Sérum Niacinamide 10%, Cuivre & Zinc", budget: "CeraVe Gel Moussant SA Renewing", institut: "Genosys PCC – Problem Control Cream", institutBio: "Oxalia Crème Fluide Épure (soin matifiant)" } },
  { id: "rougeurs", label: "Rougeurs, sensibilité, couperose", actifs: ["Centella asiatica", "Panthénol", "Actifs apaisants sans parfum"],
    produits: { coreen: "Anua Heartleaf 77% Soothing Toner", parapharmacie: "Avène Antirougeurs Jour", bio: "Aroma-Zone Gel d'Aloe Vera Bio", budget: "Cetaphil Crème Hydratante Apaisante", institut: "Genosys HSC – Hydro Soothing Cream", institutBio: "Oxalia Brume de Douceur (lotion apaisante)" } },
  { id: "pores", label: "Pores dilatés, grain irrégulier", actifs: ["Niacinamide", "Acide salicylique", "Argile"],
    produits: { coreen: "Some By Mi AHA BHA PHA 30 Days Miracle Serum", parapharmacie: "Vichy Normaderm Sérum", bio: "Aroma-Zone Argile Verte Surfine", budget: "The Ordinary Niacinamide 10% + Zinc 1%", institut: "Genosys Epi Turnover Boosting Peeling Gel", institutBio: "Oxalia Crème Fluide Épure (soin matifiant)" } },
  { id: "cernes", label: "Cernes, poches", actifs: ["Caféine", "Vitamine K", "Peptides contour des yeux"],
    produits: { coreen: "AHC Ultimate Real Eye Cream for Face", parapharmacie: "Avène Physiolift Yeux", bio: "Aroma-Zone Roll-on Contour des Yeux à la Caféine", budget: "The Ordinary Caffeine Solution 5% + EGCG", institut: "Genosys Eye Cell – Eye Contour Serum", institutBio: "Oxalia Gamme Expert Pro-Âge – Contour des Yeux" } },
  { id: "cicatrices", label: "Cicatrices (acné, autres)", actifs: ["Centella asiatica", "Vitamine C", "Actifs cicatrisants"],
    produits: { coreen: "SKIN1004 Centella Probio-Cica Enrich Cream", parapharmacie: "La Roche-Posay Cicaplast Baume B5", bio: "Aroma-Zone Huile de Rose Musquée du Chili Bio", budget: "CeraVe Baume Réparateur", institut: "Dermeden Cicaderm – Soin Réparateur Cicatrisant Arnica+", institutBio: "Oxalia Crème Douceur Végétale (soin nourrissant intense)" } },
  { id: "melasma", label: "Mélasma (taches hormonales, symétriques)", actifs: ["Acide tranexamique", "Acide azélaïque", "Niacinamide", "SPF anti-lumière visible"],
    produits: { coreen: "Some By Mi Galactomyces Pure Vitamin C Glow Serum", parapharmacie: "Bioderma Photoderm M SPF50+ (teinté, lumière visible)", bio: "Aroma-Zone Sérum Anti-Taches Hordatine & Extrait de Réglisse", budget: "The Ordinary Alpha Arbutin 2% + HA", institut: "Dermeden LUMIXDERM – Crème Éclaircissante + Concentré Anti-Taches TXA 5%", institutBio: "Oxalia Sérum Éclat Absolu (concentré éclat & anti-taches)" } },
  { id: "barriere", label: "Barrière cutanée fragilisée", actifs: ["Céramides", "Cholestérol", "Panthénol", "Centella asiatica"],
    produits: { coreen: "SKIN1004 Centella Probio-Cica Enrich Cream", parapharmacie: "La Roche-Posay Cicaplast Baume B5", bio: "Aroma-Zone Beurre de Karité Brut BIO", budget: "CeraVe Crème Hydratante Visage", institut: "Genosys Microbiome Energy Infusing Mist", institutBio: "Oxalia Crème Tentation Fondante (peaux fragiles à normales)" } },
  { id: "cou_decollete", label: "Relâchement du cou / décolleté", actifs: ["Peptides", "Collagène", "DMAE", "Rétinol doux"],
    produits: { coreen: "Missha Time Revolution Night Repair Ampoule", parapharmacie: "Vichy Liftactiv Collagen Specialist", bio: "Aroma-Zone Crème Riche Collagène & Spilanthes", budget: "The Ordinary Buffet (complexe peptides)", institut: "Genosys ND Cell – Anti-Wrinkle Serum cou & décolleté", institutBio: "Oxalia Gamme Expert Pro-Âge – Soin de Jour Pro-Âge" } },
  { id: "acne_hormonale", label: "Acné hormonale adulte (menton, mâchoire, cycle)", actifs: ["Acide azélaïque", "Niacinamide", "Zinc", "Acide salicylique"],
    produits: { coreen: "Anua Azelaic Acid 10 Hyaluron Redness Soothing Serum", parapharmacie: "La Roche-Posay Effaclar Duo(+)", bio: "Aroma-Zone Sérum Concentré Acide Azélaïque 10%", budget: "The Ordinary Azelaic Acid Suspension 10%", institut: "Genosys PCC – Problem Control Cream", institutBio: "Oxalia Crème Fluide Épure (soin matifiant)" } },
  { id: "ovale_visage", label: "Perte de définition de l'ovale du visage", actifs: ["Peptides fermeté", "Collagène", "DMAE", "Massage liftant"],
    produits: { coreen: "Missha Time Revolution Night Repair Ampoule", parapharmacie: "Vichy Liftactiv Collagen Specialist", bio: "Aroma-Zone Crème Riche Collagène & Spilanthes", budget: "The Ordinary Buffet (complexe peptides)", institut: "Genosys MFC – Multi Functional Anti Wrinkle Cream", institutBio: "Oxalia L'Onctueux – Masque Visage Anti-Âge Régénérant (effet tenseur, redessine les contours)" } },
  { id: "exces_sebum", label: "Excès de sébum, brillance", actifs: ["Niacinamide", "Argile", "Zinc", "Acide salicylique"],
    produits: { coreen: "Some By Mi AHA BHA PHA 30 Days Miracle Serum", parapharmacie: "Vichy Normaderm Sérum", bio: "Aroma-Zone Argile Verte Surfine", budget: "The Ordinary Niacinamide 10% + Zinc 1%", institut: "Dermeden Hydra Protocole – Crème Légère Matifiante", institutBio: "Oxalia Crème Fluide Épure (soin matifiant)" } },
];

const ANTECEDENTS = [
  { id: "grossesse", label: "Grossesse / allaitement", warn: "Éviter rétinoïdes de synthèse, acide salicylique à haute dose et huiles essentielles concentrées. Privilégier bakuchiol et actifs doux." },
  { id: "traitement", label: "Traitement dermatologique en cours", warn: "Éviter exfoliation et actifs forts sans avis médical préalable." },
  { id: "isotretinoine", label: "Isotrétinoïne orale (Roaccutane) ou rétinoïdes prescrits", warn: "Contre-indication formelle : peeling, laser, microneedling, épilation à la cire, pendant et plusieurs mois après le traitement. Hydrater et protéger du soleil, baume lèvres indispensable." },
  { id: "peeling", label: "Peeling ou injections récentes (- de 1 mois)", warn: "Attendre la cicatrisation complète avant tout soin actif ou exfoliant." },
  { id: "herpes", label: "Herpès récidivant", warn: "Vigilance particulière sur la zone périorale, éviter la sur-stimulation de cette zone." },
  { id: "lesion", label: "Peau lésée / infection active", warn: "Reporter le soin jusqu'à cicatrisation complète." },
  { id: "menopause", label: "Ménopause", warn: "Privilégier des actifs redensifiants (collagène, DMAE, phytoestrogènes) et un accompagnement bienveillant de ce changement hormonal." },
  { id: "rosacee", label: "Rosacée diagnostiquée", warn: "Aucun soin en poussée active. Coordination avec le dermatologue essentielle ; formules sans parfum ni alcool exclusivement." },
  { id: "dermatite", label: "Dermatite séborrhéique diagnostiquée", warn: "Éviter textures grasses/occlusives sur les zones concernées (ailes du nez, sourcils) et tout gommage mécanique sur les plaques actives." },
  { id: "tabac", label: "Fumeuse / fumeur régulier", warn: "Renforcer les antioxydants (vitamine C, E) et le SPF : l'effet cumulatif tabac + UV accélère nettement le vieillissement cutané." },
  { id: "cancer_peau", label: "Antécédent de cancer de la peau (mélanome ou autre)", warn: "Surveillance dermatologique renforcée et vigilance solaire absolue. Éviter les exfoliations profondes et les actifs forts sans avis médical préalable." },
  { id: "anticoagulant", label: "Traitement anticoagulant", warn: "Contre-indique les techniques invasives (microneedling, certains peelings) : risque d'hématome accru. À signaler systématiquement avant tout soin." },
  { id: "photosensibilisant", label: "Traitement photosensibilisant en cours (certains antibiotiques, rétinoïdes topiques...)", warn: "Vigilance solaire impérative pendant le traitement. Éviter exfoliation et exposition UV, même faible." },
];

const STEP_IDS = ["intro", "profil", "phototype", "preoccupations", "habitudes", "routine", "antecedents", "objectifs", "resultat"];

function Hibiscus({ active, done, size = 26 }) {
  const stroke = done ? C.gold : active ? C.orange : "#D9CFBB";
  const sw = done || active ? 2.6 : 1.7;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <g stroke={stroke} strokeWidth={sw} strokeLinecap="round">
        <path d="M50 46 C38 30 38 12 50 4 C62 12 62 30 50 46 Z" />
        <path d="M50 46 C34 42 20 30 18 16 C34 14 48 22 54 36 Z" />
        <path d="M50 46 C66 42 80 30 82 16 C66 14 52 22 46 36 Z" />
        <path d="M50 46 C40 58 26 66 12 64 C16 50 28 40 44 40 Z" />
        <path d="M50 46 C60 58 74 66 88 64 C84 50 72 40 56 40 Z" />
      </g>
      {done && <circle cx="50" cy="44" r="3.4" fill={C.gold} />}
    </svg>
  );
}

function Choice({ selected, onClick, children, multi = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-left px-4 py-3 rounded-lg border transition-colors w-full sm:w-auto"
      style={{
        borderColor: selected ? C.gold : "#E1D6BE",
        backgroundColor: selected ? C.cream : "white",
        color: C.text,
        fontSize: "0.95rem",
      }}
    >
      <span className="inline-flex items-center gap-2">
        <span
          className="inline-flex items-center justify-center shrink-0"
          style={{
            width: 16,
            height: 16,
            borderRadius: multi ? 4 : 999,
            border: `1.5px solid ${selected ? C.gold : "#C9BC9E"}`,
            backgroundColor: selected ? C.gold : "transparent",
          }}
        >
          {selected && (
            <span style={{ color: "white", fontSize: 10, lineHeight: 1 }}>✓</span>
          )}
        </span>
        {children}
      </span>
    </button>
  );
}

function ProductLine({ label, value, color = C.orange }) {
  if (!value) return null;
  return (
    <p className="text-xs leading-snug">
      <span className="font-semibold" style={{ color }}>{label} — </span>
      <span style={{ color: "#54524C" }}>{value}</span>
    </p>
  );
}

function SectionLabel({ eyebrow, title }) {
  return (
    <div className="mb-6">
      <p
        className="uppercase tracking-widest text-xs font-semibold mb-2"
        style={{ color: C.orange, letterSpacing: "0.18em" }}
      >
        {eyebrow}
      </p>
      <h2
        style={{ fontFamily: "Georgia, 'Times New Roman', serif", color: C.green }}
        className="text-2xl sm:text-3xl"
      >
        {title}
      </h2>
    </div>
  );
}

function NavButtons({ onBack, onNext, backLabel = "Retour", nextLabel = "Continuer", nextDisabled }) {
  return (
    <div className="flex items-center justify-between mt-10 print:hidden">
      <button
        onClick={onBack}
        className="text-sm px-4 py-2 rounded-md"
        style={{ color: C.green, opacity: onBack ? 1 : 0, pointerEvents: onBack ? "auto" : "none" }}
      >
        ← {backLabel}
      </button>
      <button
        onClick={onNext}
        disabled={nextDisabled}
        className="text-sm px-6 py-2.5 rounded-md text-white transition-opacity"
        style={{ backgroundColor: nextDisabled ? "#C9BC9E" : C.greenSoft, opacity: nextDisabled ? 0.6 : 1 }}
      >
        {nextLabel} →
      </button>
    </div>
  );
}

export default function SkinDiagnostic() {
  const [step, setStep] = useState(0);
  const [copied, setCopied] = useState(false);
  const [showAlt, setShowAlt] = useState(false);
  const [consent, setConsent] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [sendError, setSendError] = useState(false);
  const [a, setA] = useState({
    prenom: "",
    email: "",
    age: "",
    skinTypes: [],
    peauMasculine: "",
    phototype: "",
    concerns: [],
    soleil: "",
    protection: "",
    tabac: "",
    sommeil: "",
    stress: "",
    alimentation: "",
    contraception: "",
    nettoyage: "",
    routineEtapes: [],
    marquesActuelles: "",
    actifsForts: "",
    actifsIntolerance: "",
    antecedents: [],
    allergiesDetail: "",
    objectifs: "",
  });

  const set = (k, v) => setA((prev) => ({ ...prev, [k]: v }));
  const toggle = (k, id) =>
    setA((prev) => ({
      ...prev,
      [k]: prev[k].includes(id) ? prev[k].filter((x) => x !== id) : [...prev[k], id],
    }));

  const next = () => setStep((s) => Math.min(s + 1, STEP_IDS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const selectedConcerns = CONCERNS.filter((c) => a.concerns.includes(c.id));
  const selectedSkinTypes = SKIN_TYPES.filter((t) => a.skinTypes.includes(t.id));
  const activeAntecedents = ANTECEDENTS.filter((x) => a.antecedents.includes(x.id));

  const recommendedSoins = computeRecommendedSoins(a.concerns);
  const showBienEtre = a.stress === "Élevé" || a.sommeil === "Moins de 6h";

  const lifestyleFlags = [];
  if (!a.routineEtapes.includes("Soin solaire (SPF)")) {
    lifestyleFlags.push("Aucune protection solaire quotidienne dans la routine actuelle : c'est le geste anti-âge et anti-taches le plus efficace, à intégrer même les jours sans soleil direct.");
  }
  if (a.soleil === "Fréquente" && a.protection === "Non") {
    lifestyleFlags.push("Exposition solaire fréquente sans protection : un SPF quotidien est indispensable pour limiter taches et vieillissement prématuré.");
  }
  if (a.tabac === "Oui") {
    lifestyleFlags.push("Tabac : renforcer les antioxydants (vitamine C, vitamine E) pour contrer le stress oxydatif supplémentaire.");
  }
  if (a.sommeil === "Moins de 6h" || a.stress === "Élevé") {
    lifestyleFlags.push("Sommeil court ou stress élevé : la peau régénère moins bien la nuit, des actifs apaisants et une routine du soir simplifiée sont recommandés.");
  }

  const progress = Math.round(((step) / (STEP_IDS.length - 1)) * 100);

  function buildSummaryText() {
    const lines = [];
    lines.push(`DIAGNOSTIC DE PEAU${a.prenom ? " — " + a.prenom : ""}`);
    if (a.email) lines.push(a.email);
    lines.push("Institut Morgane César\n");
    lines.push(`Profil de peau : ${selectedSkinTypes.map((t) => t.label).join(", ") || "—"}${a.peauMasculine === "Oui" ? " (peau masculine)" : ""}`);
    if (a.age) lines.push(`Âge : ${a.age}`);
    if (a.phototype) lines.push(`Phototype : ${a.phototype}`);
    if (a.actifsForts === "Oui") lines.push(`Utilise déjà rétinol / exfoliant AHA-BHA : à prendre en compte pour éviter les redondances.`);
    if (a.actifsIntolerance) lines.push(`Réaction déjà connue à : ${a.actifsIntolerance}`);
    if (a.routineEtapes.length) lines.push(`Routine actuelle : ${a.routineEtapes.join(", ")}`);
    if (a.marquesActuelles) lines.push(`Marques utilisées actuellement : ${a.marquesActuelles}`);
    lines.push("");
    if (selectedConcerns.length) {
      lines.push("PRÉOCCUPATIONS & PROTOCOLE PRODUITS");
      selectedConcerns.forEach((c) => {
        lines.push(`- ${c.label}`);
        lines.push(`  Actifs : ${c.actifs.join(", ")}`);
        if (c.produits) {
          lines.push(`  Coréen : ${c.produits.coreen}`);
          lines.push(`  Parapharmacie : ${c.produits.parapharmacie}`);
          lines.push(`  Bio : ${c.produits.bio}`);
          lines.push(`  Petit budget : ${c.produits.budget}`);
          if (c.produits.institut) lines.push(`  Protocole institut K-beauty/dermato : ${c.produits.institut}`);
          if (c.produits.institutBio) lines.push(`  Protocole institut bio : ${c.produits.institutBio}`);
        }
      });
      lines.push("");
    }
    if (recommendedSoins.length) {
      lines.push("SOIN INSTITUT RECOMMANDÉ");
      recommendedSoins.forEach((s) => {
        lines.push(`- ${s.name} (${s.tagline})`);
        if (s.produits) {
          lines.push(`  Coréen : ${s.produits.coreen}`);
          lines.push(`  Parapharmacie : ${s.produits.parapharmacie}`);
          lines.push(`  Bio : ${s.produits.bio}`);
          lines.push(`  Petit budget : ${s.produits.budget}`);
          lines.push(`  Protocole institut K-beauty/dermato : ${s.produits.institut}`);
          lines.push(`  Protocole institut bio : ${s.produits.institutBio}`);
        }
      });
      lines.push("");
    }
    lines.push("AUTRES FORMATS DISPONIBLES");
    OTHER_SOINS.forEach((s) => {
      lines.push(`- ${s.name} (${s.duree}) — ${s.description}`);
      if (s.produits) {
        lines.push(`  Coréen : ${s.produits.coreen}`);
        lines.push(`  Parapharmacie : ${s.produits.parapharmacie}`);
        lines.push(`  Bio : ${s.produits.bio}`);
        lines.push(`  Petit budget : ${s.produits.budget}`);
        lines.push(`  Protocole institut K-beauty/dermato : ${s.produits.institut}`);
        lines.push(`  Protocole institut bio : ${s.produits.institutBio}`);
      }
      if (s.note) lines.push(`  ${s.note}`);
    });
    lines.push("");
    if (showBienEtre) {
      lines.push("Le stress et le manque de sommeil ont un effet réel sur la peau : un accompagnement bien-être est aussi proposé à l'institut.");
      lines.push("");
    }
    if (activeAntecedents.length || a.allergiesDetail || lifestyleFlags.length) {
      lines.push("POINTS DE VIGILANCE");
      activeAntecedents.forEach((x) => lines.push(`- ${x.label} : ${x.warn}`));
      if (a.allergiesDetail) lines.push(`- Allergie signalée : ${a.allergiesDetail}`);
      lifestyleFlags.forEach((f) => lines.push(`- ${f}`));
      lines.push("");
    }
    if (a.objectifs) lines.push(`Attentes exprimées : « ${a.objectifs} »`);
    return lines.join("\n");
  }

  function handleCopy() {
    const text = buildSummaryText();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(() => {
        setCopied(false);
      });
    }
  }

  function buildSummaryHTML() {
    const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const concernsHTML = selectedConcerns.map((c) => `
      <div style="border:1px solid #EFE6D2;border-radius:10px;padding:14px 16px;margin-bottom:12px;">
        <p style="font-weight:600;margin:0 0 6px;color:#2B2B2B;">${esc(c.label)}</p>
        <p style="margin:0 0 8px;font-size:13px;color:#54524C;">Actifs : ${esc(c.actifs.join(", "))}</p>
        ${c.produits ? `
        <div style="border-top:1px dashed #E7DCC3;padding-top:8px;font-size:13px;color:#54524C;">
          <p style="margin:2px 0;"><b style="color:#C97B3D;">Coréen</b> — ${esc(c.produits.coreen)}</p>
          <p style="margin:2px 0;"><b style="color:#C97B3D;">Parapharmacie</b> — ${esc(c.produits.parapharmacie)}</p>
          <p style="margin:2px 0;"><b style="color:#C97B3D;">Bio</b> — ${esc(c.produits.bio)}</p>
          <p style="margin:2px 0;"><b style="color:#C97B3D;">Petit budget</b> — ${esc(c.produits.budget)}</p>
        </div>
        ${c.produits.institut ? `<div style="border-top:1px dashed #E7DCC3;margin-top:6px;padding-top:6px;font-size:13px;"><b style="color:#B8894A;">Protocole institut K-beauty/dermato</b> — ${esc(c.produits.institut)}${c.produits.institutBio ? `<br/><b style="color:#B8894A;">Protocole institut bio</b> — ${esc(c.produits.institutBio)}` : ""}</div>` : ""}` : ""}
      </div>`).join("");

    const soinProduitsHTML = (produits) => produits ? `
      <div style="border-top:1px dashed #E7DCC3;margin-top:8px;padding-top:8px;font-size:13px;">
        <p style="margin:2px 0;"><b style="color:#C97B3D;">Coréen</b> — ${esc(produits.coreen)}</p>
        <p style="margin:2px 0;"><b style="color:#C97B3D;">Parapharmacie</b> — ${esc(produits.parapharmacie)}</p>
        <p style="margin:2px 0;"><b style="color:#C97B3D;">Bio</b> — ${esc(produits.bio)}</p>
        <p style="margin:2px 0;"><b style="color:#C97B3D;">Petit budget</b> — ${esc(produits.budget)}</p>
        <p style="margin:2px 0;"><b style="color:#B8894A;">Protocole institut K-beauty/dermato</b> — ${esc(produits.institut)}</p>
        <p style="margin:2px 0;"><b style="color:#B8894A;">Protocole institut bio</b> — ${esc(produits.institutBio)}</p>
      </div>` : "";

    const soinHTML = recommendedSoins.length ? `
      <div style="background:#F3EAD8;border:1px solid #DEC89A;color:#2B2B2B;border-radius:10px;padding:16px 18px;margin-bottom:20px;">
        <p style="text-transform:uppercase;font-size:12px;letter-spacing:0.08em;font-weight:600;color:#A8791F;margin:0 0 8px;">Le soin qui vous correspond à l'institut</p>
        ${recommendedSoins.map((s) => `<div style="margin-bottom:10px;"><p style="margin:0;font-size:17px;">${esc(s.name)} <span style="font-size:13px;opacity:0.8;">— ${esc(s.tagline)}</span></p>${soinProduitsHTML(s.produits)}</div>`).join("")}
      </div>` : "";

    const bienEtreHTML = showBienEtre ? `
      <div style="background:#F3EAD8;border:1px solid #C9A22755;border-radius:10px;padding:14px 16px;margin-bottom:20px;font-size:13px;color:#54524C;">
        Le stress et le manque de sommeil ont un effet réel sur la peau. Un accompagnement bien-être est aussi proposé à l'institut.
      </div>` : "";

    const otherSoinsHTML = `
      <div style="background:white;border:1px solid #EFE6D2;border-radius:10px;padding:14px 16px;margin-bottom:20px;font-size:13px;color:#54524C;">
        <p style="text-transform:uppercase;font-size:12px;letter-spacing:0.08em;font-weight:600;color:#B8894A;margin:0 0 8px;">Autres formats disponibles</p>
        ${OTHER_SOINS.map((s) => `<div style="margin-bottom:10px;"><p style="margin:2px 0;"><b style="color:#2B2B2B;">${esc(s.name)}</b> (${esc(s.duree)}) — ${esc(s.description)}</p>${soinProduitsHTML(s.produits)}${s.note ? `<p style="margin:4px 0 0;font-style:italic;color:#A69C82;">${esc(s.note)}</p>` : ""}</div>`).join("")}
      </div>`;

    const warnHTML = (activeAntecedents.length || a.allergiesDetail || lifestyleFlags.length) ? `
      <p style="text-transform:uppercase;font-size:12px;letter-spacing:0.08em;font-weight:600;color:#9A4B32;margin:24px 0 10px;">Points de vigilance</p>
      ${activeAntecedents.map((x) => `<div style="background:#FBEEE8;color:#9A4B32;padding:10px 14px;border-radius:8px;margin-bottom:8px;font-size:13px;"><b>${esc(x.label)}</b> — ${esc(x.warn)}</div>`).join("")}
      ${a.allergiesDetail ? `<div style="background:#FBEEE8;color:#9A4B32;padding:10px 14px;border-radius:8px;margin-bottom:8px;font-size:13px;"><b>Allergie signalée</b> — ${esc(a.allergiesDetail)}</div>` : ""}
      ${lifestyleFlags.map((f) => `<div style="background:#FBEEE8;color:#9A4B32;padding:10px 14px;border-radius:8px;margin-bottom:8px;font-size:13px;">${esc(f)}</div>`).join("")}
    ` : "";

    return `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"/>
<title>Diagnostic de peau${a.prenom ? " - " + esc(a.prenom) : ""}</title>
<style>body{font-family:Georgia,'Times New Roman',serif;background:#FBF6EC;color:#2B2B2B;padding:32px;max-width:640px;margin:0 auto;}
h1{font-size:22px;color:#1B3B2E;margin-bottom:2px;}
.sub{color:#8A8577;font-family:Arial,sans-serif;font-size:13px;margin-bottom:24px;}
.profile{background:#F3EAD8;border-radius:10px;padding:16px 18px;margin-bottom:20px;font-family:Arial,sans-serif;}
.label{text-transform:uppercase;font-size:12px;letter-spacing:0.08em;font-weight:600;color:#1B3B2E;margin:0 0 8px;font-family:Arial,sans-serif;}
p{font-family:Arial,sans-serif;}
footer{margin-top:28px;background:#2F5D4C;color:#FBF6EC;padding:14px 18px;border-radius:8px;font-size:12px;text-align:center;font-family:Arial,sans-serif;}
</style></head><body>
<h1>${a.prenom ? "Diagnostic de " + esc(a.prenom) : "Diagnostic de peau"}</h1>
<p class="sub">${a.email ? esc(a.email) + " · " : ""}Institut Morgane César</p>
<div class="profile">
  <p class="label">Profil de peau</p>
  <p style="margin:0;font-family:Georgia,serif;font-size:17px;">Peau ${esc(selectedSkinTypes.map((t) => t.label.toLowerCase()).join(" & ") || "—")}${a.peauMasculine === "Oui" ? " (masculine)" : ""}</p>
  ${a.phototype ? `<p style="margin:6px 0 0;font-size:13px;color:#54524C;">Phototype : ${esc(a.phototype)}</p>` : ""}
  ${a.age ? `<p style="margin:6px 0 0;font-size:13px;color:#54524C;">Âge : ${esc(a.age)}</p>` : ""}
  ${a.peauMasculine === "Oui" ? `<p style="margin:6px 0 0;font-size:13px;color:#54524C;">Peau masculine : épiderme plus épais, textures plus riches tolérées, ne pas négliger l'hydratation ni le soin post-rasage.</p>` : ""}
  ${a.actifsForts === "Oui" ? `<p style="margin:6px 0 0;font-size:13px;color:#54524C;">Utilise déjà rétinol / exfoliant AHA-BHA : à prendre en compte pour éviter les redondances.</p>` : ""}
  ${a.actifsIntolerance ? `<p style="margin:6px 0 0;font-size:13px;color:#54524C;">Réaction déjà connue à : ${esc(a.actifsIntolerance)}</p>` : ""}
</div>
${(a.routineEtapes.length || a.marquesActuelles) ? `
<div class="profile" style="background:white;border:1px solid #EFE6D2;">
  <p class="label">Routine actuelle</p>
  ${a.routineEtapes.length ? `<p style="margin:0;font-size:14px;color:#54524C;">${esc(a.routineEtapes.join(", "))}</p>` : ""}
  ${a.marquesActuelles ? `<p style="margin:4px 0 0;font-size:14px;color:#54524C;">Marques : ${esc(a.marquesActuelles)}</p>` : ""}
</div>` : ""}
${selectedConcerns.length ? `<p class="label">Préoccupations, actifs & protocole produits</p>${concernsHTML}` : ""}
${soinHTML}
${bienEtreHTML}
${otherSoinsHTML}
${warnHTML}
${a.objectifs ? `<p class="label" style="margin-top:20px;">Attentes exprimées</p><p style="font-style:italic;color:#54524C;">« ${esc(a.objectifs)} »</p>` : ""}
<footer>Morgane César · Esthétique · Hypnose · Bien-être · 06 81 70 98 18<br/><span style="opacity:0.7;font-size:10px;">© 2026 Institut Morgane César – Tous droits réservés. Reproduction interdite sans autorisation.</span></footer>
</body></html>`;
  }

  function handleDownload() {
    const html = buildSummaryHTML();
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const safeName = (a.prenom || "diagnostic").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-");
    link.href = url;
    link.download = `diagnostic-peau-${safeName}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Le corps du mailto doit rester court : un texte trop long (avec tout le détail
  // du diagnostic) fait échouer silencieusement l'ouverture du client mail sur
  // certains systèmes, sans aucun message d'erreur. On télécharge donc la fiche
  // complète en HTML au même moment, à joindre manuellement au message.
  // mailto: dépend de l'application mail par défaut du système, qui s'avère peu fiable
  // (aucune configurée, mal configurée, bugs d'appli...). On ouvre directement Gmail
  // dans le navigateur à la place : ça marche sur tout appareil, sans réglage système.
  // Envoi vers l'institut. Le formulaire caché déclaré dans index.html permet à Netlify
  // de recevoir ce POST et d'envoyer un email à chaque diagnostic terminé.
  // Partent : prénom, email, type de peau, préoccupations esthétiques, soin recommandé.
  // Ne partent jamais : les antécédents médicaux et les questions de mode de vie,
  // qui sont des données de santé et restent sur l'appareil de la cliente.
  // Si tu modifies cette liste, modifie aussi la phrase de consentement affichée
  // plus bas : elle doit toujours dire exactement ce qui est envoyé.
  async function handleSendToInstitut() {
    setSending(true);
    setSendError(false);
    const data = {
      "form-name": "diagnostic",
      prenom: a.prenom || "Non renseigné",
      email: a.email,
      peau: selectedSkinTypes.length
        ? selectedSkinTypes.map((t) => t.label).join(", ")
        : "Non précisé",
      preoccupations: selectedConcerns.length
        ? selectedConcerns.map((c) => c.label).join(" · ")
        : "Aucune cochée",
      soin: recommendedSoins.length
        ? recommendedSoins.map((s) => s.name).join(", ")
        : "Aucune préoccupation cochée (orientation Parenthèse Plaisir)",
      consentement: "Oui, le " + new Date().toLocaleDateString("fr-FR"),
    };
    try {
      const res = await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(data).toString(),
      });
      if (!res.ok) throw new Error("envoi refusé");
      setSent(true);
    } catch (err) {
      setSendError(true);
    }
    setSending(false);
  }

  function handleEmail() {
    handleDownload();
    const subject = encodeURIComponent("Mon diagnostic de peau — Institut Morgane César");
    const shortBody = [
      `Bonjour${a.prenom ? " " + a.prenom : ""},`,
      "",
      "Voici mon diagnostic de peau réalisé sur l'outil de l'institut.",
      "La fiche complète vient d'être téléchargée sur cet appareil : merci de la joindre à cet email avant de l'envoyer.",
      "",
      recommendedSoins.length ? `Soin recommandé : ${recommendedSoins.map((s) => s.name).join(" / ")}` : "",
    ].filter(Boolean).join("\n");
    const body = encodeURIComponent(shortBody);
    const to = encodeURIComponent(a.email || "");
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${to}&su=${subject}&body=${body}`;
    window.open(gmailUrl, "_blank");
  }


  return (
    <div
      className="min-h-screen w-full flex items-start justify-center py-8 px-4 sm:py-14"
      style={{ backgroundColor: C.ivory, color: C.text, fontFamily: "'Helvetica Neue', Arial, sans-serif" }}
    >
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 print:hidden">
          <div>
            <p style={{ fontFamily: "Georgia, serif", color: C.green }} className="text-lg leading-tight">
              L'Institut <span style={{ color: C.orange, fontStyle: "italic" }}>Morgane César</span>
            </p>
            <p className="tracking-widest" style={{ color: C.green, letterSpacing: "0.15em", fontSize: "11px" }}>
              ESTHÉTIQUE · HYPNOSE · BIEN-ÊTRE
            </p>
          </div>
        </div>

        {/* Botanical progress trail */}
        {step > 0 && step < STEP_IDS.length - 1 && (
          <div className="mb-10 print:hidden">
            <div className="flex items-center justify-between">
              {STEP_IDS.slice(1, -1).map((id, i) => (
                <Hibiscus key={id} size={22} active={i === step - 1} done={i < step - 1} />
              ))}
            </div>
            <div className="mt-1 rounded-full" style={{ backgroundColor: "#E7DCC3", height: "2px" }}>
              <div
                className="rounded-full transition-all duration-500"
                style={{ width: `${progress}%`, backgroundColor: C.gold, height: "2px" }}
              />
            </div>
          </div>
        )}

        {/* Card */}
        <div
          className="rounded-2xl px-6 py-8 sm:px-10 sm:py-10"
          style={{ backgroundColor: "white", border: "1px solid #EFE6D2", boxShadow: "0 1px 3px rgba(27,59,46,0.06)" }}
        >
          {/* STEP 0 — Intro */}
          {step === 0 && (
            <div className="text-center py-6">
              <div className="flex justify-center mb-6">
                <Hibiscus done size={52} />
              </div>
              <p className="uppercase tracking-widest text-xs font-semibold mb-3" style={{ color: C.orange, letterSpacing: "0.18em" }}>
                Diagnostic personnalisé
              </p>
              <h1 style={{ fontFamily: "Georgia, serif", color: C.green }} className="text-3xl sm:text-4xl mb-4">
                Faisons connaissance avec votre peau
              </h1>
              <p className="max-w-md mx-auto mb-8" style={{ color: "#54524C" }}>
                Quelques questions pour comprendre votre peau, votre mode de vie et vos attentes,
                et vous proposer les actifs les plus adaptés — coréens, bio ou classiques.
              </p>
              <input
                type="text"
                placeholder="Votre prénom (facultatif)"
                value={a.prenom}
                onChange={(e) => set("prenom", e.target.value)}
                className="w-full max-w-xs mx-auto block px-4 py-3 rounded-lg border mb-3 text-center"
                style={{ borderColor: "#E1D6BE" }}
              />
              <input
                type="email"
                placeholder="Votre email (facultatif)"
                value={a.email}
                onChange={(e) => set("email", e.target.value)}
                className="w-full max-w-xs mx-auto block px-4 py-3 rounded-lg border mb-8 text-center"
                style={{ borderColor: "#E1D6BE" }}
              />
              <button
                onClick={next}
                className="px-8 py-3 rounded-md text-white text-sm"
                style={{ backgroundColor: C.greenSoft }}
              >
                Commencer →
              </button>
            </div>
          )}

          {/* STEP 1 — Skin type */}
          {step === 1 && (
            <div>
              <SectionLabel eyebrow="Étape 1 / 7" title="Quel est le type de votre peau ?" />
              <p className="text-sm mb-4" style={{ color: "#8A8577" }}>
                Plusieurs réponses possibles — une peau peut être à la fois mixte et sensible, par exemple.
              </p>
              <div className="flex flex-col gap-2.5">
                {SKIN_TYPES.map((t) => (
                  <Choice key={t.id} multi selected={a.skinTypes.includes(t.id)} onClick={() => toggle("skinTypes", t.id)}>
                    {t.label}
                  </Choice>
                ))}
              </div>
              <p className="text-sm font-semibold mt-6 mb-2" style={{ color: C.green }}>Peau masculine ?</p>
              <div className="flex flex-wrap gap-2">
                {["Oui", "Non"].map((v) => (
                  <Choice key={v} selected={a.peauMasculine === v} onClick={() => set("peauMasculine", v)}>{v}</Choice>
                ))}
              </div>
              <p className="text-sm font-semibold mt-6 mb-2" style={{ color: C.green }}>Tranche d'âge</p>
              <div className="flex flex-wrap gap-2">
                {AGE_RANGES.map((v) => (
                  <Choice key={v} selected={a.age === v} onClick={() => set("age", v)}>{v}</Choice>
                ))}
              </div>
              <NavButtons onBack={back} onNext={next} nextDisabled={a.skinTypes.length === 0} />
            </div>
          )}

          {/* STEP 2 — Phototype */}
          {step === 2 && (
            <div>
              <SectionLabel eyebrow="Étape 2 / 7" title="Comment réagit votre peau au soleil ?" />
              <div className="flex flex-col gap-2.5">
                {PHOTOTYPES.map((p) => (
                  <Choice key={p} selected={a.phototype === p} onClick={() => set("phototype", p)}>
                    {p}
                  </Choice>
                ))}
              </div>
              <NavButtons onBack={back} onNext={next} nextDisabled={!a.phototype} />
            </div>
          )}

          {/* STEP 3 — Concerns */}
          {step === 3 && (
            <div>
              <SectionLabel eyebrow="Étape 3 / 7" title="Quelles sont vos préoccupations principales ?" />
              <p className="text-sm mb-4" style={{ color: "#8A8577" }}>Plusieurs réponses possibles.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {CONCERNS.map((c) => (
                  <Choice key={c.id} multi selected={a.concerns.includes(c.id)} onClick={() => toggle("concerns", c.id)}>
                    {c.label}
                  </Choice>
                ))}
              </div>
              <NavButtons onBack={back} onNext={next} nextDisabled={a.concerns.length === 0} />
            </div>
          )}

          {/* STEP 4 — Habitudes */}
          {step === 4 && (
            <div>
              <SectionLabel eyebrow="Étape 4 / 7" title="Vos habitudes de vie" />
              <div className="space-y-5">
                <div>
                  <p className="text-sm font-semibold mb-2" style={{ color: C.green }}>Exposition au soleil</p>
                  <div className="flex flex-wrap gap-2">
                    {["Rare", "Modérée", "Fréquente"].map((v) => (
                      <Choice key={v} selected={a.soleil === v} onClick={() => set("soleil", v)}>{v}</Choice>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold mb-2" style={{ color: C.green }}>Protection solaire quotidienne</p>
                  <div className="flex flex-wrap gap-2">
                    {["Oui", "Non"].map((v) => (
                      <Choice key={v} selected={a.protection === v} onClick={() => set("protection", v)}>{v}</Choice>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold mb-2" style={{ color: C.green }}>Tabac</p>
                  <div className="flex flex-wrap gap-2">
                    {["Oui", "Non"].map((v) => (
                      <Choice key={v} selected={a.tabac === v} onClick={() => set("tabac", v)}>{v}</Choice>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold mb-2" style={{ color: C.green }}>Sommeil</p>
                  <div className="flex flex-wrap gap-2">
                    {["Moins de 6h", "6 à 8h", "Plus de 8h"].map((v) => (
                      <Choice key={v} selected={a.sommeil === v} onClick={() => set("sommeil", v)}>{v}</Choice>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold mb-2" style={{ color: C.green }}>Niveau de stress perçu</p>
                  <div className="flex flex-wrap gap-2">
                    {["Faible", "Modéré", "Élevé"].map((v) => (
                      <Choice key={v} selected={a.stress === v} onClick={() => set("stress", v)}>{v}</Choice>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold mb-2" style={{ color: C.green }}>Alimentation</p>
                  <div className="flex flex-wrap gap-2">
                    {["Équilibrée", "Irrégulière", "Riche en sucre / transformé"].map((v) => (
                      <Choice key={v} selected={a.alimentation === v} onClick={() => set("alimentation", v)}>{v}</Choice>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold mb-2" style={{ color: C.green }}>Contraception hormonale (pilule, stérilet hormonal...)</p>
                  <div className="flex flex-wrap gap-2">
                    {["Oui", "Non", "Non concerné(e)"].map((v) => (
                      <Choice key={v} selected={a.contraception === v} onClick={() => set("contraception", v)}>{v}</Choice>
                    ))}
                  </div>
                </div>
              </div>
              <NavButtons onBack={back} onNext={next} />
            </div>
          )}

          {/* STEP 5 — Routine */}
          {step === 5 && (
            <div>
              <SectionLabel eyebrow="Étape 5 / 7" title="Votre routine actuelle" />
              <div className="space-y-5">
                <div>
                  <p className="text-sm font-semibold mb-2" style={{ color: C.green }}>Quelles étapes utilisez-vous déjà ?</p>
                  <p className="text-xs mb-3" style={{ color: "#8A8577" }}>Plusieurs réponses possibles.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {ROUTINE_STEPS.map((s) => (
                      <Choice key={s} multi selected={a.routineEtapes.includes(s)} onClick={() => toggle("routineEtapes", s)}>
                        {s}
                      </Choice>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold mb-2" style={{ color: C.green }}>Marques que vous utilisez actuellement (facultatif)</p>
                  <input
                    type="text"
                    value={a.marquesActuelles}
                    onChange={(e) => set("marquesActuelles", e.target.value)}
                    placeholder="Ex : La Roche-Posay, CeraVe..."
                    className="w-full px-4 py-2.5 rounded-lg border"
                    style={{ borderColor: "#E1D6BE" }}
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold mb-2" style={{ color: C.green }}>Fréquence du nettoyage du visage</p>
                  <div className="flex flex-wrap gap-2">
                    {["Matin et soir", "Soir uniquement", "Irrégulier"].map((v) => (
                      <Choice key={v} selected={a.nettoyage === v} onClick={() => set("nettoyage", v)}>{v}</Choice>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold mb-2" style={{ color: C.green }}>Utilisez-vous déjà du rétinol ou un exfoliant (AHA/BHA) ?</p>
                  <div className="flex flex-wrap gap-2">
                    {["Oui", "Non"].map((v) => (
                      <Choice key={v} selected={a.actifsForts === v} onClick={() => set("actifsForts", v)}>{v}</Choice>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold mb-2" style={{ color: C.green }}>Un actif ou produit a déjà provoqué une réaction ? (facultatif)</p>
                  <input
                    type="text"
                    value={a.actifsIntolerance}
                    onChange={(e) => set("actifsIntolerance", e.target.value)}
                    placeholder="Lequel, et quel type de réaction"
                    className="w-full px-4 py-2.5 rounded-lg border"
                    style={{ borderColor: "#E1D6BE" }}
                  />
                </div>
              </div>
              <NavButtons onBack={back} onNext={next} />
            </div>
          )}

          {/* STEP 6 — Antécédents */}
          {step === 6 && (
            <div>
              <SectionLabel eyebrow="Étape 6 / 7" title="Antécédents & contre-indications" />
              <p className="text-sm mb-4" style={{ color: "#8A8577" }}>
                Essentiel avant tout soin, quelle que soit la technique utilisée.
              </p>
              <div className="flex flex-col gap-2.5">
                {ANTECEDENTS.map((x) => (
                  <Choice key={x.id} multi selected={a.antecedents.includes(x.id)} onClick={() => toggle("antecedents", x.id)}>
                    {x.label}
                  </Choice>
                ))}
              </div>
              <div className="mt-4">
                <p className="text-sm font-semibold mb-2" style={{ color: C.green }}>Allergies cutanées connues (facultatif)</p>
                <input
                  type="text"
                  value={a.allergiesDetail}
                  onChange={(e) => set("allergiesDetail", e.target.value)}
                  placeholder="À préciser si oui"
                  className="w-full px-4 py-2.5 rounded-lg border"
                  style={{ borderColor: "#E1D6BE" }}
                />
              </div>
              <NavButtons onBack={back} onNext={next} />
            </div>
          )}

          {/* STEP 7 — Objectifs */}
          {step === 7 && (
            <div>
              <SectionLabel eyebrow="Étape 7 / 7" title="Qu'attendez-vous de ce soin ?" />
              <textarea
                value={a.objectifs}
                onChange={(e) => set("objectifs", e.target.value)}
                rows={4}
                placeholder="Décrivez vos attentes en quelques mots (facultatif)"
                className="w-full px-4 py-3 rounded-lg border"
                style={{ borderColor: "#E1D6BE" }}
              />
              <NavButtons onBack={back} onNext={next} nextLabel="Voir ma synthèse" />
            </div>
          )}

          {/* STEP 8 — Result */}
          {step === 8 && (
            <div>
              <div className="flex justify-center mb-4 print:hidden">
                <Hibiscus done size={40} />
              </div>
              <p className="uppercase tracking-widest text-xs font-semibold mb-2 text-center" style={{ color: C.orange, letterSpacing: "0.18em" }}>
                Votre synthèse
              </p>
              <h2 style={{ fontFamily: "Georgia, serif", color: C.green }} className="text-2xl sm:text-3xl text-center mb-1">
                {a.prenom ? `Diagnostic de ${a.prenom}` : "Votre diagnostic de peau"}
              </h2>
              {a.email && (
                <p className="text-center text-sm mb-8" style={{ color: "#8A8577" }}>{a.email}</p>
              )}
              {!a.email && <div className="mb-8" />}

              {/* Skin profile */}
              <div className="rounded-lg p-5 mb-5" style={{ backgroundColor: C.cream }}>
                <p className="text-xs uppercase tracking-wide font-semibold mb-1" style={{ color: C.green }}>Profil de peau</p>
                <p className="text-lg mb-2" style={{ fontFamily: "Georgia, serif", color: C.text }}>
                  Peau {selectedSkinTypes.length > 0 ? selectedSkinTypes.map((t) => t.label.toLowerCase()).join(" & ") : "—"}
                  {a.peauMasculine === "Oui" ? " (masculine)" : ""}
                </p>
                <div className="space-y-1">
                  {selectedSkinTypes.map((t) => (
                    <p key={t.id} className="text-sm" style={{ color: "#54524C" }}>
                      <span className="font-semibold" style={{ color: C.text }}>{t.label} — </span>{t.note}
                    </p>
                  ))}
                  {a.peauMasculine === "Oui" && (
                    <p className="text-sm" style={{ color: "#54524C" }}>
                      <span className="font-semibold" style={{ color: C.text }}>Peau masculine — </span>
                      Épiderme environ 20 à 25% plus épais : textures un peu plus riches tolérées, actifs concentrés bien supportés. Prévoir un soin post-rasage apaisant (centella, panthénol) et ne pas négliger l'hydratation, souvent oubliée.
                    </p>
                  )}
                </div>
                {a.phototype && <p className="text-sm mt-2" style={{ color: "#54524C" }}>Phototype : {a.phototype}</p>}
              </div>

              {(a.routineEtapes.length > 0 || a.marquesActuelles) && (
                <div className="rounded-lg p-5 mb-5" style={{ backgroundColor: "white", border: "1px solid #EFE6D2" }}>
                  <p className="text-xs uppercase tracking-wide font-semibold mb-1" style={{ color: C.green }}>Routine actuelle</p>
                  {a.routineEtapes.length > 0 && (
                    <p className="text-sm" style={{ color: "#54524C" }}>{a.routineEtapes.join(", ")}</p>
                  )}
                  {a.marquesActuelles && (
                    <p className="text-sm mt-1" style={{ color: "#54524C" }}>Marques : {a.marquesActuelles}</p>
                  )}
                </div>
              )}

              {/* Priority concerns + actives + product protocol */}
              {selectedConcerns.length > 0 && (
                <div className="mb-5">
                  <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
                    <p className="text-xs uppercase tracking-wide font-semibold" style={{ color: C.green }}>
                      Préoccupations, actifs & protocole produits
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowAlt((v) => !v)}
                      className="text-xs underline print:hidden"
                      style={{ color: C.gold }}
                    >
                      {showAlt ? "Masquer les alternatives" : "Voir les alternatives en pharmacie, bio ou petit budget"}
                    </button>
                  </div>
                  <div className="space-y-3">
                    {selectedConcerns.map((c) => (
                      <div key={c.id} className="rounded-lg p-4 border" style={{ borderColor: "#EFE6D2" }}>
                        <p className="font-semibold text-sm mb-1.5" style={{ color: C.text }}>{c.label}</p>
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {c.actifs.map((act) => (
                            <span
                              key={act}
                              className="text-xs px-2.5 py-1 rounded-full"
                              style={{ backgroundColor: C.ivory, color: C.green, border: `1px solid ${C.goldLight}55` }}
                            >
                              {act}
                            </span>
                          ))}
                        </div>
                        {c.produits && c.produits.institut && (
                          <div className="pt-2.5" style={{ borderTop: "1px dashed #E7DCC3" }}>
                            <ProductLine label="Protocole institut (K-beauty / dermato)" value={c.produits.institut} color={C.gold} />
                            <ProductLine label="Protocole institut (bio)" value={c.produits.institutBio} color={C.gold} />
                          </div>
                        )}
                        {c.produits && showAlt && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 mt-2 pt-2" style={{ borderTop: "1px dashed #E7DCC3" }}>
                            <ProductLine label="Coréen" value={c.produits.coreen} />
                            <ProductLine label="Parapharmacie" value={c.produits.parapharmacie} />
                            <ProductLine label="Bio" value={c.produits.bio} />
                            <ProductLine label="Petit budget" value={c.produits.budget} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedConcerns.length > 0 && (
                <p className="text-xs mb-5" style={{ color: "#A69C82" }}>
                  Un seul produit par catégorie et par préoccupation est proposé ici, à titre de repère. Les lignes « Protocole institut » correspondent aux produits utilisés en cabine, où le choix est affiné selon la texture et la tolérance de votre peau.
                </p>
              )}

              {/* Warnings */}
              {(activeAntecedents.length > 0 || lifestyleFlags.length > 0 || a.allergiesDetail) && (
                <div className="mb-5">
                  <p className="text-xs uppercase tracking-wide font-semibold mb-3" style={{ color: C.warn }}>
                    Points de vigilance
                  </p>
                  <div className="space-y-2">
                    {activeAntecedents.map((x) => (
                      <div key={x.id} className="rounded-lg p-3.5 text-sm" style={{ backgroundColor: "#FBEEE8", color: C.warn }}>
                        <span className="font-semibold">{x.label} — </span>{x.warn}
                      </div>
                    ))}
                    {a.allergiesDetail && (
                      <div className="rounded-lg p-3.5 text-sm" style={{ backgroundColor: "#FBEEE8", color: C.warn }}>
                        <span className="font-semibold">Allergie signalée — </span>{a.allergiesDetail}
                      </div>
                    )}
                    {lifestyleFlags.map((f, i) => (
                      <div key={i} className="rounded-lg p-3.5 text-sm" style={{ backgroundColor: "#FBEEE8", color: C.warn }}>
                        {f}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {a.objectifs && (
                <div className="mb-5">
                  <p className="text-xs uppercase tracking-wide font-semibold mb-2" style={{ color: C.green }}>Attentes exprimées</p>
                  <p className="text-sm italic" style={{ color: "#54524C" }}>« {a.objectifs} »</p>
                </div>
              )}

              {recommendedSoins.length > 0 && (
                <div className="rounded-lg p-5 mb-5" style={{ backgroundColor: C.cream, border: "1px solid #DEC89A" }}>
                  <p className="text-xs uppercase tracking-wide font-semibold mb-2" style={{ color: C.goldDeep }}>
                    Le soin qui vous correspond à l'institut
                  </p>
                  {recommendedSoins.map((s) => (
                    <div key={s.name} className="mb-4 last:mb-0">
                      <p style={{ fontFamily: "Georgia, serif", color: C.green }} className="text-lg">{s.name}</p>
                      <p className="text-sm mb-2" style={{ color: "#6B6A62" }}>{s.tagline}</p>
                      {s.produits && (
                        <div className="grid grid-cols-1 gap-y-1 pt-2" style={{ borderTop: "1px dashed #E0D3B6" }}>
                          <p className="text-xs"><span className="font-semibold" style={{ color: C.goldDeep }}>Protocole institut K-beauty/dermato — </span><span style={{ color: "#54524C" }}>{s.produits.institut}</span></p>
                          <p className="text-xs"><span className="font-semibold" style={{ color: C.goldDeep }}>Protocole institut bio — </span><span style={{ color: "#54524C" }}>{s.produits.institutBio}</span></p>
                          {showAlt && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 mt-1.5 pt-1.5" style={{ borderTop: "1px dashed #E0D3B6" }}>
                              <p className="text-xs"><span className="font-semibold" style={{ color: C.goldDeep }}>Coréen — </span><span style={{ color: "#54524C" }}>{s.produits.coreen}</span></p>
                              <p className="text-xs"><span className="font-semibold" style={{ color: C.goldDeep }}>Parapharmacie — </span><span style={{ color: "#54524C" }}>{s.produits.parapharmacie}</span></p>
                              <p className="text-xs"><span className="font-semibold" style={{ color: C.goldDeep }}>Bio — </span><span style={{ color: "#54524C" }}>{s.produits.bio}</span></p>
                              <p className="text-xs"><span className="font-semibold" style={{ color: C.goldDeep }}>Petit budget — </span><span style={{ color: "#54524C" }}>{s.produits.budget}</span></p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {recommendedSoins.length > 0 && (
                <div className="mb-5 print:hidden">
                  <a
                    href="tel:+33681709818"
                    className="flex items-center justify-center w-full px-5 py-4 rounded-lg text-white text-sm"
                    style={{ backgroundColor: C.gold, textDecoration: "none" }}
                  >
                    Prendre rendez-vous · 06 81 70 98 18
                  </a>
                  <p className="text-xs text-center mt-2" style={{ color: "#A69C82" }}>
                    Par téléphone, SMS, Messenger ou WhatsApp. Le diagnostic en cabine est offert avec votre premier soin visage.
                  </p>
                </div>
              )}

              {recommendedSoins.length === 0 && (
                <div className="rounded-lg p-5 mb-5" style={{ backgroundColor: C.cream, border: `1px solid ${C.goldLight}55` }}>
                  <p className="text-sm" style={{ color: "#54524C" }}>
                    Aucune préoccupation particulière n'a été cochée, et c'est une bonne nouvelle. La <span className="font-semibold">Parenthèse Plaisir</span> (60 min), qui s'adapte à tous les types de peau, est alors le meilleur point de départ.
                  </p>
                  <a
                    href="tel:+33681709818"
                    className="flex items-center justify-center w-full px-5 py-3 rounded-lg text-white text-sm mt-3 print:hidden"
                    style={{ backgroundColor: C.gold, textDecoration: "none" }}
                  >
                    Prendre rendez-vous · 06 81 70 98 18
                  </a>
                </div>
              )}

              {showBienEtre && (
                <div className="rounded-lg p-4 mb-5 text-sm" style={{ backgroundColor: C.cream, border: `1px solid ${C.goldLight}55`, color: "#54524C" }}>
                  Le stress et le manque de sommeil ont un effet réel et visible sur la peau. Si cela vous intéresse, l'institut propose aussi un accompagnement bien-être — n'hésitez pas à en parler en cabine.
                </div>
              )}

              <div className="rounded-lg p-4 mb-5 text-sm" style={{ backgroundColor: "white", border: "1px solid #EFE6D2", color: "#54524C" }}>
                <p className="text-xs uppercase tracking-wide font-semibold mb-2" style={{ color: C.gold }}>Autres formats disponibles</p>
                {OTHER_SOINS.map((s) => (
                  <div key={s.name} className="mb-3 last:mb-0">
                    <p className="text-sm mb-1">
                      <span className="font-semibold" style={{ color: C.text }}>{s.name}</span> ({s.duree}) — {s.description}
                    </p>
                    {s.produits && (
                      <div className="grid grid-cols-1 gap-y-1 pt-1.5 pl-0.5" style={{ borderTop: "1px dashed #E7DCC3" }}>
                        <ProductLine label="Protocole institut K-beauty/dermato" value={s.produits.institut} color={C.gold} />
                        <ProductLine label="Protocole institut bio" value={s.produits.institutBio} color={C.gold} />
                        {showAlt && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 mt-1 pt-1" style={{ borderTop: "1px dashed #E7DCC3" }}>
                            <ProductLine label="Coréen" value={s.produits.coreen} />
                            <ProductLine label="Parapharmacie" value={s.produits.parapharmacie} />
                            <ProductLine label="Bio" value={s.produits.bio} />
                            <ProductLine label="Petit budget" value={s.produits.budget} />
                          </div>
                        )}
                      </div>
                    )}
                    {s.note && <p className="text-xs italic" style={{ color: "#A69C82" }}>{s.note}</p>}
                  </div>
                ))}
              </div>

              <div className="rounded-lg p-4 mb-8 text-sm" style={{ backgroundColor: C.ivory, border: `1px solid ${C.goldLight}55`, color: "#54524C" }}>
                Ces actifs peuvent s'intégrer aussi bien dans un protocole coréen, bio ou classique — le choix de l'approche se fait avec votre esthéticienne selon vos préférences.
              </div>

              {/* Le seul endroit où les coordonnées de la cliente parviennent jusqu'à l'institut. */}
              <div className="rounded-lg p-5 mb-4 print:hidden" style={{ backgroundColor: C.ivory, border: `1px solid ${C.goldLight}55` }}>
                <p className="text-xs uppercase tracking-wide font-semibold mb-2" style={{ color: C.gold }}>
                  En parler avec Morgane
                </p>
                {sent ? (
                  <p className="text-sm" style={{ color: C.green }}>
                    C'est envoyé{a.prenom ? ", " + a.prenom : ""}. Je vous recontacte rapidement. À très vite.
                  </p>
                ) : (
                  <>
                    <p className="text-sm mb-3" style={{ color: "#54524C" }}>
                      Je peux recevoir votre prénom, votre email, votre type de peau, vos préoccupations et le soin recommandé, pour préparer votre venue et vous répondre. Vos antécédents médicaux et vos réponses sur votre mode de vie ne sont pas transmis : ils restent sur votre appareil.
                    </p>
                    <input
                      type="email"
                      placeholder="Votre email"
                      value={a.email}
                      onChange={(e) => set("email", e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border mb-3"
                      style={{ borderColor: "#E1D6BE" }}
                    />
                    <label className="flex items-start gap-2 text-xs mb-3 cursor-pointer" style={{ color: "#54524C" }}>
                      <input
                        type="checkbox"
                        checked={consent}
                        onChange={(e) => setConsent(e.target.checked)}
                        style={{ marginTop: 3 }}
                      />
                      <span>
                        J'accepte que l'Institut Morgane César conserve mon prénom, mon email, mon type de peau, mes préoccupations et le soin recommandé pour me recontacter. Je peux demander leur suppression à tout moment au 06 81 70 98 18.{" "}
                        <a
                          href="https://www.morganecesar.fr/politique-de-confidentialit%C3%A9"
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: C.gold, textDecoration: "underline" }}
                        >
                          Politique de confidentialité
                        </a>
                      </span>
                    </label>
                    <button
                      onClick={handleSendToInstitut}
                      disabled={!consent || !a.email || sending}
                      className="w-full px-5 py-3 rounded-md text-white text-sm"
                      style={{ backgroundColor: !consent || !a.email ? "#C9BC9E" : C.greenSoft }}
                    >
                      {sending ? "Envoi en cours..." : "Envoyer mon diagnostic à Morgane"}
                    </button>
                    {sendError && (
                      <p className="text-xs mt-2" style={{ color: C.warn }}>
                        L'envoi n'a pas fonctionné. Vous pouvez appeler ou envoyer un SMS au 06 81 70 98 18.
                      </p>
                    )}
                  </>
                )}
              </div>

              <button
                onClick={handleEmail}
                className="w-full px-5 py-3 rounded-md text-sm mb-3 border print:hidden"
                style={{ borderColor: C.gold, color: C.gold }}
              >
                {a.email ? `M'envoyer la fiche par Gmail (${a.email})` : "M'envoyer la fiche par Gmail"}
              </button>

              <div className="flex flex-col sm:flex-row gap-3 print:hidden">
                <button
                  onClick={handleDownload}
                  className="flex-1 px-5 py-3 rounded-md text-sm border"
                  style={{ borderColor: C.gold, color: C.gold }}
                >
                  Télécharger la fiche
                </button>
                <button
                  onClick={handleCopy}
                  className="flex-1 px-5 py-3 rounded-md text-sm border"
                  style={{ borderColor: C.gold, color: C.gold }}
                >
                  {copied ? "Copié ✓" : "Copier la synthèse"}
                </button>
              </div>
              <div className="mt-3 print:hidden">
                <button
                  onClick={() => { setA({ prenom: "", email: "", age: "", skinTypes: [], peauMasculine: "", phototype: "", concerns: [], soleil: "", protection: "", tabac: "", sommeil: "", stress: "", alimentation: "", contraception: "", nettoyage: "", routineEtapes: [], marquesActuelles: "", actifsForts: "", actifsIntolerance: "", antecedents: [], allergiesDetail: "", objectifs: "" }); setStep(0); }}
                  className="w-full px-5 py-3 rounded-md text-sm border"
                  style={{ borderColor: C.greenSoft, color: C.greenSoft }}
                >
                  Nouveau diagnostic
                </button>
              </div>
              <p className="text-xs mt-3 print:hidden" style={{ color: "#A69C82" }}>
                « Envoyer par Gmail » télécharge la fiche complète puis ouvre un brouillon Gmail avec un message court — il suffit de joindre le fichier téléchargé avant d'envoyer. Si vous n'utilisez pas Gmail, utilisez « Copier la synthèse » qui fonctionne avec n'importe quelle messagerie.
              </p>
            </div>
          )}
        </div>

        <p className="text-center text-xs mt-6 print:hidden" style={{ color: "#A69C82" }}>
          Morgane César · Esthétique · Hypnose · Bien-être
        </p>
        <p className="text-center mt-1 print:hidden" style={{ color: "#C9BC9E", fontSize: "10px" }}>
          © 2026 Institut Morgane César – Tous droits réservés.
        </p>
      </div>
    </div>
  );
}
import React, { useState } from "react";

const C = {
  green: "#1B3B2E",
  greenSoft: "#2F5D4C",   // vert adouci : tous les aplats (boutons). Le vert profond reste réservé au texte.
  goldDeep: "#A8791F",    // or foncé : lisible sur les fonds crème, contrairement à l'or clair
  gold: "#B8894A",
  goldLight: "#C9A227",
  orange: "#C97B3D",
  ivory: "#FBF6EC",
  cream: "#F3EAD8",
  text: "#2B2B2B",
  warn: "#9A4B32",
};

const SKIN_TYPES = [
  { id: "seche", label: "Sèche", note: "Textures riches, huiles nourrissantes, tensioactifs doux." },
  { id: "grasse", label: "Grasse", note: "Textures légères, non comédogènes, actifs séborégulateurs." },
  { id: "mixte", label: "Mixte", note: "Zonage : léger sur la zone T, plus riche sur les joues." },
  { id: "normale", label: "Normale", note: "Entretien, prévention, protection au long cours." },
  { id: "sensible", label: "Sensible / réactive", note: "Formules sans parfum, peu d'actifs à la fois, patch test conseillé." },
  { id: "mature", label: "Mature", note: "Renouvellement cellulaire ralenti : privilégier stimulants (rétinol doux, peptides) et textures nourrissantes." },
];

const PHOTOTYPES = [
  "Très claire, brûle facilement",
  "Claire",
  "Mate",
  "Foncée",
  "Très foncée, ne brûle jamais",
];

const AGE_RANGES = ["Moins de 25 ans", "25 à 35 ans", "35 à 45 ans", "45 à 55 ans", "55 ans et plus"];

const ROUTINE_STEPS = [
  "Démaquillant", "Nettoyant", "Tonique / lotion", "Essence", "Sérum(s)",
  "Contour des yeux", "Soin solaire (SPF)", "Crème de jour", "Crème de nuit",
  "Exfoliant / gommage", "Masque",
];

// Recommandation du soin institut selon les préoccupations dominantes.
// Ciblage confirmé par Morgane (mots-clés officiels de chaque soin).
// "produits" ici = sélection phare du soin dans son ensemble, indépendamment de la préoccupation précise
// (à ne pas confondre avec les produits par préoccupation, plus ciblés, listés dans CONCERNS).
const SOIN_MAP = {
  glow: {
    name: "Parenthèse Glow",
    tagline: "Éclat • Hydratation • Lumière",
    concerns: ["terne", "hydratation", "taches", "melasma"],
    produits: { coreen: "Beauty of Joseon Glow Serum : Propolis + Niacinamide", parapharmacie: "Vichy Liftactiv Vitamin C Sérum Éclat", bio: "Aroma-Zone Sérum Vitamine C 10%", budget: "The Ordinary Vitamin C Suspension 23% + HA 2%", institut: "Genosys MVS – Multi Vita Radiance Serum", institutBio: "Oxalia Sérum Éclat Absolu + Crème Éclat Absolu SPF30" },
  },
  renaissance: {
    name: "Parenthèse Renaissance",
    tagline: "Régénération • Fermeté • Éclat",
    concerns: ["rides", "relachement", "cou_decollete", "ovale_visage", "cicatrices"],
    produits: { coreen: "Missha Time Revolution Night Repair Ampoule", parapharmacie: "La Roche-Posay Redermic R Rétinol Pur", bio: "Aroma-Zone Sérum Concentré Collagène Végétal 1,5%", budget: "The Inkey List Bakuchiol", institut: "Dermeden Sérum Intense Nuit (rétinol encapsulé, peptides matrikines)", institutBio: "Oxalia Gamme Expert Pro-Âge – Soin de Jour Pro-Âge" },
  },
  reparation: {
    name: "Parenthèse Réparation",
    tagline: "Réconfort • Hydratation • Barrière cutanée",
    concerns: ["barriere", "rougeurs", "imperfections", "acne_hormonale", "cernes", "hydratation"],
    produits: { coreen: "SKIN1004 Centella Probio-Cica Enrich Cream", parapharmacie: "La Roche-Posay Cicaplast Baume B5", bio: "Aroma-Zone Beurre de Karité Brut BIO", budget: "CeraVe Crème Hydratante Visage", institut: "Genosys HSC – Hydro Soothing Cream", institutBio: "Oxalia Crème Tentation Fondante + Sérum Tentation" },
  },
};

// Soins non ciblés par préoccupation : affichés systématiquement en option, hors matching.
// Douceur a un format fixe (gommage + masque) donc une sélection produits dédiée ;
// Plaisir s'adapte à la peau diagnostiquée, donc renvoie vers le protocole par préoccupation plutôt que d'inventer des produits hors-sujet.
const OTHER_SOINS = [
  {
    name: "Parenthèse Douceur",
    duree: "30 min",
    description: "Gommage & masque",
    produits: {
      coreen: "Skinfood Black Sugar Mask Wash Off (gommage) + Innisfree Jeju Volcanic Pore Clay Mask (masque)",
      parapharmacie: "La Roche-Posay Gommage Surfin Physiologique (gommage) + Avène Masque Apaisant Hydratant (masque)",
      bio: "Aroma-Zone Gommage Visage Tonifiant & Revitalisant (gommage) + Masque Peel-off aux Alginates Marins BIO (masque)",
      budget: "Garnier Pure Active Gommage 3en1 (gommage) + Garnier SkinActive Masque Argile (masque)",
      institut: "Genosys Epi Turnover Boosting Peeling Gel (gommage) + Soothing Bomb Sea Algae Mask (masque)",
      institutBio: "Oxalia Riz aux Amandes (gommage) + Masque visage en coton bio (masque)",
    },
  },
  {
    name: "Parenthèse Plaisir",
    duree: "60 min",
    description: "Soin adaptable, tous types de peau",
    note: "Produits choisis selon la problématique diagnostiquée — voir le protocole détaillé par préoccupation ci-dessus.",
  },
];

// Ordre de départage quand deux soins obtiennent le même score.
// Réparation d'abord (le plus enveloppant, le moins risqué sur une peau fragilisée),
// puis Renaissance (le plus complet), puis Glow. Modifiable : c'est un choix de praticienne.
const SOIN_PRIORITY = ["reparation", "renaissance", "glow"];

function computeRecommendedSoins(selectedConcernIds) {
  const scores = Object.entries(SOIN_MAP).map(([key, soin]) => ({
    key,
    soin,
    score: soin.concerns.filter((c) => selectedConcernIds.includes(c)).length,
  }));
  const topScore = Math.max(...scores.map((s) => s.score));
  if (topScore === 0) return [];
  // Un seul soin proposé : deux recommandations à égalité diluent la décision.
  const top = scores.filter((s) => s.score === topScore);
  top.sort((x, y) => SOIN_PRIORITY.indexOf(x.key) - SOIN_PRIORITY.indexOf(y.key));
  return [top[0].soin];
}

const CONCERNS = [
  { id: "hydratation", label: "Déshydratation, tiraillements", actifs: ["Acide hyaluronique", "Glycérine", "Céramides", "Panthénol"],
    produits: { coreen: "Anua Heartleaf 77% Soothing Toner", parapharmacie: "La Roche-Posay Hyalu B5 Sérum", bio: "Aroma-Zone Sérum Acide Hyaluronique 3,5%", budget: "CeraVe Sérum Hydratant Acide Hyaluronique", institut: "Genosys MHS – Moisture Replenishing Hyaluron Serum", institutBio: "Oxalia Crème Doudou Cocoon (soin ultra-hydratant)" } },
  { id: "terne", label: "Teint terne, manque d'éclat", actifs: ["Vitamine C", "Niacinamide", "Exfoliation douce (PHA)"],
    produits: { coreen: "Beauty of Joseon Glow Serum : Propolis + Niacinamide", parapharmacie: "Vichy Liftactiv Vitamin C Sérum Éclat", bio: "Aroma-Zone Sérum Vitamine C 10%", budget: "The Ordinary Vitamin C Suspension 23% + HA 2%", institut: "Genosys MVS – Multi Vita Radiance Serum", institutBio: "Oxalia Sérum Éclat Absolu (concentré éclat & anti-taches)" } },
  { id: "rides", label: "Rides et ridules", actifs: ["Peptides", "Rétinol ou bakuchiol", "PDRN"],
    produits: { coreen: "Missha Time Revolution Night Repair Ampoule", parapharmacie: "La Roche-Posay Redermic R Rétinol Pur", bio: "Aroma-Zone Sérum Concentré Collagène Végétal 1,5%", budget: "The Inkey List Bakuchiol", institut: "Dermeden Sérum Intense Nuit (rétinol encapsulé, peptides matrikines)", institutBio: "Oxalia Gamme Expert Pro-Âge – Masque Pro-Âge Combleur de Rides" } },
  { id: "relachement", label: "Relâchement, perte de fermeté", actifs: ["Collagène", "Élastine", "Peptides fermeté", "Massage liftant"],
    produits: { coreen: "Beauty of Joseon Revive Serum : Ginseng + Snail Mucin", parapharmacie: "Vichy Liftactiv Collagen Specialist", bio: "Aroma-Zone Crème Riche Collagène & Spilanthes", budget: "The Ordinary Buffet (complexe peptides)", institut: "Genosys MFC – Multi Functional Anti Wrinkle Cream", institutBio: "Oxalia L'Onctueux – Masque Visage Anti-Âge Régénérant" } },
  { id: "taches", label: "Taches pigmentaires", actifs: ["Vitamine C", "Arbutine", "Niacinamide", "SPF quotidien"],
    produits: { coreen: "Some By Mi Galactomyces Pure Vitamin C Glow Serum", parapharmacie: "La Roche-Posay Pigmentclar Sérum", bio: "Aroma-Zone Sérum Vitamine C 10%", budget: "The Ordinary Alpha Arbutin 2% + HA", institut: "Genosys SWS – Skin Whitening Serum", institutBio: "Oxalia Sérum Éclat Absolu (concentré éclat & anti-taches)" } },
  { id: "imperfections", label: "Imperfections, points noirs", actifs: ["Niacinamide", "Acide salicylique (BHA)", "Argile"],
    produits: { coreen: "COSRX BHA Blackhead Power Liquid", parapharmacie: "La Roche-Posay Effaclar Duo(+)", bio: "Aroma-Zone Sérum Niacinamide 10%, Cuivre & Zinc", budget: "CeraVe Gel Moussant SA Renewing", institut: "Genosys PCC – Problem Control Cream", institutBio: "Oxalia Crème Fluide Épure (soin matifiant)" } },
  { id: "rougeurs", label: "Rougeurs, sensibilité, couperose", actifs: ["Centella asiatica", "Panthénol", "Actifs apaisants sans parfum"],
    produits: { coreen: "Anua Heartleaf 77% Soothing Toner", parapharmacie: "Avène Antirougeurs Jour", bio: "Aroma-Zone Gel d'Aloe Vera Bio", budget: "Cetaphil Crème Hydratante Apaisante", institut: "Genosys HSC – Hydro Soothing Cream", institutBio: "Oxalia Brume de Douceur (lotion apaisante)" } },
  { id: "pores", label: "Pores dilatés, grain irrégulier", actifs: ["Niacinamide", "Acide salicylique", "Argile"],
    produits: { coreen: "Some By Mi AHA BHA PHA 30 Days Miracle Serum", parapharmacie: "Vichy Normaderm Sérum", bio: "Aroma-Zone Argile Verte Surfine", budget: "The Ordinary Niacinamide 10% + Zinc 1%", institut: "Genosys Epi Turnover Boosting Peeling Gel", institutBio: "Oxalia Crème Fluide Épure (soin matifiant)" } },
  { id: "cernes", label: "Cernes, poches", actifs: ["Caféine", "Vitamine K", "Peptides contour des yeux"],
    produits: { coreen: "AHC Ultimate Real Eye Cream for Face", parapharmacie: "Avène Physiolift Yeux", bio: "Aroma-Zone Roll-on Contour des Yeux à la Caféine", budget: "The Ordinary Caffeine Solution 5% + EGCG", institut: "Genosys Eye Cell – Eye Contour Serum", institutBio: "Oxalia Gamme Expert Pro-Âge – Contour des Yeux" } },
  { id: "cicatrices", label: "Cicatrices (acné, autres)", actifs: ["Centella asiatica", "Vitamine C", "Actifs cicatrisants"],
    produits: { coreen: "SKIN1004 Centella Probio-Cica Enrich Cream", parapharmacie: "La Roche-Posay Cicaplast Baume B5", bio: "Aroma-Zone Huile de Rose Musquée du Chili Bio", budget: "CeraVe Baume Réparateur", institut: "Dermeden Cicaderm – Soin Réparateur Cicatrisant Arnica+", institutBio: "Oxalia Crème Douceur Végétale (soin nourrissant intense)" } },
  { id: "melasma", label: "Mélasma (taches hormonales, symétriques)", actifs: ["Acide tranexamique", "Acide azélaïque", "Niacinamide", "SPF anti-lumière visible"],
    produits: { coreen: "Some By Mi Galactomyces Pure Vitamin C Glow Serum", parapharmacie: "Bioderma Photoderm M SPF50+ (teinté, lumière visible)", bio: "Aroma-Zone Sérum Anti-Taches Hordatine & Extrait de Réglisse", budget: "The Ordinary Alpha Arbutin 2% + HA", institut: "Dermeden LUMIXDERM – Crème Éclaircissante + Concentré Anti-Taches TXA 5%", institutBio: "Oxalia Sérum Éclat Absolu (concentré éclat & anti-taches)" } },
  { id: "barriere", label: "Barrière cutanée fragilisée", actifs: ["Céramides", "Cholestérol", "Panthénol", "Centella asiatica"],
    produits: { coreen: "SKIN1004 Centella Probio-Cica Enrich Cream", parapharmacie: "La Roche-Posay Cicaplast Baume B5", bio: "Aroma-Zone Beurre de Karité Brut BIO", budget: "CeraVe Crème Hydratante Visage", institut: "Genosys Microbiome Energy Infusing Mist", institutBio: "Oxalia Crème Tentation Fondante (peaux fragiles à normales)" } },
  { id: "cou_decollete", label: "Relâchement du cou / décolleté", actifs: ["Peptides", "Collagène", "DMAE", "Rétinol doux"],
    produits: { coreen: "Missha Time Revolution Night Repair Ampoule", parapharmacie: "Vichy Liftactiv Collagen Specialist", bio: "Aroma-Zone Crème Riche Collagène & Spilanthes", budget: "The Ordinary Buffet (complexe peptides)", institut: "Genosys ND Cell – Anti-Wrinkle Serum cou & décolleté", institutBio: "Oxalia Gamme Expert Pro-Âge – Soin de Jour Pro-Âge" } },
  { id: "acne_hormonale", label: "Acné hormonale adulte (menton, mâchoire, cycle)", actifs: ["Acide azélaïque", "Niacinamide", "Zinc", "Acide salicylique"],
    produits: { coreen: "Anua Azelaic Acid 10 Hyaluron Redness Soothing Serum", parapharmacie: "La Roche-Posay Effaclar Duo(+)", bio: "Aroma-Zone Sérum Concentré Acide Azélaïque 10%", budget: "The Ordinary Azelaic Acid Suspension 10%", institut: "Genosys PCC – Problem Control Cream", institutBio: "Oxalia Crème Fluide Épure (soin matifiant)" } },
  { id: "ovale_visage", label: "Perte de définition de l'ovale du visage", actifs: ["Peptides fermeté", "Collagène", "DMAE", "Massage liftant"],
    produits: { coreen: "Missha Time Revolution Night Repair Ampoule", parapharmacie: "Vichy Liftactiv Collagen Specialist", bio: "Aroma-Zone Crème Riche Collagène & Spilanthes", budget: "The Ordinary Buffet (complexe peptides)", institut: "Genosys MFC – Multi Functional Anti Wrinkle Cream", institutBio: "Oxalia L'Onctueux – Masque Visage Anti-Âge Régénérant (effet tenseur, redessine les contours)" } },
  { id: "exces_sebum", label: "Excès de sébum, brillance", actifs: ["Niacinamide", "Argile", "Zinc", "Acide salicylique"],
    produits: { coreen: "Some By Mi AHA BHA PHA 30 Days Miracle Serum", parapharmacie: "Vichy Normaderm Sérum", bio: "Aroma-Zone Argile Verte Surfine", budget: "The Ordinary Niacinamide 10% + Zinc 1%", institut: "Dermeden Hydra Protocole – Crème Légère Matifiante", institutBio: "Oxalia Crème Fluide Épure (soin matifiant)" } },
];

const ANTECEDENTS = [
  { id: "grossesse", label: "Grossesse / allaitement", warn: "Éviter rétinoïdes de synthèse, acide salicylique à haute dose et huiles essentielles concentrées. Privilégier bakuchiol et actifs doux." },
  { id: "traitement", label: "Traitement dermatologique en cours", warn: "Éviter exfoliation et actifs forts sans avis médical préalable." },
  { id: "isotretinoine", label: "Isotrétinoïne orale (Roaccutane) ou rétinoïdes prescrits", warn: "Contre-indication formelle : peeling, laser, microneedling, épilation à la cire, pendant et plusieurs mois après le traitement. Hydrater et protéger du soleil, baume lèvres indispensable." },
  { id: "peeling", label: "Peeling ou injections récentes (- de 1 mois)", warn: "Attendre la cicatrisation complète avant tout soin actif ou exfoliant." },
  { id: "herpes", label: "Herpès récidivant", warn: "Vigilance particulière sur la zone périorale, éviter la sur-stimulation de cette zone." },
  { id: "lesion", label: "Peau lésée / infection active", warn: "Reporter le soin jusqu'à cicatrisation complète." },
  { id: "menopause", label: "Ménopause", warn: "Privilégier des actifs redensifiants (collagène, DMAE, phytoestrogènes) et un accompagnement bienveillant de ce changement hormonal." },
  { id: "rosacee", label: "Rosacée diagnostiquée", warn: "Aucun soin en poussée active. Coordination avec le dermatologue essentielle ; formules sans parfum ni alcool exclusivement." },
  { id: "dermatite", label: "Dermatite séborrhéique diagnostiquée", warn: "Éviter textures grasses/occlusives sur les zones concernées (ailes du nez, sourcils) et tout gommage mécanique sur les plaques actives." },
  { id: "tabac", label: "Fumeuse / fumeur régulier", warn: "Renforcer les antioxydants (vitamine C, E) et le SPF : l'effet cumulatif tabac + UV accélère nettement le vieillissement cutané." },
  { id: "cancer_peau", label: "Antécédent de cancer de la peau (mélanome ou autre)", warn: "Surveillance dermatologique renforcée et vigilance solaire absolue. Éviter les exfoliations profondes et les actifs forts sans avis médical préalable." },
  { id: "anticoagulant", label: "Traitement anticoagulant", warn: "Contre-indique les techniques invasives (microneedling, certains peelings) : risque d'hématome accru. À signaler systématiquement avant tout soin." },
  { id: "photosensibilisant", label: "Traitement photosensibilisant en cours (certains antibiotiques, rétinoïdes topiques...)", warn: "Vigilance solaire impérative pendant le traitement. Éviter exfoliation et exposition UV, même faible." },
];

const STEP_IDS = ["intro", "profil", "phototype", "preoccupations", "habitudes", "routine", "antecedents", "objectifs", "resultat"];

function Hibiscus({ active, done, size = 26 }) {
  const stroke = done ? C.gold : active ? C.orange : "#D9CFBB";
  const sw = done || active ? 2.6 : 1.7;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <g stroke={stroke} strokeWidth={sw} strokeLinecap="round">
        <path d="M50 46 C38 30 38 12 50 4 C62 12 62 30 50 46 Z" />
        <path d="M50 46 C34 42 20 30 18 16 C34 14 48 22 54 36 Z" />
        <path d="M50 46 C66 42 80 30 82 16 C66 14 52 22 46 36 Z" />
        <path d="M50 46 C40 58 26 66 12 64 C16 50 28 40 44 40 Z" />
        <path d="M50 46 C60 58 74 66 88 64 C84 50 72 40 56 40 Z" />
      </g>
      {done && <circle cx="50" cy="44" r="3.4" fill={C.gold} />}
    </svg>
  );
}

function Choice({ selected, onClick, children, multi = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-left px-4 py-3 rounded-lg border transition-colors w-full sm:w-auto"
      style={{
        borderColor: selected ? C.gold : "#E1D6BE",
        backgroundColor: selected ? C.cream : "white",
        color: C.text,
        fontSize: "0.95rem",
      }}
    >
      <span className="inline-flex items-center gap-2">
        <span
          className="inline-flex items-center justify-center shrink-0"
          style={{
            width: 16,
            height: 16,
            borderRadius: multi ? 4 : 999,
            border: `1.5px solid ${selected ? C.gold : "#C9BC9E"}`,
            backgroundColor: selected ? C.gold : "transparent",
          }}
        >
          {selected && (
            <span style={{ color: "white", fontSize: 10, lineHeight: 1 }}>✓</span>
          )}
        </span>
        {children}
      </span>
    </button>
  );
}

function ProductLine({ label, value, color = C.orange }) {
  if (!value) return null;
  return (
    <p className="text-xs leading-snug">
      <span className="font-semibold" style={{ color }}>{label} — </span>
      <span style={{ color: "#54524C" }}>{value}</span>
    </p>
  );
}

function SectionLabel({ eyebrow, title }) {
  return (
    <div className="mb-6">
      <p
        className="uppercase tracking-widest text-xs font-semibold mb-2"
        style={{ color: C.orange, letterSpacing: "0.18em" }}
      >
        {eyebrow}
      </p>
      <h2
        style={{ fontFamily: "Georgia, 'Times New Roman', serif", color: C.green }}
        className="text-2xl sm:text-3xl"
      >
        {title}
      </h2>
    </div>
  );
}

function NavButtons({ onBack, onNext, backLabel = "Retour", nextLabel = "Continuer", nextDisabled }) {
  return (
    <div className="flex items-center justify-between mt-10 print:hidden">
      <button
        onClick={onBack}
        className="text-sm px-4 py-2 rounded-md"
        style={{ color: C.green, opacity: onBack ? 1 : 0, pointerEvents: onBack ? "auto" : "none" }}
      >
        ← {backLabel}
      </button>
      <button
        onClick={onNext}
        disabled={nextDisabled}
        className="text-sm px-6 py-2.5 rounded-md text-white transition-opacity"
        style={{ backgroundColor: nextDisabled ? "#C9BC9E" : C.greenSoft, opacity: nextDisabled ? 0.6 : 1 }}
      >
        {nextLabel} →
      </button>
    </div>
  );
}

export default function SkinDiagnostic() {
  const [step, setStep] = useState(0);
  const [copied, setCopied] = useState(false);
  const [showAlt, setShowAlt] = useState(false);
  const [consent, setConsent] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [sendError, setSendError] = useState(false);
  const [a, setA] = useState({
    prenom: "",
    email: "",
    age: "",
    skinTypes: [],
    peauMasculine: "",
    phototype: "",
    concerns: [],
    soleil: "",
    protection: "",
    tabac: "",
    sommeil: "",
    stress: "",
    alimentation: "",
    contraception: "",
    nettoyage: "",
    routineEtapes: [],
    marquesActuelles: "",
    actifsForts: "",
    actifsIntolerance: "",
    antecedents: [],
    allergiesDetail: "",
    objectifs: "",
  });

  const set = (k, v) => setA((prev) => ({ ...prev, [k]: v }));
  const toggle = (k, id) =>
    setA((prev) => ({
      ...prev,
      [k]: prev[k].includes(id) ? prev[k].filter((x) => x !== id) : [...prev[k], id],
    }));

  const next = () => setStep((s) => Math.min(s + 1, STEP_IDS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const selectedConcerns = CONCERNS.filter((c) => a.concerns.includes(c.id));
  const selectedSkinTypes = SKIN_TYPES.filter((t) => a.skinTypes.includes(t.id));
  const activeAntecedents = ANTECEDENTS.filter((x) => a.antecedents.includes(x.id));

  const recommendedSoins = computeRecommendedSoins(a.concerns);
  const showBienEtre = a.stress === "Élevé" || a.sommeil === "Moins de 6h";

  const lifestyleFlags = [];
  if (!a.routineEtapes.includes("Soin solaire (SPF)")) {
    lifestyleFlags.push("Aucune protection solaire quotidienne dans la routine actuelle : c'est le geste anti-âge et anti-taches le plus efficace, à intégrer même les jours sans soleil direct.");
  }
  if (a.soleil === "Fréquente" && a.protection === "Non") {
    lifestyleFlags.push("Exposition solaire fréquente sans protection : un SPF quotidien est indispensable pour limiter taches et vieillissement prématuré.");
  }
  if (a.tabac === "Oui") {
    lifestyleFlags.push("Tabac : renforcer les antioxydants (vitamine C, vitamine E) pour contrer le stress oxydatif supplémentaire.");
  }
  if (a.sommeil === "Moins de 6h" || a.stress === "Élevé") {
    lifestyleFlags.push("Sommeil court ou stress élevé : la peau régénère moins bien la nuit, des actifs apaisants et une routine du soir simplifiée sont recommandés.");
  }

  const progress = Math.round(((step) / (STEP_IDS.length - 1)) * 100);

  function buildSummaryText() {
    const lines = [];
    lines.push(`DIAGNOSTIC DE PEAU${a.prenom ? " — " + a.prenom : ""}`);
    if (a.email) lines.push(a.email);
    lines.push("Institut Morgane César\n");
    lines.push(`Profil de peau : ${selectedSkinTypes.map((t) => t.label).join(", ") || "—"}${a.peauMasculine === "Oui" ? " (peau masculine)" : ""}`);
    if (a.age) lines.push(`Âge : ${a.age}`);
    if (a.phototype) lines.push(`Phototype : ${a.phototype}`);
    if (a.actifsForts === "Oui") lines.push(`Utilise déjà rétinol / exfoliant AHA-BHA : à prendre en compte pour éviter les redondances.`);
    if (a.actifsIntolerance) lines.push(`Réaction déjà connue à : ${a.actifsIntolerance}`);
    if (a.routineEtapes.length) lines.push(`Routine actuelle : ${a.routineEtapes.join(", ")}`);
    if (a.marquesActuelles) lines.push(`Marques utilisées actuellement : ${a.marquesActuelles}`);
    lines.push("");
    if (selectedConcerns.length) {
      lines.push("PRÉOCCUPATIONS & PROTOCOLE PRODUITS");
      selectedConcerns.forEach((c) => {
        lines.push(`- ${c.label}`);
        lines.push(`  Actifs : ${c.actifs.join(", ")}`);
        if (c.produits) {
          lines.push(`  Coréen : ${c.produits.coreen}`);
          lines.push(`  Parapharmacie : ${c.produits.parapharmacie}`);
          lines.push(`  Bio : ${c.produits.bio}`);
          lines.push(`  Petit budget : ${c.produits.budget}`);
          if (c.produits.institut) lines.push(`  Protocole institut K-beauty/dermato : ${c.produits.institut}`);
          if (c.produits.institutBio) lines.push(`  Protocole institut bio : ${c.produits.institutBio}`);
        }
      });
      lines.push("");
    }
    if (recommendedSoins.length) {
      lines.push("SOIN INSTITUT RECOMMANDÉ");
      recommendedSoins.forEach((s) => {
        lines.push(`- ${s.name} (${s.tagline})`);
        if (s.produits) {
          lines.push(`  Coréen : ${s.produits.coreen}`);
          lines.push(`  Parapharmacie : ${s.produits.parapharmacie}`);
          lines.push(`  Bio : ${s.produits.bio}`);
          lines.push(`  Petit budget : ${s.produits.budget}`);
          lines.push(`  Protocole institut K-beauty/dermato : ${s.produits.institut}`);
          lines.push(`  Protocole institut bio : ${s.produits.institutBio}`);
        }
      });
      lines.push("");
    }
    lines.push("AUTRES FORMATS DISPONIBLES");
    OTHER_SOINS.forEach((s) => {
      lines.push(`- ${s.name} (${s.duree}) — ${s.description}`);
      if (s.produits) {
        lines.push(`  Coréen : ${s.produits.coreen}`);
        lines.push(`  Parapharmacie : ${s.produits.parapharmacie}`);
        lines.push(`  Bio : ${s.produits.bio}`);
        lines.push(`  Petit budget : ${s.produits.budget}`);
        lines.push(`  Protocole institut K-beauty/dermato : ${s.produits.institut}`);
        lines.push(`  Protocole institut bio : ${s.produits.institutBio}`);
      }
      if (s.note) lines.push(`  ${s.note}`);
    });
    lines.push("");
    if (showBienEtre) {
      lines.push("Le stress et le manque de sommeil ont un effet réel sur la peau : un accompagnement bien-être est aussi proposé à l'institut.");
      lines.push("");
    }
    if (activeAntecedents.length || a.allergiesDetail || lifestyleFlags.length) {
      lines.push("POINTS DE VIGILANCE");
      activeAntecedents.forEach((x) => lines.push(`- ${x.label} : ${x.warn}`));
      if (a.allergiesDetail) lines.push(`- Allergie signalée : ${a.allergiesDetail}`);
      lifestyleFlags.forEach((f) => lines.push(`- ${f}`));
      lines.push("");
    }
    if (a.objectifs) lines.push(`Attentes exprimées : « ${a.objectifs} »`);
    return lines.join("\n");
  }

  function handleCopy() {
    const text = buildSummaryText();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(() => {
        setCopied(false);
      });
    }
  }

  function buildSummaryHTML() {
    const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const concernsHTML = selectedConcerns.map((c) => `
      <div style="border:1px solid #EFE6D2;border-radius:10px;padding:14px 16px;margin-bottom:12px;">
        <p style="font-weight:600;margin:0 0 6px;color:#2B2B2B;">${esc(c.label)}</p>
        <p style="margin:0 0 8px;font-size:13px;color:#54524C;">Actifs : ${esc(c.actifs.join(", "))}</p>
        ${c.produits ? `
        <div style="border-top:1px dashed #E7DCC3;padding-top:8px;font-size:13px;color:#54524C;">
          <p style="margin:2px 0;"><b style="color:#C97B3D;">Coréen</b> — ${esc(c.produits.coreen)}</p>
          <p style="margin:2px 0;"><b style="color:#C97B3D;">Parapharmacie</b> — ${esc(c.produits.parapharmacie)}</p>
          <p style="margin:2px 0;"><b style="color:#C97B3D;">Bio</b> — ${esc(c.produits.bio)}</p>
          <p style="margin:2px 0;"><b style="color:#C97B3D;">Petit budget</b> — ${esc(c.produits.budget)}</p>
        </div>
        ${c.produits.institut ? `<div style="border-top:1px dashed #E7DCC3;margin-top:6px;padding-top:6px;font-size:13px;"><b style="color:#B8894A;">Protocole institut K-beauty/dermato</b> — ${esc(c.produits.institut)}${c.produits.institutBio ? `<br/><b style="color:#B8894A;">Protocole institut bio</b> — ${esc(c.produits.institutBio)}` : ""}</div>` : ""}` : ""}
      </div>`).join("");

    const soinProduitsHTML = (produits) => produits ? `
      <div style="border-top:1px dashed #E7DCC3;margin-top:8px;padding-top:8px;font-size:13px;">
        <p style="margin:2px 0;"><b style="color:#C97B3D;">Coréen</b> — ${esc(produits.coreen)}</p>
        <p style="margin:2px 0;"><b style="color:#C97B3D;">Parapharmacie</b> — ${esc(produits.parapharmacie)}</p>
        <p style="margin:2px 0;"><b style="color:#C97B3D;">Bio</b> — ${esc(produits.bio)}</p>
        <p style="margin:2px 0;"><b style="color:#C97B3D;">Petit budget</b> — ${esc(produits.budget)}</p>
        <p style="margin:2px 0;"><b style="color:#B8894A;">Protocole institut K-beauty/dermato</b> — ${esc(produits.institut)}</p>
        <p style="margin:2px 0;"><b style="color:#B8894A;">Protocole institut bio</b> — ${esc(produits.institutBio)}</p>
      </div>` : "";

    const soinHTML = recommendedSoins.length ? `
      <div style="background:#F3EAD8;border:1px solid #DEC89A;color:#2B2B2B;border-radius:10px;padding:16px 18px;margin-bottom:20px;">
        <p style="text-transform:uppercase;font-size:12px;letter-spacing:0.08em;font-weight:600;color:#A8791F;margin:0 0 8px;">Le soin qui vous correspond à l'institut</p>
        ${recommendedSoins.map((s) => `<div style="margin-bottom:10px;"><p style="margin:0;font-size:17px;">${esc(s.name)} <span style="font-size:13px;opacity:0.8;">— ${esc(s.tagline)}</span></p>${soinProduitsHTML(s.produits)}</div>`).join("")}
      </div>` : "";

    const bienEtreHTML = showBienEtre ? `
      <div style="background:#F3EAD8;border:1px solid #C9A22755;border-radius:10px;padding:14px 16px;margin-bottom:20px;font-size:13px;color:#54524C;">
        Le stress et le manque de sommeil ont un effet réel sur la peau. Un accompagnement bien-être est aussi proposé à l'institut.
      </div>` : "";

    const otherSoinsHTML = `
      <div style="background:white;border:1px solid #EFE6D2;border-radius:10px;padding:14px 16px;margin-bottom:20px;font-size:13px;color:#54524C;">
        <p style="text-transform:uppercase;font-size:12px;letter-spacing:0.08em;font-weight:600;color:#B8894A;margin:0 0 8px;">Autres formats disponibles</p>
        ${OTHER_SOINS.map((s) => `<div style="margin-bottom:10px;"><p style="margin:2px 0;"><b style="color:#2B2B2B;">${esc(s.name)}</b> (${esc(s.duree)}) — ${esc(s.description)}</p>${soinProduitsHTML(s.produits)}${s.note ? `<p style="margin:4px 0 0;font-style:italic;color:#A69C82;">${esc(s.note)}</p>` : ""}</div>`).join("")}
      </div>`;

    const warnHTML = (activeAntecedents.length || a.allergiesDetail || lifestyleFlags.length) ? `
      <p style="text-transform:uppercase;font-size:12px;letter-spacing:0.08em;font-weight:600;color:#9A4B32;margin:24px 0 10px;">Points de vigilance</p>
      ${activeAntecedents.map((x) => `<div style="background:#FBEEE8;color:#9A4B32;padding:10px 14px;border-radius:8px;margin-bottom:8px;font-size:13px;"><b>${esc(x.label)}</b> — ${esc(x.warn)}</div>`).join("")}
      ${a.allergiesDetail ? `<div style="background:#FBEEE8;color:#9A4B32;padding:10px 14px;border-radius:8px;margin-bottom:8px;font-size:13px;"><b>Allergie signalée</b> — ${esc(a.allergiesDetail)}</div>` : ""}
      ${lifestyleFlags.map((f) => `<div style="background:#FBEEE8;color:#9A4B32;padding:10px 14px;border-radius:8px;margin-bottom:8px;font-size:13px;">${esc(f)}</div>`).join("")}
    ` : "";

    return `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"/>
<title>Diagnostic de peau${a.prenom ? " - " + esc(a.prenom) : ""}</title>
<style>body{font-family:Georgia,'Times New Roman',serif;background:#FBF6EC;color:#2B2B2B;padding:32px;max-width:640px;margin:0 auto;}
h1{font-size:22px;color:#1B3B2E;margin-bottom:2px;}
.sub{color:#8A8577;font-family:Arial,sans-serif;font-size:13px;margin-bottom:24px;}
.profile{background:#F3EAD8;border-radius:10px;padding:16px 18px;margin-bottom:20px;font-family:Arial,sans-serif;}
.label{text-transform:uppercase;font-size:12px;letter-spacing:0.08em;font-weight:600;color:#1B3B2E;margin:0 0 8px;font-family:Arial,sans-serif;}
p{font-family:Arial,sans-serif;}
footer{margin-top:28px;background:#2F5D4C;color:#FBF6EC;padding:14px 18px;border-radius:8px;font-size:12px;text-align:center;font-family:Arial,sans-serif;}
</style></head><body>
<h1>${a.prenom ? "Diagnostic de " + esc(a.prenom) : "Diagnostic de peau"}</h1>
<p class="sub">${a.email ? esc(a.email) + " · " : ""}Institut Morgane César</p>
<div class="profile">
  <p class="label">Profil de peau</p>
  <p style="margin:0;font-family:Georgia,serif;font-size:17px;">Peau ${esc(selectedSkinTypes.map((t) => t.label.toLowerCase()).join(" & ") || "—")}${a.peauMasculine === "Oui" ? " (masculine)" : ""}</p>
  ${a.phototype ? `<p style="margin:6px 0 0;font-size:13px;color:#54524C;">Phototype : ${esc(a.phototype)}</p>` : ""}
  ${a.age ? `<p style="margin:6px 0 0;font-size:13px;color:#54524C;">Âge : ${esc(a.age)}</p>` : ""}
  ${a.peauMasculine === "Oui" ? `<p style="margin:6px 0 0;font-size:13px;color:#54524C;">Peau masculine : épiderme plus épais, textures plus riches tolérées, ne pas négliger l'hydratation ni le soin post-rasage.</p>` : ""}
  ${a.actifsForts === "Oui" ? `<p style="margin:6px 0 0;font-size:13px;color:#54524C;">Utilise déjà rétinol / exfoliant AHA-BHA : à prendre en compte pour éviter les redondances.</p>` : ""}
  ${a.actifsIntolerance ? `<p style="margin:6px 0 0;font-size:13px;color:#54524C;">Réaction déjà connue à : ${esc(a.actifsIntolerance)}</p>` : ""}
</div>
${(a.routineEtapes.length || a.marquesActuelles) ? `
<div class="profile" style="background:white;border:1px solid #EFE6D2;">
  <p class="label">Routine actuelle</p>
  ${a.routineEtapes.length ? `<p style="margin:0;font-size:14px;color:#54524C;">${esc(a.routineEtapes.join(", "))}</p>` : ""}
  ${a.marquesActuelles ? `<p style="margin:4px 0 0;font-size:14px;color:#54524C;">Marques : ${esc(a.marquesActuelles)}</p>` : ""}
</div>` : ""}
${selectedConcerns.length ? `<p class="label">Préoccupations, actifs & protocole produits</p>${concernsHTML}` : ""}
${soinHTML}
${bienEtreHTML}
${otherSoinsHTML}
${warnHTML}
${a.objectifs ? `<p class="label" style="margin-top:20px;">Attentes exprimées</p><p style="font-style:italic;color:#54524C;">« ${esc(a.objectifs)} »</p>` : ""}
<footer>Morgane César · Esthétique · Hypnose · Bien-être · 06 81 70 98 18<br/><span style="opacity:0.7;font-size:10px;">© 2026 Institut Morgane César – Tous droits réservés. Reproduction interdite sans autorisation.</span></footer>
</body></html>`;
  }

  function handleDownload() {
    const html = buildSummaryHTML();
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const safeName = (a.prenom || "diagnostic").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-");
    link.href = url;
    link.download = `diagnostic-peau-${safeName}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Le corps du mailto doit rester court : un texte trop long (avec tout le détail
  // du diagnostic) fait échouer silencieusement l'ouverture du client mail sur
  // certains systèmes, sans aucun message d'erreur. On télécharge donc la fiche
  // complète en HTML au même moment, à joindre manuellement au message.
  // mailto: dépend de l'application mail par défaut du système, qui s'avère peu fiable
  // (aucune configurée, mal configurée, bugs d'appli...). On ouvre directement Gmail
  // dans le navigateur à la place : ça marche sur tout appareil, sans réglage système.
  // Envoi vers l'institut. Le formulaire caché déclaré dans index.html permet à Netlify
  // de recevoir ce POST et d'envoyer un email à chaque diagnostic terminé.
  // Seuls le prénom, l'email et le soin recommandé partent. Jamais les antécédents,
  // qui sont des données de santé et restent sur l'appareil de la cliente.
  async function handleSendToInstitut() {
    setSending(true);
    setSendError(false);
    const data = {
      "form-name": "diagnostic",
      prenom: a.prenom || "Non renseigné",
      email: a.email,
      soin: recommendedSoins.length
        ? recommendedSoins.map((s) => s.name).join(", ")
        : "Aucune préoccupation cochée (orientation Parenthèse Plaisir)",
      consentement: "Oui, le " + new Date().toLocaleDateString("fr-FR"),
    };
    try {
      const res = await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(data).toString(),
      });
      if (!res.ok) throw new Error("envoi refusé");
      setSent(true);
    } catch (err) {
      setSendError(true);
    }
    setSending(false);
  }

  function handleEmail() {
    handleDownload();
    const subject = encodeURIComponent("Mon diagnostic de peau — Institut Morgane César");
    const shortBody = [
      `Bonjour${a.prenom ? " " + a.prenom : ""},`,
      "",
      "Voici mon diagnostic de peau réalisé sur l'outil de l'institut.",
      "La fiche complète vient d'être téléchargée sur cet appareil : merci de la joindre à cet email avant de l'envoyer.",
      "",
      recommendedSoins.length ? `Soin recommandé : ${recommendedSoins.map((s) => s.name).join(" / ")}` : "",
    ].filter(Boolean).join("\n");
    const body = encodeURIComponent(shortBody);
    const to = encodeURIComponent(a.email || "");
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${to}&su=${subject}&body=${body}`;
    window.open(gmailUrl, "_blank");
  }


  return (
    <div
      className="min-h-screen w-full flex items-start justify-center py-8 px-4 sm:py-14"
      style={{ backgroundColor: C.ivory, color: C.text, fontFamily: "'Helvetica Neue', Arial, sans-serif" }}
    >
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 print:hidden">
          <div>
            <p style={{ fontFamily: "Georgia, serif", color: C.green }} className="text-lg leading-tight">
              L'Institut <span style={{ color: C.orange, fontStyle: "italic" }}>Morgane César</span>
            </p>
            <p className="tracking-widest" style={{ color: C.green, letterSpacing: "0.15em", fontSize: "11px" }}>
              ESTHÉTIQUE · HYPNOSE · BIEN-ÊTRE
            </p>
          </div>
        </div>

        {/* Botanical progress trail */}
        {step > 0 && step < STEP_IDS.length - 1 && (
          <div className="mb-10 print:hidden">
            <div className="flex items-center justify-between">
              {STEP_IDS.slice(1, -1).map((id, i) => (
                <Hibiscus key={id} size={22} active={i === step - 1} done={i < step - 1} />
              ))}
            </div>
            <div className="mt-1 rounded-full" style={{ backgroundColor: "#E7DCC3", height: "2px" }}>
              <div
                className="rounded-full transition-all duration-500"
                style={{ width: `${progress}%`, backgroundColor: C.gold, height: "2px" }}
              />
            </div>
          </div>
        )}

        {/* Card */}
        <div
          className="rounded-2xl px-6 py-8 sm:px-10 sm:py-10"
          style={{ backgroundColor: "white", border: "1px solid #EFE6D2", boxShadow: "0 1px 3px rgba(27,59,46,0.06)" }}
        >
          {/* STEP 0 — Intro */}
          {step === 0 && (
            <div className="text-center py-6">
              <div className="flex justify-center mb-6">
                <Hibiscus done size={52} />
              </div>
              <p className="uppercase tracking-widest text-xs font-semibold mb-3" style={{ color: C.orange, letterSpacing: "0.18em" }}>
                Diagnostic personnalisé
              </p>
              <h1 style={{ fontFamily: "Georgia, serif", color: C.green }} className="text-3xl sm:text-4xl mb-4">
                Faisons connaissance avec votre peau
              </h1>
              <p className="max-w-md mx-auto mb-8" style={{ color: "#54524C" }}>
                Quelques questions pour comprendre votre peau, votre mode de vie et vos attentes,
                et vous proposer les actifs les plus adaptés — coréens, bio ou classiques.
              </p>
              <input
                type="text"
                placeholder="Votre prénom (facultatif)"
                value={a.prenom}
                onChange={(e) => set("prenom", e.target.value)}
                className="w-full max-w-xs mx-auto block px-4 py-3 rounded-lg border mb-3 text-center"
                style={{ borderColor: "#E1D6BE" }}
              />
              <input
                type="email"
                placeholder="Votre email (facultatif)"
                value={a.email}
                onChange={(e) => set("email", e.target.value)}
                className="w-full max-w-xs mx-auto block px-4 py-3 rounded-lg border mb-8 text-center"
                style={{ borderColor: "#E1D6BE" }}
              />
              <button
                onClick={next}
                className="px-8 py-3 rounded-md text-white text-sm"
                style={{ backgroundColor: C.greenSoft }}
              >
                Commencer →
              </button>
            </div>
          )}

          {/* STEP 1 — Skin type */}
          {step === 1 && (
            <div>
              <SectionLabel eyebrow="Étape 1 / 7" title="Quel est le type de votre peau ?" />
              <p className="text-sm mb-4" style={{ color: "#8A8577" }}>
                Plusieurs réponses possibles — une peau peut être à la fois mixte et sensible, par exemple.
              </p>
              <div className="flex flex-col gap-2.5">
                {SKIN_TYPES.map((t) => (
                  <Choice key={t.id} multi selected={a.skinTypes.includes(t.id)} onClick={() => toggle("skinTypes", t.id)}>
                    {t.label}
                  </Choice>
                ))}
              </div>
              <p className="text-sm font-semibold mt-6 mb-2" style={{ color: C.green }}>Peau masculine ?</p>
              <div className="flex flex-wrap gap-2">
                {["Oui", "Non"].map((v) => (
                  <Choice key={v} selected={a.peauMasculine === v} onClick={() => set("peauMasculine", v)}>{v}</Choice>
                ))}
              </div>
              <p className="text-sm font-semibold mt-6 mb-2" style={{ color: C.green }}>Tranche d'âge</p>
              <div className="flex flex-wrap gap-2">
                {AGE_RANGES.map((v) => (
                  <Choice key={v} selected={a.age === v} onClick={() => set("age", v)}>{v}</Choice>
                ))}
              </div>
              <NavButtons onBack={back} onNext={next} nextDisabled={a.skinTypes.length === 0} />
            </div>
          )}

          {/* STEP 2 — Phototype */}
          {step === 2 && (
            <div>
              <SectionLabel eyebrow="Étape 2 / 7" title="Comment réagit votre peau au soleil ?" />
              <div className="flex flex-col gap-2.5">
                {PHOTOTYPES.map((p) => (
                  <Choice key={p} selected={a.phototype === p} onClick={() => set("phototype", p)}>
                    {p}
                  </Choice>
                ))}
              </div>
              <NavButtons onBack={back} onNext={next} nextDisabled={!a.phototype} />
            </div>
          )}

          {/* STEP 3 — Concerns */}
          {step === 3 && (
            <div>
              <SectionLabel eyebrow="Étape 3 / 7" title="Quelles sont vos préoccupations principales ?" />
              <p className="text-sm mb-4" style={{ color: "#8A8577" }}>Plusieurs réponses possibles.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {CONCERNS.map((c) => (
                  <Choice key={c.id} multi selected={a.concerns.includes(c.id)} onClick={() => toggle("concerns", c.id)}>
                    {c.label}
                  </Choice>
                ))}
              </div>
              <NavButtons onBack={back} onNext={next} nextDisabled={a.concerns.length === 0} />
            </div>
          )}

          {/* STEP 4 — Habitudes */}
          {step === 4 && (
            <div>
              <SectionLabel eyebrow="Étape 4 / 7" title="Vos habitudes de vie" />
              <div className="space-y-5">
                <div>
                  <p className="text-sm font-semibold mb-2" style={{ color: C.green }}>Exposition au soleil</p>
                  <div className="flex flex-wrap gap-2">
                    {["Rare", "Modérée", "Fréquente"].map((v) => (
                      <Choice key={v} selected={a.soleil === v} onClick={() => set("soleil", v)}>{v}</Choice>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold mb-2" style={{ color: C.green }}>Protection solaire quotidienne</p>
                  <div className="flex flex-wrap gap-2">
                    {["Oui", "Non"].map((v) => (
                      <Choice key={v} selected={a.protection === v} onClick={() => set("protection", v)}>{v}</Choice>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold mb-2" style={{ color: C.green }}>Tabac</p>
                  <div className="flex flex-wrap gap-2">
                    {["Oui", "Non"].map((v) => (
                      <Choice key={v} selected={a.tabac === v} onClick={() => set("tabac", v)}>{v}</Choice>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold mb-2" style={{ color: C.green }}>Sommeil</p>
                  <div className="flex flex-wrap gap-2">
                    {["Moins de 6h", "6 à 8h", "Plus de 8h"].map((v) => (
                      <Choice key={v} selected={a.sommeil === v} onClick={() => set("sommeil", v)}>{v}</Choice>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold mb-2" style={{ color: C.green }}>Niveau de stress perçu</p>
                  <div className="flex flex-wrap gap-2">
                    {["Faible", "Modéré", "Élevé"].map((v) => (
                      <Choice key={v} selected={a.stress === v} onClick={() => set("stress", v)}>{v}</Choice>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold mb-2" style={{ color: C.green }}>Alimentation</p>
                  <div className="flex flex-wrap gap-2">
                    {["Équilibrée", "Irrégulière", "Riche en sucre / transformé"].map((v) => (
                      <Choice key={v} selected={a.alimentation === v} onClick={() => set("alimentation", v)}>{v}</Choice>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold mb-2" style={{ color: C.green }}>Contraception hormonale (pilule, stérilet hormonal...)</p>
                  <div className="flex flex-wrap gap-2">
                    {["Oui", "Non", "Non concerné(e)"].map((v) => (
                      <Choice key={v} selected={a.contraception === v} onClick={() => set("contraception", v)}>{v}</Choice>
                    ))}
                  </div>
                </div>
              </div>
              <NavButtons onBack={back} onNext={next} />
            </div>
          )}

          {/* STEP 5 — Routine */}
          {step === 5 && (
            <div>
              <SectionLabel eyebrow="Étape 5 / 7" title="Votre routine actuelle" />
              <div className="space-y-5">
                <div>
                  <p className="text-sm font-semibold mb-2" style={{ color: C.green }}>Quelles étapes utilisez-vous déjà ?</p>
                  <p className="text-xs mb-3" style={{ color: "#8A8577" }}>Plusieurs réponses possibles.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {ROUTINE_STEPS.map((s) => (
                      <Choice key={s} multi selected={a.routineEtapes.includes(s)} onClick={() => toggle("routineEtapes", s)}>
                        {s}
                      </Choice>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold mb-2" style={{ color: C.green }}>Marques que vous utilisez actuellement (facultatif)</p>
                  <input
                    type="text"
                    value={a.marquesActuelles}
                    onChange={(e) => set("marquesActuelles", e.target.value)}
                    placeholder="Ex : La Roche-Posay, CeraVe..."
                    className="w-full px-4 py-2.5 rounded-lg border"
                    style={{ borderColor: "#E1D6BE" }}
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold mb-2" style={{ color: C.green }}>Fréquence du nettoyage du visage</p>
                  <div className="flex flex-wrap gap-2">
                    {["Matin et soir", "Soir uniquement", "Irrégulier"].map((v) => (
                      <Choice key={v} selected={a.nettoyage === v} onClick={() => set("nettoyage", v)}>{v}</Choice>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold mb-2" style={{ color: C.green }}>Utilisez-vous déjà du rétinol ou un exfoliant (AHA/BHA) ?</p>
                  <div className="flex flex-wrap gap-2">
                    {["Oui", "Non"].map((v) => (
                      <Choice key={v} selected={a.actifsForts === v} onClick={() => set("actifsForts", v)}>{v}</Choice>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold mb-2" style={{ color: C.green }}>Un actif ou produit a déjà provoqué une réaction ? (facultatif)</p>
                  <input
                    type="text"
                    value={a.actifsIntolerance}
                    onChange={(e) => set("actifsIntolerance", e.target.value)}
                    placeholder="Lequel, et quel type de réaction"
                    className="w-full px-4 py-2.5 rounded-lg border"
                    style={{ borderColor: "#E1D6BE" }}
                  />
                </div>
              </div>
              <NavButtons onBack={back} onNext={next} />
            </div>
          )}

          {/* STEP 6 — Antécédents */}
          {step === 6 && (
            <div>
              <SectionLabel eyebrow="Étape 6 / 7" title="Antécédents & contre-indications" />
              <p className="text-sm mb-4" style={{ color: "#8A8577" }}>
                Essentiel avant tout soin, quelle que soit la technique utilisée.
              </p>
              <div className="flex flex-col gap-2.5">
                {ANTECEDENTS.map((x) => (
                  <Choice key={x.id} multi selected={a.antecedents.includes(x.id)} onClick={() => toggle("antecedents", x.id)}>
                    {x.label}
                  </Choice>
                ))}
              </div>
              <div className="mt-4">
                <p className="text-sm font-semibold mb-2" style={{ color: C.green }}>Allergies cutanées connues (facultatif)</p>
                <input
                  type="text"
                  value={a.allergiesDetail}
                  onChange={(e) => set("allergiesDetail", e.target.value)}
                  placeholder="À préciser si oui"
                  className="w-full px-4 py-2.5 rounded-lg border"
                  style={{ borderColor: "#E1D6BE" }}
                />
              </div>
              <NavButtons onBack={back} onNext={next} />
            </div>
          )}

          {/* STEP 7 — Objectifs */}
          {step === 7 && (
            <div>
              <SectionLabel eyebrow="Étape 7 / 7" title="Qu'attendez-vous de ce soin ?" />
              <textarea
                value={a.objectifs}
                onChange={(e) => set("objectifs", e.target.value)}
                rows={4}
                placeholder="Décrivez vos attentes en quelques mots (facultatif)"
                className="w-full px-4 py-3 rounded-lg border"
                style={{ borderColor: "#E1D6BE" }}
              />
              <NavButtons onBack={back} onNext={next} nextLabel="Voir ma synthèse" />
            </div>
          )}

          {/* STEP 8 — Result */}
          {step === 8 && (
            <div>
              <div className="flex justify-center mb-4 print:hidden">
                <Hibiscus done size={40} />
              </div>
              <p className="uppercase tracking-widest text-xs font-semibold mb-2 text-center" style={{ color: C.orange, letterSpacing: "0.18em" }}>
                Votre synthèse
              </p>
              <h2 style={{ fontFamily: "Georgia, serif", color: C.green }} className="text-2xl sm:text-3xl text-center mb-1">
                {a.prenom ? `Diagnostic de ${a.prenom}` : "Votre diagnostic de peau"}
              </h2>
              {a.email && (
                <p className="text-center text-sm mb-8" style={{ color: "#8A8577" }}>{a.email}</p>
              )}
              {!a.email && <div className="mb-8" />}

              {/* Skin profile */}
              <div className="rounded-lg p-5 mb-5" style={{ backgroundColor: C.cream }}>
                <p className="text-xs uppercase tracking-wide font-semibold mb-1" style={{ color: C.green }}>Profil de peau</p>
                <p className="text-lg mb-2" style={{ fontFamily: "Georgia, serif", color: C.text }}>
                  Peau {selectedSkinTypes.length > 0 ? selectedSkinTypes.map((t) => t.label.toLowerCase()).join(" & ") : "—"}
                  {a.peauMasculine === "Oui" ? " (masculine)" : ""}
                </p>
                <div className="space-y-1">
                  {selectedSkinTypes.map((t) => (
                    <p key={t.id} className="text-sm" style={{ color: "#54524C" }}>
                      <span className="font-semibold" style={{ color: C.text }}>{t.label} — </span>{t.note}
                    </p>
                  ))}
                  {a.peauMasculine === "Oui" && (
                    <p className="text-sm" style={{ color: "#54524C" }}>
                      <span className="font-semibold" style={{ color: C.text }}>Peau masculine — </span>
                      Épiderme environ 20 à 25% plus épais : textures un peu plus riches tolérées, actifs concentrés bien supportés. Prévoir un soin post-rasage apaisant (centella, panthénol) et ne pas négliger l'hydratation, souvent oubliée.
                    </p>
                  )}
                </div>
                {a.phototype && <p className="text-sm mt-2" style={{ color: "#54524C" }}>Phototype : {a.phototype}</p>}
              </div>

              {(a.routineEtapes.length > 0 || a.marquesActuelles) && (
                <div className="rounded-lg p-5 mb-5" style={{ backgroundColor: "white", border: "1px solid #EFE6D2" }}>
                  <p className="text-xs uppercase tracking-wide font-semibold mb-1" style={{ color: C.green }}>Routine actuelle</p>
                  {a.routineEtapes.length > 0 && (
                    <p className="text-sm" style={{ color: "#54524C" }}>{a.routineEtapes.join(", ")}</p>
                  )}
                  {a.marquesActuelles && (
                    <p className="text-sm mt-1" style={{ color: "#54524C" }}>Marques : {a.marquesActuelles}</p>
                  )}
                </div>
              )}

              {/* Priority concerns + actives + product protocol */}
              {selectedConcerns.length > 0 && (
                <div className="mb-5">
                  <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
                    <p className="text-xs uppercase tracking-wide font-semibold" style={{ color: C.green }}>
                      Préoccupations, actifs & protocole produits
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowAlt((v) => !v)}
                      className="text-xs underline print:hidden"
                      style={{ color: C.gold }}
                    >
                      {showAlt ? "Masquer les alternatives" : "Voir les alternatives en pharmacie, bio ou petit budget"}
                    </button>
                  </div>
                  <div className="space-y-3">
                    {selectedConcerns.map((c) => (
                      <div key={c.id} className="rounded-lg p-4 border" style={{ borderColor: "#EFE6D2" }}>
                        <p className="font-semibold text-sm mb-1.5" style={{ color: C.text }}>{c.label}</p>
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {c.actifs.map((act) => (
                            <span
                              key={act}
                              className="text-xs px-2.5 py-1 rounded-full"
                              style={{ backgroundColor: C.ivory, color: C.green, border: `1px solid ${C.goldLight}55` }}
                            >
                              {act}
                            </span>
                          ))}
                        </div>
                        {c.produits && c.produits.institut && (
                          <div className="pt-2.5" style={{ borderTop: "1px dashed #E7DCC3" }}>
                            <ProductLine label="Protocole institut (K-beauty / dermato)" value={c.produits.institut} color={C.gold} />
                            <ProductLine label="Protocole institut (bio)" value={c.produits.institutBio} color={C.gold} />
                          </div>
                        )}
                        {c.produits && showAlt && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 mt-2 pt-2" style={{ borderTop: "1px dashed #E7DCC3" }}>
                            <ProductLine label="Coréen" value={c.produits.coreen} />
                            <ProductLine label="Parapharmacie" value={c.produits.parapharmacie} />
                            <ProductLine label="Bio" value={c.produits.bio} />
                            <ProductLine label="Petit budget" value={c.produits.budget} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedConcerns.length > 0 && (
                <p className="text-xs mb-5" style={{ color: "#A69C82" }}>
                  Un seul produit par catégorie et par préoccupation est proposé ici, à titre de repère. Les lignes « Protocole institut » correspondent aux produits utilisés en cabine, où le choix est affiné selon la texture et la tolérance de votre peau.
                </p>
              )}

              {/* Warnings */}
              {(activeAntecedents.length > 0 || lifestyleFlags.length > 0 || a.allergiesDetail) && (
                <div className="mb-5">
                  <p className="text-xs uppercase tracking-wide font-semibold mb-3" style={{ color: C.warn }}>
                    Points de vigilance
                  </p>
                  <div className="space-y-2">
                    {activeAntecedents.map((x) => (
                      <div key={x.id} className="rounded-lg p-3.5 text-sm" style={{ backgroundColor: "#FBEEE8", color: C.warn }}>
                        <span className="font-semibold">{x.label} — </span>{x.warn}
                      </div>
                    ))}
                    {a.allergiesDetail && (
                      <div className="rounded-lg p-3.5 text-sm" style={{ backgroundColor: "#FBEEE8", color: C.warn }}>
                        <span className="font-semibold">Allergie signalée — </span>{a.allergiesDetail}
                      </div>
                    )}
                    {lifestyleFlags.map((f, i) => (
                      <div key={i} className="rounded-lg p-3.5 text-sm" style={{ backgroundColor: "#FBEEE8", color: C.warn }}>
                        {f}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {a.objectifs && (
                <div className="mb-5">
                  <p className="text-xs uppercase tracking-wide font-semibold mb-2" style={{ color: C.green }}>Attentes exprimées</p>
                  <p className="text-sm italic" style={{ color: "#54524C" }}>« {a.objectifs} »</p>
                </div>
              )}

              {recommendedSoins.length > 0 && (
                <div className="rounded-lg p-5 mb-5" style={{ backgroundColor: C.cream, border: "1px solid #DEC89A" }}>
                  <p className="text-xs uppercase tracking-wide font-semibold mb-2" style={{ color: C.goldDeep }}>
                    Le soin qui vous correspond à l'institut
                  </p>
                  {recommendedSoins.map((s) => (
                    <div key={s.name} className="mb-4 last:mb-0">
                      <p style={{ fontFamily: "Georgia, serif", color: C.green }} className="text-lg">{s.name}</p>
                      <p className="text-sm mb-2" style={{ color: "#6B6A62" }}>{s.tagline}</p>
                      {s.produits && (
                        <div className="grid grid-cols-1 gap-y-1 pt-2" style={{ borderTop: "1px dashed #E0D3B6" }}>
                          <p className="text-xs"><span className="font-semibold" style={{ color: C.goldDeep }}>Protocole institut K-beauty/dermato — </span><span style={{ color: "#54524C" }}>{s.produits.institut}</span></p>
                          <p className="text-xs"><span className="font-semibold" style={{ color: C.goldDeep }}>Protocole institut bio — </span><span style={{ color: "#54524C" }}>{s.produits.institutBio}</span></p>
                          {showAlt && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 mt-1.5 pt-1.5" style={{ borderTop: "1px dashed #E0D3B6" }}>
                              <p className="text-xs"><span className="font-semibold" style={{ color: C.goldDeep }}>Coréen — </span><span style={{ color: "#54524C" }}>{s.produits.coreen}</span></p>
                              <p className="text-xs"><span className="font-semibold" style={{ color: C.goldDeep }}>Parapharmacie — </span><span style={{ color: "#54524C" }}>{s.produits.parapharmacie}</span></p>
                              <p className="text-xs"><span className="font-semibold" style={{ color: C.goldDeep }}>Bio — </span><span style={{ color: "#54524C" }}>{s.produits.bio}</span></p>
                              <p className="text-xs"><span className="font-semibold" style={{ color: C.goldDeep }}>Petit budget — </span><span style={{ color: "#54524C" }}>{s.produits.budget}</span></p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {recommendedSoins.length > 0 && (
                <div className="mb-5 print:hidden">
                  <a
                    href="tel:+33681709818"
                    className="flex items-center justify-center w-full px-5 py-4 rounded-lg text-white text-sm"
                    style={{ backgroundColor: C.gold, textDecoration: "none" }}
                  >
                    Prendre rendez-vous · 06 81 70 98 18
                  </a>
                  <p className="text-xs text-center mt-2" style={{ color: "#A69C82" }}>
                    Par téléphone, SMS, Messenger ou WhatsApp. Le diagnostic en cabine est offert avec votre premier soin visage.
                  </p>
                </div>
              )}

              {recommendedSoins.length === 0 && (
                <div className="rounded-lg p-5 mb-5" style={{ backgroundColor: C.cream, border: `1px solid ${C.goldLight}55` }}>
                  <p className="text-sm" style={{ color: "#54524C" }}>
                    Aucune préoccupation particulière n'a été cochée, et c'est une bonne nouvelle. La <span className="font-semibold">Parenthèse Plaisir</span> (60 min), qui s'adapte à tous les types de peau, est alors le meilleur point de départ.
                  </p>
                  <a
                    href="tel:+33681709818"
                    className="flex items-center justify-center w-full px-5 py-3 rounded-lg text-white text-sm mt-3 print:hidden"
                    style={{ backgroundColor: C.gold, textDecoration: "none" }}
                  >
                    Prendre rendez-vous · 06 81 70 98 18
                  </a>
                </div>
              )}

              {showBienEtre && (
                <div className="rounded-lg p-4 mb-5 text-sm" style={{ backgroundColor: C.cream, border: `1px solid ${C.goldLight}55`, color: "#54524C" }}>
                  Le stress et le manque de sommeil ont un effet réel et visible sur la peau. Si cela vous intéresse, l'institut propose aussi un accompagnement bien-être — n'hésitez pas à en parler en cabine.
                </div>
              )}

              <div className="rounded-lg p-4 mb-5 text-sm" style={{ backgroundColor: "white", border: "1px solid #EFE6D2", color: "#54524C" }}>
                <p className="text-xs uppercase tracking-wide font-semibold mb-2" style={{ color: C.gold }}>Autres formats disponibles</p>
                {OTHER_SOINS.map((s) => (
                  <div key={s.name} className="mb-3 last:mb-0">
                    <p className="text-sm mb-1">
                      <span className="font-semibold" style={{ color: C.text }}>{s.name}</span> ({s.duree}) — {s.description}
                    </p>
                    {s.produits && (
                      <div className="grid grid-cols-1 gap-y-1 pt-1.5 pl-0.5" style={{ borderTop: "1px dashed #E7DCC3" }}>
                        <ProductLine label="Protocole institut K-beauty/dermato" value={s.produits.institut} color={C.gold} />
                        <ProductLine label="Protocole institut bio" value={s.produits.institutBio} color={C.gold} />
                        {showAlt && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 mt-1 pt-1" style={{ borderTop: "1px dashed #E7DCC3" }}>
                            <ProductLine label="Coréen" value={s.produits.coreen} />
                            <ProductLine label="Parapharmacie" value={s.produits.parapharmacie} />
                            <ProductLine label="Bio" value={s.produits.bio} />
                            <ProductLine label="Petit budget" value={s.produits.budget} />
                          </div>
                        )}
                      </div>
                    )}
                    {s.note && <p className="text-xs italic" style={{ color: "#A69C82" }}>{s.note}</p>}
                  </div>
                ))}
              </div>

              <div className="rounded-lg p-4 mb-8 text-sm" style={{ backgroundColor: C.ivory, border: `1px solid ${C.goldLight}55`, color: "#54524C" }}>
                Ces actifs peuvent s'intégrer aussi bien dans un protocole coréen, bio ou classique — le choix de l'approche se fait avec votre esthéticienne selon vos préférences.
              </div>

              {/* Le seul endroit où les coordonnées de la cliente parviennent jusqu'à l'institut. */}
              <div className="rounded-lg p-5 mb-4 print:hidden" style={{ backgroundColor: C.ivory, border: `1px solid ${C.goldLight}55` }}>
                <p className="text-xs uppercase tracking-wide font-semibold mb-2" style={{ color: C.gold }}>
                  En parler avec Morgane
                </p>
                {sent ? (
                  <p className="text-sm" style={{ color: C.green }}>
                    C'est envoyé{a.prenom ? ", " + a.prenom : ""}. Je vous recontacte rapidement. À très vite.
                  </p>
                ) : (
                  <>
                    <p className="text-sm mb-3" style={{ color: "#54524C" }}>
                      Je peux recevoir votre prénom, votre email et le soin recommandé, pour vous répondre ou vous proposer un rendez-vous. Vos antécédents et vos réponses détaillées ne sont pas transmis : ils restent sur votre appareil.
                    </p>
                    <input
                      type="email"
                      placeholder="Votre email"
                      value={a.email}
                      onChange={(e) => set("email", e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border mb-3"
                      style={{ borderColor: "#E1D6BE" }}
                    />
                    <label className="flex items-start gap-2 text-xs mb-3 cursor-pointer" style={{ color: "#54524C" }}>
                      <input
                        type="checkbox"
                        checked={consent}
                        onChange={(e) => setConsent(e.target.checked)}
                        style={{ marginTop: 3 }}
                      />
                      <span>
                        J'accepte que l'Institut Morgane César conserve mon prénom, mon email et le soin recommandé pour me recontacter. Je peux demander leur suppression à tout moment au 06 81 70 98 18.
                      </span>
                    </label>
                    <button
                      onClick={handleSendToInstitut}
                      disabled={!consent || !a.email || sending}
                      className="w-full px-5 py-3 rounded-md text-white text-sm"
                      style={{ backgroundColor: !consent || !a.email ? "#C9BC9E" : C.greenSoft }}
                    >
                      {sending ? "Envoi en cours..." : "Envoyer mon diagnostic à Morgane"}
                    </button>
                    {sendError && (
                      <p className="text-xs mt-2" style={{ color: C.warn }}>
                        L'envoi n'a pas fonctionné. Vous pouvez appeler ou envoyer un SMS au 06 81 70 98 18.
                      </p>
                    )}
                  </>
                )}
              </div>

              <button
                onClick={handleEmail}
                className="w-full px-5 py-3 rounded-md text-sm mb-3 border print:hidden"
                style={{ borderColor: C.gold, color: C.gold }}
              >
                {a.email ? `M'envoyer la fiche par Gmail (${a.email})` : "M'envoyer la fiche par Gmail"}
              </button>

              <div className="flex flex-col sm:flex-row gap-3 print:hidden">
                <button
                  onClick={handleDownload}
                  className="flex-1 px-5 py-3 rounded-md text-sm border"
                  style={{ borderColor: C.gold, color: C.gold }}
                >
                  Télécharger la fiche
                </button>
                <button
                  onClick={handleCopy}
                  className="flex-1 px-5 py-3 rounded-md text-sm border"
                  style={{ borderColor: C.gold, color: C.gold }}
                >
                  {copied ? "Copié ✓" : "Copier la synthèse"}
                </button>
              </div>
              <div className="mt-3 print:hidden">
                <button
                  onClick={() => { setA({ prenom: "", email: "", age: "", skinTypes: [], peauMasculine: "", phototype: "", concerns: [], soleil: "", protection: "", tabac: "", sommeil: "", stress: "", alimentation: "", contraception: "", nettoyage: "", routineEtapes: [], marquesActuelles: "", actifsForts: "", actifsIntolerance: "", antecedents: [], allergiesDetail: "", objectifs: "" }); setStep(0); }}
                  className="w-full px-5 py-3 rounded-md text-sm border"
                  style={{ borderColor: C.greenSoft, color: C.greenSoft }}
                >
                  Nouveau diagnostic
                </button>
              </div>
              <p className="text-xs mt-3 print:hidden" style={{ color: "#A69C82" }}>
                « Envoyer par Gmail » télécharge la fiche complète puis ouvre un brouillon Gmail avec un message court — il suffit de joindre le fichier téléchargé avant d'envoyer. Si vous n'utilisez pas Gmail, utilisez « Copier la synthèse » qui fonctionne avec n'importe quelle messagerie.
              </p>
            </div>
          )}
        </div>

        <p className="text-center text-xs mt-6 print:hidden" style={{ color: "#A69C82" }}>
          Morgane César · Esthétique · Hypnose · Bien-être
        </p>
        <p className="text-center mt-1 print:hidden" style={{ color: "#C9BC9E", fontSize: "10px" }}>
          © 2026 Institut Morgane César – Tous droits réservés.
        </p>
      </div>
    </div>
  );
}
