# SnailWire

Un éditeur visuel de schémas électroniques façon "maker" (inspiré de
Fritzing), centré sur le placement de composants et le câblage — sans la
complexité d'un logiciel de CAO complet.

Cette première version pose les fondations : page d'accueil, navigation,
identité visuelle, et deux sections à venir (**Tutoriels** et **Éditeur**),
actuellement en "en construction".

## Structure du projet

```
snailwire/
├── frontend/          Site React (Vite + TypeScript + Tailwind) → déployé sur Vercel
├── backend/            API Express minimale → déployée sur Render
└── lancer-snailwire.bat   Lance tout en local en un double-clic (Windows)
```

Le frontend n'appelle actuellement aucune route du backend (la page
d'accueil est 100% statique) : le backend est un squelette prêt à recevoir
les futures fonctionnalités (sauvegarde de schémas, comptes, etc.) quand
l'éditeur sera construit.

## Lancer en local

### Option 1 — le plus simple (Windows)

Double-clique sur **`lancer-snailwire.bat`**. Il installe les dépendances si
besoin, puis ouvre deux fenêtres (backend + frontend). Le site s'ouvre tout
seul sur http://localhost:5173.

### Option 2 — manuellement (Windows, Mac, Linux)

```bash
cd frontend
npm install
npm run dev
```

Le site est alors visible sur http://localhost:5173.
(Le backend, optionnel pour l'instant, se lance de la même façon depuis
`backend/` — voir `backend/README.md`.)

## Mettre ton propre logo

Trois fichiers placeholder sont déjà en place dans
`frontend/public/logo/` : `logo.svg`, `logo.png`, `logo.ico`.
Remplace-les simplement par tes propres fichiers **en gardant exactement
ces noms** — aucune modification de code n'est nécessaire.

## Renommer le site

Le nom "SnailWire" (choisi provisoirement) et le slogan sont centralisés dans
un seul fichier : `frontend/src/config/site.ts`. Modifie les valeurs
`name` et `tagline` pour renommer le site partout (navbar, footer, titre
d'onglet).

## Déployer

### Frontend → Vercel

1. Pousse le projet sur GitHub.
2. Sur [vercel.com](https://vercel.com) : **Add New → Project**, importe le
   repo.
3. *Root Directory* : `frontend`.
4. Vercel détecte Vite automatiquement (build : `npm run build`, output :
   `dist`). Le fichier `vercel.json` inclus gère déjà le routage du site
   (React Router) pour que les URLs comme `/tutoriels` fonctionnent aussi
   en accès direct.
5. Déploie — c'est tout, pas de variable d'environnement nécessaire pour
   l'instant.

### Backend → Render

Voir `backend/README.md` (déploiement en 5 minutes, avec ou sans
`render.yaml`).

## Prochaines étapes (pas encore construites)

- **Tutoriels** (`/tutoriels`) : les articles pas-à-pas viendront remplacer
  l'état vide actuel.
- **Éditeur** (`/editeur`) : le vrai plan de travail — placement des
  composants, tracé des câbles — viendra remplacer l'état vide actuel.

Les deux pages sont déjà reliées depuis l'accueil et la navigation ; il ne
restera qu'à construire leur contenu.

