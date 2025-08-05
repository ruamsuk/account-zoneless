// ในไฟล์ src/app/models/blood-pressure.model.ts

export interface BloodPressureReading {
  sys: number | null;
  dia: number | null;
  pulse: number | null;
}

export interface BloodPressure {
  id?: string;
  date: any; // Firestore Timestamp
  morning: {
    bp1: BloodPressureReading | null; // <-- แก้ไขเป็น Object
    bp2: BloodPressureReading | null; // <-- แก้ไขเป็น Object
  };
  evening: {
    bp1: BloodPressureReading | null; // <-- แก้ไขเป็น Object
    bp2: BloodPressureReading | null; // <-- แก้ไขเป็น Object
  };
  created?: any;
  modify?: any;
}
