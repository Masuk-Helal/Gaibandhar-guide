export type PlaceCategory =
  | "hotels"
  | "restaurants"
  | "tourism"
  | "hospital"
  | "train"
  | "bus";

export interface Place {
  name: string;
  detail: string;
  meta: string;
  rating: string;
}

export interface PlaceProfile {
  landmark: string;
  river: string;
}

export const UPAZILA_PROFILES: Record<string, PlaceProfile> = {
  "Gaibandha Sadar": {
    landmark: "Ghaghat Riverfront",
    river: "Ghaghat",
  },
  Sadullapur: {
    landmark: "Sadullapur Rice Fields",
    river: "Brahmaputra",
  },
  Palashbari: {
    landmark: "Palashbari Temple",
    river: "Brahmaputra",
  },
  Gobindaganj: {
    landmark: "Bharatkhali",
    river: "Brahmaputra",
  },
  Sundarganj: {
    landmark: "Sundarganj Char Lands",
    river: "Brahmaputra",
  },
  Fulchhari: {
    landmark: "Teesta Confluence",
    river: "Teesta",
  },
  Saghata: {
    landmark: "Saghata Wetlands",
    river: "Brahmaputra",
  },
};

function build(name: string): Record<PlaceCategory, Place[]> {
  const profile = UPAZILA_PROFILES[name] ?? {
    landmark: "Riverside Park",
    river: "Brahmaputra",
  };
  const { landmark, river } = profile;

  return {
    hotels: [
      {
        name: `${name} Residential Hotel`,
        detail: `Central bus stand, ${name}`,
        meta: "From ৳700 / night",
        rating: "4.2",
      },
      {
        name: `${landmark} View Hotel`,
        detail: `${landmark}, ${name}`,
        meta: "From ৳1,200 / night",
        rating: "4.5",
      },
      {
        name: `${river} Guest House`,
        detail: `Riverside, ${name}`,
        meta: "From ৳900 / night",
        rating: "4.1",
      },
    ],
    restaurants: [
      {
        name: `${name} Bazar Kitchen`,
        detail: `Main bazar, ${name}`,
        meta: "Bengali · ৳100–250",
        rating: "4.3",
      },
      {
        name: "Bismillah Hotel & Restaurant",
        detail: `Station Road, ${name}`,
        meta: "Rice & curry · ৳80–200",
        rating: "4.1",
      },
      {
        name: `${landmark} Food Corner`,
        detail: `${landmark}, ${name}`,
        meta: "Snacks & tea · ৳40–150",
        rating: "4.0",
      },
    ],
    tourism: [
      {
        name: landmark,
        detail: `${name}, Gaibandha`,
        meta: "Local landmark",
        rating: "4.5",
      },
      {
        name: `${river} Riverside`,
        detail: `${name}, Gaibandha`,
        meta: "Sunset viewpoint",
        rating: "4.4",
      },
      {
        name: `${name} Heritage Walk`,
        detail: `${name} old town`,
        meta: "Walking route",
        rating: "4.2",
      },
    ],
    hospital: [
      {
        name: `${name} Upazila Health Complex`,
        detail: `Health Complex Road, ${name}`,
        meta: "24/7 emergency",
        rating: "4.3",
      },
      {
        name: `${name} Community Clinic`,
        detail: `Union parishad area, ${name}`,
        meta: "Primary care",
        rating: "4.0",
      },
      {
        name: `${name} Diagnostic & Eye Care`,
        detail: `Bazar Road, ${name}`,
        meta: "Diagnostics · 9am–9pm",
        rating: "4.1",
      },
    ],
    train: [
      {
        name: "Gaibandha Express",
        detail: `${name} · Gaibandha Junction → Dhaka`,
        meta: "Daily · 07:30",
        rating: "4.4",
      },
      {
        name: "Rangpur Express",
        detail: `${name} · Gaibandha Junction → Rangpur`,
        meta: "Daily · 10:15",
        rating: "4.2",
      },
      {
        name: "Local Passenger",
        detail: `${name} · Gaibandha Junction → Bonarpara`,
        meta: "Daily · 16:40",
        rating: "4.0",
      },
    ],
    bus: [
      {
        name: `${name} Bus Terminal`,
        detail: `Central bus stand, ${name}`,
        meta: "Local & intercity ticketing",
        rating: "4.0",
      },
    ],
  };
}

export const UPAZILA_PLACES: Record<
  string,
  Record<PlaceCategory, Place[]>
> = Object.fromEntries(
  Object.keys(UPAZILA_PROFILES).map((name) => [name, build(name)])
);
