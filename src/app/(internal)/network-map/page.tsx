"use client";

import { useTranslation } from "@/lib/i18n";
import { useState, useMemo } from "react";
import { SectionHeader, MetricCard, GovernmentCard, GovernmentButton } from "@/components/design-system";
import { MapPin, AlertTriangle, Clock, ZoomIn, ZoomOut, Maximize, X, ArrowRight, Settings, Activity } from "lucide-react";
import Link from "next/link";

type Station = {
  id: string;
  name: string;
  x: number;
  y: number;
  risk: number; // 0-100
  pendingTasks: number;
  highRiskTasks: number;
  currentBlock: string;
  trainIntensity: string;
  harvestableTasks: number;
};

type Corridor = {
  id: string;
  fromId: string;
  toId: string;
  status: string;
  traffic: string;
  pendingTasks: number;
  highRiskAssets: number;
  harvestOpportunities: number;
};

const STATIONS: Station[] = [
  { id: "s1", name: "AJMER", x: 150, y: 250, risk: 30, pendingTasks: 2, highRiskTasks: 0, currentBlock: "None", trainIntensity: "Low", harvestableTasks: 1 },
  { id: "s2", name: "JAIPUR", x: 300, y: 150, risk: 65, pendingTasks: 5, highRiskTasks: 1, currentBlock: "None", trainIntensity: "High", harvestableTasks: 2 },
  { id: "s3", name: "KOTA", x: 300, y: 350, risk: 92, pendingTasks: 4, highRiskTasks: 1, currentBlock: "None", trainIntensity: "Medium", harvestableTasks: 2 },
  { id: "s4", name: "SAWAI MADHOPUR", x: 450, y: 350, risk: 45, pendingTasks: 3, highRiskTasks: 0, currentBlock: "Active", trainIntensity: "Low", harvestableTasks: 3 },
  { id: "s5", name: "BHARATPUR", x: 550, y: 250, risk: 20, pendingTasks: 1, highRiskTasks: 0, currentBlock: "None", trainIntensity: "Medium", harvestableTasks: 0 },
  { id: "s6", name: "ITARSI", x: 650, y: 500, risk: 80, pendingTasks: 8, highRiskTasks: 2, currentBlock: "Planned", trainIntensity: "High", harvestableTasks: 4 },
];

const CORRIDORS: Corridor[] = [
  { id: "c1", fromId: "s1", toId: "s2", status: "Available", traffic: "Medium", pendingTasks: 3, highRiskAssets: 0, harvestOpportunities: 1 },
  { id: "c2", fromId: "s2", toId: "s3", status: "Conflict", traffic: "High", pendingTasks: 8, highRiskAssets: 2, harvestOpportunities: 0 },
  { id: "c3", fromId: "s3", toId: "s4", status: "Available", traffic: "Medium", pendingTasks: 6, highRiskAssets: 2, harvestOpportunities: 3 },
  { id: "c4", fromId: "s4", toId: "s5", status: "Active", traffic: "Low", pendingTasks: 2, highRiskAssets: 0, harvestOpportunities: 4 },
  { id: "c5", fromId: "s5", toId: "s6", status: "Available", traffic: "High", pendingTasks: 12, highRiskAssets: 3, harvestOpportunities: 2 },
];

