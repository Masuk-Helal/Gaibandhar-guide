import type { ExplorePlace } from "@/data/explore-places";
import { UPAZILA_PROFILES } from "@/data/upazila-places";

export interface HotelRoomOption {
  id: string;
  refundable: boolean;
  breakfast: boolean;
  cancellation: string;
  capacity: string;
  benefits: string[];
  originalPrice: number;
  discountedPrice: number;
  perNight: number;
  discountPct: number;
  taxesIncluded: boolean;
}

export interface HotelRoom {
  id: string;
  name: string;
  images: string[];
  bedType: string;
  maxGuests: number;
  roomSizeSqft: number;
  facilities: string[];
  amenities: string[];
  options: HotelRoomOption[];
}

export interface HotelReview {
  id: string;
  name: string;
  date: string;
  score: number;
  text: string;
  categoryScores: { label: string; value: number }[];
}

export interface HotelNearbyItem {
  id: string;
  name: string;
  category: string;
  distanceKm: number;
  meta?: string;
}

function hashCode(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (Math.imul(31, hash) + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export function parseBasePrice(meta: string): number {
  const match = meta.match(/৳\s*([\d,]+)/);
  if (match) {
    const parsed = Number(match[1].replace(/,/g, ""));
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }
  const generic = meta.match(/([\d,]+)/);
  if (generic) {
    const parsed = Number(generic[1].replace(/,/g, ""));
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }
  return 1200;
}

export function formatBDT(value: number): string {
  return `৳${Math.round(value).toLocaleString("en-IN")}`;
}

function ratingLabel(rating: number): string {
  if (rating >= 4.5) return "Excellent";
  if (rating >= 4.0) return "Very Good";
  if (rating >= 3.5) return "Good";
  return "Fair";
}

function ratingLabelKey(rating: number): "hotel.excellent" | "hotel.veryGood" | "hotel.good" {
  if (rating >= 4.5) return "hotel.excellent";
  if (rating >= 4.0) return "hotel.veryGood";
  return "hotel.good";
}

export interface HotelDetailsDerived {
  rating: number;
  ratingLabel: string;
  ratingLabelKey: ReturnType<typeof ratingLabelKey>;
  reviewCategories: { label: string; value: number }[];
  rooms: HotelRoom[];
  reviews: HotelReview[];
  nearbyPlaces: HotelNearbyItem[];
  facilitiesByCategory: { label: string; items: string[] }[];
  policies: { title: string; body: string }[];
  propertyInfo: { label: string; value: string }[];
  starRating: number;
  description: string;
}

const ROOM_TYPES = [
  { name: "Deluxe King Room", bed: "King bed", guests: 2, size: 320 },
  { name: "Premium Twin Room", bed: "2 Twin beds", guests: 3, size: 380 },
  { name: "Family Suite", bed: "King + 2 Twin beds", guests: 4, size: 520 },
];

const REVIEW_NAMES = ["Tanvir H.", "Rahim U.", "Farhana K.", "Sharif M.", "Nasrin A.", "Kamrul H."];
const REVIEW_TEXTS = [
  "Clean rooms, helpful staff and a great location for exploring Gaibandha. The room was quiet and comfortable.",
  "Good value for money. Breakfast was fresh and the front desk was very cooperative.",
  "Nice stay near the riverside. Wi-Fi could be faster, but overall a pleasant experience.",
  "Spacious family room with modern amenities. Check-in was quick and smooth.",
];

const STAY_LABEL = "Nearby stay";

export function getHotelDetails(
  place: ExplorePlace,
  upazila: string,
  categoryPlaces: ExplorePlace[]
): HotelDetailsDerived {
  const seed = hashCode(`${place.id}|${place.name}|${upazila}`);
  const rating = Number(place.rating) || 0;
  const basePrice = parseBasePrice(place.meta);
  const profile = UPAZILA_PROFILES[upazila] ?? { landmark: "Riverside Park", river: "Brahmaputra" };

  const roomImages = place.images?.length ? place.images : [place.image];
  const ROOM_THUMBNAILS = ["/assets/img/hotels/sks1.jpg", "/assets/img/hotels/sks2.jpg"];
  const rooms: HotelRoom[] = ROOM_TYPES.map((type, index) => {
    const price = Math.round(basePrice * [1, 1.25, 1.8][index]);
    const discountPct = [18, 12, 10][index];
    const discounted = Math.round(price * (1 - discountPct / 100));
    const images = Array.from({ length: 3 }, (_, offset) => roomImages[(index + offset) % roomImages.length]);
    if (ROOM_THUMBNAILS[index]) images[0] = ROOM_THUMBNAILS[index];
    return {
      id: `${place.id}-room-${index}`,
      name: type.name,
      images,
      bedType: type.bed,
      maxGuests: type.guests,
      roomSizeSqft: type.size,
      facilities: ["AC", "Free Wi-Fi", "TV", "Attached bath"],
      amenities: ["Tea/coffee maker", "Work desk", "Wardrobe", "Hot water", "Laundry", "Intercom"],
      options: [
        {
          id: `${place.id}-opt-${index}-a`,
          refundable: true,
          breakfast: true,
          cancellation: "Free cancellation before check-in",
          capacity: `${type.guests} guests`,
          benefits: ["Breakfast included", "Free cancellation"],
          originalPrice: price,
          discountedPrice: discounted,
          perNight: discounted,
          discountPct,
          taxesIncluded: true,
        },
        {
          id: `${place.id}-opt-${index}-b`,
          refundable: false,
          breakfast: false,
          cancellation: "Non-refundable",
          capacity: `${type.guests} guests`,
          benefits: ["Best rate guaranteed"],
          originalPrice: price,
          discountedPrice: Math.round(discounted * 0.93),
          perNight: Math.round(discounted * 0.93),
          discountPct: discountPct + 4,
          taxesIncluded: true,
        },
      ],
    };
  });

  const categories = [
    { label: "Cleanliness", value: Math.min(5, Math.max(3, rating + 0.2)) },
    { label: "Comfort", value: Math.min(5, Math.max(3, rating)) },
    { label: "Location", value: Math.min(5, Math.max(3, rating + 0.3)) },
    { label: "Facilities", value: Math.min(5, Math.max(3, rating - 0.1)) },
    { label: "Staff", value: Math.min(5, Math.max(3, rating + 0.4)) },
    { label: "Value for money", value: Math.min(5, Math.max(3, rating - 0.2)) },
  ];

  const reviews: HotelReview[] = REVIEW_NAMES.slice(0, 4).map((name, index) => {
    const score = Math.min(10, Math.max(6, Math.round(rating * 2) + (index % 2 === 0 ? 0 : -1)));
    return {
      id: `${place.id}-review-${index}`,
      name,
      date: `${2025 + (index % 2)}-${String((index % 9) + 1).padStart(2, "0")}-15`,
      score,
      text: REVIEW_TEXTS[(seed + index) % REVIEW_TEXTS.length],
      categoryScores: categories.slice(0, 3),
    };
  });

  const other = categoryPlaces.filter((p) => p.id !== place.id);
  const nearbyPlaces: HotelNearbyItem[] = [
    ...other.slice(0, 4).map((p, index) => ({
      id: p.id,
      name: p.name,
      category: STAY_LABEL,
      distanceKm: Number((0.5 + ((seed + index * 13) % 20) / 10).toFixed(1)),
      meta: p.detail,
    })),
    {
      id: `${place.id}-near-landmark`,
      name: profile.landmark,
      category: "Tourism",
      distanceKm: Number((0.8 + (seed % 15) / 10).toFixed(1)),
    },
    {
      id: `${place.id}-near-river`,
      name: `${profile.river} Riverside`,
      category: "Tourism",
      distanceKm: Number((1.2 + (seed % 12) / 10).toFixed(1)),
    },
  ].slice(0, 6);

  const facilitiesByCategory = [
    { label: "General", items: ["Free Wi-Fi", "24/7 front desk", "AC rooms", "Non-smoking rooms"] },
    { label: "Food & Drink", items: ["Restaurant", "Breakfast", "Room service", "Cafe"] },
    { label: "Parking", items: ["Free parking", "Car rental"] },
    { label: "Safety & Security", items: ["CCTV", "Daily housekeeping", "Safe deposit box"] },
    { label: "Transportation", items: ["Airport shuttle", "Bus stand nearby"] },
    { label: "Services & Extras", items: ["Laundry", "Luggage storage", "Currency exchange"] },
  ];

  const policies = [
    { title: "Check-in / Check-out", body: "Check-in from 2:00 PM · Check-out until 12:00 PM. Government-issued photo ID and a valid address proof are required at check-in." },
    { title: "Cancellation policy", body: "Free cancellation is available on refundable room options if cancelled before check-in. Non-refundable options are charged in full in case of cancellation." },
    { title: "Children & extra beds", body: "Children of all ages are welcome. Extra beds may be available on request and may incur an additional charge." },
    { title: "Pets", body: "Pets are not allowed on this property." },
    { title: "Payment", body: "All major debit and credit cards accepted. Pay at the property or choose pay-online where available." },
    { title: "Special instructions", body: "Please inform the property of your expected arrival time. Early check-in and late check-out are subject to availability." },
  ];

  return {
    rating,
    ratingLabel: ratingLabel(rating),
    ratingLabelKey: ratingLabelKey(rating),
    reviewCategories: categories,
    rooms,
    reviews,
    nearbyPlaces,
    facilitiesByCategory,
    policies,
    propertyInfo: [
      { label: "Number of rooms", value: `${18 + (seed % 24)} rooms` },
      { label: "Floors", value: `${2 + (seed % 5)} floors` },
      { label: "Established", value: `${2012 + (seed % 10)}` },
      { label: "Property type", value: "Hotel" },
    ],
    starRating: rating >= 4.5 ? 4 : rating >= 4.0 ? 4 : 3,
    description: `${place.name} is a comfortable ${rating >= 4.0 ? "premium" : "budget-friendly"} stay in ${upazila}, Gaibandha, located near ${place.detail}. Guests can enjoy well-appointed rooms, reliable Wi-Fi, and easy access to local landmarks. The property offers a relaxed atmosphere suitable for both business and leisure travellers visiting the district.`,
  };
}
