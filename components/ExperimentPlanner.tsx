import React from 'react';
import { ExperimentPlan } from '../types';
import { FlaskConical, BrainCircuit, Target } from 'lucide-react';

interface ExperimentPlannerProps {
  plan: ExperimentPlan;
}

export const ExperimentPlanner: React.FC<ExperimentPlannerProps> = ({ plan }) => {
  return (
    <div className="w-full max-w-5xl mx-auto mb-8 grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
      {/* Goal Analysis Card */}
      <div className="md:col-span-1 bg-slate-800/80 border border-slate-700 rounded-xl p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-4 text-indigo-400">
          <Target size={24} />
          <h3 className="font-semibold text-lg">Goal Analysis</h3>
        </div>
        <p className="text-slate-300 text-sm leading-relaxed">
          {plan.goalAnalysis}
        </p>
      </div>

      {/* Experiment List Card */}
      <div className="md:col-span-2 bg-slate-800/80 border border-slate-700 rounded-xl p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-4 text-indigo-400">
          <FlaskConical size={24} />
          <h3 className="font-semibold text-lg">Proposed Experiments</h3>
        </div>
        <div className="space-y-4">
          {plan.experiments.map((exp, idx) => (
            <div key={exp.id} className="flex items-start gap-4 p-3 bg-slate-700/30 rounded-lg border border-slate-700/50">
              <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-indigo-500/20 text-indigo-300 rounded-full font-bold text-sm">
                {idx + 1}
              </div>
              <div>
                <h4 className="font-medium text-white">{exp.name}</h4>
                <p className="text-sm text-slate-400 mt-1">{exp.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};