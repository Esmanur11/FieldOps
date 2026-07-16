export interface Shift {
  id: number;
  siteId: number;
  siteName: string;
  name: string;
  startTime: string;
  endTime: string;
}

export interface CreateShiftRequest {
  siteId: number;
  name: string;
  startTime: string;
  endTime: string;
}

export interface ShiftAssignment {
  id: number;
  shiftId: number;
  shiftName: string;
  siteId: number;
  siteName: string;
  personnelId: number;
  personnelName: string;
  workDate: string;
  checkIn: string | null;
  checkOut: string | null;
  status: string;
}

export interface CreateShiftAssignmentRequest {
  shiftId: number;
  personnelId: number;
  workDate: string;
}
