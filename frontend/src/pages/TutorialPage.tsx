import { Link, useParams } from "react-router-dom";
import { useEffect } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface TutorialMeta {
  slug: string;
  title: string;
  description: string;
  category: "debutant" | "composants" | "cablage" | "avance";
  categoryLabel: string;
}

// ─── Tutorial registry ────────────────────────────────────────────────────────

export const TUTORIALS_META: TutorialMeta[] = [
  {
    slug: "prise-en-main",
    title: "Prise en main de SnailWire",
    description:
      "Découvrez l'interface de l'éditeur de schémas électroniques SnailWire : barre d'outils, panneau des composants, navigation et raccourcis essentiels.",
    category: "debutant",
    categoryLabel: "Débutant",
  },
  {
    slug: "ajouter-un-composant",
    title: "Ajouter un composant personnalisé",
    description:
      "Apprenez à créer un composant électronique dans SnailWire : importer une image, définir les dimensions et positionner les pins de connexion.",
    category: "composants",
    categoryLabel: "Composants",
  },
  {
    slug: "placer-et-deplacer-les-composants",
    title: "Placer et déplacer des composants sur la feuille",
    description:
      "Maîtrisez le placement des composants sur la grille, leur rotation et leur déplacement. Les fils connectés suivent automatiquement.",
    category: "composants",
    categoryLabel: "Composants",
  },
  {
    slug: "tracer-des-fils-electriques",
    title: "Tracer des fils électriques",
    description:
      "Utilisez l'outil fil pour relier vos composants : angles à 45° et 90°, aide à la visée, connexion aux pins, et terminaison du tracé.",
    category: "cablage",
    categoryLabel: "Câblage",
  },
  {
    slug: "modifier-et-supprimer-un-fil",
    title: "Modifier, coloriser et supprimer un fil",
    description:
      "Sélectionnez un fil pour accéder à ses poignées de réglage, changer sa couleur ou le supprimer. Organisez votre schéma visuellement.",
    category: "cablage",
    categoryLabel: "Câblage",
  },
  {
    slug: "annoter-son-schema",
    title: "Annoter son schéma avec texte et post-its",
    description:
      "Rendez votre schéma auto-documenté en ajoutant des étiquettes texte sur les nœuds et des post-its pour les notes de conception.",
    category: "avance",
    categoryLabel: "Avancé",
  },
  {
    slug: "sauvegarder-et-exporter",
    title: "Sauvegarder et exporter son projet",
    description:
      "SnailWire sauvegarde automatiquement dans le navigateur. Nommez votre projet, exportez-le en JSON et réimportez-le sur n'importe quel appareil.",
    category: "avance",
    categoryLabel: "Avancé",
  },
  {
    slug: "parametres-de-l-editeur",
    title: "Régler les paramètres de l'éditeur",
    description:
      "Personnalisez l'éditeur : épaisseur des fils, taille de la grille et magnétisme. Adaptez l'outil à votre style de travail.",
    category: "avance",
    categoryLabel: "Avancé",
  },
  {
    slug: "premier-montage-arduino",
    title: "Créer votre premier montage Arduino",
    description:
      "Tutoriel complet de bout en bout : Arduino Uno, LED et résistance. Ajout des composants, câblage, annotations et export du schéma.",
    category: "debutant",
    categoryLabel: "Débutant",
  },
  {
    slug: "raccourcis-clavier",
    title: "Tous les raccourcis clavier de SnailWire",
    description:
      "Référence complète des raccourcis clavier pour naviguer, tracer, sélectionner et effacer plus vite dans l'éditeur de schémas.",
    category: "debutant",
    categoryLabel: "Débutant",
  },
];

// ─── Content map ──────────────────────────────────────────────────────────────

