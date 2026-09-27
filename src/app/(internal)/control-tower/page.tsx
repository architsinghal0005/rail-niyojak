"use client";
import { useTranslation } from "@/lib/i18n";
import { useAppState } from "@/lib/store";
import { calculatePriority, detectAnomalies } from "@/lib/intelligence";
import { useRouter } from "next/navigation";
import { 
  SectionHeader, MetricCard, GovernmentCard, 
  GovernmentButton, AlertBanner, StatusBadge 
} from "@/components/design-system";
import { Info, CheckCircle } from "lucide-react";
import { NetworkMapContent } from "../network-map/page";

export default function Dashboard() {
  const { t } = useTranslation();
  const { state, dispatch } = useAppState();
  const router = useRouter();

  // Compute dynamic KPIs
  const highRiskTasks = state.tasks.filter(t => {
    const intel = calculatePriority(t);
    return intel.urgencyTier === 'Critical' || intel.urgencyTier === 'High';
  }).length;
  const integratedBlocks = state.blocks.filter(b => b.departments.length > 1).length;
  const avgUtilization = state.blocks.length > 0 ? 
    Math.round(state.blocks.reduce((acc, b) => acc + b.utilization, 0) / state.blocks.length) : 0;
  
  const futurePossAvoidedHours = state.blocks.reduce((acc, block) => {
    return acc + block.harvestedTasks.reduce((sum, tid) => {
      const task = state.tasks.find(t => t.id === tid);
      return sum + (task ? task.duration : 0);
    }, 0) / 60;
  }, 0).toFixed(1);

  const blockToDisplay = state.blocks.length > 0 ? state.blocks[state.blocks.length - 1] : null;

  let allocated = 0;
  if (blockToDisplay) {
    blockToDisplay.tasks.forEach(tid => {
      const t = state.tasks.find(x => x.id === tid);
      if (t) allocated += t.duration;
    });
    blockToDisplay.harvestedTasks.forEach(tid => {
      const t = state.tasks.find(x => x.id === tid);
      if (t) allocated += t.duration;
    });
  }
  const remaining = blockToDisplay ? blockToDisplay.durationMinutes - allocated : 0;

  const handleApprove = () => {
    if (state.currentOptimizationResult) {
      if (confirm(`Approve block ${state.currentOptimizationResult.id}?`)) {
        dispatch({ type: "APPROVE_BLOCK", payload: state.currentOptimizationResult.id });
        dispatch({ type: "ADD_AUDIT_EVENT", payload: {
          event: "PLAN_APPROVED",
          entity: state.currentOptimizationResult.id,
          previousState: "OPTIMIZED",
          newState: "APPROVED",
          reason: "Block plan manually approved.",
          user: "Control Officer"
        }});
        alert("Block approved successfully.");
      }
    }
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Top Header */}
      <SectionHeader 
        title={t("page.control_tower.title")} 
        description="Integrated Railway Maintenance & Block Planning" 
        action={
          <div className="text-right text-xs">
            <div className="font-bold text-slate-800">Division: Kota Division</div>
            <div className="text-slate-600">Planning Date: 24 September 2026</div>
            <div className="text-amber-700 font-bold mt-1 uppercase tracking-tight">Data Status: Synthetic Prototype Data</div>
          </div>
        }
      />

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <MetricCard title="Asset Availability" value="94.2%" status="success" />
        <MetricCard title="Integrated Blocks" value={integratedBlocks.toString()} />
        <MetricCard title="Block Utilization" value={`${avgUtilization}%`} status={avgUtilization > 85 ? "success" : "warning"} />
        <MetricCard title="High-Risk Tasks" value={highRiskTasks.toString()} status="danger" />
        <MetricCard title="Conflicts Prevented" value="12" status="success" />
        <MetricCard title="Future Poss. Avoided" value={`${futurePossAvoidedHours} h`} status="success" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Left: Map */}
        <div className="md:col-span-2">
          <div className="h-[500px] md:h-full min-h-[400px]">
            <NetworkMapContent embedded={true} />
          </div>
        </div>
        
        {/* Right: Alerts */}
        <div>
          <GovernmentCard className="h-full p-4">
            <h3 className="text-sm font-bold border-b border-slate-300 pb-2 mb-4 flex justify-between">
              AI Anomaly Detection
              <StatusBadge status="warning">{detectAnomalies(state.tasks).length} Anomalies</StatusBadge>
            </h3>
            <div className="space-y-3">
              {detectAnomalies(state.tasks).map(anomaly => (
                <AlertBanner 
                  key={anomaly.id}
                  type={anomaly.severity === "High" ? "danger" : "warning"}
                  title={`[${anomaly.id}] ${anomaly.type}`} 
                  message={`${anomaly.corridorId}: ${anomaly.description}`}
                />
              ))}
              {detectAnomalies(state.tasks).length === 0 && (
                <div className="text-sm text-slate-500 italic p-4 text-center">No anomalies detected.</div>
              )}
            </div>
            
            <h3 className="text-sm font-bold border-b border-slate-300 pb-2 mt-6 mb-4 flex justify-between">
              Operational Alerts
              <StatusBadge status="danger">{highRiskTasks > 0 ? `${highRiskTasks} High Risk` : '0 Critical'}</StatusBadge>
            </h3>
            <div className="space-y-3">
              {highRiskTasks > 0 && <AlertBanner type="danger" message={`${highRiskTasks} high-risk maintenance tasks pending`} />}
              {state.tasks.filter(t => t.status === 'PENDING').length > 0 && <AlertBanner type="success" message={`${state.tasks.filter(t => t.status === 'PENDING').length} harvestable candidates available`} />}
              <AlertBanner type="warning" message="1 block conflict detected (KOTA-RMA)" />
              <AlertBanner type="info" message="Train forecast updated from COA at 14:00" />
            </div>
          </GovernmentCard>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Main Section: Block Plan */}
        <div className="md:col-span-2 space-y-4">
          <GovernmentCard className="p-4">
            <h3 className="text-sm font-bold border-b border-slate-300 pb-2 mb-4 flex justify-between items-center">
              Today's Block Plan {blockToDisplay ? `(${blockToDisplay.startTime} - ${blockToDisplay.endTime})` : ''}
              <span className="text-[10px] text-slate-500 font-normal">{blockToDisplay ? blockToDisplay.corridor : 'No active blocks'}</span>
            </h3>
            
            {!blockToDisplay ? (
              <div className="text-center py-8 text-slate-500 text-sm">
                No blocks planned for today. Use the Block Planner to create one.
              </div>
            ) : (
              <div className="w-full overflow-x-auto">
                <div className="min-w-[600px] text-xs">
                  {/* Header */}
                  <div className="flex border-b border-slate-300 pb-1 mb-2 text-slate-500 font-bold">
                    <div className="w-24">Dept</div>
                    <div className="flex-1 flex justify-between px-2">
                      <span>0%</span>
                      <span>25%</span>
                      <span>50%</span>
                      <span>75%</span>
                      <span>100%</span>
                    </div>
                  </div>
                  {/* Gantt Rows */}
                  <div className="space-y-2">
                    {['Engineering', 'S&T', 'TRD'].map(dept => {
                      const deptBaseTasks = blockToDisplay.tasks
                        .map(tid => state.tasks.find(t => t.id === tid))
                        .filter(t => t?.department === dept);
                      
                      const deptHarvestedTasks = blockToDisplay.harvestedTasks
                        .map(tid => state.tasks.find(t => t.id === tid))
                        .filter(t => t?.department === dept);
                        
                      if (deptBaseTasks.length === 0 && deptHarvestedTasks.length === 0) return null;

                      let currentOffset = 0;
                      return (
                        <div key={dept} className="flex items-center">
                          <div className="w-24 font-bold text-slate-700">{dept}</div>
                          <div className="flex-1 relative h-8 bg-slate-100 border border-slate-300 flex">
                            {deptBaseTasks.map((t, idx) => {
                              if (!t) return null;
                              const width = (t.duration / blockToDisplay.durationMinutes) * 100;
                              return (
                                <div key={idx} className={`h-full border-l-2 border-r-2 flex items-center justify-center ${
                                  dept === 'Engineering' ? 'bg-red-800/20 border-red-800 text-red-900' :
                                  dept === 'S&T' ? 'bg-blue-600/20 border-blue-600 text-blue-900' :
                                  'bg-amber-500/20 border-amber-500 text-amber-900'
                                }`} style={{ width: `${width}%` }}>
                                  <span className="text-[9px] font-bold truncate px-1">{t.title}</span>
                                </div>
                              );
                            })}
                            {deptHarvestedTasks.map((t, idx) => {
                              if (!t) return null;
                              const width = (t.duration / blockToDisplay.durationMinutes) * 100;
                              return (
                                <div key={`h-${idx}`} className={`h-full bg-emerald-500 text-white flex items-center justify-center border border-emerald-700 z-10 shadow-sm`} style={{ width: `${width}%` }} title="Harvested Task">
                                  <span className="text-[9px] font-bold truncate px-1">{t.title} (H)</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Legend */}
                  <div className="mt-4 flex gap-4 text-[10px] text-slate-600 font-medium pt-2 border-t border-slate-200">
                    <div className="flex items-center"><div className="w-3 h-3 bg-slate-200 border border-slate-400 mr-1"></div> Planned Block</div>
                    <div className="flex items-center"><div className="w-3 h-3 bg-emerald-500 border border-emerald-700 mr-1"></div> Harvested Task</div>
                  </div>
                </div>
              </div>
            )}
          </GovernmentCard>

          {/* Block Harvesting */}
          {blockToDisplay && (
            <GovernmentCard className="p-4 border-l-4 border-l-emerald-600">
              <h3 className="text-sm font-bold border-b border-slate-300 pb-2 mb-3 flex justify-between items-center text-slate-800">
                <span className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-emerald-600"/> Block Harvesting Opportunity</span>
                <StatusBadge status={remaining > 0 ? "success" : "neutral"}>{remaining > 0 ? "High Yield" : "Capacity Full"}</StatusBadge>
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <div className="text-[10px] uppercase text-slate-500 font-bold mb-1">Existing Block</div>
                  <div className="text-lg font-bold text-slate-900">{blockToDisplay.durationMinutes} min</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-slate-500 font-bold mb-1">Allocated</div>
                  <div className="text-lg font-bold text-slate-900">{allocated} min</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-emerald-600 font-bold mb-1">Remaining</div>
                  <div className="text-lg font-bold text-emerald-700">{remaining} min</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-slate-500 font-bold mb-1">Harvested Tasks</div>
                  <div className="text-lg font-bold text-slate-900">{blockToDisplay.harvestedTasks.length}</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between bg-slate-50 p-3 border border-slate-200 rounded-sm">
                <div className="text-sm font-semibold text-slate-700">
                  Potential future possession avoided: <span className="text-emerald-700 font-bold ml-1">{futurePossAvoidedHours} h</span>
                </div>
                <GovernmentButton size="sm" onClick={() => router.push('/harvesting')}>
                  OPEN BLOCK HARVESTING
                </GovernmentButton>
              </div>
            </GovernmentCard>
          )}
        </div>

        {/* AI Recommended Block */}
        <div>
          {state.currentOptimizationResult ? (
            <GovernmentCard className="p-4 h-full bg-slate-50 border-t-4 border-t-blue-800 shadow-md flex flex-col">
              <div className="flex items-center mb-4 justify-between">
                <div className="flex items-center">
                  <Info className="h-5 w-5 text-blue-800 mr-2" />
                  <h3 className="text-sm font-bold text-blue-900">AI Recommended Block</h3>
                </div>
                <StatusBadge status={state.currentOptimizationResult.status === 'APPROVED' ? 'success' : 'warning'}>
                  {state.currentOptimizationResult.status}
                </StatusBadge>
              </div>
              
              <div className="space-y-3 text-sm flex-1">
                <div className="flex justify-between border-b border-slate-200 pb-1">
                  <span className="text-slate-500 font-bold text-xs uppercase">Corridor</span>
                  <span className="font-bold text-slate-900">{state.currentOptimizationResult.corridor}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1">
                  <span className="text-slate-500 font-bold text-xs uppercase">Time</span>
                  <span className="font-bold text-slate-900">{state.currentOptimizationResult.startTime}–{state.currentOptimizationResult.endTime}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1">
                  <span className="text-slate-500 font-bold text-xs uppercase">Departments</span>
                  <span className="font-bold text-slate-900 text-right">{state.currentOptimizationResult.departments.join(' + ')}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1">
                  <span className="text-slate-500 font-bold text-xs uppercase">Block Util.</span>
                  <span className="font-bold text-emerald-600">{state.currentOptimizationResult.utilization}%</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1">
                  <span className="text-slate-500 font-bold text-xs uppercase">Train Impact</span>
                  <span className="font-bold text-emerald-600">{state.currentOptimizationResult.trainImpact}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1">
                  <span className="text-slate-500 font-bold text-xs uppercase">Risk Coverage</span>
                  <span className="font-bold text-slate-900">{state.currentOptimizationResult.riskCoverage}</span>
                </div>
                <div className="flex justify-between pb-1">
                  <span className="text-slate-500 font-bold text-xs uppercase">Confidence</span>
                  <span className="font-bold text-blue-700">91%</span>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-2 shrink-0">
                <GovernmentButton 
                  variant="primary" 
                  className="w-full"
                  disabled={state.currentOptimizationResult.status === 'APPROVED'}
                  onClick={handleApprove}
                >
                  {state.currentOptimizationResult.status === 'APPROVED' ? 'Approved' : 'Approve'}
                </GovernmentButton>
                <div className="flex gap-2">
                  <GovernmentButton variant="outline" className="flex-1" onClick={() => router.push('/block-planner')}>
                    View Plan
                  </GovernmentButton>
                  <GovernmentButton variant="secondary" className="flex-1">
                    Explain
                  </GovernmentButton>
                </div>
              </div>
            </GovernmentCard>
          ) : (
            <GovernmentCard className="p-4 h-full bg-slate-50 flex items-center justify-center text-center">
              <div className="text-slate-500 text-sm">
                <Info className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                No active AI recommendations. Use the Block Planner to generate a new block plan.
              </div>
            </GovernmentCard>
          )}
        </div>
      </div>
    </div>
  );
}
