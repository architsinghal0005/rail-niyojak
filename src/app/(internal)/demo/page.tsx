"use client";

import { useState } from "react";
import { 
  SectionHeader, GovernmentCard, StatusBadge, GovernmentButton, AlertBanner
} from "@/components/design-system";
import { Play, CheckCircle, ChevronRight, ArrowRight, AlertTriangle, ShieldCheck, FileSearch } from "lucide-react";
import { ExplainabilityPanel } from "@/components/ExplainabilityPanel";

export default function DemoModePage() {
  const [demoState, setDemoState] = useState(1);
  
  const stages = [
    { id: 1, label: "Data" },
    { id: 2, label: "Optimize" },
    { id: 3, label: "Harvest" },
    { id: 4, label: "Explain" },
    { id: 5, label: "Replan" },
    { id: 6, label: "Audit" }
  ];

  // Helper to advance the demo
  const next = () => setDemoState(s => Math.min(6, s + 1));
  const skipTo = (step: number) => setDemoState(step);

  return (
    <div className="space-y-6 pb-20">
      <SectionHeader 
        title="SIH Prototype Presentation" 
        description="Flagship synthetic scenario: KOTA – ITARSI | 02:00–05:00"
        action={<StatusBadge status="info">Demo Mode Active</StatusBadge>}
      />

      {/* Subtle Progress Indicator */}
      <div className="flex items-center justify-between mb-8 bg-white p-4 border border-slate-300 rounded-sm shadow-sm">
        {stages.map((stage, idx) => (
          <div key={stage.id} className="flex items-center">
            <div className={`flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold ${
              demoState === stage.id ? 'bg-indigo-600 text-white' : 
              demoState > stage.id ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'
            }`}>
              {demoState > stage.id ? <CheckCircle className="h-3 w-3" /> : stage.id}
            </div>
            <span className={`ml-2 text-[10px] font-bold uppercase tracking-widest hidden md:inline-block ${
              demoState === stage.id ? 'text-indigo-900' : 
              demoState > stage.id ? 'text-emerald-700' : 'text-slate-400'
            }`}>
              {stage.label}
            </span>
            {idx < stages.length - 1 && (
              <div className="w-8 md:w-16 h-px bg-slate-300 mx-2 md:mx-4"></div>
            )}
          </div>
        ))}
      </div>

      <div className="min-h-[500px]">
        {/* STEP 1: DATA */}
        {demoState === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
            <h2 className="text-lg font-black text-slate-800 uppercase tracking-widest">1. Fragmented Maintenance Requirements</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <GovernmentCard className="p-5 border-t-4 border-t-red-700 bg-red-50/30">
                <h3 className="text-sm font-bold text-slate-900 mb-2">Engineering</h3>
                <p className="text-xs text-slate-600 mb-4">Track renewal requests isolated block.</p>
                <StatusBadge status="danger">Requested Block</StatusBadge>
              </GovernmentCard>
              <GovernmentCard className="p-5 border-t-4 border-t-amber-500 bg-amber-50/30">
                <h3 className="text-sm font-bold text-slate-900 mb-2">S&T</h3>
                <p className="text-xs text-slate-600 mb-4">Signal inspection needs isolated block.</p>
                <StatusBadge status="danger">Requested Block</StatusBadge>
              </GovernmentCard>
              <GovernmentCard className="p-5 border-t-4 border-t-blue-600 bg-blue-50/30">
                <h3 className="text-sm font-bold text-slate-900 mb-2">TRD</h3>
                <p className="text-xs text-slate-600 mb-4">OHE maintenance asks for isolated block.</p>
                <StatusBadge status="danger">Requested Block</StatusBadge>
              </GovernmentCard>
            </div>
            <div className="flex justify-center pt-8">
              <GovernmentButton onClick={() => skipTo(2)} size="lg" className="w-64 py-4 uppercase tracking-widest font-black shadow-lg">
                Optimize
              </GovernmentButton>
            </div>
          </div>
        )}

        {/* STEP 2: OPTIMIZE */}
        {demoState === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
            <h2 className="text-lg font-black text-slate-800 uppercase tracking-widest">2. Integrated Block Created</h2>
            <GovernmentCard className="p-8 border-l-4 border-l-emerald-600 bg-emerald-50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-emerald-900 mb-2">Single Integrated Mega Block</h3>
                  <p className="text-sm font-bold text-emerald-700 flex items-center">
                    Engineering <ArrowRight className="h-3 w-3 mx-2" /> S&T <ArrowRight className="h-3 w-3 mx-2" /> TRD
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-500 uppercase">Block Window</div>
                  <div className="text-2xl font-black text-slate-900">02:00–05:00</div>
                </div>
              </div>
            </GovernmentCard>
            <div className="flex justify-center pt-8">
              <GovernmentButton onClick={() => skipTo(3)} size="lg" className="w-64 py-4 uppercase tracking-widest font-black bg-emerald-700 hover:bg-emerald-800 shadow-lg">
                Harvest Block
              </GovernmentButton>
            </div>
          </div>
        )}

        {/* STEP 3: HARVEST */}
        {demoState === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
            <h2 className="text-lg font-black text-slate-800 uppercase tracking-widest">3. Block Harvesting Engine</h2>
            
            <AlertBanner 
              type="success" 
              title="Capacity Identified" 
              message="System detected unused shadow capacity in the integrated block."
            />

            <GovernmentCard className="p-5">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Additional Maintenance Entering Possession</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border border-slate-200 bg-slate-50 rounded-sm">
                  <div className="font-bold text-slate-800 text-sm">S&T Cable Inspection</div>
                  <StatusBadge status="success">Harvested (+18m)</StatusBadge>
                </div>
                <div className="flex items-center justify-between p-3 border border-slate-200 bg-slate-50 rounded-sm">
                  <div className="font-bold text-slate-800 text-sm">Engineering Joint Inspection</div>
                  <StatusBadge status="success">Harvested (+12m)</StatusBadge>
                </div>
                <div className="flex items-center justify-between p-3 border border-slate-200 bg-slate-50 rounded-sm">
                  <div className="font-bold text-slate-800 text-sm">Track Circuit Check</div>
                  <StatusBadge status="success">Harvested (+10m)</StatusBadge>
                </div>
              </div>
            </GovernmentCard>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-white border border-slate-300 p-4 rounded-sm text-center shadow-sm">
                <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">Block Duration</div>
                <div className="text-xl font-black text-slate-900">3h &rarr; 3h</div>
              </div>
              <div className="bg-white border border-slate-300 p-4 rounded-sm text-center shadow-sm">
                <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">Tasks</div>
                <div className="text-xl font-black text-emerald-600">3 &rarr; 6</div>
              </div>
              <div className="bg-white border border-slate-300 p-4 rounded-sm text-center shadow-sm">
                <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">Block Utilization</div>
                <div className="text-xl font-black text-emerald-600">82% &rarr; 96%</div>
              </div>
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-sm text-center shadow-sm">
                <div className="text-[10px] font-bold text-blue-700 uppercase mb-1">Future Poss. Avoided</div>
                <div className="text-xl font-black text-blue-900">0 &rarr; 4.2h</div>
              </div>
            </div>

            <div className="flex justify-center pt-8">
              <GovernmentButton onClick={() => skipTo(4)} size="lg" className="w-64 py-4 uppercase tracking-widest font-black bg-blue-700 hover:bg-blue-800 shadow-lg">
                View Explainability
              </GovernmentButton>
            </div>
          </div>
        )}

        {/* STEP 4: EXPLAIN */}
        {demoState === 4 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
            <h2 className="text-lg font-black text-slate-800 uppercase tracking-widest mb-4">4. Explainability Panel</h2>
            <ExplainabilityPanel />
            <div className="flex justify-center pt-8">
              <GovernmentButton onClick={() => skipTo(5)} size="lg" variant="danger" className="w-64 py-4 uppercase tracking-widest font-black shadow-lg">
                Trigger Event
              </GovernmentButton>
            </div>
          </div>
        )}

        {/* STEP 5: REPLAN */}
        {demoState === 5 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
            <h2 className="text-lg font-black text-slate-800 uppercase tracking-widest">5. Emergency Replanning</h2>
            
            <AlertBanner 
              type="danger" 
              title="OPERATIONAL EVENT DETECTED" 
              message="High-priority train movement added at 03:10."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <GovernmentCard className="p-5 border border-slate-300 bg-slate-50 opacity-80">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-widest border-b border-slate-300 pb-2 mb-4">Old Plan (Invalidated)</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm border-b border-slate-200 pb-2">
                    <span className="font-bold text-slate-500">Block Time</span>
                    <span className="font-bold text-slate-800 line-through">02:00 – 05:00</span>
                  </div>
                  <div className="flex justify-between text-sm border-b border-slate-200 pb-2">
                    <span className="font-bold text-slate-500">Total Tasks</span>
                    <span className="font-bold text-slate-800">6</span>
                  </div>
                </div>
              </GovernmentCard>

              <GovernmentCard className="p-5 border-2 border-emerald-600 shadow-md">
                <h3 className="text-sm font-bold text-emerald-800 uppercase tracking-widest border-b border-emerald-200 pb-2 mb-4">New Plan (Active)</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm border-b border-emerald-100 pb-2 items-center">
                    <span className="font-bold text-slate-600">Block Time</span>
                    <span className="font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded text-xs">02:00–03:00 <span className="text-emerald-500 mx-1">&</span> 03:20–05:00</span>
                  </div>
                  <div className="flex justify-between text-sm border-b border-emerald-100 pb-2 items-center">
                    <span className="font-bold text-slate-600">Total Tasks</span>
                    <span className="font-bold text-slate-900">4 <span className="text-xs text-slate-500 ml-1">(Harvested Deferred)</span></span>
                  </div>
                </div>
              </GovernmentCard>
            </div>

            <div className="flex justify-center pt-8">
              <GovernmentButton onClick={() => skipTo(6)} size="lg" className="w-64 py-4 uppercase tracking-widest font-black bg-slate-800 hover:bg-slate-900 shadow-lg">
                View Audit Log
              </GovernmentButton>
            </div>
          </div>
        )}

        {/* STEP 6: AUDIT */}
        {demoState === 6 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
            <h2 className="text-lg font-black text-slate-800 uppercase tracking-widest mb-4">6. Administrative Audit Trail</h2>
            <GovernmentCard className="p-0 overflow-hidden shadow-sm">
              <div className="bg-slate-800 text-white p-3 flex items-center">
                <FileSearch className="h-4 w-4 mr-2" />
                <h3 className="text-sm font-bold uppercase tracking-widest">Decision Logs</h3>
              </div>
              <div className="w-full overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse bg-white">
                  <thead className="bg-slate-100 border-b-2 border-slate-300">
                    <tr>
                      <th className="px-3 py-3 font-bold text-slate-700">Timestamp</th>
                      <th className="px-3 py-3 font-bold text-slate-700">Event</th>
                      <th className="px-3 py-3 font-bold text-slate-700">New Plan</th>
                      <th className="px-3 py-3 font-bold text-slate-700 w-1/2">Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr className="hover:bg-slate-50">
                      <td className="px-3 py-3 text-slate-500">16:18</td>
                      <td className="px-3 py-3 font-bold text-slate-900"><StatusBadge status="danger">Emergency</StatusBadge> Emergency replan</td>
                      <td className="px-3 py-3 font-mono font-bold">Plan #205</td>
                      <td className="px-3 py-3 text-slate-600">Train movement changed. High-priority Vande Bharat special added at 03:10. Block split.</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="px-3 py-3 text-slate-500">16:15</td>
                      <td className="px-3 py-3 font-bold text-slate-900"><StatusBadge status="success">Harvest</StatusBadge> Task harvested</td>
                      <td className="px-3 py-3 font-mono font-bold">Plan #204</td>
                      <td className="px-3 py-3 text-slate-600">Unused possession capacity. Inserted S&T cable inspection.</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="px-3 py-3 text-slate-500">15:42</td>
                      <td className="px-3 py-3 font-bold text-slate-900"><StatusBadge status="info">Routine</StatusBadge> Block optimized</td>
                      <td className="px-3 py-3 font-mono font-bold">Plan #203</td>
                      <td className="px-3 py-3 text-slate-600">Daily planning cycle. Merged Eng, S&T, TRD blocks.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </GovernmentCard>
            
            <div className="flex justify-center pt-8">
              <GovernmentButton onClick={() => skipTo(1)} variant="outline" size="lg" className="w-64 py-4 uppercase tracking-widest font-black shadow-sm">
                Restart Demo
              </GovernmentButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
