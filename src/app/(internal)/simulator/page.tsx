"use client";
import { InternalTabs } from "@/components/InternalTabs";
import { useTranslation } from "@/lib/i18n";

import { useState } from "react";
import { 
  SectionHeader, GovernmentCard, 
  GovernmentButton, StatusBadge, AlertBanner
} from "@/components/design-system";
import { Settings, BarChart2, Activity, Info } from "lucide-react";

export default function SimulatorPage() {
  const { t } = useTranslation();
  const [preset, setPreset] = useState("Normal Operations");
  const [controls, setControls] = useState({
    passengerFreq: "Medium",
    goodsFreq: "Medium",
    blockDuration: "180 mins",
    crewAvailability: "100%",
    emergencyTasks: "0",
    backlog: "Standard"
  });

  const [isSimulating, setIsSimulating] = useState(false);
  const [hasResults, setHasResults] = useState(false);

  const presets = [
    "Normal Operations", 
    "Heavy Goods Traffic", 
    "Crew Shortage", 
    "Emergency Maintenance", 
    "Reduced Block Window"
  ];

  const handlePresetChange = (p: string) => {
    setPreset(p);
    setHasResults(false);
    switch (p) {
      case "Normal Operations":
        setControls({ passengerFreq: "Medium", goodsFreq: "Medium", blockDuration: "180 mins", crewAvailability: "100%", emergencyTasks: "0", backlog: "Standard" });
        break;
      case "Heavy Goods Traffic":
        setControls({ passengerFreq: "Medium", goodsFreq: "High", blockDuration: "180 mins", crewAvailability: "100%", emergencyTasks: "0", backlog: "Standard" });
        break;
      case "Crew Shortage":
        setControls({ passengerFreq: "Medium", goodsFreq: "Medium", blockDuration: "180 mins", crewAvailability: "70%", emergencyTasks: "0", backlog: "High" });
        break;
      case "Emergency Maintenance":
        setControls({ passengerFreq: "Medium", goodsFreq: "Medium", blockDuration: "180 mins", crewAvailability: "100%", emergencyTasks: "2", backlog: "High" });
        break;
      case "Reduced Block Window":
        setControls({ passengerFreq: "Medium", goodsFreq: "Medium", blockDuration: "120 mins", crewAvailability: "100%", emergencyTasks: "0", backlog: "High" });
        break;
    }
  };

  const runScenario = () => {
    setIsSimulating(true);
    setHasResults(false);
    setTimeout(() => {
      setIsSimulating(false);
      setHasResults(true);
    }, 1500);
  };

  // Deterministic results logic based on preset
  const getResults = () => {
    if (preset === "Heavy Goods Traffic") {
      return {
        duration: { cur: "180 mins", sce: "180 mins" },
        tasks: { cur: "4", sce: "3" },
        delay: { cur: "Low", sce: "Medium (2 Trains)" },
        util: { cur: "94%", sce: "78%" },
        risk: { cur: "93%", sce: "85%" },
        avoided: { cur: "3.4 hrs", sce: "2.1 hrs" },
        recommendation: "Move the block from 02:00–05:00 to 02:30–05:30 to avoid conflict with the incoming freight convoy and defer one low-priority task.",
      };
    } else if (preset === "Reduced Block Window") {
      return {
        duration: { cur: "180 mins", sce: "120 mins" },
        tasks: { cur: "4", sce: "2" },
        delay: { cur: "Low", sce: "Low" },
        util: { cur: "94%", sce: "98%" },
        risk: { cur: "93%", sce: "65%" },
        avoided: { cur: "3.4 hrs", sce: "1.2 hrs" },
        recommendation: "Defer the S&T cable inspection and focus solely on high-risk Engineering track renewal.",
      };
    } else if (preset === "Emergency Maintenance") {
      return {
        duration: { cur: "180 mins", sce: "240 mins" },
        tasks: { cur: "4", sce: "5" },
        delay: { cur: "Low", sce: "High (4 Trains)" },
        util: { cur: "94%", sce: "99%" },
        risk: { cur: "93%", sce: "100%" },
        avoided: { cur: "3.4 hrs", sce: "4.5 hrs" },
        recommendation: "Declare emergency block extension. Reschedule 2 Passenger trains and halt 2 Goods trains at previous stations.",
      };
    } else if (preset === "Crew Shortage") {
      return {
        duration: { cur: "180 mins", sce: "180 mins" },
        tasks: { cur: "4", sce: "3" },
        delay: { cur: "Low", sce: "Low" },
        util: { cur: "94%", sce: "80%" },
        risk: { cur: "93%", sce: "82%" },
        avoided: { cur: "3.4 hrs", sce: "2.0 hrs" },
        recommendation: "Reallocate TRD crew to support critical Engineering tasks. Drop OHE inspection from current block.",
      };
    }
    // Normal
    return {
        duration: { cur: "180 mins", sce: "180 mins" },
        tasks: { cur: "4", sce: "4" },
        delay: { cur: "Low", sce: "Low" },
        util: { cur: "94%", sce: "94%" },
        risk: { cur: "93%", sce: "93%" },
        avoided: { cur: "3.4 hrs", sce: "3.4 hrs" },
        recommendation: "Current plan is optimal for normal operations. Proceed with approval.",
    };
  };

  const results = getResults();

  return (
    <div className="space-y-4 pb-12">
      <InternalTabs tabs={[
        { name: "What-If Scenarios", href: "/simulator" },
        { name: "Emergency Replanning", href: "/replanning" }
      ]} />
      <SectionHeader 
        title={t("page.simulator.title")} 
        description="Test operational scenarios before approving a maintenance block."
        action={<StatusBadge status="info">Strategic Planning</StatusBadge>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: SCENARIO CONTROLS */}
        <div className="lg:col-span-1 space-y-4">
          <GovernmentCard className="p-4">
            <h3 className="text-sm font-bold border-b border-slate-300 pb-2 mb-4 text-slate-800 flex items-center">
              <Settings className="h-4 w-4 mr-2 text-slate-500" />
              Scenario Controls
            </h3>
            
            <div className="mb-4">
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Load Preset</label>
              <div className="flex flex-wrap gap-2">
                {presets.map(p => (
                  <button 
                    key={p}
                    onClick={() => handlePresetChange(p)}
                    className={`text-[10px] px-2 py-1 rounded border font-bold transition-colors ${preset === p ? 'bg-slate-800 text-white border-slate-800 shadow-sm' : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 mt-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Passenger Train Frequency</label>
                <select 
                  value={controls.passengerFreq} 
                  onChange={(e) => setControls({...controls, passengerFreq: e.target.value})}
                  className="w-full border border-slate-300 rounded-sm p-1.5 text-xs bg-white"
                >
                  <option>Low</option><option>Medium</option><option>High</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Goods Train Frequency</label>
                <select 
                  value={controls.goodsFreq} 
                  onChange={(e) => setControls({...controls, goodsFreq: e.target.value})}
                  className="w-full border border-slate-300 rounded-sm p-1.5 text-xs bg-white"
                >
                  <option>Low</option><option>Medium</option><option>High</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Available Block Duration</label>
                <select 
                  value={controls.blockDuration} 
                  onChange={(e) => setControls({...controls, blockDuration: e.target.value})}
                  className="w-full border border-slate-300 rounded-sm p-1.5 text-xs bg-white"
                >
                  <option>120 mins</option><option>180 mins</option><option>240 mins</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Crew Availability</label>
                <select 
                  value={controls.crewAvailability} 
                  onChange={(e) => setControls({...controls, crewAvailability: e.target.value})}
                  className="w-full border border-slate-300 rounded-sm p-1.5 text-xs bg-white"
                >
                  <option>70%</option><option>85%</option><option>100%</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Emergency Tasks</label>
                <select 
                  value={controls.emergencyTasks} 
                  onChange={(e) => setControls({...controls, emergencyTasks: e.target.value})}
                  className="w-full border border-slate-300 rounded-sm p-1.5 text-xs bg-white"
                >
                  <option>0</option><option>1</option><option>2</option><option>3+</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Maintenance Backlog</label>
                <select 
                  value={controls.backlog} 
                  onChange={(e) => setControls({...controls, backlog: e.target.value})}
                  className="w-full border border-slate-300 rounded-sm p-1.5 text-xs bg-white"
                >
                  <option>Standard</option><option>High</option><option>Critical</option>
                </select>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200">
              <GovernmentButton 
                onClick={runScenario} 
                disabled={isSimulating}
                className="w-full py-3 uppercase tracking-widest font-black text-xs"
              >
                {isSimulating ? "Simulating..." : "Run Scenario"}
              </GovernmentButton>
            </div>
          </GovernmentCard>
        </div>

        {/* RIGHT: SCENARIO RESULTS */}
        <div className="lg:col-span-2">
          {!hasResults && !isSimulating && (
            <div className="h-[400px] flex flex-col items-center justify-center p-12 bg-slate-50 border-2 border-dashed border-slate-300 rounded-sm text-slate-500">
              <BarChart2 className="h-12 w-12 mb-4 text-slate-300" />
              <p className="text-sm font-bold uppercase tracking-widest">Awaiting Simulation</p>
              <p className="text-xs mt-2 text-center max-w-sm">Adjust scenario controls on the left and run the simulation to compare outcomes against the current approved plan.</p>
            </div>
          )}

          {isSimulating && (
            <div className="h-[400px] flex flex-col items-center justify-center p-12 bg-white border border-slate-300 rounded-sm shadow-sm">
              <Activity className="h-12 w-12 text-blue-600 animate-pulse mb-4" />
              <p className="text-sm font-bold uppercase tracking-widest text-slate-800">Running Deterministic Simulation...</p>
              <p className="text-xs mt-2 text-slate-500">Evaluating multi-department constraints and traffic flow.</p>
            </div>
          )}

          {hasResults && !isSimulating && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
              <AlertBanner 
                type={preset === "Normal Operations" ? "success" : "warning"}
                title={`Simulation Complete: ${preset}`}
                message="Deterministic local simulation finished evaluating operational constraints."
              />

              <GovernmentCard className="p-5">
                <div className="flex items-center justify-between border-b border-slate-300 pb-3 mb-4">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Comparison Metrics</h3>
                  <div className="flex gap-4 text-[10px] font-bold uppercase">
                    <span className="flex items-center"><span className="w-3 h-3 bg-slate-200 border border-slate-400 inline-block mr-1"></span> Current Plan</span>
                    <span className="flex items-center"><span className="w-3 h-3 bg-blue-600 inline-block mr-1"></span> Scenario Plan</span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="border-b-2 border-slate-200">
                        <th className="py-2 font-bold text-slate-500 uppercase text-xs w-1/3">Metric</th>
                        <th className="py-2 font-bold text-slate-700 w-1/3 text-center">Current Plan</th>
                        <th className="py-2 font-bold text-blue-800 w-1/3 text-center">Scenario Plan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {[
                        { label: "Block Duration", k1: results.duration.cur, k2: results.duration.sce },
                        { label: "Tasks Completed", k1: results.tasks.cur, k2: results.tasks.sce },
                        { label: "Train Delay Exposure", k1: results.delay.cur, k2: results.delay.sce },
                        { label: "Block Utilization", k1: results.util.cur, k2: results.util.sce, isPct: true },
                        { label: "High-Risk Coverage", k1: results.risk.cur, k2: results.risk.sce, isPct: true },
                        { label: "Future Possession Hours Avoided", k1: results.avoided.cur, k2: results.avoided.sce },
                      ].map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="py-3 font-semibold text-slate-700 text-xs">{row.label}</td>
                          <td className="py-3 text-center">
                            <span className="bg-slate-100 px-2 py-1 rounded text-slate-700 border border-slate-200 font-bold text-xs">{row.k1}</span>
                          </td>
                          <td className="py-3 text-center">
                            <span className={`px-2 py-1 rounded font-bold text-xs border ${row.k1 === row.k2 ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-blue-50 border-blue-200 text-blue-800'}`}>
                              {row.k2}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </GovernmentCard>

              {/* Compact Chart Area */}
              <div className="grid grid-cols-2 gap-4">
                <GovernmentCard className="p-4 flex flex-col justify-center">
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-3 text-center">Block Utilization</h4>
                  <div className="flex items-end justify-center gap-4 h-24">
                    <div className="w-12 bg-slate-200 border-t-2 border-slate-400 relative group flex items-end justify-center" style={{ height: results.util.cur }}>
                      <span className="absolute -top-5 text-[10px] font-bold text-slate-600">{results.util.cur}</span>
                    </div>
                    <div className="w-12 bg-blue-600 relative group flex items-end justify-center" style={{ height: results.util.sce }}>
                      <span className="absolute -top-5 text-[10px] font-bold text-blue-800">{results.util.sce}</span>
                    </div>
                  </div>
                  <div className="flex justify-center gap-4 mt-2 text-[9px] font-bold uppercase text-slate-500">
                    <span className="w-12 text-center">Current</span>
                    <span className="w-12 text-center">Scenario</span>
                  </div>
                </GovernmentCard>
                <GovernmentCard className="p-4 flex flex-col justify-center">
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-3 text-center">Risk Coverage</h4>
                  <div className="flex items-end justify-center gap-4 h-24">
                    <div className="w-12 bg-slate-200 border-t-2 border-slate-400 relative group flex items-end justify-center" style={{ height: results.risk.cur }}>
                      <span className="absolute -top-5 text-[10px] font-bold text-slate-600">{results.risk.cur}</span>
                    </div>
                    <div className="w-12 bg-blue-600 relative group flex items-end justify-center" style={{ height: results.risk.sce }}>
                      <span className="absolute -top-5 text-[10px] font-bold text-blue-800">{results.risk.sce}</span>
                    </div>
                  </div>
                  <div className="flex justify-center gap-4 mt-2 text-[9px] font-bold uppercase text-slate-500">
                    <span className="w-12 text-center">Current</span>
                    <span className="w-12 text-center">Scenario</span>
                  </div>
                </GovernmentCard>
              </div>

              <GovernmentCard className="p-5 border-l-4 border-l-amber-500 bg-amber-50 shadow-md">
                <div className="flex items-start">
                  <Info className="h-5 w-5 text-amber-600 mr-3 mt-0.5" />
                  <div>
                    <h4 className="text-[11px] font-black text-amber-900 uppercase tracking-widest mb-1">Recommended Response</h4>
                    <p className="text-sm font-bold text-slate-800 leading-relaxed">
                      {results.recommendation}
                    </p>
                  </div>
                </div>
              </GovernmentCard>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}



