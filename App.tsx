
import React, { useState, useEffect } from 'react';
import { ExperimentStatus, ExperimentPlan, LogEntry } from './types';
import { generateExperimentPlan } from './services/geminiService';
import { InputSection } from './components/InputSection';
import { ExperimentPlanner } from './components/ExperimentPlanner';
import { LiveExecution } from './components/LiveExecution';
import { ResultsView } from './components/ResultsView';
// Fixed missing Loader2 import
import { Activity, AlertTriangle, RefreshCcw, XCircle, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [status, setStatus] = useState<ExperimentStatus>(ExperimentStatus.IDLE);
  const [plan, setPlan] = useState<ExperimentPlan | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [currentExperimentId, setCurrentExperimentId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastGoal, setLastGoal] = useState<string>('');
  const [isFinalizing, setIsFinalizing] = useState(false);

  // Check if API KEY is available
  const isApiKeyMissing = !process.env.API_KEY;

  // Helper to add logs
  const addLog = (message: string, type: 'info' | 'success' | 'warning' = 'info') => {
    setLogs(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second:'2-digit' }),
      message,
      type
    }]);
  };

  const handleGenerate = async (goal: string) => {
    if (isApiKeyMissing) return;
    
    setLastGoal(goal);
    setStatus(ExperimentStatus.PLANNING);
    setError(null);
    setPlan(null);
    setLogs([]);
    setCurrentExperimentId(null);
    setIsFinalizing(false);
    
    try {
      const generatedPlan = await generateExperimentPlan(goal);
      setPlan(generatedPlan);
      setStatus(ExperimentStatus.EXECUTING);
    } catch (err: any) {
      console.error(err);
      let friendlyMessage = "We encountered an unexpected error while designing your experiment suite.";
      
      if (err.message?.includes("API Key")) {
        friendlyMessage = "The Gemini API Key is invalid or missing. Please check your environment configuration.";
      } else if (err.message?.includes("safety")) {
        friendlyMessage = "The experiment plan was blocked by safety filters. Try phrasing your goal differently.";
      } else if (err.message?.includes("quota") || err.message?.includes("429")) {
        friendlyMessage = "API quota exceeded. Please wait a moment before trying again.";
      }

      setError(friendlyMessage);
      setStatus(ExperimentStatus.ERROR);
    }
  };

  const handleRetry = () => {
    if (lastGoal) {
      handleGenerate(lastGoal);
    } else {
      setStatus(ExperimentStatus.IDLE);
      setError(null);
    }
  };

  // Helper to update experiment state
  const updateExperimentState = (
    expId: string, 
    updates: { 
      progress?: number; 
      status?: 'pending' | 'running' | 'completed'; 
      liveMetrics?: { accuracy: number; latencyMs: number; modelSizeMb: number } 
    }
  ) => {
    setPlan(prev => {
      if (!prev) return null;
      const newExps = prev.experiments.map(e => 
        e.id === expId 
          ? { 
              ...e, 
              ...updates,
              liveMetrics: updates.liveMetrics || e.liveMetrics 
            } 
          : e
      );
      return { ...prev, experiments: newExps };
    });
  };

  // Simulation Logic
  useEffect(() => {
    if (status !== ExperimentStatus.EXECUTING || !plan) return;

    let isMounted = true;
    let timeoutIds: ReturnType<typeof setTimeout>[] = [];

    const runSimulation = async () => {
      addLog("Initializing experiment environment...", "info");
      addLog("Allocating virtual resources (vCPU, RAM)...", "info");
      addLog(`Loaded plan: ${plan.planTitle}`, "info");
      
      let delayOffset = 1500;

      for (let i = 0; i < plan.experiments.length; i++) {
        const exp = plan.experiments[i];
        const finalAcc = exp.simulatedMetrics.accuracy;
        const finalLat = exp.simulatedMetrics.latencyMs;
        const finalSize = exp.simulatedMetrics.modelSizeMb;
        
        // 1. Initialization (0%)
        timeoutIds.push(setTimeout(() => {
          if (!isMounted) return;
          setCurrentExperimentId(exp.id);
          updateExperimentState(exp.id, { progress: 0, status: 'running' });
          addLog(`Starting Experiment ${i + 1}: ${exp.name}`, "info");
        }, delayOffset));
        delayOffset += 800;

        // 2. Data Loading (15%)
        timeoutIds.push(setTimeout(() => {
           if (!isMounted) return;
           updateExperimentState(exp.id, { progress: 15 });
           addLog(`[${exp.name}] Loading and normalizing dataset...`, "info");
        }, delayOffset));
        delayOffset += 1200;

        // 3. Architecture Setup (30%)
        timeoutIds.push(setTimeout(() => {
           if (!isMounted) return;
           updateExperimentState(exp.id, { progress: 30 });
           addLog(`[${exp.name}] Initializing model architecture and weights...`, "info");
        }, delayOffset));
        delayOffset += 1000;

        // 4. Training Start (45%)
        timeoutIds.push(setTimeout(() => {
           if (!isMounted) return;
           const currentAcc = (finalAcc * 0.1) + (Math.random() * 0.05);
           const currentLat = finalLat * (1.5 + Math.random() * 0.5);
           updateExperimentState(exp.id, { 
             progress: 45, 
             liveMetrics: { accuracy: currentAcc, latencyMs: currentLat, modelSizeMb: finalSize } 
           });
           addLog(`[${exp.name}] Starting training loop. Batch size: 32`, "info");
        }, delayOffset));
        delayOffset += 1500;

        // 5. Training Mid (60%)
        timeoutIds.push(setTimeout(() => {
           if (!isMounted) return;
           const currentAcc = (finalAcc * 0.6) + (Math.random() * 0.05);
           const currentLat = finalLat * (1.2 + Math.random() * 0.2);
           updateExperimentState(exp.id, { 
             progress: 60,
             liveMetrics: { accuracy: currentAcc, latencyMs: currentLat, modelSizeMb: finalSize }
           });
           const loss = (Math.random() * 0.5 + 0.3).toFixed(4);
           addLog(`[${exp.name}] Epoch 1/10 | Loss: ${loss} | Acc: ${currentAcc.toFixed(2)}`, "info");
        }, delayOffset));
        delayOffset += 1200;

        // 6. Training Late (75%)
        timeoutIds.push(setTimeout(() => {
           if (!isMounted) return;
           const currentAcc = (finalAcc * 0.9) + (Math.random() * 0.02);
           const currentLat = finalLat * (1.05 + Math.random() * 0.05);
           updateExperimentState(exp.id, { 
             progress: 75,
             liveMetrics: { accuracy: currentAcc, latencyMs: currentLat, modelSizeMb: finalSize }
           });
           const loss = (Math.random() * 0.2 + 0.1).toFixed(4);
           addLog(`[${exp.name}] Epoch 10/10 | Loss: ${loss} | Acc: ${currentAcc.toFixed(2)}`, "info");
        }, delayOffset));
        delayOffset += 1200;

        // 7. Validation (90%)
        timeoutIds.push(setTimeout(() => {
           if (!isMounted) return;
           updateExperimentState(exp.id, { 
             progress: 90,
             liveMetrics: { accuracy: finalAcc * 0.98, latencyMs: finalLat, modelSizeMb: finalSize }
           });
           addLog(`[${exp.name}] Evaluating on validation set...`, "warning");
        }, delayOffset));
        delayOffset += 1500;

        // 8. Completion (100%)
        timeoutIds.push(setTimeout(() => {
          if (!isMounted) return;
          updateExperimentState(exp.id, { 
            progress: 100, 
            status: 'completed',
            liveMetrics: { accuracy: finalAcc, latencyMs: finalLat, modelSizeMb: finalSize }
          });
          addLog(`Completed ${exp.name}. Final Accuracy: ${(finalAcc * 100).toFixed(1)}%`, "success");
        }, delayOffset));
        
        delayOffset += 500;
      }

      // Finalize
      timeoutIds.push(setTimeout(() => {
        if (!isMounted) return;
        setCurrentExperimentId(null);
        addLog("All experiments completed successfully.", "success");
        addLog("Generating final comparative report...", "info");
        
        // Brief finalize state to show results skeleton
        setIsFinalizing(true);
        setTimeout(() => {
          if (!isMounted) return;
          setStatus(ExperimentStatus.COMPLETED);
          setIsFinalizing(false);
        }, 1500);
      }, delayOffset));
    };

    runSimulation();

    return () => {
      isMounted = false;
      timeoutIds.forEach(clearTimeout);
    };
  }, [status, plan?.experiments.length]); 

  return (
    <div className="min-h-screen bg-slate-900 text-white selection:bg-blue-500 selection:text-white pb-20">
      
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Activity size={20} className="text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">LabLoop</h1>
          </div>
          <div className="flex items-center gap-4">
             <div className="text-xs font-mono text-slate-500 px-3 py-1 bg-slate-800 rounded-full border border-slate-700">
                Powered by Gemini 3.0 Pro
             </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        
        {/* State: Idle / Planning / Error */}
        {(status === ExperimentStatus.IDLE || status === ExperimentStatus.PLANNING || status === ExperimentStatus.ERROR) && (
           <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-12">
              <div className="text-center space-y-4">
                 <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                    AI Experimentation, <br/> Accelerated.
                 </h1>
                 <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                    Simulate complex machine learning workflows in seconds. 
                    Compare models, analyze trade-offs, and find the optimal solution for your data.
                 </p>
              </div>

              {status === ExperimentStatus.ERROR ? (
                <div className="w-full max-w-2xl animate-fade-in-up">
                  <div className="bg-red-500/10 border-2 border-red-500/30 rounded-2xl p-8 shadow-2xl flex flex-col items-center text-center space-y-6">
                    <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center text-red-500">
                      <AlertTriangle size={32} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-red-100 mb-2">Experiment Failed</h2>
                      <p className="text-red-200/70 max-w-md mx-auto leading-relaxed">
                        {error || "An unexpected error occurred during the experimentation process."}
                      </p>
                    </div>
                    <div className="flex gap-4">
                      <button 
                        onClick={handleRetry}
                        className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-red-600/20 active:scale-95"
                      >
                        <RefreshCcw size={18} />
                        Retry Operation
                      </button>
                      <button 
                        onClick={() => { setStatus(ExperimentStatus.IDLE); setError(null); }}
                        className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 px-8 rounded-xl transition-all border border-slate-700 active:scale-95"
                      >
                        <XCircle size={18} />
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <InputSection 
                    onGenerate={handleGenerate} 
                    isLoading={status === ExperimentStatus.PLANNING} 
                    isDisabled={isApiKeyMissing}
                  />
                  {status === ExperimentStatus.PLANNING && (
                    <div className="w-full">
                      <div className="flex items-center justify-center gap-3 text-indigo-400 mb-6 animate-pulse">
                        <Loader2 className="animate-spin" />
                        <span className="font-bold uppercase tracking-widest text-sm">Gemini is Architecting Experiments...</span>
                      </div>
                      <ExperimentPlanner loading={true} />
                    </div>
                  )}
                </>
              )}
           </div>
        )}

        {/* State: Executing / Completed */}
        {(status === ExperimentStatus.EXECUTING || status === ExperimentStatus.COMPLETED) && plan && (
          <div className="space-y-12">
            
            {/* Phase 1: The Plan */}
            <div>
               <div className="flex items-center justify-between mb-6">
                 <h2 className="text-2xl font-bold text-white">Experiment Plan</h2>
                 <span className="text-sm font-mono text-blue-400 bg-blue-400/10 px-3 py-1 rounded-full border border-blue-400/20">
                    ID: {plan.planTitle.replace(/\s+/g, '-').toLowerCase()}
                 </span>
               </div>
               <ExperimentPlanner plan={plan} />
            </div>

            {/* Phase 2: Execution */}
            <div>
               <h2 className="text-2xl font-bold text-white mb-6">Live Execution</h2>
               <LiveExecution 
                  experiments={plan.experiments} 
                  logs={logs} 
                  currentExperimentId={currentExperimentId} 
               />
            </div>

            {/* Phase 3: Results */}
            {(status === ExperimentStatus.COMPLETED || isFinalizing) && (
               <div>
                  <h2 className="text-2xl font-bold text-white mb-6">Final Results</h2>
                  <ResultsView plan={plan} loading={isFinalizing} />
                  
                  {status === ExperimentStatus.COMPLETED && (
                    <div className="mt-12 text-center animate-fade-in-up">
                      <button 
                          onClick={() => setStatus(ExperimentStatus.IDLE)}
                          className="bg-slate-800 hover:bg-slate-700 text-white font-medium px-8 py-3 rounded-xl transition-all border border-slate-700 hover:border-slate-600 shadow-lg active:scale-95"
                      >
                          Start New Experiment
                      </button>
                    </div>
                  )}
               </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
