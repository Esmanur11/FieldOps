export interface MachineUsageLog {
  id: number;
  machineId: number;
  logDate: string;
  hoursUsed: number;
  fuelConsumed: number | null;
  operatorId: number;
}

export interface CreateMachineUsageLogRequest {
  machineId: number;
  logDate: string;
  hoursUsed: number;
  fuelConsumed: number | null;
  operatorId: number;
}

export interface MaintenanceRecord {
  id: number;
  machineId: number;
  maintenanceDate: string;
  type: string;
  description: string | null;
  cost: number | null;
  performedBy: string;
}

export interface CreateMaintenanceRecordRequest {
  machineId: number;
  maintenanceDate: string;
  type: string;
  description: string;
  cost: number | null;
  performedBy: string;
}

export interface MaintenancePrediction {
  id: number;
  machineId: number;
  predictedDate: string;
  riskScore: number;
  basis: string | null;
  generatedAt: string;
}
