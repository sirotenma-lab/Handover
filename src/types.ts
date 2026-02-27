export interface SBAR {
  situation: string;
  background: string;
  assessment: string;
  recommendation: string;
  latestMedicalInstructions: string;
  criticalResults: string;
  medicalDeviceStatus: string;
}

export interface PhysicalExam {
  infusion: {
    type: string;
    remainingVolume: string;
    dripRate: string;
  };
  wounds: string;
  assistiveDevices: {
    oxygen: boolean;
    oxygenDetail?: string;
    catheter: boolean;
    catheterDetail?: string;
    ngt: boolean;
    ngtDetail?: string;
    ventilator: boolean;
    ventilatorDetail?: string;
  };
}

export interface TodoItem {
  id: string;
  task: string;
  completed: boolean;
}

export interface Handover {
  id: string;
  patientId: string;
  timestamp: string;
  nurseInCharge: string;
  nurseNextShift: string;
  sbar: SBAR;
  physicalExam: PhysicalExam;
  todos: TodoItem[];
  currentAssessment: string;
  patientSummary: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'L' | 'P';
  room: string;
  bed: string;
  diagnosis: string;
  lastHandover?: Handover;
}
