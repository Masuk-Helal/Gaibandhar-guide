import { translate, type Locale } from "@/lib/i18n";
import { getPlaceCoordinate } from "@/lib/place-coordinates";
import {
  UPAZILA_PLACES,
  UPAZILA_PROFILES,
  type Place,
  type PlaceCategory,
} from "./upazila-places";

export interface ExplorePlace extends Place {
  id: string;
  image: string;
  images: string[];
  reviews: number;
  tag: string;
  features: string[];
  latitude: number;
  longitude: number;
}

export interface CategoryMeta {
  label: string;
  singular: string;
  tagline: string;
  description: string;
  accent: string;
  searchPlaceholder: string;
}

export const CATEGORY_META: Record<PlaceCategory, CategoryMeta> = {
  hotels: {
    label: "Hotels",
    singular: "hotel",
    tagline: "Stays worth waking up for",
    description:
      "From riverside guesthouses to city hotels, find a comfortable base for your Gaibandha trip.",
    accent: "#fbbf24",
    searchPlaceholder: "Search hotels by name, area or price…",
  },
  restaurants: {
    label: "Restaurants",
    singular: "restaurant",
    tagline: "Taste the district",
    description:
      "Local Bengali kitchens, biryani houses, cafes and sweet shops across the upazila.",
    accent: "#fb923c",
    searchPlaceholder: "Search restaurants, cuisine or area…",
  },
  tourism: {
    label: "Tourism",
    singular: "place",
    tagline: "Follow the river",
    description:
      "Riverfronts, heritage corners, markets and quiet green spaces to explore.",
    accent: "#34d399",
    searchPlaceholder: "Search places, landmarks or experiences…",
  },
  hospital: {
    label: "Hospitals",
    singular: "hospital",
    tagline: "Care close to home",
    description:
      "Upazila health complexes, clinics, diagnostic centres and emergency care.",
    accent: "#f87171",
    searchPlaceholder: "Search hospitals, clinics or services…",
  },
  train: {
    label: "Train Tickets",
    singular: "train",
    tagline: "Ride the rails",
    description:
      "Intercity and local train options from Gaibandha Junction.",
    accent: "#22d3ee",
    searchPlaceholder: "Search trains, routes or departure times…",
  },
  bus: {
    label: "Bus Tickets",
    singular: "bus",
    tagline: "Hit the highway",
    description:
      "AC and non-AC coaches connecting Gaibandha with Dhaka, Rangpur and beyond.",
    accent: "#a78bfa",
    searchPlaceholder: "Search buses, operators or routes…",
  },
};

export const CATEGORY_ORDER: PlaceCategory[] = [
  "hotels",
  "restaurants",
  "tourism",
  "hospital",
  "train",
  "bus",
];

export function getCategoryMeta(
  category: PlaceCategory,
  locale: Locale
): CategoryMeta {
  const base = CATEGORY_META[category];
  if (locale === "en") return base;

  return {
    ...base,
    label: translate(locale, `categories.${category}.label`),
    tagline: translate(locale, `categories.${category}.tagline`),
    description: translate(locale, `categories.${category}.description`),
    searchPlaceholder: translate(
      locale,
      `categories.${category}.searchPlaceholder`
    ),
  };
}

