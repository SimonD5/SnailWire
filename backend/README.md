# SnailWire — backend

API minimale (Express) du site SnailWire, destinée à être déployée sur **Render**.

Pour l'instant, elle n'expose qu'une route de contrôle (`/api/health`) : la
page d'accueil ne consomme aucune API. Ce squelette est prêt pour accueillir
les prochaines routes (sauvegarde/chargement de schémas, comptes, etc.).

## Lancer en local

```bash
npm install
npm run dev
```

Le serveur démarre sur http://localhost:3001 (modifiable via `PORT`, voir
`.env.example`).

## Déployer sur Render

1. Pousse ce dossier dans un dépôt Git (ou le monorepo complet).
2. Sur [render.com](https://render.com) : **New +** → **Web Service**.
3. Connecte le repo, choisis le dossier `backend` comme *Root Directory*.
4. Render détecte Node automatiquement :
   - Build command : `npm install`
   - Start command : `npm start`
5. Ajoute la variable d'environnement `FRONTEND_ORIGIN` avec l'URL Vercel du
   frontend une fois celui-ci déployé (ex : `https://snailwire.vercel.app`),
   pour restreindre le CORS.

Le fichier `render.yaml` fourni permet aussi un déploiement "Blueprint" en un
clic depuis le dashboard Render.

