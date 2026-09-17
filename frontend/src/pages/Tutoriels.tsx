import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { TUTORIALS_META, type TutorialMeta } from "./TutorialPage";

const CATEGORIES = [
  { id: "all", label: "Tous" },
  { id: "debutant", label: "Débutant" },
  { id: "composants", label: "Composants" },
  { id: "cablage", label: "Câblage" },
  { id: "avance", label: "Avancé" },
];

const FAQ = [
  {
    q: "Mes schémas sont-ils sauvegardés automatiquement ?",
    a: "Oui. SnailWire sauvegarde automatiquement votre travail dans le navigateur (localStorage) toutes les secondes. En cas de fermeture accidentelle, votre dernier état est restauré à la prochaine ouverture. Exportez régulièrement en JSON pour une copie de secours.",
  },
  {
    q: "Puis-je importer mes propres images de composants ?",
    a: "Absolument. Lors de la création d'un composant, importez n'importe quelle image (PNG, JPG, SVG, WEBP). Une image à fond blanc ou transparent donne un meilleur rendu dans votre schéma.",
  },
  {
    q: "Comment faire des fils à angle droit ?",
    a: "L'outil fil contraint automatiquement les angles à 45° et 90°. Si vous avez besoin d'un tracé libre, désactivez le magnétisme dans Paramètres.",
  },
  {
    q: "Puis-je partager mon schéma ?",
    a: "Oui, via l'export JSON (Fichier → Exporter). Envoyez le fichier .json à votre collaborateur qui pourra le réimporter dans son navigateur via Fichier → Importer.",
  },
  {
    q: "Comment supprimer un composant de la feuille ?",
    a: "Sélectionnez-le, puis cliquez sur l'icône poubelle dans la barre flottante au-dessus. Le composant reste dans votre bibliothèque.",
  },
  {
    q: "L'éditeur fonctionne-t-il hors ligne ?",
    a: "Une fois la page chargée, l'éditeur fonctionne entièrement hors ligne. Toutes les données restent dans votre navigateur, aucune connexion serveur n'est nécessaire.",
  },
];

function CategoryBadge({ category }: { category: TutorialMeta["category"] }) {
  const colors = {
    debutant: "bg-emerald-900/50 text-emerald-300 border-emerald-700/50",
    composants: "bg-blue-900/50 text-blue-300 border-blue-700/50",
    cablage: "bg-amber-900/50 text-amber-300 border-amber-700/50",
    avance: "bg-purple-900/50 text-purple-300 border-purple-700/50",
  };
  const labels = {
    debutant: "Débutant",
    composants: "Composants",
    cablage: "Câblage",
    avance: "Avancé",
  };
  return (
    <span className={`inline-block rounded border px-2 py-0.5 font-mono text-xs ${colors[category]}`}>
      {labels[category]}
    </span>
  );
}

function TutorialCard({ tuto }: { tuto: TutorialMeta }) {
  return (
    <Link
      to={`/tutoriels/${tuto.slug}`}
      className="group flex flex-col rounded-2xl border border-line-700 bg-ink-800/60 p-6 transition-all hover:-translate-y-1 hover:border-trace hover:shadow-[0_0_40px_-12px_var(--color-trace)] focus:outline-none focus-visible:ring-2 focus-visible:ring-trace"
    >
      <CategoryBadge category={tuto.category} />
      <h2 className="mt-4 font-display text-lg font-semibold text-paper group-hover:text-trace transition-colors leading-snug">
        {tuto.title}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-paper-muted flex-1 line-clamp-3">
        {tuto.description}
      </p>
      <span className="mt-5 inline-flex items-center gap-1 font-mono text-sm text-trace">
        Lire le tutoriel
        <span className="transition-transform group-hover:translate-x-1">→</span>
      </span>
    </Link>
  );
}

export default function Tutoriels() {
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    document.title = "Tutoriels — Apprendre SnailWire, l'éditeur de schémas électroniques";
  }, []);

  const filtered =
    activeCategory === "all"
      ? TUTORIALS_META
      : TUTORIALS_META.filter((t) => t.category === activeCategory);

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      {/* SEO Header */}
      <header className="mb-12">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-trace">
          MOD.01 — Tutoriels
        </p>
        <h1 className="mt-4 font-display text-4xl font-semibold text-paper sm:text-5xl">
          Apprendre SnailWire
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-paper-muted">
          Guides complets et pas-à-pas pour maîtriser l'éditeur de schémas électroniques.
          De la création de vos premiers composants jusqu'au câblage avancé et à l'export de vos projets.
        </p>
        <div className="mt-8 flex flex-wrap gap-8">
          {[
            { label: "Tutoriels", value: TUTORIALS_META.length },
            { label: "Catégories", value: 4 },
            { label: "Gratuit", value: "100%" },
          ].map((s) => (
            <div key={s.label}>
              <p className="font-display text-3xl font-bold text-trace">{s.value}</p>
              <p className="font-mono text-xs text-paper-muted uppercase tracking-widest mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </header>

      {/* Category filter */}
      <div className="mb-8 flex flex-wrap gap-2" role="tablist" aria-label="Filtrer par catégorie">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            role="tab"
            aria-selected={activeCategory === cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`rounded-lg border px-4 py-1.5 font-mono text-sm transition-all ${
              activeCategory === cat.id
                ? "border-trace bg-trace/10 text-trace"
                : "border-line-700 text-paper-muted hover:border-trace/50 hover:text-paper"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((tuto) => (
          <TutorialCard key={tuto.slug} tuto={tuto} />
        ))}
      </div>

      {/* FAQ */}
      <section className="mt-24 blueprint-grid rounded-2xl border border-line-700 p-10" aria-labelledby="faq-title">
        <h2 id="faq-title" className="font-display text-2xl font-semibold text-paper mb-2">
          Questions fréquentes
        </h2>
        <p className="text-paper-muted text-sm mb-8">
          Tout ce que vous devez savoir avant de commencer avec SnailWire.
        </p>
        <div className="grid gap-6 md:grid-cols-2">
          {FAQ.map((faq, i) => (
            <div key={i} className="border-l-2 border-line-700 pl-5">
              <h3 className="font-display text-sm font-semibold text-paper mb-2">{faq.q}</h3>
              <p className="text-sm leading-relaxed text-paper-muted">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mt-16 flex flex-col items-center text-center gap-4">
        <h2 className="font-display text-2xl font-semibold text-paper">
          Prêt à créer votre premier schéma ?
        </h2>
        <p className="text-paper-muted text-sm max-w-md">
          L'éditeur est gratuit, sans compte, sans installation. Ouvrez-le et commencez à dessiner.
        </p>
        <Link
          to="/editeur"
          className="mt-2 rounded-md bg-trace px-8 py-3 font-mono text-sm font-medium text-ink-950 transition-transform hover:-translate-y-0.5 hover:shadow-[0_0_24px_-4px_var(--color-trace)]"
        >
          Ouvrir l'éditeur →
        </Link>
      </section>
    </div>
  );
}
