export interface UpazilaInfo {
  description: string;
  descriptionBn: string;
  area: string;
  population: string;
  unions: number;
  villages: number;
}

export const UPAZILA_INFO: Record<string, UpazilaInfo> = {
  "Gaibandha Sadar": {
    description:
      "The administrative heart of the district, anchored along the Ghaghat river and home to the district headquarters.",
    descriptionBn:
      "জেলার প্রশাসনিক কেন্দ্র, ঘাঘট নদীর তীরে অবস্থিত এবং জেলা সদর এখানেই।",
    area: "320.3 km²",
    population: "437,000",
    unions: 18,
    villages: 213,
  },
  Sadullapur: {
    description:
      "A fertile northern upazila known for its rice fields, riverside settlements and rural craftsmanship.",
    descriptionBn:
      "উর্বর উত্তরাঞ্চলীয় উপজেলা, ধানখেত, নদীতীরের বসতি ও গ্রামীণ কারুশিল্পের জন্য পরিচিত।",
    area: "228.5 km²",
    population: "285,000",
    unions: 11,
    villages: 147,
  },
  Palashbari: {
    description:
      "A historic river town on the banks of the Brahmaputra, famed for its ancient temples and craft markets.",
    descriptionBn:
      "ব্রহ্মপুত্র নদের তীরে ঐতিহাসিক নদীবন্দর, প্রাচীন মন্দির ও কারুশিল্পের বাজারের জন্য বিখ্যাত।",
    area: "190.6 km²",
    population: "245,000",
    unions: 10,
    villages: 132,
  },
  Gobindaganj: {
    description:
      "The largest upazila by area, celebrated for its rich agricultural plains and the historic Bharatkhali.",
    descriptionBn:
      "আয়তনে সবচেয়ে বড় উপজেলা, সমৃদ্ধ কৃষিজমি ও ঐতিহাসিক ভারতখালীর জন্য পরিচিত।",
    area: "468.5 km²",
    population: "520,000",
    unions: 17,
    villages: 402,
  },
  Sundarganj: {
    description:
      "A northern frontier upazila defined by the Brahmaputra's shifting channels and fertile char lands.",
    descriptionBn:
      "উত্তরের সীমান্তবর্তী উপজেলা, ব্রহ্মপুত্রের পরিবর্তনশীল ধারা ও উর্বর চরভূমি দ্বারা গঠিত।",
    area: "426.5 km²",
    population: "410,000",
    unions: 15,
    villages: 318,
  },
  Fulchhari: {
    description:
      "A riverine upazila at the confluence of the Brahmaputra and Teesta, shaped by water and sandbars.",
    descriptionBn:
      "ব্রহ্মপুত্র ও তিস্তার মিলনস্থলে নদীবেষ্টিত উপজেলা, পানি ও বালুচরে গড়া।",
    area: "160.4 km²",
    population: "175,000",
    unions: 7,
    villages: 98,
  },
  Saghata: {
    description:
      "A serene upazila of wetlands and farmland, home to traditional fishing communities and river life.",
    descriptionBn:
      "জলাভূমি ও কৃষিজমির শান্ত উপজেলা, ঐতিহ্যবাহী জেলে সম্প্রদায় ও নদীর জীবনের আবাস।",
    area: "225.8 km²",
    population: "240,000",
    unions: 10,
    villages: 139,
  },
};
