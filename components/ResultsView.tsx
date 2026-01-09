import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ExperimentPlan, ExperimentModel } from '../types';
import { Trophy, BarChart3, Database, Zap, Activity, Download, ChevronUp, ChevronDown, Filter, Info, FileCode, Box, Layers, Loader2, CheckCircle } from 'lucide-react';

interface ResultsViewProps {
  plan: ExperimentPlan;
}

type SortField = 'name' | 'accuracy' | 'latency' | 'size';
type SortDirection = 'asc' | 'desc';
type ExportFormat = 'onnx' | 'tflite' | 'weights';

/**
 * Enhanced Tooltip component for ML metrics
 */
const MetricTooltip: React.FC<{ title: string; content: string }> = ({ title, content }) => (
  <div className="group relative inline-block ml-1.5">
    <div className="p-0.5 rounded-full hover:bg-blue-500/20 transition-colors cursor-help">
      <Info size={14} className="text-slate-500 group-hover:text-blue-400 transition-colors" />
    </div>
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 p-3 bg-slate-900/95 backdrop-blur-md border border-slate-700/50 rounded-xl shadow-2xl text-[11px] text-slate-300 leading-relaxed opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none transform translate-y-1 group-hover:translate-y-0">
      <p className="font-bold text-blue-400 mb-1.5 uppercase tracking-wider text-[10px]">{title}</p>
      {content}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900/95"></div>
    </div>
  </div>
);

// Unified Metric Descriptions
const METRIC_INFO = {
  accuracy: {
    title: "Accuracy (Validation)",
    description: "The proportion of total predictions that were correct. In ML research, this measures how well the model generalizes to unseen validation data rather than just memorizing training patterns."
  },
  latency: {
    title: "Inference Latency",
    description: "The time required (ms) to process a single input and return a prediction. Low latency is critical for real-time applications like voice interaction, gesture control, or financial high-frequency trading."
  },
  size: {
    title: "Model Footprint",
    description: "The storage space occupied by the model's weights and architecture. Smaller models are essential for 'On-Device' AI, enabling deployment on smartphones, IoT sensors, and edge hardware with limited RAM."
  }
};

