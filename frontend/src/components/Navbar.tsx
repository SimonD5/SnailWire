import { NavLink } from "react-router-dom";
import { site } from "../config/site";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-line-700/60 bg-ink-950/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <NavLink to="/" className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-md p-1 overflow-hidden">
            <img src={site.logo.svg} alt={`Logo ${site.name}`} className="h-full w-full object-contain" />
          </div>
          <span className="font-display text-lg font-semibold tracking-tight text-paper">
            {site.name}
          </span>
        </NavLink>

        <nav className="flex items-center gap-2 sm:gap-4">
          {/* <NavLink
            to="/tutoriels"
            className={({ isActive }) =>
              `rounded-md px-3 py-2 font-mono text-sm transition-colors ${
                isActive
                  ? "text-trace"
                  : "text-paper-muted hover:text-paper"
              }`
            }
          >
            Tutoriels
          </NavLink> */}
          <NavLink
            to="/editeur"
            className={({ isActive }) =>
              `rounded-md border px-4 py-2 font-mono text-sm transition-colors ${
                isActive
                  ? "border-trace bg-trace/10 text-trace"
                  : "border-line-700 text-paper hover:border-trace hover:text-trace"
              }`
            }
          >
            Éditeur
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