export const TUTORIALS_CONTENT: Record<string, React.ReactNode> = {
  "prise-en-main": (
    <TutorialLayout
      meta={TUTORIALS_META[0]}
      intro="SnailWire est un éditeur de schémas électroniques qui fonctionne directement dans le navigateur. Pas d'installation, pas de compte, pas de serveur. Voici comment vous repérer dans l'interface en moins de dix minutes."
    >
      <Section title="L'interface en un coup d'œil">
        <p>
          Quand vous ouvrez l'éditeur, vous vous retrouvez face à une grande feuille de travail
          quadrillée. Cette grille est votre plan de montage. Autour, plusieurs panneaux flottants
          vous donnent accès aux outils.
        </p>
        <ul className="mt-4 space-y-2 text-paper-muted text-sm">
          <li><strong className="text-paper">Barre d'outils</strong> — en bas à gauche, elle contient les outils Sélection, Fil, Texte et Post-it.</li>
          <li><strong className="text-paper">Panneau Composants</strong> — sur la gauche, il liste vos composants personnalisés et le bouton pour en créer de nouveaux.</li>
          <li><strong className="text-paper">Mini-carte</strong> — en haut à droite, elle affiche une vue d'ensemble de votre feuille de travail et un bouton « Recentrer ».</li>
          <li><strong className="text-paper">Menu Fichier</strong> — en haut à gauche, pour créer, exporter ou importer un projet.</li>
          <li><strong className="text-paper">Nom du projet</strong> — au centre de la barre supérieure, cliquez dessus pour renommer votre schéma.</li>
        </ul>
      </Section>
      <Section title="Naviguer sur la feuille">
        <p>
          La feuille de travail est infinie. Vous pouvez y naviguer de plusieurs façons :
        </p>
        <Steps steps={[
          "Faites défiler la molette de la souris pour zoomer et dézoomer.",
          "Cliquez et faites glisser sur une zone vide de la feuille pour vous déplacer (pan).",
          "Utilisez le bouton « Recentrer » de la mini-carte pour revenir au centre de vos composants.",
        ]} />
      </Section>
      <Section title="Les outils">
        <p>La barre d'outils propose quatre outils :</p>
        <div className="mt-4 space-y-3">
          <ToolCard name="Sélection (flèche)" description="Outil par défaut. Permet de cliquer sur les composants et fils pour les sélectionner, les déplacer ou les supprimer. Raccourci : Échap depuis n'importe quel outil." />
          <ToolCard name="Fil électrique (câble)" description="Tracez des connexions entre les pins de vos composants. Le fil contraint les angles à 45° et 90°." />
          <ToolCard name="Texte (T)" description="Placez une étiquette texte n'importe où sur la feuille pour nommer des nœuds ou ajouter des références." />
          <ToolCard name="Post-it (note)" description="Créez des zones de notes repositionnables et redimensionnables pour documenter votre schéma." />
        </div>
      </Section>
      <Tip>
        Appuyez sur <Kbd>Échap</Kbd> à n'importe quel moment pour revenir à l'outil de sélection. C'est le raccourci le plus utile de l'éditeur.
      </Tip>
      <NextLink slug="ajouter-un-composant" label="Ajouter votre premier composant" />
    </TutorialLayout>
  ),

  "ajouter-un-composant": (
    <TutorialLayout
      meta={TUTORIALS_META[1]}
      intro="Dans SnailWire, chaque composant de votre bibliothèque est personnalisé. Vous apportez l'image, les dimensions réelles et la position des pins. Ce tutoriel vous guide pas à pas pour créer votre premier composant."
    >
      <Section title="Pourquoi créer ses propres composants ?">
        <p>
          SnailWire ne dispose pas d'une bibliothèque prédéfinie figée. Cette approche vous donne
          une liberté totale : importez exactement la photo du composant que vous avez sur votre
          bureau, définissez ses vraies dimensions, et positionnez les pins là où ils se trouvent
          physiquement. Votre schéma représente ainsi la réalité de votre montage.
        </p>
      </Section>
      <Section title="Ouvrir le wizard de création">
        <Steps steps={[
          "Dans le panneau « Composants » (à gauche), cliquez sur le bouton « + Ajouter ».",
          "Un assistant en plusieurs étapes s'ouvre. Vous pouvez le parcourir avec les boutons Suivant et Précédent.",
        ]} />
      </Section>
      <Section title="Étape 1 : Nommer le composant">
        <p>
          Donnez un nom clair et reconnaissable à votre composant. Exemples :
        </p>
        <ul className="mt-2 space-y-1 text-paper-muted text-sm list-disc list-inside">
          <li>Arduino Uno R3</li>
          <li>Résistance 10 kΩ</li>
          <li>LED rouge 5 mm</li>
          <li>Condensateur 100 µF 16V</li>
        </ul>
        <p className="mt-3">Le nom apparaîtra dans la liste du panneau et sous le composant sur la feuille.</p>
      </Section>
      <Section title="Étape 2 : Importer une image">
        <Steps steps={[
          "Cliquez sur la zone d'import ou faites glisser un fichier image depuis votre ordinateur.",
          "Formats acceptés : PNG, JPG, JPEG, SVG, WEBP.",
          "L'image est affichée dans le wizard. Vous pouvez en changer si elle ne vous convient pas.",
        ]} />
        <Tip>
          Prenez une photo de votre composant sur fond blanc, ou cherchez l'image officielle du fabricant. Une image propre rend votre schéma beaucoup plus lisible.
        </Tip>
      </Section>
      <Section title="Étape 3 : Définir les dimensions">
        <p>
          Indiquez la largeur et la hauteur physiques réelles du composant, en millimètres.
          Ces dimensions servent à l'affichage à l'échelle sur la feuille de travail.
        </p>
        <p className="mt-2 text-paper-muted text-sm">
          Exemple : un Arduino Uno mesure environ 68,6 mm × 53,3 mm. Une résistance 1/4W
          fait environ 9 mm × 3,5 mm.
        </p>
      </Section>
      <Section title="Étape 4 : Placer les pins">
        <p>
          C'est l'étape la plus importante. Les pins sont les points de connexion de votre composant.
          Ils permettront de brancher des fils électriques.
        </p>
        <Steps steps={[
          "Cliquez sur le bouton « + Ajouter un pin ».",
          "Donnez un nom au pin (ex : GND, 5V, D13, SDA, A0…).",
          "Sur l'aperçu de l'image, cliquez à l'endroit exact où se trouve physiquement ce pin.",
          "Le pin s'affiche sous forme d'un point coloré sur l'image.",
          "Répétez l'opération pour tous les pins du composant.",
          "Cliquez sur un pin existant et faites-le glisser pour ajuster sa position si nécessaire.",
        ]} />
        <Tip>
          Pour un Arduino, commencez par les pins les plus utilisés : GND, 5V, 3.3V, puis les broches numériques et analogiques. Vous pouvez revenir modifier le composant plus tard.
        </Tip>
      </Section>
      <Section title="Étape 5 : Valider et utiliser le composant">
        <Steps steps={[
          "Cliquez sur « Terminer » pour ajouter le composant à votre bibliothèque.",
          "Il apparaît dans la liste du panneau Composants.",
          "Faites-le glisser depuis le panneau vers la feuille de travail pour le placer.",
          "Répétez le glisser-déposer pour en placer plusieurs exemplaires.",
        ]} />
      </Section>
      <NextLink slug="placer-et-deplacer-les-composants" label="Placer et déplacer des composants" />
    </TutorialLayout>
  ),

  "placer-et-deplacer-les-composants": (
    <TutorialLayout
      meta={TUTORIALS_META[2]}
      intro="Une fois vos composants créés dans la bibliothèque, vous pouvez les placer sur la feuille de travail, les réorganiser, les faire pivoter. Les fils connectés s'adaptent automatiquement."
    >
      <Section title="Placer un composant sur la feuille">
        <Steps steps={[
          "Dans le panneau Composants, repérez le composant à placer.",
          "Cliquez dessus et maintenez le bouton de la souris enfoncé.",
          "Faites glisser le composant vers la feuille de travail et relâchez.",
          "Le composant se pose et s'aligne automatiquement sur la grille.",
          "Répétez l'opération pour chaque composant dont vous avez besoin.",
        ]} />
        <Tip>
          Commencez par placer tous vos composants avant de tracer les fils. Organisez-les de gauche à droite dans le sens du flux électrique : source d'alimentation à gauche, charge à droite.
        </Tip>
      </Section>
      <Section title="Sélectionner un composant">
        <p>
          Avec l'outil Sélection actif (appuyez sur <Kbd>Échap</Kbd> si vous n'êtes pas sûr),
          cliquez sur un composant pour le sélectionner. Un contour bleu apparaît autour de lui
          et une barre d'outils flottante s'affiche au-dessus.
        </p>
      </Section>
      <Section title="Déplacer un composant">
        <Steps steps={[
          "Sélectionnez l'outil Sélection (Échap).",
          "Cliquez sur le composant et maintenez.",
          "Faites glisser vers la nouvelle position.",
          "Le composant s'aligne sur la grille au relâchement.",
          "Si des fils sont connectés à ses pins, ils se recalculent automatiquement.",
        ]} />
      </Section>
      <Section title="Faire pivoter un composant">
        <Steps steps={[
          "Cliquez sur le composant pour le sélectionner.",
          "Dans la barre flottante, cliquez sur l'icône de rotation (flèche circulaire).",
          "Le composant pivote de 90° dans le sens des aiguilles d'une montre.",
          "Cliquez plusieurs fois pour atteindre l'orientation souhaitée (0°, 90°, 180°, 270°).",
        ]} />
      </Section>
      <Section title="Supprimer un composant de la feuille">
        <p>
          Sélectionnez le composant, puis cliquez sur l'icône poubelle dans la barre flottante.
          Le composant est retiré de la feuille mais reste dans votre bibliothèque.
        </p>
        <p className="mt-2 text-paper-muted text-sm">
          Pour supprimer un composant de la bibliothèque (et non juste de la feuille), cliquez
          sur l'icône poubelle à côté de son nom dans le panneau Composants.
        </p>
      </Section>
      <NextLink slug="tracer-des-fils-electriques" label="Tracer des fils électriques" />
    </TutorialLayout>
  ),

  "tracer-des-fils-electriques": (
    <TutorialLayout
      meta={TUTORIALS_META[3]}
      intro="Les fils électriques relient les pins de vos composants. SnailWire guide votre tracé avec des contraintes d'angle à 45° et 90°, et une aide à la visée qui accroche automatiquement aux pins proches."
    >
      <Section title="Activer l'outil Fil">
        <p>
          Cliquez sur l'icône câble dans la barre d'outils pour activer l'outil Fil.
          Le curseur change pour indiquer que vous êtes en mode tracé.
        </p>
        <Tip>
          Sélectionnez une couleur avant de tracer : rouge pour l'alimentation, noir pour la masse,
          bleu pour les signaux. La palette de couleurs est dans la barre d'outils.
        </Tip>
      </Section>
      <Section title="Démarrer un fil depuis un pin">
        <Steps steps={[
          "Approchez le curseur d'un pin de composant.",
          "Un cercle vert d'accrochage apparaît : le fil partira exactement du pin.",
          "Cliquez pour fixer le point de départ du fil.",
          "Déplacez la souris : un fil en pointillé suit le curseur en respectant les angles.",
        ]} />
      </Section>
      <Section title="Tracer des segments intermédiaires">
        <p>
          Pour créer un fil avec des changements de direction, cliquez à chaque coude souhaité.
          Chaque clic pose un point intermédiaire et commence un nouveau segment.
        </p>
        <Steps steps={[
          "Cliquez une première fois pour démarrer le fil depuis un pin.",
          "Déplacez la souris vers un angle, cliquez pour poser un coude.",
          "Continuez ainsi jusqu'à approcher le pin de destination.",
          "Quand le cercle vert d'accrochage apparaît sur le pin cible, cliquez pour terminer.",
        ]} />
      </Section>
      <Section title="Terminer un fil dans le vide">
        <p>
          Si vous voulez laisser un fil sans le connecter à un pin (fil libre), double-cliquez
          dans une zone vide de la feuille. Le fil est validé et un point rouge indique son
          extrémité non connectée.
        </p>
      </Section>
      <Section title="Annuler un fil en cours">
        <p>
          Appuyez sur <Kbd>Échap</Kbd> ou faites un clic droit pour annuler le fil en cours
          de traçage. Si le fil a déjà plusieurs segments, il est sauvegardé jusqu'au dernier
          point posé.
        </p>
      </Section>
      <NextLink slug="modifier-et-supprimer-un-fil" label="Modifier et supprimer un fil" />
    </TutorialLayout>
  ),

  "modifier-et-supprimer-un-fil": (
    <TutorialLayout
      meta={TUTORIALS_META[4]}
      intro="Après avoir tracé des fils, vous pouvez les ajuster en déplaçant leurs poignées, changer leur couleur pour mieux organiser votre schéma, ou les supprimer."
    >
      <Section title="Sélectionner un fil">
        <p>
          Avec l'outil Sélection actif, cliquez sur n'importe quel segment d'un fil.
          Le fil devient bleu et des poignées circulaires blanches apparaissent sur chacun
          de ses points. Un menu contextuel s'affiche également.
        </p>
      </Section>
      <Section title="Ajuster le tracé d'un fil">
        <Steps steps={[
          "Sélectionnez le fil en cliquant dessus.",
          "Des poignées circulaires apparaissent sur chaque point du fil.",
          "Cliquez sur une poignée et faites-la glisser vers la nouvelle position.",
          "Le fil se retrasse avec les segments adjacents mis à jour.",
          "Cliquez ailleurs pour désélectionner et voir le résultat.",
        ]} />
        <Tip>
          Vous pouvez déplacer librement les poignées sur la grille. Si vous avez besoin
          d'un placement précis, réduisez la taille de la grille dans les Paramètres.
        </Tip>
      </Section>
      <Section title="Changer la couleur d'un fil">
        <Steps steps={[
          "Cliquez sur le fil pour le sélectionner.",
          "Dans le menu contextuel qui apparaît, choisissez une couleur dans la palette.",
          "Le fil change de couleur immédiatement.",
        ]} />
        <p className="mt-3 text-paper-muted text-sm">
          Convention courante : rouge = alimentation positive (VCC, 5V, 3.3V), noir = masse (GND),
          bleu = signaux numériques, vert = signaux analogiques, orange = bus de données.
        </p>
      </Section>
      <Section title="Supprimer un fil">
        <p>
          Deux façons de supprimer un fil sélectionné :
        </p>
        <ul className="mt-2 space-y-1 text-sm text-paper-muted list-disc list-inside">
          <li>Appuyez sur la touche <Kbd>Suppr</Kbd> du clavier.</li>
          <li>Cliquez sur l'icône poubelle dans le menu contextuel du fil.</li>
        </ul>
      </Section>
      <NextLink slug="annoter-son-schema" label="Annoter son schéma" />
    </TutorialLayout>
  ),

  "annoter-son-schema": (
    <TutorialLayout
      meta={TUTORIALS_META[5]}
      intro="Un bon schéma se lit sans explication orale. Les étiquettes texte permettent de nommer les nœuds importants, les post-its de noter les calculs et mises en garde."
    >
      <Section title="Ajouter une étiquette texte">
        <Steps steps={[
          "Sélectionnez l'outil Texte dans la barre d'outils.",
          "Cliquez sur la feuille à l'endroit où placer l'étiquette.",
          "Tapez votre texte (ex : VCC, GND, SDA, 3.3V…).",
          "Cliquez en dehors pour valider.",
          "Double-cliquez sur une étiquette existante pour la modifier.",
        ]} />
        <Tip>
          Nommez systématiquement les nœuds d'alimentation (VCC, 3.3V, 5V) et de masse (GND).
          Cela rend votre schéma lisible pour quiconque, même sans les composants complets.
        </Tip>
      </Section>
      <Section title="Utiliser les post-its">
        <Steps steps={[
          "Sélectionnez l'outil Post-it dans la barre d'outils.",
          "Cliquez sur la feuille pour créer un post-it.",
          "Double-cliquez dessus pour éditer son contenu.",
          "Faites glisser le post-it pour le repositionner.",
          "Cliquez sur la croix pour le supprimer.",
        ]} />
        <p className="mt-3 text-paper-muted text-sm">
          Idées de contenu pour les post-its : valeurs de résistances calculées, tensions mesurées,
          numéro de révision du schéma, précaution d'utilisation, référence de datasheet.
        </p>
      </Section>
      <Section title="Bonnes pratiques d'annotation">
        <ul className="space-y-2 text-sm text-paper-muted list-disc list-inside">
          <li>Annotez tous les rails d'alimentation et de masse en haut et en bas de la feuille.</li>
          <li>Indiquez les valeurs des composants (résistances, condensateurs) directement à côté.</li>
          <li>Utilisez un post-it de titre en haut à gauche avec le nom du projet et la version.</li>
          <li>Ajoutez des flèches ou labels sur les connecteurs vers l'extérieur (UART, I2C, SPI…).</li>
        </ul>
      </Section>
      <NextLink slug="sauvegarder-et-exporter" label="Sauvegarder et exporter" />
    </TutorialLayout>
  ),

  "sauvegarder-et-exporter": (
    <TutorialLayout
      meta={TUTORIALS_META[6]}
      intro="SnailWire sauvegarde votre travail automatiquement dans votre navigateur. Mais pour partager votre schéma ou le retrouver sur un autre appareil, l'export en fichier JSON est indispensable."
    >
      <Section title="Sauvegarde automatique">
        <p>
          Chaque modification que vous faites est enregistrée automatiquement dans le
          stockage local de votre navigateur (localStorage). Si vous fermez accidentellement
          l'onglet, votre dernier état sera restauré à la prochaine ouverture.
        </p>
        <p className="mt-3 text-paper-muted text-sm">
          ⚠️ Attention : effacer le cache ou l'historique du navigateur supprime cette
          sauvegarde locale. Exportez régulièrement votre projet en JSON pour éviter toute perte.
        </p>
      </Section>
      <Section title="Nommer votre projet">
        <Steps steps={[
          "Regardez la barre de navigation en haut de l'écran.",
          "Au centre, vous voyez le nom du projet (par défaut : « Nouveau Projet »).",
          "Cliquez dessus pour le rendre éditable.",
          "Tapez le nom de votre projet et appuyez sur Entrée.",
        ]} />
        <p className="mt-3 text-paper-muted text-sm">
          Le nom est inclus dans la sauvegarde automatique et dans le fichier exporté.
        </p>
      </Section>
      <Section title="Exporter le projet en JSON">
        <Steps steps={[
          "Cliquez sur « Fichier » dans la barre de navigation (en haut à gauche).",
          "Sélectionnez « Exporter ».",
          "Un fichier .json est téléchargé automatiquement.",
          "Le nom du fichier correspond au nom de votre projet.",
        ]} />
      </Section>
      <Section title="Importer un projet JSON">
        <Steps steps={[
          "Cliquez sur « Fichier » → « Importer ».",
          "Sélectionnez le fichier .json sur votre ordinateur.",
          "Le projet se charge et remplace le contenu actuel de la feuille.",
        ]} />
        <Tip>
          L'import remplace entièrement le projet en cours. Si vous avez des modifications
          non sauvegardées, exportez-les d'abord.
        </Tip>
      </Section>
      <Section title="Nouveau projet">
        <p>
          « Fichier » → « Nouveau » efface la feuille de travail et repart de zéro.
          Une confirmation vous est demandée pour éviter les fausses manipulations.
        </p>
      </Section>
      <NextLink slug="parametres-de-l-editeur" label="Régler les paramètres" />
    </TutorialLayout>
  ),

  "parametres-de-l-editeur": (
    <TutorialLayout
      meta={TUTORIALS_META[7]}
      intro="Le menu Paramètres vous permet d'adapter l'éditeur à votre style de travail : épaisseur des fils pour la lisibilité, finesse de la grille pour la précision, et magnétisme pour le placement libre."
    >
      <Section title="Ouvrir les paramètres">
        <Steps steps={[
          "Cliquez sur « Paramètres » dans la barre de navigation (à droite).",
          "Une fenêtre modale s'ouvre par-dessus l'éditeur.",
          "Appuyez sur Échap ou cliquez en dehors pour la fermer.",
        ]} />
      </Section>
      <Section title="Épaisseur des fils">
        <p>
          Le curseur « Épaisseur des fils » contrôle la largeur visuelle de tous les fils
          du schéma, de 1 px (très fin) à 10 px (épais). Ce réglage est global : il
          s'applique à tous les fils simultanément.
        </p>
        <ul className="mt-3 space-y-1 text-sm text-paper-muted list-disc list-inside">
          <li><strong className="text-paper">1-2 px</strong> : schémas denses avec beaucoup de connexions.</li>
          <li><strong className="text-paper">3-4 px</strong> : valeur par défaut, bonne lisibilité générale.</li>
          <li><strong className="text-paper">5-10 px</strong> : schémas à présenter ou imprimer en grand format.</li>
        </ul>
      </Section>
      <Section title="Taille de la grille">
        <p>
          La grille détermine l'unité de pas pour le placement des composants et des
          poignées de fils. Une petite valeur (6 px) offre plus de précision, une grande
          valeur (24-48 px) garantit un alignement naturellement régulier.
        </p>
      </Section>
      <Section title="Magnétisme (snap to grid)">
        <p>
          Quand le magnétisme est activé, les composants et poignées de fils s'alignent
          automatiquement sur la grille au relâchement. Désactivez-le si vous avez besoin
          d'un placement pixel-perfect sans contrainte.
        </p>
        <Tip>
          Le magnétisme est recommandé pour la grande majorité des schémas. Désactivez-le
          uniquement pour ajuster finement une poignée de fil ou annoter un point précis.
        </Tip>
      </Section>
      <NextLink slug="premier-montage-arduino" label="Tutoriel : premier montage Arduino" />
    </TutorialLayout>
  ),

  "premier-montage-arduino": (
    <TutorialLayout
      meta={TUTORIALS_META[8]}
      intro="Ce tutoriel complet vous guide de A à Z pour créer un schéma de montage Arduino : un Arduino Uno, une résistance et une LED. À la fin, vous aurez un schéma propre, annoté et exporté."
    >
      <Section title="Matériel représenté">
        <ul className="space-y-1 text-sm text-paper-muted list-disc list-inside">
          <li>1× Arduino Uno R3</li>
          <li>1× Résistance 220 Ω</li>
          <li>1× LED rouge 5 mm</li>
        </ul>
        <p className="mt-3 text-paper-muted text-sm">
          Dans ce schéma, la LED est connectée à la broche D13 de l'Arduino via la résistance,
          et sa cathode est reliée au GND. C'est le montage classique du sketch « Blink ».
        </p>
      </Section>
      <Section title="1. Créer les composants">
        <Steps steps={[
          "Ouvrez l'éditeur et cliquez sur « + Ajouter » dans le panneau Composants.",
          "Créez l'Arduino Uno : cherchez une image officielle, définissez 68.6 × 53.3 mm.",
          "Ajoutez les pins : GND, 5V et D13 aux positions correspondantes sur l'image.",
          "Créez la résistance : une image simple ou un symbole, 9 × 3.5 mm, pins A et B à chaque extrémité.",
          "Créez la LED : 5 × 8 mm, pin « Anode (+) » et pin « Cathode (−) ».",
        ]} />
      </Section>
      <Section title="2. Placer les composants">
        <Steps steps={[
          "Glissez l'Arduino Uno depuis le panneau vers la gauche de la feuille.",
          "Placez la résistance au centre, légèrement à droite de l'Arduino.",
          "Placez la LED encore plus à droite.",
          "Alignez-les horizontalement en les plaçant à la même hauteur sur la grille.",
        ]} />
        <Tip>
          Organisez vos composants de gauche à droite dans le sens du courant : Arduino → résistance → LED. Cela rend le schéma immédiatement compréhensible.
        </Tip>
      </Section>
      <Section title="3. Câbler le circuit">
        <Steps steps={[
          "Sélectionnez l'outil Fil et choisissez la couleur bleue pour D13.",
          "Tracez un fil du pin D13 de l'Arduino jusqu'au pin A de la résistance.",
          "Tracez un fil du pin B de la résistance jusqu'à l'Anode (+) de la LED.",
          "Choisissez la couleur noire, tracez un fil de la Cathode (−) de la LED jusqu'au GND de l'Arduino.",
        ]} />
      </Section>
      <Section title="4. Annoter le schéma">
        <Steps steps={[
          "Sélectionnez l'outil Texte.",
          "Ajoutez le label « GND » sur le fil noir relié à la masse.",
          "Ajoutez « D13 » sur le fil bleu en sortie de l'Arduino.",
          "Ajoutez un post-it : « Résistance de limitation : (5V − 2V) / 20mA = 150 Ω → valeur standard : 220 Ω ».",
        ]} />
      </Section>
      <Section title="5. Nommer et exporter">
        <Steps steps={[
          "Cliquez sur le nom du projet en haut au centre et tapez « Arduino Blink ».",
          "Cliquez sur « Fichier » → « Exporter ».",
          "Le fichier « arduino_blink.json » est téléchargé sur votre ordinateur.",
        ]} />
      </Section>
      <NextLink slug="raccourcis-clavier" label="Voir tous les raccourcis clavier" />
    </TutorialLayout>
  ),

  "raccourcis-clavier": (
    <TutorialLayout
      meta={TUTORIALS_META[9]}
      intro="Maîtriser les raccourcis clavier de SnailWire vous permettra de travailler beaucoup plus vite. Voici la référence complète."
    >
      <Section title="Navigation">
        <ShortcutTable rows={[
          { key: "Molette souris", action: "Zoom avant / arrière" },
          { key: "Clic + glisser (zone vide)", action: "Déplacer la vue (pan)" },
          { key: "Bouton Recentrer (mini-carte)", action: "Recentrer sur le contenu" },
        ]} />
      </Section>
      <Section title="Outils">
        <ShortcutTable rows={[
          { key: "Échap", action: "Revenir à l'outil Sélection" },
        ]} />
      </Section>
      <Section title="Édition">
        <ShortcutTable rows={[
          { key: "Suppr", action: "Supprimer le fil sélectionné" },
          { key: "Clic droit", action: "Annuler le fil en cours de traçage" },
          { key: "Double-clic (vide)", action: "Terminer un fil librement sans pin" },
        ]} />
      </Section>
      <Section title="Fichier">
        <ShortcutTable rows={[
          { key: "Fichier → Exporter", action: "Télécharger le projet en .json" },
          { key: "Fichier → Importer", action: "Charger un projet depuis un fichier .json" },
          { key: "Fichier → Nouveau", action: "Repartir d'une feuille vierge" },
        ]} />
      </Section>
      <Tip>
        Revenez systématiquement à l'outil Sélection (<Kbd>Échap</Kbd>) entre chaque action.
        C'est la meilleure façon d'éviter les erreurs de saisie accidentelle.
      </Tip>
    </TutorialLayout>
  ),
};

