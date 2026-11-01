/**
 * Official 57 Communes of Algiers Province (Wilaya 16)
 * Aligned with official Algerian Administrative Division (Daïras & Baladiyat)
 */
export const ALGIERS_COMMUNES: string[] = [
  "Alger Centre",
  "Sidi M'Hamed",
  "El Madania",
  "Belouizdad",
  "Bab El Oued",
  "Bologhine",
  "Casbah",
  "Oued Koriche",
  "Raïs Hamidou",
  "Bir Mourad Raïs",
  "El Biar",
  "Bouzaréah",
  "Ben Aknoun",
  "Hydra",
  "El Mouradia",
  "Birtouta",
  "Ouled Chebel",
  "Tessala El Merdja",
  "Birkhadem",
  "Djasr Kasentina (Gué de Constantine)",
  "Dely Ibrahim",
  "Chéraga",
  "Ouled Fayet",
  "El Achour",
  "Draria",
  "Douera",
  "Baba Hassen",
  "Saoula",
  "Khraicia",
  "Zéralda",
  "Staouéli",
  "Mahelma",
  "Rahmania",
  "Souidania",
  "Aïn Benian",
  "El Hammamet",
  "Hussein Dey",
  "Kouba",
  "El Magharia",
  "Bourouba",
  "El Harrach",
  "Baraki",
  "Oued Smar",
  "Bachdjerrah",
  "Les Eucalyptus",
  "Sidi Moussa",
  "Dar El Beïda",
  "Bab Ezzouar",
  "Bordj El Kiffan",
  "Mohammadia",
  "Bordj El Bahri",
  "El Marsa",
  "Aïn Taya",
  "H'raoua",
  "Rouïba",
  "Reghaïa",
  "Beni Messous",
];

export const POPULAR_STUDENT_COMMUNES: string[] = [
  "Bab Ezzouar",
  "Kouba",
  "Alger Centre",
  "Hydra",
  "Dely Ibrahim",
  "Chéraga",
  "El Harrach",
  "Bouzaréah",
  "Ben Aknoun",
  "Bir Mourad Raïs",
  "Rouïba",
  "Dar El Beïda",
];

export function searchAlgiersCommunes(query: string, limit = 8): string[] {
  const clean = (query || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  if (!clean) return [];
  return ALGIERS_COMMUNES.filter((c) => {
    const norm = c.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return norm.includes(clean);
  }).slice(0, limit);
}
