export interface Site {
  id: number;
  name: string;
  location: string | null;
  startDate: string;
  status: string;
  latitude: number | null;
  longitude: number | null;
  completionPercentage: number;
}

export interface CreateSiteRequest {
  name: string;
  location: string;
  startDate: string;
  status: string;
  latitude: number | null;
  longitude: number | null;
  completionPercentage: number;
}
