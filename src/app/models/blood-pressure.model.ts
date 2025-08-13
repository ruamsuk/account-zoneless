// ในไฟล์ src/app/models/blood-pressure.model.ts

export interface BloodPressure {
  id?: string;
  date: Date; // Firestore Timestamp
  morning: {
    bp1: string;
    bp2: string;
  };
  evening: {
    bp1: string;
    bp2: string;
  };
  created?: Date;
  modify?: Date;
}
