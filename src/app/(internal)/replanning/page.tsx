"use client";
import { InternalTabs } from "@/components/InternalTabs";
import { useTranslation } from "@/lib/i18n";
import { useAppState } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { 
  SectionHeader, GovernmentCard, 
  GovernmentButton, StatusBadge, AlertBanner
} from "@/components/design-system";
import { AlertTriangle, Clock, MapIcon, RefreshCw, CheckCircle, ShieldAlert, ServerCrash, HardHat } from "lucide-react";

type Scenario = 
  | "Rail Fracture" 
  | "OHE Catenary Fault" 
  | "Signal Failure" 
  | "Goods Traffic Surge" 
  | "Passenger Traffic Surge" 
  | "Sudden Block Cancellation" 
  | "Crew Shortage";

export default function EmergencyReplanningPage() {
  const { t } = useTranslation();
  const { state, dispatch } = useAppState();
  const router = useRouter();

  const [activeScenario, setActiveScenario] = useState<Scenario>("Rail Fracture");
  const [scenarioState, setScenarioState] = useState<"IDLE" | "RUNNING" | "RESULTS">("IDLE");
  const [step, setStep] = useState(0);

  const activeBlock = state.blocks.length > 0 ? state.blocks[state.blocks.length - 1] : null;

  const SCENARIOS: Scenario[] = [
    "Rail Fracture",
    "OHE Catenary Fault",
    "Signal Failure",
    "Goods Traffic Surge",
    "Passenger Traffic Surge",
    "Sudden Block Cancellation",
    "Crew Shortage"
  ];

  const getScenarioDetails = (s: Scenario) => {
    switch (s) {
      case "Rail Fracture": return {
        affectedCorridor: "KOTA-ITARSI", affectedAssets: "Track Section K-14", affectedTrains: "12955 (Rajdhani), 2 Goods", affectedBlocks: activeBlock ? [activeBlock.id] : [],
        impact: { tasks: 4, trains: 3, delay: "Medium (45 mins)", risk: "CRITICAL", blockImpact: "Block Extended by 120 mins" },
        revisedPlan: "Implement SINGLE LINE WORKING (SLW) for UP line. Cancel 2 lower priority tasks.",
        slw: true, tsr: true
      };
      case "OHE Catenary Fault": return {
        affectedCorridor: "JAIPUR-KOTA", affectedAssets: "OHE Mast 12/4", affectedTrains: "All Electric Traction", affectedBlocks: activeBlock ? [activeBlock.id] : [],
        impact: { tasks: 2, trains: 8, delay: "High (120+ mins)", risk: "HIGH", blockImpact: "Emergency Power Block" },
        revisedPlan: "Route diesel traffic only. Implement SLW.",
        slw: true, tsr: false
      };
      case "Signal Failure": return {
        affectedCorridor: "AJMER-JAIPUR", affectedAssets: "Auto Signaling Block 4", affectedTrains: "4 Passenger, 1 Goods", affectedBlocks: [],
        impact: { tasks: 1, trains: 5, delay: "Medium (30 mins)", risk: "MEDIUM", blockImpact: "None" },
        revisedPlan: "Paper Line Clear working. Implement TEMPORARY SPEED RESTRICTION (TSR) 30 kmph.",
        slw: false, tsr: true
      };
      case "Goods Traffic Surge": return {
        affectedCorridor: "KOTA-ITARSI", affectedAssets: "None", affectedTrains: "6 Extra Goods Trains", affectedBlocks: activeBlock ? [activeBlock.id] : [],
        impact: { tasks: 3, trains: 0, delay: "Low", risk: "LOW", blockImpact: "Block Window Reduced by 60 mins" },
        revisedPlan: "Truncate Block. Reschedule 2 Engineering tasks.",
        slw: false, tsr: false
      };
      case "Passenger Traffic Surge": return {
        affectedCorridor: "BHARATPUR-ITARSI", affectedAssets: "None", affectedTrains: "2 Special Holiday Trains", affectedBlocks: activeBlock ? [activeBlock.id] : [],
        impact: { tasks: 1, trains: 2, delay: "Low", risk: "MEDIUM", blockImpact: "Block Split" },
        revisedPlan: "Split Block into two 90 min windows to pass traffic.",
        slw: false, tsr: false
      };
      case "Sudden Block Cancellation": return {
        affectedCorridor: "KOTA-ITARSI", affectedAssets: "Various", affectedTrains: "None", affectedBlocks: activeBlock ? [activeBlock.id] : [],
        impact: { tasks: 5, trains: 0, delay: "None", risk: "HIGH (Overdue tasks)", blockImpact: "Block Cancelled" },
        revisedPlan: "Push tasks to Backlog. Replan for tomorrow.",
        slw: false, tsr: false
      };
      case "Crew Shortage": return {
        affectedCorridor: "JAIPUR-KOTA", affectedAssets: "None", affectedTrains: "None", affectedBlocks: activeBlock ? [activeBlock.id] : [],
        impact: { tasks: 3, trains: 0, delay: "None", risk: "MEDIUM", blockImpact: "Reduced Task Count" },
        revisedPlan: "Harvest S&T Crew for Engineering support. Drop S&T tasks.",
        slw: false, tsr: false
      };
    }
  };

  const details = getScenarioDetails(activeScenario);

  const handleRun = () => {
    setScenarioState("RUNNING");
    setStep(0);
    const interval = setInterval(() => {
      setStep(s => {
        if (s >= 3) {
          clearInterval(interval);
          setScenarioState("RESULTS");
          return s;
        }
        return s + 1;
      });
    }, 600);
  };

  const handleApply = () => {
    dispatch({ type: "ADD_AUDIT_EVENT", payload: {
      event: "SCENARIO_REPLAN_APPLIED",
      entity: activeScenario,
      previousState: "NORMAL",
      newState: "EMERGENCY_REPLANNED",
      reason: `Applied Sandbox Scenario: ${activeScenario}. ${details.revisedPlan}`,
      user: "Control Officer"
    }});
    dispatch({ type: "ADD_NOTIFICATION", payload: {
      severity: "Critical",
      title: "EMERGENCY EVENT",
      message: `Emergency Sandbox Replan applied for ${activeScenario}.`,
      relatedEntity: "SYSTEM"
    }});
    alert("Revised Plan Applied. Audit event recorded.");
    setScenarioState("IDLE");
  };

  const handleReset = () => {
    setScenarioState("IDLE");
  };

  return (
    <div className="space-y-4 pb-12">
      <InternalTabs tabs={[
        { name: "What-If Scenarios", href: "/simulator" },
        { name: "Emergency Sandbox", href: "/replanning", active: true }
      ]} />
      <SectionHeader 
        title="Emergency Railway Scenario Sandbox" 
        description="Inject deterministic faults and surges to evaluate replanning response."
        action={<StatusBadge status="danger">SIMULATION ONLY</StatusBadge>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* LEFT: SCENARIOS */}
        <div className="lg:col-span-1 space-y-4">
          <GovernmentCard className="p-4">
            <h3 className="text-sm font-bold border-b border-slate-300 pb-2 mb-4 text-slate-800 flex items-center">
              <ShieldAlert className="h-4 w-4 mr-2 text-slate-500" />
              Scenario Presets
            </h3>
            
            <div className="flex flex-col gap-2">
              {SCENARIOS.map(s => (
                <button 
                  key={s}
                  disabled={scenarioState !== "IDLE"}
                  onClick={() => setActiveScenario(s)}
                  className={`text-xs px-3 py-2 rounded font-bold text-left transition-colors ${activeScenario === s ? 'bg-red-800 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'} disabled:opacity-50`}
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 space-y-2">
              {scenarioState === "IDLE" ? (
                <GovernmentButton onClick={handleRun} variant="danger" className="w-full">
                  RUN SCENARIO
                </GovernmentButton>
              ) : (
                <GovernmentButton onClick={handleReset} variant="outline" className="w-full">
                  RESET SCENARIO
                </GovernmentButton>
              )}
            </div>
          </GovernmentCard>
        </div>

        {/* RIGHT: RESULTS */}
        <div className="lg:col-span-3">
          {scenarioState === "IDLE" && (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center p-12 bg-slate-50 border-2 border-dashed border-slate-300 rounded-sm text-slate-500">
              <ServerCrash className="h-12 w-12 mb-4 text-slate-300" />
              <p className="text-sm font-bold uppercase tracking-widest">Sandbox Idle</p>
              <p className="text-xs mt-2 text-center max-w-sm">Select an emergency scenario and click Run to simulate real-time AI response.</p>
            </div>
          )}

          {scenarioState === "RUNNING" && (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center p-12 bg-white border border-slate-300 rounded-sm shadow-sm">
              <RefreshCw className="h-12 w-12 text-red-600 animate-spin mb-4" />
              <p className="text-sm font-bold uppercase tracking-widest text-slate-800">Processing Event...</p>
              <div className="mt-6 space-y-2 text-xs font-bold text-slate-500">
                <div className={step >= 0 ? "text-red-700" : ""}>✓ Detecting operational clash</div>
                <div className={step >= 1 ? "text-red-700" : ""}>{step >= 1 ? "✓" : "..."} Calculating train impacts</div>
                <div className={step >= 2 ? "text-red-700" : ""}>{step >= 2 ? "✓" : "..."} Evaluating safety constraints</div>
                <div className={step >= 3 ? "text-red-700" : ""}>{step >= 3 ? "✓" : "..."} Generating revised plan</div>
              </div>
            </div>
          )}

          {scenarioState === "RESULTS" && (
            <div className="space-y-4 animate-in fade-in duration-500">
              <AlertBanner 
                type="danger" 
                title="EVENT DETECTED" 
                message={`${activeScenario} occurred.`}
              />
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <GovernmentCard className="p-3 bg-red-50 border-red-200">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">Affected Corridor</div>
                  <div className="text-sm font-bold text-slate-900 mt-1">{details.affectedCorridor}</div>
                </GovernmentCard>
                <GovernmentCard className="p-3 bg-red-50 border-red-200">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">Affected Assets</div>
                  <div className="text-sm font-bold text-slate-900 mt-1">{details.affectedAssets}</div>
                </GovernmentCard>
                <GovernmentCard className="p-3 bg-red-50 border-red-200">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">Affected Trains</div>
                  <div className="text-sm font-bold text-slate-900 mt-1">{details.affectedTrains}</div>
                </GovernmentCard>
                <GovernmentCard className="p-3 bg-red-50 border-red-200">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">Affected Blocks</div>
                  <div className="text-sm font-bold text-slate-900 mt-1">{details.affectedBlocks.length > 0 ? details.affectedBlocks.join(", ") : "None"}</div>
                </GovernmentCard>
              </div>

              <GovernmentCard className="p-5 border-l-4 border-l-slate-800">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest border-b border-slate-200 pb-2 mb-4">Current Plan Impact</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase">Tasks</div>
                    <div className="text-lg font-black text-slate-900">{details.impact.tasks}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase">Trains</div>
                    <div className="text-lg font-black text-slate-900">{details.impact.trains}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase">Delay Exp.</div>
                    <div className="text-lg font-black text-slate-900">{details.impact.delay}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase">Risk Exp.</div>
                    <div className="text-lg font-black text-red-700">{details.impact.risk}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase">Block Impact</div>
                    <div className="text-lg font-black text-slate-900">{details.impact.blockImpact}</div>
                  </div>
                </div>
              </GovernmentCard>

              <GovernmentCard className="p-5 border-2 border-emerald-600 bg-emerald-50 shadow-md">
                <h3 className="text-xs font-bold text-emerald-900 uppercase tracking-widest border-b border-emerald-200 pb-2 mb-4">Revised AI Plan</h3>
                <p className="text-sm font-bold text-emerald-900 mb-4">{details.revisedPlan}</p>
                
                <div className="flex gap-2 flex-wrap mb-4">
                  {details.slw && (
                    <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold px-2 py-1 rounded">SINGLE LINE WORKING (SLW) REQUIRED</span>
                  )}
                  {details.tsr && (
                    <span className="bg-orange-100 text-orange-900 border border-orange-300 text-[10px] font-bold px-2 py-1 rounded">TEMPORARY SPEED RESTRICTION (TSR)</span>
                  )}
                </div>

                <div className="flex justify-end gap-3 border-t border-emerald-200 pt-4">
                  <GovernmentButton variant="primary" onClick={handleApply}>
                    APPLY REVISED PLAN
                  </GovernmentButton>
                </div>
              </GovernmentCard>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
