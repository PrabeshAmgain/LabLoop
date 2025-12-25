export enum ExperimentStatus {
  IDLE = 'IDLE',
  PLANNING = 'PLANNING',
  EXECUTING = 'EXECUTING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export interface Metric {
  name: string;
  value: number;
  unit: string;
}

export interface ExperimentModel {
  id: string;
  name: string;
  description: string;
  simulatedMetrics: {
    accuracy: number; // 0-1
    latencyMs: number;
    modelSizeMb: number;
  };
  liveMetrics?: {
    accuracy: number;
    latencyMs: number;
    modelSizeMb: number;
  };
  status: 'pending' | 'running' | 'completed';
  progress: number; // 0-100
}

export interface ExperimentPlan {
  planTitle: string;
  goalAnalysis: string;
  experiments: ExperimentModel[];
  recommendedWinnerId: string;
  summary: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warning';
}