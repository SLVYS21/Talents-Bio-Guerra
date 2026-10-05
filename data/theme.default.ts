export type FontKey =
  | "inter"
  | "space"
  | "dm"
  | "instrument"
  | "fraunces";

export type ButtonStyle = "filled" | "outline" | "soft";

export type Theme = {
  bg: string;
  text: string;
  muted: string;
  accent: string;
  accentText: string;
  border: string;
  borderFocus: string;
  bubbleBg: string;
  bubbleText: string;
  radius: number;
  font: FontKey;
  buttonStyle: ButtonStyle;
  progressBar: boolean;

  // Welcome screen
  welcomeTitle: string;
  welcomeDescription: string;
  welcomeCta: string;

  // Done screen
  doneTitle: string;
  doneDescription: string;

  // Redirect after submit (optional). If empty, stays on the "done" screen.
  redirectUrl: string;

  // Avatar shown next to each question (chat-style).
  avatarUrl: string;
  avatarName: string;
};

// Bio Guera 2026 — light mode : parchemin crème + encre sépia + or/ocre.
// Garde l'ADN "terre + métal" du dark mode, décliné sur fond clair chaud
// (évite le blanc SaaS). Contrastes WCAG AA vérifiés :
//   text (#1A140C) sur bg (#FAF4E8) ≈ 15.3:1
//   muted (#6B5A42) sur bg ≈ 5.5:1
//   accent (#9A6B14) sur bg ≈ 4.6:1 — accentText blanc sur accent ≈ 4.6:1
export const DEFAULT_THEME: Theme = {
  bg: "#FAF4E8",
  text: "#1A140C",
  muted: "#6B5A42",
  accent: "#9A6B14",
  accentText: "#FFFFFF",
  border: "#E8DCC3",
  borderFocus: "#9A6B14",
  bubbleBg: "#F3E9D1",
  bubbleText: "#1A140C",
  radius: 14,
  font: "fraunces",
  buttonStyle: "filled",
  progressBar: true,

  welcomeTitle: "Prends la parole pour ta commune.\nSur les traces de Bio Guera.",
  welcomeDescription:
    "Concours national des Talents de Bio Guera 2026. Ouvert à la jeunesse du Bénin, 15 à 35 ans, dans les 12 départements et les 77 communes. Une vidéo, une œuvre, une intention. Deux minutes pour candidater.",
  welcomeCta: "Candidater",

  doneTitle: "Ta candidature est enregistrée.",
  doneDescription:
    "Un email de confirmation part vers toi. Le comité Herit'Art étudie chaque dossier avant l'annonce des finalistes. Rendez-vous à la Grande Finale de Bembèrèkè. #SurLesTracesDeBioGuera",

  redirectUrl: "",

  avatarUrl: "",
  avatarName: "Herit'Art",
};
