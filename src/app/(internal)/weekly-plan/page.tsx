"use client";

import { InternalTabs } from "@/components/InternalTabs";
import { useTranslation } from "@/lib/i18n";
import { 
  SectionHeader, GovernmentCard, MetricCard, StatusBadge, FilterBar, GovernmentButton 
} from "@/components/design-system";
import { Download, Clock, Maximize2, AlertTriangle, Zap, CalendarDays, CheckCircle } from "lucide-react";

export default function WeeklyPlanPage() {
  const { t } = useTranslation();
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  
  return (
    <div className="space-y-6 pb-12">
      <InternalTabs tabs={[
        { name: "Daily", href: "/block-planner" },
        { name: "Weekly", href: "/weekly-plan" },
        { name: "Monthly", href: "/monthly-plan" }
      ]} />
      <SectionHeader 
        title="Weekly Maintenance Plan" 
        description="7-Day integrated block schedule across all departments."
        action={
          <div className="flex gap-2">
            <GovernmentButton variant="outline" size="sm"><Download className="h-4 w-4 mr-1" /> Export PDF</GovernmentButton>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <GovernmentCard className="p-4 border-l-4 border-l-red-700">
          <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Weekly Possession</div>
          <div className="text-2xl font-black text-slate-900">42 hrs</div>
          <div className="text-xs text-slate-600 mt-1 font-semibold flex items-center">
            <Clock className="h-3 w-3 mr-1 text-slate-400" /> -12% vs last week
          </div>
        </GovernmentCard>

        <GovernmentCard className="p-4 border-l-4 border-l-emerald-600">
          <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Integrated Tasks</div>
          <div className="text-2xl font-black text-slate-900">24</div>
          <div className="text-xs text-slate-600 mt-1 font-semibold flex items-center">
            <Maximize2 className="h-3 w-3 mr-1 text-slate-400" /> Across 8 shared blocks
          </div>
        </GovernmentCard>

        <GovernmentCard className="p-4 border-l-4 border-l-amber-500">
          <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">High-Risk Covered</div>
          <div className="text-2xl font-black text-slate-900">100%</div>
          <div className="text-xs text-slate-600 mt-1 font-semibold flex items-center">
            <AlertTriangle className="h-3 w-3 mr-1 text-slate-400" /> All critical assets scheduled
          </div>
        </GovernmentCard>

        <GovernmentCard className="p-4 border-l-4 border-l-blue-600 bg-blue-50">
          <div className="text-[10px] text-blue-700 uppercase font-bold tracking-widest mb-1">Future Poss. Avoided</div>
          <div className="text-2xl font-black text-blue-900">18.5 hrs</div>
          <div className="text-xs text-blue-700 mt-1 font-semibold flex items-center">
            <Zap className="h-3 w-3 mr-1 text-blue-500" /> Via Block Harvesting
          </div>
        </GovernmentCard>
      </div>

      <GovernmentCard className="p-5">
        <div className="flex items-center justify-between border-b border-slate-300 pb-3 mb-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center">
            <CalendarDays className="h-5 w-5 mr-2 text-slate-500" />
            7-Day Master Timeline
          </h3>
          <div className="flex gap-4 text-[10px] font-bold uppercase text-slate-600">
            <span className="flex items-center"><span className="w-3 h-3 bg-red-800 rounded-sm mr-1"></span> Integrated</span>
            <span className="flex items-center"><span className="w-3 h-3 bg-slate-300 rounded-sm mr-1 border border-slate-400"></span> Independent</span>
            <span className="flex items-center"><span className="w-3 h-3 bg-amber-400 rounded-sm mr-1"></span> High-Risk</span>
            <span className="flex items-center"><span className="w-3 h-3 bg-emerald-500 rounded-sm mr-1"></span> Harvested</span>
          </div>
        </div>

        <div className="w-full overflow-x-auto pb-4">
          <div className="min-w-[900px]">
            {/* Header Row */}
            <div className="flex border-b-2 border-slate-300 mb-2 pb-2">
              <div className="w-24 shrink-0 font-bold text-slate-500 text-xs uppercase text-right pr-4 pt-1">Dept</div>
              {days.map(day => (
                <div key={day} className="flex-1 text-center font-bold text-slate-800 uppercase tracking-widest border-l border-slate-200">
                  {day}
                </div>
              ))}
            </div>

            {/* Engineering Row */}
            <div className="flex items-center mb-3">
              <div className="w-24 shrink-0 font-bold text-slate-700 text-xs uppercase text-right pr-4">Engineering</div>
              
              <div className="flex-1 border-l border-slate-200 px-1 py-1 h-16 relative">
                <div className="absolute top-1 left-1 right-1 h-6 bg-red-800/10 border border-red-800/30 rounded-sm flex items-center px-1">
                  <span className="w-1.5 h-1.5 bg-red-800 rounded-full mr-1"></span>
                  <span className="text-[9px] font-bold text-red-900 truncate">Integrated Block (KOTA)</span>
                </div>
              </div>
              <div className="flex-1 border-l border-slate-200 px-1 py-1 h-16 relative">
                <div className="absolute top-1 left-1 right-1 h-6 bg-slate-100 border border-slate-300 rounded-sm flex items-center px-1">
                  <span className="w-1.5 h-1.5 bg-slate-500 rounded-full mr-1"></span>
                  <span className="text-[9px] font-bold text-slate-700 truncate">Track Renewal</span>
                </div>
                <div className="absolute top-8 left-1 right-1/2 h-6 bg-amber-100 border border-amber-400 rounded-sm flex items-center px-1">
                  <AlertTriangle className="h-2.5 w-2.5 text-amber-600 mr-1" />
                  <span className="text-[9px] font-bold text-amber-900 truncate">Bridge Repair</span>
                </div>
              </div>
              <div className="flex-1 border-l border-slate-200 px-1 py-1 h-16 relative bg-slate-50"></div>
              <div className="flex-1 border-l border-slate-200 px-1 py-1 h-16 relative">
                <div className="absolute top-1 left-1 right-1 h-6 bg-red-800/10 border border-red-800/30 rounded-sm flex items-center px-1">
                  <span className="w-1.5 h-1.5 bg-red-800 rounded-full mr-1"></span>
                  <span className="text-[9px] font-bold text-red-900 truncate">Multi-Dept (RMA)</span>
                </div>
              </div>
              <div className="flex-1 border-l border-slate-200 px-1 py-1 h-16 relative"></div>
              <div className="flex-1 border-l border-slate-200 px-1 py-1 h-16 relative">
                <div className="absolute top-1 left-1 right-1/4 h-6 bg-slate-100 border border-slate-300 rounded-sm flex items-center px-1">
                  <span className="w-1.5 h-1.5 bg-slate-500 rounded-full mr-1"></span>
                  <span className="text-[9px] font-bold text-slate-700 truncate">Welding</span>
                </div>
              </div>
              <div className="flex-1 border-l border-slate-200 px-1 py-1 h-16 relative bg-slate-50">
                <div className="absolute top-1 left-1 right-1 h-6 bg-amber-100 border border-amber-400 rounded-sm flex items-center px-1">
                  <AlertTriangle className="h-2.5 w-2.5 text-amber-600 mr-1" />
                  <span className="text-[9px] font-bold text-amber-900 truncate">Deep Screening</span>
                </div>
              </div>
            </div>

            {/* S&T Row */}
            <div className="flex items-center mb-3">
              <div className="w-24 shrink-0 font-bold text-slate-700 text-xs uppercase text-right pr-4">S&T</div>
              
              <div className="flex-1 border-l border-slate-200 px-1 py-1 h-16 relative">
                <div className="absolute top-1 left-1 right-1/2 h-6 bg-red-800/10 border border-red-800/30 rounded-sm flex items-center px-1">
                  <span className="w-1.5 h-1.5 bg-red-800 rounded-full mr-1"></span>
                  <span className="text-[9px] font-bold text-red-900 truncate">Signal Insp.</span>
                </div>
              </div>
              <div className="flex-1 border-l border-slate-200 px-1 py-1 h-16 relative">
                <div className="absolute top-8 left-1/4 right-1 h-6 bg-emerald-100 border border-emerald-400 rounded-sm flex items-center px-1">
                  <CheckCircle className="h-2.5 w-2.5 text-emerald-600 mr-1" />
                  <span className="text-[9px] font-bold text-emerald-900 truncate">Harvested Cable</span>
                </div>
              </div>
              <div className="flex-1 border-l border-slate-200 px-1 py-1 h-16 relative bg-slate-50">
                <div className="absolute top-1 left-1 right-1 h-6 bg-slate-100 border border-slate-300 rounded-sm flex items-center px-1">
                  <span className="w-1.5 h-1.5 bg-slate-500 rounded-full mr-1"></span>
                  <span className="text-[9px] font-bold text-slate-700 truncate">Point Machine</span>
                </div>
              </div>
              <div className="flex-1 border-l border-slate-200 px-1 py-1 h-16 relative">
                <div className="absolute top-1 left-1 right-1 h-6 bg-red-800/10 border border-red-800/30 rounded-sm flex items-center px-1">
                  <span className="w-1.5 h-1.5 bg-red-800 rounded-full mr-1"></span>
                  <span className="text-[9px] font-bold text-red-900 truncate">Relay Room</span>
                </div>
              </div>
              <div className="flex-1 border-l border-slate-200 px-1 py-1 h-16 relative"></div>
              <div className="flex-1 border-l border-slate-200 px-1 py-1 h-16 relative">
                <div className="absolute top-8 left-1 right-1 h-6 bg-emerald-100 border border-emerald-400 rounded-sm flex items-center px-1">
                  <CheckCircle className="h-2.5 w-2.5 text-emerald-600 mr-1" />
                  <span className="text-[9px] font-bold text-emerald-900 truncate">Harvested Telecom</span>
                </div>
              </div>
              <div className="flex-1 border-l border-slate-200 px-1 py-1 h-16 relative bg-slate-50"></div>
            </div>

            {/* TRD Row */}
            <div className="flex items-center">
              <div className="w-24 shrink-0 font-bold text-slate-700 text-xs uppercase text-right pr-4">TRD</div>
              
              <div className="flex-1 border-l border-slate-200 px-1 py-1 h-16 relative">
                <div className="absolute top-1 left-1/2 right-1 h-6 bg-red-800/10 border border-red-800/30 rounded-sm flex items-center px-1">
                  <span className="w-1.5 h-1.5 bg-red-800 rounded-full mr-1"></span>
                  <span className="text-[9px] font-bold text-red-900 truncate">OHE Tension</span>
                </div>
              </div>
              <div className="flex-1 border-l border-slate-200 px-1 py-1 h-16 relative"></div>
              <div className="flex-1 border-l border-slate-200 px-1 py-1 h-16 relative bg-slate-50">
                <div className="absolute top-8 left-1 right-1/2 h-6 bg-amber-100 border border-amber-400 rounded-sm flex items-center px-1">
                  <AlertTriangle className="h-2.5 w-2.5 text-amber-600 mr-1" />
                  <span className="text-[9px] font-bold text-amber-900 truncate">Pantograph Insp.</span>
                </div>
              </div>
              <div className="flex-1 border-l border-slate-200 px-1 py-1 h-16 relative">
                <div className="absolute top-8 left-1 right-1 h-6 bg-emerald-100 border border-emerald-400 rounded-sm flex items-center px-1">
                  <CheckCircle className="h-2.5 w-2.5 text-emerald-600 mr-1" />
                  <span className="text-[9px] font-bold text-emerald-900 truncate">Harvested Mast Check</span>
                </div>
              </div>
              <div className="flex-1 border-l border-slate-200 px-1 py-1 h-16 relative">
                <div className="absolute top-1 left-1 right-1 h-6 bg-slate-100 border border-slate-300 rounded-sm flex items-center px-1">
                  <span className="w-1.5 h-1.5 bg-slate-500 rounded-full mr-1"></span>
                  <span className="text-[9px] font-bold text-slate-700 truncate">Traction Substation</span>
                </div>
              </div>
              <div className="flex-1 border-l border-slate-200 px-1 py-1 h-16 relative"></div>
              <div className="flex-1 border-l border-slate-200 px-1 py-1 h-16 relative bg-slate-50"></div>
            </div>

          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-slate-200 text-xs text-slate-500 text-center font-bold uppercase tracking-widest">
          End of 7-Day Plan
        </div>
      </GovernmentCard>
    </div>
  );
}




