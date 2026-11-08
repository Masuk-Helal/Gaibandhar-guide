export type DistrictCode = string;

export interface DistrictFeature {
  type: "Feature";
  id: DistrictCode;
  properties: {
    name: string;
    division: string;
    divisionCode: string;
    districtCode: DistrictCode;
  };
  geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon;
}

export interface DistrictsGeoJSON {
  type: "FeatureCollection";
  features: DistrictFeature[];
}

export interface UpazilaFeature {
  type: "Feature";
  id: string;
  properties: {
    name: string;
    district: string;
    division: string;
    upazilaCode: string;
    districtCode: string;
  };
  geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon;
}

export interface UpazilasGeoJSON {
  type: "FeatureCollection";
  features: UpazilaFeature[];
}

export type MapView = "bangladesh" | "gaibandha" | "upazila";

export interface CameraState {
  scale: number;
  x: number;
  y: number;
}

export interface MapStoreState {
  districts: DistrictsGeoJSON | null;
  gaibandhaDistrict: UpazilasGeoJSON | null;
  gaibandhaUpazilas: UpazilasGeoJSON | null;
  dataLoaded: boolean;
  dataLoading: boolean;

  view: MapView;
  selectedDistrictCode: DistrictCode | null;
  selectedUpazilaCode: string | null;
  highlightedCode: string | null;

  camera: CameraState;
  animating: boolean;

  introPlayed: boolean;
  introSkipped: boolean;
  introComplete: boolean;

  boundariesVisible: boolean;
  toggleBoundaries: () => void;

  setDistricts: (d: DistrictsGeoJSON) => void;
  setGaibandha: (g: UpazilasGeoJSON | null) => void;
  setGaibandhaUpazilas: (u: UpazilasGeoJSON | null) => void;
  setDataLoaded: (v: boolean) => void;
  setView: (v: MapView) => void;
  selectDistrict: (code: DistrictCode | null) => void;
  selectUpazila: (code: string | null) => void;
  setHighlight: (code: string | null) => void;
  setCamera: (c: Partial<CameraState>) => void;
  setAnimating: (v: boolean) => void;
  setIntroPlayed: (v: boolean) => void;
  setIntroSkipped: () => void;
  setIntroComplete: () => void;
  resetView: () => void;
}

export interface GeoBounds {
  west: number;
  south: number;
  east: number;
  north: number;
}

export interface ProjectionConfig {
  scale: number;
  translate: [number, number];
}

export const GAIBANDHA_CODE = "BD5532";

export const UPAZILA_ORDER: string[] = [
  "Gaibandha Sadar",
  "Sadullapur",
  "Palashbari",
  "Gobindaganj",
  "Sundarganj",
  "Fulchhari",
  "Saghata",
];
