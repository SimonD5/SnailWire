import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
// import Tutoriels from "./pages/Tutoriels";
// import TutorialPage from "./pages/TutorialPage";
import Editeur from "./pages/Editeur";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        {/* <Route path="/tutoriels" element={<Tutoriels />} />
        <Route path="/tutoriels/:slug" element={<TutorialPage />} /> */}
        <Route path="/editeur" element={<Editeur />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
