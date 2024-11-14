export type Days =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday';

export interface HabitModel {
  id?: string;
  type: string;
  days: Days[];
  timeAllocated: number;
  percentageOfTotal: number;
  userId: string;
}
