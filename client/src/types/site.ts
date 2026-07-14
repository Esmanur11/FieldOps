export interface Site {
  id: number;
  name: string;
  location: string | null;
  startDate: string;
  status: string;
}

export interface CreateSiteRequest {
  name: string;
  location: string;
  startDate: string;
  status: string;
}