export function NetworkMapContent({ embedded = false }: { embedded?: boolean }) {
  const { t } = useTranslation();
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [selectedEntity, setSelectedEntity] = useState<Station | Corridor | null>(null);

  // Filters
  const [deptFilter, setDeptFilter] = useState("All");
  const [riskFilter, setRiskFilter] = useState("All");

  const handleZoom = (delta: number) => {
    setZoom(z => Math.max(0.5, Math.min(3, z + delta)));
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 gap-4">
      {!embedded && (
        <SectionHeader 
          title="Network Map"
          description="Railway Corridor & Maintenance Asset Overview"
          action={
            <div className="bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
              Synthetic Prototype Data
            </div>
          }
        />
      )}

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 shrink-0">
        <MetricCard title="Active Corridors" value="12" />
        <MetricCard title="Critical Assets" value="7" status="danger" />
        <MetricCard title="Active Blocks" value="4" status="success" />
        <MetricCard title="Maintenance Tasks" value="18" />
        <MetricCard title="Harvest Opportunities" value="6" status="success" />
      </div>

      <div className="flex flex-col md:flex-row gap-4 flex-1 overflow-hidden">
        
        {/* Main Map Area */}
        <GovernmentCard className="flex-1 flex flex-col overflow-hidden h-[500px] md:h-auto">
          {/* Filters Bar */}
          <div className="flex flex-wrap items-center gap-4 p-3 border-b border-slate-200 bg-white shrink-0 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700 uppercase tracking-widest text-[10px]">Department:</span>
              <select className="border border-slate-300 p-1 text-slate-700 bg-slate-50" value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
                <option>All</option>
                <option>Engineering</option>
                <option>S&T</option>
                <option>TRD</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700 uppercase tracking-widest text-[10px]">Asset Risk:</span>
              <select className="border border-slate-300 p-1 text-slate-700 bg-slate-50" value={riskFilter} onChange={e => setRiskFilter(e.target.value)}>
                <option>All</option>
                <option>Critical</option>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>

            <div className="ml-auto flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-600">
              <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-slate-700"></div> Station</div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-red-600"></div> Critical</div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-amber-500"></div> Task</div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 bg-emerald-500"></div> Block</div>
              <div className="flex items-center gap-1"><AlertTriangle className="w-3 h-3 text-red-600" /> Conflict</div>
            </div>
          </div>

          {/* Map Container */}
          <div className="relative flex-1 bg-[#f8fafc] overflow-hidden">
            {/* Toolbar */}
            <div className="absolute left-4 top-4 z-10 flex flex-col gap-1 bg-white border border-slate-300 shadow-sm">
              <button onClick={() => handleZoom(0.2)} className="p-2 hover:bg-slate-100 text-slate-700" title="Zoom In"><ZoomIn className="w-4 h-4" /></button>
              <button onClick={() => handleZoom(-0.2)} className="p-2 hover:bg-slate-100 text-slate-700 border-t border-slate-200" title="Zoom Out"><ZoomOut className="w-4 h-4" /></button>
              <button onClick={resetView} className="p-2 hover:bg-slate-100 text-slate-700 border-t border-slate-200" title="Reset View"><Maximize className="w-4 h-4" /></button>
            </div>

            {/* SVG Map */}
            <div className="w-full h-full">
              <svg width="100%" height="100%" viewBox="0 0 800 600">
                <g transform={`scale(${zoom}) translate(${pan.x}, ${pan.y})`} className="transition-transform duration-200 ease-out">
                  
                  {/* Corridors */}
                  {CORRIDORS.map(c => {
                    const from = STATIONS.find(s => s.id === c.fromId);
                    const to = STATIONS.find(s => s.id === c.toId);
                    if (!from || !to) return null;
                    
                    let strokeColor = "#64748b"; // slate-500
                    if (c.status === "Active") strokeColor = "#10b981"; // emerald-500
                    if (c.status === "Conflict") strokeColor = "#ef4444"; // red-500

                    return (
                      <g key={c.id} className="cursor-pointer group" onClick={() => setSelectedEntity(c)}>
                        {/* Invisible thicker line for easier clicking */}
                        <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="transparent" strokeWidth="20" />
                        
                        <line 
                          x1={from.x} y1={from.y} x2={to.x} y2={to.y} 
                          stroke={strokeColor} 
                          strokeWidth="4"
                          className="group-hover:stroke-slate-900 transition-colors"
                        />
                        {c.status === "Conflict" && (
                          <circle cx={(from.x + to.x)/2} cy={(from.y + to.y)/2} r="8" fill="#ef4444" className="animate-pulse" />
                        )}
                        {c.harvestOpportunities > 0 && c.status !== "Conflict" && (
                          <rect x={(from.x + to.x)/2 - 6} y={(from.y + to.y)/2 - 6} width="12" height="12" fill="#10b981" />
                        )}
                      </g>
                    );
                  })}

                  {/* Stations */}
                  {STATIONS.map(s => {
                    let fill = "#334155"; // slate-700
                    if (s.risk > 80) fill = "#dc2626"; // red-600
                    else if (s.risk > 50) fill = "#f59e0b"; // amber-500

                    const isSelected = selectedEntity?.id === s.id;

                    return (
                      <g key={s.id} className="cursor-pointer group" onClick={() => setSelectedEntity(s)}>
                        {isSelected && (
                          <circle cx={s.x} cy={s.y} r="14" fill="rgba(15, 23, 42, 0.1)" className="animate-pulse" />
                        )}
                        <circle 
                          cx={s.x} cy={s.y} r="8" 
                          fill={fill} 
                          stroke="#ffffff" 
                          strokeWidth="2"
                          className="group-hover:r-10 transition-all shadow-lg"
                        />
                        <text 
                          x={s.x} y={s.y - 15} 
                          textAnchor="middle" 
                          className="text-[10px] font-bold fill-slate-800 uppercase tracking-widest drop-shadow-sm pointer-events-none"
                        >
                          {s.name}
                        </text>
                      </g>
                    );
                  })}

                </g>
              </svg>
            </div>
          </div>
        </GovernmentCard>

        {/* Details Drawer */}
        {selectedEntity && (
          <GovernmentCard className="w-full md:w-80 shrink-0 flex flex-col bg-white overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
              <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm">
                {"name" in selectedEntity ? "Station Details" : "Corridor Details"}
              </h3>
              <button onClick={() => setSelectedEntity(null)} className="text-slate-500 hover:text-slate-900"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-4 flex-1">
              <h4 className="text-xl font-black text-slate-800 mb-6 uppercase">
                {"name" in selectedEntity ? selectedEntity.name : (
                  `${STATIONS.find(s => s.id === (selectedEntity as Corridor).fromId)?.name} – ${STATIONS.find(s => s.id === (selectedEntity as Corridor).toId)?.name}`
                )}
              </h4>

              <div className="space-y-4 text-sm font-medium text-slate-700">
                {"name" in selectedEntity ? (
                  <>
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                      <span className="text-slate-500">Asset Health</span>
                      <span className={selectedEntity.risk > 80 ? "text-red-700 font-bold" : ""}>{100 - selectedEntity.risk}%</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                      <span className="text-slate-500">Pending Maintenance</span>
                      <span>{selectedEntity.pendingTasks}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                      <span className="text-slate-500">High-Risk Tasks</span>
                      <span className={selectedEntity.highRiskTasks > 0 ? "text-red-700 font-bold" : ""}>{selectedEntity.highRiskTasks}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                      <span className="text-slate-500">Current Block</span>
                      <span>{selectedEntity.currentBlock}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                      <span className="text-slate-500">Train Intensity</span>
                      <span>{selectedEntity.trainIntensity}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                      <span className="text-slate-500">Harvestable Tasks</span>
                      <span className={selectedEntity.harvestableTasks > 0 ? "text-emerald-700 font-bold" : ""}>{selectedEntity.harvestableTasks}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                      <span className="text-slate-500">Block Status</span>
                      <span className={selectedEntity.status === "Conflict" ? "text-red-700 font-bold" : ""}>{selectedEntity.status}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                      <span className="text-slate-500">Traffic</span>
                      <span>{selectedEntity.traffic}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                      <span className="text-slate-500">Pending Tasks</span>
                      <span>{selectedEntity.pendingTasks}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                      <span className="text-slate-500">High-Risk Assets</span>
                      <span className={selectedEntity.highRiskAssets > 0 ? "text-red-700 font-bold" : ""}>{selectedEntity.highRiskAssets}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                      <span className="text-slate-500">Harvest Opportunities</span>
                      <span className={selectedEntity.harvestOpportunities > 0 ? "text-emerald-700 font-bold" : ""}>{selectedEntity.harvestOpportunities}</span>
                    </div>
                  </>
                )}
              </div>

              <div className="mt-8 space-y-3">
                {(("highRiskTasks" in selectedEntity && selectedEntity.highRiskTasks > 0) || ("highRiskAssets" in selectedEntity && selectedEntity.highRiskAssets > 0)) && (
                  <div className="bg-red-50 text-red-900 border border-red-200 p-3 text-xs font-bold mb-4 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /> High-risk maintenance task detected on this route.
                  </div>
                )}
                
                <Link href="/block-planner" className="block w-full">
                  <GovernmentButton variant="primary" className="w-full flex items-center justify-center">
                    PLAN MAINTENANCE BLOCK <ArrowRight className="w-4 h-4 ml-2" />
                  </GovernmentButton>
                </Link>
                
                {(("harvestOpportunities" in selectedEntity && selectedEntity.harvestOpportunities > 0) || ("harvestableTasks" in selectedEntity && selectedEntity.harvestableTasks > 0)) ? (
                  <Link href="/harvesting" className="block w-full">
                    <GovernmentButton variant="outline" className="w-full flex items-center justify-center text-emerald-800 border-emerald-300 hover:bg-emerald-50">
                      VIEW HARVEST OPPORTUNITY <ArrowRight className="w-4 h-4 ml-2" />
                    </GovernmentButton>
                  </Link>
                ) : null}
              </div>

            </div>
          </GovernmentCard>
        )}
      </div>
    </div>
  );
}

export default function NetworkMapPage() {
  return <NetworkMapContent />;
}
