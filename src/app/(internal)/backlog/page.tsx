"use client";
import { useTranslation } from "@/lib/i18n";

import { useState } from "react";
import { 
  SectionHeader, MetricCard, GovernmentCard, 
  GovernmentButton, StatusBadge, DataTable, FilterBar, Drawer, InfoPanel
} from "@/components/design-system";
import { Search } from "lucide-react";

import { useAppState, MaintenanceTask, useRBAC } from "@/lib/store";
import { calculatePriority } from "@/lib/intelligence";
import { useRouter } from "next/navigation";

export default function BacklogPage() {
  const { t } = useTranslation();
  const { state, dispatch } = useAppState();
  const router = useRouter();
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [selectedTask, setSelectedTask] = useState<MaintenanceTask | null>(null);
  const [viewMode, setViewMode] = useState<"TASKS" | "ASSET">("TASKS");
  
  // Filter state
  const [deptFilter, setDeptFilter] = useState("All");
  const [severityFilter, setSeverityFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [riskSlider, setRiskSlider] = useState(0);

  const { hasPermission } = useRBAC();
  const canViewDept = (dept: string) => {
    if (hasPermission("VIEW_ALL") || hasPermission("ALL")) return true;
    if (dept === "Engineering" && hasPermission("VIEW_ENGINEERING")) return true;
    if (dept === "S&T" && hasPermission("VIEW_S&T")) return true;
    if (dept === "TRD" && hasPermission("VIEW_TRD")) return true;
    return false;
  };

  const canSelectDept = (dept: string) => {
    if (hasPermission("ALL") || hasPermission("OPTIMIZE")) return true;
    if (dept === "Engineering" && hasPermission("SELECT_ENGINEERING_TASKS")) return true;
    if (dept === "S&T" && hasPermission("SELECT_S&T_TASKS")) return true;
    if (dept === "TRD" && hasPermission("SELECT_TRD_TASKS")) return true;
    return false;
  };

  const filteredTasks = state.tasks.filter(task => {
    if (!canViewDept(task.department)) return false;
    if (deptFilter !== "All" && task.department !== deptFilter) return false;
    // Map severity to risk levels roughly for filter
    if (severityFilter !== "All" && task.risk !== severityFilter) return false;
    
    // Status filter mapping
    if (statusFilter !== "All" && task.status !== statusFilter.toUpperCase()) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* HEADER */}
      <SectionHeader 
        title={t("page.backlog.title")} 
        description="Integrated Engineering, S&T and TRD Maintenance Tasks"
        action={
          <GovernmentButton 
            variant="primary" 
            disabled={selectedTaskIds.length === 0}
            onClick={() => {
              dispatch({ type: "QUEUE_TASKS_FOR_PLANNING", payload: selectedTaskIds });
              dispatch({ type: "ADD_NOTIFICATION", payload: { severity: "Medium", title: "TASKS QUEUED", message: `${selectedTaskIds.length} tasks added to Block Planner.`, relatedEntity: "" } });
              alert(`${selectedTaskIds.length} tasks added to Block Planner.`);
              setSelectedTaskIds([]);
            }}
          >
            PLAN SELECTED TASKS ({selectedTaskIds.length})
          </GovernmentButton>
        }
      />

      {/* TOP SUMMARY */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard title="Total Tasks" value={state.tasks.length.toString()} />
        <MetricCard title="High Risk" value={state.tasks.filter(t => t.severity === 'High' || t.severity === 'Critical' || t.risk === 'High' || t.risk === 'Critical').length.toString()} status="danger" />
        <MetricCard title="Overdue" value={state.tasks.filter(t => t.daysOverdue > 0 || (t.status as string) === 'OVERDUE').length.toString()} status="warning" />
        <MetricCard title="Harvest Candidates" value={state.tasks.filter(t => t.harvestable).length.toString()} status="success" />
      </div>

      <GovernmentCard className="p-4">
        {/* FILTER BAR */}
        <FilterBar>
          <select 
            className="text-xs border border-slate-300 rounded-sm p-1.5 bg-white"
            value={deptFilter} onChange={e => setDeptFilter(e.target.value)}
          >
            <option value="All">Dept: All</option>
            <option value="Engineering">Engineering</option>
            <option value="S&T">S&T</option>
            <option value="TRD">TRD</option>
          </select>

          <select 
            className="text-xs border border-slate-300 rounded-sm p-1.5 bg-white"
            value={severityFilter} onChange={e => setSeverityFilter(e.target.value)}
          >
            <option value="All">Severity: All</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <select 
            className="text-xs border border-slate-300 rounded-sm p-1.5 bg-white"
            value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="All">Status: All</option>
            <option value="Pending">Pending</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Overdue">Overdue</option>
          </select>

          <select className="text-xs border border-slate-300 rounded-sm p-1.5 bg-white">
            <option value="All">Location: All corridors</option>
            <option value="KOTA-RMA">KOTA-RMA</option>
            <option value="SWM-KOTA">SWM-KOTA</option>
            <option value="KOTA-ITARSI">KOTA-ITARSI</option>
          </select>

          <div className="flex items-center gap-2 ml-4 px-3 border-l border-slate-300">
            <span className="text-xs font-semibold text-slate-600">Min Risk:</span>
            <input 
              type="range" min="0" max="100" 
              value={riskSlider} onChange={e => setRiskSlider(Number(e.target.value))}
              className="w-24 accent-red-800"
            />
            <span className="text-xs font-bold text-slate-800">{riskSlider}+</span>
          </div>

          <div className="ml-auto">
            <GovernmentButton size="sm" variant="outline">
              <Search className="h-4 w-4 mr-1" /> Search
            </GovernmentButton>
          </div>
        </FilterBar>

        {/* DATA TABLE */}
        <DataTable 
          headers={["", "Task ID", "Dept", "Asset", "Corridor", "Category", "Urgency", "Priority Score", "Due Date", "Dur.", "Crew", "Status", "Harvestable"]}
          maxHeight="500px"
          className="overflow-y-auto"
        >
          {filteredTasks.map(task => {
            const isSelected = selectedTaskIds.includes(task.id);
            const intelligence = calculatePriority(task);
            return (
              <tr 
                key={task.id} 
                onClick={() => { setSelectedTask(task); setViewMode("TASKS"); }}
                className={`cursor-pointer border-b border-slate-200 transition-colors ${isSelected ? 'bg-amber-50 hover:bg-amber-100' : 'hover:bg-slate-50'}`}
              >
                <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                  <input 
                    type="checkbox" 
                    checked={isSelected}
                    disabled={!canSelectDept(task.department)}
                    onChange={() => {
                      if (!canSelectDept(task.department)) return;
                      if (isSelected) {
                        setSelectedTaskIds(prev => prev.filter(id => id !== task.id));
                        dispatch({ type: "MARK_TASK_STATUS", payload: { id: task.id, status: "PENDING" } });
                      } else {
                        setSelectedTaskIds(prev => [...prev, task.id]);
                        dispatch({ type: "MARK_TASK_STATUS", payload: { id: task.id, status: "SELECTED" } });
                      }
                    }}
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </td>
                <td className="px-3 py-2 font-mono text-xs font-bold text-red-800">{task.id}</td>
                <td className="px-3 py-2">
                  <span className={`px-1.5 py-0.5 rounded-sm text-[10px] font-bold ${
                    task.department === 'Engineering' ? 'bg-slate-200 text-slate-800' : 
                    task.department === 'S&T' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-900'
                  }`}>
                    {task.department}
                  </span>
                </td>
                <td className="px-3 py-2 text-xs font-semibold text-slate-700">{task.asset || "-"}</td>
                <td className="px-3 py-2 text-[10px] uppercase text-slate-600">{task.corridor || "-"}</td>
                <td className="px-3 py-2 text-xs text-slate-700">{task.category || task.title}</td>
                <td className="px-3 py-2">
                  <StatusBadge 
                    status={intelligence.urgencyTier === 'Critical' ? 'danger' : intelligence.urgencyTier === 'High' ? 'warning' : 'neutral'}
                  >
                    {intelligence.urgencyTier}
                  </StatusBadge>
                </td>
                <td className="px-3 py-2 text-xs font-bold text-slate-900">{intelligence.priorityScore}</td>
                <td className="px-3 py-2 text-xs text-slate-700">{task.dueDate || "-"}</td>
                <td className="px-3 py-2 text-xs text-slate-700">{task.duration}m</td>
                <td className="px-3 py-2 text-[10px] text-slate-600">{task.crew || "-"}</td>
                <td className="px-3 py-2">
                  <StatusBadge status={task.status === 'DEFERRED' ? 'danger' : ['SCHEDULED', 'HARVESTED', 'APPROVED', 'COMPLETED'].includes(task.status) ? 'success' : task.status === 'SELECTED' ? 'warning' : 'neutral'}>
                    {task.status}
                  </StatusBadge>
                </td>
                <td className="px-3 py-2 text-center">
                  {task.compatibilityScore ? (
                    <span className="inline-flex items-center justify-center w-5 h-5 bg-emerald-100 text-emerald-700 font-bold text-[10px] rounded-sm border border-emerald-300">H</span>
                  ) : (
                    <span className="text-slate-300 text-xs">-</span>
                  )}
                </td>
              </tr>
            );
          })}
          {filteredTasks.length === 0 && (
            <tr>
              <td colSpan={12} className="px-3 py-8 text-center text-slate-500 text-sm">
                No tasks match the selected filters.
              </td>
            </tr>
          )}
        </DataTable>
      </GovernmentCard>

      <Drawer 
        isOpen={!!selectedTask} 
        onClose={() => setSelectedTask(null)} 
        title={viewMode === "TASKS" ? `Task Details: ${selectedTask?.id}` : `Asset Details: ${selectedTask?.assetId}`}
      >
        {selectedTask && (() => {
          const asset = (state.assets || []).find(a => a.id === selectedTask.assetId);
          return (
          <div className="space-y-5">
            <div className="flex gap-2 mb-4">
              <GovernmentButton size="sm" variant={viewMode === "TASKS" ? "primary" : "outline"} onClick={() => setViewMode("TASKS")}>VIEW TASKS</GovernmentButton>
              <GovernmentButton size="sm" variant={viewMode === "ASSET" ? "primary" : "outline"} onClick={() => setViewMode("ASSET")}>VIEW ASSET</GovernmentButton>
            </div>

            {viewMode === "TASKS" ? (
              <>
                <InfoPanel title="Task Description" className="bg-slate-100 border-slate-300 mb-4">
                  <p className="font-medium text-slate-800">{selectedTask.description}</p>
                </InfoPanel>

                <div className="grid grid-cols-2 gap-y-4 gap-x-2 border-b border-slate-200 pb-4 mb-4">
                  <div>
                    <div className="text-[10px] uppercase text-slate-500 font-bold mb-0.5">Task ID</div>
                    <div className="text-sm font-bold text-slate-900">{selectedTask.id}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase text-slate-500 font-bold mb-0.5">Department</div>
                    <div className="text-sm font-bold text-slate-900">{selectedTask.department}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase text-slate-500 font-bold mb-0.5">Asset</div>
                    <div className="text-sm font-bold text-slate-900">{selectedTask.asset}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase text-slate-500 font-bold mb-0.5">Corridor</div>
                    <div className="text-sm font-bold text-slate-900">{selectedTask.corridor}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase text-slate-500 font-bold mb-0.5">Category</div>
                    <div className="text-sm font-bold text-slate-900">{selectedTask.category || selectedTask.title}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase text-slate-500 font-bold mb-0.5">Risk Score</div>
                    <div className="text-sm font-bold text-red-700">{calculatePriority(selectedTask).riskScore} / 100</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase text-slate-500 font-bold mb-0.5">Priority Score</div>
                    <div className="text-sm font-bold text-red-700">{calculatePriority(selectedTask).priorityScore}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase text-slate-500 font-bold mb-0.5">Urgency</div>
                    <div className="text-sm font-bold text-slate-900">{calculatePriority(selectedTask).urgencyTier}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase text-slate-500 font-bold mb-0.5">Due Date</div>
                    <div className="text-sm font-bold text-slate-900">{selectedTask.dueDate}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase text-slate-500 font-bold mb-0.5">Duration</div>
                    <div className="text-sm font-bold text-slate-900">{selectedTask.duration} mins</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase text-slate-500 font-bold mb-0.5">Crew</div>
                    <div className="text-sm font-bold text-slate-900">{selectedTask.crew}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase text-slate-500 font-bold mb-0.5">Equipment</div>
                    <div className="text-sm font-bold text-slate-900">{selectedTask.equipment}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase text-slate-500 font-bold mb-0.5">Status</div>
                    <div className="text-sm font-bold text-slate-900">{selectedTask.status}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase text-slate-500 font-bold mb-0.5">Harvestable</div>
                    <div className="text-sm font-bold text-slate-900">{selectedTask.harvestable ? "Yes" : "No"}</div>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <h4 className="text-xs font-bold text-slate-800 uppercase border-b border-slate-300 pb-1">AI Priority Explanation</h4>
                  <div className="bg-white p-3 border border-slate-200 rounded-sm">
                    <div className="text-xs font-bold text-slate-700 mb-2">Why is this task prioritized?</div>
                    <div className="space-y-1">
                      {calculatePriority(selectedTask).factors.map((factor, idx) => (
                        <div key={idx} className="flex justify-between text-xs items-center">
                          <span className="text-slate-600">{factor.label}</span>
                          <span className="font-bold text-slate-900">+{factor.value}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 pt-2 border-t border-slate-200 flex justify-between text-xs font-bold">
                      <span className="text-slate-800">Total Priority Score:</span>
                      <span className="text-red-700">{calculatePriority(selectedTask).priorityScore}</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <InfoPanel title="Synthetic Asset Telemetry" className="bg-blue-50 border-blue-200 mb-4">
                  <p className="font-medium text-blue-900 text-xs">Live prototype connection established. Showing telemetry for {selectedTask.department} asset.</p>
                </InfoPanel>

                <div className="grid grid-cols-2 gap-y-4 gap-x-2 border-b border-slate-200 pb-4 mb-4">
                  <div>
                    <div className="text-[10px] uppercase text-slate-500 font-bold mb-0.5">Asset ID</div>
                    <div className="text-sm font-bold text-slate-900">{asset?.id}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase text-slate-500 font-bold mb-0.5">Type</div>
                    <div className="text-sm font-bold text-slate-900">{asset?.type}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase text-slate-500 font-bold mb-0.5">Condition</div>
                    <div className="text-sm font-bold text-slate-900">{asset?.condition}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase text-slate-500 font-bold mb-0.5">Age</div>
                    <div className="text-sm font-bold text-slate-900">{asset?.age} yrs</div>
                  </div>

                  {selectedTask.department === "Engineering" && (
                    <>
                      <div>
                        <div className="text-[10px] uppercase text-slate-500 font-bold mb-0.5">Rail Type</div>
                        <div className="text-sm font-bold text-slate-900">{asset?.railType || "-"}</div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase text-slate-500 font-bold mb-0.5">GMT</div>
                        <div className="text-sm font-bold text-slate-900">{asset?.gmt || "-"}</div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase text-slate-500 font-bold mb-0.5">TGI</div>
                        <div className="text-sm font-bold text-slate-900">{asset?.tgi || "-"}</div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase text-slate-500 font-bold mb-0.5">USFD Status</div>
                        <div className="text-sm font-bold text-slate-900">{asset?.usfdStatus || "-"}</div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase text-slate-500 font-bold mb-0.5">Inspection Gap</div>
                        <div className="text-sm font-bold text-slate-900">{selectedTask.inspectionGap} days</div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase text-slate-500 font-bold mb-0.5">Defect Recurrence</div>
                        <div className="text-sm font-bold text-slate-900">{selectedTask.recurrence}</div>
                      </div>
                    </>
                  )}

                  {selectedTask.department === "TRD" && (
                    <>
                      <div>
                        <div className="text-[10px] uppercase text-slate-500 font-bold mb-0.5">OHE Wear</div>
                        <div className="text-sm font-bold text-slate-900">{asset?.oheWear || "-"} mm</div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase text-slate-500 font-bold mb-0.5">Catenary Status</div>
                        <div className="text-sm font-bold text-slate-900">{asset?.catenaryStatus || "-"}</div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase text-slate-500 font-bold mb-0.5">Isolator State</div>
                        <div className="text-sm font-bold text-slate-900">{asset?.isolatorState || "-"}</div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase text-slate-500 font-bold mb-0.5">Equipment Condition</div>
                        <div className="text-sm font-bold text-slate-900">{asset?.equipmentCondition || "-"}</div>
                      </div>
                    </>
                  )}

                  {selectedTask.department === "S&T" && (
                    <>
                      <div>
                        <div className="text-[10px] uppercase text-slate-500 font-bold mb-0.5">Point Machine Time</div>
                        <div className="text-sm font-bold text-slate-900">{asset?.pointStrokeTime || "-"}s</div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase text-slate-500 font-bold mb-0.5">Track Circuit Status</div>
                        <div className="text-sm font-bold text-slate-900">{asset?.trackCircuitStatus || "-"}</div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase text-slate-500 font-bold mb-0.5">Axle Counter Status</div>
                        <div className="text-sm font-bold text-slate-900">{asset?.axleCounterStatus || "-"}</div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase text-slate-500 font-bold mb-0.5">Signal Condition</div>
                        <div className="text-sm font-bold text-slate-900">{asset?.signalCondition || "-"}</div>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}

            <div className="flex flex-col gap-2 mt-6 pt-4 border-t border-slate-200">
              <div className="flex gap-2">
                <GovernmentButton 
                  className="flex-1"
                  variant="primary"
                  disabled={!canSelectDept(selectedTask.department)}
                  onClick={() => {
                    if (canSelectDept(selectedTask.department)) {
                      dispatch({ type: "SELECT_TASK_FOR_PLANNING", payload: selectedTask.id });
                      router.push('/block-planner');
                    }
                  }}
                >
                  PLAN THIS TASK
                </GovernmentButton>
                <GovernmentButton 
                  className="flex-1 border-indigo-700 text-indigo-700 hover:bg-indigo-50"
                  variant="outline"
                  disabled={!canSelectDept(selectedTask.department)}
                  onClick={() => {
                    if (canSelectDept(selectedTask.department)) {
                      dispatch({ type: "SELECT_TASK_FOR_PLANNING", payload: selectedTask.id });
                      alert("Task added to planning queue.");
                    }
                  }}
                >
                  ADD TO PLANNING
                </GovernmentButton>
              </div>
              <div className="flex gap-2">
                <GovernmentButton 
                  className="flex-1 text-slate-700 hover:bg-slate-100"
                  variant="outline"
                  onClick={() => alert("Simulation triggered: Deferring this task increases risk by 12 points and shifts due date.")}
                >
                  SIMULATE DEFERRAL
                </GovernmentButton>
                <GovernmentButton 
                  className="flex-1 text-slate-700 hover:bg-slate-100"
                  variant="outline"
                  onClick={() => setSelectedTask(null)}
                >
                  CLOSE
                </GovernmentButton>
              </div>
            </div>
          </div>
          );
        })()}
      </Drawer>
    </div>
  );
}



