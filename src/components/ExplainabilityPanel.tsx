import React from "react";
import { Info, HelpCircle } from "lucide-react";

export function ExplainabilityPanel({ className = "" }: { className?: string }) {
  const factors = [
    { label: "Asset Risk", value: 95 },
    { label: "Task Urgency", value: 88 },
    { label: "Train Impact", value: 20 },
    { label: "Department Synergy", value: 100 },
    { label: "Crew Availability", value: 90 },
    { label: "Block Utilization", value: 98 },
    { label: "Future Possession Avoidance", value: 85 },
  ];

  return (
    <div className={`bg-slate-50 border border-slate-300 rounded-sm shadow-sm p-4 ${className}`}>
      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest border-b border-slate-300 pb-2 mb-4 flex items-center">
        <HelpCircle className="h-4 w-4 mr-2 text-slate-500" />
        WHY THIS PLAN?
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-2">
        <div className="space-y-3 border-r border-slate-200 pr-4">
          {factors.map((factor) => (
            <div key={factor.label}>
              <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase mb-1">
                <span>{factor.label}</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden border border-slate-300">
                <div 
                  className={`h-full rounded-full ${factor.label === "Train Impact" ? 'bg-blue-600' : 'bg-emerald-600'}`} 
                  style={{ width: `${factor.value}%` }} 
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col justify-center">
          <div className="bg-white border border-slate-200 p-4 rounded-sm shadow-sm mb-4">
            <p className="text-xs text-slate-700 leading-relaxed font-medium italic">
              "This block was selected because it covers a high-risk asset, combines compatible Engineering, S&T and TRD work, falls in a low-traffic window, uses available resources and allows additional backlog tasks to be completed without extending possession."
            </p>
          </div>
          
          <div className="flex items-center justify-between bg-blue-50 border border-blue-200 p-3 rounded-sm shadow-sm">
            <div>
              <div className="text-[10px] font-bold text-blue-800 uppercase tracking-widest">
                Simulation Confidence
              </div>
              <div className="text-xl font-black text-blue-900">
                91%
              </div>
            </div>
            <Info className="h-6 w-6 text-blue-400" />
          </div>
          <div className="text-[9px] text-slate-400 font-bold uppercase mt-2 text-right">
            Prototype decision-support score
          </div>
        </div>
      </div>
    </div>
  );
}