export const ResultsView: React.FC<ResultsViewProps> = ({ plan }) => {
  const [sortField, setSortField] = useState<SortField>('accuracy');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [minAccuracy, setMinAccuracy] = useState<number>(0);
  const [activeExportId, setActiveExportId] = useState<string | null>(null);
  const [isPackaging, setIsPackaging] = useState<string | null>(null); // format_modelId
  const [toast, setToast] = useState<{message: string, type: 'success' | 'info'} | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Auto-hide toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveExportId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const winner = plan.experiments.find(e => e.id === plan.recommendedWinnerId) || plan.experiments[0];
  
  const maxLatency = Math.max(...plan.experiments.map(e => e.simulatedMetrics.latencyMs));
  const maxSize = Math.max(...plan.experiments.map(e => e.simulatedMetrics.modelSizeMb));

  const handleExport = async (model: ExperimentModel, format: ExportFormat) => {
    const packageKey = `${format}_${model.id}`;
    setIsPackaging(packageKey);
    
    // Simulate complex model serialization
    await new Promise(resolve => setTimeout(resolve, 800));

    let extension = '';
    let header = new Uint8Array();
    
    // Create actual simulated binary data for the specific format
    switch (format) {
      case 'onnx':
        extension = 'onnx';
        // Simulating ONNX Magic Bytes (not exact but illustrative for binary blobs)
        header = new Uint8Array([0x08, 0x01, 0x12, 0x04, 0x4F, 0x4E, 0x4E, 0x58]); 
        break;
      case 'tflite':
        extension = 'tflite';
        // Simulating TFLite schema version bytes
        header = new Uint8Array([0x54, 0x46, 0x4C, 0x33, 0x00, 0x00, 0x12, 0x00]);
        break;
      case 'weights':
        extension = 'bin';
        // Simulating raw binary data header
        header = new Uint8Array([0xDE, 0xAD, 0xBE, 0xEF, 0x01, 0x00, 0x00, 0x00]);
        break;
    }

    // Combine header with "simulated" weight data
    const dummyWeights = new TextEncoder().encode(`Model: ${model.name}\nAccuracy: ${model.simulatedMetrics.accuracy}\nSimulated Binary Data Padding...`);
    const combinedData = new Uint8Array(header.length + dummyWeights.length);
    combinedData.set(header);
    combinedData.set(dummyWeights, header.length);

    const blob = new Blob([combinedData], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${model.name.toLowerCase().replace(/\s+/g, '_')}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    setIsPackaging(null);
    setActiveExportId(null);
    setToast({ 
      message: `${model.name} exported as ${format.toUpperCase()}`, 
      type: 'success' 
    });
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const filteredAndSortedExperiments = useMemo(() => {
    return [...plan.experiments]
      .filter(exp => (exp.simulatedMetrics.accuracy * 100) >= minAccuracy)
      .sort((a, b) => {
        let valA: any, valB: any;
        
        switch (sortField) {
          case 'name':
            valA = a.name.toLowerCase();
            valB = b.name.toLowerCase();
            break;
          case 'accuracy':
            valA = a.simulatedMetrics.accuracy;
            valB = b.simulatedMetrics.accuracy;
            break;
          case 'latency':
            valA = a.simulatedMetrics.latencyMs;
            valB = b.simulatedMetrics.latencyMs;
            break;
          case 'size':
            valA = a.simulatedMetrics.modelSizeMb;
            valB = b.simulatedMetrics.modelSizeMb;
            break;
        }

        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
  }, [plan.experiments, sortField, sortDirection, minAccuracy]);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronUp size={14} className="opacity-0 group-hover:opacity-30" />;
    return sortDirection === 'asc' ? <ChevronUp size={14} className="text-blue-400" /> : <ChevronDown size={14} className="text-blue-400" />;
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-fade-in-up relative">
      
      {/* Localized Notification System */}
      {toast && (
        <div className="fixed bottom-10 right-10 z-[100] animate-fade-in-right">
          <div className={`px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border backdrop-blur-xl ${toast.type === 'success' ? 'bg-emerald-900/90 border-emerald-500/50 text-emerald-100' : 'bg-blue-900/90 border-blue-500/50 text-blue-100'}`}>
            <CheckCircle size={20} className="text-emerald-400" />
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Winner Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-900/50 to-teal-900/50 border border-emerald-500/30 rounded-2xl p-8 flex flex-col md:flex-row items-center gap-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="flex-shrink-0 relative">
          <div className="absolute inset-0 bg-emerald-500 blur-xl opacity-20 animate-pulse"></div>
          <Trophy size={64} className="text-emerald-400 relative z-10" />
        </div>
        
        <div className="flex-1 text-center md:text-left z-10">
          <h3 className="text-emerald-300 font-bold uppercase tracking-wider text-sm mb-2">Recommended Model</h3>
          <h2 className="text-3xl font-bold text-white mb-2">{winner.name}</h2>
          <p className="text-emerald-100/80 leading-relaxed">{plan.summary}</p>
        </div>

        <div className="flex gap-4 md:flex-col lg:flex-row z-10">
            <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-emerald-500/20 text-center min-w-[100px]">
                <div className="text-emerald-400 font-bold text-xl">{(winner.simulatedMetrics.accuracy * 100).toFixed(1)}%</div>
                <div className="text-xs text-emerald-200 uppercase tracking-wide">Accuracy</div>
            </div>
            <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-emerald-500/20 text-center min-w-[100px]">
                <div className="text-emerald-400 font-bold text-xl">{winner.simulatedMetrics.latencyMs}ms</div>
                <div className="text-xs text-emerald-200 uppercase tracking-wide">Latency</div>
            </div>
        </div>
      </div>

      {/* Visual Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Accuracy Chart */}
        <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-6 shadow-lg flex flex-col">
            <div className="flex items-center gap-2 mb-4 text-blue-400">
                <Activity size={20} />
                <h3 className="font-semibold">Accuracy</h3>
                <MetricTooltip title={METRIC_INFO.accuracy.title} content={METRIC_INFO.accuracy.description} />
            </div>
            <div className="space-y-4 flex-1">
                {plan.experiments.map(exp => {
                    const isWinner = exp.id === plan.recommendedWinnerId;
                    const pct = exp.simulatedMetrics.accuracy * 100;
                    return (
                        <div key={exp.id}>
                            <div className="flex justify-between text-xs mb-1.5">
                                <span className={isWinner ? "text-emerald-400 font-bold" : "text-slate-300"}>{exp.name}</span>
                                <span className="text-slate-400 font-mono">{pct.toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-slate-700/30 rounded-full h-2.5 overflow-hidden">
                                <div 
                                    className={`h-full rounded-full transition-all duration-1000 ${isWinner ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-gradient-to-r from-blue-600 to-blue-400'}`} 
                                    style={{ width: `${pct}%` }}
                                ></div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>

        {/* Latency Chart */}
        <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-6 shadow-lg flex flex-col">
            <div className="flex items-center gap-2 mb-4 text-amber-400">
                <Zap size={20} />
                <h3 className="font-semibold">Latency</h3>
                <MetricTooltip title={METRIC_INFO.latency.title} content={METRIC_INFO.latency.description} />
            </div>
            <div className="space-y-4 flex-1">
                {plan.experiments.map(exp => {
                    const isWinner = exp.id === plan.recommendedWinnerId;
                    const widthPct = (exp.simulatedMetrics.latencyMs / maxLatency) * 100;
                    return (
                        <div key={exp.id}>
                            <div className="flex justify-between text-xs mb-1.5">
                                <span className={isWinner ? "text-emerald-400 font-bold" : "text-slate-300"}>{exp.name}</span>
                                <span className="text-slate-400 font-mono">{exp.simulatedMetrics.latencyMs}ms</span>
                            </div>
                            <div className="w-full bg-slate-700/30 rounded-full h-2.5 overflow-hidden">
                                <div 
                                    className={`h-full rounded-full transition-all duration-1000 ${isWinner ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-gradient-to-r from-amber-600 to-amber-400'}`} 
                                    style={{ width: `${widthPct}%` }}
                                ></div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>

        {/* Model Size Chart */}
        <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-6 shadow-lg flex flex-col">
            <div className="flex items-center gap-2 mb-4 text-purple-400">
                <Database size={20} />
                <h3 className="font-semibold">Model Size</h3>
                <MetricTooltip title={METRIC_INFO.size.title} content={METRIC_INFO.size.description} />
            </div>
            <div className="space-y-4 flex-1">
                {plan.experiments.map(exp => {
                    const isWinner = exp.id === plan.recommendedWinnerId;
                    const widthPct = (exp.simulatedMetrics.modelSizeMb / maxSize) * 100;
                    return (
                        <div key={exp.id}>
                            <div className="flex justify-between text-xs mb-1.5">
                                <span className={isWinner ? "text-emerald-400 font-bold" : "text-slate-300"}>{exp.name}</span>
                                <span className="text-slate-400 font-mono">{exp.simulatedMetrics.modelSizeMb} MB</span>
                            </div>
                            <div className="w-full bg-slate-700/30 rounded-full h-2.5 overflow-hidden">
                                <div 
                                    className={`h-full rounded-full transition-all duration-1000 ${isWinner ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-gradient-to-r from-purple-600 to-purple-400'}`} 
                                    style={{ width: `${widthPct}%` }}
                                ></div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>

      </div>

      {/* Comparison Table with Filtering and Sorting */}
      <div className="bg-slate-800/80 border border-slate-700 rounded-xl overflow-hidden shadow-lg">
        <div className="p-6 border-b border-slate-700 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <BarChart3 className="text-blue-400" />
                    Benchmark Results
                </h3>
                
                <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2 text-slate-400">
                        <Filter size={14} className="text-slate-500" />
                        <span>Min Accuracy:</span>
                        <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            value={minAccuracy}
                            onChange={(e) => setMinAccuracy(parseInt(e.target.value))}
                            className="accent-blue-500 w-24 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="font-mono text-blue-400 min-w-[3ch]">{minAccuracy}%</span>
                    </div>
                </div>
            </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/50 text-slate-400 text-xs uppercase tracking-wider select-none">
                <th 
                  className="p-4 font-semibold cursor-pointer hover:text-white transition-colors group"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-1">
                    Model Name <SortIcon field="name" />
                  </div>
                </th>
                <th 
                  className="p-4 font-semibold text-right cursor-pointer hover:text-white transition-colors group"
                  onClick={() => handleSort('accuracy')}
                >
                  <div className="flex items-center justify-end gap-1">
                    Accuracy 
                    <MetricTooltip title={METRIC_INFO.accuracy.title} content={METRIC_INFO.accuracy.description} /> 
                    <SortIcon field="accuracy" />
                  </div>
                </th>
                <th 
                  className="p-4 font-semibold text-right cursor-pointer hover:text-white transition-colors group"
                  onClick={() => handleSort('latency')}
                >
                  <div className="flex items-center justify-end gap-1">
                    Latency 
                    <MetricTooltip title={METRIC_INFO.latency.title} content={METRIC_INFO.latency.description} /> 
                    <SortIcon field="latency" />
                  </div>
                </th>
                <th 
                  className="p-4 font-semibold text-right cursor-pointer hover:text-white transition-colors group"
                  onClick={() => handleSort('size')}
                >
                  <div className="flex items-center justify-end gap-1">
                    Size 
                    <MetricTooltip title={METRIC_INFO.size.title} content={METRIC_INFO.size.description} /> 
                    <SortIcon field="size" />
                  </div>
                </th>
                <th className="p-4 font-semibold text-center w-32">Export</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {filteredAndSortedExperiments.length > 0 ? (
                filteredAndSortedExperiments.map((exp) => {
                  const isWinner = exp.id === plan.recommendedWinnerId;
                  const isExportActive = activeExportId === exp.id;

                  return (
                    <tr key={exp.id} className={`hover:bg-slate-700/30 transition-colors ${isWinner ? 'bg-emerald-900/10' : ''}`}>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                           {isWinner && <Trophy size={16} className="text-emerald-500" />}
                           <span className={`font-medium ${isWinner ? 'text-emerald-400' : 'text-slate-200'}`}>{exp.name}</span>
                        </div>
                        <div className="text-xs text-slate-500 mt-1 truncate max-w-[200px] md:max-w-xs">{exp.description}</div>
                      </td>
                      <td className="p-4 text-right">
                          <div className="inline-flex items-center gap-2">
                               <div className="hidden sm:block w-20 lg:w-24 bg-slate-700 rounded-full h-1.5 overflow-hidden">
                                  <div className="bg-blue-500 h-full rounded-full" style={{ width: `${exp.simulatedMetrics.accuracy * 100}%` }}></div>
                               </div>
                               <span className="font-mono text-slate-300">{(exp.simulatedMetrics.accuracy * 100).toFixed(1)}%</span>
                          </div>
                      </td>
                      <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2 text-slate-300">
                               <Zap size={14} className="text-yellow-500" />
                               <span className="font-mono">{exp.simulatedMetrics.latencyMs} ms</span>
                          </div>
                      </td>
                      <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2 text-slate-300">
                               <Database size={14} className="text-purple-500" />
                               <span className="font-mono">{exp.simulatedMetrics.modelSizeMb} MB</span>
                          </div>
                      </td>
                      <td className="p-4 text-center">
                          <div className="relative inline-block" ref={isExportActive ? dropdownRef : null}>
                            <button 
                              onClick={() => setActiveExportId(isExportActive ? null : exp.id)}
                              className={`p-2 rounded-lg transition-all border flex items-center gap-1 group ${isExportActive ? 'bg-blue-600 text-white border-blue-500' : 'bg-slate-700/50 text-slate-400 hover:text-blue-400 border-slate-600 hover:border-blue-500/50'}`}
                              title="Export Options"
                            >
                              <Download size={18} className="group-active:scale-90 transition-transform" />
                              <ChevronDown size={14} className={`transition-transform duration-200 ${isExportActive ? 'rotate-180' : ''}`} />
                            </button>

                            {isExportActive && (
                              <div className="absolute right-0 top-full mt-2 w-48 bg-slate-800/95 backdrop-blur-xl border border-slate-600 rounded-xl shadow-2xl z-[60] overflow-hidden animate-fade-in-down origin-top-right">
                                <div className="px-3 py-2 border-b border-slate-700 text-[10px] uppercase tracking-widest text-slate-500 font-bold">Choose Format</div>
                                
                                {/* Weights Binary Export */}
                                <button 
                                  disabled={!!isPackaging}
                                  onClick={() => handleExport(exp, 'weights')}
                                  className="w-full px-4 py-2.5 text-left text-xs text-slate-300 hover:bg-slate-700/50 flex items-center gap-3 transition-colors border-l-2 border-transparent hover:border-blue-500 disabled:opacity-50"
                                >
                                  {isPackaging === `weights_${exp.id}` ? <Loader2 size={14} className="animate-spin text-blue-400" /> : <Layers size={14} className="text-blue-400" />}
                                  <span>{isPackaging === `weights_${exp.id}` ? 'Packaging...' : 'Weights (.bin)'}</span>
                                </button>
                                
                                {/* ONNX Export */}
                                <button 
                                  disabled={!!isPackaging}
                                  onClick={() => handleExport(exp, 'onnx')}
                                  className="w-full px-4 py-2.5 text-left text-xs text-slate-300 hover:bg-slate-700/50 flex items-center gap-3 transition-colors border-l-2 border-transparent hover:border-emerald-500 disabled:opacity-50"
                                >
                                  {isPackaging === `onnx_${exp.id}` ? <Loader2 size={14} className="animate-spin text-emerald-400" /> : <FileCode size={14} className="text-emerald-400" />}
                                  <span>{isPackaging === `onnx_${exp.id}` ? 'Packaging...' : 'ONNX Format'}</span>
                                </button>
                                
                                {/* TF Lite Export */}
                                <button 
                                  disabled={!!isPackaging}
                                  onClick={() => handleExport(exp, 'tflite')}
                                  className="w-full px-4 py-2.5 text-left text-xs text-slate-300 hover:bg-slate-700/50 flex items-center gap-3 transition-colors border-l-2 border-transparent hover:border-amber-500 disabled:opacity-50"
                                >
                                  {isPackaging === `tflite_${exp.id}` ? <Loader2 size={14} className="animate-spin text-amber-400" /> : <Box size={14} className="text-amber-400" />}
                                  <span>{isPackaging === `tflite_${exp.id}` ? 'Packaging...' : 'TF Lite'}</span>
                                </button>
                              </div>
                            )}
                          </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-500 italic">
                    No experiments matching the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};