"use client";

import { useTranslation } from "@/lib/i18n";
import { useState, useEffect } from "react";
import { useAppState, Block, BlockStatus, BlockRequest, BlockRequestStatus, useRBAC } from "@/lib/store";
import { 
  SectionHeader, GovernmentCard, 
  GovernmentButton, FilterBar, Drawer, InfoPanel, StatusBadge
} from "@/components/design-system";
import { InternalTabs } from "@/components/InternalTabs";
import { Volume2 } from "lucide-react";

const CORRIDORS = ["KOTA-ITARSI", "JAIPUR-KOTA", "AJMER-JAIPUR", "BHARATPUR-ITARSI"];
const DEPARTMENTS = ["Engineering", "S&T", "TRD", "Integrated"];
const HOURS = Array.from({length: 24}, (_, i) => i);

interface Conflict {
  id: string;
  type: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  corridor: string;
  affectedTasks: string[];
  affectedTrainBlock: string;
  reason: string;
  suggestedResolution: string;
  resolved?: boolean;
  ignored?: boolean;
}

export default function BlockPlannerPage() {
  const { t, playTTS } = useTranslation();
  const { state, dispatch } = useAppState();
  const { canCreateBlock, canApprove, hasPermission, currentRoleName } = useRBAC();
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);
  const [horizon, setHorizon] = useState<"DAILY" | "WEEKLY" | "MONTHLY" | "REQUESTS">("DAILY");
  const [selectedRequest, setSelectedRequest] = useState<BlockRequest | null>(null);
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState({ date: "2026-09-30", startTime: "02:00", endTime: "05:00", corridor: CORRIDORS[0] });
  const [createValidation, setCreateValidation] = useState<{valid: boolean, error?: string} | null>(null);
  
  useEffect(() => {
    if (selectedBlock) {
      const updated = state.blocks.find(b => b.id === selectedBlock.id);
      if (updated && JSON.stringify(updated) !== JSON.stringify(selectedBlock)) {
        setSelectedBlock(updated);
      }
    }
  }, [state.blocks, selectedBlock]);

  const [nowPos, setNowPos] = useState(0);

  const [conflicts, setConflicts] = useState<Conflict[]>([
    {
      id: "CFL-882",
      type: "departmental possession overlap",
      severity: "CRITICAL",
      corridor: "KOTA-ITARSI",
      affectedTasks: ["T-491", "T-802"],
      affectedTrainBlock: "RB-2026-441",
      reason: "TRD OHE isolation overlaps Engineering possession.",
      suggestedResolution: "Move TRD task to 03:20-03:50."
    },
    {
      id: "CFL-883",
      type: "train timetable clashes",
      severity: "HIGH",
      corridor: "JAIPUR-KOTA",
      affectedTasks: ["T-112"],
      affectedTrainBlock: "Block 04:00-06:00",
      reason: "12955 Mumbai Rajdhani scheduled at 05:15.",
      suggestedResolution: "Truncate block duration to 60 mins ending at 05:00."
    },
    {
      id: "CFL-884",
      type: "crew conflicts",
      severity: "MEDIUM",
      corridor: "AJMER-JAIPUR",
      affectedTasks: ["T-333", "T-334"],
      affectedTrainBlock: "RB-2026-901",
      reason: "Engineering Crew Alpha double-booked.",
      suggestedResolution: "Assign Crew Beta to T-334."
    }
  ]);

  useEffect(() => {
    // Current time in hours (0-24)
    const updateNow = () => {
      const d = new Date();
      // Use fixed demo time or actual time? Let's use 10:30 for prototype stable display
      setNowPos(((10 + 30/60) / 24) * 100);
    };
    updateNow();
  }, []);

  const getLeft = (startTime: string) => {
    if (!startTime) return 0;
    const [h, m] = startTime.split(':').map(Number);
    return ((h + m / 60) / 24) * 100;
  };

  const getWidth = (durationMinutes: number) => {
    return ((durationMinutes / 60) / 24) * 100;
  };

  const getStatusColor = (status: BlockStatus) => {
    switch(status) {
      case "PROPOSED": return "bg-blue-100 border-blue-400 text-blue-900";
      case "OPTIMIZED": return "bg-purple-100 border-purple-400 text-purple-900";
      case "PENDING_APPROVAL": return "bg-amber-100 border-amber-400 text-amber-900";
      case "APPROVED": return "bg-emerald-100 border-emerald-500 text-emerald-900";
      case "ACTIVE": return "bg-red-100 border-red-500 text-red-900 shadow-[0_0_8px_rgba(239,68,68,0.5)]";
      case "COMPLETED": return "bg-slate-200 border-slate-400 text-slate-700";
      case "REPLANNED": return "bg-orange-100 border-orange-400 text-orange-900";
      case "REJECTED": return "bg-gray-100 border-gray-400 text-gray-500 line-through";
      default: return "bg-slate-100 border-slate-300";
    }
  };

  const handleUpdateStatus = (newStatus: BlockStatus) => {
    if (selectedBlock) {
      const updatedBlocks = state.blocks.map(b => b.id === selectedBlock.id ? { ...b, status: newStatus } : b);
      dispatch({ type: "LOAD_STATE", payload: { ...state, blocks: updatedBlocks } });
      setSelectedBlock({ ...selectedBlock, status: newStatus });
      dispatch({ type: "ADD_AUDIT_EVENT", payload: {
        event: "BLOCK_STATUS_UPDATED",
        entity: selectedBlock.id,
        previousState: selectedBlock.status,
        newState: newStatus,
        reason: "Manual transition from block drawer.",
        user: "Control Officer"
      }});
    }
  };

  const handleHarvest = () => {
    if (!selectedBlock) return;
    const candidates = state.tasks.filter(t => t.status === "PENDING" && t.harvestable).slice(0, 2);
    if (candidates.length === 0) {
      alert("No harvestable tasks available.");
      return;
    }
    const candidateIds = candidates.map(t => t.id);
    dispatch({ type: "HARVEST_TASKS", payload: { blockId: selectedBlock.id, taskIds: candidateIds }});
    
    dispatch({ type: "ADD_AUDIT_EVENT", payload: {
      event: "TASKS_HARVESTED",
      entity: selectedBlock.id,
      previousState: selectedBlock.status,
      newState: selectedBlock.status,
      reason: `Harvested ${candidateIds.length} tasks into existing block.`,
      user: "Control Officer"
    }});
  };

  const handleRemoveTask = (taskId: string) => {
    if (!selectedBlock) return;
    dispatch({ type: "REMOVE_TASK_FROM_BLOCK", payload: { blockId: selectedBlock.id, taskId }});
    dispatch({ type: "ADD_AUDIT_EVENT", payload: {
      event: "TASK_REMOVED",
      entity: selectedBlock.id,
      previousState: selectedBlock.status,
      newState: selectedBlock.status,
      reason: `Task ${taskId} removed from block.`,
      user: "Control Officer"
    }});
  };

  const handleResolveConflict = (conflict: Conflict) => {
    setConflicts(conflicts.map(c => c.id === conflict.id ? { ...c, resolved: true } : c));
    dispatch({ type: "ADD_AUDIT_EVENT", payload: {
      event: "CONFLICT_RESOLVED",
      entity: conflict.id,
      previousState: "OPEN",
      newState: "RESOLVED",
      reason: "User applied suggested resolution.",
      user: "Control Officer"
    }});
    dispatch({ type: "ADD_NOTIFICATION", payload: {
      severity: "Low",
      title: "PLAN REPLANNED",
      message: `Conflict ${conflict.id} resolved. Plan updated.`,
      relatedEntity: conflict.id
    }});
  };

  const parseTime = (time: string) => { const [h,m] = time.split(':').map(Number); return h*60+m; };

  const validateBlock = () => {
    const duration = parseTime(createForm.endTime) - parseTime(createForm.startTime);
    if (duration <= 0) {
      setCreateValidation({ valid: false, error: "End time must be after start time."});
      return;
    }
    if (duration > 240) {
      setCreateValidation({ valid: false, error: "Duration exceeds allowed maximum (240 mins)."});
      return;
    }
    if (createForm.startTime <= "03:05" && createForm.endTime >= "02:40") {
      setCreateValidation({ valid: false, error: "Cannot create block: Train 12951 conflicts with 02:40–03:05."});
      return;
    }
    setCreateValidation({ valid: true });
  };

  const handleCreateBlock = () => {
    if (!createValidation?.valid) return;
    if (state.selectedTasksForPlanning.length === 0) return;
    
    const selTasks = state.tasks.filter(t => state.selectedTasksForPlanning.includes(t.id));
    const duration = parseTime(createForm.endTime) - parseTime(createForm.startTime);
    const departments = Array.from(new Set(selTasks.map(t => t.department)));
    
    const newBlock: Block = {
      id: `OPT-${Date.now().toString().slice(-5)}`,
      corridor: createForm.corridor,
      date: createForm.date,
      startTime: createForm.startTime,
      endTime: createForm.endTime,
      durationMinutes: duration,
      departments,
      tasks: state.selectedTasksForPlanning,
      harvestedTasks: [],
      trainImpact: "Low",
      riskCoverage: "High",
      utilization: 85,
      status: "PROPOSED",
      reason: "Manually created block."
    };
    
    dispatch({ type: "CREATE_BLOCK", payload: newBlock });
    
    dispatch({ type: "ADD_AUDIT_EVENT", payload: {
      event: "BLOCK_CREATED",
      entity: newBlock.id,
      previousState: "-",
      newState: "PROPOSED",
      reason: `Created block with ${selTasks.length} tasks.`,
      user: currentRoleName
    }});
    
    setShowCreateForm(false);
    setCreateValidation(null);
  };

  const handleIgnoreConflict = (conflict: Conflict) => {
    const reason = window.prompt("Mandatory: Enter reason for ignoring this conflict:");
    if (!reason || reason.trim() === "") {
      alert("Reason is mandatory to ignore a conflict.");
      return;
    }
    setConflicts(conflicts.map(c => c.id === conflict.id ? { ...c, ignored: true } : c));
    dispatch({ type: "ADD_AUDIT_EVENT", payload: {
      event: "CONFLICT_IGNORED",
      entity: conflict.id,
      previousState: "OPEN",
      newState: "IGNORED",
      reason: `Ignored: ${reason}`,
      user: "Control Officer"
    }});
  };

  const handleRequestAction = (req: BlockRequest, action: "SUBMIT" | "APPROVE" | "REJECT" | "OVERRIDE" | "MODIFY") => {
    let newStatus = req.status;
    let reason = "";

    if (action === "SUBMIT") newStatus = "SUBMITTED";
    if (action === "APPROVE") {
      newStatus = "APPROVED";
      const newBlock: Block = {
        id: `RB-${req.id.replace('REQ-', '')}`,
        corridor: req.corridor,
        date: "2026-09-30",
        startTime: "02:00",
        endTime: "05:00",
        durationMinutes: req.requestedDuration,
        departments: [req.department],
        tasks: req.taskIds,
        harvestedTasks: [],
        trainImpact: "Low",
        riskCoverage: "High",
        utilization: 85,
        status: "APPROVED"
      };
      const updatedBlocks = [...state.blocks, newBlock];
      dispatch({ type: "LOAD_STATE", payload: { ...state, blocks: updatedBlocks } });
      dispatch({ type: "ADD_NOTIFICATION", payload: {
        severity: "Medium",
        title: "BLOCK APPROVED",
        message: `Block request ${req.id} has been formally approved.`,
        relatedEntity: newBlock.id
      }});
    }
    if (action === "REJECT") {
      const res = window.prompt("Mandatory: Enter rejection reason:");
      if (!res) { alert("Reason required"); return; }
      reason = res;
      newStatus = "REJECTED";
      dispatch({ type: "ADD_NOTIFICATION", payload: {
        severity: "High",
        title: "BLOCK REJECTED",
        message: `Block request ${req.id} was rejected. Reason: ${reason}`,
        relatedEntity: req.id
      }});
    }
    if (action === "OVERRIDE") {
      const res = window.prompt("Enter new time/section and reason for override:");
      if (!res) { alert("Details required"); return; }
      reason = res;
      newStatus = "OVERRIDDEN";
    }
    if (action === "MODIFY") {
      newStatus = "DRAFT";
    }

    const updatedRequest = {
      ...req,
      status: newStatus,
      history: [
        ...req.history,
        { action, status: newStatus, by: "Control Officer", timestamp: new Date().toISOString(), reason }
      ]
    };

    dispatch({ type: "UPDATE_BLOCK_REQUEST", payload: updatedRequest });
    dispatch({ type: "ADD_AUDIT_EVENT", payload: {
      event: `BLOCK_REQUEST_${action}`,
      entity: req.id,
      previousState: req.status,
      newState: newStatus,
      reason: reason || `User triggered ${action}`,
      user: "Control Officer"
    }});
    setSelectedRequest(updatedRequest);
  };

  return (
    <div className="space-y-4 pb-12">
      <InternalTabs tabs={[
        { name: "Daily", href: "#", onClick: () => setHorizon("DAILY"), active: horizon === "DAILY" },
        { name: "Weekly", href: "#", onClick: () => setHorizon("WEEKLY"), active: horizon === "WEEKLY" },
        { name: "Monthly", href: "#", onClick: () => setHorizon("MONTHLY"), active: horizon === "MONTHLY" },
        { name: "Requests", href: "#", onClick: () => setHorizon("REQUESTS"), active: horizon === "REQUESTS" }
      ]} />
      
      <SectionHeader 
        title={horizon === "REQUESTS" ? "Block Requests Inbox" : "Possession Planning Workstation"}
        description={horizon === "REQUESTS" ? "Review and approve departmental block requests" : `Horizon: ${horizon === "DAILY" ? "24 HOURS" : horizon === "WEEKLY" ? "7 DAYS" : "30 DAYS"}`}
      />

      {state.selectedTasksForPlanning.length > 0 && (
        <GovernmentCard className="p-4 border-l-4 border-l-indigo-600 bg-indigo-50">
          {!showCreateForm ? (
            <div className="flex justify-between items-center">
              <div>
                <div className="font-bold text-indigo-900 mb-1">Tasks Selected for Block Creation</div>
                <div className="text-xs text-indigo-700">
                  {state.selectedTasksForPlanning.length} tasks selected.
                </div>
              </div>
              {canCreateBlock() ? (
                <GovernmentButton variant="primary" onClick={() => setShowCreateForm(true)}>
                  CREATE BLOCK
                </GovernmentButton>
              ) : (
                <div className="text-xs font-bold text-red-600">Access restricted for your current railway role.</div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="font-bold text-indigo-900 mb-2 border-b border-indigo-200 pb-2">Configure Block Parameters</div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-600 mb-1">Date</label>
                  <input type="date" className="w-full border border-slate-300 text-sm p-1.5" value={createForm.date} onChange={e => setCreateForm({...createForm, date: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-600 mb-1">Start Time</label>
                  <input type="time" className="w-full border border-slate-300 text-sm p-1.5" value={createForm.startTime} onChange={e => setCreateForm({...createForm, startTime: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-600 mb-1">End Time</label>
                  <input type="time" className="w-full border border-slate-300 text-sm p-1.5" value={createForm.endTime} onChange={e => setCreateForm({...createForm, endTime: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-600 mb-1">Corridor</label>
                  <select className="w-full border border-slate-300 text-sm p-1.5" value={createForm.corridor} onChange={e => setCreateForm({...createForm, corridor: e.target.value})}>
                    {CORRIDORS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              
              <div className="flex justify-between items-center pt-2">
                <GovernmentButton variant="outline" onClick={validateBlock}>VALIDATE BLOCK</GovernmentButton>
                {createValidation && (
                  <div className={`text-xs font-bold ${createValidation.valid ? 'text-emerald-700' : 'text-red-700'}`}>
                    {createValidation.valid ? "✓ FEASIBLE BLOCK WINDOW" : createValidation.error}
                  </div>
                )}
                <div className="flex gap-2">
                  <GovernmentButton variant="outline" onClick={() => { setShowCreateForm(false); setCreateValidation(null); }}>CANCEL</GovernmentButton>
                  <GovernmentButton variant="primary" disabled={!createValidation?.valid} onClick={handleCreateBlock}>SUBMIT BLOCK</GovernmentButton>
                </div>
              </div>
            </div>
          )}
        </GovernmentCard>
      )}

      {horizon === "REQUESTS" ? (
        <GovernmentCard className="p-0 overflow-hidden border border-slate-300">
          <div className="p-3 bg-slate-50 border-b border-slate-300 flex justify-between items-center">
            <div className="font-bold text-slate-800 text-sm">PENDING APPROVALS</div>
          </div>
          <div className="p-4 space-y-4">
            {(state.blockRequests || []).map(req => (
              <div key={req.id} onClick={() => setSelectedRequest(req)} className="border border-slate-200 p-3 rounded-sm cursor-pointer hover:bg-slate-50 transition-colors flex justify-between items-center">
                <div>
                  <div className="font-bold text-slate-800 text-sm flex items-center gap-2">
                    {req.id} 
                    <StatusBadge status={req.status === 'APPROVED' ? 'success' : req.status === 'REJECTED' ? 'danger' : 'warning'}>{req.status}</StatusBadge>
                  </div>
                  <div className="text-xs text-slate-600 mt-1">{req.department} | {req.corridor} | {req.section}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-500 uppercase">Priority</div>
                  <div className="text-sm font-bold text-red-700">{req.priority}</div>
                </div>
              </div>
            ))}
            {state.blockRequests.length === 0 && (
              <div className="text-center text-slate-500 text-sm py-8 font-semibold">No block requests found.</div>
            )}
          </div>
        </GovernmentCard>
      ) : (
        <>
          {/* RESOURCE UTILIZATION PANEL */}
          <div className="grid grid-cols-4 gap-4 mb-4">
            <GovernmentCard className="p-3 text-center border-slate-300">
          <div className="text-[10px] font-bold uppercase text-slate-500">Engineering Crew</div>
          <div className="text-xl font-bold text-slate-800">78%</div>
        </GovernmentCard>
        <GovernmentCard className="p-3 text-center border-slate-300">
          <div className="text-[10px] font-bold uppercase text-slate-500">S&T Crew</div>
          <div className="text-xl font-bold text-slate-800">64%</div>
        </GovernmentCard>
        <GovernmentCard className="p-3 text-center border-slate-300">
          <div className="text-[10px] font-bold uppercase text-slate-500">TRD Crew</div>
          <div className="text-xl font-bold text-slate-800">82%</div>
        </GovernmentCard>
        <GovernmentCard className="p-3 text-center border-slate-300">
          <div className="text-[10px] font-bold uppercase text-slate-500">Machines</div>
          <div className="text-xl font-bold text-slate-800">71%</div>
        </GovernmentCard>
      </div>

      <GovernmentCard className="p-0 overflow-hidden border border-slate-300">
        <div className="p-3 bg-slate-50 border-b border-slate-300 flex justify-between items-center">
          <div className="font-bold text-slate-800 text-sm">CORRIDOR POSSESSION MATRIX</div>
          <div className="flex gap-4 text-xs font-semibold text-slate-600">
            <div className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-100 border border-blue-400"></div> Proposed</div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 bg-emerald-100 border border-emerald-500"></div> Approved</div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 bg-red-100 border border-red-500"></div> Active</div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 bg-slate-200 border border-slate-400"></div> Completed</div>
          </div>
        </div>

        <div className="relative overflow-x-auto">
          <div className="min-w-[1000px]">
            {/* Timeline Header */}
            <div className="flex ml-32 border-b border-slate-300 relative h-8 bg-slate-100">
              {HOURS.map(h => (
                <div key={h} className="flex-1 border-l border-slate-200 text-[10px] font-bold text-slate-500 pl-1 pt-1">
                  {h.toString().padStart(2, '0')}:00
                </div>
              ))}
              {/* NOW Marker */}
              <div 
                className="absolute top-0 bottom-0 border-l-2 border-red-500 z-20"
                style={{ left: `${nowPos}%` }}
              >
                <div className="absolute -top-1 -translate-x-1/2 bg-red-500 text-white text-[9px] font-bold px-1 rounded-sm">NOW</div>
              </div>
            </div>

            {/* Matrix Body */}
            <div className="bg-white relative">
              {/* NOW Marker line extension */}
              <div 
                className="absolute top-0 bottom-0 border-l-2 border-red-500/50 z-20 pointer-events-none ml-32"
                style={{ left: `calc(${nowPos}% - 0px)` }}
              />

              {CORRIDORS.map((corridor, cIdx) => (
                <div key={corridor} className="border-b border-slate-300 last:border-b-0">
                  <div className="bg-slate-200 text-slate-800 text-xs font-bold py-1 px-2 border-b border-slate-300 uppercase">
                    {corridor}
                  </div>
                  {DEPARTMENTS.map(dept => {
                    // Filter blocks for this corridor and department
                    const rowBlocks = state.blocks.filter(b => {
                      const matchesCorridor = b.corridor.toUpperCase() === corridor || (corridor === "KOTA-ITARSI" && b.corridor === "KOTA-ITARSI");
                      if (!matchesCorridor) return false;
                      
                      if (dept === "Integrated") {
                        return b.departments.length > 1;
                      } else {
                        return b.departments.length === 1 && b.departments[0] === dept;
                      }
                    });

                    return (
                      <div key={dept} className="flex h-10 border-b border-slate-100 last:border-b-0 relative hover:bg-slate-50 transition-colors">
                        <div className="w-32 flex-shrink-0 border-r border-slate-300 flex items-center px-2 text-[10px] font-bold text-slate-600 bg-slate-50">
                          {dept}
                        </div>
                        <div className="flex-1 relative">
                          {/* Grid lines */}
                          {HOURS.map(h => (
                            <div key={h} className="absolute top-0 bottom-0 w-[4.166%] border-l border-slate-100/50" style={{ left: `${h * 4.166}%` }} />
                          ))}

                          {/* Candidate Highlight Dummy for demo */}
                          {cIdx === 0 && dept === "Integrated" && (
                            <div 
                              className="absolute top-1 bottom-1 border-2 border-dashed border-emerald-400 bg-emerald-50/30 rounded-sm pointer-events-none"
                              style={{ left: `${getLeft("02:00")}%`, width: `${getWidth(180)}%` }}
                            >
                              <div className="text-[8px] font-bold text-emerald-700 absolute -top-3 left-1">Optimal Candidate Window</div>
                            </div>
                          )}

                          {/* Render Blocks */}
                          {rowBlocks.map(block => (
                            <div
                              key={block.id}
                              onClick={() => setSelectedBlock(block)}
                              className={`absolute top-1.5 bottom-1.5 border rounded-sm text-[10px] font-bold px-1.5 py-0.5 overflow-hidden cursor-pointer hover:brightness-95 transition-all shadow-sm ${getStatusColor(block.status)}`}
                              style={{ left: `${getLeft(block.startTime)}%`, width: `${getWidth(block.durationMinutes)}%` }}
                            >
                              <div className="truncate">{block.id}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </GovernmentCard>

      {/* CONFLICT RESOLUTION CENTER */}
      {conflicts.filter(c => !c.resolved && !c.ignored).length > 0 && (
        <GovernmentCard className="p-0 border border-red-300 overflow-hidden">
          <div className="p-3 bg-red-50 border-b border-red-200 flex justify-between items-center">
            <div className="font-bold text-red-900 text-sm flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-red-600 animate-pulse"></span>
              CONFLICT CENTER
            </div>
            <div className="text-xs font-bold text-red-800">
              {conflicts.filter(c => !c.resolved && !c.ignored).length} Active Conflicts
            </div>
          </div>
          <div className="p-4 space-y-4">
            {conflicts.filter(c => !c.resolved && !c.ignored).map(conflict => (
              <div key={conflict.id} className="border border-slate-200 rounded-sm bg-white p-3 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-start">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-500">{conflict.id}</span>
                    <StatusBadge status={conflict.severity === 'CRITICAL' ? 'danger' : conflict.severity === 'HIGH' ? 'warning' : 'neutral'}>
                      {conflict.severity}
                    </StatusBadge>
                    <span className="text-sm font-bold text-slate-800 uppercase ml-2">{conflict.type}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                    <div><span className="font-semibold text-slate-600">Corridor:</span> <span className="font-bold text-slate-800">{conflict.corridor}</span></div>
                    <div><span className="font-semibold text-slate-600">Tasks:</span> <span className="font-bold text-slate-800">{conflict.affectedTasks.join(', ')}</span></div>
                    <div className="col-span-2"><span className="font-semibold text-slate-600">Impacts:</span> <span className="font-bold text-slate-800">{conflict.affectedTrainBlock}</span></div>
                  </div>

                  <div className="bg-red-50 text-red-900 text-xs p-2 rounded-sm border border-red-100">
                    <span className="font-bold">Reason:</span> {conflict.reason}
                  </div>
                  <div className="bg-emerald-50 text-emerald-900 text-xs p-2 rounded-sm border border-emerald-100">
                    <span className="font-bold">Suggested:</span> {conflict.suggestedResolution}
                  </div>
                </div>
                <div className="flex flex-col gap-2 w-full md:w-auto shrink-0">
                  <GovernmentButton variant="primary" size="sm" onClick={() => handleResolveConflict(conflict)}>
                    APPLY RESOLUTION
                  </GovernmentButton>
                  <GovernmentButton variant="outline" size="sm" onClick={() => handleIgnoreConflict(conflict)}>
                    IGNORE WITH REASON
                  </GovernmentButton>
                </div>
              </div>
            ))}
          </div>
        </GovernmentCard>
      )}
      </>
      )}

      <Drawer 
        isOpen={!!selectedBlock} 
        onClose={() => setSelectedBlock(null)} 
        title={`Block Details: ${selectedBlock?.id}`}
      >
        {selectedBlock && (
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="text-xs font-bold text-slate-500 uppercase">Current Status</div>
                <GovernmentButton 
                  size="sm" 
                  variant="outline" 
                  className="px-2 py-0.5 text-[10px] h-6 flex items-center bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100"
                  onClick={() => playTTS(t("msg.block_explanation"))}
                >
                  <Volume2 className="h-3 w-3 mr-1" /> {t("btn.listen")}
                </GovernmentButton>
              </div>
              <StatusBadge status={['APPROVED', 'COMPLETED', 'ACTIVE'].includes(selectedBlock.status) ? 'success' : selectedBlock.status === 'REJECTED' ? 'danger' : 'warning'}>
                {selectedBlock.status}
              </StatusBadge>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-[10px] uppercase text-slate-500 font-bold mb-0.5">Corridor</div>
                <div className="text-sm font-bold text-slate-900">{selectedBlock.corridor}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase text-slate-500 font-bold mb-0.5">Date</div>
                <div className="text-sm font-bold text-slate-900">{selectedBlock.date}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase text-slate-500 font-bold mb-0.5">Start Time</div>
                <div className="text-sm font-bold text-slate-900">{selectedBlock.startTime}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase text-slate-500 font-bold mb-0.5">End Time</div>
                <div className="text-sm font-bold text-slate-900">{selectedBlock.endTime}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase text-slate-500 font-bold mb-0.5">Duration</div>
                <div className="text-sm font-bold text-slate-900">{selectedBlock.durationMinutes} mins</div>
              </div>
              <div>
                <div className="text-[10px] uppercase text-slate-500 font-bold mb-0.5">Utilization</div>
                <div className="text-sm font-bold text-slate-900">{selectedBlock.utilization}%</div>
              </div>
              <div>
                <div className="text-[10px] uppercase text-slate-500 font-bold mb-0.5">Departments</div>
                <div className="text-sm font-bold text-slate-900">{selectedBlock.departments.join(', ')}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase text-slate-500 font-bold mb-0.5">Risk Coverage</div>
                <div className="text-sm font-bold text-emerald-700">{selectedBlock.riskCoverage}</div>
              </div>
            </div>

            <InfoPanel title="Tasks & Impact" className="bg-slate-50 border-slate-200">
              <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                <div><span className="font-semibold text-slate-600">Base Tasks:</span> {selectedBlock.tasks.length}</div>
                <div><span className="font-semibold text-slate-600">Harvested:</span> {selectedBlock.harvestedTasks.length}</div>
                <div className="col-span-2"><span className="font-semibold text-slate-600">Train Impact:</span> <span className="text-red-700 font-bold">{selectedBlock.trainImpact}</span></div>
              </div>
              <div className="space-y-1">
                {[...selectedBlock.tasks, ...selectedBlock.harvestedTasks].map(taskId => (
                  <div key={taskId} className="flex justify-between items-center text-xs p-1.5 bg-white border border-slate-200 rounded-sm">
                    <span className="font-mono font-bold text-slate-700">{taskId} {selectedBlock.harvestedTasks.includes(taskId) && <span className="text-[9px] text-emerald-600 ml-1">(Harvested)</span>}</span>
                    <button onClick={() => handleRemoveTask(taskId)} className="text-slate-400 hover:text-red-600 font-bold px-1" title="Remove Task">×</button>
                  </div>
                ))}
              </div>
            </InfoPanel>

            {selectedBlock.status === "PROPOSED" ? (
              <InfoPanel title="Resource Feasibility" className="bg-red-50 border-red-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="flex h-2 w-2 rounded-full bg-red-600 animate-pulse"></span>
                  <span className="font-bold text-red-900 text-xs">RESOURCE CONFLICT</span>
                </div>
                <div className="space-y-2 text-sm text-red-900">
                  <div><span className="font-semibold">Task:</span> Track Tamper</div>
                  <div><span className="font-semibold">Required:</span> 2 crews, 1 BCM machine</div>
                  <div className="grid grid-cols-2 gap-2 mt-1 bg-white p-2 rounded border border-red-100">
                    <div className="flex justify-between"><span>Crew:</span> <span className="font-bold text-emerald-600">✓</span></div>
                    <div className="flex justify-between"><span>Machine:</span> <span className="font-bold text-red-600">✗</span></div>
                  </div>
                  <div className="bg-red-100 p-2 rounded-sm text-xs mt-2 border border-red-200">
                    <span className="font-bold">Reason:</span> BCM-07 assigned to Jaipur-Kota.
                  </div>
                  <div className="flex flex-col gap-2 mt-3">
                    <GovernmentButton size="sm" variant="outline" className="border-red-400 text-red-800 hover:bg-red-100">
                      VIEW RESOURCE CONFLICT
                    </GovernmentButton>
                    <GovernmentButton size="sm" variant="primary">
                      FIND NEXT FEASIBLE WINDOW
                    </GovernmentButton>
                  </div>
                </div>
              </InfoPanel>
            ) : (
              <InfoPanel title="Resource Feasibility" className="bg-emerald-50 border-emerald-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
                  <span className="font-bold text-emerald-900 text-xs">ALL RESOURCES ALLOCATED</span>
                </div>
                <div className="text-sm text-emerald-900">
                  <div className="grid grid-cols-2 gap-2 mt-1 bg-white p-2 rounded border border-emerald-100">
                    <div className="flex justify-between"><span>Crew:</span> <span className="font-bold text-emerald-600">✓ (Allocated)</span></div>
                    <div className="flex justify-between"><span>Machine:</span> <span className="font-bold text-emerald-600">✓ (Allocated)</span></div>
                    <div className="flex justify-between"><span>Equipment:</span> <span className="font-bold text-emerald-600">✓ (Allocated)</span></div>
                    <div className="flex justify-between"><span>Shift:</span> <span className="font-bold text-emerald-600">✓ (Compatible)</span></div>
                  </div>
                  <div className="text-xs mt-2">
                    <span className="font-bold">Depot:</span> Main Depot
                  </div>
                </div>
              </InfoPanel>
            )}

            <div className="pt-4 border-t border-slate-200">
              <div className="text-[10px] font-bold text-slate-500 mb-2 uppercase">Actions & State Transitions</div>
              <div className="grid grid-cols-2 gap-2 mb-2">
                {hasPermission("REPLAN") ? (
                  <GovernmentButton size="sm" variant="outline" className="border-indigo-500 text-indigo-700 hover:bg-indigo-50" onClick={handleHarvest}>HARVEST TASKS</GovernmentButton>
                ) : null}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {canApprove() ? (
                  <>
                    <GovernmentButton size="sm" variant="outline" onClick={() => handleUpdateStatus("PROPOSED")}>Set PROPOSED</GovernmentButton>
                    <GovernmentButton size="sm" variant="primary" onClick={() => handleUpdateStatus("APPROVED")}>Set APPROVED</GovernmentButton>
                    <GovernmentButton size="sm" variant="outline" className="border-red-500 text-red-700 hover:bg-red-50" onClick={() => handleUpdateStatus("ACTIVE")}>Set ACTIVE</GovernmentButton>
                    <GovernmentButton size="sm" variant="outline" className="border-emerald-500 text-emerald-700 hover:bg-emerald-50" onClick={() => handleUpdateStatus("COMPLETED")}>Set COMPLETED</GovernmentButton>
                    <GovernmentButton size="sm" variant="outline" onClick={() => handleUpdateStatus("REPLANNED")}>Set REPLANNED</GovernmentButton>
                    <GovernmentButton size="sm" variant="outline" className="border-slate-500 text-slate-700 hover:bg-slate-50" onClick={() => handleUpdateStatus("REJECTED")}>Set REJECTED</GovernmentButton>
                  </>
                ) : (
                  <div className="col-span-2 text-xs font-bold text-red-600 p-2 text-center bg-red-50 border border-red-200">
                    Access restricted for your current railway role.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Drawer>

      <Drawer 
        isOpen={!!selectedRequest} 
        onClose={() => setSelectedRequest(null)} 
        title={`Request Details: ${selectedRequest?.id}`}
      >
        {selectedRequest && (
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <div className="text-xs font-bold text-slate-500 uppercase">Current Status</div>
              <StatusBadge status={['APPROVED'].includes(selectedRequest.status) ? 'success' : selectedRequest.status === 'REJECTED' || selectedRequest.status === 'CANCELLED' ? 'danger' : 'warning'}>
                {selectedRequest.status}
              </StatusBadge>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div><div className="text-[10px] uppercase text-slate-500 font-bold mb-0.5">Department</div><div className="text-sm font-bold text-slate-900">{selectedRequest.department}</div></div>
              <div><div className="text-[10px] uppercase text-slate-500 font-bold mb-0.5">Priority</div><div className="text-sm font-bold text-slate-900">{selectedRequest.priority}</div></div>
              <div><div className="text-[10px] uppercase text-slate-500 font-bold mb-0.5">Corridor</div><div className="text-sm font-bold text-slate-900">{selectedRequest.corridor}</div></div>
              <div><div className="text-[10px] uppercase text-slate-500 font-bold mb-0.5">Section</div><div className="text-sm font-bold text-slate-900">{selectedRequest.section}</div></div>
              <div><div className="text-[10px] uppercase text-slate-500 font-bold mb-0.5">Requested Duration</div><div className="text-sm font-bold text-slate-900">{selectedRequest.requestedDuration} mins</div></div>
              <div><div className="text-[10px] uppercase text-slate-500 font-bold mb-0.5">Preferred Window</div><div className="text-sm font-bold text-slate-900">{selectedRequest.preferredWindow}</div></div>
              <div><div className="text-[10px] uppercase text-slate-500 font-bold mb-0.5">Submitted By</div><div className="text-sm font-bold text-slate-900">{selectedRequest.submittedBy}</div></div>
              <div><div className="text-[10px] uppercase text-slate-500 font-bold mb-0.5">Submitted At</div><div className="text-sm font-bold text-slate-900">{new Date(selectedRequest.submittedAt).toLocaleDateString()}</div></div>
              <div className="col-span-2"><div className="text-[10px] uppercase text-slate-500 font-bold mb-0.5">Tasks</div><div className="text-sm font-bold text-slate-900">{selectedRequest.taskIds.join(', ')}</div></div>
              <div className="col-span-2"><div className="text-[10px] uppercase text-slate-500 font-bold mb-0.5">Reason</div><div className="text-sm font-bold text-slate-900">{selectedRequest.reason}</div></div>
            </div>

            {selectedRequest.history.length > 0 && (
              <InfoPanel title="Approval History" className="bg-slate-50 border-slate-200">
                <div className="space-y-3">
                  {selectedRequest.history.map((h, idx) => (
                    <div key={idx} className="relative pl-4 border-l-2 border-slate-300 pb-2 last:pb-0">
                      <div className="absolute w-2 h-2 rounded-full bg-slate-400 -left-[5px] top-1"></div>
                      <div className="flex justify-between items-start mb-1">
                        <div className="text-xs font-bold text-slate-800 uppercase">{h.action}</div>
                        <div className="text-[10px] text-slate-500">{new Date(h.timestamp).toLocaleTimeString()}</div>
                      </div>
                      <div className="text-xs text-slate-600 font-semibold">{h.by}</div>
                      {h.reason && <div className="text-xs text-slate-500 mt-1 italic">"{h.reason}"</div>}
                    </div>
                  ))}
                </div>
              </InfoPanel>
            )}

            <div className="pt-4 border-t border-slate-200">
              <div className="text-[10px] font-bold text-slate-500 mb-2 uppercase">Actions</div>
              <div className="grid grid-cols-2 gap-2">
                <GovernmentButton size="sm" variant="outline" onClick={() => handleRequestAction(selectedRequest, "SUBMIT")}>SUBMIT</GovernmentButton>
                <GovernmentButton size="sm" variant="outline" onClick={() => handleRequestAction(selectedRequest, "MODIFY")}>MODIFY</GovernmentButton>
                {canApprove() ? (
                  <>
                    <GovernmentButton size="sm" variant="primary" onClick={() => handleRequestAction(selectedRequest, "APPROVE")}>APPROVE</GovernmentButton>
                    <GovernmentButton size="sm" variant="outline" onClick={() => handleRequestAction(selectedRequest, "OVERRIDE")}>OVERRIDE</GovernmentButton>
                    <GovernmentButton size="sm" variant="outline" className="col-span-2 border-red-500 text-red-700 hover:bg-red-50" onClick={() => handleRequestAction(selectedRequest, "REJECT")}>REJECT</GovernmentButton>
                  </>
                ) : (
                  <div className="col-span-2 text-xs font-bold text-red-600 p-2 text-center bg-red-50 border border-red-200">
                    Approval access restricted for your current railway role.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
