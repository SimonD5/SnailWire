import { Link } from "react-router-dom";
import { site } from "../config/site";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line-700/60 bg-ink-950">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 py-10 text-center sm:flex-row sm:justify-between sm:text-left">
        <div className="flex items-center gap-3">
          <img src={site.logo.svg} alt={`Logo ${site.name}`} className="h-6 w-6 opacity-80" />
          <span className="font-mono text-xs text-paper-muted">
            © {year} {site.name} — {site.tagline}
          </span>
        </div>

        <nav className="flex items-center gap-6 font-mono text-xs text-paper-muted">
          {/* <Link to="/tutoriels" className="transition-colors hover:text-trace">
            Tutoriels
          </Link> */}
          <Link to="/editeur" className="transition-colors hover:text-trace">
            Éditeur
          </Link>
        </nav>
      </div>
    </footer>
  );
}
