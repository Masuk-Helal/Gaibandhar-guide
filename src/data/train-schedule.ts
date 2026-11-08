export interface TrainSchedule {
  name: string;
  nameBn: string;
  departure: string;
  arrival: string;
  type: string;
  offDay: string;
  offDayBn: string;
  duration: string;
  runsDaily: boolean;
  source: string;
}

export interface TrainRouteSummary {
  route: string;
  totalTrains: number;
  firstDeparture: string;
  lastDeparture: string;
  fastestJourney: string;
  source: string;
  lastUpdated: string;
}

export const GAIBANDHA_TO_BOGURA: TrainRouteSummary = {
  route: "Gaibandha → Bogura",
  totalTrains: 5,
  firstDeparture: "11:27 am",
  lastDeparture: "10:47 pm",
  fastestJourney: "01:14",
  source: "TrainJatri.com",
  lastUpdated: "24th August, 2026",
};

export const GAIBANDHA_TO_BOGURA_SCHEDULE: TrainSchedule[] = [
  {
    name: "LALMONI EXPRESS",
    nameBn: "লালমনি এক্সপ্রেস",
    departure: "11:27 am",
    arrival: "12:41 pm",
    type: "InterCity",
    offDay: "Friday",
    offDayBn: "শুক্রবার",
    duration: "01:14",
    runsDaily: false,
    source: "TrainJatri.com",
  },
  {
    name: "DOLONCHAPA EXPRESS",
    nameBn: "দোলনচাঁপা এক্সপ্রেস",
    departure: "12:57 pm",
    arrival: "02:49 pm",
    type: "InterCity",
    offDay: "Runs all 7 days a week",
    offDayBn: "সপ্তাহের প্রতিদিন চলে",
    duration: "01:52",
    runsDaily: true,
    source: "TrainJatri.com",
  },
  {
    name: "KOROTOA EXPRESS",
    nameBn: "করতোয়া এক্সপ্রেস",
    departure: "08:23 pm",
    arrival: "09:45 pm",
    type: "InterCity",
    offDay: "Wednesday",
    offDayBn: "বুধবার",
    duration: "01:22",
    runsDaily: false,
    source: "TrainJatri.com",
  },
  {
    name: "RANGPUR EXPRESS",
    nameBn: "রংপুর এক্সপ্রেস",
    departure: "09:52 pm",
    arrival: "11:15 pm",
    type: "InterCity",
    offDay: "Sunday",
    offDayBn: "রবিবার",
    duration: "01:23",
    runsDaily: false,
    source: "TrainJatri.com",
  },
  {
    name: "BURIMARI EXPRESS",
    nameBn: "বুড়িমারী এক্সপ্রেস",
    departure: "10:47 pm",
    arrival: "12:03 am",
    type: "InterCity",
    offDay: "Tuesday",
    offDayBn: "মঙ্গলবার",
    duration: "01:16",
    runsDaily: false,
    source: "TrainJatri.com",
  },
];

export function getTrainSchedule(route: string): TrainSchedule[] | null {
  const key = route.toLowerCase().replace(/\s+/g, " ");
  if (key.includes("gaibandha") && key.includes("bogura")) {
    return GAIBANDHA_TO_BOGURA_SCHEDULE;
  }
  return null;
}

export function getTrainRouteSummary(route: string): TrainRouteSummary | null {
  const key = route.toLowerCase().replace(/\s+/g, " ");
  if (key.includes("gaibandha") && key.includes("bogura")) {
    return GAIBANDHA_TO_BOGURA;
  }
  return null;
}