// ─── Sub-layout & helpers ─────────────────────────────────────────────────────

function TutorialLayout({
  meta,
  intro,
  children,
}: {
  meta: TutorialMeta;
  intro: string;
  children: React.ReactNode;
}) {
  const idx = TUTORIALS_META.findIndex((t) => t.slug === meta.slug);
  const prev = idx > 0 ? TUTORIALS_META[idx - 1] : null;

  useEffect(() => {
    document.title = `${meta.title} — Tutoriels SnailWire`;
  }, [meta.title]);

  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 font-mono text-xs text-paper-muted mb-8" aria-label="Fil d'Ariane">
        <Link to="/" className="hover:text-trace transition-colors">Accueil</Link>
        <span>/</span>
        <Link to="/tutoriels" className="hover:text-trace transition-colors">Tutoriels</Link>
        <span>/</span>
        <span className="text-paper">{meta.title}</span>
      </nav>

      {/* Header */}
      <header className="mb-10">
        <span className={`inline-block rounded border px-2 py-0.5 font-mono text-xs mb-4 ${
          meta.category === "debutant" ? "bg-emerald-900/50 text-emerald-300 border-emerald-700/50" :
          meta.category === "composants" ? "bg-blue-900/50 text-blue-300 border-blue-700/50" :
          meta.category === "cablage" ? "bg-amber-900/50 text-amber-300 border-amber-700/50" :
          "bg-purple-900/50 text-purple-300 border-purple-700/50"
        }`}>
          {meta.categoryLabel}
        </span>
        <h1 className="font-display text-3xl font-bold text-paper sm:text-4xl leading-tight">
          {meta.title}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-paper-muted max-w-2xl">
          {intro}
        </p>
      </header>

      {/* Content */}
      <div className="space-y-10">{children}</div>

      {/* Prev navigation */}
      {prev && (
        <div className="mt-16 border-t border-line-700 pt-8">
          <Link
            to={`/tutoriels/${prev.slug}`}
            className="font-mono text-sm text-paper-muted hover:text-trace transition-colors"
          >
            ← {prev.title}
          </Link>
        </div>
      )}

      {/* CTA */}
      <div className="mt-10 rounded-2xl border border-line-700 bg-ink-800/60 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <p className="font-display font-semibold text-paper">Prêt à pratiquer ?</p>
          <p className="text-sm text-paper-muted mt-1">Ouvrez l'éditeur et appliquez ce que vous venez d'apprendre.</p>
        </div>
        <Link
          to="/editeur"
          className="shrink-0 rounded-md bg-trace px-5 py-2.5 font-mono text-sm font-medium text-ink-950 transition-transform hover:-translate-y-0.5 hover:shadow-[0_0_24px_-4px_var(--color-trace)]"
        >
          Ouvrir l'éditeur →
        </Link>
      </div>
    </article>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-xl font-semibold text-paper mb-4 border-l-2 border-trace pl-4">
        {title}
      </h2>
      <div className="text-paper-muted text-sm leading-relaxed space-y-3">{children}</div>
    </section>
  );
}

