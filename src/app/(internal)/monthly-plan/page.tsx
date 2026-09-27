"use client";

import { InternalTabs } from "@/components/InternalTabs";
import { useTranslation } from "@/lib/i18n";
import { 
  SectionHeader, GovernmentCard, StatusBadge, FilterBar, GovernmentButton 
} from "@/components/design-system";
import { Download, CalendarRange, AlertTriangle, TrendingUp } from "lucide-react";

export default function MonthlyPlanPage() {
  const { t } = useTranslation();
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const calendarData = Array.from({ length: 30 }, (_, i) => {
    // Generate some mock heat levels based on day index
    let heat = "Low";
    if (i % 7 === 1 || i % 7 === 4) heat = "Medium";
    if (i === 12 || i === 25) heat = "Critical";
    if (i === 8 || i === 19 || i === 22) heat = "High";
    return { day: i + 1, heat };
  });

  const getHeatColors = (heat: string) => {
    switch(heat) {
      case "Low": return "bg-emerald-50 border-emerald-200 text-emerald-800";
      case "Medium": return "bg-amber-50 border-amber-200 text-amber-800";
      case "High": return "bg-orange-100 border-orange-300 text-orange-900";
      case "Critical": return "bg-red-100 border-red-400 text-red-900 shadow-sm";
      default: return "bg-slate-50 border-slate-200 text-slate-800";
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <InternalTabs tabs={[
        { name: "Daily", href: "/block-planner" },
        { name: "Weekly", href: "/weekly-plan" },
        { name: "Monthly", href: "/monthly-plan" }
      ]} />
      <SectionHeader 
        title="Monthly Workload Plan" 
        description="Corridor-level workload intensity and backlog forecasting."
        action={
          <div className="flex flex-col items-end gap-1">
            <StatusBadge status="warning">Prototype planning indicator</StatusBadge>
            <GovernmentButton variant="outline" size="sm" className="mt-1"><Download className="h-4 w-4 mr-1" /> Export Report</GovernmentButton>
          </div>
        }
      />

      <GovernmentCard className="p-3">
        <FilterBar>
          <select className="text-xs border border-slate-300 rounded-sm p-1.5 bg-white min-w-[120px]">
            <option>Dept: All</option>
            <option>Engineering</option>
            <option>S&T</option>
            <option>TRD</option>
          </select>
          <select className="text-xs border border-slate-300 rounded-sm p-1.5 bg-white min-w-[150px]">
            <option>Corridor: All Active</option>
            <option>KOTA - ITARSI</option>
            <option>NDLS - KOTA</option>
          </select>
          <select className="text-xs border border-slate-300 rounded-sm p-1.5 bg-white min-w-[120px]">
            <option>Risk: All</option>
            <option>Critical Only</option>
            <option>High + Critical</option>
          </select>
        </FilterBar>
      </GovernmentCard>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Calendar View */}
        <div className="lg:col-span-3">
          <GovernmentCard className="p-5 h-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center">
                <CalendarRange className="h-5 w-5 mr-2 text-slate-500" />
                September 2026
              </h3>
              <div className="flex gap-2 text-[10px] font-bold uppercase text-slate-600">
                <span className="flex items-center"><span className="w-3 h-3 bg-emerald-100 border border-emerald-300 rounded-sm mr-1"></span> Low</span>
                <span className="flex items-center"><span className="w-3 h-3 bg-amber-100 border border-amber-300 rounded-sm mr-1"></span> Med</span>
                <span className="flex items-center"><span className="w-3 h-3 bg-orange-100 border border-orange-300 rounded-sm mr-1"></span> High</span>
                <span className="flex items-center"><span className="w-3 h-3 bg-red-200 border border-red-400 rounded-sm mr-1"></span> Crit</span>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {days.map(day => (
                <div key={day} className="text-center text-[10px] font-bold text-slate-500 uppercase pb-2 border-b border-slate-200">
                  {day}
                </div>
              ))}
              
              {/* Empty slots for month start (assuming starts on Tue) */}
              <div className="p-2 min-h-[80px] bg-slate-50 border border-slate-100 rounded-sm"></div>

              {calendarData.map((data, idx) => (
                <div key={idx} className={`p-2 min-h-[80px] border rounded-sm flex flex-col justify-between ${getHeatColors(data.heat)}`}>
                  <div className="text-xs font-bold opacity-70">{data.day}</div>
                  {data.heat === "Critical" && (
                    <div className="text-[9px] font-black uppercase mt-1 flex items-center leading-tight">
                      <AlertTriangle className="h-3 w-3 mr-0.5 shrink-0" />
                      Track Renew
                    </div>
                  )}
                  {data.heat === "High" && (
                    <div className="text-[9px] font-bold uppercase mt-1 leading-tight">
                      Heavy Maint.
                    </div>
                  )}
                  <div className="text-right text-[10px] font-bold mt-2 opacity-80">
                    {data.heat}
                  </div>
                </div>
              ))}
            </div>
          </GovernmentCard>
        </div>

        {/* Sidebar Metrics */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <GovernmentCard className="p-5 bg-slate-800 text-white shadow-md">
            <div className="flex items-center mb-3 text-amber-400">
              <TrendingUp className="h-5 w-5 mr-2" />
              <h3 className="text-[11px] font-black uppercase tracking-widest">Maintenance Backlog Pressure</h3>
            </div>
            <div className="text-3xl font-black mb-1">High</div>
            <p className="text-xs text-slate-300 leading-relaxed font-medium mb-4">
              KOTA-ITARSI corridor shows accumulating S&T tasks. Recommendation to increase integrated block frequency in Week 3.
            </p>
            
            <div className="space-y-3 pt-4 border-t border-slate-700">
              <div>
                <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase mb-1">
                  <span>Engineering Load</span>
                  <span>75%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-1.5">
                  <div className="bg-blue-400 h-1.5 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase mb-1">
                  <span>S&T Load</span>
                  <span>92%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-1.5">
                  <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: '92%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase mb-1">
                  <span>TRD Load</span>
                  <span>45%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-1.5">
                  <div className="bg-emerald-400 h-1.5 rounded-full" style={{ width: '45%' }}></div>
                </div>
              </div>
            </div>
          </GovernmentCard>

          <GovernmentCard className="p-4 border border-slate-300">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Top Bottlenecks</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-slate-900">Sept 12 (Critical)</div>
                  <div className="text-[10px] text-slate-600">Simultaneous Bridge Repair & Point Machine replacement.</div>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-slate-900">Sept 25 (Critical)</div>
                  <div className="text-[10px] text-slate-600">Deep screening blocking freight corridor.</div>
                </div>
              </li>
            </ul>
          </GovernmentCard>
        </div>
      </div>
    </div>
  );
}




