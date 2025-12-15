import React, { useEffect, useRef } from 'react';
import { ExperimentModel, LogEntry } from '../types';
import { Terminal, CheckCircle2, Loader2, Circle, Activity, Cpu, Database } from 'lucide-react';

interface LiveExecutionProps {
  experiments: ExperimentModel[];
  logs: LogEntry[];
  currentExperimentId: string | null;
}

export const LiveExecution: React.FC<LiveExecutionProps> = ({ experiments, logs, currentExperimentId }) => {
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="w-full max-w-5xl mx-auto mb-8 grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
      
      {/* Status List */}
      <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-6 shadow-lg flex flex-col">
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <Activity className={`text-blue-400 ${currentExperimentId ? 'animate-pulse' : ''}`} size={20} />
          Experiment Pipeline
        </h3>
        
        <div className="flex-1 space-y-6">
          {experiments.map((exp, idx) => {
            const isActive = exp.id === currentExperimentId;
            const isCompleted = exp.status === 'completed';
            const progress = exp.progress || 0;

            return (
              <div key={exp.id} className={`relative flex items-center gap-4 transition-all duration-300 ${isActive ? 'scale-102' : 'opacity-90'}`}>
                {/* Connector Line */}
                {idx !== experiments.length - 1 && (
                  <div className="absolute left-[19px] top-10 w-0.5 h-10 bg-slate-700"></div>
                )}
                
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center border-2 z-10 bg-slate-800 transition-colors duration-300
                  ${isCompleted ? 'border-green-500 text-green-500' : 
                    isActive ? 'border-blue-500 text-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 
                    'border-slate-600 text-slate-600'}
                `}>
                  {isCompleted ? <CheckCircle2 size={20} /> : isActive ? <Loader2 className="animate-spin" size={20} /> : <Circle size={20} />}
                </div>
                
                <div className={`flex-1 p-4 rounded-lg border transition-all duration-300 ${isActive ? 'bg-blue-500/10 border-blue-500/30' : 'bg-slate-700/20 border-transparent'}`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className={`font-medium text-sm ${isActive ? 'text-blue-200' : 'text-slate-300'}`}>{exp.name}</span>
                    <span className={`text-xs font-mono uppercase ${isActive ? 'text-blue-400' : 'text-slate-500'}`}>
                      {isCompleted ? 'Done' : isActive ? `${progress}%` : 'Pending'}
                    </span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ease-out ${isCompleted ? 'bg-green-500' : 'bg-blue-500 relative'}`}
                      style={{ width: `${progress}%` }}
                    >
                      {isActive && (
                        <div className="absolute inset-0 bg-white/30 animate-[shimmer_2s_infinite]"></div>
                      )}
                    </div>
                  </div>
                  
                  {/* Mini Stats (visible only when active or completed) */}
                  {(isActive || isCompleted) && (
                    <div className="flex gap-4 mt-2 text-xs text-slate-400 animate-fade-in">
                       <span className="flex items-center gap-1"><Cpu size={10} /> {(progress > 30 || isCompleted) ? 'Active' : 'Allocating'}</span>
                       <span className="flex items-center gap-1"><Database size={10} /> {(progress > 10 || isCompleted) ? 'Loaded' : 'Pending'}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Terminal Logs */}
      <div className="bg-black/90 border border-slate-700 rounded-xl p-0 shadow-lg flex flex-col overflow-hidden font-mono text-xs md:text-sm h-[480px]">
        <div className="bg-slate-800 px-4 py-3 border-b border-slate-700 flex items-center gap-3">
          <Terminal size={16} className="text-slate-400" />
          <span className="text-slate-300 font-medium">System Logs</span>
          <div className="flex-1"></div>
          <div className="flex gap-1.5 opacity-60">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-hide font-mono leading-relaxed">
          {logs.length === 0 && <span className="text-slate-600 italic">Waiting for execution to start...</span>}
          {logs.map((log) => (
            <div key={log.id} className="flex gap-3 animate-fade-in-right hover:bg-slate-900/50 p-0.5 rounded">
              <span className="text-slate-600 flex-shrink-0 select-none">[{log.timestamp}]</span>
              <span className={`
                break-all
                ${log.type === 'info' ? 'text-blue-300' : ''}
                ${log.type === 'success' ? 'text-emerald-400 font-semibold' : ''}
                ${log.type === 'warning' ? 'text-amber-400' : ''}
              `}>
                {log.type === 'success' && '✓ '}
                {log.message}
              </span>
            </div>
          ))}
          <div ref={logsEndRef} />
        </div>
      </div>
    </div>
  );
};