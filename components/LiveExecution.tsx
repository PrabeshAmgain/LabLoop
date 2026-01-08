import React, { useEffect, useRef, useState } from 'react';
import { ExperimentModel, LogEntry } from '../types';
import { Terminal, CheckCircle2, Loader2, Circle, Activity, Cpu, Database, Zap, Target } from 'lucide-react';

interface LiveExecutionProps {
  experiments: ExperimentModel[];
  logs: LogEntry[];
  currentExperimentId: string | null;
}

/**
 * A sub-component that smoothly animates a numeric value from its current state 
 * to a new target state, creating a "converging" effect.
 */
const AnimatedMetric: React.FC<{ 
  value: number; 
  formatter: (v: number) => string; 
  isActive: boolean;
  isCompleted: boolean;
  colorClass: string;
}> = ({ value, formatter, isActive, isCompleted, colorClass }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const requestRef = useRef<number>(null);
  const previousValueRef = useRef(0);

  useEffect(() => {
    if (!isActive && !isCompleted) {
      setDisplayValue(0);
      previousValueRef.current = 0;
      return;
    }

    const startValue = previousValueRef.current;
    const endValue = value;
    const startTime = performance.now();
    const duration = 800; // ms

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function: easeOutExpo
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = startValue + (endValue - startValue) * easeProgress;
      
      setDisplayValue(current);

      if (progress < 1) {
        requestRef.current = requestAnimationFrame(animate);
      } else {
        previousValueRef.current = endValue;
      }
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [value, isActive, isCompleted]);

  // Add a slight jitter if active to simulate "computing"
  const [jitter, setJitter] = useState(0);
  useEffect(() => {
    if (!isActive || isCompleted) {
      setJitter(0);
      return;
    }
    const interval = setInterval(() => {
      setJitter((Math.random() - 0.5) * 0.02);
    }, 100);
    return () => clearInterval(interval);
  }, [isActive, isCompleted]);

  const finalValue = isActive && !isCompleted ? displayValue + jitter : displayValue;

  return (
    <span className={`text-[11px] font-mono font-bold transition-colors duration-500 ${isCompleted ? 'text-green-400' : colorClass}`}>
      {formatter(finalValue)}
    </span>
  );
};

export const LiveExecution: React.FC<LiveExecutionProps> = ({ experiments, logs, currentExperimentId }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom whenever logs change
  useEffect(() => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth',
      });
    }
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
            const liveMetrics = exp.liveMetrics;

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
                
                <div className={`flex-1 p-4 rounded-lg border transition-all duration-300 ${isActive ? 'bg-blue-500/10 border-blue-500/30 shadow-inner' : 'bg-slate-700/20 border-transparent'}`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className={`font-medium text-sm ${isActive ? 'text-blue-200' : 'text-slate-300'}`}>{exp.name}</span>
                    <span className={`text-xs font-mono uppercase ${isActive ? 'text-blue-400' : 'text-slate-500'}`}>
                      {isCompleted ? 'Done' : isActive ? `${progress}%` : 'Pending'}
                    </span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden mb-3">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ease-out ${isCompleted ? 'bg-green-500' : 'bg-blue-500 relative'}`}
                      style={{ width: `${progress}%` }}
                    >
                      {isActive && (
                        <div className="absolute inset-0 bg-white/30 animate-[shimmer_2s_infinite]"></div>
                      )}
                    </div>
                  </div>
                  
                  {/* Real-time Metrics Display with Gradual Convergence */}
                  {(isActive || isCompleted) && liveMetrics && (
                    <div className="grid grid-cols-3 gap-2 mt-2 p-2 bg-black/20 rounded border border-slate-700/50 animate-fade-in relative overflow-hidden">
                      {isActive && (
                        <div className="absolute inset-0 bg-blue-500/5 pointer-events-none animate-pulse"></div>
                      )}
                      <div className="flex flex-col relative z-10">
                        <span className="text-[9px] text-slate-500 uppercase tracking-tighter flex items-center gap-1">
                          <Target size={10} className="text-blue-400" /> Acc
                        </span>
                        <AnimatedMetric 
                          value={liveMetrics.accuracy} 
                          formatter={(v) => `${(v * 100).toFixed(1)}%`}
                          isActive={isActive}
                          isCompleted={isCompleted}
                          colorClass="text-blue-300"
                        />
                      </div>
                      <div className="flex flex-col relative z-10">
                        <span className="text-[9px] text-slate-500 uppercase tracking-tighter flex items-center gap-1">
                          <Zap size={10} className="text-amber-400" /> Lat
                        </span>
                        <AnimatedMetric 
                          value={liveMetrics.latencyMs} 
                          formatter={(v) => `${v.toFixed(0)}ms`}
                          isActive={isActive}
                          isCompleted={isCompleted}
                          colorClass="text-amber-300"
                        />
                      </div>
                      <div className="flex flex-col relative z-10">
                        <span className="text-[9px] text-slate-500 uppercase tracking-tighter flex items-center gap-1">
                          <Database size={10} className="text-purple-400" /> Size
                        </span>
                        <AnimatedMetric 
                          value={liveMetrics.modelSizeMb} 
                          formatter={(v) => v > 0 ? `${v.toFixed(0)}MB` : '---'}
                          isActive={isActive}
                          isCompleted={isCompleted}
                          colorClass="text-purple-300"
                        />
                      </div>
                    </div>
                  )}

                  {/* Mini Infrastructure Stats */}
                  {(isActive || isCompleted) && (
                    <div className="flex gap-4 mt-2 text-[10px] text-slate-500 animate-fade-in border-t border-slate-700/30 pt-2">
                       <span className="flex items-center gap-1 uppercase">
                         <Cpu size={10} className={isActive ? 'animate-spin' : ''} /> 
                         {(progress > 30 || isCompleted) ? 'Compute: OK' : 'Allocating'}
                       </span>
                       <span className="flex items-center gap-1 uppercase">
                         <Database size={10} className={isActive ? 'animate-bounce' : ''} /> 
                         {(progress > 10 || isCompleted) ? 'Data: Sync' : 'Waiting'}
                       </span>
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
          {currentExperimentId && (
            <div className="flex items-center gap-2 mr-4">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Live</span>
            </div>
          )}
          <div className="flex gap-1.5 opacity-60">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
          </div>
        </div>
        <div 
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-hide font-mono leading-relaxed scroll-smooth"
        >
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
        </div>
      </div>
    </div>
  );
};