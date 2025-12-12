import React, { useEffect, useRef } from 'react';
import { ExperimentModel, LogEntry } from '../types';
import { Terminal, CheckCircle2, Loader2, Circle } from 'lucide-react';

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
          <Loader2 className={`animate-spin text-blue-400 ${currentExperimentId ? 'opacity-100' : 'opacity-0'}`} />
          Execution Pipeline
        </h3>
        
        <div className="flex-1 space-y-6">
          {experiments.map((exp, idx) => {
            const isActive = exp.id === currentExperimentId;
            const isCompleted = exp.status === 'completed';
            const isPending = exp.status === 'pending';

            return (
              <div key={exp.id} className={`relative flex items-center gap-4 transition-all duration-300 ${isActive ? 'scale-105' : 'opacity-80'}`}>
                {/* Connector Line */}
                {idx !== experiments.length - 1 && (
                  <div className="absolute left-[19px] top-10 w-0.5 h-10 bg-slate-700"></div>
                )}
                
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center border-2 z-10 bg-slate-800
                  ${isCompleted ? 'border-green-500 text-green-500' : 
                    isActive ? 'border-blue-500 text-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 
                    'border-slate-600 text-slate-600'}
                `}>
                  {isCompleted ? <CheckCircle2 size={20} /> : isActive ? <Loader2 className="animate-spin" size={20} /> : <Circle size={20} />}
                </div>
                
                <div className={`flex-1 p-3 rounded-lg border ${isActive ? 'bg-blue-500/10 border-blue-500/50' : 'bg-slate-700/20 border-transparent'}`}>
                  <div className="flex justify-between items-center mb-1">
                    <span className={`font-medium ${isActive ? 'text-blue-300' : 'text-slate-300'}`}>{exp.name}</span>
                    <span className="text-xs font-mono text-slate-500 uppercase">{exp.status}</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${isCompleted ? 'bg-green-500 w-full' : isActive ? 'bg-blue-500 w-2/3 animate-pulse' : 'w-0'}`}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Terminal Logs */}
      <div className="bg-black/80 border border-slate-700 rounded-xl p-0 shadow-lg flex flex-col overflow-hidden font-mono text-xs md:text-sm h-[400px]">
        <div className="bg-slate-800 px-4 py-2 border-b border-slate-700 flex items-center gap-2">
          <Terminal size={16} className="text-slate-400" />
          <span className="text-slate-300">Live Logs</span>
          <div className="flex-1"></div>
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/50"></div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-hide">
          {logs.length === 0 && <span className="text-slate-600 italic">Waiting for execution to start...</span>}
          {logs.map((log) => (
            <div key={log.id} className="flex gap-3 animate-fade-in-right">
              <span className="text-slate-600 flex-shrink-0">[{log.timestamp}]</span>
              <span className={`
                ${log.type === 'info' ? 'text-blue-400' : ''}
                ${log.type === 'success' ? 'text-green-400' : ''}
                ${log.type === 'warning' ? 'text-yellow-400' : ''}
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