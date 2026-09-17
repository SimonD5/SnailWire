import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3001;

// En prod, restreint le CORS à l'URL du frontend déployé sur Vercel.
// En local, on autorise tout pour simplifier les tests.
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN;
app.use(
  cors({
    origin: FRONTEND_ORIGIN ? FRONTEND_ORIGIN : true,
  }),
);
app.use(express.json());

// Route de contrôle utilisée par Render pour vérifier que le service est en vie.
app.get("/", (_req, res) => {
  res.json({ status: "ok", service: "snailwire-backend" });
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Les futures routes (sauvegarde/chargement de schémas, composants, etc.)
// viendront ici, par exemple :
// app.use("/api/schemas", schemasRouter);

app.listen(PORT, () => {
  console.log(`snailwire-backend en écoute sur le port ${PORT}`);
});

