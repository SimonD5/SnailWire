import { Link } from "react-router-dom";
import CircuitHero from "../components/CircuitHero";
import { DatasheetIcon, BoardIcon } from "../components/icons";

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="blueprint-grid relative overflow-hidden border-b border-line-700/60">
        <div className="mx-auto grid max-w-6xl items-center gap-16 px-6 py-20 lg:grid-cols-2 lg:py-28">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-trace">
              MOD.00 — Atelier de schémas
            </p>
            <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.1] text-paper sm:text-5xl">
              Dessinez vos schémas électroniques sans friction.
            </h1>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-paper-muted">
              Un espace visuel pour placer vos composants et tracer vos câbles,
              comme sur une vraie table de montage — sans la complexité d'un
              logiciel de CAO complet. On se concentre sur l'essentiel :
              voir son montage prendre forme.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link
                to="/editeur"
                className="rounded-md bg-trace px-6 py-3 font-mono text-sm font-medium text-ink-950 transition-transform hover:-translate-y-0.5 hover:shadow-[0_0_24px_-4px_var(--color-trace)]"
              >
                Créer un schéma →
              </Link>
              {/* <Link
                to="/tutoriels"
                className="rounded-md border border-line-700 px-6 py-3 font-mono text-sm text-paper transition-colors hover:border-trace hover:text-trace"
              >
                Voir les tutoriels
              </Link> */}
            </div>
          </div>

          <div className="rounded-2xl border border-line-700 bg-ink-900/60 p-6 shadow-[0_0_60px_-20px_rgba(76,214,224,0.25)] sm:p-10">
            <CircuitHero />
          </div>
        </div>
      </section>

      {/* Sections */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="relative grid gap-8 md:grid-cols-1 md:max-w-md md:mx-auto">
          {/* trace décorative reliant les deux modules (desktop) */}
          {/* <svg
            className="pointer-events-none absolute left-1/2 top-1/2 hidden w-24 -translate-x-1/2 -translate-y-1/2 md:block"
            viewBox="0 0 96 24"
            fill="none"
            aria-hidden="true"
          >
            <path d="M0 12 H36 M60 12 H96" stroke="var(--color-line-700)" strokeWidth="2" />
            <circle cx="48" cy="12" r="4" fill="var(--color-ink-950)" stroke="var(--color-trace)" strokeWidth="2" />
          </svg>

          <Link
            to="/tutoriels"
            className="group rounded-2xl border border-line-700 bg-ink-800/60 p-8 transition-all hover:-translate-y-1 hover:border-trace hover:shadow-[0_0_40px_-12px_var(--color-trace)]"
          >
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-paper-muted">
              MOD.01 — Tutoriels
            </p>
            <DatasheetIcon className="mt-5 h-10 w-10 text-trace" />
            <h2 className="mt-5 font-display text-xl font-semibold text-paper">
              Apprendre à s'en servir
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-paper-muted">
              Des articles pas-à-pas sur la prise en main de l'éditeur, la
              lecture des schémas et les bonnes pratiques de câblage.
              Cette section sera complétée prochainement.
            </p>
            <span className="mt-6 inline-flex items-center gap-1 font-mono text-sm text-trace">
              Découvrir
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </span>
          </Link> */}

          <Link
            to="/editeur"
            className="group rounded-2xl border border-line-700 bg-ink-800/60 p-8 transition-all hover:-translate-y-1 hover:border-trace hover:shadow-[0_0_40px_-12px_var(--color-trace)]"
          >
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-paper-muted">
              MOD.02 — Éditeur
            </p>
            <BoardIcon className="mt-5 h-10 w-10 text-trace" />
            <h2 className="mt-5 font-display text-xl font-semibold text-paper">
              Faire son schéma
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-paper-muted">
              Le plan de travail où placer vos composants et relier vos
              câbles en quelques clics. L'éditeur visuel arrive
              prochainement dans cet espace.
            </p>
            <span className="mt-6 inline-flex items-center gap-1 font-mono text-sm text-trace">
              Ouvrir l'éditeur
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
}
