// 12 départements du Bénin, 77 communes. Source : Institut National de la
// Statistique et de la Démographie (INSAE / INStaD). Total : 77 communes.
// L'ordre des communes suit l'ordre alphabétique intra-département.

export type Department = {
  id: string; // slug ASCII stable (utilisé comme valeur stockée)
  name: string; // libellé affiché en français
  communes: { id: string; name: string }[];
};

export const BENIN_DEPARTMENTS: Department[] = [
  {
    id: "alibori",
    name: "Alibori",
    communes: [
      { id: "banikoara", name: "Banikoara" },
      { id: "gogounou", name: "Gogounou" },
      { id: "kandi", name: "Kandi" },
      { id: "karimama", name: "Karimama" },
      { id: "malanville", name: "Malanville" },
      { id: "segbana", name: "Ségbana" },
    ],
  },
  {
    id: "atacora",
    name: "Atacora",
    communes: [
      { id: "boukoumbe", name: "Boukoumbé" },
      { id: "cobly", name: "Cobly" },
      { id: "kerou", name: "Kérou" },
      { id: "kouande", name: "Kouandé" },
      { id: "materi", name: "Matéri" },
      { id: "natitingou", name: "Natitingou" },
      { id: "pehonko", name: "Péhonko" },
      { id: "tanguieta", name: "Tanguiéta" },
      { id: "toucountouna", name: "Toucountouna" },
    ],
  },
  {
    id: "atlantique",
    name: "Atlantique",
    communes: [
      { id: "abomey_calavi", name: "Abomey-Calavi" },
      { id: "allada", name: "Allada" },
      { id: "kpomasse", name: "Kpomassè" },
      { id: "ouidah", name: "Ouidah" },
      { id: "so_ava", name: "Sô-Ava" },
      { id: "toffo", name: "Toffo" },
      { id: "tori_bossito", name: "Tori-Bossito" },
      { id: "ze", name: "Zè" },
    ],
  },
  {
    id: "borgou",
    name: "Borgou",
    communes: [
      { id: "bembereke", name: "Bembèrèkè" },
      { id: "kalale", name: "Kalalé" },
      { id: "ndali", name: "N'Dali" },
      { id: "nikki", name: "Nikki" },
      { id: "parakou", name: "Parakou" },
      { id: "perere", name: "Pèrèrè" },
      { id: "sinende", name: "Sinendé" },
      { id: "tchaourou", name: "Tchaourou" },
    ],
  },
  {
    id: "collines",
    name: "Collines",
    communes: [
      { id: "bante", name: "Bantè" },
      { id: "dassa_zoume", name: "Dassa-Zoumè" },
      { id: "glazoue", name: "Glazoué" },
      { id: "ouesse", name: "Ouèssè" },
      { id: "savalou", name: "Savalou" },
      { id: "save", name: "Savè" },
    ],
  },
  {
    id: "couffo",
    name: "Couffo",
    communes: [
      { id: "aplahoue", name: "Aplahoué" },
      { id: "djakotomey", name: "Djakotomey" },
      { id: "dogbo", name: "Dogbo" },
      { id: "klouekanme", name: "Klouékanmè" },
      { id: "lalo", name: "Lalo" },
      { id: "toviklin", name: "Toviklin" },
    ],
  },
  {
    id: "donga",
    name: "Donga",
    communes: [
      { id: "bassila", name: "Bassila" },
      { id: "copargo", name: "Copargo" },
      { id: "djougou", name: "Djougou" },
      { id: "ouake", name: "Ouaké" },
    ],
  },
  {
    id: "littoral",
    name: "Littoral",
    communes: [{ id: "cotonou", name: "Cotonou" }],
  },
  {
    id: "mono",
    name: "Mono",
    communes: [
      { id: "athieme", name: "Athiémé" },
      { id: "bopa", name: "Bopa" },
      { id: "come", name: "Comè" },
      { id: "grand_popo", name: "Grand-Popo" },
      { id: "houeyogbe", name: "Houéyogbé" },
      { id: "lokossa", name: "Lokossa" },
    ],
  },
  {
    id: "oueme",
    name: "Ouémé",
    communes: [
      { id: "adjarra", name: "Adjarra" },
      { id: "adjohoun", name: "Adjohoun" },
      { id: "aguegues", name: "Aguégués" },
      { id: "akpro_misserete", name: "Akpro-Missérété" },
      { id: "avrankou", name: "Avrankou" },
      { id: "bonou", name: "Bonou" },
      { id: "dangbo", name: "Dangbo" },
      { id: "porto_novo", name: "Porto-Novo" },
      { id: "seme_kpodji", name: "Sèmè-Kpodji" },
    ],
  },
  {
    id: "plateau",
    name: "Plateau",
    communes: [
      { id: "adja_ouere", name: "Adja-Ouèrè" },
      { id: "ifangni", name: "Ifangni" },
      { id: "ketou", name: "Kétou" },
      { id: "pobe", name: "Pobè" },
      { id: "sakete", name: "Sakété" },
    ],
  },
  {
    id: "zou",
    name: "Zou",
    communes: [
      { id: "abomey", name: "Abomey" },
      { id: "agbangnizoun", name: "Agbangnizoun" },
      { id: "bohicon", name: "Bohicon" },
      { id: "cove", name: "Cové" },
      { id: "djidja", name: "Djidja" },
      { id: "ouinhi", name: "Ouinhi" },
      { id: "za_kpota", name: "Za-Kpota" },
      { id: "zagnanado", name: "Zagnanado" },
      { id: "zogbodomey", name: "Zogbodomey" },
    ],
  },
];

export function findDepartment(id: string): Department | undefined {
  return BENIN_DEPARTMENTS.find((d) => d.id === id);
}

export function findCommune(
  departmentId: string,
  communeId: string
): { id: string; name: string } | undefined {
  return findDepartment(departmentId)?.communes.find((c) => c.id === communeId);
}

// Value stored in the Sheet as "<dept_id>:<commune_id>", e.g. "borgou:bembereke".
export function encodeGeo(departmentId: string, communeId: string): string {
  return `${departmentId}:${communeId}`;
}

export function decodeGeo(v: string): { departmentId: string; communeId: string } {
  const [departmentId, communeId] = v.split(":");
  return { departmentId: departmentId ?? "", communeId: communeId ?? "" };
}

export function formatGeoLabel(v: string): string {
  const { departmentId, communeId } = decodeGeo(v);
  const dept = findDepartment(departmentId);
  const commune = dept?.communes.find((c) => c.id === communeId);
  if (dept && commune) return `${commune.name} (${dept.name})`;
  if (dept) return dept.name;
  return v;
}
