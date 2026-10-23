"use client";

import { useEffect, useState, useRef } from "react";
import {
  UploadCloud,
  FileCheck2,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Shield,
  FileSpreadsheet,
} from "lucide-react";
import { api } from "@/lib/api";
import { DatasetProfileResponse } from "@/lib/types";
import { LoadingState, ErrorState } from "@/components/common/States";

export default function DatasetUploadPage() {
  const [profile, setProfile] = useState<DatasetProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.getDatasetProfile();
      setProfile(res);
    } catch (err: any) {
      setUploadError(err.message || "Failed to load active dataset profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      setUploadError("Invalid file type. Please upload a standard CSV file.");
      return;
    }

    try {
      setUploading(true);
      setUploadError(null);
      setUploadSuccess(null);
      const res = await api.uploadDataset(file);
      setProfile(res.profile);
      setUploadSuccess(`Successfully loaded ${res.filename} (${res.total_records} records).`);
    } catch (err: any) {
      setUploadError(err.message || "Error processing CSV upload");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleResetBenchmark = async () => {
    try {
      setLoading(true);
      await api.resetBenchmark();
      await fetchProfile();
      setUploadSuccess("Restored active benchmark to default TCS benchmark dataset.");
    } catch (err: any) {
      setUploadError("Failed to reset benchmark dataset.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingState message="Inspecting dataset schema and profiling columns..." />;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Dataset Upload & Data Quality</h1>
          <p className="text-xs text-slate-400 mt-1">
            Validate uploaded workforce schemas, verify target column integrity, detect missing cells, and audit sensitive demographics.
          </p>
        </div>

        <button
          onClick={handleResetBenchmark}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reload Sample Benchmark</span>
        </button>
      </div>

      {/* Notifications */}
      {uploadError && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-3">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{uploadError}</span>
        </div>
      )}

      {uploadSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-3">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{uploadSuccess}</span>
        </div>
      )}

      {/* Upload Box & High-Level Schema Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Dropzone */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-sky-400" />
              Upload Workforce CSV
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              Drop an HR dataset containing employee records, delivery roles, and an Attrition target column.
            </p>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-700 hover:border-sky-500/50 rounded-xl p-8 text-center cursor-pointer transition-all bg-slate-900/40 hover:bg-slate-900/60"
            >
              <FileSpreadsheet className="w-10 h-10 text-sky-400 mx-auto mb-3 opacity-80" />
              <p className="text-xs font-semibold text-slate-200">
                {uploading ? "Analyzing CSV schema..." : "Click to select CSV or drag & drop"}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">Maximum file size: 10 MB</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileUpload}
                disabled={uploading}
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between mt-4">
            <span>Allowed columns: Standard HR Schema</span>
            <span className="text-sky-400">Strict CSV format</span>
          </div>
        </div>

        {/* Dataset Schema Summary */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 border border-slate-800 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white">Active Dataset Overview</h2>
              <p className="text-xs text-slate-400">{profile?.filename || "No active dataset"}</p>
            </div>
            {profile?.is_valid_for_training ? (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Training Ready
              </span>
            ) : (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1.5">
                <XCircle className="w-3.5 h-3.5" />
                Validation Errors
              </span>
            )}
          </div>

          {profile && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[11px] text-slate-400">Total Records</span>
                <p className="text-lg font-bold text-white mt-1">{profile.total_records.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[11px] text-slate-400">Total Columns</span>
                <p className="text-lg font-bold text-white mt-1">{profile.total_columns}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[11px] text-slate-400">Target Column</span>
                <p className="text-lg font-bold text-sky-400 mt-1">{profile.target_column || "Missing"}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[11px] text-slate-400">Missing Cells</span>
                <p className="text-lg font-bold text-white mt-1">{profile.missing_cells_pct}%</p>
              </div>
            </div>
          )}

          {/* Validation Checklist */}
          {profile && (
            <div className="space-y-2 pt-2">
              <span className="text-xs font-semibold text-slate-300">Data Quality & Schema Diagnostics:</span>
              <div className="space-y-1.5">
                {profile.validation_messages.map((msg, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{msg}</span>
                  </div>
                ))}
                {profile.sensitive_columns_detected.length > 0 && (
                  <div className="flex items-center gap-2 text-xs text-amber-300 pt-1">
                    <Shield className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>
                      Sensitive demographic columns flagged: <strong>{profile.sensitive_columns_detected.join(", ")}</strong>. These will be automatically excluded from predictive features for Fair AI compliance.
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Column-by-Column Data Quality Table */}
      {profile && (
        <div className="glass-panel rounded-2xl p-6 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-white">Column Profile & Quality Inspector</h2>
              <p className="text-xs text-slate-400">Data types, missing counts, cardinality, and governance tags</p>
            </div>
            <span className="text-xs text-slate-400">{profile.columns_profile.length} columns inspected</span>
          </div>

          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] font-semibold sticky top-0">
                <tr>
                  <th className="px-4 py-3">Column Name</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Missing Cells</th>
                  <th className="px-4 py-3">Unique Values</th>
                  <th className="px-4 py-3">Sample Values</th>
                  <th className="px-4 py-3">Audit Flags</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {profile.columns_profile.map((col) => (
                  <tr key={col.name} className="hover:bg-slate-800/30 transition">
                    <td className="px-4 py-3 font-semibold text-white flex items-center gap-2">
                      {col.name === profile.target_column && (
                        <span className="w-2 h-2 rounded-full bg-sky-400" title="Target Column" />
                      )}
                      <span>{col.name}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 font-mono text-[11px]">{col.dtype}</td>
                    <td className="px-4 py-3">
                      {col.missing_count > 0 ? (
                        <span className="text-amber-400">
                          {col.missing_count} ({col.missing_pct}%)
                        </span>
                      ) : (
                        <span className="text-slate-400">0 (0%)</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-300">{col.unique_count}</td>
                    <td className="px-4 py-3 text-slate-400 max-w-xs truncate font-mono text-[10px]">
                      {col.sample_values.join(", ")}
                    </td>
                    <td className="px-4 py-3">
                      {col.is_sensitive && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-medium mr-1.5">
                          Sensitive PII
                        </span>
                      )}
                      {col.warning ? (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20 font-medium">
                          {col.warning}
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-medium">
                          Optimal
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
