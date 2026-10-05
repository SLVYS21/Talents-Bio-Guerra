export type FieldType =
  | "text"
  | "email"
  | "phone"
  | "country_phone"
  | "choice"
  | "number"
  | "textarea"
  | "date"
  | "checkbox"
  | "url"
  | "cascading_choice"
  | "file_cloudinary"
  | "group_members";

export type Choice = { value: string; label: string };

// Visibilité conditionnelle sur une question. Évaluée à chaque render de FormShell.
// - eq / neq : compare la valeur brute (string) d'une autre réponse
// - age_lt / age_gte : compare l'âge dérivé d'une réponse de type "date" (YYYY-MM-DD)
export type Condition =
  | { kind: "eq"; field: string; value: string }
  | { kind: "neq"; field: string; value: string }
  | { kind: "age_lt"; field: string; value: number }
  | { kind: "age_gte"; field: string; value: number };

export type Question = {
  id: string;
  type: FieldType;
  label: string;
  hint?: string;
  placeholder?: string;
  required: boolean;
  choices?: Choice[];
  // Textarea max characters (rendered as counter + hard maxLength).
  maxLength?: number;
  // For "checkbox" type : the exact affirmation to display next to the box.
  // Facultatif : à défaut on retombe sur "J'accepte".
  checkboxLabel?: string;
  // For "group_members" type : le nombre max de membres additionnels.
  groupMax?: number;
  // Visibilité conditionnelle (undefined = toujours visible).
  condition?: Condition;
};

export const DEFAULT_QUESTIONS: Question[] = [
  {
    id: "first_name",
    type: "text",
    label: "Pour commencer, quel est ton prénom ?",
    placeholder: "Ex. Awa",
    required: true,
  },
  {
    id: "last_name",
    type: "text",
    label: "Et ton nom de famille ?",
    placeholder: "Ex. Adjovi",
    required: true,
  },
  {
    id: "email",
    type: "email",
    label: "Ton meilleur email ?",
    hint: "On t'y envoie ta confirmation de candidature.",
    placeholder: "toi@exemple.com",
    required: true,
  },
  {
    id: "whatsapp",
    type: "country_phone",
    label: "Ton numéro WhatsApp ?",
    hint: "On t'écrit dessus si tu es sélectionné(e). Bénin par défaut, tu peux changer.",
    placeholder: "00 00 00 00 00",
    required: true,
  },
  {
    id: "date_of_birth",
    type: "date",
    label: "Ta date de naissance ?",
    hint: "Le concours est ouvert aux 15-35 ans.",
    required: true,
  },
  {
    id: "parental_consent",
    type: "checkbox",
    label: "Tu as moins de 18 ans. Autorisation parentale requise.",
    checkboxLabel:
      "Mon parent ou mon tuteur légal a donné son accord écrit pour ma participation au concours et je pourrai le fournir sur demande.",
    hint: "Obligatoire pour les mineurs (règlement du concours).",
    required: true,
    condition: { kind: "age_lt", field: "date_of_birth", value: 18 },
  },
  {
    id: "location",
    type: "cascading_choice",
    label: "Tu représentes quelle commune ?",
    hint: "Choisis d'abord ton département, puis ta commune de résidence.",
    required: true,
  },
  {
    id: "participation_type",
    type: "choice",
    label: "Tu candidates seul(e) ou en groupe ?",
    required: true,
    choices: [
      { value: "solo", label: "En solo" },
      { value: "group", label: "En groupe (jusqu'à 5 personnes)" },
    ],
  },
  {
    id: "group_members",
    type: "group_members",
    label: "Les autres membres de ton groupe.",
    hint: "Ajoute jusqu'à 4 co-participants. Tu es le/la responsable du groupe.",
    required: true,
    groupMax: 4,
    condition: { kind: "eq", field: "participation_type", value: "group" },
  },
  {
    id: "category",
    type: "choice",
    label: "Dans quelle discipline concoures-tu ?",
    hint: "Une seule catégorie par candidature.",
    required: true,
    choices: [
      { value: "musique", label: "Musique" },
      { value: "danse", label: "Danse" },
      { value: "slam_poesie", label: "Slam & Poésie" },
      { value: "theatre", label: "Théâtre" },
      { value: "cinema", label: "Cinéma & courts-métrages" },
      { value: "arts_plastiques", label: "Arts plastiques (peinture, sculpture)" },
      { value: "photographie", label: "Photographie" },
      { value: "mode", label: "Mode & stylisme" },
    ],
  },
  {
    id: "work_title",
    type: "text",
    label: "Le titre de ton œuvre ?",
    placeholder: "Ex. Sur les traces du roi",
    required: true,
  },
  {
    id: "work_description",
    type: "textarea",
    label: "Décris ton œuvre en quelques lignes.",
    hint: "Note d'intention, contexte, message. Max 500 caractères.",
    placeholder:
      "Ce que raconte ton œuvre, ce qui l'a inspirée, ce qu'elle veut transmettre…",
    required: true,
    maxLength: 500,
  },
  {
    id: "portrait_photo_url",
    type: "file_cloudinary",
    label: "Une photo de portrait de toi (ou du groupe).",
    hint: "Format carré ou 4:5 idéal, JPG/PNG, 5 Mo max.",
    required: true,
  },
  {
    id: "video_link",
    type: "url",
    label: "Le lien de ta vidéo de démonstration.",
    hint: "TikTok, Google Drive, YouTube ou Facebook. La vidéo doit contenir le script officiel #SurLesTracesDeBioGuera.",
    placeholder: "https://",
    required: true,
  },
  {
    id: "rules_consent",
    type: "checkbox",
    label: "Dernier point avant d'envoyer.",
    checkboxLabel:
      "J'accepte le règlement du concours et j'autorise HERIT'ART à utiliser mon image et ma création dans le cadre de la promotion du Festival Bio Guera 2026.",
    required: true,
  },
];
