"use client";
import { InternalTabs } from "@/components/InternalTabs";
import { useTranslation } from "@/lib/i18n";
import { useAppState } from "@/lib/store";

import { 
  SectionHeader, GovernmentCard, StatusBadge, AlertBanner, DataTable, GovernmentButton
} from "@/components/design-system";
import { BarChart3, TrendingUp, TrendingDown, Activity, Clock, Download, Layers, ShieldCheck, Train, Shuffle, FileText, FileSpreadsheet } from "lucide-react";

export default function AnalyticsPage() {
  const { t } = useTranslation();
  const { state } = useAppState();

  const handleExport = (reportName: string, format: "pdf" | "excel") => {
    const isExcel = format === "excel";
    const ext = isExcel ? "csv" : "txt";
    
    // Construct the required text based on user prompt
    let content = "";
    if (isExcel) {
      content += "Rail Niyojak,Problem Statement SIH26027,Division/Zone\n";
      content += "Northern Railway,Planning period,Q3 2026\n\n";
      content += "Blocks,Tasks,Departments,Train impact,Risk coverage,Utilization,Harvested tasks,Future Possession Hours Avoided\n";
      content += `${state.blocks.length},${state.tasks.length},Eng/S&T/TRD,Low,High,92%,14,12\n\n`;
      content += "Approval history\n";
      content += "Control Officer,Approved,2026-09-27\n\n";
      content += "System-generated planning recommendation — subject to authorized railway approval.\n";
      content += "Synthetic Prototype Data\n";
    } else {
      content += "========================================================\n";
      content += "                      RAIL NIYOJAK                      \n";
      content += "========================================================\n";
      content += "Problem Statement: SIH26027\n";
      content += "Division/Zone: Northern Railway\n";
      content += `Report Type: ${reportName}\n`;
      content += "Planning period: Q3 2026\n\n";
      content += `Blocks Planned: ${state.blocks.length}\n`;
      content += `Tasks Analyzed: ${state.tasks.length}\n`;
      content += "Departments: Engineering, S&T, TRD\n";
      content += "Average Train Impact: Low\n";
      content += "Risk Coverage: High\n";
      content += "Average Utilization: 92%\n";
      content += "Total Harvested Tasks: 14\n";
      content += "Future Possession Hours Avoided: 12 hrs\n\n";
      content += "Approval history:\n";
      content += "- Control Officer (Approved) on 2026-09-27\n\n";
      content += "--------------------------------------------------------\n";
      content += "System-generated planning recommendation — subject to authorized railway approval.\n";
      content += "Synthetic Prototype Data\n";
      content += "========================================================\n";
    }

    const blob = new Blob([content], { type: isExcel ? 'text/csv;charset=utf-8;' : 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${reportName.replace(/ /g, '_')}_Export.${ext}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const reports = [
    "DAILY SHIFT REPORT",
    "WEEKLY BLOCK PLAN",
    "MONTHLY MAINTENANCE PLAN",
    "BLOCK APPROVAL REPORT",
    "HARVESTING SUMMARY",
    "AUDIT REPORT"
  ];
  return (
    <div className="space-y-6 pb-12">
      <InternalTabs tabs={[
        { name: "Performance Analytics", href: "/analytics" },
        { name: "Audit Trail", href: "/audit" }
      ]} />
      <SectionHeader 
        title="Maintenance & Block Performance" 
        description="Quarterly performance review and optimization analytics."
        action={
          <div className="flex gap-2">
            <GovernmentButton variant="outline" size="sm">
              <Download className="h-4 w-4 mr-1" /> Export Data
            </GovernmentButton>
          </div>
        }
      />

      <AlertBanner 
        type="warning" 
        title="DISCLAIMER" 
        message="Prototype simulation using synthetic data. These metrics do not claim or represent actual Indian Railways performance or official operational records."
      />

      {/* Primary KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <GovernmentCard className="p-4 border-t-4 border-t-slate-800">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Block Utilization</div>
              <div className="text-3xl font-black text-slate-900">92%</div>
            </div>
            <Activity className="h-5 w-5 text-slate-400" />
          </div>
          <div className="mt-4 flex items-center text-xs font-bold text-emerald-700">
            <TrendingUp className="h-3 w-3 mr-1" /> +14% vs Baseline
          </div>
          <div className="w-full bg-slate-200 h-1.5 mt-2 rounded-full">
            <div className="bg-slate-800 h-1.5 rounded-full" style={{ width: '92%' }}></div>
          </div>
        </GovernmentCard>

        <GovernmentCard className="p-4 border-t-4 border-t-emerald-600">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Yield / Poss. Hour</div>
              <div className="text-3xl font-black text-slate-900">2.1x</div>
            </div>
            <Layers className="h-5 w-5 text-emerald-400" />
          </div>
          <div className="mt-4 flex items-center text-xs font-bold text-emerald-700">
            <TrendingUp className="h-3 w-3 mr-1" /> +0.9x vs Baseline
          </div>
          <div className="w-full bg-slate-200 h-1.5 mt-2 rounded-full">
            <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: '75%' }}></div>
          </div>
        </GovernmentCard>

        <GovernmentCard className="p-4 border-t-4 border-t-blue-600">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Asset Availability</div>
              <div className="text-3xl font-black text-slate-900">99.4%</div>
            </div>
            <ShieldCheck className="h-5 w-5 text-blue-400" />
          </div>
          <div className="mt-4 flex items-center text-xs font-bold text-emerald-700">
            <TrendingUp className="h-3 w-3 mr-1" /> +1.2% vs Baseline
          </div>
          <div className="w-full bg-slate-200 h-1.5 mt-2 rounded-full">
            <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '99%' }}></div>
          </div>
        </GovernmentCard>

        <GovernmentCard className="p-4 border-t-4 border-t-amber-500">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Train Delay Exp.</div>
              <div className="text-3xl font-black text-slate-900">-28%</div>
            </div>
            <Train className="h-5 w-5 text-amber-400" />
          </div>
          <div className="mt-4 flex items-center text-xs font-bold text-emerald-700">
            <TrendingDown className="h-3 w-3 mr-1" /> Improvement vs Baseline
          </div>
          <div className="w-full bg-slate-200 h-1.5 mt-2 rounded-full">
            <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: '28%' }}></div>
          </div>
        </GovernmentCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart: Integrated vs Independent */}
        <GovernmentCard className="p-5">
          <h3 className="text-[11px] font-bold text-slate-600 uppercase tracking-widest border-b border-slate-200 pb-2 mb-4 flex items-center">
            <Shuffle className="h-4 w-4 mr-2 text-slate-400" />
            Integrated vs Independent Blocks
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>Integrated Blocks (Multi-Dept)</span>
                <span>68% (Target: 75%)</span>
              </div>
              <div className="w-full bg-slate-200 h-4 border border-slate-300">
                <div className="bg-red-800 h-full flex items-center justify-end pr-2" style={{ width: '68%' }}>
                  <span className="text-[9px] text-white font-bold">410 hrs</span>
                </div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>Independent Blocks (Single-Dept)</span>
                <span>32%</span>
              </div>
              <div className="w-full bg-slate-200 h-4 border border-slate-300">
                <div className="bg-slate-500 h-full flex items-center justify-end pr-2" style={{ width: '32%' }}>
                  <span className="text-[9px] text-white font-bold">193 hrs</span>
                </div>
              </div>
            </div>
          </div>
        </GovernmentCard>

        {/* Chart: Future Possession Hours Avoided */}
        <GovernmentCard className="p-5 bg-slate-50 border-l-4 border-l-emerald-600">
          <h3 className="text-[11px] font-bold text-slate-600 uppercase tracking-widest border-b border-slate-200 pb-2 mb-4 flex items-center">
            <Clock className="h-4 w-4 mr-2 text-slate-400" />
            Future Possession Hours Avoided
          </h3>
          <div className="flex items-end h-24 gap-2 mb-2">
            {[24, 38, 52, 65, 88, 120].map((val, idx) => (
              <div key={idx} className="flex-1 flex flex-col justify-end group relative">
                <div 
                  className="bg-emerald-500 hover:bg-emerald-600 border border-emerald-700 transition-all rounded-t-sm" 
                  style={{ height: `${(val / 120) * 100}%` }}
                ></div>
                <div className="text-[9px] text-center font-bold text-slate-500 mt-1">M{idx+1}</div>
              </div>
            ))}
          </div>
          <div className="text-xs font-semibold text-slate-600 text-center">
            Cumulative Hours Saved via Block Harvesting (YTD: <span className="font-bold text-slate-900">387 hrs</span>)
          </div>
        </GovernmentCard>

        {/* Chart: Department-wise Completion */}
        <GovernmentCard className="p-5 lg:col-span-2">
          <h3 className="text-[11px] font-bold text-slate-600 uppercase tracking-widest border-b border-slate-200 pb-2 mb-4 flex items-center">
            <BarChart3 className="h-4 w-4 mr-2 text-slate-400" />
            Department-wise Maintenance Completion
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-2">
            <div className="relative">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold text-slate-800">Engineering</span>
                <StatusBadge status="success">On Track</StatusBadge>
              </div>
              <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">Compliance</div>
              <div className="text-xl font-black text-slate-900 mb-2">94.2%</div>
              <div className="w-full bg-slate-200 h-2 border border-slate-300">
                <div className="bg-slate-800 h-full" style={{ width: '94.2%' }}></div>
              </div>
            </div>

            <div className="relative">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold text-slate-800">S&T</span>
                <StatusBadge status="warning">Monitor</StatusBadge>
              </div>
              <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">Compliance</div>
              <div className="text-xl font-black text-slate-900 mb-2">86.5%</div>
              <div className="w-full bg-slate-200 h-2 border border-slate-300">
                <div className="bg-amber-500 h-full" style={{ width: '86.5%' }}></div>
              </div>
            </div>

            <div className="relative">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold text-slate-800">TRD</span>
                <StatusBadge status="success">On Track</StatusBadge>
              </div>
              <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">Compliance</div>
              <div className="text-xl font-black text-slate-900 mb-2">91.8%</div>
              <div className="w-full bg-slate-200 h-2 border border-slate-300">
                <div className="bg-blue-600 h-full" style={{ width: '91.8%' }}></div>
              </div>
            </div>
          </div>
        </GovernmentCard>
      </div>

      <GovernmentCard className="p-0 overflow-hidden">
        <div className="bg-slate-800 text-white p-4">
          <h3 className="text-sm font-bold uppercase tracking-widest flex items-center">
            Baseline vs RailNiyojak Simulation
          </h3>
          <p className="text-xs text-slate-400 mt-1">Comparative operational efficiency matrix based on synthetic data model.</p>
        </div>
        <DataTable headers={["Key Metric", "Traditional Baseline", "RailNiyojak Simulation", "Delta"]}>
          <tr className="hover:bg-slate-50">
            <td className="px-3 py-3 font-semibold text-slate-800 border-b border-slate-200 text-sm">Average Block Utilization</td>
            <td className="px-3 py-3 text-slate-600 border-b border-slate-200 text-sm">62%</td>
            <td className="px-3 py-3 font-bold text-slate-900 border-b border-slate-200 text-sm">92%</td>
            <td className="px-3 py-3 font-bold text-emerald-600 border-b border-slate-200 text-sm">+30%</td>
          </tr>
          <tr className="hover:bg-slate-50">
            <td className="px-3 py-3 font-semibold text-slate-800 border-b border-slate-200 text-sm">Maintenance Yield (Tasks/Hour)</td>
            <td className="px-3 py-3 text-slate-600 border-b border-slate-200 text-sm">1.2</td>
            <td className="px-3 py-3 font-bold text-slate-900 border-b border-slate-200 text-sm">2.1</td>
            <td className="px-3 py-3 font-bold text-emerald-600 border-b border-slate-200 text-sm">+0.9x</td>
          </tr>
          <tr className="hover:bg-slate-50">
            <td className="px-3 py-3 font-semibold text-slate-800 border-b border-slate-200 text-sm">Train Detention per Block (avg)</td>
            <td className="px-3 py-3 text-slate-600 border-b border-slate-200 text-sm">42 mins</td>
            <td className="px-3 py-3 font-bold text-slate-900 border-b border-slate-200 text-sm">18 mins</td>
            <td className="px-3 py-3 font-bold text-emerald-600 border-b border-slate-200 text-sm">-57%</td>
          </tr>
          <tr className="hover:bg-slate-50">
            <td className="px-3 py-3 font-semibold text-slate-800 border-b border-slate-200 text-sm">Multi-Department Integration</td>
            <td className="px-3 py-3 text-slate-600 border-b border-slate-200 text-sm">24%</td>
            <td className="px-3 py-3 font-bold text-slate-900 border-b border-slate-200 text-sm">68%</td>
            <td className="px-3 py-3 font-bold text-emerald-600 border-b border-slate-200 text-sm">+44%</td>
          </tr>
          <tr className="hover:bg-slate-50">
            <td className="px-3 py-3 font-semibold text-slate-800 text-sm">Total Weekly Possession Requirement</td>
            <td className="px-3 py-3 text-slate-600 text-sm">54 hrs</td>
            <td className="px-3 py-3 font-bold text-slate-900 text-sm">42 hrs</td>
            <td className="px-3 py-3 font-bold text-emerald-600 text-sm">-12 hrs (Saved)</td>
          </tr>
        </DataTable>
      </GovernmentCard>

      {/* Exportable Reports Section */}
      <GovernmentCard className="p-5 border-t-4 border-t-slate-800">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest border-b border-slate-200 pb-2 mb-4 flex items-center">
          <Download className="h-4 w-4 mr-2 text-slate-500" />
          Exportable Railway Planning Reports
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.map((report) => (
            <div key={report} className="border border-slate-200 p-4 rounded-sm bg-slate-50 flex flex-col justify-between h-32 hover:border-slate-300 transition-colors shadow-sm">
              <div className="font-bold text-slate-800 text-sm">{report}</div>
              <div className="flex gap-2 mt-4">
                <GovernmentButton variant="outline" size="sm" className="flex-1 text-[10px]" onClick={() => handleExport(report, 'pdf')}>
                  <FileText className="h-3 w-3 mr-1 text-red-600" /> EXPORT PDF
                </GovernmentButton>
                <GovernmentButton variant="outline" size="sm" className="flex-1 text-[10px]" onClick={() => handleExport(report, 'excel')}>
                  <FileSpreadsheet className="h-3 w-3 mr-1 text-emerald-600" /> EXPORT EXCEL
                </GovernmentButton>
              </div>
            </div>
          ))}
        </div>
      </GovernmentCard>

    </div>
  );
}



