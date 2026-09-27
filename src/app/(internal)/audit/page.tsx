"use client";
import { InternalTabs } from "@/components/InternalTabs";
import { useTranslation } from "@/lib/i18n";
import { useAppState } from "@/lib/store";

import { 
  SectionHeader, GovernmentCard, FilterBar, StatusBadge, DataTable, GovernmentButton
} from "@/components/design-system";
import { ScrollText, Download, FileSearch, HelpCircle, Lock, Search } from "lucide-react";

export default function AuditLogPage() {
  const { t } = useTranslation();
  const { state } = useAppState();
  const sortedLogs = [...state.auditLogs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="space-y-6 pb-12">
      <InternalTabs tabs={[
        { name: "Performance Analytics", href: "/analytics" },
        { name: "Audit Trail", href: "/audit" }
      ]} />
      <SectionHeader 
        title="System Audit & Decision Log" 
        description="Immutable administrative record of all automated recommendations and human decisions."
        action={
          <div className="flex flex-col items-end gap-1">
            <StatusBadge status="neutral"><Lock className="h-3 w-3 mr-1 inline-block" /> Compliance Record</StatusBadge>
            <GovernmentButton variant="outline" size="sm" className="mt-1">
              <Download className="h-4 w-4 mr-1" /> Export CSV
            </GovernmentButton>
          </div>
        }
      />

      <GovernmentCard className="p-3">
        <FilterBar>
          <div className="flex items-center gap-2 mr-4 border-r border-slate-300 pr-4">
            <Search className="h-4 w-4 text-slate-400" />
            <input type="text" placeholder="Search logs..." className="text-xs border border-slate-300 rounded-sm p-1.5 bg-white w-48 focus:ring-1 focus:ring-slate-500 outline-none" />
          </div>
          <select className="text-xs border border-slate-300 rounded-sm p-1.5 bg-white min-w-[120px]">
            <option>Date: Today</option>
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
          </select>
          <select className="text-xs border border-slate-300 rounded-sm p-1.5 bg-white min-w-[140px]">
            <option>Event: All Types</option>
            <option>Block optimized</option>
            <option>Emergency replan</option>
            <option>Task harvested</option>
          </select>
          <select className="text-xs border border-slate-300 rounded-sm p-1.5 bg-white">
            <option>Dept: All</option>
            <option>Engineering</option>
            <option>S&T</option>
            <option>TRD</option>
          </select>
        </FilterBar>
      </GovernmentCard>

      <GovernmentCard className="p-0 overflow-hidden shadow-md">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-300">
                <th className="px-3 py-3 text-xs font-bold text-slate-700 uppercase tracking-widest whitespace-nowrap">Timestamp</th>
                <th className="px-3 py-3 text-xs font-bold text-slate-700 uppercase tracking-widest whitespace-nowrap">Event Type</th>
                <th className="px-3 py-3 text-xs font-bold text-slate-700 uppercase tracking-widest whitespace-nowrap">Entity ID</th>
                <th className="px-3 py-3 text-xs font-bold text-slate-700 uppercase tracking-widest whitespace-nowrap">Prev State</th>
                <th className="px-3 py-3 text-xs font-bold text-slate-700 uppercase tracking-widest whitespace-nowrap">New State</th>
                <th className="px-3 py-3 text-xs font-bold text-slate-700 uppercase tracking-widest whitespace-nowrap">Officer</th>
                <th className="px-3 py-3 text-xs font-bold text-slate-700 uppercase tracking-widest min-w-[200px]">Reason</th>
                <th className="px-3 py-3 text-xs font-bold text-slate-700 uppercase tracking-widest text-right whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="text-xs">
              {sortedLogs.map((log, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors border-b border-slate-200">
                  <td className="px-3 py-3 text-slate-600 whitespace-nowrap font-mono">{log.timestamp}</td>
                  <td className="px-3 py-3 font-bold text-slate-900 whitespace-nowrap flex items-center">
                    {log.event.includes('HARVEST') && <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></div>}
                    {log.event.includes('REPLAN') && <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>}
                    {log.event.includes('OPTIMIZE') && <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>}
                    {log.event.includes('APPROVE') && <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></div>}
                    {log.event}
                  </td>
                  <td className="px-3 py-3 text-slate-800 whitespace-nowrap">{log.entity}</td>
                  <td className="px-3 py-3 text-slate-600 whitespace-nowrap font-mono text-[10px] bg-slate-50 px-1 rounded border border-slate-200">{log.previousState}</td>
                  <td className="px-3 py-3 font-bold text-slate-800 whitespace-nowrap font-mono text-[10px] bg-blue-50 px-1 rounded border border-blue-200">{log.newState}</td>
                  <td className="px-3 py-3 font-semibold text-slate-800 whitespace-nowrap">{log.user}</td>
                  <td className="px-3 py-3 text-slate-600 italic">"{log.reason}"</td>
                  <td className="px-3 py-3 whitespace-nowrap text-right flex flex-col gap-1 items-end">
                    <button className="text-[10px] font-bold text-blue-700 hover:text-blue-900 flex items-center hover:underline">
                      <FileSearch className="h-3 w-3 mr-1" /> View Details
                    </button>
                    <button className="text-[10px] font-bold text-amber-700 hover:text-amber-900 flex items-center hover:underline">
                      <HelpCircle className="h-3 w-3 mr-1" /> Explain AI
                    </button>
                  </td>
                </tr>
              ))}
              {sortedLogs.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-3 py-8 text-center text-slate-500 text-sm">
                    No audit logs recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GovernmentCard>
    </div>
  );
}
