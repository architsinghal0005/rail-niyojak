"use client";
import { useTranslation } from "@/lib/i18n";

import { useState } from "react";
import { useAppState, calculateAllocatedMinutes, calculateRemainingCapacity, calculateUtilization } from "@/lib/store";
import { 
  SectionHeader, GovernmentCard, 
  GovernmentButton, MetricCard, InfoPanel, StatusBadge 
} from "@/components/design-system";
import { ExplainabilityPanel } from "@/components/ExplainabilityPanel";
import { CheckCircle, Clock, Zap, ArrowRight, ArrowDown, Activity, Settings, Check } from "lucide-react";
import { useRouter } from "next/navigation";

export default function HarvestingPage() {
  const { t } = useTranslation();
  const { state, dispatch } = useAppState();
  const router = useRouter();
  
  const [isHarvesting, setIsHarvesting] = useState(false);
  const block = state.currentOptimizationResult;

  if (!block) {
    return (
      <div className="space-y-4">
        <SectionHeader 
          title={<span className="flex items-center text-red-800"><Zap className="h-5 w-5 mr-2" /> Block Harvesting Engine</span>}
          description="Increase maintenance yield without extending possession."
        />
        <GovernmentCard className="p-12 text-center text-slate-500">
          <p className="mb-4">No active block plan. Go to Block Planner to create a block first.</p>
          <GovernmentButton onClick={() => router.push('/block-planner')}>
            Go to Block Planner
          </GovernmentButton>
        </GovernmentCard>
      </div>
    );
  }

  const baseTasks = state.tasks.filter(t => block.tasks.includes(t.id));
  const baseDuration = baseTasks.reduce((sum, t) => sum + (t.durationMinutes || (t as any).duration || 0), 0);
  const harvestedTasks = block.harvestedTasks ? state.tasks.filter(t => block.harvestedTasks.includes(t.id)) : [];
  const harvestedDuration = harvestedTasks.reduce((sum, t) => sum + (t.durationMinutes || (t as any).duration || 0), 0);
  
  const allocated = calculateAllocatedMinutes(block, state.tasks);
  const available = calculateRemainingCapacity(block, state.tasks);
  const utilization = calculateUtilization(block, state.tasks);

  const isHarvested = harvestedTasks.length > 0;

  const candidates = state.tasks.filter(t => 
    !block.tasks.includes(t.id) && 
    !block.harvestedTasks.includes(t.id) &&
    ['PENDING', 'DEFERRED'].includes(t.status)
  ).sort((a, b) => b.duration - a.duration);

  const handleHarvest = () => {
    if (available < 0) {
      alert("Capacity exceeded. Cannot harvest tasks.");
      return;
    }
    setIsHarvesting(true);
    setTimeout(() => {
      // Find tasks that fit
      let currentAvailable = available;
      const tasksToHarvest: string[] = [];
      for (const c of candidates) {
        const cDuration = c.durationMinutes || (c as any).duration || 0;
        if (cDuration <= currentAvailable) {
          tasksToHarvest.push(c.id);
          currentAvailable -= cDuration;
        }
      }

      if (tasksToHarvest.length > 0) {
        dispatch({ type: "HARVEST_TASKS", payload: { blockId: block.id, taskIds: tasksToHarvest } });
        dispatch({ type: "ADD_AUDIT_EVENT", payload: {
          event: "HARVEST_MAXIMUM_EXECUTED",
          entity: block.id,
          previousState: `Tasks: ${block.tasks.length}`,
          newState: `Tasks: ${block.tasks.length + tasksToHarvest.length}`,
          reason: "User executed block harvesting.",
          user: "Control Officer"
        }});
      } else {
        alert("No tasks fit the remaining capacity.");
      }
      setIsHarvesting(false);
    }, 1200);
  };

  return (
    <div className="space-y-4 pb-12">
      <SectionHeader 
        title={<span className="flex items-center text-red-800"><Zap className="h-5 w-5 mr-2" /> Block Harvesting Engine</span>}
        description="Increase maintenance yield without extending possession. Don't waste an approved possession."
        action={
          <div className="text-right text-xs">
            <StatusBadge status="info">Strategic Initiative</StatusBadge>
            <div className="font-bold text-slate-900 mt-1 uppercase">RailNiyojak Flagship Module</div>
          </div>
        }
      />

      <GovernmentCard className="p-4 bg-slate-50 border-l-4 border-l-slate-800">
        <div className="flex flex-col md:flex-row justify-between md:items-center">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">Current Possession</div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center">
              {block.corridor}
              <span className="mx-2 text-slate-400">|</span>
              {block.startTime}–{block.endTime} ({block.durationMinutes} mins)
            </h2>
          </div>
          
          <div className="grid grid-cols-4 gap-4 mt-3 md:mt-0">
            <div className="text-center">
              <div className="text-[10px] uppercase font-bold text-slate-500">Capacity</div>
              <div className="text-sm font-bold text-slate-900">{block.durationMinutes} min</div>
            </div>
            <div className="text-center">
              <div className="text-[10px] uppercase font-bold text-slate-500">Allocated</div>
              <div className="text-sm font-bold text-slate-900">{allocated} min</div>
            </div>
            <div className="text-center border-l border-slate-300 pl-4">
              <div className={`text-[10px] uppercase font-bold ${available < 0 ? 'text-red-700' : 'text-emerald-700'}`}>Available</div>
              <div className={`text-sm font-bold ${available < 0 ? 'text-red-600' : 'text-emerald-600'}`}>{available < 0 ? "CAPACITY EXCEEDED" : `${available} min`}</div>
            </div>
            <div className="text-center border-l border-slate-300 pl-4">
              <div className="text-[10px] uppercase font-bold text-slate-500">Utilization</div>
              <div className="text-sm font-bold text-slate-900">{utilization}%</div>
            </div>
          </div>
        </div>
      </GovernmentCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GovernmentCard className="p-4 flex flex-col">
          <h3 className="text-sm font-bold border-b border-slate-300 pb-2 mb-4 text-slate-800">
            Possession Timeline Overview
          </h3>
          
          <div className="flex-1 bg-white border border-slate-200 p-4 rounded-sm relative overflow-y-auto">
            <div className="space-y-4">
              {baseTasks.map(t => (
                <div key={t.id} className="flex items-center">
                  <div className="w-20 text-[10px] font-bold uppercase text-slate-600">{t.department}</div>
                  <div className={`flex-1 h-6 bg-slate-100 border-l-2 border-r-2 ${
                    t.department === 'Engineering' ? 'border-red-800' :
                    t.department === 'S&T' ? 'border-blue-600' : 'border-amber-500'
                  } flex items-center justify-center relative shadow-sm`} style={{ width: `${(t.duration / block.durationMinutes) * 100}%` }}>
                    <span className="text-[9px] font-bold text-slate-900 truncate px-2">{t.title} ({t.duration}m)</span>
                  </div>
                </div>
              ))}
              
              {harvestedTasks.map(t => (
                <div key={t.id} className="flex items-center">
                  <div className="w-20 text-[10px] font-bold uppercase text-emerald-700">Harvested</div>
                  <div className="flex-1 h-6 bg-emerald-500 text-white flex items-center justify-center shadow-sm border border-emerald-700" style={{ width: `${(t.duration / block.durationMinutes) * 100}%` }}>
                    <span className="text-[9px] font-bold truncate px-2">{t.title} ({t.duration}m)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-4 p-2 bg-slate-100 border border-slate-300 rounded-sm text-xs text-center font-bold text-slate-700">
            Total Block Duration remains fixed at {block.durationMinutes} minutes.
          </div>
        </GovernmentCard>

        <GovernmentCard className={`p-4 flex flex-col transition-colors duration-500 ${isHarvested ? 'bg-slate-50 opacity-70' : ''}`}>
          <div className="flex justify-between items-center border-b border-slate-300 pb-2 mb-4">
            <h3 className="text-sm font-bold text-slate-800">
              Harvestable Maintenance Tasks
            </h3>
            <StatusBadge status="success">{candidates.length} Candidates</StatusBadge>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[300px]">
            {candidates.map(c => {
              const fits = c.duration <= available;
              return (
                <div key={c.id} className={`border border-slate-300 bg-white p-3 rounded-sm shadow-sm relative overflow-hidden ${!fits ? 'opacity-60' : ''}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className={`text-sm font-bold ${fits ? 'text-slate-900' : 'text-slate-900 line-through'}`}>{c.title}</div>
                      <div className="text-[10px] text-slate-500 uppercase">Duration: <span className="font-bold text-slate-700">{c.duration} min</span></div>
                    </div>
                    <div className={`${fits ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-amber-100 text-amber-800 border-amber-300'} text-[10px] px-1.5 py-0.5 rounded border font-bold`}>
                      Compatibility: {c.compatibilityScore || 80}%
                    </div>
                  </div>
                  {fits ? (
                    <ul className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] text-slate-600">
                      <li className="flex items-center"><Check className="h-3 w-3 text-emerald-600 mr-1" /> Same corridor</li>
                      <li className="flex items-center"><Check className="h-3 w-3 text-emerald-600 mr-1" /> Fits capacity</li>
                    </ul>
                  ) : (
                    <div className="text-[10px] text-red-600 font-bold mt-1">Exceeds remaining capacity.</div>
                  )}
                </div>
              );
            })}
            {candidates.length === 0 && (
              <div className="text-center text-sm text-slate-500 pt-8">No harvestable tasks available.</div>
            )}
          </div>
          
          <div className="mt-4 pt-4 border-t border-slate-200">
            <GovernmentButton 
              size="lg" 
              className={`w-full py-4 text-sm tracking-widest font-extrabold uppercase shadow-md ${candidates.filter(c => c.duration <= available).length === 0 ? 'bg-slate-300 text-slate-600 cursor-not-allowed border-none' : 'bg-emerald-700 hover:bg-emerald-800 border border-emerald-900'}`}
              onClick={handleHarvest}
              disabled={isHarvesting || candidates.filter(c => c.duration <= available).length === 0}
            >
              {isHarvesting ? <span className="flex items-center justify-center"><Settings className="h-5 w-5 mr-2 animate-spin" /> Processing...</span> : 
               <span className="flex items-center justify-center"><Zap className="h-5 w-5 mr-2" /> Harvest Maximum</span>}
            </GovernmentButton>
          </div>
        </GovernmentCard>
      </div>

      {isHarvested && (
        <div className="mt-6 space-y-4 animate-in slide-in-from-bottom-8 duration-700 fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-100 border border-slate-300 p-5 rounded-sm shadow-sm opacity-80">
              <div className="text-center mb-4">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Before Harvesting</span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between border-b border-slate-300 pb-1">
                  <span className="text-xs font-bold text-slate-600 uppercase">Tasks Scheduled</span>
                  <span className="text-sm font-bold text-slate-900">{baseTasks.length}</span>
                </div>
                <div className="flex justify-between border-b border-slate-300 pb-1">
                  <span className="text-xs font-bold text-slate-600 uppercase">Utilization</span>
                  <span className="text-sm font-bold text-slate-900">{Math.round((baseDuration / block.durationMinutes) * 100)}%</span>
                </div>
              </div>
            </div>

            <div className="bg-emerald-50 border-2 border-emerald-600 p-5 rounded-sm shadow-md relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[10px] font-bold px-3 py-1 rounded-sm uppercase tracking-widest border border-emerald-800 shadow-sm">
                Optimized Output
              </div>
              <div className="text-center mb-4 mt-2">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest">After Harvesting</span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between border-b border-emerald-200 pb-1">
                  <span className="text-xs font-bold text-emerald-800 uppercase flex items-center">
                    Tasks Scheduled <ArrowRight className="h-3 w-3 ml-1 text-emerald-600" />
                  </span>
                  <span className="text-sm font-bold text-emerald-700">{baseTasks.length + harvestedTasks.length}</span>
                </div>
                <div className="flex justify-between border-b border-emerald-200 pb-1">
                  <span className="text-xs font-bold text-emerald-800 uppercase flex items-center">
                    Utilization <ArrowRight className="h-3 w-3 ml-1 text-emerald-600" />
                  </span>
                  <span className="text-sm font-bold text-emerald-700">{utilization}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs font-bold text-emerald-800 uppercase flex items-center">
                    Future Demand Avoided
                  </span>
                  <span className="text-sm font-bold text-emerald-700">{(harvestedDuration / 60).toFixed(1)}h</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <ExplainabilityPanel />
          </div>
        </div>
      )}
    </div>
  );
}
