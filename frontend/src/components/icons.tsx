type IconProps = { className?: string };

/** Icône "tutoriels" : une fiche datasheet avec une ligne de texte remplacée par une résistance. */
export function DatasheetIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 40 40" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M10 6h13l7 7v21a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M23 6v7h7" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <line x1="12.5" y1="21" x2="19" y2="21" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path
        d="M21 21 L22.6 18 L25.4 24 L28.2 18 L29.8 21"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line x1="12.5" y1="27" x2="27.5" y2="27" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

/** Icône "éditeur" : une grille façon plaque d'essai avec un composant posé et relié. */
export function BoardIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 40 40" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="5" width="30" height="30" rx="3" stroke="currentColor" strokeWidth="2" />
      {[10, 16, 22, 28].map((x) =>
        [10, 16, 22, 28].map((y) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="1.3" fill="currentColor" opacity="0.5" />
        )),
      )}
      <rect x="13" y="13" width="10" height="10" rx="1.5" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M23 16 H30 M23 20 H30" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