const unsplash = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=80`;

// Dummy imagery — replace these URLs with real photos when available.
const CATEGORY_IMAGES: Record<PlaceCategory, string[]> = {
  hotels: [
    "/assets/img/hotels/ar-rahman.jpg",
    "/assets/img/hotels/mondol.jpg",
    "/assets/img/hotels/north-bengle.jpg",
    "/assets/img/hotels/sks1.jpg",
    "/assets/img/hotels/sks2.jpg",
    "/assets/img/hotels/sks3.jpg",
    "/assets/img/hotels/sks4.jpg",
    "/assets/img/hotels/sks5.jpg",
  ],
  restaurants: [
    "/assets/img/restaurants/restaurants1.jpg",
    "/assets/img/restaurants/restaurants2.jpg",
    "/assets/img/restaurants/restaurants3.jpg",
    "/assets/img/restaurants/restaurants4.jpg",
    "/assets/img/restaurants/restaurants5.jpg",
  ],
  tourism: [
    "/assets/img/tourism/tourism1.jpg",
    "/assets/img/tourism/tourism2.jpg",
    "/assets/img/tourism/tourism3.jpg",
    "/assets/img/tourism/tourism4.jpg",
    "/assets/img/tourism/tourism5.jpg",
  ],
  hospital: [
    "1586773860418-d37222d8fce3",
    "1519494026892-80bbd2d6fd0d",
    "1538108149393-fbbd81895907",
    "1551076805-e1869033e561",
    "1516549655169-df83a0774514",
    "1504439468489-c8920d796a29",
    "1579684385127-1ef15d508118",
    "1584982751601-97dcc096659c",
    "1631217868264-e5b90bb7e133",
  ].map(unsplash),
  train: [
    "/assets/img/train/train1.jpg",
    "/assets/img/train/train2.jpg",
    "/assets/img/train/train3.jpg",
    "/assets/img/train/train4.jpg",
    "/assets/img/train/train5.jpg",
  ],
  bus: [
    "/assets/img/bus/bus1.jpg",
    "/assets/img/bus/bus2.jfif",
    "/assets/img/bus/bus3.jfif",
    "/assets/img/bus/bus4.jfif",
    "/assets/img/bus/bus5.jfif",
    "/assets/img/bus/bus6.jfif",
  ],
};

const TAGS: Record<PlaceCategory, string[]> = {
  hotels: [
    "Boutique stay",
    "Budget friendly",
    "Riverside view",
    "Business stay",
    "Family friendly",
    "Heritage stay",
    "City centre",
    "Nature retreat",
    "Guest house",
  ],
  restaurants: [
    "Bengali kitchen",
    "Biryani house",
    "Cafe",
    "Family dining",
    "Street food",
    "Sweets",
    "Vegetarian",
    "Quick bites",
    "Riverside dining",
  ],
  tourism: [
    "Local landmark",
    "Riverfront",
    "Heritage walk",
    "Nature spot",
    "Photography",
    "Market",
    "Family day out",
    "Sunset point",
    "Village life",
  ],
  hospital: [
    "24/7 emergency",
    "Primary care",
    "Diagnostics",
    "Eye care",
    "Dental care",
    "Maternity",
    "Community clinic",
    "Pharmacy",
    "Ambulance",
  ],
  train: [
    "Intercity",
    "Night train",
    "Local passenger",
    "Commuter",
    "Express",
    "Sleeper",
    "AC chair",
    "Online booking",
    "Daily service",
  ],
  bus: [
    "AC coach",
    "Non-AC",
    "Intercity",
    "Local service",
    "Online booking",
    "Counter booking",
    "Night coach",
    "Family friendly",
    "Express",
  ],
};

const FEATURES: Record<PlaceCategory, string[]> = {
  hotels: [
    "Free Wi-Fi",
    "Parking",
    "Breakfast",
    "AC rooms",
    "Room service",
    "Riverside deck",
    "Family rooms",
    "Cafe",
    "24/7 front desk",
  ],
  restaurants: [
    "Dine-in",
    "Takeaway",
    "Family section",
    "Outdoor seating",
    "Card payment",
    "Home delivery",
    "Vegetarian options",
    "Late night",
    "Fresh fish",
  ],
  tourism: [
    "Walking route",
    "Photography",
    "Local guide",
    "Boat ride",
    "Family friendly",
    "Free entry",
    "Sunset view",
    "Historical",
    "Food stalls",
  ],
  hospital: [
    "Emergency",
    "Ambulance",
    "Pharmacy",
    "Lab tests",
    "X-ray",
    "Ultrasound",
    "Appointments",
    "Maternity care",
    "Vaccination",
  ],
  train: [
    "Online booking",
    "Counter ticket",
    "AC chair",
    "Sleeper",
    "Snacks",
    "Daily service",
    "Reserved seat",
    "Luggage space",
    "Prayer room",
  ],
  bus: [
    "Online booking",
    "Counter ticket",
    "AC",
    "Wi-Fi",
    "Reclining seats",
    "Night coach",
    "Luggage space",
    "Snacks stop",
    "Family friendly",
  ],
};

interface BuildContext {
  upazila: string;
  landmark: string;
  river: string;
}

function extraHotels({ upazila, landmark, river }: BuildContext): Place[] {
  return [
    {
      name: `${upazila} Grand Hotel`,
      detail: `Station Road, ${upazila}`,
      meta: "From ৳2,200 / night",
      rating: "4.6",
    },
    {
      name: `${landmark} Resort`,
      detail: `${landmark}, ${upazila}`,
      meta: "From ৳3,500 / night",
      rating: "4.7",
    },
    {
      name: `Hotel Blue ${river}`,
      detail: `Main bazar, ${upazila}`,
      meta: "From ৳1,100 / night",
      rating: "4.1",
    },
    {
      name: `${upazila} Boutique Stay`,
      detail: `Old town, ${upazila}`,
      meta: "From ৳1,800 / night",
      rating: "4.4",
    },
    {
      name: `The ${river} Retreat`,
      detail: `${river} riverside, ${upazila}`,
      meta: "From ৳2,800 / night",
      rating: "4.5",
    },
    {
      name: `${upazila} City Inn`,
      detail: `Bus stand area, ${upazila}`,
      meta: "From ৳950 / night",
      rating: "4.0",
    },
  ];
}

function extraRestaurants({ upazila, landmark, river }: BuildContext): Place[] {
  return [
    {
      name: `Spice of ${upazila}`,
      detail: `Station Road, ${upazila}`,
      meta: "Bengali · ৳150–400",
      rating: "4.5",
    },
    {
      name: `${river} Cafe`,
      detail: `${river} riverside, ${upazila}`,
      meta: "Cafe · ৳80–250",
      rating: "4.3",
    },
    {
      name: "Bismillah Biryani House",
      detail: `Bazar Road, ${upazila}`,
      meta: "Biryani · ৳120–300",
      rating: "4.4",
    },
    {
      name: "Green Leaf Restaurant",
      detail: `Main bazar, ${upazila}`,
      meta: "Bengali · ৳100–280",
      rating: "4.2",
    },
    {
      name: `${landmark} Diner`,
      detail: `${landmark}, ${upazila}`,
      meta: "Fast food · ৳60–200",
      rating: "4.0",
    },
    {
      name: `${upazila} Sweets & Snacks`,
      detail: `Old town, ${upazila}`,
      meta: "Sweets · ৳40–150",
      rating: "4.1",
    },
  ];
}

function extraTourism({ upazila, landmark, river }: BuildContext): Place[] {
  return [
    {
      name: `${upazila} Central Park`,
      detail: `${upazila} town centre`,
      meta: "Park · Free entry",
      rating: "4.3",
    },
    {
      name: `${river} Sunset Point`,
      detail: `${river} bank, ${upazila}`,
      meta: "Viewpoint · Free",
      rating: "4.6",
    },
    {
      name: `${upazila} Old Bazar`,
      detail: `Old town, ${upazila}`,
      meta: "Heritage market",
      rating: "4.2",
    },
    {
      name: `${landmark} Museum`,
      detail: `${landmark}, ${upazila}`,
      meta: "Museum · ৳50",
      rating: "4.4",
    },
    {
      name: `${upazila} River Ghat`,
      detail: `${river} ghat, ${upazila}`,
      meta: "Riverfront · Free",
      rating: "4.5",
    },
    {
      name: `${upazila} Village Walk`,
      detail: `Rural ${upazila}`,
      meta: "Guided walk",
      rating: "4.1",
    },
  ];
}

function extraHospitals({ upazila, river }: BuildContext): Place[] {
  return [
    {
      name: `${upazila} Mother & Child Clinic`,
      detail: `Hospital Road, ${upazila}`,
      meta: "Maternity care",
      rating: "4.4",
    },
    {
      name: `${river} Diagnostic Centre`,
      detail: `Bazar Road, ${upazila}`,
      meta: "Lab & imaging",
      rating: "4.2",
    },
    {
      name: `${upazila} Dental Care`,
      detail: `Station Road, ${upazila}`,
      meta: "Dental clinic",
      rating: "4.1",
    },
    {
      name: `${upazila} Eye Hospital`,
      detail: `Main road, ${upazila}`,
      meta: "Eye care",
      rating: "4.5",
    },
    {
      name: `${upazila} General Hospital`,
      detail: `Central ${upazila}`,
      meta: "General medicine",
      rating: "4.3",
    },
    {
      name: `${upazila} Community Health Centre`,
      detail: `Union area, ${upazila}`,
      meta: "Primary care",
      rating: "4.0",
    },
  ];
}

function extraTrains({ upazila }: BuildContext): Place[] {
  return [
    {
      name: "Gaibandha Mail",
      detail: `${upazila} · Gaibandha Junction → Dhaka`,
      meta: "Daily · 22:10",
      rating: "4.3",
    },
    {
      name: "Teesta Express",
      detail: `${upazila} · Gaibandha Junction → Rangpur`,
      meta: "Daily · 08:45",
      rating: "4.4",
    },
    {
      name: "Bonarpara Local",
      detail: `${upazila} · Gaibandha Junction → Bonarpara`,
      meta: "Daily · 13:20",
      rating: "4.0",
    },
    {
      name: "Rangpur Commuter",
      detail: `${upazila} · Gaibandha Junction → Rangpur`,
      meta: "Daily · 15:50",
      rating: "4.1",
    },
    {
      name: "Gaibandha Night Coach",
      detail: `${upazila} · Gaibandha Junction → Dhaka`,
      meta: "Daily · 23:40",
      rating: "4.2",
    },
    {
      name: "Brahmaputra Express",
      detail: `${upazila} · Gaibandha Junction → Bogura`,
      meta: "Daily · 18:30",
      rating: "4.3",
    },
  ];
}

function extraBuses({ upazila }: BuildContext): Place[] {
  return [
    {
      name: "Orin Travels",
      detail: `${upazila} → Dhaka (Mohakhali / Gabtoli)`,
      meta: "AC & Non-AC coach · ৳450–900",
      rating: "4.4",
    },
    {
      name: "Alhamra Paribahan",
      detail: `${upazila} → Dhaka`,
      meta: "AC & Non-AC coach · ৳450–800",
      rating: "4.3",
    },
    {
      name: "SR Travels (Pvt.) Ltd.",
      detail: `${upazila} → Dhaka / Bogura`,
      meta: "AC & Non-AC coach · ৳450–650",
      rating: "4.2",
    },
    {
      name: "Hanif Enterprise",
      detail: `${upazila} → Dhaka`,
      meta: "Non-AC & AC coach · from ৳450",
      rating: "4.1",
    },
  ];
}

const EXTRA_BUILDERS: Record<PlaceCategory, (ctx: BuildContext) => Place[]> = {
  hotels: extraHotels,
  restaurants: extraRestaurants,
  tourism: extraTourism,
  hospital: extraHospitals,
  train: extraTrains,
  bus: extraBuses,
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function getExplorePlaces(
  category: PlaceCategory,
  upazila: string
): ExplorePlace[] {
  const profile = UPAZILA_PROFILES[upazila] ?? {
    landmark: "Riverside Park",
    river: "Brahmaputra",
  };
  const base = UPAZILA_PLACES[upazila]?.[category] ?? [];
  const extras = EXTRA_BUILDERS[category]({ upazila, ...profile });
  const images = CATEGORY_IMAGES[category];
  const tags = TAGS[category];
  const features = FEATURES[category];

  return [...base, ...extras].map((place, index) => {
    const gallery = Array.from(
      { length: 5 },
      (_, offset) => images[(index + offset) % images.length]
    );
    const id = `${category}-${slugify(upazila)}-${index}`;
    const coordinate = getPlaceCoordinate(upazila, index, id);

    return {
      ...place,
      id,
      image: gallery[0],
      images: gallery,
      reviews: 96 + ((index * 47 + upazila.length * 19) % 640),
      tag: tags[index % tags.length],
      latitude: coordinate.latitude,
      longitude: coordinate.longitude,
      features: [
        features[index % features.length],
        features[(index + 3) % features.length],
        features[(index + 6) % features.length],
      ],
    };
  });
}
