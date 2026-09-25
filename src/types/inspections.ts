export type InspectionStatus = 'pass' | 'warning' | 'fail';

export interface InspectionItem {
  id: string;
  category: string;
  name: string;
  status: InspectionStatus;
  sensorValue?: number | string;
  threshold?: number | string;
  lastChecked: string;
}