function Steps({ steps }: { steps: string[] }) {
  return (
    <ol className="mt-3 space-y-3">
      {steps.map((step, i) => (
        <li key={i} className="flex items-start gap-3">
          <span className="shrink-0 flex h-6 w-6 items-center justify-center rounded-full border border-trace/40 bg-trace/10 font-mono text-xs text-trace font-bold">
            {i + 1}
          </span>
          <span className="text-sm text-paper leading-relaxed pt-0.5">{step}</span>
        </li>
      ))}
    </ol>
  );
}

function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-wire/30 bg-wire/10 p-4">
      <p className="font-mono text-xs text-wire uppercase tracking-widest mb-1">💡 Conseil</p>
      <p className="text-sm text-paper-muted leading-relaxed">{children}</p>
    </div>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="rounded border border-line-700 bg-ink-700 px-1.5 py-0.5 font-mono text-xs text-trace">
      {children}
    </kbd>
  );
}

function ToolCard({ name, description }: { name: string; description: string }) {
  return (
    <div className="rounded-lg border border-line-700 bg-ink-800 px-4 py-3">
      <p className="font-mono text-sm text-trace font-medium">{name}</p>
      <p className="text-sm text-paper-muted mt-1">{description}</p>
    </div>
  );
}

function ShortcutTable({ rows }: { rows: { key: string; action: string }[] }) {
  return (
    <div className="mt-3 space-y-2">
      {rows.map((r, i) => (
        <div key={i} className="flex items-center justify-between rounded-lg border border-line-700 bg-ink-800 px-4 py-2.5">
          <span className="text-sm text-paper">{r.action}</span>
          <kbd className="rounded border border-line-700 bg-ink-700 px-2 py-0.5 font-mono text-xs text-trace whitespace-nowrap">
            {r.key}
          </kbd>
        </div>
      ))}
    </div>
  );
}

function NextLink({ slug, label }: { slug: string; label: string }) {
  return (
    <div className="flex justify-end">
      <Link
        to={`/tutoriels/${slug}`}
        className="inline-flex items-center gap-2 font-mono text-sm text-trace hover:underline"
      >
        {label} <span>→</span>
      </Link>
    </div>
  );
}

// ─── Route component ──────────────────────────────────────────────────────────

export default function TutorialPage() {
  const { slug } = useParams<{ slug: string }>();
  const content = slug ? TUTORIALS_CONTENT[slug] : null;

  if (!content) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-paper-muted mb-4">404</p>
        <h1 className="font-display text-3xl font-bold text-paper mb-4">Tutoriel introuvable</h1>
        <p className="text-paper-muted mb-8">Ce tutoriel n'existe pas ou a été déplacé.</p>
        <Link to="/tutoriels" className="rounded-md bg-trace px-6 py-2.5 font-mono text-sm font-medium text-ink-950">
          ← Voir tous les tutoriels
        </Link>
      </div>
    );
  }

  return <>{content}</>;
}
