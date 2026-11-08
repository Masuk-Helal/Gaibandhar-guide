export interface BusOperator {
  name: string;
  service: string;
  routes: string[];
  phone: string;
  facebook: string;
  source: string;
}

export const BUS_OPERATORS: BusOperator[] = [
  {
    name: "Orin Travels",
    service: "AC / Non-AC Coach Service",
    routes: [
      "Gaibandha → Dhaka (Kallyanpur)",
      "Gaibandha → Dhaka (Mohakhali)",
      "Rangpur → Dhaka (Mohakhali)",
      "Rangpur → Dhaka (Kallyanpur)",
      "Joypurhat / Hili → Dhaka (Kallyanpur)",
    ],
    phone: "01785-993004",
    facebook: "https://www.facebook.com/bus.OrinTravels/",
    source: "Orin Travels",
  },
];

export function getBusOperators(): BusOperator[] {
  return BUS_OPERATORS;
}
