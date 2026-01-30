
export enum TargetModel {
  SORA_2 = 'Sora 2',
  VEO_3 = 'Veo 3',
  LUMA_DREAM_MACHINE = 'Luma Dream Machine',
  RUNWAY_GEN_3 = 'Runway Gen-3'
}

export interface VideoSegment {
  startTime: string;
  endTime: string;
  description: string;
  cameraMovement: string;
  cameraTechnical: string;
  lightingTechnical: string;
  composition: string;
  motionIntensity: "Low" | "Medium" | "High";
  frameByFrameAnalysis: string; // New: Step-by-step frame progression
  aiPrompt: string;
}

export interface AnalysisResponse {
  segments: VideoSegment[];
  overallStyle: string;
}

export enum AnalysisStatus {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  ANALYZING = 'ANALYZING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}
