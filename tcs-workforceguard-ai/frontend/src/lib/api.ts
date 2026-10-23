import {
  ExecutiveDashboardResponse,
  DatasetProfileResponse,
  ModelTrainResponse,
  SinglePredictionRequest,
  SinglePredictionResponse,
  BatchPredictionItem,
  RootCauseResponse,
  Intervention,
  ROIModelRequest,
  ROIModelResponse,
  ChatMessageResponse,
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";

async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers || {}),
      },
      cache: "no-store",
    });

    if (!res.ok) {
      let errorMsg = `HTTP ${res.status}: ${res.statusText}`;
      try {
        const errorData = await res.json();
        if (errorData.detail) {
          errorMsg = typeof errorData.detail === "string" ? errorData.detail : JSON.stringify(errorData.detail);
        }
      } catch {
        // ignore json parse error
      }
      throw new Error(errorMsg);
    }

    return await res.json();
  } catch (err: any) {
    console.error(`API request error on ${endpoint}:`, err);
    throw err;
  }
}

export const api = {
  // Health
  checkHealth: async () => fetchJson<{ status: string }>("/health"),

  // Dashboard & Analytics
  getDashboard: async (): Promise<ExecutiveDashboardResponse> =>
    fetchJson<ExecutiveDashboardResponse>("/analytics/dashboard"),

  getDepartments: async () => fetchJson<any>("/analytics/departments"),

  getTrends: async () => fetchJson<any>("/analytics/trends"),

  // Datasets
  getDatasetProfile: async (): Promise<DatasetProfileResponse> =>
    fetchJson<DatasetProfileResponse>("/datasets/current"),

  uploadDataset: async (file: File): Promise<any> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${API_BASE}/datasets/upload`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "File upload failed");
    }
    return res.json();
  },

  resetBenchmark: async (): Promise<any> =>
    fetchJson<any>("/datasets/reset-benchmark", { method: "POST" }),

  // ML Models
  trainModels: async (params?: { test_size?: number; exclude_demographics?: boolean }): Promise<ModelTrainResponse> =>
    fetchJson<ModelTrainResponse>("/models/train", {
      method: "POST",
      body: JSON.stringify(params || {}),
    }),

  getActiveModel: async (): Promise<any> => fetchJson<any>("/models/active"),

  // Predictions
  predictSingle: async (data: SinglePredictionRequest): Promise<SinglePredictionResponse> =>
    fetchJson<SinglePredictionResponse>("/predictions/single", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getBatchPredictions: async (limit = 50): Promise<BatchPredictionItem[]> =>
    fetchJson<BatchPredictionItem[]>(`/predictions/batch?limit=${limit}`),

  // Root-Cause & Recommendations
  getRootCause: async (): Promise<RootCauseResponse> =>
    fetchJson<RootCauseResponse>("/root-cause"),

  // Interventions
  getInterventions: async (): Promise<Intervention[]> =>
    fetchJson<Intervention[]>("/interventions"),

  createIntervention: async (data: any): Promise<Intervention> =>
    fetchJson<Intervention>("/interventions", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateIntervention: async (id: number, data: any): Promise<Intervention> =>
    fetchJson<Intervention>(`/interventions/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  calculateROI: async (data: ROIModelRequest): Promise<ROIModelResponse> =>
    fetchJson<ROIModelResponse>("/interventions/roi-model", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // AI Assistant
  chat: async (message: string, sessionId = "default-session"): Promise<ChatMessageResponse> =>
    fetchJson<ChatMessageResponse>("/assistant/chat", {
      method: "POST",
      body: JSON.stringify({ message, session_id: sessionId }),
    }),

  // Governance
  getGovernanceAudit: async () => fetchJson<any>("/governance/fairness-audit"),
};
