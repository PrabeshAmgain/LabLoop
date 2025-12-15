import React from 'react';
import { ExperimentPlan } from '../types';
import { Trophy, BarChart3, Clock, Database, Zap, Activity } from 'lucide-react';

interface ResultsViewProps {
  plan: ExperimentPlan;
}

export const ResultsView: React.FC<ResultsViewProps> = ({ plan }) => {
  const winner = plan.experiments.find(e => e.id === plan.recommendedWinnerId) || plan.experiments[0];
  
  // Calculate max values for scaling the bars relative to the dataset
  const maxLatency = Math.max(...plan.experiments.map(e => e.simulatedMetrics.latencyMs));
  const maxSize = Math.max(...plan.experiments.map(e => e.simulatedMetrics.modelSizeMb));

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-fade-in-up">
      
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
                <h3 className="font-semibold">Accuracy Comparison</h3>
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
                <h3 className="font-semibold">Latency (Lower is better)</h3>
            </div>
            <div className="space-y-4 flex-1">
                {plan.experiments.map(exp => {
                    const isWinner = exp.id === plan.recommendedWinnerId;
                    // Calculate width relative to max latency
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
            </div>
            <div className="space-y-4 flex-1">
                {plan.experiments.map(exp => {
                    const isWinner = exp.id === plan.recommendedWinnerId;
                    // Calculate width relative to max size
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

      {/* Comparison Table */}
      <div className="bg-slate-800/80 border border-slate-700 rounded-xl overflow-hidden shadow-lg">
        <div className="p-6 border-b border-slate-700 flex items-center justify-between">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <BarChart3 className="text-blue-400" />
                Benchmark Results
            </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/50 text-slate-400 text-sm uppercase tracking-wider">
                <th className="p-4 font-semibold">Model Name</th>
                <th className="p-4 font-semibold text-right">Accuracy</th>
                <th className="p-4 font-semibold text-right">Latency</th>
                <th className="p-4 font-semibold text-right">Model Size</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {plan.experiments.map((exp) => {
                const isWinner = exp.id === plan.recommendedWinnerId;
                return (
                  <tr key={exp.id} className={`hover:bg-slate-700/30 transition-colors ${isWinner ? 'bg-emerald-900/10' : ''}`}>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                         {isWinner && <Trophy size={16} className="text-emerald-500" />}
                         <span className={`font-medium ${isWinner ? 'text-emerald-400' : 'text-slate-200'}`}>{exp.name}</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1 truncate max-w-xs">{exp.description}</div>
                    </td>
                    <td className="p-4 text-right">
                        <div className="inline-flex items-center gap-2">
                             <div className="w-24 bg-slate-700 rounded-full h-2 overflow-hidden">
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
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};