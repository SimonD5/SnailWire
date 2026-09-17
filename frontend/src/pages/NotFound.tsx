import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <section className="mx-auto flex max-w-2xl flex-col items-center px-6 py-32 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.25em] text-trace">Erreur — 404</p>
      <h1 className="mt-4 font-display text-3xl font-semibold text-paper">
        Ce nœud du circuit n'existe pas
      </h1>
      <p className="mt-3 text-sm text-paper-muted">
        La page demandée est introuvable, ou le fil a été coupé quelque part.
      </p>
      <Link
        to="/"
        className="mt-8 rounded-md bg-trace px-6 py-3 font-mono text-sm font-medium text-ink-950 transition-transform hover:-translate-y-0.5"
      >
        ← Retour à l'accueil
      </Link>
    </section>
  );
}
